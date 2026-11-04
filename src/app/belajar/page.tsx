"use client";

import Link from "next/link";
import { useStudentSession } from "@/hooks/useStudentSession";
import type { MenuStatus } from "@/lib/progress";
import { menuStatus } from "@/lib/progress";
import { Badge, Button, Card, EmptyState, Loader, ProgressBar, cx } from "@/components/ui";

const toneMap: Record<MenuStatus, { badge: string; dot: string }> = {
  "Belum Dimulai": { badge: "bg-slate-100 text-slate-600", dot: "bg-slate-300" },
  "Sedang Dikerjakan": { badge: "bg-sun-soft text-amber-700", dot: "bg-sun" },
  Selesai: { badge: "bg-aqua-soft text-teal-700", dot: "bg-aqua" },
};

export default function BerandaSiswa() {
  const { data, loading, error, reload } = useStudentSession();

  if (loading) return <Loader label="Memuat data petualanganmu..." />;
  if (error || !data)
    return (
      <div className="space-y-4">
        <EmptyState
          icon="⚠️"
          title="Data tidak dapat dimuat"
          description={error ?? "Terjadi kesalahan saat menghubungi server."}
        />
        <div className="flex justify-center gap-3">
          <Button onClick={() => void reload()}>Coba Lagi</Button>
          <Link href="/">
            <Button variant="secondary">Kembali ke Beranda</Button>
          </Link>
        </div>
      </div>
    );

  const firstName = data.student.name.split(" ")[0] ?? data.student.name;
  const materi: MenuStatus = menuStatus(data.materiDone, data.materiSlide > 0);
  const misi: MenuStatus = menuStatus(
    data.misi.total > 0 && data.misi.answered >= data.misi.total,
    data.misi.answered > 0,
  );
  const uji: MenuStatus = menuStatus(
    data.uji.total > 0 && data.uji.answered >= data.uji.total,
    data.uji.answered > 0,
  );
  const refleksi: MenuStatus = menuStatus(data.refleksiDone, false);

  const homeworkState = data.session.menu_state?.homework;
  const homeworkSelected = homeworkState?.selected?.length ?? 0;
  const homeworkAnswered = homeworkState?.total_answered ?? 0;
  const homeworkMenuStatus: MenuStatus =
    homeworkState?.status === "terkumpul"
      ? "Selesai"
      : homeworkSelected > 0
        ? "Sedang Dikerjakan"
        : "Belum Dimulai";
  const homeworkDetail =
    homeworkState?.status === "terkumpul"
      ? `Terkumpul · nilai ${homeworkState.score ?? 0} · ${homeworkAnswered} soal dijawab`
      : homeworkSelected > 0
        ? `${homeworkSelected} soal dipilih · ${homeworkAnswered} dijawab`
        : "Belum ada soal dipilih · minimal 3 soal";

  const misiLocked = !data.materiDone;
  // Uji Pemahaman dapat langsung dikerjakan tanpa menyelesaikan Misi Penyelidikan.
  const ujiLocked = false;
  const refleksiLocked = data.uji.total === 0 || data.uji.answered < data.uji.total;

  const menus = [
    {
      key: "materi",
      href: "/belajar/pahami-konsep",
      icon: "📘",
      gradient: "from-brand to-sky",
      title: "Pahami Konsep",
      subtitle: "Mengenal Relasi dan Fungsi",
      text: "Pelajari pengertian relasi, fungsi, dan ciri-cirinya lewat diagram panah interaktif.",
      status: materi,
      locked: false,
      lockHint: "",
      detail: `${data.materiDone ? "Seluruh bagian selesai dibaca" : "Belum selesai dibaca"}`,
      cta: data.materiDone ? "Ulas Kembali" : materi === "Sedang Dikerjakan" ? "Lanjutkan" : "Mulai",
    },
    {
      key: "misi",
      href: "/belajar/misi-penyelidikan",
      icon: "🕵️",
      gradient: "from-coral to-rose-400",
      title: "Misi Penyelidikan",
      subtitle: "Detektif Fungsi",
      text: "Selidiki kasus kontekstual Salatiga dan tentukan fungsi atau bukan fungsi.",
      status: misi,
      locked: misiLocked,
      lockHint: "Selesaikan menu Pahami Konsep terlebih dahulu.",
      detail: `${data.misi.answered}/${data.misi.total} soal terjawab · skor ${data.misi.score}`,
      cta: misi === "Selesai" ? "Lihat Hasil" : misi === "Sedang Dikerjakan" ? "Lanjutkan" : "Mulai Misi",
    },
    {
      key: "uji",
      href: "/belajar/uji-pemahaman",
      icon: "🎯",
      gradient: "from-sun to-amber-400",
      title: "Uji Pemahaman",
      subtitle: "Tantangan Detektif Fungsi",
      text: "Analisis diagram panah dengan penalaran matematis dan dapatkan nilai akhirmu.",
      status: uji,
      locked: ujiLocked,
      lockHint: "Uji Pemahaman dapat dikerjakan kapan saja.",
      detail: `${data.uji.answered}/${data.uji.total} soal terjawab · skor ${data.uji.score}`,
      cta: uji === "Selesai" ? "Lihat Nilai" : uji === "Sedang Dikerjakan" ? "Lanjutkan" : "Mulai Uji",
    },
    {
      key: "refleksi",
      href: "/belajar/refleksi",
      icon: "💬",
      gradient: "from-aqua to-emerald-400",
      title: "Refleksi",
      subtitle: "Ceritakan Pengalamanmu!",
      text: "Bagikan perasaan, pemahaman, dan hal baru yang kamu pelajari hari ini.",
      status: refleksi,
      locked: refleksiLocked,
      lockHint: "Selesaikan seluruh soal Uji Pemahaman terlebih dahulu.",
      detail: data.refleksiDone ? "Refleksi terkirim" : "Belum dikirim",
      cta: refleksi === "Selesai" ? "Lihat Refleksi" : "Isi Refleksi",
    },
    {
      key: "tugas-rumah",
      href: "/belajar/tugas-rumah",
      icon: "📝",
      gradient: "from-grape to-violet-400",
      title: "Tugas Rumah",
      subtitle: "Pilih soalmu sendiri",
      text: "Kerjakan pilihan soal Relasi dan Fungsi: diagram panah, koordinat Kartesius, dan pasangan berurutan.",
      status: homeworkMenuStatus,
      locked: false,
      lockHint: "",
      detail: homeworkDetail,
      cta: homeworkMenuStatus === "Selesai" ? "Lihat Status" : homeworkMenuStatus === "Sedang Dikerjakan" ? "Lanjutkan" : "Mulai",
    },
  ];

  return (
    <div className="space-y-8">
      {/* SAPAAN */}
      <Card className="relative overflow-hidden p-0">
        <div className="batik-bg absolute inset-0 opacity-[0.12]" aria-hidden />
        <div className="relative grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.4fr_0.6fr] lg:items-center">
          <div className="animate-fade-up">
            <Badge tone="sun">Matematika Kelas VIII · Relasi dan Fungsi</Badge>
            <h1 className="mt-3 font-display text-2xl font-extrabold leading-snug text-ink sm:text-4xl">
              Halo, {firstName}! Siap menjelajahi dunia Relasi dan Fungsi? 🎉
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink/70 sm:text-base">
              Kamu akan belajar dengan model <strong>Problem Based Learning</strong>: memahami konsep,
              menyelidiki masalah nyata dari budaya Kota Salatiga, menguji pemahaman, lalu
              merefleksikan pengalamanmu. Ikuti keempat menu sesuai urutannya ya!
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
              <span className="rounded-full bg-white px-3 py-1.5 text-brand-dark shadow-sm">
                👤 {data.student.name}
              </span>
              <span className="rounded-full bg-white px-3 py-1.5 text-brand-dark shadow-sm">
                🔢 Absen {data.student.attendance_number}
              </span>
              <span className="rounded-full bg-white px-3 py-1.5 text-brand-dark shadow-sm">
                🏫 Kelas {data.student.class_name}
              </span>
            </div>
          </div>

          <div className="rounded-3xl bg-white/85 p-5 text-center shadow-lg ring-1 ring-white">
            <p className="font-display text-xs font-bold uppercase tracking-widest text-ink/55">
              Progres Belajar
            </p>
            <p className="mt-1 font-display text-5xl font-extrabold text-brand-dark">{data.progress}%</p>
            <ProgressBar value={data.progress} className="mt-3" />
            <p className="mt-3 text-xs text-ink/60">
              {data.progress >= 100
                ? "Luar biasa! Seluruh menu telah kamu selesaikan."
                : "Terus semangat, petualanganmu masih berlanjut!"}
            </p>
            {data.progress >= 100 ? (
              <Link href="/belajar/selesai" className="mt-3 block">
                <Button size="sm" variant="success" full>
                  Lihat Sertifikat Misi 🏅
                </Button>
              </Link>
            ) : null}
          </div>
        </div>
      </Card>

      {/* MENU */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-display text-xl font-extrabold text-ink sm:text-2xl">
              Menu Petualangan
            </h2>
            <p className="text-sm text-ink/60">
              Kerjakan berurutan: Pahami Konsep → Misi Penyelidikan → Uji Pemahaman → Refleksi.
              Tugas Rumah dapat dikerjakan kapan saja.
            </p>
          </div>
          <Badge tone="brand">5 menu</Badge>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {menus.map((menu, index) => {
            const tone = toneMap[menu.status];
            return (
              <Card
                key={menu.key}
                hover={!menu.locked}
                className={cx(
                  "animate-fade-up relative overflow-hidden p-0",
                  menu.locked && "opacity-95",
                )}
              >
                <div className={`h-1.5 w-full bg-gradient-to-r ${menu.gradient}`} />
                <div className="p-5 sm:p-6" style={{ animationDelay: `${index * 70}ms` }}>
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={cx(
                        "flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl text-white shadow-lg",
                        menu.gradient,
                      )}
                    >
                      {menu.icon}
                    </span>
                    <span
                      className={cx(
                        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-display text-[11px] font-bold",
                        tone.badge,
                      )}
                    >
                      <span className={cx("h-1.5 w-1.5 rounded-full", tone.dot)} />
                      {menu.status}
                    </span>
                  </div>

                  <h3 className="mt-4 font-display text-lg font-extrabold text-ink">{menu.title}</h3>
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-dark/70">
                    {menu.subtitle}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-ink/65">{menu.text}</p>
                  <p className="mt-3 text-xs font-semibold text-ink/50">{menu.detail}</p>

                  {menu.locked ? (
                    <div className="mt-4 rounded-2xl bg-sun-soft px-4 py-3 text-xs font-semibold text-amber-800">
                      🔒 {menu.lockHint}
                    </div>
                  ) : (
                    <Link href={menu.href} className="mt-4 block">
                      <Button full size="md">
                        {menu.cta} →
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <Card className="flex flex-col items-start gap-3 bg-brand-soft/60 p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink/75">
          🏛️ <strong>Tahukah kamu?</strong> Plumpungan adalah prasasti bersejarah yang menjadi cikal
          bakal Kota Salatiga. Motif batiknya kita gunakan sebagai contoh pemetaan dalam materi ini.
        </p>
        <Link href="/belajar/pahami-konsep" className="shrink-0">
          <Button variant="secondary" size="sm">
            Pelajari Sekarang
          </Button>
        </Link>
      </Card>
    </div>
  );
}
