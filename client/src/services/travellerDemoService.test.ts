import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ publishDemoState: vi.fn() }));

vi.mock("./demoStatePersistence", () => ({ publishDemoState: mocks.publishDemoState }));

const storage = new Map<string, string>();

beforeEach(() => {
  storage.clear();
  mocks.publishDemoState.mockClear();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
    },
  });
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      localStorage: globalThis.localStorage,
    },
  });
});

afterEach(() => {
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: undefined });
  Object.defineProperty(globalThis, "window", { configurable: true, value: undefined });
  vi.resetModules();
});

describe("Traveller local convenience state", () => {
  it("persists local saved-craft state without creating a cross-role booking fixture", async () => {
    const { travellerDemoService } = await import("./travellerDemoService");

    travellerDemoService.toggleSavedCraft("api-111");
    travellerDemoService.toggleSavedCraft("api-111");
    travellerDemoService.toggleSavedCraft("api-111");

    expect(travellerDemoService.getState().savedCraftIds).toEqual(["api-111"]);
    expect(mocks.publishDemoState).toHaveBeenLastCalledWith("traveller", expect.objectContaining({
      savedCraftIds: ["api-111"],
    }));
  });
});
