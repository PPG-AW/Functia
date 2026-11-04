export type MenuType = "misi" | "uji";

export type ArrowDiagram = {
  leftLabel: string;
  rightLabel: string;
  left: string[];
  right: string[];
  /** pasangan indeks [kiri, kanan] */
  arrows: Array<[number, number]>;
  verdict?: "fungsi" | "bukan" | undefined;
  note?: string;
};

export type OptionItem = { key: string; text: string };

export type QuestionOptions = {
  answers: OptionItem[];
  reasons: OptionItem[];
  /** Daftar pasangan berurutan yang ditampilkan pada soal (opsional). */
  pairs?: string[];
  /** Path gambar pendukung soal, misalnya bidang koordinat Kartesius. */
  image?: string;
  imageAlt?: string;
};

export type Question = {
  id: string;
  menu_type: MenuType;
  question_text: string;
  context: string;
  diagram_data: ArrowDiagram | null;
  options: QuestionOptions;
  correct_answer: string;
  correct_reason: string;
  explanation: string;
  order_number: number;
  is_active: boolean;
};

export type Student = {
  id: string;
  name: string;
  attendance_number: number;
  class_name: string;
  created_at: string;
};

/** Jawaban Tugas Rumah disimpan pada kolom menu_state yang sudah ada. */
export type HomeworkAnswer = { key: string; text: string };

export type HomeworkState = {
  selected: number[];
  answers: Record<string, HomeworkAnswer>;
  submitted_at: string | null;
  status: "belum" | "menunggu" | "terkumpul";
  score: number | null;
  correct_count: number;
  total_answered: number;
};

export type MenuState = {
  materi?: boolean;
  materiSlide?: number;
  misi?: number;
  uji?: number;
  refleksi?: boolean;
  homework?: HomeworkState;
};

export type LearningSession = {
  id: string;
  student_id: string;
  status: "aktif" | "selesai";
  current_menu: string;
  progress: number;
  menu_state: MenuState;
  started_at: string;
  completed_at: string | null;
};

export type StudentAnswer = {
  id: string;
  session_id: string;
  question_id: string;
  selected_answer: string;
  selected_reason: string;
  is_correct: boolean;
  score: number;
  answered_at: string;
};

export type StudentReflection = {
  id: string;
  session_id: string;
  feeling: string;
  understanding: string;
  favorite_menu: string;
  learning_reflection: string;
  submitted_at: string;
};

export type TeacherProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type MaterialContent = {
  intro?: string;
  paragraphs?: string[];
  bullets?: string[];
  example?: { title: string; items: string[] };
  diagram?: ArrowDiagram;
  diagrams?: ArrowDiagram[];
  cards?: { title: string; text: string; diagram?: ArrowDiagram }[];
  question?: string;
  callout?: { tone: "info" | "success" | "warning"; text: string };
  conclusion?: string;
  image?: string;
};

export type LearningMaterial = {
  id: string;
  menu_type: string;
  title: string;
  content: MaterialContent;
  order_number: number;
  is_active: boolean;
  updated_at: string;
};

export type StoreProvider = "supabase" | "postgres";

export interface Store {
  readonly provider: StoreProvider;
  ping(): Promise<boolean>;

  ensureSeed(): Promise<void>;

  findStudent(input: {
    name: string;
    attendance_number: number;
    class_name: string;
  }): Promise<{ student: Student; session: LearningSession | null } | null>;
  createStudent(input: {
    name: string;
    attendance_number: number;
    class_name: string;
  }): Promise<Student>;

  createSession(studentId: string): Promise<LearningSession>;
  getSession(id: string): Promise<LearningSession | null>;
  updateSession(
    id: string,
    patch: Partial<Pick<LearningSession, "status" | "current_menu" | "progress" | "menu_state" | "completed_at">>,
  ): Promise<void>;

  listQuestions(opts: {
    menuType?: MenuType;
    includeInactive?: boolean;
    withKeys?: boolean;
  }): Promise<Question[]>;
  createQuestion(input: Omit<Question, "id">): Promise<Question>;
  updateQuestion(id: string, patch: Partial<Omit<Question, "id">>): Promise<Question | null>;
  deleteQuestion(id: string): Promise<void>;

  listMaterials(opts?: { includeInactive?: boolean }): Promise<LearningMaterial[]>;
  createMaterial(input: Omit<LearningMaterial, "id" | "updated_at">): Promise<LearningMaterial>;
  updateMaterial(
    id: string,
    patch: Partial<Omit<LearningMaterial, "id" | "updated_at">>,
  ): Promise<LearningMaterial | null>;
  deleteMaterial(id: string): Promise<void>;

  saveAnswer(input: {
    session_id: string;
    question_id: string;
    selected_answer: string;
    selected_reason: string;
    is_correct: boolean;
    score: number;
  }): Promise<StudentAnswer>;
  listAnswers(sessionId: string): Promise<StudentAnswer[]>;
  listAllAnswers(): Promise<StudentAnswer[]>;

  getReflection(sessionId: string): Promise<StudentReflection | null>;
  saveReflection(input: Omit<StudentReflection, "id" | "submitted_at">): Promise<StudentReflection>;
  listReflections(): Promise<StudentReflection[]>;

  listStudents(): Promise<Student[]>;
  listSessions(): Promise<LearningSession[]>;

  findTeacherByEmail(email: string): Promise<(TeacherProfile & { password_hash: string }) | null>;
  createTeacher(input: {
    name: string;
    email: string;
    role: string;
    password_hash: string;
  }): Promise<void>;
}
