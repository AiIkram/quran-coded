"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SURAHS, getSurah } from "@/data/surahs";
import { RECITERS, getReciter, surahAudioUrl, voiceById, ayahAudioUrl } from "@/lib/audio";
import { toArabicDigits, formatTime } from "@/lib/format";
import { authenticatedFetch } from "@/lib/auth-fetch";

interface Ayah {
  surah: number;
  ayah: number;
  text: string;
  global: number;
}
type Mode = "mushaf" | "understand" | "test";
type Unit = number | "range";
type AudioStatus = "idle" | "loading" | "playing" | "error";

interface Seq {
  block: number[];
  i: number;
  roundsLeft: number;
  roundsTotal: number;
  start: number;
  single: boolean;
}

const BISMILLAH = "بِسْمِ اِ۬للَّهِ اِ۬لرَّحْمَٰنِ اِ۬لرَّحِيمِ";
const UNIT_OPTS: Array<{ v: Unit; label: string }> = [
  { v: 1, label: "كل آية" },
  { v: 3, label: "كل ٣" },
  { v: 5, label: "كل ٥" },
  { v: 7, label: "كل ٧" },
  { v: "range", label: "المقطع كاملًا" },
];
const TIME_OPTS = [1, 3, 5, 10, 20];
const SPEED_OPTS = [0.75, 1, 1.25, 1.5];

