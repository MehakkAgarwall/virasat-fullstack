// Kalā Trail visual system: editorial museum-in-motion; mock data keeps the frontend demo backend-free.
export type Craft = {
  id: string;
  name: string;
  region: string;
  state: string;
  description: string;
  category: string;
  gi?: boolean;
  odop?: boolean;
  image: string;
  distance: string;
  detour: string;
  duration: string;
  accent: string;
  coordinates: [number, number];
};

export const crafts: Craft[] = [
  {
    id: "channapatna",
    name: "Channapatna Toys",
    region: "Channapatna",
    state: "Karnataka",
    description: "Colourful lacquered wooden toys turned by hand, carrying a century of playful craft memory.",
    category: "Woodcraft",
    gi: true,
    odop: true,
    image: "/manus-storage/channapatna-toy-workshop_2297aa2e.jpg",
    distance: "12 km from route",
    detour: "+18 min detour",
    duration: "45 min workshop",
    accent: "#b96745",
    coordinates: [12.87, 77.2],
  },
  {
    id: "mysore-silk",
    name: "Mysore Silk",
    region: "Mysuru",
    state: "Karnataka",
    description: "Lustrous silk woven with a quiet gold edge, rooted in the ceremonial language of Mysuru.",
    category: "Textiles",
    gi: true,
    image: "/manus-storage/mysore-silk-loom_465ca0d9.jpg",
    distance: "8 km from route",
    detour: "+12 min detour",
    duration: "60 min studio visit",
    accent: "#967943",
    coordinates: [12.2958, 76.6394],
  },
  {
    id: "rosewood-inlay",
    name: "Rosewood Inlay",
    region: "Mysuru",
    state: "Karnataka",
    description: "Fine rosewood, ivory-toned wire, and patient hands composing botanical stories into furniture.",
    category: "Woodcraft",
    odop: true,
    image: "/manus-storage/mysuru-rosewood-inlay_734cb6be.jpg",
    distance: "5 km from route",
    detour: "+9 min detour",
    duration: "30 min maker visit",
    accent: "#35564c",
    coordinates: [12.313, 76.654],
  },
  {
    id: "bidriware",
    name: "Bidriware",
    region: "Bidar",
    state: "Karnataka",
    description: "Darkened zinc alloy inlaid with silver, a quiet contrast of shadow and light from Bidar.",
    category: "Metalwork",
    gi: true,
    odop: true,
    image: "https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&w=1200&q=85",
    distance: "Regional discovery",
    detour: "Plan a dedicated day",
    duration: "90 min atelier visit",
    accent: "#4f4541",
    coordinates: [17.9133, 77.5301],
  },
  {
    id: "madhubani",
    name: "Madhubani Painting",
    region: "Madhubani",
    state: "Bihar",
    description: "Myth, flora, and family history drawn in rhythmic lines and dense, symbolic colour.",
    category: "Painting",
    gi: true,
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=1200&q=85",
    distance: "Regional discovery",
    detour: "Plan a dedicated day",
    duration: "2 hr studio visit",
    accent: "#91553d",
    coordinates: [26.35, 86.07],
  },
  {
    id: "kanchipuram",
    name: "Kanchipuram Silk",
    region: "Kanchipuram",
    state: "Tamil Nadu",
    description: "Handloom silk with a strong zari border, made slowly for celebrations that outlast seasons.",
    category: "Textiles",
    gi: true,
    image: "https://images.unsplash.com/photo-1528459105426-b9548367069b?auto=format&fit=crop&w=1200&q=85",
    distance: "Regional discovery",
    detour: "Plan a dedicated day",
    duration: "75 min loom visit",
    accent: "#6f7552",
    coordinates: [12.8342, 79.7036],
  },
  {
    id: "pashmina",
    name: "Kashmiri Pashmina",
    region: "Srinagar",
    state: "Jammu & Kashmir",
    description: "Soft hand-spun fibre, a patient weave, and the particular hush of a Himalayan winter.",
    category: "Textiles",
    image: "https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=1200&q=85",
    distance: "Regional discovery",
    detour: "Plan a dedicated day",
    duration: "90 min atelier visit",
    accent: "#7b6959",
    coordinates: [34.0837, 74.7973],
  },
];

export const experiences = [
  { title: "Turn a Channapatna Toy", meta: "Channapatna · 45 min", image: crafts[0].image, label: "Hands-on workshop" },
  { title: "Read the Loom", meta: "Mysuru · 60 min", image: crafts[1].image, label: "Studio visit" },
  { title: "Clay, Fire, Memory", meta: "Kumbharwada · 90 min", image: crafts[2].image, label: "Maker table" },
];

export const categories = ["All", "GI Tagged", "ODOP", "Textiles", "Woodcraft", "Pottery", "Painting", "Metalwork"];
