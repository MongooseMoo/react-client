import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const announce = vi.hoisted(() => vi.fn());
vi.mock("@react-aria/live-announcer", () => ({ announce }));

import type MudClient from "../client";
import type { GMCPMessageHelpTopic } from "../gmcp/Help";
import { useConnectionStore } from "../stores/connectionStore";
import { useHelpStore } from "../stores/helpStore";
import { useInputStore } from "../stores/inputStore";
import HelpPanel from "./HelpPanel";

const result = (overrides: Partial<GMCPMessageHelpTopic> = {}): GMCPMessageHelpTopic => ({
  topic: "money",
  query: "money",
  db: "game",
  audience: "player",
  status: "ok",
  lines: ["Money", "", "You carry credits, see help shops."],
  choices: [],
  ...overrides,
});

const frontPage = result({
  topic: "",
  query: "",
  lines: ["Help", "", "New here? help starting-out"],
});

describe("HelpPanel", () => {
  let sendGet: ReturnType<typeof vi.fn>;
  let client: MudClient;

  beforeEach(() => {
    announce.mockClear();
    useHelpStore.getState().reset();
    useConnectionStore.getState().reset();
    useConnectionStore.getState().setSessionReady(true);
    sendGet = vi.fn();
    useInputStore.getState().resetCommands();
    client = {
      gmcp: { require: (name: string) => (name === "Help" ? { sendGet } : undefined) },
      mcpSession: { packageHandlers: {} },
    } as unknown as MudClient;
  });

  const renderPanel = () => render(<HelpPanel client={client} />);
  const arrive = (topic: GMCPMessageHelpTopic) => act(() => useHelpStore.getState().show(topic));

  it("fetches the front page when opened with nothing loaded", () => {
    renderPanel();
    expect(sendGet).toHaveBeenCalledTimes(1);
    expect(sendGet).toHaveBeenCalledWith({ topic: "" });
  });

  it("does not fetch again when something is already loaded", () => {
    useHelpStore.getState().show(frontPage);
    renderPanel();
    expect(sendGet).not.toHaveBeenCalled();
  });

  it("waits for a logged-in session before fetching, and disables lookups until then", () => {
    useConnectionStore.getState().setSessionReady(false);
    renderPanel();
    expect(sendGet).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Look up" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Front page" })).toBeDisabled();

    act(() => useConnectionStore.getState().setSessionReady(true));
    expect(sendGet).toHaveBeenCalledWith({ topic: "" });
    expect(screen.getByRole("button", { name: "Look up" })).toBeEnabled();
  });

  it("looks up what is typed when Enter is pressed in the labelled field, keeping focus there", () => {
    useHelpStore.getState().show(frontPage);
    renderPanel();
    const field = screen.getByLabelText("Help topic");
    field.focus();
    fireEvent.input(field, { target: { value: "money" } });
    fireEvent.submit(field);
    expect(sendGet).toHaveBeenCalledWith({ topic: "money" });

    arrive(result());
    expect(field).toHaveFocus();
  });

  it("looks up with the Look up button", () => {
    useHelpStore.getState().show(frontPage);
    renderPanel();
    fireEvent.input(screen.getByLabelText("Help topic"), { target: { value: "search fire" } });
    fireEvent.click(screen.getByRole("button", { name: "Look up" }));
    expect(sendGet).toHaveBeenCalledWith({ topic: "search fire" });
  });

  it("asks for the front page and the index", () => {
    useHelpStore.getState().show(frontPage);
    renderPanel();
    fireEvent.click(screen.getByRole("button", { name: "Front page" }));
    fireEvent.click(screen.getByRole("button", { name: "Index" }));
    expect(sendGet.mock.calls).toEqual([[{ topic: "" }], [{ topic: "index" }]]);
  });

  it("titles the front page Help and a topic by its name", () => {
    useHelpStore.getState().show(frontPage);
    renderPanel();
    expect(screen.getByRole("heading", { name: "Help" })).toBeInTheDocument();
    arrive(result());
    expect(screen.getByRole("heading", { name: "money" })).toBeInTheDocument();
  });

  it("shows the lines in a preformatted block that keeps leading spaces", () => {
    useHelpStore.getState().show(result({ topic: "look", query: "look", lines: ["Syntax: look", "        look <object>"] }));
    const { container } = renderPanel();
    const pre = container.querySelector("pre");
    expect(pre?.textContent).toBe("Syntax: look\n        look <object>\n");
  });

  it("makes each help phrase a button that looks its topic up", () => {
    useHelpStore.getState().show(frontPage);
    renderPanel();
    fireEvent.click(screen.getByRole("button", { name: "help starting-out" }));
    expect(sendGet).toHaveBeenCalledWith({ topic: "starting-out" });
  });

  it("moves focus to the new heading when the link that was used disappears", async () => {
    useHelpStore.getState().show(frontPage);
    renderPanel();
    const link = screen.getByRole("button", { name: "help starting-out" });
    link.focus();
    fireEvent.click(link);
    arrive(result({ topic: "starting-out", query: "starting-out", lines: ["Starting out"] }));
    await vi.waitFor(() => expect(screen.getByRole("heading", { name: "starting-out" })).toHaveFocus());
  });

  it("offers each choice of an ambiguous result once, where the text names it", () => {
    useHelpStore.getState().show(result({
      topic: "",
      query: "lo",
      status: "ambiguous",
      lines: ['"lo" matches more than one topic:', "help look", "help lock"],
      choices: ["look", "lock"],
    }));
    renderPanel();
    expect(screen.queryByRole("list", { name: "Matching topics" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "help lock" })).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "help lock" }));
    expect(sendGet).toHaveBeenCalledWith({ topic: "lock" });
  });

  it("lists a choice the text does not name as a button", () => {
    useHelpStore.getState().show(result({
      topic: "",
      query: "lo",
      status: "ambiguous",
      lines: ['"lo" matches more than one topic:', "help look"],
      choices: ["look", "lock"],
    }));
    renderPanel();
    const list = screen.getByRole("list", { name: "Matching topics" });
    expect(within(list).queryByRole("button", { name: "look" })).not.toBeInTheDocument();
    fireEvent.click(within(list).getByRole("button", { name: "lock" }));
    expect(sendGet).toHaveBeenCalledWith({ topic: "lock" });
  });

  it("says when the topic was printed in the game output", () => {
    useHelpStore.getState().show(result({ status: "shown", lines: [] }));
    renderPanel();
    expect(screen.getByText("This topic was printed in the game output.")).toBeInTheDocument();
  });

  it("goes back to the previous topic and announces it", () => {
    useHelpStore.getState().show(frontPage);
    renderPanel();
    expect(screen.getByRole("button", { name: "Back" })).toBeDisabled();
    arrive(result());
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByRole("heading", { name: "Help" })).toBeInTheDocument();
    expect(announce).toHaveBeenCalledWith("Help", "polite");
    expect(sendGet).not.toHaveBeenCalled();
  });

  it("lists the commands the server says can be typed here", () => {
    useHelpStore.getState().show(frontPage);
    renderPanel();
    expect(screen.getByText("No command list from the server yet.")).toBeInTheDocument();
    act(() => useInputStore.getState().setVisibleCommands(["look", "get"]));
    const list = screen.getByRole("list", { name: "Visible commands" });
    expect(within(list).getAllByRole("listitem").map((item) => item.textContent)).toEqual(["get", "look"]);
  });
});
