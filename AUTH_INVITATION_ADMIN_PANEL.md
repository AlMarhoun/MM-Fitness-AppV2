# Auth Invitation and Admin Panel

Date: 2026-06-09

Scope: Phase 4 only.

Includes:

- Remove public create account from login.
- Add owner/admin-only Admin Panel structure.
- Define role model and role permissions.
- Document secure invite/backend requirements.

Does not include:

- Real invite email delivery.
- Service role usage.
- Backend/Edge Function implementation.
- Supabase migration changes.

## Root Cause

The login screen previously exposed a public account creation path:

- Create player account button
- signup mode
- `auth-signup` action
- frontend `signUp()` call

That did not match the product requirement. MM Fitness App is private and access must be controlled by owner/admin invitation or backend-created accounts.

## Files Changed

Created:

- `src/roles.js`
- `AUTH_INVITATION_ADMIN_PANEL.md`
- `SECURITY_ROLE_REVIEW.md`

Updated:

- `src/app.js`
- `src/auth.js`
- `src/db.js`
- `src/styles.css`
- `sw.js`
- `package.json`
- `CHANGELOG.md`
- `QA_RESULTS.md`
- `KNOWN_ISSUES.md`

## Public Create Account Removal

Removed from the active frontend:

- signup mode switch
- Create Account button
- display name signup field
- `auth-signup` handler
- frontend `signUp()` export

The login screen now only shows:

- Email
- Password
- Sign In
- Controlled access message

## Admin Panel Visibility

Admin Panel appears inside Progress / Settings only when:

- role is `owner`
- role is `admin`

This is controlled by:

- `src/roles.js`
- `canOpenAdminPanel(profile)`

Athlete/viewer roles do not see the Admin Panel button.

## Roles Added

Roles:

- `owner`
- `admin`
- `athlete`
- `viewer`

## Role Permissions

### owner

Full access to everything.

Can manage:

- admins
- athletes
- viewers
- settings
- data
- permissions

Admin users must not be able to remove the owner.

### admin

Can manage athletes and viewers based on owner permissions.

Cannot:

- remove owner
- promote themselves to owner
- change owner permissions

### athlete

Can access and edit their own assigned fitness data if permission allows.

Can log:

- workouts
- nutrition
- daily logs
- padel sessions

### viewer

Read-only access to assigned athlete data only.

Cannot:

- edit workouts
- log data
- change settings
- open Admin Panel

## Admin Panel Structure

The current Admin Panel is a safe structure/placeholder.

It shows:

- current signed-in user row
- current role
- role definitions
- disabled invite fields
- disabled role selector
- disabled admin action buttons
- explanation that real invites require backend/Edge Function

Planned admin actions:

- Add user
- Invite user
- Set/change role
- Deactivate user
- Assign user to athlete profile

## What Is Actual vs Placeholder

Actual:

- public signup removed from frontend
- role constants and role helpers added
- owner/admin-only Admin Panel visibility
- current user/role display
- role definitions
- safe placeholder admin controls
- no service key in frontend

Placeholder:

- user list beyond current user
- invite user
- change role
- deactivate user
- assign user to athlete

Reason:

These actions require a trusted backend or Supabase Edge Function. They must not be performed with a service role key in the public frontend.

## Required Production Backend / Edge Function

A secure production invite flow should use:

1. User opens Admin Panel.
2. Frontend sends invite request to Supabase Edge Function or backend API.
3. Backend verifies caller role using Supabase Auth JWT.
4. Backend checks permissions in database/RLS-safe way.
5. Backend uses service role key server-side only.
6. Backend creates or invites user.
7. Backend inserts/updates profile role and athlete assignment.
8. Audit log records the action.

Required backend functions:

- invite user
- create user
- update role
- deactivate user
- assign athlete

## Supabase Requirements

Supabase must enforce:

- Signups disabled or invite-only.
- Profiles table supports `owner`, `admin`, `athlete`, `viewer`.
- Users cannot update their own role.
- Admin cannot promote themselves to owner.
- Admin cannot remove owner.
- Athlete/viewer cannot read or mutate other users' private data.
- Viewer is read-only.

## Phase 4 Status

Approved for owner review as a safe frontend/admin structure.

Not production-complete until backend/Edge Function and live RLS tests are implemented.
