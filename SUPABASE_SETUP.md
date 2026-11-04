# Panduan Menghubungkan FUNCTIA ke Supabase

Dokumen ini untuk **project Supabase milik Anda**. Tidak ada data dummy: aplikasi hanya
menyimpan data yang benar-benar dikirim siswa/guru. Bank soal dan materi yang dibuat otomatis
adalah **konten pembelajaran**, bukan hasil siswa.

---

## 0. Status saat ini (diperiksa pada sandbox ini)

| Hal | Status |
| --- | --- |
| Website dapat dibuka melalui Preview | ✅ Sudah (lihat `DEPLOYMENT.md`) |
| Database tersambung | ✅ Ya, ke **PostgreSQL lokal** sandbox (fallback otomatis) |
| Tabel students, learning_sessions, questions, student_answers, student_reflections, teacher_profiles, learning_materials | ✅ Sudah ada di PostgreSQL lokal |
| `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY` / `SUPABASE_ANON_KEY` / `SUPABASE_SECRET_KEY` | ❌ **Belum ada di environment** |
| Konektor Supabase pada platform | ❌ Tidak tersedia pada tool yang saya miliki |
| Terhubung ke project Supabase Anda | ⏳ **Perlu kredensial dari Anda** (langkah 1–4 di bawah) |

Karena kredensial project Anda tidak tersedia di sandbox, saya tidak bisa mengisi koneksi
Supabase secara langsung. Kode aplikasi **sudah siap**: begitu variabel di bawah diisi,
FUNCTIA otomatis berpindah dari PostgreSQL lokal ke Supabase tanpa perubahan kode, desain,
maupun keempat menu pembelajaran.

Yang sudah diuji nyata pada kode (memakai server PostgREST tiruan lokal, tanpa data siswa):

- Mode `publishable`: `provider=supabase`, `mode=publishable`, koneksi memakai **kunci
  publishable** dan mengirim header `x-functia-gate`; ketujuh pemeriksaan `/api/setup/status`
  bernilai `ok:true`.
- Mode `secret`: `provider=supabase`, `mode=secret`, koneksi memakai **kunci secret di server**
  dan tidak mengirim header gate; ketujuh pemeriksaan juga `ok:true`.
- Berkas SQL dijalankan pada PostgreSQL uji: 7 tabel, 7 policy, RLS aktif; `anon` tanpa gate
  melihat 0 baris dan gagal INSERT, `anon` dengan gate berhasil, `authenticated` ditolak.
- Bundle browser bersih dari `sb_secret_`, `SUPABASE_SERVICE_ROLE_KEY`, dan `FUNCTIA_GATE_TOKEN`.

Yang **belum** bisa diuji tanpa kredensial Anda: koneksi ke project Supabase sungguhan,
pembuatan tabel di project tersebut, dan alur siswa yang menulis ke project tersebut.

---

## 1. Ambil kredensial dari Supabase

1. Buka <https://supabase.com/dashboard> lalu pilih project Anda.
2. Buka **Project Settings → API Keys** (pada project baru: tab **API Keys**).
3. Salin tiga nilai berikut:
   - **Project URL** → `SUPABASE_URL`, bentuk `https://<project-ref>.supabase.co`
   - **Publishable key** (`sb_publishable_…`) → `SUPABASE_PUBLISHABLE_KEY`
   - **Secret key** (`sb_secret_…`) → `SUPABASE_SECRET_KEY` **(WAJIB direkomendasikan, server-side)**
4. Project lama mungkin memakai nama lama: **anon key** (`eyJ…`) → `SUPABASE_ANON_KEY`
   dan **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`. Keduanya tetap didukung.

> ⚠️ `SUPABASE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `FUNCTIA_GATE_TOKEN`, dan
> `AUTH_SECRET` **jangan pernah** diberi prefix `NEXT_PUBLIC_` dan jangan ditaruh di repositori.
> Hanya `SUPABASE_URL` dan kunci publishable yang boleh bersifat publik.

---

## 2. Buat tabel dan kebijakan RLS

