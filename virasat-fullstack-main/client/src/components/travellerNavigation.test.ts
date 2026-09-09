import { describe, expect, it } from "vitest";
import { isTravellerMoreRoute, travellerMoreNavigation, travellerPrimaryNavigation } from "./travellerNavigation";

describe("Traveller navigation hierarchy", () => {
  it("keeps discovery, atlas, trail planning, and My Journey as the four primary destinations", () => {
    expect(travellerPrimaryNavigation.map((item) => item.href)).toEqual(["/explore", "/atlas", "/planner", "/traveller/journey"]);
  });

  it("groups journal, bookings, profile, and settings as related personal actions", () => {
    expect(travellerMoreNavigation.map((item) => item.href)).toEqual(["/notes", "/traveller/bookings", "/traveller/profile", "/settings"]);
    expect(isTravellerMoreRoute("/traveller/bookings")).toBe(true);
    expect(isTravellerMoreRoute("/explore")).toBe(false);
  });
});
