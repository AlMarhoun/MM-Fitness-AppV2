# Security Role Review

Date: 2026-06-09

Scope: Phase 4 only.

## Security Summary

The frontend no longer exposes public account creation.

The Admin Panel is intentionally a safe placeholder. It does not create users, update roles, deactivate accounts, or assign athletes from the public frontend.

No service role key, database password, Postgres connection string, or admin secret was added.

## Security Boundary

Frontend role checks are UX only.

Real enforcement must happen through:

- Supabase Auth
- Supabase RLS
- secure SQL policies
- Supabase Edge Function or backend for privileged admin actions

## Role Escalation Review

Frontend behavior:

- Users cannot create public accounts from the login screen.
- Users cannot change their own role from the Admin Panel.
- Invite/change-role/deactivate/assign-athlete controls are disabled placeholders.
- `canOpenAdminPanel()` only shows Admin Panel for `owner` and `admin`.

Remaining production requirement:

- Database policies must prevent role self-update.
- Backend/Edge Function must prevent admin self-promotion.
- Backend/Edge Function must prevent admin removing owner.

## RLS Requirements For Production

Profiles:

- owner can manage roles.
- admin can manage athlete/viewer profiles according to permissions.
- users can read their own profile.
- users cannot update their own role.
- users cannot promote themselves.

Athletes and fitness data:

- owner can access all assigned data.
- admin can access assigned athletes only.
- athlete can access own athlete data.
- viewer can read assigned athlete data only.
- viewer cannot insert/update/delete fitness data.

Audit logs:

- privileged actions should write audit logs server-side.
- only owner/admin should read audit logs.

## Edge Function / Backend Requirement

Required because the frontend must never contain the service role key.

Admin actions that require backend:

- invite user
- create user
- set role
- change role
- deactivate user
- assign athlete profile

## Secret Scan Result

Checked for:

- `service_role`
- `postgresql://`
- `Tamreen@12345`
- `YOUR-PASSWORD`
- `sb_secret`
- `access_token`

Result:

- No matching private secrets found in the V2 working copy.

## Phase 4 Role Review

| Role | Verdict | Reason | Issues Found | Fix Applied | Remaining Concern |
|---|---|---|---|---|---|
| Supabase/Auth Engineer | Approved | Public signup path was removed and role model is explicit. | Login previously exposed create-account mode. | Removed signup UI/action/export and added `src/roles.js`. | Supabase live signups must be disabled/invite-only in project settings. |
| Security & RLS Reviewer | Approved with caveat | No service key or secret added; admin operations are placeholders only. | Frontend-only role hiding would be unsafe if treated as enforcement. | Documented RLS/backend requirements and disabled privileged controls. | RLS/Edge Function implementation still required for production. |
| Product Lead | Approved | Private controlled-access model now matches product direction. | Public create account conflicted with private app. | Sign-in only login and owner/admin Admin Panel structure. | Real user management still needs backend. |
| Mobile UX Designer | Approved | Admin Panel is contained inside Settings/Progress and does not alter bottom nav. | Admin controls could crowd mobile. | Used compact rows, disabled controls, and existing card style. | Needs mobile visual check after deployment. |
| Front-End Lead Engineer | Approved | Role helpers are isolated in `src/roles.js`; app changes are scoped. | Auth code had unused public signup capability. | Removed `signUp()` export and signup handler. | Future backend client should be separated cleanly. |
| QA Lead | Approved with caveat | Static checks and role helper behavior checks passed. | Live Supabase role/RLS behavior not testable here. | Added behavior checks for role access and secret scan. | Needs live owner/admin/athlete/viewer testing. |
| Red Team Reviewer | Approved with caveat | No unsafe workaround was implemented. | Supabase may still allow signup if project setting remains enabled. | Frontend path removed and project setting requirement documented. | Must verify Supabase Auth signup setting before production. |

## Security Verdict

Approved as a safe frontend/auth structure.

Not approved as production-complete security until:

- Supabase project signups are disabled or invite-only.
- RLS role policies are live-tested.
- Edge Function/backend implements privileged admin actions.
