# Notes

## Pending

### 2026-06-09 - Supabase Multi-User Upgrade

Status: ✅ implementation package created on 2026-06-09

Scope:
- Convert MM Fitness App from local-only static PWA to GitHub Pages + Supabase Auth + Supabase Database + strict RLS.
- Preserve existing mobile PWA experience and current workout flows.
- Add admin/player roles with per-user data isolation.
- Protect existing localStorage data through backup/export and staged migration.
- Do not expose database passwords, service role keys, access tokens, or private secrets.

Execution gate:
- Per owner-provided File Note Folder System, implementation must not begin until the owner explicitly says `work`.
- Audit and architecture notes were created first as required by the Supabase upgrade brief.

Implemented:
1. SQL schema and RLS migrations.
2. Supabase setup/security documentation.
3. Auth/storage/db modules.
4. Backup/export/import and cloud snapshot sync.
5. PWA cache review and service worker external-request bypass.

Next pending work:
- Apply migrations to the live Supabase project.
- Run live Player A/B RLS isolation tests.
- Implement normalized runtime writes for workout sessions/sets in the next performance-engine phase.
- Add production hardening later: backend/Edge Functions for admin operations, rate limiting, CI/CD, error tracking, monitoring, and backup policy.

## Completed

### 2026-06-09 - Phase 0/1 Documentation

Status: ✅ done

Created:
- `00_PROJECT_AUDIT.md`
- `01_ARCHITECTURE_DECISION.md`
- Initial `File Notes/` project memory files.

No application code was changed.

### 2026-06-09 - Supabase Upgrade Implementation Package

Status: ✅ done

Created:
- Supabase migrations.
- Auth/session/frontend modules.
- Backup/import/cloud sync UI.
- Required security, migration, PWA, QA, seven-pass review, and final approval docs.

Known limitation:
- Live Supabase migrations and Player A/B isolation QA still need to be run against the actual project.

### 2026-06-09 - Production Stack Cleanup Pass

Status: ✅ done

Changed:
- Removed `.DS_Store` files from the build folders.
- Centralized app persistence through `src/storage.js`.
- Removed direct `localStorage` usage from `src/app.js`.
- Added `mm-auth-mode` to backup/import coverage.
- Created `docs/PRODUCTION_STACK_AUDIT.md`.

Verification:
- JavaScript syntax checks passed.
- Secret scan found no committed database password, service role key, Postgres URL, or admin password in runtime code.
