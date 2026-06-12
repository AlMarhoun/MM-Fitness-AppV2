# MM Fitness App Performance Rhythm Motion Design

Date: June 12, 2026
Status: Approved visual direction, pending implementation approval

## Direction

Use **Performance Rhythm**, the selected middle option. Motion should make the interface feel like a responsive athletic instrument: precise, quick, directional, and calm. It must never feel like a promotional video or delay workout logging.

The system is inspired by Remotion's spring and interpolation principles, but the app remains a lightweight vanilla JavaScript PWA. No Remotion rendering runtime or video dependency will be added to the production bundle. Equivalent timing curves, staged sequences, and bounded transforms will be implemented with CSS and the Web Animations API.

## Motion Principles

- Motion communicates hierarchy, state change, progress, or success.
- Most interactions complete in 160-240ms.
- Screen entrances use opacity plus no more than 8px vertical movement.
- Spring-like movement uses one restrained overshoot, never repeated bouncing.
- Continuous animation is limited to the short splash sequence.
- Active Workout inputs, timer, pause, resume, cancel, and finish remain immediately interactive.
- No animation is allowed to block active workout restoration or cloud/local saving.
- `prefers-reduced-motion: reduce` removes all non-essential movement.

## Motion Tokens

- `--motion-instant`: 90ms
- `--motion-fast`: 160ms
- `--motion-standard`: 200ms
- `--motion-emphasis`: 240ms
- `--ease-performance`: cubic-bezier(.2,.8,.2,1)
- `--ease-settle`: cubic-bezier(.16,1,.3,1)
- Standard translation: 4-8px
- Standard scale range: .97-1.025
- Stagger: 45-70ms between related instruments

## Home Dashboard

- Mission Stage enters first with an 8px rise and controlled opacity reveal.
- A single Ice Blue light sweep crosses the mission surface once per screen entry.
- Fuel, Activity, and Body instruments reveal in a short stagger.
- Weekly progress bars animate from their previous visual state to the current value.
- The primary action receives one soft focus pulse after the mission settles, not a looping glow.
- Readiness score changes use a short numeric settle; missing-data state remains static and direct.

## Active Workout

- Workout header appears immediately; no entrance delay on controls.
- The current exercise gets a short focus transition when the cursor changes.
- Completing a set uses a 160ms check confirmation and progress fill.
- Pause changes the visual state with a restrained dim/frost transition while preserving visible inputs.
- Resume restores emphasis without replaying the full screen entrance.
- Finish dock remains fixed and does not move during logging.
- New PR uses one 520ms premium signal: small scale rise, cyan edge light, then settle. No confetti.

## Navigation and Screens

- Screen changes use a 180-200ms opacity/rise transition.
- The active bottom-nav capsule uses a spring-like settle from .96 to 1.
- Navigation remains clickable throughout the transition.
- Back navigation uses the same transition without directional slide complexity.

## Modals, Sheets, and Toasts

- Backdrop fades in over 160ms.
- Sheets rise 14px and settle in 210ms.
- Destructive confirmations do not shake or flash.
- Toasts rise from the safe area, remain readable, then fade without blocking controls.
- Avatar editor opens as a focused sheet; drag and zoom previews update directly with no easing lag.

## Progress, History, Nutrition, and Logs

- Charts draw once when entering the section or changing range.
- Metric deltas fade and settle; values are not continuously counted every render.
- Calendar selection uses a quick border/background transition.
- Selected-day timeline items reveal in a compact stagger.
- Macro and adherence bars animate only when values change.
- Log accordions use height/opacity transitions while keeping inputs stable.

## Profile and Admin

- Avatar changes crossfade after upload success.
- Player cards use subtle press feedback, not hover spectacle.
- Admin section changes use the standard screen transition.
- Disabled protected actions remain visually quiet and do not animate.

## Splash

- Keep the existing selected logo and layout.
- Shorten unnecessary idle time if possible.
- Use one logo entrance, one restrained energy sweep, and one progress-line pass.
- Exit cleanly into Home.
- Skip the splash during active-workout restoration.

## Architecture

- Add `src/motion.js` for screen-enter classes, stagger assignment, progress animation, and motion preference checks.
- Extend `src/styles.css` with centralized motion tokens and component keyframes.
- Add stable motion hooks in `src/app.js`; do not alter business logic or storage.
- Avoid timers that survive rerenders. Prefer one-shot animation triggers and CSS animation events.
- Bump application and service-worker assets to cache version 25.

## Accessibility and Performance

- Respect `prefers-reduced-motion` at CSS and JavaScript levels.
- Animate only `transform`, `opacity`, and occasional progress width/stroke values.
- Avoid layout-heavy top/left animation and large blur changes.
- Do not animate hidden screens or background workout state.
- Do not add remote assets, video files, canvas loops, or a Remotion Player.

## Verification

- Test dark and light themes.
- Test reduced-motion mode.
- Test Home, Active Workout, set completion, pause/resume, PR state, modal, toast, navigation, Progress range change, Calendar selection, Profile, and Admin.
- Test widths 320, 360, 375, 390, 414, 430, and 480px.
- Verify no horizontal overflow, input movement, bottom-nav overlap, animation replay loops, or workout restore delay.
- Run all existing syntax, security, PWA, UI, performance, activity, readiness, and avatar tests.

## Explicit Non-Goals

- No app redesign.
- No video background or generated animation asset.
- No business-logic, Supabase, Auth, RLS, permissions, or storage-key changes.
- No changes to the Documents clone.
- No commit, push, migration, or deployment.
