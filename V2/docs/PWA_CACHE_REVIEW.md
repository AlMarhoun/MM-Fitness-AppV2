# PWA Cache Review

## Current Update

Service worker cache version updated to:

- `mm-fitness-app-v10-supabase-auth`

## Static Assets Cached

- app shell
- CSS
- JS modules
- brand assets
- icons

## Supabase API Caching

The service worker now checks request origin.

If the request is external, such as Supabase or CDN module loading, it goes directly to network:

```js
if (url.origin !== location.origin) {
  event.respondWith(fetch(event.request));
  return;
}
```

This prevents Supabase API responses from being cached as app shell responses.

## Remaining PWA Concern

The app imports Supabase from an external ESM CDN. If offline on first load, the auth module may not load. For production-hardening, consider bundling dependencies or vendoring a pinned Supabase client build.

## User Update Strategy

On each deployment:

- bump cache name
- bump `index.html` JS/CSS query strings
- deploy all files together
- advise mobile users to close/reopen if standalone PWA keeps an old session
