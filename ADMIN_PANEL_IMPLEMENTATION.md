# Admin Panel Implementation

## Status

Admin Panel structure is implemented in the frontend.

The first safe write action is now enabled:

- Add User / Create Access through the deployed Supabase Edge Function `create-user`.
- Player Command Center for reviewing athletes and editing a selected athlete's plan.

Remaining dangerous write actions stay disabled until their own Edge Functions are implemented.

## Location

Progress -> Settings -> Admin Panel.

## Visible To

- `owner`
- `admin`

Owner email fallback:

- `M@Mytamreen.com`

Database source of truth:

- `profiles.role_id`
- `roles`
- `permissions`
- `role_permissions`
- `user_permissions`

## Sections

- Users
- Invite User
- Roles
- Permissions
- Athlete Assignments
- Settings
- Security / Audit Logs
- Available Actions Structure

## Enabled Through Edge Function

- Add user with email, temporary password, role, and athlete assignment.
- Add user with a new separate athlete profile.

Implementation:

- Frontend calls `supabase.functions.invoke("create-user")`.
- Service role access stays inside Supabase Edge Function secrets as `SERVICE_ROLE_KEY`.
- The frontend never receives or stores the service role key.

## Player Command Center

The Admin Panel now includes a focused owner/admin command surface:

- Loads users, athletes, and athlete assignments from Supabase.
- Selects an athlete profile.
- Shows player activity summary:
  - workouts this week
  - total logged volume
  - nutrition adherence this week
  - padel sessions this week
  - last workout
  - latest daily log
- Edits the selected athlete's workout plan.
- Saves the selected athlete's plan to Supabase by `athlete_id`.

Important:

- Editing a selected player plan does not edit Mohammad's local plan unless Mohammad/current athlete is selected.
- Security still depends on Supabase RLS policies. Frontend visibility is only UX.
- Athletes/viewers should not see this panel unless their database role/permissions allow it.

## Disabled Until Additional Backend Functions

- Invite user
- Grant permission
- Change role
- Deactivate
- Assign athlete

## Why Disabled

These require service-role operations and must be handled by Supabase Edge Functions or trusted backend.
