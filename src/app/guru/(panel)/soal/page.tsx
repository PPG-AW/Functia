"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/Toast";
import { ArrowDiagram } from "@/components/ArrowDiagram";
import { Badge, Button, Card, EmptyState, Field, Loader, cx, inputClass } from "@/components/ui";
import { apiFetch, del, patch, post } from "@/lib/client";
import { MENU_LABEL } from "@/lib/recap";
import type { LearningMaterial, Question, QuestionOptions } from "@/lib/store/types";

type Tab = "misi" | "uji" | "materi";

type QuestionDraft = {
  id?: string;
  menu_type: "misi" | "uji";
  question_text: string;
  context: string;
  explanation: string;
  correct_answer: string;
  correct_reason: string;
  order_number: number;
  is_active: boolean;
  answers: QuestionOptions["answers"];
  reasons: QuestionOptions["reasons"];
  diagramJson: string;
};

const emptyDraft = (menu: "misi" | "uji", order: number): QuestionDraft => ({
  menu_type: menu,
  question_text: "",
  context: "",
  explanation: "",
  correct_answer: "fungsi",
  correct_reason: "A",
  order_number: order,
  is_active: true,
  answers: [
    { key: "fungsi", text: "Fungsi" },
    { key: "bukan", text: "Bukan fungsi" },
  ],
  reasons: [
    { key: "A", text: "Setiap anggota domain memiliki tepat satu pasangan." },
    { key: "B", text: "Ada anggota domain yang memiliki dua pasangan berbeda." },
    { key: "C", text: "Ada anggota domain yang tidak memiliki pasangan." },
    { key: "D", text: "Semua anggota kodomain harus memiliki pasangan." },
  ],
  diagramJson: JSON.stringify(
    {
      leftLabel: "Himpunan A",
      rightLabel: "Himpunan B",
      left: ["Andi", "Budi"],
      right: ["Enting-enting gepuk", "Getuk"],
      arrows: [
        [0, 0],
        [1, 1],
      ],
      note: "",
    },
    null,
    2,
  ),
});

const toDraft = (q: Question): QuestionDraft => ({
  id: q.id,
  menu_type: q.menu_type,
  question_text: q.question_text,
  context: q.context,
  explanation: q.explanation,
  correct_answer: q.correct_answer,
  correct_reason: q.correct_reason,
  order_number: q.order_number,
  is_active: q.is_active,
  answers: q.options.answers,
  reasons: q.options.reasons,
  diagramJson: q.diagram_data ? JSON.stringify(q.diagram_data, null, 2) : "",
});

