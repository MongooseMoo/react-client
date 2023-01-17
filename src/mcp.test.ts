import { parseMcpMessage } from "./mcp";

describe("parseMcpMessage", () => {
  it("should parse a message", () => {
    const message = "#$#MCP version: 2.1 to: 2.1";
    const parsed = parseMcpMessage(message);
    expect(parsed).not.toBeNull();
    expect(parsed!.name).toBe("MCP");
    expect(parsed!.authKey).toBeUndefined();
    expect(parsed!.keyvals).toEqual({ version: "2.1", to: "2.1" });
  });
});
