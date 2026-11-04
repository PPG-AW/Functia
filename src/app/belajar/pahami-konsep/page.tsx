/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDiagram } from "@/components/ArrowDiagram";
import { fireConfetti } from "@/components/confetti";
import { useToast } from "@/components/Toast";
import { Badge, Button, Card, EmptyState, Loader, ProgressBar, cx } from "@/components/ui";
import { apiFetch } from "@/lib/client";
import { useStudentSession } from "@/hooks/useStudentSession";
import type { LearningMaterial, MaterialContent } from "@/lib/store/types";

function Callout({ value }: { value: MaterialContent["callout"] }) {
  const tone = value;
  if (!tone) return null;
  const styles: Record<string, string> = {
    info: "bg-brand-soft text-brand-dark border-brand/20",
    success: "bg-aqua-soft text-teal-800 border-aqua/25",
    warning: "bg-sun-soft text-amber-800 border-sun/30",
  };
  const icons: Record<string, string> = { info: "💡", success: "✅", warning: "⚠️" };
  return (
    <div className={cx("flex gap-3 rounded-3xl border-2 px-4 py-3.5 text-sm font-semibold", styles[tone.tone])}>
      <span className="text-lg leading-none">{icons[tone.tone]}</span>
      <p className="leading-relaxed">{tone.text}</p>
    </div>
  );
}

