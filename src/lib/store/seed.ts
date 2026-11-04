import type { ArrowDiagram, LearningMaterial, Question } from "./types";

/** Contoh fungsi konsisten yang dipakai di seluruh materi (Pahami Konsep, Misi, Uji, Tugas Rumah).
 *  A = {1, 2, 3} (banyak bungkus getuk), B = {2, 4, 6, 8} (harga dalam ribu rupiah).
 *  1 → 2, 2 → 4, 3 → 6   ⇒   Domain {1,2,3}, Kodomain {2,4,6,8}, Range {2,4,6}.
 */
export const CONSISTENT_DIAGRAM: ArrowDiagram = {
  leftLabel: "Banyak bungkus getuk (A)",
  rightLabel: "Harga ribu rupiah (B)",
  left: ["1", "2", "3"],
  right: ["2", "4", "6", "8"],
  arrows: [
    [0, 0],
    [1, 1],
    [2, 2],
  ],
  verdict: "fungsi",
  note: "Domain = {1, 2, 3} · Kodomain = {2, 4, 6, 8} · Range = {2, 4, 6}. Anggota 8 tidak punya pasangan, tetapi ini tetap fungsi.",
};

/** Bank soal bawaan: 4 Misi Penyelidikan + 3 Uji Pemahaman. */
export function defaultQuestions(): Omit<Question, "id">[] {
  return [
    // ==================== MISI PENYELIDIKAN (4) ====================
    {
      menu_type: "misi",
      question_text: "Apakah relasi \u201csiswa dan makanan favoritnya\u201d pada diagram panah tersebut merupakan fungsi?",
      context:
        "Di kegiatan pengenalan kuliner khas Salatiga, Andi menyukai enting-enting gepuk, Budi menyukai getuk, dan Citra menyukai enting-enting gepuk. Perhatikan diagram panah berikut.",
      diagram_data: {
        leftLabel: "Himpunan Siswa",
        rightLabel: "Makanan Khas Salatiga",
        left: ["Andi", "Budi", "Citra"],
        right: ["Enting-enting gepuk", "Getuk", "Abon sapi"],
        arrows: [
          [0, 0],
          [1, 1],
          [2, 0],
        ],
        note: "Setiap siswa tepat memiliki satu panah keluar. Abon sapi tidak dipilih siapa pun.",
      },
      options: {
        answers: [
          { key: "fungsi", text: "Fungsi" },
          { key: "bukan", text: "Bukan fungsi" },
        ],
        reasons: [
          { key: "A", text: "Setiap anggota domain memiliki tepat satu pasangan." },
          { key: "B", text: "Ada anggota domain yang memiliki dua pasangan berbeda." },
          { key: "C", text: "Ada anggota domain yang tidak memiliki pasangan." },
          { key: "D", text: "Semua anggota kodomain wajib mendapatkan pasangan." },
        ],
      },
      correct_answer: "fungsi",
      correct_reason: "A",
      explanation:
        "Domain = {Andi, Budi, Citra}. Masing-masing punya tepat satu pasangan. Andi dan Citra boleh menyukai makanan yang sama, dan abon sapi boleh tidak dipilih. Karena itu relasi ini adalah fungsi.",
      order_number: 1,
      is_active: true,
    },
    {
      menu_type: "misi",
      question_text: "Apakah relasi \u201csiswa dan kegiatan ekstrakurikuler yang diikuti\u201d pada diagram panah tersebut merupakan fungsi?",
      context:
        "Rina mengikuti Pramuka, Dinda mengikuti Tari, sedangkan Sinta mengikuti Basket dan Pramuka sekaligus. Amati panah yang keluar dari setiap siswa pada diagram.",
      diagram_data: {
        leftLabel: "Himpunan Siswa",
        rightLabel: "Kegiatan Ekstrakurikuler",
        left: ["Rina", "Dinda", "Sinta"],
        right: ["Pramuka", "Tari", "Basket"],
        arrows: [
          [0, 0],
          [1, 1],
          [2, 2],
          [2, 0],
        ],
        note: "Perhatikan Sinta: ada dua panah yang keluar dari namanya.",
      },
      options: {
        answers: [
          { key: "fungsi", text: "Fungsi" },
          { key: "bukan", text: "Bukan fungsi" },
        ],
        reasons: [
          { key: "A", text: "Setiap anggota domain memiliki tepat satu pasangan." },
          { key: "B", text: "Ada anggota domain yang memiliki dua pasangan berbeda." },
          { key: "C", text: "Ada anggota domain yang tidak memiliki pasangan." },
          { key: "D", text: "Dua anggota domain tidak boleh memiliki pasangan yang sama." },
        ],
      },
      correct_answer: "bukan",
      correct_reason: "B",
      explanation:
        "Sinta sebagai anggota domain memiliki dua pasangan, yaitu Basket dan Pramuka. Ini melanggar ciri ke-2 fungsi: setiap anggota domain hanya boleh memiliki tepat satu pasangan. Jadi relasi ini bukan fungsi.",
      order_number: 2,
      is_active: true,
    },
    {
      menu_type: "misi",
      question_text: "Apakah relasi pada HIMPUNAN PASANGAN BERURUTAN \u201csiswa dan motif Batik Plumpungan\u201d ini merupakan fungsi?",
      context:
        "Dalam lomba mengenali Batik Plumpungan, panitia mencatat pilihan siswa sebagai himpunan pasangan berurutan (nama siswa, motif). Baca setiap pasangan dengan teliti, lalu tentukan apakah himpunan itu suatu fungsi.",
      diagram_data: null,
      options: {
        answers: [
          { key: "fungsi", text: "Fungsi" },
          { key: "bukan", text: "Bukan fungsi" },
        ],
        reasons: [
          { key: "A", text: "Setiap anggota domain memiliki tepat satu pasangan." },
          { key: "B", text: "Ada anggota domain yang memiliki dua pasangan berbeda." },
          { key: "C", text: "Ada anggota domain yang tidak memiliki pasangan." },
          { key: "D", text: "Ada anggota kodomain yang tidak mendapat pasangan." },
        ],
        pairs: [
          "(Ayu, Motif A)",
          "(Bima, Motif B)",
          "(Candra, Motif C)",
          "(Ayu, Motif B)",
        ],
      },
      correct_answer: "bukan",
      correct_reason: "B",
      explanation:
        "Domain = {Ayu, Bima, Candra}. Perhatikan bahwa Ayu muncul dua kali dengan pasangan berbeda: (Ayu, Motif A) dan (Ayu, Motif B). Satu anggota domain memiliki dua pasangan, sehingga himpunan pasangan berurutan ini bukan fungsi. Cara cepat: pada pasangan berurutan, tidak boleh ada dua pasangan dengan unsur pertama sama tetapi unsur kedua berbeda.",
      order_number: 3,
      is_active: true,
    },
    {
      menu_type: "misi",
      question_text: "Apakah relasi pada HIMPUNAN PASANGAN BERURUTAN \u201csiswa dan kuliner favorit\u201d ini merupakan fungsi?",
      context:
        "Siswa kelas VIII mencatat satu kuliner khas Salatiga favoritnya. Hasilnya ditulis sebagai himpunan pasangan berurutan (nama siswa, kuliner favorit).",
      diagram_data: null,
      options: {
        answers: [
          { key: "fungsi", text: "Fungsi" },
          { key: "bukan", text: "Bukan fungsi" },
        ],
        reasons: [
          { key: "A", text: "Setiap anggota domain memiliki tepat satu pasangan." },
          { key: "B", text: "Ada anggota domain yang memiliki dua pasangan berbeda." },
          { key: "C", text: "Ada anggota domain yang tidak memiliki pasangan." },
          { key: "D", text: "Dua anggota domain tidak boleh memiliki pasangan yang sama." },
        ],
        pairs: [
          "(Andi, Enting-enting gepuk)",
          "(Budi, Getuk)",
          "(Citra, Enting-enting gepuk)",
        ],
      },
      correct_answer: "fungsi",
      correct_reason: "A",
      explanation:
        "Setiap nama siswa muncul tepat satu kali sebagai unsur pertama, sehingga setiap anggota domain punya tepat satu pasangan. Andi dan Citra boleh memiliki pasangan yang sama (ciri ke-3), dan tumpang koyor tidak dipilih (ciri ke-4). Jadi ini fungsi.",
      order_number: 4,
      is_active: true,
    },

    // ==================== UJI PEMAHAMAN (3) ====================
    {
      menu_type: "uji",
      question_text:
        "Perhatikan HIMPUNAN PASANGAN BERURUTAN berikut. Manakah pernyataan yang paling tepat tentang domain, kodomain, range, dan status fungsinya?",
      context:
        "Diketahui himpunan pasangan berurutan R = {(1, 2), (2, 4), (3, 6), (2, 8)}. Domain diambil dari semua unsur pertama, sedangkan kodomain yang disediakan adalah {2, 4, 6, 8}.",
      diagram_data: null,
      options: {
        answers: [
          { key: "fungsi", text: "Fungsi" },
          { key: "bukan", text: "Bukan fungsi" },
        ],
        reasons: [
          {
            key: "A",
            text: "Domain {1, 2, 3}, kodomain {2, 4, 6, 8}, range {2, 4, 6, 8}; ini fungsi karena kodomain habis dipakai.",
          },
          {
            key: "B",
            text: "Domain {1, 2, 3}, kodomain {2, 4, 6, 8}, range {2, 4, 6, 8}; ini BUKAN fungsi karena unsur 2 memiliki dua pasangan berbeda, yaitu 4 dan 8.",
          },
          {
            key: "C",
            text: "Domain {1, 2, 3, 2}, kodomain {2, 4, 6, 8}, range {2, 4, 6, 8}; ini fungsi karena tiap pasangan berbeda.",
          },
          {
            key: "D",
            text: "Domain {1, 2, 3}, kodomain {2, 4, 6, 8}, range {2, 4, 6}; ini fungsi karena range tidak sama dengan kodomain.",
          },
        ],
        pairs: ["(1, 2)", "(2, 4)", "(3, 6)", "(2, 8)"],
      },
      correct_answer: "bukan",
      correct_reason: "B",
      explanation:
        "Domain = {1, 2, 3} (unsur pertama, ditulis tanpa pengulangan). Kodomain = {2, 4, 6, 8} (himpunan kawan yang disediakan). Range = {2, 4, 6, 8} (unsur kedua yang benar-benar dipakai). Walaupun range sama dengan kodomain, relasi ini BUKAN fungsi karena unsur pertama 2 muncul dua kali dengan unsur kedua berbeda (4 dan 8). Hal ini melanggar ciri ke-2 fungsi.",
      order_number: 1,
      is_active: true,
    },
    {
      menu_type: "uji",
      question_text:
        "Perhatikan diagram panah A = {1, 2, 3} ke B = {a, b, c}. Manakah penalaran yang benar jika dikaitkan dengan KEEMPAT ciri fungsi?",
      context:
        "Relasi pada diagram: 1 \u2192 a, 2 \u2192 a, 3 \u2192 b. Anggota c tidak menerima panah. Siswa diminta menganalisis bukan sekadar menghafal definisi.",
      diagram_data: {
        leftLabel: "A (Domain)",
        rightLabel: "B (Kodomain)",
        left: ["1", "2", "3"],
        right: ["a", "b", "c"],
        arrows: [
          [0, 0],
          [1, 0],
          [2, 1],
        ],
        note: "Dua anggota domain menuju a, dan c tidak mendapat pasangan.",
      },
      options: {
        answers: [
          { key: "fungsi", text: "Fungsi" },
          { key: "bukan", text: "Bukan fungsi" },
        ],
        reasons: [
          {
            key: "A",
            text: "Bukan fungsi, sebab c sebagai anggota kodomain tidak mendapat pasangan dan dua anggota domain menuju a.",
          },
          {
            key: "B",
            text: "Fungsi, karena setiap anggota domain punya tepat satu pasangan; dua domain boleh berbagi pasangan yang sama dan kodomain boleh tidak terpakai.",
          },
          {
            key: "C",
            text: "Bukan fungsi, sebab jumlah anggota domain dan kodomain harus sama banyak.",
          },
          {
            key: "D",
            text: "Fungsi hanya jika setiap anggota domain memiliki pasangan yang berbeda-beda.",
          },
        ],
      },
      correct_answer: "fungsi",
      correct_reason: "B",
      explanation:
        "Ciri 1 terpenuhi (1, 2, 3 semuanya punya pasangan), ciri 2 terpenuhi (tidak ada domain yang bercabang), ciri 3 menjelaskan bahwa 1 dan 2 boleh sama-sama menuju a, dan ciri 4 menjelaskan bahwa c boleh tidak terpakai. Range = {a, b}, kodomain = {a, b, c}. Jadi relasi ini fungsi.",
      order_number: 2,
      is_active: true,
    },
    {
      menu_type: "uji",
      question_text:
        "Perhatikan HIMPUNAN PASANGAN BERURUTAN berikut. Apakah relasi ini merupakan fungsi, dan manakah alasan yang paling tepat?",
      context:
        "Pada bazar kuliner khas Salatiga, panitia mencatat pasangan (siswa, makanan favorit). Domain yang dicatat adalah {Ayu, Bima, Citra}, sedangkan kodomain yang disediakan adalah {Getuk, Enting-enting gepuk, Tumpang koyor, Abon sapi, Sate sapi}.",
      diagram_data: {
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
      },
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
      },
      correct_answer: "bukan",
      correct_reason: "A",
      explanation:
        "Domain = {Ayu, Bima, Citra}, kodomain = {Getuk, Enting-enting gepuk, Tumpang koyor, Abon sapi, Sate sapi}, dan range = {Getuk, Enting-enting gepuk, Tumpang koyor, Abon sapi}. Unsur pertama Ayu muncul dua kali dengan unsur kedua berbeda, sehingga satu anggota domain memiliki dua pasangan (melanggar ciri ke-2 fungsi). Dua anggota domain berbeda boleh berbagi pasangan yang sama (ciri ke-3), dan anggota kodomain boleh tidak terpakai (ciri ke-4) — Sate sapi yang kosong bukan alasan pembatal fungsi. Jadi relasi ini bukan fungsi.",
      order_number: 3,
      is_active: true,
    },
  ];
}

