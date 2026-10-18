import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type MudClient from "../../client";
import { createConfiguredClient } from "../../createConfiguredClient";
import { useChannelHistoryStore } from "../../stores/channelHistoryStore";
import { useChannelsStore } from "../../stores/channelsStore";
import { useOutputStore } from "../../stores/outputStore";
import { AutoreadMode, usePreferences } from "../../stores/preferencesStore";
import type { Stream } from "../../telnet";
import { decodeChannelList } from "./Channel";

vi.mock("cacophony", () => ({
  Cacophony: class {
    muted = false;
    setGlobalVolume = vi.fn();
  },
}));

class MockUtterance {
  text: string;
  rate = 1;
  pitch = 1;
  volume = 1;
  lang = "";
  voice: unknown = null;
  constructor(text: string) {
    this.text = text;
  }
}

const speak = vi.fn();
const robot = { name: "Robot" };
const narrator = { name: "Narrator" };

const SERVER_LIST = [
  { name: "mongoose", caption: "Mongoose", command: "xmongoose", kind: "channel", listening: 1 },
  { name: "Music", caption: "Music", command: "xMusic", kind: "channel", listening: 0 },
  { name: "page", caption: "Page", command: "page", kind: "direct", listening: 1 },
];

const IAC = 255;
const SB = 250;
const SE = 240;
const GMCP = 201;

function gmcpBytes(message: string, data: unknown): number[] {
  const body = new TextEncoder().encode(`${message} ${JSON.stringify(data)}`);
  return [IAC, SB, GMCP, ...body, IAC, SE];
}

function textBytes(text: string): number[] {
  return [...new TextEncoder().encode(text)];
}

function spokenTexts(): string[] {
  return speak.mock.calls.map(([utterance]) => (utterance as MockUtterance).text);
}

