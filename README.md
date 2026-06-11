# MM Fitness App V2

Premium mobile-first PWA and private athlete command center with Supabase authentication, cloud sync, workout performance tracking, player management, and offline-safe active workout drafts.

## Deployment

This repo is ready to deploy as a new Vercel project.

Recommended Vercel settings:

- Framework Preset: `Other`
- Build Command: leave empty
- Output Directory: leave empty / project root
- Install Command: leave empty

The app is a static PWA using:

- `index.html`
- `manifest.json`
- `sw.js`
- `src/`
- `assets/`
- `vercel.json`

## Local Checks

```bash
npm run check
npm run test:performance-trend
npm run test:activities
npm run validate:manifest
npm run validate:pwa
npm run validate:security
```

Run locally:

```bash
python3 -m http.server 4311 --bind 127.0.0.1
```

Then open `http://127.0.0.1:4311/?v=19`.

## Supabase

The frontend includes only public-safe Supabase values:

- Supabase project URL
- Supabase publishable key

Never commit:

- Postgres connection string
- database password
- service role key
- admin password
- private access tokens

Supabase SQL migrations are stored in `supabase/migrations/`. The secure user-creation function is stored in `supabase/functions/create-user/`.

## PWA Notes

- Cache version: `mm-fitness-app-v19-daily-activities`
- Open with `?splash=1&v=19` after deployment to force the latest visual pass.
- If iPhone keeps an old icon/app, remove the old home-screen app and add it again after opening the new Vercel URL.

## Repository Notes

- `src/`: application logic and UI.
- `assets/`: only assets referenced by the app, manifest, or service worker.
- `tests/`: performance and activity regression tests.
- `supabase/migrations/`: database schema, permissions, RLS, and profile/avatar migrations.
- Root markdown files: security, QA, PWA, migration, and implementation handoff records.
