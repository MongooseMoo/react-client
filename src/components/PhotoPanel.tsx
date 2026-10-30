import { useRef, useState } from "react";
import type MudClient from "../client";
import { prepareJpeg, uploadPhoto } from "../photoUpload";

type Props = {
  client: MudClient;
};

/**
 * Takes or picks a photo and sends it to the MOO, which reads the things in it
 * into a draft the player reviews with @photo. The file input has no capture
 * attribute, so a phone offers both the camera and the photo library.
 */
const PhotoPanel = ({ client }: Props) => {
  const input = useRef<HTMLInputElement>(null);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");

  const send = async (file: File) => {
    setSending(true);
    setStatus("Sending photo…");
    try {
      setStatus(await uploadPhoto(client, await prepareJpeg(file)));
    } catch (error) {
      setStatus(`Could not send the photo: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <section aria-labelledby="photo-panel-heading">
      <h2 id="photo-panel-heading">Photos</h2>
      <p>
        Photograph real things and the game reads each one into an object you can review. When it is read, type{" "}
        <kbd>@photo</kbd> to go through the list and <kbd>@photo accept</kbd> to make them. For builders.
      </p>
      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          event.currentTarget.value = "";
          if (file) void send(file);
        }}
      />
      <button
        type="button"
        aria-disabled={sending}
        onClick={() => {
          if (!sending) input.current?.click();
        }}
      >
        Take or choose a photo
      </button>
      <p role="status">{status}</p>
    </section>
  );
};

export default PhotoPanel;
