"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/client";
import { emitRefresh } from "@/lib/bus";
import type { SessionResponse, StudentPayload } from "@/lib/types-api";

export function useStudentSession() {
  const router = useRouter();
  const [data, setData] = useState<StudentPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<SessionResponse>("/api/session");
      if (!res.authenticated) {
        router.replace("/#masuk-siswa");
        return;
      }
      const { authenticated: _auth, ...payload } = res;
      setData(payload);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data sesi.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
    const handler = () => void load();
    window.addEventListener(REFRESH_LOCAL, handler);
    return () => window.removeEventListener(REFRESH_LOCAL, handler);
  }, [load]);

  const update = useCallback(
    async (patch: Record<string, unknown>) => {
      const res = await apiFetch<{ authenticated: true } & StudentPayload>("/api/session", {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      const { authenticated: _auth, ...payload } = res;
      setData(payload);
      emitRefresh();
      return payload;
    },
    [],
  );

  return { data, loading, error, reload: load, update };
}

const REFRESH_LOCAL = "functia:refresh-local";
export const REFRESH_EVENT_LOCAL = REFRESH_LOCAL;
