import type { ArrowDiagram, Question, QuestionOptions } from "./store/types";

/**
 * Revisi terbatas: mengganti soal berbentuk KOORDINAT KARTESIUS pada
 * Misi Penyelidikan / Uji Pemahaman dengan soal relasi & fungsi tanpa koordinat.
 *
 * Diterapkan pada LAPISAN PEMBACaan kode (bukan pada database), sehingga:
 *  - tidak ada perubahan tabel/skema/RLS/data Supabase,
 *  - ID soal tetap sama (jawaban & nilai siswa lama tetap mereferensikannya),
 *  - kunci jawaban tetap sama sehingga penilaian lama tidak berubah.
 */

const COORDINATE_PATTERN =
  /kartesius|koordinat|titik\s*\(|sumbu\s*[xy]|uji garis vertikal|\(x,\s*y\)/i;

type DisplayOptions = QuestionOptions & { image?: string; imageAlt?: string };

export function isCoordinateQuestion(question: Question): boolean {
  const options = (question.options ?? {}) as DisplayOptions;
  if (options.image && /kartesius/i.test(options.image)) return true;
  const text = [
    question.question_text,
    question.context,
    question.explanation,
    JSON.stringify(options),
  ]
    .filter(Boolean)
    .join(" ");
  return COORDINATE_PATTERN.test(text);
}

/** Diagram panah untuk soal pengganti: Ayu bercabang ke dua pasangan berbeda. */
const REVISED_DIAGRAM: ArrowDiagram = {
  leftLabel: "Domain (Siswa)",
  rightLabel: "Kodomain (Makanan Khas Salatiga)",
  left: ["Ayu", "Bima", "Citra"],
  right: ["Getuk", "Enting-enting gepuk", "Tumpang koyor", "Abon sapi"],
  arrows: [
    [0, 0],
    [0, 2],
    [1, 1],
    [2, 3],
  ],
  verdict: "bukan",
  note: "Perhatikan Ayu: dua panah keluar dari satu anggota domain.",
};

/** Soal pengganti: pasangan berurutan + domain/kodomain/range + ciri fungsi. */
export const REVISED_QUESTION_CONTENT = {
  question_text:
    "Perhatikan HIMPUNAN PASANGAN BERURUTAN berikut. Apakah relasi ini merupakan fungsi, dan manakah alasan yang paling tepat?",
  context:
    "Pada bazar kuliner khas Salatiga, panitia mencatat pasangan (siswa, makanan favorit). Domain yang dicatat adalah {Ayu, Bima, Citra}, sedangkan kodomain yang disediakan adalah {Getuk, Enting-enting gepuk, Tumpang koyor, Abon sapi, Sate sapi}.",
  diagram_data: REVISED_DIAGRAM,
  options: {
    answers: [
      { key: "fungsi", text: "Fungsi" },
      { key: "bukan", text: "Bukan fungsi" },
    ],
    reasons: [
      {
        key: "A",
        text: "Bukan fungsi, karena Ayu sebagai anggota domain memiliki dua pasangan berbeda (Getuk dan Tumpang koyor). Range-nya {Getuk, Enting-enting gepuk, Tumpang koyor, Abon sapi}.",
      },
      {
        key: "B",
        text: "Fungsi, karena setiap makanan pada kodomain mendapatkan pasangan.",
      },
      {
        key: "C",
        text: "Bukan fungsi, karena Sate sapi sebagai anggota kodomain tidak mendapatkan pasangan.",
      },
      {
        key: "D",
        text: "Fungsi, karena beberapa siswa boleh memilih makanan yang sama dan semua pasangan berurutannya berbeda.",
      },
    ],
    pairs: [
      "(Ayu, Getuk)",
      "(Ayu, Tumpang koyor)",
      "(Bima, Enting-enting gepuk)",
      "(Citra, Abon sapi)",
    ],
  } satisfies QuestionOptions,
  correct_answer: "bukan",
  correct_reason: "A",
  explanation:
    "Domain = {Ayu, Bima, Citra}, kodomain = {Getuk, Enting-enting gepuk, Tumpang koyor, Abon sapi, Sate sapi}, dan range = {Getuk, Enting-enting gepuk, Tumpang koyor, Abon sapi}. Unsur pertama Ayu muncul dua kali dengan unsur kedua berbeda, sehingga satu anggota domain memiliki dua pasangan (melanggar ciri ke-2 fungsi). Dua anggota domain berbeda boleh berbagi pasangan yang sama (ciri ke-3), dan anggota kodomain boleh tidak terpakai (ciri ke-4) — Sate sapi yang kosong bukan alasan pembatal fungsi. Jadi relasi ini bukan fungsi.",
};

/**
 * Ganti hanya soal yang terdeteksi berbentuk koordinat.
 * `id`, `menu_type`, `order_number`, dan `is_active` dipertahankan apa adanya.
 */
export function reviseQuestions<T extends Question>(rows: T[]): T[] {
  return rows.map((row) => {
    if (!isCoordinateQuestion(row)) return row;
    return {
      ...row,
      question_text: REVISED_QUESTION_CONTENT.question_text,
      context: REVISED_QUESTION_CONTENT.context,
      diagram_data: REVISED_QUESTION_CONTENT.diagram_data,
      options: REVISED_QUESTION_CONTENT.options,
      correct_answer: REVISED_QUESTION_CONTENT.correct_answer,
      correct_reason: REVISED_QUESTION_CONTENT.correct_reason,
      explanation: REVISED_QUESTION_CONTENT.explanation,
    } as T;
  });
}
