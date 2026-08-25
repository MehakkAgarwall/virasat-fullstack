import { useEffect, useMemo, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  DEMO_STATE_CHANGE_EVENT,
  type DemoStateChange,
  getStoredDemoState,
  getVisitorSubjectKey,
  hydrateStoredDemoState,
  type DemoStateScope,
} from "../services/demoStatePersistence";
import { trpc } from "../lib/trpc";

const scopes: DemoStateScope[] = ["traveller", "artisan", "authority"];

/** Live craft detail is a read-only Railway-backed view and does not need a managed demo-state sync. */
export const shouldSyncDemoStateForPathname = (pathname: string) => !/^\/craft\/api-\d+$/.test(pathname);

/**
 * Retains the current local-first demo responsiveness while mirroring existing
 * state to the managed database. Existing demo UI remains usable if the
 * database is briefly unavailable, and a saved snapshot is restored on the
 * next session for the same demo identity.
 */
export function DemoStatePersistence() {
  const { session } = useAuth();
  const visitorSubject = useMemo(() => getVisitorSubjectKey(), []);
  const subjectKey = session ? `demo-${session.id}` : visitorSubject;
  const hydratedFor = useRef<string | null>(null);
  const save = trpc.demoState.save.useMutation();
  const { data } = trpc.demoState.list.useQuery({ subjectKey }, { retry: 1 });

  useEffect(() => {
    const onStateChange = (event: Event) => {
      const detail = (event as CustomEvent<DemoStateChange>).detail;
      if (!detail) return;
      save.mutate({ subjectKey, scope: detail.scope, payload: detail.payload });
    };
    window.addEventListener(DEMO_STATE_CHANGE_EVENT, onStateChange);
    return () => window.removeEventListener(DEMO_STATE_CHANGE_EVENT, onStateChange);
  }, [save, subjectKey]);

  useEffect(() => {
    if (!data || hydratedFor.current === subjectKey) return;
    hydratedFor.current = subjectKey;

    const savedScopes = new Set(data.map((entry) => entry.scope));
    let restoredExistingState = false;
    data.forEach((entry) => {
      const existing = getStoredDemoState(entry.scope);
      const existingSignals = entry.scope === "artisan" && Array.isArray(existing?.travellerSignals) ? existing.travellerSignals : [];
      const restoredSignals = entry.scope === "artisan" && Array.isArray(entry.payload.travellerSignals) ? entry.payload.travellerSignals : [];
      const mergedSignals = [...existingSignals, ...restoredSignals].filter((signal, index, signals) => {
        const id = typeof signal === "object" && signal && "id" in signal ? String(signal.id) : String(index);
        return signals.findIndex((candidate) => typeof candidate === "object" && candidate && "id" in candidate && String(candidate.id) === id) === index;
      });
      const nextPayload = entry.scope === "artisan" ? { ...entry.payload, travellerSignals: mergedSignals } : entry.payload;
      hydrateStoredDemoState(entry.scope, nextPayload);
      if (entry.scope === "artisan" && existingSignals.length > restoredSignals.length) save.mutate({ subjectKey, scope: entry.scope, payload: nextPayload });
      restoredExistingState = true;
    });

    scopes.filter((scope) => !savedScopes.has(scope)).forEach((scope) => {
      const existing = getStoredDemoState(scope);
      if (existing) save.mutate({ subjectKey, scope, payload: existing });
    });

    const refreshKey = `virasat-demo-hydrated:${subjectKey}`;
    if (restoredExistingState && !sessionStorage.getItem(refreshKey)) {
      sessionStorage.setItem(refreshKey, "true");
      window.setTimeout(() => window.location.reload(), 0);
    }
  }, [data, save, subjectKey]);

  return null;
}
