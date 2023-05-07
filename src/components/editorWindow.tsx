import { FaDownload, FaSave, FaUndo } from "react-icons/fa";
import Editor from "@monaco-editor/react";
import React, { useEffect, useMemo, useState } from "react";
import { useBeforeunload } from "react-beforeunload";
import { useLocation } from "react-router-dom";
import { useTitle } from "react-use";
import { EditorSession } from "../mcp";

enum DocumentState {
  Unchanged,
  Changed,
  Saved,
}

function EditorWindow() {
  const location = useLocation();
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
  const onSave = (event: React.FormEvent<HTMLButtonElement>) => {
    const contents = code.split(/\r\n|\r|\n/); // Split the code into lines
    const sessionData = { ...session, contents };
    channel.postMessage({ type: "save", session: sessionData, id, });
    setDocumentState(DocumentState.Saved);
    event.preventDefault();
  };

  const onChanges = (value: string | undefined) => {
    if (!isLoaded) {
      setIsLoaded(true);
      setDocumentState(DocumentState.Unchanged);
      return;
    }
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
            <FaSave />
            Save
          </button>
          <button onClick={revert} accessKey="r">
            <FaUndo />
            Revert
          </button>
          <button onClick={downloadText} accessKey="d">
            <FaDownload />
            Download
          </button>
        </form>
      </div>
      <Editor
        height="80vh"
        defaultLanguage="lambdamoo"
        value={code}
        onChange={onChanges}
        options={{ wordWrap: "on" }}
      />
      <div
        aria-live="polite"
        className="statusbar"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 1rem",
          height: "10vh",
          backgroundColor: "#f5f5f5",
          borderTop: "1px solid #e8e8e8",
        }}
      >
        <span>{docstate}</span>
        <span>|</span>
        <span>{session.reference}</span>
        <span>|</span>
        <span>{session.type}</span>
      </div>
    </>
  );
}

export default EditorWindow;
