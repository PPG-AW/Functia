import { api } from "@/lib/api";
import { getStudentContext } from "@/lib/auth";
import { store } from "@/lib/store";
import type { MenuType } from "@/lib/store/types";

export const dynamic = "force-dynamic";

/** Soal untuk siswa: kunci jawaban & pembahasan TIDAK dikirim sebelum siswa menjawab. */
export async function GET(request: Request) {
  return api(async () => {
    const url = new URL(request.url);
    const menu = url.searchParams.get("menu");
    if (menu !== "misi" && menu !== "uji") {
      throw Object.assign(new Error("Parameter menu tidak valid."), { status: 400 });
    }
    const s = await store();
    const questions = await s.listQuestions({ menuType: menu as MenuType });
    const ctx = await getStudentContext();
    const answers = ctx ? await s.listAnswers(ctx.session.id) : [];
    const mine = new Map(answers.map((a) => [a.question_id, a]));

    return {
      menu,
      questions,
      answers: questions
        .filter((q) => mine.has(q.id))
        .map((q) => {
          const row = mine.get(q.id)!;
          return {
            question_id: q.id,
            selected_answer: row.selected_answer,
            selected_reason: row.selected_reason,
            is_correct: row.is_correct,
            score: row.score,
            correct_answer: q.correct_answer,
            correct_reason: q.correct_reason,
            explanation: q.explanation,
          };
        }),
    };
  });
}
