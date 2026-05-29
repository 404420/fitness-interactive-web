# Elite Fitness App

Static mobile-first fitness app with a Supabase-backed user data foundation.

## Current Architecture

- Frontend: plain static `index.html`, CSS and JavaScript.
- Hosting: static hosting works on GitHub Pages or Vercel.
- Auth/database: Supabase Auth and Postgres with Row Level Security.
- Local fallback: some data still uses `localStorage` when Supabase is not configured or the user is logged out.

The app must never include Supabase service-role keys or other server secrets in browser code.

## Supabase Setup

1. Create a Supabase project.
2. Open SQL Editor or use the Supabase CLI.
3. Run the migration in:

```text
supabase/migrations/20260528162000_auth_database_foundation.sql
```

The migration creates:

- `profiles`
- `workouts`
- `workout_logs`
- `goals`
- `progress_entries`
- `nutrition_entries`

Every table has `user_id` or user-owned primary key references, `created_at`, `updated_at`, and Row Level Security policies so users can only read/write their own data.

## Environment Variables

Copy `.env.example` to `.env` for local builds:

```text
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-public-anon-key
```

`SUPABASE_ANON_KEY` is public by design, but it is only safe with RLS enabled. Never expose the service-role key.

## Local Development

Generate runtime config:

```bash
npm run build
```

This creates `config.js`, which is intentionally ignored by git. Then open `index.html` or serve the folder with any static server.

If `config.js` is missing, the app runs in local-only fallback mode.

## Vercel Deployment

1. Add environment variables in Vercel:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
2. Set build command:

```bash
npm run build
```

3. Set Vercel Output Directory to:

```bash
public
```

Vercel will generate `config.js` during build and copy only `index.html` plus `config.js` into `public/`. Do not commit `config.js` or `public/`.

## Preview Deployment Checklist

Use a Vercel preview deployment before merging this branch to production:

1. Push the `backend-auth-database-foundation` branch to GitHub.
2. Let Vercel create a preview deployment for that branch.
3. Confirm the preview build runs `npm run build`.
4. Confirm the preview has only these Supabase env vars:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
5. Do not add any Supabase service-role key to Vercel.

Use `SUPABASE_PREVIEW_TESTING.md` for the full runtime checklist and acceptance criteria.

## Manual Supabase Test Plan

After the migration is applied and the Vercel preview has env vars:

1. Open the preview URL.
2. Go to Settings and create a test account with email/password.
3. Log out, then log back in with the same account.
4. Save profile fields, goals, one progress entry, one workout log, and one nutrition entry.
5. Refresh the page and confirm the same data loads back after session restore.
6. Create a second account in a different browser/profile.
7. Confirm the second account does not see the first account's profile, goals, progress, workout logs, or nutrition entries.
8. In Supabase Table Editor, verify rows have the expected `user_id`.
9. Temporarily run a preview/local build without `SUPABASE_URL` and `SUPABASE_ANON_KEY`; the app should show local-only fallback text and keep data only on that device.

## GitHub Pages Deployment

The current workflow deploys static files directly. To use Supabase on GitHub Pages, update the workflow to run `npm run build` before uploading the Pages artifact, with repository/environment secrets mapped to `SUPABASE_URL` and `SUPABASE_ANON_KEY`.

## What Supabase Persists Now

When logged in, the app syncs:

- profile basics
- selected goal and selected program
- nutrition profile JSON
- goals
- workout logs/history
- progress entries
- nutrition entries from the local meal log

## Still Local / Temporary

These areas still use local browser state or static data and need later migration:

- exercise catalog and training program content
- generated nutrition plan details beyond simple nutrition entries
- water log
- recovery snapshots and HealthKit mock data
- subscription/payment demo fields
- admin/content management prototype

## Verification

Run:

```bash
node scripts/check-html.cjs
node scripts/admin-cms-tests.cjs
node scripts/nutrition-mvp-tests.cjs
node scripts/exercise-motion-tests.cjs
node scripts/program-integration-tests.cjs
node scripts/supabase-foundation-tests.cjs
```
