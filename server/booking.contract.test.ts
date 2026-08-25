import { describe, expect, it } from "vitest";
import { bookingStatus } from "../drizzle/schema";
import { appRouter } from "./routers";

describe("minimum booking contract", () => {
  it("exposes only the required managed booking operations", () => {
    const procedures = Object.keys((appRouter as any)._def.record.booking).sort();
    expect(procedures).toEqual(["create", "getExperience", "listForArtisan", "listForTraveller", "removeForTraveller", "updateStatus"]);
  });

  it("defines the three persisted booking statuses", () => {
    expect((bookingStatus as any).config.enumValues).toEqual(["pending", "accepted", "rejected"]);
  });
});
