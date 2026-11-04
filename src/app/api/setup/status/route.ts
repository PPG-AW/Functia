import { getStoreStatus, store } from "@/lib/store";
import type { Store } from "@/lib/store/types";

export const dynamic = "force-dynamic";

export type SetupCheck = { ok: boolean; count: number | null; error: string | null };
export type SetupStatusResponse = {
  verifiedAt: string;
  storage: Awaited<ReturnType<typeof getStoreStatus>>;
  checks: Record<string, SetupCheck>;
  allOperational: boolean;
};

/** Menyembunyikan nilai kunci bila pesan error Supabase memuatnya. */
function safe(message: string): string {
  return message
    .replace(/sb_secret_[A-Za-z0-9_\-]+/g, "[kunci-rahasia-disembunyikan]")
    .replace(/sb_publishable_[A-Za-z0-9_\-]+/g, "[kunci-publik-disembunyikan]")
    .replace(/eyJ[A-Za-z0-9_\-\.]+/g, "[token-disembunyikan]")
    .slice(0, 240);
}

async function probe(run: () => Promise<unknown[]>): Promise<SetupCheck> {
  try {
    const rows = await run();
    return { ok: true, count: Array.isArray(rows) ? rows.length : null, error: null };
  } catch (error) {
    return {
      ok: false,
      count: null,
      error: safe(error instanceof Error ? error.message : "Pemeriksaan gagal."),
    };
  }
}

export async function GET() {
  const storage = await getStoreStatus();

  let activeStore: Store | null = null;
  let storeError: string | null = null;
  try {
    activeStore = await store();
  } catch (error) {
    storeError = safe(error instanceof Error ? error.message : "Store tidak dapat diinisialisasi.");
  }

  const checks: Record<string, SetupCheck> = {};
  if (!activeStore) {
    for (const key of [
      "identitas_siswa",
      "sesi_pembelajaran",
      "jawaban_misi_dan_uji",
      "refleksi_siswa",
      "bank_soal",
      "materi",
      "portal_guru",
    ]) {
      checks[key] = { ok: false, count: null, error: storeError };
    }
  } else {
    const s = activeStore;
    checks.identitas_siswa = await probe(() => s.listStudents());
    checks.sesi_pembelajaran = await probe(() => s.listSessions());
    checks.jawaban_misi_dan_uji = await probe(() => s.listAllAnswers());
    checks.refleksi_siswa = await probe(() => s.listReflections());
    checks.bank_soal = await probe(() => s.listQuestions({ withKeys: true, includeInactive: true }));
    checks.materi = await probe(() => s.listMaterials({ includeInactive: true }));
    checks.portal_guru = await probe(async () => {
      await s.findTeacherByEmail("functia-probe@example.invalid");
      return [];
    });
  }

  const payload: SetupStatusResponse = {
    verifiedAt: new Date().toISOString(),
    storage,
    checks,
    allOperational: Object.values(checks).every((check) => check.ok) && storage.online,
  };

  return Response.json(payload, { headers: { "Cache-Control": "no-store" } });
}
