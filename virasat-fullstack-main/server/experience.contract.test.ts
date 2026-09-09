import { describe, expect, it } from "vitest";
import { bookings, experiences, travellerProfiles } from "../drizzle/schema";
import { appRouter } from "./routers";

describe("managed experience contract", () => {
  it("exposes the shared public and Artisan experience operations", () => {
    expect(Object.keys((appRouter as any)._def.record.experience).sort()).toEqual([
      "create",
      "get",
      "listForArtisan",
      "listPublished",
      "update",
    ]);
  });

  it("persists experience details and booking time alongside relationship keys", () => {
    expect(experiences.artisanKey.name).toBe("artisanKey");
    expect(experiences.duration.name).toBe("duration");
    expect(experiences.price.name).toBe("price");
    expect(experiences.capacity.name).toBe("capacity");
    expect(experiences.available.name).toBe("available");
    expect(experiences.availableDates.name).toBe("availableDates");
    expect(experiences.availableTimes.name).toBe("availableTimes");
    expect(experiences.coverImageUrl.name).toBe("coverImageUrl");
    expect(experiences.galleryImageUrls.name).toBe("galleryImageUrls");
    expect(experiences.previewVideoUrl.name).toBe("previewVideoUrl");
    expect(experiences.youtubeVideoUrl.name).toBe("youtubeVideoUrl");
    expect(experiences.previewCaption.name).toBe("previewCaption");
    expect(experiences.detourMinutes.name).toBe("detourMinutes");
    expect(bookings.experienceId.name).toBe("experienceId");
    expect(bookings.artisanKey.name).toBe("artisanKey");
    expect(bookings.bookingTime.name).toBe("bookingTime");
    expect(travellerProfiles.travellerKey.name).toBe("travellerKey");
    expect(travellerProfiles.displayName.name).toBe("displayName");
  });

  it("keeps Traveller profile operations separate from the Artisan profile operations", () => {
    expect(Object.keys((appRouter as any)._def.record.travellerProfile).sort()).toEqual(["get", "getOrCreate", "update"]);
    expect(Object.keys((appRouter as any)._def.record.artisanProfile).sort()).toEqual(["get", "getOrCreate", "update"]);
  });
});
