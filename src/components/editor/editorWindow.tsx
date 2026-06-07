import Editor from '@monaco-editor/react';
import type { Monaco, OnMount } from '@monaco-editor/react';
import { announce } from '@react-aria/live-announcer';
import type { editor as MonacoEditor } from 'monaco-editor';
import React, { useEffect, useMemo, useState } from 'react';
import { useBeforeunload } from 'react-beforeunload';
import { useLocation } from 'react-router-dom';
import { useTitle } from 'react-use';
import { configureMonacoLoader } from '../../editor/monacoLoader';
import {
  getMooQuickFixes,
  type MooQuickFix,
  type MooQuickFixDiagnostic,
  type MooQuickFixEdit,
} from '../../editor/moocode/codeActions';
import { toMonacoMarkers } from '../../editor/moocode/diagnostics';
import {
  getEditorLanguageForSessionType,
  MOO_LANGUAGE_ID,
  registerMooLanguage,
} from '../../editor/moocode/language';
import { MOO_CODE_ACTION_FIX_ALL_KIND } from '../../editor/moocode/contract';
import { MOO_EDITOR_THEME_NAME } from '../../editor/moocode/theme';
import { toMonacoTreeSitterMarkers } from '../../editor/moocode/treeSitter';
import { usePreferences } from '../../stores/preferencesStore';
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

type MooProblemFilter = 'all' | 'error' | 'warning';

const TREE_SITTER_DIAGNOSTIC_DELAY_MS = 200;
const MONACO_WARNING_MARKER_SEVERITY = 4;
const EDITOR_STATUSBAR_ID = 'editor-statusbar';
const EDITOR_PROBLEMS_ID = 'editor-moo-problems';
const MOO_PROBLEMS_QUICK_FIX_EDIT_SOURCE = 'moo-problems-quick-fix';

