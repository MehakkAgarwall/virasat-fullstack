import { ArrowLeft, ExternalLink, MapPin, Sparkles } from "lucide-react";
import { Link, useRoute } from "wouter";
import { MobileBottomNav } from "../components/MobileBottomNav";
import { TopNav } from "../components/TopNav";
import { trpc } from "../lib/trpc";

export default function CulturalResourceDetail() {
  const [, params] = useRoute("/resources/:id");
  const resourceId = params?.id ?? "";
  const resourceQuery = trpc.culturalResource.get.useQuery({ resourceId }, { enabled: Boolean(resourceId) });
  const resource = resourceQuery.data;

  if (resourceQuery.isLoading) return <div className="app-shell experience-detail-page"><TopNav /><main><section className="experience-detail-hero section-pad"><div className="container"><p className="experience-detail-lede">Tracing the published cultural record…</p></div></section></main><MobileBottomNav role="traveller" /></div>;
  if (!resource) return <div className="app-shell experience-detail-page"><TopNav /><main><section className="experience-detail-hero section-pad"><div className="container"><span className="eyebrow">Cultural discovery</span><h1>This record is<br /><em>not available.</em></h1><p className="experience-detail-lede">This source-linked craft record is not part of the published cultural registry.</p><Link href="/explore" className="button button-primary">Return to Explore</Link></div></section></main><MobileBottomNav role="traveller" /></div>;

  return <div className="app-shell experience-detail-page"><TopNav /><main>
    <section className="experience-detail-hero section-pad"><div className="container experience-detail-grid"><div className="experience-image"><img src={resource.imageUrl} alt={`${resource.title} cultural reference`} /><span className="eyebrow">Source-linked cultural discovery</span></div><div><span className="eyebrow">Live craft record / {resource.location}</span><h1>{resource.title}</h1><p className="experience-detail-lede">{resource.summary}</p><div className="experience-facts"><span><MapPin size={14} />{resource.location}</span><span><Sparkles size={14} />Read-only resource</span></div><Link href={`/craft/api-${resource.craftId}`} className="underlined-link">Open the linked craft <ArrowLeft size={14} /></Link></div></div></section>
    <section className="booking-section section-pad section-ivory"><div className="container booking-grid"><div><span className="eyebrow">Cultural context</span><h2>Explore the craft<br /><em>without assumptions.</em></h2><p>This is a source-linked discovery record. It is not a bookable Artisan workshop and does not claim a price, capacity, schedule, availability, or named host that has not been supplied by a verified publisher.</p></div><aside className="reservation-card"><span className="eyebrow">Published source</span><h3>{resource.sourceLabel}</h3><a href={resource.sourceUrl} target="_blank" rel="noreferrer" className="button button-primary reservation-button">Open source record <ExternalLink size={15} /></a></aside></div></section>
  </main><MobileBottomNav role="traveller" /></div>;
}
