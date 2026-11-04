import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { reviseQuestions } from "@/lib/question-revisions";
import {
  learningMaterials,
  learningSessions,
  questions,
  studentAnswers,
  studentReflections,
  students,
  teacherProfiles,
} from "@/db/schema";
import { defaultMaterials, defaultQuestions } from "./seed";
import type {
  LearningMaterial,
  LearningSession,
  MaterialContent,
  MenuState,
  MenuType,
  Question,
  QuestionOptions,
  Store,
  Student,
  StudentAnswer,
  StudentReflection,
  TeacherProfile,
  ArrowDiagram,
} from "./types";

const iso = (value: Date | string | null | undefined): string =>
  value ? new Date(value).toISOString() : new Date().toISOString();

function mapStudent(row: typeof students.$inferSelect): Student {
  return {
    id: row.id,
    name: row.name,
    attendance_number: row.attendanceNumber,
    class_name: row.className,
    created_at: iso(row.createdAt),
  };
}

function mapSession(row: typeof learningSessions.$inferSelect): LearningSession {
  return {
    id: row.id,
    student_id: row.studentId,
    status: row.status as LearningSession["status"],
    current_menu: row.currentMenu,
    progress: row.progress,
    menu_state: (row.menuState ?? {}) as MenuState,
    started_at: iso(row.startedAt),
    completed_at: row.completedAt ? iso(row.completedAt) : null,
  };
}

function mapQuestion(row: typeof questions.$inferSelect): Question {
  return {
    id: row.id,
    menu_type: row.menuType as MenuType,
    question_text: row.questionText,
    context: row.context,
    diagram_data: (row.diagramData as ArrowDiagram | null) ?? null,
    options: row.options as QuestionOptions,
    correct_answer: row.correctAnswer,
    correct_reason: row.correctReason,
    explanation: row.explanation,
    order_number: row.orderNumber,
    is_active: row.isActive,
  };
}

function mapAnswer(row: typeof studentAnswers.$inferSelect): StudentAnswer {
  return {
    id: row.id,
    session_id: row.sessionId,
    question_id: row.questionId,
    selected_answer: row.selectedAnswer,
    selected_reason: row.selectedReason,
    is_correct: row.isCorrect,
    score: row.score,
    answered_at: iso(row.answeredAt),
  };
}

function mapReflection(row: typeof studentReflections.$inferSelect): StudentReflection {
  return {
    id: row.id,
    session_id: row.sessionId,
    feeling: row.feeling,
    understanding: row.understanding,
    favorite_menu: row.favoriteMenu,
    learning_reflection: row.learningReflection,
    submitted_at: iso(row.submittedAt),
  };
}

function mapMaterial(row: typeof learningMaterials.$inferSelect): LearningMaterial {
  return {
    id: row.id,
    menu_type: row.menuType,
    title: row.title,
    content: row.content as MaterialContent,
    order_number: row.orderNumber,
    is_active: row.isActive,
    updated_at: iso(row.updatedAt),
  };
}

let seedDone = false;

export class PostgresStore implements Store {
  readonly provider = "postgres" as const;

  async ping(): Promise<boolean> {
    try {
      await db.execute(sql`select 1`);
      return true;
    } catch {
      return false;
    }
  }

  async ensureSeed(): Promise<void> {
    if (seedDone) return;
    seedDone = true;

    const [qCount] = await db.select({ value: sql<number>`count(*)::int` }).from(questions);
    if ((qCount?.value ?? 0) === 0) {
      const rows = defaultQuestions();
      await db.insert(questions).values(
        rows.map((row) => ({
          menuType: row.menu_type,
          questionText: row.question_text,
          context: row.context,
          diagramData: row.diagram_data,
          options: row.options,
          correctAnswer: row.correct_answer,
          correctReason: row.correct_reason,
          explanation: row.explanation,
          orderNumber: row.order_number,
          isActive: row.is_active,
        })),
      );
    }

    const [mCount] = await db.select({ value: sql<number>`count(*)::int` }).from(learningMaterials);
    if ((mCount?.value ?? 0) === 0) {
      const rows = defaultMaterials();
      await db.insert(learningMaterials).values(
        rows.map((row) => ({
          menuType: row.menu_type,
          title: row.title,
          content: row.content,
          orderNumber: row.order_number,
          isActive: row.is_active,
        })),
      );
    }
  }

