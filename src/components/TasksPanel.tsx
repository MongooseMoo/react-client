import { useEffect, useRef, useState } from "react";
import type MudClient from "../client";
import type { ClientTasksKind, GMCPMessageClientTasksTask } from "../gmcp/Client/Tasks";
import { useConnectionStore } from "../stores/connectionStore";
import { useTasksStore } from "../stores/tasksStore";
import "./TasksPanel.css";

type Props = {
  client: MudClient;
};

/** How often the list is asked for again while the tab is showing, and how often countdowns are redrawn. */
const REFRESH_MS = 10_000;
const REDRAW_MS = 5_000;

/**
 * When a task runs, in the same words as @tasks: "now", "in 12s", "in 4m 12s",
 * "in 3h 5m", "in 2d 4h", "reading input", "running a program" or
 * "suspended until resumed". serverNow is the server's clock in Unix seconds.
 */
export function whenText(start: number, kind: ClientTasksKind, serverNow: number): string {
  if (kind === "exec") return "running a program";
  if (start < 0) return "reading input";
  const d = Math.floor(start - serverNow);
  if (d > 315_360_000) return "suspended until resumed";
  if (d <= 0) return "now";
  if (d < 60) return `in ${d}s`;
  if (d < 3600) return `in ${Math.floor(d / 60)}m ${d % 60}s`;
  if (d < 86_400) return `in ${Math.floor(d / 3600)}h ${Math.floor((d % 3600) / 60)}m`;
  return `in ${Math.floor(d / 86_400)}d ${Math.floor((d % 86_400) / 3600)}h`;
}

const kindText: Record<ClientTasksKind, string> = {
  once: "runs once",
  every: "repeats",
  task: "queued",
  input: "reading input",
  exec: "running a program",
};

const plural = (n: number, word: string) => `${n.toLocaleString()} ${word}${n === 1 ? "" : "s"}`;

/**
 * The Tasks tab, over GMCP Client.Tasks: the player's queued tasks (a
 * wizard's: everyone's) grouped by owner and what they run, as @tasks shows
 * them. A group opens to its tasks; each task has Details (its call stack)
 * and Kill, which asks for a second press before it acts.
 */
