# Changelog

## 2026-06-09

Added:

- Supabase schema migration.
- RLS migration.
- Auth module.
- DB module.
- Storage module.
- Supabase client module.
- Login/signup screen.
- Session-aware routing.
- Cloud sync status badge.
- Export backup.
- Import backup.
- Manual cloud backup.
- Logout.
- Service worker external-request bypass for Supabase/CDN requests.
- Setup, migration, security, PWA, and QA documentation.

Changed:

- App version references updated to v10.
- Service worker cache changed to `mm-fitness-app-v10-supabase-auth`.
- localStorage writes now queue cloud snapshot sync when authenticated.
- App-level persistence was centralized through `src/storage.js`.
- `mm-auth-mode` is now included in backup/import coverage.
- Upload package cache/version references updated to v11.

Cleaned:

- Removed generated macOS `.DS_Store` files.
- Added `docs/PRODUCTION_STACK_AUDIT.md` with the 13-layer production readiness checklist.
- Created a lean upload package at `00 Output/MM Fitness App Upload Package v11/`.

Preserved:

- Existing app visual direction.
- Current logo.
- Home/Plan/Logs/Nutrition/Progress navigation.
- Active workout pause/resume/cancel/finish flow.
- Local data persistence.
