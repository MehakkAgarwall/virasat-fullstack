import { describe, expect, it } from "vitest";
import { DEFAULT_INTERFACE_SETTINGS, normalizeInterfaceSettings } from "./interfaceSettingsService";

describe("interfaceSettingsService", () => {
  it("returns the safe default for absent or malformed preference values", () => {
    expect(normalizeInterfaceSettings(null)).toEqual(DEFAULT_INTERFACE_SETTINGS);
    expect(normalizeInterfaceSettings("invalid")).toEqual(DEFAULT_INTERFACE_SETTINGS);
  });

  it("accepts only the defined persisted reduced-motion preference", () => {
    expect(normalizeInterfaceSettings({ reduceMotion: true })).toEqual({ reduceMotion: true });
    expect(normalizeInterfaceSettings({ reduceMotion: "true" })).toEqual(DEFAULT_INTERFACE_SETTINGS);
  });
});
