# Local To Supabase Migration Plan

## Status

Prepared. Automatic destructive migration is not enabled.

## Flow

1. Export local backup JSON.
2. Validate backup structure.
3. Keep local backup available.
4. Sign in.
5. Confirm profile and athlete assignment.
6. Upload local state through `src/sync.js`.
7. Confirm data appears in Supabase tables.
8. Mark cloud sync active.
9. Keep localStorage as fallback only.

## Mapping

- `mm-plan` -> `workout_plans`, `plan_days`, `plan_exercises`
- `mm-workout-logs` -> `workout_sessions`, `exercise_snapshots`, `workout_sets`
- `mm-daily-logs` -> `daily_logs`
- `mm-nutrition-logs` -> `nutrition_logs`
- `mm-padel-logs` -> `padel_sessions`
- `mm-theme` -> `app_settings`
- `mm-active-workout` -> local draft only
- `mm-session-ui` -> local PWA resume only

## Safety

Do not delete local data automatically. The user should export a backup before migration and verify cloud data on another device.
