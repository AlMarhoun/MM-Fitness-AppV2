# QA Results

## Cloud Database Upgrade

Date: 2026-06-09

### Checks Performed

- Auth/profile data layer reviewed.
- Normalized database migrations authored.
- RLS policies authored for all private tables.
- Frontend syntax check run through `npm run check`: PASS.
- Manifest validation run through `npm run validate:manifest`: PASS.
- Secret-pattern scan: PASS with documentation-only matches.

### Review Passes

1. Database Schema Review: PASS WITH LIVE-TEST CAVEAT
   - Tables, relationships, indexes, and snapshots are represented.
   - Needs Supabase SQL execution validation.

2. RLS / Security Review: PASS WITH LIVE-TEST CAVEAT
   - Policies authored, helper functions added.
   - Cannot claim production security until tested in Supabase.

3. Permissions System Review: PASS
   - Role defaults and permission keys added in SQL and frontend catalog.

4. Front-End Integration Review: PARTIAL
   - Storage now routes cloud save/load through normalized sync layer.
   - Existing UI preserved.
   - Requires live Supabase database test.

5. Migration Review: PASS AS PLAN
   - Backup-first local-to-cloud plan documented.
   - No automatic destructive migration.

6. Multi-Device Sync Review: PARTIAL
   - Data model and sync layer support multi-device access after login.
   - Requires real iPhone/Mac same-account test after migrations.

7. Admin Panel Review: PARTIAL
   - Structure and permissions table visible to owner/admin.
   - Mutations disabled pending Edge Functions.

8. Regression Review: PENDING LIVE APP TEST
   - Syntax checks pass when command succeeds.
   - Full rendered mobile regression still required after deploy.

Date: 2026-06-09

## Phase 1: Active Workout Resume

## Automated / Static Checks

Command:

```bash
npm run check
```

Result:

- Passed.
- Checked:
  - `src/app.js`
  - `src/auth.js`
  - `src/storage.js`
  - `src/sessionPersistence.js`
  - `src/db.js`
  - `src/supabase.js`
  - `sw.js`

Command:

```bash
npm run validate:manifest
```

Result:

- Passed.
- `manifest.json` is valid JSON.

Command:

```bash
node --input-type=module <sessionPersistence behavior check>
```

Result:

- Passed.
- Confirmed:
  - `mm-session-ui` can save screen state.
  - scroll position is persisted.
  - active workout resume detection works.
  - session UI cleanup works.

## Manual Review Checklist

Not executed in this environment:

- Physical iPhone Add to Home Screen lock/unlock test.
- Real iOS app switch/return test.
- Real Supabase auth/cloud behavior after migrations.

Reason:

This Codex environment cannot control an installed iPhone PWA or simulate iOS WebKit lifecycle exactly.

## Required Owner Device Test

1. Open deployed MM Fitness App V2 from iPhone Add to Home Screen.
2. Start workout.
3. Enter weight/reps for a set.
4. Scroll to the middle of Active Workout Mode.
5. Lock phone.
6. Unlock phone.
7. Confirm same active workout screen.
8. Confirm same scroll position.
9. Confirm same set data.
10. Confirm timer state:
    - running continues if not paused
    - paused stays paused if paused
11. Switch apps and return.
12. Confirm no full loading reset.

## Phase 1 QA Verdict

Approved for owner device testing.

Not approved as iPhone-verified until the manual Add to Home Screen test is completed on the real device.

## Phase 2: Performance Engine

## Automated / Static Checks

Command:

```bash
npm run check
npm run validate:manifest
```

Result:

- Passed.
- `src/performance.js` is included in syntax checks.

Behavior check:

```bash
node --input-type=module <performance behavior check>
```

Result:

- Passed.

Confirmed:

- Estimated 1RM uses Epley formula.
- Set volume is `weight × reps`.
- Incomplete sets are ignored.
- Workout volume sums completed weighted sets only.
- Completed set count is correct.
- Exercise history lookup works.
- PR detection works.
- Progress summary returns volume trend and best estimated 1RM list.

## Manual Review Not Performed

- Rendered mobile visual review was not performed in this environment.
- Real workout usability review in the gym was not performed.

## Phase 2 QA Verdict

Approved for owner review and deployed/mobile visual testing.

## Phase 3: Workout History / Calendar

## Automated / Static Checks

Command:

```bash
npm run check
npm run validate:manifest
```

Result:

- Passed.
- `src/history.js` is included in syntax checks.

Behavior check:

```bash
node --input-type=module <history/snapshot behavior check>
```

Result:

- Passed.

Confirmed:

- New workout session snapshots store exercise name.
- Snapshot exercise volume is calculated.
- `summarizeWorkoutSession()` prefers snapshot data.
- Best exercise performance reads snapshot logs.
- Selected-day history reads workout, nutrition, and body data.
- Calendar month returns 42 cells.
- Old logs without snapshots still work through fallback.

## Manual Review Not Performed

- Rendered calendar UI was not tested in a browser from this environment.
- Mobile width visual review was not completed for the calendar.
- Real iPhone Add to Home Screen test remains pending.

## Phase 3 QA Verdict

Approved for owner review and mobile visual testing.

## Phase 4: Auth Refinement + Admin Panel Structure

## Automated / Static Checks

Command:

```bash
npm run check
npm run validate:manifest
```

Result:

- Passed.
- `src/roles.js` is included in syntax checks.

Behavior check:

```bash
node --input-type=module <roles behavior check>
```

Result:

- Passed.

Confirmed:

- owner can open Admin Panel.
- admin can open Admin Panel.
- athlete cannot open Admin Panel.
- admin cannot manage owner.
- admin can manage athlete.
- unknown old roles normalize to `athlete`.

Static signup scan:

- No active `signUp`, `auth-signup`, `toggle-auth-mode`, `Create Account`, or public create-account UI remains in `src/`.

Secret scan:

- No service role key, Postgres URL, admin password, or private token patterns found.

## Manual Review Not Performed

- Live Supabase role/RLS testing was not performed.
- Real invite email flow was not implemented or tested.
- Mobile visual review of Admin Panel was not performed.

## Phase 4 QA Verdict

Approved as a safe frontend/admin structure.

Not production-complete until Supabase invite-only settings, RLS policies, and Edge Function/backend admin actions are implemented and tested.
