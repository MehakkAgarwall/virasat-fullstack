import { ArrowUpRight, Check, ChevronRight, CircleUserRound, Compass, Gauge, LogOut, Settings2, Store, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { MobileBottomNav } from "../components/MobileBottomNav";
import { TopNav } from "../components/TopNav";
import { useAuth } from "../contexts/AuthContext";
import { interfaceSettingsService, type InterfaceSettings } from "../services/interfaceSettingsService";

const roleCopy = {
  traveller: { eyebrow: "Traveller settings", title: "Your trail,\n<em>your pace.</em>", profileHref: "/traveller/profile", profileLabel: "Edit Traveller profile", profileDescription: "Update the name and cultural preferences that appear with your booking requests.", workspaceHref: "/traveller/journey", workspaceLabel: "Open My Journey" },
  artisan: { eyebrow: "Artisan studio settings", title: "Your studio,\n<em>in focus.</em>", profileHref: "/artisan?tab=profile", profileLabel: "Edit public profile", profileDescription: "Maintain the profile that connected experiences and Traveller booking details read.", workspaceHref: "/artisan", workspaceLabel: "Open Artisan studio" },
  authority: { eyebrow: "Authority workspace settings", title: "Your workspace,\n<em>in focus.</em>", profileHref: "/authority?tab=profile", profileLabel: "Open Authority profile", profileDescription: "Review the existing Authority identity and workspace context.", workspaceHref: "/authority", workspaceLabel: "Open Authority workspace" },
} as const;

export default function Settings() {
  const { session, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [settings, setSettings] = useState<InterfaceSettings>(() => interfaceSettingsService.get());
  const role = session?.role ?? "traveller";
  const copy = roleCopy[role];

  useEffect(() => { interfaceSettingsService.apply(); }, []);
  const updateReducedMotion = (reduceMotion: boolean) => setSettings(interfaceSettingsService.save({ reduceMotion }));
  const leaveDemo = () => { logout(); setLocation("/"); };

  return <div className="app-shell page-shell settings-page"><TopNav /><main><section className="section-pad settings-hero"><div className="container"><span className="eyebrow"><Settings2 size={14} />{copy.eyebrow}</span><h1>{copy.title.split("\n")[0]}<br /><em>{copy.title.match(/<em>(.*?)<\/em>/)?.[1]}</em></h1><p>Keep your identity, workspace shortcuts, and display comfort close at hand. These settings are private to this prototype session.</p><div className="settings-identity-chip"><CircleUserRound size={16} /><span>{session?.name} · {role}</span><i>Demo access</i></div></div></section><section className="settings-board section-pad"><div className="container settings-grid"><article className="settings-card settings-card-profile"><span className="eyebrow"><UserRound size={13} />Identity</span><h2>Make your public<br /><em>details useful.</em></h2><p>{copy.profileDescription}</p><Link href={copy.profileHref} className="button button-primary">{copy.profileLabel}<ArrowUpRight size={14} /></Link></article><article className="settings-card settings-card-comfort"><span className="eyebrow"><Gauge size={13} />Comfort</span><h2>Set the visual<br /><em>pace.</em></h2><p>Reduce non-essential motion across Virāsat while keeping maps, cards, and actions fully usable.</p><label className="settings-toggle"><span><b>Reduce motion</b><small>{settings.reduceMotion ? "Gentle static presentation enabled" : "Cinematic motion is enabled"}</small></span><input type="checkbox" checked={settings.reduceMotion} onChange={(event) => updateReducedMotion(event.target.checked)} /><i aria-hidden="true"><b /></i></label>{settings.reduceMotion && <div className="settings-saved" role="status"><Check size={14} />Preference saved on this device</div>}</article><article className="settings-card settings-card-workspace"><span className="eyebrow"><Compass size={13} />Quick access</span><h2>Return to what<br /><em>matters.</em></h2><p>Move between your role workspace, profile, and demonstration session without losing the cultural trail.</p><Link href={copy.workspaceHref} className="settings-row-link"><span>{copy.workspaceLabel}</span><ChevronRight size={16} /></Link><Link href="/login" className="settings-row-link"><span>Switch role</span><ChevronRight size={16} /></Link><button type="button" className="settings-row-link settings-exit" onClick={leaveDemo}><span><LogOut size={14} />Leave demo</span><ChevronRight size={16} /></button></article><aside className="settings-note"><Store size={18} /><div><span className="eyebrow">Prototype note</span><p>Preferences are stored in this browser only. Public Artisan and Traveller details remain in their existing managed profile flows.</p></div></aside></div></section></main><MobileBottomNav role={role} /></div>;
}
