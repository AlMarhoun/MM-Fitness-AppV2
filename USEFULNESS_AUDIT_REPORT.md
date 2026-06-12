# Usefulness Audit Report

Date: June 12, 2026

## Decisions

| UI element | Screen | Current purpose | Useful? | Decision | Fix applied |
|---|---|---|---|---|---|
| Readiness score | Home | Convert sleep, energy, soreness, and Achilles inputs into a training signal | Yes, when complete | Improve + rename | Renamed the incomplete state to `Recovery Check`; no score is shown until all four inputs exist. The control opens Recovery logging directly. |
| Default `80 Ready` | Home | Previously filled an attractive metric slot | No | Remove | Removed the fallback score. Missing inputs are named in the accessible label. |
| Duplicate recovery instrument | Home | Repeated the same readiness information | No | Replace | Replaced with an Activity instrument for padel/swimming context. |
| Duplicate next action | Home | Repeated `Start Workout` immediately below the main mission action | Sometimes | Hide when duplicated | The second heading is suppressed when the mission button already provides the same action; quick actions remain. |
| Controlled-access explanation card | Login | Repeated the private-access message | Low | Remove | Kept one concise private-access sentence and the sign-in form. Public signup remains absent. |
| Profile photo upload | Profile | Set an athlete avatar | Yes | Improve | Replaced immediate upload with crop preview, two-axis drag, zoom, reset, cancel, and save. |
| Protected admin actions | Admin Access | Explain unavailable privileged operations | Yes, but secondary | Move | Moved into a collapsed disclosure so safe live tasks stay primary. |
| Performance empty states | Active Workout / Progress | Explain missing history | Yes | Keep | Kept because they tell the user exactly what to log next instead of fabricating metrics. |
| Readiness quick action | Home | Open recovery entry | Yes | Improve | Now opens the correct Logs section instead of triggering unrelated UI behavior. |

## Readiness Decision

The metric is retained because it supports a real decision: whether normal training, moderated effort, or reduced intensity is appropriate. It is calculated only when sleep, energy, soreness, and Achilles discomfort are all logged on a 1-5 scale.

Formula:

`(sleep + energy + (6 - soreness) + (6 - Achilles)) / 20 * 100`

The app no longer presents a readiness number when evidence is incomplete.

## Result

The interface keeps decision-supporting information and removes decorative certainty, repeated actions, and overly prominent placeholders.
