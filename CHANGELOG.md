# Changelog

## 2026-06-09

### Cloud Database Upgrade

Added:

- `supabase/migrations/001_initial_schema.sql`
- `supabase/migrations/002_roles_permissions.sql`
- `supabase/migrations/003_rls_policies.sql`
- `src/sync.js`
- `src/permissions.js`
- `SUPABASE_DATABASE_ARCHITECTURE.md`
- `PERMISSIONS_SYSTEM.md`
- `SECURITY_RLS_REPORT.md`
- `EDGE_FUNCTIONS_PLAN.md`
- `LOCAL_TO_SUPABASE_MIGRATION_PLAN.md`
- `MULTI_DEVICE_SYNC_PLAN.md`
- `ADMIN_PANEL_IMPLEMENTATION.md`

Changed:

- Cloud sync now targets normalized Supabase tables instead of only a single local-style app snapshot.
- `localStorage` is now positioned as active workout draft, offline fallback, cache, and backup/export.
- Admin Panel now displays Users, Roles, Permissions, Athlete Assignments, Settings, and Security/Audit structure.
- Service worker cache updated to `v12` and app/style assets use `?v=12`.
- Owner email fallback added for `M@Mytamreen.com`.

Not completed:

- Edge Functions are planned but not implemented.
- RLS policies are authored but not live-tested in Supabase from this environment.
- No deploy, merge, or push was performed.

### Phase 1: Active Workout Resume

Added:

- `src/sessionPersistence.js`
- Local UI-session persistence in `mm-session-ui`
- Active workout screen/cursor/scroll persistence
- `pagehide`, `beforeunload`, `visibilitychange`, and `pageshow` resume guards
- Active workout local-first render path before auth/cloud loading

Changed:

- Active workout now restores before full auth/cloud hydration blocks the UI.
- Cloud snapshot load is skipped during active workout resume to avoid overwriting local in-progress workout data.
- Service worker precache includes `src/sessionPersistence.js`.
- Backup/export coverage includes `mm-session-ui`.

Not changed:

- No visual redesign.
- No calendar/history work.
- No performance metrics work.
- No auth/admin refinement work.

### Phase 2: Performance Engine

Added:

- `src/performance.js`
- Estimated 1RM calculation using Epley formula.
- Set, exercise, and workout volume calculations.
- Best and last exercise performance lookup.
- PR detection for weight, reps, estimated 1RM, set volume, and exercise volume.
- Active Workout performance context strip.
- Finish Workout summary modal.
- Progress screen strength summary, volume trend, best estimated 1RM list, and PR list.

Changed:

- Finished workout logs now store `totalVolume` and `completedSets` summary fields in addition to existing set data.
- Service worker precache includes `src/performance.js`.
- `package.json` check script includes `src/performance.js`.

Not changed:

- No calendar/history work.
- No auth/admin refinement work.
- No visual redesign.

### Phase 3: Workout History / Calendar

Added:

- `src/history.js`
- History / Calendar panel inside Logs.
- Date selection for daily history review.
- Calendar indicators for today, selected day, workout, padel, nutrition, and missed days.
- Selected-day summary with workout, volume, 1RM highlights, PRs, exercises, nutrition, body metrics, padel, and notes.
- Workout session exercise snapshots at finish time.

Changed:

- New completed workout sessions now preserve exercise names and metadata in `exerciseSnapshots`.
- `src/performance.js` now prefers session snapshots over current plan mapping.
- Old workout logs remain supported through current-plan fallback.
- Service worker precache includes `src/history.js`.

Not changed:

- No bottom navigation changes.
- No auth/admin refinement work.
- No full redesign.

### Phase 4: Auth Refinement + Admin Panel Structure

Added:

- `src/roles.js`
- Owner/admin role helpers.
- Owner/admin-only Admin Panel structure in Settings/Progress.
- Role definitions for owner, admin, athlete, viewer.
- Safe placeholder UI for invite, role change, deactivate, and athlete assignment.
- `AUTH_INVITATION_ADMIN_PANEL.md`
- `SECURITY_ROLE_REVIEW.md`

Changed:

- Removed public create-account UI from Login.
- Removed frontend signup handler and `signUp()` export.
- Default safe profile role changed from `player` to `athlete`.
- Service worker precache includes `src/roles.js`.

Not changed:

- No backend/Edge Function implementation.
- No live Supabase RLS migration changes.
- No Calendar/History feature changes beyond compatibility.
- No Performance Engine feature changes.

### Phase 5/6/7/8/9: QA, Visual Readiness, and Planning

Added:

- `PHASE_5_FINAL_QA_REPORT.md`
- `PHASE_6_VISUAL_MOBILE_BROWSER_TEST.md`
- `PHASE_7_IPHONE_A2HS_TEST_PLAN.md`
- `PHASE_8_MERGE_TRANSFER_DEPLOY_PLAN.md`
- `PHASE_9_FINAL_PRODUCTION_CHECKLIST.md`
- `LOCAL_PREVIEW_RUNBOOK.md`
- `BROWSER_VISUAL_TEST_CHECKLIST.md`
- `TEST_FEEDBACK_TEMPLATE.md`
- `BROWSER_VISUAL_TEST_RESULTS.md`

Changed:

- Documentation now separates verified checks from pending iPhone/browser validation.
- Phase 7 iPhone Add to Home Screen test plan is now written as a practical manual test script.
- Browser preview attempt is now documented with the exact environment blockers.

Not changed:

- No merge.
- No deploy.
- No Documents folder transfer.
- No new product feature phase started.
- No feature or UI behavior changes during preview package preparation.
