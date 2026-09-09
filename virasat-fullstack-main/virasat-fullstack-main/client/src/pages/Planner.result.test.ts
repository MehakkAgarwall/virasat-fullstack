import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Cultural Trail result presentation", () => {
  it("keeps the reference-led result treatment behind a named results-only variant", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/Planner.tsx"), "utf8");

    expect(source).toContain('CULTURAL_TRAIL_RESULT_VARIANT = "cultural-journey-hero-results"');
    expect(source).toContain("showResults ? CULTURAL_TRAIL_RESULT_VARIANT");
  });
});
