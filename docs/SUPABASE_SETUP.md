# Supabase Setup

## Safe Frontend Values

The frontend may contain:

- Supabase project URL
- Supabase publishable anon key

The frontend must never contain:

- Postgres connection string
- Postgres password
- service role key
- admin secret
- access token

## Apply Migrations

From the upgrade folder:

```bash
supabase login
supabase init
supabase link --project-ref hqnkmddktxxawkdnnqwu
supabase db push
```

Or apply the SQL manually in the Supabase SQL editor in this order:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_rls_policies.sql`

## Admin Setup

Create the admin user through Supabase Auth dashboard or a secure admin process.

Then assign admin role in SQL:

```sql
update public.profiles
set role = 'admin'
where lower(email) = lower('M@Mytamreen.com');
```

Do not commit the admin password to the repo.

## Auth Settings

Recommended:

- Enable email/password auth.
- Set Site URL to the GitHub Pages URL.
- Add local preview redirect URL if needed:
  - `http://127.0.0.1:4199`
  - `http://127.0.0.1:4199/index.html`

## Frontend Files Added

In the app source:

- `src/supabase.js`
- `src/auth.js`
- `src/db.js`
- `src/storage.js`

## First Login Behavior

- New users default to `player`.
- Profile and athlete row are created by database trigger or frontend fallback.
- Users cannot make themselves admin from the frontend.

## Player Management

This phase documents admin role and assigned athlete support. Automated invite/password creation should be implemented later through Supabase Edge Functions or a trusted backend, not the public frontend.
