# MM Fitness App Build V1

Premium mobile-first PWA build for **MM Fitness App**, designed for Add to Home Screen daily use.

## How To Run

From this folder:

```bash
python3 -m http.server 4199 --bind 127.0.0.1
```

Then open:

```text
http://127.0.0.1:4199/index.html
```

The app is static and has no external runtime dependencies.

## Supabase Upgrade

This folder is now the complete working project. It includes:

- `src/supabase.js` - Supabase public client config.
- `src/auth.js` - login, signup, logout, session/profile loading.
- `src/db.js` - Supabase data helpers.
- `src/storage.js` - local backup, import/export, and cloud snapshot sync.
- `supabase/migrations/` - database schema and RLS policies.
- `docs/` - setup, security, migration, PWA, and QA documentation.
- `File Notes/` - project memory and operating notes.

To activate the cloud version, apply the migrations in `supabase/migrations/` to the Supabase project, then create/sign in users through Supabase Auth.

Frontend-safe values only are stored in the app: Supabase URL and publishable key. Do not place database passwords or service role keys in this project.

## Main Files

- `index.html` - PWA-ready app shell and mobile meta tags.
- `src/app.js` - app logic, navigation, storage, workout flow.
- `src/styles.css` - V2 design system and responsive mobile styling.
- `manifest.json` - Add to Home Screen metadata.
- `sw.js` - basic offline cache service worker.
- `assets/brand/mm-logo-signature-reference.png` - approved Image Gen logo from the input folder, cleaned for transparent in-app use.
- `assets/brand/mm-logo-splash-reference.png` - splash-scale version of the approved input logo.
- `assets/brand/mm-logo-nav-reference.png` - compact navigation version of the approved input logo.
- `assets/icons/` - PWA icons.
- `screenshots/` - QA screenshots from mobile viewport checks.
- `REFERENCE_MATCH_REPORT.md` - comparison against the attached visual references.

## Built Sections

- Home
- Plan
- Workout Detail
- Editable Workouts
- Active Workout
- Logs
- Nutrition
- Progress
- Settings controls inside Progress

## Design Direction

V2 uses the approved **Performance Signature OS** direction from Image Gen 2 exploration:

- Midnight Navy foundation.
- Ice Blue action/accent.
- Silver Mist typography.
- Teal padel/performance signal.
- Floating app-like bottom navigation.
- Premium command-card home dashboard.