export default function ManajemenSoalPage() {
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("misi");
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [materials, setMaterials] = useState<LearningMaterial[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<QuestionDraft | null>(null);
  const [materialDraft, setMaterialDraft] = useState<{
    id?: string;
    title: string;
    order_number: number;
    is_active: boolean;
    contentJson: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [q, m] = await Promise.all([
        apiFetch<{ questions: Question[] }>("/api/teacher/questions"),
        apiFetch<{ materials: LearningMaterial[] }>("/api/teacher/materials"),
      ]);
      setQuestions(q.questions);
      setMaterials(m.materials);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveQuestion() {
    if (!draft) return;
    if (!draft.question_text.trim()) return toast("Pertanyaan wajib diisi.", "error");
    if (draft.answers.length < 2 || draft.reasons.length < 2)
      return toast("Minimal dua pilihan jawaban dan dua pilihan alasan.", "error");
    if (draft.answers.some((a) => !a.text.trim() || !a.key.trim()))
      return toast("Kunci dan teks pilihan jawaban tidak boleh kosong.", "error");
    if (draft.reasons.some((r) => !r.text.trim() || !r.key.trim()))
      return toast("Kunci dan teks pilihan alasan tidak boleh kosong.", "error");
    if (!draft.answers.some((a) => a.key === draft.correct_answer))
      return toast("Kunci jawaban harus salah satu pilihan jawaban.", "error");
    if (!draft.reasons.some((r) => r.key === draft.correct_reason))
      return toast("Kunci alasan harus salah satu pilihan alasan.", "error");

    let diagram: unknown = null;
    if (draft.diagramJson.trim()) {
      try {
        diagram = JSON.parse(draft.diagramJson);
      } catch {
        return toast("Data diagram bukan JSON yang valid.", "error");
      }
    }

    const payload = {
      menu_type: draft.menu_type,
      question_text: draft.question_text,
      context: draft.context,
      explanation: draft.explanation,
      correct_answer: draft.correct_answer,
      correct_reason: draft.correct_reason,
      order_number: draft.order_number,
      is_active: draft.is_active,
      options: { answers: draft.answers, reasons: draft.reasons },
      diagram_data: diagram,
    };

    setSaving(true);
    try {
      if (draft.id) {
        await patch(`/api/teacher/questions/${draft.id}`, payload);
        toast("Soal berhasil diperbarui.", "success");
      } else {
        await post("/api/teacher/questions", payload);
        toast("Soal baru berhasil ditambahkan.", "success");
      }
      setDraft(null);
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Gagal menyimpan soal.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function saveMaterial() {
    if (!materialDraft) return;
    if (!materialDraft.title.trim()) return toast("Judul materi wajib diisi.", "error");
    let content: unknown;
    try {
      content = JSON.parse(materialDraft.contentJson);
    } catch {
      return toast("Isi materi bukan JSON yang valid.", "error");
    }
    setSaving(true);
    try {
      const payload = {
        title: materialDraft.title,
        order_number: materialDraft.order_number,
        is_active: materialDraft.is_active,
        content,
      };
      if (materialDraft.id) {
        await patch(`/api/teacher/materials/${materialDraft.id}`, payload);
        toast("Materi berhasil diperbarui.", "success");
      } else {
        await post("/api/teacher/materials", payload);
        toast("Materi baru berhasil ditambahkan.", "success");
      }
      setMaterialDraft(null);
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Gagal menyimpan materi.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function toggleQuestion(question: Question) {
    try {
      await patch(`/api/teacher/questions/${question.id}`, { is_active: !question.is_active });
      toast(question.is_active ? "Soal dinonaktifkan." : "Soal diaktifkan.", "success");
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Gagal mengubah status.", "error");
    }
  }

  async function removeQuestion(question: Question) {
    if (!window.confirm(`Hapus soal "${question.question_text.slice(0, 48)}..."?`)) return;
    try {
      await del(`/api/teacher/questions/${question.id}`);
      toast("Soal dihapus.", "success");
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Gagal menghapus soal.", "error");
    }
  }

  async function toggleMaterial(material: LearningMaterial) {
    try {
      await patch(`/api/teacher/materials/${material.id}`, {
        is_active: !material.is_active,
        title: material.title,
      });
      toast(material.is_active ? "Materi disembunyikan dari siswa." : "Materi ditampilkan ke siswa.", "success");
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Gagal mengubah status.", "error");
    }
  }

  async function removeMaterial(material: LearningMaterial) {
    if (!window.confirm(`Hapus materi "${material.title}"?`)) return;
    try {
      await del(`/api/teacher/materials/${material.id}`);
      toast("Materi dihapus.", "success");
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Gagal menghapus materi.", "error");
    }
  }

  if (loading && !questions) return <Loader label="Memuat bank soal..." />;
  if (error)
    return (
      <div className="space-y-4">
        <EmptyState icon="⚠️" title="Data tidak dapat dimuat" description={error} />
        <div className="flex justify-center">
          <Button onClick={() => void load()}>Coba Lagi</Button>
        </div>
      </div>
    );

  const list = (questions ?? []).filter((q) => q.menu_type === tab);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Badge tone="brand">Manajemen Pembelajaran</Badge>
          <h1 className="mt-2 font-display text-2xl font-extrabold text-ink">Kelola Materi & Soal</h1>
          <p className="text-sm text-ink/60">
            Atur materi Pahami Konsep, soal Misi Penyelidikan, soal Uji Pemahaman, pilihan jawaban, kunci,
            dan pembahasan.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => void load()}>
          🔄 Muat Ulang
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            { key: "misi", label: "🕵️ Misi Penyelidikan" },
            { key: "uji", label: "🎯 Uji Pemahaman" },
            { key: "materi", label: "📘 Materi Pahami Konsep" },
          ] as { key: Tab; label: string }[]
        ).map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => {
              setTab(item.key);
              setDraft(null);
              setMaterialDraft(null);
            }}
            className={cx(
              "rounded-2xl px-4 py-2.5 font-display text-sm font-bold transition",
              tab === item.key
                ? "bg-gradient-to-r from-brand to-aqua text-white shadow-lg shadow-brand/25"
                : "bg-white text-ink/65 ring-1 ring-brand-soft hover:-translate-y-0.5",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "materi" ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={() =>
                setMaterialDraft({
                  title: "",
                  order_number: (materials?.length ?? 0) + 1,
                  is_active: true,
                  contentJson: JSON.stringify(
                    {
                      intro: "Tulis pengantar singkat di sini.",
                      paragraphs: ["Paragraf penjelasan."],
                      bullets: ["Poin penting pertama", "Poin penting kedua"],
                      callout: { tone: "info", text: "Catatan penting." },
                      conclusion: "Kesimpulan bagian ini.",
                    },
                    null,
                    2,
                  ),
                })
              }
            >
              + Tambah Materi
            </Button>
          </div>

          {materialDraft ? (
            <Card className="animate-pop p-5 sm:p-6">
              <h2 className="font-display text-base font-extrabold text-ink">
                {materialDraft.id ? "Ubah materi" : "Materi baru"}
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-[2fr_1fr]">
                <Field label="Judul materi">
                  <input
                    className={inputClass}
                    value={materialDraft.title}
                    onChange={(e) => setMaterialDraft({ ...materialDraft, title: e.target.value })}
                    placeholder="Contoh: Bagian 6 – Rangkuman"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Urutan">
                    <input
                      className={inputClass}
                      type="number"
                      min={1}
                      max={999}
                      value={materialDraft.order_number}
                      onChange={(e) =>
                        setMaterialDraft({ ...materialDraft, order_number: Number(e.target.value) || 1 })
                      }
                    />
                  </Field>
                  <Field label="Status">
                    <select
                      className={inputClass}
                      value={materialDraft.is_active ? "1" : "0"}
                      onChange={(e) => setMaterialDraft({ ...materialDraft, is_active: e.target.value === "1" })}
                    >
                      <option value="1">Aktif</option>
                      <option value="0">Nonaktif</option>
                    </select>
                  </Field>
                </div>
              </div>
              <div className="mt-4">
                <Field
                  label="Isi materi (JSON)"
                  hint="Field yang didukung: intro, paragraphs[], bullets[], example{title,items[]}, diagram{}, diagrams[], cards[{title,text,diagram}], question, callout{tone,text}, conclusion, image."
                >
                  <textarea
                    className={cx(inputClass, "min-h-[260px] font-mono text-xs")}
                    value={materialDraft.contentJson}
                    onChange={(e) => setMaterialDraft({ ...materialDraft, contentJson: e.target.value })}
                    spellCheck={false}
                  />
                </Field>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button loading={saving} onClick={() => void saveMaterial()}>
                  💾 Simpan Materi
                </Button>
                <Button variant="secondary" onClick={() => setMaterialDraft(null)}>
                  Batal
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    try {
                      setMaterialDraft({
                        ...materialDraft,
                        contentJson: JSON.stringify(JSON.parse(materialDraft.contentJson), null, 2),
                      });
                      toast("JSON dirapikan.", "success");
                    } catch {
                      toast("JSON belum valid.", "error");
                    }
                  }}
                >
                  Rapikan JSON
                </Button>
              </div>
            </Card>
          ) : null}

          {(materials ?? []).map((material) => (
            <Card key={material.id} className={cx("p-5", !material.is_active && "opacity-70")}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-black uppercase tracking-widest text-ink/45">
                    Bagian {material.order_number} · {material.is_active ? "Aktif" : "Nonaktif"}
                  </p>
                  <h3 className="mt-1 font-display text-base font-extrabold text-ink">{material.title}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-ink/60">
                    {material.content.intro ?? material.content.paragraphs?.[0] ?? "Tanpa pengantar."}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] font-bold text-ink/50">
                    {material.content.bullets?.length ? <Chip>{material.content.bullets.length} poin</Chip> : null}
                    {material.content.diagram ? <Chip>1 diagram</Chip> : null}
                    {material.content.diagrams?.length ? (
                      <Chip>{material.content.diagrams.length} diagram</Chip>
                    ) : null}
                    {material.content.cards?.length ? <Chip>{material.content.cards.length} kartu</Chip> : null}
                    {material.content.image ? <Chip>gambar</Chip> : null}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      setMaterialDraft({
                        id: material.id,
                        title: material.title,
                        order_number: material.order_number,
                        is_active: material.is_active,
                        contentJson: JSON.stringify(material.content, null, 2),
                      })
                    }
                  >
                    ✏️ Ubah
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => void toggleMaterial(material)}>
                    {material.is_active ? "🚫 Nonaktifkan" : "✅ Aktifkan"}
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => void removeMaterial(material)}>
                    🗑️ Hapus
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink/60">
              {list.length} soal aktif & nonaktif pada menu{" "}
              <strong>{MENU_LABEL[tab]}</strong>. Kunci jawaban hanya terlihat di portal guru.
            </p>
            <Button
              size="sm"
              onClick={() =>
                setDraft(emptyDraft(tab as "misi" | "uji", list.length ? Math.max(...list.map((q) => q.order_number)) + 1 : 1))
              }
            >
              + Tambah Soal
            </Button>
          </div>

          {draft ? (
            <Card className="animate-pop p-5 sm:p-6">
              <h2 className="font-display text-base font-extrabold text-ink">
                {draft.id ? "Ubah soal" : "Soal baru"} – {MENU_LABEL[draft.menu_type]}
              </h2>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <Field label="Menu">
                  <select
                    className={inputClass}
                    value={draft.menu_type}
                    onChange={(e) => setDraft({ ...draft, menu_type: e.target.value as "misi" | "uji" })}
                  >
                    <option value="misi">Misi Penyelidikan</option>
                    <option value="uji">Uji Pemahaman</option>
                  </select>
                </Field>
                <Field label="Urutan">
                  <input
                    className={inputClass}
                    type="number"
                    min={1}
                    max={999}
                    value={draft.order_number}
                    onChange={(e) => setDraft({ ...draft, order_number: Number(e.target.value) || 1 })}
                  />
                </Field>
                <Field label="Status">
                  <select
                    className={inputClass}
                    value={draft.is_active ? "1" : "0"}
                    onChange={(e) => setDraft({ ...draft, is_active: e.target.value === "1" })}
                  >
                    <option value="1">Aktif</option>
                    <option value="0">Nonaktif</option>
                  </select>
                </Field>
              </div>

              <div className="mt-4 space-y-4">
                <Field label="Cerita / konteks soal">
                  <textarea
                    className={cx(inputClass, "min-h-[90px]")}
                    value={draft.context}
                    onChange={(e) => setDraft({ ...draft, context: e.target.value })}
                    placeholder="Contoh: Dalam kegiatan pengenalan kuliner khas Salatiga..."
                  />
                </Field>
                <Field label="Pertanyaan">
                  <input
                    className={inputClass}
                    value={draft.question_text}
                    onChange={(e) => setDraft({ ...draft, question_text: e.target.value })}
                    placeholder="Apakah relasi tersebut merupakan fungsi?"
                  />
                </Field>
              </div>

              <div className="mt-5 grid gap-5 lg:grid-cols-2">
                <OptionEditor
                  title="Pilihan jawaban"
                  items={draft.answers}
                  onChange={(answers) => setDraft({ ...draft, answers })}
                  correct={draft.correct_answer}
                  onCorrect={(value) => setDraft({ ...draft, correct_answer: value })}
                />
                <OptionEditor
                  title="Pilihan alasan"
                  items={draft.reasons}
                  onChange={(reasons) => setDraft({ ...draft, reasons })}
                  correct={draft.correct_reason}
                  onCorrect={(value) => setDraft({ ...draft, correct_reason: value })}
                />
              </div>

              <div className="mt-5">
                <Field label="Data diagram panah (JSON)" hint="Kosongkan bila soal tidak memakai diagram.">
                  <textarea
                    className={cx(inputClass, "min-h-[190px] font-mono text-xs")}
                    value={draft.diagramJson}
                    onChange={(e) => setDraft({ ...draft, diagramJson: e.target.value })}
                    spellCheck={false}
                  />
                </Field>
                {(() => {
                  try {
                    const parsed = draft.diagramJson.trim() ? JSON.parse(draft.diagramJson) : null;
                    if (!parsed) return null;
                    return (
                      <div className="mt-3 rounded-3xl bg-brand-soft/40 p-4 ring-1 ring-brand-soft">
                        <p className="mb-2 text-[11px] font-black uppercase tracking-widest text-ink/50">
                          Pratinjau diagram
                        </p>
                        <ArrowDiagram diagram={parsed} animate={false} showVerdict />
                      </div>
                    );
                  } catch {
                    return (
                      <p className="mt-2 text-xs font-semibold text-rose-600">
                        JSON diagram belum valid — pratinjau tidak dapat ditampilkan.
                      </p>
                    );
                  }
                })()}
              </div>

              <div className="mt-5">
                <Field label="Pembahasan & umpan balik">
                  <textarea
                    className={cx(inputClass, "min-h-[90px]")}
                    value={draft.explanation}
                    onChange={(e) => setDraft({ ...draft, explanation: e.target.value })}
                    placeholder="Jelaskan mengapa jawaban tersebut benar."
                  />
                </Field>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Button loading={saving} onClick={() => void saveQuestion()}>
                  💾 Simpan Soal
                </Button>
                <Button variant="secondary" onClick={() => setDraft(null)}>
                  Batal
                </Button>
              </div>
            </Card>
          ) : null}

          {list.length ? (
            list.map((question, i) => (
              <Card key={question.id} className={cx("p-5", !question.is_active && "opacity-70")}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-black uppercase tracking-widest text-ink/45">
                      Soal {i + 1} · urutan {question.order_number} ·{" "}
                      {question.is_active ? "Aktif" : "Nonaktif"}
                    </p>
                    <h3 className="mt-1 font-display text-sm font-extrabold text-ink">
                      {question.question_text}
                    </h3>
                    {question.context ? (
                      <p className="mt-1 line-clamp-2 text-xs text-ink/60">{question.context}</p>
                    ) : null}
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <div className="rounded-2xl bg-aqua-soft px-3 py-2 text-xs">
                        <p className="font-black uppercase tracking-widest text-teal-700">Kunci</p>
                        <p className="mt-0.5 font-bold text-ink">
                          {question.options.answers.find((a) => a.key === question.correct_answer)?.text ??
                            question.correct_answer}
                        </p>
                        <p className="mt-0.5 text-ink/70">
                          Alasan {question.correct_reason}:{" "}
                          {question.options.reasons.find((r) => r.key === question.correct_reason)?.text}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-brand-soft/50 px-3 py-2 text-xs">
                        <p className="font-black uppercase tracking-widest text-brand-dark">Pembahasan</p>
                        <p className="mt-0.5 leading-relaxed text-ink/75">
                          {question.explanation || "Belum ada pembahasan."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Button size="sm" variant="secondary" onClick={() => setDraft(toDraft(question))}>
                      ✏️ Ubah
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => void toggleQuestion(question)}>
                      {question.is_active ? "🚫 Nonaktifkan" : "✅ Aktifkan"}
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => void removeQuestion(question)}>
                      🗑️
                    </Button>
                  </div>
                </div>

                {question.diagram_data ? (
                  <div className="mt-4 rounded-3xl bg-white p-3 ring-1 ring-brand-soft">
                    <ArrowDiagram diagram={question.diagram_data} animate={false} showVerdict />
                  </div>
                ) : null}
              </Card>
            ))
          ) : (
            <EmptyState
              icon="📝"
              title="Belum ada soal pada menu ini"
              description="Tambahkan soal baru agar siswa dapat mengerjakan menu ini."
            />
          )}
        </div>
      )}
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-slate-100 px-2 py-0.5">{children}</span>;
}