const TasksPanel = ({ client }: Props) => {
  const list = useTasksStore((state) => state.list);
  const groups = useTasksStore((state) => state.groups);
  const info = useTasksStore((state) => state.info);
  const result = useTasksStore((state) => state.result);
  const clockOffset = useTasksStore((state) => state.clockOffset);
  const ready = useConnectionStore((state) => state.sessionReady);
  const [open, setOpen] = useState<string[]>([]);
  const [details, setDetails] = useState<number[]>([]);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [, setRedraw] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(open);
  openRef.current = open;

  const tasksPackage = () => client.gmcp.require("Client.Tasks");
  const refresh = () => {
    tasksPackage().sendList({});
    for (const key of openRef.current) tasksPackage().sendGroup({ key });
  };

  // Ask when the session is ready, each time the tab is shown, and every ten
  // seconds while it is showing; the sidebar keeps a visited panel mounted.
  useEffect(() => {
    if (!ready) return;
    refresh();
    const panel = rootRef.current?.closest<HTMLElement>('[role="tabpanel"]');
    const showing = () => !panel?.hidden;
    const observer = new MutationObserver(() => {
      if (showing()) refresh();
    });
    if (panel) observer.observe(panel, { attributes: true, attributeFilter: ["hidden"] });
    const poll = window.setInterval(() => {
      if (showing()) refresh();
    }, REFRESH_MS);
    const redraw = window.setInterval(() => {
      if (showing()) setRedraw((n) => n + 1);
    }, REDRAW_MS);
    return () => {
      observer.disconnect();
      window.clearInterval(poll);
      window.clearInterval(redraw);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const serverNow = Date.now() / 1000 + clockOffset;

  const toggleGroup = (key: string) => {
    if (open.includes(key)) {
      setOpen(open.filter((k) => k !== key));
    } else {
      setOpen([...open, key]);
      tasksPackage().sendGroup({ key });
    }
  };

  const toggleDetails = (id: number) => {
    if (details.includes(id)) {
      setDetails(details.filter((d) => d !== id));
    } else {
      setDetails([...details, id]);
      tasksPackage().sendInfo({ id });
    }
  };

  // Kill acts on the second press of the same button; any other kill button starts over.
  const kill = (token: string, ids: number[]) => {
    if (confirming !== token) {
      setConfirming(token);
      return;
    }
    setConfirming(null);
    tasksPackage().sendKill({ ids });
  };

  const taskLine = (task: GMCPMessageClientTasksTask) => {
    const parts = [task.label + (task.name ? ` (${task.name})` : ""), whenText(task.start, task.kind, serverNow)];
    if (task.kind === "every") parts.push(`every ${task.interval}s`);
    if (task.kind === "task" || task.kind === "input") parts.push(`line ${task.line}`);
    parts.push(task.owner);
    return parts.join(", ");
  };

  return (
    <div className="tasks-panel" ref={rootRef}>
      <h2>Tasks</h2>
      <p>
        {list === null
          ? "Loading…"
          : list.total === 0
            ? "You have no queued tasks."
            : `${plural(list.total, "task")} in ${plural(list.groups.length, "group")}.`}{" "}
        <button type="button" onClick={refresh}>
          Refresh
        </button>
      </p>
      {result && (
        <p role="status" className={result.ok ? undefined : "tasks-result-refused"}>
          {result.message}
        </p>
      )}

      {list && list.groups.length > 0 && (
        <ul className="tasks-groups" aria-label="Task groups">
          {list.groups.map((group) => {
            const expanded = open.includes(group.key);
            const groupId = `tasks-group-${group.key.replace(/[^A-Za-z0-9_-]/g, "_")}`;
            const loaded = groups[group.key];
            const groupToken = `group:${group.key}`;
            return (
              <li key={group.key}>
                <button
                  type="button"
                  className="tasks-group-toggle"
                  aria-expanded={expanded}
                  aria-controls={groupId}
                  onClick={() => toggleGroup(group.key)}
                >
                  <span className="tasks-count">{group.count.toLocaleString()}</span> {group.label}, {group.owner},{" "}
                  {kindText[group.kind]}, next {whenText(group.next, group.kind, serverNow)}
                </button>
                {expanded && (
                  <div id={groupId} className="tasks-group-body">
                    {!loaded ? (
                      <p>Loading…</p>
                    ) : loaded.tasks.length === 0 ? (
                      <p>These tasks have finished.</p>
                    ) : (
                      <>
                        {loaded.tasks.length > 1 && (
                          <button
                            type="button"
                            className="tasks-kill"
                            onClick={() => kill(groupToken, loaded.tasks.map((task) => task.id))}
                          >
                            {confirming === groupToken
                              ? `Confirm: kill all ${loaded.tasks.length.toLocaleString()} tasks`
                              : `Kill all ${loaded.tasks.length.toLocaleString()}`}
                          </button>
                        )}
                        <ul className="tasks-list" aria-label={`Tasks: ${group.label}`}>
                          {loaded.tasks.map((task) => {
                            const taskToken = `task:${task.id}`;
                            const stack = info[task.id];
                            const showing = details.includes(task.id);
                            return (
                              <li key={task.id}>
                                <span className="tasks-task">
                                  Task {task.id}: {taskLine(task)}
                                </span>{" "}
                                <button type="button" aria-expanded={showing} onClick={() => toggleDetails(task.id)}>
                                  Details<span className="sr-only"> of task {task.id}</span>
                                </button>{" "}
                                <button type="button" className="tasks-kill" onClick={() => kill(taskToken, [task.id])}>
                                  {confirming === taskToken ? `Confirm: kill task ${task.id}` : "Kill"}
                                  {confirming !== taskToken && <span className="sr-only"> task {task.id}</span>}
                                </button>
                                {showing && (
                                  <pre className="tasks-stack" aria-label={`Call stack of task ${task.id}`}>
                                    {stack ? stack.join("\n") : "Loading…"}
                                  </pre>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default TasksPanel;
