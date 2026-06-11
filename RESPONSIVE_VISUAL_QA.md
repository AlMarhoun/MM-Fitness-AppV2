# Responsive Visual QA: Performance Instrument V3 Phase A/B

## Environment

- URL: `http://127.0.0.1:4311/?v=20`
- Browser surface: Codex in-app browser.
- Viewport height: 844px.
- Widths tested: 320, 360, 375, 390, 414, 430, and 480px.

## Home Dashboard Results

| Width | Horizontal overflow | Mission Stage | Instrument row | Bottom navigation |
|---:|---|---|---|---|
| 320 | None | Pass | Pass | Pass |
| 360 | None | Pass | Pass | Pass |
| 375 | None | Pass | Pass | Pass |
| 390 | None | Pass | Pass | Pass |
| 414 | None | Pass | Pass | Pass |
| 430 | None | Pass | Pass | Pass |
| 480 | None | Pass | Pass | Pass |

At every width, document width matched viewport width exactly.

## Active Workout Results

| Width | Horizontal overflow | Workout HUD | Active set | Finish dock |
|---:|---|---|---|---|
| 320 | None | Pass | Pass | Pass |
| 360 | None | Pass | Pass | Pass |
| 375 | None | Pass | Pass | Pass |
| 390 | None | Pass | Pass | Pass |
| 414 | None | Pass | Pass | Pass |
| 430 | None | Pass | Pass | Pass |
| 480 | None | Pass | Pass | Pass |

The Finish dock remained inside the viewport at every width. Active screen bottom clearance allows the final exercise to scroll above the dock.

## Visual Findings And Fixes

- The 320px layout required narrower set columns and a compact finish dock. Dedicated 360px-and-below rules were added.
- Sync status is hidden in the compact Home header at 360px and below to protect identity and profile spacing; sync remains available elsewhere and is not functionally removed.
- Mission facts use stable grid tracks and truncate long activity labels rather than expanding the page.

## Remaining Device Concern

Physical iPhone Add to Home Screen rendering was not tested in this phase. Safe-area CSS is present, but final visual approval still requires a real iPhone check.

## Phase C: Progress Cockpit

Tested in the Codex in-app browser at 844px viewport height.

| Width | Document width | Cockpit fit | Volume section fit | Navigation fit | Result |
|---:|---:|---|---|---|---|
| 320 | 320 | Pass | Pass | Pass | No overflow |
| 360 | 360 | Pass | Pass | Pass | No overflow |
| 375 | 375 | Pass | Pass | Pass | No overflow |
| 390 | 390 | Pass | Pass | Pass | No overflow |
| 414 | 414 | Pass | Pass | Pass | No overflow |
| 430 | 430 | Pass | Pass | Pass | No overflow |
| 480 | 480 | Pass | Pass | Pass | No overflow |

### Phase C Visual Fixes

- At 360px and below, strength leaderboard best values move to a second row instead of compressing exercise names.
- PR value changes move below the PR identity at compact widths.
- Consistency and recovery instruments change from four columns to two columns at compact widths.
- Chart period controls become full-width on compact screens.
- A one-point dataset now shows a premium guidance state rather than a meaningless line chart.
- Recovery is not rendered when no recovery data exists.

### Theme Review

- Dark theme: passed visual and contrast review.
- Light theme: passed rendered review at 390px with no overflow.
- Physical iPhone theme and safe-area review remains pending.
