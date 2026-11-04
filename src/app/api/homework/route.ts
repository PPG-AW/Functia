import { api, readJson } from "@/lib/api";
import { getStudentContext, requireStudent } from "@/lib/auth";
import {
  findHomeworkQuestion,
  gradeHomework,
  HOMEWORK_MIN_SELECTED,
  HOMEWORK_TOTAL,
  isValidHomeworkNumber,
  type HomeworkSubmissionAnswer,
} from "@/lib/homework";
import { store } from "@/lib/store";
import type { HomeworkState } from "@/lib/store/types";

export const dynamic = "force-dynamic";

function normalizeSelected(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  const numbers = value
    .filter(isValidHomeworkNumber)
    .map((item) => Number(item));
  return Array.from(new Set(numbers)).sort((a, b) => a - b);
}

function normalizeAnswers(value: unknown): Record<string, HomeworkSubmissionAnswer> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const result: Record<string, HomeworkSubmissionAnswer> = {};
  for (const [rawNumber, raw] of Object.entries(value as Record<string, unknown>)) {
    const number = Number(rawNumber);
    if (!isValidHomeworkNumber(number)) continue;
    const item = raw as { key?: unknown; text?: unknown } | null;
    if (!item || typeof item.key !== "string" || !item.key.trim()) continue;
    const question = findHomeworkQuestion(number);
    const choice = question?.choices.find((option) => option.key === item.key);
    if (!choice) continue;
    result[String(number)] = { key: choice.key, text: choice.text };
  }
  return result;
}

function validateForSubmit(selected: number[], answers: Record<string, HomeworkSubmissionAnswer>) {
  if (selected.length < HOMEWORK_MIN_SELECTED) {
    throw Object.assign(
      new Error(`Pilih dan kerjakan minimal ${HOMEWORK_MIN_SELECTED} soal sebelum mengumpulkan.`),
      { status: 400 },
    );
  }
  const answered = selected.filter((number) => Boolean(answers[String(number)]));
  if (answered.length < HOMEWORK_MIN_SELECTED) {
    throw Object.assign(
      new Error(`Minimal ${HOMEWORK_MIN_SELECTED} soal harus sudah dijawab sebelum dikumpulkan.`),
      { status: 400 },
    );
  }
}

async function persistHomework(sessionId: string, current: Record<string, unknown>, next: HomeworkState) {
  const s = await store();
  await s.updateSession(sessionId, {
    menu_state: { ...current, homework: next },
  });
}

export async function GET() {
  return api(async () => {
    const ctx = await getStudentContext();
    if (!ctx) return { authenticated: false as const, homework: null };
    return {
      authenticated: true as const,
      homework: ctx.session.menu_state?.homework ?? null,
      student: {
        name: ctx.student.name,
        attendance_number: ctx.student.attendance_number,
        class_name: ctx.student.class_name,
      },
      totalQuestions: HOMEWORK_TOTAL,
      minSelected: HOMEWORK_MIN_SELECTED,
    };
  });
}

/** Simpan pilihan & jawaban sementara (belum dikumpulkan). */
export async function PATCH(request: Request) {
  return api(async () => {
    const ctx = await requireStudent();
    const body = readJson(await request.json().catch(() => ({})));
    const selected = normalizeSelected(body.selected);
    const answers = normalizeAnswers(body.answers);
    const previous = ctx.session.menu_state?.homework ?? null;

    const next: HomeworkState = {
      selected,
      answers,
      submitted_at: previous?.submitted_at ?? null,
      status: previous?.status === "terkumpul" ? "terkumpul" : selected.length ? "menunggu" : "belum",
      score: null,
      correct_count: 0,
      total_answered: Object.keys(answers).length,
    };

    await persistHomework(ctx.session.id, ctx.session.menu_state ?? {}, next);
    return { homework: next, saved: true };
  });
}

/** Kumpulkan jawaban: wajib minimal 3 soal dipilih dan dijawab. */
export async function POST(request: Request) {
  return api(async () => {
    const ctx = await requireStudent();
    const body = readJson(await request.json().catch(() => ({})));
    const selected = normalizeSelected(body.selected);
    const answers = normalizeAnswers(body.answers);
    validateForSubmit(selected, answers);

    const graded = gradeHomework(answers);
    const next: HomeworkState = {
      selected,
      answers,
      submitted_at: new Date().toISOString(),
      status: "terkumpul",
      score: graded.score,
      correct_count: graded.correct_count,
      total_answered: graded.total_answered,
    };

    await persistHomework(ctx.session.id, ctx.session.menu_state ?? {}, next);

    return {
      homework: next,
      message: "Jawaban Tugas Rumah berhasil dikumpulkan!",
      totalQuestions: HOMEWORK_TOTAL,
    };
  });
}
