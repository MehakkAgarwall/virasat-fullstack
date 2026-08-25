import { describe, expect, it } from "vitest";
import { getExperiencePreviewMedia } from "./experiencePreviewMedia";

describe("experience preview media", () => {
  it("resolves the canonical published Mysore Silk experience to video media", () => {
    const preview = getExperiencePreviewMedia("mysore-silk-experience");
    expect(preview?.previewType).toBe("video");
    expect(preview?.previewSource).toBe("ai-generated-preview");
    expect(preview?.previewUrl).toContain("mysuru-heritage-experience-preview");
  });

  it("preserves the existing Channapatna motion reel and route alias", () => {
    expect(getExperiencePreviewMedia("bengaluru-mysuru-channapatna")?.previewType).toBe("video");
    expect(getExperiencePreviewMedia("bengaluru-mysuru-channapatna")?.generated).toBe(false);
  });

  it("resolves dynamic experience and heritage stops to relevant stills by craft identity", () => {
    const bluePottery = getExperiencePreviewMedia({ opportunityId: "delhi-jaipur-blue-pottery", craftId: "blue-pottery", kind: "Experience", title: "Jaipur Blue Pottery" });
    const kotaDoria = getExperiencePreviewMedia({ opportunityId: "delhi-jaipur-kota-doria", craftId: "kota-doria", kind: "Heritage", title: "Kota Doria" });
    expect(bluePottery?.previewType).toBe("still");
    expect(kotaDoria?.previewType).toBe("still");
    expect(bluePottery?.previewUrl).not.toBe(kotaDoria?.previewUrl);
    expect(bluePottery?.previewCaption).toContain("Jaipur");
    expect(kotaDoria?.previewCaption).toContain("Kota");
  });

  it("does not invent media for an unrelated artisan-only stop", () => {
    expect(getExperiencePreviewMedia("channapatna-maker-studio")).toBeUndefined();
  });
});
