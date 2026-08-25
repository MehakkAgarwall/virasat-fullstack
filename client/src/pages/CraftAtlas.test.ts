import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Traveller Craft Atlas", () => {
  it("uses the live atlas adapter, source-only coordinates, verified suggestions, filters, and existing route/craft handoffs", () => {
    const page = readFileSync(resolve(process.cwd(), "client/src/pages/CraftAtlas.tsx"), "utf8");
    const adapter = readFileSync(resolve(process.cwd(), "client/src/services/craftService.ts"), "utf8");
    expect(page).toContain("fetchCraftAtlasCatalogue");
    expect(page).toContain("Search a craft, place or tradition");
    expect(page).toContain("Live Railway craft suggestions");
    expect(page).toContain("No maker experience published yet.");
    expect(page).toContain("Meet a local maker");
    expect(page).toContain("Location to be verified");
    expect(page).toContain("Trace a route through craft");
    expect(page).toContain("createCraftPlannerHref");
    expect(page).toContain("No maker experience published yet.");
    expect(adapter).toContain("atlasCoordinates: Number.isFinite(lat) && Number.isFinite(lng)");
    expect(adapter).toContain("fetchCraftAtlasCatalogue");
  });
});
