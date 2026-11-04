import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { serverEnv, serverEnvSource, type EnvSource } from "@/lib/server-env";
import { reviseQuestions } from "@/lib/question-revisions";
import { defaultMaterials, defaultQuestions } from "./seed";
import type {
  ArrowDiagram,
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
} from "./types";

/**
 * Store Supabase — HANYA sisi server (Route Handler / Server Component).
 * Modul ini ditandai `server-only`: kunci secret / service_role tidak mungkin
 * ikut ter-bundle ke JavaScript browser.
 *
 * Mendukung dua generasi kunci Supabase:
 *  - Baru      : SUPABASE_PUBLISHABLE_KEY (sb_publishable_…) + SUPABASE_SECRET_KEY (sb_secret_…)
 *  - Lama      : SUPABASE_ANON_KEY (JWT eyJ…) + SUPABASE_SERVICE_ROLE_KEY
 */
export type SupabaseKeyMode = "secret" | "publishable" | "none";

export type SupabaseConfig = {
  url: string | null;
  publishableKey: string | null;
  anonKey: string | null;
  secretKey: string | null;
  serviceKey: string | null;
  /** Kunci publik yang aman dipakai untuk koneksi (bukan kunci rahasia). */
  publicKey: string | null;
  /** Kunci rahasia server-side. Tidak pernah dikirim ke browser. */
  serverKey: string | null;
  /** Token gerbang RLS untuk mode publishable-only. */
  gateToken: string | null;
  mode: SupabaseKeyMode;
  configured: boolean;
  warnings: string[];
  /** Kategori sumber nilai (bukan nilainya), untuk diagnostik server. */
  sources: {
    url: EnvSource;
    publishableKey: EnvSource;
    secretKey: EnvSource;
    authSecret: EnvSource;
  };
  /** True bila ada indikasi konfigurasi Supabase, walau belum lengkap. */
  hasSupabaseHints: boolean;
  /** True bila berkas .env/.env.local terbaca sebagai fallback. */
  dotEnvUsed: boolean;
};

function first(...values: Array<string | null | undefined>): string | null {
  const found = values.find((value) => typeof value === "string" && value.trim().length > 0);
  return found ? found.trim() : null;
}

function jwtRole(key: string | null): string | null {
  if (!key || !key.startsWith("eyJ")) return null;
  const parts = key.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as { role?: string };
    return payload.role ?? null;
  } catch {
    return null;
  }
}

function isSecretShaped(key: string | null): boolean {
  if (!key) return false;
  return key.startsWith("sb_secret_") || jwtRole(key) === "service_role";
}

function isPublicShaped(key: string | null): boolean {
  if (!key) return false;
  return key.startsWith("sb_publishable_") || jwtRole(key) === "anon";
}

