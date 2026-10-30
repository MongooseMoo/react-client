import { announce } from "@react-aria/live-announcer";
import { useRef, useState } from "react";
import type MudClient from "../client";
import { prepareJpeg, uploadPhoto } from "../photoUpload";
import "./VoiceCommandButton.css";

type Props = {
  client: MudClient;
};

/**
 * Takes or picks a photo and sends it to the MOO, which reads the things in it
 * into a draft the player reviews with @photo. No capture attribute, so a phone
 * offers both the camera and the photo library.
 */
const PhotoButton = ({ client }: Props) => {
  const input = useRef<HTMLInputElement>(null);
  const [sending, setSending] = useState(false);

  const send = async (file: File) => {
    setSending(true);
    announce("Sending photo", "polite");
    try {
      announce(await uploadPhoto(client, await prepareJpeg(file)), "assertive");
    } catch (error) {
      announce(`Could not send the photo: ${error instanceof Error ? error.message : String(error)}`, "assertive");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
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
        className="voice-command-button"
        aria-label="Photo"
        aria-busy={sending}
        aria-disabled={sending}
        title="Photo: turn a picture into objects (builders)"
        onClick={() => {
          if (!sending) input.current?.click();
        }}
      >
        <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="22" height="22">
          <path d="M4 8h3l2-3h6l2 3h3v11H4z M12 10.5a3.5 3.5 0 1 0 0 7a3.5 3.5 0 1 0 0-7" />
        </svg>
      </button>
    </>
  );
};

export default PhotoButton;
