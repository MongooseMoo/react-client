import { afterEach, describe, expect, it, vi } from "vitest";

import { apiOrigin, resolveApiUrl } from "./apiOrigin";

describe("apiOrigin", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses relative paths in dev so the Vite proxy serves /api", () => {
    vi.stubEnv("DEV", true);
    vi.stubEnv("VITE_API_ORIGIN", "");
    expect(apiOrigin()).toBe("");
    expect(resolveApiUrl("/api/webpush/public_key")).toBe("/api/webpush/public_key");
  });

  it("uses mongoose.world in production", () => {
    vi.stubEnv("DEV", false);
    vi.stubEnv("VITE_API_ORIGIN", "");
    expect(apiOrigin()).toBe("https://mongoose.world");
    expect(resolveApiUrl("/api/webpush/public_key")).toBe(
      "https://mongoose.world/api/webpush/public_key",
    );
  });

  it("prefers VITE_API_ORIGIN over the mode default", () => {
    vi.stubEnv("DEV", true);
    vi.stubEnv("VITE_API_ORIGIN", "https://staging.example");
    expect(resolveApiUrl("/api/webpush/stop?t=abc")).toBe(
      "https://staging.example/api/webpush/stop?t=abc",
    );
  });

  it("passes absolute URLs through unchanged", () => {
    vi.stubEnv("DEV", false);
    vi.stubEnv("VITE_API_ORIGIN", "");
    const url = "https://mongoose.world/api/webpush/stop?t=abc";
    expect(resolveApiUrl(url)).toBe(url);
  });

  it("leaves non-/api/ paths alone", () => {
    vi.stubEnv("DEV", false);
    vi.stubEnv("VITE_API_ORIGIN", "");
    expect(resolveApiUrl("/")).toBe("/");
    expect(resolveApiUrl("/apiary")).toBe("/apiary");
  });
});
