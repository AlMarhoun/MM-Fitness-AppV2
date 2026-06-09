# Migration Plan

## Goal

Move MM Fitness App from device-only localStorage to Supabase-backed cloud sync without destroying existing local saves.

## Current LocalStorage Keys

- `mm-theme`
- `mm-daily-logs`
- `mm-workout-logs`
- `mm-nutrition-logs`
- `mm-padel-logs`
- `mm-plan`
- `mm-active-workout`

## Backup Process

1. User signs in.
2. User opens Progress > Cloud Account.
3. User taps `Export Backup`.
4. App downloads a JSON backup of all known local keys.
5. Local data remains untouched.
6. Backup metadata may be recorded in Supabase `backup_exports` if signed in.

## Current Cloud Sync Strategy

The first implementation uses a compatibility snapshot in:

- `app_settings.setting_key = 'app_state'`

This preserves all existing app behavior with the least risk. Normalized tables are already available for the next performance-engine phase.

## Future Normalized Mapping

| Local Key | Supabase Target |
|---|---|
| `mm-plan` | `workout_plans`, `plan_days`, `plan_exercises` |
| `mm-workout-logs` | `workout_sessions`, `workout_sets` |
| `mm-daily-logs` | `daily_logs` |
| `mm-nutrition-logs` | `nutrition_logs` |
| `mm-padel-logs` | `padel_sessions` |
| `mm-theme` | `app_settings` |
| `mm-active-workout` | `app_settings` compatibility snapshot or `workout_sessions.status = active` |

## Migration Rules

- Backup first.
- Validate JSON shape before import.
- Upload to Supabase only after successful auth/profile/athlete load.
- Do not silently delete localStorage.
- Local data remains fallback.
- If cloud load fails, app keeps local data and shows sync error.

## Rollback

If cloud sync fails:

1. User keeps local data.
2. User can import prior JSON backup.
3. Disable Supabase module references or revert app to previous v8 files if needed.

## Failure Handling

- Invalid backup file: reject import and show error.
- Supabase unavailable: keep local save, show `Sync error`.
- RLS rejects save: keep local save, show `Sync error`.
- Existing cloud data found: app hydrates from cloud snapshot into localStorage.

## Limitation

This phase does not yet split all historical data into normalized workout/session/set tables at runtime. The schema supports it, and the compatibility snapshot avoids breaking existing workout UX.
