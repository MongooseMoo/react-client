import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useChannelHistoryStore } from "../stores/channelHistoryStore";
import { useChannelsStore } from "../stores/channelsStore";
import { AutoreadMode, usePreferences } from "../stores/preferencesStore";
import ChannelPreferencesTab, { channelRows } from "./ChannelPreferences";

describe("channelRows", () => {
  it("puts listened-to channels first, then the rest of the server's list, then others", () => {
    const rows = channelRows(
      [
        { name: "Music", caption: "Music", kind: "channel", listening: false },
        { name: "mongoose", caption: "Mongoose", kind: "channel", listening: true },
        { name: "page", caption: "Page", kind: "direct", listening: true },
      ],
      ["chess", "mongoose"],
      ["say_to_you", "chess"],
    );

    expect(rows).toEqual([
      { name: "mongoose", caption: "Mongoose", note: "" },
      { name: "page", caption: "Page", note: "" },
      { name: "Music", caption: "Music", note: "not listening" },
      { name: "chess", caption: "chess", note: "" },
      { name: "say_to_you", caption: "say_to_you", note: "" },
    ]);
  });
});

describe("ChannelPreferencesTab", () => {
  beforeEach(() => {
    vi.stubGlobal("speechSynthesis", {
      getVoices: () => [{ name: "Robot", voiceURI: "robot" }],
      onvoiceschanged: null,
    });
    usePreferences.setState({ channels: {} });
    useChannelsStore.getState().setChannels([
      { name: "mongoose", caption: "Mongoose", command: "xmongoose", kind: "channel", listening: true },
    ]);
  });

  afterEach(() => {
    useChannelsStore.getState().reset();
    useChannelHistoryStore.getState().reset();
  });

  it("says so when there are no channels", () => {
    useChannelsStore.getState().reset();

    render(<ChannelPreferencesTab />);

    expect(screen.getByText(/No channels yet/)).toBeTruthy();
  });

  it("shows a channel with no saved settings as following Auto Read and the Speech voice", () => {
    render(<ChannelPreferencesTab />);

    const row = screen.getByRole("row", { name: /Mongoose/ });
    expect(within(row).getByRole("rowheader").textContent).toBe("Mongoose");
    expect((screen.getByLabelText("Mongoose: read aloud") as HTMLSelectElement).value).toBe("default");
    expect((screen.getByLabelText("Mongoose: voice") as HTMLSelectElement).value).toBe("");
    expect(
      (screen.getByLabelText("Mongoose: notify when the window is not focused") as HTMLInputElement).checked,
    ).toBe(false);
  });

  it("saves each setting under the server's channel name", () => {
    render(<ChannelPreferencesTab />);

    fireEvent.change(screen.getByLabelText("Mongoose: read aloud"), {
      target: { value: AutoreadMode.All },
    });
    fireEvent.change(screen.getByLabelText("Mongoose: voice"), { target: { value: "Robot" } });
    fireEvent.click(screen.getByLabelText("Mongoose: notify when the window is not focused"));

    expect(usePreferences.getState().channels).toEqual({
      mongoose: { autoreadMode: AutoreadMode.All, voice: "Robot", notify: true },
    });
  });

  it("keeps a saved voice this device does not have, and says it is missing", () => {
    usePreferences.setState({
      channels: { mongoose: { autoreadMode: AutoreadMode.All, voice: "Zira", notify: false } },
    });

    render(<ChannelPreferencesTab />);

    const voice = screen.getByLabelText("Mongoose: voice") as HTMLSelectElement;
    expect(voice.value).toBe("Zira");
    expect(within(voice).getByText("Zira (not on this device)")).toBeTruthy();
  });
});
