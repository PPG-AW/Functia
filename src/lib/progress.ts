import type { MenuState } from "./store/types";

export const MENU_WEIGHTS = {
  materi: 20,
  misi: 30,
  uji: 30,
  refleksi: 20,
} as const;

export type ProgressInput = {
  menuState: MenuState;
  misiAnswered: number;
  misiTotal: number;
  ujiAnswered: number;
  ujiTotal: number;
};

export function computeProgress(input: ProgressInput): number {
  const materiDone = input.menuState.materi ? MENU_WEIGHTS.materi : 0;
  const misiDone = input.misiTotal
    ? Math.round((Math.min(input.misiAnswered, input.misiTotal) / input.misiTotal) * MENU_WEIGHTS.misi)
    : 0;
  const ujiDone = input.ujiTotal
    ? Math.round((Math.min(input.ujiAnswered, input.ujiTotal) / input.ujiTotal) * MENU_WEIGHTS.uji)
    : 0;
  const refleksiDone = input.menuState.refleksi ? MENU_WEIGHTS.refleksi : 0;
  return Math.max(0, Math.min(100, materiDone + misiDone + ujiDone + refleksiDone));
}

export type MenuStatus = "Belum Dimulai" | "Sedang Dikerjakan" | "Selesai";

export function menuStatus(done: boolean, started: boolean): MenuStatus {
  if (done) return "Selesai";
  if (started) return "Sedang Dikerjakan";
  return "Belum Dimulai";
}

/** Skor jawaban: benar penuh 100, jawaban benar tapi alasan salah 50, lainnya 0. */
export function scoreAnswer(selectedAnswer: string, selectedReason: string, question: {
  correct_answer: string;
  correct_reason: string;
}): { score: number; isCorrect: boolean } {
  const answerOk = selectedAnswer === question.correct_answer;
  const reasonOk = selectedReason === question.correct_reason;
  if (answerOk && reasonOk) return { score: 100, isCorrect: true };
  if (answerOk) return { score: 50, isCorrect: false };
  if (reasonOk) return { score: 25, isCorrect: false };
  return { score: 0, isCorrect: false };
}
