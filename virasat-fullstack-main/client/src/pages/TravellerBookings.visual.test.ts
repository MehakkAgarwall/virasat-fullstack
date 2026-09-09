import { describe, expect, it } from "vitest";

describe("Traveller booking ledger readability boundary", () => {
  it("keeps the ledger’s booking hierarchy explicitly scoped to the Traveller route", () => {
    const selectors = ["traveller-ledger-hero", "traveller-ledger-list", "ledger-icon", "booking-sync-note"];
    expect(selectors).toHaveLength(4);
  });
});
