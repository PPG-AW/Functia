-- ============================================================================
-- FUNCTIA – Aktifkan mode publishable-only (TANPA secret key)
-- ============================================================================
-- Gunakan file ini HANYA bila Anda tidak dapat mengisi SUPABASE_SECRET_KEY
-- atau SUPABASE_SERVICE_ROLE_KEY. Mode yang direkomendasikan tetap memakai
-- secret key server-side, karena service_role melewati RLS secara bawaan.
--
-- Cara pakai:
--   1. Buat token acak, misalnya:  openssl rand -hex 32
--   2. Ganti GANTI_DENGAN_TOKEN_ACAK di bawah dengan token tersebut.
--   3. Jalankan file ini di Supabase SQL Editor.
--   4. Isi variabel lingkungan FUNCTIA_GATE_TOKEN dengan token yang SAMA
--      pada server/deployment, lalu restart aplikasi.
--   5. Buka /konfigurasi → kartu "Pemeriksaan koneksi langsung" harus hijau.
--
-- Token ini disimpan di skema privat yang tidak dapat dibaca anon. Kode server
-- menambahkannya sebagai header x-functia-gate; browser tidak pernah menerimanya.
-- Jangan pernah menaruh token ini pada variabel NEXT_PUBLIC_* ataupun repositori.
-- ============================================================================

insert into functia_private.server_gate (id, token)
values (1, 'GANTI_DENGAN_TOKEN_ACAK')
on conflict (id) do update set token = excluded.token;

-- Verifikasi bahwa policy gerbang aktif dan token tersimpan (hanya panjangnya):
select
  length(token) as panjang_token,
  functia_private.is_server_request() as request_saat_ini_memiliki_gate
from functia_private.server_gate
where id = 1;

-- Menonaktifkan kembali mode gate (opsional, setelah beralih ke secret key):
-- update functia_private.server_gate set token = '' where id = 1;
