ALTER TABLE hifz_progress ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE hifz_sessions ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE daily_stats ADD COLUMN IF NOT EXISTS user_id uuid;

ALTER TABLE hifz_progress DROP CONSTRAINT IF EXISTS hifz_progress_surah_number_ayah_number_key;
DROP INDEX IF EXISTS hifz_progress_surah_ayah_idx;
CREATE UNIQUE INDEX IF NOT EXISTS hifz_progress_user_surah_ayah_idx
  ON hifz_progress (user_id, surah_number, ayah_number);

ALTER TABLE daily_stats DROP CONSTRAINT IF EXISTS daily_stats_day_unique;
ALTER TABLE daily_stats DROP CONSTRAINT IF EXISTS daily_stats_day_key;
DROP INDEX IF EXISTS daily_stats_day_unique;
CREATE UNIQUE INDEX IF NOT EXISTS daily_stats_user_day_idx
  ON daily_stats (user_id, day);

CREATE INDEX IF NOT EXISTS hifz_sessions_user_created_idx
  ON hifz_sessions (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS hifz_progress_user_review_idx
  ON hifz_progress (user_id, next_review);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'hifz_progress_user_id_fkey'
  ) THEN
    ALTER TABLE hifz_progress ADD CONSTRAINT hifz_progress_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'hifz_sessions_user_id_fkey'
  ) THEN
    ALTER TABLE hifz_sessions ADD CONSTRAINT hifz_sessions_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'daily_stats_user_id_fkey'
  ) THEN
    ALTER TABLE daily_stats ADD CONSTRAINT daily_stats_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;
