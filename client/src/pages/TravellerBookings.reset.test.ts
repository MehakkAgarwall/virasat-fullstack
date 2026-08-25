import { describe, expect, it } from "vitest";
import { removeDemoBookingCopy } from "./TravellerBookings";

describe("Traveller demo booking reset", () => {
  it("explains that removing a demo booking also clears the linked Artisan inbox record", () => {
    expect(removeDemoBookingCopy("Mysuru Silk Loom Immersion")).toContain("Artisan inbox will update too");
  });
});
