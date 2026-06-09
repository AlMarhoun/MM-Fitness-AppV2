# Known Issues

- Supabase migrations have been created but not applied by this agent.
- Live login and cloud sync require the migrations to be pushed to the Supabase project.
- Player invite/user creation is not automated in the public frontend by design. A trusted Edge Function/backend should handle privileged invitations later.
- Runtime cloud sync currently stores a compatibility snapshot in `app_settings`. Normalized workout/session/set writes should be implemented in the next performance-engine phase.
- Browser automation could not complete screenshot verification due an unsupported browser-tool call in this environment.
- Supabase JS is loaded from an external ESM CDN. For production hardening, consider bundling or vendoring the dependency.
