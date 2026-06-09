# Supabase Database Architecture

## Objective

MM Fitness App V2 is moving from local-only storage to Supabase/Postgres as the primary source of truth after login.

LocalStorage remains only for:

- active workout draft
- iOS/PWA resume fallback
- offline fallback
- backup/export/import

## Architecture

- Frontend: static PWA.
- Auth: Supabase Auth.
- Database: Supabase Postgres.
- Security: RLS enforced in SQL.
- Admin actions: pending Supabase Edge Functions for safe service-role operations.

## Cloud Data Flow

1. User signs in.
2. App loads `profiles`, role, and assigned `athlete`.
3. App loads normalized cloud data:
   - active workout plan
   - plan days
   - plan exercises
   - workout sessions
   - exercise snapshots
   - workout sets
   - daily logs
   - nutrition logs
   - padel sessions
   - settings
4. App rebuilds its runtime state from database rows.
5. Every save queues normalized Supabase writes through `src/storage.js` and `src/sync.js`.

## Files

- `supabase/migrations/001_initial_schema.sql`
- `supabase/migrations/002_roles_permissions.sql`
- `supabase/migrations/003_rls_policies.sql`
- `src/db.js`
- `src/sync.js`
- `src/storage.js`
- `src/roles.js`
- `src/permissions.js`

## Primary Tables

- `profiles`
- `roles`
- `permissions`
- `role_permissions`
- `user_permissions`
- `athletes`
- `athlete_user_assignments`
- `workout_plans`
- `plan_days`
- `plan_exercises`
- `workout_sessions`
- `workout_sets`
- `exercise_snapshots`
- `exercise_library`
- `exercise_records`
- `daily_logs`
- `nutrition_logs`
- `padel_sessions`
- `app_settings`
- `audit_logs`

## Multi-Device Behavior

After migrations are applied, signing in from another device loads the same Supabase-backed data. Local drafts remain device-specific until saved/synced.

## Manual Supabase Setup Required

- Apply the three SQL migration files.
- Confirm Auth public signup is disabled or invite-only.
- Ensure `M@Mytamreen.com` exists in Supabase Auth.
- Run the owner bootstrap update in migration 002 after the owner profile exists.
