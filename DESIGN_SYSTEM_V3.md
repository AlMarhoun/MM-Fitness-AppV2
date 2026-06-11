# Performance Instrument V3 Design System

## Principles

1. **Mission before metrics:** the current objective is always visually dominant.
2. **Data before decoration:** visual effects clarify state, not fill empty space.
3. **One-hand operation:** primary workout controls stay within comfortable reach.
4. **Quiet confidence:** contrast and precision create premium quality; excessive glow does not.
5. **Stable geometry:** controls and cards do not resize when state changes.
6. **Accessible motion:** animation is short, functional, and removable.

## Color Tokens

### Dark Theme

| Token | Value | Use |
|---|---|---|
| `--v3-canvas` | `#030914` | App foundation. |
| `--v3-canvas-raised` | `#071321` | Subtle page depth. |
| `--v3-surface-1` | `#091827` | Standard instrument surface. |
| `--v3-surface-2` | `#0d2033` | Raised/interactive instrument. |
| `--v3-surface-3` | `#122b43` | Selected or active surface. |
| `--v3-ice` | `#82dcff` | Primary action and active data. |
| `--v3-ice-strong` | `#27b8f4` | Primary action depth. |
| `--v3-cyan` | `#55e4cf` | Readiness, recovery, padel, positive secondary accent. |
| `--v3-silver` | `#aab9c9` | Secondary text. |
| `--v3-text` | `#f7fbff` | Primary text. |
| `--v3-text-subtle` | `#718399` | Tertiary labels. |
| `--v3-line` | `rgba(210, 228, 244, 0.11)` | Standard border/divider. |
| `--v3-line-active` | `rgba(130, 220, 255, 0.32)` | Active border. |
| `--v3-success` | `#4ade9a` | Completion and saved state. |
| `--v3-warning` | `#f4bd66` | Nutrition/attention. |
| `--v3-danger` | `#ff7272` | Destructive action. |

### Light Theme

| Token | Value | Use |
|---|---|---|
| `--v3-canvas` | `#f3f7fb` | App foundation. |
| `--v3-canvas-raised` | `#e8f0f7` | Subtle page depth. |
| `--v3-surface-1` | `#ffffff` | Standard instrument surface. |
| `--v3-surface-2` | `#f8fbfd` | Raised surface. |
| `--v3-surface-3` | `#e8f5fc` | Selected surface. |
| `--v3-ice` | `#087fc7` | Primary action and active data. |
| `--v3-ice-strong` | `#0565a5` | Primary action depth. |
| `--v3-cyan` | `#128f7e` | Positive secondary accent. |
| `--v3-silver` | `#536579` | Secondary text. |
| `--v3-text` | `#061523` | Primary text. |
| `--v3-text-subtle` | `#8493a3` | Tertiary labels. |
| `--v3-line` | `rgba(6, 21, 35, 0.10)` | Standard border/divider. |
| `--v3-line-active` | `rgba(8, 127, 199, 0.28)` | Active border. |

## Surface Hierarchy

1. **Canvas:** no framing; supports the whole experience.
2. **Instrument Surface:** standard opaque surface for repeatable data and forms.
3. **Raised Instrument:** interactive or selected state with slightly brighter surface and border.
4. **Mission Stage:** one dominant surface per screen, using restrained directional light and no decorative blobs.
5. **Athletic Glass:** reserved for floating navigation, sticky workout HUD, finish dock, and transient overlays.

Never place a decorative card inside another decorative card. Nested content uses dividers, rows, or unframed zones.

## Card Hierarchy

| Component | Radius | Border | Shadow | Notes |
|---|---:|---|---|---|
| Mission Stage | 24px | Active ice line | Deep directional shadow | One per primary screen. |
| Instrument Card | 16px | Standard line | Low shadow | Default data surface. |
| Compact Metric | 14px | Standard line | None | Supports scanning. |
| Exercise Card | 18px | Standard line | Low shadow | Active exercise receives active line. |
| Modal Sheet | 22px top radius | Strong line | Overlay shadow | Bottom-sheet behavior. |
| Glass Dock | 22px | Standard line | Floating shadow | Navigation/finish only. |

## Typography Scale

Font stack remains system-first for speed and native iPhone rendering.

| Token | Size / line | Weight | Use |
|---|---|---:|---|
| Display Mission | 30–34px / 1.04 | 850–900 | Workout title and major screen outcome. |
| Display Metric | 28–32px / 1.0 | 850–900 | Timer, readiness, weight, volume. |
| Screen Title | 25–29px / 1.1 | 850 | Screen heading. |
| Card Title | 16–18px / 1.2 | 800–850 | Instrument heading. |
| Body | 13–14px / 1.45 | 500–650 | Explanatory text. |
| Label | 10–11px / 1.2 | 800–850 | Uppercase instrument labels. |
| Micro | 9–10px / 1.2 | 750–850 | Status and supporting metadata. |

Metric numbers use tabular numerals. Letter spacing remains `0` except uppercase labels, where `0.08em` maximum is allowed.

## Spacing

Base unit: 4px.

