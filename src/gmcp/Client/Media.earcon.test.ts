import { describe, expect, it, vi } from "vitest";

import { MediaPayloadError } from "../../audio/mediaPayloads";
import { mongooseToWebAudioVector } from "../../audio/mongooseCoordinates";
import { GMCPClientMedia } from "./Media";

function createClient() {
  return {
    gmcp: { send: vi.fn() },
    media: { play: vi.fn(() => Promise.resolve()), diagnostics: { record: vi.fn() } },
  };
}

describe("GMCPClientMedia.playEarcon", () => {
  it("plays the payload like a Play, under the one earcon key, restarting, placed once in Web Audio axes", () => {
    const client = createClient();
    const media = new GMCPClientMedia(client as never);

    media.playEarcon({ name: "ui/tick.m4a", type: "sound", key: "s123", position: [1, 2, 3], is3d: true });
    media.playEarcon({ name: "ui/select.m4a", type: "sound", key: "s456" });

    const [first, second] = client.media.play.mock.calls.map((call) => (call as unknown[])[0]);
    expect(first).toMatchObject({ name: "ui/tick.m4a", key: "earcon", continue: false });
    expect((first as { position: unknown }).position).toEqual(mongooseToWebAudioVector([1, 2, 3]));
    expect(second).toMatchObject({ name: "ui/select.m4a", key: "earcon", continue: false });
    media.shutdown();
  });

  it("rejects a payload that is not a Play", () => {
    const media = new GMCPClientMedia(createClient() as never);

    expect(() => media.playEarcon({ type: "sound" })).toThrow(MediaPayloadError);
    media.shutdown();
  });
});
