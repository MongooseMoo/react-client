import { resolveApiUrl } from "./apiOrigin";
import type MudClient from "./client";

/** Longest edge sent to the server; Claude reads objects well at this size and it keeps uploads small. */
export const PHOTO_MAX_EDGE = 1568;
const UPLOAD_ENDPOINT = "/api/photos/upload";

/**
 * Where the JPEG starts in the file: 0 for an ordinary image, later for a frame
 * a camera saved with its video-stream header in front (a doorbell snapshot
 * that begins "--frameboundary"), which browsers will not decode as it is.
 */
export async function jpegStart(file: Blob): Promise<number> {
  const head = new Uint8Array(await file.slice(0, 4096).arrayBuffer());
  if (head[0] === 0xff && head[1] === 0xd8) return 0;
  for (let i = 1; i + 2 < head.length; i++) {
    if (head[i] === 0xff && head[i + 1] === 0xd8 && head[i + 2] === 0xff) return i;
  }
  return 0;
}

/**
 * Decodes a photo, scales it so its longest edge is at most PHOTO_MAX_EDGE, and
 * re-encodes it as JPEG. Re-encoding through a canvas also drops EXIF, so no
 * location or camera details leave the device.
 */
export async function prepareJpeg(file: Blob): Promise<Blob> {
  const start = await jpegStart(file);
  const image = start ? file.slice(start, file.size, "image/jpeg") : file;
  const bitmap = await createImageBitmap(image, { imageOrientation: "from-image" });
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
