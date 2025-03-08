import { it, describe, expect } from 'vitest';
import { parseMcpMessage, parseMcpMultiline, generateTag } from "./mcp";

describe("parseMcpMessage", () => {
  it("should parse a message", () => {
    const message = "#$#MCP version: 2.1 to: 2.1";
    const parsed = parseMcpMessage(message);
    expect(parsed).not.toBeNull();
    expect(parsed!.name).toBe("MCP");
    expect(parsed!.authKey).toBeUndefined();
    expect(parsed!.keyvals).toEqual({ version: "2.1", to: "2.1" });
  });
  it("should parse an authkey", () => {
    const message = "#$#say 123456 what: \"Hi there!\" from: Biff to: Betty";
    const parsed = parseMcpMessage(message);
    expect(parsed).not.toBeNull();
    expect(parsed!.name).toBe("say");
    expect(parsed!.authKey).toBe("123456");
    expect(parsed!.keyvals).toEqual({ what: "Hi there!", from: "Biff", to: "Betty" });
  });
});

describe("Additional parseMcpMessage tests", () => {
  it("should return null for an invalid message format", () => {
    const message = "This is not an MCP message";
    const parsed = parseMcpMessage(message);
    expect(parsed).toBeNull();
  });

  it("should handle duplicate keys by logging an error", () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const message = "#$#cmd key: value key: duplicate";
    const parsed = parseMcpMessage(message);
    expect(parsed).not.toBeNull();
    expect(parsed!.keyvals).toEqual({ key: "value" });
    expect(logSpy).toHaveBeenCalledWith("Invalid message format: duplicate key key detected");
    logSpy.mockRestore();
  });

  it("should parse a message with no key-value pairs", () => {
    const message = "#$#PING";
    const parsed = parseMcpMessage(message);
    expect(parsed).not.toBeNull();
    expect(parsed!.name).toBe("PING");
    expect(parsed!.keyvals).toEqual({});
  });
});

describe("Additional parseMcpMultiline tests", () => {
  it("should return null for an invalid multiline message format", () => {
    const message = "#$#* invalid format";
    const parsed = parseMcpMultiline(message);
    expect(parsed).toBeNull();
  });
});

describe("generateTag", () => {
  it("should generate a tag of length 6", () => {
    const tag = generateTag();
    expect(tag).toHaveLength(6);
  });
});

describe("parseMcpMultiline", () => {
  it("should parse a message", () => {
    const message = "#$#* 9b76 text: Note that you don't need to quote strings";
    const parsed = parseMcpMultiline(message);
    expect(parsed).not.toBeNull();
    expect(parsed!.name).toBe("9b76");
    expect(parsed!.authKey).toBeUndefined();
    expect(parsed!.keyvals).toEqual({ text: "Note that you don't need to quote strings" });
  });
  it("should parse a closure", () => {
    const message = "#$#: 9b76";
    const parsed = parseMcpMultiline(message);
    expect(parsed).not.toBeNull();
    expect(parsed!.name).toBe("9b76");
    expect(parsed!.authKey).toBeUndefined();
    expect(parsed!.keyvals).toEqual({});
  });
});
