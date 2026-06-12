# Nutrition Database Plan

## Migration

File: `supabase/migrations/007_nutrition_entries.sql`

Status: created, not applied.

The migration adds:

- `nutrition_entries` for dated meals, snacks, and beverages.
- `nutrition_saved_meals` for reusable athlete-specific templates.
- Athlete/date/name indexes.
- Updated-at triggers.
- Entry type, calorie mode, macro, and nonnegative-value constraints.
- RLS policies based on existing `can_access_athlete`, `can_edit_athlete`, and nutrition permissions.

## Safety

- Additive only; no existing table or column is dropped.
- Historical `nutrition_logs` remain unchanged.
- Existing day-level actual values remain the fallback when no entries exist.
- Entries reference `nutrition_logs` optionally, so legacy rows do not need backfilling.
- Soft deletion uses `is_deleted` rather than destructive deletes.
- A backup is recommended before any production migration even though the SQL is non-destructive.

## Cloud Behavior

Before migration 007, missing-table responses are treated as optional and the app continues with local storage. After migration, entries and saved meals load and upsert through the existing Supabase sync layer. The database becomes available without changing local keys or removing backup/export compatibility.

## Production Steps

1. Export a local JSON backup.
2. Review migration 007 in Supabase SQL Editor or CLI.
3. Apply in a non-production or controlled window.
4. Verify tables, indexes, triggers, and RLS are present.
5. Test owner, athlete, viewer, and assigned-admin access with separate accounts.
6. Log an entry on one device and verify it on another.

## Known Limitation

Cloud synchronization is not considered live for these two new resources until migration 007 is applied and RLS is tested against the linked project.
