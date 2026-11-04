# FUNCTIA – Link Website, Shareable Preview URL & Deployment Publik

---

## 1. Preview saat ini: SUDAH berjalan dan dapat dibuka

**Alamat Preview bersifat dinamis.** Nomor di depan `e2b.app` berubah setiap kali
Preview di-restart, dan instance lama bisa tetap aktif sambil memuat versi kode yang
sudah usang. Karena itu **jangan memakai URL lama yang tercatat di riwayat percakapan**:

1. Buka panel **Preview** di editor, lalu klik **Share / Bagikan / Copy link** (atau
   ikon "buka di tab baru").
2. Salin alamat yang ditampilkan — itulah satu-satunya URL versi terbaru.
3. Sebelum membagikan, cek `https://<URL-TERBARU>/api/health` sampai terbaca
   `"provider":"supabase"`, lalu cek `/api/materials` berisi 11 materi dan
   `/api/questions?menu=misi` berisi 4 soal. Bila angkanya lebih kecil, URL itu
   adalah instance lama dan harus diganti.

Alamat `e2b.app` dapat dibuka siswa dan guru tanpa login ke editor, tetapi ini masih
**Preview**, bukan domain Published/Deploy permanen. Untuk tautan yang tidak berubah,
lakukan deployment permanen di bagian 3.

Cara verifikasi yang sudah saya lakukan:

| Pemeriksaan | Hasil |
| --- | --- |
| `GET /` dari jaringan eksternal tanpa cookie/login | ✅ `200`, halaman FUNCTIA tampil lengkap |
| `GET /api/health` dari jaringan eksternal | ✅ `{"ok":true}` |
| Halaman `/`, `/guru`, `/konfigurasi` | ✅ `200` |
| Redirect `/belajar` untuk pengunjung tanpa sesi siswa | ✅ kembali ke halaman masuk |
| Halaman Portal Guru tanpa login | ✅ redirect ke `/guru` (pengamanan berjalan) |

URL di atas dapat langsung dibagikan kepada siswa. Tidak perlu login ke Arena AI untuk
membukanya, selama sesi Preview masih aktif. Endpoint yang ikut diverifikasi pada URL terbaru:
`/api/health` → `ok:true`, `/api/setup/status` → `allOperational:true`, `/`, `/guru`, dan
`/konfigurasi` → `200`.

> ⚠️ URL Preview adalah alamat **sementara** milik sandbox dan datanya memakai PostgreSQL
> lokal yang ikut hilang bila sandbox dibuat ulang. Untuk penggunaan kelas jangka panjang,
> lakukan **deployment permanen** (bagian 3) setelah menghubungkan Supabase.

---

## 2. Cara mendapatkan Shareable Preview URL di Arena AI

1. Buka project FUNCTIA di editor Arena AI.
2. Pada panel **Preview** (biasanya di kanan atas / tab Preview), klik:
   - ikon **Buka di tab baru** (↗ / *Open preview in new tab*), **atau**
   - tombol **Share** / **Bagikan** / **Copy link** / **Salin URL**.
3. Salin alamat yang muncul di address bar browser atau dari tombol salin.
   Bentuknya `https://3000-xxxxx.e2b.app/` — itulah **Shareable Preview URL terbaru**.
4. Tempel ke browser lain/HP atau kirim ke siswa. Tidak diperlukan akun Arena AI bagi siswa.
5. Bila tombol Share tidak terlihat, gunakan URL terbaru yang tercantum di bagian 1. Bila
   ternyata tidak bisa dibuka (sandbox sudah di-restart), ambil alamat baru dari panel Preview.

**Saran sebelum membagikan ke kelas:** isi kredensial Supabase lebih dulu
(lihat `SUPABASE_SETUP.md`). Database PostgreSQL pada Preview bersifat sementara; bila sandbox
dihentikan, data siswa pada Preview dapat hilang.

---

## 3. URL publik permanen (deployment)

Saya **tidak memiliki konektor deployment** (Vercel/Netlify/Render) maupun kredensial akun Anda
di lingkungan ini, jadi saya tidak dapat membuat deployment atas nama Anda. Yang sudah saya
siapkan agar prosesnya tinggal dijalankan:

