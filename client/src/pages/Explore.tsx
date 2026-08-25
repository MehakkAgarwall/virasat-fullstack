// Virāsat Explore: a live craft catalogue presented as a compact editorial museum board.
import { motion } from "framer-motion";
import { ArrowUpRight, Filter, MapPin, Quote, Search, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { CraftEditorialVisual } from "../components/CraftEditorialVisual";
import { MobileBottomNav } from "../components/MobileBottomNav";
import { TopNav } from "../components/TopNav";
import { crafts as mockCrafts, categories } from "../data/mock";
import { fetchCraftCatalogue, type CraftCatalogueResult } from "../services/craftService";
import { overlayCraftCollection } from "../services/heritageEnrichmentService";
import { trpc } from "../lib/trpc";

const makerAtWork = "/manus-storage/virasat-maker-at-work_7e0e99ef.jpg";
const processCollage = "/manus-storage/virasat-craft-process-collage_42d5548c.jpg";
const sunsetRouteLandscape = "/manus-storage/virasat-sunset-route-landscape_f7be90bf.jpg";
const recognitionFilters = ["All", "GI Tagged", "ODOP"] as const;

const normalizedFilterText = (value: string) => value.trim().toLocaleLowerCase();

export const exploreCategoryKey = (category: string) => {
  const normalized = normalizedFilterText(category);
  if (/^textiles?$/.test(normalized)) return "textile";
  if (/^arts?$/.test(normalized) || normalized === "painting") return "art";
  if (/^metal(work)?s?$/.test(normalized)) return "metalwork";
  if (/^handicrafts?$/.test(normalized)) return "handicraft";
  if (/^wood(craft)?s?$/.test(normalized)) return "woodcraft";
  return normalized;
};

export const getExploreFilterOptions = (crafts: CraftCatalogueResult["crafts"]) => [
  ...recognitionFilters,
  ...Array.from(new Set(crafts.map((craft) => craft.category))).sort((left, right) => left.localeCompare(right)),
];

export const filterExploreCrafts = (crafts: CraftCatalogueResult["crafts"], active: string, query: string) => {
  const normalizedQuery = normalizedFilterText(query);
  const activeCategory = exploreCategoryKey(active);
  return crafts.filter((craft) => {
    const matchesRecognition = active === "All" || (active === "GI Tagged" ? Boolean(craft.gi) : active === "ODOP" ? Boolean(craft.odop) : exploreCategoryKey(craft.category) === activeCategory);
    const matchesQuery = normalizedFilterText(`${craft.name} ${craft.region} ${craft.state} ${craft.category}`).includes(normalizedQuery);
    return matchesRecognition && matchesQuery;
  });
};

type CulturalResource = { id: string; craftId: number; title: string; summary: string; location: string; imageUrl: string };

export const filterCulturalResources = (resources: CulturalResource[], query: string) => {
  const normalizedQuery = normalizedFilterText(query);
  if (!normalizedQuery) return resources;
  return resources.filter((resource) => normalizedFilterText(`${resource.title} ${resource.summary} ${resource.location}`).includes(normalizedQuery));
};

export default function Explore() {
  const [active, setActive] = useState("All");
  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [catalogue, setCatalogue] = useState<CraftCatalogueResult | null>(null);
  const culturalResourcesQuery = trpc.culturalResource.list.useQuery();

  useEffect(() => {
    let mounted = true;
    fetchCraftCatalogue().then((result) => {
      if (!mounted) return;
      setCatalogue(result);
      if (result.source === "api") setActive("All");
    });
    return () => { mounted = false; };
  }, []);

  const isCatalogueLoading = catalogue === null;
  const enrichedCrafts = useMemo(() => overlayCraftCollection(catalogue?.crafts ?? []), [catalogue]);
  const filterOptions = useMemo(() => {
    if (!catalogue) return [];
    // The historical fallback labels are preserved where they have live category equivalents, then category matching is normalised below.
    return catalogue.source === "mock" ? categories : getExploreFilterOptions(enrichedCrafts);
  }, [catalogue, enrichedCrafts]);
  const filtered = useMemo(() => filterExploreCrafts(enrichedCrafts, active, query), [active, enrichedCrafts, query]);

  const featured = filtered[0];
  const discoveryCrafts = filtered.slice(1, 6);
  const archiveCrafts = filtered.slice(6);
  const archiveOpen = active !== "All" || Boolean(query.trim());
  const matchedResources = useMemo(() => filterCulturalResources((culturalResourcesQuery.data ?? []) as CulturalResource[], query), [culturalResourcesQuery.data, query]);

  return <div className="app-shell page-shell explore-editorial-page explore-museum-board-page">
    <TopNav />
    <main>
      <section className="explore-hero section-pad"><div className="container explore-hero-inner"><div><span className="eyebrow"><span className="eyebrow-stitch" />Explore Virāsat / 01</span><h1>India, held in<br /><em>living detail.</em></h1><p className="explore-hero-lede">A route-led collection of craft, place, material, and the people who carry a tradition forward.</p></div><div className="explore-hero-aside"><p>Begin with the traditions you can meet along the way. Then follow one craft from its origin to its maker and cultural story.</p><div className="explore-hero-stat"><strong>{isCatalogueLoading ? "—" : catalogue.crafts.length}</strong><span>{isCatalogueLoading ? <>live records<br />being traced</> : <>craft traditions<br />in the collection</>}</span></div><Link href="/planner" className="explore-journey-bridge">Trace a route, then meet its craft <ArrowUpRight size={13} /></Link></div></div></section>

      <section className="explore-controls explore-board-controls"><div className="container"><div className="explore-controls-kicker"><span className="eyebrow">Find a cultural thread</span><span>Live catalogue / filter by material, recognition, place, or source-linked discovery</span></div><div className="search-bar"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a craft, place, tradition or cultural discovery..." aria-label="Search a craft, place, tradition or cultural discovery" /><button type="button" className="md:hidden" aria-label="Open filters" aria-expanded={filtersOpen} onClick={() => setFiltersOpen((open) => !open)}><Filter size={17} /></button></div><div className={`filter-row ${filtersOpen ? "filter-row-expanded" : ""}`}><span className="filter-label">Filter by</span>{filterOptions.map((category) => { const isActive = active === category; const matchingCount = filterExploreCrafts(enrichedCrafts, category, query).length; return <button type="button" key={category} aria-pressed={isActive} onClick={() => { setActive(category); setFiltersOpen(false); }} className={`filter-pill ${isActive ? "filter-pill-active" : ""}`}>{category}<span className="filter-count">{matchingCount.toString().padStart(2, "0")}</span></button>; })}</div><p className="explore-filter-feedback" role="status" aria-live="polite"><b>{filtered.length}</b> {filtered.length === 1 ? "craft record" : "craft records"} shown <span>·</span> {matchedResources.length} {matchedResources.length === 1 ? "source-linked discovery" : "source-linked discoveries"} <span>·</span> {active === "All" ? "all living traditions" : active}</p></div></section>

      <CulturalResourceExplorer resources={matchedResources} loading={culturalResourcesQuery.isLoading} query={query} />
      <ManagedExperienceExplorer />

      {isCatalogueLoading ? <section className="explore-grid-section section-pad"><div className="container"><div className="empty-state explore-loading-state"><Sparkles size={22} /><h2>Tracing living traditions.</h2><p>Bringing the live craft catalogue into view.</p></div></div></section> : filtered.length && featured ? <>
        <section className="explore-board-section section-pad"><div className="container">
          <div className="explore-board-heading"><div><span className="eyebrow">A living collection</span><h2>Crafts along the <em>route.</em></h2></div><span>{catalogue.source === "api" ? "Live record / 01" : "Curated fallback / 01"}</span></div>
          <div className="explore-board-discovery-row">
            <Link href="/planner" className="explore-board-route-intro"><CraftEditorialVisual craft={featured} index={0} className="explore-board-route-visual" label="The Cultural Detour Engine" alt={`${featured.name} route discovery`} /><div><span className="eyebrow">The Cultural Detour Engine</span><h3>Your journey has<br /><em>{Math.min(filtered.length, 5)} cultural discoveries.</em></h3><p>From place to practice, Virāsat traces the craft stories that make the way worth slowing for.</p><div className="explore-board-route-stitch"><span>Start</span><i /><span>Craft</span><i /><span>Story</span></div></div></Link>
            <div className="explore-board-hanging-panel"><div className="explore-board-panel-head"><span className="eyebrow">Explore Virāsat</span><p>Crafts along the route</p></div><div className="explore-board-hanging-row">{discoveryCrafts.map((craft, index) => <Link key={craft.id} href={`/craft/${craft.id}`} className="explore-board-hanging-card"><span className="explore-board-thread" aria-hidden="true" /><CraftEditorialVisual craft={craft} index={index + 1} className="explore-board-hanging-image" alt={`${craft.name} craft study`} /><div><strong>{craft.name}</strong><small>{craft.region}</small><span><ArrowUpRight size={12} /></span></div></Link>)}</div><a href="#collection" className="explore-board-all-link">View all {filtered.length} crafts <ArrowUpRight size={13} /></a></div>
          </div>
          <div className="explore-board-feature-row">
            <article className="explore-board-feature"><div className="explore-board-feature-visual"><CraftEditorialVisual craft={featured} className="explore-board-feature-image" alt={`${featured.name} featured craft study`} label="Featured craft" /></div><div><span className="eyebrow">Featured craft</span><h3>{featured.name}</h3><p>{featured.description}</p><div className="explore-board-location"><MapPin size={13} />{featured.region}, {featured.state}</div><Link href={`/craft/${featured.id}`} className="button button-primary">Enter this craft story <ArrowUpRight size={14} /></Link></div></article>
            <Link href="/planner" className="explore-board-route-banner"><img src={sunsetRouteLandscape} alt="Golden hour heritage landscape along a cultural route" /><div><span className="eyebrow">Cultural journey</span><h3>Journeys are never<br />just about places.</h3><p>They are about the hands that shape them.</p><span className="underlined-link">Explore Cultural Journeys <ArrowUpRight size={13} /></span></div></Link>
          </div>
          <section id="journal" className="explore-board-journal"><div className="explore-board-journal-head"><div><span className="eyebrow">The craft journal</span><h2>Stories. People. <em>Traditions.</em></h2></div><Link href="/planner" className="underlined-link">Explore all articles <ArrowUpRight size={13} /></Link></div><div className="explore-board-journal-grid"><article><img src={makerAtWork} alt="Artisan at work" /><div><span>People</span><h3>The hands that keep a route alive</h3><small>Field note / Virāsat</small></div></article><article><CraftEditorialVisual craft={discoveryCrafts[0] ?? featured} index={2} alt="Craft material and place" /><div><span>Places</span><h3>Why some cities are craft keepers</h3><small>Route study / India</small></div></article><article><img src={processCollage} alt="Craft process detail" /><div><span>Traditions</span><h3>Threads that carry stories</h3><small>Material study / India</small></div></article><aside><Quote size={25} /><p>Every craft carries the memory of the hands that shaped it.</p></aside></div></section>
        </div></section>
        <section id="collection" className="explore-archive-section section-pad"><div className="container"><details className="explore-archive-disclosure" open={archiveOpen}><summary><span><b>{archiveCrafts.length.toString().padStart(2, "0")}</b> more living craft records</span><small>Open the complete route archive</small></summary>{archiveCrafts.length ? <div className="explore-archive-grid">{archiveCrafts.map((craft, index) => <motion.article key={craft.id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.32, delay: Math.min(index, 8) * 0.025 }}><Link href={`/craft/${craft.id}`}><CraftEditorialVisual craft={craft} index={index + 7} alt={`${craft.name} craft study`} /><div><span className="eyebrow">{craft.category} · {craft.state}</span><h3>{craft.name}</h3><small>{craft.region}</small>{craft.gi && <b>GI</b>}{craft.odop && <b>ODOP</b>}</div></Link></motion.article>)}</div> : <p className="explore-single-collection-note">This lens has brought every matching craft into the museum board above.</p>}</details></div></section>
      </> : <section className="explore-grid-section section-pad"><div className="container"><div className="empty-state"><Sparkles size={22} /><h2>No craft found yet.</h2><p>Try another place, material, or tradition.</p></div></div></section>}
    </main>
    <MobileBottomNav role="traveller" />
  </div>;
}

