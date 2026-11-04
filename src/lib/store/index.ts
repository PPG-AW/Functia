import "server-only";
import { getSupabaseConfig, SupabaseStore } from "./supabase";
import type { EnvSource } from "@/lib/server-env";
import type { SupabaseKeyMode } from "./supabase";
import type { Store, StoreProvider } from "./types";

export * from "./types";

let cached: Store | null = null;
let seeded = false;

export type StoreStatus = {
  provider: StoreProvider;
  configured: boolean;
  online: boolean;
  message: string;
  mode: SupabaseKeyMode | "postgres";
  warnings: string[];
  keys: {
    url: boolean;
    publishable: boolean;
    anonLegacy: boolean;
    secret: boolean;
    serviceRoleLegacy: boolean;
    gateToken: boolean;
  };
  /** Kategori sumber nilai, BUKAN nilainya: "process" | "dotenv" | null. */
  sources: {
    url: EnvSource;
    publishableKey: EnvSource;
    secretKey: EnvSource;
    authSecret: EnvSource;
  };
  dotEnvUsed: boolean;
  hasSupabaseHints: boolean;
};

/**
 * Mengembalikan store aktif.
 *
 * - Konfigurasi Supabase lengkap  -> Supabase (WAJIB, tanpa fallback).
 * - Ada indikasi Supabase tapi konfigurasi belum lengkap -> ERROR, tidak boleh
 *   diam-diam jatuh ke PostgreSQL lokal (mencegah data siswa tersimpan di
 *   database yang salah).
 * - Benar-benar tanpa konfigurasi Supabase -> PostgreSQL lokal (development).
 */
export async function store(): Promise<Store> {
  const config = getSupabaseConfig();

  if (config.hasSupabaseHints && !config.configured) {
    throw new StorageError(
      "Konfigurasi Supabase terdeteksi tetapi belum lengkap. Lengkapi SUPABASE_URL dan kunci Supabase; penyimpanan sengaja tidak dialihkan ke PostgreSQL lokal agar data siswa tidak masuk ke database yang salah.",
      503,
    );
  }

  const provider: StoreProvider = config.configured ? "supabase" : "postgres";

  if (!cached || cached.provider !== provider) {
    cached = config.configured ? new SupabaseStore() : new (await import("./postgres")).PostgresStore();
    seeded = false;
  }
  if (!seeded) {
    // Jika seeding gagal, biarkan error diteruskan. Tidak ada fallback ke
    // PostgreSQL lokal setelah Supabase dipilih.
    await cached.ensureSeed();
    seeded = true;
  }
  return cached;
}

export async function getStoreStatus(): Promise<StoreStatus> {
  const config = getSupabaseConfig();
  const keys = {
    url: Boolean(config.url),
    publishable: Boolean(config.publishableKey),
    anonLegacy: Boolean(config.anonKey),
    secret: Boolean(config.secretKey),
    serviceRoleLegacy: Boolean(config.serviceKey),
    gateToken: Boolean(config.gateToken),
  };
  const sources = config.sources;

  if (config.configured) {
    try {
      const s = new SupabaseStore();
      const online = await s.ping();
      return {
        provider: "supabase",
        configured: true,
        online,
        mode: config.mode,
        warnings: config.warnings,
        keys,
        sources,
        dotEnvUsed: config.dotEnvUsed,
        hasSupabaseHints: true,
        message: online
          ? `Terhubung ke Supabase (${config.mode === "secret" ? "kunci secret server-side" : "kunci publishable + gate RLS"}). Identitas siswa, sesi, jawaban, dan refleksi tersimpan pada proyek Supabase Anda.`
          : "Supabase terkonfigurasi tetapi tidak dapat dihubungi. Periksa SUPABASE_URL, kunci server, tabel, serta kebijakan RLS.",
      };
    } catch (error) {
      return {
        provider: "supabase",
        configured: true,
        online: false,
        mode: config.mode,
        warnings: config.warnings,
        keys,
        sources,
        dotEnvUsed: config.dotEnvUsed,
        hasSupabaseHints: true,
        message: error instanceof Error ? error.message : "Gagal menghubungkan Supabase.",
      };
    }
  }

  // Konfigurasi Supabase mulai diisi tetapi belum valid: jangan laporkan
  // "postgres" seolah-olah tidak ada Supabase sama sekali.
  if (config.hasSupabaseHints) {
    return {
      provider: "supabase",
      configured: false,
      online: false,
      mode: config.mode,
      warnings: [
        ...config.warnings,
        "Konfigurasi Supabase belum lengkap. Penyimpanan tidak dialihkan ke PostgreSQL lokal.",
      ],
      keys,
      sources,
      dotEnvUsed: config.dotEnvUsed,
      hasSupabaseHints: true,
      message:
        "Konfigurasi Supabase terdeteksi tetapi belum lengkap. Lengkapi SUPABASE_URL dan kunci Supabase agar data siswa tersimpan ke Supabase.",
    };
  }

  const postgresWarnings = [
    ...config.warnings,
    "Supabase belum dikonfigurasi: isi SUPABASE_URL + kunci Supabase dan jalankan supabase/schema.sql.",
  ];
  try {
    const s = new (await import("./postgres")).PostgresStore();
    const online = await s.ping();
    return {
      provider: "postgres",
      configured: true,
      online,
      mode: "postgres",
      warnings: postgresWarnings,
      keys,
      sources,
      dotEnvUsed: config.dotEnvUsed,
      hasSupabaseHints: false,
      message: online
        ? "Supabase belum dikonfigurasi. Data disimpan pada basis data PostgreSQL server ini (struktur tabel identik dengan Supabase)."
        : "Koneksi basis data PostgreSQL terputus.",
    };
  } catch (error) {
    return {
      provider: "postgres",
      configured: false,
      online: false,
      mode: "postgres",
      warnings: postgresWarnings,
      keys,
      sources,
      dotEnvUsed: config.dotEnvUsed,
      hasSupabaseHints: false,
      message: error instanceof Error ? error.message : "Basis data tidak tersedia.",
    };
  }
}

export class StorageError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

export async function withStore<T>(fn: (s: Store) => Promise<T>): Promise<T> {
  const s = await store();
  try {
    return await fn(s);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Terjadi kesalahan penyimpanan data.";
    throw new StorageError(message, 503);
  }
}
