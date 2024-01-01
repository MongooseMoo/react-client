import Editor from "@monaco-editor/react";
import React, { useEffect, useMemo, useState } from "react";
import { useBeforeunload } from "react-beforeunload";
import { useLocation } from "react-router-dom";
import { useTitle } from "react-use";
import { usePreferences } from "../../hooks/usePreferences";
import { EditorSession } from "../../mcp";
import EditorToolbar from './toolbar';
import { EditorStatusBar } from "./statusbar";

export enum DocumentState {
  Unchanged,
  Changed,
  Saved,
}

function EditorWindow() {
  const location = useLocation();
  const editorInstance = React.useRef<any>(null);
  const [clientId, setClientId] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [originalCode, setOriginalCode] = useState<string>("");
  const [documentState, setDocumentState] = useState<DocumentState>(
    DocumentState.Unchanged
  );
  const [session, setSession] = useState<EditorSession>({
    name: "none",
    contents: [],
    reference: "",
    type: "",
  });

  const handleEditorMount = (editor: any, monaco: any) => {
    editorInstance.current = editor;
  };
  const [prefState, dispatch] = usePreferences();
  console.log(prefState);
  const accessibilityMode = prefState.editor.accessibilityMode;
  const autocompleteEnabled = prefState.editor.autocompleteEnabled


  useBeforeunload((event) => {
    channel.postMessage({ type: "close", id });
    if (documentState === DocumentState.Changed) {
      event.preventDefault();
    }
  });

  // Update the title

  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const title = isLoaded
    ? `${session.name} - Mongoose Editor`
    : "Mongoose Editor";
  useTitle(title);
  const docstate = useMemo(() => {
    switch (documentState) {
      case DocumentState.Unchanged:
        return "Unchanged";
      case DocumentState.Changed:
        return "Changed";
      case DocumentState.Saved:
        return "Saved";
    }
  }, [documentState]);
  const channel = useMemo(() => new BroadcastChannel("editor"), []);
  const params = new URLSearchParams(location.search);
  const id = decodeURIComponent(params.get("reference") || "");

  useEffect(() => {
    if (!id) {
      return;
    }
    console.log("ID: " + id);
    console.log("Sending ready message");
    channel.postMessage({ type: "ready", id });

    const handleMessage = (event: MessageEvent) => {
      console.log(event.data);
      if (event.data.type === "load") {
        if (clientId !== "") {
          return; // We already have a session
        }
        const contents = event.data.session.contents.join("\n");
        setCode(contents);
        setOriginalCode(contents);
        setSession(event.data.session);
        setDocumentState(DocumentState.Unchanged);
        setClientId(event.data.clientId);
        focusEditor();
      } else if (event.data.type === "shutdown") {
        if (event.data.clientId !== clientId) {
          return;
        }
        channel.close();
        window.close();
      }
    };

    channel.addEventListener("message", handleMessage);
    return () => channel.removeEventListener("message", handleMessage);
  }, [channel, clientId, id]);

  const revert = () => {
    setCode(originalCode);
    setDocumentState(DocumentState.Unchanged);
  };

  // Save the code
  const onSave = (event: any
  ) => {
    const contents = code.split(/\r\n|\r|\n/); // Split the code into lines
    const sessionData = { ...session, contents };
    channel.postMessage({ type: "save", session: sessionData, id });
    setDocumentState(DocumentState.Saved);
    focusEditor();
    event.preventDefault();

  };


  const onChanges = (value: string | undefined) => {
    if (value === undefined) {
      return;
    }
    console.log("Original: " + originalCode);
    console.log("New: " + value);
    setCode(value);
    if (value.split(/\r\n|\r|\n/).join("\n") !== originalCode) {
      setDocumentState(DocumentState.Changed);
    } else {
      setDocumentState(DocumentState.Unchanged);
    }

    if (!isLoaded) {
      setIsLoaded(true);
    }
  };

  // Download code to text file
  const downloadText = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const date = new Date();
    const dateString = date.toLocaleDateString().replace(/\//g, "-");
    const timeString = date.toLocaleTimeString().replace(/:/g, "-");
    // file name could use session.name for object.verb or session.reference for obj#.verb
    const filename = `${session.name}-${dateString}-${timeString}.txt`;

    link.download = filename;
    link.href = url;
    link.click();

    URL.revokeObjectURL(url);
    link.remove();
  };

  return (
    <>
      <EditorToolbar
        onSave={onSave}
        onRevert={revert}
        onDownload={downloadText}
      />
      <Editor
        height="80vh"
        defaultLanguage="lambdamoo"
        value={code}
        onChange={onChanges}
        options={{ wordWrap: "on", accessibilitySupport: accessibilityMode ? "on" : "off", quickSuggestions: autocompleteEnabled }}
        onMount={handleEditorMount}

      />
      <EditorStatusBar docstate={docstate} session={session} />
    </>
  );

  function focusEditor() {
    if (editorInstance.current !== null) {
      editorInstance.current.focus();
    }
  }
}

export default EditorWindow;

