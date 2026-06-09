export const ROLES = {
  OWNER: "owner",
  ADMIN: "admin",
  ATHLETE: "athlete",
  VIEWER: "viewer"
};

export const ROLE_DEFINITIONS = {
  [ROLES.OWNER]: "Full access to users, athletes, settings, data, and permissions.",
  [ROLES.ADMIN]: "Can manage athletes and viewers when owner permissions allow.",
  [ROLES.ATHLETE]: "Can access and log their own assigned fitness data.",
  [ROLES.VIEWER]: "Read-only access to assigned athlete data only."
};

export const OWNER_EMAIL = "m@mytamreen.com";

export function isOwnerEmail(email = "") {
  return String(email).trim().toLowerCase() === OWNER_EMAIL;
}

export function normalizeRole(role) {
  if (role === "player") return ROLES.ATHLETE;
  return Object.values(ROLES).includes(role) ? role : ROLES.ATHLETE;
}

export function canOpenAdminPanel(profile) {
  const role = isOwnerEmail(profile?.email) ? ROLES.OWNER : normalizeRole(profile?.role);
  return role === ROLES.OWNER || role === ROLES.ADMIN;
}

export function canManageRole(actorRole, targetRole) {
  const actor = normalizeRole(actorRole);
  const target = normalizeRole(targetRole);
  if (actor === ROLES.OWNER) return true;
  if (actor === ROLES.ADMIN) return target === ROLES.ATHLETE || target === ROLES.VIEWER;
  return false;
}

export function roleLabel(role) {
  const normalized = normalizeRole(role);
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}