describe("Comm.Channel", () => {
  let client: MudClient;
  let receive: (bytes: number[]) => void;
  let focused: boolean;
  let hasFocus: { mockRestore(): void };

  beforeEach(() => {
    speak.mockClear();
    focused = true;
    vi.stubGlobal("SpeechSynthesisUtterance", MockUtterance);
    vi.stubGlobal("speechSynthesis", {
      speak,
      cancel: vi.fn(),
      getVoices: () => [robot, narrator],
    });
    hasFocus = vi.spyOn(document, "hasFocus").mockImplementation(() => focused);
    usePreferences.setState({
      speech: { autoreadMode: AutoreadMode.Off, voice: "Narrator", rate: 1, pitch: 1, volume: 1 },
      channels: {},
    });

    client = createConfiguredClient();
    let onData: (data: Uint8Array) => void = () => {};
    const stream = {
      on: (event: string, callback: (data: Uint8Array) => void) => {
        if (event === "data") onData = callback;
      },
      write: vi.fn(),
    } as unknown as Stream;
    client.connectLocal(stream);
    receive = (bytes) => onData(new Uint8Array(bytes));
  });

  afterEach(() => {
    client.shutdown();
    useChannelHistoryStore.getState().reset();
    useChannelsStore.getState().reset();
    useOutputStore.getState().reset();
    // Only this file's spy: the suite's setup mocks must keep their implementations.
    hasFocus.mockRestore();
  });

  function setReading(channel: string, autoreadMode: AutoreadMode | "default", voice = "") {
    usePreferences.getState().setChannelPreferences(channel, { autoreadMode, voice, notify: false });
  }

  /** One channel message as the server sends it: Start, Text, the output line, End. */
  function receiveChannelLine(channel: string, talker: string, text: string) {
    receive([
      ...gmcpBytes("Comm.Channel.Start", channel),
      ...gmcpBytes("Comm.Channel.Text", { channel, talker, text }),
      ...textBytes(`[${channel}] ${talker} says, "${text}"\r\n`),
      ...gmcpBytes("Comm.Channel.End", channel),
    ]);
  }

  describe("List", () => {
    it("stores the server's channels, with listening as a boolean", () => {
      receive(gmcpBytes("Comm.Channel.List", SERVER_LIST));

      expect(useChannelsStore.getState().channels).toEqual([
        { name: "mongoose", caption: "Mongoose", command: "xmongoose", kind: "channel", listening: true },
        { name: "Music", caption: "Music", command: "xMusic", kind: "channel", listening: false },
        { name: "page", caption: "Page", command: "page", kind: "direct", listening: true },
      ]);
    });

    it("replaces the list when the server sends it again", () => {
      receive(gmcpBytes("Comm.Channel.List", SERVER_LIST));
      receive(gmcpBytes("Comm.Channel.List", [SERVER_LIST[2]]));

      expect(useChannelsStore.getState().channels.map((channel) => channel.name)).toEqual(["page"]);
    });

    it("refuses a list that is not the agreed shape", () => {
      expect(() => decodeChannelList(["mongoose"])).toThrow(TypeError);
      expect(() => decodeChannelList({ name: "mongoose" })).toThrow(TypeError);
      expect(() =>
        decodeChannelList([{ name: "x", caption: "X", command: "xx", kind: "tavern", listening: 1 }]),
      ).toThrow(TypeError);
    });

    it("forgets the channels when the connection resets", () => {
      receive(gmcpBytes("Comm.Channel.List", SERVER_LIST));
      receive(gmcpBytes("Comm.Channel.Start", "mongoose"));

      client.gmcp.require("Comm.Channel").reset();

      expect(useChannelsStore.getState().channels).toEqual([]);
      expect(useChannelsStore.getState().activeChannel).toBeNull();
    });
  });

  describe("reading a channel aloud", () => {
    it("leaves a channel on Same as Auto Read to Auto Read, speaking its line once", () => {
      usePreferences.setState({
        speech: { ...usePreferences.getState().speech, autoreadMode: AutoreadMode.All },
      });

      receiveChannelLine("mongoose", "Alice", "hello");

      expect(spokenTexts()).toEqual(['[mongoose] Alice says, "hello"']);
    });

    it("says nothing for a channel on Same as Auto Read when Auto Read is off", () => {
      receiveChannelLine("mongoose", "Alice", "hello");

      expect(spokenTexts()).toEqual([]);
    });

    it("speaks a channel set to Always once, in its own voice, with Auto Read off", () => {
      setReading("mongoose", AutoreadMode.All, "Robot");

      receiveChannelLine("mongoose", "Alice", "hello");

      expect(spokenTexts()).toEqual(["Alice. hello"]);
      expect((speak.mock.calls[0][0] as MockUtterance).voice).toBe(robot);
    });

    it("speaks a channel set to Always once when Auto Read is on as well", () => {
      usePreferences.setState({
        speech: { ...usePreferences.getState().speech, autoreadMode: AutoreadMode.All },
      });
      setReading("mongoose", AutoreadMode.All);

      receiveChannelLine("mongoose", "Alice", "hello");

      expect(spokenTexts()).toEqual(["Alice. hello"]);
      expect((speak.mock.calls[0][0] as MockUtterance).voice).toBe(narrator);
    });

    it("keeps a channel set to Never silent while Auto Read reads everything else", () => {
      usePreferences.setState({
        speech: { ...usePreferences.getState().speech, autoreadMode: AutoreadMode.All },
      });
      setReading("mongoose", AutoreadMode.Off);

      receiveChannelLine("mongoose", "Alice", "hello");
      receive(textBytes("You see a door.\r\n"));

      expect(spokenTexts()).toEqual(["You see a door."]);
    });

    it("speaks a channel set to When the window is not focused only then", () => {
      setReading("mongoose", AutoreadMode.Unfocused);

      receiveChannelLine("mongoose", "Alice", "seen");
      focused = false;
      receiveChannelLine("mongoose", "Alice", "unseen");

      expect(spokenTexts()).toEqual(["Alice. unseen"]);
    });

    it("applies one channel's rule to that channel only", () => {
      usePreferences.setState({
        speech: { ...usePreferences.getState().speech, autoreadMode: AutoreadMode.All },
      });
      setReading("mongoose", AutoreadMode.Off);

      receiveChannelLine("mongoose", "Alice", "quiet");
      receiveChannelLine("Music", "Bob", "loud");

      expect(spokenTexts()).toEqual(['[Music] Bob says, "loud"']);
    });

    it("keeps a line from the screen reader's announcement when its channel speaks it or is set to Never", async () => {
      setReading("always", AutoreadMode.All);
      setReading("never", AutoreadMode.Off);
      setReading("away", AutoreadMode.Unfocused);

      receiveChannelLine("always", "Alice", "one");
      receiveChannelLine("never", "Alice", "two");
      receiveChannelLine("away", "Alice", "three");
      receiveChannelLine("untouched", "Alice", "four");
      await Promise.resolve();

      const owned = useOutputStore
        .getState()
        .entries.map((entry) => entry.type === "message" && entry.browserSpeechOwned === true);
      expect(owned).toEqual([true, true, false, false]);
    });

    it("still puts every channel line in the output and the channel history", async () => {
      setReading("mongoose", AutoreadMode.Off);

      receiveChannelLine("mongoose", "Alice", "hello");
      await Promise.resolve();

      expect(useOutputStore.getState().entries).toHaveLength(1);
      expect(useChannelHistoryStore.getState().entries).toMatchObject([
        { channel: "mongoose", talker: "Alice", text: "hello" },
      ]);
    });
  });

  describe("notifying", () => {
    it("notifies for a channel with notify on when the window is not focused", () => {
      const sendNotification = vi.fn(() => true);
      client.sendNotification = sendNotification;
      usePreferences
        .getState()
        .setChannelPreferences("page", { autoreadMode: "default", voice: "", notify: true });

      receiveChannelLine("page", "Alice", "focused");
      focused = false;
      receiveChannelLine("page", "Alice", "away");
      receiveChannelLine("mongoose", "Bob", "chatter");

      expect(sendNotification.mock.calls).toEqual([["Message from Alice", "away"]]);
    });
  });
});
