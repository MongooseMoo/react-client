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
    retry: vi.fn(async () => {}),
    stopUsing: vi.fn(async () => {}),
  };
}

describe("LogFolderPreferences", () => {
  beforeEach(() => {
    usePreferences.getState().setAutologging({ enabled: true, maxBytes: 1024 });
  });

  it("says another tab is blocking the folder settings and offers Try again", () => {
    const folder = fakeFolder({ kind: "storage-error", blocked: true, message: "blocked" });
    render(<LogFolderPreferences folder={folder} />);
    expect(screen.getByText("Another Mongoose tab is using older log folder settings. Close or reload your other Mongoose tabs, then choose Try again.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Choose/ })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(folder.retry).toHaveBeenCalledTimes(1);
  });

  it("tells the player the newest file is rewritten", () => {
    render(<LogFolderPreferences folder={fakeFolder({ kind: "none" })} />);
    expect(screen.getByText("Mongoose rewrites the newest file of a session as lines arrive, so copy a log before you edit it.")).toBeInTheDocument();
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

  it("moves focus to the section heading when a successful reconnect removes the Reconnect button", async () => {
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
    await waitFor(() => expect(screen.getByRole("heading", { name: "Save logs to a folder" })).toHaveFocus());
  });

  it("moves focus to the section heading after Stop using folder", async () => {
    const folder = fakeFolder({ kind: "error", folderName: "Mongoose logs", message: "The disk is full" });
    folder.stopUsing.mockImplementation(async () => {
      folder.state.setState({ status: { kind: "none" } });
    });
    render(<LogFolderPreferences folder={folder} />);
    expect(screen.getByText("Could not write: The disk is full. It tries again with each new line.")).toBeInTheDocument();

    const stop = screen.getByRole("button", { name: "Stop using folder" });
    stop.focus();
    await act(async () => { fireEvent.click(stop); });

    await waitFor(() => expect(screen.getByRole("heading", { name: "Save logs to a folder" })).toHaveFocus());
  });

  it("leaves focus where the player moved it while an action was still running", async () => {
    let finish = () => {};
    const folder = fakeFolder({ kind: "needs-permission", folderName: "Mongoose logs" });
    folder.reconnect.mockImplementation(() => new Promise<void>((resolve) => {
      finish = () => {
        folder.state.setState({ status: { kind: "ready", folderName: "Mongoose logs" } });
        resolve();
      };
    }));
    render(<><LogFolderPreferences folder={folder} /><button type="button">Other preference</button></>);

    const reconnect = screen.getByRole("button", { name: "Reconnect Mongoose logs" });
    reconnect.focus();
    fireEvent.click(reconnect);
    const other = screen.getByRole("button", { name: "Other preference" });
    other.focus();
    await act(async () => { finish(); });

    expect(screen.queryByRole("button", { name: "Reconnect Mongoose logs" })).toBeNull();
    expect(other).toHaveFocus();
  });

  it("offers Try again after a write error", () => {
    const folder = fakeFolder({ kind: "error", folderName: "Mongoose logs", message: "The disk is full" });
    render(<LogFolderPreferences folder={folder} />);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(folder.reconnect).toHaveBeenCalledTimes(1);
  });
});
