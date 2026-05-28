# Supabase Preview Testing

Use this checklist before merging `backend-auth-database-foundation` to production. Do not start new features until this preview test passes.

## 1. Supabase Setup

1. Create a Supabase project.
2. Open the Supabase SQL Editor.
3. Run the migration SQL from:

```text
supabase/migrations/20260528162000_auth_database_foundation.sql
```

4. Confirm these tables exist:
   - `profiles`
   - `workouts`
   - `workout_logs`
   - `goals`
   - `progress_entries`
   - `nutrition_entries`
5. Confirm Row Level Security is enabled on every table.
6. Confirm each table has policies that restrict access to the authenticated user's own rows.
7. Confirm no broad public read/write policies exist for private user data.

## 2. Vercel Setup

1. In Vercel, configure Preview environment variables for the branch:

```text
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-public-anon-key
```

2. Confirm no Supabase `service_role` key is present in Vercel env vars.
3. Confirm the build command is:

```bash
npm run build
```

4. Deploy a Vercel preview for `backend-auth-database-foundation`.
5. Confirm the deployed preview loads `config.js` with only URL and anon key.

## 3. Browser Test

1. Open the Vercel preview URL.
2. Open DevTools Console and Network tabs.
3. Confirm there are no startup console errors.
4. Go to Settings.
5. Sign up user A with email/password.
6. Save or update user A profile fields.
7. Add or update goals.
8. Add one workout log.
9. Add one progress entry.
10. Add one nutrition entry.
11. Refresh the page and confirm user A data still appears.
12. Log out user A.
13. In another browser/profile, sign up user B.
14. Confirm user B does not see user A data.
15. Add separate profile/goals/workout/progress/nutrition data for user B.
16. Log out user B.
17. Log back in as user A.
18. Confirm user A data persists.
19. Confirm user A does not see user B data.
20. Check Network tab for failed Supabase requests.

## 4. Security Test

1. Confirm only `SUPABASE_URL` and `SUPABASE_ANON_KEY` are exposed client-side.
2. Confirm no `service_role` key appears in page source, DevTools, Vercel env vars, or repository files.
3. In Supabase Table Editor, confirm rows are tagged with the correct user id.
4. Where practical, use the Supabase API or SQL editor as an authenticated test user to confirm user A cannot read or mutate user B rows.
5. Confirm anonymous users cannot read private tables.
6. Confirm the Admin CMS menu is hidden.
7. Confirm direct Admin section access still shows the locked warning.
8. Confirm `ENABLE_LOCAL_ADMIN_PROTOTYPE` is still `false`.

## 5. Fallback Test

1. Run a local build without Supabase env vars:

```bash
node scripts/build-config.cjs
```

2. Open the app locally.
3. Confirm Settings shows the local-only fallback message.
4. Confirm the app still works with local `localStorage` data.
5. Confirm no Supabase network requests are attempted when config is missing.

## 6. Acceptance Criteria

This branch can move toward production merge only when:

- Vercel preview deploy succeeds.
- Signup, login, logout, and session restore work.
- Profile, goals, workout logs, progress entries, and nutrition entries persist to Supabase.
- User A and user B cannot see each other's private data.
- RLS policies are active and verified.
- Missing env vars produce local-only fallback without crashing.
- No service-role key is exposed anywhere.
- Admin CMS remains disabled and hidden.
- The existing local test scripts pass.

## Production Merge Blockers

Do not merge this branch to production if any of these are true:

- Supabase migration has not been applied.
- RLS is disabled or policies are missing.
- Any private table is publicly readable or writable.
- User A can access user B data.
- Signup/login/logout fails in preview.
- Supabase writes fail in preview.
- `service_role` key is exposed client-side or committed.
- Admin CMS is visible or enabled.
- Console or network errors affect the primary app flow.
