# Browser Render Test Report

Date: June 12, 2026

## Environment

- URL: `http://127.0.0.1:4311/?v=23&rc=1`
- Browser: Codex in-app browser
- Test viewport height: 844px
- Widths: 320, 360, 375, 390, 414, 430, 480px

## Rendered Screens

Splash, Home, Plan, Logs and History, Nutrition, Progress, Profile, Admin Users/Access/Plans, Active Workout, Cancel confirmation, and Finish confirmation.

## Result

- All tested screens matched document width to viewport width after the Admin Users fix.
- Both workout dialogs remained fully inside every viewport.
- Active Workout start, pause, resume, keep, continue, cancellation, and refresh restoration passed.
- History disclosure rendered exercise sets, volume, and estimated 1RM.
- Dark and light themes rendered; the final session was returned to dark.
- No browser console errors remained.

## Limitation

The authenticated Login screen was not rendered because doing so required logging out of the user's current session. Its absence of public signup was verified through source scans and the security validation script.
