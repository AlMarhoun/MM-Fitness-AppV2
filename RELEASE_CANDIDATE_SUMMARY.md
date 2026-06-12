# MM Fitness App V2 Release Candidate Summary

Release candidate: Performance Instrument V3, cache `v23-release-candidate`.

## Included

- Mission-first Home cockpit.
- One-handed Active Workout with autosaved draft restoration.
- Estimated 1RM, set/exercise/workout volume, previous performance, and PR detection.
- Performance Cockpit with volume, strength, consistency, body, and recovery intelligence.
- Date-based History with workout snapshots, nutrition, body logs, padel, and swimming.
- Premium Nutrition and grouped Daily Logs.
- Personal Profile and private avatar controls.
- Admin Workspace split into Users, Athletes, Access, Plans, and Security Notes.
- Supabase/Auth/RLS-aware UI with no public signup.
- PWA cache and navigation safeguards.

## Phase H Changes

- Fixed 320px Admin Users overflow.
- Added a regression contract for the corrected Admin row layout.
- Advanced static assets and service-worker cache from v22 to v23.
- Added final QA, browser, security, PWA, and iPhone test documentation.

## Approval Boundary

This candidate is ready for browser and real iPhone testing. It is not a production approval until iPhone lifecycle testing, live cross-role RLS testing, and the deployment/rollback review pass.
