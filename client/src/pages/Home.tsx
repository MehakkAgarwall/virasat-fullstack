// Virāsat campaign landing: photographic heritage objects, editorial type, and one quiet glowing thread — no geometric 3D approximation.
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowDown, ArrowUpRight, MapPinned, Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { RoleSelection } from "../components/RoleSelection";
import { VirasatCrest } from "../components/VirasatCrest";
import { landingFaqs } from "../data/landingFaq";

function VirasatFaqSection() {
  const [openIds, setOpenIds] = useState<string[]>(["01", "03"]);
  const toggle = (id: string) => setOpenIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  return <section className="virasat-faq-section" aria-labelledby="virasat-faq-title"><div className="virasat-faq-shell"><header className="virasat-faq-intro"><span className="eyebrow">Field notes / Virāsat</span><h2 id="virasat-faq-title">Questions,<br /><em>answered.</em></h2><p>Everything you need to know about discovering crafts, meeting makers, and moving through India’s living heritage.</p><div className="virasat-faq-thread" aria-hidden="true"><i /><span>Place</span><i /><span>Person</span><i /><span>Story</span></div></header><div className="virasat-faq-list">{landingFaqs.map((item) => {
    const isOpen = openIds.includes(item.id);
    return <article key={item.id} className={`virasat-faq-item ${isOpen ? "is-open" : ""}`}><button type="button" aria-expanded={isOpen} aria-controls={`faq-answer-${item.id}`} onClick={() => toggle(item.id)}><span className="virasat-faq-number">{item.id}</span><span className="virasat-faq-question">{item.question}</span><Plus size={18} aria-hidden="true" /></button><AnimatePresence initial={false}>{isOpen && <motion.div id={`faq-answer-${item.id}`} className="virasat-faq-answer" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .24, ease: [0.23, 1, 0.32, 1] }}><p>{item.answer}</p></motion.div>}</AnimatePresence></article>;
  })}</div></div><p className="virasat-faq-closing">“A craft is more than an object. It is a place, a person, and a story still being made.”</p></section>;
}

export default function Home() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const imageX = useSpring(x, { stiffness: 38, damping: 24 });
  const imageY = useSpring(y, { stiffness: 38, damping: 24 });
  const enter = () => document.getElementById("experience-virasat")?.scrollIntoView({ behavior: "smooth" });

  return <div className="virasat-landing" onPointerMove={(event) => { x.set((event.clientX / window.innerWidth - .5) * 11); y.set((event.clientY / window.innerHeight - .5) * 8); }}>
    <section className="virasat-hero virasat-photo-hero">
      <div className="virasat-photo-vignette" />
      <motion.div className="virasat-hero-photograph" style={{ x: imageX, y: imageY }}>
        <img src="/manus-storage/virasat-cinematic-hero_a6f216e0.jpg" alt="Antique brass vessel, woven textile, and terracotta diya in a heritage gallery" />
      </motion.div>
      <div className="virasat-ornament virasat-ornament-left" aria-hidden="true" />
      <div className="virasat-ornament virasat-ornament-right" aria-hidden="true" />
      <svg className="virasat-living-thread virasat-photo-thread" viewBox="0 0 1200 800" preserveAspectRatio="none" aria-hidden="true"><defs><filter id="virasat-thread-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs><path id="virasat-journey-path" className="living-thread-path" d="M 6 650 C 136 590 200 645 310 614 C 414 584 411 423 532 418 C 635 413 698 592 823 574 C 948 556 1002 640 1195 575" /><g className="virasat-thread-travellers" filter="url(#virasat-thread-glow)"><circle className="virasat-thread-dot virasat-thread-dot-far" r="2.4"><animateMotion dur="15s" repeatCount="indefinite" begin="-9s"><mpath href="#virasat-journey-path" /></animateMotion><animate attributeName="r" values="1.5;2.4;1.7" dur="4.8s" repeatCount="indefinite" /><animate attributeName="opacity" values=".15;.72;.18" dur="4.8s" repeatCount="indefinite" /></circle><circle className="virasat-thread-dot virasat-thread-dot-mid" r="3.8"><animateMotion dur="12s" repeatCount="indefinite" begin="-4.5s"><mpath href="#virasat-journey-path" /></animateMotion><animate attributeName="r" values="2.2;4.5;2.4" dur="4.2s" repeatCount="indefinite" /><animate attributeName="opacity" values=".2;.9;.2" dur="4.2s" repeatCount="indefinite" /></circle><circle className="virasat-thread-dot virasat-thread-dot-near" r="5.4"><animateMotion dur="9.5s" repeatCount="indefinite" begin="-1s"><mpath href="#virasat-journey-path" /></animateMotion><animate attributeName="r" values="2.6;6.1;2.8" dur="3.6s" repeatCount="indefinite" /><animate attributeName="opacity" values=".22;1;.26" dur="3.6s" repeatCount="indefinite" /></circle></g></svg>
      <header className="virasat-nav"><Link href="/" className="virasat-wordmark virasat-hero-wordmark"><VirasatCrest className="virasat-nav-crest" />Virāsat <span>Living heritage · India</span></Link><nav aria-label="Minimal navigation"><Link href="/explore">Explore</Link><button onClick={enter}>About</button><button onClick={enter}>Enter</button></nav></header>
      <div className="virasat-hero-copy">
        <div className="virasat-hero-titleline"><VirasatCrest className="virasat-title-crest" /><motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .86, ease: [0.23, 1, 0.32, 1] }}><span>Virāsat</span></motion.h1></div>
        <span className="virasat-calligraphic">living</span>
        <svg className="virasat-word-flourish" viewBox="0 0 620 105" preserveAspectRatio="none" aria-hidden="true"><path d="M12 41 C112 99 215 87 280 49 C352 7 411 12 466 63 C504 99 558 87 610 48" /><path d="M105 72 C185 98 243 88 294 59" /></svg>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .34, duration: .75 }}>Turn every <em>journey</em><br />into a cultural <em className="virasat-story-script">trail.</em></motion.p>
        <small>Choose any route. Discover the craft, maker, and experience already waiting along the way.</small>
        <div className="virasat-hero-route-proof" aria-label="Virāsat cultural discovery flow"><span><MapPinned size={13} />Trace a route</span><i /><span><Sparkles size={13} />Meet its craft</span><i /><span>Carry its story</span></div>
        <button className="virasat-enter" onClick={enter}>Trace a cultural trail <ArrowUpRight size={16} /><i /></button>
      </div>
      <aside className="virasat-photo-caption"><span><i />Artifact study / 01</span><strong>Brass, earth &amp; woven memory</strong><small>India’s living craft, held in material.</small></aside>
      <div className="virasat-hero-foot"><span>01 / Route-first discovery</span><button onClick={enter}>Scroll to enter <ArrowDown size={14} /></button><span>INDIA / 2026</span></div>
    </section>
    <section id="experience-virasat" className="virasat-role-transition"><RoleSelection embedded /></section>
    <VirasatFaqSection />
  </div>;
}
