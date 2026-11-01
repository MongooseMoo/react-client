import { announce } from "@react-aria/live-announcer";
import { useRef, useState } from "react";
import type MudClient from "../client";
import { uploadPhotos } from "../photoUpload";

type Props = {
  client: MudClient;
};

/**
 * Takes or picks photos and sends them to the MOO, which reads the things in
 * them into a draft the player reviews with @photo. Several pictures chosen
 * together go into one album and are read together, so a thing seen in two of
 * them comes out once. The file input has no capture attribute, so a phone
 * offers both the camera and the photo library.
 */
const PhotoPanel = ({ client }: Props) => {
  const input = useRef<HTMLInputElement>(null);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");

  // Results are spoken through the shared announcer, as elsewhere in the client:
  // a polite status region in the sidebar was not heard while focus came back
  // from the file picker (Q, 2026-10-30). The paragraph keeps the last result to read again.
  const report = (text: string) => {
    setStatus(text);
    announce(text, "assertive");
  };

  const send = async (files: File[]) => {
    setSending(true);
    try {
      report(
        await uploadPhotos(client, files, (index, count) =>
          report(count > 1 ? `Sending photo ${index} of ${count}…` : "Sending photo…"),
        ),
      );
    } catch (error) {
      report(`Could not send the photo: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <section aria-labelledby="photo-panel-heading">
      <h2 id="photo-panel-heading">Photos</h2>
      <p>
        Photograph real things and the game reads each one into an object you can review. Choose several pictures at
        once and they go into one album, read together. When it is read, type <kbd>@photo</kbd> to go through the list
        and <kbd>@photo accept</kbd> to make them. For builders.
      </p>
      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(event) => {
          const files = Array.from(event.currentTarget.files ?? []);
          event.currentTarget.value = "";
          if (files.length) void send(files);
        }}
      />
      <button
        type="button"
        aria-disabled={sending}
        onClick={() => {
          if (!sending) input.current?.click();
        }}
      >
        Take or choose photos
      </button>
      <p>{status}</p>
    </section>
  );
};

export default PhotoPanel;
