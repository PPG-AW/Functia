import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * Skema database FUNCTIA.
 * Nama kolom dibuat snake_case agar identik dengan tabel Supabase.
 */

export const students = pgTable(
  "students",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    attendanceNumber: integer("attendance_number").notNull(),
    className: text("class_name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("students_class_idx").on(table.className)],
);

export const learningSessions = pgTable(
  "learning_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("aktif"),
    currentMenu: text("current_menu").notNull().default("beranda"),
    progress: integer("progress").notNull().default(0),
    menuState: jsonb("menu_state").$type<Record<string, unknown>>().notNull().default({}),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => [index("sessions_student_idx").on(table.studentId)],
);

export const questions = pgTable(
  "questions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    menuType: text("menu_type").notNull(),
    questionText: text("question_text").notNull(),
    context: text("context").notNull().default(""),
    diagramData: jsonb("diagram_data"),
    options: jsonb("options").notNull(),
    correctAnswer: text("correct_answer").notNull(),
    correctReason: text("correct_reason").notNull(),
    explanation: text("explanation").notNull().default(""),
    orderNumber: integer("order_number").notNull().default(1),
    isActive: boolean("is_active").notNull().default(true),
  },
  (table) => [index("questions_menu_idx").on(table.menuType)],
);

export const studentAnswers = pgTable(
  "student_answers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => learningSessions.id, { onDelete: "cascade" }),
    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    selectedAnswer: text("selected_answer").notNull(),
    selectedReason: text("selected_reason").notNull(),
    isCorrect: boolean("is_correct").notNull().default(false),
    score: integer("score").notNull().default(0),
    answeredAt: timestamp("answered_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("answers_session_question_idx").on(table.sessionId, table.questionId),
  ],
);

export const studentReflections = pgTable(
  "student_reflections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => learningSessions.id, { onDelete: "cascade" }),
    feeling: text("feeling").notNull(),
    understanding: text("understanding").notNull(),
    favoriteMenu: text("favorite_menu").notNull(),
    learningReflection: text("learning_reflection").notNull().default(""),
    submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("reflections_session_idx").on(table.sessionId)],
);

export const teacherProfiles = pgTable(
  "teacher_profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    role: text("role").notNull().default("teacher"),
    passwordHash: text("password_hash").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("teacher_email_idx").on(table.email)],
);

export const learningMaterials = pgTable(
  "learning_materials",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    menuType: text("menu_type").notNull().default("materi"),
    title: text("title").notNull(),
    content: jsonb("content").notNull(),
    orderNumber: integer("order_number").notNull().default(1),
    isActive: boolean("is_active").notNull().default(true),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("materials_menu_idx").on(table.menuType)],
);

export type StudentRow = typeof students.$inferSelect;
export type SessionRow = typeof learningSessions.$inferSelect;
export type QuestionRow = typeof questions.$inferSelect;
export type AnswerRow = typeof studentAnswers.$inferSelect;
export type ReflectionRow = typeof studentReflections.$inferSelect;
export type TeacherRow = typeof teacherProfiles.$inferSelect;
export type MaterialRow = typeof learningMaterials.$inferSelect;
