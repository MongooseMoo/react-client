import React from "react";
import Editor from "@monaco-editor/react";

interface EditorProps {
  code: any;
  setCode: any;
}

export default function EditorWindow(props: EditorProps) {
  const { code, setCode } = props;

  return (
    <div>
      <Editor
        height="90vh"
        defaultLanguage="lambdamoo"
        defaultValue={code}
        onChange={setCode}
      />
    </div>
  );
}
