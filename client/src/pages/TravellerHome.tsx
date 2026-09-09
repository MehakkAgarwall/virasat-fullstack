// Virāsat Traveller home: an authenticated field desk built from local demo journey state, ready to swap to future API data.
import { ArrowRight, Compass, MapPinned, Route, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { CraftEditorialVisual } from "../components/CraftEditorialVisual";
import { MobileBottomNav } from "../components/MobileBottomNav";
import { TopNav } from "../components/TopNav";
import { crafts } from "../data/mock";
import { trpc } from "../lib/trpc";
import { getVisitorSubjectKey } from "../services/demoStatePersistence";
import { travellerDemoService } from "../services/travellerDemoService";

export default function TravellerHome() {
  const [state] = useState(() => travellerDemoService.getState());
  const travellerKey = getVisitorSubjectKey();
  const managedBookingsQuery = trpc.booking.listForTraveller.useQuery({ travellerKey });
  const savedCrafts = crafts.filter((craft) => state.savedCraftIds.includes(craft.id));
  const suggestedCrafts = crafts.slice(0, 2);

  return <div className="app-shell page-shell traveller-hub"><TopNav /><main>
    <section className="traveller-hub-hero section-pad"><div className="container traveller-hub-grid"><div><span className="eyebrow"><span className="eyebrow-stitch" />Traveller field desk</span><h1>Let the route<br /><em>hold a story.</em></h1><p>Your saved makers, planned stops, and workshop moments live here while you travel.</p><div className="traveller-hub-actions"><Link href="/explore" className="button button-primary"><Compass size={15} />Explore living craft</Link><Link href="/planner" className="button button-ghost"><Route size={15} />Plan a cultural trail</Link></div></div><aside className="traveller-hub-note"><span className="eyebrow">Your field note</span><strong>{state.routeExperience ? `${state.origin} → ${state.destination}` : "A journey waiting to begin"}</strong><p>{state.routeExperience ? `${state.trail.length} meaningful stop${state.trail.length === 1 ? "" : "s"} held in your Cultural Trail.` : "Trace a route and Virāsat will collect living traditions along the way."}</p><Link href="/planner" className="underlined-link">Open my trail <ArrowRight size={14} /></Link></aside></div></section>
    <section className="traveller-hub-stats"><div className="container"><article><b>{state.savedCraftIds.length.toString().padStart(2, "0")}</b><span>saved craft stories</span></article><article><b>{(managedBookingsQuery.data?.length ?? 0).toString().padStart(2, "0")}</b><span>shared workshops reserved</span></article><article><b>{state.cartProductIds.length + state.pickupProductIds.length}</b><span>objects held close</span></article></div></section>
    <section className="section-pad traveller-hub-content"><div className="container"><div className="section-heading-row"><div><span className="eyebrow">Saved craft stories</span><h2>Objects worth<br /><em>returning to.</em></h2></div><Link href="/explore" className="circle-link">Explore <ArrowRight size={16} /></Link></div>{savedCrafts.length ? <div className="traveller-saved-grid">{savedCrafts.map((craft) => <Link key={craft.id} href={`/craft/${craft.id}`} className="traveller-saved-card"><img src={craft.image} alt={craft.name} /><span>{craft.category} · {craft.state}</span><h3>{craft.name}</h3><p>{craft.region}</p></Link>)}</div> : <div className="traveller-empty-board"><div className="traveller-empty-copy"><span className="eyebrow"><Sparkles size={13} />Begin a field collection</span><strong>Nothing saved<br /><em>yet.</em></strong><p>Choose a craft story in the living catalogue and keep it close for the next journey.</p><Link href="/explore" className="button button-primary">Begin exploring <ArrowRight size={14} /></Link></div><div className="traveller-empty-craft-pair">{suggestedCrafts.map((craft, index) => <Link key={craft.id} href={`/craft/${craft.id}`} className={`traveller-empty-craft traveller-empty-craft-${index}`}><CraftEditorialVisual craft={craft} index={index} alt={`${craft.name} suggested craft`} /><span>{craft.name}</span></Link>)}</div></div>}</div></section>
    <section className="traveller-hub-route traveller-route-compact section-pad"><div className="container traveller-route-compact-grid"><div><span className="eyebrow eyebrow-light">Next meaningful stop</span><h2>Every detour can<br /><em>become a memory.</em></h2><p>Use the Cultural Detour Engine to find craft, maker, and experience stops between the places you already plan to go.</p><Link href="/planner" className="button button-outline-light"><MapPinned size={15} />Trace a journey <ArrowRight size={15} /></Link></div><Link href="/planner" className="traveller-route-visual"><CraftEditorialVisual craft={crafts[2] ?? crafts[0]} index={4} alt="A route-led craft suggestion" label="Next route discovery" /><span><b>One route.</b> Many hands.</span></Link></div></section>
  </main><MobileBottomNav role="traveller" /></div>;
}