function OptionEditor({
  title,
  items,
  onChange,
  correct,
  onCorrect,
}: {
  title: string;
  items: QuestionOptions["answers"];
  onChange: (items: QuestionOptions["answers"]) => void;
  correct: string;
  onCorrect: (value: string) => void;
}) {
  const update = (index: number, patchValue: Partial<{ key: string; text: string }>) => {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patchValue } : item)));
  };
  return (
    <div className="rounded-3xl bg-brand-soft/30 p-4">
      <p className="font-display text-xs font-black uppercase tracking-widest text-brand-dark">{title}</p>
      <div className="mt-3 space-y-2">
        {items.map((item, index) => (
          <div key={`${item.key}-${index}`} className="flex items-start gap-2">
            <input
              className={cx(inputClass, "w-16 shrink-0 px-2 py-2 text-center text-xs")}
              value={item.key}
              onChange={(e) => update(index, { key: e.target.value })}
              aria-label="Kunci pilihan"
            />
            <input
              className={cx(inputClass, "px-3 py-2 text-xs")}
              value={item.text}
              onChange={(e) => update(index, { text: e.target.value })}
              aria-label="Teks pilihan"
            />
            <button
              type="button"
              onClick={() => onCorrect(item.key)}
              className={cx(
                "shrink-0 rounded-xl px-2.5 py-2 text-xs font-bold transition",
                correct === item.key ? "bg-aqua text-white" : "bg-white text-ink/50 ring-1 ring-slate-200",
              )}
              title="Tetapkan sebagai kunci"
            >
              {correct === item.key ? "✓ Kunci" : "Jadikan kunci"}
            </button>
            <button
              type="button"
              onClick={() => onChange(items.filter((_, i) => i !== index))}
              className="shrink-0 rounded-xl bg-white px-2.5 py-2 text-xs font-bold text-rose-500 ring-1 ring-rose-100 transition hover:bg-coral-soft"
              title="Hapus pilihan"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <Button
        size="sm"
        variant="secondary"
        className="mt-3"
        onClick={() =>
          onChange([
            ...items,
            {
              key: String.fromCharCode(65 + items.length),
              text: "",
            },
          ])
        }
      >
        + Tambah pilihan
      </Button>
    </div>
  );
}
