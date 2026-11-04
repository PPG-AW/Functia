import { api } from "@/lib/api";
import { requireTeacher } from "@/lib/auth";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  return api(async () => {
    await requireTeacher();
    const { id } = await context.params;
    const s = await store();
    const [students, sessions, questions] = await Promise.all([
      s.listStudents(),
      s.listSessions(),
      s.listQuestions({ withKeys: true, includeInactive: true }),
    ]);
    const student = students.find((row) => row.id === id);
    if (!student) throw Object.assign(new Error("Data siswa tidak ditemukan."), { status: 404 });

    const studentSessions = sessions.filter((row) => row.student_id === id);
    const details = await Promise.all(
      studentSessions.map(async (session) => {
        const [answers, reflection] = await Promise.all([
          s.listAnswers(session.id),
          s.getReflection(session.id),
        ]);
        return {
          session,
          reflection,
          answers: answers.map((answer) => {
            const question = questions.find((row) => row.id === answer.question_id);
            return {
              ...answer,
              menu_type: question?.menu_type ?? "-",
              question_text: question?.question_text ?? "Soal tidak tersedia",
              context: question?.context ?? "",
              correct_answer: question?.correct_answer ?? "",
              correct_reason: question?.correct_reason ?? "",
              explanation: question?.explanation ?? "",
              answer_text:
                question?.options.answers.find((o) => o.key === answer.selected_answer)?.text ??
                answer.selected_answer,
              reason_text:
                question?.options.reasons.find((o) => o.key === answer.selected_reason)?.text ??
                answer.selected_reason,
            };
          }),
        };
      }),
    );

    return { student, sessions: details };
  });
}
