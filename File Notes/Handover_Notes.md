# Handover Notes

## Project

MM Fitness App is a premium mobile-first PWA for Mohammad's hybrid training system. The current version is a static app with localStorage persistence. The target upgrade is a secure multi-user Supabase-powered app with admin/player roles and strict per-user data isolation.

## Current App Location

`00 Output/MM Fitness App Build V1/`

## Upgrade Output Location

`00 Output/MM Fitness App Supabase Upgrade/`

## Current Stack

- Static HTML/CSS/JavaScript.
- `index.html`
- `src/app.js`
- `src/styles.css`
- `manifest.json`
- `sw.js`
- localStorage persistence.
- Basic PWA service worker cache.

## Target Architecture

GitHub Pages + Supabase Auth + Supabase Database + strict RLS.

## Critical Security Rules

- Never commit or expose Postgres connection strings.
- Never commit or expose database passwords.
- Never commit or expose service role keys.
- Never commit or expose admin secrets or access tokens.
- Frontend may only use Supabase project URL and publishable anon key.
- RLS is mandatory on private data tables.
- Frontend role checks are UX only, not security.

## Current Local Storage Keys

- `mm-theme`
- `mm-daily-logs`
- `mm-workout-logs`
- `mm-nutrition-logs`
- `mm-padel-logs`
- `mm-plan`
- `mm-active-workout`
- `mm-auth-mode`
- `mm-splash-done` in sessionStorage

## Current Core Screens

- Splash
- Home
- Plan
- Workout Detail
- Workout Editor
- Active Workout
- Logs
- Nutrition
- Progress/Settings

## Current Known Risk

The app has no auth or cloud database yet. Any multi-user behavior must be implemented through Supabase Auth + RLS, not frontend-only filters.

## Implemented Upgrade Package

The app now includes:

- `src/supabase.js`
- `src/auth.js`
- `src/db.js`
- `src/storage.js`
- Login/signup screen.
- Session-aware route gating.
- Local backup export/import.
- Cloud snapshot sync to `app_settings`.
- PWA cache bypass for non-same-origin Supabase/CDN requests.
- Storage abstraction now owns app persistence; `src/app.js` no longer calls `localStorage` directly.
- `docs/PRODUCTION_STACK_AUDIT.md` documents the 13-layer production readiness checklist.

## Next Step

Apply Supabase migrations to the live project, create/assign admin role, then run the QA test plan with two users.

Production hardening still needed before a real public launch: backend/Edge Functions for privileged admin operations, rate limiting, CI/CD, error tracking, monitoring, and live Supabase backup policy.
