import { describe, expect, it } from "vitest";
import { culturalResources } from "../drizzle/schema";
import { appRouter } from "./routers";

describe("cultural resource contract", () => {
  it("keeps source-linked discoveries separate from managed bookable experiences", () => {
    expect(culturalResources.craftId.name).toBe("craftId");
    expect(culturalResources.sourceUrl.name).toBe("sourceUrl");
    expect(culturalResources.imageUrl.name).toBe("imageUrl");
    expect("price" in culturalResources).toBe(false);
    expect("capacity" in culturalResources).toBe(false);
    expect("artisanKey" in culturalResources).toBe(false);
  });

  it("exposes read-only list and lookup operations", () => {
    expect(Object.keys((appRouter as any)._def.record.culturalResource).sort()).toEqual(["get", "list"]);
  });
});
