# PWA Setup

## Manifest

File:

- `manifest.json`

Values:

- App name: `MM Fitness App`
- Short name: `MM Fitness`
- Display: `standalone`
- Orientation: `portrait`
- Theme color: `#040B14`
- Background color: `#040B14`

## Icons

Included:

- `assets/icons/icon-192.png`
- `assets/icons/icon-512.png`
- `assets/icons/maskable-icon-512.png`
- `assets/icons/apple-touch-icon-180.png`
- `assets/icons/favicon.png`

## Mobile Meta Tags

Included in `index.html`:

- Mobile viewport with `viewport-fit=cover`.
- Apple mobile web app capable.
- Apple status bar style.
- Apple mobile title.
- Theme color.
- Manifest link.
- Apple touch icon.

## Safe Area

CSS uses:

- `env(safe-area-inset-top)`
- `env(safe-area-inset-bottom)`

The bottom navigation is fixed and safe-area aware.

## Service Worker

File:

- `sw.js`

Purpose:

- Caches core app shell files.
- Supports basic offline reload after first visit.

Note:
Full Add to Home Screen installation should be tested over HTTPS or localhost/127.0.0.1 in a supported mobile browser.

## Splash Behavior

The app includes an in-app animated splash screen:

- Midnight Navy background.
- Performance Signature logo.
- Ice Blue loading sweep.
- Short entrance and exit animation.
