# مُتقِن ورش

A Quran memorization website for Warsh recitation, with ayah-by-ayah repetition, tafsir, spaced revision, and personal progress tracking.

This project uses Next.js, PostgreSQL, Drizzle ORM, and Supabase Auth. Render can host the Next.js server, while Supabase provides authentication and PostgreSQL.

## Run locally

1. Install Node.js 20 or newer.
2. Install dependencies with `npm install`.
3. Copy `.env.example` to `.env` and fill in the Supabase values. Keep this file out of Git.
4. Run `npx drizzle-kit push` to create or update the database tables using the connection string in `.env`.
5. Open the Supabase SQL Editor and run `supabase/migrations/202610160001_user_scoped_progress.sql`.
6. Start the development server with `npm run dev`.
7. Open `http://localhost:3000`.

## Supabase setup

1. Create a project at https://supabase.com/.
2. In Project Settings / API, copy the Project URL and the publishable/anon key into `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. In Connect, copy the PostgreSQL connection string. Use a Supabase pooler connection if the direct connection is incompatible with your hosting network. Set it as `DATABASE_URL` in `.env` and later in Render's environment settings.
4. Run `npx drizzle-kit push` from the project directory to create or update the tables, then run `supabase/migrations/202610160001_user_scoped_progress.sql` in the Supabase SQL Editor.
5. In Authentication / URL Configuration, set the Site URL to your deployed Render URL. Add that URL and `http://localhost:3000` to the allowed redirect URLs if you use email confirmation.
6. Test account creation at `/account`. Depending on the Supabase email-confirmation setting, a new account may need to confirm its email before signing in.

## Render deployment

1. Push this project to a GitHub repository.
2. In Render, create a **Web Service** and connect the repository.
3. Choose the Node runtime, set the build command to `npm install && npm run build`, and the start command to `npm start`.
4. Add `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the Render environment settings. Do not expose the database password or any service-role key in client-side variables.
5. Deploy, then open `/account`, create a test account, mark an ayah memorized, and verify that the progress page shows that user's records.

## User progress and privacy

Memorization progress, sessions, and daily statistics are scoped by the authenticated Supabase user ID. The progress and stats API routes verify the access token before returning or changing records. Existing rows from the previous shared-progress version have no owner and are intentionally not shown to any account; review or migrate them manually only if you can identify their rightful owner.

The public Supabase key is intended for client use. The database connection string is server-only. Never commit `.env`, `.env.local`, or publish database credentials. Keep regular database exports/backups; free-tier services may pause or have usage limits.

## Sadaqah jariyah

This is a sadaqah jariyah for me and my loved ones, and for the people of Palestine. May they be free, and may we pray in Al-Aqsa again, insha’Allah.
