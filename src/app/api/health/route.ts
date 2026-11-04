import { getStoreStatus } from "@/lib/store";
import { getSupabaseConfig } from "@/lib/store/supabase";

export const dynamic = "force-dynamic";

/**
 * Health check untuk Preview / deployment.
 * Tidak bergantung langsung pada DATABASE_URL, sehingga aplikasi tetap dapat
 * boot di runtime yang hanya memakai Supabase.
 *
 * Hanya mengembalikan KATEGORI sumber konfigurasi ("process" | "dotenv" | null)
 * dan status boolean — tidak pernah mengembalikan nilai kunci.
 */
export async function GET() {
  const config = getSupabaseConfig();
  const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 6000));
  const status = await Promise.race([getStoreStatus().catch(() => null), timeout]);

  return Response.json(
    {
      ok: true,
      app: "FUNCTIA",
      storage: {
        provider: status?.provider ?? (config.hasSupabaseHints ? "supabase" : "postgres"),
        mode: status?.mode ?? config.mode,
        configured: status?.configured ?? config.configured,
        online: status?.online ?? null,
        hasSupabaseHints: status?.hasSupabaseHints ?? config.hasSupabaseHints,
        dotEnvUsed: status?.dotEnvUsed ?? config.dotEnvUsed,
        sources: status?.sources ?? config.sources,
        keys: status?.keys ?? {
          url: Boolean(config.url),
          publishable: Boolean(config.publishableKey),
          anonLegacy: Boolean(config.anonKey),
          secret: Boolean(config.secretKey),
          serviceRoleLegacy: Boolean(config.serviceKey),
          gateToken: Boolean(config.gateToken),
        },
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
