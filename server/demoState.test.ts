import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => ({
  listDemoStates: vi.fn(),
  listAuthorityPlannedRoutes: vi.fn(),
  saveDemoState: vi.fn(),
}));

vi.mock("./db", () => mocks);

import { appRouter } from "./routers";

function createContext() {
  return {
    user: null,
    req: { protocol: "https", headers: {} },
    res: { clearCookie: vi.fn() },
  } as unknown as TrpcContext;
}

describe("demo-state router", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns saved snapshots for a stable demo identity", async () => {
    mocks.listDemoStates.mockResolvedValue([{ scope: "traveller", payload: { savedCraftIds: ["bidriware"] }, updatedAt: new Date("2026-08-17") }]);
    const result = await appRouter.createCaller(createContext()).demoState.list({ subjectKey: "demo-traveller" });
    expect(mocks.listDemoStates).toHaveBeenCalledWith("demo-traveller");
    expect(result[0]?.payload).toEqual({ savedCraftIds: ["bidriware"] });
  });

  it("persists a Traveller snapshot through the public demo boundary", async () => {
    mocks.saveDemoState.mockResolvedValue({ scope: "traveller", payload: { bookings: [] }, updatedAt: new Date("2026-08-17") });
    await appRouter.createCaller(createContext()).demoState.save({ subjectKey: "demo-traveller", scope: "traveller", payload: { bookings: [] } });
    expect(mocks.saveDemoState).toHaveBeenCalledWith({ subjectKey: "demo-traveller", scope: "traveller", payload: { bookings: [] } });
  });

  it("returns anonymous persisted route summaries to the Authority workspace", async () => {
    mocks.listAuthorityPlannedRoutes.mockResolvedValue([{ id: "delhi::varanasi", origin: "Delhi", destination: "Varanasi", stopCount: 3, source: "api", planCount: 1, updatedAt: new Date("2026-08-22") }]);
    const result = await appRouter.createCaller(createContext()).authority.plannedRoutes();
    expect(mocks.listAuthorityPlannedRoutes).toHaveBeenCalledOnce();
    expect(result[0]).toMatchObject({ origin: "Delhi", destination: "Varanasi", stopCount: 3 });
  });
});
