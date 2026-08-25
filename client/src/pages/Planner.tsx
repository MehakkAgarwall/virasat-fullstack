import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownUp, ArrowRight, Check, Compass, MapPinned, Play, Route, Search, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearch } from "wouter";
import { CraftEditorialVisual } from "../components/CraftEditorialVisual";
import { GoogleJourneyMap } from "../components/GoogleJourneyMap";
import { toast } from "sonner";
import { CulturalOpportunityCard } from "../components/CulturalOpportunityCard";
import { MobileBottomNav } from "../components/MobileBottomNav";
import { TopNav } from "../components/TopNav";
import type { Craft } from "../data/mock";
import { optimizationModes, type CulturalOpportunity } from "../data/opportunities";
import { getExperiencePreviewMedia } from "../data/experiencePreviewMedia";
import { locationOptions, type RouteExperience } from "../data/routeDiscovery";
import { discoverRoute, type RouteDiscoveryResult } from "../services/routeService";
import { travellerDemoService } from "../services/travellerDemoService";
import { readCraftPlannerIntent } from "../services/craftRouteIntent";

export const CULTURAL_TRAIL_RESULT_VARIANT = "cultural-journey-hero-results";

type RouteFormProps = {
  origin: string;
  destination: string;
  onOrigin: (value: string) => void;
  onDestination: (value: string) => void;
  onSwap: () => void;
  onSubmit: () => void;
  isTracing: boolean;
  error: string | null;
  isDirty?: boolean;
  compact?: boolean;
  detourPlace?: string | null;
  onConfirmDetour?: () => void;
};

function RouteInputForm({ origin, destination, onOrigin, onDestination, onSwap, onSubmit, isTracing, error, isDirty = false, compact = false, detourPlace = null, onConfirmDetour }: RouteFormProps) {
  return <form className={`planner-route-form ${compact ? "planner-route-form-compact" : ""}`} onSubmit={(event) => { event.preventDefault(); onSubmit(); }}>
    <div className="planner-route-form-head"><span className="eyebrow">{compact ? "Change this route" : "Choose your route"}</span><small>Live route discovery first</small></div>
    {isTracing ? <div className="planner-tracing-state"><span className="eyebrow">The Cultural Detour Engine</span><div className="tracing-thread"><i /><i /><i /></div><h3>Tracing your <em>journey…</em></h3><p>Following the golden thread between place, maker, and memory.</p></div> : <>
      <label><span>Starting point</span><div><Compass size={16} /><input list="india-location-options" value={origin} onChange={(event) => onOrigin(event.target.value)} placeholder="Choose an Indian starting point" aria-label="Starting point" autoComplete="off" /></div></label>
      <button type="button" className="planner-swap" onClick={onSwap} disabled={!origin && !destination} aria-label="Swap starting point and destination"><ArrowDownUp size={15} /><span>Swap start and destination</span></button>
      <label><span>Destination</span><div><MapPinned size={16} /><input list="india-location-options" value={destination} onChange={(event) => onDestination(event.target.value)} placeholder="Choose an Indian destination" aria-label="Destination" autoComplete="off" /></div></label>
      <datalist id="india-location-options">{locationOptions.map((location) => <option key={location} value={location} />)}</datalist>
      <button className="button button-primary" type="submit"><Search size={15} />Calculate cultural route</button>
      {detourPlace && <div className="planner-detour-confirm"><span><b>Craft detour ready</b>{origin.trim() ? `${origin.trim()} → ${detourPlace}` : `Choose your origin to trace toward ${detourPlace}`}</span><button type="button" className="button button-outline" disabled={!origin.trim() || isTracing} onClick={onConfirmDetour}><Check size={14} />Confirm origin & trace detour</button></div>}
      {error && <p className="planner-route-error" role="alert">{error}</p>}
      {isDirty && <p className="planner-route-pending" role="status">Location changes are ready. Calculate the route to update the discoveries below.</p>}
      <div className="planner-route-promise"><span>01 / Trace route</span><i /><span>02 / Discover craft</span><i /><span>03 / Meet maker</span></div>
      <small>Type or choose a place from the current Indian location directory. Live discovery is attempted first; the existing curated fallback remains available if that service cannot respond.</small>
    </>}
  </form>;
}

