import { parseMcpMessage, parseMcpMultiline } from "./mcp";

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
