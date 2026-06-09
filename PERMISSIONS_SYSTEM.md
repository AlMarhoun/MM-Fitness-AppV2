# Permissions System

## Roles

- `owner`: full access to everything.
- `admin`: can manage athletes/viewers only when granted permissions.
- `athlete`: can manage own workout, nutrition, daily, padel, and performance data.
- `viewer`: read-only access to assigned athlete data.

## Permission Model

Permissions live in:

- `permissions`
- `role_permissions`
- `user_permissions`

Role permissions provide defaults. User permissions allow owner/admin-specific overrides.

## Permission Categories

User Management:

- `users.view`
- `users.invite`
- `users.create`
- `users.edit`
- `users.deactivate`
- `users.change_role`

Athlete Management:

- `athletes.view_all`
- `athletes.view_assigned`
- `athletes.create`
- `athletes.edit`
- `athletes.deactivate`
- `athletes.assign_user`

Workout Plan:

- `plans.view`
- `plans.create`
- `plans.edit`
- `plans.delete`
- `plans.assign`

Workout Logging:

- `workouts.view`
- `workouts.create`
- `workouts.edit_own`
- `workouts.edit_assigned`
- `workouts.delete_own`
- `workouts.delete_assigned`

Performance:

- `performance.view`
- `performance.view_all`
- `performance.export`

Daily Logs:

- `daily_logs.view`
- `daily_logs.create`
- `daily_logs.edit_own`
- `daily_logs.edit_assigned`

Nutrition:

- `nutrition.view`
- `nutrition.create`
- `nutrition.edit_own`
- `nutrition.edit_assigned`

Padel:

- `padel.view`
- `padel.create`
- `padel.edit_own`
- `padel.edit_assigned`

Admin:

- `admin_panel.access`
- `settings.view`
- `settings.edit`
- `audit_logs.view`

## Security Rule

Frontend hiding is not security. Real enforcement is in RLS and trusted Edge Functions.
