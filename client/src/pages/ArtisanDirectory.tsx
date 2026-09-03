// Virāsat Artisan Directory: public listing of all Shilp Guru awardee artisan profiles.
import { motion } from "framer-motion";
import { ArrowUpRight, Award, MapPin, Search, ShieldCheck, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { MobileBottomNav } from "../components/MobileBottomNav";
import { TopNav } from "../components/TopNav";
import { trpc } from "../lib/trpc";

const DEFAULT_COVER = "/manus-storage/mysuru-heritage-pavilion_6c4424ad.jpg";

function ShilpGuruBadge() {
  return (
    <span className="artisan-dir-badge">
      <Award size={11} />Shilp Guru Awardee
    </span>
  );
}

function ArtisanCard({ artisan, index }: { artisan: ArtisanListItem; index: number }) {
  const coverSrc = artisan.coverPhotoUrl && artisan.coverPhotoUrl !== DEFAULT_COVER
    ? artisan.coverPhotoUrl
    : DEFAULT_COVER;

  return (
    <motion.article
      className="artisan-dir-card"
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: 0.36, delay: Math.min(index, 12) * 0.03 }}
    >
      <Link href={`/maker/${artisan.artisanKey}`}>
        <div className="artisan-dir-card-image">
          <img
            src={coverSrc}
            alt={`${artisan.craftSpecialization} — ${artisan.personalName}`}
            referrerPolicy="no-referrer"
            onError={(event) => { event.currentTarget.src = DEFAULT_COVER; }}
          />
          <ShilpGuruBadge />
        </div>
        <div className="artisan-dir-card-body">
          <h3>{artisan.personalName}</h3>
          <span className="artisan-dir-craft">{artisan.craftSpecialization}</span>
          <span className="artisan-dir-location"><MapPin size={11} />{artisan.location}{artisan.state ? `, ${artisan.state}` : ""}</span>
          {artisan.bio && <p>{artisan.bio}</p>}
          <span className="artisan-dir-link">View maker profile <ArrowUpRight size={12} /></span>
        </div>
      </Link>
    </motion.article>
  );
}

type ArtisanListItem = {
  id: number;
  artisanKey: string;
  personalName: string;
  studioName: string;
  craftSpecialization: string;
  state: string;
  location: string;
  coverPhotoUrl: string;
  profilePhotoUrl: string;
  yearsOfPractice: number;
  bio: string;
};

export default function ArtisanDirectory() {
  const [query, setQuery] = useState("");
  const artisansQuery = trpc.artisanProfile.listAll.useQuery();
  const artisans = (artisansQuery.data ?? []) as ArtisanListItem[];

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!normalizedQuery) return artisans;
    return artisans.filter((artisan) =>
      `${artisan.personalName} ${artisan.craftSpecialization} ${artisan.state} ${artisan.location}`
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [artisans, normalizedQuery]);

  const uniqueStates = useMemo(() =>
    Array.from(new Set(artisans.map((a) => a.state).filter(Boolean))).sort(),
    [artisans]
  );

  return (
    <div className="app-shell page-shell artisan-directory-page">
      <TopNav />
      <main>
        <section className="artisan-dir-hero section-pad">
          <div className="container artisan-dir-hero-inner">
            <div>
              <span className="eyebrow"><span className="eyebrow-stitch" />Shilp Guru artisans / living heritage</span>
              <h1>The hands that<br /><em>carry India.</em></h1>
              <p className="artisan-dir-hero-lede">
                {artisansQuery.isLoading
                  ? "Tracing the master craftspeople of India…"
                  : `${artisans.length} Shilp Guru award-winning artisans — government-honoured masters whose craft has been recognised as a national treasure.`
                }
              </p>
            </div>
            <div className="artisan-dir-hero-aside">
              <div className="artisan-dir-hero-stat">
                <strong>{artisansQuery.isLoading ? "—" : artisans.length}</strong>
                <span>master artisans<br />in the directory</span>
              </div>
              <div className="artisan-dir-hero-stat">
                <strong>{artisansQuery.isLoading ? "—" : uniqueStates.length}</strong>
                <span>states<br />represented</span>
              </div>
            </div>
          </div>
        </section>

        <section className="artisan-dir-controls">
          <div className="container">
            <div className="search-bar">
              <Search size={18} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name, craft, or state…"
                aria-label="Search artisans by name, craft, or state"
              />
            </div>
            <p className="artisan-dir-feedback" role="status" aria-live="polite">
              <b>{filtered.length}</b> {filtered.length === 1 ? "artisan" : "artisans"} shown
              {normalizedQuery && <span> · matching "{query.trim()}"</span>}
            </p>
          </div>
        </section>

        {artisansQuery.isLoading ? (
          <section className="section-pad">
            <div className="container">
              <div className="empty-state explore-loading-state">
                <Sparkles size={22} />
                <h2>Tracing living traditions.</h2>
                <p>Bringing the artisan directory into view.</p>
              </div>
            </div>
          </section>
        ) : filtered.length ? (
          <section className="artisan-dir-grid-section section-pad">
            <div className="container">
              <div className="artisan-dir-grid">
                {filtered.map((artisan, index) => (
                  <ArtisanCard key={artisan.artisanKey} artisan={artisan} index={index} />
                ))}
              </div>
            </div>
          </section>
        ) : (
          <section className="section-pad">
            <div className="container">
              <div className="empty-state">
                <ShieldCheck size={22} />
                <h2>No artisan found.</h2>
                <p>Try another name, craft, or state.</p>
              </div>
            </div>
          </section>
        )}
      </main>
      <MobileBottomNav role="traveller" />
    </div>
  );
}
