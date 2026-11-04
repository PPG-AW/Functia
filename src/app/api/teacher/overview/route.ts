import { api } from "@/lib/api";
import { requireTeacher } from "@/lib/auth";
import { buildRecap } from "@/lib/recap";
import { getStoreStatus, store } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return api(async () => {
    await requireTeacher();
    const s = await store();
    const [students, sessions, answers, questions, reflections] = await Promise.all([
      s.listStudents(),
      s.listSessions(),
      s.listAllAnswers(),
      s.listQuestions({ withKeys: true, includeInactive: true }),
      s.listReflections(),
    ]);

    const recap = buildRecap({ students, sessions, answers, questions, reflections });
    const entered = recap.filter((row) => row.session);
    const finished = recap.filter((row) => row.status === "Selesai");
    const misiScores = recap.filter((r) => r.misi.answered > 0).map((r) => r.misi.score);
    const ujiScores = recap.filter((r) => r.uji.answered > 0).map((r) => r.uji.score);
    const avg = (arr: number[]) => (arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0);

    const classes = Array.from(new Set(students.map((row) => row.class_name))).sort();

    return {
      storage: await getStoreStatus(),
      stats: {
        totalStudents: students.length,
        entered: entered.length,
        finished: finished.length,
        inProgress: entered.length - finished.length,
        totalAnswers: answers.length,
        correctAnswers: answers.filter((a) => a.is_correct).length,
        averageMisi: avg(misiScores),
        averageUji: avg(ujiScores),
        reflections: reflections.length,
      },
      classes,
      recap,
      reflections,
      recentActivity: [...answers]
        .sort((a, b) => new Date(b.answered_at).getTime() - new Date(a.answered_at).getTime())
        .slice(0, 12)
        .map((answer) => {
          const session = sessions.find((row) => row.id === answer.session_id);
          const student = students.find((row) => row.id === session?.student_id);
          const question = questions.find((row) => row.id === answer.question_id);
          return {
            id: answer.id,
            studentName: student?.name ?? "Siswa",
            className: student?.class_name ?? "-",
            menu: question?.menu_type ?? "-",
            score: answer.score,
            isCorrect: answer.is_correct,
            at: answer.answered_at,
          };
        }),
    };
  });
}
