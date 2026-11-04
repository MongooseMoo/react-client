import type MudClient from "./client";
import { davRequest, refusal } from "./davUpload";

/**
 * The player's sounds folder: Caddy writes uploads there and the MOO only
 * authorizes them. The game then runs each through its sound inbox (encoded,
 * added to the sound library) and tells the player its library path.
 */
const SOUND_FOLDER = "/dav/sounds/";

/** Endings of the sound files sent; anything else is turned away before sending. */
export const SOUND_EXTENSIONS = ["m4a", "mp3", "ogg", "oga", "opus", "wav", "flac", "aac", "aif", "aiff", "webm"];

/** Whether a file looks like a sound: an audio type, or a known ending when the browser gives no type. */
export function isSoundFile(file: File): boolean {
  if (file.type.startsWith("audio/")) return true;
  const dot = file.name.lastIndexOf(".");
  return dot > 0 && SOUND_EXTENSIONS.includes(file.name.slice(dot + 1).toLowerCase());
}

/**
 * The name a sound is stored under: the file's own name without any folder part,
 * with characters a path or Windows filename can't hold replaced by "-".
 */
export function soundFileName(name: string): string {
  const base = name.slice(Math.max(name.lastIndexOf("/"), name.lastIndexOf("\\")) + 1);
  // biome-ignore lint/suspicious/noControlCharactersInRegex: control characters are what this strips out of filenames
  const safe = base.replace(/[<>:"|?*\u0000-\u001f]/g, "-").trim();
  return safe && safe !== "." && safe !== ".." ? safe : `sound-${crypto.randomUUID()}`;
}

/**
 * Sends sound files to the player's sounds folder (/dav/sounds/, the same
 * folder a mapped drive shows), one after another under their own names.
 * Stops at the first one refused. Size limits are the server's (Caddy's 413);
 * who may upload is the MOO's (for now, sounds are for wizards). progress is
 * told which file is being sent. Returns the sentence to announce.
 */
export async function uploadSounds(
  client: MudClient,
  files: File[],
  progress: (index: number, count: number) => void,
): Promise<string> {
  const count = files.length;
  if (count === 0) return "No sound was chosen.";
  const notSound = files.find((file) => !isSoundFile(file));
  if (notSound) return `Could not send ${notSound.name}: it isn't a sound file.`;
  const token = await client.gmcp.require("Client.WebPush").requestToken();
  if (!token) return "Could not send the sound: connect to the game first.";
  for (let index = 0; index < count; index++) {
    progress(index + 1, count);
    const file = files[index];
    const path = SOUND_FOLDER + encodeURIComponent(soundFileName(file.name));
    const response = await davRequest("PUT", path, token, file, file.type || "application/octet-stream");
    if (response.status !== 201 && response.status !== 204) {
      const message = `Could not send ${file.name}: ${await refusal(response, "the sound is too large")}`;
      return count > 1 ? `Sound ${index + 1} of ${count}: ${message}` : message;
    }
  }
  return count > 1
    ? "Sounds sent. The game will tell you when each is in the sound library."
    : "Sound sent. The game will tell you when it is in the sound library.";
}
