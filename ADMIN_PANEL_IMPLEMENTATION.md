# Admin Panel Implementation

## Status

Admin Panel structure is implemented in the frontend. Dangerous write actions remain disabled until Edge Functions are implemented.

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

## Disabled Until Backend

- Add user
- Invite user
- Grant permission
- Change role
- Deactivate
- Assign athlete

## Why Disabled

These require service-role operations and must be handled by Supabase Edge Functions or trusted backend.
