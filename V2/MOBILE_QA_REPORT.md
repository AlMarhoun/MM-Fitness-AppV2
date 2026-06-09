# Mobile QA Report

## Tested Widths

Screenshots were captured for:

- 320px
- 360px
- 375px
- 390px
- 393px
- 414px
- 430px
- 480px

Final screenshots:

- `screenshots/reference-final-home-320.png`
- `screenshots/reference-final-home-360.png`
- `screenshots/reference-final-home-375.png`
- `screenshots/reference-final-home-390.png`
- `screenshots/reference-final-home-393.png`
- `screenshots/reference-final-home-414.png`
- `screenshots/reference-final-home-430.png`
- `screenshots/reference-final-home-480.png`

## Checks Performed

- No horizontal scrolling observed visually.
- Bottom nav fits at 320px.
- Buttons remain tappable.
- Cards remain within viewport width.
- Text wraps correctly.
- Workout inputs fit on 390px active workout view.
- Finish confirmation modal fits within mobile viewport.
- Light mode contrast issue was found and fixed.
- Reference-matching screenshots were captured for splash, home, and edit workout.

## Issues Found And Fixed

### Issue 1: Light mode text contrast

Severity: High

Problem:
Light mode background switched correctly, but primary text inherited dark-mode body color in some areas and became too faint.

Fix:
Applied `color: var(--text)` directly to `.app-shell`.

Result:
Light mode now renders readable title, cards, metrics, and navigation.

### Issue 2: Active workout sticky controls covering set rows

Severity: High

Problem:
Pause/Cancel/Finish controls were sticky near the bottom and covered input rows during training.

Fix:
Moved Pause/Cancel into the sticky workout header and made Finish Workout a normal end-of-session action below the exercise list.

Result:
Inputs remain visible, and Pause/Cancel stay accessible.

### Issue 3: Fixed bottom nav and end content spacing

Severity: Medium

Problem:
The fixed bottom nav could visually sit over lower Home content in full-page screenshots.

Fix:
Increased bottom page padding and added a home tail margin.

Result:
Content can scroll above the nav and the nav no longer blocks final interactive content at the end of the page.

## Remaining Mobile Notes

The app is optimized for phone portrait usage. Desktop is capped at 480px intentionally.
