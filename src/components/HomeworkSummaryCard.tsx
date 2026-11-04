"use client";

import Link from "next/link";
import { Badge, Button, Card } from "@/components/ui";
import { useApi } from "@/hooks/useApi";

type Response = {
  summary: {
    totalStudents: number;
    working: number;
    submitted: number;
    inProgress: number;
    averageScore: number;
  };
};

/** Bagian Tugas Rumah pada rekap Portal Guru. Tidak mengubah rekap lama. */
export function HomeworkSummaryCard() {
  const { data, loading } = useApi<Response>("/api/teacher/homework");
  const summary = data?.summary;

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Badge tone="grape">📝 Tugas Rumah</Badge>
          <h2 className="mt-2 font-display text-base font-extrabold text-ink">
            Rekap Tugas Rumah
          </h2>
          <p className="mt-1 text-xs text-ink/60">
            Terpisah dari rekap Misi Penyelidikan dan Uji Pemahaman.
          </p>
        </div>
        <Link href="/guru/tugas-rumah">
          <Button size="sm" variant="secondary">
            Lihat Rekap →
          </Button>
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Mini label="Siswa mengerjakan" value={loading ? "…" : String(summary?.working ?? 0)} />
        <Mini label="Dikumpulkan" value={loading ? "…" : String(summary?.submitted ?? 0)} />
        <Mini label="Masih draf" value={loading ? "…" : String(summary?.inProgress ?? 0)} />
        <Mini label="Rata-rata nilai" value={loading ? "…" : String(summary?.averageScore ?? 0)} />
      </div>
    </Card>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-grape-soft/60 px-3 py-2.5">
      <p className="text-[10px] font-black uppercase tracking-widest text-ink/55">{label}</p>
      <p className="mt-0.5 font-display text-lg font-extrabold text-ink">{value}</p>
    </div>
  );
}
