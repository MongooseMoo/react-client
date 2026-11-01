import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const announce = vi.hoisted(() => vi.fn());
vi.mock("@react-aria/live-announcer", () => ({ announce }));

import type MudClient from "../client";
import { useAppsStore } from "../stores/appsStore";
import { useConnectionStore } from "../stores/connectionStore";
import AppsPanel, { windowsDriveCommand } from "./AppsPanel";

describe("AppsPanel", () => {
  let apps: { sendList: ReturnType<typeof vi.fn>; sendApprove: ReturnType<typeof vi.fn>; sendRevoke: ReturnType<typeof vi.fn>; sendDrive: ReturnType<typeof vi.fn> };
  let client: MudClient;

  beforeEach(() => {
    announce.mockClear();
    useAppsStore.getState().reset();
    useConnectionStore.getState().reset();
    useConnectionStore.getState().setSessionReady(true);
    apps = { sendList: vi.fn(), sendApprove: vi.fn(), sendRevoke: vi.fn(), sendDrive: vi.fn() };
    client = {
      gmcp: { require: (name: string) => (name === "Client.Apps" ? apps : undefined) },
    } as unknown as MudClient;
  });

  it("asks for the list when the session is ready and shows each app with Revoke", () => {
    render(<AppsPanel client={client} />);
    expect(apps.sendList).toHaveBeenCalledWith({});
    expect(screen.getByText("Loading…")).toBeInTheDocument();
    act(() => useAppsStore.getState().setApps([{ name: "VS Code", approved: 1793570000 }]));
    fireEvent.click(screen.getByRole("button", { name: "Revoke VS Code" }));
    expect(apps.sendRevoke).toHaveBeenCalledWith({ name: "VS Code" });
  });

  it("says when no app can act as the player", () => {
    render(<AppsPanel client={client} />);
    act(() => useAppsStore.getState().setApps([]));
    expect(screen.getByText("No apps can act as you.")).toBeInTheDocument();
  });

  it("approves the code typed, trimmed, and clears the field", () => {
    render(<AppsPanel client={client} />);
    const input = screen.getByRole("textbox", { name: "Code the app shows" });
    fireEvent.change(input, { target: { value: " BCDF-GHJK " } });
    fireEvent.click(screen.getByRole("button", { name: "Approve" }));
    expect(apps.sendApprove).toHaveBeenCalledWith({ code: "BCDF-GHJK" });
    expect(input).toHaveValue("");
  });

  it("asks for a drive and shows its address, user, password and Windows command", () => {
    render(<AppsPanel client={client} />);
    fireEvent.click(screen.getByRole("button", { name: "Connect a drive" }));
    expect(apps.sendDrive).toHaveBeenCalledWith({});
    act(() => useAppsStore.getState().setDrive({ url: "https://mongoose.world/dav/", user: "Q", password: "ABC123" }));
    expect(screen.getByRole("textbox", { name: "Address" })).toHaveValue("https://mongoose.world/dav/");
    expect(screen.getByRole("textbox", { name: "User name" })).toHaveValue("Q");
    expect(screen.getByRole("textbox", { name: "Password" })).toHaveValue("ABC123");
    expect(screen.getByRole("textbox", { name: "Windows command" })).toHaveValue(
      'net use M: https://mongoose.world/dav/ /user:"Q" ABC123 /persistent:yes',
    );
  });

  it("shows the server's answer", () => {
    render(<AppsPanel client={client} />);
    act(() => useAppsStore.getState().setResult({ ok: 0, message: "No app is waiting for the code X." }));
    expect(screen.getByRole("status")).toHaveTextContent("No app is waiting for the code X.");
  });

  it("quotes a user name with spaces in the Windows command", () => {
    expect(windowsDriveCommand("https://m/dav/", "Some One", "P")).toBe('net use M: https://m/dav/ /user:"Some One" P /persistent:yes');
  });
});
