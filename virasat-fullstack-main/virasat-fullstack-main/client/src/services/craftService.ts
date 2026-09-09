import { crafts as mockCrafts, type Craft } from "../data/mock";
import { apiRequest, API_BASE_URL } from "./api";

export type BackendCraft = {
  id: number;
  name: string;
  category?: string | null;
  state?: string | null;
  district?: string | null;
  description?: string | null;
  ai_description?: string | null;
  lat?: number | null;
  lng?: number | null;
  image_url?: string | null;
};

export type CraftCatalogueResult = {
  crafts: Craft[];
  source: "api" | "mock";
  endpoint: string;
  fallbackReason?: string;
};

export type AtlasCraft = Craft & {
  sourceCraftId: number | null;
  /** Present only when the upstream Railway record supplied latitude and longitude. */
  atlasCoordinates: [number, number] | null;
};

export type CraftAtlasCatalogueResult = {
  crafts: AtlasCraft[];
  source: "api" | "mock";
  endpoint: string;
  fallbackReason?: string;
};

export type CraftLookupResult = {
  craft: Craft;
  source: "api" | "mock";
  endpoint: string;
  fallbackReason?: string;
};

const assetFor = (craft: BackendCraft) => {
  if (craft.image_url) return craft.image_url;
  const category = craft.category?.toLowerCase() ?? "";
  if (category.includes("textile")) return "/manus-storage/virasat-craft-weaving_76580db7.jpg";
  if (category.includes("metal")) return "/manus-storage/virasat-craft-metalwork_f249c877.jpg";
  return "/manus-storage/virasat-craft-terracotta_b9573ecd.jpg";
};

export const backendCraftId = (id: string) => {
  const match = /^api-(\d+)$/.exec(id);
  return match ? Number(match[1]) : null;
};

export const normalizeBackendCraft = (craft: BackendCraft, index = 0): Craft => ({
  id: `api-${craft.id}`,
  name: craft.name,
  region: craft.district || craft.state || "Regional craft",
  state: craft.state || "India",
  description: craft.ai_description || craft.description || "A living craft practice recorded along India’s cultural routes.",
  category: craft.category || "Craft tradition",
  image: assetFor(craft),
  distance: "Location record",
  detour: "Trace route for detour",
  duration: "Maker visit",
  accent: ["#b96745", "#967943", "#35564c", "#91553d"][index % 4],
  coordinates: [Number(craft.lat) || 20 + index, Number(craft.lng) || 78 + index],
});

const normalizeAtlasCraft = (craft: BackendCraft, index = 0): AtlasCraft => {
  const lat = Number(craft.lat);
  const lng = Number(craft.lng);
  return {
    ...normalizeBackendCraft(craft, index),
    sourceCraftId: craft.id,
    atlasCoordinates: Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null,
  };
};

const fallback = (endpoint: string, error: unknown): CraftCatalogueResult => ({
  crafts: mockCrafts,
  source: "mock",
  endpoint,
  fallbackReason: error instanceof Error ? error.message : "The live craft service is unavailable.",
});

export async function fetchCraftCatalogue(): Promise<CraftCatalogueResult> {
  const endpoint = "/crafts";
  try {
    const records = await apiRequest<BackendCraft[]>(endpoint);
    return { crafts: records.map(normalizeBackendCraft), source: "api", endpoint: `${API_BASE_URL}${endpoint}` };
  } catch (error) {
    return fallback(`${API_BASE_URL}${endpoint}`, error);
  }
}

/**
 * Atlas-specific reader that deliberately avoids the display adapter's
 * synthetic fallback coordinates. A map marker appears only when its location
 * came directly from the Railway craft record.
 */
export async function fetchCraftAtlasCatalogue(): Promise<CraftAtlasCatalogueResult> {
  const endpoint = "/crafts";
  try {
    const records = await apiRequest<BackendCraft[]>(endpoint);
    return {
      crafts: records.map(normalizeAtlasCraft),
      source: "api",
      endpoint: `${API_BASE_URL}${endpoint}`,
    };
  } catch (error) {
    return {
      crafts: mockCrafts.map((craft) => ({
        ...craft,
        sourceCraftId: backendCraftId(craft.id),
        atlasCoordinates: null,
      })),
      source: "mock",
      endpoint: `${API_BASE_URL}${endpoint}`,
      fallbackReason: error instanceof Error ? error.message : "The live craft service is unavailable.",
    };
  }
}

export async function fetchCraftsByRegion(region: string): Promise<CraftCatalogueResult> {
  const endpoint = `/crafts/${encodeURIComponent(region)}`;
  try {
    const records = await apiRequest<BackendCraft[]>(endpoint);
    return { crafts: records.map(normalizeBackendCraft), source: "api", endpoint: `${API_BASE_URL}${endpoint}` };
  } catch (error) {
    const query = region.toLowerCase();
    const filtered = mockCrafts.filter((craft) => `${craft.region} ${craft.state}`.toLowerCase().includes(query));
    return {
      crafts: filtered.length ? filtered : mockCrafts,
      source: "mock",
      endpoint: `${API_BASE_URL}${endpoint}`,
      fallbackReason: error instanceof Error ? error.message : "The live craft service is unavailable.",
    };
  }
}

export async function fetchCraftById(id: number): Promise<CraftLookupResult> {
  const endpoint = `/crafts/id/${id}`;
  try {
    const record = await apiRequest<BackendCraft>(endpoint);
    return { craft: normalizeBackendCraft(record), source: "api", endpoint: `${API_BASE_URL}${endpoint}` };
  } catch (error) {
    const fallbackCraft = mockCrafts[0];
    return {
      craft: fallbackCraft,
      source: "mock",
      endpoint: `${API_BASE_URL}${endpoint}`,
      fallbackReason: error instanceof Error ? error.message : "The live craft service is unavailable.",
    };
  }
}

export async function checkBackendHealth() {
  return apiRequest<{ status: string; service: string }>("/health");
}
