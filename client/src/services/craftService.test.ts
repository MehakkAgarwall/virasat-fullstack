import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ apiRequest: vi.fn() }));

vi.mock("./api", () => ({
  API_BASE_URL: "https://backend.example.test",
  apiRequest: mocks.apiRequest,
}));

const apiCraft = {
  id: 34,
  name: "Channapatna Toys",
  category: "Handicraft",
  state: "Karnataka",
  district: "Ramanagara",
  description: "Colourful lacquered wooden toys.",
  ai_description: null,
  lat: 12.6519,
  lng: 77.2004,
  image_url: null,
};

beforeEach(() => {
  mocks.apiRequest.mockReset();
});

describe("FastAPI craft service adapter", () => {
  it("normalizes GET /crafts records into the retained Virāsat craft-card shape", async () => {
    mocks.apiRequest.mockResolvedValue([apiCraft]);
    const { fetchCraftCatalogue } = await import("./craftService");

    const result = await fetchCraftCatalogue();

    expect(mocks.apiRequest).toHaveBeenCalledWith("/crafts");
    expect(result.source).toBe("api");
    expect(result.crafts[0]).toMatchObject({
      id: "api-34",
      name: "Channapatna Toys",
      region: "Ramanagara",
      state: "Karnataka",
      coordinates: [12.6519, 77.2004],
    });
  });

  it("retains the current mock catalogue when GET /crafts is unavailable", async () => {
    mocks.apiRequest.mockRejectedValue(new Error("Network unavailable"));
    const { fetchCraftCatalogue } = await import("./craftService");

    const result = await fetchCraftCatalogue();

    expect(result.source).toBe("mock");
    expect(result.crafts[0]?.id).toBe("channapatna");
    expect(result.fallbackReason).toBe("Network unavailable");
  });

  it("uses the confirmed numeric and regional FastAPI paths plus the health check", async () => {
    mocks.apiRequest
      .mockResolvedValueOnce(apiCraft)
      .mockResolvedValueOnce([apiCraft])
      .mockResolvedValueOnce({ status: "ok", service: "kalatrail-backend" });
    const { checkBackendHealth, fetchCraftById, fetchCraftsByRegion } = await import("./craftService");

    const individual = await fetchCraftById(34);
    const regional = await fetchCraftsByRegion("karnataka");
    const health = await checkBackendHealth();

    expect(mocks.apiRequest).toHaveBeenNthCalledWith(1, "/crafts/id/34");
    expect(mocks.apiRequest).toHaveBeenNthCalledWith(2, "/crafts/karnataka");
    expect(mocks.apiRequest).toHaveBeenNthCalledWith(3, "/health");
    expect(individual.source).toBe("api");
    expect(regional.source).toBe("api");
    expect(health).toEqual({ status: "ok", service: "kalatrail-backend" });
  });

  it("issues a fresh numeric request when the live craft control is refreshed", async () => {
    mocks.apiRequest.mockResolvedValue(apiCraft);
    const { fetchCraftById } = await import("./craftService");

    const firstLookup = await fetchCraftById(111);
    const refreshedLookup = await fetchCraftById(111);

    expect(mocks.apiRequest).toHaveBeenNthCalledWith(1, "/crafts/id/111");
    expect(mocks.apiRequest).toHaveBeenNthCalledWith(2, "/crafts/id/111");
    expect(firstLookup.source).toBe("api");
    expect(refreshedLookup.source).toBe("api");
  });
});