function EditorWindow() {
  const location = useLocation();
  const editorInstance = React.useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);
  const monacoInstance = React.useRef<Monaco | null>(null);
  // Set when a document is loaded; consumed exactly once to focus the editor as
  // soon as the editor instance is ready (deterministic, no timer). Focus may be
  // requested before the editor has mounted (load arrives first) or after (editor
  // mounts first); whichever happens second performs the focus.
  const pendingFocusOnReady = React.useRef<boolean>(false);
  const [clientId, setClientId] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [originalCode, setOriginalCode] = useState<string>('');
  const [documentState, setDocumentState] = useState<DocumentState>(DocumentState.Unchanged);
  const [mooDiagnosticCounts, setMooDiagnosticCounts] = useState<MooDiagnosticCounts>({
    errorCount: 0,
    warningCount: 0,
  });
  const [mooDiagnosticMarkers, setMooDiagnosticMarkers] = useState<MonacoEditor.IMarkerData[]>([]);
  const [mooDiagnosticTarget, setMooDiagnosticTarget] = useState<MooDiagnosticTarget | null>(null);
  const [session, setSession] = useState<EditorSession>({
    name: 'none',
    contents: [],
    reference: '',
    type: '',
  });

  // Focus the editor once, when both the editor instance is ready and a document
  // has been loaded. Safe to call from either the load handler or the editor's
  // mount callback; it no-ops unless a focus is pending and the instance exists,
  // and it clears the pending flag so focus fires exactly once.
  const focusEditorOnReady = React.useCallback(() => {
    if (!pendingFocusOnReady.current) {
      return;
    }
    const editor = editorInstance.current;
    if (!editor) {
      return;
    }
    pendingFocusOnReady.current = false;
    editor.focus();
  }, []);

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorInstance.current = editor;
    monacoInstance.current = monaco;
    // If a document already loaded before the editor mounted, focus it now.
    focusEditorOnReady();
  };
  const handleEditorBeforeMount = (monaco: Monaco) => {
    registerMooLanguage(monaco);
  };
  const prefState = usePreferences();
  const accessibilityMode = prefState.editor.accessibilityMode;
  const autocompleteEnabled = prefState.editor.autocompleteEnabled;
  const editorLanguage = getEditorLanguageForSessionType(session.type);
  const updateMooDiagnostics = React.useCallback((markers: MonacoEditor.IMarkerData[]) => {
    setMooDiagnosticMarkers(markers);
    setMooDiagnosticCounts(getMooDiagnosticCounts(markers));
    setMooDiagnosticTarget(getFirstMooDiagnosticTarget(markers));
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
        ? toMonacoMarkers(
            code,
            {
              error: monaco.MarkerSeverity.Error,
              warning: monaco.MarkerSeverity.Warning,
            },
            model.uri,
          )
        : [];

    monaco.editor.setModelMarkers(model, MOO_LANGUAGE_ID, markers);
    updateMooDiagnostics(markers);

    if (editorLanguage !== MOO_LANGUAGE_ID) {
      return;
    }

    let cancelled = false;
    const parserModelVersion = model.getVersionId();
    const parserTimer = window.setTimeout(() => {
      void toMonacoTreeSitterMarkers(code, monaco.MarkerSeverity.Error)
        .then((treeSitterMarkers) => {
          if (
            cancelled ||
            editorInstance.current?.getModel() !== model ||
            model.getVersionId() !== parserModelVersion
          ) {
            return;
          }

          const allMarkers = [...markers, ...treeSitterMarkers];
          monaco.editor.setModelMarkers(model, MOO_LANGUAGE_ID, allMarkers);
          updateMooDiagnostics(allMarkers);
        })
        .catch((error: unknown) => {
          console.warn('MOO Tree-sitter diagnostics failed', error);
        });
    }, TREE_SITTER_DIAGNOSTIC_DELAY_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(parserTimer);
    };
  }, [code, editorLanguage, updateMooDiagnostics]);

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
  const mooDiagnosticProblems = useMemo(
    () =>
      editorLanguage === MOO_LANGUAGE_ID
        ? [...mooDiagnosticMarkers].sort(compareMooDiagnosticMarkers)
        : [],
    [editorLanguage, mooDiagnosticMarkers],
  );
  const mooQuickFixes = useMemo(
    () =>
      editorLanguage === MOO_LANGUAGE_ID
        ? getMooQuickFixes(code, getMooParserQuickFixDiagnostics(mooDiagnosticMarkers))
        : [],
    [code, editorLanguage, mooDiagnosticMarkers],
  );
  const editorAriaLabel = formatEditorAriaLabel(session.reference, editorLanguage);
  const editorDescribedBy =
    mooDiagnosticProblems.length > 0
      ? `${EDITOR_STATUSBAR_ID} ${EDITOR_PROBLEMS_ID}`
      : EDITOR_STATUSBAR_ID;
  const editorOptions = useMemo(
    () =>
      createEditorOptions({
        accessibilityMode,
        autocompleteEnabled,
        ariaLabel: editorAriaLabel,
        language: editorLanguage,
      }),
    [accessibilityMode, autocompleteEnabled, editorAriaLabel, editorLanguage],
  );
  const showFirstMooDiagnostic = React.useCallback(() => {
    if (!mooDiagnosticTarget) {
      return;
    }

    editorInstance.current?.setPosition(mooDiagnosticTarget);
    editorInstance.current?.revealPositionInCenter(mooDiagnosticTarget);
    editorInstance.current?.focus();
  }, [mooDiagnosticTarget]);
  const showMooDiagnostic = React.useCallback((marker: MonacoEditor.IMarkerData) => {
    const target = getMooDiagnosticTarget(marker);

    editorInstance.current?.setPosition(target);
    editorInstance.current?.revealPositionInCenter(target);
    editorInstance.current?.focus();
  }, []);
  const applyMooQuickFix = React.useCallback(
    (quickFix: MooQuickFix) => {
      const updatedCode = applyMooQuickFixEdits(code, quickFix);

      editorInstance.current?.pushUndoStop();
      editorInstance.current?.executeEdits(
        MOO_PROBLEMS_QUICK_FIX_EDIT_SOURCE,
        getMooQuickFixEditOperations(quickFix),
      );
      editorInstance.current?.pushUndoStop();
      setCode(updatedCode);
      setDocumentState(getDocumentStateForCode(updatedCode, originalCode));
      setIsLoaded(true);
      announce(formatMooQuickFixAnnouncement(quickFix), 'polite', 2000);
      editorInstance.current?.focus();
    },
    [code, originalCode],
  );
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
          // Focus the code editor on open, deterministically and exactly once.
          // If the editor instance is already mounted, this focuses now; if the
          // editor mounts later, handleEditorMount performs the focus. No timer.
          pendingFocusOnReady.current = true;
          focusEditorOnReady();
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
  }, [channel, clientId, id, documentState, focusEditorOnReady]);

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
    event.preventDefault();
  };

  const onChanges = (value: string | undefined) => {
    if (value === undefined) {
      return;
    }
    setCode(value);
    setDocumentState(getDocumentStateForCode(value, originalCode));

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
        theme={MOO_EDITOR_THEME_NAME}
        value={code}
        onChange={onChanges}
        options={editorOptions}
        wrapperProps={{
          'aria-describedby': editorDescribedBy,
        }}
        beforeMount={handleEditorBeforeMount}
        onMount={handleEditorMount}
        path={session.reference}
      />
      {editorLanguage === MOO_LANGUAGE_ID ? (
        <MooProblemsPanel
          id={EDITOR_PROBLEMS_ID}
          markers={mooDiagnosticProblems}
          onProblemClick={showMooDiagnostic}
          onQuickFixClick={applyMooQuickFix}
          quickFixes={mooQuickFixes}
        />
      ) : null}
      <EditorStatusBar
        id={EDITOR_STATUSBAR_ID}
        onDiagnosticsClick={mooDiagnosticTarget ? showFirstMooDiagnostic : undefined}
        diagnosticsSummary={mooDiagnosticsSummary}
        docstate={docstate}
        session={session}
      />
    </div>
  );
}

