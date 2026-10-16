import { NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { hifzProgress } from "@/db/schema";
import { getAuthenticatedUser } from "@/lib/require-user";

export async function GET(req: Request) {
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "authentication-required" }, { status: 401 });
  const url = new URL(req.url);
  const surah = url.searchParams.get("surah");
  try {
    const filters = surah
      ? and(eq(hifzProgress.userId, user.id), eq(hifzProgress.surahNumber, Number(surah)))
      : eq(hifzProgress.userId, user.id);
    const rows = await db.select().from(hifzProgress).where(filters).limit(7000);
    return NextResponse.json({ progress: rows });
  } catch {
    return NextResponse.json({ progress: [], error: "db-unavailable" }, { status: 503 });
  }
}

export async function POST(req: Request) {
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "authentication-required" }, { status: 401 });
  try {
    const body = await req.json();
    const items = Array.isArray(body) ? body : [body];
    const results = [];
    for (const item of items) {
      const surahNumber = Number(item.surahNumber ?? item.surah);
      const ayahNumber = Number(item.ayahNumber ?? item.ayah);
      if (!Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > 114) continue;
      if (!Number.isInteger(ayahNumber) || ayahNumber < 1 || ayahNumber > 286) continue;
      const allowedStatuses = new Set(["new", "memorizing", "memorized", "mastered"]);
      const status = allowedStatuses.has(String(item.status)) ? String(item.status) : "memorized";
      const repetitions = Math.max(0, Math.min(10000, Math.floor(Number(item.repetitions ?? 1) || 0)));
      const mastery = Math.max(0, Math.min(5, Math.floor(Number(item.mastery ?? (status === "mastered" ? 5 : status === "memorized" ? 3 : 1)) || 0)));
      const now = new Date();
      const gaps = [1, 1, 3, 7, 14, 30];
      const nextReview = new Date(now.getTime() + gaps[mastery] * 86400000);
      const existing = await db.select().from(hifzProgress).where(and(
        eq(hifzProgress.userId, user.id),
        eq(hifzProgress.surahNumber, surahNumber),
        eq(hifzProgress.ayahNumber, ayahNumber),
      )).limit(1);
      if (existing.length) {
        const previous = existing[0];
        const [updated] = await db.update(hifzProgress).set({
          status,
          repetitions: previous.repetitions + repetitions,
          mastery,
          lastReviewed: now,
          nextReview,
          updatedAt: now,
        }).where(and(eq(hifzProgress.id, previous.id), eq(hifzProgress.userId, user.id))).returning();
        if (updated) results.push(updated);
      } else {
        const [inserted] = await db.insert(hifzProgress).values({
          userId: user.id,
          surahNumber,
          ayahNumber,
          status,
          repetitions,
          mastery,
          lastReviewed: now,
          nextReview,
        }).returning();
        if (inserted) results.push(inserted);
      }
    }
    if (results.length) {
      const today = new Date().toISOString().slice(0, 10);
      const memorizedCount = results.filter((row) => row.status === "memorized" || row.status === "mastered").length;
      await db.execute(sql`
        INSERT INTO daily_stats (user_id, day, ayahs_memorized, repetitions, sessions)
        VALUES (${user.id}::uuid, ${today}::date, ${memorizedCount}, 0, 0)
        ON CONFLICT (user_id, day) DO UPDATE SET
          ayahs_memorized = daily_stats.ayahs_memorized + EXCLUDED.ayahs_memorized
      `);
    }
    return NextResponse.json({ ok: true, updated: results.length, progress: results });
  } catch {
    return NextResponse.json({ ok: false, error: "db-error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "authentication-required" }, { status: 401 });
  try {
    const url = new URL(req.url);
    const surah = Number(url.searchParams.get("surah"));
    const ayah = Number(url.searchParams.get("ayah"));
    if (surah && ayah) {
      await db.delete(hifzProgress).where(and(
        eq(hifzProgress.userId, user.id),
        eq(hifzProgress.surahNumber, surah),
        eq(hifzProgress.ayahNumber, ayah),
      ));
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ ok: false }, { status: 400 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
