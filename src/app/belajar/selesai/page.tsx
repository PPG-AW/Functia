"use client";

import Link from "next/link";
import { useEffect } from "react";
import { fireConfetti } from "@/components/confetti";
import { Badge, Button, Card, Loader, ProgressBar } from "@/components/ui";
import { useStudentSession } from "@/hooks/useStudentSession";

export default function SelesaiPage() {
  const { data, loading } = useStudentSession();

  useEffect(() => {
    if (data && data.progress >= 100) void fireConfetti("big");
  }, [data]);

  if (loading || !data) return <Loader label="Menyiapkan halaman penyelesaian..." />;

  const complete = data.progress >= 100;
  const remaining = [
    { label: "Pahami Konsep", done: data.materiDone, href: "/belajar/pahami-konsep" },
    {
      label: "Misi Penyelidikan",
      done: data.misi.total > 0 && data.misi.answered >= data.misi.total,
      href: "/belajar/misi-penyelidikan",
    },
    {
      label: "Uji Pemahaman",
      done: data.uji.total > 0 && data.uji.answered >= data.uji.total,
      href: "/belajar/uji-pemahaman",
    },
    { label: "Refleksi", done: data.refleksiDone, href: "/belajar/refleksi" },
  ].filter((item) => !item.done);

  const nilai = Math.round((data.misi.score + data.uji.score) / (data.misi.answered || data.uji.answered ? 2 : 1));

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden p-0">
        <div className="batik-bg absolute inset-0 opacity-[0.13]" aria-hidden />
        <div className="relative p-6 text-center sm:p-12">
          <span className="text-6xl">{complete ? "🏅" : "🚧"}</span>
          <Badge tone="sun" className="mt-3">
            Halaman Penyelesaian Pembelajaran
          </Badge>
          <h1 className="mt-3 font-display text-3xl font-extrabold text-ink sm:text-4xl">
            {complete ? `Luar biasa, ${data.student.name.split(" ")[0]}!` : "Petualanganmu belum selesai"}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-ink/70 sm:text-base">
            {complete
              ? "Kamu telah menyelesaikan keempat menu pembelajaran FUNCTIA: Pahami Konsep, Misi Penyelidikan, Uji Pemahaman, dan Refleksi. Simpan semangat detektifmu untuk materi matematika berikutnya!"
              : "Beberapa menu masih menunggumu. Selesaikan agar sertifikat misimu terbuka."}
          </p>

          <div className="mx-auto mt-6 max-w-md">
            <div className="flex items-baseline justify-between text-xs font-bold text-ink/60">
              <span>Progres keseluruhan</span>
              <span className="font-display text-base text-brand-dark">{data.progress}%</span>
            </div>
            <ProgressBar value={data.progress} className="mt-2 h-4" />
          </div>

          <div className="mx-auto mt-7 grid max-w-3xl gap-3 sm:grid-cols-3">
            <ScoreCard
              label="Misi Penyelidikan"
              value={`${data.misi.answered}/${data.misi.total}`}
              sub={`skor ${data.misi.score}`}
              tone="from-coral to-rose-400"
            />
            <ScoreCard
              label="Uji Pemahaman"
              value={`${data.uji.answered}/${data.uji.total}`}
              sub={`nilai ${data.uji.score}`}
              tone="from-sun to-amber-400"
            />
            <ScoreCard
              label="Nilai Rata-rata"
              value={`${nilai}`}
              sub={data.refleksiDone ? "refleksi terkirim" : "refleksi belum dikirim"}
              tone="from-brand to-aqua"
            />
          </div>

          {data.reflection ? (
            <div className="mx-auto mt-6 max-w-2xl rounded-3xl bg-white/85 p-5 text-left shadow-sm ring-1 ring-brand-soft">
              <p className="font-display text-xs font-black uppercase tracking-widest text-brand-dark/70">
                💬 Refleksimu
              </p>
              <p className="mt-2 text-sm text-ink/75">
                <strong>{data.reflection.feeling}</strong> · {data.reflection.understanding} · favorit:{" "}
                {data.reflection.favorite_menu}
              </p>
              <p className="mt-1.5 text-sm italic leading-relaxed text-ink/70">
                “{data.reflection.learning_reflection}”
              </p>
            </div>
          ) : null}

          {remaining.length ? (
            <div className="mx-auto mt-6 max-w-xl rounded-3xl bg-sun-soft p-4 text-left">
              <p className="font-display text-sm font-extrabold text-amber-800">Menu yang masih terbuka:</p>
              <ul className="mt-2 space-y-2">
                {remaining.map((item) => (
                  <li key={item.label} className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold text-ink/75">• {item.label}</span>
                    <Link href={item.href}>
                      <Button size="sm" variant="secondary">
                        Kerjakan
                      </Button>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/belajar">
              <Button size="lg">Kembali ke Beranda</Button>
            </Link>
            <Link href="/belajar/pahami-konsep">
              <Button size="lg" variant="secondary">
                Ulas Materi Lagi
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      <p className="text-center text-xs text-ink/50">
        Identitas: {data.student.name} · Absen {data.student.attendance_number} · Kelas{" "}
        {data.student.class_name} · Sesi dimulai{" "}
        {new Date(data.session.started_at).toLocaleDateString("id-ID")}
      </p>
    </div>
  );
}

function ScoreCard({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone: string;
}) {
  return (
    <div className={`rounded-3xl bg-gradient-to-br ${tone} p-4 text-white shadow-md`}>
      <p className="text-[11px] font-bold uppercase tracking-widest text-white/85">{label}</p>
      <p className="mt-1 font-display text-3xl font-extrabold">{value}</p>
      <p className="text-xs font-semibold text-white/85">{sub}</p>
    </div>
  );
}
