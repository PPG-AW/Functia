"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { fireConfetti } from "@/components/confetti";
import { useToast } from "@/components/Toast";
import { Badge, Button, Card, Field, Loader, cx, inputClass } from "@/components/ui";
import { post } from "@/lib/client";
import { emitRefresh } from "@/lib/bus";
import { useStudentSession } from "@/hooks/useStudentSession";

const FEELINGS = [
  { value: "Sangat senang", emoji: "😍" },
  { value: "Senang", emoji: "😊" },
  { value: "Biasa saja", emoji: "😐" },
  { value: "Masih merasa kesulitan", emoji: "😟" },
];

const UNDERSTANDINGS = [
  { value: "Sangat memahami", emoji: "🤩" },
  { value: "Cukup memahami", emoji: "🙂" },
  { value: "Masih perlu belajar lagi", emoji: "📖" },
  { value: "Belum memahami", emoji: "😵" },
];

const FAVORITES = [
  { value: "Pahami Konsep", emoji: "📘" },
  { value: "Misi Penyelidikan", emoji: "🕵️" },
  { value: "Uji Pemahaman", emoji: "🎯" },
];

function OptionGrid({
  options,
  value,
  onChange,
  disabled,
}: {
  options: { value: string; emoji: string }[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          disabled={disabled}
          onClick={() => onChange(option.value)}
          className={cx(
            "flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left text-sm font-bold transition-all",
            disabled
              ? value === option.value
                ? "border-grape bg-grape-soft text-violet-800"
                : "border-slate-200 bg-white text-ink/40"
              : value === option.value
                ? "border-grape bg-grape-soft text-violet-800 shadow-md"
                : "border-slate-200 bg-white text-ink/75 hover:-translate-y-0.5 hover:border-grape/50",
          )}
        >
          <span className="text-xl">{option.emoji}</span>
          {option.value}
        </button>
      ))}
    </div>
  );
}

