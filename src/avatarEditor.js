export const DEFAULT_AVATAR_CROP = Object.freeze({ x: 50, y: 50, zoom: 1 });

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, Number(value)));
}

export function clampAvatarCrop(crop = {}) {
  return {
    x: Math.round(clamp(crop.x ?? 50, 0, 100) * 10) / 10,
    y: Math.round(clamp(crop.y ?? 50, 0, 100) * 10) / 10,
    zoom: Math.round(clamp(crop.zoom ?? 1, 1, 3) * 100) / 100
  };
}

export function avatarDrawGeometry(source, outputSize = 1024, crop = DEFAULT_AVATAR_CROP) {
  const safe = clampAvatarCrop(crop);
  const width = Number(source?.width || 0);
  const height = Number(source?.height || 0);
  if (!width || !height) throw new Error("Avatar image dimensions are unavailable.");
  const scale = Math.max(outputSize / width, outputSize / height) * safe.zoom;
  const drawWidth = width * scale;
  const drawHeight = height * scale;
  return {
    drawWidth,
    drawHeight,
    dx: (outputSize - drawWidth) * (safe.x / 100),
    dy: (outputSize - drawHeight) * (safe.y / 100)
  };
}

export async function loadAvatarImage(file) {
  if (!file) throw new Error("Choose an image first.");
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.decoding = "async";
    image.src = url;
    await image.decode();
    return { image, url };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw new Error("This image could not be previewed. Try JPG, PNG, or WebP.", { cause: error });
  }
}

export async function renderAvatarCrop(image, crop, outputSize = 1024) {
  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) throw new Error("Photo editor is unavailable in this browser.");
  const geometry = avatarDrawGeometry({ width: image.naturalWidth, height: image.naturalHeight }, outputSize, crop);
  context.fillStyle = "#071321";
  context.fillRect(0, 0, outputSize, outputSize);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, geometry.dx, geometry.dy, geometry.drawWidth, geometry.drawHeight);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", 0.9));
  if (!blob) throw new Error("Could not prepare the cropped profile photo.");
  return new File([blob], "mm-profile.webp", { type: "image/webp" });
}
