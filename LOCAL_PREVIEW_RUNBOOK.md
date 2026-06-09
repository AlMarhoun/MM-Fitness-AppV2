# Local Preview Runbook

Purpose: run MM Fitness App V2 locally for visual/browser testing before any merge or production deployment.

## Correct Folder

Use this folder:

```bash
cd /Users/almarhoun/Desktop/Codex/Github/MM-Fitness-AppV2
```

Do not use the Documents clone until transfer is approved.

## Quick Health Check

Run:

```bash
npm run check
npm run validate:manifest
```

Expected result:

- both commands finish without errors.

## Option A: Python Static Server

Run:

```bash
cd /Users/almarhoun/Desktop/Codex/Github/MM-Fitness-AppV2
python3 -m http.server 4311 --bind 127.0.0.1
```

Open:

```text
http://127.0.0.1:4311/index.html?splash=1&v=11
```

Stop server:

Press:

```text
Control + C
```

## Option B: Vercel Local Preview

If you have Vercel CLI:

```bash
cd /Users/almarhoun/Desktop/Codex/Github/MM-Fitness-AppV2
vercel dev
```

Open the URL Vercel prints, usually:

```text
http://localhost:3000
```

Use:

```text
?splash=1&v=11
```

Stop server:

```text
Control + C
```

## If Port Is Busy

Use another port:

```bash
python3 -m http.server 4322 --bind 127.0.0.1
```

Open:

```text
http://127.0.0.1:4322/index.html?splash=1&v=11
```

## What To Test In Browser

- Login screen has no Create Account.
- Splash appears and exits cleanly.
- Home dashboard renders.
- Start Workout works.
- Active Workout set inputs work.
- Pause/Resume works.
- Cancel shows confirmation.
- Finish shows confirmation.
- Workout Summary appears.
- Progress metrics update.
- Logs screen opens.
- History / Calendar renders.
- Nutrition screen works.
- Settings / Admin Panel placeholder appears for owner/admin only.
- Bottom navigation remains fixed and usable.

## Responsive Browser Testing

Use browser devtools responsive mode and test:

- 320px
- 360px
- 375px
- 390px
- 414px
- 430px
- 480px

Check:

- no horizontal scrolling
- no cut-off buttons
- no broken cards
- no modal overflow
- no bottom nav overlap
- no tiny unreadable text
- calendar remains readable
- Active Workout remains usable
- Admin Panel remains contained

## Cache / Service Worker Issues

If the old app appears:

1. Open DevTools.
2. Go to Application.
3. Service Workers.
4. Click Unregister.
5. Go to Storage.
6. Clear site data.
7. Hard refresh.
8. Reopen:

```text
http://127.0.0.1:4311/index.html?splash=1&v=11
```

If installed as iPhone PWA and stale:

1. Delete the old Home Screen app icon.
2. Open the new link in Safari.
3. Add to Home Screen again.

## Codex Environment Note

Codex attempted:

```bash
python3 -m http.server 4311 --bind 127.0.0.1
```

Result:

```text
PermissionError: [Errno 1] Operation not permitted
```

So browser rendering could not be performed inside Codex.
