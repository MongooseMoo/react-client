import { announce } from "@react-aria/live-announcer";
import { useEffect, useRef, useState } from "react";
import type MudClient from "../client";
import { useAppsStore } from "../stores/appsStore";
import { useConnectionStore } from "../stores/connectionStore";

type Props = {
  client: MudClient;
};

/** The Windows command that maps the drive, for the player to copy into a command prompt. */
export function windowsDriveCommand(url: string, user: string, password: string): string {
  const quote = (text: string) => `"${text.replace(/"/g, '\\"')}"`;
  return `net use M: ${url} /user:${quote(user)} ${password} /persistent:yes`;
}

/**
 * The Apps tab, over GMCP Client.Apps: the apps that can act as the player on
 * the web, with Revoke for each; approving an app's code (what @approve does);
 * and Connect a drive, which gets a new password for mounting the MOO's verbs
 * and properties as files over WebDAV.
 */
const AppsPanel = ({ client }: Props) => {
  const apps = useAppsStore((state) => state.apps);
  const result = useAppsStore((state) => state.result);
  const drive = useAppsStore((state) => state.drive);
  const ready = useConnectionStore((state) => state.sessionReady);
  const [code, setCode] = useState("");
  const appsPackage = () => client.gmcp.require("Client.Apps");

  const rootRef = useRef<HTMLDivElement>(null);

  // Ask when the session is ready and again each time the tab is shown: the
  // sidebar keeps a visited panel mounted and only hides it, and an app joins
  // the list when it collects its token, after the approval was answered.
  useEffect(() => {
    if (!ready) return;
    appsPackage().sendList({});
    const panel = rootRef.current?.closest<HTMLElement>('[role="tabpanel"]');
    if (!panel) return;
    const observer = new MutationObserver(() => {
      if (!panel.hidden) appsPackage().sendList({});
    });
    observer.observe(panel, { attributes: true, attributeFilter: ["hidden"] });
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const copy = async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      announce(`${label} copied.`, "assertive");
    } catch {
      announce(`Could not copy the ${label.toLowerCase()}; select it and copy it instead.`, "assertive");
    }
  };

  const field = (label: string, value: string) => (
    <div className="apps-field">
      <label>
        {label}
        <input type="text" readOnly value={value} onFocus={(event) => event.currentTarget.select()} />
      </label>
      <button type="button" onClick={() => copy(label, value)}>
        Copy {label.toLowerCase()}
      </button>
    </div>
  );

  return (
    <div className="apps-panel" ref={rootRef}>
      <h2>Apps</h2>
      {result && <p role="status">{result.message}</p>}

      <section aria-labelledby="apps-list-heading">
        <h3 id="apps-list-heading">Apps that can act as you</h3>
        {apps === null ? (
          <p>Loading…</p>
        ) : apps.length === 0 ? (
          <p>No apps can act as you.</p>
        ) : (
          <ul>
            {apps.map((app) => (
              <li key={app.name}>
                {app.name}, approved {new Date(app.approved * 1000).toLocaleString()}{" "}
                <button type="button" onClick={() => appsPackage().sendRevoke({ name: app.name })}>
                  Revoke {app.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="apps-approve-heading">
        <h3 id="apps-approve-heading">Approve an app</h3>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (code.trim()) appsPackage().sendApprove({ code: code.trim() });
            setCode("");
          }}
        >
          <label>
            Code the app shows
            <input type="text" value={code} autoComplete="off" onChange={(event) => setCode(event.currentTarget.value)} />
          </label>
          <button type="submit">Approve</button>
        </form>
      </section>

      <section aria-labelledby="apps-drive-heading">
        <h3 id="apps-drive-heading">Drive</h3>
        <p>
          Open your objects' verbs and properties as files in Windows, VS Code or any WebDAV client.
          Connecting makes a new password and stops the old drive password. The Windows command
          needs Windows' WebClient service running.
        </p>
        <button type="button" onClick={() => appsPackage().sendDrive({})}>
          Connect a drive
        </button>
        {drive && (
          <div>
            <p>Shown once. Copy the password now.</p>
            {field("Address", drive.url)}
            {field("User name", drive.user)}
            {field("Password", drive.password)}
            {field("Windows command", windowsDriveCommand(drive.url, drive.user, drive.password))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AppsPanel;
