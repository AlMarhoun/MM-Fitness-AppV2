# Profile and Admin Workspace Upgrade

Date: June 11, 2026

## What Changed

- Added a dedicated Profile screen reachable from the avatar in the app header.
- Moved player management and administration out of Progress into a dedicated Admin Workspace.
- Added private profile-picture upload for every signed-in user.
- Added a player directory with isolated athlete profiles, activity summaries, and plan editing.
- Kept Add User in the Admin Workspace with email, temporary password, role, and athlete assignment.
- Replaced the unstable single-column Strength Progress chart with a bounded mobile chart.

## Profile Pictures

Profile images are stored in the private Supabase Storage bucket `profile-avatars`.

- Each user can upload only to their own user-ID folder.
- Users can read an avatar only when they own it, have user-view permission, or share an athlete assignment allowed by policy.
- The database stores only `avatar_path`; the UI requests a temporary signed URL.
- Accepted formats: JPEG, PNG, WebP, HEIC, and HEIF up to 5 MB.

## Admin Workspace

The workspace is visible only to owner/admin profiles in the UI and is backed by database permissions and RLS.

- Player directory
- Separate athlete profile selection
- Player activity summary
- Player-specific workout plan editing
- Add User flow
- Role and access status
- Safe disabled placeholders for privileged functions that still require dedicated Edge Functions

## Authorization Correction

Migration `005_athlete_self_authorization.sql` gives a user assigned with relationship `self` permission to edit that athlete's own training data. Viewer assignments remain read-only. Admin/coach assignments require the relevant assigned-workout permission.

## Strength Chart Fix

The previous chart used a flex item that expanded across the full card when only one workout existed, creating the oversized semicircle shown in the user screenshot. The replacement chart uses stable grid columns, a fixed plot height, and a 64px centered column for a single data point.

## Validation

- Browser-rendered checks completed at 320, 360, 375, 390, 414, 430, and 480px.
- Home, Plan, Logs, Nutrition, Progress, Profile, Admin Workspace, and Active Workout were checked for overflow.
- Pause, Resume, Cancel, and cancel confirmation were exercised.
- Real iPhone Add to Home Screen validation remains required.
