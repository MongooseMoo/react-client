import type MudClient from "./client";
import { davRequest, refusal } from "./davUpload";

/** Longest edge sent to the server; Claude reads objects well at this size and it keeps uploads small. */
export const PHOTO_MAX_EDGE = 1568;
/** The player's photos folder: Caddy writes uploads there and the MOO only authorizes them, so pictures never pass through the game. */
const PHOTO_FOLDER = "/dav/photos/";

function readBytes(blob: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}

/**
 * Where the JPEG starts in the file: 0 for an ordinary image, later for a frame
 * a camera saved with its video-stream header in front (a doorbell snapshot
 * that begins "--frameboundary"), which browsers will not decode as it is.
 */
export async function jpegStart(file: Blob): Promise<number> {
  const head = new Uint8Array(await readBytes(file.slice(0, 4096)));
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

/** One request to the player's photos folder on the MOO's WebDAV drive, with the push token. */
function photoRequest(method: "PUT" | "MKCOL", path: string, token: string, jpeg?: Blob): Promise<Response> {
  return davRequest(method, PHOTO_FOLDER + path, token, jpeg, "image/jpeg");
}

/** Why a photo was refused, in the words the player is told. */
function photoRefusal(response: Response): Promise<string> {
  return refusal(response, "the photo is too large");
}

/**
 * Sends pictures to the player's photos folder (/dav/photos/, the same folder a
 * mapped drive shows); the game takes each from there, reads it and tells the
 * player when it is read. One picture goes in on its own. Several go into a new
 * subfolder, named 001.jpg, 002.jpg ... in the order given, and become one album
 * read together: the game takes a subfolder once nothing more has arrived in it
 * for a few seconds, so every picture is prepared first and they are sent back
 * to back. Stops at the first picture refused. progress is told which picture is
 * being sent; prepare turns each file into the JPEG sent (prepareJpeg). Returns
 * the sentence to announce.
 */
export async function uploadPhotos(
  client: MudClient,
  files: Blob[],
  progress: (index: number, count: number) => void,
  prepare: (file: Blob) => Promise<Blob> = prepareJpeg,
): Promise<string> {
  const count = files.length;
  if (count === 0) return "No photo was chosen.";
  const token = await client.gmcp.require("Client.WebPush").requestToken();
  if (!token) return "Could not send the photo: connect to the game first.";
  const jpegs: Blob[] = [];
  for (const file of files) jpegs.push(await prepare(file));
  const album = count > 1 ? `${crypto.randomUUID()}/` : "";
  if (album) {
    const made = await photoRequest("MKCOL", album, token);
    if (made.status !== 201) return `Could not send the photos: ${await photoRefusal(made)}`;
  }
  for (let index = 0; index < count; index++) {
    progress(index + 1, count);
    const name = album ? `${String(index + 1).padStart(3, "0")}.jpg` : `${crypto.randomUUID()}.jpg`;
    const response = await photoRequest("PUT", album + name, token, jpegs[index]);
    if (response.status !== 201 && response.status !== 204) {
      const message = `Could not send the photo: ${await photoRefusal(response)}`;
      return count > 1 ? `Photo ${index + 1} of ${count}: ${message}` : message;
    }
  }
  return count > 1
    ? "Photos sent. The game will tell you when they have been read."
    : "Photo sent. The game will tell you when it has been read.";
}
