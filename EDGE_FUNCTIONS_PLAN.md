# Edge Functions Plan

Status: partially implemented.

These actions must not be done directly from the public frontend because they require service-role authority.

## Required Functions

### `create-user`

Status: implemented and deployed.

- Verifies requester session server-side.
- Allows owner, and allows admin with restrictions.
- Prevents non-owner from creating owner/admin users.
- Creates Supabase Auth user server-side.
- Creates or updates `profiles`.
- Optionally assigns the user to an athlete.
- Writes `audit_logs`.
- Uses `SERVICE_ROLE_KEY` from Supabase Edge Function secrets only.

### `invite-user`

Status: pending.

- Verify requester has `users.invite`.
- Call Supabase Admin API server-side.
- Create or invite user.
- Write `profiles` row with safe role.
- Write `audit_logs`.

### `change-user-role`

Status: pending.

- Verify requester has `users.change_role`.
- Prevent admin from assigning/removing owner.
- Prevent self-promotion.
- Update `profiles.role_id`.
- Write `audit_logs`.

### `update-user-permissions`

Status: pending.

- Verify owner/admin permission.
- Prevent non-owner changes to owner permissions.
- Upsert `user_permissions`.
- Write `audit_logs`.

### `deactivate-user`

Status: pending.

- Verify `users.deactivate`.
- Prevent owner deactivation by admin.
- Set `profiles.is_active = false`.
- Write `audit_logs`.

### `assign-athlete`

Status: pending.

- Verify `athletes.assign_user`.
- Upsert `athlete_user_assignments`.
- Write `audit_logs`.

## Production Requirement

Store service role key only in Supabase Edge Function secrets. Never expose it in frontend code.
