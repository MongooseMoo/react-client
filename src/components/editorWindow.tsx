import React, { useEffect } from "react";
import Editor from "@monaco-editor/react";
import { EditorSession } from "../mcp";
// styles from monaco

export default function EditorWindow() {
  const [code, setCode] = React.useState<string>("Hello, World!");
  const [session, setSession] = React.useState<EditorSession>({
    name: "none",
    contents: [],
    reference: "",
    type: "",
  });
  // subscribe to a broadcast channel
  useEffect(() => {
    const channel = new BroadcastChannel("editor");
    channel.onmessage = (event) => {
      console.log(event.data);
      if (event.data.type === "load") {
        setCode(event.data.session.contents.join("\n"));
        setSession(event.data.session);
      }
    };
    return () => channel.close();
  }, []);

  return (
    <div>
      <toolbar
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
        <div>
          <button
            onClick={() => {
              const channel = new BroadcastChannel("editor");
              channel.postMessage({
                type: "save",
                session: { ...session, contents: code.split("\n") },
              });
              channel.close();
            }}
            accessKey="s"
          >
            Save
          </button>
        </div>
      </toolbar>
      <Editor
        height="90vh"
        defaultLanguage="lambdamoo"
        value={code}
        onChange={(value) => {
          if (value) {
            setCode(value);
          }
        }}
      />
    </div>
  );
}
