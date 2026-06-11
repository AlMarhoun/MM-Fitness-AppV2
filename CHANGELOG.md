# Changelog

## June 12, 2026 - Repository Pre-Push Cleanup

- Removed unreferenced legacy brand mockups and source assets.
- Removed local Supabase CLI temporary files.
- Expanded `.gitignore` for secrets, Supabase temp data, coverage, caches, and editor files.
- Updated README commands and PWA cache information to version 19.

## June 12, 2026 - Flexible Daily Activities

- Added Daily Activities inside Logs for any selected calendar date.
- Added Padel and Swimming activity types with time, duration, intensity, and notes.
- Supports multiple activities on the same day, including Padel and Swimming together.
- Replaced the restricted Home Padel quick action with an always-available Activity action.
- Preserved old Padel logs as legacy activity entries.
- Added activity indicators and details to History / Calendar.
- Added local backup and Supabase app-settings sync for activity logs.
- Bumped PWA assets and cache to version 19.

## June 12, 2026 - Strength Progress Line Chart

- Replaced the Strength Progress column chart with a responsive line chart.
- Added Daily, Weekly, and Monthly volume views.
- Daily view shows the latest 14 recorded training days.
- Weekly view groups Sunday through Saturday for the latest 12 weeks.
- Monthly view groups the latest 12 recorded months.
- Added tested centralized volume-trend aggregation in `src/performance.js`.
- Persisted the selected chart period locally.
- Bumped PWA assets and cache to version 18.

## June 11, 2026 - Premium Profile and Admin Workspace

- Fixed the oversized Strength Progress chart shown when only one volume data point exists.
- Added a dedicated Profile screen and header avatar entry.
- Moved Admin Panel and player management out of Progress into Admin Workspace.
- Added private profile-picture upload and signed avatar display.
- Added a mobile player directory with isolated player details, activity, and plan editing.
- Added Supabase migrations for private profile avatars and self-athlete authorization.
- Fixed a 4px Active Workout overflow at 320px and 360px.
- Added static security validation and a documented quality gate.

## 2026-06-11

### iOS Add to Home Screen Redirect Fix

Fixed:

- Removed the cached `/index.html` navigation fallback that caused Safari's `Response served by service worker has redirections` error.
- Changed PWA launch URL from `/index.html` to `/`.
- Stopped the service worker from intercepting document navigation.
- Prevented redirected responses from entering Cache Storage.
- Added network-first source asset handling and `updateViaCache: none`.

Added:

- `PWA_IOS_REDIRECT_FIX.md`
- `scripts/validate-pwa.mjs`
- `npm run validate:pwa`

Changed:

- PWA cache version increased to `v16`.

## 2026-06-10

### Admin Player Command Center

Added:

- `src/adminData.js` for owner/admin player directory and activity summary helpers.
- Player Command Center inside Admin Panel.
- User/athlete directory loading from Supabase.
- Selected player activity summary.
- Selected athlete plan editor.
- Save selected athlete plan to Supabase by `athlete_id`.
- Create User flow can now create a new separate athlete profile.

Changed:

- Create User role dropdown now defaults to Athlete for safer admin UX.
- Service worker cache updated to `v15` and source files use network-first fetching to reduce stale PWA module issues.
- `create-user` Edge Function now supports `athleteMode: new/current/none`.

Security:

- Service role still remains server-side inside the Supabase Edge Function.
- Player plan writes remain subject to Supabase RLS by `athlete_id`.

### Admin Panel Create User

Added:

- Supabase Edge Function `create-user`.
- Admin Panel Add User form with email, temporary password, role, and athlete access fields.
- Server-side user creation through Supabase Auth Admin API.
- Server-side profile creation and athlete assignment.
- Audit log entry for created users.

Changed:

- Service worker cache updated to `v13` and app/style assets use `?v=13`.
- `ADMIN_PANEL_IMPLEMENTATION.md` now marks Add User as enabled through Edge Function.
- `EDGE_FUNCTIONS_PLAN.md` now marks `create-user` as implemented and the remaining admin actions as pending.

Security:

- Service role key is stored only as the Supabase Edge Function secret `SERVICE_ROLE_KEY`.
- No service role key, database password, or private token was added to frontend code.

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
# Performance Instrument V3 - Phase A/B

- Added the V3 design elevation plan, design audit, and design system.
- Elevated Home into a mission-first athlete command center.
- Added compact Fuel, Recovery, and Body instruments.
- Elevated Active Workout with a compact HUD, current exercise, active set, larger inputs, and fixed Finish dock.
- Added reduced-motion support and restrained interaction feedback.
- Added V3 UI contract testing.
- Bumped static asset and service-worker cache version to V20.

## Performance Instrument V3 - Phase C

- Rebuilt Progress as a premium Performance Cockpit.
- Added a tested presentation model in `src/progressCockpit.js`.
- Added primary performance insight and next-focus guidance based only on available data.
- Added latest, weekly, and monthly volume intelligence with comparison state.
- Added ranked top-three estimated 1RM leaderboard with latest-versus-best context.
- Added PR timeline data with old/new values when available.
- Added weekly/monthly consistency, padel, swimming, nutrition, body direction, and optional recovery pattern.
- Added premium no-data and partial-data states.
- Reduced chart label density and removed misleading one-point trend rendering.
- Added Progress model and snapshot-fallback tests.
- Bumped static asset and service-worker cache version to V21.
