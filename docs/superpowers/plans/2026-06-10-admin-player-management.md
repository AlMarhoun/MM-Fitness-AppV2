# Admin Player Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a focused owner/admin player management layer for MM Fitness App V2: create users with separate athlete profiles, view player activity, and edit each player plan independently.

**Architecture:** Keep the approved UI intact and enhance only Admin Panel. Use Supabase/RLS as the security boundary. Add focused DB/admin helpers so `app.js` does not scatter Supabase queries. Use Edge Function `create-user` for safe auth user creation and direct RLS-protected Supabase writes for plan edits.

**Tech Stack:** Static mobile PWA, vanilla ES modules, Supabase Auth/Postgres/RLS, Supabase Edge Functions.

---

### Task 1: Admin Data Helpers

**Files:**
- Create: `src/adminData.js`
- Modify: `src/sync.js`
- Modify: `package.json`

- [ ] Add `src/adminData.js` with functions to list users, list athletes, fetch a player dataset, and compute activity summary.
- [ ] Export `savePlanToCloud(athleteId, userId, plan)` from `src/sync.js` using existing plan upsert logic.
- [ ] Add `src/adminData.js` to `npm run check`.

### Task 2: Edge Function Athlete Profile Mode

**Files:**
- Modify: `supabase/functions/create-user/index.ts`

- [ ] Support `athleteMode: "new" | "current" | "none"`.
- [ ] When `new`, create a separate athlete profile and assign the created user to it.
- [ ] Keep service role server-side only.

### Task 3: Admin Panel UI

**Files:**
- Modify: `src/app.js`
- Modify: `src/styles.css`

- [ ] Add admin state: users, athletes, selected athlete, selected player snapshot, plan draft, save status.
- [ ] Add Player Command Center section inside Admin Panel.
- [ ] Show users and athletes with role/access labels.
- [ ] Show selected player activity: last workout, weekly workouts, total volume, nutrition, padel, daily log.
- [ ] Add plan editor for selected athlete using existing workout editor patterns, scoped to selected athlete draft only.
- [ ] Save selected athlete plan to Supabase and local admin snapshot without changing Mohammad’s local plan unless selected athlete is current athlete.

### Task 4: Cache, Docs, Verification

**Files:**
- Modify: `index.html`
- Modify: `sw.js`
- Modify: `ADMIN_PANEL_IMPLEMENTATION.md`
- Modify: `CHANGELOG.md`

- [ ] Bump asset/cache version to v14.
- [ ] Document player activity and separate plan management.
- [ ] Run `npm run check` and `npm run validate:manifest`.
- [ ] Run secret scan and local server sanity check.
