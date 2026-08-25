import { describe, expect, it } from "vitest";
import { MYSORE_SILK_REFERENCE_ROUTE } from "./mysoreSilkReference";

describe("Mysore Silk reference composition content", () => {
  it("preserves the retained Bengaluru to Mysuru cultural corridor and route-fact labels", () => {
    expect(MYSORE_SILK_REFERENCE_ROUTE.stops).toEqual(["Bengaluru", "Channapatna", "Mysuru"]);
    expect(MYSORE_SILK_REFERENCE_ROUTE.facts).toEqual([
      { value: "8 km", label: "craft context" },
      { value: "12 min", label: "cultural detour" },
      { value: "Maker visit", label: "route-aware stop" },
    ]);
  });
});
