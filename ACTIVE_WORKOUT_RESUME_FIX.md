# Active Workout Resume Fix

Date: 2026-06-09

Scope: Phase 1 only.

## Root Cause

The app already saved the active workout data in `mm-active-workout`, including logged sets, weights, reps, pause state, and timer fields.

The resume problem came from the app boot sequence and missing UI-session persistence:

- `state.screen` always started as `home`.
- The app did not persist the current screen, current exercise/set cursor, or scroll position.
- On reload or iOS PWA resume, `initAuth()` could put the app into a full loading screen before the active workout UI was restored.
- If the URL had `?splash=1`, the splash/loading layer could show again even while an active workout existed.
- Cloud snapshot hydration could run after auth and potentially overwrite local active workout state with older cloud state.

Result: after phone lock/unlock or iOS PWA reload, the user could see loading and land at the top/beginning instead of returning to the active workout position.

## What Changed

Created:

- `src/sessionPersistence.js`

Updated:

- `src/app.js`
- `src/storage.js`
- `sw.js`
- `package.json`

## Active Workout Draft Persistence

The app now saves active workout UI state separately in:

- `mm-session-ui`

It stores:

- current screen
- selected day
- active workout id
- current exercise/set cursor
- scroll position
- running/paused state
- saved timestamp

The active workout data itself remains in:

- `mm-active-workout`

It stores:

- workout id
- day index
- started timestamp
- elapsed-before-pause seconds
- paused/running state
- paused timestamp
- logged set data
- logged weights
- logged reps
- completed set toggles

## Restore Behavior After Lock/Unlock

On boot:

- The app reads `mm-active-workout` before rendering.
- The app reads `mm-session-ui` before rendering.
- If an active workout exists, the app starts directly in Active Workout Mode.
- Splash is skipped for active workout resume.
- Active Workout Mode is allowed to render before auth/profile/cloud checks finish.

During use:

- `pagehide` persists the active workout immediately.
- `beforeunload` persists the active workout immediately.
- `visibilitychange` persists when the app goes hidden.
- `visibilitychange` restores active workout screen and scroll when the app becomes visible.
- `pageshow` restores active workout state and scroll when the page returns from the browser/PWA cache.
- Scroll position is preserved across Active Workout re-renders.

Cloud sync behavior:

- If an active workout is in progress, the app does not load a cloud snapshot over the local workout during auth hydration.
- Instead, it queues a cloud snapshot from the current local state.
- This prevents older cloud data from replacing the active workout draft.

## What Is Saved Locally

Saved through existing app storage:

- `mm-active-workout`
- `mm-plan`
- `mm-workout-logs`
- `mm-daily-logs`
- `mm-nutrition-logs`
- `mm-padel-logs`
- `mm-theme`

Saved through new session UI persistence:

- `mm-session-ui`

Added to backup/export coverage:

- `mm-session-ui`

## What Still Needs Real iPhone Testing

Desktop checks cannot fully prove iOS Add to Home Screen lifecycle behavior.

Needs real iPhone testing:

- Start workout from installed PWA.
- Log weight/reps.
- Scroll midway.
- Lock phone.
- Wait 30-60 seconds.
- Unlock phone.
- Confirm same active workout screen.
- Confirm same scroll position.
- Confirm same logged set data.
- Confirm timer continues if workout was running.
- Confirm timer stays stopped if workout was paused.
- Switch apps and return.
- Confirm no loading loop.

## iOS PWA Limitation

iOS may suspend or kill a PWA in the background. The app cannot prevent iOS from killing the process.

The fix makes the app local-first on return:

- active workout draft is already persisted
- screen state is restored before cloud sync
- auth loading no longer blocks the active workout screen

If iOS fully kills Safari/WebKit, the timer is recalculated from saved timestamps. That preserves running/paused state, but it cannot guarantee exact sub-second continuity.

## Design / Feature Impact

No visual redesign was made.

No navigation changes were made.

No workout features were removed.

No Performance Engine, Calendar, or Auth Refinement work was started in this phase.

## Data Risk

Low.

The change adds an extra local UI-state key and avoids overwriting in-progress local workout state with cloud data during active workout resume.

Existing workout data remains in the same `mm-active-workout` and log keys.

## Phase 1 Role Review

| Role | Verdict | Reason | Issues Found | Fix Applied | Remaining Concern |
|---|---|---|---|---|---|
| Active Workout Flow Engineer | Approved | Active workout now saves screen, cursor, scroll, timer state, pause/running state, and set data locally. | App previously saved workout data but not workout UI position. | Added `mm-session-ui`, local-first active route, cursor/scroll persistence. | Needs real gym/iPhone lock test. |
| PWA / iOS Reliability Engineer | Approved with caveat | `pagehide`, `beforeunload`, `visibilitychange`, and `pageshow` are covered. | iOS may kill PWA process unpredictably. | Resume now starts from local storage before cloud hydration. | iOS lifecycle cannot be fully validated from desktop tools. |
| Front-End Lead Engineer | Approved | Session persistence is isolated in `src/sessionPersistence.js` instead of bloating storage/auth code. | `app.js` still remains large, but Phase 1 stayed scoped. | Added a focused helper module and minimal app integration. | Future phases should continue extracting logic. |
| QA Lead | Approved with caveat | Syntax checks and storage helper checks passed. | Real iPhone lock/unlock cannot be automated in this environment. | Added explicit manual iPhone test checklist. | Must run on installed PWA before claiming device-verified. |
| Red Team Reviewer | Approved with caveat | Fix avoids false security/performance claims and does not pretend iOS can be controlled. | A cloud snapshot could previously overwrite local active data. | Skipped cloud load-over-local during active workout and queued local snapshot instead. | Supabase live behavior still needs testing after migrations/auth are active. |

## Verification Performed

- JavaScript syntax checks for all app modules.
- Manifest JSON validation.
- Session persistence helper import/storage behavior check with mocked localStorage.
- Static scan confirmed `src/sessionPersistence.js` is included in the service worker asset list.

## Phase 1 Status

Approved for handoff to user review.

Do not start Phase 2 until the owner approves.
