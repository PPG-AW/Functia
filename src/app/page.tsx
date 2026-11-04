import Image from "next/image";
import Link from "next/link";
import { StudentEntry } from "@/components/StudentEntry";
import { Badge, Card } from "@/components/ui";
import { getStoreStatus } from "@/lib/store";

export const dynamic = "force-dynamic";

const MENUS = [
  {
    icon: "📘",
    title: "Pahami Konsep",
    text: "Kenali relasi, fungsi, dan ciri-cirinya lewat diagram panah interaktif.",
    tone: "from-brand to-sky",
  },
  {
    icon: "🕵️",
    title: "Misi Penyelidikan",
    text: "Jadi Detektif Fungsi! Selidiki kasus kuliner, ekskul, dan Batik Plumpungan.",
    tone: "from-coral to-rose-400",
  },
  {
    icon: "🎯",
    title: "Uji Pemahaman",
    text: "Analisis diagram panah dan buktikan penalaran matematismu.",
    tone: "from-sun to-amber-400",
  },
  {
    icon: "💬",
    title: "Refleksi",
    text: "Ceritakan perasaan dan hal baru yang kamu pelajari hari ini.",
    tone: "from-aqua to-emerald-400",
  },
];

const CRT = [
  { emoji: "🥜", title: "Enting-enting gepuk & getuk", text: "Kuliner khas Salatiga jadi himpunan makanan favorit." },
  { emoji: "🧵", title: "Batik Plumpungan", text: "Motif dan pola batik menjadi contoh pemetaan satu-satu." },
  { emoji: "⛰️", title: "Kopeng & Rawa Pening", text: "Tempat wisata favorit pengunjung sebagai contoh kodomain." },
  { emoji: "🏫", title: "Ekstrakurikuler sekolah", text: "Kegiatan siswa menjadi contoh relasi bukan fungsi." },
];