- Aplikasi Next.js siap build produksi (`npm run build` lolos).
- `/api/health` tidak lagi bergantung pada `DATABASE_URL`, sehingga aman di platform serverless
  yang hanya memakai Supabase.
- `.env.example`, `supabase/schema.sql`, `supabase/gate.sql`, dan `SUPABASE_SETUP.md` siap dipakai.
- Tidak ada kunci rahasia pada kode frontend (modul store ditandai `server-only`).

### Opsi A — Vercel (paling sederhana untuk Next.js)

1. Simpan project ke Git (dari komputer/terminal yang berisi folder project ini):

   ```bash
   git init
   git add .
   git commit -m "FUNCTIA siap deploy"
   git remote add origin https://github.com/<akun-anda>/functia.git
   git push -u origin main
   ```

   Pastikan `.env` **tidak** ikut ter-commit (lihat `.gitignore`; bila belum ada, buat berisi
   `.env`, `.next`, `node_modules`).

2. Buka <https://vercel.com/new> → **Import Git Repository** → pilih repo `functia`.
   Framework akan terdeteksi sebagai **Next.js**; biarkan Build Command `npm run build`.

3. Pada **Environment Variables** isi (nilai diambil dari Supabase, lihat `SUPABASE_SETUP.md`):

   ```text
   SUPABASE_URL
   SUPABASE_PUBLISHABLE_KEY
   SUPABASE_SECRET_KEY          ← server-side, JANGAN beri prefix NEXT_PUBLIC_
   AUTH_SECRET
   TEACHER_DEFAULT_EMAIL
   TEACHER_DEFAULT_PASSWORD
   ```

   `DATABASE_URL` **tidak wajib** bila Supabase sudah diisi.

4. Sebelum deploy, jalankan `supabase/schema.sql` di SQL Editor project Supabase Anda.
5. Klik **Deploy**. Vercel memberi URL permanen `https://functia-<nama>.vercel.app/`.
6. Verifikasi:

   ```text
   https://<domain>/api/health          → {"ok":true,...}
   https://<domain>/api/setup/status    → "allOperational": true
   https://<domain>/konfigurasi         → semua pemeriksaan "Terhubung"
   ```

7. Bagikan URL permanen tersebut kepada siswa, dan simpan kredensial guru secara terpisah.

### Opsi B — Vercel CLI

```bash
npm i -g vercel
vercel login
vercel            # ikuti wizard, framework: Next.js
vercel env add SUPABASE_URL
vercel env add SUPABASE_PUBLISHABLE_KEY
vercel env add SUPABASE_SECRET_KEY
vercel env add AUTH_SECRET
vercel env add TEACHER_DEFAULT_EMAIL
vercel env add TEACHER_DEFAULT_PASSWORD
vercel --prod     # menghasilkan URL produksi permanen
```

### Opsi C — Render / Railway / VPS

- Build command: `npm run build`
- Start command: `npm run start`
- Port: `3000`
- Environment variables: sama seperti Opsi A.
- Health check path: `/api/health`

---

## 4. Catatan penting sebelum dipakai siswa

1. **Wajib Supabase untuk produksi.** Fallback PostgreSQL lokal hanya untuk development/Preview.
   Data di Preview tidak otomatis tersalin ke deployment.
2. **Portal Guru** memakai akun dari `TEACHER_DEFAULT_EMAIL` / `TEACHER_DEFAULT_PASSWORD`
   (hash scrypt + cookie httpOnly bertanda tangan HMAC). Jangan memakai kata sandi bawaan
   `functia2026` di produksi.
3. **Isi `AUTH_SECRET`** agar cookie sesi tidak berubah saat kunci Supabase dirotasi.
4. Setelah build, jalankan `node scripts/check-secrets.mjs` untuk memastikan tidak ada
   `sb_secret_…` atau nilai kunci rahasia pada `.next/static`.
5. Tidak ada data dummy yang ditampilkan sebagai hasil siswa: rekap guru kosong sampai siswa
   sungguhan mengirim jawaban.
