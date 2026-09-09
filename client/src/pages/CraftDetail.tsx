// Kalā Trail visual system: the verified journey follows a craft into heritage, a published maker story, and a cited cultural resource.
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, BusFront, Clock3, DatabaseZap, ExternalLink, Landmark, MapPin, MapPinned, RotateCcw, ShieldCheck, Sparkles, UsersRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import { getCraftEditorialImage } from "../components/CraftEditorialVisual";
import { MobileBottomNav } from "../components/MobileBottomNav";
import { ThreeCraftStage } from "../components/ThreeCraftStage";
import { TopNav } from "../components/TopNav";
import { allIndiaCrafts } from "../data/routeDiscovery";
import { trpc } from "../lib/trpc";
import { backendCraftId, fetchCraftById } from "../services/craftService";
import { findBookableExperienceForCraft, formatPublishedExperiencePrice, type CraftDetailExperience } from "../services/craftDetailExperience";
import { getCraftHeritageContextByFrontendId, getPublishedCraftJourney } from "../services/heritageEnrichmentService";
import { recordCraftLoadTelemetry } from "../services/craftRouteTelemetry";
import { createCraftPlannerHref } from "../services/craftRouteIntent";
import { ShopCraftSection } from "../components/ShopCraftSection";

const processByCategory: Record<string, { title: string; copy: string }[]> = {
  Textiles: [{ title: "Thread", copy: "Fibres are selected and prepared for a cloth that can hold both use and memory." }, { title: "Loom", copy: "Patient hands set the rhythm that lets the cloth take shape." }, { title: "Pattern", copy: "Checks, colour, and detail are worked slowly into the woven field." }, { title: "Finishing", copy: "A final touch brings softness, strength, and the maker’s signature." }],
  Pottery: [{ title: "Clay", copy: "Local clay is prepared until its grain is ready to hold a hand-shaped form." }, { title: "Shaping", copy: "The object is guided into being through repeated, patient turns." }, { title: "Firing", copy: "Heat sets the form and deepens the material’s living character." }, { title: "Finishing", copy: "A final surface detail gives the piece its particular presence." }],
  Metalwork: [{ title: "Alloy", copy: "Metal is selected and prepared for a surface that can take lasting detail." }, { title: "Form", copy: "The object is shaped with practiced pressure, heat, and control." }, { title: "Detail", copy: "Fine handwork gives the surface its regional character." }, { title: "Finishing", copy: "The completed work is brought to a quiet, durable glow." }],
  Painting: [{ title: "Ground", copy: "The surface is prepared to receive layers of patient handwork." }, { title: "Drawing", copy: "The first lines set the rhythm and story of the work." }, { title: "Colour", copy: "Colour is built gradually, keeping the regional visual language alive." }, { title: "Finishing", copy: "Final detail gives the work its depth and lasting presence." }],
  Woodcraft: [{ title: "Wood", copy: "Locally sourced wood is selected for a fine, even hand-worked form." }, { title: "Shaping", copy: "The form is turned and refined into an object made for touch." }, { title: "Detail", copy: "Colour and handwork bring the surface into its final expression." }, { title: "Polishing", copy: "A smooth finish lets the material hold its quiet glow." }],
};

const MYSORE_SILK_HERO_IMAGE = "/manus-storage/mysore-silk-handloom-cinematic_23795ccb.png";
type LiveCraftPanel = { name: string; region: string; state: string; category: string };

