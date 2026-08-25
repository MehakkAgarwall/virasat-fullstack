import { ArrowRight, BookOpen, Compass, Edit3, Heart, MapPinned, Pin, Route, Sparkles, TicketCheck } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { MobileBottomNav } from "../components/MobileBottomNav";
import { TopNav } from "../components/TopNav";
import { useAuth } from "../contexts/AuthContext";
import { crafts } from "../data/mock";
import { trpc } from "../lib/trpc";
import { getVisitorSubjectKey } from "../services/demoStatePersistence";
import { travellerDemoService } from "../services/travellerDemoService";

export const myJourneySections = ["Trail record", "Workshop ledger", "Field journal", "Craft collection"] as const;
export const myJourneyIdentityEditHref = "/traveller/profile?edit=name";
export const myJourneyCardVisuals = {
  trail: "/manus-storage/my-journey-route-marker_a443ddce.jpg",
  workshop: "/manus-storage/my-journey-maker-workshop_87bd4a10.jpg",
  journal: "/manus-storage/my-journey-field-journal_3a4f927e.jpg",
  collection: "/manus-storage/my-journey-craft-keepsake_a33b490e.jpg",
} as const;

function displayDate(value: Date | string) {
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function MyJourney() {
  const { session } = useAuth();
  const [state] = useState(() => travellerDemoService.getState());
  const travellerKey = getVisitorSubjectKey();
  const profileQuery = trpc.travellerProfile.get.useQuery({ travellerKey });
  const bookingsQuery = trpc.booking.listForTraveller.useQuery({ travellerKey });
  const journalQuery = trpc.travellerJournal.list.useQuery({ travellerKey });
  const profileName = profileQuery.data?.displayName ?? session?.name ?? "Traveller";
  const firstName = profileName.split(" ")[0] || "Traveller";
  const bookings = bookingsQuery.data ?? [];
  const entries = journalQuery.data ?? [];
  const sharedCount = entries.filter((entry) => entry.isShared).length;
  const savedCrafts = crafts.filter((craft) => state.savedCraftIds.includes(craft.id)).slice(0, 3);
  const hasTrail = Boolean(state.routeExperience && state.origin && state.destination);

  return <div className="app-shell page-shell my-journey-page"><TopNav /><main>
    <section className="my-journey-hero my-journey-atlas-hero"><img className="my-journey-atlas-image" src="/manus-storage/my-journey-heritage-atlas-hero_3d5a1dce.jpg" alt="" /><div className="my-journey-atlas-wash" aria-hidden="true" /><div className="container my-journey-atlas-shell"><span className="my-journey-atlas-stamp my-journey-atlas-stamp-top" aria-hidden="true"><Sparkles size={20} /></span><span className="my-journey-atlas-stamp my-journey-atlas-stamp-bottom" aria-hidden="true"><Compass size={20} /></span><div className="my-journey-atlas-content"><div className="my-journey-atlas-title"><span className="eyebrow"><Pin size={13} /> Personal cultural atlas</span><h1>{firstName}'s<br /><em>Journey.</em></h1><p>Hold the routes you traced, time you reserved with makers, and field notes that stayed with you—without losing the thread between them.</p><div className="my-journey-hero-actions"><Link href="/planner" className="button button-primary"><Route size={15} />Open Cultural Trail</Link><Link href={myJourneyIdentityEditHref} className="button button-ghost"><Edit3 size={15} />Edit traveller name</Link></div></div><aside className="my-journey-route-marker my-journey-atlas-marker"><span className="eyebrow"><MapPinned size={13} /> Current trail marker</span><strong>{hasTrail ? <>{state.origin}<br />→ {state.destination}</> : "A route waiting to begin"}</strong><p>{hasTrail ? `${state.trail.length} cultural stop${state.trail.length === 1 ? "" : "s"} held in your current Trail.` : "Plan a Cultural Trail and the craft moments along it will find a home here."}</p><Link href="/planner" className="underlined-link">{hasTrail ? "Review this trail" : "Start a trail"} <ArrowRight size={14} /></Link></aside></div><div className="my-journey-atlas-metrics"><article><Route size={20} /><span><b>{state.savedCraftIds.length}</b>Routes<br />Explored</span></article><article><TicketCheck size={20} /><span><b>{bookings.length}</b>Maker<br />Bookings</span></article><article><BookOpen size={20} /><span><b>{entries.length}</b>Heritage<br />Notes</span></article><article><Sparkles size={20} /><span><b>{state.trail.length}</b>Moments<br />Captured</span></article><article><Heart size={20} /><span><b>{sharedCount}</b>Favourite<br />Experiences</span></article><p>Every trail leaves a mark.<br /><em>Every mark tells a story.</em></p></div></div></section>

    <section className="section-pad my-journey-ledger"><span className="my-journey-ledger-sticker" aria-hidden="true"><Sparkles size={18} /></span><div className="container"><div className="my-journey-section-heading"><div><span className="eyebrow">One personal record</span><h2>Held close to<br /><em>the route.</em></h2></div><p>Each card holds a part of your actual Traveller record—route, workshops, field notes, and saved craft stories.</p></div><div className="my-journey-story-grid">
      <article className="my-journey-story-card my-journey-story-trail"><img src={myJourneyCardVisuals.trail} alt="" /><div className="my-journey-story-copy"><span className="eyebrow"><MapPinned size={13} /> Trail record</span><h3>{hasTrail ? `${state.origin} to ${state.destination}` : "Where will the trail begin?"}</h3><p>{hasTrail ? `Your current Cultural Trail holds ${state.trail.length} route ${state.trail.length === 1 ? "discovery" : "discoveries"}. Return to the map to refine the route or discover another meaningful stop.` : "Choose an origin and destination, then let the Cultural Detour Engine reveal craft stories and maker moments along the way."}</p><Link href="/planner" className="underlined-link">{hasTrail ? "Continue the Cultural Trail" : "Plan a Cultural Trail"} <ArrowRight size={14} /></Link></div></article>
      <article className="my-journey-story-card my-journey-story-workshop"><img src={myJourneyCardVisuals.workshop} alt="" /><div className="my-journey-story-copy"><span className="eyebrow"><TicketCheck size={13} /> Workshop ledger</span><h3>Time with<br /><em>makers.</em></h3>{bookingsQuery.isLoading ? <p>Opening your managed workshop ledger…</p> : bookings.length ? <div className="my-journey-story-bookings">{bookings.slice(0, 2).map((item) => <Link href={`/experience/${item.experience?.id ?? "channapatna-toy-making"}`} key={item.booking.id}><span>{item.booking.status === "accepted" ? "Confirmed" : item.booking.status === "rejected" ? "Declined" : "Awaiting reply"}</span><strong>{item.experience?.title ?? "Published workshop"}</strong><small>{item.booking.bookingDate} · {item.experience?.location ?? "Location to be confirmed"}</small></Link>)}</div> : <p>No workshop is reserved yet. Published maker experiences will appear here after you send a request.</p>}<Link href="/traveller/bookings" className="underlined-link">Open workshop ledger <ArrowRight size={14} /></Link></div></article>
      <article className="my-journey-story-card my-journey-story-journal"><img src={myJourneyCardVisuals.journal} alt="" /><div className="my-journey-story-copy"><span className="eyebrow"><BookOpen size={13} /> Field journal</span><h3>Notes worth<br /><em>returning to.</em></h3>{journalQuery.isLoading ? <p>Gathering your field notes…</p> : entries.length ? <div className="my-journey-story-journal">{entries.slice(0, 1).map((entry) => <div key={entry.id}><time>{displayDate(entry.createdAt)}</time><p>{entry.content}</p>{entry.isShared ? <small><Heart size={11} /> Shared to Trail Board</small> : null}</div>)}</div> : <p>Your first reflection can begin with a material, a memory, or a question from the trail.</p>}<Link href="/notes" className="underlined-link">Open Heritage Notes <ArrowRight size={14} /></Link></div></article>
      <article className="my-journey-story-card my-journey-story-collection"><img src={myJourneyCardVisuals.collection} alt="" /><div className="my-journey-story-copy"><span className="eyebrow"><Sparkles size={13} /> Craft collection</span><h3>Stories you<br /><em>kept.</em></h3>{savedCrafts.length ? <div className="my-journey-story-crafts">{savedCrafts.slice(0, 2).map((craft) => <Link href={`/craft/${craft.id}`} key={craft.id}><strong>{craft.name}</strong><small>{craft.state}</small></Link>)}</div> : <p>Save a craft story from Explore and it will appear in this personal collection.</p>}<Link href="/explore" className="underlined-link">Explore living craft <ArrowRight size={14} /></Link></div></article>
    </div></div></section>

    <section className="my-journey-close"><div className="container"><div><span className="eyebrow">The journey continues</span><h2>Make room for<br /><em>the next encounter.</em></h2></div><Link href="/notes#shared-trail-board" className="button button-outline-light"><Compass size={15} />Visit the Shared Trail Board</Link></div></section>
  </main><MobileBottomNav role="traveller" /></div>;
}
