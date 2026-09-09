import { describe, expect, it } from "vitest";
import { HERITAGE_ENRICHMENT_VERSION } from "../data/heritageEnrichment";
import {
  getCraftHeritageContextByFrontendId,
  getHeritageKicker,
  getPublishedCraftJourney,
  getPublishedCraftJourneyForArtisan,
  getPublishedCraftJourneyForExperience,
  overlayCraftHeritage,
} from "./heritageEnrichmentService";

const liveCraft = {
  id: "api-120",
  name: "Blue Pottery",
  region: "Jaipur",
  state: "Rajasthan",
  description: "A live Railway craft record.",
  category: "Handicraft",
  gi: false,
  odop: false,
  image: "https://example.test/blue-pottery.jpg",
  distance: "Location record",
  detour: "Trace route for detour",
  duration: "Maker visit",
  accent: "#b96745",
  coordinates: [26.9124, 75.7873] as [number, number],
};

describe("Phase 2 heritage enrichment overlay", () => {
  it("uses the versioned numeric Railway craft ID to expose verified GI provenance", () => {
    const context = getCraftHeritageContextByFrontendId("api-120");

    expect(HERITAGE_ENRICHMENT_VERSION).toMatch(/^2026\.08\.18\.v2$/);
    expect(context?.sourceCraftId).toBe(120);
    expect(context?.gi).toMatchObject({ status: "verified", label: "GI", registeredName: "Blue Pottery of Jaipur" });
    expect(context?.odop).toBeUndefined();
    expect(overlayCraftHeritage(liveCraft)).toMatchObject({ id: "api-120", gi: true, odop: false });
  });

  it("exposes published artisan and read-only cultural context only for the explicit Moradabad record", () => {
    const context = getCraftHeritageContextByFrontendId("api-105");

    expect(context?.odop).toMatchObject({ status: "verified", label: "ODOP", registeredName: "Moradabad Metal Craft" });
    expect(context?.artisans.map((artisan) => artisan.slug)).toEqual(["vk-gupta-metal-craft-industry"]);
    expect(context?.experiences.map((experience) => experience.slug)).toEqual(["moradabad-metal-craft-documentary"]);
    expect(getHeritageKicker("api-105", "Live route discovery")).toBe("GI + ODOP verified");
  });

  it("leaves an unenriched live craft unchanged and returns its existing planner kicker", () => {
    const unknownCraft = { ...liveCraft, id: "api-125", name: "Nagaland Bamboo Craft" };

    expect(getCraftHeritageContextByFrontendId(unknownCraft.id)).toBeUndefined();
    expect(overlayCraftHeritage(unknownCraft)).toEqual(unknownCraft);
    expect(getHeritageKicker(unknownCraft.id, "Live route discovery")).toBe("Live route discovery");
  });

  it("derives a circular craft-to-maker-to-resource journey only from the explicit published relationship", () => {
    const journey = getPublishedCraftJourney(105);

    expect(journey).toMatchObject({
      sourceCraftId: 105,
      craftHref: "/craft/api-105",
      artisan: { slug: "vk-gupta-metal-craft-industry" },
      experience: { slug: "moradabad-metal-craft-documentary" },
    });
    expect(journey?.provenance.map((item) => item.label)).toEqual(["GI", "ODOP"]);
    expect(getPublishedCraftJourneyForArtisan("vk-gupta-metal-craft-industry")?.craftHref).toBe("/craft/api-105");
    expect(getPublishedCraftJourneyForExperience("moradabad-metal-craft-documentary")?.craftHref).toBe("/craft/api-105");
    expect(getPublishedCraftJourney(120)).toBeUndefined();
    expect(getPublishedCraftJourneyForArtisan("unknown-maker")).toBeUndefined();
  });
});
