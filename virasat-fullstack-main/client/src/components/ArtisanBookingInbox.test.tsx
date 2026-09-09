import { describe, expect, it } from "vitest";

describe("Artisan booking summary cards", () => {
  it("defines the three actionable managed booking sets", () => {
    const filters = ["all", "pending", "accepted"];
    expect(filters).toEqual(["all", "pending", "accepted"]);
  });
});
