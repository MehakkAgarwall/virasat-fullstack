// Kalā Trail visual system: quiet floating navigation that turns opaque on light pages for reliable contrast.
import { ArrowLeft, BookOpen, ChevronDown, Compass, LogIn, LogOut, MapPinned, Menu, Route, Settings2, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { BrandMark } from "./BrandMark";
import { useAuth } from "../contexts/AuthContext";
import { getPublishedCraftJourneyForArtisan, getPublishedCraftJourneyForExperience } from "../services/heritageEnrichmentService";
import { travellerMoreNavigation, travellerPrimaryNavigation } from "./travellerNavigation";

let lastPublicRoute = "";
const routeLabels: Record<string, string> = {
  "/": "Virāsat",
  "/explore": "Explore",
  "/artisans": "Artisan Directory",
  "/notes": "Heritage Notes",
  "/planner": "Cultural Trail",
  "/atlas": "Craft Atlas",
  "/traveller/journey": "My Journey",
  "/login": "Role selection",
  "/artisan": "Artisan studio",
  "/authority": "Authority workspace",
  "/settings": "Settings",
};
const labelForRoute = (route: string) => routeLabels[route.split("?")[0].split("#")[0]] ?? (route.startsWith("/craft/") ? "Craft story" : route.startsWith("/maker/") ? "Maker profile" : route.startsWith("/product/") ? "Craft object" : route.startsWith("/experience/") ? "Experience" : "Virāsat");
const fallbackForRoute = (route: string) => {
  const cleanRoute = route.split("?")[0].split("#")[0];
  const artisanSlug = /^\/maker\/([^/]+)$/.exec(cleanRoute)?.[1];
  const experienceSlug = /^\/experience\/([^/]+)$/.exec(cleanRoute)?.[1];
  const publishedJourney = artisanSlug ? getPublishedCraftJourneyForArtisan(artisanSlug) : experienceSlug ? getPublishedCraftJourneyForExperience(experienceSlug) : undefined;
  if (publishedJourney) return publishedJourney.craftHref;
  if (cleanRoute === "/experience/channapatna-toy-making") return "/maker/artisan-studio";
  if (cleanRoute === "/traveller/journey") return "/traveller";
  return cleanRoute.startsWith("/craft/") || cleanRoute.startsWith("/maker/") || cleanRoute.startsWith("/experience/") || cleanRoute === "/notes" || cleanRoute === "/atlas" ? "/explore" : cleanRoute.startsWith("/product/") ? "/maker/artisan-studio" : cleanRoute.startsWith("/planner") ? "/explore" : "/";
};

export function TopNav({ dark = false }: { dark?: boolean }) {
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const [previousRoute, setPreviousRoute] = useState(() => lastPublicRoute);
  const { session, logout } = useAuth();
  const linkClass = dark ? "text-ivory/75 hover:text-ivory" : "text-ink/65 hover:text-forest";
  const fallbackRoute = fallbackForRoute(location);
  const backRoute = previousRoute && previousRoute !== location ? previousRoute : fallbackRoute;
  const backLabel = `Back to ${labelForRoute(backRoute)}`;
  useEffect(() => { if (lastPublicRoute && lastPublicRoute !== location) setPreviousRoute(lastPublicRoute); lastPublicRoute = location; }, [location]);
  const goBack = () => previousRoute && previousRoute !== location && window.history.length > 1 ? window.history.back() : setLocation(fallbackRoute);
  const exitDemo = () => { logout(); setOpen(false); setAccountOpen(false); setLocation("/"); };
  const isTraveller = session?.role === "traveller";
  const closeMenus = () => { setOpen(false); setAccountOpen(false); };

  return (
    <header className={`top-nav ${dark ? "top-nav-dark" : ""}`}>
      <div className="nav-inner">
        <Link href="/" onClick={closeMenus} className="nav-brand"><BrandMark /></Link>
        {location !== "/" && <button className={`nav-back ${dark ? "nav-back-dark" : ""}`} onClick={goBack} aria-label={backLabel}><ArrowLeft size={14} /><span>{backLabel}</span></button>}
        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary navigation">
          {isTraveller ? travellerPrimaryNavigation.map((item) => { const Icon = item.icon; return <Link key={item.href} href={item.href} className={`nav-link ${item.match(location) ? "nav-link-active" : linkClass}`} aria-current={item.match(location) ? "page" : undefined}><Icon size={15} />{item.label}</Link>; }) : <>
            <Link href="/explore" className={`nav-link ${location === "/explore" ? "nav-link-active" : linkClass}`}><Compass size={15} />Explore</Link>
            <Link href="/artisans" className={`nav-link ${location === "/artisans" || location.startsWith("/maker/") ? "nav-link-active" : linkClass}`}><UserRound size={15} />Artisans</Link>
            <Link href="/atlas" className={`nav-link ${location === "/atlas" ? "nav-link-active" : linkClass}`}><MapPinned size={15} />Craft Atlas</Link>
            <Link href="/planner" className={`nav-link ${location === "/planner" ? "nav-link-active" : linkClass}`}><Route size={15} />Cultural Trail</Link>
            <Link href="/notes" className={`nav-link ${location === "/notes" ? "nav-link-active" : linkClass}`}><BookOpen size={15} />Journal</Link>
          </>}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          {session ? isTraveller ? <div className="nav-account"><button className={`nav-account-trigger ${dark ? "nav-login-dark" : ""}`} onClick={() => setAccountOpen((visible) => !visible)} aria-expanded={accountOpen} aria-haspopup="menu"><UserRound size={15} /><span>{session.name.split(" ")[0]}</span><ChevronDown size={14} /></button>{accountOpen && <div className="nav-account-menu" role="menu">{travellerMoreNavigation.map((item) => { const Icon = item.icon; return <Link key={item.href} href={item.href} onClick={() => setAccountOpen(false)} role="menuitem"><Icon size={15} />{item.label}</Link>; })}<Link href="/login" onClick={() => setAccountOpen(false)} role="menuitem"><Settings2 size={15} />Switch role</Link><button onClick={exitDemo} role="menuitem"><LogOut size={15} />Leave demo</button></div>}</div> : <><Link href="/settings" className={`nav-login ${dark ? "nav-login-dark" : ""}`} aria-label="Open Settings"><Settings2 size={15} />Settings</Link><span className={`nav-session ${dark ? "nav-session-dark" : ""}`}>{session.name.split(" ")[0]} · {session.role}</span><button className={`nav-login ${dark ? "nav-login-dark" : ""}`} onClick={exitDemo}><LogOut size={15} />Leave demo</button></> : <Link href="/login" className={`nav-login ${dark ? "nav-login-dark" : ""}`}><LogIn size={15} />Enter</Link>}
          {!isTraveller && <Link href={session ? (session.role === "artisan" ? "/artisan" : "/authority") : "/login?role=traveller"} className="button button-primary button-small">{session ? "My field" : "Begin journey"} <span>↗</span></Link>}
        </div>
        <button className={`nav-menu md:hidden ${dark ? "text-ivory" : "text-forest"}`} onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"}>{open ? <X size={22} /> : <Menu size={22} />}</button>
      </div>
      {open && <div className="mobile-nav md:hidden">
        {(isTraveller ? travellerPrimaryNavigation : [{ label: "Explore", href: "/explore", icon: Compass }, { label: "Craft Atlas", href: "/atlas", icon: MapPinned }, { label: "Cultural Trail", href: "/planner", icon: Route }, { label: "Heritage Notes", href: "/notes", icon: BookOpen }]).map((item) => { const Icon = item.icon; return <Link key={item.href} href={item.href} onClick={() => setOpen(false)}><Icon size={16} />{item.label}</Link>; })}
        {isTraveller && travellerMoreNavigation.map((item) => { const Icon = item.icon; return <Link key={item.href} href={item.href} onClick={() => setOpen(false)}><Icon size={16} />{item.label}</Link>; })}
        {session && !isTraveller && <Link href="/settings" onClick={() => setOpen(false)}><Settings2 size={16} />Settings</Link>}
        {session ? <button onClick={exitDemo}><LogOut size={16} />Leave demo</button> : <Link href="/login" onClick={() => setOpen(false)}><LogIn size={16} />Enter</Link>}
      </div>}
    </header>
  );
}
