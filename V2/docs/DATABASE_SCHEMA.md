# Database Schema

## Overview

The schema is designed for a secure multi-user MM Fitness App with one or more athletes. Every private fitness record is connected to an `athlete_id`; each athlete is connected to a Supabase Auth user through `athletes.user_id`.

## Tables

- `profiles` - Auth user profile, email, display name, role, active status.
- `athletes` - Per-user athlete identity and optional admin assignment.
- `workout_plans` - Top-level training plans.
- `plan_days` - Seven-day plan structure and nutrition/padel targets.
- `plan_exercises` - Exercises inside each plan day.
- `exercise_library` - Shared exercise definitions.
- `workout_sessions` - Completed/active workout sessions.
- `workout_sets` - Set-by-set logs with generated volume and estimated 1RM.
- `exercise_records` - Personal records by exercise.
- `daily_logs` - Body/recovery metrics.
- `nutrition_logs` - Target and actual nutrition logs.
- `padel_sessions` - Padel schedule/completion/recovery impact.
- `app_settings` - Per-athlete app settings.
- `backup_exports` - Backup metadata.
- `audit_logs` - Optional admin/security audit trail.

## Generated Metrics

`workout_sets` includes generated columns:

- `set_volume = weight * reps`
- `estimated_1rm = weight * (1 + reps / 30)`

These support future strength tracking, PR detection, and progress dashboards.

## Ownership Model

Private records use:

- `athlete_id` for athlete-owned data.
- `user_id` for direct user-owned data.

RLS helper functions resolve whether the signed-in user can access the athlete.

## Relationship Integrity Guard

The schema includes `assert_athlete_relationships()` triggers to prevent cross-athlete linking between child and parent rows, including:

- `plan_days` to `workout_plans`
- `plan_exercises` to `plan_days`
- `workout_sessions` to plans/days
- `workout_sets` to `workout_sessions`
- `exercise_records` to sessions/sets

This blocks a malicious client from inserting a row with its own `athlete_id` but another athlete's parent ID.

## Index Strategy

Indexes were added for:

- user lookups
- athlete lookups
- session dates
- workout session set lookup
- exercise history lookup
- settings lookup

## Migration Files

- `supabase/migrations/001_initial_schema.sql`
- `supabase/migrations/002_rls_policies.sql`
