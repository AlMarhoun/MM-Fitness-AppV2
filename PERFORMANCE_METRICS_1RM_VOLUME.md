# Performance Metrics: Estimated 1RM and Volume

Date: 2026-06-09

Scope: Phase 2 only.

## Root Cause

The app stored set logs as weights/reps/completed toggles, but there was no central performance engine to calculate strength metrics from those logs.

Before this phase:

- estimated 1RM was not calculated.
- set volume was not calculated.
- exercise volume was not calculated.
- workout volume was not shown.
- previous best / last performance were not available during Active Workout Mode.
- PR detection did not exist.

The data existed locally, but it was only displayed as raw set inputs/logs.

## Files Changed

Created:

- `src/performance.js`
- `PERFORMANCE_METRICS_1RM_VOLUME.md`

Updated:

- `src/app.js`
- `src/styles.css`
- `sw.js`
- `package.json`
- `CHANGELOG.md`
- `QA_RESULTS.md`

## `src/performance.js`

`src/performance.js` is now the single source for performance calculations.

It owns:

- number normalization
- Epley estimated 1RM
- completed-set volume
- exercise volume
- workout volume
- exercise history lookup
- last exercise performance
- best exercise performance
- PR detection
- progress summary generation

This avoids duplicating performance logic inside `src/app.js`.

## Calculations Added

### Estimated 1RM

Formula:

```text
estimated 1RM = weight × (1 + reps / 30)
```

Only calculated when:

- weight exists
- reps exist
- both are valid positive numbers
- the set is completed

### Set Volume

Formula:

```text
set volume = weight × reps
```

Only calculated for completed sets.

### Exercise Volume

Formula:

```text
exercise volume = sum of completed set volumes for that exercise
```

### Workout Volume

Formula:

```text
workout volume = sum of all completed set volumes in the workout
```

## Where Metrics Appear

### Active Workout Mode

Each exercise now shows a compact performance context card:

- Last session performance
- Previous best weight/reps
- Best estimated 1RM
- Best exercise volume
- New PR badge when current completed sets beat previous records

If there is no history:

- The app shows a clean empty state: `Not enough history yet.`

### Finish Workout Summary

After confirming Finish Workout, the app shows a saved workout summary modal:

- total workout volume
- completed sets
- duration
- best estimated 1RM highlights
- PRs achieved

The modal includes:

- Close
- View Progress

### Progress Screen

The Progress screen now includes:

- Total logged volume
- Volume trend from recent workouts
- Best estimated 1RM by exercise
- Recent PR list

## PR Detection

PR detection compares the current completed exercise performance against the previous best recorded performance.

PR types:

- New best weight
- New rep record
- New estimated 1RM
- New set volume
- New exercise volume

First-ever records are tracked internally but not shown as noisy PR badges during the first logged session.

## Data Dependencies

The engine reads:

- `state.workoutLogs`
- `state.plan`
- current `state.activeWorkout`

Workout logs currently store:

- `dayIndex`
- `duration`
- `sets`
- completed status

Exercise names are inferred from the current plan by `dayIndex` and exercise index.

## Impact on Existing Data

No data migration was performed.

Existing workout logs remain valid.

For old logs:

- If a completed set has weight and reps, it can contribute to metrics.
- If a set is incomplete or missing weight/reps, it is ignored for performance calculations.

## Workout Session Snapshot Fix

Added before Phase 3.

New completed workout sessions now save an exercise snapshot at finish time.

Each saved session can include:

- `workoutName`
- `exerciseSnapshots`
- exercise id if available
- exercise index
- exercise name
- sets prescription
- reps prescription
- intensity
- rest time
- notes
- logged sets
- completed sets
- weight/reps per set
- calculated set volume per completed set
- estimated 1RM per completed set
- best estimated 1RM for the exercise inside that session
- total exercise volume inside that session

Reason:

Workout history must remain accurate even if the current plan is edited later. If Mohammad renames, deletes, reorders, or changes exercises, old completed sessions should still show what was actually performed at that time.

Compatibility:

- New logs prefer `exerciseSnapshots`.
- Old logs without snapshots still work through a fallback to current plan mapping.
- The fallback is only for old data and is less reliable if the plan has been heavily edited.

Implementation:

- `createWorkoutSessionSnapshot()` creates the saved workout structure at finish time.
- `summarizeWorkoutSession()` now prefers snapshot data when present.
- Current plan mapping is used only when no snapshot exists.

## Limitations

- Old historical logs without snapshots still infer exercise names from the current plan. New logs preserve exercise names in the session snapshot.
- Bodyweight-only exercises without weight entries do not produce volume or estimated 1RM.
- The volume trend is a simple compact bar chart, not a full analytics chart.
- Calendar/history work was not started in this phase.
- Auth/admin refinement was not started in this phase.

## Phase 2 Role Review

| Role | Verdict | Reason | Issues Found | Fix Applied | Remaining Concern |
|---|---|---|---|---|---|
| Fitness Data Specialist | Approved | Epley 1RM and volume formulas are centralized and only use completed weighted sets. | Missing/incomplete sets could have been accidentally counted. | `normalizeCompletedSet()` and `setVolume()` ignore incomplete or invalid sets. | Bodyweight movements need a separate future scoring model. |
| Active Workout Flow Engineer | Approved | Active Workout now gives last/best context and PR badge without changing workout controls. | Metrics could clutter the workout screen. | Added one compact performance strip per exercise with empty states. | Needs real gym usability check for readability under fatigue. |
| Front-End Lead Engineer | Approved | Calculations moved to `src/performance.js`; `app.js` only renders outputs. | `app.js` remains large from earlier app structure. | Phase 2 avoided duplicating formulas inside render functions. | Future phases should continue modular extraction. |
| QA Lead | Approved | Formula behavior, incomplete-set exclusion, summary generation, syntax, and manifest validation passed. | No browser/device visual test was run in this environment. | Added explicit behavior tests through Node module checks. | Needs rendered mobile review after deployment. |
| Red Team Reviewer | Approved with caveat | No fake data is shown; empty states appear when history is missing. | Historical mapping relies on current plan exercise indexes. | Limitation documented clearly. | Long-term normalized workout session storage should preserve exercise names at save time. |

## Verification Performed

Commands:

```bash
npm run check
npm run validate:manifest
```

Result:

- Passed.

Behavior check:

- estimated 1RM formula: passed
- set volume formula: passed
- incomplete set exclusion: passed
- workout volume summary: passed
- completed set count: passed
- exercise history lookup: passed
- PR detection: passed
- progress summary: passed

## Phase 2 Status

Approved for owner review.

Do not start Calendar/History or Auth/Admin phase until owner approval.
