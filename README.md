# MM Fitness App V2

Premium mobile-first PWA for MM Fitness App alpha.

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
npm run validate:manifest
```

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

Cloud login/sync requires the Supabase schema and RLS migrations from the original build package to be applied before production testing.

## PWA Notes

- Cache version: `mm-fitness-app-v11-upload-ready`
- Open with `?splash=1&v=11` after deployment to force the latest visual pass.
- If iPhone keeps an old icon/app, remove the old home-screen app and add it again after opening the new Vercel URL.
