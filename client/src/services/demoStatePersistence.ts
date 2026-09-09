export type DemoStateScope = "traveller" | "artisan" | "authority";

export type DemoStateChange = {
  scope: DemoStateScope;
  payload: Record<string, unknown>;
};

export const DEMO_STATE_CHANGE_EVENT = "virasat:demo-state-change";

const scopeKeys: Record<DemoStateScope, string> = {
  traveller: "virasat-traveller-demo-state",
  artisan: "virasat-artisan-demo-state",
  authority: "virasat-authority-demo-state",
};

const visitorKey = "virasat-demo-visitor-key";

export function getVisitorSubjectKey() {
  if (typeof window === "undefined") return "browser-server-render";
  const existing = localStorage.getItem(visitorKey);
  if (existing) return existing;
  const generated = `browser-${crypto.randomUUID()}`;
  localStorage.setItem(visitorKey, generated);
  return generated;
}

export function getStoredDemoState(scope: DemoStateScope): Record<string, unknown> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(scopeKeys[scope]);
    return raw ? JSON.parse(raw) as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

export function hydrateStoredDemoState(scope: DemoStateScope, payload: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(scopeKeys[scope], JSON.stringify(payload));
}

export function publishDemoState(scope: DemoStateScope, payload: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<DemoStateChange>(DEMO_STATE_CHANGE_EVENT, { detail: { scope, payload } }));
}
