import type { Craft } from "../data/mock";

type CraftEditorialVisualProps = {
  craft: Craft;
  index?: number;
  className?: string;
  alt?: string;
  label?: string;
};

const genericAssetFragments = [
  "virasat-craft-terracotta",
  "virasat-craft-weaving",
  "virasat-craft-metalwork",
  "channapatna-toy-workshop",
  "photo-1579783902614-a3fb3927b6a5",
];

const craftSpecificImages: Record<string, string> = {
  "kashmiri papier-mache": "/manus-storage/kashmiri-papier-mache_2a59bc2f.jpg",
  "chikankari embroidery": "/manus-storage/chikankari-embroidery_d9e601dd.jpg",
  "channapatna toys": "/manus-storage/channapatna-toys_8bfc72ef.jpg",
  "mysore silk saree": "/manus-storage/mysore-silk-loom_4b1db0c4.jpg",
  "bidriware": "/manus-storage/bidriware-metalwork_3fcb82f4.jpg",
  "madhubani painting": "/manus-storage/madhubani-painting_0261b1d7.jpg",
  "pashmina shawl": "/manus-storage/virasat-pashmina-atlas_3eff7193.jpg",
  "banarasi silk saree": "/manus-storage/virasat-banarasi-loom_5e6a0b08.jpg",
  "moradabad brassware": "/manus-storage/virasat-moradabad-brass_b2309329.jpg",
  "kanchipuram silk saree": "/manus-storage/virasat-kanchipuram-loom_e7143405.jpg",
  "thanjavur painting": "/manus-storage/virasat-thanjavur-atlas_1ff90ee8.jpg",
  "pochampally ikat": "/manus-storage/virasat-pochampally-atlas_dcc6fc62.jpg",
  "kondapalli toys": "/manus-storage/virasat-kondapalli-atlas_baa60029.jpg",
  "bastar dhokra art": "/manus-storage/virasat-bastar-atlas_a8b75267.jpg",
  "pattachitra painting": "/manus-storage/virasat-pattachitra-atlas_d0a1cb28.jpg",
};

const materialWords = ["Kiln", "Thread", "Grain", "Pigment", "Patina", "Linework", "Loom", "Form"];

function stableIndex(value: string) {
  return Array.from(value).reduce((total, character) => total + character.charCodeAt(0), 0);
}

export function hasSpecificCraftImage(craft: Craft) {
  return Boolean(craftSpecificImages[craft.name.toLowerCase()] || (craft.image && !genericAssetFragments.some((fragment) => craft.image.includes(fragment))));
}

export function getCraftEditorialImage(craft: Craft) {
  return craftSpecificImages[craft.name.toLowerCase()] || craft.image;
}

export function CraftEditorialVisual({ craft, index = 0, className = "", alt, label }: CraftEditorialVisualProps) {
  const treatment = (stableIndex(craft.id) + index) % materialWords.length;
  const material = materialWords[treatment];
  const craftImage = getCraftEditorialImage(craft);

  if (hasSpecificCraftImage(craft)) {
    return <img className={className} src={craftImage} alt={alt ?? `${craft.name} in ${craft.region}`} />;
  }

  return <div className={`craft-editorial-visual craft-editorial-visual-${treatment} ${className}`} role="img" aria-label={alt ?? `${craft.name}, material study`}>
    <img className="craft-editorial-backdrop" src={craftImage} alt="" aria-hidden="true" />
    <span className="craft-editorial-grain" aria-hidden="true" />
    <span className="craft-editorial-index" aria-hidden="true">{String(treatment + 1).padStart(2, "0")}</span>
    <div className="craft-editorial-copy"><small>{label ?? `${craft.category} / material study`}</small><strong>{material}</strong><i>{craft.region}</i></div>
    <span className="craft-editorial-orb" aria-hidden="true" />
  </div>;
}
