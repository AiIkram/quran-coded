import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  date,
  uuid,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const hifzProgress = pgTable(
  "hifz_progress",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id"),
    surahNumber: integer("surah_number").notNull(),
    ayahNumber: integer("ayah_number").notNull(),
    status: text("status").notNull().default("new"),
    repetitions: integer("repetitions").notNull().default(0),
    mastery: integer("mastery").notNull().default(0),
    lastReviewed: timestamp("last_reviewed"),
    nextReview: timestamp("next_review"),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("hifz_progress_user_surah_ayah_idx").on(t.userId, t.surahNumber, t.ayahNumber)]
);

export const hifzSessions = pgTable("hifz_sessions", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id"),
  surahNumber: integer("surah_number").notNull(),
  fromAyah: integer("from_ayah").notNull(),
  toAyah: integer("to_ayah").notNull(),
  repetitions: integer("repetitions").notNull().default(0),
  reciter: text("reciter").notNull().default("yassen"),
  mode: text("mode").notNull().default("memorize"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const dailyStats = pgTable(
  "daily_stats",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id"),
    day: date("day").notNull(),
    ayahsMemorized: integer("ayahs_memorized").notNull().default(0),
    repetitions: integer("repetitions").notNull().default(0),
    sessions: integer("sessions").notNull().default(0),
  },
  (t) => [uniqueIndex("daily_stats_user_day_idx").on(t.userId, t.day)]
);

export type HifzProgressRow = typeof hifzProgress.$inferSelect;
export type HifzSessionRow = typeof hifzSessions.$inferSelect;
