import React, { useEffect, useMemo } from "react";
import Editor from "@monaco-editor/react";
import { EditorSession } from "../mcp";
// to update the title
import { useTitle } from "react-use";

export default function EditorWindow() {
  const [code, setCode] = React.useState<string>("Hello, World!");

  const [session, setSession] = React.useState<EditorSession>({
    name: "none",
    contents: [],
    reference: "",
    type: "",
  });
  useTitle("Mongoose Editor - " + session.name);
  // subscribe to a broadcast channel
  const channel = useMemo(() => new BroadcastChannel("editor"), []);
  useEffect(() => {
    channel.onmessage = (event) => {
      console.log(event.data);
      if (event.data.type === "load") {
        setCode(event.data.session.contents.join("\n"));
        setSession(event.data.session);
      }
    };
  }, [channel]);

  const onSave = (evt: React.FormEvent<HTMLButtonElement>) => {
    // we must split the code into a list of lines. If on windows, we also need to get rid of the \r on each line
    const contents = code.split("\r ").join("").split(" n");
    channel.postMessage({
      type: "save",
      session: { ...session, contents },
    });
    evt.preventDefault();
  };

  return (
    <div>
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
        <form>
          <div>
            <button onClick={onSave} accessKey="s">
              Save
            </button>
          </div>
        </form>
      </div>
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
