-- ============================================================================
-- FUNCTIA – Skema Supabase + Row Level Security
-- Jalankan SELURUH file ini sekali di Supabase Dashboard → SQL Editor → Run.
-- Aman dijalankan ulang (idempotent): memakai IF NOT EXISTS / DROP POLICY IF EXISTS.
--
-- Model keamanan:
--   * Semua tabel mengaktifkan RLS.
--   * Tidak ada akses langsung dari anon / authenticated tanpa token gerbang.
--   * Aplikasi Next.js mengakses data HANYA lewat Route Handler di server:
--       - Mode direkomendasikan : SUPABASE_SECRET_KEY (service_role, bypass RLS)
--       - Mode publishable-only : SUPABASE_PUBLISHABLE_KEY + FUNCTIA_GATE_TOKEN
--         (lihat supabase/gate.sql untuk mengaktifkan token gerbang)
--   * Kunci secret/service_role TIDAK PERNAH dipakai di kode browser.
--   * Siswa tidak dapat membaca jawaban siswa lain; data guru tidak terbuka anonim.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. TABEL
-- ---------------------------------------------------------------------------

create table if not exists public.students (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  attendance_number integer not null,
  class_name        text not null,
  created_at        timestamptz not null default now()
);

create table if not exists public.learning_sessions (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references public.students (id) on delete cascade,
  status        text not null default 'aktif',
  current_menu  text not null default 'beranda',
  progress      integer not null default 0,
  menu_state    jsonb not null default '{}'::jsonb,
  started_at    timestamptz not null default now(),
  completed_at  timestamptz
);

create table if not exists public.questions (
  id             uuid primary key default gen_random_uuid(),
  menu_type      text not null,
  question_text  text not null,
  context        text not null default '',
  diagram_data   jsonb,
  options        jsonb not null,
  correct_answer text not null,
  correct_reason text not null,
  explanation    text not null default '',
  order_number   integer not null default 1,
  is_active      boolean not null default true
);

create table if not exists public.student_answers (
  id               uuid primary key default gen_random_uuid(),
  session_id       uuid not null references public.learning_sessions (id) on delete cascade,
  question_id      uuid not null references public.questions (id) on delete cascade,
  selected_answer  text not null,
  selected_reason  text not null,
  is_correct       boolean not null default false,
  score            integer not null default 0,
  answered_at      timestamptz not null default now(),
  constraint student_answers_session_question_key unique (session_id, question_id)
);

create table if not exists public.student_reflections (
  id                  uuid primary key default gen_random_uuid(),
  session_id          uuid not null unique references public.learning_sessions (id) on delete cascade,
  feeling             text not null,
  understanding       text not null,
  favorite_menu       text not null,
  learning_reflection text not null default '',
  submitted_at        timestamptz not null default now()
);

-- Catatan: bila Portal Guru nantinya memakai Supabase Auth, kolom id dapat diisi
-- dengan auth.users(id). Implementasi FUNCTIA saat ini memakai UUID internal,
-- kata sandi ter-hash scrypt, dan cookie httpOnly bertanda tangan HMAC.
create table if not exists public.teacher_profiles (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text not null unique,
  role          text not null default 'teacher',
  password_hash text not null default '',
  created_at    timestamptz not null default now()
);

