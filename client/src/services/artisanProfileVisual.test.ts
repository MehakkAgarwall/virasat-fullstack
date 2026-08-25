import { describe, expect, it } from "vitest";
import { DEFAULT_ARTISAN_PROFILE_VISUAL, getPublicProfileVisualSources } from "./artisanProfileVisual";

describe("getPublicProfileVisualSources", () => {
  it("preserves saved profile and cover media before the project-owned fallback", () => {
    expect(getPublicProfileVisualSources({ profilePhotoUrl: " /profile.jpg ", coverPhotoUrl: "/cover.jpg" })).toEqual([
      "/profile.jpg",
      "/cover.jpg",
      DEFAULT_ARTISAN_PROFILE_VISUAL,
    ]);
  });

  it("returns a non-empty visual source when an Artisan has not saved media", () => {
    expect(getPublicProfileVisualSources({ profilePhotoUrl: "", coverPhotoUrl: null })).toEqual([
      DEFAULT_ARTISAN_PROFILE_VISUAL,
    ]);
  });
});