function CraftExperienceCard({ craft, plannerHref, experienceHref, experience }: { craft: LiveCraftPanel; plannerHref: string; experienceHref: string; experience?: CraftDetailExperience | null }) {
  const bookingFacts = [
    { icon: <UsersRound size={14} />, label: experience ? `Up to ${experience.capacity} guests` : "Live craft record" },
    { icon: <Clock3 size={14} />, label: experience?.duration || "Route-ready location" },
    { icon: experience ? <Sparkles size={14} /> : <MapPinned size={14} />, label: experience ? formatPublishedExperiencePrice(experience.price) ?? "Price on request" : "Plan a cultural detour" },
  ];
  return <aside className="mysore-hero-experience-card"><header><span className="eyebrow"><Sparkles size={12} />{experience ? "Craft experience" : `${craft.category} record`}</span><Landmark size={23} /></header><h2>{craft.region}</h2><p>{experience ? `A managed ${experience.title.toLowerCase()} in ${experience.location}.` : `A live ${craft.category.toLowerCase()} record from ${craft.region}, ${craft.state}, ready to trace along your cultural trail.`}</p><div className="mysore-hero-experience-facts">{bookingFacts.map((fact) => <span key={fact.label}>{fact.icon}{fact.label}</span>)}</div>{experience ? <Link href={experienceHref} className="mysore-hero-book">Book Experience <ArrowRight size={16} /></Link> : <Link href={plannerHref} className="mysore-hero-book">Trace this craft route <ArrowRight size={16} /></Link>}</aside>;
}

function CraftReferenceBand({ craft, plannerHref, experienceHref, experience }: { craft: LiveCraftPanel; plannerHref: string; experienceHref: string; experience?: CraftDetailExperience | null }) {
  return <section className="craft-reference-band" aria-label={`${craft.name} route and experience overview`}><div className="container craft-reference-band-grid">
    <article className="craft-reference-route-card"><span className="eyebrow"><MapPinned size={12} />Route context</span><div className="craft-reference-route-stops"><span>Trail origin</span><i /><strong>{craft.region}</strong><i /><span>{craft.state}</span></div><div className="craft-reference-route-facts"><span><b>Live</b><small>Railway record</small></span><span><b>{craft.category}</b><small>craft practice</small></span><span><b>Ready</b><small>for route planning</small></span></div></article>
    <article className="craft-reference-atlas"><div className="craft-reference-atlas-head"><span className="eyebrow">{experience ? experience.title : `${craft.name} trail`}</span><Landmark size={24} /></div><div className="craft-reference-map-art" role="img" aria-label={`Route context for ${craft.name} in ${craft.region}, ${craft.state}`}><span className="craft-reference-map-city craft-reference-map-city-start">Trail start</span><span className="craft-reference-map-city craft-reference-map-city-stop">{craft.region}</span><span className="craft-reference-map-city craft-reference-map-city-end">{craft.state}</span><i className="craft-reference-map-route" /><b className="craft-reference-map-pin"><MapPin size={14} /></b></div><div className="craft-reference-atlas-actions"><Link href={plannerHref}>Open interactive trail <ArrowRight size={14} /></Link>{experience ? <Link href={experienceHref} className="craft-reference-book"><UsersRound size={14} />Book experience</Link> : <Link href={plannerHref} className="craft-reference-book"><MapPinned size={14} />Trace detour</Link>}</div></article>
  </div></section>;
}

