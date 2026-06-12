# Usefulness and Profile Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver an honest readiness experience, a lightweight draggable profile crop editor, and a conservative usefulness/design/code cleanup without changing core data or security behavior.

**Architecture:** Add focused pure modules for readiness and avatar crop calculations, then connect them to the existing string-template UI. Preserve the existing Supabase upload and auth boundary, adding only additive crop metadata columns and a square client-side export before upload.

**Tech Stack:** Vanilla ES modules, DOM Pointer Events, Canvas, Supabase Storage/Postgres, CSS, Node assertion tests.

---

### Task 1: Readiness presentation model

**Files:** Create `src/readiness.js`; create `tests/readiness.test.mjs`; modify `src/app.js`.

- [ ] Write tests proving missing inputs never produce a score and complete inputs calculate the documented value.
- [ ] Run the test and confirm it fails because the module is missing.
- [ ] Implement the pure readiness model and status labels.
- [ ] Replace the default-80 Home UI with score-or-CTA rendering.
- [ ] Route the control to Logs with Recovery expanded.
- [ ] Run readiness and UI contract tests.

### Task 2: Avatar crop engine and editor

**Files:** Create `src/avatarEditor.js`; create `tests/avatar-editor.test.mjs`; modify `src/app.js`, `src/profile.js`, `src/styles.css`.

- [ ] Write tests for crop clamping and source-to-square draw geometry.
- [ ] Run the test and confirm it fails because the module is missing.
- [ ] Implement crop state helpers and browser square-image export.
- [ ] Add modal preview, pointer dragging, zoom, reset, cancel, and save.
- [ ] Upload only the rendered crop through the existing secure upload function.
- [ ] Render profile/header/list previews without stretching.

### Task 3: Persist crop metadata safely

**Files:** Create `supabase/migrations/006_profile_avatar_crop.sql`; modify `src/profile.js`, `src/auth.js`, `src/adminData.js` only if normalization requires it.

- [ ] Add nullable/defaulted position and zoom columns with constraints.
- [ ] Include crop metadata in the existing owner-only profile update.
- [ ] Preserve compatibility for profiles created before the migration.
- [ ] Extend security validation for the additive migration.

### Task 4: Usefulness and design polish

**Files:** Modify `src/app.js`, `src/styles.css`.

- [ ] Remove the duplicate Recovery Home instrument and promote useful Activity status.
- [ ] Reduce visual prominence of unavailable Admin actions while preserving honest explanations.
- [ ] Normalize button labels, empty states, spacing, and modal hierarchy.
- [ ] Verify dark/light and reduced-motion states.

### Task 5: Conservative code cleanup

**Files:** Review all requested source, tests, scripts, service worker, and documentation.

- [ ] Use reference searches to identify functions/classes with definition-only usage.
- [ ] Delete only confirmed dead code and styles.
- [ ] Keep migration, backup, RLS, Edge Function placeholders, and compatibility paths intentionally.
- [ ] Record every deletion and every intentionally retained risk in `CODE_POLISH_REPORT.md`.

### Task 6: Cache, reports, and release verification

**Files:** Modify `index.html`, `sw.js`, `package.json`; create/update required reports.

- [ ] Bump all changed frontend assets to cache v24.
- [ ] Run every package test and validation script.
- [ ] Run secret/public-signup scans.
- [ ] Render and test 320-480px widths, themes, crop interactions, readiness, workout restore, History, Nutrition, Admin, and PWA behavior.
- [ ] Create `USEFULNESS_AUDIT_REPORT.md`, `DESIGN_POLISH_REPORT.md`, and `CODE_POLISH_REPORT.md`.
- [ ] Record the eight-role review and remaining concerns.
