import { supabase } from "./supabase.js";

const BUCKET = "profile-avatars";
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);

function extensionFor(file) {
  const extension = file.name?.split(".").pop()?.toLowerCase();
  if (extension && /^[a-z0-9]{2,5}$/.test(extension)) return extension;
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/heic") return "heic";
  return "jpg";
}

export function initials(name = "MM") {
  return String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "MM";
}

export async function signedAvatarUrl(path) {
  if (!path) return "";
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60);
  if (error) return "";
  return data?.signedUrl || "";
}

export async function uploadOwnAvatar(userId, file, previousPath = "", crop = {}) {
  if (!userId) throw new Error("Sign in before uploading a profile picture.");
  if (!file) throw new Error("Choose an image first.");
  if (!ALLOWED_TYPES.has(file.type)) throw new Error("Use a JPG, PNG, WebP, HEIC, or HEIF image.");
  if (file.size > MAX_BYTES) throw new Error("Profile picture must be smaller than 5 MB.");

  const path = `${userId}/avatar-${Date.now()}.${extensionFor(file)}`;
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: false
  });
  if (uploadError) throw uploadError;

  const cropUpdate = {
    avatar_path: path,
    avatar_position_x: Number(crop.x ?? 50),
    avatar_position_y: Number(crop.y ?? 50),
    avatar_zoom: Number(crop.zoom ?? 1)
  };
  let { error: profileError } = await supabase
    .from("profiles")
    .update(cropUpdate)
    .eq("id", userId);
  if (profileError && ["42703", "PGRST204"].includes(profileError.code)) {
    const fallback = await supabase.from("profiles").update({ avatar_path: path }).eq("id", userId);
    profileError = fallback.error;
  }
  if (profileError) {
    await supabase.storage.from(BUCKET).remove([path]);
    throw profileError;
  }

  if (previousPath && previousPath !== path) {
    await supabase.storage.from(BUCKET).remove([previousPath]).catch(() => {});
  }

  return { path, url: await signedAvatarUrl(path), crop: cropUpdate };
}

export async function updateOwnProfile(userId, updates) {
  const allowed = {
    display_name: String(updates.display_name || "").trim().slice(0, 80),
    bio: String(updates.bio || "").trim().slice(0, 240)
  };
  const { data, error } = await supabase
    .from("profiles")
    .update(allowed)
    .eq("id", userId)
    .select("*,roles(name)")
    .single();
  if (error) throw error;
  return data;
}
