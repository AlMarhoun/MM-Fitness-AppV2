# 01 Architecture Decision

Date: 2026-06-09  
Project: MM Fitness App Supabase Upgrade

## Decision

Use:

GitHub Pages + Supabase Auth + Supabase Database + strict Row Level Security.

No custom backend server will be introduced in the first Supabase upgrade unless a later security or product requirement makes it necessary.

## Why This Architecture Was Selected

The app is currently a static mobile-first PWA. GitHub Pages can continue hosting the frontend while Supabase provides:

- Authentication.
- Session persistence.
- Postgres database.
- Row Level Security.
- User-specific data isolation.
- Admin/player role metadata.
- Future Edge Function upgrade path.

This preserves the current simple deployment model while adding real multi-user capability.

## What Stays Static

The following remain static frontend assets:

- `index.html`
- CSS
- JavaScript modules
- Manifest
- Service worker
- PWA icons and brand assets

GitHub Pages can serve these files without backend compute.

## What Supabase Handles

Supabase will handle:

- User authentication.
- User sessions.
- `profiles` and roles.
- Database persistence.
- Per-user and per-athlete data isolation.
- RLS enforcement.
- Workout plans and logs.
- Workout sessions and sets.
- Exercise history and future PR records.
- Daily logs, nutrition logs, and padel sessions.
- App settings.

## What The Frontend May Access

The frontend may use only:

- Supabase project URL.
- Supabase publishable anon key.

These are public client configuration values. They do not replace RLS. RLS is the actual security boundary.

## What The Frontend Must Never Access

The frontend must never include:

- Postgres connection string.
- Postgres password.
- Supabase service role key.
- Admin secret.
- Access token intended for CLI or server use.
- Private API key.
- Any value that can bypass RLS.

## Security Warning

The owner supplied an admin email and password in chat. That password must not be committed into source code, documentation, migrations, or static frontend files.

The admin account should be created through Supabase dashboard, Supabase Auth admin tooling, or a controlled secure setup process outside the public frontend. Role assignment should be handled through SQL/admin setup and protected RLS policies.

## Auth Model

Recommended model:

- Supabase Auth is the identity provider.
- `profiles.id` references `auth.users.id`.
- Every signed-in user has one `profiles` row.
- Default profile role is `player`.
- Admin role cannot be self-assigned from frontend.
- Admin role must be assigned through controlled SQL/admin setup.

Roles:

- `admin`
- `player`

## Player Management Model

Recommended first implementation:

- Admin creates or pre-approves a player profile by email.
- Player signs up/logs in with that email.
- Player sees only their own athlete data.
- Admin can manage assigned players if policy allows.

This avoids giving the frontend privileged user-creation power.

## Data Ownership Model

Every private row should be owned through one of these:

- Direct `user_id` reference to `auth.uid()`.
- `athlete_id` that resolves to an athlete row owned by or assigned to `auth.uid()`.

Private tables must not rely on frontend filters for security.

## RLS Strategy

RLS must be enabled on all private tables:

- `profiles`
- `athletes`
- `workout_plans`
- `plan_days`
- `plan_exercises`
- `workout_sessions`
- `workout_sets`
- `exercise_records`
- `daily_logs`
- `nutrition_logs`
- `padel_sessions`
- `app_settings`
- optional `audit_logs`
- optional `backup_exports`

Public or shared reference tables such as `exercise_library` may be read by authenticated users, but write access should be restricted.

## API Boundary Decision

For this first upgrade, the frontend may talk directly to Supabase using the publishable anon key, but only because RLS will enforce the true security boundary.

This is acceptable for:

- Reading/writing the current user's own data.
- Reading shared exercise library data.
- Updating personal settings/logs/workouts.

This is not acceptable for:

- Admin-only privileged operations that require service role.
- Bulk dangerous migrations.
- Inviting users in a way that requires elevated credentials.
- Bypassing RLS.

## Future Backend / Edge Function Upgrade Path

Move selected flows to Supabase Edge Functions or a backend API later if needed:

- Admin invite emails.
- Player creation with temporary passwords.
- Rate-limited import/migration jobs.
- Audit logging that should not be client-controlled.
- Batch analytics.
- Server-side PR recomputation.
- Payment or public sharing, if ever added.

## Caching / PWA Decision

The service worker should continue caching static app assets only.

It must not cache Supabase API requests.

The cache strategy should be reviewed and versioned for each deploy to avoid stale auth or app code in standalone mobile mode.

## Deployment Strategy

Initial deployment can remain GitHub Pages.

Recommended deployment rules:

- Use Git branches.
- Avoid pushing secrets.
- Use cache version bumps for frontend deploys.
- Keep SQL migrations in version control.
- Apply Supabase migrations intentionally.
- Document rollback steps.

## Current Phase Status

Architecture decision documented. No app implementation code has been changed yet.
