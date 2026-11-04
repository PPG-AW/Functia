"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Card, Loader, cx } from "./ui";

type SetupCheck = { ok: boolean; count: number | null; error: string | null };
type SetupResponse = {
  verifiedAt: string;
  storage: {
    provider: string;
    mode: string;
    online: boolean;
    configured: boolean;
    message: string;
    warnings: string[];
  };
  checks: Record<string, SetupCheck>;
  allOperational: boolean;
};

const LABELS: Record<string, { label: string; desc: string }> = {
  identitas_siswa: {
    label: "Identitas siswa",
    desc: "Tabel students — nama, nomor absen, kelas",
  },
  sesi_pembelajaran: {
    label: "Sesi pembelajaran",
    desc: "Tabel learning_sessions — status, progres, waktu",
  },
  jawaban_misi_dan_uji: {
    label: "Jawaban Misi & Uji",
    desc: "Tabel student_answers — jawaban, alasan, skor",
  },
  refleksi_siswa: {
    label: "Refleksi siswa",
    desc: "Tabel student_reflections — perasaan & pemahaman",
  },
  bank_soal: { label: "Bank soal", desc: "Tabel questions — soal & kunci jawaban" },
  materi: { label: "Materi", desc: "Tabel learning_materials — Pahami Konsep" },
  portal_guru: {
    label: "Portal Guru",
    desc: "Tabel teacher_profiles + rekap hasil siswa",
  },
};

export function SetupStatusCard() {
  const [data, setData] = useState<SetupResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setBusy(true);
    try {
      const response = await fetch("/api/setup/status", { cache: "no-store" });
      if (!response.ok) throw new Error(`Server membalas ${response.status}`);
      setData((await response.json()) as SetupResponse);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pemeriksaan gagal.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-extrabold text-ink">Pemeriksaan koneksi langsung</h2>
          <p className="mt-1 text-xs text-ink/60">
            Endpoint <span className="font-mono">/api/setup/status</span> menguji setiap tabel yang dipakai
            aplikasi. Tidak ada kunci rahasia yang ditampilkan.
          </p>
        </div>
        <Button size="sm" variant="secondary" loading={busy} onClick={() => void load()}>
          🔄 Periksa Ulang
        </Button>
      </div>

      {!data && !error ? <Loader label="Menguji koneksi basis data..." /> : null}
      {error ? (
        <p className="mt-4 rounded-2xl bg-coral-soft px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </p>
      ) : null}

      {data ? (
        <div className="mt-4 space-y-3">
          <div
            className={cx(
              "flex flex-wrap items-center justify-between gap-2 rounded-2xl px-4 py-3 text-xs font-bold",
              data.allOperational ? "bg-aqua-soft text-teal-800" : "bg-sun-soft text-amber-800",
            )}
          >
            <span>
              {data.allOperational
                ? "🟢 Seluruh penyimpanan FUNCTIA siap digunakan."
                : "🟡 Sebagian pemeriksaan belum berhasil — lihat rincian di bawah."}
            </span>
            <span className="font-normal opacity-75">
              {new Date(data.verifiedAt).toLocaleTimeString("id-ID")}
            </span>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {Object.entries(LABELS).map(([key, info]) => {
              const check = data.checks[key];
              return (
                <div
                  key={key}
                  className={cx(
                    "rounded-2xl border-2 px-4 py-3",
                    check?.ok ? "border-aqua/30 bg-aqua-soft/40" : "border-coral/30 bg-coral-soft/40",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-display text-sm font-extrabold text-ink">{info.label}</p>
                    <Badge tone={check?.ok ? "aqua" : "coral"}>
                      {check?.ok ? "Terhubung" : "Gagal"}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-[11px] text-ink/55">{info.desc}</p>
                  {check?.ok && check.count !== null ? (
                    <p className="mt-1 text-[11px] font-semibold text-ink/60">
                      {check.count} baris data nyata
                    </p>
                  ) : null}
                  {check?.error ? (
                    <p className="mt-1 break-words text-[11px] font-semibold text-rose-700">
                      {check.error}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>

          {data.storage.warnings.length ? (
            <ul className="space-y-1.5 rounded-2xl bg-sun-soft px-4 py-3 text-[11px] font-semibold text-amber-800">
              {data.storage.warnings.map((warning, index) => (
                <li key={index}>• {warning}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}
