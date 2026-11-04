import { api, readJson } from "@/lib/api";
import { requireTeacher } from "@/lib/auth";
import { store } from "@/lib/store";
import { parseQuestionInput } from "../route";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  return api(async () => {
    await requireTeacher();
    const { id } = await context.params;
    const body = readJson(await request.json().catch(() => ({})));
    const patch = parseQuestionInput(body, true);
    const s = await store();

    // Validasi kunci terhadap pilihan yang tersimpan bila hanya sebagian data dikirim.
    if (patch.correct_answer || patch.correct_reason) {
      const existing = (await s.listQuestions({ withKeys: true, includeInactive: true })).find((q) => q.id === id);
      if (!existing) throw Object.assign(new Error("Soal tidak ditemukan."), { status: 404 });
      const options = patch.options ?? existing.options;
      if (patch.correct_answer && !options.answers.some((a) => a.key === patch.correct_answer)) {
        throw Object.assign(new Error("Kunci jawaban tidak ada dalam daftar pilihan."), { status: 400 });
      }
      if (patch.correct_reason && !options.reasons.some((r) => r.key === patch.correct_reason)) {
        throw Object.assign(new Error("Kunci alasan tidak ada dalam daftar pilihan."), { status: 400 });
      }
    }

    const question = await s.updateQuestion(id, patch);
    if (!question) throw Object.assign(new Error("Soal tidak ditemukan."), { status: 404 });
    return { question };
  });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  return api(async () => {
    await requireTeacher();
    const { id } = await context.params;
    const s = await store();
    await s.deleteQuestion(id);
    return { deleted: id };
  });
}
