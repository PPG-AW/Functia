"use client";

import { QuizPlayer } from "@/components/QuizPlayer";
import { Loader } from "@/components/ui";
import { useStudentSession } from "@/hooks/useStudentSession";

export default function MisiPenyelidikanPage() {
  const { data, loading } = useStudentSession();

  if (loading || !data) return <Loader label="Memeriksa progres belajarmu..." />;

  return (
    <QuizPlayer
      menu="misi"
      icon="🕵️"
      title="Misi Penyelidikan"
      subtitle="Detektif Fungsi"
      accent="from-coral to-rose-400"
      description="Tentukan apakah relasi pada cerita merupakan fungsi, lalu pilih alasan yang paling tepat."
      locked={!data.materiDone}
      lockMessage="Misi ini terbuka setelah kamu menyelesaikan menu Pahami Konsep. Pelajari dulu ciri-ciri fungsi agar penyelidikanmu berhasil!"
      lockHref="/belajar/pahami-konsep"
      lockCta="Buka Pahami Konsep"
      nextHref="/belajar/uji-pemahaman"
      nextLabel="Lanjut ke Uji Pemahaman"
    />
  );
}
