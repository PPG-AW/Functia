import { NextResponse } from "next/server";
import { AuthError } from "./auth";
import { StorageError } from "./store";

export type ApiSuccess<T> = { ok: true; data: T };
export type ApiFailure = { ok: false; error: string };
export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

export async function api<T>(fn: () => Promise<T>): Promise<NextResponse<ApiResult<T>>> {
  try {
    const data = await fn();
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    }
    const status = (error as { status?: number }).status;
    if (error instanceof StorageError || error instanceof ApiValidationError || typeof status === "number") {
      return NextResponse.json(
        { ok: false, error: error instanceof Error ? error.message : "Permintaan tidak valid." },
        { status: status ?? 400 },
      );
    }
    const message = error instanceof Error ? error.message : "Terjadi kesalahan pada server.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message } satisfies ApiFailure, { status });
}

export function readJson(body: unknown): Record<string, unknown> {
  return body && typeof body === "object" ? (body as Record<string, unknown>) : {};
}

export function str(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) throw new ApiValidationError(`${field} wajib diisi.`);
  return value.trim();
}

export function num(value: unknown, field: string, min: number, max: number): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) throw new ApiValidationError(`${field} harus berupa angka.`);
  if (parsed < min || parsed > max) {
    throw new ApiValidationError(`${field} harus berada di rentang ${min}–${max}.`);
  }
  return Math.round(parsed);
}

export class ApiValidationError extends Error {
  status = 400;
  constructor(message: string) {
    super(message);
  }
}
