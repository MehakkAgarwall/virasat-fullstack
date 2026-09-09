import { indiaLocations, resolveIndiaLocation } from "../data/routeDiscovery";

export type CraftPlannerIntent = {
  craftId: string;
  place: string;
  routeDestination: string;
  usesRegionalGateway: boolean;
};

function resolveRouteDestination(region: string, state: string) {
  const direct = resolveIndiaLocation(region)?.name;
  if (direct) return direct;
  return indiaLocations.find((location) => location.state === state)?.name ?? region;
}

export function createCraftPlannerHref(craftId: string, region: string, state: string) {
  const place = `${region}, ${state}`;
  const routeDestination = resolveRouteDestination(region, state);
  const params = new URLSearchParams({ craft: craftId, place, gateway: routeDestination });
  return `/planner?${params.toString()}`;
}

export function readCraftPlannerIntent(search: string): CraftPlannerIntent | null {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const craftId = params.get("craft")?.trim();
  const place = params.get("place")?.trim();
  const [region = "", state = ""] = place?.split(",").map((part) => part.trim()) ?? [];
  const routeDestination = params.get("gateway")?.trim() || (region && state ? resolveRouteDestination(region, state) : "");
  return craftId && place && routeDestination ? { craftId, place, routeDestination, usesRegionalGateway: region !== routeDestination } : null;
}
