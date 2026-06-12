# Performance Rhythm Motion Implementation Plan

**Goal:** Add the approved Performance Rhythm motion system to the Codex backup without changing business logic, data storage, authentication, or the Documents clone.

## Task 1: Lock the motion contracts with tests

- Add `tests/motion.test.mjs` for timing, stagger, progress normalization, screen-entry gating, and reduced-motion behavior.
- Extend the V3 UI contract test to require the motion module, stable hooks, reduced-motion support, and cache version 25.
- Run the tests before implementation and confirm they fail for the missing motion layer.

## Task 2: Add the centralized motion controller

- Create `src/motion.js` with motion tokens and small pure helpers.
- Track the last rendered screen so entrances run only on real screen changes.
- Apply stagger delays and progress targets after render.
- Respect `prefers-reduced-motion` in JavaScript.

## Task 3: Add stable UI hooks

- Import and invoke the motion controller from `src/app.js` after each render.
- Mark the screen root, Home mission/instruments, progress rails, Active Workout exercises, timelines, and main cards with declarative data attributes.
- Keep controls immediately interactive and preserve existing action/data contracts.

## Task 4: Implement Performance Rhythm styling

- Centralize motion durations and easing curves in `src/styles.css`.
- Add one-shot screen, mission sweep, stagger, progress, toast, modal, nav, active-set, and PR animations.
- Remove the unconditional `.app-main` animation that replayed on every render.
- Strengthen reduced-motion behavior and avoid continuous animation outside the splash.

## Task 5: Update cache and validation

- Bump `index.html`, module imports, and service worker cache to version 25.
- Add `src/motion.js` to syntax checks and service-worker assets.
- Run all syntax, PWA, security, UI, performance, activity, readiness, avatar, and motion tests.

## Task 6: Rendered browser verification

- Run the Codex copy locally and inspect Home, Active Workout, navigation, modal, Progress, History, Nutrition, Profile, and Admin.
- Check widths 320-480px for overflow and fixed-navigation conflicts.
- Verify the app remains usable with reduced motion and that no animation blocks workout input or restoration.

## Task 7: Documentation

- Update interaction, elevation, QA, known-issues, and changelog documents with the implemented motion system and test evidence.
- Do not commit, push, deploy, migrate, or modify the Documents clone.
