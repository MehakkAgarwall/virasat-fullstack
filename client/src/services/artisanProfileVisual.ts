export const DEFAULT_ARTISAN_PROFILE_VISUAL = "/manus-storage/virasat-cinematic-hero_a6f216e0.jpg";

type PublicProfileMedia = {
  profilePhotoUrl?: string | null;
  coverPhotoUrl?: string | null;
};

/**
 * Gives editable profile media first priority, then a saved cover, then a
 * project-owned heritage visual. The final fallback ensures a broken storage
 * object never leaves the public studio frame visually empty.
 */
export function getPublicProfileVisualSources(profile: PublicProfileMedia): string[] {
  return [profile.profilePhotoUrl, profile.coverPhotoUrl, DEFAULT_ARTISAN_PROFILE_VISUAL]
    .map((url) => url?.trim())
    .filter((url): url is string => Boolean(url))
    .filter((url, index, sources) => sources.indexOf(url) === index);
}
