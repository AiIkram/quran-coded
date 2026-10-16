import { NextResponse } from "next/server";
import { getSurahWarsh, globalAyahNumber } from "@/lib/quran";
import { getSurah } from "@/data/surahs";

export async function GET(_: Request, ctx: { params: Promise<{ num: string }> }) {
  const { num } = await ctx.params;
  const n = Math.min(114, Math.max(1, parseInt(num, 10) || 1));
  try {
    const ayahs = await getSurahWarsh(n);
    const meta = getSurah(n);
    const data = ayahs.map((a) => ({
      surah: a.chapter,
      ayah: a.verse,
      text: a.text,
      global: globalAyahNumber(a.chapter, a.verse),
    }));
    return NextResponse.json({ surah: meta, ayahs: data, riwaya: "ورش عن نافع من طريق الأزرق" });
  } catch {
    return NextResponse.json({ error: "تعذّر تحميل النص الورشي" }, { status: 502 });
  }
}