1. Di dashboard Supabase pilih **SQL Editor → New query**.
2. Salin **seluruh** isi [`supabase/schema.sql`](supabase/schema.sql), tempel, lalu klik **Run**.
3. File tersebut membuat 7 tabel beserta index, mengaktifkan RLS pada semuanya, mencabut hak
   langsung `anon`/`authenticated`, dan membuat kebijakan gerbang server.
4. **Hanya jika Anda tidak memakai secret key**, jalankan juga
   [`supabase/gate.sql`](supabase/gate.sql) setelah mengganti token placeholder.

Ringkasan keamanan:

| Aturan | Implementasi |
| --- | --- |
| Siswa tidak bisa membaca jawaban siswa lain | Tidak ada akses tabel langsung untuk `anon`; semua akses lewat Route Handler server yang memvalidasi cookie sesi bertanda tangan |
| Akses anonim ke data guru dicegah | `teacher_profiles` tanpa policy untuk `authenticated`, dan policy `anon` hanya lolos dengan token gerbang server |
| Kunci jawaban tidak bocor sebelum siswa menjawab | Endpoint `/api/questions` mengosongkan `correct_answer`, `correct_reason`, `explanation`; kunci baru dikirim pada respons `/api/answers` |
| Secret key tidak tampil di frontend | Modul store ditandai `server-only`; halaman `/konfigurasi` hanya menampilkan status **Terisi/Kosong**, bukan nilainya |

---

## 3. Isi Environment Variables

Tambahkan pada **pengaturan project / Secrets** di Arena AI (atau pada platform deployment):

```text
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_<kunci-anda>
SUPABASE_SECRET_KEY=sb_secret_<kunci-rahasia-anda>
AUTH_SECRET=<string-acak-minimal-32-karakter>
TEACHER_DEFAULT_EMAIL=guru@sekolah.sch.id
TEACHER_DEFAULT_PASSWORD=<kata-sandi-kuat>
```

Opsional / legacy:

```text
SUPABASE_ANON_KEY=...              # pengganti publishable key lama
SUPABASE_SERVICE_ROLE_KEY=...      # pengganti secret key lama
FUNCTIA_GATE_TOKEN=...             # hanya untuk mode publishable-only
DATABASE_URL=...                   # hanya diperlukan untuk fallback PostgreSQL lokal
```

Setelah menyimpan, **restart/rebuild aplikasi** agar variabel terbaca.

### Mode koneksi yang didukung

| Mode | Variabel | Perilaku RLS |
| --- | --- | --- |
| **Secret (direkomendasikan)** | `SUPABASE_URL` + `SUPABASE_SECRET_KEY`/`SUPABASE_SERVICE_ROLE_KEY` (kunci publishable/anon opsional) | Server memakai `service_role` yang melewati RLS; klien anonim tetap diblokir total |
| **Publishable-only** | `SUPABASE_URL` + `SUPABASE_PUBLISHABLE_KEY` + `FUNCTIA_GATE_TOKEN` | Server mengirim header `x-functia-gate`; policy RLS menolak semua request tanpa token yang cocok |
| **Fallback lokal** | hanya `DATABASE_URL` | PostgreSQL server ini, struktur tabel identik |

Mode baru (`sb_publishable_` / `sb_secret_`) dan mode lama (`anon` / `service_role`)
keduanya diterima. Aplikasi juga menolak kunci rahasia yang tidak sengaja ditaruh pada
variabel kunci publik dan memberi peringatan bila ada `NEXT_PUBLIC_*` berisi kunci rahasia.

---

## 4. Verifikasi (wajib)

1. Buka `https://<URL-ANDA>/api/setup/status`.
   - `storage.provider` harus `"supabase"`, `online: true`, `allOperational: true`.
   - Tujuh pemeriksaan harus `ok: true`: identitas siswa, sesi pembelajaran, jawaban Misi & Uji,
     refleksi siswa, bank soal, materi, portal guru.
2. Buka `https://<URL-ANDA>/konfigurasi` → kartu **Pemeriksaan koneksi langsung** harus
   seluruhnya berbadge **Terhubung**.
