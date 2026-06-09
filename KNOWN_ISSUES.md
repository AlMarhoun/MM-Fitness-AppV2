# Known Issues

## Cloud Database Upgrade

- Supabase SQL migrations must be applied manually before normalized cloud storage works.
- RLS policies are written but still require live Supabase testing.
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

- Admin Panel user management is a safe placeholder, not a live invite system.
- Real invites, role changes, deactivation, and athlete assignment require Supabase Edge Function or backend.
- Supabase Auth must be configured as invite-only / public signup disabled in the Supabase project.
- Live RLS testing is still required for owner/admin/athlete/viewer behavior.
