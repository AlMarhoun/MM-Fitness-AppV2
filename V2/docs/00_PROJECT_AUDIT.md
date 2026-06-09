# 00 Project Audit

Date: 2026-06-09  
Project: MM Fitness App  
Audit scope: current static PWA before Supabase multi-user upgrade.

## Current Architecture

The current app is a dependency-free static PWA located at:

`00 Output/MM Fitness App Build V1/`

It runs from static files:

- `index.html`
- `src/app.js`
- `src/styles.css`
- `manifest.json`
- `sw.js`
- `assets/`

There is no backend server, no Supabase client, no Auth, no database, and no user model in the current build.

## Current File Structure

Important files:

- `index.html` - app shell, mobile meta tags, manifest link, CSS/JS imports.
- `src/app.js` - all app logic, screens, state, routing, localStorage persistence, workout flow, forms, modal handling, timer, PWA service worker registration.
- `src/styles.css` - full mobile-first design system and responsive styling.
- `manifest.json` - PWA metadata and install icons.
- `sw.js` - simple cache-first service worker for static assets.
- `assets/brand/` - current approved signature logo assets.
- `assets/icons/` - current PWA icons and favicon.

## Current Storage Model

The app uses browser localStorage for persistent data and sessionStorage for splash state.

Current localStorage keys:

- `mm-theme`
- `mm-daily-logs`
- `mm-workout-logs`
- `mm-nutrition-logs`
- `mm-padel-logs`
- `mm-plan`
- `mm-active-workout`

Current sessionStorage key:

- `mm-splash-done`

Storage functions in `src/app.js`:

- `read(key, fallback)`
- `write(key, value)`
- `saveAll()`

The current app writes directly to localStorage from app event handlers. There is no storage abstraction yet.

## Current Data Model

### Plan

`PLAN` is a JavaScript object embedded in `src/app.js`.

Plan structure:

- `title`
- `startWeight`
- `targetWeight`
- `weeks`
- `days[]`

Each day includes:

- `day`
- `category`
- `duration`
- `hasPadel`
- `padelTime`
- `padelDuration`
- `goal`
- `nutritionType`
- `calories`
- `protein`
- `carbs`
- `fats`
- `exercises[]`

Each exercise includes:

- `name`
- `sets`
- `reps`
- `intensity`
- `rest`
- `notes`
- optional `weightTarget`

### Logs

`mm-daily-logs` stores date-keyed daily body/recovery logs.

Fields currently used:

- `bodyWeight`
- `waist`
- `energyScore`
- `sorenessScore`
- `sleepScore`
- `achillesScore`
- `dietAdherence`
- `notes`

### Nutrition

`mm-nutrition-logs` stores date-keyed nutrition logs.

Fields currently used:

- `adhered`
- `actualCalories`
- `actualProtein`
- `actualCarbs`
- `actualFats`
- `notes`

### Padel

`mm-padel-logs` stores date-keyed padel completion.

Fields currently used:

- `completed`
- `duration`
- `date`

### Active Workout

`mm-active-workout` stores the in-progress workout.

Fields currently used:

- `dayIndex`
- `startedAt`
- `elapsedBeforePause`
- `pausedAt`
- `paused`
- `sets`

Set keys are currently string IDs like:

- `exerciseIndex-setIndex`

Set values currently include:

- `weight`
- `reps`
- `done`

### Completed Workout Logs

`mm-workout-logs` stores date-keyed completed workouts.

Fields currently used:

- `completed`
- `date`
- `dayIndex`
- `duration`
- `sets`

## Current Screens

The current screen router supports:

- `home`
- `plan`
- `active`
- `logs`
- `nutrition`
- `progress`

Major render functions:

- `Splash()`
- `Home()`
- `Plan()`
- `WorkoutDetail()`
- `WorkoutEditor()`
- `ActiveWorkout()`
- `Logs()`
- `Nutrition()`
- `Progress()`
- `BottomNav()`
- `Modal()`

## Current Workout Flow

Supported today:

