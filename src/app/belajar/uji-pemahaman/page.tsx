"use client";

import { QuizPlayer } from "@/components/QuizPlayer";
import { Loader } from "@/components/ui";
import { useStudentSession } from "@/hooks/useStudentSession";

export default function UjiPemahamanPage() {
  const { data, loading } = useStudentSession();

  if (loading || !data) return <Loader label="Memeriksa progres belajarmu..." />;

  // Uji Pemahaman terbuka langsung, tanpa syarat menyelesaikan Misi Penyelidikan.
  return (
    <QuizPlayer
      menu="uji"
      icon="🎯"
      title="Uji Pemahaman"
      subtitle="Tantangan Detektif Fungsi"
      accent="from-sun to-amber-400"
      description="Analisis relasi dan fungsi berikut. Nilai akhir ditentukan oleh ketepatan jawaban DAN alasan."
      locked={false}
      nextHref="/belajar/refleksi"
      nextLabel="Lanjut ke Refleksi"
    />
  );
}
