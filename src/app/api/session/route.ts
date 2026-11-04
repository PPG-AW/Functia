import { api, num, readJson, str } from "@/lib/api";
import {
  clearSignedCookie,
  getStudentContext,
  requireStudent,
  setSignedCookie,
  STUDENT_COOKIE,
} from "@/lib/auth";
import { computeProgress } from "@/lib/progress";
import { buildStudentContext, persistSession } from "@/lib/student-context";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";

const CLASS_OPTIONS = ["VIII-A", "VIII-B", "VIII-C", "VIII-D", "VIII-E", "VIII-F"];

export async function GET() {
  return api(async () => {
    const ctx = await getStudentContext();
    if (!ctx) return { authenticated: false as const };
    return { authenticated: true as const, ...(await buildStudentContext(ctx)) };
  });
}

export async function POST(request: Request) {
  return api(async () => {
    const body = readJson(await request.json().catch(() => ({})));
    const action = typeof body.action === "string" ? body.action : "start";
    const name = str(body.name, "Nama lengkap");
    const attendanceNumber = num(body.attendance_number, "Nomor absen", 1, 100);
    const classNameRaw = str(body.class_name, "Kelas");
    const className = classNameRaw.toUpperCase();
    if (className.length > 20) throw new Error("Nama kelas terlalu panjang.");

    const s = await store();
    const existing = await s.findStudent({
      name,
      attendance_number: attendanceNumber,
      class_name: className,
    });

    if (action === "check") {
      return {
        found: Boolean(existing),
        student: existing?.student ?? null,
        session: existing?.session ?? null,
        classOptions: CLASS_OPTIONS,
      };
    }

    const student = existing?.student ?? (await s.createStudent({
      name,
      attendance_number: attendanceNumber,
      class_name: className,
    }));

    const resume = action !== "restart";
    let session = resume && existing?.session ? existing.session : null;
    if (!session) session = await s.createSession(student.id);

    await setSignedCookie(STUDENT_COOKIE, { student_id: student.id, session_id: session.id });
    const ctx = { student, session };
    const payload = await buildStudentContext(ctx);
    await s.updateSession(session.id, { current_menu: "beranda" });

    return {
      authenticated: true as const,
      resumed: Boolean(resume && existing?.session),
      classOptions: CLASS_OPTIONS,
      ...payload,
      session: { ...session, current_menu: "beranda" },
    };
  });
}

export async function DELETE() {
  return api(async () => {
    await clearSignedCookie(STUDENT_COOKIE);
    return { loggedOut: true };
  });
}

export async function PATCH(request: Request) {
  return api(async () => {
    const ctx = await requireStudent();
    const body = readJson(await request.json().catch(() => ({})));
    const payload = await buildStudentContext(ctx);

    const menuState = { ...(ctx.session.menu_state ?? {}) };
    if (body.materiDone === true) menuState.materi = true;
    if (typeof body.materiSlide === "number") menuState.materiSlide = body.materiSlide;
    if (body.refleksiDone === true) menuState.refleksi = true;

    const next = {
      ...payload,
      materiDone: Boolean(menuState.materi),
      refleksiDone: Boolean(menuState.refleksi),
      materiSlide: menuState.materiSlide ?? payload.materiSlide,
      progress: computeProgress({
        menuState,
        misiAnswered: payload.misi.answered,
        misiTotal: payload.misi.total,
        ujiAnswered: payload.uji.answered,
        ujiTotal: payload.uji.total,
      }),
    };

    if (typeof body.current_menu === "string") ctx.session.current_menu = body.current_menu;
    const session = await persistSession({ ...ctx.session, menu_state: menuState }, next);

    return { authenticated: true as const, ...next, session };
  });
}