export function getSupabaseConfig(): SupabaseConfig {
  // Prioritas: process.env (standar Next.js) lalu `.env`/`.env.local` runtime.
  // Ini mengatasi runtime Preview yang tidak menyuntikkan Secrets ke process.env.
  const url = first(serverEnv("SUPABASE_URL"), serverEnv("NEXT_PUBLIC_SUPABASE_URL"));
  const publishableRaw = first(
    serverEnv("SUPABASE_PUBLISHABLE_KEY"),
    serverEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
  );
  const anonRaw = first(serverEnv("SUPABASE_ANON_KEY"), serverEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"));
  const secretRaw = serverEnv("SUPABASE_SECRET_KEY");
  const serviceRaw = serverEnv("SUPABASE_SERVICE_ROLE_KEY");
  const gateToken = serverEnv("FUNCTIA_GATE_TOKEN");
  const authSecret = serverEnv("AUTH_SECRET");

  const warnings: string[] = [];

  // Tolak kunci rahasia yang salah tempat pada variabel kunci publik.
  const publishableKey = isSecretShaped(publishableRaw) ? null : publishableRaw;
  const anonKey = isSecretShaped(anonRaw) ? null : anonRaw;
  if (isSecretShaped(publishableRaw) || isSecretShaped(anonRaw)) {
    warnings.push(
      "Kunci rahasia (secret/service_role) terdeteksi pada variabel kunci publik dan ditolak. Gunakan SUPABASE_SECRET_KEY untuk kunci rahasia.",
    );
  }
  if (serverEnv("NEXT_PUBLIC_SUPABASE_SECRET_KEY") || serverEnv("NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY")) {
    warnings.push(
      "TERDETEKSI kunci rahasia pada variabel NEXT_PUBLIC_*. Hapus variabel tersebut dan rotasi kunci di Supabase segera.",
    );
  }
  if (!authSecret) {
    warnings.push("Disarankan mengisi AUTH_SECRET agar cookie sesi guru tetap stabil setelah rotasi kunci.");
  }

  const publicKey = publishableKey ?? anonKey;
  const secretKey = isPublicShaped(secretRaw) ? null : secretRaw;
  const serviceKey = isPublicShaped(serviceRaw) ? null : serviceRaw;
  const serverKey = secretKey ?? serviceKey;
  // Secret key saja sudah cukup untuk arsitektur server-side FUNCTIA.
  const configured = Boolean(url && (publicKey || serverKey));
  const mode: SupabaseKeyMode = !configured ? "none" : serverKey ? "secret" : "publishable";

  if (mode === "publishable" && !gateToken) {
    warnings.push(
      "Mode publishable-only: jalankan supabase/gate.sql lalu isi FUNCTIA_GATE_TOKEN, atau tambahkan SUPABASE_SECRET_KEY (direkomendasikan).",
    );
  }
  if (mode === "publishable" && gateToken) {
    warnings.push(
      "Mode publishable-only aktif. Pastikan token FUNCTIA_GATE_TOKEN sama persis dengan token pada supabase/gate.sql.",
    );
  }

  const sources = {
    url: serverEnvSource("SUPABASE_URL") ?? serverEnvSource("NEXT_PUBLIC_SUPABASE_URL"),
    publishableKey:
      serverEnvSource("SUPABASE_PUBLISHABLE_KEY") ??
      serverEnvSource("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
    secretKey: serverEnvSource("SUPABASE_SECRET_KEY") ?? serverEnvSource("SUPABASE_SERVICE_ROLE_KEY"),
    authSecret: serverEnvSource("AUTH_SECRET"),
  };

  const hasSupabaseHints = Boolean(
    url || publishableRaw || anonRaw || secretRaw || serviceRaw || gateToken,
  );
  const dotEnvUsed = Object.values(sources).some((source) => source === "dotenv");

  return {
    url,
    publishableKey,
    anonKey,
    secretKey,
    serviceKey,
    publicKey,
    serverKey,
    gateToken,
    mode,
    configured,
    warnings,
    sources,
    hasSupabaseHints,
    dotEnvUsed,
  };
}

let client: SupabaseClient | null = null;
let seedDone = false;

function getClient(): SupabaseClient {
  const { url, publicKey, serverKey, gateToken, configured } = getSupabaseConfig();
  if (!configured || !url || (!publicKey && !serverKey)) {
    throw new Error(
      "Supabase belum dikonfigurasi. Isi SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY, atau SUPABASE_URL + SUPABASE_SECRET_KEY.",
    );
  }
  if (!client) {
    const headers: Record<string, string> = {};
    // Header ini hanya ditambahkan oleh server. Tidak pernah dikirim ke browser.
    if (gateToken) headers["x-functia-gate"] = gateToken;
    client = createClient(url, (serverKey ?? publicKey) as string, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers },
    });
  }
  return client;
}

function unwrap<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data as T;
}

