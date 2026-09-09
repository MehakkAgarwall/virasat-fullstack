export type ExperiencePreviewType = "video" | "still";

export type ExperiencePreviewMedia = {
  previewType: ExperiencePreviewType;
  previewUrl: string;
  thumbnailUrl?: string;
  previewCaption: string;
  previewSource: "existing-motion-reel" | "ai-generated-preview" | "curated-still";
  src: string;
  label: string;
  description: string;
  generated: boolean;
};

type PreviewLookup = {
  experienceId?: string;
  opportunityId?: string;
  craftId?: string;
  title?: string;
  kind?: string;
  image?: string;
};

const stillByCraftId: Record<string, { url: string; caption: string }> = {
  channapatna: { url: "/manus-storage/channapatna-toys_8bfc72ef.jpg", caption: "Turned wood, lacquer, and a workshop in motion" },
  "mysore-silk": { url: "/manus-storage/mysore-silk-loom_4b1db1d7.jpg", caption: "Silk thread crossing the Mysuru loom" },
  "rosewood-inlay": { url: "/manus-storage/mysuru-rosewood-inlay_734cb6be.jpg", caption: "Rosewood, wire, and patient inlay" },
  "blue-pottery": { url: "/manus-storage/virasat-craft-terracotta_b9573ecd.jpg", caption: "Blue pottery shaped by hand in Jaipur" },
  "kota-doria": { url: "/manus-storage/virasat-craft-weaving_76580db7.jpg", caption: "Air-light checks on a Kota loom" },
  thewa: { url: "/manus-storage/virasat-craft-metalwork_f249c877.jpg", caption: "Gold filigree meeting coloured glass" },
  "banarasi-silk": { url: "/manus-storage/virasat-banarasi-loom_5e6a0b08.jpg", caption: "Zari and silk on the Banarasi loom" },
  kanchipuram: { url: "/manus-storage/virasat-kanchipuram-loom_e7143405.jpg", caption: "Temple borders on a Kanchipuram loom" },
  "thanjavur-painting": { url: "/manus-storage/virasat-thanjavur-atlas_1ff90ee8.jpg", caption: "Gilded relief and devotional linework" },
  "papier-mache": { url: "/manus-storage/kashmiri-papier-mache_2a59bc2f.jpg", caption: "Lacquer, paper, and a painted Kashmir garden" },
  pashmina: { url: "/manus-storage/virasat-pashmina-atlas_3eff7193.jpg", caption: "Pashmina fibre, hand, and mountain light" },
  pattachitra: { url: "/manus-storage/virasat-pattachitra-atlas_d0a1cb28.jpg", caption: "Mythic linework on a Pattachitra panel" },
  "sambalpuri-ikat": { url: "/manus-storage/virasat-pochampally-atlas_dcc6fc62.jpg", caption: "Resist-dyed thread before the weave" },
};

const channapatnaVideo: ExperiencePreviewMedia = {
  previewType: "video",
  previewUrl: "/manus-storage/channapatna-workshop-preview_1a614e5e.mp4",
  thumbnailUrl: "/manus-storage/channapatna-toys_8bfc72ef.jpg",
  previewCaption: "A Channapatna workshop, lacquer, and turned wood",
  previewSource: "existing-motion-reel",
  src: "/manus-storage/channapatna-workshop-preview_1a614e5e.mp4",
  label: "Workshop motion preview",
  description: "Editorial Channapatna workshop motion preview",
  generated: false,
};

const mysoreSilkVideo: ExperiencePreviewMedia = {
  previewType: "video",
  previewUrl: "/manus-storage/mysuru-heritage-experience-preview_eeaf71c2.mp4",
  thumbnailUrl: "/manus-storage/mysore-silk-loom_4b1db1d7.jpg",
  previewCaption: "Silk thread crossing the Mysuru loom",
  previewSource: "ai-generated-preview",
  src: "/manus-storage/mysuru-heritage-experience-preview_eeaf71c2.mp4",
  label: "Generated experience preview",
  description: "AI-generated visual preview of the Mysore Silk experience",
  generated: true,
};

const exactMedia: Record<string, ExperiencePreviewMedia> = {
  "mysore-silk-experience": mysoreSilkVideo,
  "mysuru-heritage": mysoreSilkVideo,
  "bengaluru-mysuru-rosewood-inlay": mysoreSilkVideo,
  "channapatna-workshop": channapatnaVideo,
  "bengaluru-mysuru-channapatna": channapatnaVideo,
};

function stillMedia(url: string, caption: string): ExperiencePreviewMedia {
  return {
    previewType: "still",
    previewUrl: url,
    thumbnailUrl: url,
    previewCaption: caption,
    previewSource: "curated-still",
    src: url,
    label: "Experience preview",
    description: caption,
    generated: false,
  };
}

export function getExperiencePreviewMedia(lookup: string | PreviewLookup): ExperiencePreviewMedia | undefined {
  const key = typeof lookup === "string" ? lookup : lookup.experienceId ?? lookup.opportunityId;
  if (key && exactMedia[key]) return exactMedia[key];

  if (typeof lookup === "string") return undefined;
  if (lookup.craftId && stillByCraftId[lookup.craftId]) {
    const still = stillByCraftId[lookup.craftId];
    return stillMedia(still.url, still.caption);
  }
  if (lookup.kind === "Experience" || lookup.kind === "Heritage") {
    return lookup.image ? stillMedia(lookup.image, `${lookup.title ?? "Cultural experience"} / editorial preview`) : undefined;
  }
  return undefined;
}

export function getPreviewAuditKey(lookup: PreviewLookup) {
  return lookup.experienceId ?? lookup.opportunityId ?? lookup.craftId ?? lookup.title ?? "unknown-preview";
}
