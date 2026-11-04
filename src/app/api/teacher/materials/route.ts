import { api, num, readJson, str } from "@/lib/api";
import { requireTeacher } from "@/lib/auth";
import { store } from "@/lib/store";
import type { LearningMaterial, MaterialContent } from "@/lib/store/types";
import { parseDiagram } from "../questions/route";

export const dynamic = "force-dynamic";

export function parseMaterialContent(value: unknown): MaterialContent {
  if (!value || typeof value !== "object") {
    throw Object.assign(new Error("Isi materi harus berupa objek JSON."), { status: 400 });
  }
  const raw = value as Record<string, unknown>;
  const content: MaterialContent = {};
  const textList = (key: string) => {
    if (raw[key] === undefined) return;
    if (!Array.isArray(raw[key])) throw Object.assign(new Error(`Field ${key} harus berupa daftar teks.`), { status: 400 });
    (content as Record<string, unknown>)[key] = (raw[key] as unknown[]).map((item) => String(item));
  };
  const text = (key: "intro" | "question" | "conclusion" | "image") => {
    if (raw[key] === undefined) return;
    content[key] = String(raw[key] ?? "").trim() || undefined;
  };

  text("intro");
  text("question");
  text("conclusion");
  text("image");
  textList("paragraphs");
  textList("bullets");

  if (raw.example !== undefined) {
    const ex = raw.example as { title?: unknown; items?: unknown };
    if (!ex || !Array.isArray(ex.items)) {
      throw Object.assign(new Error("Field example harus memiliki title dan items (daftar)."), { status: 400 });
    }
    content.example = { title: String(ex.title ?? "Contoh"), items: ex.items.map((i) => String(i)) };
  }
  if (raw.diagram !== undefined && raw.diagram !== null) content.diagram = parseDiagram(raw.diagram) ?? undefined;
  if (raw.diagrams !== undefined && raw.diagrams !== null) {
    if (!Array.isArray(raw.diagrams)) throw Object.assign(new Error("Field diagrams harus berupa daftar."), { status: 400 });
    content.diagrams = raw.diagrams.map((d) => parseDiagram(d)).filter(Boolean) as MaterialContent["diagrams"];
  }
  if (raw.cards !== undefined && raw.cards !== null) {
    if (!Array.isArray(raw.cards)) throw Object.assign(new Error("Field cards harus berupa daftar."), { status: 400 });
    content.cards = raw.cards.map((card) => {
      const c = card as { title?: unknown; text?: unknown; diagram?: unknown };
      return {
        title: String(c.title ?? ""),
        text: String(c.text ?? ""),
        diagram: c.diagram ? (parseDiagram(c.diagram) ?? undefined) : undefined,
      };
    });
  }
  if (raw.callout !== undefined && raw.callout !== null) {
    const c = raw.callout as { tone?: unknown; text?: unknown };
    const tone = c.tone === "success" || c.tone === "warning" ? c.tone : "info";
    content.callout = { tone, text: String(c.text ?? "") };
  }
  return content;
}

export async function GET() {
  return api(async () => {
    await requireTeacher();
    const s = await store();
    const materials = await s.listMaterials({ includeInactive: true });
    return { materials };
  });
}

export async function POST(request: Request) {
  return api(async () => {
    await requireTeacher();
    const body = readJson(await request.json().catch(() => ({})));
    const s = await store();
    const material = await s.createMaterial({
      menu_type: "materi",
      title: str(body.title, "Judul materi"),
      content: parseMaterialContent(body.content),
      order_number: num(body.order_number, "Urutan", 1, 999),
      is_active: body.is_active !== false,
    } as Omit<LearningMaterial, "id" | "updated_at">);
    return { material };
  });
}
