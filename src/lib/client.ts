"use client";

export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
      cache: "no-store",
    });
  } catch {
    throw new Error("Koneksi ke server terputus. Periksa jaringan Anda lalu coba lagi.");
  }
  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    throw new Error(`Server membalas dengan status ${response.status}.`);
  }
  const body = payload as { ok?: boolean; data?: T; error?: string };
  if (!response.ok || body.ok === false) {
    throw new Error(body.error ?? `Permintaan gagal (status ${response.status}).`);
  }
  return (body.data ?? payload) as T;
}

export const post = <T,>(url: string, data: unknown) =>
  apiFetch<T>(url, { method: "POST", body: JSON.stringify(data ?? {}) });

export const patch = <T,>(url: string, data: unknown) =>
  apiFetch<T>(url, { method: "PATCH", body: JSON.stringify(data ?? {}) });

export const del = <T,>(url: string) => apiFetch<T>(url, { method: "DELETE" });

export function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
