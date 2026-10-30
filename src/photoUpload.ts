import { resolveApiUrl } from "./apiOrigin";
import type MudClient from "./client";

/** Longest edge sent to the server; Claude reads objects well at this size and it keeps uploads small. */
export const PHOTO_MAX_EDGE = 1568;
const UPLOAD_ENDPOINT = "/api/photos/upload";

/**
 * Decodes a photo, scales it so its longest edge is at most PHOTO_MAX_EDGE, and
 * re-encodes it as JPEG. Re-encoding through a canvas also drops EXIF, so no
 * location or camera details leave the device.
 */
export async function prepareJpeg(file: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, PHOTO_MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser cannot prepare photos.");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("This browser could not encode the photo."))),
      "image/jpeg",
      0.85,
    );
  });
}

/**
 * Sends a prepared JPEG to the MOO, which reads it into a draft and tells the
 * player in the game when it is ready. Returns the sentence to announce.
 */
export async function uploadPhoto(client: MudClient, jpeg: Blob): Promise<string> {
  const token = await client.gmcp.require("Client.WebPush").requestToken();
  if (!token) return "Could not send the photo: connect to the game first.";
  const response = await fetch(resolveApiUrl(UPLOAD_ENDPOINT), {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "image/jpeg" },
    body: jpeg,
  });
  if (response.status === 202) {
    return "Photo sent. The game will tell you when it has been read.";
  }
  let reason = response.status === 413 ? "the photo is too large" : `the server answered ${response.status}`;
  // The MOO explains refusals in JSON; Caddy's own size refusal has no body.
  if (response.headers.get("Content-Type")?.includes("application/json")) {
    const payload = (await response.json()) as { error?: unknown };
    if (typeof payload.error === "string") reason = payload.error;
  }
  return `Could not send the photo: ${reason}`;
}
