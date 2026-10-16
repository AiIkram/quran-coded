import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, unknown> = {
    env: {
      DATABASE_URL: Boolean(process.env.DATABASE_URL),
      SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      SUPABASE_ANON_KEY: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    },
  };
  try {
    await db.execute(sql`select 1`);
    checks.connection = "ok";
    const cols = await db.execute(sql`
      select table_name, column_name from information_schema.columns
      where table_schema = 'public' and column_name = 'user_id'
        and table_name in ('hifz_progress','hifz_sessions','daily_stats')`);
    checks.userIdColumnIn = cols.rows.map((r) => (r as { table_name: string }).table_name);
    const idx = await db.execute(sql`
      select indexname from pg_indexes
      where indexname in ('hifz_progress_user_surah_ayah_idx','daily_stats_user_day_idx')`);
    checks.uniqueIndexes = idx.rows.map((r) => (r as { indexname: string }).indexname);
    return Response.json({ ok: true, ...checks });
  } catch (error) {
    console.error("[health]", error);
    return Response.json({ ok: false, errorCode: (error as { code?: string })?.code ?? "unknown", ...checks }, { status: 500 });
  }
}
