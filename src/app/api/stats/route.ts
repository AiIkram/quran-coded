import { NextResponse } from "next/server";
import { and, desc, eq, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { dailyStats, hifzProgress, hifzSessions } from "@/db/schema";
import { getAuthenticatedUser } from "@/lib/require-user";

export async function GET(req: Request) {
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "authentication-required" }, { status: 401 });
  try {
    const sessions = await db.select().from(hifzSessions).where(eq(hifzSessions.userId, user.id)).orderBy(desc(hifzSessions.createdAt)).limit(20);
    const daily = await db.select().from(dailyStats).where(eq(dailyStats.userId, user.id)).orderBy(desc(dailyStats.day)).limit(30);
    const totals = await db.execute(sql`
      SELECT COUNT(*)::int AS total_ayahs,
        COALESCE(SUM(CASE WHEN status='memorized' THEN 1 ELSE 0 END),0)::int AS memorized,
        COALESCE(SUM(CASE WHEN status='mastered' THEN 1 ELSE 0 END),0)::int AS mastered,
        COALESCE(SUM(CASE WHEN status='memorizing' THEN 1 ELSE 0 END),0)::int AS memorizing,
        COALESCE(SUM(repetitions),0)::int AS repetitions
      FROM hifz_progress WHERE user_id = ${user.id}::uuid
    `);
    const due = await db.execute(sql`SELECT COUNT(*)::int AS due FROM hifz_progress WHERE user_id = ${user.id}::uuid AND next_review <= NOW()`);
    return NextResponse.json({
      sessions,
      daily,
      totals: totals.rows?.[0] ?? { total_ayahs: 0, memorized: 0, mastered: 0, memorizing: 0, repetitions: 0 },
      dueForReview: (due.rows?.[0] as { due?: number } | undefined)?.due ?? 0,
    });
  } catch {
    return NextResponse.json({ sessions: [], daily: [], totals: { total_ayahs: 0, memorized: 0, mastered: 0, memorizing: 0, repetitions: 0 }, dueForReview: 0 }, { status: 503 });
  }
}

export async function POST(req: Request) {
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "authentication-required" }, { status: 401 });
  try {
    const body = await req.json();
    const surahNumber = Number(body.surahNumber);
    const fromAyah = Number(body.fromAyah);
    const toAyah = Number(body.toAyah);
    if (![surahNumber, fromAyah, toAyah].every(Number.isInteger) || surahNumber < 1 || surahNumber > 114 || fromAyah < 1 || toAyah < fromAyah || toAyah > 286) {
      return NextResponse.json({ ok: false, error: "invalid-session" }, { status: 400 });
    }
    const repetitions = Math.max(0, Math.min(10000, Math.floor(Number(body.repetitions ?? 1) || 0)));
    const [session] = await db.insert(hifzSessions).values({
      userId: user.id,
      surahNumber,
      fromAyah,
      toAyah,
      repetitions,
      reciter: String(body.reciter ?? "yassen").slice(0, 100),
      mode: String(body.mode ?? "memorize").slice(0, 30),
    }).returning();
    const today = new Date().toISOString().slice(0, 10);
    await db.execute(sql`
      INSERT INTO daily_stats (user_id, day, ayahs_memorized, repetitions, sessions)
      VALUES (${user.id}::uuid, ${today}::date, 0, ${repetitions}, 1)
      ON CONFLICT (user_id, day) DO UPDATE SET
        repetitions = daily_stats.repetitions + EXCLUDED.repetitions,
        sessions = daily_stats.sessions + 1
    `);
    return NextResponse.json({ ok: true, session });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "authentication-required" }, { status: 401 });
  try {
    const due = await db.select().from(hifzProgress).where(and(eq(hifzProgress.userId, user.id), lte(hifzProgress.nextReview, new Date()))).limit(200);
    return NextResponse.json({ due });
  } catch {
    return NextResponse.json({ due: [] }, { status: 503 });
  }
}