type StudentRow = {
  id: string;
  name: string;
  attendance_number: number;
  class_name: string;
  created_at: string;
};
type SessionRow = {
  id: string;
  student_id: string;
  status: string;
  current_menu: string;
  progress: number;
  menu_state: MenuState | null;
  started_at: string;
  completed_at: string | null;
};
type QuestionRow = {
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
type AnswerRow = StudentAnswer;
type ReflectionRow = StudentReflection;
type MaterialRow = {
  id: string;
  menu_type: string;
  title: string;
  content: MaterialContent;
  order_number: number;
  is_active: boolean;
  updated_at: string;
};

const toQuestion = (row: QuestionRow): Question => ({
  id: row.id,
  menu_type: row.menu_type,
  question_text: row.question_text,
  context: row.context ?? "",
  diagram_data: row.diagram_data ?? null,
  options: row.options,
  correct_answer: row.correct_answer,
  correct_reason: row.correct_reason,
  explanation: row.explanation ?? "",
  order_number: row.order_number,
  is_active: row.is_active,
});

const toSession = (row: SessionRow): LearningSession => ({
  id: row.id,
  student_id: row.student_id,
  status: (row.status as LearningSession["status"]) ?? "aktif",
  current_menu: row.current_menu ?? "beranda",
  progress: row.progress ?? 0,
  menu_state: row.menu_state ?? {},
  started_at: row.started_at,
  completed_at: row.completed_at ?? null,
});

export class SupabaseStore implements Store {
  readonly provider = "supabase" as const;

  private get db() {
    return getClient();
  }

  async ping(): Promise<boolean> {
    try {
      const { error } = await this.db.from("questions").select("id", { count: "exact", head: true });
      return !error;
    } catch {
      return false;
    }
  }

  async ensureSeed(): Promise<void> {
    if (seedDone) return;
    seedDone = true;
    const { count: qCount } = await this.db.from("questions").select("id", { count: "exact", head: true });
    if (!qCount) await this.db.from("questions").insert(defaultQuestions());
    const { count: mCount } = await this.db
      .from("learning_materials")
      .select("id", { count: "exact", head: true });
    if (!mCount) await this.db.from("learning_materials").insert(defaultMaterials());
  }

  async findStudent(input: { name: string; attendance_number: number; class_name: string }) {
    const rows = unwrap<StudentRow[]>(
      await this.db
        .from("students")
        .select("*")
        .ilike("name", input.name.trim())
        .eq("attendance_number", input.attendance_number)
        .eq("class_name", input.class_name.trim())
        .limit(1),
    );
    const student = rows[0];
    if (!student) return null;
    const sessions = unwrap<SessionRow[]>(
      await this.db
        .from("learning_sessions")
        .select("*")
        .eq("student_id", student.id)
        .order("started_at", { ascending: false })
        .limit(1),
    );
    return { student, session: sessions[0] ? toSession(sessions[0]) : null };
  }

  async createStudent(input: { name: string; attendance_number: number; class_name: string }) {
    const rows = unwrap<StudentRow[]>(
      await this.db
        .from("students")
        .insert({
          id: crypto.randomUUID(),
          name: input.name.trim(),
          attendance_number: input.attendance_number,
          class_name: input.class_name.trim(),
        })
        .select("*"),
    );
    return rows[0];
  }

  async createSession(studentId: string) {
    const rows = unwrap<SessionRow[]>(
      await this.db
        .from("learning_sessions")
        .insert({
          id: crypto.randomUUID(),
          student_id: studentId,
          status: "aktif",
          current_menu: "beranda",
          progress: 0,
          menu_state: {},
        })
        .select("*"),
    );
    return toSession(rows[0]);
  }

  async getSession(id: string) {
    const rows = unwrap<SessionRow[]>(await this.db.from("learning_sessions").select("*").eq("id", id).limit(1));
    return rows[0] ? toSession(rows[0]) : null;
  }

  async updateSession(id: string, patch: Partial<LearningSession>) {
    const values: Record<string, unknown> = {};
    if (patch.status !== undefined) values.status = patch.status;
    if (patch.current_menu !== undefined) values.current_menu = patch.current_menu;
    if (patch.progress !== undefined) values.progress = patch.progress;
    if (patch.menu_state !== undefined) values.menu_state = patch.menu_state;
    if (patch.completed_at !== undefined) values.completed_at = patch.completed_at;
    if (!Object.keys(values).length) return;
    const { error } = await this.db.from("learning_sessions").update(values).eq("id", id);
    if (error) throw new Error(error.message);
  }

  async listQuestions(opts: { menuType?: MenuType; includeInactive?: boolean; withKeys?: boolean }) {
    let query = this.db.from("questions").select("*").order("menu_type").order("order_number");
    if (opts.menuType) query = query.eq("menu_type", opts.menuType);
    if (!opts.includeInactive) query = query.eq("is_active", true);
    const rows = unwrap<QuestionRow[]>(await query);
    const mapped = reviseQuestions(rows.map(toQuestion));
    if (opts.withKeys) return mapped;
    return mapped.map((q) => ({ ...q, correct_answer: "", correct_reason: "", explanation: "" }));
  }

  async createQuestion(input: Omit<Question, "id">) {
    const rows = unwrap<QuestionRow[]>(
      await this.db.from("questions").insert({ ...input, id: crypto.randomUUID() }).select("*"),
    );
    return toQuestion(rows[0]);
  }

  async updateQuestion(id: string, patch: Partial<Omit<Question, "id">>) {
    const rows = unwrap<QuestionRow[]>(await this.db.from("questions").update(patch).eq("id", id).select("*"));
    return rows[0] ? reviseQuestions([toQuestion(rows[0])])[0] : null;
  }

  async deleteQuestion(id: string) {
    const { error } = await this.db.from("questions").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }

  async listMaterials(opts?: { includeInactive?: boolean }) {
    let query = this.db.from("learning_materials").select("*").order("order_number");
    if (!opts?.includeInactive) query = query.eq("is_active", true);
    return unwrap<LearningMaterial[]>(await query);
  }

  async createMaterial(input: Omit<LearningMaterial, "id" | "updated_at">) {
    const rows = unwrap<MaterialRow[]>(
      await this.db
        .from("learning_materials")
        .insert({ ...input, id: crypto.randomUUID(), updated_at: new Date().toISOString() })
        .select("*"),
    );
    return rows[0];
  }

  async updateMaterial(id: string, patch: Partial<Omit<LearningMaterial, "id" | "updated_at">>) {
    const rows = unwrap<MaterialRow[]>(
      await this.db
        .from("learning_materials")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select("*"),
    );
    return rows[0] ?? null;
  }

  async deleteMaterial(id: string) {
    const { error } = await this.db.from("learning_materials").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }

  async saveAnswer(input: {
    session_id: string;
    question_id: string;
    selected_answer: string;
    selected_reason: string;
    is_correct: boolean;
    score: number;
  }) {
    const rows = unwrap<AnswerRow[]>(
      await this.db
        .from("student_answers")
        .upsert({ ...input, answered_at: new Date().toISOString() }, { onConflict: "session_id,question_id" })
        .select("*"),
    );
    return rows[0];
  }

  async listAnswers(sessionId: string) {
    return unwrap<AnswerRow[]>(
      await this.db
        .from("student_answers")
        .select("*")
        .eq("session_id", sessionId)
        .order("answered_at", { ascending: true }),
    );
  }

  async listAllAnswers() {
    return unwrap<AnswerRow[]>(await this.db.from("student_answers").select("*"));
  }

  async getReflection(sessionId: string) {
    const rows = unwrap<ReflectionRow[]>(
      await this.db.from("student_reflections").select("*").eq("session_id", sessionId).limit(1),
    );
    return rows[0] ?? null;
  }

  async saveReflection(input: Omit<StudentReflection, "id" | "submitted_at">) {
    const rows = unwrap<ReflectionRow[]>(
      await this.db
        .from("student_reflections")
        .upsert(
          { ...input, id: crypto.randomUUID(), submitted_at: new Date().toISOString() },
          { onConflict: "session_id" },
        )
        .select("*"),
    );
    return rows[0];
  }

  async listReflections() {
    return unwrap<ReflectionRow[]>(
      await this.db.from("student_reflections").select("*").order("submitted_at", { ascending: false }),
    );
  }

  async listStudents() {
    return unwrap<Student[]>(
      await this.db.from("students").select("*").order("class_name").order("attendance_number"),
    );
  }

  async listSessions() {
    const rows = unwrap<SessionRow[]>(
      await this.db.from("learning_sessions").select("*").order("started_at", { ascending: false }),
    );
    return rows.map(toSession);
  }

  async findTeacherByEmail(email: string) {
    const rows = unwrap<Array<{ id: string; name: string; email: string; role: string; password_hash: string }>>(
      await this.db.from("teacher_profiles").select("*").ilike("email", email.trim()).limit(1),
    );
    return rows[0] ?? null;
  }

  async createTeacher(input: { name: string; email: string; role: string; password_hash: string }) {
    const { error } = await this.db
      .from("teacher_profiles")
      .insert({ ...input, id: crypto.randomUUID(), email: input.email.trim().toLowerCase() });
    if (error && !/duplicate/i.test(error.message)) throw new Error(error.message);
  }
}

export type { Student };
