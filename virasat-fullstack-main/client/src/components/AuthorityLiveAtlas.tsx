import { ArrowRight, Compass, MapPinned, RefreshCw, Route, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { trpc } from "../lib/trpc";
import { fetchCraftAtlasCatalogue, type AtlasCraft } from "../services/craftService";
import { CraftAtlasMap } from "./CraftAtlasMap";

function formatUpdatedAt(value: Date | string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "recently" : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function AuthorityLiveAtlas() {
  const [crafts, setCrafts] = useState<AtlasCraft[]>([]);
  const [source, setSource] = useState<"api" | "mock">("api");
  const [fallbackReason, setFallbackReason] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AtlasCraft | null>(null);

  const refresh = () => {
    setLoading(true);
    fetchCraftAtlasCatalogue().then((result) => {
      setCrafts(result.crafts);
      setSource(result.source);
      setFallbackReason(result.fallbackReason);
      setLoading(false);
    });
  };

  useEffect(() => { refresh(); }, []);
  const mappedCrafts = useMemo(() => source === "api" ? crafts.filter((craft) => craft.atlasCoordinates) : [], [crafts, source]);
  const unmappedCount = source === "api" ? crafts.length - mappedCrafts.length : crafts.length;
  const stateCount = new Set(mappedCrafts.map((craft) => craft.state).filter(Boolean)).size;

  return <section className="role-page authority-live-atlas">
    <div className="workspace-hero compact authority-live-atlas-hero"><div><span className="eyebrow"><Compass size={12} />Live craft atlas</span><h2>Place the living<br /><em>record on the map.</em></h2><p>Markers appear only when the live Railway craft catalogue supplies precise coordinates. No approximate regional points are added.</p></div><button type="button" className="button button-ghost" onClick={refresh} disabled={loading}><RefreshCw size={15} className={loading ? "spin" : ""} />Refresh records</button></div>
    <div className="authority-atlas-stats"><span><b>{loading ? "—" : crafts.length}</b><small>live craft records</small></span><span><b>{loading ? "—" : mappedCrafts.length}</b><small>source-located markers</small></span><span><b>{loading ? "—" : stateCount}</b><small>mapped regions</small></span></div>
    <section className="authority-atlas-map-panel" aria-label="Live Railway craft marker atlas">{loading ? <div className="authority-atlas-loading"><span className="eyebrow">Connecting Railway catalogue</span><h3>Plotting the<br /><em>living archive.</em></h3></div> : <CraftAtlasMap crafts={mappedCrafts} selectedId={selected?.id} onSelect={setSelected} />}</section>
    <p className={`authority-atlas-source authority-atlas-source-${source}`}>{source === "api" ? <><i />Live Railway coordinate source · {mappedCrafts.length} markers shown{unmappedCount ? ` · ${unmappedCount} records await precise coordinates` : ""}</> : <><MapPinned size={14} />Live coordinate data is unavailable. No unverified craft points are displayed.{fallbackReason ? ` ${fallbackReason}` : ""}</>}</p>
    {selected ? <article className="authority-atlas-selection"><span className="eyebrow">Selected live record</span><h3>{selected.name}</h3><p>{selected.region}, {selected.state} · {selected.category}</p><p>{selected.description}</p><Link href={`/craft/${selected.id}`} className="underlined-link">Open craft record <ArrowRight size={14} /></Link></article> : <article className="authority-atlas-selection authority-atlas-selection-empty"><MapPinned size={17} /><span>Select a live craft marker to review its source record.</span></article>}
  </section>;
}

export function AuthorityPlannedRoutes() {
  const routesQuery = trpc.authority.plannedRoutes.useQuery(undefined, { refetchInterval: 15_000, refetchOnWindowFocus: true });
  const routes = routesQuery.data ?? [];
  return <section className="role-page authority-planned-routes">
    <div className="workspace-hero compact"><div><span className="eyebrow"><Route size={12} />Cultural route overview</span><h2>Journeys people<br /><em>are planning.</em></h2><p>These are anonymous summaries of persisted Traveller cultural trails. Personal identities, profiles, and private saved items are never shown here.</p></div><button type="button" className="button button-ghost" onClick={() => routesQuery.refetch()} disabled={routesQuery.isFetching}><RefreshCw size={15} className={routesQuery.isFetching ? "spin" : ""} />Refresh overview</button></div>
    {routesQuery.isLoading ? <div className="authority-route-loading"><span className="eyebrow">Reading persisted route summaries</span><h3>Tracing planned<br /><em>cultural trails.</em></h3></div> : routes.length ? <><div className="authority-route-summary"><span><b>{routes.length}</b> unique cultural route{routes.length === 1 ? "" : "s"}</span><span><b>{routes.reduce((total, route) => total + route.planCount, 0)}</b> persisted route plan{routes.reduce((total, route) => total + route.planCount, 0) === 1 ? "" : "s"}</span></div><div className="authority-route-list">{routes.map((route, index) => <article key={route.id}><span className="authority-route-index">{String(index + 1).padStart(2, "0")}</span><div className="authority-route-path"><strong>{route.origin}</strong><i /><strong>{route.destination}</strong></div><div className="authority-route-meta"><span>{route.stopCount} live craft {route.stopCount === 1 ? "stop" : "stops"}</span><span>{route.source === "api" ? "Live Railway route" : route.source === "mock" ? "Fallback route" : "Saved route"}</span><span>{route.planCount} saved plan{route.planCount === 1 ? "" : "s"}</span></div><small>Last saved {formatUpdatedAt(route.updatedAt)}</small></article>)}</div></> : <div className="authority-route-empty"><Sparkles size={19} /><span className="eyebrow">No persisted cultural trail yet</span><h3>Routes will appear<br /><em>when a Traveller saves one.</em></h3><p>The Authority view stays intentionally empty until a Traveller confirms and saves an origin-to-destination cultural route.</p><Link className="underlined-link" href="/planner">Open route planner <ArrowRight size={14} /></Link></div>}
  </section>;
}
