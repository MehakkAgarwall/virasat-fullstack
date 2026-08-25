import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ apiRequest: vi.fn() }));

vi.mock("./api", () => ({
  API_BASE_URL: "https://backend.example.test",
  ROUTE_REQUEST_TIMEOUT_MS: 18_000,
  apiRequest: mocks.apiRequest,
}));

beforeEach(() => {
  mocks.apiRequest.mockReset();
});

describe("FastAPI route discovery adapter", () => {
  it("sends the audited route body including optional labels and preserves the backend distance and summary", async () => {
    mocks.apiRequest.mockResolvedValue({
      route_point_count: 1552,
      crafts_found: 1,
      crafts: [{
        id: 45,
        name: "Blue Pottery",
        category: "Handicraft",
        state: "Rajasthan",
        district: "Jaipur",
        description: "A glazed pottery tradition.",
        ai_description: null,
        lat: 26.9124,
        lng: 75.7873,
        image_url: null,
        distance_from_route_km: 0,
      }],
      trip_summary: "A cultural route between Jaipur and Delhi.",
    });
    const { discoverRoute } = await import("./routeService");

    const result = await discoverRoute("Jaipur", "Delhi");

    expect(mocks.apiRequest).toHaveBeenCalledWith("/trip/crafts-along-route", expect.objectContaining({
      method: "POST",
      body: JSON.stringify({
        start_lat: 26.9124,
        start_lng: 75.7873,
        end_lat: 28.6139,
        end_lng: 77.209,
        buffer_km: 50,
        start_label: "Jaipur",
        end_label: "Delhi",
        include_summary: true,
      }),
    }), 18_000);
    expect(result.source).toBe("api");
    expect(result.tripSummary).toBe("A cultural route between Jaipur and Delhi.");
    expect(result.experience.crafts[0]?.distance).toBe("0.0 km from route");
  });

  it("uses the existing nationwide curated journeys when the route service is unavailable", async () => {
    mocks.apiRequest.mockRejectedValue(new Error("Service unavailable"));
    const { discoverRoute } = await import("./routeService");

    const routes = await Promise.all([
      discoverRoute("Delhi", "Jaipur"),
      discoverRoute("Mumbai", "Ahmedabad"),
      discoverRoute("Chennai", "Madurai"),
    ]);

    expect(routes.map((result) => result.source)).toEqual(["mock", "mock", "mock"]);
    expect(routes.every((result) => result.experience.crafts.length > 0)).toBe(true);
    expect(routes.map((result) => result.fallbackReason)).toEqual(["Service unavailable", "Service unavailable", "Service unavailable"]);
  });
});
