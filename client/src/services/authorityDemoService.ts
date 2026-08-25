// Virāsat Authority demo boundary: regional intelligence is local mock data now and can map to future reporting APIs later.
import { publishDemoState } from "./demoStatePersistence";
export type AuthorityVerification = { id: string; name: string; craft: string; location: string; status: "Pending" | "Verified" | "Rejected" | "Suspended"; date: string };
export type AuthorityDemoState = { verifications: AuthorityVerification[]; generatedRegions: string[]; reviewedCrafts: string[] };
const STORAGE_KEY = "virasat-authority-demo-state";
const initial = (): AuthorityDemoState => ({ verifications: [{ id: "channapatna-maker", name: "Channapatna Maker Studio", craft: "Channapatna Toys", location: "Channapatna", status: "Pending", date: "12 Aug 2026" }, { id: "vijaya", name: "Vijaya Handloom", craft: "Mysore Silk", location: "Mysuru", status: "Pending", date: "10 Aug 2026" }, { id: "rao", name: "Rao Inlay Studio", craft: "Rosewood Inlay", location: "Mysuru", status: "Verified", date: "06 Aug 2026" }], generatedRegions: [], reviewedCrafts: [] });
const read = (): AuthorityDemoState => { if (typeof window === "undefined") return initial(); try { return { ...initial(), ...(JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as Partial<AuthorityDemoState>) }; } catch { return initial(); } };
const write = (state: AuthorityDemoState) => { if (typeof window !== "undefined") { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); publishDemoState("authority", state); } return state; };
export const authorityDemoService = {
  getState: read,
  advanceVerification(id: string) { const state = read(); return write({ ...state, verifications: state.verifications.map((item) => item.id === id ? { ...item, status: item.status === "Pending" ? "Verified" : item.status === "Verified" ? "Suspended" : "Pending" } : item) }); },
  generateRegionReport(region: string) { const state = read(); return write({ ...state, generatedRegions: state.generatedRegions.includes(region) ? state.generatedRegions : [...state.generatedRegions, region] }); },
  toggleCraftReviewed(craft: string) { const state = read(); return write({ ...state, reviewedCrafts: state.reviewedCrafts.includes(craft) ? state.reviewedCrafts.filter((item) => item !== craft) : [...state.reviewedCrafts, craft] }); },
};
