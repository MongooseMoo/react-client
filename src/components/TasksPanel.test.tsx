import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const announce = vi.hoisted(() => vi.fn());
vi.mock("@react-aria/live-announcer", () => ({ announce }));

import type MudClient from "../client";
import { useConnectionStore } from "../stores/connectionStore";
import { useTasksStore } from "../stores/tasksStore";
import TasksPanel, { whenText } from "./TasksPanel";

const NOW = 1_800_000_000;

const list = {
  now: NOW,
  total: 36,
  groups: [
    { key: "#2 every dispatch_event", label: "dispatch_event on 35 objects", owner: "daiverd", kind: "every" as const, count: 35, next: NOW + 3 },
    { key: "#249 every cycle", label: "#4143:cycle", owner: "q", kind: "every" as const, count: 1, next: NOW },
  ],
};

const group = {
  key: "#2 every dispatch_event",
  now: NOW,
  tasks: [
    { id: 101, start: NOW + 3, owner: "daiverd", kind: "every" as const, label: "#24130:dispatch_event", name: "a rat", line: 9, interval: 21 },
    { id: 102, start: NOW + 75, owner: "daiverd", kind: "every" as const, label: "#24074:dispatch_event", name: "", line: 9, interval: 25 },
  ],
};

describe("whenText", () => {
  it("words a start time as @tasks does", () => {
    expect(whenText(-1, "input", NOW)).toBe("reading input");
    expect(whenText(-1, "exec", NOW)).toBe("running a program");
    expect(whenText(NOW - 2, "task", NOW)).toBe("now");
    expect(whenText(NOW + 12, "once", NOW)).toBe("in 12s");
    expect(whenText(NOW + 252, "once", NOW)).toBe("in 4m 12s");
    expect(whenText(NOW + 3 * 3600 + 300, "once", NOW)).toBe("in 3h 5m");
    expect(whenText(NOW + 2 * 86_400 + 4 * 3600, "once", NOW)).toBe("in 2d 4h");
    expect(whenText(NOW + 400_000_000, "task", NOW)).toBe("suspended until resumed");
  });
});

describe("TasksPanel", () => {
  let tasks: { sendList: ReturnType<typeof vi.fn>; sendGroup: ReturnType<typeof vi.fn>; sendInfo: ReturnType<typeof vi.fn>; sendKill: ReturnType<typeof vi.fn> };
  let client: MudClient;

  beforeEach(() => {
    vi.spyOn(Date, "now").mockReturnValue(NOW * 1000);
    announce.mockClear();
    useTasksStore.getState().reset();
    useConnectionStore.getState().reset();
    useConnectionStore.getState().setSessionReady(true);
    tasks = { sendList: vi.fn(), sendGroup: vi.fn(), sendInfo: vi.fn(), sendKill: vi.fn() };
    client = {
      gmcp: { require: (name: string) => (name === "Client.Tasks" ? tasks : undefined) },
    } as unknown as MudClient;
  });

  it("asks for the list and shows each group with its count, owner and next run", () => {
    render(<TasksPanel client={client} />);
    expect(tasks.sendList).toHaveBeenCalledWith({});
    expect(screen.getByText(/Loading/)).toBeInTheDocument();
    act(() => useTasksStore.getState().setList(list));
    expect(screen.getByText("36 tasks in 2 groups.", { exact: false })).toBeInTheDocument();
    const toggle = screen.getByRole("button", { name: /dispatch_event on 35 objects, daiverd, repeats, next in 3s/ });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("opens a group, asks for its tasks and lists them", () => {
    render(<TasksPanel client={client} />);
    act(() => useTasksStore.getState().setList(list));
    const toggle = screen.getByRole("button", { name: /dispatch_event on 35 objects/ });
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(tasks.sendGroup).toHaveBeenCalledWith({ key: "#2 every dispatch_event" });
    act(() => useTasksStore.getState().setGroup(group));
    expect(screen.getByText("Task 101: #24130:dispatch_event (a rat), in 3s, every 21s, daiverd")).toBeInTheDocument();
    expect(screen.getByText("Task 102: #24074:dispatch_event, in 1m 15s, every 25s, daiverd")).toBeInTheDocument();
  });

  it("kills a task only on the second press", () => {
    render(<TasksPanel client={client} />);
    act(() => useTasksStore.getState().setList(list));
    fireEvent.click(screen.getByRole("button", { name: /dispatch_event on 35 objects/ }));
    act(() => useTasksStore.getState().setGroup(group));
    fireEvent.click(screen.getByRole("button", { name: "Kill task 101" }));
    expect(tasks.sendKill).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Confirm: kill task 101" }));
    expect(tasks.sendKill).toHaveBeenCalledWith({ ids: [101] });
  });

  it("kills a whole group after confirming", () => {
    render(<TasksPanel client={client} />);
    act(() => useTasksStore.getState().setList(list));
    fireEvent.click(screen.getByRole("button", { name: /dispatch_event on 35 objects/ }));
    act(() => useTasksStore.getState().setGroup(group));
    fireEvent.click(screen.getByRole("button", { name: "Kill all 2" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm: kill all 2 tasks" }));
    expect(tasks.sendKill).toHaveBeenCalledWith({ ids: [101, 102] });
  });

  it("shows a task's call stack under Details", () => {
    render(<TasksPanel client={client} />);
    act(() => useTasksStore.getState().setList(list));
    fireEvent.click(screen.getByRole("button", { name: /dispatch_event on 35 objects/ }));
    act(() => useTasksStore.getState().setGroup(group));
    fireEvent.click(screen.getByRole("button", { name: "Details of task 101" }));
    expect(tasks.sendInfo).toHaveBeenCalledWith({ id: 101 });
    act(() => useTasksStore.getState().setInfo({ id: 101, lines: ["Task 101", "  verb:  #1:_every (line 9)"] }));
    expect(screen.getByLabelText("Call stack of task 101")).toHaveTextContent("verb: #1:_every (line 9)");
  });

  it("shows the result of a kill and says when there are no tasks", () => {
    render(<TasksPanel client={client} />);
    act(() => useTasksStore.getState().setList({ now: NOW, total: 0, groups: [] }));
    expect(screen.getByText("You have no queued tasks.", { exact: false })).toBeInTheDocument();
    act(() => useTasksStore.getState().setResult({ ok: 1, message: "Killed 1 task." }));
    expect(screen.getByRole("status")).toHaveTextContent("Killed 1 task.");
  });

  it("asks again each time its hidden tab panel is shown", async () => {
    const { container } = render(
      <div role="tabpanel">
        <TasksPanel client={client} />
      </div>,
    );
    const panel = container.querySelector<HTMLElement>('[role="tabpanel"]')!;
    expect(tasks.sendList).toHaveBeenCalledTimes(1);
    panel.hidden = true;
    panel.hidden = false;
    await waitFor(() => expect(tasks.sendList).toHaveBeenCalledTimes(2));
  });

  it("remembers that the player has had tasks once a list arrives with any", () => {
    expect(useTasksStore.getState().everHadTasks).toBe(false);
    useTasksStore.getState().setList(list);
    useTasksStore.getState().setList({ now: NOW, total: 0, groups: [] });
    expect(useTasksStore.getState().everHadTasks).toBe(true);
  });
});