/** Materi Pahami Konsep, disusun bertahap sesuai urutan pembahasan. */
export function defaultMaterials(): Omit<LearningMaterial, "id" | "updated_at">[] {
  return [
    {
      menu_type: "materi",
      title: "Selamat Datang di Dunia Relasi dan Fungsi",
      order_number: 1,
      is_active: true,
      content: {
        intro:
          "Halo, Detektif Fungsi! Hari ini kita akan menyelidiki hubungan-hubungan yang ada di sekitar kita, lalu mencari tahu kapan sebuah hubungan layak disebut fungsi.",
        paragraphs: [
          "Di Salatiga, banyak sekali pasangan hal yang saling berhubungan: siswa dengan makanan kesukaannya, pengunjung dengan tempat wisata, atau banyak bungkus getuk dengan harga yang harus dibayar. Dalam matematika, hubungan seperti ini disebut relasi.",
          "Ikuti bagian-bagian berikut secara berurutan ya. Setiap bagian punya diagram panah yang bisa kamu amati dengan saksama.",
        ],
        bullets: [
          "Bagian 1 \u2013 Pengertian Relasi",
          "Bagian 2 \u2013 Pengertian Fungsi",
          "Bagian 3 \u2013 Empat Ciri-Ciri Fungsi",
          "Bagian 4 \u2013 Domain, Kodomain, dan Range",
          "Bagian 5 \u2013 Tiga Cara Menyajikan Fungsi: diagram panah, koordinat Kartesius, dan himpunan pasangan berurutan",
        ],
        image: "/images/hero-salatiga.png",
      },
    },
    {
      menu_type: "materi",
      title: "Bagian 1 \u2013 Pengertian Relasi",
      order_number: 2,
      is_active: true,
      content: {
        intro: "Relasi adalah hubungan antara anggota satu himpunan dengan anggota himpunan lainnya.",
        paragraphs: [
          "Bayangkan kamu sedang berjalan di Pasar Salatiga. Ada siswa, ada penjual, dan ada makanan khas seperti enting-enting gepuk, getuk, tumpang koyor, dan abon sapi. Ketika kita menghubungkan \u201csiapa menyukai apa\u201d, kita sedang membuat relasi.",
          "Himpunan pertama disebut himpunan asal (domain), himpunan kedua disebut himpunan kawan (kodomain). Aturan hubungannya bebas: \u201cmenyukai\u201d, \u201cmemilih\u201d, \u201cberkunjung ke\u201d, atau \u201charganya adalah\u201d.",
          "Pada relasi biasa, satu anggota boleh punya lebih dari satu pasangan, dan ada juga anggota yang tidak punya pasangan sama sekali. Itu tidak masalah.",
        ],
        example: {
          title: "Contoh relasi sehari-hari dekat kita",
          items: [
            "Siswa \u2192 makanan khas Salatiga yang disukai (boleh lebih dari satu).",
            "Pengunjung \u2192 tempat wisata Salatiga yang pernah dikunjungi (Kopeng, Rawa Pening, Taman Kalitaman).",
            "Siswa \u2192 kegiatan ekstrakurikuler yang diikuti (boleh dua kegiatan sekaligus).",
            "Banyak bungkus getuk \u2192 total harga yang dibayar di warung.",
          ],
        },
        diagram: {
          leftLabel: "Himpunan A (Siswa)",
          rightLabel: "Himpunan B (Makanan Khas)",
          left: ["Andi", "Budi", "Citra", "Dodi"],
          right: ["Enting-enting gepuk", "Getuk", "Abon sapi", "Tumpang koyor"],
          arrows: [
            [0, 0],
            [0, 1],
            [1, 1],
            [2, 2],
            [3, 3],
          ],
          note: "Ini RELASI, bukan fungsi: Andi punya dua pasangan. Pada relasi, hal itu diperbolehkan.",
        },
        question: "Apa hubungan antara himpunan siswa dan himpunan makanan tersebut? Ya, hubungannya adalah \u201cmenyukai\u201d. Itulah relasinya!",
        callout: {
          tone: "info",
          text: "Relasi hanya butuh \u201caturan hubungan\u201d. Belum ada syarat harus tepat satu pasangan.",
        },
      },
    },
    {
      menu_type: "materi",
      title: "Bagian 2 \u2013 Pengertian Fungsi dan Perbedaannya dengan Relasi",
      order_number: 3,
      is_active: true,
      content: {
        intro:
          "Fungsi (disebut juga pemetaan) adalah relasi KHUSUS yang memasangkan SETIAP anggota domain dengan TEPAT SATU anggota kodomain.",
        paragraphs: [
          "Jadi, setiap fungsi pasti sebuah relasi, tetapi tidak setiap relasi merupakan fungsi. Bedanya ada pada aturan \u201ctepat satu\u201d.",
          "Pada relasi biasa, Andi boleh menyukai enting-enting gepuk sekaligus getuk. Pada fungsi, jika yang dipasangkan adalah \u201csatu makanan favorit pilihan\u201d, maka Andi hanya boleh punya satu pasangan.",
        ],
        example: {
          title: "Contoh sederhana: satu pilihan makanan favorit",
          items: [
            "Andi \u2192 Enting-enting gepuk",
            "Budi \u2192 Getuk",
            "Citra \u2192 Enting-enting gepuk",
          ],
        },
        diagram: {
          leftLabel: "Himpunan A (Siswa)",
          rightLabel: "Himpunan B (Makanan Khas)",
          left: ["Andi", "Budi", "Citra"],
          right: ["Enting-enting gepuk", "Getuk", "Abon sapi"],
          arrows: [
            [0, 0],
            [1, 1],
            [2, 0],
          ],
          verdict: "fungsi",
          note: "Setiap siswa tepat satu pasangan. Andi dan Citra boleh sama-sama memilih enting-enting gepuk.",
        },
        conclusion:
          "Perbedaan utamanya: relasi bebas jumlah pasangannya, sedangkan fungsi mewajibkan setiap anggota domain punya pasangan dan tidak boleh bercabang.",
        callout: {
          tone: "success",
          text: "Kata kunci fungsi: \u201csetiap\u201d (tidak ada yang terlewat) dan \u201ctepat satu\u201d (tidak ada yang bercabang).",
        },
      },
    },
    {
      menu_type: "materi",
      title: "Bagian 3 \u2013 Empat Ciri-Ciri Fungsi",
      order_number: 4,
      is_active: true,
      content: {
        intro: "Ada empat ketentuan yang harus kamu ingat. Setiap ketentuan diberi contoh yang MEMENUHI dan yang TIDAK MEMENUHI.",
        paragraphs: [
          "Amati panah yang keluar dari anggota domain (himpunan kiri). Dari situ kamu bisa memutuskan apakah sebuah relasi layak disebut fungsi.",
        ],
        cards: [
          {
            title: "Ciri 1 \u2713 Memenuhi: setiap anggota domain punya pasangan",
            text: "Andi, Budi, dan Citra semuanya memiliki panah keluar. Tidak ada yang terlewat.",
            diagram: {
              leftLabel: "Domain",
              rightLabel: "Kodomain",
              left: ["Andi", "Budi", "Citra"],
              right: ["Getuk", "Enting-enting", "Abon sapi"],
              arrows: [[0, 0], [1, 1], [2, 0]],
              verdict: "fungsi",
            },
          },
          {
            title: "Ciri 1 \u2717 Tidak memenuhi: ada domain tanpa pasangan",
            text: "Candra tidak punya panah keluar. Karena ada anggota domain yang menganggur, ini BUKAN fungsi.",
            diagram: {
              leftLabel: "Domain",
              rightLabel: "Kodomain",
              left: ["Ayu", "Bima", "Candra"],
              right: ["Motif A", "Motif B", "Motif C"],
              arrows: [[0, 0], [1, 1]],
              verdict: "bukan",
            },
          },
          {
            title: "Ciri 2 \u2713 Memenuhi: setiap domain tepat satu pasangan",
            text: "Dari setiap nama hanya keluar satu panah. Tidak ada yang bercabang.",
            diagram: {
              leftLabel: "Domain",
              rightLabel: "Kodomain",
              left: ["Rina", "Dinda", "Sinta"],
              right: ["Pramuka", "Tari", "Basket"],
              arrows: [[0, 0], [1, 1], [2, 2]],
              verdict: "fungsi",
            },
          },
          {
            title: "Ciri 2 \u2717 Tidak memenuhi: domain bercabang",
            text: "Sinta memiliki dua panah (Tari dan Basket). Satu anggota domain punya dua pasangan berbeda \u2192 BUKAN fungsi.",
            diagram: {
              leftLabel: "Domain",
              rightLabel: "Kodomain",
              left: ["Rina", "Dinda", "Sinta"],
              right: ["Pramuka", "Tari", "Basket"],
              arrows: [[0, 0], [1, 1], [2, 1], [2, 2]],
              verdict: "bukan",
            },
          },
          {
            title: "Ciri 3 \u2713 Memenuhi: beberapa domain boleh pasangan sama",
            text: "1 \u2192 a dan 2 \u2192 a. Dua anggota domain berbagi pasangan yang sama; ini tetap FUNGSI.",
            diagram: {
              leftLabel: "Domain",
              rightLabel: "Kodomain",
              left: ["1", "2", "3"],
              right: ["a", "b", "c"],
              arrows: [[0, 0], [1, 0], [2, 1]],
              verdict: "fungsi",
            },
          },
          {
            title: "Ciri 3 \u2717 Jangan tertukar: ini bukan \u201cberbagi pasangan\u201d",
            text: "Di sini 1 keluar dua kali (ke a dan ke b). Itu domain bercabang, BUKAN dua domain berbagi pasangan. Jadi bukan fungsi.",
            diagram: {
              leftLabel: "Domain",
              rightLabel: "Kodomain",
              left: ["1", "2", "3"],
              right: ["a", "b", "c"],
              arrows: [[0, 0], [0, 1], [1, 0], [2, 1]],
              verdict: "bukan",
            },
          },
          {
            title: "Ciri 4 \u2713 Memenuhi: kodomain boleh tidak terpakai",
            text: "Anggota 8 tidak menerima panah. Karena semua domain tetap punya tepat satu pasangan, ini FUNGSI.",
            diagram: {
              leftLabel: "Domain",
              rightLabel: "Kodomain",
              left: ["1", "2", "3"],
              right: ["2", "4", "6", "8"],
              arrows: [[0, 0], [1, 1], [2, 2]],
              verdict: "fungsi",
            },
          },
          {
            title: "Ciri 4 \u2717 Kesalahan umum: mengharuskan kodomain habis",
            text: "c memang kosong, tetapi yang membuat ini BUKAN fungsi adalah 1 yang bercabang ke a dan b \u2014 bukan karena c kosong.",
            diagram: {
              leftLabel: "Domain",
              rightLabel: "Kodomain",
              left: ["1", "2"],
              right: ["a", "b", "c"],
              arrows: [[0, 0], [0, 1], [1, 0]],
              verdict: "bukan",
            },
          },
        ],
        conclusion:
          "Ringkasnya: domain wajib lengkap, domain tidak boleh bercabang, beberapa domain boleh berbagi pasangan, dan kodomain boleh ada yang tidak terpakai.",
      },
    },
    {
      menu_type: "materi",
      title: "Bagian 4 \u2013 Domain, Kodomain, dan Range",
      order_number: 5,
      is_active: true,
      content: {
        intro: "Domain, kodomain, dan range itu mirip, tetapi TIDAK sama. Mari pakai SATU contoh fungsi yang sama.",
        paragraphs: [
          "Pak Darmo berjualan getuk di Salatiga. Ia mencatat banyak bungkus yang dibeli dan harga totalnya (dalam ribuan rupiah): 1 bungkus harganya 2 ribu, 2 bungkus 4 ribu, 3 bungkus 6 ribu. Aturannya sederhana: harga = 2 \u00d7 banyak bungkus.",
        ],
        example: {
          title: "Satu contoh fungsi untuk ketiga istilah",
          items: [
            "A = {1, 2, 3} \u2192 banyak bungkus getuk (himpunan asal).",
            "B = {2, 4, 6, 8} \u2192 daftar harga yang disediakan (himpunan kawan).",
            "Pasangan: 1 \u2192 2, 2 \u2192 4, 3 \u2192 6.",
            "Domain = {1, 2, 3}: semua anggota A yang dipetakan.",
            "Kodomain = {2, 4, 6, 8}: seluruh anggota B, termasuk yang tidak terpakai.",
            "Range = {2, 4, 6}: hanya anggota B yang BENAR-BENAR menjadi pasangan.",
          ],
        },
        diagram: CONSISTENT_DIAGRAM,
        question:
          "Mengapa 8 masuk kodomain tetapi tidak masuk range? Karena tidak ada panah yang menuju ke 8. Range selalu bagian dari kodomain; dalam contoh ini 8 bukan range.",
        conclusion:
          "Domain = yang dipetakan (kiri), kodomain = seluruh sasaran yang disediakan (kanan), range = sasaran yang benar-benar kena panah. Jadi range \u2286 kodomain.",
        callout: {
          tone: "info",
          text: "Domain dan kodomain ditentukan sebelum relasi dibuat; range baru diketahui setelah panah digambar.",
        },
      },
    },
    {
      menu_type: "materi",
      title: "Bagian 5a \u2013 Cara Menyajikan Fungsi: Diagram Panah",
      order_number: 6,
      is_active: true,
      content: {
        intro: "Diagram panah adalah cara paling mudah melihat pasangan antara dua himpunan.",
        paragraphs: [
          "Cara membacanya: dua kotak himpunan digambar berdampingan. Kotak kiri adalah domain (himpunan asal), kotak kanan adalah kodomain (himpunan tujuan). Setiap panah berangkat dari SATU anggota kiri menuju SATU anggota kanan.",
          "Jika dari satu anggota kiri keluar lebih dari satu panah, relasinya bukan fungsi. Jika ada anggota kiri tanpa panah, relasinya juga bukan fungsi.",
        ],
        example: {
          title: "Contoh fungsi harga getuk Pak Darmo",
          items: [
            "Baca panah: 1 \u2192 2, 2 \u2192 4, 3 \u2192 6.",
            "Domain dari diagram = {1, 2, 3}.",
            "Kodomain dari diagram = {2, 4, 6, 8}.",
            "Range dari diagram = {2, 4, 6} (yang kena panah).",
          ],
        },
        diagram: CONSISTENT_DIAGRAM,
        conclusion:
          "Dari satu diagram panah kita sudah bisa menentukan domain, kodomain, range, dan status fungsi sekaligus.",
      },
    },
    {
      menu_type: "materi",
      title: "Bagian 5b \u2013 Cara Menyajikan Fungsi: Koordinat Kartesius",
      order_number: 7,
      is_active: true,
      content: {
        intro: "Fungsi juga bisa digambar sebagai titik-titik pada bidang koordinat Kartesius.",
        paragraphs: [
          "Sumbu mendatar disebut sumbu X (untuk nilai domain), sumbu tegak disebut sumbu Y (untuk nilai kodomain). Setiap pasangan berurutan (x, y) menjadi satu titik: x dibaca lebih dulu ke kanan, lalu y ke atas.",
          "Dari contoh harga getuk, pasangan (1, 2), (2, 4), dan (3, 6) menjadi tiga titik. Perhatikan label sumbu X, sumbu Y, angka-angka pada kedua sumbu, dan label setiap titik pada gambar.",
          "Cara cepat memeriksa fungsi: tarik garis vertikal pada suatu nilai X. Bila garis itu memotong lebih dari satu titik, berarti satu anggota domain punya dua pasangan, sehingga BUKAN fungsi. Ini disebut uji garis vertikal.",
        ],
        example: {
          title: "Membaca titik pada gambar",
          items: [
            "Titik (1, 2): x = 1 bungkus, y = 2 ribu rupiah.",
            "Titik (2, 4): x = 2 bungkus, y = 4 ribu rupiah.",
            "Titik (3, 6): x = 3 bungkus, y = 6 ribu rupiah.",
            "Domain = {1, 2, 3}, kodomain yang disediakan = {2, 4, 6, 8}, range = {2, 4, 6}.",
          ],
        },
        image: "/images/kartesius-fungsi.svg",
        question:
          "Coba tunjuk titik (2, 4). Dari titik asal 0, bergeraklah 2 langkah ke kanan pada sumbu X, lalu 4 langkah ke atas pada sumbu Y.",
        callout: {
          tone: "success",
          text: "Tiga titik pada gambar berada pada garis lurus y = 2x. Itu tidak wajib bagi fungsi \u2014 yang wajib adalah setiap X punya tepat satu Y.",
        },
      },
    },
    {
      menu_type: "materi",
      title: "Bagian 5c \u2013 Cara Menyajikan Fungsi: Himpunan Pasangan Berurutan",
      order_number: 8,
      is_active: true,
      content: {
        intro: "Himpunan pasangan berurutan menuliskan relasi sebagai kumpulan pasangan (x, y) di dalam kurung kurawal.",
        paragraphs: [
          "Unsur pertama setiap pasangan berasal dari domain, unsur kedua berasal dari kodomain. Urutan TIDAK boleh dibalik: (1, 2) berbeda artinya dengan (2, 1).",
          "Cara mengubah diagram panah menjadi pasangan berurutan: baca satu per satu panah dari kiri ke kanan. Panah 1 \u2192 2 ditulis (1, 2), panah 2 \u2192 4 ditulis (2, 4), panah 3 \u2192 6 ditulis (3, 6).",
          "Cara menentukan apakah suatu himpunan pasangan berurutan merupakan fungsi: periksa unsur PERTAMA. Tidak boleh ada dua pasangan dengan unsur pertama sama tetapi unsur kedua berbeda. Unsur pertama yang sama dengan unsur kedua sama pun sebenarnya hanya satu pasangan yang ditulis dua kali.",
        ],
        example: {
          title: "Contoh dari fungsi harga getuk",
          items: [
            "Diagram panah: 1 \u2192 2, 2 \u2192 4, 3 \u2192 6.",
            "Himpunan pasangan berurutan: {(1, 2), (2, 4), (3, 6)}.",
            "Domain = {1, 2, 3}; kodomain yang disediakan = {2, 4, 6, 8}; range = {2, 4, 6}.",
            "Ini FUNGSI karena setiap unsur pertama muncul tepat satu kali.",
          ],
        },
        diagram: CONSISTENT_DIAGRAM,
        question:
          "Bandingkan dengan {(1, 2), (1, 5), (2, 4)}. Unsur pertama 1 muncul dua kali dengan unsur kedua berbeda (2 dan 5), jadi himpunan itu BUKAN fungsi.",
        conclusion:
          "Diagram panah, koordinat Kartesius, dan himpunan pasangan berurutan adalah TIGA cara menuliskan relasi yang SAMA. Kalau bisa membaca salah satu, kamu bisa mengubahnya ke dua bentuk lainnya.",
      },
    },
    {
      menu_type: "materi",
      title: "Bagian 6 \u2013 Kapan Relasi Disebut Fungsi?",
      order_number: 9,
      is_active: true,
      content: {
        intro: "Bandingkan dua diagram panah berikut seperti seorang detektif!",
        diagrams: [
          {
            leftLabel: "Domain",
            rightLabel: "Kodomain",
            left: ["Andi", "Budi", "Citra"],
            right: ["Enting-enting", "Getuk", "Abon sapi"],
            arrows: [[0, 0], [1, 1], [2, 0]],
            verdict: "fungsi",
            note: "FUNGSI \u2013 setiap anggota domain punya tepat satu pasangan, walaupun abon sapi tidak mendapat pasangan.",
          },
          {
            leftLabel: "Domain",
            rightLabel: "Kodomain",
            left: ["Rina", "Dinda", "Sinta"],
            right: ["Pramuka", "Tari", "Basket"],
            arrows: [[0, 0], [1, 1], [2, 1], [2, 2]],
            verdict: "bukan",
            note: "BUKAN FUNGSI \u2013 Sinta memiliki dua pasangan berbeda (Tari dan Basket).",
          },
        ],
        conclusion:
          "Anggota kodomain yang tidak mendapat pasangan TIDAK membatalkan fungsi. Anggota domain yang bercabang atau tanpa pasangan AKAN membatalkan fungsi.",
      },
    },
    {
      menu_type: "materi",
      title: "Bagian 7 \u2013 Contoh Kontekstual Budaya Salatiga",
      order_number: 10,
      is_active: true,
      content: {
        intro: "Matematika ada di sekeliling kita. Berikut contoh relasi dan fungsi dari kehidupan masyarakat Salatiga.",
        bullets: [
          "Siswa \u2192 satu makanan khas Salatiga favoritnya: FUNGSI bila setiap siswa memilih tepat satu makanan.",
          "Siswa \u2192 kegiatan ekstrakurikuler: BUKAN fungsi bila ada siswa yang mengikuti dua kegiatan.",
          "Pengunjung \u2192 tempat wisata yang dikunjungi hari ini: FUNGSI bila setiap pengunjung berada di satu tempat pada waktu yang sama.",
          "Motif Batik Plumpungan \u2192 pola utamanya: FUNGSI karena setiap motif memiliki satu pola utama.",
        ],
        diagrams: [
          {
            leftLabel: "Pengunjung",
            rightLabel: "Tempat Wisata Salatiga",
            left: ["Pak Darmo", "Bu Sri", "Rani"],
            right: ["Rawa Pening", "Kopeng", "Taman Kalitaman"],
            arrows: [[0, 0], [1, 1], [2, 2]],
            verdict: "fungsi",
            note: "Setiap pengunjung dipasangkan dengan tepat satu tempat wisata \u2192 fungsi.",
          },
          {
            leftLabel: "Motif Batik",
            rightLabel: "Jenis Pola",
            left: ["Plumpungan", "Truntum", "Parang"],
            right: ["Geometris", "Flora", "Diagonal"],
            arrows: [[0, 0], [1, 1], [2, 2]],
            verdict: "fungsi",
            note: "Setiap motif memiliki tepat satu pola utama \u2192 fungsi.",
          },
        ],
        image: "/images/kuliner-salatiga.png",
        conclusion:
          "Dengan mengenali budaya Salatiga, kita belajar bahwa fungsi dipakai untuk memodelkan hubungan yang teratur dan pasti.",
      },
    },
    {
      menu_type: "materi",
      title: "Rangkuman Detektif Fungsi",
      order_number: 11,
      is_active: true,
      content: {
        intro: "Simpan catatan penting ini sebelum melanjutkan misi!",
        bullets: [
          "Relasi: hubungan antara anggota himpunan A dan anggota himpunan B dengan aturan bebas.",
          "Fungsi: relasi khusus yang memasangkan setiap anggota domain dengan tepat satu anggota kodomain.",
          "Setiap fungsi pasti relasi, tetapi tidak setiap relasi merupakan fungsi.",
          "Empat ciri: domain lengkap, domain tidak bercabang, domain boleh berbagi pasangan, kodomain boleh tidak terpakai.",
          "Domain = himpunan asal; kodomain = seluruh himpunan tujuan; range = anggota kodomain yang kena panah.",
          "Tiga cara penyajian: diagram panah, koordinat Kartesius (titik (x, y)), dan himpunan pasangan berurutan {(1, 2), (2, 4), (3, 6)}.",
        ],
        callout: {
          tone: "success",
          text: "Kamu sudah siap! Lanjutkan ke Misi Penyelidikan untuk membuktikan kemampuan detektifmu.",
        },
        image: "/images/mascot-detektif.png",
      },
    },
  ];
}
