# Security RLS Report

Status: migrations authored, not live-tested in Supabase from this environment.

## Helper Functions

- `current_user_role()`
- `is_owner()`
- `is_admin()`
- `has_permission(permission_key text)`
- `can_access_athlete(athlete_id uuid)`
- `can_edit_athlete(athlete_id uuid)`

## RLS Coverage

RLS is enabled in `003_rls_policies.sql` for:

- `profiles`
- `roles`
- `permissions`
- `role_permissions`
- `user_permissions`
- `athletes`
- `athlete_user_assignments`
- `workout_plans`
- `plan_days`
- `plan_exercises`
- `workout_sessions`
- `workout_sets`
- `exercise_snapshots`
- `exercise_library`
- `exercise_records`
- `daily_logs`
- `nutrition_logs`
- `padel_sessions`
- `app_settings`
- `audit_logs`

## Core Rules

- Users read their profile or profiles they are permitted to view.
- Users cannot change their own role through normal profile update.
- Owner can manage users.
- Admin can manage non-owner users only with permissions.
- Athlete/viewer access is limited by `athlete_user_assignments`.
- Workout, nutrition, daily, padel, and performance data require athlete access.
- Sensitive admin actions require Edge Functions.

## Risk Notes

- RLS must be applied and tested in Supabase before production security can be claimed.
- Edge Functions are still pending.
- Public signup must be disabled/invite-only in Supabase Auth settings.
- Owner profile must exist before owner bootstrap update can assign role.

## Test Cases

- Athlete cannot select another athlete's workout sessions.
- Viewer can read assigned athlete data but cannot insert workout sets.
- Admin without `users.change_role` cannot change roles.
- Admin cannot remove or demote owner.
- Owner can view Admin Panel and manage permissions through future Edge Function.
- Frontend contains no service role key.
