# iPhone Add to Home Screen Final Test Plan

Status: Pending real iPhone validation.

## Install Cleanly

1. Deploy the approved candidate to a test URL.
2. Remove an older Home Screen icon if it points to the previous service worker.
3. Open the test URL in Safari and choose Share > Add to Home Screen.
4. Launch from the new icon and confirm standalone display.

## Core Test

1. Confirm splash is brief and Home appears without a loop.
2. Open every bottom-navigation tab.
3. Open Profile and Admin Workspace.
4. Confirm no public Create Account appears on Login.

## Workout Lifecycle Test

1. Start today's workout.
2. Enter weight and reps and complete at least one set.
3. Scroll to the middle of the workout.
4. Lock the phone for 30 seconds.
5. Unlock and reopen the PWA.
6. Confirm the same screen, exercise, set data, completion, timer state, and scroll position.
7. Pause, lock/unlock, and confirm the paused timer does not advance.
8. Resume, test Cancel > Keep Workout, and test Finish > Continue Workout.
9. Finish and save a real session only when ready.
10. Confirm Workout Summary, Calendar, and Progress contain the saved metrics.

Record device model, iOS version, test URL, expected result, actual result, screenshot/video, and severity for every issue.
