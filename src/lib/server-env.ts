import "server-only";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

/**
 * Resolver environment variables KHUSUS SERVER.
 *
 * Latar belakang: pada runtime Preview yang dikelola platform, variabel yang
 * ditulis ke `.env` tidak selalu masuk ke `process.env` proses Next.js.
 * Modul ini tetap membaca process.env (prioritas utama), lalu `.env` /
 * `.env.local` dari direktori kerja sebagai fallback.
 *
 * `server-only` memastikan berkas ini tidak pernah ikut ke bundle browser.
 * Fungsi di bawah hanya mengembalikan NILAI kepada modul server lain dan
 * KATEGORI SUMBER ("process" | "dotenv" | null) untuk diagnostik. Tidak ada
 * nilai yang boleh disertakan ke respons API atau dirender ke halaman.
 */

export type EnvSource = "process" | "dotenv" | null;

let dotEnvCache: Record<string, string> | null = null;

function parseDotEnv(text: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key) result[key] = value;
  }
  return result;
}

function loadDotEnv(): Record<string, string> {
  if (dotEnvCache) return dotEnvCache;

  const merged: Record<string, string> = {};
  const roots = new Set<string>();

  let directory = process.cwd();
  for (let level = 0; level < 4; level += 1) {
    roots.add(directory);
    const parent = resolve(directory, "..");
    if (parent === directory) break;
    directory = parent;
  }
  if (process.env.PWD) roots.add(process.env.PWD);

  for (const root of roots) {
    for (const fileName of [".env.local", ".env"]) {
      try {
        Object.assign(merged, parseDotEnv(readFileSync(join(root, fileName), "utf8")));
      } catch {
        // Berkas tidak ada / tidak dapat dibaca: abaikan tanpa menggagalkan aplikasi.
      }
    }
  }

  dotEnvCache = merged;
  return merged;
}

/** Mengembalikan nilai env untuk kode server. Tidak untuk dikirim ke klien. */
export function serverEnv(name: string): string | null {
  const direct = process.env[name];
  if (typeof direct === "string" && direct.trim().length > 0) return direct.trim();
  const fromFile = loadDotEnv()[name];
  if (typeof fromFile === "string" && fromFile.trim().length > 0) return fromFile.trim();
  return null;
}

/** Hanya kategori sumber, aman untuk ditampilkan pada diagnostik. */
export function serverEnvSource(name: string): EnvSource {
  const direct = process.env[name];
  if (typeof direct === "string" && direct.trim().length > 0) return "process";
  const fromFile = loadDotEnv()[name];
  if (typeof fromFile === "string" && fromFile.trim().length > 0) return "dotenv";
  return null;
}

export function hasDotEnvFile(): boolean {
  return Object.keys(loadDotEnv()).length > 0;
}
