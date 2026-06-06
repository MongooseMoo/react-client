import Editor from '@monaco-editor/react';
import type { Monaco, OnMount } from '@monaco-editor/react';
import type { editor as MonacoEditor } from 'monaco-editor';
import React, { useEffect, useMemo, useState } from 'react';
import { useBeforeunload } from 'react-beforeunload';
import { useLocation } from 'react-router-dom';
import { useTitle } from 'react-use';
import { configureMonacoLoader } from '../../editor/monacoLoader';
import { toMonacoMarkers } from '../../editor/moocode/diagnostics';
import {
  getEditorLanguageForSessionType,
  MOO_LANGUAGE_ID,
  registerMooLanguage,
} from '../../editor/moocode/language';
import { toMonacoTreeSitterMarkers } from '../../editor/moocode/treeSitter';
import { usePreferences } from '../../hooks/usePreferences';
import type { EditorSession } from '../../mcp';
import EditorToolbar from './toolbar';
import { EditorStatusBar } from './statusbar';
import './editor.css'; // Import the new CSS file

configureMonacoLoader();

export enum DocumentState {
  Unchanged,
  Changed,
  Saved,
}

type MooDiagnosticTarget = {
  lineNumber: number;
  column: number;
};

type MooDiagnosticCounts = {
  errorCount: number;
  warningCount: number;
};

const TREE_SITTER_DIAGNOSTIC_DELAY_MS = 200;
const MONACO_WARNING_MARKER_SEVERITY = 4;