function ContentBlock({ content }: { content: MaterialContent }) {
  return (
    <div className="space-y-5">
      {content.intro ? (
        <p className="border-l-4 border-brand pl-4 font-display text-base font-bold leading-relaxed text-ink sm:text-lg">
          {content.intro}
        </p>
      ) : null}

      {content.paragraphs?.map((paragraph, i) => (
        <p key={i} className="text-sm leading-relaxed text-ink/75 sm:text-base">
          {paragraph}
        </p>
      ))}

      {content.example ? (
        <div className="rounded-3xl bg-cream p-4 ring-1 ring-sun/25 sm:p-5">
          <p className="font-display text-sm font-extrabold text-amber-700">🍽️ {content.example.title}</p>
          <ul className="mt-2 space-y-1.5">
            {content.example.items.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm text-ink/80">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-coral" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {content.bullets?.length ? (
        <ul className="grid gap-2.5">
          {content.bullets.map((item, i) => (
            <li
              key={i}
              className="flex gap-3 rounded-2xl bg-white px-4 py-3 text-sm text-ink/80 shadow-sm ring-1 ring-brand-soft/70"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-aqua font-display text-[11px] font-black text-white">
                {i + 1}
              </span>
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {content.diagram ? (
        <div className="rounded-3xl bg-gradient-to-br from-white to-brand-soft/40 p-4 ring-1 ring-brand-soft sm:p-5">
          <ArrowDiagram diagram={content.diagram} showVerdict />
        </div>
      ) : null}

      {content.diagrams?.length ? (
        <div className={cx("grid gap-4", content.diagrams.length > 1 && "lg:grid-cols-2")}>
          {content.diagrams.map((diagram, i) => (
            <div
              key={i}
              className="rounded-3xl bg-gradient-to-br from-white to-brand-soft/40 p-4 ring-1 ring-brand-soft sm:p-5"
            >
              <p className="mb-2 text-center font-display text-xs font-black uppercase tracking-widest text-ink/50">
                Diagram {i + 1}
              </p>
              <ArrowDiagram diagram={diagram} showVerdict />
            </div>
          ))}
        </div>
      ) : null}

      {content.cards?.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {content.cards.map((card, i) => (
            <Card
              key={i}
              hover
              className="animate-fade-up p-4"
            >
              <p className="font-display text-sm font-extrabold leading-snug text-ink">{card.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-ink/65">{card.text}</p>
              {card.diagram ? (
                <div className="mt-3 rounded-2xl bg-brand-soft/40 p-2">
                  <ArrowDiagram diagram={card.diagram} showVerdict />
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      ) : null}

      {content.image ? (
        <div className="overflow-hidden rounded-3xl shadow-md ring-1 ring-brand-soft">
          {content.image.endsWith(".svg") ? (
            <img
              src={content.image}
              alt="Ilustrasi pendukung materi"
              className="h-auto w-full object-cover"
            />
          ) : (
            <Image
              src={content.image}
              alt="Ilustrasi pendukung materi"
              width={800}
              height={420}
              className="h-auto w-full object-cover"
            />
          )}
        </div>
      ) : null}

      {content.question ? <Callout value={{ tone: "info", text: content.question }} /> : null}
      <Callout value={content.callout} />

      {content.conclusion ? (
        <div className="rounded-3xl bg-gradient-to-r from-brand to-aqua p-5 text-white shadow-lg shadow-brand/25">
          <p className="font-display text-xs font-black uppercase tracking-widest text-white/80">Kesimpulan</p>
          <p className="mt-1.5 text-sm font-semibold leading-relaxed sm:text-base">{content.conclusion}</p>
        </div>
      ) : null}
    </div>
  );
}

export default function PahamiKonsepPage() {
  const router = useRouter();
  const toast = useToast();
  const { data: session, update } = useStudentSession();
  const [materials, setMaterials] = useState<LearningMaterial[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    apiFetch<{ materials: LearningMaterial[] }>("/api/materials")
      .then((res) => {
        if (!active) return;
        setMaterials(res.materials);
        if (session?.materiSlide && session.materiSlide < res.materials.length) {
          setIndex(session.materiSlide);
        }
      })
      .catch((err) => active && setError(err instanceof Error ? err.message : "Gagal memuat materi."));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goTo = useCallback(
    async (next: number, total: number) => {
      const clamped = Math.max(0, Math.min(total - 1, next));
      setIndex(clamped);
      window.scrollTo({ top: 0, behavior: "smooth" });
      try {
        await update({ materiSlide: clamped, current_menu: "materi" });
      } catch {
        /* progres visual tetap berjalan */
      }
    },
    [update],
  );

  async function finish() {
    setSaving(true);
    try {
      await update({ materiDone: true, current_menu: "materi" });
      await fireConfetti("small");
      toast("Pahami Konsep selesai! Lanjut ke Misi Penyelidikan ya.", "success");
      router.push("/belajar");
      router.refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Gagal menyimpan progres.", "error");
      setSaving(false);
    }
  }

  if (!materials) {
    return error ? (
      <EmptyState icon="⚠️" title="Materi tidak dapat dimuat" description={error} />
    ) : (
      <Loader label="Memuat materi Pahami Konsep..." />
    );
  }

  if (!materials.length) {
    return (
      <EmptyState
        icon="📚"
        title="Materi belum tersedia"
        description="Guru belum mengaktifkan materi pada menu Manajemen Pembelajaran."
      />
    );
  }

  const material = materials[index];
  const isLast = index === materials.length - 1;
  const done = Boolean(session?.materiDone);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Badge tone="brand">📘 Pahami Konsep</Badge>
          <h1 className="mt-2 font-display text-2xl font-extrabold text-ink sm:text-3xl">
            Mengenal Relasi dan Fungsi
          </h1>
        </div>
        <Link href="/belajar">
          <Button variant="secondary" size="sm">
            ← Kembali ke Beranda
          </Button>
        </Link>
      </div>

      <Card className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3 text-xs font-bold text-ink/60">
          <span>
            Bagian {index + 1} dari {materials.length}
          </span>
          <span>{Math.round(((index + 1) / materials.length) * 100)}% materi dibaca</span>
        </div>
        <ProgressBar value={((index + 1) / materials.length) * 100} className="mt-2" />
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
          {materials.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => void goTo(i, materials.length)}
              className={cx(
                "shrink-0 rounded-xl px-3 py-1.5 text-[11px] font-bold transition",
                i === index
                  ? "bg-gradient-to-r from-brand to-aqua text-white shadow"
                  : i < index
                    ? "bg-aqua-soft text-teal-700"
                    : "bg-slate-100 text-ink/55 hover:bg-slate-200",
              )}
            >
              {i + 1}. {item.title.replace(/^Bagian \d+ – /, "").slice(0, 26)}
            </button>
          ))}
        </div>
      </Card>

      <Card key={material.id} className="animate-fade-up p-5 sm:p-7">
        <h2 className="font-display text-xl font-extrabold text-ink sm:text-2xl">{material.title}</h2>
        <div className="mt-4">
          <ContentBlock content={material.content} />
        </div>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="secondary"
          size="lg"
          disabled={index === 0}
          onClick={() => void goTo(index - 1, materials.length)}
        >
          ← Sebelumnya
        </Button>

        {isLast ? (
          <Button size="lg" variant={done ? "secondary" : "success"} loading={saving} onClick={() => void finish()}>
            {done ? "Tandai Selesai Lagi ✓" : "Selesaikan Pahami Konsep ✓"}
          </Button>
        ) : (
          <Button size="lg" onClick={() => void goTo(index + 1, materials.length)}>
            Selanjutnya →
          </Button>
        )}
      </div>

      {done ? (
        <p className="text-center text-xs font-semibold text-teal-700">
          ✅ Kamu sudah menyelesaikan bagian Pahami Konsep.
        </p>
      ) : null}
    </div>
  );
}
