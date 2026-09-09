// Phase 2 curated overlay. This data deliberately supplements—never replaces—the live Railway craft catalogue.
// Every public record includes its source so a missing record remains unknown rather than incorrectly labelled.

export const HERITAGE_ENRICHMENT_VERSION = "2026.08.18.v2";

export type VerifiedProvenance = {
  status: "verified";
  label: "GI" | "ODOP";
  registeredName: string;
  sourceLabel: string;
  sourceUrl: string;
  reviewedAt: string;
};

export type PublishedArtisan = {
  slug: string;
  displayName: string;
  craftTitle: string;
  state: string;
  district: string;
  locality: string;
  summary: string;
  sourceLabel: string;
  sourceUrl: string;
  publicationStatus: "published";
};

export type PublishedExperience = {
  slug: string;
  title: string;
  experienceType: "published documentary";
  summary: string;
  durationLabel: string;
  location: string;
  artisanSlug?: string;
  sourceLabel: string;
  sourceUrl: string;
  publicationStatus: "published";
};

export type CraftEnrichment = {
  sourceCraftId: number;
  publicationStatus: "published";
  gi?: VerifiedProvenance;
  odop?: VerifiedProvenance;
  artisanSlugs?: string[];
  experienceSlugs?: string[];
};

const GI_REGISTRY_URL = "https://search.ipindia.gov.in/GIRPublicSearch/";
const GI_REGISTRY_LABEL = "Geographical Indications Registry public search";
const reviewedAt = "2026-08-18";

const gi = (registeredName: string): VerifiedProvenance => ({
  status: "verified",
  label: "GI",
  registeredName,
  sourceLabel: GI_REGISTRY_LABEL,
  sourceUrl: GI_REGISTRY_URL,
  reviewedAt,
});

