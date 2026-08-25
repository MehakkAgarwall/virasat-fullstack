// Virāsat demo authentication boundary: replace these local methods with FastAPI calls when a real auth contract is available.
export type DemoRole = "traveller" | "artisan" | "authority";
export type DemoSession = { id: string; name: string; email: string; role: DemoRole; mode: "demo" | "local"; createdAt: string };
const SESSION_KEY = "virasat-demo-session";
const roleProfiles: Record<DemoRole, Omit<DemoSession, "mode" | "createdAt">> = {
  traveller: { id: "demo-traveller", name: "Aarav Mehta", email: "traveller@virasat.demo", role: "traveller" },
  artisan: { id: "demo-artisan-1", name: "Saanvi Kulkarni", email: "artisan@virasat.demo", role: "artisan" },
  authority: { id: "demo-authority", name: "Nandini Iyer", email: "authority@virasat.demo", role: "authority" },
};
const hasStorage = () => typeof window !== "undefined";
const persist = (session: DemoSession | null) => { if (!hasStorage()) return; if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session)); else localStorage.removeItem(SESSION_KEY); };

export const authService = {
  getSession(): DemoSession | null { if (!hasStorage()) return null; try { return JSON.parse(localStorage.getItem(SESSION_KEY) ?? "null") as DemoSession | null; } catch { return null; } },
  demoLogin(role: DemoRole): DemoSession { const session = { ...roleProfiles[role], mode: "demo" as const, createdAt: new Date().toISOString() }; persist(session); return session; },
  login(role: DemoRole, email: string): DemoSession { const profile = roleProfiles[role]; const session = { ...profile, email: email.trim() || profile.email, mode: "local" as const, createdAt: new Date().toISOString() }; persist(session); return session; },
  signup(role: DemoRole, name: string, email: string): DemoSession { const session = { id: `local-${role}-${Date.now()}`, name: name.trim() || roleProfiles[role].name, email: email.trim() || roleProfiles[role].email, role, mode: "local" as const, createdAt: new Date().toISOString() }; persist(session); return session; },
  updateSessionName(name: string): DemoSession | null { const current = this.getSession(); if (!current) return null; const session = { ...current, name: name.trim() || current.name }; persist(session); return session; },
  logout() { persist(null); },
};
