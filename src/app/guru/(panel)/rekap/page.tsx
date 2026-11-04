"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge, Button, Card, EmptyState, Loader, ProgressBar, cx, inputClass } from "@/components/ui";
import { useApi } from "@/hooks/useApi";
import { formatDate } from "@/lib/client";
import type { RecapRow } from "@/lib/recap";

type Overview = { classes: string[]; recap: RecapRow[] };

export default function RekapPage() {
  const { data, loading, error, reload } = useApi<Overview>("/api/teacher/overview");
  const [query, setQuery] = useState("");
  const [kelas, setKelas] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const rows = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    return data.recap.filter((row) => {
      const matchQ = !q || row.student.name.toLowerCase().includes(q);
      const matchKelas = !kelas || row.student.class_name === kelas;
      const matchStatus = !statusFilter || row.status === statusFilter;
      return matchQ && matchKelas && matchStatus;
    });
  }, [data, query, kelas, statusFilter]);

  if (loading) return <Loader label="Menyusun rekap hasil siswa..." />;
  if (error || !data)
    return (
      <div className="space-y-4">
        <EmptyState icon="⚠️" title="Rekap tidak dapat dimuat" description={error ?? undefined} />
        <div className="flex justify-center">
          <Button onClick={() => void reload()}>Coba Lagi</Button>
        </div>
      </div>
    );

  const exportUrl = `/api/teacher/export?class=${encodeURIComponent(kelas)}&q=${encodeURIComponent(query)}`;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Badge tone="brand">Rekap Hasil Siswa</Badge>
          <h1 className="mt-2 font-display text-2xl font-extrabold text-ink">Rekap Pengerjaan</h1>
          <p className="text-sm text-ink/60">
            Menampilkan {rows.length} dari {data.recap.length} siswa. Klik nama untuk membuka detail
            jawaban.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={exportUrl} download>
            <Button variant="success" size="sm">
              ⬇️ Ekspor CSV
            </Button>
          </a>
          <Link href="/guru/siswa">
            <Button variant="secondary" size="sm">
              Data Siswa
            </Button>
          </Link>
        </div>
      </div>

      <Card className="p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-ink/50">
              Cari nama siswa
            </label>
            <input
              className={cx(inputClass, "mt-1")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Contoh: Andi"
            />
          </div>
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-ink/50">Filter kelas</label>
            <select className={cx(inputClass, "mt-1")} value={kelas} onChange={(e) => setKelas(e.target.value)}>
              <option value="">Semua kelas</option>
              {data.classes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-ink/50">Status</label>
            <select
              className={cx(inputClass, "mt-1")}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Semua status</option>
              <option value="Selesai">Selesai</option>
              <option value="Sedang Dikerjakan">Sedang Dikerjakan</option>
              <option value="Belum Mulai">Belum Mulai</option>
            </select>
          </div>
        </div>
        {(query || kelas || statusFilter) && (
          <button
            type="button"
            className="mt-3 text-xs font-bold text-brand-dark underline underline-offset-2"
            onClick={() => {
              setQuery("");
              setKelas("");
              setStatusFilter("");
            }}
          >
            Reset filter
          </button>
        )}
      </Card>

      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-brand-soft/60 text-[11px] uppercase tracking-wide text-brand-dark">
              <tr>
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">Nama Siswa</th>
                <th className="px-4 py-3">Absen</th>
                <th className="px-4 py-3">Kelas</th>
                <th className="px-4 py-3">Status Pengerjaan</th>
                <th className="px-4 py-3">Hasil Misi</th>
                <th className="px-4 py-3">Hasil Uji</th>
                <th className="px-4 py-3">Waktu Pengerjaan</th>
                <th className="px-4 py-3">Refleksi</th>
                <th className="px-4 py-3">Detail</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.student.id} className="border-t border-slate-100 transition hover:bg-brand-soft/30">
                  <td className="px-4 py-3 text-ink/60">{row.no}</td>
                  <td className="px-4 py-3 font-bold text-ink">{row.student.name}</td>
                  <td className="px-4 py-3 text-ink/70">{row.student.attendance_number}</td>
                  <td className="px-4 py-3 text-ink/70">{row.student.class_name}</td>
                  <td className="px-4 py-3">
                    <Badge
                      tone={row.status === "Selesai" ? "aqua" : row.status === "Sedang Dikerjakan" ? "sun" : "slate"}
                    >
                      {row.status}
                    </Badge>
                    <div className="mt-1.5 flex items-center gap-2">
                      <ProgressBar value={row.session?.progress ?? 0} className="h-1.5 w-20" />
                      <span className="text-[11px] font-bold text-ink/50">{row.session?.progress ?? 0}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-display font-extrabold text-ink">
                      {row.misi.answered ? row.misi.score : "-"}
                    </p>
                    <p className="text-[11px] text-ink/55">
                      {row.misi.answered}/{row.misi.total} soal · {row.misi.correct} tepat
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-display font-extrabold text-ink">{row.uji.answered ? row.uji.score : "-"}</p>
                    <p className="text-[11px] text-ink/55">
                      {row.uji.answered}/{row.uji.total} soal · {row.uji.correct} tepat
                    </p>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink/65">
                    {row.durationMinutes !== null ? `${row.durationMinutes} menit` : "-"}
                    <span className="block text-[11px] text-ink/45">{formatDate(row.lastActivity)}</span>
                  </td>
                  <td className="px-4 py-3">
                    {row.reflection ? (
                      <Badge tone="grape">Sudah</Badge>
                    ) : (
                      <Badge tone="slate">Belum</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/guru/siswa/${row.student.id}`}>
                      <Button size="sm" variant="secondary">
                        Lihat
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!rows.length ? (
          <div className="p-6">
            <EmptyState
              icon="🔍"
              title="Tidak ada data yang cocok"
              description="Ubah kata kunci pencarian atau filter kelas untuk melihat rekap siswa."
            />
          </div>
        ) : null}
      </Card>
    </div>
  );
}
