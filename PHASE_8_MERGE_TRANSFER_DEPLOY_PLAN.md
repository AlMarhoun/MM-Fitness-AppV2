# Phase 8 Merge / Transfer / Deploy Plan

Status: Plan only. Not executed.

## Current Working Folder

`/Users/almarhoun/Desktop/Codex/Github/MM-Fitness-AppV2`

## Original Documents Folder

`/Users/almarhoun/Documents/GitHub/MM-Fitness-AppV2`

## Important Rule

Do not copy files to Documents, commit, merge, or deploy until the owner gives explicit approval.

## Files Added

- `src/sessionPersistence.js`
- `src/performance.js`
- `src/history.js`
- `src/roles.js`
- `TEAM_STRUCTURE_AND_REVIEW_PLAN.md`
- `ACTIVE_WORKOUT_RESUME_FIX.md`
- `PERFORMANCE_METRICS_1RM_VOLUME.md`
- `WORKOUT_HISTORY_CALENDAR.md`
- `AUTH_INVITATION_ADMIN_PANEL.md`
- `SECURITY_ROLE_REVIEW.md`
- `PHASE_5_FINAL_QA_REPORT.md`
- `PHASE_6_VISUAL_MOBILE_BROWSER_TEST.md`
- `PHASE_7_IPHONE_A2HS_TEST_PLAN.md`
- `PHASE_8_MERGE_TRANSFER_DEPLOY_PLAN.md`
- `PHASE_9_FINAL_PRODUCTION_CHECKLIST.md`
- `CHANGELOG.md`
- `KNOWN_ISSUES.md`
- `QA_RESULTS.md`

## Files Modified

- `src/app.js`
- `src/auth.js`
- `src/db.js`
- `src/storage.js`
- `src/styles.css`
- `sw.js`
- `package.json`

## Recommended Backup Step Before Transfer

Before copying into Documents:

1. Zip the Documents clone:

```bash
cd /Users/almarhoun/Documents/GitHub
zip -qr MM-Fitness-AppV2-backup-before-transfer.zip MM-Fitness-AppV2
```

2. Confirm backup exists.

## Recommended Git Status Check

In Documents clone:

```bash
cd /Users/almarhoun/Documents/GitHub/MM-Fitness-AppV2
git status --short --branch
```

If there are uncommitted changes, review them before transfer.

## Recommended Diff Review

After copying files, run:

```bash
git status --short
git diff -- src/app.js src/auth.js src/db.js src/storage.js src/styles.css sw.js package.json
```

Review added files:

```bash
git diff --stat
```

## Transfer Strategy

Recommended:

1. Keep Documents clone untouched until approved.
2. Copy all files from Codex working folder to Documents clone.
3. Do not delete unknown files in Documents unless reviewed.
4. Run checks in Documents clone:

```bash
npm run check
npm run validate:manifest
```

5. Launch Vercel preview from repository or push branch.

## Rollback Strategy

If transfer causes issues:

1. Restore from backup zip.
2. Or use git:

```bash
git restore .
git clean -fd
```

Only run destructive git cleanup after owner approval.

## Deployment Checklist

Before Vercel deployment:

- Confirm no public signup UI.
- Confirm no service role key.
- Confirm `vercel.json` exists.
- Confirm `sw.js` includes new modules.
- Confirm `npm run check` passes.
- Confirm `npm run validate:manifest` passes.
- Confirm Supabase redirect URLs if auth redirects are needed.
- Confirm Supabase public signup is disabled/invite-only.

## What Owner Must Approve Before Merge/Deploy

- Transfer from Codex folder to Documents folder.
- Any overwrite in Documents clone.
- Git commit.
- Push to GitHub.
- Vercel deployment.
- Supabase Auth/RLS production setup.
