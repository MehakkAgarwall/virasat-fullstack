// Virāsat Traveller demo boundary: local-only journey state that can be replaced by FastAPI calls without changing page UI.
import type { CulturalOpportunity } from "../data/opportunities";
import type { RouteExperience } from "../data/routeDiscovery";
import { publishDemoState } from "./demoStatePersistence";

export type TravellerDemoState = { savedCraftIds: string[]; cartProductIds: string[]; pickupProductIds: string[]; trail: CulturalOpportunity[]; routeExperience: RouteExperience | null; origin: string; destination: string; source: "api" | "mock" | null; };
const STORAGE_KEY = "virasat-traveller-demo-state";
const initialState = (): TravellerDemoState => ({ savedCraftIds: [], cartProductIds: [], pickupProductIds: [], trail: [], routeExperience: null, origin: "", destination: "", source: null });
const read = (): TravellerDemoState => { if (typeof window === "undefined") return initialState(); try { return { ...initialState(), ...(JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as Partial<TravellerDemoState>) }; } catch { return initialState(); } };
const write = (state: TravellerDemoState) => { if (typeof window !== "undefined") { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); publishDemoState("traveller", state); } return state; };
const toggle = (items: string[], value: string) => items.includes(value) ? items.filter((item) => item !== value) : [...items, value];

export const travellerDemoService = {
  getState: read,
  toggleSavedCraft(id: string) { const state = read(); return write({ ...state, savedCraftIds: toggle(state.savedCraftIds, id) }); },
  toggleCartProduct(id: string) { const state = read(); return write({ ...state, cartProductIds: toggle(state.cartProductIds, id) }); },
  togglePickupProduct(id: string) { const state = read(); return write({ ...state, pickupProductIds: toggle(state.pickupProductIds, id) }); },
  saveTrail(payload: Pick<TravellerDemoState, "origin" | "destination" | "routeExperience" | "trail" | "source">) { return write({ ...read(), ...payload }); },
  removeTrailStop(id: string) { const state = read(); return write({ ...state, trail: state.trail.filter((item) => item.id !== id) }); },
};
