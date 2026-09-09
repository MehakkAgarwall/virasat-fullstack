import { describe, expect, it } from "vitest";
import { shouldSyncDemoStateForPathname } from "./DemoStatePersistence";

describe("DemoStatePersistence route boundary", () => {
  it("does not start the unrelated tRPC demo-state query for live Railway craft records", () => {
    expect(shouldSyncDemoStateForPathname("/craft/api-111")).toBe(false);
  });

  it("preserves managed demo-state synchronization for interactive Traveller and Artisan routes", () => {
    expect(shouldSyncDemoStateForPathname("/explore")).toBe(true);
    expect(shouldSyncDemoStateForPathname("/artisan")).toBe(true);
  });
});
