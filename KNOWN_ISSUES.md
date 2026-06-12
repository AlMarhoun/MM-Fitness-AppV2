# Known Issues

## Phase H Release Candidate

- Real iPhone Add to Home Screen lock/unlock, safe-area, OLED contrast, avatar picker, and service-worker replacement are still pending physical device validation.
- Live owner/admin/athlete/viewer RLS isolation still requires separate Supabase accounts and cross-role testing.
- The Login screen was source- and security-tested without logging out of the current authenticated browser session; a clean-session rendered Login check remains part of the final test deployment pass.
- The current live account had no recent PR item, so the PR-rich timeline state remains covered by deterministic model tests rather than a live rendered PR record.
- Legacy workout logs without exercise snapshots continue to use the documented current-plan fallback.
- Admin actions without deployed secure Edge Functions remain disabled by design.
- No commit, push, or deployment was performed during the June 12 polish pass.

## Pending Device Validation: iOS PWA Redirect Fix

- Code fix completed on June 11, 2026.
- The manifest no longer launches `/index.html`.
- The service worker no longer caches or serves redirected navigation responses.
- The fix still requires deployment to Vercel and a physical iPhone Add to Home Screen retest.
- iPhones that stored the previous broken service worker may need the existing Home Screen icon and site data removed once before reinstalling.

## Cloud Database Upgrade

- Supabase migrations 001-005 are applied to the linked project.
- RLS still requires live cross-role testing with separate owner, admin, athlete, and viewer accounts.
- Edge Functions for invite/user creation/role changes/permission updates/deactivation/athlete assignment are planned but not implemented.
- Existing localStorage data is not deleted automatically; user should export backup before migration.
- Active workout remains local-first by design until finished/synced.
- If Supabase Auth public signup is enabled in dashboard settings, it must be disabled/invite-only manually.
- Owner bootstrap requires the `M@Mytamreen.com` Auth user/profile to exist.

## Phase 1: Active Workout Resume

- Pending device validation: real iPhone Add to Home Screen lock/unlock testing is still required before considering this issue 100% closed.
- Real iPhone Add to Home Screen lock/unlock behavior has not been physically tested from this environment.
- iOS may fully kill a PWA in the background. The app now restores from local state, but cannot prevent OS-level termination.
- Timer continuity is timestamp-based after a full reload; it preserves running/paused state but not sub-second precision.
- Supabase live cloud behavior still requires migrations/auth setup and real account testing.

No known syntax-level issues after Phase 1 verification.

## Phase 3: History / Calendar

- Needs mobile/browser visual testing.
- Old workout logs without `exerciseSnapshots` rely on current-plan fallback.
- iPhone Add to Home Screen lock/unlock test is still pending from Phase 1.
- Calendar month navigation is currently minimal.

## Phase 4: Auth / Admin Panel

- Secure create-user is implemented through the deployed Edge Function structure. Other privileged actions such as role changes and deactivation remain disabled until their dedicated Edge Functions exist.
- Real invitation email, role changes, deactivation, and expanded assignment operations require their planned Supabase Edge Functions or backend endpoints.
- Supabase Auth must be configured as invite-only / public signup disabled in the Supabase project.
- Live RLS testing is still required for owner/admin/athlete/viewer behavior.

## Profile and Admin Workspace Upgrade

- Private avatar upload now includes two-axis positioning, zoom, previews, reset, and cropped export. Camera-library selection, touch dragging, HEIC upload, and final framing still need physical iPhone validation.
- Apply migration `006_profile_avatar_crop.sql` so crop metadata persists alongside the private avatar. The cropped image upload itself has a backward-compatible fallback before the migration is applied.
- Signed avatar URLs are refreshed when profile/admin data reloads; a continuously open session may need a screen refresh after URL expiry.
- Remaining privileged actions such as changing roles and deactivation stay disabled until their dedicated secure Edge Functions are deployed.
- No production deployment was performed as part of this local upgrade.
# Performance Instrument V3 Pending Validation

- Phase A/B require physical iPhone Add to Home Screen visual validation, especially safe-area spacing around the fixed Finish Workout dock.
- Existing pending real-device lock/unlock validation remains open; browser reload restoration passed but is not a substitute for an iOS lifecycle test.
- Phase D/E/F/G now use Performance Instrument V3. Phase H browser and automated QA completed; physical iPhone validation remains pending.

## Phase C Notes

- Progress is now V3. History, Nutrition, Logs, Profile, Admin, and Navigation remain on their earlier structure.
- The current live account did not contain a recent PR, so the PR-rich visual timeline was verified through deterministic model tests rather than a live rendered PR record.
- Strength leaderboard candidates inherit the existing `summarizeProgress` behavior, which seeds exercise names from the current plan. Historical exercises removed from the plan can remain available in History but may not appear in the top leaderboard.
- Physical iPhone Add to Home Screen visual validation remains pending.

## Phase D/E/F/G Notes

- Physical iPhone Add to Home Screen testing remains required for safe-area spacing, navigation motion, modal reachability, and lock/unlock behavior.
- Old workout logs without exercise snapshots still use the documented current-plan fallback.
- Privileged Admin actions other than the deployed create-user flow remain disabled until dedicated secure Edge Functions exist.
- Live owner/admin/athlete/viewer isolation still requires cross-account Supabase/RLS testing.
- Admin Plans are significantly shorter with collapsed exercises, but large plans naturally remain scrollable.
- Browser screenshot capture timed out in the test surface; rendered DOM, interaction, viewport, and overflow checks completed successfully.
# Performance Rhythm Remaining Validation - June 12, 2026

- Real iPhone Add to Home Screen motion smoothness still requires physical-device validation.
- `prefers-reduced-motion` is implemented and automated-contract tested; final OS-level visual confirmation should be performed on iPhone.
- Motion intentionally remains subtle in Admin and destructive confirmations; this is a safety choice, not a missing effect.

## Nutrition Engine

- Migration `007_nutrition_entries.sql` has not been applied. Entry-level cloud persistence and cross-device saved meals remain local/fallback until it is applied.
- Live owner/admin/athlete/viewer RLS testing is required after migration 007.
- Real iPhone Add to Home Screen entry-sheet reachability and keyboard behavior remain pending physical testing.
- Existing sync conflict behavior is last-write-wins; simultaneous edits to the same entry on two offline devices need product-level conflict rules if that becomes a real use case.
- Macro distribution always reflects calories derived from macro grams. When a manual calorie override is used, the daily calorie total may intentionally differ from the chart's macro-calorie total.
