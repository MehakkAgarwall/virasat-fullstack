import { describe, expect, it } from "vitest";
import { GOOGLE_MAP_INITIALIZATION_ATTEMPTS, GOOGLE_MAP_NAMESPACE_GRACE_MS, GOOGLE_MAP_READY_TIMEOUT_MS } from "./googleMapsConfig";

describe("Google Journey map loading boundary", () => {
  it("retries one cold map initialization while keeping a bounded eighteen-second total grace window", () => {
    expect(GOOGLE_MAP_READY_TIMEOUT_MS).toBe(9_000);
    expect(GOOGLE_MAP_INITIALIZATION_ATTEMPTS).toBe(2);
    expect(GOOGLE_MAP_READY_TIMEOUT_MS * GOOGLE_MAP_INITIALIZATION_ATTEMPTS).toBe(18_000);
    expect(GOOGLE_MAP_NAMESPACE_GRACE_MS).toBe(6_000);
  });
});