  async findStudent(input: { name: string; attendance_number: number; class_name: string }) {
    const name = input.name.trim().toLowerCase();
    const rows = await db
      .select()
      .from(students)
      .where(
        and(
          sql`lower(${students.name}) = ${name}`,
          eq(students.attendanceNumber, input.attendance_number),
          eq(students.className, input.class_name),
        ),
      )
      .limit(1);
    const studentRow = rows[0];
    if (!studentRow) return null;
    const sessions = await db
      .select()
      .from(learningSessions)
      .where(eq(learningSessions.studentId, studentRow.id))
      .orderBy(desc(learningSessions.startedAt))
      .limit(1);
    return {
      student: mapStudent(studentRow),
      session: sessions[0] ? mapSession(sessions[0]) : null,
    };
  }

  async createStudent(input: { name: string; attendance_number: number; class_name: string }) {
    const [row] = await db
      .insert(students)
      .values({
        name: input.name.trim(),
        attendanceNumber: input.attendance_number,
        className: input.class_name.trim(),
      })
      .returning();
    return mapStudent(row);
  }

  async createSession(studentId: string) {
    const [row] = await db
      .insert(learningSessions)
      .values({ studentId, status: "aktif", currentMenu: "beranda", progress: 0, menuState: {} })
      .returning();
    return mapSession(row);
  }

  async getSession(id: string) {
    const rows = await db.select().from(learningSessions).where(eq(learningSessions.id, id)).limit(1);
    return rows[0] ? mapSession(rows[0]) : null;
  }

  async updateSession(id: string, patch: Partial<LearningSession>) {
    const values: Record<string, unknown> = {};
    if (patch.status !== undefined) values.status = patch.status;
    if (patch.current_menu !== undefined) values.currentMenu = patch.current_menu;
    if (patch.progress !== undefined) values.progress = patch.progress;
    if (patch.menu_state !== undefined) values.menuState = patch.menu_state;
    if (patch.completed_at !== undefined) values.completedAt = patch.completed_at ? new Date(patch.completed_at) : null;
    if (Object.keys(values).length === 0) return;
    await db.update(learningSessions).set(values).where(eq(learningSessions.id, id));
  }

  async listQuestions(opts: { menuType?: MenuType; includeInactive?: boolean; withKeys?: boolean }) {
    const conditions = [];
    if (opts.menuType) conditions.push(eq(questions.menuType, opts.menuType));
    if (!opts.includeInactive) conditions.push(eq(questions.isActive, true));
    const rows = await db
      .select()
      .from(questions)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(asc(questions.menuType), asc(questions.orderNumber));
    const mapped = reviseQuestions(rows.map(mapQuestion));
    if (opts.withKeys) return mapped;
    return mapped.map(({ correct_answer, correct_reason, explanation, ...rest }) => ({
      ...rest,
      correct_answer: "",
      correct_reason: "",
      explanation: "",
    })) as Question[];
  }

  async createQuestion(input: Omit<Question, "id">) {
    const [row] = await db
      .insert(questions)
      .values({
        menuType: input.menu_type,
        questionText: input.question_text,
        context: input.context,
        diagramData: input.diagram_data,
        options: input.options,
        correctAnswer: input.correct_answer,
        correctReason: input.correct_reason,
        explanation: input.explanation,
        orderNumber: input.order_number,
        isActive: input.is_active,
      })
      .returning();
    return mapQuestion(row);
  }

  async updateQuestion(id: string, patch: Partial<Omit<Question, "id">>) {
    const values: Record<string, unknown> = {};
    if (patch.menu_type !== undefined) values.menuType = patch.menu_type;
    if (patch.question_text !== undefined) values.questionText = patch.question_text;
    if (patch.context !== undefined) values.context = patch.context;
    if (patch.diagram_data !== undefined) values.diagramData = patch.diagram_data;
    if (patch.options !== undefined) values.options = patch.options;
    if (patch.correct_answer !== undefined) values.correctAnswer = patch.correct_answer;
    if (patch.correct_reason !== undefined) values.correctReason = patch.correct_reason;
    if (patch.explanation !== undefined) values.explanation = patch.explanation;
    if (patch.order_number !== undefined) values.orderNumber = patch.order_number;
    if (patch.is_active !== undefined) values.isActive = patch.is_active;
    if (!Object.keys(values).length) {
      const rows = await db.select().from(questions).where(eq(questions.id, id)).limit(1);
      return rows[0] ? reviseQuestions([mapQuestion(rows[0])])[0] : null;
    }
    const rows = await db.update(questions).set(values).where(eq(questions.id, id)).returning();
    return rows[0] ? reviseQuestions([mapQuestion(rows[0])])[0] : null;
  }

  async deleteQuestion(id: string) {
    await db.delete(questions).where(eq(questions.id, id));
  }

  async listMaterials(opts?: { includeInactive?: boolean }) {
    const rows = await db
      .select()
      .from(learningMaterials)
      .where(opts?.includeInactive ? undefined : eq(learningMaterials.isActive, true))
      .orderBy(asc(learningMaterials.orderNumber));
    return rows.map(mapMaterial);
  }

