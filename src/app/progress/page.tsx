"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SURAHS, TOTAL_AYAHS } from "@/data/surahs";
import { toArabicDigits } from "@/lib/format";
import { authenticatedFetch } from "@/lib/auth-fetch";
import { useRouter } from "next/navigation";

interface Totals {
  total_ayahs: number;
  memorized: number;
  mastered: number;
  memorizing: number;
  repetitions: number;
}

export default function ProgressPage() {
  const [totals, setTotals] = useState<Totals>({ total_ayahs: 0, memorized: 0, mastered: 0, memorizing: 0, repetitions: 0 });
  const [due, setDue] = useState(0);
  const [daily, setDaily] = useState<Array<{ day: string; ayahs_memorized: number; repetitions: number; sessions: number }>>([]);
  const [sessions, setSessions] = useState<Array<{ id: number; surahNumber: number; fromAyah: number; toAyah: number; repetitions: number; reciter: string; mode: string; createdAt: string }>>([]);
  const [dueList, setDueList] = useState<Array<{ surahNumber: number; ayahNumber: number; status: string; nextReview: string }>>([]);
  const [perSurah, setPerSurah] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [authRequired, setAuthRequired] = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const [s, p, d] = await Promise.all([
          authenticatedFetch("/api/stats").then(async (r) => { if (r.status === 401) throw new Error("auth-required"); return r.json(); }),
          authenticatedFetch("/api/progress").then(async (r) => { if (r.status === 401) throw new Error("auth-required"); return r.json(); }),
          authenticatedFetch("/api/stats", { method: "PUT" }).then(async (r) => { if (r.status === 401) throw new Error("auth-required"); return r.json(); }),
        ]);
        setTotals(s.totals ?? { total_ayahs: 0, memorized: 0, mastered: 0, memorizing: 0, repetitions: 0 });
        setDue(s.dueForReview ?? 0);
        setDaily(s.daily ?? []);
        setSessions(s.sessions ?? []);
        setDueList(d.due ?? []);
        const m: Record<number, number> = {};
        for (const row of p.progress ?? []) {
          if (row.status === "memorized" || row.status === "mastered") m[row.surahNumber] = (m[row.surahNumber] ?? 0) + 1;
        }
        setPerSurah(m);
      } catch (error) {
        if (error instanceof Error && (error.message === "auth-required" || error.message.includes("Sign in to save"))) setAuthRequired(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const done = (totals.memorized ?? 0) + (totals.mastered ?? 0);
  const pct = ((done / TOTAL_AYAHS) * 100).toFixed(2);
  const maxDaily = useMemo(() => Math.max(1, ...daily.map((x) => x.ayahs_memorized)), [daily]);
  const surahName = (n: number) => SURAHS[n - 1]?.arabicName ?? "";

  if (authRequired) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16">
        <section className="glass rounded-3xl p-8 text-center">
          <h1 className="font-display text-3xl font-bold text-[#0E5A45]">احفظ تقدّمك الشخصي</h1>
          <p className="mt-3 leading-8 text-[#6C7A73]">سجّل الدخول حتى تظهر محفوظاتك ومراجعاتك الخاصة.</p>
          <button onClick={() => router.push("/account")} className="btn-gold mt-5 rounded-full px-6 py-3 font-bold">تسجيل الدخول أو إنشاء حساب</button>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="glass rounded-[28px] p-8 md:p-10">
        <h1 className="font-display text-3xl font-bold md:text-4xl">
          لوحة <span className="gold-text">تقدّمي</span> في الحفظ
        </h1>
        <p className="mt-2 text-sm text-[#6C7A73]">
          كل آية تعلّمها كمحفوظة تُحفظ في قاعدة البيانات وتُجدوَل مراجعتُها تلقائياً (١ • ٣ • ٧ • ١٤ • ٣٠ يوماً).
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { t: "آيات محفوظة", v: toArabicDigits(done), s: `من ${toArabicDigits(TOTAL_AYAHS)} — ${pct}%` },
            { t: "متقَنة ★", v: toArabicDigits(totals.mastered ?? 0), s: "إتقان تام" },
            { t: "قيد الحفظ", v: toArabicDigits(totals.memorizing ?? 0), s: "تُكرَّر الآن" },
            { t: "تكرارات", v: toArabicDigits(totals.repetitions ?? 0), s: "مجموع التسميعات" },
            { t: "حانَت مراجعتها", v: toArabicDigits(due), s: "راجعها اليوم" },
          ].map((c) => (
            <div key={c.t} className="rounded-2xl border border-black/[0.08] bg-[#FFFFFF] p-4 text-center">
              <div className="font-display text-3xl font-bold text-[#0E5A45]">{loading ? "…" : c.v}</div>
              <div className="mt-1 text-xs font-bold">{c.t}</div>
              <div className="text-[11px] text-[#6C7A73]">{c.s}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-black/[0.055]">
          <div
            className="h-full rounded-full bg-gradient-to-l from-[#0E5A45] to-[#0F766E]"
            style={{ width: `${Math.min(100, (done / TOTAL_AYAHS) * 100)}%` }}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="glass rounded-3xl p-6">
          <h2 className="font-display text-xl font-bold text-[#0E5A45]">
            ورد المراجعة اليوم ({toArabicDigits(dueList.length)})
          </h2>
          <p className="mt-1 text-xs text-[#6C7A73]">آيات حان موعد مراجعتها حسب منحنى النسيان</p>
          <div className="mt-4 max-h-[380px] space-y-2 overflow-y-auto">
            {dueList.slice(0, 60).map((d, i) => (
              <Link
                key={i}
                href={`/hifz?surah=${d.surahNumber}`}
                className="flex items-center justify-between rounded-2xl bg-black/[0.035] px-4 py-2.5 text-sm hover:bg-black/[0.055]"
              >
                <span className="font-bold">سورة {surahName(d.surahNumber)} — آية {toArabicDigits(d.ayahNumber)}</span>
                <span className="rounded-full bg-[#0E5A45] px-2 py-0.5 text-[11px] font-bold text-[#FFFFFF]">راجع</span>
              </Link>
            ))}
            {!dueList.length && (
              <div className="rounded-2xl bg-[#0F766E]/10 p-4 text-center text-sm font-bold text-[#0F766E]">
                لا شيء مستحق اليوم — ممتاز! واصل الحفظ الجديد.
              </div>
            )}
          </div>
        </div>

        <div className="glass rounded-3xl p-6 lg:col-span-2">
          <h2 className="font-display text-xl font-bold text-[#0E5A45]">نشاط آخر ٣٠ يوماً</h2>
          <div className="mt-4 flex h-40 items-end gap-1.5">
            {(daily.length ? [...daily].reverse() : Array.from({ length: 14 }, () => null)).map((d, i) => {
              const v = d?.ayahs_memorized ?? 0;
              return (
                <div key={i} className="flex flex-1 flex-col items-center gap-1" title={d ? `${d.day}: ${d.ayahs_memorized} آيات` : ""}>
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-[#0A3A2C] to-[#0E5A45]"
                    style={{ height: `${Math.max(4, (v / maxDaily) * 130)}px`, opacity: v ? 1 : 0.15 }}
                  />
                  <span className="text-[9px] text-[#6C7A73]">{d ? String(d.day).slice(8) : ""}</span>
                </div>
              );
            })}
          </div>
          <h3 className="font-display mt-6 text-lg font-bold text-[#0E5A45]">جلسات الحفظ الأخيرة</h3>
          <div className="mt-3 space-y-2">
            {sessions.slice(0, 6).map((s) => (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-black/[0.035] px-4 py-2.5 text-sm">
                <span>
                  سورة {surahName(s.surahNumber)} — من {toArabicDigits(s.fromAyah)} إلى {toArabicDigits(s.toAyah)} • تكرار ×{toArabicDigits(s.repetitions)}
                </span>
                <Link href={`/hifz?surah=${s.surahNumber}`} className="btn-gold rounded-full px-3 py-1 text-[11px]">
                  مواصلة
                </Link>
              </div>
            ))}
            {!sessions.length && (
              <div className="text-sm text-[#6C7A73]">لا جلسات بعد — ابدأ أول تكرار من مصحف الحفظ وستُسجَّل هنا.</div>
            )}
          </div>
        </div>
      </div>

      <h2 className="font-display mt-10 text-2xl font-bold">
        خريطة السور — <span className="gold-text">ما أتممتَ وما بقي</span>
      </h2>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
        {SURAHS.map((s) => {
          const c = perSurah[s.number] ?? 0;
          const p = Math.round((c / s.ayahs) * 100);
          return (
            <Link
              key={s.number}
              href={`/hifz?surah=${s.number}`}
              className={`rounded-2xl border p-3 ${
                p === 100
                  ? "border-[#0E5A45] bg-gradient-to-br from-[#0E5A45] to-[#0A3A2C] text-[#FFFFFF]"
                  : p > 0
                    ? "glass border-[#0E5A45]/40"
                    : "border-black/[0.08] bg-white/[0.03]"
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span>{s.number}</span>
                <span>{toArabicDigits(p)}%</span>
              </div>
              <div className="font-display mt-1 text-[15px] font-bold">سورة {s.arabicName}</div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-black/30">
                <div
                  className={`h-full rounded-full ${p === 100 ? "bg-[#FFFFFF]" : "bg-gradient-to-l from-[#0E5A45] to-[#0F766E]"}`}
                  style={{ width: `${p}%` }}
                />
              </div>
              <div className="mt-1 text-[10px] opacity-70">{toArabicDigits(c)}/{toArabicDigits(s.ayahs)} آية</div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
