import { describe, expect, it } from "vitest";
import { createCraftLoadTelemetryEntry } from "./craftRouteTelemetry";

describe("craft route telemetry", () => {
  it("records only the non-identifying craft load metadata needed for demo QA", () => {
    const entry = createCraftLoadTelemetryEntry({
      craftId: 111,
      source: "api",
      elapsedMs: 138,
    });

    expect(entry).toMatchObject({ craftId: 111, source: "api", elapsedMs: 138 });
    expect(Number.isNaN(Date.parse(entry.occurredAt))).toBe(false);
  });
});
