import Link from "next/link";
import { SURAHS, TOTAL_AYAHS } from "@/data/surahs";
import { RECITERS, AYAH_VOICES, ayahAudioUrl } from "@/lib/audio";
import { WARSH_RULES, MEMORIZE_STEPS } from "@/data/warsh";

export const dynamic = "force-dynamic";

function NativePlayer({ src, label }: { src: string; label: string }) {
  return (
    <div className="rounded-2xl border border-[#A87B2A]/25 bg-[#FFFFFF] p-3">
      <div className="mb-2 text-xs font-bold text-[#8C6522]">{label}</div>
      <audio controls preload="none" src={src} playsInline className="native-dark" />
    </div>
  );
}

export default function HomePage() {
  const yassinAyah1 = ayahAudioUrl(AYAH_VOICES[0].subfolder, 1, 1);
  const yassinAyah2 = ayahAudioUrl(AYAH_VOICES[0].subfolder, 112, 1);

  return (
    <main>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.05]">
          <span className="font-quran text-[42rem] leading-none text-[#0E5A45]">۝</span>
        </div>
        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-12 md:pt-16">
          <div className="grid items-center gap-10 md:grid-cols-[1.05fr_0.95fr]">
            <div className="text-right">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#A87B2A]/40 bg-black/[0.035] px-5 py-2 text-[13px] font-bold text-[#0E5A45]">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#0F766E]" />
                النص الورشي الأصيل • صوت ياسين الجزائري آيةً آية
              </div>
              <h1 className="font-display mt-6 text-4xl font-bold leading-[1.6] sm:text-5xl md:text-6xl md:leading-[1.55]">
                احفظ القرآن <span className="gold-text">برواية ورش</span>
                <br />
                عن نافع <span className="text-[#0F766E]">من طريق الأزرق</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-9 text-[#6C7A73] md:text-lg">
                مصحف ليلي مريح للعين، تكرار تلقائي للآيات بصوت ورشي حقيقي،
                وضع اختبار بالتغطية، ومراجعة ذكية — على طريقة الكتاتيب المغاربية.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/hifz" className="btn-gold rounded-2xl px-8 py-4 text-base">
                  ◈ ابدأ الحفظ — سورة الفاتحة
                </Link>
                <Link href="/reciters" className="btn-ghost rounded-2xl px-8 py-4 text-base font-bold">
                  استمع للقراء
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap gap-2 text-[11px] font-bold text-[#6C7A73]">
                <span className="chip rounded-full px-3 py-1.5">مد البدل ٤ حركات</span>
                <span className="chip rounded-full px-3 py-1.5">النقل</span>
                <span className="chip rounded-full px-3 py-1.5">صلة الميم</span>
                <span className="chip rounded-full px-3 py-1.5">ترقيق الراء</span>
              </div>
            </div>

            <div className="relative">
              <div className="plate relative overflow-hidden rounded-[32px]">
                <img
                  src="images/hero-mushaf.jpg"
                  alt="مصحف مغربي مفتوح على رحل خشبي في ضوء المصباح"
                  className="h-[300px] w-full object-cover sm:h-[380px] md:h-[460px]"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#FAF9F5] via-[#FAF9F5]/15 to-transparent" />
                <div className="absolute inset-x-4 bottom-4 flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-black/60 px-4 py-1.5 text-[11px] font-bold text-[#0E5A45] backdrop-blur">
                    مصحف مغربي • ١٥ سطراً
                  </span>
                  <span className="rounded-full bg-black/60 px-4 py-1.5 text-[11px] font-bold text-[#F3E7CE] backdrop-blur">
                    رسم ورش الأصيل ✓
                  </span>
                </div>
              </div>
              <div className="absolute -top-5 -left-4 hidden rounded-2xl border border-[#A87B2A]/40 bg-[#0A1219]/95 px-4 py-2.5 text-[11px] font-bold text-[#0E5A45] shadow-2xl sm:block">
                ﴿ بَلْ هُوَ قُرْآنٌ مَجِيدٌ ﴾
              </div>
            </div>
          </div>

          <div className="mx-auto mt-10 max-w-3xl">

            <div className="glass rounded-3xl p-5 text-right">
            <div className="flex items-center justify-between">
              <div className="font-bold text-[#0E5A45]">🔊 جرّب الصوت فوراً — بدون حساب ولا انتظار</div>
              <span className="rounded-full bg-[#0F766E]/15 px-3 py-1 text-[11px] font-bold text-[#0F766E]">ورش • ياسين الجزائري</span>
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <NativePlayer src={yassinAyah1} label="الفاتحة — الآية ١ (ورش)" />
              <NativePlayer src={yassinAyah2} label="الإخلاص — الآية ١ (ورش)" />
            </div>
            <p className="mt-2 text-[11px] text-[#6C7A73]">
              اضغط ▶ في أي مشغّل — الصوت حقيقي آيةً آية برواية ورش. إن لم تسمع، ارفع صوت جهازك أو جرّب صفحة القراء.
            </p>
          </div>

          <div className="mx-auto mt-8 grid max-w-2xl grid-cols-3 gap-3">
            {[
              { n: "١١٤", t: "سورة كاملة" },
              { n: String(TOTAL_AYAHS), t: "آية بالنص الورشي" },
              { n: "٨", t: "قراء ورش" },
            ].map((s) => (
              <div key={s.t} className="glass rounded-2xl px-2 py-5">
                <div className="font-display text-3xl font-bold text-[#0E5A45]">{s.n}</div>
                <div className="mt-1 text-xs text-[#6C7A73]">{s.t}</div>
              </div>
            ))}
          </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="orn-divider font-display text-sm font-bold">منهجية الكُتّاب في ٤ خطوات</div>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {MEMORIZE_STEPS.map((s, i) => (
            <div key={s.title} className="glass rounded-3xl p-6">
              <div className="flex items-center justify-between">
                <span className="grid h-13 w-13 place-items-center rounded-2xl bg-gradient-to-br from-[#0E5A45] to-[#0A3A2C] p-3 text-2xl text-[#FFFFFF]">
                  {s.icon}
                </span>
                <span className="font-display text-5xl font-bold text-black/[0.07]">{["١", "٢", "٣", "٤"][i]}</span>
              </div>
              <div className="mt-4 text-lg font-bold text-[#16221E]">{s.title}</div>
              <p className="mt-2 text-[13px] leading-7 text-[#6C7A73]">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link href="/hifz?surah=2" className="btn-gold inline-block rounded-2xl px-8 py-3.5 text-sm">
            جرّب التكرار التلقائي في أول البقرة ←
          </Link>
        </div>
      </section>

      <section className="border-y border-[#A87B2A]/15 bg-[#0B1C17]/60">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-14 md:grid-cols-2">
          <div>
            <div className="inline-block rounded-full bg-[#0E5A45]/15 px-4 py-1.5 text-xs font-bold text-[#0E5A45]">
              لماذا ورش الأزرق؟ — الفروق الجوهرية عن حفص
            </div>
            <h2 className="font-display mt-4 text-3xl font-bold leading-relaxed md:text-4xl">
              ليست مجرد زخرفة خط
              <br />
              بل <span className="gold-text">أحكام تُغيّر النطق</span>
            </h2>
            <ul className="mt-6 space-y-3 text-sm leading-8">
              {[
                ["مد البدل ٤ حركات", "ءَامَنُوا تُمدّ توسطاً — لا قصراً كحفص."],
                ["النقل", "قَدْ أَفْلَحَ ← قَدَ اَفْلَحَ."],
                ["يُومِنُونَ", "إبدال الهمز الساكن حرف مدّ — لا يُؤْمِنُونَ."],
                ["صلة الميم ٦ حركات", "عَلَيْهِمُوٓ ءَآنذَرْتَهُمْ قبل همزة القطع."],
              ].map(([t, d]) => (
                <li key={t} className="glass flex gap-3 rounded-2xl p-4">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#0E5A45] to-[#0A3A2C] text-sm font-bold text-[#FFFFFF]">✓</span>
                  <span><b className="text-[#0E5A45]">{t}:</b> <span className="text-[#56655E]">{d}</span></span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/ahkam" className="btn-gold rounded-2xl px-6 py-3 text-sm">تعلّم الأحكام الثمانية</Link>
              <Link href="/hifz?surah=36" className="btn-ghost rounded-2xl px-6 py-3 text-sm font-bold">احفظ سورة يس</Link>
            </div>
          </div>
          <div className="glass overflow-hidden rounded-3xl">
            <div className="border-b border-[#A87B2A]/20 px-5 py-3 text-sm font-bold text-[#0E5A45]">قارن بنفسك — أول البقرة</div>
            <div className="grid md:grid-cols-2">
              <div className="border-b border-black/[0.08] p-5 md:border-b-0 md:border-l md:border-black/[0.08]">
                <div className="text-xs font-bold text-red-300">حفص عن عاصم</div>
                <p className="font-quran mt-2 text-xl text-[#5F6B66]">ذَٰلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ هُدًى لِلْمُتَّقِينَ ۝ الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ</p>
              </div>
              <div className="bg-[#0E5A45]/5 p-5">
                <div className="text-xs font-bold text-[#0F766E]">ورش الأزرق ✓ المعتمد هنا</div>
                <p className="font-quran mt-2 text-xl text-[#1B2A25]">ذَٰلِكَ اَ۬لْكِتَٰبُ لَا رَيْبَۖ فِيهِ هُديࣰ لِّلْمُتَّقِينَ ۝ اَ۬لذِينَ يُومِنُونَ بِالْغَيْبِ</p>
              </div>
            </div>
            <div className="p-4">
              <NativePlayer
                src={ayahAudioUrl(AYAH_VOICES[0].subfolder, 2, 2)}
                label="استمع: البقرة آية ٢ بورش — ياسين الجزائري"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-3xl font-bold md:text-4xl">بصوت <span className="gold-text">أهل المغرب الإسلامي</span></h2>
          <Link href="/reciters" className="btn-ghost rounded-full px-5 py-2 text-sm font-bold">كل القراء ←</Link>
        </div>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {RECITERS.filter((r) => r.featured).map((r) => (
            <div key={r.id} className="glass rounded-3xl p-5">
              <div className="flex items-center gap-3">
                <span className="font-display grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[#0E5A45] to-[#0A3A2C] text-2xl font-bold text-[#FFFFFF]">
                  {r.arabicName.replace("القارئ ", "").replace("محمد ", "م").slice(0, 1)}
                </span>
                <div>
                  <div className="text-sm font-bold">{r.arabicName}</div>
                  <div className="text-[11px] text-[#6C7A73]">{r.country} • {r.style}</div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] font-bold">
                {r.azraq && <span className="rounded-full bg-[#0F766E]/15 px-3 py-1 text-[#0F766E]">★ طريق الأزرق</span>}
                {r.id === "yassen" && <span className="rounded-full bg-[#0E5A45] px-3 py-1 text-[#FFFFFF]">صوت المنصة</span>}
              </div>
              <Link href={`/hifz?reciter=${r.id}`} className="btn-gold mt-4 block rounded-2xl py-2.5 text-center text-sm">
                احفظ بصوته ◈
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-4">
        <div className="glass rounded-[28px] p-6 md:p-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-display text-2xl font-bold md:text-3xl">أحكام ورش عن <span className="gold-text">الأزرق</span></h2>
            <Link href="/ahkam" className="btn-gold rounded-full px-5 py-2 text-sm">كل الدروس</Link>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-4">
            {WARSH_RULES.slice(0, 4).map((rule) => (
              <div key={rule.id} className="rounded-2xl border border-black/[0.08] bg-[#FFFFFF] p-5">
                <div className="font-display text-lg font-bold text-[#0E5A45]">{rule.arabicTitle}</div>
                <div className="mt-1 text-[13px] leading-6 text-[#6C7A73]">{rule.summary}</div>
                <div className="font-quran mt-3 rounded-xl bg-[#1B2A25] p-3 text-center text-xl text-[#FFFFFF]">{rule.example}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <h2 className="font-display text-3xl font-bold">فهرس السور — <span className="gold-text">اختر وردك</span></h2>
        <p className="mt-1 text-sm text-[#6C7A73]">١١٤ سورة بالنص الورشي • اضغط أي سورة لفتح مصحف الحفظ</p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {SURAHS.map((s) => (
            <Link
              key={s.number}
              href={`/hifz?surah=${s.number}`}
              className="glass group rounded-2xl p-4 transition hover:border-[#0E5A45]/60"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-black/[0.035] text-sm font-bold text-[#0E5A45] group-hover:bg-[#0E5A45] group-hover:text-[#FFFFFF]">
                  {s.number}
                </span>
                <span className="rounded-full bg-black/[0.035] px-2 py-0.5 text-[10px] text-[#6C7A73]">{s.type}</span>
              </div>
              <div className="font-display mt-2 text-lg font-bold">سورة {s.arabicName}</div>
              <div className="text-[11px] text-[#6C7A73]">{s.ayahs} آيات</div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