export default function Memorizer({
  initialSurah,
  initialReciter,
}: {
  initialSurah: number;
  initialReciter: string;
}) {
  const [surahNum, setSurahNum] = useState(initialSurah);
  const [reciterId, setReciterId] = useState(
    RECITERS.some((r) => r.id === initialReciter) ? initialReciter : "yassen"
  );
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const reciter = useMemo(() => getReciter(reciterId), [reciterId]);

  const [mode, setMode] = useState<Mode>("mushaf");
  const [activeAyah, setActiveAyah] = useState<number | null>(null);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [tafsir, setTafsir] = useState<Record<number, string>>({});
  const [tafsirLoading, setTafsirLoading] = useState(false);
  const [tafsirError, setTafsirError] = useState(false);

  const [fromAyah, setFromAyah] = useState(1);
  const [toAyah, setToAyah] = useState(7);
  const [unit, setUnit] = useState<Unit>(1);
  const [times, setTimes] = useState(5);
  const [speed, setSpeed] = useState(1);

  const [status, setStatus] = useState<AudioStatus>("idle");
  const [seqInfo, setSeqInfo] = useState<{ ayah: number; pos: number; len: number; round: number; total: number } | null>(null);
  const [audioSrc, setAudioSrc] = useState("");
  const [audioError, setAudioError] = useState("");
  const [voiceIdx, setVoiceIdx] = useState(0);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);

  const ayahEl = useRef<HTMLAudioElement | null>(null);
  const fullEl = useRef<HTMLAudioElement | null>(null);
  const seqRef = useRef<Seq | null>(null);
  const voiceRef = useRef(0);
  const cfg = useRef({ unit, times, fromAyah, toAyah, speed, chain: reciter.ayahVoices, surahNum });
  cfg.current = { unit, times, fromAyah, toAyah, speed, chain: reciter.ayahVoices, surahNum };

  const [progressMap, setProgressMap] = useState<Record<number, { status: string; mastery: number; repetitions: number }>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [saveError, setSaveError] = useState("");

  const meta = getSurah(surahNum);
  const activeVoice = voiceById(reciter.ayahVoices[Math.min(voiceIdx, reciter.ayahVoices.length - 1)]);

  
  const loadSurah = async (n: number) => {
    setLoading(true);
    setLoadError("");
    stopSeq();
    setTafsir({});
    setTafsirError(false);
    try {
      const r = await fetch(`/api/quran/surah/${n}`);
      if (!r.ok) throw new Error();
      const j = await r.json();
      const list: Ayah[] = j.ayahs ?? [];
      setAyahs(list);
      const len = list.length || getSurah(n).ayahs;
      setFromAyah(1);
      setToAyah(Math.min(len, 7));
      setActiveAyah(null);
      setRevealed(new Set());
    } catch {
      setLoadError("تعذّر تحميل النص. تحقق من الاتصال ثم أعد المحاولة.");
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async (n: number) => {
    try {
      const r = await authenticatedFetch(`/api/progress?surah=${n}`);
      const j = await r.json();
      const m: Record<number, { status: string; mastery: number; repetitions: number }> = {};
      for (const p of j.progress ?? []) m[p.ayahNumber] = { status: p.status, mastery: p.mastery, repetitions: p.repetitions };
      setProgressMap(m);
    } catch {
      
    }
  };

  useEffect(() => {
    loadSurah(surahNum);
    loadProgress(surahNum);
    const u = new URL(window.location.href);
    u.searchParams.set("surah", String(surahNum));
    u.searchParams.set("reciter", reciterId);
    window.history.replaceState(null, "", u.toString());
  }, [surahNum, reciterId]);

  const tafsirFetchedFor = useRef<number | null>(null);
  useEffect(() => {
    if (mode !== "understand") return;
    if (tafsirFetchedFor.current === surahNum) return;
    tafsirFetchedFor.current = surahNum;
    let alive = true;
    setTafsirLoading(true);
    setTafsirError(false);
    fetch(`/api/tafsir/${surahNum}`)
      .then((r) => r.json())
      .then((j) => {
        if (!alive) return;
        setTafsir(j.ayahs ?? {});
        setTafsirError(!!j.error);
      })
      .catch(() => alive && setTafsirError(true))
      .finally(() => alive && setTafsirLoading(false));
    return () => {
      alive = false;
    };
  }, [mode, surahNum]);

  
  function buildSeq(start: number, single = false): Seq {
    const c = cfg.current;
    if (single) return { block: [start], i: 0, roundsLeft: 1, roundsTotal: 1, start, single: true };
    if (c.unit === "range") {
      const block: number[] = [];
      for (let a = c.fromAyah; a <= c.toAyah; a++) block.push(a);
      return { block, i: 0, roundsLeft: c.times, roundsTotal: c.times, start: c.fromAyah, single: false };
    }
    const end = Math.min(c.toAyah, start + c.unit - 1);
    const block: number[] = [];
    for (let a = start; a <= end; a++) block.push(a);
    return { block, i: 0, roundsLeft: c.times, roundsTotal: c.times, start, single: false };
  }

  function playAyah(ayah: number, vIdx: number) {
    const el = ayahEl.current;
    const c = cfg.current;
    if (!el) return;
    if (vIdx >= c.chain.length) {
      setStatus("error");
      setAudioError("تعذّر التشغيل من كل المصادر — جرّب زر «🔊 اختبر الصوت» أو المشغّل اليدوي.");
      return;
    }
    const url = ayahAudioUrl(voiceById(c.chain[vIdx]).subfolder, c.surahNum, ayah);
    voiceRef.current = vIdx;
    setVoiceIdx(vIdx);
    setAudioSrc(url);
    setAudioError("");
    setStatus("loading");
    el.src = url;
    el.playbackRate = c.speed;
    el.load();
    const p = el.play();
    if (p && typeof p.then === "function") {
      p.then(() => setStatus("playing")).catch(() => playAyah(ayah, vIdx + 1));
    }
  }

  function playCurrent(vIdx = 0) {
    const seq = seqRef.current;
    if (!seq) return;
    const ayah = seq.block[seq.i];
    setSeqInfo({
      ayah,
      pos: seq.i + 1,
      len: seq.block.length,
      round: seq.roundsTotal - seq.roundsLeft + 1,
      total: seq.roundsTotal,
    });
    setActiveAyah(ayah);
    playAyah(ayah, vIdx);
  }

  function stopSeq() {
    ayahEl.current?.pause();
    seqRef.current = null;
    setSeqInfo(null);
    setStatus("idle");
    setAudioError("");
  }

  function handleEnded() {
    const seq = seqRef.current;
    if (!seq) return;
    if (seq.single) {
      stopSeq();
      return;
    }
    if (seq.i < seq.block.length - 1) {
      seq.i += 1;
    } else if (seq.roundsLeft > 1) {
      seq.roundsLeft -= 1;
      seq.i = 0;
    } else {
      const c = cfg.current;
      const step = c.unit === "range" ? c.toAyah - c.fromAyah + 1 : c.unit;
      const nextStart = seq.start + step;
      if (nextStart > c.toAyah || nextStart > meta.ayahs) {
        stopSeq();
        return;
      }
      seqRef.current = buildSeq(nextStart);
    }
    playCurrent(0);
  }

  function handleAudioError() {
    if (!seqRef.current) return;
    playCurrent(voiceRef.current + 1);
  }

  function startSeq() {
    if (!ayahs.length || fromAyah > toAyah) return;
    authenticatedFetch("/api/stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ surahNumber: surahNum, fromAyah, toAyah, repetitions: times, reciter: reciterId, mode: "memorize" }),
    }).catch(() => {});
    seqRef.current = buildSeq(fromAyah);
    playCurrent(0);
    document.getElementById(`ayah-node-${fromAyah}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function playAyahOnce(n: number) {
    seqRef.current = buildSeq(n, true);
    playCurrent(0);
    document.getElementById(`ayah-node-${n}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  const onAyahClick = (n: number) => {
    if (mode === "test") {
      setRevealed((prev) => {
        const s = new Set(prev);
        if (s.has(n)) s.delete(n);
        else s.add(n);
        return s;
      });
    }
    setActiveAyah(n);
  };

  
  const markAyah = async (ayahNum: number, st: string) => {
    setSavingId(ayahNum);
    setSaveError("");
    try {
      const r = await authenticatedFetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ surahNumber: surahNum, ayahNumber: ayahNum, status: st, repetitions: times, mastery: st === "mastered" ? 5 : 3 }),
      });
      if (r.status === 401) throw new Error("سجّل الدخول أولاً حتى يُحفَظ تقدّمك الشخصي.");
      if (!r.ok) throw new Error("تعذّر حفظ التقدّم. حاول مرة أخرى.");
      const j = await r.json();
      const p = (j.progress ?? [])[0];
      setProgressMap((m) => ({
        ...m,
        [ayahNum]: p ? { status: p.status, mastery: p.mastery, repetitions: p.repetitions } : { status: st, mastery: 3, repetitions: times },
      }));
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "تعذّر حفظ التقدّم.");
    } finally {
      setSavingId(null);
    }
  };

  const markRange = async (st: string) => {
    setSaveError("");
    const items = [];
    for (let a = fromAyah; a <= toAyah; a++)
      items.push({ surahNumber: surahNum, ayahNumber: a, status: st, repetitions: times, mastery: st === "mastered" ? 5 : 3 });
    try {
      const response = await authenticatedFetch("/api/progress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(items) });
      if (response.status === 401) throw new Error("سجّل الدخول أولاً حتى يُحفَظ تقدّمك الشخصي.");
      if (!response.ok) throw new Error("تعذّر حفظ التقدّم. حاول مرة أخرى.");
      await loadProgress(surahNum);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "تعذّر حفظ التقدّم.");
    }
  };

  const memorizedCount = Object.values(progressMap).filter((p) => p.status === "memorized" || p.status === "mastered").length;
  const showBismillah = surahNum !== 1 && surahNum !== 9;
  const activeProg = activeAyah ? progressMap[activeAyah] : undefined;
  const playing = status === "playing" || status === "loading";

  const statusLabel = () => {
    if (seqInfo)
      return `الآية ${toArabicDigits(seqInfo.ayah)} • ${toArabicDigits(seqInfo.pos)}/${toArabicDigits(seqInfo.len)} • الدورة ${toArabicDigits(seqInfo.round)}/${toArabicDigits(seqInfo.total)}`;
    if (status === "error") return "تعذّر التشغيل — جرّب المشغّل اليدوي";
    if (mode === "understand") return tafsirLoading ? "جارٍ تحميل المعاني…" : "وضع الفهم قبل الحفظ";
    if (mode === "test") return "وضع الاختبار — اضغط الآية للكشف";
    return "جاهز — اختر وردك وابدأ التكرار";
  };

  
  return (
    <div className="mx-auto max-w-[1400px] px-3 pb-52 pt-6 md:px-4">
      {saveError && <div role="alert" className="mb-4 rounded-2xl border border-[#C79A3F]/40 bg-[#FFF8E7] p-4 text-sm leading-7 text-[#604B1B]">{saveError} <a href="/account" className="font-bold underline">تسجيل الدخول أو إنشاء حساب</a></div>}
      <div className="grid gap-5 lg:grid-cols-[330px_1fr]">
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <section className="glass rounded-3xl p-5">
            <h2 className="font-display text-lg font-bold text-[#0E5A45]">سورة وقارئ</h2>
            <div className="mt-3 flex items-center gap-2">
              <button
                disabled={surahNum <= 1}
                onClick={() => setSurahNum(surahNum - 1)}
                className="btn-ghost grid h-11 w-11 shrink-0 place-items-center rounded-xl disabled:opacity-40"
                aria-label="السورة السابقة"
              >
                ←
              </button>
              <select
                value={surahNum}
                onChange={(e) => setSurahNum(Number(e.target.value))}
                className="w-full rounded-xl px-3 py-3 text-sm font-bold"
              >
                {SURAHS.map((s) => (
                  <option key={s.number} value={s.number}>
                    {s.number} — سورة {s.arabicName} ({s.ayahs})
                  </option>
                ))}
              </select>
              <button
                disabled={surahNum >= 114}
                onClick={() => setSurahNum(surahNum + 1)}
                className="btn-ghost grid h-11 w-11 shrink-0 place-items-center rounded-xl disabled:opacity-40"
                aria-label="السورة التالية"
              >
                →
              </button>
            </div>

            <label className="mt-4 block text-[11px] font-extrabold tracking-wide text-[#7A6E58]">
              المحاضرة / القارئ
              <select
                value={reciterId}
                onChange={(e) => {
                  setReciterId(e.target.value);
                  stopSeq();
                }}
                className="mt-1.5 w-full rounded-xl px-3 py-3 text-sm font-bold"
              >
                {RECITERS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.arabicName} {r.azraq ? "★ الأزرق" : ""}
                  </option>
                ))}
              </select>
            </label>

            <button onClick={() => playAyahOnce(activeAyah ?? fromAyah)} className="btn-gold mt-3 w-full rounded-2xl py-3 text-sm">
              🔊 اختبر الصوت الآن
            </button>

            <audio ref={ayahEl} preload="auto" playsInline onEnded={handleEnded} onError={handleAudioError} onPlay={() => setStatus("playing")} />

            <p className="mt-3 text-[11px] leading-5 text-[#6C7A73]">
              تكرار الآيات بصوت <b className="text-[#0F766E]">{activeVoice.label}</b> (ورش آيةً آية، مع بديل تلقائي عند التعثر).
            </p>

            {audioError && (
              <div className="mt-2 rounded-xl border border-[#B4491F]/40 bg-[#B4491F]/8 p-3 text-[11px] leading-6 text-[#7C3A1A]">
                {audioError}
              </div>
            )}

            {audioSrc && (
              <div className="mt-3 rounded-xl border border-[#E6E2D8] bg-[#F7F5EC] p-3">
                <div className="mb-1.5 text-[11px] font-bold text-[#7A6E58]">مشغّل يدوي (يعمل دائمًا):</div>
                <audio key={audioSrc} controls preload="auto" src={audioSrc} className="native-dark" playsInline />
              </div>
            )}
          </section>

          <section className="glass rounded-3xl p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-[#0E5A45]">التلاوة الكاملة</h2>
              <span className="text-[11px] font-bold text-[#6C7A73]">
                {formatTime(cur)} / {formatTime(dur)}
              </span>
            </div>
            <audio
              ref={fullEl}
              controls
              preload="none"
              src={surahAudioUrl(reciter, surahNum)}
              playsInline
              className="native-dark mt-3"
              onPlay={stopSeq}
              onTimeUpdate={(e) => setCur(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => setDur(e.currentTarget.duration)}
            />
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#E9E5D9]">
              <div
                className="h-full rounded-full bg-gradient-to-l from-[#0E5A45] to-[#0F766E] transition-all"
                style={{ width: `${Math.round((memorizedCount / Math.max(1, meta.ayahs)) * 100)}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-[11px] font-bold text-[#6C7A73]">
              <span>محفوظ من السورة</span>
              <span className="text-[#0E5A45]">
                {toArabicDigits(memorizedCount)}/{toArabicDigits(meta.ayahs)}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={() => markRange("memorized")} className="opt-chip">✓ المقطع محفوظ</button>
              <button onClick={() => markRange("mastered")} className="opt-chip">★ إتقان المقطع</button>
            </div>
          </section>

          {activeAyah && (
            <section className="glass rounded-3xl p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-[#0E5A45]">الآية المحدّدة</h2>
                <span className="rounded-full bg-[#FBF5E6] px-3 py-1 text-[11px] font-bold text-[#8C6522]">
                  آية {toArabicDigits(activeAyah)}
                </span>
              </div>
              {activeProg && (
                <div className="mt-2 text-[11px] font-bold text-[#6C7A73]">
                  الحالة:{" "}
                  <span className="text-[#0E5A45]">
                    {activeProg.status === "mastered" ? "★ متقنة" : activeProg.status === "memorized" ? "✓ محفوظة" : "قيد الحفظ"}
                  </span>
                  {activeProg.repetitions ? ` • تكرارات: ${toArabicDigits(activeProg.repetitions)}` : ""}
                </div>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={() => playAyahOnce(activeAyah)} className="opt-chip">▶ استماع</button>
                <button onClick={() => { seqRef.current = buildSeq(activeAyah); playCurrent(0); }} className="opt-chip on">
                  ↻ تكرار هذه الآية
                </button>
                <button onClick={() => markAyah(activeAyah, "memorized")} disabled={savingId === activeAyah} className="opt-chip">
                  {savingId === activeAyah ? "…" : "✓ حفظتُها"}
                </button>
                <button onClick={() => markAyah(activeAyah, "mastered")} disabled={savingId === activeAyah} className="opt-chip">
                  ★ إتقان
                </button>
              </div>
            </section>
          )}
        </aside>

        <div>
          <div className="mx-auto mb-4 flex max-w-[900px] flex-wrap items-center justify-between gap-3">
            <div className="mode-tabs">
              <button className={`mode-tab ${mode === "mushaf" ? "is-on" : ""}`} onClick={() => setMode("mushaf")}>
                ۝ المصحف
              </button>
              <button
                className={`mode-tab ${mode === "understand" ? "understand-on" : ""}`}
                onClick={() => setMode("understand")}
                title="اقرأ معنى كل آية قبل أن تحفظها"
              >
                ⓘ افهم قبل الحفظ
              </button>
              <button
                className={`mode-tab ${mode === "test" ? "is-on" : ""}`}
                onClick={() => setMode("test")}
                title="أخفِ الآيات واختبر نفسك غيباً"
              >
                ◐ اختبر حفظك
              </button>
            </div>
            <div className="hidden text-[12px] font-bold text-[#6C7A73] sm:block">
              {mode === "mushaf" && "اضغط أي آية لتحديدها، وشريط التشغيل أسفل يتحكم بكل شيء"}
              {mode === "understand" && "افهم معنى الآية أولاً، ثم احفظها وأنت متيقن"}
              {mode === "test" && "الآيات محجوبة — اضغط الآية لكشفها فرداً فرداً"}
            </div>
          </div>

          <div className="mushaf-shell mx-auto max-w-[900px]">
            <div className="mushaf-page">
              <header className="surah-band">
                <div className="band-meta">
                  {meta.type} • {toArabicDigits(meta.ayahs)} آيات • رواية ورش عن نافع من طريق الأزرق
                </div>
                <h2>سُورَةُ {meta.arabicName}</h2>
              </header>

              {showBismillah && <p className="bismillah">{BISMILLAH}</p>}

              {loading ? (
                <div className="mushaf-text animate-pulse opacity-40">
                  <p>…</p>
                </div>
              ) : loadError ? (
                <div className="py-10 text-center">
                  <p className="font-bold text-[#B4491F]">{loadError}</p>
                  <button onClick={() => loadSurah(surahNum)} className="btn-gold mt-4 rounded-full px-6 py-2.5 text-sm">
                    إعادة المحاولة
                  </button>
                </div>
              ) : mode === "understand" ? (
                <div className="mt-5">
                  {tafsirLoading && (
                    <div className="flex items-center justify-center gap-3 py-8 text-sm font-bold text-[#0E5A45]">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0E5A45] border-t-transparent" />
                      جاري تحميل معاني الآيات…
                    </div>
                  )}
                  {tafsirError && !tafsirLoading && (
                    <div className="mb-4 rounded-xl border border-[#B4491F]/35 bg-[#B4491F]/8 p-4 text-center text-sm font-bold text-[#7C3A1A]">
                      تعذّر تحميل التفسير الآن — جرّب لاحقاً أو استخدم وضع المصحف.
                    </div>
                  )}
                  {ayahs.map((a) => (
                    <div key={a.ayah} id={`ayah-node-${a.ayah}`} className="ayah-study">
                      <p className="study-line">
                        <span
                          className={`ayah-span ${seqInfo?.ayah === a.ayah && playing ? "is-playing" : activeAyah === a.ayah ? "is-active" : ""}`}
                          onClick={() => onAyahClick(a.ayah)}
                        >
                          {a.text}
                        </span>{" "}
                        <span className="ayah-mark">۝{toArabicDigits(a.ayah)}</span>
                      </p>
                      <div className="meaning-box">
                        <span className="m-label">المعنى</span>
                        <div>{tafsir[a.ayah] ?? (tafsirLoading ? "…" : "—")}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mushaf-text">
                  {ayahs.map((a) => {
                    const veiled = mode === "test" && !revealed.has(a.ayah);
                    const cls = [
                      "ayah-span",
                      seqInfo?.ayah === a.ayah && playing ? "is-playing" : "",
                      activeAyah === a.ayah && !(seqInfo?.ayah === a.ayah && playing) ? "is-active" : "",
                      veiled ? "ayah-veiled" : "",
                    ]
                      .filter(Boolean)
                      .join(" ");
                    return (
                      <span key={a.ayah} id={`ayah-node-${a.ayah}`} onClick={() => onAyahClick(a.ayah)}>
                        <span className={cls}>{a.text}</span>{" "}
                        <span className={`ayah-mark ${veiled ? "veiled-mark" : ""}`}>۝{toArabicDigits(a.ayah)}</span>{" "}
                      </span>
                    );
                  })}
                </p>
              )}

              <div className="mushaf-foot orn-divider">
                <span>۞ {meta.arabicName} • {toArabicDigits(meta.ayahs)} آية • مصحف ورش ۞</span>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-4 flex max-w-[900px] items-center justify-between rounded-2xl border border-[#E6E2D8] bg-white p-3">
            <button
              disabled={surahNum <= 1}
              onClick={() => setSurahNum(surahNum - 1)}
              className="btn-ghost rounded-xl px-4 py-2.5 text-sm disabled:opacity-40"
            >
              → السابقة
            </button>
            <span className="font-display text-sm font-bold text-[#0E5A45]">
              {meta.arabicName} • {toArabicDigits(surahNum)}/١١٤
            </span>
            <button
              disabled={surahNum >= 114}
              onClick={() => setSurahNum(surahNum + 1)}
              className="btn-gold rounded-xl px-4 py-2.5 text-sm disabled:opacity-40"
            >
              التالية ←
            </button>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3">
        <div className="player-bar mx-auto max-w-[1400px] rounded-[26px] px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => (seqRef.current ? stopSeq() : startSeq())}
              className={`grid h-14 w-14 shrink-0 place-items-center rounded-full text-xl ${
                seqInfo ? "bg-[#B4491F] text-white shadow-[0_8px_20px_rgba(180,73,31,0.35)]" : "btn-gold"
              }`}
              aria-label={seqInfo ? "إيقاف التكرار" : "ابدأ التكرار"}
            >
              {seqInfo ? "⏸" : "▶"}
            </button>

            <div className="min-w-[180px] flex-1">
              <div className="truncate text-sm font-bold text-[#16221E]">{statusLabel()}</div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#E9E5D9]">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-[#0E5A45] to-[#0F766E] transition-all duration-300"
                  style={{
                    width: `${seqInfo ? Math.round((seqInfo.pos / Math.max(1, seqInfo.len)) * 100) : 0}%`,
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-[#6C7A73]">
              <span className="opt-label">من</span>
              <input
                type="number" min={1} max={meta.ayahs} value={fromAyah}
                onChange={(e) => setFromAyah(Math.max(1, Math.min(meta.ayahs, Number(e.target.value) || 1)))}
                className="h-9 w-14 rounded-lg px-1 text-center font-bold text-[#0E5A45]"
              />
              <span className="opt-label">إلى</span>
              <input
                type="number" min={1} max={meta.ayahs} value={toAyah}
                onChange={(e) => setToAyah(Math.max(1, Math.min(meta.ayahs, Number(e.target.value) || 1)))}
                className="h-9 w-14 rounded-lg px-1 text-center font-bold text-[#0E5A45]"
              />
            </div>

            <div className="hidden items-center gap-1.5 xl:flex">
              <span className="opt-label">الصوت</span>
              <select
                value={reciterId}
                onChange={(e) => { setReciterId(e.target.value); stopSeq(); }}
                className="h-9 rounded-lg px-2 text-xs font-bold"
              >
                {RECITERS.map((r) => (
                  <option key={r.id} value={r.id}>{r.arabicName}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#E6E2D8] pt-3">
            <span className="opt-label">وحدة التكرار</span>
            {UNIT_OPTS.map((u) => (
              <button
                key={String(u.v)}
                className={`opt-chip ${unit === u.v ? "on" : ""}`}
                onClick={() => setUnit(u.v)}
              >
                {u.label}
              </button>
            ))}

            <span className="opt-label ms-1">عدد المرات</span>
            {TIME_OPTS.map((t) => (
              <button key={t} className={`opt-chip ${times === t ? "on" : ""}`} onClick={() => setTimes(t)}>
                ×{toArabicDigits(t)}
              </button>
            ))}
            <select
              value={times}
              onChange={(e) => setTimes(Number(e.target.value))}
              className="h-8 rounded-lg px-1.5 text-xs font-bold"
              title="عدد التكرارات المخصص"
            >
              {Array.from({ length: 30 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>×{n}</option>
              ))}
            </select>

            <span className="opt-label ms-1">السرعة</span>
            {SPEED_OPTS.map((s) => (
              <button
                key={s}
                className={`opt-chip ${speed === s ? "on" : ""}`}
                onClick={() => {
                  setSpeed(s);
                  if (ayahEl.current) ayahEl.current.playbackRate = s;
                  if (fullEl.current) fullEl.current.playbackRate = s;
                }}
              >
                {s}x
              </button>
            ))}

            <div className="ms-auto flex items-center gap-2">
              {status === "playing" && <span className="eq-bar"><span /><span /><span /><span /></span>}
              {activeAyah && (
                <>
                  <button onClick={() => markAyah(activeAyah, "memorized")} disabled={savingId === activeAyah} className="opt-chip">
                    {savingId === activeAyah ? "…" : "✓ حفظتُها"}
                  </button>
                  <button onClick={() => markAyah(activeAyah, "mastered")} disabled={savingId === activeAyah} className="opt-chip">
                    ★ إتقان
                  </button>
                </>
              )}
            </div>
          </div>

          {activeAyah && (
            <div className="mt-2 truncate text-[11px] font-bold text-[#7A6E58]">
              الآية {toArabicDigits(activeAyah)} محددة — {meta.arabicName} • اضغط ▶ للتكرار أو حدّد وحدة التكرار أعلاه
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
