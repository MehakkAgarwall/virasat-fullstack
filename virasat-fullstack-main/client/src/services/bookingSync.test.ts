import { describe, expect, it } from "vitest";
import { BOOKING_SYNC_INTERVAL_MS, bookingRequestLabel, bookingStatusLabel } from "./bookingSync";

describe("shared booking synchronization labels", () => {
  it("uses a transparent four-second refresh cadence for separate Traveller and Artisan demo views", () => {
    expect(BOOKING_SYNC_INTERVAL_MS).toBe(4_000);
  });

  it("maps every persisted booking status to the same clear language on both sides", () => {
    expect(bookingStatusLabel("pending")).toBe("Pending Artisan Confirmation");
    expect(bookingStatusLabel("accepted")).toBe("Experience Confirmed");
    expect(bookingRequestLabel("rejected")).toBe("Request Declined");
  });
});
