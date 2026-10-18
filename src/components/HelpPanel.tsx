import type React from "react";
import { useEffect, useRef, useState } from "react";
import { announce } from "@react-aria/live-announcer";
import type MudClient from "../client";
import { describeHelpTopic, helpTitle } from "../gmcp/Help";
import { useFocusRecovery } from "../hooks/useFocusRecovery";
import { useConnectionStore } from "../stores/connectionStore";
import { useHelpStore } from "../stores/helpStore";
import { splitHelpLine } from "./helpLinks";
import "./HelpPanel.css";

/**
 * The Help tab: the server's help over GMCP Help.Get / Help.Topic. Every
 * `help <topic>` phrase in a result, and every choice, looks that topic up.
 */
interface HelpPanelProps {
  client: MudClient;
}

const HEADING_ID = "help-result-heading";

const HelpPanel: React.FC<HelpPanelProps> = ({ client }) => {
  const current = useHelpStore((state) => state.current);
  const canGoBack = useHelpStore((state) => state.history.length > 0);
  const serial = useHelpStore((state) => state.serial);
  const ready = useConnectionStore((state) => state.sessionReady);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const askedForFrontPage = useRef(false);
  useFocusRecovery(rootRef, HEADING_ID);

  const lookUp = (topic: string) => client.gmcp.require("Help").sendGet({ topic });

  useEffect(() => {
    if (!ready || askedForFrontPage.current || useHelpStore.getState().current) return;
    askedForFrontPage.current = true;
    lookUp("");
  });

  const back = () => {
    const previous = useHelpStore.getState().back();
    if (previous) announce(describeHelpTopic(previous), "polite");
  };

  const topicButton = (topic: string, text: string, key: number | string) => (
    <button key={key} type="button" className="help-link" disabled={!ready} onClick={() => lookUp(topic)}>
      {text}
    </button>
  );

  return (
    <div className="help-panel" ref={rootRef}>
      <form
        className="help-lookup"
        onSubmit={(event) => {
          event.preventDefault();
          lookUp(query.trim());
        }}
      >
        <label htmlFor="help-topic">Help topic</label>
        <input id="help-topic" type="text" value={query} onChange={(event) => setQuery(event.currentTarget.value)} />
        <button type="submit" disabled={!ready}>
          Look up
        </button>
      </form>
      <div className="help-nav">
        <button type="button" disabled={!ready} onClick={() => lookUp("")}>
          Front page
        </button>
        <button type="button" disabled={!ready} onClick={() => lookUp("index")}>
          Index
        </button>
        <button type="button" disabled={!canGoBack} onClick={back}>
          Back
        </button>
      </div>
      {!ready && <p>Log in to look up help.</p>}
      {current ? (
        <div key={serial} className="help-result">
          <h4 id={HEADING_ID} tabIndex={-1}>
            {helpTitle(current)}
          </h4>
          {current.status === "shown" && <p>This topic was printed in the game output.</p>}
          {current.lines.length > 0 && (
            <pre className="help-text">
              {current.lines.map((line, lineIndex) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: lines are fixed for this result and may repeat
                <span key={lineIndex}>
                  {splitHelpLine(line, current.choices).map((piece, pieceIndex) =>
                    piece.topic ? topicButton(piece.topic, piece.text, pieceIndex) : piece.text,
                  )}
                  {"\n"}
                </span>
              ))}
            </pre>
          )}
          {current.choices.length > 0 && (
            <ul className="help-choices" aria-label="Matching topics">
              {current.choices.map((choice) => (
                <li key={choice}>{topicButton(choice, choice, choice)}</li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        ready && <p>Loading help…</p>
      )}
    </div>
  );
};

export default HelpPanel;
