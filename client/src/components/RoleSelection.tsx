// Virāsat role entry: the screen after the campaign hero is a dark, photographed museum passage—not a separate onboarding design.
import { ArrowRight, Building2, Compass, Landmark } from "lucide-react";
import { useLocation } from "wouter";
import { GoldenThread, GoldDivider, HeritageImage, HeritageLabel, VirasatButton, VirasatCard, VirasatHeading } from "./VirasatPrimitives";
import { VirasatDepthSurface } from "./VirasatDepthSurface";

const roles = [
  { id: "traveller", label: "Traveller", title: "Trace a route. Meet the craft, maker, and experience along it.", note: "Route · craft · maker", cta: "Trace a cultural trail", icon: Compass, href: "/planner", image: "/manus-storage/virasat-craft-terracotta_b9573ecd.jpg", imageAlt: "Terracotta craft in a traditional workshop" },
  { id: "artisan", label: "Artisan / Business Owner", title: "Put your craft on the map and welcome route-led discovery.", note: "Craft · guest · story", cta: "Open artisan workspace", icon: Building2, href: "/artisan", image: "/manus-storage/virasat-craft-weaving_76580db7.jpg", imageAlt: "Artisan hands weaving heritage textile" },
  { id: "authority", label: "Tourism Authority", title: "See how cultural routes translate into regional care and demand.", note: "Tradition · demand · care", cta: "View tourism intelligence", icon: Landmark, href: "/authority", image: "/manus-storage/virasat-craft-metalwork_f249c877.jpg", imageAlt: "Artisan engraving a heritage brass object" },
];

export function RoleSelection({ embedded = false }: { embedded?: boolean }) {
  const [, setLocation] = useLocation();
  const choose = (role: string) => setLocation(`/login?role=${role}`);
  return <section className={`${embedded ? "virasat-role-selection" : "login-role-selection"} role-selection-cinematic`}><div className="role-selection-atmosphere" aria-hidden="true" /><GoldenThread className="role-selection-thread" /><div className="role-selection-intro"><VirasatHeading eyebrow="Choose your way in" title={<>One cultural trail.<br />Three ways to <em>move it forward.</em></>} accent="route · craft · living memory" copy="Start as a traveller, maker, or steward. Each path reveals a different part of the same living cultural network." /><div className="role-journey-legend" aria-label="Virāsat journey sequence"><span>01 / travel</span><i /><span>02 / discover</span><i /><span>03 / connect</span></div><GoldDivider /></div><div className="role-selection-list">{roles.map((item) => { const Icon = item.icon; return <VirasatDepthSurface key={item.id} className="role-depth-surface" intensity={3.5}><VirasatCard className="role-heritage-card" onClick={() => choose(item.id)}><HeritageImage src={item.image} alt={item.imageAlt} label={item.note} /><div className="role-heritage-card-copy"><span className="role-heritage-icon"><Icon size={20} /></span><div><HeritageLabel>{item.label}</HeritageLabel><h3>{item.title}</h3></div><VirasatButton onClick={(event) => { event.stopPropagation(); choose(item.id); }}>{item.cta} <ArrowRight size={15} /></VirasatButton></div></VirasatCard></VirasatDepthSurface>; })}</div></section>;
}
