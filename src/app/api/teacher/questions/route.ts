import { api, num, readJson, str } from "@/lib/api";
import { requireTeacher } from "@/lib/auth";
import { store } from "@/lib/store";
import type { ArrowDiagram, Question, QuestionOptions } from "@/lib/store/types";

export const dynamic = "force-dynamic";

export function parseOptions(value: unknown): QuestionOptions {
  const raw = value as Partial<QuestionOptions> | undefined;
  if (!raw || !Array.isArray(raw.answers) || !Array.isArray(raw.reasons)) {
    throw Object.assign(new Error("Pilihan jawaban dan alasan harus berupa daftar."), { status: 400 });
  }
  const normalize = (list: unknown[]) =>
    list.map((item) => {
      if (typeof item === "string") return { key: item, text: item };
      const obj = item as { key?: unknown; text?: unknown };
      return { key: str(obj.key, "Kunci pilihan"), text: str(obj.text, "Teks pilihan") };
    });
  const answers = normalize(raw.answers);
  const reasons = normalize(raw.reasons);
  if (answers.length < 2) throw Object.assign(new Error("Minimal dua pilihan jawaban."), { status: 400 });
  if (reasons.length < 2) throw Object.assign(new Error("Minimal dua pilihan alasan."), { status: 400 });
  // Teruskan ilustrasi pasangan berurutan / gambar agar tidak hilang saat soal diedit guru.
  const pairs = Array.isArray(raw.pairs)
    ? raw.pairs.map((item) => String(item)).filter(Boolean)
    : undefined;
  const image = typeof raw.image === "string" && raw.image.trim() ? String(raw.image).trim() : undefined;
  const imageAlt =
    typeof raw.imageAlt === "string" && raw.imageAlt.trim() ? String(raw.imageAlt).trim() : undefined;
  return {
    answers,
    reasons,
    ...(pairs?.length ? { pairs } : {}),
    ...(image ? { image } : {}),
    ...(imageAlt ? { imageAlt } : {}),
  };
}

export function parseDiagram(value: unknown): ArrowDiagram | null {
  if (value === null || value === undefined || value === "") return null;
  const raw = value as Partial<ArrowDiagram>;
  if (!Array.isArray(raw.left) || !Array.isArray(raw.right) || !Array.isArray(raw.arrows)) {
    throw Object.assign(new Error("Data diagram harus memuat left, right, dan arrows."), { status: 400 });
  }
  const left = raw.left.map((item) => String(item));
  const right = raw.right.map((item) => String(item));
  const arrows = raw.arrows.map((pair) => {
    const [l, r] = pair as [unknown, unknown];
    const li = Number(l);
    const ri = Number(r);
    if (!Number.isInteger(li) || !Number.isInteger(ri) || li < 0 || ri < 0 || li >= left.length || ri >= right.length) {
      throw Object.assign(new Error("Indeks panah pada diagram tidak valid."), { status: 400 });
    }
    return [li, ri] as [number, number];
  });
  return {
    leftLabel: raw.leftLabel ? String(raw.leftLabel) : "Domain",
    rightLabel: raw.rightLabel ? String(raw.rightLabel) : "Kodomain",
    left,
    right,
    arrows,
    note: raw.note ? String(raw.note) : undefined,
    verdict: raw.verdict === "fungsi" || raw.verdict === "bukan" ? raw.verdict : undefined,
  };
}

export function parseQuestionInput(body: Record<string, unknown>, partial = false): Partial<Omit<Question, "id">> {
  const result: Partial<Omit<Question, "id">> = {};

  if (body.menu_type !== undefined || !partial) {
    const menu = str(body.menu_type, "Jenis menu");
    if (menu !== "misi" && menu !== "uji") {
      throw Object.assign(new Error("Jenis menu harus misi atau uji."), { status: 400 });
    }
    result.menu_type = menu;
  }
  if (body.question_text !== undefined || !partial) result.question_text = str(body.question_text, "Pertanyaan");
  if (body.context !== undefined || !partial) result.context = String(body.context ?? "").trim();
  if (body.diagram_data !== undefined || !partial) result.diagram_data = parseDiagram(body.diagram_data);
  if (body.options !== undefined || !partial) result.options = parseOptions(body.options);
  if (body.correct_answer !== undefined || !partial) result.correct_answer = str(body.correct_answer, "Kunci jawaban");
  if (body.correct_reason !== undefined || !partial) result.correct_reason = str(body.correct_reason, "Kunci alasan");
  if (body.explanation !== undefined || !partial) result.explanation = String(body.explanation ?? "").trim();
  if (body.order_number !== undefined || !partial) result.order_number = num(body.order_number, "Urutan", 1, 999);
  if (body.is_active !== undefined || !partial) result.is_active = body.is_active !== false && body.is_active !== "false";

  if (result.options && (result.correct_answer || result.correct_reason)) {
    if (result.correct_answer && !result.options.answers.some((a) => a.key === result.correct_answer)) {
      throw Object.assign(new Error("Kunci jawaban tidak ada dalam daftar pilihan jawaban."), { status: 400 });
    }
    if (result.correct_reason && !result.options.reasons.some((r) => r.key === result.correct_reason)) {
      throw Object.assign(new Error("Kunci alasan tidak ada dalam daftar pilihan alasan."), { status: 400 });
    }
  }
  return result;
}

export async function GET() {
  return api(async () => {
    await requireTeacher();
    const s = await store();
    const questions = await s.listQuestions({ withKeys: true, includeInactive: true });
    return { questions };
  });
}

export async function POST(request: Request) {
  return api(async () => {
    await requireTeacher();
    const body = readJson(await request.json().catch(() => ({})));
    const input = parseQuestionInput(body);
    const s = await store();
    const question = await s.createQuestion(input as Omit<Question, "id">);
    return { question };
  });
}
