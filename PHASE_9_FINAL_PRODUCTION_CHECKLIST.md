# Phase 9 Final Production Checklist

Status: Checklist only. Not final approval.

## Active Workout Resume

- [ ] Start workout.
- [ ] Log reps/weights.
- [ ] Scroll mid-workout.
- [ ] Pause/resume.
- [ ] Lock/unlock iPhone.
- [ ] Confirm same screen and scroll position.
- [ ] Confirm timer state.
- [ ] Confirm set data remains.
- [ ] Confirm no full loading reset.

## iPhone Add to Home Screen

- [ ] Open in Safari.
- [ ] Add to Home Screen.
- [ ] Launch from Home Screen.
- [ ] Confirm standalone display.
- [ ] Confirm bottom safe area.
- [ ] Confirm no Safari browser chrome.

## PWA Manifest

- [ ] `manifest.json` valid.
- [ ] app name correct.
- [ ] icons load.
- [ ] theme/background color correct.
- [ ] display is standalone.

## Service Worker Cache

- [ ] `sw.js` registers.
- [ ] new modules are cached:
  - `sessionPersistence.js`
  - `performance.js`
  - `history.js`
  - `roles.js`
- [ ] old cache does not keep stale app.
- [ ] update behavior tested after deployment.

## Splash Screen

- [ ] dark premium splash appears.
- [ ] logo appears.
- [ ] no cropping on iPhone.
- [ ] exits cleanly.
- [ ] active workout resume skips unnecessary splash.

## Login

- [ ] Sign In only.
- [ ] no Create Account.
- [ ] no signup mode.
- [ ] no public signup messaging.
- [ ] invalid credentials show clean error.

## Admin Panel Limitations

- [ ] Admin Panel visible only to owner/admin.
- [ ] athlete/viewer cannot see Admin Panel.
- [ ] invite/change-role/deactivate controls remain disabled until backend exists.
- [ ] limitations are documented.

## Supabase Security Caveats

- [ ] public signup disabled/invite-only in Supabase.
- [ ] no service role key in frontend.
- [ ] no database password in frontend.
- [ ] profiles roles include owner/admin/athlete/viewer.
- [ ] user cannot self-promote.
- [ ] admin cannot remove owner.

## RLS

Not production-complete unless live tested.

- [ ] owner access tested.
- [ ] admin access tested.
- [ ] athlete own-data isolation tested.
- [ ] viewer read-only access tested.
- [ ] cross-user access denied.
- [ ] role update restrictions tested.

## Performance Metrics

- [ ] estimated 1RM correct.
- [ ] set volume correct.
- [ ] exercise volume correct.
- [ ] workout volume correct.
- [ ] incomplete sets ignored.
- [ ] PRs detected.
- [ ] Progress screen updates.
- [ ] Workout Summary updates.

## Calendar / History

- [ ] calendar opens.
- [ ] today marked.
- [ ] selected day marked.
- [ ] completed workouts marked.
- [ ] padel/nutrition indicators appear.
- [ ] old logs fallback works.
- [ ] new snapshots preserve exercise names after plan edits.

## Mobile Visual QA

- [ ] 320px
- [ ] 360px
- [ ] 375px
- [ ] 390px
- [ ] 414px
- [ ] 430px
- [ ] 480px
- [ ] no horizontal overflow.
- [ ] no bottom nav overlap.
- [ ] no modal overflow.
- [ ] calendar readable.
- [ ] active workout readable.
- [ ] admin panel readable.

## Data Backup / Export / Import

- [ ] export backup works.
- [ ] import backup works.
- [ ] active workout local state included.
- [ ] history data preserved.
- [ ] cloud backup behavior tested after Supabase setup.

## Known Issues

- [ ] iPhone real device validation pending.
- [ ] browser visual render pending.
- [ ] old logs without snapshots use fallback.
- [ ] admin invite flow needs backend.
- [ ] RLS live test pending.

## Rollback Plan

- [ ] backup zip created before transfer.
- [ ] git status checked.
- [ ] diff reviewed.
- [ ] Vercel preview tested before production.
- [ ] rollback command/path documented.

## Deployment Readiness

Do not deploy until:

- [ ] owner approves transfer.
- [ ] owner approves commit.
- [ ] owner approves Vercel deploy.
- [ ] Phase 7 iPhone test is completed or accepted as pending alpha risk.
- [ ] Supabase security settings are reviewed.
