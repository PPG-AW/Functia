import { requireTeacher } from "@/lib/auth";
import { buildRecap, toCsv } from "@/lib/recap";
import { store } from "@/lib/store";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireTeacher();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Tidak diizinkan.";
    return NextResponse.json({ ok: false, error: message }, { status: 401 });
  }

  const url = new URL(request.url);
  const kelas = url.searchParams.get("class") ?? "";
  const query = (url.searchParams.get("q") ?? "").trim().toLowerCase();

  const s = await store();
  const [students, sessions, answers, questions, reflections] = await Promise.all([
    s.listStudents(),
    s.listSessions(),
    s.listAllAnswers(),
    s.listQuestions({ withKeys: true, includeInactive: true }),
    s.listReflections(),
  ]);

  const recap = buildRecap({ students, sessions, answers, questions, reflections }).filter((row) => {
    const matchClass = !kelas || row.student.class_name === kelas;
    const matchQuery = !query || row.student.name.toLowerCase().includes(query);
    return matchClass && matchQuery;
  });

  const csv = toCsv(recap);
  const filename = `rekap-functia-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
