import { api } from "@/lib/api";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return api(async () => {
    const s = await store();
    const materials = await s.listMaterials();
    return { materials };
  });
}
