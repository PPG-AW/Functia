# FUNCTIA – Petualangan Relasi dan Fungsi

Media pembelajaran interaktif matematika kelas VIII SMP berbasis **Problem Based Learning**
dan **Culturally Responsive Teaching** dengan kearifan lokal Kota Salatiga.

## Portal

- **Portal Siswa** — `/` (isi nama, nomor absen, kelas → Mulai Petualangan)
- **Beranda siswa** — `/belajar`
- **Pahami Konsep** — `/belajar/pahami-konsep`
- **Misi Penyelidikan** — `/belajar/misi-penyelidikan`
- **Uji Pemahaman** — `/belajar/uji-pemahaman`
- **Refleksi** — `/belajar/refleksi`
- **Penyelesaian** — `/belajar/selesai`
- **Portal Guru** — `/guru` (dashboard, data siswa, rekap + ekspor CSV, refleksi, manajemen soal/materi)
- **Status penyimpanan** — `/konfigurasi`
- **Health check** — `/api/health`
- **Diagnostik koneksi** — `/api/setup/status`

## Dokumen operasional

| Berkas | Isi |
| --- | --- |
| [`DEPLOYMENT.md`](DEPLOYMENT.md) | Shareable Preview URL yang sudah diverifikasi, cara menyalin link, dan langkah deployment URL publik permanen |
| [`SUPABASE_SETUP.md`](SUPABASE_SETUP.md) | Langkah menghubungkan project Supabase, env vars, verifikasi, dan troubleshooting |
| [`supabase/schema.sql`](supabase/schema.sql) | 7 tabel + index + Row Level Security |
| [`supabase/gate.sql`](supabase/gate.sql) | Token gerbang untuk mode publishable-only |
| [`.env.example`](.env.example) | Daftar variabel lingkungan |
| [`scripts/check-secrets.mjs`](scripts/check-secrets.mjs) | Pemeriksaan kebocoran kunci rahasia ke bundle browser |

## Penyimpanan data

FUNCTIA memakai satu lapisan `Store` yang sama untuk seluruh fitur. Bila `SUPABASE_URL`
dan kunci Supabase tersedia, seluruh identitas siswa, sesi, jawaban, dan refleksi tersimpan di
Supabase. Bila belum tersedia, aplikasi memakai PostgreSQL server dengan struktur tabel identik
dan menampilkan status tersebut secara jujur di `/konfigurasi` — **tanpa data dummy**.

Kunci `SUPABASE_SECRET_KEY` / `SUPABASE_SERVICE_ROLE_KEY` hanya dibaca modul bertanda
`server-only` di sisi server. Tidak ada kunci rahasia pada JavaScript browser.

## Perintah

```bash
npm run dev        # pengembangan
npm run build      # build produksi
npm run start      # jalankan hasil build
npm run typecheck  # pemeriksaan TypeScript
node scripts/check-secrets.mjs   # setelah build: cek kebocoran kunci
```
