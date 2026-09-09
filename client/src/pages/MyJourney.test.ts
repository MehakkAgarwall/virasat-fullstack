import { describe, expect, it } from "vitest";
import { myJourneyCardVisuals, myJourneyIdentityEditHref, myJourneySections } from "./MyJourney";

describe("My Journey dashboard", () => {
  it("keeps the Traveller record focused on trail, bookings, journal, and saved crafts", () => {
    expect(myJourneySections).toEqual(["Trail record", "Workshop ledger", "Field journal", "Craft collection"]);
  });

  it("provides a direct persistent-profile editing path for the Traveller identity", () => {
    expect(myJourneyIdentityEditHref).toBe("/traveller/profile?edit=name");
  });

  it("uses four distinct reference-led visual scenes for the personal Journey record", () => {
    expect(Object.values(myJourneyCardVisuals)).toHaveLength(4);
    expect(new Set(Object.values(myJourneyCardVisuals)).size).toBe(4);
  });
});
