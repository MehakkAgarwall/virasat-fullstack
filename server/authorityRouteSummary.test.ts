import { describe, expect, it } from "vitest";
import { projectAuthorityPlannedRoutes } from "./db";

describe("Authority planned-route projection", () => {
  it("groups matching persisted trails without exposing their subject identity or private state", () => {
    const routes = projectAuthorityPlannedRoutes([
      {
        updatedAt: new Date("2026-08-22T03:00:00Z"),
        payload: {
          origin: "Delhi",
          destination: "Varanasi",
          source: "api",
          routeExperience: { origin: { name: "Delhi" }, destination: { name: "Varanasi" }, crafts: [{ id: "api-104" }, { id: "api-112" }] },
          savedCraftIds: ["api-104"],
          travellerName: "Private traveller",
        },
      },
      {
        updatedAt: new Date("2026-08-21T03:00:00Z"),
        payload: {
          routeExperience: { origin: { name: "Delhi" }, destination: { name: "Varanasi" }, crafts: [{ id: "api-104" }] },
          source: "mock",
        },
      },
    ]);

    expect(routes).toEqual([expect.objectContaining({ id: "delhi::varanasi", origin: "Delhi", destination: "Varanasi", stopCount: 2, source: "api", planCount: 2 })]);
    expect(routes[0]).not.toHaveProperty("subjectKey");
    expect(routes[0]).not.toHaveProperty("travellerName");
  });

  it("skips state snapshots without a saved origin-to-destination route", () => {
    expect(projectAuthorityPlannedRoutes([{ updatedAt: new Date(), payload: { savedCraftIds: ["api-104"] } }])).toEqual([]);
  });
});
