# MM Fitness App Usefulness and Profile Polish Design

## Goal

Polish the current production-shaped app without redesigning it: make the profile photo controllable, make readiness honest, remove UI that does not earn its place, and conservatively reduce code and style debt.

## Profile Photo Editor

- Selecting a new photo opens a focused modal before upload.
- The image can be dragged horizontally and vertically inside a circular crop guide.
- A zoom range from 1x to 3x supports fine framing without distortion.
- Reset restores centered position and 1x zoom.
- Three previews show profile, header, and compact-list sizes.
- Save renders a real square WebP crop in-browser and uploads that result through the existing private Supabase bucket and RLS path.
- Crop metadata (`x`, `y`, `zoom`) is stored on the profile for traceability and future editing. Existing profiles remain valid through database defaults.
- Cancel uploads nothing and changes no profile data.

## Today’s Readiness

The current score is misleading because missing recovery values default to 4/5, producing 80 without user input.

New behavior:

- A score appears only when sleep, energy, soreness, and Achilles discomfort are all logged for today.
- The Epley/performance engine is untouched; readiness is a separate presentation model.
- Calculation remains transparent: `(sleep + energy + (6 - soreness) + (6 - Achilles)) / 20 * 100`.
- Complete data shows `Today's Readiness`, score, and status.
- Missing data shows `Recovery Check` and `Log`, not a fabricated number.
- Tapping either state opens Logs with the Recovery section expanded.
- The duplicated Home Recovery metric is removed; readiness owns that decision. The supporting instrument row remains Fuel, Body, and Activity.

## Usefulness Decisions

- Keep mission, next action, weekly consistency, performance metrics, history, and secure admin boundaries.
- Rename vague copy to literal labels where discovered.
- Hide analytics sections when data is insufficient instead of drawing decorative charts.
- Consolidate explanatory admin placeholders into a quieter protected-actions disclosure.
- Keep intentionally disabled privileged actions because they document the server-side boundary, but reduce their visual prominence.
- Remove confirmed dead code/styles only when repository search and tests show no runtime contract.

## Security and Data Boundaries

- No public signup.
- No service-role key or database credentials in the browser.
- Existing avatar upload path and RLS ownership rules remain.
- A new additive migration stores crop metadata only; no existing profile field is renamed or removed.
- Active workout, storage keys, cloud synchronization, backup/import/export, and performance calculations remain unchanged.

## Testing

- Unit tests cover crop clamping, crop geometry, readiness missing/complete states, and score labels.
- UI contract tests cover the editor, previews, honest readiness CTA, and removal of the old default score behavior.
- Existing syntax, manifest, PWA, security, performance, history/activity, and V3 tests remain green.
- Rendered browser checks cover upload-to-preview flow, drag, zoom, reset, cancel, responsive widths, themes, and console errors.

## Approval

Approved by Mohammad on June 12, 2026 after visual comparison in the local companion.
