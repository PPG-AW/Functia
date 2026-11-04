import { api, num, readJson } from "@/lib/api";
import { requireTeacher } from "@/lib/auth";
import { store } from "@/lib/store";
import type { LearningMaterial, MaterialContent } from "@/lib/store/types";
import { parseMaterialContent } from "../route";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  return api(async () => {
    await requireTeacher();
    const { id } = await context.params;
    const body = readJson(await request.json().catch(() => ({})));
    const s = await store();
    const patch: Partial<Omit<LearningMaterial, "id" | "updated_at">> = {};
    if (body.title !== undefined) patch.title = String(body.title).trim();
    if (body.content !== undefined) patch.content = parseMaterialContent(body.content) as MaterialContent;
    if (body.order_number !== undefined) patch.order_number = num(body.order_number, "Urutan", 1, 999);
    if (body.is_active !== undefined) patch.is_active = body.is_active !== false && body.is_active !== "false";
    if (!patch.title) throw Object.assign(new Error("Judul materi tidak boleh kosong."), { status: 400 });

    const material = await s.updateMaterial(id, patch);
    if (!material) throw Object.assign(new Error("Materi tidak ditemukan."), { status: 404 });
    return { material };
  });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  return api(async () => {
    await requireTeacher();
    const { id } = await context.params;
    const s = await store();
    await s.deleteMaterial(id);
    return { deleted: id };
  });
}