function JourneyEditorialBridge({ routeExperience, selected }: { routeExperience: RouteExperience; selected: CulturalOpportunity }) {
  const craft = routeExperience.crafts.find((item) => item.id === selected.craftId) ?? routeExperience.crafts[0];
  if (!craft) return null;
  return <section className="journey-editorial-bridge"><div className="container journey-editorial-bridge-grid"><div className="journey-editorial-bridge-copy"><span className="eyebrow">Field note / along this route</span><h2>One journey,<br /><em>many hands.</em></h2><p>The route reveals a place. The place gives a craft its material language. From there, a traveller can follow the record to the people and cultural story around it.</p><div className="journey-editorial-steps"><span>Journey</span><i /><span>Route</span><i /><span>Craft</span><i /><span>Place</span><i /><span>Maker</span><i /><span>Story</span></div><Link href={`/craft/${craft.id}`} className="underlined-link">Follow {craft.name} from its route context <ArrowRight size={14} /></Link></div><div className="journey-editorial-bridge-visual"><CraftEditorialVisual craft={craft} index={1} label="Route-bound craft study" alt={`${craft.name} on the cultural route`} /><div><span className="eyebrow">Selected route moment</span><strong>{craft.name}</strong><small>{craft.region} · {selected.detour}</small></div></div></div></section>;
}

function JourneyPreviewReel({ routeExperience, selected }: { routeExperience: RouteExperience; selected: CulturalOpportunity }) {
  const craft = routeExperience.crafts.find((item) => item.id === selected.craftId) ?? routeExperience.crafts[0];
  if (!craft) return null;
  const previewMedia = getExperiencePreviewMedia({ opportunityId: selected.id, craftId: selected.craftId, title: selected.title, kind: selected.kind, image: selected.image });
  const stillLabel = selected.kind === "Artisan" ? "Maker preview" : selected.kind === "Heritage" ? "Experience preview" : "Craft in motion";
  const companionCraft = routeExperience.crafts.find((item) => item.id !== craft.id) ?? craft;
  return <section id="journey-preview" className="journey-preview-reel"><div className="container journey-preview-grid"><div className="journey-preview-copy"><span className="eyebrow">Before you go / visual preview</span><h2>See the journey<br /><em>take shape.</em></h2><p>Experience moments can open as motion previews. Craft and maker moments remain curated stills, so the rail never implies a video exists where it does not.</p><div className="journey-preview-steps"><span>Route</span><i /><span>Place</span><i /><span>Craft</span><i /><span>Maker</span></div></div><div className="journey-preview-film">{previewMedia?.previewType === "video" ? <div className="journey-preview-frame journey-preview-frame-primary journey-preview-frame-motion"><video className="journey-preview-frame-media" src={previewMedia.previewUrl} poster={previewMedia.thumbnailUrl ?? selected.image} autoPlay loop muted playsInline preload="metadata" aria-label={`${previewMedia.description} for ${selected.title}`} /><span><Play size={14} fill="currentColor" />{previewMedia.label}</span></div> : <div className="journey-preview-frame journey-preview-frame-primary journey-preview-frame-still"><img className="journey-preview-frame-media" src={previewMedia?.previewUrl ?? selected.image} alt={`${selected.title} editorial preview`} loading="lazy" /><span>{previewMedia?.label ?? stillLabel}</span></div>}<div className="journey-preview-frame journey-preview-frame-secondary journey-preview-frame-still"><CraftEditorialVisual craft={companionCraft} index={4} alt="Craft context preview" /><span>Material close-up</span></div><div className="journey-preview-film-caption"><strong>{selected.title}</strong><small>{selected.location} · {previewMedia?.previewCaption ?? previewMedia?.label ?? "Editorial route preview"}</small><Link href={selected.id === "channapatna-maker-studio" ? "/maker/artisan-studio" : `/craft/${craft.id}`}>Open craft story <ArrowRight size={13} /></Link></div></div></div></section>;
}

