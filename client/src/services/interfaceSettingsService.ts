export type InterfaceSettings = { reduceMotion: boolean };

export const INTERFACE_SETTINGS_KEY = "virasat-interface-settings";
export const DEFAULT_INTERFACE_SETTINGS: InterfaceSettings = { reduceMotion: false };

export const normalizeInterfaceSettings = (value: unknown): InterfaceSettings => {
  if (!value || typeof value !== "object") return DEFAULT_INTERFACE_SETTINGS;
  const record = value as Partial<InterfaceSettings>;
  return { reduceMotion: record.reduceMotion === true };
};

const hasStorage = () => typeof window !== "undefined";

export const interfaceSettingsService = {
  get(): InterfaceSettings {
    if (!hasStorage()) return DEFAULT_INTERFACE_SETTINGS;
    try { return normalizeInterfaceSettings(JSON.parse(localStorage.getItem(INTERFACE_SETTINGS_KEY) ?? "null")); } catch { return DEFAULT_INTERFACE_SETTINGS; }
  },
  save(settings: InterfaceSettings) {
    const normalized = normalizeInterfaceSettings(settings);
    if (hasStorage()) localStorage.setItem(INTERFACE_SETTINGS_KEY, JSON.stringify(normalized));
    if (typeof document !== "undefined") document.documentElement.dataset.reducedMotion = String(normalized.reduceMotion);
    return normalized;
  },
  apply() {
    return this.save(this.get());
  },
};
