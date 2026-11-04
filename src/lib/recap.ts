import type {
  LearningSession,
  Question,
  Student,
  StudentAnswer,
  StudentReflection,
} from "./store/types";

export type MenuRecap = {
  answered: number;
  total: number;
  correct: number;
  score: number; // rata-rata skor 0-100
};

export type RecapRow = {
  no: number;
  student: Student;
  session: LearningSession | null;
  status: "Belum Mulai" | "Sedang Dikerjakan" | "Selesai";
  misi: MenuRecap;
  uji: MenuRecap;
  reflection: StudentReflection | null;
  durationMinutes: number | null;
  lastActivity: string | null;
};

const emptyRecap = (total: number): MenuRecap => ({
  answered: 0,
  total,
  correct: 0,
  score: 0,
});

function recapFor(answers: StudentAnswer[], total: number): MenuRecap {
  if (!answers.length) return emptyRecap(total);
  const sum = answers.reduce((acc, row) => acc + (row.score ?? 0), 0);
  return {
    answered: answers.length,
    total,
    correct: answers.filter((row) => row.is_correct).length,
    score: Math.round(sum / answers.length),
  };
}

export function buildRecap(params: {
  students: Student[];
  sessions: LearningSession[];
  answers: StudentAnswer[];
  questions: Question[];
  reflections: StudentReflection[];
}): RecapRow[] {
  const { students, sessions, answers, questions, reflections } = params;
  const misiTotal = questions.filter((q) => q.menu_type === "misi" && q.is_active).length;
  const ujiTotal = questions.filter((q) => q.menu_type === "uji" && q.is_active).length;

  const latestSession = new Map<string, LearningSession>();
  for (const session of sessions) {
    const current = latestSession.get(session.student_id);
    if (!current || new Date(session.started_at) >= new Date(current.started_at)) {
      latestSession.set(session.student_id, session);
    }
  }

  const answersBySession = new Map<string, StudentAnswer[]>();
  for (const answer of answers) {
    const list = answersBySession.get(answer.session_id) ?? [];
    list.push(answer);
    answersBySession.set(answer.session_id, list);
  }

  const reflectionBySession = new Map(reflections.map((row) => [row.session_id, row]));
  const questionById = new Map(questions.map((row) => [row.id, row]));

  const rows = students.map((student) => {
    const session = latestSession.get(student.id) ?? null;
    const sessionAnswers = session ? (answersBySession.get(session.id) ?? []) : [];
    const misiAnswers = sessionAnswers.filter((a) => questionById.get(a.question_id)?.menu_type === "misi");
    const ujiAnswers = sessionAnswers.filter((a) => questionById.get(a.question_id)?.menu_type === "uji");
    const reflection = session ? (reflectionBySession.get(session.id) ?? null) : null;

    let durationMinutes: number | null = null;
    let lastActivity: string | null = session?.started_at ?? null;
    if (session) {
      const stamps = [session.started_at, ...sessionAnswers.map((a) => a.answered_at)];
      if (reflection) stamps.push(reflection.submitted_at);
      if (session.completed_at) stamps.push(session.completed_at);
      const sorted = stamps.map((s) => new Date(s).getTime()).sort((a, b) => a - b);
      durationMinutes = Math.max(0, Math.round((sorted[sorted.length - 1] - sorted[0]) / 60000));
      lastActivity = new Date(sorted[sorted.length - 1]).toISOString();
    }

    const answeredSomething = sessionAnswers.length > 0;
    const progress = session?.progress ?? 0;
    const status: RecapRow["status"] =
      session?.status === "selesai" || progress >= 100
        ? "Selesai"
        : answeredSomething || progress > 0
          ? "Sedang Dikerjakan"
          : "Belum Mulai";

    return {
      no: 0,
      student,
      session,
      status,
      misi: recapFor(misiAnswers, misiTotal),
      uji: recapFor(ujiAnswers, ujiTotal),
      reflection,
      durationMinutes,
      lastActivity,
    };
  });

  rows.sort(
    (a, b) =>
      a.student.class_name.localeCompare(b.student.class_name) ||
      a.student.attendance_number - b.student.attendance_number ||
      a.student.name.localeCompare(b.student.name),
  );

  return rows.map((row, index) => ({ ...row, no: index + 1 }));
}

export function toCsv(rows: RecapRow[]): string {
  const header = [
    "No",
    "Nama Siswa",
    "No Absen",
    "Kelas",
    "Status Pengerjaan",
    "Misi Penyelidikan (jawaban/total)",
    "Skor Misi",
    "Uji Pemahaman (jawaban/total)",
    "Skor Uji",
    "Waktu Pengerjaan (menit)",
    "Aktivitas Terakhir",
    "Status Refleksi",
    "Progress (%)",
  ];
  const escape = (value: string | number | null) => {
    const text = value === null || value === undefined ? "" : String(value);
    return /[",\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const lines = rows.map((row) =>
    [
      row.no,
      row.student.name,
      row.student.attendance_number,
      row.student.class_name,
      row.status,
      `${row.misi.answered}/${row.misi.total}`,
      row.misi.answered ? row.misi.score : "-",
      `${row.uji.answered}/${row.uji.total}`,
      row.uji.answered ? row.uji.score : "-",
      row.durationMinutes ?? "-",
      row.lastActivity ? new Date(row.lastActivity).toLocaleString("id-ID") : "-",
      row.reflection ? "Sudah Refleksi" : "Belum Refleksi",
      row.session?.progress ?? 0,
    ]
      .map(escape)
      .join(","),
  );
  return [header.map(escape).join(","), ...lines].join("\n");
}

export const MENU_LABEL: Record<string, string> = {
  misi: "Misi Penyelidikan",
  uji: "Uji Pemahaman",
  materi: "Pahami Konsep",
  refleksi: "Refleksi",
};
