import React, { useRef, useState } from "react";
import type MudClient from "../../client";
import { uploadSounds } from "../../soundUpload";

interface SoundUploadProps {
  client: MudClient;
}

/**
 * Upload sounds to Mongoose: unlike the rest of this tab, which sends a file
 * straight to another player, this puts sound files into the player's sounds
 * folder on the server. The game adds each to the sound library and tells the
 * player where it is. For now only wizards may upload sounds; the server says so.
 */
const SoundUpload: React.FC<SoundUploadProps> = ({ client }) => {
  const inputId = React.useId();
  const input = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");

  const choose = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(event.target.files ? Array.from(event.target.files) : []);
    setStatus("");
  };

  const send = async () => {
    setSending(true);
    try {
      const message = await uploadSounds(client, files, (index, count) =>
        setStatus(count > 1 ? `Sending sound ${index} of ${count}…` : "Sending the sound…"),
      );
      setStatus(message);
      // Clear the choice only when everything went; after a refusal the player may try again.
      if (/^Sounds? sent\./.test(message)) {
        setFiles([]);
        if (input.current) input.current.value = "";
      }
    } catch (error) {
      setStatus(`Could not send the sound: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="sound-upload" aria-labelledby={`${inputId}-heading`}>
      <h4 id={`${inputId}-heading`}>Upload sounds to Mongoose</h4>
      <label htmlFor={inputId}>Sound files</label>
      <input
        ref={input}
        id={inputId}
        type="file"
        multiple
        accept="audio/*,.m4a,.mp3,.ogg,.oga,.opus,.wav,.flac,.aac,.aif,.aiff,.webm"
        onChange={choose}
        disabled={sending}
      />
      <button type="button" onClick={() => void send()} disabled={sending || files.length === 0}>
        Upload
      </button>
      {/* Present before it has anything to say, so that what it says is announced. */}
      <p role="status">{status}</p>
    </section>
  );
};

export default SoundUpload;
