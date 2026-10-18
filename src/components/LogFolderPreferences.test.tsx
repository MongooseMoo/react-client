import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createStore } from "zustand/vanilla";
import type { LogFolderStatus } from "../logging/AutoLogFolder";
import { usePreferences } from "../stores/preferencesStore";
import LogFolderPreferences from "./LogFolderPreferences";

function fakeFolder(status: LogFolderStatus) {
  const state = createStore<{ status: LogFolderStatus }>(() => ({ status }));
  return {
    state,
    syncOwner: vi.fn(async () => {}),
    choose: vi.fn(async () => {}),
    reconnect: vi.fn(async () => {}),
    stopUsing: vi.fn(async () => {}),
  };
}

describe("LogFolderPreferences", () => {
  beforeEach(() => {
    usePreferences.getState().setAutologging({ enabled: true, maxBytes: 1024 });
  });

  it("renders nothing where the browser cannot write to folders", () => {
    const { container } = render(<LogFolderPreferences folder={fakeFolder({ kind: "unsupported" })} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("asks a visitor or signed-out player to sign in, with no controls", () => {
    render(<LogFolderPreferences folder={fakeFolder({ kind: "unavailable" })} />);
    expect(screen.getByRole("region", { name: "Save logs to a folder" })).toBeInTheDocument();
    expect(screen.getByText("Sign in to a character to choose a log folder.")).toBeInTheDocument();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("offers Choose folder when none is chosen", () => {
    const folder = fakeFolder({ kind: "none" });
    render(<LogFolderPreferences folder={folder} />);
    expect(screen.getByText("No folder chosen.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Choose folder…" }));
    expect(folder.choose).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("button", { name: "Stop using folder" })).toBeNull();
  });

  it("shows the folder, the live file, and the controls while writing", () => {
    render(<LogFolderPreferences folder={fakeFolder({ kind: "ready", folderName: "Mongoose logs", filePath: "Ada/2026-10-18 14-05-12.txt" })} />);
    expect(screen.getByText("Mongoose logs")).toBeInTheDocument();
    expect(screen.getByText("Writing")).toBeInTheDocument();
    expect(screen.getByText("Ada/2026-10-18 14-05-12.txt")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Choose a different folder…" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Stop using folder" })).toBeInTheDocument();
  });

  it("says when autologging itself is off", () => {
    usePreferences.getState().setAutologging({ enabled: false, maxBytes: 1024 });
    render(<LogFolderPreferences folder={fakeFolder({ kind: "ready", folderName: "Mongoose logs", filePath: "Ada/x.txt" })} />);
    expect(screen.getByText("Connected. Turn on autologging to write files.")).toBeInTheDocument();
    expect(screen.queryByText("Ada/x.txt")).toBeNull();
  });

  it("keeps focus in the controls after a successful reconnect removes the Reconnect button", async () => {
    const folder = fakeFolder({ kind: "needs-permission", folderName: "Mongoose logs" });
    folder.reconnect.mockImplementation(async () => {
      folder.state.setState({ status: { kind: "ready", folderName: "Mongoose logs" } });
    });
    render(<LogFolderPreferences folder={folder} />);
    expect(screen.getByText("Disconnected. The browser needs your permission again.")).toBeInTheDocument();

    const reconnect = screen.getByRole("button", { name: "Reconnect Mongoose logs" });
    reconnect.focus();
    await act(async () => { fireEvent.click(reconnect); });

    expect(screen.queryByRole("button", { name: "Reconnect Mongoose logs" })).toBeNull();
    await waitFor(() => expect(screen.getByRole("button", { name: "Choose a different folder…" })).toHaveFocus());
  });

  it("keeps focus in the controls after Stop using folder", async () => {
    const folder = fakeFolder({ kind: "error", folderName: "Mongoose logs", message: "The disk is full" });
    folder.stopUsing.mockImplementation(async () => {
      folder.state.setState({ status: { kind: "none" } });
    });
    render(<LogFolderPreferences folder={folder} />);
    expect(screen.getByText("Could not write: The disk is full. It tries again with the next line.")).toBeInTheDocument();

    const stop = screen.getByRole("button", { name: "Stop using folder" });
    stop.focus();
    await act(async () => { fireEvent.click(stop); });

    await waitFor(() => expect(screen.getByRole("button", { name: "Choose folder…" })).toHaveFocus());
  });
});
