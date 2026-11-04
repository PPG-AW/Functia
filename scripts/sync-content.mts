/**
 * Sinkronisasi KONTEN (bukan skema) FUNCTIA ke provider database aktif.
 *
 * - Hanya UPDATE baris yang sudah ada (ID dipertahankan agar FK student_answers aman)
 *   dan INSERT bagian/soal baru. TIDAK ADA DELETE, TIDAK ADA DDL.
 * - Tidak menyentuh students, learning_sessions, student_answers,
 *   student_reflections, teacher_profiles.
 * - Dijalankan manual: node --experimental-strip-types scripts/sync-content.mts
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { defaultMaterials, defaultQuestions } from "../src/lib/store/seed.ts";

function readEnv(): Record<string, string> {
  const out: Record<string, string> = { ...process.env } as Record<string, string>;
  for (const file of [".env.local", ".env"]) {
    try {
      for (const raw of readFileSync(file, "utf8").split(/\r?\n/)) {
        const line = raw.trim();
        if (!line || line.startsWith("#")) continue;
        const i = line.indexOf("=");
        if (i < 1) continue;
        const key = line.slice(0, i).trim();
        let value = line.slice(i + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        if (key && out[key] === undefined) out[key] = value;
      }
    } catch {
      /* abaikan */
    }
  }
  return out;
}

const env = readEnv();
const url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  env.SUPABASE_SECRET_KEY ||
  env.SUPABASE_SERVICE_ROLE_KEY ||
  env.SUPABASE_PUBLISHABLE_KEY ||
  env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error("[sync] Konfigurasi Supabase tidak lengkap. Tidak ada perubahan dilakukan.");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

function fail(message: string): never {
  throw new Error(`[sync] ${message}`);
}

async function main() {
  const materials = defaultMaterials();
  const questions = defaultQuestions();

  // ---------- learning_materials: update by id, insert sisanya ----------
  const { data: existingMaterials, error: emError } = await supabase
    .from("learning_materials")
    .select("id, order_number")
    .order("order_number", { ascending: true });
  if (emError) fail(`gagal membaca learning_materials: ${emError.message}`);
  const materialIds = (existingMaterials ?? []).map((row: { id: string }) => row.id);

  let mUpdated = 0;
  let mInserted = 0;
  for (let i = 0; i < materials.length; i += 1) {
    const item = materials[i];
    const payload = {
      menu_type: "materi",
      title: item.title,
      content: item.content,
      order_number: i + 1,
      is_active: true,
      updated_at: new Date().toISOString(),
    };
    if (i < materialIds.length) {
      const { error } = await supabase.from("learning_materials").update(payload).eq("id", materialIds[i]);
      if (error) fail(`gagal memperbarui materi ${i + 1}: ${error.message}`);
      mUpdated += 1;
    } else {
      const { error } = await supabase.from("learning_materials").insert(payload);
      if (error) fail(`gagal menambah materi ${i + 1}: ${error.message}`);
      mInserted += 1;
    }
  }

  // ---------- questions: update by id per menu_type, insert sisanya ----------
  const { data: existingQuestions, error: eqError } = await supabase
    .from("questions")
    .select("id, menu_type, order_number")
    .order("menu_type", { ascending: true })
    .order("order_number", { ascending: true });
  if (eqError) fail(`gagal membaca questions: ${eqError.message}`);

  const idsByMenu: Record<string, string[]> = {};
  for (const row of (existingQuestions ?? []) as Array<{ id: string; menu_type: string; order_number: number }>) {
    (idsByMenu[row.menu_type] ??= []).push(row.id);
  }
  const usedByMenu: Record<string, number> = { misi: 0, uji: 0 };

  let qUpdated = 0;
  let qInserted = 0;
  for (const item of questions) {
    const menu = item.menu_type;
    const list = idsByMenu[menu] ?? [];
    const used = usedByMenu[menu] ?? 0;
    const payload = {
      menu_type: item.menu_type,
      question_text: item.question_text,
      context: item.context,
      diagram_data: item.diagram_data,
      options: item.options,
      correct_answer: item.correct_answer,
      correct_reason: item.correct_reason,
      explanation: item.explanation,
      order_number: item.order_number,
      is_active: true,
    };
    if (used < list.length) {
      const { error } = await supabase.from("questions").update(payload).eq("id", list[used]);
      if (error) fail(`gagal memperbarui soal ${menu} ${item.order_number}: ${error.message}`);
      usedByMenu[menu] = used + 1;
      qUpdated += 1;
    } else {
      const { error } = await supabase.from("questions").insert(payload);
      if (error) fail(`gagal menambah soal ${menu} ${item.order_number}: ${error.message}`);
      qInserted += 1;
    }
  }

  console.log(
    `[sync] materi: ${mUpdated} diperbarui, ${mInserted} ditambah | soal: ${qUpdated} diperbarui, ${qInserted} ditambah`,
  );
  console.log(`[sync] target: ${materials.length} materi, ${questions.length} soal (4 misi + 3 uji)`);
  console.log("[sync] Tidak ada baris yang dihapus. ID lama dipertahankan.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
