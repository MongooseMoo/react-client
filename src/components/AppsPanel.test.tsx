import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const announce = vi.hoisted(() => vi.fn());
vi.mock("@react-aria/live-announcer", () => ({ announce }));

import type MudClient from "../client";
import { useAppsStore } from "../stores/appsStore";
import { useConnectionStore } from "../stores/connectionStore";
import { offerApproveCode, useLaunchStore } from "../launch/launchStore";
import AppsPanel, { claudeMcpCommand, mosquittoBridgeConfig, windowsDriveCommand } from "./AppsPanel";

describe("AppsPanel", () => {
  let apps: { sendList: ReturnType<typeof vi.fn>; sendApprove: ReturnType<typeof vi.fn>; sendRevoke: ReturnType<typeof vi.fn>; sendPassword: ReturnType<typeof vi.fn> };
  let client: MudClient;

  beforeEach(() => {
    announce.mockClear();
    useAppsStore.getState().reset();
    useConnectionStore.getState().reset();
    useConnectionStore.getState().setSessionReady(true);
    apps = { sendList: vi.fn(), sendApprove: vi.fn(), sendRevoke: vi.fn(), sendPassword: vi.fn() };
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

  it("asks for the list again each time its hidden tab panel is shown", async () => {
    const { container } = render(
      <div role="tabpanel">
        <AppsPanel client={client} />
      </div>,
    );
    const panel = container.querySelector<HTMLElement>('[role="tabpanel"]')!;
    expect(apps.sendList).toHaveBeenCalledTimes(1);
    panel.hidden = true;
    panel.hidden = false;
    await waitFor(() => expect(apps.sendList).toHaveBeenCalledTimes(2));
  });

  it("says when no app can act as the player", () => {
    render(<AppsPanel client={client} />);
    act(() => useAppsStore.getState().setApps([]));
    expect(screen.getByText("No apps can act as you.")).toBeInTheDocument();
  });

  it("approves the code typed, trimmed, and clears the field", () => {
    render(<AppsPanel client={client} />);
    const input = screen.getByRole("textbox", { name: "Code the app shows" });
    fireEvent.input(input, { target: { value: " BCDF-GHJK " } });
    fireEvent.click(screen.getByRole("button", { name: "Approve" }));
    expect(apps.sendApprove).toHaveBeenCalledWith({ code: "BCDF-GHJK" });
    expect(input).toHaveValue("");
  });

  it("asks for a drive and shows its address, user, password and Windows command", () => {
    render(<AppsPanel client={client} />);
    fireEvent.click(screen.getByRole("button", { name: "Connect a drive" }));
    expect(apps.sendPassword).toHaveBeenCalledWith({ app: "drive" });
    act(() => useAppsStore.getState().setPassword({ app: "drive", url: "https://mongoose.world/dav/", user: "Q", password: "ABC123" }));
    expect(screen.getByRole("textbox", { name: "Address" })).toHaveValue("https://mongoose.world/dav/");
    expect(screen.getByRole("textbox", { name: "User name" })).toHaveValue("Q");
    expect(screen.getByRole("textbox", { name: "Password" })).toHaveValue("ABC123");
    expect(screen.getByRole("textbox", { name: "Windows command" })).toHaveValue(
      'net use M: https://mongoose.world/dav/ /user:"Q" ABC123 /persistent:yes',
    );
  });

  it("asks for an MQTT password and shows the broker's host, port, user, password and topics", () => {
    render(<AppsPanel client={client} />);
    fireEvent.click(screen.getByRole("button", { name: "Get an MQTT password" }));
    expect(apps.sendPassword).toHaveBeenCalledWith({ app: "mqtt" });
    act(() =>
      useAppsStore.getState().setPassword({
        app: "mqtt",
        url: "mqtts://mongoose.world:8883",
        user: "Q",
        password: "KEY9",
        topics: "players/249/#",
      }),
    );
    expect(screen.getByRole("textbox", { name: "Host" })).toHaveValue("mongoose.world");
    expect(screen.getByRole("textbox", { name: "Port" })).toHaveValue("8883");
    expect(screen.getByRole("textbox", { name: "MQTT user name" })).toHaveValue("Q");
    expect(screen.getByRole("textbox", { name: "MQTT password" })).toHaveValue("KEY9");
    expect(screen.getByRole("textbox", { name: "Your topics" })).toHaveValue("players/249/#");
    expect(screen.queryByRole("textbox", { name: "Windows command" })).not.toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Mosquitto bridge" })).toHaveValue(
      mosquittoBridgeConfig("mqtts://mongoose.world:8883", "Q", "KEY9", "players/249/#"),
    );
  });

  it("writes a Mosquitto bridge section with the player's password, prefix and state topic", () => {
    expect(mosquittoBridgeConfig("mqtts://mongoose.world:8883", "Solaris_Guest", "KEY9", "players/2280/#").split("\n")).toEqual([
      "connection mongoose",
      "address mongoose.world:8883",
      "bridge_capath /etc/ssl/certs",
      "remote_username Solaris_Guest",
      "remote_password KEY9",
      "remote_clientid Solaris_Guest-bridge",
      "notification_topic players/2280/bridge/state",
      "topic # both 0 mongoose/ players/2280/",
    ]);
  });

  it("keeps the drive password shown when an MQTT password arrives", () => {
    render(<AppsPanel client={client} />);
    act(() => useAppsStore.getState().setPassword({ app: "drive", url: "https://mongoose.world/dav/", user: "Q", password: "D1" }));
    act(() => useAppsStore.getState().setPassword({ app: "mqtt", url: "mqtts://mongoose.world:8883", user: "Q", password: "M1" }));
    expect(screen.getByRole("textbox", { name: "Password" })).toHaveValue("D1");
    expect(screen.getByRole("textbox", { name: "MQTT password" })).toHaveValue("M1");
  });

  it("asks for a Claude Code password and shows the claude mcp add command", () => {
    render(<AppsPanel client={client} />);
    fireEvent.click(screen.getByRole("button", { name: "Get a Claude Code password" }));
    expect(apps.sendPassword).toHaveBeenCalledWith({ app: "mcp" });
    act(() => useAppsStore.getState().setPassword({ app: "mcp", url: "https://mongoose.world/mcp", user: "Q", password: "T0K" }));
    expect(screen.getByRole("textbox", { name: "Claude Code command" })).toHaveValue(
      'claude mcp add --transport http mongoose https://mongoose.world/mcp --header "Authorization: Bearer T0K"',
    );
    expect(screen.getByRole("textbox", { name: "Bearer token" })).toHaveValue("T0K");
    expect(claudeMcpCommand("https://m/mcp", "X")).toBe('claude mcp add --transport http mongoose https://m/mcp --header "Authorization: Bearer X"');
  });

  it("fills in a sign-in code a link brought, without approving it", () => {
    offerApproveCode("BCDF-GHJK");
    render(<AppsPanel client={client} />);
    expect(screen.getByRole("textbox", { name: "Code the app shows" })).toHaveValue("BCDF-GHJK");
    expect(apps.sendApprove).not.toHaveBeenCalled();
    expect(useLaunchStore.getState().approveCode).toBeUndefined();
    fireEvent.click(screen.getByRole("button", { name: "Approve" }));
    expect(apps.sendApprove).toHaveBeenCalledWith({ code: "BCDF-GHJK" });
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
