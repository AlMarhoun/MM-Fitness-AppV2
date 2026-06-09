# Browser Visual Test Checklist

Use this checklist after running the local preview or Vercel preview.

## Test URLs

Local:

```text
http://127.0.0.1:4311/index.html?splash=1&v=11
```

Vercel preview:

```text
https://YOUR-PREVIEW-URL/?splash=1&v=11
```

## Responsive Widths

Test each:

- [ ] 320px
- [ ] 360px
- [ ] 375px
- [ ] 390px
- [ ] 414px
- [ ] 430px
- [ ] 480px

For every width check:

- [ ] no horizontal overflow
- [ ] no cut-off buttons
- [ ] no broken cards
- [ ] no modal overflow
- [ ] no bottom navigation overlap
- [ ] no tiny unreadable text
- [ ] tap targets feel large enough
- [ ] page can scroll vertically without stuck areas
- [ ] fixed bottom navigation does not hide the last card/action

## Splash / Loading

- [ ] Splash appears on `?splash=1`.
- [ ] Logo/image loads.
- [ ] No cropping.
- [ ] Animation exits cleanly.
- [ ] App does not get stuck on loading.
- [ ] Active workout resume does not show unnecessary full loading screen.
- [ ] Refresh does not show a stale old build after cache clear.

## Login Screen

- [ ] Sign In only.
- [ ] No Create Account.
- [ ] No signup mode.
- [ ] Controlled access copy is visible.
- [ ] Email/password inputs fit.
- [ ] Error state is readable.

## Home Dashboard

- [ ] Header/logo renders correctly.
- [ ] Today workout card is clear.
- [ ] Start Workout button is easy to tap.
- [ ] Nutrition/padel/recovery cards fit.
- [ ] Weekly progress does not overflow.
- [ ] Bottom nav does not cover content.

## Active Workout

- [ ] Timer is visible.
- [ ] Exercise cards fit.
- [ ] Last/best performance strip is readable.
- [ ] Set inputs are large enough.
- [ ] Completed set button is tappable.
- [ ] Pause button works.
- [ ] Resume button works.
- [ ] Cancel button opens confirmation.
- [ ] Keep Workout closes confirmation.
- [ ] Finish opens confirmation.
- [ ] Inputs do not overflow at 320px.
- [ ] Scrolling midway then refreshing restores active workout state from local draft.
- [ ] Returning to Active Workout does not wipe typed reps/weights.

## Workout Summary

- [ ] Appears after Finish and Save.
- [ ] Total volume visible.
- [ ] Completed sets visible.
- [ ] Duration visible.
- [ ] Best 1RM highlights visible if data exists.
- [ ] PRs visible if achieved.
- [ ] Close button works.
- [ ] View Progress button works.
- [ ] Modal fits height/width.

## Progress Metrics

- [ ] Progress screen opens.
- [ ] Weight cards fit.
- [ ] Weekly progress fits.
- [ ] Strength Progress card fits.
- [ ] Volume trend bars do not overflow.
- [ ] Best Estimated 1RM list fits.
- [ ] Recent PR list fits.
- [ ] Settings remains visible.

## Logs

- [ ] Logs screen opens.
- [ ] Daily body metric inputs fit.
- [ ] Recovery score buttons fit.
- [ ] Notes field fits.

## History / Calendar

- [ ] Calendar grid appears.
- [ ] Today is visually marked.
- [ ] Selected day is visually marked.
- [ ] Workout completed indicators appear.
- [ ] Padel indicators appear.
- [ ] Nutrition indicators appear.
- [ ] Missed/no-data days are understandable.
- [ ] Tapping a day changes selected summary.
- [ ] Workout summary appears for completed day.
- [ ] Exercises performed are readable.
- [ ] Sets/reps/weights are readable.
- [ ] Old fallback logs do not crash.
- [ ] New finished workouts show exercise snapshot names even after plan edits.

## Nutrition

- [ ] Nutrition screen opens.
- [ ] Target card fits.
- [ ] Adherence control fits.
- [ ] Actual intake inputs fit.
- [ ] Notes field fits.

## Settings / Admin Panel

- [ ] Settings section appears in Progress.
- [ ] Admin Panel button appears only for owner/admin.
- [ ] Admin Panel does not appear for athlete/viewer.
- [ ] Admin Panel card fits.
- [ ] Current user row fits.
- [ ] Disabled invite fields are clearly disabled.
- [ ] Role definitions are readable.
- [ ] Disabled dangerous actions do not look active.

## Bottom Navigation

- [ ] Home tab works.
- [ ] Plan tab works.
- [ ] Logs tab works.
- [ ] Nutrition tab works.
- [ ] Progress tab works.
- [ ] Active state is clear.
- [ ] Safe area spacing looks correct.
- [ ] No horizontal movement when switching tabs.
- [ ] Active capsule/selected state remains visually premium.

## Visual Identity

- [ ] Midnight Navy background intact.
- [ ] Ice Blue highlights intact.
- [ ] Silver Mist text/borders intact.
- [ ] Cards still feel premium.
- [ ] No generic/default browser UI styling appears.
- [ ] Typography remains readable.

## Report Any Issue

Use:

`TEST_FEEDBACK_TEMPLATE.md`

## Final Browser Result

- [ ] PASS: ready for iPhone Add to Home Screen test.
- [ ] PASS WITH NOTES: usable, but issues were logged.
- [ ] FAIL: do not proceed to iPhone test until fixed.

Notes:

```text
Browser:
Viewport(s):
Result:
Issues:
Screenshots/videos:
```
