"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/client";

export function useApi<T>(url: string) {
  const router = useRouter();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<T>(url);
      setData(res);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal memuat data.";
      if (/masuk sebagai guru/i.test(message)) {
        router.replace("/guru");
        return;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [url, router]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, reload: load };
}
