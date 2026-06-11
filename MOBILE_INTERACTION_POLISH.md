# Mobile Interaction Polish: Phase A/B

## Implemented

- Stable 52px primary mission action.
- 44px or larger supporting controls.
- Active Workout inputs increased to 52px.
- First incomplete set receives active styling.
- Workout HUD remains sticky and compact.
- Finish dock respects `env(safe-area-inset-bottom)`.
- Active screen reserves bottom space so the final content can scroll above the dock.
- Button press feedback uses a short 90ms response.
- State transitions use 160ms timing.
- Reduced-motion media rules remove decorative movement and near-disable transitions.

## Athletic Glass Usage

Glass is limited to:

- Existing bottom navigation.
- Active Workout HUD.
- Finish Workout dock.
- Existing modal layer.

Home instruments remain opaque for clarity and rendering stability.

## Interaction Preservation

The following original action contracts remain unchanged:

- Start Workout.
- View Plan.
- Quick actions.
- Pause / Resume.
- Cancel with confirmation.
- Finish with confirmation.
- Set inputs and completion toggles.