export default function Planner() {
  const search = useSearch();
  const [persisted] = useState(() => travellerDemoService.getState());
  const [origin, setOrigin] = useState(persisted.origin);
  const [destination, setDestination] = useState(persisted.destination);
  const [routeExperience, setRouteExperience] = useState<RouteExperience | null>(persisted.routeExperience);
  const [selected, setSelected] = useState<CulturalOpportunity | null>(persisted.routeExperience?.opportunities[0] ?? null);
  const [trail, setTrail] = useState<CulturalOpportunity[]>(persisted.trail);
  const [optimizerOpen, setOptimizerOpen] = useState(false);
  const [mode, setMode] = useState("quickest");
  const [isTracing, setIsTracing] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(Boolean(persisted.routeExperience));
  const [discoveryMeta, setDiscoveryMeta] = useState<RouteDiscoveryResult | null>(() => persisted.routeExperience ? { experience: persisted.routeExperience, source: persisted.source === "api" ? "api" : "mock", endpoint: "" } : null);
  const [traceError, setTraceError] = useState<string | null>(null);
  const [pendingDetourPlace, setPendingDetourPlace] = useState<string | null>(null);
  const [regionFilter, setRegionFilter] = useState("All regions");
  const [makerOnly, setMakerOnly] = useState(false);

  useEffect(() => {
    const intent = readCraftPlannerIntent(search);
    if (!intent) return;
    setDestination(intent.routeDestination);
    setPendingDetourPlace(intent.usesRegionalGateway ? `${intent.place} via ${intent.routeDestination}` : intent.place);
    setTraceError(null);
    setHasAttempted(false);
    toast.message(`${intent.place} is set as your cultural detour. Choose a starting point, then calculate the route.`);
  }, [search]);

  useEffect(() => {
    travellerDemoService.saveTrail({ origin, destination, routeExperience, trail, source: discoveryMeta?.source ?? persisted.source });
  }, [origin, destination, routeExperience, trail, discoveryMeta?.source, persisted.source]);

  const traceJourney = async () => {
    const cleanOrigin = origin.trim();
    const cleanDestination = destination.trim();
    setHasAttempted(true);
    if (!cleanOrigin || !cleanDestination) {
      setTraceError("Enter both a starting point and destination before tracing your cultural route.");
      return;
    }
    setTraceError(null);
    setIsTracing(true);
    try {
      const result = await discoverRoute(cleanOrigin, cleanDestination);
      setRouteExperience(result.experience);
      setDiscoveryMeta(result);
      setSelected(result.experience.opportunities[0] ?? null);
      setTrail([]);
      setOptimizerOpen(false);
      setPendingDetourPlace(null);
      if (!result.experience.opportunities.length) toast.message("The route was traced, but no nearby craft discoveries were returned.");
      else if (result.source === "api") toast.success(`Virāsat found ${result.experience.opportunities.length} live cultural discoveries.`);
      else toast.message("Curated demo discoveries are ready for this route.");
    } catch (error) {
      setRouteExperience(null);
      setSelected(null);
      setDiscoveryMeta(null);
      setTraceError(error instanceof Error ? error.message : "Your cultural route could not be calculated. Try two different locations from the directory.");
    } finally {
      setIsTracing(false);
    }
  };

  const swapRoute = () => { setOrigin(destination); setDestination(origin); setTraceError(null); };
  const updateOrigin = (value: string) => { setOrigin(value); setTraceError(null); };
  const updateDestination = (value: string) => { setDestination(value); setTraceError(null); };
  const selectCraft = (craft: Craft) => setSelected(routeExperience?.opportunities.find((item) => item.craftId === craft.id) ?? null);
  const addToTrail = (opportunity: CulturalOpportunity) => {
    if (!trail.some((item) => item.id === opportunity.id)) { setTrail((items) => [...items, opportunity]); toast.success(`${opportunity.title} added to your Cultural Trail.`); }
    else toast.message(`${opportunity.title} is already on your Cultural Trail.`);
  };
  const previewOpportunity = (opportunity: CulturalOpportunity) => { setSelected(opportunity); window.setTimeout(() => document.getElementById("journey-preview")?.scrollIntoView({ behavior: "smooth", block: "center" }), 0); };
  const extraMinutes = trail.reduce((sum, item) => sum + Number(item.detour.match(/\d+/)?.[0] ?? 0), 0);
  const spend = trail.reduce((sum, item) => sum + item.price, 0);
  const experienceMinutes = trail.reduce((sum, item) => sum + Number(item.duration.match(/\d+/)?.[0] ?? 0), 0);
  const openOptimizer = () => { if (!trail.length) { toast.message("Add a craft, maker, or experience to begin shaping your Cultural Trail."); return; } setOptimizerOpen(true); };
  const showResults = Boolean(routeExperience?.opportunities.length && selected);
  const showNoDiscoveries = Boolean(hasAttempted && routeExperience && !routeExperience.opportunities.length);
  const routeIsDirty = Boolean(routeExperience && (origin.trim().toLowerCase() !== routeExperience.origin.name.toLowerCase() || destination.trim().toLowerCase() !== routeExperience.destination.name.toLowerCase()));
  const regionOptions = useMemo(() => Array.from(new Set(routeExperience?.opportunities.map((opportunity) => opportunity.location.split(",").slice(-1)[0]?.trim()).filter(Boolean) ?? [])), [routeExperience]);
  const visibleOpportunities = useMemo(() => (routeExperience?.opportunities ?? []).filter((opportunity) => (regionFilter === "All regions" || opportunity.location.endsWith(regionFilter)) && (!makerOnly || opportunity.kind === "Artisan" || opportunity.kind === "Experience")), [makerOnly, regionFilter, routeExperience]);

  useEffect(() => { if (regionFilter !== "All regions" && !regionOptions.includes(regionFilter)) setRegionFilter("All regions"); }, [regionFilter, regionOptions]);
  useEffect(() => { if (visibleOpportunities.length && !visibleOpportunities.some((opportunity) => opportunity.id === selected?.id)) setSelected(visibleOpportunities[0]); }, [selected?.id, visibleOpportunities]);

  return <div className="app-shell page-shell planner-shell cultural-journey-page"><TopNav /><main>
    <section className={`cultural-journey-hero ${showResults ? CULTURAL_TRAIL_RESULT_VARIANT : ""}`}><div className="container"><div className="planner-breadcrumb"><Link href="/">Home</Link><ArrowRight size={12} /><span>Cultural Journey</span></div>
      {showResults ? <><div className="journey-hero-grid"><div><span className="eyebrow"><span className="eyebrow-stitch" />The Cultural Detour Engine</span><h1>Your journey has<br /><em>{routeExperience!.opportunities.length} cultural discoveries.</em></h1><p>From {routeExperience!.origin.name} to {routeExperience!.destination.name}, Virāsat has traced the makers, practices, and heritage stops that make this way worth slowing for.</p><div className="journey-route"><span>{routeExperience!.origin.name}</span><i />{routeExperience!.crafts.slice(0, 1).map((craft) => <strong key={craft.id}>{craft.region}</strong>)}<i /><span>{routeExperience!.destination.name}</span></div><div className="journey-story-rail"><span>Journey</span><i /><span>Route</span><i /><span>Craft</span><i /><span>Place</span><i /><span>People</span><i /><span>Story</span></div></div><div className="journey-hero-note"><span className="eyebrow">Route-first, not search-first</span><p>{discoveryMeta?.tripSummary || "Travel first. Then meet the maker, the practice, and the local story already woven into your way."}</p><span>{routeExperience!.distance} / {routeExperience!.duration}</span>{discoveryMeta?.source === "mock" && <button className="journey-service-note" onClick={traceJourney}>Refresh this cultural trail</button>}</div></div><RouteInputForm origin={origin} destination={destination} onOrigin={updateOrigin} onDestination={updateDestination} onSwap={swapRoute} onSubmit={traceJourney} isTracing={isTracing} error={traceError} isDirty={routeIsDirty} compact detourPlace={pendingDetourPlace} onConfirmDetour={traceJourney} /></> : <div className="planner-empty-hero"><div><span className="eyebrow"><span className="eyebrow-stitch" />The Cultural Detour Engine</span><h1>{traceError ? "Your trail could not be" : showNoDiscoveries ? "No nearby craft was" : "Any Indian route."}<br /><em>{traceError ? "traced." : showNoDiscoveries ? "found on this trace." : "A cultural trail."}</em></h1><p>{traceError ? "Change either location or try again. Virāsat will keep the route form ready for another trace." : showNoDiscoveries ? "The route was calculated, but it returned no cultural discoveries. Try widening your journey with another supported location." : "Choose a starting point and destination. Virāsat reveals the crafts, makers, and experiences that make the journey matter."}</p></div><RouteInputForm origin={origin} destination={destination} onOrigin={updateOrigin} onDestination={updateDestination} onSwap={swapRoute} onSubmit={traceJourney} isTracing={isTracing} error={traceError} detourPlace={pendingDetourPlace} onConfirmDetour={traceJourney} /></div>}
    </div></section>
    {showResults && <JourneyEditorialBridge routeExperience={routeExperience!} selected={selected!} />}
    {showResults && <JourneyPreviewReel routeExperience={routeExperience!} selected={selected!} />}
    {showResults && <section className="cultural-journey-workspace"><div className="container cultural-journey-grid"><div className="opportunity-column"><div className="opportunity-heading"><div><span className="eyebrow">Along your journey / {discoveryMeta?.source === "api" ? "live records" : "curated demo records"}</span><h2>What’s worth<br /><em>experiencing.</em></h2></div><span>{visibleOpportunities.length.toString().padStart(2, "0")} / {routeExperience!.opportunities.length.toString().padStart(2, "0")}</span></div><p className="opportunity-intro">Each opportunity balances craft significance, authenticity, availability, traveller interest, and detour convenience.</p><div className="planner-discovery-filters" aria-label="Filter route discoveries"><div><span>Discovery type</span><button type="button" className={!makerOnly ? "is-active" : ""} onClick={() => setMakerOnly(false)}>All moments</button><button type="button" className={makerOnly ? "is-active" : ""} onClick={() => setMakerOnly(true)}>Maker-led</button></div><div><span>Region</span><button type="button" className={regionFilter === "All regions" ? "is-active" : ""} onClick={() => setRegionFilter("All regions")}>All regions</button>{regionOptions.map((region) => <button type="button" key={region} className={regionFilter === region ? "is-active" : ""} onClick={() => setRegionFilter(region)}>{region}</button>)}</div></div>{visibleOpportunities.length ? <div className="opportunity-list">{visibleOpportunities.map((opportunity, index) => <CulturalOpportunityCard key={opportunity.id} opportunity={opportunity} selected={selected!.id === opportunity.id} index={index} onSelect={setSelected} onAdd={addToTrail} onPreview={previewOpportunity} />)}</div> : <div className="planner-filter-empty"><span className="eyebrow">No maker-led match yet</span><p>Try another route region or return to all cultural moments.</p><button type="button" className="text-link" onClick={() => { setMakerOnly(false); setRegionFilter("All regions"); }}>Clear discovery filters <ArrowRight size={13} /></button></div>}</div><div className="journey-map-trail"><div className="journey-map-wrap"><GoogleJourneyMap crafts={routeExperience!.crafts} route={routeExperience!} selectedId={selected!.craftId} onSelect={selectCraft} onAddToTrail={(craft) => { const opportunity = routeExperience!.opportunities.find((item) => item.craftId === craft.id); if (opportunity) addToTrail(opportunity); }} /></div><motion.aside className="cultural-trail-panel" layout><div className="trail-panel-title"><div><span className="eyebrow"><Route size={13} />My Cultural Trail</span><h3>Your meaningful<br /><em>way through.</em></h3></div><span>{trail.length} stops</span></div><div className="cultural-trail-sequence"><div><i className="trail-node-start" /><span>{routeExperience!.origin.name}</span></div>{trail.length ? trail.map((item) => <motion.div key={item.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}><i className="trail-node-craft" /><span>{item.icon} {item.title}</span><button aria-label={`Remove ${item.title}`} onClick={() => setTrail((items) => items.filter((entry) => entry.id !== item.id))}><X size={12} /></button></motion.div>) : <div className="trail-empty-line"><i className="trail-node-craft" /><span>Add a cultural stop</span></div>}<div><i className="trail-node-end" /><span>{routeExperience!.destination.name}</span></div></div><div className="trail-decision-summary"><span><b>{trail.length}</b> cultural stops</span><span><b>{extraMinutes} min</b> additional travel</span><span><b>{experienceMinutes} min</b> total experiences</span><span><b>₹{spend || 0}</b> estimated spend</span></div><button className="button button-primary trail-optimise" onClick={openOptimizer}><Sparkles size={15} />Optimise My Trail</button></motion.aside><div className="journey-map-note"><MapPinned size={14} />Select a cultural opportunity to understand the detour.</div></div></div></section>}
  </main><AnimatePresence>{optimizerOpen && <motion.div className="trail-optimizer-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><motion.section className="trail-optimizer" initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 16, opacity: 0 }}><button className="optimizer-close" onClick={() => setOptimizerOpen(false)}><X size={17} /></button><span className="eyebrow">The Cultural Detour Engine</span><h2>Your optimised<br /><em>cultural journey.</em></h2><p>Choose the kind of day you want. Each option makes the trade-off clear.</p><div className="optimizer-options">{optimizationModes.map((option) => <button key={option.id} className={mode === option.id ? "optimizer-option-active" : ""} onClick={() => setMode(option.id)}><span>{option.label}</span><strong>{option.note}</strong><small>{option.detail}</small></button>)}</div><button className="button button-primary optimizer-confirm" onClick={() => { setOptimizerOpen(false); toast.success("Your Cultural Trail has been optimised for this demo."); }}><Check size={15} />Use this journey</button></motion.section></motion.div>}</AnimatePresence><MobileBottomNav role="traveller" /></div>;
}
