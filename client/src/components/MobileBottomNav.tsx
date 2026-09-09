// Kalā Trail visual system: role-aware mobile navigation preserves the editorial app character at small breakpoints.
import { BriefcaseBusiness, CalendarDays, ChartNoAxesCombined, Compass, LogOut, Map, Package, Route, Settings2, ShieldCheck, UserRound, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../contexts/AuthContext";
import { travellerMoreNavigation, travellerPrimaryNavigation, isTravellerMoreRoute } from "./travellerNavigation";

type Role = "traveller" | "artisan" | "authority";

const roleItems = {
  artisan: [
    { label: "Dashboard", href: "/artisan", icon: BriefcaseBusiness },
    { label: "Products", href: "/artisan?tab=products", icon: Package },
    { label: "Experiences", href: "/artisan?tab=experiences", icon: Compass },
    { label: "Orders", href: "/artisan?tab=orders", icon: Map },
    { label: "Settings", href: "/settings", icon: Settings2 },
  ],
  authority: [
    { label: "Overview", href: "/authority", icon: ChartNoAxesCombined },
    { label: "Verification", href: "/authority?tab=verification", icon: ShieldCheck },
    { label: "Analytics", href: "/authority?tab=analytics", icon: Map },
    { label: "Settings", href: "/settings", icon: Settings2 },
  ],
} as const;

export function MobileBottomNav({ role }: { role: Role }) {
  const [location] = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const { logout } = useAuth();
  const travellerItems = travellerPrimaryNavigation.map((item) => ({ label: "shortLabel" in item ? item.shortLabel : item.label, href: item.href, icon: item.icon, match: item.match }));
  const items = role === "traveller" ? travellerItems : roleItems[role];
  return <><nav className={`mobile-bottom-nav mobile-bottom-${role}`} aria-label={`${role} mobile navigation`}>
    {items.map((item) => {
      const Icon = item.icon;
      const query = typeof window === "undefined" ? "" : window.location.search;
      const active = "match" in item ? item.match(location) : item.href.includes("?") ? query === item.href.slice(item.href.indexOf("?")) : location === item.href;
      return <Link key={item.label} href={item.href} className={`mobile-bottom-item ${active ? "mobile-bottom-active" : ""}`}><Icon size={18} /><span>{item.label}</span></Link>;
    })}
    {role === "traveller" && <button type="button" className={`mobile-bottom-item ${moreOpen || isTravellerMoreRoute(location) ? "mobile-bottom-active" : ""}`} onClick={() => setMoreOpen((visible) => !visible)} aria-expanded={moreOpen} aria-controls="traveller-mobile-more"><UserRound size={18} /><span>More</span></button>}
  </nav>{role === "traveller" && moreOpen && <div id="traveller-mobile-more" className="traveller-mobile-more" role="dialog" aria-label="Traveller account and more destinations">{travellerMoreNavigation.map((item) => { const Icon = item.icon; return <Link key={item.href} href={item.href} onClick={() => setMoreOpen(false)}><Icon size={17} />{item.label}</Link>; })}<Link href="/login" onClick={() => setMoreOpen(false)}><Settings2 size={17} />Switch role</Link><button onClick={() => { logout(); setMoreOpen(false); window.location.href = "/"; }}><LogOut size={17} />Leave demo</button><button className="traveller-mobile-more-close" onClick={() => setMoreOpen(false)}><X size={16} />Close</button></div>}</>;
}
