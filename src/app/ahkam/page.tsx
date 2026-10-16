import Link from "next/link";
import { WARSH_RULES } from "@/data/warsh";

export const metadata = { title: "أحكام ورش عن نافع من طريق الأزرق" };

export default function AhkamPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="glass relative overflow-hidden rounded-[28px] p-8 text-center md:p-12">
        <img
          src="images/zellige-detail.jpg"
          alt="تفصيل زخرفة مغربية مذهّبة من مخطوطة"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#FAF9F5]/70 via-[#FAF9F5]/85 to-[#FAF9F5]" />
        <div className="relative">
          <div className="inline-block rounded-full bg-[#0E5A45] px-4 py-1 text-xs font-bold text-[#FFFFFF]">
            دروس التجويد الورشي
          </div>
          <h1 className="font-display mt-4 text-4xl font-bold md:text-5xl">
            أحكام ورش عن نافع <span className="gold-text">من طريق الأزرق</span>
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-8 text-[#16221E]/85">
            خلاصة ما يلزم الحافظ: البدل، النقل، التقليل، الترقيق، الإبدال، الصلة، والمدود المشبعة.
            احفظ القاعدة ثم طبّقها فوراً في مصحف الحفظ بالاستماع لقارئ ورش.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Link href="/hifz?surah=1" className="btn-gold rounded-2xl px-6 py-3 text-sm">طبّق في الفاتحة</Link>
            <Link href="/hifz?surah=2" className="btn-ghost rounded-2xl px-6 py-3 text-sm font-bold">طبّق في البقرة</Link>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {WARSH_RULES.map((r, i) => (
          <article key={r.id} className="glass rounded-3xl p-6 md:p-8">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-[#6C7A73]">
                  القاعدة {["١", "٢", "٣", "٤", "٥", "٦", "٧", "٨"][i]} • {r.title}
                </div>
                <h2 className="font-display mt-1 text-2xl font-bold text-[#0E5A45]">{r.arabicTitle}</h2>
              </div>
              <span className="font-quran grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#0E5A45] to-[#0A3A2C] text-2xl text-[#FFFFFF]">
                ۝
              </span>
            </div>
            <p className="mt-3 rounded-2xl border border-[#A87B2A]/25 bg-[#0E5A45]/5 p-4 text-sm font-bold leading-8 text-[#16221E]">
              {r.summary}
            </p>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <div className="rounded-2xl border border-black/[0.08] bg-[#FFFFFF] p-4">
                <div className="text-[11px] font-bold text-[#6C7A73]">المثال</div>
                <div className="font-quran mt-1 text-2xl text-[#1B2A25]">{r.example}</div>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-[#0E5A45] to-[#0A3A2C] p-4 text-[#FFFFFF]">
                <div className="text-[11px] font-bold">كيف تُقرأ بورش</div>
                <div className="mt-1 text-sm font-bold leading-7">{r.exampleWarsh}</div>
              </div>
            </div>
            <p className="mt-3 text-[13px] leading-8 text-[#56655E]">{r.detail}</p>
          </article>
        ))}
      </div>

      <div className="glass mt-8 rounded-3xl border-[#0E5A45]/40 p-6 md:p-8">
        <h3 className="font-display text-xl font-bold text-[#0E5A45]">نصيحة الشيخ للحفاظ (طريقة الكُتّاب)</h3>
        <ol className="mt-4 grid gap-3 text-sm leading-8 md:grid-cols-3">
          {[
            ["التلقي أولاً", "لا تحفظ آية جديدة قبل سماعها من قارئ ورش مع النظر في الرسم الورشي."],
            ["وجه واحد", "الزم توسط البدل (٤ حركات) وإشباع المدود (٦ حركات) في ختمتك كلها."],
            ["السرد اليومي", "ثبّت المحفوظ بصلاة النافلة، ولوحة التقدم تذكّرك بالمراجعة تلقائياً."],
          ].map(([t, d], i) => (
            <li key={t} className="rounded-2xl bg-black/[0.035] p-4">
              <b className="text-[#0E5A45]">{["١", "٢", "٣"][i]}. {t}:</b>{" "}
              <span className="text-[#56655E]">{d}</span>
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
}
