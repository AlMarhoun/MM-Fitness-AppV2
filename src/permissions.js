export const PERMISSIONS = {
  USER_MANAGEMENT: [
    "users.view",
    "users.invite",
    "users.create",
    "users.edit",
    "users.deactivate",
    "users.change_role"
  ],
  ATHLETE_MANAGEMENT: [
    "athletes.view_all",
    "athletes.view_assigned",
    "athletes.create",
    "athletes.edit",
    "athletes.deactivate",
    "athletes.assign_user"
  ],
  WORKOUT_PLAN: [
    "plans.view",
    "plans.create",
    "plans.edit",
    "plans.delete",
    "plans.assign"
  ],
  WORKOUT_LOGGING: [
    "workouts.view",
    "workouts.create",
    "workouts.edit_own",
    "workouts.edit_assigned",
    "workouts.delete_own",
    "workouts.delete_assigned"
  ],
  PERFORMANCE: [
    "performance.view",
    "performance.view_all",
    "performance.export"
  ],
  DAILY_LOGS: [
    "daily_logs.view",
    "daily_logs.create",
    "daily_logs.edit_own",
    "daily_logs.edit_assigned"
  ],
  NUTRITION: [
    "nutrition.view",
    "nutrition.create",
    "nutrition.edit_own",
    "nutrition.edit_assigned"
  ],
  PADEL: [
    "padel.view",
    "padel.create",
    "padel.edit_own",
    "padel.edit_assigned"
  ],
  ADMIN: [
    "admin_panel.access",
    "settings.view",
    "settings.edit",
    "audit_logs.view"
  ]
};

export function allPermissionKeys() {
  return Object.values(PERMISSIONS).flat();
}
