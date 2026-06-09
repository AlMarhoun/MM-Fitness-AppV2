# Phase 7 iPhone Add to Home Screen Test Plan

Status: Pending real iPhone validation.

Codex did not physically test this phase on an iPhone. Use this file as the manual test script before merge/deploy approval.

## What You Need

- iPhone.
- Safari on iPhone.
- Preview URL for MM Fitness App V2.
- Test login if the preview requires authentication.
- Optional: screen recording enabled from iOS Control Center.

## Before Testing

1. Confirm you are using the V2 preview URL, not the old app URL.
2. If you previously installed the app, delete the old Home Screen icon first.
3. Open Safari.
4. Clear old site data only if you see stale cache behavior.

## Install Test

1. Open the preview link in Safari.
2. Confirm the app loads.
3. Tap Share.
4. Tap Add to Home Screen.
5. Confirm the name is `MM Fitness` or `MM Fitness App`.
6. Tap Add.
7. Launch the app from the iPhone Home Screen icon.

Expected:

- App opens in standalone mode.
- No Safari address bar.
- Bottom navigation respects the iPhone safe area.
- Splash screen appears cleanly and exits into the app.

## Splash / Standalone Check

- [ ] Dark premium splash appears.
- [ ] Logo/image is visible.
- [ ] Splash is not cropped.
- [ ] Splash exits smoothly.
- [ ] App opens to the expected screen.
- [ ] No loading loop.
- [ ] No old cached version.

## Active Workout Lock / Unlock Test

1. Start a workout from Home.
2. Log at least one set:
   - weight
   - reps
   - completed toggle
3. Scroll to the middle of Active Workout.
4. Note the current exercise and visible set.
5. Lock the phone.
6. Wait 30-60 seconds.
7. Unlock the phone.
8. Return to the app from the Home Screen app.

Expected:

- Same Active Workout screen.
- Same scroll position or very close to it.
- Same current exercise visible.
- Same set data preserved.
- Same completed set state preserved.
- Timer state preserved:
  - running workout remains running
  - paused workout remains paused
- No full loading reset unless iOS fully killed the PWA.

Result:

- [ ] PASS
- [ ] PASS WITH NOTES
- [ ] FAIL

Notes:

```text
What happened after unlock:
Timer behavior:
Scroll position:
Set data:
Any loading screen:
```

## Pause / Resume Test

1. Tap Pause Workout.
2. Confirm paused state appears.
3. Change or review a set input.
4. Lock phone.
5. Unlock phone.
6. Confirm still paused.
7. Tap Resume Workout.

Expected:

- Timer stops while paused.
- Data remains visible.
- Resume returns workout to running state.

## Cancel Safety Test

1. Tap Cancel Workout.
2. Confirm dialog appears:
   - `Are you sure you want to cancel this workout?`
   - `This will discard the current workout session.`
3. Tap Keep Workout.
4. Confirm workout remains active and data is preserved.

Expected:

- No accidental data loss.
- Cancel requires confirmation.

## Finish / Save Test

1. Tap Finish Workout.
2. Confirm dialog appears:
   - `Finish workout and save session?`
3. Tap Finish and Save.
4. Confirm Workout Summary appears.

Expected summary:

- total workout volume
- completed sets
- workout duration
- best estimated 1RM highlights if available
- PRs achieved if available

## Calendar / History Review

1. Open Logs.
2. Open History / Calendar.
3. Select today.

Expected:

- Completed workout appears.
- Workout name appears.
- Exercises appear.
- Sets/reps/weights appear.
- Total workout volume appears.
- 1RM highlights or clean empty state appears.
- PRs appear if achieved.

## Progress Metrics Review

1. Open Progress.
2. Check strength/progress cards.

Expected:

- Workout volume updates if enough data exists.
- Best estimated 1RM list updates if enough data exists.
- Recent PR list appears if PRs were achieved.
- No broken cards or overflow.

## Login / Cache Check

1. If authenticated, log out.
2. Log back in.
3. Close the app from the app switcher.
4. Reopen from the Home Screen icon.

Expected:

- No public Create Account button.
- No stale old app version.
- No loading loop.
- App resumes normally.

## Full Pass Criteria

- [ ] App installs to Home Screen.
- [ ] App opens standalone.
- [ ] Splash is clean.
- [ ] Active Workout survives lock/unlock.
- [ ] Set data is not lost.
- [ ] Pause/resume works.
- [ ] Cancel confirmation protects the session.
- [ ] Finish confirmation saves the session.
- [ ] Workout Summary appears.
- [ ] Calendar shows the saved workout.
- [ ] Progress metrics update when data exists.
- [ ] No stale cache/loading loop.

## Fail Criteria

Mark as fail if any of these happen:

- App returns to loading and loses active workout position.
- Set data disappears.
- Timer resets incorrectly.
- Finish does not save.
- Calendar does not show the saved workout.
- Progress crashes or overflows.
- Bottom nav overlaps the iPhone home indicator.
- Old cached version appears after cache clear/reinstall.

## If Cache Looks Wrong

1. Delete the Home Screen app icon.
2. Open Safari.
3. Clear website data for the preview domain.
4. Reopen the preview link.
5. Add to Home Screen again.

## Final Phase 7 Status

Use one:

- [ ] PASS: real iPhone Add to Home Screen validation complete.
- [ ] PASS WITH NOTES: usable, but issues logged.
- [ ] FAIL: fix required before merge/deploy.
- [x] PENDING: not physically tested yet.

Tester notes:

```text
Device:
iOS version:
Preview URL:
Date/time:
Result:
Issues:
Screenshots/videos:
```