  async createMaterial(input: Omit<LearningMaterial, "id" | "updated_at">) {
    const [row] = await db
      .insert(learningMaterials)
      .values({
        menuType: input.menu_type,
        title: input.title,
        content: input.content,
        orderNumber: input.order_number,
        isActive: input.is_active,
      })
      .returning();
    return mapMaterial(row);
  }

  async updateMaterial(id: string, patch: Partial<Omit<LearningMaterial, "id" | "updated_at">>) {
    const values: Record<string, unknown> = { updatedAt: new Date() };
    if (patch.menu_type !== undefined) values.menuType = patch.menu_type;
    if (patch.title !== undefined) values.title = patch.title;
    if (patch.content !== undefined) values.content = patch.content;
    if (patch.order_number !== undefined) values.orderNumber = patch.order_number;
    if (patch.is_active !== undefined) values.isActive = patch.is_active;
    const rows = await db
      .update(learningMaterials)
      .set(values)
      .where(eq(learningMaterials.id, id))
      .returning();
    return rows[0] ? mapMaterial(rows[0]) : null;
  }

  async deleteMaterial(id: string) {
    await db.delete(learningMaterials).where(eq(learningMaterials.id, id));
  }

  async saveAnswer(input: {
    session_id: string;
    question_id: string;
    selected_answer: string;
    selected_reason: string;
    is_correct: boolean;
    score: number;
  }) {
    const [row] = await db
      .insert(studentAnswers)
      .values({
        sessionId: input.session_id,
        questionId: input.question_id,
        selectedAnswer: input.selected_answer,
        selectedReason: input.selected_reason,
        isCorrect: input.is_correct,
        score: input.score,
        answeredAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [studentAnswers.sessionId, studentAnswers.questionId],
        set: {
          selectedAnswer: input.selected_answer,
          selectedReason: input.selected_reason,
          isCorrect: input.is_correct,
          score: input.score,
          answeredAt: new Date(),
        },
      })
      .returning();
    return mapAnswer(row);
  }

  async listAnswers(sessionId: string) {
    const rows = await db
      .select()
      .from(studentAnswers)
      .where(eq(studentAnswers.sessionId, sessionId))
      .orderBy(asc(studentAnswers.answeredAt));
    return rows.map(mapAnswer);
  }

  async listAllAnswers() {
    const rows = await db.select().from(studentAnswers).orderBy(asc(studentAnswers.answeredAt));
    return rows.map(mapAnswer);
  }

  async getReflection(sessionId: string) {
    const rows = await db
      .select()
      .from(studentReflections)
      .where(eq(studentReflections.sessionId, sessionId))
      .limit(1);
    return rows[0] ? mapReflection(rows[0]) : null;
  }

  async saveReflection(input: Omit<StudentReflection, "id" | "submitted_at">) {
    const [row] = await db
      .insert(studentReflections)
      .values({
        sessionId: input.session_id,
        feeling: input.feeling,
        understanding: input.understanding,
        favoriteMenu: input.favorite_menu,
        learningReflection: input.learning_reflection,
        submittedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: studentReflections.sessionId,
        set: {
          feeling: input.feeling,
          understanding: input.understanding,
          favoriteMenu: input.favorite_menu,
          learningReflection: input.learning_reflection,
          submittedAt: new Date(),
        },
      })
      .returning();
    return mapReflection(row);
  }

  async listReflections() {
    const rows = await db.select().from(studentReflections).orderBy(desc(studentReflections.submittedAt));
    return rows.map(mapReflection);
  }

  async listStudents() {
    const rows = await db
      .select()
      .from(students)
      .orderBy(asc(students.className), asc(students.attendanceNumber));
    return rows.map(mapStudent);
  }

  async listSessions() {
    const rows = await db.select().from(learningSessions).orderBy(desc(learningSessions.startedAt));
    return rows.map(mapSession);
  }

  async findTeacherByEmail(email: string) {
    const rows = await db
      .select()
      .from(teacherProfiles)
      .where(sql`lower(${teacherProfiles.email}) = ${email.trim().toLowerCase()}`)
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    const profile: TeacherProfile = { id: row.id, name: row.name, email: row.email, role: row.role };
    return { ...profile, password_hash: row.passwordHash };
  }

  async createTeacher(input: { name: string; email: string; role: string; password_hash: string }) {
    await db
      .insert(teacherProfiles)
      .values({
        name: input.name,
        email: input.email.trim().toLowerCase(),
        role: input.role,
        passwordHash: input.password_hash,
      })
      .onConflictDoNothing();
  }
}
