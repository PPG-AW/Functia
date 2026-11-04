import { api, readJson, str } from "@/lib/api";
import { requireStudent } from "@/lib/auth";
import { scoreAnswer } from "@/lib/progress";
import { buildStudentContext, persistSession } from "@/lib/student-context";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return api(async () => {
    const ctx = await requireStudent();
    const body = readJson(await request.json().catch(() => ({})));
    const questionId = str(body.question_id, "Soal");
    const selectedAnswer = str(body.selected_answer, "Jawaban");
    const selectedReason = str(body.selected_reason, "Alasan");

    const s = await store();
    const questions = await s.listQuestions({ withKeys: true, includeInactive: true });
    const question = questions.find((row) => row.id === questionId);
    if (!question) {
      throw Object.assign(new Error("Soal tidak ditemukan."), { status: 404 });
    }
    const answerKeys = (question.options?.answers ?? []).map((a) => a.key);
    const reasonKeys = (question.options?.reasons ?? []).map((r) => r.key);
    if (!answerKeys.includes(selectedAnswer)) {
      throw Object.assign(new Error("Pilihan jawaban tidak dikenali."), { status: 400 });
    }
    if (!reasonKeys.includes(selectedReason)) {
      throw Object.assign(new Error("Pilihan alasan tidak dikenali."), { status: 400 });
    }

    const { score, isCorrect } = scoreAnswer(selectedAnswer, selectedReason, question);
    await s.saveAnswer({
      session_id: ctx.session.id,
      question_id: question.id,
      selected_answer: selectedAnswer,
      selected_reason: selectedReason,
      is_correct: isCorrect,
      score,
    });

    const payload = await buildStudentContext(ctx);
    const session = await persistSession({ ...ctx.session, current_menu: question.menu_type }, payload);

    const menuDone =
      question.menu_type === "misi"
        ? payload.misi.answered >= payload.misi.total && payload.misi.total > 0
        : payload.uji.answered >= payload.uji.total && payload.uji.total > 0;

    return {
      is_correct: isCorrect,
      score,
      correct_answer: question.correct_answer,
      correct_reason: question.correct_reason,
      explanation: question.explanation,
      feedback: isCorrect
        ? "Hebat! Jawaban dan alasanmu tepat. Kamu berhasil menemukan ciri-ciri fungsi!"
        : "Belum tepat. Coba perhatikan kembali setiap anggota domain. Apakah semuanya memiliki tepat satu pasangan?",
      menu: question.menu_type,
      menuDone,
      progress: payload.progress,
      misi: payload.misi,
      uji: payload.uji,
      session,
    };
  });
}
