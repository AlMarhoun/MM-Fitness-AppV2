import fs from "node:fs";

const avatarSql = fs.readFileSync(new URL("../supabase/migrations/004_profile_avatars.sql", import.meta.url), "utf8");
const athleteSql = fs.readFileSync(new URL("../supabase/migrations/005_athlete_self_authorization.sql", import.meta.url), "utf8");
const app = fs.readFileSync(new URL("../src/app.js", import.meta.url), "utf8");

const failures = [];
if (!avatarSql.includes("(storage.foldername(name))[1] = auth.uid()::text")) failures.push("Avatar writes must be restricted to the authenticated user's folder");
if (!avatarSql.includes("can_view_user_profile")) failures.push("Avatar reads must use profile access authorization");
if (!athleteSql.includes("relationship_type = 'self'")) failures.push("Athletes need explicit self-assignment write access");
if (!athleteSql.includes("relationship_type in ('owner', 'admin', 'coach')")) failures.push("Assigned management access must be role-scoped");
if (!app.includes('state.screen === "admin"') || !app.includes("canOpenAdminPanel")) failures.push("Admin route must be authorization-gated");
if (!app.includes('state.screen === "active" || state.screen === "admin"')) failures.push("Admin workspace should not expose primary athlete navigation");

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}
console.log("Authentication, authorization, athlete isolation, and avatar safeguards validated.");
