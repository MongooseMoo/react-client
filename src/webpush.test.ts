import { describe, expect, it } from "vitest";

import { urlBase64ToUint8Array } from "./webpush";

describe("webpush helpers", () => {
  it("decodes URL-safe base64 into bytes", () => {
    const bytes = urlBase64ToUint8Array("AQIDBA");
    expect(Array.from(bytes)).toEqual([1, 2, 3, 4]);
  });
});
