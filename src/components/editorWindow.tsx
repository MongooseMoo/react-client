import React, { useEffect } from "react";
import Editor from "@monaco-editor/react";

export default function EditorWindow() {
  const [code, setCode] = React.useState<string>("Hello, World!");
  // subscribe to a broadcast channel
  useEffect(() => {
    const channel = new BroadcastChannel("editor");
    channel.onmessage = (event) => {
      console.log(event.data);
      setCode(event.data);
    };
    return () => channel.close();
  }, []);

  return (
    <div>
      <Editor
        height="90vh"
        defaultLanguage="lambdamoo"
        defaultValue={code}
        onChange={(value) => {
          if (value) {
            setCode(value);
          }
        }}
      />
    </div>
  );
}