3. Buka `https://<URL-ANDA>/api/health` → `{"ok":true, ...}`.
4. Uji alur nyata: masuk sebagai siswa → Pahami Konsep → Misi Penyelidikan → Uji Pemahaman →
   Refleksi → muat ulang halaman (jawaban harus tetap ada) → login Portal Guru → **Rekap Hasil**
   menampilkan siswa tersebut.
5. Cek di Supabase **Table Editor** bahwa baris muncul pada `students`, `learning_sessions`,
   `student_answers`, dan `student_reflections`.
6. Cek keamanan: dengan **hanya kunci publishable** dan tanpa header gerbang, request langsung
   ke REST API `student_answers` harus mengembalikan `[]` (bukan data siswa) dan percobaan
   INSERT harus ditolak RLS (perintah `curl` ada di akhir `supabase/schema.sql`).
   Kebijakan ini sudah saya uji pada PostgreSQL uji: `anon` tanpa gate melihat 0 baris dan
   gagal insert, `anon` dengan gate berhasil, `authenticated` ditolak, `service_role` leluasa.
7. Setelah build produksi, jalankan `node scripts/check-secrets.mjs` untuk memastikan tidak ada
   kunci rahasia pada bundle browser.

---

## 5. Penyimpanan yang terhubung

| Data | Tabel | Titik tulis di aplikasi |
| --- | --- | --- |
| Identitas siswa | `students` | `POST /api/session` saat “Mulai Petualangan” |
| Sesi & progres | `learning_sessions` | `POST /api/session`, `PATCH /api/session`, `POST /api/answers`, `POST /api/reflection` |
| Jawaban Misi Penyelidikan | `student_answers` | `POST /api/answers` |
| Jawaban Uji Pemahaman | `student_answers` | `POST /api/answers` |
| Refleksi | `student_reflections` | `POST /api/reflection` |
| Rekap Portal Guru | gabungan 7 tabel | `GET /api/teacher/overview`, `/api/teacher/students/[id]`, `/api/teacher/export` |
| Materi & soal (konten) | `learning_materials`, `questions` | Manajemen Pembelajaran + seed konten awal |

Siswa yang kembali dengan nama + absen + kelas sama mendapat opsi **Lanjutkan Petualangan**;
jawaban lama tidak ditimpa kecuali ia memilih **Mulai Sesi Baru**.

---

## 6. Memindahkan data lama (opsional)

Data yang tersimpan di PostgreSQL **Preview sandbox tidak otomatis pindah** ke Supabase, dan
Preview bersifat sementara. Bila ada data sungguhan yang perlu dipindahkan:

```bash
pg_dump "$DATABASE_URL" \
  --data-only --inserts --no-owner --no-privileges \
  -t students -t learning_sessions -t questions -t student_answers \
  -t student_reflections -t teacher_profiles -t learning_materials \
  > functia-data.sql
```

Jalankan hasilnya di SQL Editor Supabase **setelah** `schema.sql`, dengan urutan tabel induk
(`students`, `questions`) lebih dulu. Jangan memasukkan data hasil siswa rekaan.

---

## 7. Troubleshooting

| Gejala | Penyebab | Perbaikan |
| --- | --- | --- |
| `/api/setup/status` → `relation "public.students" does not exist` | `schema.sql` belum dijalankan | Jalankan ulang `supabase/schema.sql` |
| `permission denied for table ...` / `new row violates row-level security policy` | Secret key belum diisi, atau token gate tidak cocok | Isi `SUPABASE_SECRET_KEY`; bila mode publishable-only, samakan `FUNCTIA_GATE_TOKEN` dengan isi `supabase/gate.sql` |
| `Invalid API key` / 401 | Kunci tertukar atau project URL salah | Cek `Settings → API Keys`; pastikan secret key tidak dipakai sebagai publishable key |
| Halaman `/konfigurasi` masih menulis “PostgreSQL lokal” | Variabel belum terbaca | Simpan ulang env var, lalu restart/rebuild |
| Data siswa hilang setelah deploy | Deploy memakai PostgreSQL lokal yang ephemeral | Wajib isi kredensial Supabase sebelum deploy produksi |
