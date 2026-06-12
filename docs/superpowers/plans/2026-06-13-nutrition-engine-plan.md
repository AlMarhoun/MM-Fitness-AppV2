# Nutrition Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved Fueling Cockpit, multi-entry nutrition logging, saved meals, historical-date entry, and athlete-specific macro targets without breaking legacy logs.

**Architecture:** Centralize all calculations in `src/nutritionEngine.js`. Keep entries and templates in dedicated local keys included in backup/cloud snapshots, while migration 007 provides normalized Supabase tables with athlete-scoped RLS. Existing daily totals remain a compatibility fallback.

**Tech Stack:** Vanilla JavaScript modules, CSS, localStorage backup/cache, Supabase/Postgres, Node assertion tests.

---

### Task 1: Nutrition calculations
- [ ] Add failing tests for macro calories, manual override, totals, remaining, percentages, validation, and legacy fallback.
- [ ] Create `src/nutritionEngine.js` and make the tests pass.

### Task 2: Persistence and cloud mapping
- [ ] Add failing tests/contracts for new local keys and cloud tables.
- [ ] Add `mm-nutrition-entries` and `mm-saved-meals` to snapshots and backup/import.
- [ ] Extend cloud fetch/hydration and upload mappings.

### Task 3: Fueling Cockpit UI
- [ ] Add failing UI contracts for the cockpit, pie chart, remaining card, entry cards, and quick-add sheet.
- [ ] Replace the day-level intake form with the approved entry-based experience while retaining adherence and notes.
- [ ] Add historical date selection and legacy fallback messaging.

### Task 4: Entry and saved-meal interactions
- [ ] Implement add, edit, duplicate, soft-delete, save-template, and add-template-to-date flows.
- [ ] Implement automatic/manual calorie mode switching.
- [ ] Verify every mutation updates local backup state and queues cloud sync.

### Task 5: Admin athlete targets
- [ ] Add protein, carbs, and fat fields beside calories in the selected athlete plan editor.
- [ ] Keep target edits scoped to the selected athlete plan and future dates.

### Task 6: Additive migration 007
- [ ] Create normalized tables, checks, indexes, updated-at triggers, RLS, and policies.
- [ ] Document that the migration is additive, unapplied, and compatible with legacy nutrition logs.

### Task 7: Styling, cache, and responsive QA
- [ ] Add V3 Fueling Cockpit styles and 320-480px responsive rules.
- [ ] Bump application assets and service-worker cache to v26.
- [ ] Run all calculation, syntax, manifest, PWA, security, and regression tests.
- [ ] Verify the rendered flow in the Browser plugin.

### Task 8: Documentation and review
- [ ] Create the required nutrition, database, UI, admin, QA, known-issues, and changelog sections.
- [ ] Record the 11-role review verdicts and remaining migration/device limitations.

