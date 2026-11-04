import type { LearningSession, Student, StudentReflection } from "./store/types";

export type MenuCount = { answered: number; total: number; correct: number; score: number };

export type AnswerRecord = {
  question_id: string;
  menu_type: string;
  selected_answer: string;
  selected_reason: string;
  is_correct: boolean;
  score: number;
};

export type StudentPayload = {
  student: Student;
  session: LearningSession;
  materiDone: boolean;
  materiSlide: number;
  misi: MenuCount;
  uji: MenuCount;
  refleksiDone: boolean;
  progress: number;
  answers: AnswerRecord[];
  reflection: StudentReflection | null;
};

export type SessionResponse = ({ authenticated: true } & StudentPayload) | { authenticated: false };

export type QuestionAnswerState = {
  question_id: string;
  selected_answer: string;
  selected_reason: string;
  is_correct: boolean;
  score: number;
  correct_answer: string;
  correct_reason: string;
  explanation: string;
};

export type SubmitAnswerResult = {
  is_correct: boolean;
  score: number;
  correct_answer: string;
  correct_reason: string;
  explanation: string;
  feedback: string;
  menu: string;
  menuDone: boolean;
  progress: number;
  misi: MenuCount;
  uji: MenuCount;
  session: LearningSession;
};
