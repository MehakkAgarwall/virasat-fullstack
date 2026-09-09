import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Craft Detail action wiring", () => {
  it("retains location, live refresh, Planner-intent, and map action paths", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/CraftDetail.tsx"), "utf8");

    expect(source).toContain("createCraftPlannerHref(craft.id, craft.region, craft.state)");
    expect(source).toContain("setLocationOpen(true)");
    expect(source).toContain("setLookupAttempt((attempt) => attempt + 1)");
    expect(source).toContain("Open location in Google Maps");
    expect(source).toContain("Optional nearby transit directions");
    expect(source).toContain("Find nearby makers");
    expect(source).toContain("Trace this craft route");
    expect(source).toContain("Open interactive trail");
  });
});
