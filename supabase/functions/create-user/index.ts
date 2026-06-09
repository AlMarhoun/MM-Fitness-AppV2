import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://hqnkmddktxxawkdnnqwu.supabase.co";
const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY");

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}

function cleanEmail(email: unknown) {
  return String(email || "").trim().toLowerCase();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!SERVICE_ROLE_KEY) return json({ error: "SERVICE_ROLE_KEY secret is not configured" }, 500);

  const authHeader = req.headers.get("Authorization") || "";
  const jwt = authHeader.replace("Bearer ", "").trim();
  if (!jwt) return json({ error: "Missing authorization token" }, 401);

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const { data: requesterData, error: requesterError } = await admin.auth.getUser(jwt);
  if (requesterError || !requesterData.user) return json({ error: "Invalid session" }, 401);

  const requesterId = requesterData.user.id;
  const { data: requesterProfile, error: profileError } = await admin
    .from("profiles")
    .select("id,email,role_id,roles(name)")
    .eq("id", requesterId)
    .maybeSingle();
  if (profileError) return json({ error: profileError.message }, 500);

  const requesterRole = requesterProfile?.roles?.name || "";
  const isOwner = requesterRole === "owner" || cleanEmail(requesterProfile?.email) === "m@mytamreen.com";
  const isAdmin = requesterRole === "admin";

  if (!isOwner && !isAdmin) return json({ error: "Admin access required" }, 403);

  const body = await req.json().catch(() => ({}));
  const email = cleanEmail(body.email);
  const password = String(body.password || "");
  const role = String(body.role || "athlete").toLowerCase();
  const displayName = String(body.displayName || email.split("@")[0] || "Athlete").trim();
  const athleteIdInput = String(body.athleteId || "").trim();
  const athleteMode = String(body.athleteMode || (athleteIdInput ? "current" : "new")).toLowerCase();
  const athleteDisplayName = String(body.athleteDisplayName || displayName || "Athlete").trim();

  if (!email || !email.includes("@")) return json({ error: "Valid email is required" }, 400);
  if (password.length < 8) return json({ error: "Temporary password must be at least 8 characters" }, 400);
  if (!["owner", "admin", "athlete", "viewer"].includes(role)) return json({ error: "Invalid role" }, 400);
  if (!isOwner && (role === "owner" || role === "admin")) {
    return json({ error: "Only owner can create owner/admin users" }, 403);
  }

  const { data: roleRow, error: roleError } = await admin
    .from("roles")
    .select("id,name")
    .eq("name", role)
    .single();
  if (roleError) return json({ error: roleError.message }, 500);

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: displayName }
  });
  if (createError) return json({ error: createError.message }, 400);

  const userId = created.user.id;

  const { error: profileUpsertError } = await admin
    .from("profiles")
    .upsert({
      id: userId,
      email,
      display_name: displayName,
      role_id: roleRow.id,
      is_active: true,
      created_by: requesterId
    }, { onConflict: "id" });
  if (profileUpsertError) return json({ error: profileUpsertError.message }, 500);

  let athleteId = athleteIdInput || null;
  if (athleteMode === "new") {
    const { data: athlete, error: athleteError } = await admin
      .from("athletes")
      .insert({
        owner_user_id: requesterId,
        display_name: athleteDisplayName,
        status: "active"
      })
      .select("id")
      .single();
    if (athleteError) return json({ error: athleteError.message }, 500);
    athleteId = athlete.id;
  } else if (athleteMode === "current" && !athleteId) {
    const { data: assignment } = await admin
      .from("athlete_user_assignments")
      .select("athlete_id")
      .eq("user_id", requesterId)
      .limit(1)
      .maybeSingle();
    athleteId = assignment?.athlete_id || null;
  } else if (athleteMode === "none") {
    athleteId = null;
  }

  if (athleteId) {
    const { error: assignmentError } = await admin
      .from("athlete_user_assignments")
      .upsert({
        athlete_id: athleteId,
        user_id: userId,
        relationship_type: role === "viewer" ? "viewer" : role === "admin" ? "admin" : "self",
        created_by: requesterId
      }, { onConflict: "athlete_id,user_id" });
    if (assignmentError) return json({ error: assignmentError.message }, 500);
  }

  await admin.from("audit_logs").insert({
    actor_user_id: requesterId,
    athlete_id: athleteId,
    action: "admin.create_user",
    target_table: "profiles",
    target_id: userId,
    metadata: { email, role }
  });

  return json({
    ok: true,
    user: {
      id: userId,
      email,
      displayName,
      role,
      athleteId
    }
  });
});
