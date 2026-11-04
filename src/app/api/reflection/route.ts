import { api, readJson, str } from "@/lib/api";
import { getStudentContext, requireStudent } from "@/lib/auth";
import { buildStudentContext, persistSession } from "@/lib/student-context";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";

export const FEELINGS = ["Sangat senang", "Senang", "Biasa saja", "Masih merasa kesulitan"];
export const UNDERSTANDINGS = ["Sangat memahami", "Cukup memahami", "Masih perlu belajar lagi", "Belum memahami"];
export const FAVORITES = ["Pahami Konsep", "Misi Penyelidikan", "Uji Pemahaman"];

export async function GET() {
  return api(async () => {
    const ctx = await getStudentContext();
    if (!ctx) return { authenticated: false as const, reflection: null };
    const s = await store();
    const reflection = await s.getReflection(ctx.session.id);
    return { authenticated: true as const, reflection };
  });
}

export async function POST(request: Request) {
  return api(async () => {
    const ctx = await requireStudent();
    const body = readJson(await request.json().catch(() => ({})));
    const feeling = str(body.feeling, "Perasaan");
    const understanding = str(body.understanding, "Pemahaman");
    const favoriteMenu = str(body.favorite_menu, "Menu favorit");
    const learningReflection = str(body.learning_reflection, "Hal baru yang dipelajari");

    if (!FEELINGS.includes(feeling)) throw Object.assign(new Error("Pilihan perasaan tidak valid."), { status: 400 });
    if (!UNDERSTANDINGS.includes(understanding))
      throw Object.assign(new Error("Pilihan pemahaman tidak valid."), { status: 400 });
    if (!FAVORITES.includes(favoriteMenu))
      throw Object.assign(new Error("Pilihan menu favorit tidak valid."), { status: 400 });
    if (learningReflection.length < 5)
      throw Object.assign(new Error("Tuliskan minimal satu kalimat tentang hal baru yang kamu pelajari."), {
        status: 400,
      });

    const s = await store();
    const reflection = await s.saveReflection({
      session_id: ctx.session.id,
      feeling,
      understanding,
      favorite_menu: favoriteMenu,
      learning_reflection: learningReflection.slice(0, 1000),
    });

    const payload = await buildStudentContext(ctx);
    const session = await persistSession(
      { ...ctx.session, current_menu: "refleksi", menu_state: { ...ctx.session.menu_state, refleksi: true } },
      { ...payload, refleksiDone: true },
    );

    return {
      reflection,
      progress: session.progress,
      status: session.status,
      message:
        "Terima kasih sudah belajar hari ini! Terus semangat menjelajahi dunia matematika. Kamu hebat!",
    };
  });
}
