# Multi-Device Sync Plan

## Goal

After login, iPhone, Mac, and other devices should show the same MM Fitness App data.

## Implemented Path

- `loadCloudSnapshot()` now loads from normalized Supabase tables.
- `saveCloudSnapshot()` writes to normalized Supabase tables.
- `localStorage` remains a draft/cache/backup layer.

## Sync States

- `Loading data`
- `Saving`
- `Saved`
- `Offline`
- `Sync error`
- `Local draft`

## Offline Behavior

Active workout drafts remain local so a workout is not lost if the connection drops. Cloud sync resumes when online and the app saves again.

## Required Validation

- Log workout on iPhone.
- Open Mac with same account.
- Confirm workout appears in Calendar.
- Confirm Progress volume/1RM metrics update.
- Confirm role and Admin Panel state load from database.
