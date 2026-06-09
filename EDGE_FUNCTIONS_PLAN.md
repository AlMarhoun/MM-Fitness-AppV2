# Edge Functions Plan

Status: planned, not implemented in this pass.

These actions must not be done directly from the public frontend because they require service-role authority.

## Required Functions

### `invite-user`

- Verify requester has `users.invite`.
- Call Supabase Admin API server-side.
- Create or invite user.
- Write `profiles` row with safe role.
- Write `audit_logs`.

### `change-user-role`

- Verify requester has `users.change_role`.
- Prevent admin from assigning/removing owner.
- Prevent self-promotion.
- Update `profiles.role_id`.
- Write `audit_logs`.

### `update-user-permissions`

- Verify owner/admin permission.
- Prevent non-owner changes to owner permissions.
- Upsert `user_permissions`.
- Write `audit_logs`.

### `deactivate-user`

- Verify `users.deactivate`.
- Prevent owner deactivation by admin.
- Set `profiles.is_active = false`.
- Write `audit_logs`.

### `assign-athlete`

- Verify `athletes.assign_user`.
- Upsert `athlete_user_assignments`.
- Write `audit_logs`.

## Production Requirement

Store service role key only in Supabase Edge Function secrets. Never expose it in frontend code.
