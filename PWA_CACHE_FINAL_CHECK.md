# PWA Cache Final Check

Date: June 12, 2026

## Release Candidate Cache

- Cache name: `mm-fitness-app-v23-release-candidate`
- CSS: `src/styles.css?v=23`
- App entry: `src/app.js?v=23`
- Progress module precache: `src/progressCockpit.js?v=23`

## Validation

- Manifest validation passed.
- PWA navigation/redirect safeguards passed.
- Service worker does not cache redirected navigation responses.
- Old cache names are deleted during activation.
- Navigation remains network-first with a safe local fallback.

## If An Old Version Appears

1. Close the Home Screen app.
2. Remove the old Home Screen icon.
3. Open the site in Safari and refresh it.
4. If necessary, clear that site's Safari website data.
5. Reopen the URL and add it to the Home Screen again.

Physical iPhone cache replacement remains pending until the candidate is available on a test deployment.