export default async function LandingPage() {
  const status = await getStoreStatus();

  return (
    <main className="relative overflow-hidden">
      <div className="batik-strip pointer-events-none absolute inset-x-0 top-0 h-72" aria-hidden />

      {/* NAVBAR */}
      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-5 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand via-sky to-aqua font-display text-lg font-black text-white shadow-lg shadow-brand/30">
            ƒ
          </span>
          <span className="leading-tight">
            <span className="block font-display text-lg font-extrabold tracking-tight text-ink">FUNCTIA</span>
            <span className="block text-[11px] font-semibold text-ink/55">Petualangan Relasi & Fungsi</span>
          </span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            href="/konfigurasi"
            className="hidden rounded-2xl px-3 py-2 text-sm font-semibold text-ink/70 transition hover:bg-white/70 hover:text-brand-dark sm:block"
          >
            Status Data
          </Link>
          <Link
            href="/guru"
            className="rounded-2xl bg-white px-4 py-2.5 font-display text-sm font-bold text-brand-dark shadow-md ring-1 ring-brand-soft transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            Portal Guru
          </Link>
        </nav>
      </header>

      {/* HERO */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-10 pt-4 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="animate-fade-up">
            <Badge tone="sun">📍 Berbasis budaya Kota Salatiga · CRT + PBL</Badge>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.1] text-ink sm:text-5xl lg:text-6xl">
              Petualangan{" "}
              <span className="bg-gradient-to-r from-brand via-sky to-aqua bg-clip-text text-transparent">
                Relasi & Fungsi
              </span>{" "}
              untuk Kelas VIII
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-ink/70 sm:text-lg">
              Belajar matematika terasa dekat dengan kehidupan sehari-hari. Selidiki hubungan antara
              siswa dan makanan khas Salatiga, motif Batik Plumpungan, sampai tempat wisata favorit —
              lalu buktikan apakah sebuah relasi merupakan fungsi.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="#masuk-siswa"
                className="rounded-2xl bg-gradient-to-r from-brand to-aqua px-6 py-3.5 font-display text-sm font-bold text-white shadow-lg shadow-brand/30 transition hover:-translate-y-0.5"
              >
                Masuk sebagai Siswa
              </Link>
              <Link
                href="/guru"
                className="rounded-2xl border-2 border-brand-soft bg-white px-6 py-3.5 font-display text-sm font-bold text-brand-dark transition hover:-translate-y-0.5"
              >
                Masuk sebagai Guru
              </Link>
            </div>

            <dl className="mt-8 grid max-w-lg grid-cols-3 gap-3">
              {[
                { label: "Menu belajar", value: "5" },
                { label: "Materi & soal", value: "28" },
                { label: "Umpan balik", value: "Otomatis" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl bg-white/80 p-3 text-center shadow-sm ring-1 ring-white">
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink/55">{item.label}</dt>
                  <dd className="font-display text-lg font-extrabold text-brand-dark">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative animate-fade-up [animation-delay:120ms]">
            <div className="absolute -inset-6 rounded-[3rem] bg-gradient-to-br from-brand/15 via-sky/10 to-sun/20 blur-2xl" aria-hidden />
            <div className="relative overflow-hidden rounded-4xl border-4 border-white shadow-2xl">
              <Image
                src="/images/hero-salatiga.png"
                alt="Ilustrasi siswa Salatiga belajar relasi dan fungsi"
                width={900}
                height={620}
                priority
                className="h-full w-full object-cover"
              />
            </div>
            <div className="animate-float absolute -bottom-6 -left-4 hidden rounded-3xl bg-white p-3 shadow-xl ring-1 ring-brand-soft sm:block">
              <p className="font-display text-xs font-bold text-ink">Diagram Panah</p>
              <p className="text-[11px] text-ink/60">Andi → Enting-enting gepuk</p>
            </div>
          </div>
        </div>
      </section>

      {/* FORM MASUK SISWA */}
      <section id="masuk-siswa" className="relative z-10 mx-auto max-w-7xl scroll-mt-24 px-4 py-12 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div className="space-y-4">
            <h2 className="font-display text-3xl font-extrabold text-ink">Siap menjelajah?</h2>
            <p className="text-ink/70">
              Siswa tidak perlu membuat akun. Cukup isi nama, nomor absen, dan kelas, lalu tekan{" "}
              <strong>Mulai Petualangan</strong>. Sistem akan menyimpan identitasmu dan mengingatkan
              progres terakhir bila kamu kembali lagi.
            </p>
            <ul className="space-y-2.5 text-sm text-ink/75">
              {[
                "Jawaban tersimpan otomatis, tidak hilang saat halaman dimuat ulang.",
                "Umpan balik muncul segera setelah jawaban dikirim.",
                "Guru dapat memantau rekap hasil dan refleksi seluruh siswa.",
              ].map((item) => (
                <li key={item} className="flex gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-aqua-soft text-xs text-teal-700">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <div
              className={`rounded-2xl px-4 py-3 text-xs font-semibold ${
                status.online ? "bg-aqua-soft text-teal-800" : "bg-sun-soft text-amber-800"
              }`}
            >
              <span className="mr-1.5">{status.online ? "🟢" : "🟡"}</span>
              {status.message}{" "}
              <Link href="/konfigurasi" className="underline underline-offset-2">
                Lihat detail konfigurasi
              </Link>
            </div>
          </div>

          <div id="student-entry">
            <StudentEntry />
          </div>
        </div>
      </section>

      {/* EMPAT MENU */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <h2 className="font-display text-3xl font-extrabold text-ink">Empat Menu Petualangan</h2>
        <p className="mt-2 max-w-2xl text-ink/70">
          Alur belajar disusun mengikuti model Problem Based Learning: memahami konsep, menyelidiki
          masalah, menguji pemahaman, lalu merefleksikan pengalaman.
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {MENUS.map((menu, index) => (
            <Card key={menu.title} hover className="animate-fade-up overflow-hidden p-0" >
              <div className={`h-1.5 w-full bg-gradient-to-r ${menu.tone}`} />
              <div className="p-5" style={{ animationDelay: `${index * 80}ms` }}>
                <span className="text-3xl">{menu.icon}</span>
                <h3 className="mt-3 font-display text-base font-extrabold text-ink">{menu.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink/65">{menu.text}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CRT */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div className="relative overflow-hidden rounded-4xl shadow-xl">
            <Image
              src="/images/kuliner-salatiga.png"
              alt="Kuliner khas Salatiga: enting-enting gepuk, getuk, dan abon sapi"
              width={800}
              height={560}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <Badge tone="grape">Culturally Responsive Teaching</Badge>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-ink">
              Matematika yang tumbuh dari budaya Salatiga
            </h2>
            <p className="mt-3 text-ink/70">
              Setiap contoh, soal, dan ilustrasi diangkat dari kehidupan nyata masyarakat Salatiga
              agar siswa merasa materi ini milik mereka sendiri.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {CRT.map((item) => (
                <div key={item.title} className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-brand-soft/70">
                  <span className="text-2xl">{item.emoji}</span>
                  <p className="mt-1.5 font-display text-sm font-bold text-ink">{item.title}</p>
                  <p className="text-xs text-ink/60">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PORTAL GURU */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6">
        <Card className="relative overflow-hidden p-0">
          <div className="batik-bg absolute inset-0 opacity-[0.14]" aria-hidden />
          <div className="relative grid gap-6 p-7 sm:p-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
            <div>
              <Badge tone="brand">Portal Guru</Badge>
              <h2 className="mt-3 font-display text-2xl font-extrabold text-ink sm:text-3xl">
                Pantau seluruh aktivitas siswa dalam satu dashboard
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-ink/70 sm:text-base">
                Rekap hasil Misi Penyelidikan dan Uji Pemahaman, waktu pengerjaan, status refleksi,
                detail jawaban tiap siswa, serta pengelolaan materi dan bank soal — lengkap dengan
                ekspor CSV.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link
                href="/guru"
                className="rounded-2xl bg-gradient-to-r from-brand to-aqua px-6 py-3.5 text-center font-display text-sm font-bold text-white shadow-lg shadow-brand/30 transition hover:-translate-y-0.5"
              >
                Masuk Portal Guru
              </Link>
              <Link
                href="/konfigurasi"
                className="rounded-2xl border-2 border-brand-soft bg-white px-6 py-3 text-center font-display text-sm font-bold text-brand-dark transition hover:-translate-y-0.5"
              >
                Info Penyimpanan Data
              </Link>
            </div>
          </div>
        </Card>
      </section>

      <footer className="relative z-10 border-t border-white bg-white/70 px-4 py-8 text-center text-xs text-ink/55 sm:px-6">
        <p className="font-display text-sm font-bold text-ink">FUNCTIA – Petualangan Relasi dan Fungsi</p>
        <p className="mt-1">
          Media pembelajaran matematika kelas VIII SMP · Problem Based Learning × Culturally Responsive
          Teaching · Kearifan lokal Kota Salatiga
        </p>
      </footer>
    </main>
  );
}
