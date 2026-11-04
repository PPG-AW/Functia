import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { serverEnv } from "@/lib/server-env";
import { store } from "./store";
import type { LearningSession, Student } from "./store/types";

export const STUDENT_COOKIE = "functia_student";
export const TEACHER_COOKIE = "functia_teacher";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 hari

function secret(): string {
  // AUTH_SECRET adalah pilihan utama: cookie guru tidak berubah saat kunci Supabase dirotasi.
  // Memakai resolver server yang sama dengan konfigurasi Supabase agar nilai
  // terbaca baik dari process.env maupun dari berkas .env runtime.
  return (
    serverEnv("AUTH_SECRET") ??
    serverEnv("SUPABASE_SECRET_KEY") ??
    serverEnv("SUPABASE_SERVICE_ROLE_KEY") ??
    serverEnv("SUPABASE_PUBLISHABLE_KEY") ??
    serverEnv("SUPABASE_ANON_KEY") ??
    "functia-dev-secret-ubah-pada-produksi"
  );
}

/* ---------------------------------- password --------------------------------- */

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}

/* ----------------------------------- token ----------------------------------- */

function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export function createToken(payload: Record<string, unknown>): string {
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${body}.${sign(body)}`;
}

export function readToken<T extends Record<string, unknown>>(token: string | undefined): T | null {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = sign(body);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as T;
    if (typeof parsed.exp === "number" && Date.now() > parsed.exp) return null;
    return parsed;
  } catch {
    return null;
  }
}

/* ---------------------------------- cookies ---------------------------------- */

export async function setSignedCookie(name: string, payload: Record<string, unknown>) {
  const jar = await cookies();
  jar.set(name, createToken({ ...payload, exp: Date.now() + COOKIE_MAX_AGE * 1000 }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function clearSignedCookie(name: string) {
  const jar = await cookies();
  jar.set(name, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
}

/* ---------------------------------- student ---------------------------------- */

export type StudentContext = { student: Student; session: LearningSession };

export async function getStudentContext(): Promise<StudentContext | null> {
  const jar = await cookies();
  const token = readToken<{ student_id: string; session_id: string }>(jar.get(STUDENT_COOKIE)?.value);
  if (!token?.student_id || !token?.session_id) return null;
  const s = await store();
  const session = await s.getSession(token.session_id);
  if (!session || session.student_id !== token.student_id) return null;
  const students = await s.listStudents();
  const student = students.find((row) => row.id === token.student_id);
  if (!student) return null;
  return { student, session };
}

export async function requireStudent(): Promise<StudentContext> {
  const ctx = await getStudentContext();
  if (!ctx) throw new AuthError("Sesi siswa tidak ditemukan. Silakan masuk kembali.");
  return ctx;
}

/* ---------------------------------- teacher ---------------------------------- */

export type TeacherContext = { id: string; name: string; email: string; role: string };

export class AuthError extends Error {
  status = 401;
  constructor(message: string) {
    super(message);
  }
}

const DEFAULT_TEACHER = {
  name: "Guru FUNCTIA",
  email: serverEnv("TEACHER_DEFAULT_EMAIL") ?? "guru@functia.id",
  password: serverEnv("TEACHER_DEFAULT_PASSWORD") ?? "functia2026",
};

export async function ensureTeacherSeeded() {
  const s = await store();
  const existing = await s.findTeacherByEmail(DEFAULT_TEACHER.email);
  if (!existing) {
    await s.createTeacher({
      name: DEFAULT_TEACHER.name,
      email: DEFAULT_TEACHER.email,
      role: "teacher",
      password_hash: hashPassword(DEFAULT_TEACHER.password),
    });
  }
}

export async function authenticateTeacher(email: string, password: string): Promise<TeacherContext> {
  await ensureTeacherSeeded();
  const s = await store();
  const teacher = await s.findTeacherByEmail(email);
  if (!teacher || !teacher.password_hash) {
    throw new AuthError("Email atau kata sandi salah.");
  }
  if (!verifyPassword(password, teacher.password_hash)) {
    throw new AuthError("Email atau kata sandi salah.");
  }
  return { id: teacher.id, name: teacher.name, email: teacher.email, role: teacher.role };
}

export async function getTeacherContext(): Promise<TeacherContext | null> {
  const jar = await cookies();
  const token = readToken<{ id: string; name: string; email: string; role: string }>(
    jar.get(TEACHER_COOKIE)?.value,
  );
  if (!token?.id) return null;
  return { id: token.id, name: token.name, email: token.email, role: token.role };
}

export async function requireTeacher(): Promise<TeacherContext> {
  const ctx = await getTeacherContext();
  if (!ctx) throw new AuthError("Anda harus masuk sebagai guru untuk mengakses halaman ini.");
  return ctx;
}

export const teacherCredentialsHint = {
  email: DEFAULT_TEACHER.email,
  password: DEFAULT_TEACHER.password,
  fromEnv: Boolean(serverEnv("TEACHER_DEFAULT_EMAIL") || serverEnv("TEACHER_DEFAULT_PASSWORD")),
};
