import { describe, expect, it } from "vitest";
import type { Craft } from "../data/mock";
import { exploreCategoryKey, filterExploreCrafts, getExploreFilterOptions } from "./Explore";

const liveLikeCrafts: Craft[] = [
  { id: "api-101", name: "Silk Study", region: "Mysuru", state: "Karnataka", description: "", category: "Textile", gi: true, image: "", distance: "", detour: "", duration: "", accent: "", coordinates: [0, 0] },
  { id: "api-102", name: "Metal Study", region: "Bidar", state: "Karnataka", description: "", category: "Metalwork", odop: true, image: "", distance: "", detour: "", duration: "", accent: "", coordinates: [0, 0] },
  { id: "api-103", name: "Art Study", region: "Puri", state: "Odisha", description: "", category: "Art", image: "", distance: "", detour: "", duration: "", accent: "", coordinates: [0, 0] },
];

describe("Explore filters", () => {
  it("normalises singular and plural category labels for the live and fallback catalogues", () => {
    expect(exploreCategoryKey("Textile")).toBe("textile");
    expect(exploreCategoryKey("Textiles")).toBe("textile");
    expect(exploreCategoryKey("Handicraft")).toBe("handicraft");
  });

  it("returns the expected visible records for category, GI, ODOP, and search filters", () => {
    expect(filterExploreCrafts(liveLikeCrafts, "Textiles", "").map((craft) => craft.name)).toEqual(["Silk Study"]);
    expect(filterExploreCrafts(liveLikeCrafts, "GI Tagged", "").map((craft) => craft.name)).toEqual(["Silk Study"]);
    expect(filterExploreCrafts(liveLikeCrafts, "ODOP", "").map((craft) => craft.name)).toEqual(["Metal Study"]);
    expect(filterExploreCrafts(liveLikeCrafts, "All", "Puri").map((craft) => craft.name)).toEqual(["Art Study"]);
  });

  it("keeps recognition filters first and exposes the live catalogue categories", () => {
    expect(getExploreFilterOptions(liveLikeCrafts)).toEqual(["All", "GI Tagged", "ODOP", "Art", "Metalwork", "Textile"]);
  });
});
