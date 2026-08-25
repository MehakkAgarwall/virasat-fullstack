import { BookOpen, CalendarDays, Compass, MapPinned, Route, Settings2, UserRound } from "lucide-react";

export const travellerPrimaryNavigation = [
  { label: "Discover", href: "/explore", icon: Compass, match: (path: string) => path === "/explore" || path.startsWith("/craft/") || path.startsWith("/maker/") || path.startsWith("/experience/") || path.startsWith("/product/") },
  { label: "Craft Atlas", shortLabel: "Atlas", href: "/atlas", icon: MapPinned, match: (path: string) => path === "/atlas" },
  { label: "Plan a Trail", shortLabel: "Plan", href: "/planner", icon: Route, match: (path: string) => path === "/planner" },
  { label: "My Journey", shortLabel: "Journey", href: "/traveller/journey", icon: Compass, match: (path: string) => path === "/traveller/journey" },
] as const;

export const travellerMoreNavigation = [
  { label: "Journal & Trail Board", href: "/notes", icon: BookOpen, match: (path: string) => path === "/notes" },
  { label: "My Bookings", href: "/traveller/bookings", icon: CalendarDays, match: (path: string) => path === "/traveller/bookings" },
  { label: "My Profile", href: "/traveller/profile", icon: UserRound, match: (path: string) => path === "/traveller/profile" },
  { label: "Settings", href: "/settings", icon: Settings2, match: (path: string) => path === "/settings" },
] as const;

export const isTravellerMoreRoute = (path: string) => travellerMoreNavigation.some((item) => item.match(path));
