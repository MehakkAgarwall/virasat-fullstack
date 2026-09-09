export type CraftLoadSource = "api" | "fallback";

export type CraftRouteTelemetryEntry = {
  craftId: number;
  source: CraftLoadSource;
  elapsedMs: number;
  occurredAt: string;
  fallbackReason?: string;
};

const STORAGE_KEY = "virasat-craft-route-telemetry";
const MAX_ENTRIES = 20;

export function createCraftLoadTelemetryEntry(input: Omit<CraftRouteTelemetryEntry, "occurredAt">): CraftRouteTelemetryEntry {
  return { ...input, occurredAt: new Date().toISOString() };
}

/**
 * Keeps a small, non-identifying client-side QA trail. It records only the
 * numeric craft record, result source, duration, and a safe fallback message.
 */
export function recordCraftLoadTelemetry(input: Omit<CraftRouteTelemetryEntry, "occurredAt">) {
  const entry = createCraftLoadTelemetryEntry(input);
  if (typeof window === "undefined") return entry;

  try {
    const current = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "[]") as CraftRouteTelemetryEntry[];
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...current, entry].slice(-MAX_ENTRIES)));
    window.dispatchEvent(new CustomEvent("virasat:craft-load", { detail: entry }));
  } catch {
    // Demo QA telemetry must never interrupt a live craft lookup.
  }

  return entry;
}

export function readCraftLoadTelemetry(): CraftRouteTelemetryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const entries = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "[]") as CraftRouteTelemetryEntry[];
    return entries.slice(-MAX_ENTRIES);
  } catch {
    return [];
  }
}
