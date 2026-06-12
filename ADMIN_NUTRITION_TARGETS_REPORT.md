# Admin Nutrition Targets Report

## Implementation

The existing athlete plan editor now exposes calorie, protein, carbohydrate, and fat targets for the selected plan day. This reuses the current per-athlete plan model and avoids a parallel target system.

## Behavior

- Targets belong to the athlete plan being edited.
- Existing HIGH, MED, and LOW presets remain available.
- Custom macro target values can be edited after choosing a preset.
- Changes affect plan targets and future daily defaults.
- Historical nutrition logs keep their stored target snapshots and intake values.

## Security Boundary

The panel remains behind the existing owner/admin workspace guard. No role, Auth, RLS, or service-key behavior was changed. The UI does not create a new privileged backend path.

## Limitation

Live multi-role verification still requires separate Supabase accounts and migration 007 for entry-level cloud data.
