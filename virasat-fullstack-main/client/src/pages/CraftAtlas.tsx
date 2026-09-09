import { ArrowRight, Compass, MapPinned, Search, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { CraftAtlasMap } from "../components/CraftAtlasMap";
import { MobileBottomNav } from "../components/MobileBottomNav";
import { TopNav } from "../components/TopNav";
import type { CraftDetailExperience } from "../services/craftDetailExperience";
import { findBookableExperienceForCraft, formatPublishedExperiencePrice } from "../services/craftDetailExperience";
import { backendCraftId, fetchCraftAtlasCatalogue, type AtlasCraft } from "../services/craftService";
import { getCraftHeritageContextByFrontendId, getPublishedCraftJourney } from "../services/heritageEnrichmentService";
import { createCraftPlannerHref } from "../services/craftRouteIntent";
import { trpc } from "../lib/trpc";

type AtlasFilter = "All crafts" | "Textile" | "Metal" | "Wood" | "Pottery" | "Other";

const filterOrder: AtlasFilter[] = ["All crafts", "Textile", "Metal", "Wood", "Pottery", "Other"];

const craftFamily = (craft: AtlasCraft): Exclude<AtlasFilter, "All crafts"> => {
  const category = `${craft.category} ${craft.name}`.toLowerCase();
  if (/(textile|silk|weav|saree|doria|fabric)/.test(category)) return "Textile";
  if (/(metal|brass|copper|bidri|zardozi|scissor)/.test(category)) return "Metal";
  if (/(wood|toy|lacquer|rosewood|carv)/.test(category)) return "Wood";
  if (/(pottery|ceramic|terracotta|clay)/.test(category)) return "Pottery";
  if (/(embroider|chikan|needle)/.test(category)) return "Textile";
  return "Other";
};

const provenanceLabel = (craft: AtlasCraft) => {
  const context = getCraftHeritageContextByFrontendId(craft.id);
  if (context?.gi?.status === "verified" && context?.odop?.status === "verified") return "GI + ODOP verified";
  if (context?.gi?.status === "verified") return "GI verified";
  if (context?.odop?.status === "verified") return "ODOP verified";
  return "Live Railway record";
};

type AtlasSelectedRecordProps = {
  selected: AtlasCraft;
  selectedExperience?: CraftDetailExperience;
  selectedJourney: ReturnType<typeof getPublishedCraftJourney>;
  plannerHref: string;
  onClose: () => void;
};

function AtlasSelectedRecord({ selected, selectedExperience, selectedJourney, plannerHref, onClose }: AtlasSelectedRecordProps) {
  const makerHref = selectedExperience
    ? `/experience/${selectedExperience.id}`
    : selectedJourney?.experience
      ? `/experience/${selectedJourney.experience.slug}`
      : undefined;

  return <article className="craft-atlas-selection craft-atlas-map-selection" aria-live="polite">
    <button type="button" className="craft-atlas-selection-close" onClick={onClose} aria-label="Close selected craft record"><X size={16} /></button>
    <span className="eyebrow">Live craft record</span>
    <h2>{selected.name}</h2>
    <p className="craft-atlas-place">{selected.region}, {selected.state}</p>
    <div className="craft-atlas-tags"><span>{craftFamily(selected).toUpperCase()}</span><span>{provenanceLabel(selected).toUpperCase()}</span></div>
    <p className="craft-atlas-card-description">{selected.description}</p>
    {makerHref ? <Link className="craft-atlas-maker-link" href={makerHref}>Meet a local maker <ArrowRight size={14} /></Link> : <div className="craft-atlas-empty-experience"><Sparkles size={15} /><span>No maker experience published yet.</span></div>}
    <div className="craft-atlas-selection-actions"><Link href={`/craft/${selected.id}`}>View craft story <ArrowRight size={15} /></Link><Link href={plannerHref}>Trace detour <MapPinned size={14} /></Link></div>
  </article>;
}

export default function CraftAtlas() {
  const [catalogue, setCatalogue] = useState<AtlasCraft[]>([]);
  const [source, setSource] = useState<"api" | "mock">("api");
  const [fallbackReason, setFallbackReason] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<AtlasFilter>("All crafts");
  const [selected, setSelected] = useState<AtlasCraft | null>(null);
  const publishedExperiencesQuery = trpc.experience.listPublished.useQuery();
  const publishedExperiences = (publishedExperiencesQuery.data ?? []) as CraftDetailExperience[];

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchCraftAtlasCatalogue().then((result) => {
      if (!mounted) return;
      setCatalogue(result.crafts);
      setSource(result.source);
      setFallbackReason(result.fallbackReason);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const availableFilters = useMemo(() => filterOrder.filter((item) => item === "All crafts" || catalogue.some((craft) => craftFamily(craft) === item)), [catalogue]);
  const filteredCrafts = useMemo(() => catalogue.filter((craft) => {
    const text = `${craft.name} ${craft.region} ${craft.state} ${craft.category}`.toLowerCase();
    return (filter === "All crafts" || craftFamily(craft) === filter) && text.includes(query.trim().toLowerCase());
  }), [catalogue, filter, query]);
  const searchSuggestions = useMemo(() => query.trim().length >= 2 ? filteredCrafts.slice(0, 5) : [], [filteredCrafts, query]);
  const mappedCrafts = useMemo(() => source === "api" ? filteredCrafts.filter((craft) => craft.atlasCoordinates) : [], [filteredCrafts, source]);
  const unmappedCrafts = useMemo(() => source === "api" ? filteredCrafts.filter((craft) => !craft.atlasCoordinates) : filteredCrafts, [filteredCrafts, source]);
  const stateCount = new Set(catalogue.map((craft) => craft.state).filter((state) => state && state !== "India")).size;
  const enrichedCount = catalogue.filter((craft) => {
    const context = getCraftHeritageContextByFrontendId(craft.id);
    return context?.gi?.status === "verified" || context?.odop?.status === "verified";
  }).length;

  useEffect(() => {
    if (!query.trim()) return;
    const exact = filteredCrafts.find((craft) => craft.name.toLowerCase() === query.trim().toLowerCase());
    if (exact) setSelected(exact);
  }, [filteredCrafts, query]);

  const selectedCraftId = selected ? backendCraftId(selected.id) : null;
  const selectedJourney = selected ? getPublishedCraftJourney(selectedCraftId) : undefined;
  const selectedExperience = findBookableExperienceForCraft(publishedExperiences, selectedCraftId);
  const selectedPlannerHref = selected ? createCraftPlannerHref(selected.id, selected.region, selected.state) : "/planner";

  return <div className="app-shell craft-atlas-page"><TopNav dark /><main>
    <section className="craft-atlas-hero">
      <div className="craft-atlas-noise" aria-hidden="true" />
      <div className="container craft-atlas-layout">
        <aside className="craft-atlas-intro">
          <span className="eyebrow"><Compass size={13} />Living Craft Atlas</span>
          <h1>65 crafts.<br /><em>One living map.</em></h1>
          <p>Trace India’s living craft traditions by place, material, and story.</p>
          <div className="craft-atlas-stats" aria-label="Craft Atlas statistics">
            <span><b>{catalogue.length || "—"}</b><small>Live crafts</small></span>
            <span><b>{stateCount || "—"}</b><small>Regions</small></span>
            <span><b>{enrichedCount || "—"}</b><small>GI / ODOP</small></span>
          </div>
          <p className="craft-atlas-live-catalogue">Live catalogue <i /> Railway data</p>
          <div className="craft-atlas-search-stack"><div className="craft-atlas-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a craft, place or tradition" aria-label="Search the Craft Atlas" />{query && <button type="button" onClick={() => setQuery("")} aria-label="Clear craft search"><X size={14} /></button>}</div>
            {searchSuggestions.length > 0 && <div className="craft-atlas-suggestions" role="listbox" aria-label="Live Railway craft suggestions">{searchSuggestions.map((craft) => <button key={craft.id} type="button" role="option" onClick={() => { setSelected(craft); setQuery(craft.name); }}><span>{craft.name}</span><small>{craft.region}, {craft.state}</small></button>)}</div>}
          </div>
          <div className="craft-atlas-filters" aria-label="Craft category filters">{availableFilters.map((item) => <button key={item} type="button" className={filter === item ? "is-active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div>
          <Link className="craft-atlas-route-link" href={selectedPlannerHref}><MapPinned size={15} />Trace a route through craft <ArrowRight size={15} /></Link>
          {source === "mock" && <p className="craft-atlas-source-note">Live Railway locations are unavailable right now. Unofficial map points are not shown.{fallbackReason ? ` ${fallbackReason}` : ""}</p>}
        </aside>

        <section className={`craft-atlas-stage ${selected ? "has-selection" : ""}`} aria-label="Interactive map of live craft records">
          {loading ? <div className="craft-atlas-loading"><span className="eyebrow">Connecting live craft archive</span><h2>Plotting the<br /><em>living map.</em></h2></div> : <CraftAtlasMap crafts={mappedCrafts} selectedId={selected?.id} onSelect={setSelected} />}
          <div className="craft-atlas-map-caption"><span>{mappedCrafts.length} source-located records</span><i /><span>{unmappedCrafts.length} location to be verified</span></div>
          {selected && <AtlasSelectedRecord selected={selected} selectedExperience={selectedExperience ?? undefined} selectedJourney={selectedJourney} plannerHref={selectedPlannerHref} onClose={() => setSelected(null)} />}
        </section>
      </div>
    </section>

    <section className="craft-atlas-records section-pad"><div className="container">
      {!selected && <article className="craft-atlas-selection craft-atlas-selection-empty"><MapPinned size={22} /><h2>Follow a golden point.</h2><p>Select a source-located craft marker, or use search to open its living record.</p></article>}

      {unmappedCrafts.length > 0 && <section className="craft-atlas-unmapped"><span className="eyebrow">Location to be verified</span><p>These live records have no precise source coordinates, so they are not placed on the map.</p><div>{unmappedCrafts.slice(0, 12).map((craft) => <Link key={craft.id} href={`/craft/${craft.id}`}>{craft.name}<small>{craft.region}, {craft.state}</small><ArrowRight size={13} /></Link>)}</div></section>}
    </div></section>
  </main><MobileBottomNav role="traveller" /></div>;
}