export default function CraftDetail() {
  const [, params] = useRoute("/craft/:id");
  const localCraft = allIndiaCrafts.find((item) => item.id === params?.id) ?? allIndiaCrafts[0];
  const [apiCraft, setApiCraft] = useState<typeof localCraft | null>(null);
  const liveCraftId = backendCraftId(params?.id ?? "");
  const [resolvedLiveCraftId, setResolvedLiveCraftId] = useState<number | null>(() => liveCraftId ?? 0);
  const [unavailableLiveCraftId, setUnavailableLiveCraftId] = useState<number | null>(null);
  const [lookupAttempt, setLookupAttempt] = useState(0);
  const [fallbackReason, setFallbackReason] = useState<string | null>(null);
  const [locationOpen, setLocationOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!liveCraftId) {
      setApiCraft(null);
      setResolvedLiveCraftId(0);
      setUnavailableLiveCraftId(null);
      setFallbackReason(null);
      return () => { mounted = false; };
    }
    const startedAt = Date.now();
    setResolvedLiveCraftId(null);
    setUnavailableLiveCraftId(null);
    setFallbackReason(null);
    fetchCraftById(liveCraftId).then((result) => {
      if (!mounted) return;
      setApiCraft(result.source === "api" ? result.craft : null);
      setUnavailableLiveCraftId(result.source === "api" ? null : liveCraftId);
      setFallbackReason(result.source === "api" ? null : result.fallbackReason ?? "The live craft record is unavailable.");
      setResolvedLiveCraftId(liveCraftId);
      recordCraftLoadTelemetry({
        craftId: liveCraftId,
        source: result.source === "api" ? "api" : "fallback",
        elapsedMs: Date.now() - startedAt,
        ...(result.source === "api" ? {} : { fallbackReason: result.fallbackReason }),
      });
    });
    return () => { mounted = false; };
  }, [liveCraftId, lookupAttempt]);

  const isLiveCraftLoading = Boolean(liveCraftId && resolvedLiveCraftId !== liveCraftId);
  const isLiveCraftUnavailable = Boolean(liveCraftId && resolvedLiveCraftId === liveCraftId && unavailableLiveCraftId === liveCraftId);
  const currentApiCraft = apiCraft?.id === `api-${liveCraftId}` ? apiCraft : null;
  const craft = currentApiCraft ?? localCraft;
  const heritage = getCraftHeritageContextByFrontendId(craft.id);
  const curatedJourney = currentApiCraft ? getPublishedCraftJourney(liveCraftId) : undefined;
  const provenance = [heritage?.gi, heritage?.odop].filter((item): item is NonNullable<typeof item> => Boolean(item));
  const primaryArtisan = curatedJourney?.artisan;
  const primaryExperience = curatedJourney?.experience;
  const isLegacyChannapatna = craft.id === "channapatna";
  const isMysoreSilk = currentApiCraft?.id === "api-111";
  const publishedExperiencesQuery = trpc.experience.listPublished.useQuery();
  const publishedExperiences = (publishedExperiencesQuery.data ?? []) as CraftDetailExperience[];
  const bookableExperience = findBookableExperienceForCraft(publishedExperiences, liveCraftId);
  const hasCuratedJourney = Boolean(primaryArtisan || primaryExperience);
  const makerHref = primaryArtisan ? `/maker/${primaryArtisan.slug}` : "/maker/artisan-studio";
  const experienceHref = bookableExperience ? `/experience/${bookableExperience.id}` : primaryExperience ? `/experience/${primaryExperience.slug}` : "/experience/channapatna-toy-making";
  const plannerHref = createCraftPlannerHref(craft.id, craft.region, craft.state);
  const mapHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${craft.coordinates[0]},${craft.coordinates[1]}`)}`;
  const transitHref = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${craft.coordinates[0]},${craft.coordinates[1]}`)}&travelmode=transit`;
  const makerAction = primaryArtisan || isMysoreSilk
    ? { href: makerHref, label: "Maker visit" }
    : { href: plannerHref, label: "Find nearby makers" };
  const refreshLiveCraft = () => {
    if (!liveCraftId || isLiveCraftLoading) return;
    setLookupAttempt((attempt) => attempt + 1);
  };
  const process = processByCategory[craft.category] ?? processByCategory.Woodcraft;
  const heroKicker = heritage?.gi?.status === "verified"
    ? heritage.odop?.status === "verified" ? "GI + ODOP provenance verified" : "GI provenance verified"
    : heritage?.odop?.status === "verified" ? "ODOP provenance verified" : craft.gi ? "GI tagged / living tradition" : "Living craft / route discovery";

  if (isLiveCraftLoading) return <div className="app-shell craft-detail-page"><TopNav dark /><main><section className="craft-detail-hero"><div className="craft-detail-hero-shade" /><div className="container craft-detail-hero-content"><div><span className="eyebrow eyebrow-light">Live craft record</span><h1>Tracing the<br /><em>craft story.</em></h1><p>Retrieving the source record from the cultural trail.</p></div></div></section></main><MobileBottomNav role="traveller" /></div>;
  if (isLiveCraftUnavailable) return <div className="app-shell craft-detail-page"><TopNav dark /><main><section className="craft-detail-hero"><div className="craft-detail-hero-shade" /><div className="container craft-detail-hero-content"><div><span className="eyebrow eyebrow-light">Live craft record</span><h1>This craft story<br /><em>is not available.</em></h1><p>{fallbackReason ?? "We could not retrieve this numeric record from the live cultural catalogue."} Continue exploring the verified collection, or try the live record again.</p><div className="flex flex-wrap gap-3 mt-6"><button type="button" className="button button-primary" onClick={() => setLookupAttempt((attempt) => attempt + 1)}><RotateCcw size={15} />Retry Railway lookup</button><Link href="/explore" className="button button-outline-light">Explore live crafts <ArrowRight size={15} /></Link><Link href="/planner" className="button button-ghost-light">Return to Cultural Trail <ArrowRight size={15} /></Link></div></div></div></section></main><MobileBottomNav role="traveller" /></div>;

  return <div className="app-shell craft-detail-page"><TopNav dark /><main>{currentApiCraft && <CraftReferenceBand craft={craft} plannerHref={plannerHref} experienceHref={experienceHref} experience={bookableExperience} />}
    <section className="craft-detail-hero"><img src={isMysoreSilk ? MYSORE_SILK_HERO_IMAGE : getCraftEditorialImage(craft)} alt={`${craft.name} craft texture`} /><div className="craft-detail-hero-shade" /><div className="container craft-detail-hero-content"><motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}><span className="eyebrow eyebrow-light">{heroKicker}</span>{liveCraftId && <button type="button" className={`craft-live-status ${currentApiCraft ? "is-live" : "is-fallback"}`} onClick={refreshLiveCraft} title={currentApiCraft ? "Refresh the live Railway craft record." : "Retry the live Railway craft record."} aria-label={currentApiCraft ? `Refresh Live Railway data for ${craft.name}` : `Retry Live Railway data for ${craft.name}`}><DatabaseZap size={13} />{currentApiCraft ? "Live Railway data · Refresh" : "Curated fallback · Retry"}<RotateCcw size={11} /></button>}<h1>{craft.name}</h1><p>{craft.description}</p><div className="craft-hero-route-meta"><button type="button" onClick={() => setLocationOpen(true)} title={`View ${craft.region} location and transport options`}><MapPin size={13} />Location record</button><Link href={plannerHref} title={`Open the Cultural Trail with ${craft.region} as the detour destination`}><Clock3 size={13} />Trace route for detour</Link><Link href={makerAction.href} title={makerAction.label === "Maker visit" ? "Open the connected maker profile" : "Open the Cultural Trail to find regional maker context"}><Clock3 size={13} />{makerAction.label}</Link></div></motion.div><div className="craft-hero-object">{currentApiCraft ? <CraftExperienceCard craft={craft} plannerHref={plannerHref} experienceHref={experienceHref} experience={bookableExperience} /> : isLegacyChannapatna ? <ThreeCraftStage focus /> : <div className="craft-material-object"><span>{craft.category}</span><b>{craft.region}</b></div>}</div></div><div className="craft-detail-caption container"><span>01 / Route discovery</span><span>Slow craft, close to the road</span></div>{locationOpen && <motion.div className="craft-location-view" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}><button className="craft-location-close" type="button" onClick={() => setLocationOpen(false)} aria-label="Close location options"><X size={15} /></button><span className="eyebrow">Location record / {craft.region}</span><h2>Continue from the <em>place.</em></h2><p>{craft.region}, {craft.state} is the geographic context for this living craft record. Use your preferred mapping service for current schedules and access details.</p><div><a href={mapHref} target="_blank" rel="noreferrer"><MapPin size={14} />Open location in Google Maps <ExternalLink size={13} /></a><a href={transitHref} target="_blank" rel="noreferrer"><BusFront size={14} />Optional nearby transit directions <ExternalLink size={13} /></a></div><small>Transit availability and timings are supplied by Google Maps where coverage is available.</small></motion.div>}</section>

    <section className="craft-story-section section-pad"><div className="container craft-story-grid craft-story-grid-rich"><aside><span className="eyebrow">The story</span><div className="side-stitch" /><span className="craft-index">{craft.state.slice(0, 2).toUpperCase()} / 01</span></aside><figure className="craft-story-material"><img src={getCraftEditorialImage(craft)} alt={`${craft.name} material study`} /><figcaption><span>Material study</span><b>{craft.category}</b><i /></figcaption></figure><div className="craft-story-copy"><h2>Made for the hand,<br /><em>carried by memory.</em></h2><p className="body-copy craft-story-lede">{craft.description} Its material language is held by regional knowledge, practiced rhythm, and makers who keep the tradition present for the next generation.</p><div className="craft-story-facts"><span><ShieldCheck size={15} />{heritage?.gi?.status === "verified" ? "GI provenance verified" : "Verified regional tradition"}</span>{heritage?.odop?.status === "verified" && <span><Sparkles size={15} />ODOP provenance verified</span>}{!heritage?.odop?.status && <span><Sparkles size={15} />A route worth slowing for</span>}</div>{provenance.length > 0 && <div className="craft-provenance-links" aria-label="Authenticity sources">{provenance.map((item) => <a key={item.label} href={item.sourceUrl} target="_blank" rel="noreferrer"><ShieldCheck size={13} /><span><b>{item.label} verified</b>{item.registeredName} · reviewed {item.reviewedAt}</span><ArrowUpRight size={12} /></a>)}</div>}<div className="craft-story-route-thread" aria-hidden="true"><span /><i /><i /><i /><i /><i /><b>crafted along the trail</b></div>{hasCuratedJourney && <div className="verified-journey-rail" aria-label="Verified traveller journey"><span><b>01</b> Discover craft</span><i /><span><b>02</b> Learn heritage</span><i />{primaryArtisan && <Link href={makerHref}><b>03</b> Meet maker</Link>}<i />{primaryExperience && <Link href={experienceHref}><b>04</b> Cultural experience</Link>}</div>}{!hasCuratedJourney && <div className="craft-journey-ladder" aria-label="Virāsat traveller journey"><span><b>01</b> Discover craft</span><i /><span><b>02</b> Meet maker</span><i /><span><b>03</b> Support heritage</span></div>}</div></div></section>

    <section className="process-section section-pad"><div className="container"><div className="process-heading"><div><span className="eyebrow">How it’s made</span><h2>Four patient<br /><em>movements.</em></h2></div><p>Not a production line — a material conversation, held one careful stage at a time.</p></div><div className="craft-process-line">{process.map((step, index) => <motion.article key={step.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ delay: index * 0.08 }}><span>0{index + 1}</span><i /><h3>{step.title}</h3><p>{step.copy}</p></motion.article>)}</div></div></section>

    {hasCuratedJourney && <><section className="maker-detail-section section-pad"><div className="container maker-detail-grid"><div className="maker-detail-photo"><img src={getCraftEditorialImage(craft)} alt="Published artisan craft context" /><span className="eyebrow">{craft.region} / {craft.state}</span></div><div><span className="eyebrow eyebrow-light">Published maker profile / step 03</span><h2>{primaryArtisan?.displayName}</h2><p>{primaryArtisan?.summary}</p><div className="maker-detail-stats"><span><b>Craft origin</b>{provenance[0]?.registeredName ?? craft.name}</span><span><b>Source</b>{primaryArtisan?.sourceLabel}</span></div><div className="heritage-ecosystem-line heritage-ecosystem-light"><span>Traveller discovers</span><i /><span>Maker’s source story</span><i /><span>Cultural context opens</span></div>{primaryArtisan && <Link href={makerHref} className="button button-outline-light">Meet the published maker <ArrowUpRight size={15} /></Link>}</div></div></section>
    <section className="craft-experience-section section-pad section-ivory"><div className="container craft-experience-wrap"><div><span className="eyebrow">Cultural experience / step 04</span><h2>Follow its<br /><em>published story.</em></h2></div><div><p>{primaryExperience?.summary}</p><div className="experience-detail-meta"><span>{primaryExperience?.experienceType}</span><span>{primaryExperience?.durationLabel}</span><span>{primaryExperience?.location}</span></div>{primaryExperience && <Link href={experienceHref} className="button button-primary">Open cultural resource <ArrowRight size={15} /></Link>}</div></div></section></>}

    {isLegacyChannapatna && <><section className="maker-detail-section section-pad"><div className="container maker-detail-grid"><div className="maker-detail-photo"><img src={craft.image} alt="Artisan workshop material" /><span className="eyebrow">{craft.region} / {craft.state}</span></div><div><span className="eyebrow eyebrow-light">Meet the active Artisan</span><h2>Follow the<br /><em>living studio.</em></h2><p>Virāsat now resolves the active Artisan’s public profile, published experiences, and Traveller bookings from the managed application database.</p><div className="heritage-ecosystem-line heritage-ecosystem-light"><span>Traveller discovers</span><i /><span>Artisan publishes</span><i /><span>Booking persists</span></div><Link href="/maker/artisan-studio" className="button button-outline-light">Meet the active Artisan <ArrowUpRight size={15} /></Link></div></div></section><section className="craft-experience-section section-pad section-ivory"><div className="container craft-experience-wrap"><div><span className="eyebrow">Experience it</span><h2>Find a published<br /><em>shared experience.</em></h2></div><div><p>A Traveller can book only the experiences an Artisan has actually published through the shared managed collection.</p><Link href="/maker/artisan-studio" className="button button-primary">View active experiences <ArrowRight size={15} /></Link></div></div></section></>}

    {isMysoreSilk && <section className="craft-experience-section section-pad section-ivory craft-journey-cta"><div className="container craft-journey-cta-grid"><div className="craft-journey-cta-visual"><img src={getCraftEditorialImage(craft)} alt="Mysore Silk loom and textile context" /><span>04 / experience</span><i /></div><div><span className="eyebrow">Managed experience / step 04</span><h2>Meet the silk<br /><em>in motion.</em></h2><p>Follow the live Mysore Silk record into a prototype cultural experience. Choose a date, create a persisted booking, and let the artisan confirm the visit.</p><div className="experience-detail-meta"><span>Mysuru, Karnataka</span><span>Traveller-visible</span><span>Confirmation required</span></div><Link href={experienceHref} className="button button-primary">Book Mysore Silk experience <ArrowRight size={15} /></Link></div></div></section>}

    {liveCraftId ? <ShopCraftSection craftId={liveCraftId} copy={`Discover handcrafted pieces published by participating ${craft.name} makers. Products appear only after a linked Artisan publishes them.`} /> : null}
    {!hasCuratedJourney && !isLegacyChannapatna && !isMysoreSilk && <section className="craft-continue-section"><div className="container craft-continue-grid"><div className="craft-continue-visual"><img src={getCraftEditorialImage(craft)} alt={`${craft.name} regional craft texture`} /><div><span>Live craft record</span><b>{craft.region}</b></div><i /></div><div className="craft-continue-copy"><span className="eyebrow eyebrow-light">Continue the trail</span><h2>Let your route<br /><em>lead further.</em></h2><p>This living craft currently has no published maker or cultural-experience record in Virāsat’s verified overlay. Its live craft story remains available as the cultural trail grows.</p><div className="experience-detail-meta"><span>Live craft record</span><span>{craft.region}</span><span>Route-aware discovery</span></div><div className="craft-continue-thread" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div><Link href="/planner" className="button button-light">Return to Cultural Trail <ArrowRight size={15} /></Link></div></div></section>}
  </main><MobileBottomNav role="traveller" /></div>;
}