type MooProblemsPanelProps = {
  id: string;
  markers: MonacoEditor.IMarkerData[];
  onProblemClick: (marker: MonacoEditor.IMarkerData) => void;
  onQuickFixClick: (quickFix: MooQuickFix) => void;
  quickFixes: MooQuickFix[];
};

function MooProblemsPanel({
  id,
  markers,
  onProblemClick,
  onQuickFixClick,
  quickFixes,
}: MooProblemsPanelProps) {
  const [filter, setFilter] = useState<MooProblemFilter>('all');

  const counts = getMooDiagnosticCounts(markers);
  const visibleMarkers = markers.filter((marker) => mooProblemFilterIncludesMarker(filter, marker));
  const fixAllQuickFixes = quickFixes.filter(isMooFixAllQuickFix);

  return (
    <section aria-label="MOO problems" className="editor-problems" id={id}>
      {markers.length === 0 ? (
        <p className="editor-problems-empty">{formatEmptyMooProblemsFilterMessage('all')}</p>
      ) : (
        <>
          <div aria-label="MOO problem filters" className="editor-problems-filters" role="toolbar">
            {mooProblemFilterOptions(markers.length, counts).map((option) => (
              <button
                aria-label={option.ariaLabel}
                aria-pressed={filter === option.filter}
                className="editor-problems-filter"
                key={option.filter}
                onClick={() => setFilter(option.filter)}
                type="button"
              >
                {option.label}
              </button>
            ))}
            {fixAllQuickFixes.map((quickFix) => (
              <button
                aria-label={`Apply MOO fix all: ${quickFix.title}`}
                className="editor-problems-fix-all-button"
                key={quickFix.title}
                onClick={() => onQuickFixClick(quickFix)}
                type="button"
              >
                Fix all
              </button>
            ))}
          </div>
          {visibleMarkers.length > 0 ? (
            <ol className="editor-problems-list">
              {visibleMarkers.map((marker, index) => {
                const severity = formatMooProblemSeverity(marker);
                const code = formatMooProblemCode(marker);
                const target = getMooDiagnosticTarget(marker);
                const label = `MOO ${severity.toLowerCase()} ${code} on line ${
                  target.lineNumber
                }, column ${target.column}: ${marker.message}`;
                const quickFix = findMooQuickFixForMarker(quickFixes, marker);

                return (
                  <li className="editor-problem" key={formatMooProblemKey(marker, index)}>
                    <div className="editor-problem-row">
                      <button
                        aria-label={label}
                        className="editor-problem-button"
                        onClick={() => onProblemClick(marker)}
                        type="button"
                      >
                        <span
                          className={`editor-problem-severity editor-problem-severity-${severity.toLowerCase()}`}
                        >
                          {severity}
                        </span>{' '}
                        <span className="editor-problem-code">{code}</span>{' '}
                        <span className="editor-problem-location">
                          Ln {target.lineNumber}, Col {target.column}
                        </span>{' '}
                        <span className="editor-problem-message">{marker.message}</span>
                      </button>
                      {quickFix ? (
                        <button
                          aria-label={`Apply quick fix: ${quickFix.title}`}
                          className="editor-problem-fix-button"
                          onClick={() => onQuickFixClick(quickFix)}
                          type="button"
                        >
                          Fix
                        </button>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="editor-problems-empty">{formatEmptyMooProblemsFilterMessage(filter)}</p>
          )}
        </>
      )}
    </section>
  );
}

type EditorOptionInputs = {
  accessibilityMode: boolean;
  autocompleteEnabled: boolean;
  ariaLabel: string;
  language: string;
};

function createEditorOptions({
  accessibilityMode,
  autocompleteEnabled,
  ariaLabel,
  language,
}: EditorOptionInputs): MonacoEditor.IStandaloneEditorConstructionOptions {
  const baseOptions: MonacoEditor.IStandaloneEditorConstructionOptions = {
    wordWrap: 'on',
    ariaLabel,
    // Never pass Monaco 'off': in this standalone build that blanks the
    // screen-reader textarea and overrides ariaLabel with an error string.
    // 'auto' is the safe floor; 'on' forces full screen-reader optimization.
    accessibilitySupport: accessibilityMode ? 'on' : 'auto',
    // Monaco's SR-optimized default; pages a full MOO verb (~hundreds of lines)
    // into the hidden screen-reader element instead of the ~10-line default window.
    // Set unconditionally: at 500 there is no perf cost beyond Monaco's own SR
    // default, and it does not depend on runtime SR detection.
    accessibilityPageSize: 500,
    quickSuggestions: autocompleteEnabled,
  };

  if (language !== MOO_LANGUAGE_ID) {
    return baseOptions;
  }

  return {
    ...baseOptions,
    'semanticHighlighting.enabled': true,
    acceptSuggestionOnCommitCharacter: autocompleteEnabled,
    codeLens: true,
    folding: true,
    foldingStrategy: 'auto',
    hover: {
      enabled: true,
    },
    inlayHints: {
      enabled: 'on',
      padding: true,
    },
    inlineSuggest: {
      enabled: autocompleteEnabled,
      syntaxHighlightingEnabled: true,
    },
    lightbulb: {
      enabled: 'onCode' as MonacoEditor.ShowLightbulbIconMode,
    },
    links: true,
    occurrencesHighlight: 'singleFile',
    screenReaderAnnounceInlineSuggestion: true,
    showFoldingControls: 'always',
    stickyScroll: {
      enabled: true,
      defaultModel: 'foldingProviderModel',
    },
    suggestOnTriggerCharacters: autocompleteEnabled,
  };
}

function formatEditorAriaLabel(sessionReference: string, language: string): string {
  const target = sessionReference || 'current session';

  return language === MOO_LANGUAGE_ID
    ? `MOO code editor for ${target}`
    : `Text editor for ${target}`;
}

function getDocumentStateForCode(value: string, originalCode: string): DocumentState {
  return normalizeEditorCode(value) === originalCode
    ? DocumentState.Unchanged
    : DocumentState.Changed;
}

function normalizeEditorCode(value: string): string {
  return value.split(/\r\n|\r|\n/).join('\n');
}

function getMooParserQuickFixDiagnostics(
  markers: MonacoEditor.IMarkerData[],
): MooQuickFixDiagnostic[] {
  return markers
    .filter((marker) => formatMooProblemCode(marker) === 'missing-node')
    .map((marker) => {
      const markerWithMissingText = marker as MonacoEditor.IMarkerData & {
        missingText?: string;
      };

      return {
        code: 'missing-node',
        lineNumber: marker.startLineNumber,
        startColumn: marker.startColumn,
        endColumn: marker.endColumn,
        message: marker.message,
        missingText: markerWithMissingText.missingText,
      };
    });
}

function findMooQuickFixForMarker(
  quickFixes: MooQuickFix[],
  marker: MonacoEditor.IMarkerData,
): MooQuickFix | null {
  const markerCode = formatMooProblemCode(marker);

  return (
    quickFixes.find((quickFix) =>
      quickFix.diagnostics.some((diagnostic) =>
        mooQuickFixDiagnosticMatchesMarker(diagnostic, marker, markerCode),
      ),
    ) ?? null
  );
}

function isMooFixAllQuickFix(quickFix: MooQuickFix): boolean {
  return quickFix.kind === MOO_CODE_ACTION_FIX_ALL_KIND;
}

function formatMooQuickFixAnnouncement(quickFix: MooQuickFix): string {
  return `Applied MOO ${isMooFixAllQuickFix(quickFix) ? 'fix all' : 'quick fix'}: ${
    quickFix.title
  }.`;
}

function mooQuickFixDiagnosticMatchesMarker(
  diagnostic: MooQuickFixDiagnostic,
  marker: MonacoEditor.IMarkerData,
  markerCode: string,
): boolean {
  return (
    diagnostic.code === markerCode &&
    diagnostic.lineNumber === marker.startLineNumber &&
    diagnostic.startColumn === marker.startColumn &&
    diagnostic.endColumn === marker.endColumn
  );
}

function applyMooQuickFixEdits(source: string, quickFix: MooQuickFix): string {
  return applyMooTextEdits(source, quickFix.edits ?? [quickFix.edit]);
}

function getMooQuickFixEditOperations(
  quickFix: MooQuickFix,
): MonacoEditor.IIdentifiedSingleEditOperation[] {
  return (quickFix.edits ?? [quickFix.edit]).map((edit) => ({
    forceMoveMarkers: true,
    range: edit.range,
    text: edit.text,
  }));
}

function applyMooTextEdits(source: string, edits: readonly MooQuickFixEdit[]): string {
  return [...edits]
    .map((edit) => ({
      ...edit,
      startOffset: offsetAtEditorPosition(
        source,
        edit.range.startLineNumber,
        edit.range.startColumn,
      ),
      endOffset: offsetAtEditorPosition(source, edit.range.endLineNumber, edit.range.endColumn),
    }))
    .sort((left, right) => right.startOffset - left.startOffset)
    .reduce(
      (updated, edit) =>
        `${updated.slice(0, edit.startOffset)}${edit.text}${updated.slice(edit.endOffset)}`,
      source,
    );
}

function offsetAtEditorPosition(source: string, lineNumber: number, column: number): number {
  const lineStarts = getEditorLineStartOffsets(source);
  const lineStart = lineStarts[lineNumber - 1] ?? source.length;

  return Math.min(source.length, lineStart + Math.max(0, column - 1));
}

function getEditorLineStartOffsets(source: string): number[] {
  const offsets = [0];

  for (let index = 0; index < source.length; index += 1) {
    if (source[index] === '\n') {
      offsets.push(index + 1);
    }
  }

  return offsets;
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

  return getMooDiagnosticTarget(firstMarker);
}

function getMooDiagnosticTarget(marker: MonacoEditor.IMarkerData): MooDiagnosticTarget {
  return {
    lineNumber: marker.startLineNumber,
    column: marker.startColumn,
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

function mooProblemFilterOptions(totalCount: number, counts: MooDiagnosticCounts) {
  return [
    {
      filter: 'all' as const,
      label: `All (${totalCount})`,
      ariaLabel: `Show all MOO problems (${totalCount})`,
    },
    {
      filter: 'error' as const,
      label: `Errors (${counts.errorCount})`,
      ariaLabel: `Show MOO errors (${counts.errorCount})`,
    },
    {
      filter: 'warning' as const,
      label: `Warnings (${counts.warningCount})`,
      ariaLabel: `Show MOO warnings (${counts.warningCount})`,
    },
  ];
}

function mooProblemFilterIncludesMarker(
  filter: MooProblemFilter,
  marker: MonacoEditor.IMarkerData,
): boolean {
  switch (filter) {
    case 'all':
      return true;
    case 'error':
      return marker.severity !== MONACO_WARNING_MARKER_SEVERITY;
    case 'warning':
      return marker.severity === MONACO_WARNING_MARKER_SEVERITY;
  }
}

function formatEmptyMooProblemsFilterMessage(filter: MooProblemFilter): string {
  switch (filter) {
    case 'all':
      return 'No MOO problems.';
    case 'error':
      return 'No MOO errors.';
    case 'warning':
      return 'No MOO warnings.';
  }
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

function formatMooProblemSeverity(marker: MonacoEditor.IMarkerData): 'Error' | 'Warning' {
  return marker.severity === MONACO_WARNING_MARKER_SEVERITY ? 'Warning' : 'Error';
}

function formatMooProblemCode(marker: MonacoEditor.IMarkerData): string {
  if (typeof marker.code === 'string' && marker.code.length > 0) {
    return marker.code;
  }

  if (
    marker.code &&
    typeof marker.code === 'object' &&
    'value' in marker.code &&
    typeof marker.code.value === 'string' &&
    marker.code.value.length > 0
  ) {
    return marker.code.value;
  }

  return marker.source || 'diagnostic';
}

function formatMooProblemKey(marker: MonacoEditor.IMarkerData, index: number): string {
  return [
    marker.startLineNumber,
    marker.startColumn,
    marker.endLineNumber,
    marker.endColumn,
    marker.severity,
    formatMooProblemCode(marker),
    marker.message,
    index,
  ].join(':');
}

function pluralize(count: number, singular: string): string {
  return count === 1 ? singular : `${singular}s`;
}

export default EditorWindow;