- User starts today's or selected workout.
- Active workout opens with live timer.
- User enters weight and reps per set.
- User toggles set completion.
- Active workout auto-saves to localStorage.
- User can pause and resume.
- User can cancel with confirmation.
- User can finish with confirmation.
- Finished workout writes to `mm-workout-logs`.

Current limitations:

- Completed session data is date-keyed, so multiple workouts on the same date can overwrite each other.
- There is no exercise history table.
- There is no cloud sync.
- There is no per-user isolation.
- There is no 1RM, volume, PR, or last-session comparison system yet.

## Current PWA Setup

`manifest.json` includes:

- app name
- short name
- standalone display
- portrait orientation
- theme/background color
- PWA icons

`sw.js`:

- Uses a static cache name.
- Caches app shell and image assets.
- Serves cached assets first, then network fallback.
- Falls back to `index.html` on fetch failure.

Current cache version:

- `mm-fitness-app-v8-input-logo`

PWA risk:

- Cache-first strategy may keep old app versions visible after deployment.
- Supabase API requests must not be cached by the service worker.
- Auth updates need a careful cache/version strategy.

## Current Risks

### Security

- No authentication.
- No authorization.
- No RLS.
- No user data isolation.
- No cloud-side enforcement.

### Data Safety

- Reset logs currently removes log keys without backup.
- There is no export/import backup.
- Existing local data could be lost if migration is destructive.
- Completed workouts are date-keyed, not session-ID keyed.

### Architecture

- All logic lives in one large `src/app.js` file.
- Storage calls are direct and scattered.
- Multi-user cloud sync should not be bolted directly into every handler.

### PWA

- Cache-first service worker can create stale deploy behavior.
- Version bumping must be disciplined during Supabase integration.

### UX

- Login/admin/player flow does not exist.
- Sync status does not exist.
- Error states for cloud saves do not exist.

## Reusable Parts

Strongly reusable:

- Visual design system in `src/styles.css`.
- Existing mobile layout and bottom navigation.
- Home, Plan, Workout Detail, Workout Editor, Active Workout, Logs, Nutrition, Progress screen structure.
- Current localStorage model as migration source.
- PWA manifest and icon foundation.
- Active workout timer/pause/resume/cancel/finish flow.

Needs abstraction before reuse:

- localStorage read/write.
- workout save logic.
- active workout save logic.
- daily/nutrition/padel log writes.
- plan editing writes.

## Files To Modify Later

Implementation phase will likely modify:

- `00 Output/MM Fitness App Build V1/index.html`
- `00 Output/MM Fitness App Build V1/src/app.js`
- `00 Output/MM Fitness App Build V1/src/styles.css`
- `00 Output/MM Fitness App Build V1/manifest.json`
- `00 Output/MM Fitness App Build V1/sw.js`

## Files To Add Later

Expected future files:

- `src/supabase.js`
- `src/auth.js`
- `src/db.js`
- `src/storage.js`
- `supabase/migrations/001_initial_schema.sql`
- `supabase/migrations/002_rls_policies.sql`
- `DATABASE_SCHEMA.md`
- `SECURITY_RLS_REPORT.md`
- `MIGRATION_PLAN.md`
- `SUPABASE_SETUP.md`
- `PWA_CACHE_REVIEW.md`
- `QA_TEST_PLAN.md`
- `QA_RESULTS.md`
- `SEVEN_PASS_REVIEW_REPORT.md`
- `FINAL_TEAM_APPROVAL.md`

## Questions Or Assumptions

Assumptions for next phase unless owner changes them:

- Use GitHub Pages + Supabase Auth + Supabase Database + strict RLS.
- Frontend will only use Supabase project URL and publishable anon key.
- No service role key, Postgres password, database URL, or admin secret will be committed.
- Admin profile must be created by SQL/admin setup, not by frontend self-promotion.
- Existing localStorage data must be exportable before migration.
- Supabase becomes the source of truth only after backup and successful migration.

Open decisions:

- Whether admin can view all players or only assigned players.
- Whether player onboarding uses signup by pre-approved email, admin-created invitation, or temporary password.
- Whether offline local writes are allowed after Supabase login or only local backup/export is allowed.

## Phase 0 Status

Completed documentation only. No app code was changed.
