# Performance Instrument V3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Elevate MM Fitness App V2 into a quiet, premium athlete operating system while preserving every existing workflow, data contract, security boundary, and PWA behavior.

**Architecture:** The upgrade is a presentation-layer evolution. Existing state, Supabase, RLS, authentication, storage, workout persistence, history, and performance modules remain the source of truth. Screen render functions keep their existing actions and data attributes while receiving clearer semantic structure and V3 component classes.

**Tech Stack:** Static mobile-first PWA, JavaScript modules, CSS design tokens, Supabase, local active-workout persistence, service worker.

---

## Design Direction

**Performance Instrument V3** combines precise performance instrumentation with restrained Athletic Glass accents.

Core feeling:

- Premium and athletic without aggression.
- Quiet confidence rather than decorative spectacle.
- Performance cockpit with immediate data clarity.
- A private athlete operating system, not a generic gym tracker.

Hierarchy on every screen:

1. Primary mission.
2. Secondary metrics.
3. Supporting detail.
4. Clear actions.

## Screen Problems And Proposed Changes

| Screen | Current problem | Proposed change | Will not change |
|---|---|---|---|
| Home | Cards have similar visual weight; today's mission competes with supporting metrics. | Create a Mission Stage with workout, readiness, next action, and compact mission facts. Consolidate nutrition, recovery, and body into a quieter instrument row. Keep weekly progress and quick actions subordinate. | Home data, readiness calculation, navigation actions, weekly statistics, activity detection. |
| Active Workout | Header and exercise cards are functional but the active set is not visually dominant. Finish action moves with content. | Create a compact Workout HUD, clearly highlight the first incomplete set, enlarge logging controls, compress historical context, and add a fixed finish dock above the safe area. | Timer logic, pause/resume/cancel/finish confirmations, set keys, input handlers, draft persistence, performance calculations. |
| Progress | Large number of equal cards weakens analytics hierarchy. | Later phase: organize into overview, strength trend, personal records, and supporting metrics. | Calculation and chart data. |
| History / Calendar | Useful data exists but calendar and selected-day detail compete for attention. | Later phase: stronger month header, activity legend, selected-day timeline, compact performance summaries. | History lookup and snapshot fallback. |
| Nutrition | Inputs and metrics read as form blocks instead of a daily nutrition instrument. | Later phase: target-versus-actual hierarchy, compact macro instruments, clear adherence state. | Nutrition persistence and day types. |
| Logs | Too many visible controls create interaction density. | Later phase: progressive sections for body, recovery, activities, and notes. | Existing fields and saved data. |
| Profile | Identity, biography, backup, and administration have similar emphasis. | Later phase: identity stage with clear personal settings and protected account actions. | Avatar storage, profile data, backup/export/import. |
| Admin | Long single-page structure makes users, athletes, access, plans, and security difficult to scan. | Later phase: section navigation for Users, Athletes, Access, Plans, and Security Notes. | Role enforcement, permissions, RLS, safe placeholders. |
| Navigation | Current glass capsule is usable but active state can feel more instrument-like. | Later phase: quieter shell and clearer active capsule with short motion. | Five core destinations, safe-area behavior, tap targets. |
| Splash / Sync | Splash is premium but must never obstruct workout restoration. Sync language is visually secondary. | Later phase: preserve short splash, use non-blocking sync feedback after hydration. | Service-worker and workout-restore behavior. |

## Logic Preservation Contract

- Keep all existing `data-action`, `data-nav`, `data-quick`, `data-set`, `data-field`, and set-completion attributes intact.
- Do not modify Supabase clients, queries, RLS policies, role definitions, or permission evaluation during the design phases.
- Do not rename localStorage keys or active-workout draft properties.
- Do not change the Epley formula, volume rules, PR detection, workout snapshots, or history fallback.
- Do not alter authentication gating, public-signup restrictions, or Admin access checks.
- Keep dark and light themes operational through semantic tokens rather than hard-coded screen colors.
- Preserve 320px minimum width, iPhone safe-area spacing, and non-blocking active-workout restoration.