// The sourceCraftId values below are the redeployed Railway `crafts.id` values, not frontend slugs or names.
// The live seed was deterministically rebased by +75; representative craft-name anchors were verified
// directly against the redeployed service before this manifest revision.
export const craftEnrichments: CraftEnrichment[] = [
  { sourceCraftId: 104, publicationStatus: "published", gi: gi("Banaras Brocades and Sarees") },
  {
    sourceCraftId: 105,
    publicationStatus: "published",
    gi: gi("Moradabad Metal Craft"),
    odop: {
      status: "verified",
      label: "ODOP",
      registeredName: "Moradabad Metal Craft",
      sourceLabel: "ODOP Uttar Pradesh district profile",
      sourceUrl: "https://odopup.in/en/districts/moradabad",
      reviewedAt,
    },
    artisanSlugs: ["vk-gupta-metal-craft-industry"],
    experienceSlugs: ["moradabad-metal-craft-documentary"],
  },
  { sourceCraftId: 106, publicationStatus: "published", gi: gi("Madhubani Paintings") },
  { sourceCraftId: 107, publicationStatus: "published", gi: gi("Kancheepuram Silk") },
  { sourceCraftId: 109, publicationStatus: "published", gi: gi("Channapatna Toys & Dolls") },
  { sourceCraftId: 110, publicationStatus: "published", gi: gi("Bidriware") },
  { sourceCraftId: 111, publicationStatus: "published", gi: gi("Mysore Silk") },
  { sourceCraftId: 112, publicationStatus: "published", gi: gi("Pochampally Ikat") },
  { sourceCraftId: 114, publicationStatus: "published", gi: gi("Bastar Dhokra") },
  { sourceCraftId: 118, publicationStatus: "published", gi: gi("Kutch Embroidery") },
  { sourceCraftId: 119, publicationStatus: "published", gi: gi("Patan Patola") },
  { sourceCraftId: 120, publicationStatus: "published", gi: gi("Blue Pottery of Jaipur") },
  { sourceCraftId: 121, publicationStatus: "published", gi: gi("BAGRU HAND BLOCK PRINT") },
  { sourceCraftId: 122, publicationStatus: "published", gi: gi("Phulkari") },
  { sourceCraftId: 124, publicationStatus: "published", gi: gi("Aranmula Kannadi (Aranmula Metal Mirror)") },
  { sourceCraftId: 126, publicationStatus: "published", gi: gi("Kani Shawl") },
  { sourceCraftId: 128, publicationStatus: "published", gi: gi("Banaras Brocades and Sarees") },
  { sourceCraftId: 129, publicationStatus: "published", gi: gi("Lucknow Zardozi") },
  { sourceCraftId: 131, publicationStatus: "published", gi: gi("Meerut Scissors") },
  { sourceCraftId: 132, publicationStatus: "published", gi: gi("Sanganeri Hand Block Printing") },
  { sourceCraftId: 133, publicationStatus: "published", gi: gi("Kota Doria") },
  { sourceCraftId: 134, publicationStatus: "published", gi: gi("Molela Clay Work") },
  { sourceCraftId: 136, publicationStatus: "published", gi: gi("Pipli Applique Work") },
  { sourceCraftId: 137, publicationStatus: "published", gi: gi("Konark Stone Carving") },
  { sourceCraftId: 139, publicationStatus: "published", gi: gi("Baluchari Saree") },
  { sourceCraftId: 140, publicationStatus: "published", gi: gi("Dhaniakhali Saree") },
  { sourceCraftId: 141, publicationStatus: "published", gi: gi("Nakshi Kantha") },
  { sourceCraftId: 143, publicationStatus: "published", gi: gi("Santiniketan Leather Goods") },
  { sourceCraftId: 144, publicationStatus: "published", gi: gi("Muga Silk of Assam") },
  { sourceCraftId: 145, publicationStatus: "published", gi: gi("Sarthebari Bell Metal Crafts") },
  { sourceCraftId: 147, publicationStatus: "published", gi: gi("Moirang Phee") },
  { sourceCraftId: 148, publicationStatus: "published", gi: gi("Toda Embroidery") },
  { sourceCraftId: 149, publicationStatus: "published", gi: gi("Mahabalipuram Stone Sculpture") },
  { sourceCraftId: 151, publicationStatus: "published", gi: gi("Bhavani Jamakkalam") },
  { sourceCraftId: 153, publicationStatus: "published", gi: gi("Kolhapuri Chappal") },
  { sourceCraftId: 154, publicationStatus: "published", gi: gi("Paithani Saree & Fabrics") },
  { sourceCraftId: 159, publicationStatus: "published", gi: gi("Chanderi Sarees") },
];

export const publishedArtisans: PublishedArtisan[] = [
  {
    slug: "vk-gupta-metal-craft-industry",
    displayName: "V. K. Gupta Metal Craft Industry",
    craftTitle: "Published Moradabad metal craft workshop feature",
    state: "Uttar Pradesh",
    district: "Moradabad",
    locality: "Moradabad",
    summary: "This Moradabad metal craft business is featured by the ODOP Uttar Pradesh portal as a published success story. Virāsat presents this source-linked profile for discovery only.",
    sourceLabel: "ODOP Uttar Pradesh success-story listing",
    sourceUrl: "https://odopup.in/en/districts/moradabad",
    publicationStatus: "published",
  },
];

export const publishedExperiences: PublishedExperience[] = [
  {
    slug: "moradabad-metal-craft-documentary",
    title: "Moradabad Metal Craft documentary",
    experienceType: "published documentary",
    summary: "A source-linked ODOP documentary introducing Moradabad’s metal-craft tradition. This is a read-only cultural resource, not a bookable workshop.",
    durationLabel: "Watch online",
    location: "Moradabad, Uttar Pradesh",
    artisanSlug: "vk-gupta-metal-craft-industry",
    sourceLabel: "ODOP Uttar Pradesh documentary listing",
    sourceUrl: "https://www.youtube.com/watch?v=s79HkMFXwbs",
    publicationStatus: "published",
  },
];
