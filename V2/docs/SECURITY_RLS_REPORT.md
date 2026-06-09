# Security / RLS Report

## Security Boundary

The frontend is not trusted for data isolation. Supabase RLS is the security boundary.

Frontend may use:

- Supabase project URL
- Supabase publishable anon key

Frontend must never use:

- Postgres connection string
- Postgres password
- service role key
- admin secret
- CLI access token

## Helper Functions

- `is_admin()` checks active `profiles.role = 'admin'`.
- `owns_athlete(athlete_id)` checks direct athlete ownership.
- `can_access_athlete(athlete_id)` allows direct owner, assigned admin, or admin.
- `prevent_profile_privilege_escalation()` prevents non-admin users from changing role/email/active state.

## RLS Summary

| Table | RLS | Select | Insert | Update | Delete | Risk |
|---|---:|---|---|---|---|---|
| profiles | Yes | own/admin | self player | own safe/admin | admin | Medium |
| athletes | Yes | own/assigned/admin | self/admin | own/assigned/admin | admin | Medium |
| workout_plans | Yes | accessible athlete | accessible athlete | accessible athlete | accessible athlete | Low |
| plan_days | Yes | accessible athlete | accessible athlete | accessible athlete | accessible athlete | Low |
| plan_exercises | Yes | accessible athlete | accessible athlete | accessible athlete | accessible athlete | Low |
| exercise_library | Yes | authenticated | admin | admin | admin | Low |
| workout_sessions | Yes | accessible athlete | accessible athlete | accessible athlete | accessible athlete | Low |
| workout_sets | Yes | accessible athlete | accessible athlete | accessible athlete | accessible athlete | Low |
| exercise_records | Yes | accessible athlete | accessible athlete | accessible athlete | accessible athlete | Low |
| daily_logs | Yes | accessible athlete | accessible athlete | accessible athlete | accessible athlete | Low |
| nutrition_logs | Yes | accessible athlete | accessible athlete | accessible athlete | accessible athlete | Low |
| padel_sessions | Yes | accessible athlete | accessible athlete | accessible athlete | accessible athlete | Low |
| app_settings | Yes | accessible athlete | accessible athlete | accessible athlete | accessible athlete | Low |
| backup_exports | Yes | own/admin | own | no update | own/admin | Low |
| audit_logs | Yes | admin | authenticated self/admin | none | none | Medium |

## Relationship Integrity

In addition to RLS, `assert_athlete_relationships()` prevents child rows from pointing to another athlete's parent records. This hardens inserts for plan days, plan exercises, workout sessions, workout sets, and exercise records.

## Test Cases

1. Player A selects from `daily_logs`: only Player A athlete rows should return.
2. Player A attempts insert with Player B `athlete_id`: RLS should reject.
3. Player A attempts to update `profiles.role` to `admin`: trigger should force old role.
4. Player A attempts to select Player B workout sessions: RLS should reject.
5. Admin selects player athlete data: allowed when admin policy applies.
6. Unauthenticated user selects private data: rejected.
7. Authenticated player selects `exercise_library`: allowed.
8. Player inserts into `exercise_library`: rejected.

## Remaining Security Concern

Admin invite/user creation should eventually move to a trusted server/Edge Function if temporary passwords or email invites are automated. The first implementation should avoid privileged frontend user creation.
