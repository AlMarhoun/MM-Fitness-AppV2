# QA Results

## Automated / Static Checks

Date: 2026-06-09

Passed:

- `node --check src/app.js`
- `node --check src/auth.js`
- `node --check src/db.js`
- `node --check src/storage.js`
- `node --check src/supabase.js`
- `node --check sw.js`

Secret scan:

- No Postgres password found.
- No Postgres connection string found.
- No service role key found.
- No admin password found.
- Supabase project URL and publishable key are present intentionally.

## Browser Check

Browser automation was attempted but the browser tool returned an unsupported-call error during this run. Manual browser QA is still required after Supabase migrations are applied.

Local server check:

- Attempted to start Python static server on ports 4199 and 4301.
- Environment returned `PermissionError: [Errno 1] Operation not permitted`.
- Files are ready; preview should be run from the user's local terminal or existing desktop preview server.

## Not Yet Fully Verified

- Live Supabase login.
- RLS behavior against the actual project.
- Player A/B isolation in production.
- Cloud backup write/read against live tables.

Reason: migrations must be applied to the Supabase project before end-to-end cloud QA can complete.
