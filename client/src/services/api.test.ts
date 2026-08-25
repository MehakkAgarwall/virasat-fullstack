import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiRequestError, apiRequest, LIVE_REQUEST_TIMEOUT_MS, ROUTE_REQUEST_TIMEOUT_MS } from "./api";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("FastAPI environment boundary", () => {
  it("reaches the configured live health endpoint through the environment", async () => {
    const baseUrl = process.env.VITE_API_BASE_URL;

    expect(baseUrl).toMatch(/^https:\/\//);
    const response = await globalThis.fetch(`${baseUrl}/health`);

    expect(response.ok).toBe(true);
    expect(await response.json()).toBeTypeOf("object");
  }, 15_000);

  it("bounds a stalled live request so route discovery can use its existing fallback", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", vi.fn((_input: string, init?: RequestInit) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
    })));

    const expectation = expect(apiRequest("/trip/crafts-along-route")).rejects.toMatchObject<Partial<ApiRequestError>>({ message: expect.stringContaining("took too long") });
    await vi.advanceTimersByTimeAsync(12_000);

    await expectation;
  });

  it("allows a modestly longer but still bounded window for route discovery", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", vi.fn((_input: string, init?: RequestInit) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
    })));

    expect(ROUTE_REQUEST_TIMEOUT_MS).toBeGreaterThan(LIVE_REQUEST_TIMEOUT_MS);
    const expectation = expect(apiRequest("/trip/crafts-along-route", {}, ROUTE_REQUEST_TIMEOUT_MS)).rejects.toMatchObject<Partial<ApiRequestError>>({ message: expect.stringContaining("took too long") });
    await vi.advanceTimersByTimeAsync(ROUTE_REQUEST_TIMEOUT_MS);

    await expectation;
  });
});
