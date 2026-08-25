// Kalā Trail visual system: desktop sidebar and mobile app bar share the same museum-label hierarchy and palette.
import type { LucideIcon } from "lucide-react";
import { ArrowLeft, ArrowUpRight, ChevronRight, Compass, LogOut, Settings2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { BrandMark } from "./BrandMark";
import { MobileBottomNav } from "./MobileBottomNav";
import { useAuth } from "../contexts/AuthContext";

export type RoleNavItem = { id: string; label: string; icon: LucideIcon; note?: string };

export function RoleAppShell({ role, eyebrow, title, locationLabel, identityName, items, active, onSelect, children }: { role: "artisan" | "authority"; eyebrow: string; title: string; locationLabel?: string; identityName?: string; items: RoleNavItem[]; active: string; onSelect: (id: string) => void; children: React.ReactNode }) { const { session, logout } = useAuth(); const [, setLocation] = useLocation(); const exitDemo = () => { logout(); setLocation("/"); };
  return <div className={`role-app-shell role-app-${role}`}>
    <aside className="role-sidebar">
      <div className="role-sidebar-top"><Link href="/"><BrandMark /></Link><span className="role-status"><i />Mock workspace</span></div>
      <div className="role-sidebar-intro"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1></div>
      <nav className="role-sidebar-nav" aria-label={`${title} navigation`}>
        {items.map((item) => { const Icon = item.icon; return <button key={item.id} className={`role-side-link ${active === item.id ? "role-side-link-active" : ""}`} onClick={() => onSelect(item.id)}><Icon size={17} /><span>{item.label}</span>{active === item.id && <ChevronRight size={15} />}</button>; })}
      </nav>
      <div className="role-sidebar-bottom"><span className="eyebrow">{identityName ?? session?.name ?? "A better journey"}</span><p>Keep living traditions in sight — and in reach.</p><Link href="/settings" className="sidebar-traveller-link"><Settings2 size={15} />Settings <ArrowUpRight size={14} /></Link><Link href="/login" className="sidebar-traveller-link"><Compass size={15} />Switch role <ArrowUpRight size={14} /></Link><button className="sidebar-logout" onClick={exitDemo}><LogOut size={14} />Leave demo</button></div>
    </aside>
    <section className="role-workspace"><header className="role-workspace-header"><div><span className="eyebrow">{eyebrow}</span><span className="role-header-divider" /><span className="role-header-location">{locationLabel ?? "India"}</span></div><div className="role-header-actions"><Link href="/settings" className="role-switch"><Settings2 size={14} />Settings</Link><Link href="/login" className="role-switch role-back-control"><ArrowLeft size={14} />Switch role</Link><button className="role-switch role-logout" onClick={exitDemo}><LogOut size={14} />Leave demo</button></div></header><div className="workspace-route-stitch" aria-hidden="true"><i /><i /><i /><i /><i /></div><main className="role-workspace-main">{children}</main></section>
    <MobileBottomNav role={role} />
  </div>;
}
