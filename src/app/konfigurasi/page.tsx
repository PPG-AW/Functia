import Link from "next/link";
import { SetupStatusCard } from "@/components/SetupStatusCard";
import { Badge, Button, Card } from "@/components/ui";
import { getStoreStatus } from "@/lib/store";

export const dynamic = "force-dynamic";

const TABLES = [
  { name: "students", desc: "Identitas siswa: nama, nomor absen, kelas." },
  { name: "learning_sessions", desc: "Sesi belajar: status, menu aktif, progres, waktu mulai & selesai." },
  { name: "questions", desc: "Bank soal Misi Penyelidikan & Uji Pemahaman beserta kunci dan pembahasan." },
  { name: "student_answers", desc: "Jawaban, ketepatan, skor, dan waktu pengerjaan tiap soal." },
  { name: "student_reflections", desc: "Refleksi siswa: perasaan, pemahaman, menu favorit, hal baru." },
  { name: "teacher_profiles", desc: "Profil guru untuk autentikasi Portal Guru." },
  { name: "learning_materials", desc: "Materi Pahami Konsep yang dapat dikelola guru." },
];

export default async function KonfigurasiPage() {
  const status = await getStoreStatus();

  const keyRows = [
    { label: "SUPABASE_URL", value: status.keys.url },
    { label: "SUPABASE_PUBLISHABLE_KEY", value: status.keys.publishable },
    { label: "SUPABASE_ANON_KEY (legacy)", value: status.keys.anonLegacy },
    { label: "SUPABASE_SECRET_KEY (server)", value: status.keys.secret },
    { label: "SUPABASE_SERVICE_ROLE_KEY (legacy)", value: status.keys.serviceRoleLegacy },
    { label: "FUNCTIA_GATE_TOKEN (opsional)", value: status.keys.gateToken },
  ];

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link href="/">
        <Button variant="ghost" size="sm">
          ← Kembali ke Beranda
        </Button>
      </Link>

      <Card className="mt-4 p-6 sm:p-8">
        <Badge tone={status.online ? "aqua" : "sun"}>Informasi Penyimpanan Data</Badge>
        <h1 className="mt-3 font-display text-2xl font-extrabold text-ink sm:text-3xl">
          Status Koneksi Basis Data FUNCTIA
        </h1>

        <div
          className={`mt-5 rounded-3xl border-2 p-5 ${
            status.online ? "border-aqua/30 bg-aqua-soft" : "border-sun/40 bg-sun-soft"
          }`}
        >
          <p className="font-display text-sm font-extrabold text-ink">
            {status.online ? "🟢 Penyimpanan aktif" : "🟡 Perlu perhatian"}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-ink/75">{status.message}</p>
          <dl className="mt-4 grid gap-2 text-xs font-semibold text-ink/70 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/80 px-3 py-2">
              <dt className="text-ink/50">Provider aktif</dt>
              <dd className="font-display text-sm text-ink">{status.provider.toUpperCase()}</dd>
            </div>
            <div className="rounded-2xl bg-white/80 px-3 py-2">
              <dt className="text-ink/50">Mode kunci</dt>
              <dd className="font-display text-sm text-ink">
                {status.mode === "secret"
                  ? "Secret key (server-side)"
                  : status.mode === "publishable"
                    ? "Publishable + gate RLS"
                    : status.mode === "postgres"
                      ? "PostgreSQL lokal"
                      : "Belum dikonfigurasi"}
              </dd>
            </div>
          </dl>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {keyRows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-2 rounded-2xl bg-white/80 px-3 py-2"
              >
                <span className="truncate font-mono text-[11px] text-ink/70">{row.label}</span>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black ${
                    row.value ? "bg-aqua-soft text-teal-700" : "bg-slate-100 text-ink/45"
                  }`}
                >
                  {row.value ? "Terisi" : "Kosong"}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-ink/55">
            Nilai kunci tidak pernah ditampilkan. Kunci secret / service_role hanya dibaca oleh kode
            server dan tidak ikut ter-bundle ke browser.
          </p>
        </div>

        {status.warnings.length ? (
          <ul className="mt-5 space-y-2 rounded-3xl bg-sun-soft p-5 text-xs font-semibold leading-relaxed text-amber-800">
            {status.warnings.map((warning, index) => (
              <li key={index}>• {warning}</li>
            ))}
          </ul>
        ) : null}

        <div className="mt-6">
          <SetupStatusCard />
        </div>

        {status.provider === "postgres" ? (
          <div className="mt-6 rounded-3xl bg-brand-soft/60 p-5">
            <h2 className="font-display text-base font-extrabold text-ink">Menghubungkan ke Supabase</h2>
            <ol className="mt-3 space-y-2 text-sm text-ink/75">
              <li>
                <strong>1.</strong> Buka proyek Supabase Anda, lalu salin <code>SUPABASE_URL</code> dan{" "}
                <code>SUPABASE_PUBLISHABLE_KEY</code> dari <em>Settings → API Keys</em>. Sangat
                disarankan menambahkan <code>SUPABASE_SECRET_KEY</code> untuk akses server-side.
              </li>
              <li>
                <strong>2.</strong> Jalankan seluruh isi <code>supabase/schema.sql</code> di SQL Editor
                Supabase. File ini membuat tujuh tabel, mengaktifkan RLS, dan memblokir akses anonim
                langsung ke data siswa maupun data guru.
              </li>
              <li>
                <strong>3.</strong> Tambahkan variabel lingkungan pada pengaturan project / platform
                deployment (lihat <code>.env.example</code> dan <code>SUPABASE_SETUP.md</code>).
              </li>
              <li>
                <strong>4.</strong> Muat ulang aplikasi lalu periksa kartu “Pemeriksaan koneksi
                langsung” di atas hingga seluruh domain data berstatus <strong>Terhubung</strong>.
              </li>
            </ol>
            <p className="mt-3 text-xs text-ink/60">
              Jika hanya memakai kunci publishable (tanpa secret key), jalankan juga{" "}
              <code>supabase/gate.sql</code> dan isi <code>FUNCTIA_GATE_TOKEN</code>. Selama Supabase
              belum dikonfigurasi, FUNCTIA menyimpan data sungguhan ke PostgreSQL server ini — bukan
              data tiruan.
            </p>
          </div>
        ) : null}

        <h2 className="mt-8 font-display text-lg font-extrabold text-ink">Struktur tabel</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {TABLES.map((table) => (
            <div key={table.name} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-brand-soft/70">
              <p className="font-display text-sm font-extrabold text-brand-dark">{table.name}</p>
              <p className="mt-1 text-xs text-ink/65">{table.desc}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-8 font-display text-lg font-extrabold text-ink">Keamanan RLS</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink/70">
          Seluruh tabel memiliki <strong>Row Level Security aktif</strong>. Akses anonim langsung
          ditolak; semua pembacaan/penulisan data siswa melewati Route Handler Next.js di server yang
          memvalidasi cookie sesi bertanda tangan. Karena itu siswa tidak dapat membaca jawaban siswa
          lain, dan data guru tidak dapat diakses tanpa autentikasi guru. Kunci jawaban juga tidak pernah
          dikirim ke frontend sebelum siswa menekan <strong>Kirim Jawaban</strong>. Detail kebijakan
          lengkap ada pada <code>supabase/schema.sql</code> dan <code>supabase/gate.sql</code>.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/">
            <Button>Ke Portal Siswa</Button>
          </Link>
          <Link href="/guru">
            <Button variant="secondary">Ke Portal Guru</Button>
          </Link>
        </div>
      </Card>
    </main>
  );
}
