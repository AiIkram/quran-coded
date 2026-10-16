import { NextResponse } from "next/server";
import { RECITERS } from "@/lib/audio";

export async function GET() {
  try {
    const r = await fetch("https://www.mp3quran.net/api/v3/reciters?language=ar", {
      next: { revalidate: 86400 },
    });
    if (!r.ok) throw new Error("upstream");
    const j = await r.json();
    const reciters = (j.reciters ?? []) as Array<{
      id: number;
      name: string;
      moshaf: Array<{ name: string; server: string; surah_total: number; surah_list: string }>;
    }>;
    const warsh: Array<Record<string, unknown>> = [];
    for (const rec of reciters) {
      for (const m of rec.moshaf ?? []) {
        if (m.name.includes("ورش")) {
          warsh.push({
            id: rec.id,
            name: rec.name,
            moshafName: m.name,
            server: m.server,
            total: m.surah_total,
            azraq: m.name.includes("الأزرق"),
            surahList: m.surah_list,
          });
          break;
        }
      }
    }
    warsh.sort((a, b) => Number(b.azraq) - Number(a.azraq));
    return NextResponse.json({ reciters: warsh, curated: RECITERS, count: warsh.length });
  } catch {
    return NextResponse.json({ reciters: [], curated: RECITERS, count: RECITERS.length, fallback: true });
  }
}