## Risks And Controls

| Risk | Control |
|---|---|
| Visual refactor disconnects event handlers. | Retain every existing data attribute and run interaction tests after each screen phase. |
| Fixed workout dock covers the final set. | Add active-screen bottom clearance tied to dock height and safe-area inset. |
| Glass reduces contrast or performance. | Use blur only on HUD/navigation/dock surfaces; use opaque instrument surfaces elsewhere. |
| Glow becomes noisy. | Limit glow to the primary action, readiness state, active set, and PR state. |
| 320px layout breaks. | Use minmax grids, stable controls, and browser checks at all required widths. |
| Service-worker serves mixed UI versions. | Bump the asset version and cache name only after Phase A/B implementation is complete. |
| Light theme becomes an afterthought. | Define light counterparts for every semantic surface token. |
| UI changes affect active workout persistence. | Do not change session object shape; run draft-save and restore regression checks. |

## Implementation Sequence

### Documentation Gate

- [x] Create the design elevation plan.
- [x] Create the current-state design audit.
- [x] Define the V3 design system.
- [x] Review documents for conflicting rules or unspecified tokens.

### Phase A: Home Dashboard Elevation

- [x] Add a failing UI contract test for the Mission Stage and instrument hierarchy.
- [x] Refactor Home markup while preserving all data and actions.
- [x] Add V3 Home styles and light-theme behavior.
- [x] Verify Home at 320, 360, 375, 390, 414, 430, and 480px.
- [x] Confirm workout start, Plan, quick actions, Profile, and Progress navigation still work.

### Phase B: Active Workout Elevation

- [x] Add failing UI contract tests for Workout HUD, active-set emphasis, performance context, and finish dock.
- [x] Derive the current active set from the first incomplete set without changing saved state.
- [x] Refactor Active Workout markup while preserving inputs and workout controls.
- [x] Add stable bottom clearance and safe-area-aware finish dock.
- [x] Verify logging, pause, resume, cancel confirmation, finish confirmation, and draft persistence.
- [x] Verify Active Workout at every required mobile width.

### Phase C: Progress + Metrics Elevation

- [x] Reorganize analytics hierarchy without changing performance calculations.
- [x] Refine line-chart labels, legends, empty states, and period controls.
- [x] Add a tested presentation model for insights, consistency, body, recovery, PR values, and volume comparisons.
- [x] Verify no-data, partial-data, snapshot, legacy fallback, dark, light, and 320–480px states.

### Phase D: History / Calendar Elevation

- [ ] Improve month navigation, activity markers, and selected-day timeline.
- [ ] Preserve snapshot-first history and legacy fallback.

### Phase E: Nutrition + Logs Elevation

- [ ] Convert dense forms into progressive, clearly grouped instruments.
- [ ] Preserve every field and saved data contract.

### Phase F: Profile + Admin Workspace Elevation

- [ ] Improve identity and athlete cards.
- [ ] Split Admin into Users, Athletes, Access, Plans, and Security Notes.

### Phase G: Navigation + Motion Polish

- [ ] Refine active navigation state and press feedback.
- [ ] Apply the motion timing system and reduced-motion fallbacks.

### Phase H: Responsive + Regression QA

- [ ] Run full responsive visual review from 320px through 480px.
- [ ] Run functional, security, data, PWA, and active-workout regression checks.

## Phase A/B Acceptance Criteria

- Home communicates today's workout, next action, readiness, nutrition, weekly progress, latest weight, and activity state in the first practical scan.
- Active Workout makes the current set unmistakable and loggable one-handed.
- No horizontal overflow, clipped controls, covered final content, or unreadable labels from 320px to 480px.
- All pre-existing actions and calculations remain operational.
- Glass and glow are limited to attention-bearing surfaces.
- No changes are made to Supabase, RLS, roles, permissions, or data schemas.
