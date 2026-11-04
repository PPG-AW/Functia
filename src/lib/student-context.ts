import { computeProgress } from "./progress";
import type { StudentContext } from "./auth";
import { store } from "./store";
import type { LearningSession, MenuState } from "./store/types";
import type { MenuCount, StudentPayload } from "./types-api";

export type StudentContextPayload = StudentPayload;
export type { MenuCount };

export async function buildStudentContext(ctx: StudentContext): Promise<StudentContextPayload> {
  const s = await store();
  const [allQuestions, answers, reflection] = await Promise.all([
    s.listQuestions({}),
    s.listAnswers(ctx.session.id),
    s.getReflection(ctx.session.id),
  ]);

  const questionById = new Map(allQuestions.map((q) => [q.id, q]));
  const misiQ = allQuestions.filter((q) => q.menu_type === "misi");
  const ujiQ = allQuestions.filter((q) => q.menu_type === "uji");

  const countFor = (total: number, menu: string): MenuCount => {
    const rows = answers.filter((a) => questionById.get(a.question_id)?.menu_type === menu);
    const sum = rows.reduce((acc, r) => acc + r.score, 0);
    return {
      answered: rows.length,
      total,
      correct: rows.filter((r) => r.is_correct).length,
      score: rows.length ? Math.round(sum / rows.length) : 0,
    };
  };

  const menuState = ctx.session.menu_state ?? {};
  const refleksiDone = Boolean(reflection) || Boolean(menuState.refleksi);
  const materiDone = Boolean(menuState.materi);

  const progress = computeProgress({
    menuState: { ...menuState, refleksi: refleksiDone },
    misiAnswered: countFor(misiQ.length, "misi").answered,
    misiTotal: misiQ.length,
    ujiAnswered: countFor(ujiQ.length, "uji").answered,
    ujiTotal: ujiQ.length,
  });

  return {
    student: ctx.student,
    session: ctx.session,
    materiDone,
    materiSlide: menuState.materiSlide ?? 0,
    misi: countFor(misiQ.length, "misi"),
    uji: countFor(ujiQ.length, "uji"),
    refleksiDone,
    progress,
    answers: answers.map((a) => ({
      question_id: a.question_id,
      menu_type: questionById.get(a.question_id)?.menu_type ?? "",
      selected_answer: a.selected_answer,
      selected_reason: a.selected_reason,
      is_correct: a.is_correct,
      score: a.score,
    })),
    reflection,
  };
}

export async function persistSession(
  session: LearningSession,
  payload: StudentContextPayload,
): Promise<LearningSession> {
  const s = await store();
  const menuState: MenuState = {
    ...(session.menu_state ?? {}),
    materi: payload.materiDone,
    refleksi: payload.refleksiDone,
  };
  const status = payload.progress >= 100 ? "selesai" : "aktif";
  await s.updateSession(session.id, {
    progress: payload.progress,
    menu_state: menuState,
    status,
    current_menu: session.current_menu,
    completed_at: status === "selesai" ? (session.completed_at ?? new Date().toISOString()) : session.completed_at,
  });
  return {
    ...session,
    progress: payload.progress,
    menu_state: menuState,
    status,
    completed_at: status === "selesai" ? (session.completed_at ?? new Date().toISOString()) : session.completed_at,
  };
}
