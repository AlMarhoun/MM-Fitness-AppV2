# QA Test Plan

## Auth

- Open app signed out.
- Confirm login screen appears.
- Sign up as player.
- Confirm default role is player.
- Sign in.
- Logout.
- Refresh and confirm session persistence.

## Data Isolation

- Create Player A and Player B.
- Player A logs data.
- Player B signs in.
- Player B must not see Player A logs.
- Attempt direct table read with another `athlete_id`; RLS should reject.

## Existing Features

- Home dashboard loads.
- Weekly plan loads.
- Workout detail opens.
- Edit workout.
- Add exercise.
- Remove exercise.
- Reorder exercise.
- Start workout.
- Log weight/reps.
- Pause workout.
- Resume workout.
- Cancel workout with confirmation.
- Finish workout with confirmation.
- Log daily metrics.
- Log nutrition.
- Toggle padel.
- View progress.

## Backup/Migration

- Export backup downloads JSON.
- Import backup restores local data.
- Cloud Backup writes app snapshot when signed in.
- Failed cloud backup shows error and preserves local data.

## PWA

- Manifest loads.
- Service worker registers.
- Supabase requests are not cached by service worker.
- Mobile viewport has no horizontal scroll.
- Bottom navigation does not overlap content.

## Security

- Confirm no service role key in frontend.
- Confirm no Postgres password in frontend.
- Confirm admin role cannot be self-assigned.
- Confirm RLS enabled on private tables.
