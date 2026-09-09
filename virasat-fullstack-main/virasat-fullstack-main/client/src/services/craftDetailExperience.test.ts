import { describe, expect, it } from "vitest";
import { findBookableExperienceForCraft, formatPublishedExperiencePrice, type CraftDetailExperience } from "./craftDetailExperience";

const experiences: CraftDetailExperience[] = [
  { id: "prototype-free", craftId: 111, available: 1, title: "Prototype", location: "Mysuru", duration: "60 minutes", price: 0, capacity: 8 },
  { id: "published-silk", craftId: 111, available: 1, title: "Loom immersion", location: "Mysuru", duration: "45 minutes", price: 750, capacity: 6 },
  { id: "other-craft", craftId: 104, available: 1, title: "Other", location: "Kashmir", duration: "40 minutes", price: 500, capacity: 4 },
];

describe("craft-detail experience display", () => {
  it("selects only a published, non-zero priced experience for the matching Railway craft", () => {
    expect(findBookableExperienceForCraft(experiences, 111)?.id).toBe("published-silk");
    expect(findBookableExperienceForCraft(experiences, 104)?.id).toBe("other-craft");
    expect(findBookableExperienceForCraft(experiences, 105)).toBeNull();
  });

  it("never formats an unpublished zero price as a traveller-facing price", () => {
    expect(formatPublishedExperiencePrice(0)).toBeNull();
    expect(formatPublishedExperiencePrice(750)).toBe("₹750 / person");
  });
});
