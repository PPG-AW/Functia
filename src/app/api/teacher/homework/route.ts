import { api } from "@/lib/api";
import { requireTeacher } from "@/lib/auth";
import { findHomeworkQuestion, HOMEWORK_TOTAL } from "@/lib/homework";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";

type AnswerDetail = {
  number: number;
  question_title: string;
  key: string;
  text: string;
  correct_key: string;
  is_correct: boolean;
  explanation: string;
};

type HomeworkRow = {
  student_id: string;
  student_name: string;
  attendance_number: number;
  class_name: string;
  session_id: string;
  selected: number[];
  selected_count: number;
  answered: number[];
  answered_count: number;
  answers: AnswerDetail[];
  submitted_at: string | null;
  status: string;
  score: number | null;
  correct_count: number;
  total_answered: number;
};

export async function GET() {
  return api(async () => {
    await requireTeacher();
    const s = await store();
    const [students, sessions] = await Promise.all([s.listStudents(), s.listSessions()]);
    const studentById = new Map(students.map((item) => [item.id, item]));

    const rows: HomeworkRow[] = [];
    for (const session of sessions) {
      const homework = session.menu_state?.homework;
      if (!homework) continue;
      const student = studentById.get(session.student_id);
      if (!student) continue;

      const selected = (homework.selected ?? []).filter((n) => Number.isInteger(n) && n >= 1 && n <= HOMEWORK_TOTAL);
      const answers: AnswerDetail[] = Object.entries(homework.answers ?? {})
        .map(([rawNumber, value]) => {
          const number = Number(rawNumber);
          const question = findHomeworkQuestion(number);
          if (!question) return null;
          return {
            number,
            question_title: question.title,
            key: value.key,
            text: value.text,
            correct_key: question.correct,
            is_correct: question.correct === value.key,
            explanation: question.explanation,
          } satisfies AnswerDetail;
        })
        .filter((item): item is AnswerDetail => item !== null)
        .sort((a, b) => a.number - b.number);

      rows.push({
        student_id: student.id,
        student_name: student.name,
        attendance_number: student.attendance_number,
        class_name: student.class_name,
        session_id: session.id,
        selected,
        selected_count: selected.length,
        answered: answers.map((item) => item.number),
        answered_count: answers.length,
        answers,
        submitted_at: homework.submitted_at ?? null,
        status: homework.status ?? "belum",
        score: homework.score ?? null,
        correct_count: homework.correct_count ?? 0,
        total_answered: homework.total_answered ?? answers.length,
      });
    }

    rows.sort(
      (a, b) =>
        a.class_name.localeCompare(b.class_name) ||
        a.attendance_number - b.attendance_number ||
        a.student_name.localeCompare(b.student_name),
    );

    const submitted = rows.filter((row) => row.status === "terkumpul");
    const scores = submitted.map((row) => row.score ?? 0);

    return {
      rows,
      totalQuestions: HOMEWORK_TOTAL,
      summary: {
        totalStudents: students.length,
        working: rows.length,
        submitted: submitted.length,
        inProgress: rows.filter((row) => row.status !== "terkumpul").length,
        averageScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
      },
    };
  });
}
