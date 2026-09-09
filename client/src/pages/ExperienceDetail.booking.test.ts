import { describe, expect, it } from "vitest";
import { BOOKING_CTA_LABEL, BOOKING_SECTION_ID } from "./ExperienceDetail";

describe("Traveller booking entry point", () => {
  it("keeps a direct primary booking action anchored to the booking form", () => {
    expect(BOOKING_CTA_LABEL).toBe("Book this experience");
    expect(BOOKING_SECTION_ID).toBe("book-experience");
  });
});
