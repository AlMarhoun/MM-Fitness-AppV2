# MM Fitness Nutrition Engine Design

Date: June 13, 2026
Status: Approved from visual preview

## Product Direction

Nutrition becomes a Fueling Cockpit while preserving the existing Performance Instrument V3 language. The screen prioritizes daily calories and macros, remaining targets, macro calorie distribution, and fast entry logging. It does not replace existing day-level logs; it derives totals from entries when entries exist and falls back to legacy totals otherwise.

## Daily Entries

Each date can contain meal, snack, and beverage entries. Entries store a stable client ID, type, title, optional time and notes, protein, carbohydrates, fat, calorie mode, optional manual calories, timestamps, and a deletion tombstone for reliable cloud synchronization.

Calories default to `protein × 4 + carbs × 4 + fat × 9`. Entering a manual calorie value changes that entry to manual mode. A visible “Use Macro Calculation” control restores automatic mode.

## Saved Meals

Each athlete owns an isolated saved-meal library. A saved meal is a reusable template, not a historical entry. Adding it to a date creates a new independent entry. Editing or deleting the daily copy never changes the template or another date. The quick-add sheet includes Saved, Recent, and New Entry paths.

## History and Targets

Nutrition supports selecting today or a historical date. New daily logs snapshot the target calories, protein, carbs, and fat used for that date. Admin changes update the selected athlete’s plan and therefore future targets only. Historical logs with captured targets remain unchanged. Legacy logs without target snapshots fall back to the applicable plan day.

## Cloud Model

Migration 007 adds `nutrition_entries` and `nutrition_saved_meals`, indexes, constraints, timestamps, and RLS policies. Both tables are athlete-scoped and user-attributed. Deletion tombstones avoid deleted items reappearing after multi-device synchronization. The migration is additive and will not be applied automatically.

## Non-Goals

- No food database, barcode scanning, AI meal recognition, or calorie recommendations.
- No public sharing.
- No changes to authentication, roles, workout persistence, performance formulas, or storage key names already in use.
- No migration application, commit, push, or deployment.

