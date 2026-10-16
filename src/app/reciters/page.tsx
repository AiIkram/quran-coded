import Link from "next/link";
import { RECITERS, AYAH_VOICES, ayahAudioUrl, surahAudioUrl } from "@/lib/audio";

export const metadata = { title: "قراء ورش — استمع واحفظ" };
export const dynamic = "force-dynamic";

function NativePlayer({ src, label }: { src: string; label: string }) {
  return (
    <div className="rounded-2xl border border-[#A87B2A]/25 bg-[#FFFFFF] p-3">
      <div className="mb-2 text-[11px] font-bold text-[#8C6522]">{label}</div>
      <audio controls preload="none" src={src} playsInline className="native-dark" />
    </div>
  );
}

export default function RecitersPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="glass rounded-[28px] p-8 text-center md:p-12">
        <div className="inline-block rounded-full bg-[#0E5A45] px-4 py-1 text-xs font-bold text-[#FFFFFF]">
          تلاوات ورشية أصيلة — اضغط ▶ واستمع فوراً
        </div>
        <h1 className="font-display mt-4 text-4xl font-bold md:text-5xl">
          قراء ورش عن نافع <span className="gold-text">وعلى رأسهم ياسين الجزائري</span>
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-sm leading-8 text-[#6C7A73]">
          لكل قارئ مشغّلان جاهزان: السورة كاملة (MP3Quran) وآيات منفصلة برواية ورش (EveryAyah).
          إن لم يعمل مشغّل، جرّب الآخر — ثم اضغط «احفظ بصوته» لفتح مصحف التكرار.
        </p>
      </div>

      <div className="mt-8 overflow-hidden rounded-[28px] border border-[#0E5A45]/40 bg-gradient-to-l from-[#0E5A45]/10 to-transparent p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-display grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-[#0E5A45] to-[#0A3A2C] text-4xl font-bold text-[#FFFFFF]">
            ي
          </span>
          <div className="flex-1">
            <div className="text-xs font-bold text-[#0F766E]">★ صوت المنصة الأول • الجزائر • ورش • ١١٤ سورة</div>
            <h2 className="font-display mt-1 text-3xl font-bold">القارئ ياسين الجزائري</h2>
          </div>
          <Link href="/hifz?reciter=yassen" className="btn-gold rounded-2xl px-7 py-3.5 text-sm">
            ◈ احفظ بصوته
          </Link>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <NativePlayer src={`${RECITERS[0].server}001.mp3`} label="الفاتحة كاملة — ياسين الجزائري" />
          <NativePlayer src={`${RECITERS[0].server}112.mp3`} label="الإخلاص كاملة — ياسين الجزائري" />
          <NativePlayer
            src={ayahAudioUrl(AYAH_VOICES[0].subfolder, 2, 255)}
            label="آية الكرسي منفصلة (ورش) — ياسين"
          />
        </div>
      </div>

      <h2 className="font-display mt-12 text-2xl font-bold md:text-3xl">
        كل قراء <span className="gold-text">ورش</span> في المنصة
      </h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {RECITERS.map((r) => (
          <div key={r.id} className="glass rounded-3xl p-6">
            <div className="flex items-center gap-3">
              <span className="font-display grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#0E5A45] to-[#0A3A2C] text-2xl font-bold text-[#FFFFFF]">
                {r.arabicName.replace("القارئ ", "").slice(0, 1)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-bold">{r.arabicName}</div>
                <div className="text-xs text-[#6C7A73]">{r.country} • {r.style} • {r.total} سورة</div>
              </div>
              {r.azraq && (
                <span className="shrink-0 rounded-full bg-[#0F766E]/15 px-3 py-1 text-[11px] font-bold text-[#0F766E]">
                  ★ الأزرق
                </span>
              )}
            </div>
            <div className="mt-4 grid gap-2">
              <NativePlayer src={surahAudioUrl(r, 1)} label={`الفاتحة كاملة — ${r.arabicName}`} />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <Link href={`/hifz?reciter=${r.id}&surah=1`} className="btn-gold rounded-2xl py-2.5 text-center text-[13px]">
                احفظ بصوته
              </Link>
              <Link href={`/hifz?reciter=${r.id}&surah=36`} className="btn-ghost rounded-2xl py-2.5 text-center text-[13px] font-bold">
                سورة يس
              </Link>
              <Link href={`/hifz?reciter=${r.id}&surah=67`} className="btn-ghost rounded-2xl py-2.5 text-center text-[13px] font-bold">
                سورة الملك
              </Link>
            </div>
          </div>
        ))}
      </div>

      <h2 className="font-display mt-12 text-2xl font-bold md:text-3xl">
        أصوات التكرار <span className="gold-text">آيةً آية (ورش)</span>
      </h2>
      <p className="mt-1 text-sm text-[#6C7A73]">
        هذه الأصوات تُستخدم داخل مصحف الحفظ للتكرار التلقائي — كلها برواية ورش:
      </p>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {AYAH_VOICES.map((v, i) => (
          <div key={v.id} className="glass rounded-3xl p-5">
            <div className="font-bold text-[#0E5A45]">{v.label}</div>
            <div className="mt-1 text-[11px] text-[#6C7A73]">
              {i === 0 ? "الصوت الافتراضي للتكرار" : "صوت بديل تلقائي عند التعثر"}
            </div>
            <div className="mt-3">
              <NativePlayer
                src={ayahAudioUrl(v.subfolder, 1, 2 + i)}
                label={`عينة: الفاتحة آية ${["٢", "٣", "٤"][i]} — ${v.label}`}
              />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
