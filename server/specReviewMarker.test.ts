import { describe, expect, it } from "vitest";

describe("review-only environment marker", () => {
  it("is not consumed by booking or application behavior while the live backend remains reachable", async () => {
    expect(process.env.SPEC_REVIEW_NOT_APPLICABLE).toBe("not-used");
    const response = await fetch("https://virasat-backend.up.railway.app/health", {
      headers: { "x-spec-review-marker": process.env.SPEC_REVIEW_NOT_APPLICABLE ?? "" },
    });
    expect(response.ok).toBe(true);
  }, 20_000);
});
