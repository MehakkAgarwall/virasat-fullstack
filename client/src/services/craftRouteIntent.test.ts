import { describe, expect, it } from "vitest";
import { createCraftPlannerHref, readCraftPlannerIntent } from "./craftRouteIntent";

describe("craft planner intent", () => {
  it("creates and reads a craft-detail detour target without losing the regional destination", () => {
    const href = createCraftPlannerHref("api-115", "Puri", "Odisha");
    expect(href).toBe("/planner?craft=api-115&place=Puri%2C+Odisha&gateway=Bhubaneswar");
    expect(readCraftPlannerIntent(href.split("?")[1] ?? "")).toEqual({ craftId: "api-115", place: "Puri, Odisha", routeDestination: "Bhubaneswar", usesRegionalGateway: true });
  });

  it("ignores incomplete query data rather than inventing a detour target", () => {
    expect(readCraftPlannerIntent("?craft=api-115")).toBeNull();
  });
});
