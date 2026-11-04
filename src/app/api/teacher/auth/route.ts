import { api, readJson, str } from "@/lib/api";
import {
  authenticateTeacher,
  clearSignedCookie,
  ensureTeacherSeeded,
  getTeacherContext,
  setSignedCookie,
  TEACHER_COOKIE,
} from "@/lib/auth";
import { getStoreStatus } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return api(async () => {
    const teacher = await getTeacherContext();
    const status = await getStoreStatus();
    // Kredensial guru tidak pernah dikirim ke klien. Informasi akun bawaan
    // sengaja tidak disertakan dalam respons publik ini.
    return { teacher, storage: status };
  });
}

export async function POST(request: Request) {
  const body = readJson(await request.json().catch(() => ({})));
  const action = body.action === "logout" ? "logout" : "login";

  if (action === "logout") {
    await clearSignedCookie(TEACHER_COOKIE);
    return api(async () => ({ loggedOut: true }));
  }

  const email = str(body.email, "Email");
  const password = typeof body.password === "string" ? body.password : "";
  if (!password) {
    return api(async () => {
      throw Object.assign(new Error("Kata sandi wajib diisi."), { status: 400 });
    });
  }
  return api(async () => {
    await ensureTeacherSeeded();
    const teacher = await authenticateTeacher(email, password);
    await setSignedCookie(TEACHER_COOKIE, teacher);
    return { teacher };
  });
}
