# MM Fitness App V2 Design Audit

## Executive Assessment

The current app is functionally strong and already behaves like a mobile product. Its main design weakness is not a lack of polish; it is insufficient hierarchy. Too many sections share the same rounded card, border, glow, and visual weight, so critical actions and supporting data compete with each other.

Performance Instrument V3 should therefore sharpen prioritization rather than add decoration.

## Current Strengths

- Mobile-first shell capped at 480px with safe-area support.
- Consistent Midnight Navy, Ice Blue, and Silver Mist identity.
- Clear primary buttons and generally adequate touch targets.
- Existing glass navigation and dark athletic mood.
- Working workout, history, performance, profile, admin, authentication, and PWA systems.
- No horizontal overflow found in the existing audit viewport.
- Existing semantic states for success, warning, danger, sync, padel, and activity.

## System-Level Weaknesses

### Hierarchy

- `command-card`, metric cards, weekly cards, and form cards are visually close in importance.
- Large radii and shadows are applied broadly, reducing the impact of truly primary surfaces.
- Supporting details often use the same card framing as mission-critical content.

### Density

- Logs exposes a very high number of controls in one scroll.
- Admin is a long continuous workspace rather than a navigable operational tool.
- Progress contains many discrete cards, requiring more scanning than synthesis.

### Visual Language

- Glow and translucent surfaces are present but do not consistently communicate state or priority.
- Inline styles make some visual rules harder to keep consistent.
- Typography is readable but lacks a dedicated metric-display scale and a stronger numeric hierarchy.

### Interaction

- Active Workout has correct controls but does not make the current set visually dominant.
- Finish Workout is not persistently available at the thumb zone.
- Historical performance is useful but reads as a compact data block rather than an actionable training reference.

## Screen Audit

### Home Dashboard

**What works:** Today's workout, readiness, nutrition, recovery, weight, weekly progress, and next action are all present.

**Weakness:** The screen reads as a stack of cards. The workout is important, but the visual flow does not fully establish it as today's mission. Readiness is separated in the header and the next action repeats the primary intent lower down.

**V3 response:** Combine workout, readiness, progress, and primary action into one Mission Stage. Use a compact instrument row for nutrition, recovery, and body. Keep weekly progress and quick actions quieter.

### Active Workout

**What works:** Timer, progress, pause/resume, safe cancel, set logging, previous/best context, PR detection, and finish flow exist.

**Weakness:** Every exercise card and set row has similar weight. The active set is inferred rather than visually declared. Inputs are usable but can feel like generic form fields. The finish action is below the exercise list.

**V3 response:** Add a compact sticky HUD, identify and emphasize the first incomplete set, enlarge the active inputs, create a concise Last/Best instrument, and add a safe-area-aware finish dock.

### Progress

**What works:** Weight, adherence, volume, 1RM, PRs, and daily/weekly/monthly line-chart data are available.

**Weakness:** Analytics are fragmented across many cards with insufficient synthesis.

**V3 response:** Later phase will create a performance overview, a dominant strength trend, ranked 1RM instruments, and a concise PR timeline.

### History / Calendar

**What works:** Date selection, workout snapshots, legacy fallback, nutrition, body logs, padel, swimming, volume, and 1RM are available.

**Weakness:** Month scanning and selected-day review need stronger separation and clearer activity semantics.

**V3 response:** Later phase will separate month navigation from a selected-day timeline and standardize activity markers.

### Nutrition

**What works:** Targets, actuals, macros, adherence, notes, and day types are available.

**Weakness:** The screen is form-led rather than decision-led.

**V3 response:** Later phase will lead with calories remaining and protein status, then expose macro and note controls.

### Logs

**What works:** Comprehensive body, recovery, activity, adherence, and note logging.

**Weakness:** Control density creates a long, repetitive interaction surface.

**V3 response:** Later phase will introduce section disclosure and clearer completion states without removing fields.

### Profile

**What works:** Avatar, biography, theme, backup, settings, and Admin entry exist.

**Weakness:** Identity, preferences, and destructive/data-management actions need clearer separation.

**V3 response:** Later phase will establish identity first, daily preferences second, and protected data actions last.

### Admin Workspace

**What works:** Users, athletes, roles, assignment, player review, plan access, and security notes exist.

**Weakness:** The current long page is difficult to scan and operate repeatedly.

**V3 response:** Later phase will create internal section navigation for Users, Athletes, Access, Plans, and Security Notes.

### Navigation

**What works:** Fixed five-item navigation, safe-area support, and glass treatment are established.

**Weakness:** The shell is premium, but active/inactive hierarchy can become more precise and less softly decorative.

**V3 response:** Later phase will refine the active capsule and motion without changing destinations.

### Splash, Loading, And Sync

**What works:** Branded splash and explicit sync states exist.

**Weakness:** Any full-screen loading during workout restoration would be unacceptable. Decorative splash effects must remain short.

**V3 response:** Preserve current restoration behavior and keep sync feedback non-blocking after local hydration.

## Measured Baseline

At the 390px rendered audit viewport:

- Home: approximately 1,195px document height, 6 cards, 15 buttons.
- Logs: approximately 1,620px document height, 5 cards, 73 buttons.
- Nutrition: approximately 873px document height, 3 cards.
- Progress: approximately 1,517px document height, 10 cards.
- Profile: approximately 1,294px document height, 5 cards.
- Admin: approximately 3,341px document height in the initial loaded state.

These measurements support a hierarchy and grouping intervention, not a feature reduction.

## What Must Remain Untouched

- Supabase, authentication, RLS, roles, permissions, and cloud sync contracts.
- Active workout draft shape and restore lifecycle.
- Performance formulas and PR logic.
- Workout history snapshots and old-log fallback.
- Player isolation and profile image ownership.
- Backup, import, export, and local fallback.
- Service-worker navigation safeguards.
- Dark and light theme availability.

## Audit Verdict

The product does not need a new identity or a decorative rebuild. It needs a disciplined instrument hierarchy. Phase A and Phase B are the right first move because Home defines daily intent and Active Workout carries the highest-frequency, highest-risk interaction.

