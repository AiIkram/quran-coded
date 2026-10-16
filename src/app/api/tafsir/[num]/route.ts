import { NextResponse } from "next/server";

export async function GET(_: Request, ctx: { params: Promise<{ num: string }> }) {
  const { num } = await ctx.params;
  const n = Math.min(114, Math.max(1, parseInt(num, 10) || 1));
  try {
    const r = await fetch(`https://api.alquran.cloud/v1/surah/${n}/ar.muyassar`, {
      next: { revalidate: 86400 },
    });
    if (!r.ok) throw new Error("upstream");
    const j = await r.json();
    const map: Record<number, string> = {};
    for (const a of j?.data?.ayahs ?? []) map[a.number] = a.text as string;
    if (!Object.keys(map).length) throw new Error("empty");
    return NextResponse.json({
      surah: n,
      source: "التفسير المختصر (التيسير الكريم الرحمن)",
      ayahs: map,
    });
  } catch {
    return NextResponse.json({ surah: n, source: "", ayahs: {}, error: true });
  }
}
