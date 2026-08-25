import { describe, expect, it } from "vitest";
import { productAvailability } from "./ShopCraftSection";

describe("Shop the Craft availability language", () => {
  it("uses only a published quantity supplied by the linked Artisan", () => {
    expect(productAvailability(4)).toBe("4 published available");
  });

  it("does not invent stock when the Artisan has not published a positive quantity", () => {
    expect(productAvailability(0)).toBe("Availability to confirm");
  });
});
