# MM Fitness App V2 Team Structure and Review Plan

Date: 2026-06-09

## Purpose

This file defines the virtual product team, review ownership, approval authority, and required review process for the MM Fitness App V2 refinement pass.

The team principle is:

**UI is ready does not mean product is ready.**

No implementation is accepted unless the relevant product, UX, engineering, security, PWA, and QA roles approve it.

## Product Context

MM Fitness App V2 is a premium mobile-first PWA for Mohammad. It is a private athletic command center for a 36-week hybrid plan covering strength training, fat loss, padel performance, nutrition adherence, recovery, body metrics, and long-term progress.

The approved visual direction must be preserved:

- Midnight Navy
- Ice Blue
- Silver Mist
- Dark premium athletic mobile interface
- Fixed bottom navigation
- Glass/capsule cards
- iPhone Add to Home Screen behavior

## 12-Agent Team

| # | Agent | Responsibility | Review Scope | Approval Authority |
|---|---|---|---|---|
| 1 | Product Lead | Own product direction and daily-use value. | Feature priority, user flow, avoiding unnecessary complexity. | Must approve major feature and flow changes before implementation. |
| 2 | Mobile UX Designer | Ensure every flow works naturally on iPhone PWA. | Tap areas, navigation, one-hand use, mobile readability, workout ergonomics. | Must approve all user-facing layout and flow changes. |
| 3 | UI Design Guardian | Protect approved visual identity and premium quality. | Color system, card hierarchy, typography, spacing, visual consistency. | Must reject generic, cheap, crowded, or off-brand changes. |
| 4 | Front-End Lead Engineer | Implement maintainable front-end architecture. | State management, modularity, performance, regression risk, code cleanliness. | Must approve implementation structure and reusable logic boundaries. |
| 5 | Active Workout Flow Engineer | Own workout session flow and workout safety. | Start, pause, resume, cancel, finish, set logging, timer, active draft persistence. | Must approve all Active Workout Mode changes. |
| 6 | Fitness Data Specialist | Validate fitness calculations and training relevance. | Volume, estimated 1RM, PR detection, exercise history, progress metrics. | Must approve all fitness calculations and data displays. |
| 7 | History & Calendar Specialist | Own date-based workout review. | Calendar states, old workout lookup, missed/completed days, daily summaries. | Must approve calendar/history data logic and UI. |
| 8 | Supabase/Auth Engineer | Own authentication and cloud sync readiness. | Login, no public signup, roles, session handling, profile loading, admin placeholder flow. | Must approve auth and Supabase-facing changes. |
| 9 | Security & RLS Reviewer | Protect private data and prevent unsafe access. | No exposed secrets, RLS assumptions, role escalation, frontend-only security risks. | Can block delivery for any security issue. |
| 10 | PWA / iOS Reliability Engineer | Ensure iPhone PWA lifecycle reliability. | Service worker, manifest, cache, visibility/pagehide/pageshow, lock/unlock resume. | Must approve PWA and resume behavior changes. |
| 11 | QA Lead | Run structured regression and feature testing. | Mobile widths, workout flows, auth flows, history, metrics, PWA stability. | Can block final delivery until critical bugs are fixed. |
| 12 | Red Team Reviewer | Challenge assumptions and try to break the solution. | Edge cases, incomplete claims, unsafe defaults, bad UX, bypass attempts. | Must perform final challenge review before delivery. |

## Pre-Implementation Checks By Role

Before implementation, each role must check:

- Product Lead: confirm the work improves real training use and does not create unnecessary complexity.
- Mobile UX Designer: confirm the new history, metrics, and admin controls can fit mobile without crowding.
- UI Design Guardian: confirm no redesign or off-brand visual direction is introduced.
- Front-End Lead Engineer: confirm new logic will be split into reusable modules instead of bloating `src/app.js`.
- Active Workout Flow Engineer: confirm active workout state is persisted before backgrounding and restored before cloud sync.
- Fitness Data Specialist: confirm formulas use only completed sets and do not fake missing data.
- History & Calendar Specialist: confirm calendar/history can be derived from existing logs and completed sessions.
- Supabase/Auth Engineer: confirm public signup is removed and role UX does not imply security that RLS does not enforce.
- Security & RLS Reviewer: confirm no service role key or database secret is introduced.
- PWA / iOS Reliability Engineer: confirm lock/unlock uses local-first hydration and lifecycle events.
- QA Lead: confirm tests cover the 5 required review passes.
- Red Team Reviewer: identify likely false-done claims before implementation begins.

## Role-Swapping Review Matrix

| Work Area | Primary Owner | Cross-Reviewer |
|---|---|---|
| Active workout resume | Active Workout Flow Engineer | PWA / iOS Reliability Engineer, QA Lead |
| Workout draft persistence | Front-End Lead Engineer | Active Workout Flow Engineer, Red Team Reviewer |
| Calendar/history | History & Calendar Specialist | Mobile UX Designer, Product Lead |
| 1RM/volume/PR calculations | Fitness Data Specialist | Front-End Lead Engineer, QA Lead |
| Auth/login/admin placeholder | Supabase/Auth Engineer | Security & RLS Reviewer, Red Team Reviewer |
| PWA cache/service worker | PWA / iOS Reliability Engineer | Front-End Lead Engineer, QA Lead |
| UI polish | Mobile UX Designer | UI Design Guardian, Product Lead |
| Final release readiness | QA Lead | Red Team Reviewer, Product Lead |

