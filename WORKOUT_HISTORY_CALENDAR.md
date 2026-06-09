# Workout History / Calendar

Date: 2026-06-09

Scope: Phase 3 only.

Includes:

- Workout session snapshot fix
- History / Calendar inside Logs

Does not include:

- Auth/Admin Panel
- Public signup changes
- Redesign

## Root Cause

The app had workout logs, daily logs, nutrition logs, and padel logs, but there was no calendar/history view to review old dates.

The previous data shape also depended on `dayIndex` and exercise index to infer exercise names from the current plan. That is fragile because old history can become inaccurate if the plan is edited later.

## Files Changed

Created:

- `src/history.js`
- `WORKOUT_HISTORY_CALENDAR.md`

Updated:

- `src/performance.js`
- `src/app.js`
- `src/styles.css`
- `sw.js`
- `package.json`
- `PERFORMANCE_METRICS_1RM_VOLUME.md`
- `CHANGELOG.md`
- `QA_RESULTS.md`

## Workout Session Save Structure

New completed sessions now include `exerciseSnapshots`.

Each exercise snapshot stores:

- `exerciseId` if available
- `exerciseIndex`
- `exerciseName`
- `setsPrescription`
- `repsPrescription`
- `intensity`
- `rest`
- `notes`
- `loggedSets`
- `completedSets`
- `totalVolume`
- `bestEstimatedOneRepMax`

Each logged set stores:

- key
- set index
- done state
- weight
- reps
- set volume
- estimated 1RM

The session also stores:

- workout name
- duration
- completed flag
- date
- day index
- raw legacy `sets` object for compatibility

## Backward Compatibility

Old workout logs still work.

If a workout log has `exerciseSnapshots`, history and performance use the snapshot first.

If a workout log does not have `exerciseSnapshots`, the app falls back to the old mapping:

- `dayIndex`
- current plan day
- set key exercise index

This fallback keeps old data readable, but it is less reliable if the plan has been edited after the workout was logged.

## Calendar Placement

The Calendar / History feature was added inside the existing Logs screen.

Reason:

- avoids crowding the bottom navigation
- keeps daily review, body logs, nutrition/padel summaries, and old workout review in one place
- preserves the approved app structure

## How Calendar Reads Days

`src/history.js` provides:

- `monthCalendar(selectedDate, data)`
- `dayStatus(date, data)`
- `dayHistory(date, data)`

Calendar day status checks:

- workout completed
- padel scheduled/completed
- nutrition adhered
- missed scheduled workout
- today
- selected day
- no-data days

## What Appears When Selecting A Date

For the selected date, the Logs screen shows:

- workout completed or not
- workout name
- workout duration
- completed sets
- total workout volume
- best estimated 1RM highlights
- PRs achieved
- exercises performed
- set-level weight/reps/completion
- nutrition adherence
- body metric summary
- padel completion if any
- notes if logged

## Volume / 1RM / PRs In History

History uses `src/performance.js`:

- `summarizeWorkoutSession()` for workout volume, completed sets, exercise summaries, and best 1RM highlights
- `bestExercisePerformance()` for previous best lookup
- `detectExercisePrs()` for PRs achieved on a selected date

No duplicate formulas were added to the UI layer.

## Visual Design

No redesign was performed.

Added UI uses existing premium dark system:

- dark cards
- compact calendar grid
- Ice Blue selected day
- small dot indicators for workout/padel/nutrition/missed states
- existing summary line and chip styling

## Limitations

- Existing old logs without snapshots still rely on plan fallback.
- Calendar month navigation is intentionally minimal in this phase; it shows the month of the selected date and a Today shortcut.
- Visual browser/mobile rendering could not be tested in this environment.
- Real iPhone Add to Home Screen testing remains pending from Phase 1.

## Phase 3 Role Review

| Role | Verdict | Reason | Issues Found | Fix Applied | Remaining Concern |
|---|---|---|---|---|---|
| History & Calendar Specialist | Approved | Calendar and selected-day summary now exist inside Logs without bottom-nav crowding. | No historical view existed before. | Added `src/history.js` and Logs calendar panel. | Month switching beyond selected month can be improved later. |
| Fitness Data Specialist | Approved | History uses the central performance engine for volume, 1RM, and PRs. | Old plan mapping could distort history after edits. | New sessions save exercise snapshots at finish time. | Old logs without snapshots still use fallback. |
| Mobile UX Designer | Approved with caveat | Calendar is compact and contained in Logs; nav remains unchanged. | Calendar could become dense on 320px if many indicators are added later. | Used small dot indicators and compact cards. | Needs rendered mobile width review after deployment. |
| Front-End Lead Engineer | Approved | History logic is separated into `src/history.js`; calculations remain in `src/performance.js`. | `app.js` still contains render wiring. | Kept new logic modular and limited UI changes. | Future phases should continue extracting UI sections. |
| QA Lead | Approved with caveat | Syntax and behavior checks passed for snapshot/history/calendar. | No browser visual test was possible here. | Added Node behavior coverage for snapshot and history. | Needs manual UI verification. |
| Red Team Reviewer | Approved with caveat | Snapshot fix addresses the core historical integrity risk for new logs. | Old logs remain fallback-based. | Limitation is documented and non-destructive. | A future migration could backfill snapshots for old logs if needed. |

## Verification Performed

Commands:

```bash
npm run check
npm run validate:manifest
```

Result:

- Passed.

Behavior checks:

- session snapshot stores exercise name
- snapshot stores exercise volume
- performance summary prefers snapshot
- best exercise performance can read snapshot logs
- selected day history reads workout/nutrition/body data
- monthly calendar returns 42 day cells
- old logs remain supported by fallback path

## Phase 3 Status

Approved for owner review.

Do not start Auth/Admin Panel until owner approval.