function ManagedExperienceExplorer() {
  const managedExperiencesQuery = trpc.experience.listPublished.useQuery();
  return <section className="section-pad explore-board-section"><div className="container"><div className="explore-board-heading"><div><span className="eyebrow">Meet the maker / shared collection</span><h2>Published <em>experiences.</em></h2></div><span>{managedExperiencesQuery.isLoading ? "Loading managed records" : `${(managedExperiencesQuery.data ?? []).length.toString().padStart(2, "0")} Traveller-visible`}</span></div>{managedExperiencesQuery.isLoading ? <p className="body-copy">Retrieving the current Artisan-published experiences…</p> : managedExperiencesQuery.data?.length ? <div className="experience-admin-grid">{managedExperiencesQuery.data.map((experience) => <article key={experience.id}><span className="eyebrow">{experience.artisanName} / {experience.craftSpecialization ?? "Craft practice"}</span><h3>{experience.title}</h3><p>{experience.location} · {experience.duration} · {experience.capacity} guests</p><small>{experience.price ? `₹${experience.price.toLocaleString("en-IN")} / person` : "Shared booking request"}</small><Link href={`/experience/${experience.id}`} className="underlined-link">View &amp; book <ArrowUpRight size={14} /></Link></article>)}</div> : <p className="body-copy">No Artisan has published a Traveller-visible experience yet.</p>}</div></section>;
}

function CulturalResourceExplorer({ resources, loading, query }: { resources: CulturalResource[]; loading: boolean; query: string }) {
  return <section className="section-pad explore-board-section cultural-resource-explorer"><div className="container"><div className="explore-board-heading"><div><span className="eyebrow">Craft stories / source-linked registry</span><h2>Cultural <em>discoveries.</em></h2></div><span>{loading ? "Tracing source records" : `${resources.length.toString().padStart(2, "0")} read-only records`}</span></div>{loading ? <p className="body-copy">Loading the published cultural registry…</p> : resources.length ? <div className="experience-admin-grid">{resources.map((resource) => <article key={resource.id}><span className="eyebrow">Craft #{resource.craftId} / {resource.location}</span><h3>{resource.title}</h3><p>{resource.summary}</p><small>Source-linked discovery · not a bookable workshop</small><Link href={`/resources/${resource.id}`} className="underlined-link">Read cultural context <ArrowUpRight size={14} /></Link></article>)}</div> : <p className="body-copy">No source-linked cultural discovery matches “{query}”. Try a craft, region, or tradition.</p>}</div></section>;
}