function EditorWindow() {
  const location = useLocation();
  const editorInstance = React.useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);
  const monacoInstance = React.useRef<Monaco | null>(null);
  const [clientId, setClientId] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [originalCode, setOriginalCode] = useState<string>('');
  const [documentState, setDocumentState] = useState<DocumentState>(DocumentState.Unchanged);
  const [mooDiagnosticCounts, setMooDiagnosticCounts] = useState<MooDiagnosticCounts>({
    errorCount: 0,
    warningCount: 0,
  });
  const [mooDiagnosticTarget, setMooDiagnosticTarget] = useState<MooDiagnosticTarget | null>(null);
  const [session, setSession] = useState<EditorSession>({
    name: 'none',
    contents: [],
    reference: '',
    type: '',
  });

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorInstance.current = editor;
    monacoInstance.current = monaco;
  };
  const handleEditorBeforeMount = (monaco: Monaco) => {
    registerMooLanguage(monaco);
  };
  const [prefState] = usePreferences();
  const accessibilityMode = prefState.editor.accessibilityMode;
  const autocompleteEnabled = prefState.editor.autocompleteEnabled;
  const editorLanguage = getEditorLanguageForSessionType(session.type);
  const focusEditor = React.useCallback(() => {
    editorInstance.current?.focus();
  }, []);

  useEffect(() => {
    const editor = editorInstance.current;
    const monaco = monacoInstance.current;
    const model = editor?.getModel();

    if (!monaco || !model) {
      return;
    }

    const markers =
      editorLanguage === MOO_LANGUAGE_ID
        ? toMonacoMarkers(code, {
            error: monaco.MarkerSeverity.Error,
            warning: monaco.MarkerSeverity.Warning,
          }, model.uri)
        : [];

    monaco.editor.setModelMarkers(model, MOO_LANGUAGE_ID, markers);
    setMooDiagnosticCounts(getMooDiagnosticCounts(markers));
    setMooDiagnosticTarget(getFirstMooDiagnosticTarget(markers));

    if (editorLanguage !== MOO_LANGUAGE_ID) {
      return;
    }

    let cancelled = false;
    const parserTimer = window.setTimeout(() => {
      void toMonacoTreeSitterMarkers(code, monaco.MarkerSeverity.Error)
        .then((treeSitterMarkers) => {
          if (cancelled || editorInstance.current?.getModel() !== model) {
            return;
          }

          const allMarkers = [...markers, ...treeSitterMarkers];
          monaco.editor.setModelMarkers(model, MOO_LANGUAGE_ID, allMarkers);
          setMooDiagnosticCounts(getMooDiagnosticCounts(allMarkers));
          setMooDiagnosticTarget(getFirstMooDiagnosticTarget(allMarkers));
        })
        .catch((error: unknown) => {
          console.warn('MOO Tree-sitter diagnostics failed', error);
        });
    }, TREE_SITTER_DIAGNOSTIC_DELAY_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(parserTimer);
    };
  }, [code, editorLanguage]);

  useBeforeunload((event) => {
    channel.postMessage({ type: 'close', id });
    if (documentState === DocumentState.Changed) {
      event.preventDefault();
    }
  });

  // Update the title

  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const title = isLoaded ? `${session.name} - Mongoose Editor` : 'Mongoose Editor';
  useTitle(title);
  const docstate = useMemo(() => {
    switch (documentState) {
      case DocumentState.Unchanged:
        return 'Unchanged';
      case DocumentState.Changed:
        return 'Changed';
      case DocumentState.Saved:
        return 'Saved';
    }
  }, [documentState]);
  const mooDiagnosticsSummary =
    editorLanguage === MOO_LANGUAGE_ID
      ? formatMooDiagnosticsSummary(mooDiagnosticCounts)
      : undefined;
  const showFirstMooDiagnostic = React.useCallback(() => {
    if (!mooDiagnosticTarget) {
      return;
    }

    editorInstance.current?.setPosition(mooDiagnosticTarget);
    editorInstance.current?.revealPositionInCenter(mooDiagnosticTarget);
    editorInstance.current?.focus();
  }, [mooDiagnosticTarget]);
  const channel = useMemo(() => new BroadcastChannel('editor'), []);
  const params = new URLSearchParams(location.search);
  const id = decodeURIComponent(params.get('reference') || '');

  useEffect(() => {
    if (!id) {
      return;
    }
    channel.postMessage({ type: 'ready', id });

    const handleMessage = (event: MessageEvent) => {
      switch (event.data.type) {
        case 'load': {
          if (clientId !== '') {
            return; // We already have a session
          }
          const contents = event.data.session.contents.join('\n');
          setCode(contents);
          setOriginalCode(contents);
          setSession(event.data.session);
          setDocumentState(DocumentState.Unchanged);
          setClientId(event.data.clientId);
          setIsLoaded(true); // Add this line to set isLoaded to true when content is loaded
          setTimeout(focusEditor, 100);
          break;
        }
        case 'shutdown':
          if (documentState === DocumentState.Changed) {
            const shouldClose = window.confirm(
              'You have unsaved changes. Are you sure you want to close this editor?',
            );
            if (!shouldClose) {
              return;
            }
          }
          channel.close();
          window.close();
          break;
        default:
          console.warn('Unknown message type received', event.data.type);
      }
    };

    channel.addEventListener('message', handleMessage);
    return () => {
      channel.removeEventListener('message', handleMessage);
      channel.postMessage({ type: 'close', id });
    };
  }, [channel, clientId, id, documentState, focusEditor]);

  const revert = () => {
    setCode(originalCode);
    setDocumentState(DocumentState.Unchanged);
  };

  // Save the code
  const onSave = (event: React.MouseEvent<HTMLButtonElement>) => {
    const contents = code.split(/\r\n|\r|\n/); // Split the code into lines
    const sessionData = { ...session, contents };
    channel.postMessage({ type: 'save', session: sessionData, id });
    setDocumentState(DocumentState.Saved);
    focusEditor();
    event.preventDefault();
  };

  const onChanges = (value: string | undefined) => {
    if (value === undefined) {
      return;
    }
    setCode(value);
    if (value.split(/\r\n|\r|\n/).join('\n') !== originalCode) {
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
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const date = new Date();
    const dateString = date.toLocaleDateString().replace(/\//g, '-');
    const timeString = date.toLocaleTimeString().replace(/:/g, '-');
    // file name could use session.name for object.verb or session.reference for obj#.verb
    const filename = `${session.name}-${dateString}-${timeString}.txt`;

    link.download = filename;
    link.href = url;
    link.click();

    URL.revokeObjectURL(url);
    link.remove();
  };

  return (
    // Use the ID for CSS targeting
    <div id="editor-window">
      <EditorToolbar onSave={onSave} onRevert={revert} onDownload={downloadText} />
      <Editor
        height="80vh"
        defaultLanguage={editorLanguage}
        language={editorLanguage}
        value={code}
        onChange={onChanges}
        options={{
          wordWrap: 'on',
          accessibilitySupport: accessibilityMode ? 'on' : 'off',
          quickSuggestions: autocompleteEnabled,
        }}
        beforeMount={handleEditorBeforeMount}
        onMount={handleEditorMount}
        path={session.reference}
      />
      <EditorStatusBar
        onDiagnosticsClick={mooDiagnosticTarget ? showFirstMooDiagnostic : undefined}
        diagnosticsSummary={mooDiagnosticsSummary}
        docstate={docstate}
        session={session}
      />
    </div>
  );
}

function formatMooDiagnosticsSummary(counts: MooDiagnosticCounts): string | undefined {
  const parts: string[] = [];

  if (counts.errorCount > 0) {
    parts.push(`${counts.errorCount} MOO ${pluralize(counts.errorCount, 'error')}`);
  }

  if (counts.warningCount > 0) {
    const warningKind = pluralize(counts.warningCount, 'warning');
    const warningLabel = `${counts.warningCount} ${warningKind}`;
    parts.push(counts.errorCount > 0 ? warningLabel : `${counts.warningCount} MOO ${warningKind}`);
  }

  return parts.length > 0 ? parts.join(', ') : undefined;
}

function getFirstMooDiagnosticTarget(
  markers: MonacoEditor.IMarkerData[],
): MooDiagnosticTarget | null {
  const firstMarker = [...markers].sort(compareMooDiagnosticMarkers)[0];
  if (!firstMarker) {
    return null;
  }

  return {
    lineNumber: firstMarker.startLineNumber,
    column: firstMarker.startColumn,
  };
}

function getMooDiagnosticCounts(markers: MonacoEditor.IMarkerData[]): MooDiagnosticCounts {
  return markers.reduce<MooDiagnosticCounts>(
    (counts, marker) => {
      if (marker.severity === MONACO_WARNING_MARKER_SEVERITY) {
        counts.warningCount += 1;
      } else {
        counts.errorCount += 1;
      }

      return counts;
    },
    { errorCount: 0, warningCount: 0 },
  );
}

function compareMooDiagnosticMarkers(
  left: MonacoEditor.IMarkerData,
  right: MonacoEditor.IMarkerData,
): number {
  const severityDifference = getMooDiagnosticPriority(right) - getMooDiagnosticPriority(left);
  if (severityDifference !== 0) {
    return severityDifference;
  }

  const lineDifference = left.startLineNumber - right.startLineNumber;
  if (lineDifference !== 0) {
    return lineDifference;
  }

  return left.startColumn - right.startColumn;
}

function getMooDiagnosticPriority(marker: MonacoEditor.IMarkerData): number {
  return marker.severity === MONACO_WARNING_MARKER_SEVERITY ? 1 : 2;
}

function pluralize(count: number, singular: string): string {
  return count === 1 ? singular : `${singular}s`;
}

export default EditorWindow;
