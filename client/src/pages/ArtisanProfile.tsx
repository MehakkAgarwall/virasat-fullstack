// Kalā Trail product system: public maker stories shown from the managed artisan_profiles table, with fallback to heritage enrichment mock data for legacy craft-journey links.
import { ArrowRight, ArrowUpRight, Award, CalendarDays, MapPin, ShieldCheck, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import { MobileBottomNav } from "../components/MobileBottomNav";
import { TopNav } from "../components/TopNav";
import { getPublishedArtisan, getPublishedCraftJourneyForArtisan, getPublishedExperiencesForArtisan } from "../services/heritageEnrichmentService";
import { trpc } from "../lib/trpc";
import { getPublicProfileVisualSources } from "../services/artisanProfileVisual";
import { ArtisanProductShelf } from "../components/ShopCraftSection";

type ManagedProfileMedia = {
  personalName: string;
  studioName: string;
  profilePhotoUrl: string;
  coverPhotoUrl: string;
};

function ManagedArtisanPhoto({ profile }: { profile: ManagedProfileMedia }) {
  const sources = getPublicProfileVisualSources(profile);
  const [sourceIndex, setSourceIndex] = useState(0);
  const currentSource = sources[Math.min(sourceIndex, sources.length - 1)];

  useEffect(() => setSourceIndex(0), [profile.profilePhotoUrl, profile.coverPhotoUrl]);

  return <div className="artisan-profile-photo artisan-profile-photo-managed">
    <img
      src={currentSource}
      alt={`${profile.personalName} at ${profile.studioName}`}
      referrerPolicy="no-referrer"
      onError={(event) => {
        if (sourceIndex < sources.length - 1) {
          setSourceIndex((index) => index + 1);
          return;
        }
        event.currentTarget.style.visibility = "hidden";
      }}
    />
    <span className="artisan-profile-media-caption">Studio craft image</span>
    <span className="artisan-verified"><ShieldCheck size={14} />Published studio profile</span>
  </div>;
}

export default function ArtisanProfile() {
  const [, params] = useRoute("/maker/:slug");
  const slug = params?.slug ?? "";

  // Always try the real DB first using the slug as artisanKey
  const managedProfileQuery = trpc.artisanProfile.get.useQuery(
    { artisanKey: slug },
    { enabled: slug.length >= 8 }
  );
  const managedExperiencesQuery = trpc.experience.listPublished.useQuery(undefined, {
    enabled: slug.length >= 8,
  });

  // Fallback: legacy mock data from heritageEnrichmentService
  const legacyArtisan = getPublishedArtisan(slug);
  const publicExperience = getPublishedExperiencesForArtisan(legacyArtisan?.slug)[0];
  const publishedJourney = getPublishedCraftJourneyForArtisan(legacyArtisan?.slug);

  const profile = managedProfileQuery.data;
  const isLoading = managedProfileQuery.isLoading && slug.length >= 8;
  const hasRealProfile = Boolean(profile);

  // If DB query returned a real profile, render from real data
  if (hasRealProfile && profile) {
    const managedExperiences = (managedExperiencesQuery.data ?? []).filter(
      (experience) => experience.artisanKey === profile.artisanKey
    );
    const managedExperience = managedExperiences[0];

    return <div className="app-shell artisan-profile-page"><TopNav /><main>
      {profile.coverPhotoUrl && <section className="artisan-profile-cover-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(6,23,17,.94), rgba(6,23,17,.42)), url(${profile.coverPhotoUrl})` }} />}
      <section className="artisan-profile-hero section-pad"><div className="container artisan-profile-grid">
        <ManagedArtisanPhoto profile={profile} />
        <div className="artisan-profile-copy">
          <span className="eyebrow">{profile.location}{profile.state ? ` / ${profile.state}` : ""}</span>
          <h1>{profile.studioName}<br /><em>by {profile.personalName}.</em></h1>
          <p>{profile.craftSpecialization}</p>
          <span className="artisan-dir-badge" style={{ position: "relative", display: "inline-flex", marginTop: "12px" }}><Award size={11} />Shilp Guru Awardee</span>
          <div className="artisan-stat-list">
            <span><Star size={14} />Shilp Guru awardee</span>
            <span><MapPin size={14} />{profile.location}</span>
            {profile.yearsOfPractice > 0 && <span><CalendarDays size={14} />{profile.yearsOfPractice} years experience</span>}
          </div>
          <div className="maker-route-stitch"><span>Studio</span><i /><span>Route</span><i /><span>Story</span></div>
          <p className="artisan-profile-lede">{profile.bio}</p>
          {profile.languages && <div className="heritage-ecosystem-line"><span>{profile.languages}</span><i /><span>Traveller discovery</span><i /><span>Public profile</span></div>}
          {!profile.languages && <div className="heritage-ecosystem-line"><span>Living craft</span><i /><span>Traveller discovery</span><i /><span>Public profile</span></div>}
          <div className="artisan-connection-actions">
            {managedExperience
              ? <Link href={`/experience/${managedExperience.id}`} className="button button-primary">Experience the craft <ArrowRight size={15} /></Link>
              : <Link href="/artisans" className="button button-ghost">Browse all artisans <ArrowRight size={15} /></Link>
            }
            <Link href="/explore" className="button button-ghost">Explore live crafts <ArrowUpRight size={14} /></Link>
          </div>
        </div>
      </div></section>

      {profile.publicContact && <section className="artisan-work-section section-pad section-ivory"><div className="container">
        <div className="section-heading-row"><div><span className="eyebrow">Contact</span><h2>Reach the<br /><em>maker.</em></h2></div></div>
        <p className="body-copy">{profile.publicContact}</p>
      </div></section>}

      <section className="artisan-experience-section section-pad"><div className="container artisan-experience-grid">
        <div>
          <span className="eyebrow eyebrow-light">Step inside the process</span>
          <h2>Make one<br /><em>with {profile.personalName}.</em></h2>
        </div>
        {managedExperiencesQuery.isLoading
          ? <article><span className="eyebrow">Managed experience</span><h3>Loading published experiences</h3></article>
          : managedExperiences.length
            ? managedExperiences.map((experience) => <article key={experience.id}><span className="eyebrow">Managed experience</span><h3>{experience.title}</h3><p>{experience.description}</p><Link href={`/experience/${experience.id}`} className="underlined-link">Book this experience <ArrowRight size={14} /></Link></article>)
            : <article><span className="eyebrow">Managed experience</span><h3>No published experience yet.</h3><p>This Artisan has not published a Traveller-visible experience.</p></article>
        }
      </div></section>

      <ArtisanProductShelf artisanKey={profile.artisanKey} />
    </main><MobileBottomNav role="traveller" /></div>;
  }

  // If still loading, show spinner
  if (isLoading) {
    return <div className="app-shell artisan-profile-page"><TopNav /><main><section className="artisan-profile-hero section-pad"><div className="container artisan-profile-grid"><div className="artisan-profile-copy"><span className="eyebrow">Maker profile</span><h1>Loading the<br /><em>studio story.</em></h1></div></div></section></main><MobileBottomNav role="traveller" /></div>;
  }

  // Fallback: legacy mock artisan from heritageEnrichmentService
  if (legacyArtisan) {
    return <div className="app-shell artisan-profile-page"><TopNav /><main><section className="artisan-profile-hero section-pad"><div className="container artisan-profile-grid"><div className="artisan-profile-photo"><img src="/manus-storage/virasat-moradabad-brass_b2309329.jpg" alt={`${legacyArtisan.displayName} craft context`} /><span className="artisan-verified"><ShieldCheck size={14} />Published source-linked profile</span></div><div className="artisan-profile-copy"><span className="eyebrow">{legacyArtisan.district} / {legacyArtisan.state}</span><h1>{legacyArtisan.displayName}</h1><p>{legacyArtisan.craftTitle}</p><div className="artisan-stat-list"><span><MapPin size={14} />{legacyArtisan.locality}</span><span><CalendarDays size={14} />Published reference</span></div><div className="maker-route-stitch"><span>Craft</span><i /><span>Maker</span><i /><span>Source</span></div><p className="artisan-profile-lede">{legacyArtisan.summary}</p>{publishedJourney && <div className="published-journey-note"><ShieldCheck size={14} /><span><b>Craft origin</b>{publishedJourney.provenance.map((item) => `${item.label} verified`).join(" · ")} · {publishedJourney.provenance[0]?.registeredName}</span><Link href={publishedJourney.craftHref}>Return to craft <ArrowRight size={13} /></Link></div>}<div className="heritage-ecosystem-line"><span>A traveller's discovery</span><i /><span>A maker's visible story</span><i /><span>A cited cultural record</span></div><div className="artisan-connection-actions"><a href={legacyArtisan.sourceUrl} target="_blank" rel="noreferrer" className="button button-primary">Open source profile <ArrowUpRight size={14} /></a>{publicExperience && <Link href={`/experience/${publicExperience.slug}`} className="button button-ghost">View cultural resource <ArrowRight size={15} /></Link>}</div></div></div></section><section className="artisan-experience-section section-pad"><div className="container artisan-experience-grid"><div><span className="eyebrow eyebrow-light">Source-linked cultural resource / step 04</span><h2>{publicExperience ? <>Follow the<br /><em>published record.</em></> : <>A story held<br /><em>in source.</em></>}</h2></div><article><span className="eyebrow">Read-only / discovery</span><h3>{publicExperience?.title ?? legacyArtisan.sourceLabel}</h3><p>{publicExperience?.summary ?? "This profile is intentionally limited to its published cultural source. Virāsat does not imply booking, sales, or availability."}</p>{publicExperience ? <Link href={`/experience/${publicExperience.slug}`} className="underlined-link">Open cultural resource <ArrowRight size={14} /></Link> : <a href={legacyArtisan.sourceUrl} target="_blank" rel="noreferrer" className="underlined-link">Open source <ArrowUpRight size={14} /></a>}</article></div></section></main><MobileBottomNav role="traveller" /></div>;
  }

  // Not found
  return <div className="app-shell artisan-profile-page"><TopNav /><main><section className="artisan-profile-hero section-pad"><div className="container artisan-profile-grid"><div className="artisan-profile-copy"><span className="eyebrow">Maker profile</span><h1>This maker story<br /><em>is not available.</em></h1><p>The requested profile is not part of Virāsat's published cultural record. Continue through the live craft catalogue or trace a cultural route.</p><div className="artisan-connection-actions"><Link href="/artisans" className="button button-primary">Browse all artisans <ArrowRight size={15} /></Link><Link href="/explore" className="button button-ghost">Explore live crafts <ArrowRight size={15} /></Link><Link href="/planner" className="button button-ghost">Return to Cultural Trail <ArrowRight size={15} /></Link></div></div></div></section></main><MobileBottomNav role="traveller" /></div>;
}