## Implementation Boundaries

The refinement pass must preserve:

- Current dark premium visual identity.
- Existing Home, Plan, Logs, Nutrition, Progress navigation.
- Existing editable workout behavior.
- Existing Active Workout controls.
- Existing local backup/export/import.
- Supabase public URL/publishable-key-only frontend rule.

The refinement pass must not:

- Redesign the whole app.
- Add public signup.
- Expose service role keys, database passwords, or private tokens.
- Claim admin/security completion from frontend hiding alone.
- Break active workout mode.
- Let phone lock/unlock reset workout progress.

## Proposed Code Architecture

New reusable modules should be added instead of expanding `src/app.js` unnecessarily:

- `src/performance.js` for estimated 1RM, volume, PR, and exercise history calculations.
- `src/sessionPersistence.js` for active workout draft, active screen, timer state, and scroll position persistence.
- `src/history.js` for date-based daily history and calendar status lookup.
- `src/roles.js` for frontend role helpers and admin-panel permission checks.

`src/app.js` may be updated to render and wire these features, but core calculations and persistence helpers should live in dedicated modules.

## Required 5 Review Passes

### Pass 1: Active Workout Resume Review

Lead reviewers:

- Active Workout Flow Engineer
- PWA / iOS Reliability Engineer
- QA Lead

Checks:

- Start workout.
- Log sets.
- Scroll midway.
- Trigger background/foreground lifecycle where possible.
- Confirm same screen, exercise, set data, timer state, and no full loading reset.

### Pass 2: Workout History / Calendar Review

Lead reviewers:

- History & Calendar Specialist
- Mobile UX Designer
- Product Lead

Checks:

- Select old date.
- Confirm completed workout details.
- Confirm daily log, nutrition, padel, notes, and missed-day states.

### Pass 3: Performance Metrics Review

Lead reviewers:

- Fitness Data Specialist
- Front-End Lead Engineer
- QA Lead

Checks:

- Set volume.
- Exercise volume.
- Workout volume.
- Estimated 1RM.
- PR detection.
- Progress dashboard update.

### Pass 4: Auth/Admin Review

Lead reviewers:

- Supabase/Auth Engineer
- Security & RLS Reviewer
- Red Team Reviewer

Checks:

- No public create account button.
- Owner/admin-only Admin Panel access in UI.
- No role self-assignment from public login.
- No secrets in frontend.
- RLS/security limitations documented.

### Pass 5: Mobile/PWA Review

Lead reviewers:

- Mobile UX Designer
- PWA / iOS Reliability Engineer
- QA Lead

Widths:

- 320px
- 360px
- 375px
- 390px
- 414px
- 430px
- 480px

Checks:

- No horizontal overflow.
- No broken cards.
- No bottom navigation overlap.
- No modal overflow.
- No tiny text.
- No loading loop.
- No stale service worker behavior.

## Final Approval Checklist

Each agent must provide:

- Approved / Not Approved
- Reason
- Issues found
- Required fix if not approved
- Remaining concern if approved with caveat

Final delivery is blocked if any role says Not Approved.

## Required Documentation Outputs

The refinement pass must create or update:

- `TEAM_STRUCTURE_AND_REVIEW_PLAN.md`
- `REFINEMENT_SUMMARY.md`
- `ACTIVE_WORKOUT_RESUME_FIX.md`
- `WORKOUT_HISTORY_CALENDAR.md`
- `PERFORMANCE_METRICS_1RM_VOLUME.md`
- `AUTH_INVITATION_ADMIN_PANEL.md`
- `SECURITY_ROLE_REVIEW.md`
- `PWA_IOS_RESUME_REVIEW.md`
- `QA_RESULTS.md`
- `KNOWN_ISSUES.md`
- `CHANGELOG.md`

## Initial Team Verdict Before Implementation

| Agent | Verdict | Reason |
|---|---|---|
| Product Lead | Approved to plan | Issues match real daily-use friction. |
| Mobile UX Designer | Approved to plan | Scope requires careful mobile layout, not redesign. |
| UI Design Guardian | Approved to plan | Visual direction must remain unchanged. |
| Front-End Lead Engineer | Approved to plan | New modules are required to prevent `app.js` bloat. |
| Active Workout Flow Engineer | Approved to plan | Resume reliability is the highest-priority defect. |
| Fitness Data Specialist | Approved to plan | Metrics must be centralized and transparent. |
| History & Calendar Specialist | Approved to plan | Calendar/history can be added inside Logs or Progress without bottom-nav changes. |
| Supabase/Auth Engineer | Approved to plan | Public signup removal is required; true invites need backend/Edge Function later. |
| Security & RLS Reviewer | Approved to plan with caveat | Frontend role helpers are not security; RLS and backend remain required for true enforcement. |
| PWA / iOS Reliability Engineer | Approved to plan with caveat | iOS lifecycle cannot be perfectly simulated in local desktop tests. |
| QA Lead | Approved to plan | Required review passes are defined. |
| Red Team Reviewer | Approved to plan with caveat | Must not claim full admin security until live RLS/backend invite flow exists. |
