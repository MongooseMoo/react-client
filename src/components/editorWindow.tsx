import React, { useEffect, useMemo, useState } from "react";
import Editor from "@monaco-editor/react";
import { EditorSession } from "../mcp";
import { useTitle } from "react-use";

function EditorWindow() {
  const [code, setCode] = useState<string>("");
  const [session, setSession] = useState<EditorSession>({
    name: "none",
    contents: [],
    reference: "",
    type: "",
  });

  // Update the title
  useTitle("Mongoose Editor - " + session.name);

  // Subscribe to a broadcast channel
  const channel = useMemo(() => new BroadcastChannel("editor"), []);
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      console.log(event.data);
      if (event.data.type === "load") {
        const contents = event.data.session.contents.join("\n");
        setCode(contents);
        setSession(event.data.session);
      }
    }

    channel.addEventListener("message", handleMessage);

    return () => channel.removeEventListener("message", handleMessage);
  }, [channel]);

  // Save the code
  const onSave = (event: React.FormEvent<HTMLButtonElement>) => {
    const contents = code.split(/\r\n|\r|\n/); // Split the code into lines
    const sessionData = { ...session, contents };
    channel.postMessage({ type: "save", session: sessionData });
    event.preventDefault();
  };

  return (
    <>
      <div
        className="toolbar"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 1rem",
          height: "10vh",
          backgroundColor: "#f5f5f5",
          borderBottom: "1px solid #e8e8e8",
        }}
      >
        <form onSubmit={(event) => event.preventDefault()}>
          <button onClick={onSave} accessKey="s">
            Save
          </button>
        </form>
      </div>
      <Editor
        height="90vh"
        defaultLanguage="lambdamoo"
        value={code}
        onChange={(value) => setCode(value || "")}
      />
    </>
  );
}

export default EditorWindow;
