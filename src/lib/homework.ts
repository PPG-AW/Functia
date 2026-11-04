import type { ArrowDiagram } from "./store/types";

/** Bank soal Tugas Rumah: TEPAT 10 soal.
 *  Urutan nomor 1–10 sudah mengurutkan tingkat kesulitan, tetapi label
 *  kesulitan SENGAJA TIDAK disimpan dan tidak pernah ditampilkan ke siswa.
 */
export type HomeworkQuestion = {
  number: number;
  title: string;
  context: string;
  pairs?: string[];
  image?: string;
  imageAlt?: string;
  diagram?: ArrowDiagram;
  choices: { key: string; text: string }[];
  correct: string;
  explanation: string;
};

export const HOMEWORK_QUESTIONS: HomeworkQuestion[] = [
  {
    number: 1,
    title: "Apa yang dimaksud relasi?",
    context:
      "Di kantin sekolah, siswa kelas VIII mencatat makanan khas Salatiga yang mereka sukai. Ada siswa yang menyukai dua makanan sekaligus.",
    choices: [
      { key: "A", text: "Hubungan antara anggota suatu himpunan dengan anggota himpunan lainnya." },
      { key: "B", text: "Aturan yang memasangkan setiap anggota domain dengan tepat satu pasangan." },
      { key: "C", text: "Kumpulan bilangan yang selalu berurutan." },
      { key: "D", text: "Garis lurus pada bidang koordinat." },
    ],
    correct: "A",
    explanation:
      "Relasi adalah hubungan antara dua himpunan dengan aturan yang bebas. Jawaban B adalah pengertian fungsi, bukan relasi.",
  },
  {
    number: 2,
    title: "Manakah pernyataan yang tepat tentang fungsi?",
    context:
      "Setiap fungsi adalah relasi, tetapi tidak setiap relasi adalah fungsi. Ciri khusus apa yang membedakannya?",
    choices: [
      { key: "A", text: "Setiap anggota kodomain harus mendapatkan pasangan." },
      { key: "B", text: "Setiap anggota domain harus memiliki tepat satu pasangan di kodomain." },
      { key: "C", text: "Setiap anggota domain boleh memiliki dua pasangan berbeda." },
      { key: "D", text: "Jumlah anggota domain harus sama dengan jumlah anggota kodomain." },
    ],
    correct: "B",
    explanation:
      "Fungsi adalah relasi khusus: setiap anggota domain wajib punya pasangan dan hanya boleh tepat satu. Kodomain boleh tidak terpakai.",
  },
  {
    number: 3,
    title: "Perhatikan himpunan pasangan berurutan berikut",
    context:
      "Relasi dari himpunan siswa ke motif Batik Plumpungan dicatat sebagai himpunan pasangan berurutan (siswa, motif).",
    pairs: ["(Ayu, Motif A)", "(Bima, Motif B)", "(Candra, Motif C)"],
    choices: [
      { key: "A", text: "Fungsi, karena setiap siswa memiliki tepat satu motif." },
      { key: "B", text: "Bukan fungsi, karena ada siswa yang tidak memiliki motif." },
      { key: "C", text: "Bukan fungsi, karena Motif C hanya dipilih satu siswa." },
      { key: "D", text: "Fungsi, karena jumlah siswa sama dengan jumlah motif." },
    ],
    correct: "A",
    explanation:
      "Ketiga anggota domain (Ayu, Bima, Candra) muncul tepat satu kali sebagai unsur pertama. Ciri 1 dan ciri 2 terpenuhi, sehingga ini fungsi.",
  },
  {
    number: 4,
    title: "Tentukan domain, kodomain, dan range",
    context:
      "Diketahui fungsi harga getuk: himpunan asal A = {1, 2, 3} (banyak bungkus), himpunan kawan B = {2, 4, 6, 8} (harga ribu rupiah), dengan pasangan {(1, 2), (2, 4), (3, 6)}.",
    pairs: ["(1, 2)", "(2, 4)", "(3, 6)"],
    choices: [
      { key: "A", text: "Domain {1, 2, 3}, kodomain {2, 4, 6, 8}, range {2, 4, 6, 8}." },
      { key: "B", text: "Domain {1, 2, 3}, kodomain {2, 4, 6, 8}, range {2, 4, 6}." },
      { key: "C", text: "Domain {2, 4, 6}, kodomain {1, 2, 3}, range {2, 4, 6, 8}." },
      { key: "D", text: "Domain {1, 2, 3}, kodomain {2, 4, 6}, range {2, 4, 6, 8}." },
    ],
    correct: "B",
    explanation:
      "Domain = semua anggota asal {1, 2, 3}. Kodomain = seluruh himpunan kawan {2, 4, 6, 8}. Range = anggota kodomain yang benar-benar menjadi pasangan, yaitu {2, 4, 6}. Anggota 8 tidak masuk range.",
  },
  {
    number: 5,
    title: "Analisis diagram panah",
    context:
      "Sebuah relasi dari himpunan A ke himpunan B digambarkan dengan diagram panah. Amati berapa banyak panah yang keluar dari setiap anggota A.",
    diagram: {
      leftLabel: "A (Domain)",
      rightLabel: "B (Kodomain)",
      left: ["1", "2", "3"],
      right: ["a", "b", "c"],
      arrows: [
        [0, 0],
        [1, 1],
        [2, 1],
        [2, 2],
      ],
      verdict: "bukan",
    },
    choices: [
      { key: "A", text: "Fungsi, karena semua anggota kodomain mendapat pasangan." },
      { key: "B", text: "Bukan fungsi, karena anggota domain 3 memiliki dua pasangan berbeda, yaitu b dan c." },
      { key: "C", text: "Bukan fungsi, karena anggota domain 1 tidak memiliki pasangan." },
      { key: "D", text: "Fungsi, karena dua anggota domain menuju b." },
    ],
    correct: "B",
    explanation:
      "Dari anggota domain 3 keluar dua panah ke b dan ke c. Ini melanggar ciri ke-2 fungsi. Perhatikan bahwa 2 \u2192 b dan 3 \u2192 b sebenarnya diperbolehkan (ciri ke-3); yang menggagalkan fungsi adalah percabangan pada 3.",
  },
  {
    number: 6,
    title: "Membaca fungsi pada koordinat Kartesius",
    context:
      "Titik-titik pada gambar menyatakan pasangan berurutan (x, y), dengan x = banyak bungkus getuk dan y = harga dalam ribu rupiah. Perhatikan label sumbu X, sumbu Y, dan label tiap titik.",
    image: "/images/kartesius-fungsi.svg",
    imageAlt: "Bidang koordinat dengan titik (1,2), (2,4), dan (3,6)",
    pairs: ["(1, 2)", "(2, 4)", "(3, 6)"],
    choices: [
      { key: "A", text: "Domain {1, 2, 3}, range {2, 4, 6}, dan merupakan fungsi." },
      { key: "B", text: "Domain {2, 4, 6}, range {1, 2, 3}, dan merupakan fungsi." },
      { key: "C", text: "Domain {1, 2, 3}, range {2, 4, 6, 8}, dan bukan fungsi." },
      { key: "D", text: "Domain {1, 2, 3}, range {2, 4, 6}, dan bukan fungsi karena titik-titiknya segaris." },
    ],
    correct: "A",
    explanation:
      "Nilai x (sumbu X) = {1, 2, 3} adalah domain, nilai y yang dipakai (sumbu Y) = {2, 4, 6} adalah range. Setiap nilai x hanya punya satu titik, sehingga ini fungsi. Titik yang segaris bukan syarat fungsi, tetapi tidak membatalkannya.",
  },
  {
    number: 7,
    title: "Selidiki himpunan pasangan berurutan yang rumit",
    context:
      "Sebuah relasi dari A = {1, 2, 3} ke B = {a, b, c, d} ditulis sebagai himpunan pasangan berurutan berikut.",
    pairs: ["(1, a)", "(2, b)", "(1, c)", "(3, a)"],
    choices: [
      { key: "A", text: "Fungsi, karena 1 dan 3 sama-sama menuju a." },
      { key: "B", text: "Bukan fungsi, karena unsur pertama 1 muncul dua kali dengan unsur kedua berbeda (a dan c)." },
      { key: "C", text: "Bukan fungsi, karena d tidak digunakan." },
      { key: "D", text: "Fungsi, karena range {a, b, c} lebih sedikit dari kodomain." },
    ],
    correct: "B",
    explanation:
      "Domain = {1, 2, 3}, kodomain = {a, b, c, d}, range = {a, b, c}. Satu anggota domain yaitu 1 memiliki dua pasangan (a dan c), sehingga relasi ini bukan fungsi. d yang tidak terpakai BUKAN alasannya \u2014 itu justru diperbolehkan (ciri ke-4).",
  },
  {
    number: 8,
    title: "Gabungkan ciri ke-3 dan ciri ke-4",
    context:
      "Relasi dari A = {Andi, Budi, Citra} ke B = {enting-enting gepuk, getuk, abon sapi, tumpang koyor} memasangkan Andi \u2192 enting-enting gepuk, Budi \u2192 enting-enting gepuk, Citra \u2192 getuk.",
    pairs: [
      "(Andi, Enting-enting gepuk)",
      "(Budi, Enting-enting gepuk)",
      "(Citra, Getuk)",
    ],
    choices: [
      { key: "A", text: "Bukan fungsi, karena dua siswa memilih makanan yang sama." },
      { key: "B", text: "Bukan fungsi, karena abon sapi dan tumpang koyor tidak dipilih." },
      { key: "C", text: "Fungsi, dan range-nya adalah {enting-enting gepuk, getuk}." },
      { key: "D", text: "Fungsi, dan range-nya sama dengan kodomain." },
    ],
    correct: "C",
    explanation:
      "Beberapa anggota domain boleh berbagi pasangan yang sama (ciri ke-3) dan anggota kodomain boleh tidak terpakai (ciri ke-4). Karena setiap siswa punya tepat satu pasangan, ini fungsi dengan range {enting-enting gepuk, getuk}, lebih kecil dari kodomain.",
  },
  {
    number: 9,
    title: "Ubah diagram panah menjadi pasangan berurutan",
    context:
      "Diagram panah berikut menyajikan fungsi dari himpunan A ke himpunan B. Tuliskan kembali relasi tersebut sebagai himpunan pasangan berurutan.",
    diagram: {
      leftLabel: "A (Domain)",
      rightLabel: "B (Kodomain)",
      left: ["1", "2", "3"],
      right: ["2", "4", "6", "8"],
      arrows: [
        [0, 0],
        [1, 1],
        [2, 2],
      ],
      verdict: "fungsi",
    },
    choices: [
      { key: "A", text: "{(1, 2), (2, 4), (3, 6)} \u2014 fungsi dengan range {2, 4, 6}." },
      { key: "B", text: "{(2, 1), (4, 2), (6, 3)} \u2014 fungsi dengan range {1, 2, 3}." },
      { key: "C", text: "{(1, 2), (2, 4), (3, 6), (4, 8)} \u2014 fungsi dengan range {2, 4, 6, 8}." },
      { key: "D", text: "{(1, 2), (2, 4), (3, 6), (3, 8)} \u2014 bukan fungsi." },
    ],
    correct: "A",
    explanation:
      "Baca setiap panah dari kiri ke kanan: 1 \u2192 2, 2 \u2192 4, 3 \u2192 6, sehingga himpunan pasangan berurutannya {(1, 2), (2, 4), (3, 6)}. Unsur pertama tidak boleh dibalik, dan 8 tidak ditulis karena tidak menerima panah.",
  },
  {
    number: 10,
    title: "Buktikan fungsi dalam tiga bentuk penyajian sekaligus",
    context:
      "Diberikan aturan f(x) = 2x dari A = {1, 2, 3} ke B = {2, 4, 6, 8}. Kamu diminta menilai pernyataan yang benar tentang diagram panah, koordinat Kartesius, dan himpunan pasangan berurutan dari fungsi ini.",
    pairs: ["(1, 2)", "(2, 4)", "(3, 6)"],
    choices: [
      {
        key: "A",
        text: "Range-nya {2, 4, 6, 8}; titiknya (1, 2), (2, 4), (3, 6), (4, 8); bukan fungsi karena ada kodomain kosong.",
      },
      {
        key: "B",
        text: "Diagram panah 1 \u2192 2, 2 \u2192 4, 3 \u2192 6; titik (1, 2), (2, 4), (3, 6); pasangan berurutan {(1, 2), (2, 4), (3, 6)}; ini fungsi dengan range {2, 4, 6}.",
      },
      {
        key: "C",
        text: "Range-nya {1, 2, 3}; ketiga bentuk penyajian tidak saling berkaitan; ini bukan fungsi.",
      },
      {
        key: "D",
        text: "Fungsi hanya dapat digambar dengan diagram panah, tidak dengan koordinat Kartesius maupun pasangan berurutan.",
      },
    ],
    correct: "B",
    explanation:
      "Ketiga bentuk penyajian memuat relasi yang SAMA. Domain {1, 2, 3}, kodomain {2, 4, 6, 8}, range {2, 4, 6}. Anggota 8 tidak terpakai tetapi fungsi tetap sah, karena setiap anggota domain punya tepat satu pasangan.",
  },
];

export const HOMEWORK_TOTAL = HOMEWORK_QUESTIONS.length;
export const HOMEWORK_MIN_SELECTED = 3;

export type HomeworkSubmissionAnswer = { key: string; text: string };

export function gradeHomework(
  answers: Record<string, HomeworkSubmissionAnswer>,
): { score: number; correct_count: number; total_answered: number } {
  const entries = Object.entries(answers).filter(([, value]) => Boolean(value?.key));
  const total = entries.length;
  let correct = 0;
  for (const [number, value] of entries) {
    const question = HOMEWORK_QUESTIONS.find((item) => String(item.number) === String(number));
    if (question && question.correct === value.key) correct += 1;
  }
  return {
    score: total ? Math.round((correct / total) * 100) : 0,
    correct_count: correct,
    total_answered: total,
  };
}

export function findHomeworkQuestion(number: number): HomeworkQuestion | undefined {
  return HOMEWORK_QUESTIONS.find((item) => item.number === number);
}

export function isValidHomeworkNumber(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= HOMEWORK_TOTAL
  );
}