export default function RefleksiPage() {
  const router = useRouter();
  const toast = useToast();
  const { data, loading } = useStudentSession();
  const [feeling, setFeeling] = useState("");
  const [understanding, setUnderstanding] = useState("");
  const [favorite, setFavorite] = useState("");
  const [text, setText] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [editing, setEditing] = useState(false);

  if (loading || !data) return <Loader label="Memuat halaman refleksi..." />;

  const existing = data.reflection;
  const locked = data.uji.total === 0 || data.uji.answered < data.uji.total;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!feeling) next.feeling = "Pilih salah satu perasaan.";
    if (!understanding) next.understanding = "Pilih tingkat pemahamanmu.";
    if (!favorite) next.favorite = "Pilih menu yang paling menarik.";
    if (text.trim().length < 5) next.text = "Tuliskan minimal satu kalimat hal baru yang kamu pelajari.";
    setErrors(next);
    if (Object.keys(next).length) {
      toast("Lengkapi seluruh pertanyaan refleksi dulu ya.", "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = await post<{ message: string }>("/api/reflection", {
        feeling,
        understanding,
        favorite_menu: favorite,
        learning_reflection: text.trim(),
      });
      emitRefresh();
      setDone(true);
      await fireConfetti("big");
      toast(res.message, "success");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Refleksi gagal dikirim.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  if (locked && !existing) {
    return (
      <div className="space-y-5">
        <Header />
        <Card className="p-8 text-center">
          <span className="text-4xl">🔒</span>
          <h2 className="mt-3 font-display text-xl font-extrabold text-ink">Refleksi masih terkunci</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink/65">
            Selesaikan seluruh soal Uji Pemahaman terlebih dahulu ({data.uji.answered}/{data.uji.total} soal
            terjawab), lalu ceritakan pengalaman belajarmu di sini.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href="/belajar/uji-pemahaman">
              <Button>Buka Uji Pemahaman</Button>
            </Link>
            <Link href="/belajar">
              <Button variant="secondary">Kembali ke Beranda</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if ((done || (existing && !editing)) && !editing) {
    const shown = existing ?? {
      feeling,
      understanding,
      favorite_menu: favorite,
      learning_reflection: text,
      submitted_at: new Date().toISOString(),
    };
    return (
      <div className="space-y-5">
        <Header />
        <Card className="animate-pop relative overflow-hidden p-0">
          <div className="batik-bg absolute inset-0 opacity-10" aria-hidden />
          <div className="relative p-6 text-center sm:p-10">
            <span className="text-5xl">🌟</span>
            <h2 className="mt-3 font-display text-2xl font-extrabold text-ink sm:text-3xl">
              Terima kasih sudah belajar hari ini!
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-ink/70 sm:text-base">
              Terus semangat menjelajahi dunia matematika. Kamu hebat!
            </p>

            <div className="mx-auto mt-6 grid max-w-2xl gap-3 text-left sm:grid-cols-2">
              <RecapCard label="Perasaanmu" value={shown.feeling} emoji="😊" />
              <RecapCard label="Pemahaman materi" value={shown.understanding} emoji="🧠" />
              <RecapCard label="Menu favorit" value={shown.favorite_menu} emoji="⭐" />
              <div className="rounded-3xl bg-grape-soft p-4 sm:col-span-2">
                <p className="text-[11px] font-black uppercase tracking-widest text-violet-700">
                  💡 Hal baru yang dipelajari
                </p>
                <p className="mt-1 text-sm font-semibold leading-relaxed text-ink/80">
                  {shown.learning_reflection}
                </p>
              </div>
            </div>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/belajar/selesai">
                <Button size="lg" variant="success">
                  Halaman Penyelesaian 🏅
                </Button>
              </Link>
              <Link href="/belajar">
                <Button size="lg" variant="secondary">
                  Kembali ke Beranda
                </Button>
              </Link>
              <Button size="lg" variant="ghost" onClick={() => setEditing(true)}>
                Perbarui Refleksi
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Header />

      <Card className="p-5 sm:p-7">
        <form className="space-y-7" onSubmit={submit} noValidate>
          <QuestionBlock
            number={1}
            title="Bagaimana perasaanmu setelah belajar menggunakan FUNCTIA?"
            error={errors.feeling}
          >
            <OptionGrid
              options={FEELINGS}
              value={feeling}
              onChange={(v) => {
                setFeeling(v);
                setErrors((e) => ({ ...e, feeling: "" }));
              }}
            />
          </QuestionBlock>

          <QuestionBlock
            number={2}
            title="Bagaimana pemahamanmu mengenai materi relasi dan fungsi?"
            error={errors.understanding}
          >
            <OptionGrid
              options={UNDERSTANDINGS}
              value={understanding}
              onChange={(v) => {
                setUnderstanding(v);
                setErrors((e) => ({ ...e, understanding: "" }));
              }}
            />
          </QuestionBlock>

          <QuestionBlock number={3} title="Bagian mana yang paling menarik bagimu?" error={errors.favorite}>
            <OptionGrid
              options={FAVORITES}
              value={favorite}
              onChange={(v) => {
                setFavorite(v);
                setErrors((e) => ({ ...e, favorite: "" }));
              }}
            />
          </QuestionBlock>

          <QuestionBlock
            number={4}
            title="Tuliskan satu hal baru yang kamu pelajari hari ini."
            error={errors.text}
          >
            <Field label="Jawabanmu" hint={`${text.trim().length}/500 karakter`}>
              <textarea
                className={cx(inputClass, "min-h-[130px] resize-y")}
                value={text}
                maxLength={500}
                placeholder="Contoh: Saya baru tahu bahwa fungsi mengharuskan setiap anggota domain punya tepat satu pasangan..."
                onChange={(e) => {
                  setText(e.target.value);
                  setErrors((prev) => ({ ...prev, text: "" }));
                }}
              />
            </Field>
          </QuestionBlock>

          <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/belajar">
              <Button type="button" variant="ghost" size="lg">
                ← Kembali ke Beranda
              </Button>
            </Link>
            <Button type="submit" size="lg" loading={submitting}>
              {submitting ? "Mengirim refleksi..." : "Kirim Refleksi 💌"}
            </Button>
          </div>
        </form>
      </Card>

      <p className="text-center text-xs text-ink/50">
        Refleksimu tersimpan dan dapat dibaca oleh guru sebagai bahan evaluasi pembelajaran.
      </p>
      <div className="text-center">
        <Button variant="ghost" size="sm" onClick={() => router.push("/belajar")}>
          Batalkan
        </Button>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-aqua to-emerald-400 text-2xl text-white shadow-lg">
          💬
        </span>
        <div>
          <Badge tone="aqua">Menu 4</Badge>
          <h1 className="font-display text-xl font-extrabold text-ink sm:text-2xl">
            Refleksi: Ceritakan Pengalamanmu!
          </h1>
        </div>
      </div>
      <Link href="/belajar">
        <Button variant="secondary" size="sm">
          ← Beranda
        </Button>
      </Link>
    </div>
  );
}

function QuestionBlock({
  number,
  title,
  error,
  children,
}: {
  number: number;
  title: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="font-display text-sm font-extrabold text-ink sm:text-base">
        <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-grape to-brand text-[11px] text-white">
          {number}
        </span>
        {title}
      </p>
      <div className="mt-3">{children}</div>
      {error ? <p className="mt-2 text-xs font-semibold text-rose-600">{error}</p> : null}
    </div>
  );
}

function RecapCard({ label, value, emoji }: { label: string; value: string; emoji: string }) {
  return (
    <div className="rounded-3xl bg-brand-soft/70 p-4">
      <p className="text-[11px] font-black uppercase tracking-widest text-brand-dark/70">
        {emoji} {label}
      </p>
      <p className="mt-1 font-display text-sm font-extrabold text-ink">{value}</p>
    </div>
  );
}
