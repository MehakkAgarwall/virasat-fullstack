import { describe, expect, it } from "vitest";
import { authorityAnalyticsRegions, authorityCatalogueCrafts, authorityReviewEligible, getAuthorityRegionBrief } from "./Authority";

describe("Authority catalogue", () => {
  it("keeps the four official craft record names available for the readable catalogue", () => {
    expect(authorityCatalogueCrafts).toEqual(["Channapatna Toys", "Mysore Silk", "Rosewood Inlay", "Bidriware"]);
  });

  it("limits local review controls to the four original Authority demo records", () => {
    expect(authorityReviewEligible("Mysore Silk")).toBe(true);
    expect(authorityReviewEligible("Pattachitra")).toBe(false);
  });

  it("offers four additional real-craft-linked regions in Tourism Analytics", () => {
    expect(authorityAnalyticsRegions).toEqual(["Karnataka", "Rajasthan", "Tamil Nadu", "Uttar Pradesh", "Gujarat", "Odisha", "West Bengal"]);
  });

  it("builds a Rajasthan regional brief with a clear lead craft and cultural route", () => {
    expect(getAuthorityRegionBrief("Rajasthan")).toMatchObject({ region: "Rajasthan", leadCraft: "Blue Pottery", primaryRoute: "Delhi → Jaipur" });
  });
});
