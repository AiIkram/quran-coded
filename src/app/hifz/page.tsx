import Memorizer from "@/components/Memorizer";

export const metadata = {
  title: "مصحف الحفظ — ورش عن نافع من طريق الأزرق",
};

export default async function HifzPage({
  searchParams,
}: {
  searchParams: Promise<{ surah?: string; reciter?: string }>;
}) {
  const sp = await searchParams;
  const surah = Math.min(114, Math.max(1, parseInt(sp.surah ?? "1", 10) || 1));
  const reciter = sp.reciter ?? "yassen";
  return (
    <main className="zellige-light min-h-screen">
      <Memorizer initialSurah={surah} initialReciter={reciter} />
    </main>
  );
}