create table if not exists public.learning_materials (
  id           uuid primary key default gen_random_uuid(),
  menu_type    text not null default 'materi',
  title        text not null,
  content      jsonb not null,
  order_number integer not null default 1,
  is_active    boolean not null default true,
  updated_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2. INDEX
-- ---------------------------------------------------------------------------

create index if not exists students_class_idx on public.students (class_name);
create index if not exists sessions_student_idx on public.learning_sessions (student_id);
create index if not exists questions_menu_idx on public.questions (menu_type);
create index if not exists answers_session_idx on public.student_answers (session_id);
create index if not exists materials_menu_idx on public.learning_materials (menu_type);

-- ---------------------------------------------------------------------------
-- 3. SKEMA PRIBADI + FUNGSI GERBANG (untuk mode publishable-only)
-- ---------------------------------------------------------------------------

create schema if not exists functia_private;

create table if not exists functia_private.server_gate (
  id    integer primary key default 1 check (id = 1),
  token text not null default ''
);

insert into functia_private.server_gate (id, token)
values (1, '')
on conflict (id) do nothing;

alter table functia_private.server_gate enable row level security;

-- Fungsi pembanding header. `security definer` agar dapat membaca tabel token
-- yang tidak boleh dibaca anon. Token tidak pernah dikirim ke browser.
create or replace function functia_private.is_server_request()
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  raw_headers text;
  supplied    text := '';
begin
  raw_headers := current_setting('request.headers', true);
  if raw_headers is not null and raw_headers <> '' then
    begin
      supplied := coalesce(raw_headers::json ->> 'x-functia-gate', '');
    exception when others then
      supplied := '';
    end;
  end if;

  return exists (
    select 1
    from functia_private.server_gate g
    where g.token <> '' and g.token = supplied
  );
end;
$$;

grant usage on schema functia_private to anon, authenticated, service_role;
grant execute on function functia_private.is_server_request() to anon, authenticated, service_role;
revoke all on functia_private.server_gate from anon, authenticated, public;
grant select, insert, update, delete on functia_private.server_gate to service_role;

-- ---------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------

alter table public.students            enable row level security;
alter table public.learning_sessions   enable row level security;
alter table public.questions           enable row level security;
alter table public.student_answers     enable row level security;
alter table public.student_reflections enable row level security;
alter table public.teacher_profiles    enable row level security;
alter table public.learning_materials  enable row level security;

-- Hak akses: server dengan secret key mendapat akses penuh (BYPASSRLS).
-- Klien anonim dicabut seluruh hak tabel; hanya bisa lewat policy gerbang.
grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on
  public.students,
  public.learning_sessions,
  public.questions,
  public.student_answers,
  public.student_reflections,
  public.teacher_profiles,
  public.learning_materials
to service_role;

-- Role authenticated tidak diberi akses sama sekali.
revoke all on
  public.students,
  public.learning_sessions,
  public.questions,
  public.student_answers,
  public.student_reflections,
  public.teacher_profiles,
  public.learning_materials
from authenticated;

-- RLS hanya menyaring baris, bukan menggantikan hak tabel. Karena itu anon tetap
-- memerlukan GRANT dasar agar mode publishable-only dapat berjalan. Tanpa policy
-- yang lolos, SELECT mengembalikan 0 baris dan INSERT/UPDATE ditolak oleh RLS.
grant select, insert, update, delete on
  public.students,
  public.learning_sessions,
  public.questions,
  public.student_answers,
  public.student_reflections,
  public.teacher_profiles,
  public.learning_materials
to anon;

-- Policy gerbang: request anon HANYA lolos bila membawa header
-- x-functia-gate yang sama dengan token di functia_private.server_gate.
-- Header tersebut ditambahkan secara eksklusif oleh kode server Next.js.
drop policy if exists functia_gate_students on public.students;
create policy functia_gate_students on public.students
  for all to anon
  using (functia_private.is_server_request())
  with check (functia_private.is_server_request());

drop policy if exists functia_gate_sessions on public.learning_sessions;
create policy functia_gate_sessions on public.learning_sessions
  for all to anon
  using (functia_private.is_server_request())
  with check (functia_private.is_server_request());

drop policy if exists functia_gate_questions on public.questions;
create policy functia_gate_questions on public.questions
  for all to anon
  using (functia_private.is_server_request())
  with check (functia_private.is_server_request());

drop policy if exists functia_gate_answers on public.student_answers;
create policy functia_gate_answers on public.student_answers
  for all to anon
  using (functia_private.is_server_request())
  with check (functia_private.is_server_request());

drop policy if exists functia_gate_reflections on public.student_reflections;
create policy functia_gate_reflections on public.student_reflections
  for all to anon
  using (functia_private.is_server_request())
  with check (functia_private.is_server_request());

drop policy if exists functia_gate_teachers on public.teacher_profiles;
create policy functia_gate_teachers on public.teacher_profiles
  for all to anon
  using (functia_private.is_server_request())
  with check (functia_private.is_server_request());

drop policy if exists functia_gate_materials on public.learning_materials;
create policy functia_gate_materials on public.learning_materials
  for all to anon
  using (functia_private.is_server_request())
  with check (functia_private.is_server_request());

-- Tidak ada policy untuk role authenticated: akun Supabase Auth biasa tetap
-- tidak bisa membaca data siswa. Portal Guru diamankan di layer aplikasi
-- (cookie httpOnly bertanda tangan) serta kunci server-side.

-- ---------------------------------------------------------------------------
-- 5. VERIFIKASI (jalankan terpisah bila ingin mengecek)
-- ---------------------------------------------------------------------------
-- select relname, relrowsecurity from pg_class
-- where relnamespace = 'public'::regnamespace and relkind = 'r'
-- order by relname;
--
-- select tablename, policyname, roles, cmd from pg_policies
-- where schemaname = 'public' order by tablename;
--
-- Cek dari luar dengan HANYA kunci publishable dan TANPA header gerbang.
-- RLS menyaring seluruh baris, jadi hasil yang benar adalah [] (bukan data siswa),
-- dan percobaan INSERT ditolak oleh policy:
-- curl -s -H "apikey: <PUBLISHABLE_KEY>" \
--   "https://<PROJECT_REF>.supabase.co/rest/v1/student_answers?select=id"