- `--space-1`: 4px
- `--space-2`: 8px
- `--space-3`: 12px
- `--space-4`: 16px
- `--space-5`: 20px
- `--space-6`: 24px
- `--space-8`: 32px
- `--space-10`: 40px

Screen horizontal padding: 16px, reduced to 12px at 360px and below. Section rhythm: 16–20px. Compact metric gaps: 8px.

## Radius Tokens

- `--radius-control`: 12px
- `--radius-metric`: 14px
- `--radius-card`: 16px
- `--radius-exercise`: 18px
- `--radius-stage`: 24px
- `--radius-dock`: 22px
- `--radius-pill`: 999px

## Shadows

- `--shadow-instrument`: `0 12px 34px rgba(0,0,0,.18)`
- `--shadow-stage`: `0 24px 64px rgba(0,0,0,.32)`
- `--shadow-float`: `0 18px 54px rgba(0,0,0,.38)`
- Light theme uses lower-opacity neutral blue-black shadows.

Shadows communicate elevation only. Flat supporting metrics do not receive shadows.

## Athletic Glass Rules

Allowed:

- Fixed bottom navigation.
- Sticky Active Workout HUD.
- Sticky Finish Workout dock.
- Modal sheets and transient status overlays.

Not allowed:

- Every card.
- Dense form surfaces.
- Chart plot areas.
- Stacked nested cards.

Glass must retain a visible opaque base, a 1px border, and readable contrast without relying on blur support.

## Glow Rules

Allowed targets:

- Primary Start/Finish action.
- Readiness arc when status is positive.
- Current active set.
- New PR badge or momentary celebration.

Maximum one persistent glow region in a viewport. Glow opacity stays below 0.24. Danger controls never glow.

## Buttons

### Primary

- 50–54px height.
- Ice Blue gradient with Midnight text.
- Used once per decision area.
- Strong pressed state: translateY(1px), shadow reduction.

### Secondary

- 44–48px height.
- Raised instrument surface, standard border.
- Used for Plan, Pause, Resume alternatives, and supporting actions.

### Destructive

- 44–48px height.
- Transparent danger tint and danger border.
- Requires confirmation for destructive workout actions.

### Icon Button

- Minimum 44×44px tap area.
- Familiar icon and accessible label.

## Chips And Badges

- Chips communicate stable metadata: duration, exercise count, category, nutrition day.
- Badges communicate state: Saved, Offline, PR, Completed, Role.
- Maximum three visible metadata chips before wrapping to a second line.
- PR badge uses cyan outline and brief entrance motion; it must not pulse continuously.

## Inputs

- Standard input height: 46px.
- Active Workout numeric input height: 52–56px.
- Numeric values centered with tabular numerals.
- Focus uses active ice border plus a subtle 2px outer ring.
- Labels remain visible; placeholder text does not replace labels in active logging.

## Chart Styles

- Plot surface is opaque and low contrast.
- Primary line: Ice Blue, 3px, round caps.
- Comparison/secondary line: Cyan, 2px.
- Grid lines: Silver Mist at 8–10% opacity.
- Area fill: Ice Blue at 8–12% opacity, fading to transparent.
- Labels: minimum 10px, limited count on mobile.
- Empty charts use an explanatory state rather than fabricated points.

## Navigation States

- Shell: Athletic Glass with opaque fallback.
- Inactive: Silver Mist icon and micro label.
- Active: raised capsule, Ice Blue icon/label, active border, no oversized glow.
- Tap area: minimum 52px high per item.
- Transition: color, background, and transform only.

## Motion

| Motion | Duration | Easing |
|---|---:|---|
| Press response | 90ms | ease-out |
| Chip/badge state | 140ms | ease-out |
| Card/section entrance | 180ms | cubic-bezier(.2,.8,.2,1) |
| Navigation selection | 200ms | cubic-bezier(.2,.8,.2,1) |
| Modal sheet | 240ms | cubic-bezier(.2,.8,.2,1) |
| PR feedback | 320ms max | cubic-bezier(.16,1,.3,1) |

No continuous decorative motion in the main app. Timer updates must not cause layout shift.

## Reduced Motion

Under `@media (prefers-reduced-motion: reduce)`:

- Disable splash energy drift and glow pulsing.
- Remove entrance transforms and animated progress interpolation.
- Set transitions and animations to 1ms where state change still requires completion.
- Preserve visibility, focus, and state changes without movement.

## Phase A/B Component Contracts

### Mission Stage

- Contains Today's Mission, workout title, goal, readiness, duration, exercise count, activity context, and one Start/View primary action.
- Nutrition, recovery, and body metrics sit outside the Mission Stage as compact instruments.

### Workout HUD

- Sticky, glass-backed, and compact.
- Contains workout identity, timer, set progress, Pause/Resume, and Cancel.
- Does not block the exercise title at common iPhone viewport heights.

### Active Set

- The first incomplete set receives the active treatment.
- Input labels are explicit and inputs are at least 52px tall.
- Completed sets become quieter but remain readable/editable.

### Finish Dock

- Fixed above the iPhone safe area.
- Contains workout completion count and Finish Workout.
- The active screen reserves enough bottom space that no set is covered.

