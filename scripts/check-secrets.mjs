/**
 * FUNCTIA – pemeriksaan kebocoran kunci rahasia ke bundle browser.
 * Jalankan SETELAH `npm run build`:  node scripts/check-secrets.mjs
 *
 * Memindai `.next/static` (semua aset publik) dan memastikan tidak ada:
 *   - nilai environment SUPABASE_SECRET_KEY / SUPABASE_SERVICE_ROLE_KEY
 *   - nilai FUNCTIA_GATE_TOKEN / AUTH_SECRET
 *   - kunci berawalan sb_secret_
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const staticDir = join(root, ".next", "static");

function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    const full = join(dir, name);
    const stat = statSync(full);
    if (stat.isDirectory()) out.push(...walk(full));
    else if (/\.(js|css|html|txt|json|map)$/.test(name)) out.push(full);
  }
  return out;
}

const secretNames = [
  "SUPABASE_SECRET_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "FUNCTIA_GATE_TOKEN",
  "AUTH_SECRET",
];

const secrets = secretNames
  .map((name) => ({ name, value: process.env[name] }))
  .filter((item) => item.value && item.value.trim().length >= 8);

const files = walk(staticDir);
const findings = [];

for (const file of files) {
  let content;
  try {
    content = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  for (const { name, value } of secrets) {
    if (content.includes(value.trim())) findings.push(`${file}: mengandung nilai ${name}`);
  }
  if (/sb_secret_[A-Za-z0-9_\-]{10,}/.test(content)) {
    findings.push(`${file}: mengandung kunci sb_secret_`);
  }
}

console.log(`[FUNCTIA] Memeriksa ${files.length} berkas pada .next/static ...`);
if (findings.length) {
  console.error("[FUNCTIA] GAGAL — kunci rahasia terdeteksi pada bundle browser:");
  for (const finding of findings.slice(0, 20)) console.error(`  - ${finding}`);
  process.exit(1);
}
console.log("[FUNCTIA] AMAN — tidak ada kunci rahasia pada bundle browser.");
if (secrets.length === 0) {
  console.log("[FUNCTIA] Catatan: tidak ada kunci rahasia pada environment saat pemeriksaan ini.");
}
