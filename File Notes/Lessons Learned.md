# Lessons Learned

## Binding Owner Rules

- The app must stay English-only.
- Preserve the premium MM Fitness App mobile experience.
- Security and RLS are higher priority than UI polish during the Supabase upgrade.
- Do not expose service role keys, database passwords, Postgres connection strings, admin secrets, access tokens, or private API keys.
- Frontend may only use Supabase project URL and publishable anon key.
- Do not trust frontend checks as security.
- Do not disable RLS to make development easier.
- Do not delete localStorage data without backup.
- Do not break existing workout functionality.
- No implementation should begin before audit and architecture decision are documented.
- Under the File Note Folder System, implementation waits for the owner to explicitly say `work`.

## Product Preferences

- Mobile-first PWA.
- Premium dark athletic interface.
- Midnight Navy, Ice Blue, Silver Mist.
- Fixed bottom navigation.
- Smooth daily workout use.
- Large touch targets during active workout.
- Avoid overcomplicating the daily flow.

## Security Preferences

- Admin cannot be created by frontend self-promotion.
- Players must not access another player's data.
- Admin permissions must be explicit and documented.
- Existing local saves must be protected through export/backup before migration.

## Trigger Words

- `work` = execute pending tasks from `Notes.md`.
- `note it` = document only, no execution.
- `what do we have?` = show current `Notes.md` status.
