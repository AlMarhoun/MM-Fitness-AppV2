# PWA iOS Redirect Fix

## Confirmed Root Cause

Vercel `cleanUrls` returns:

- `/` -> `200`
- `/index.html` -> `308` redirect to `/`

The previous service worker precached `./index.html` and used it as the fallback for failed requests. Safari on iOS rejects redirected navigation responses returned by a service worker and displays:

`Response served by service worker has redirections`

The manifest also used `./index.html` as its Add to Home Screen start URL, which entered the same redirect path.

## Fix Applied

- Manifest `start_url` changed to `/`.
- Manifest `scope` changed to `/`.
- Manifest stable app `id` added as `/`.
- Removed `/` and `/index.html` from service worker precache.
- Service worker no longer intercepts navigation requests.
- Redirected responses are never written to cache.
- Source modules use network-first behavior with cached offline fallback.
- Service worker registration uses `updateViaCache: "none"`.
- Cache version increased to `mm-fitness-app-v16-no-redirect-navigation`.
- Added `npm run validate:pwa` regression check.

## Existing iPhone Recovery

After the fixed version is deployed:

1. Delete the existing MM Fitness App icon from the iPhone Home Screen.
2. Open `https://mm-fitness-app-v2.vercel.app/` directly in Safari.
3. Refresh the page once and confirm it loads.
4. If the error remains, open iPhone Settings -> Safari -> Advanced -> Website Data.
5. Search for `mm-fitness-app-v2.vercel.app` and remove that website data only.
6. Open the root URL again in Safari.
7. Use Share -> Add to Home Screen.

This cleanup is required only for devices that already stored the broken service worker/cache.

## Verification

- `npm run check`
- `npm run validate:manifest`
- `npm run validate:pwa`
- Confirm deployed `/index.html` may redirect, but the manifest and service worker never use it as the app launch/fallback URL.

## Remaining Device Validation

Real iPhone Add to Home Screen testing is still required after deployment. The code-level redirect path is removed, but only a physical iPhone can confirm long-term iOS lifecycle behavior.
