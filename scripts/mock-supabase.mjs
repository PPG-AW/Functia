/**
 * Server tiruan PostgREST untuk MENGUJI jalur kode Supabase FUNCTIA tanpa
 * kredensial project sungguhan. Tidak menyimpan data apa pun dan tidak dipakai
 * pada aplikasi produksi.
 *
 *   node scripts/mock-supabase.mjs            # port 54321
 *
 * Endpoint /__headers menampilkan header yang diterima, untuk memverifikasi:
 *   - mode publishable memakai kunci publishable + header x-functia-gate
 *   - mode secret memakai kunci secret HANYA di server
 */
import { createServer } from "node:http";

const PORT = Number(process.env.MOCK_SUPABASE_PORT ?? 54321);
const seen = [];

createServer((req, res) => {
  if (req.url === "/__headers") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(seen.slice(-30), null, 2));
    return;
  }
  if (req.url === "/__reset") {
    seen.length = 0;
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end("{}");
    return;
  }

  seen.push({
    method: req.method,
    url: req.url,
    apikey: req.headers.apikey ?? null,
    gate: req.headers["x-functia-gate"] ?? null,
  });

  // Supabase count/head request: beri jumlah > 0 agar seed konten tidak diulang.
  res.setHeader("Content-Range", "0-0/6");
  res.setHeader("Content-Type", "application/json");
  if (req.method === "HEAD") {
    res.writeHead(200);
    res.end();
    return;
  }
  res.writeHead(200);
  res.end("[]");
}).listen(PORT, "127.0.0.1", () => {
  console.log(`[mock-supabase] listening on http://127.0.0.1:${PORT}`);
});
