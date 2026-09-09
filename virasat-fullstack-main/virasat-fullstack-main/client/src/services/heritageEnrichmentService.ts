import type { Craft } from "../data/mock";
import {
  HERITAGE_ENRICHMENT_VERSION,
  craftEnrichments,
  publishedArtisans,
  publishedExperiences,
  type CraftEnrichment,
  type PublishedArtisan,
  type PublishedExperience,
  type VerifiedProvenance,
} from "../data/heritageEnrichment";

export type CraftHeritageContext = CraftEnrichment & {
  artisans: PublishedArtisan[];
  experiences: PublishedExperience[];
};

export type PublishedCraftJourney = {
  sourceCraftId: number;
  craftHref: string;
  provenance: VerifiedProvenance[];
  artisan?: PublishedArtisan;
  experience?: PublishedExperience;
};

const publishedContextByCraftId = new Map<number, CraftHeritageContext>(
  craftEnrichments
    .filter((item) => item.publicationStatus === "published")
    .map((item) => [
      item.sourceCraftId,
      {
        ...item,
        artisans: (item.artisanSlugs ?? [])
          .map((slug) => publishedArtisans.find((artisan) => artisan.slug === slug && artisan.publicationStatus === "published"))
          .filter((artisan): artisan is PublishedArtisan => Boolean(artisan)),
        experiences: (item.experienceSlugs ?? [])
          .map((slug) => publishedExperiences.find((experience) => experience.slug === slug && experience.publicationStatus === "published"))
          .filter((experience): experience is PublishedExperience => Boolean(experience)),
      },
    ]),
);

const sourceCraftIdFromFrontendId = (id: string): number | null => {
  const match = /^api-(\d+)$/.exec(id);
  return match ? Number(match[1]) : null;
};

export const getCraftHeritageContext = (sourceCraftId: number | null | undefined) =>
  sourceCraftId == null ? undefined : publishedContextByCraftId.get(sourceCraftId);

export const getCraftHeritageContextByFrontendId = (craftId: string) =>
  getCraftHeritageContext(sourceCraftIdFromFrontendId(craftId));

export const getPublishedArtisan = (slug: string | undefined) =>
  slug ? publishedArtisans.find((artisan) => artisan.slug === slug && artisan.publicationStatus === "published") : undefined;

export const getPublishedExperience = (slug: string | undefined) =>
  slug ? publishedExperiences.find((experience) => experience.slug === slug && experience.publicationStatus === "published") : undefined;

export const getPublishedExperiencesForArtisan = (artisanSlug: string | undefined) =>
  artisanSlug ? publishedExperiences.filter((experience) => experience.artisanSlug === artisanSlug && experience.publicationStatus === "published") : [];

export const getPublishedCraftJourney = (sourceCraftId: number | null | undefined): PublishedCraftJourney | undefined => {
  const context = getCraftHeritageContext(sourceCraftId);
  if (!context || (!context.artisans.length && !context.experiences.length)) return undefined;
  return {
    sourceCraftId: context.sourceCraftId,
    craftHref: `/craft/api-${context.sourceCraftId}`,
    provenance: [context.gi, context.odop].filter((item): item is VerifiedProvenance => Boolean(item)),
    artisan: context.artisans[0],
    experience: context.experiences[0],
  };
};

export const getPublishedCraftJourneyForArtisan = (artisanSlug: string | undefined) => {
  if (!artisanSlug) return undefined;
  const context = Array.from(publishedContextByCraftId.values()).find((item) => item.artisans.some((artisan) => artisan.slug === artisanSlug));
  return getPublishedCraftJourney(context?.sourceCraftId);
};

export const getPublishedCraftJourneyForExperience = (experienceSlug: string | undefined) => {
  if (!experienceSlug) return undefined;
  const context = Array.from(publishedContextByCraftId.values()).find((item) => item.experiences.some((experience) => experience.slug === experienceSlug));
  return getPublishedCraftJourney(context?.sourceCraftId);
};

export const overlayCraftHeritage = (craft: Craft): Craft => {
  const context = getCraftHeritageContextByFrontendId(craft.id);
  if (!context) return craft;
  return { ...craft, gi: context.gi?.status === "verified" ? true : craft.gi, odop: context.odop?.status === "verified" ? true : craft.odop };
};

export const overlayCraftCollection = (crafts: Craft[]) => crafts.map(overlayCraftHeritage);

export const getHeritageKicker = (craftId: string, fallback: string) => {
  const context = getCraftHeritageContextByFrontendId(craftId);
  if (context?.gi?.status === "verified" && context?.odop?.status === "verified") return "GI + ODOP verified";
  if (context?.gi?.status === "verified") return "GI provenance verified";
  if (context?.odop?.status === "verified") return "ODOP provenance verified";
  return fallback;
};

export { HERITAGE_ENRICHMENT_VERSION };
