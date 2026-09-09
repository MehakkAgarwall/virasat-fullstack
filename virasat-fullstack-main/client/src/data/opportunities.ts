// Kalā Trail product system: mock decision data describes why a cultural stop is worth the detour, rather than merely where it is.
export type CulturalOpportunity = {
  id: string;
  craftId: string;
  title: string;
  kicker: string;
  kind: "Craft" | "Artisan" | "Experience" | "Heritage" | "Product pickup";
  location: string;
  image: string;
  distance: string;
  detour: string;
  duration: string;
  price: number;
  rating: number;
  popularity: number;
  culturalValue: number;
  summary: string;
  whyStop: string;
  availability: string;
  icon: string;
};

export const culturalOpportunities: CulturalOpportunity[] = [
  { id: "channapatna-workshop", craftId: "channapatna", title: "Channapatna Toys", kicker: "GI tagged", kind: "Experience", location: "Channapatna, Karnataka", image: "/manus-storage/channapatna-toy-workshop_2297aa2e.jpg", distance: "12 km from your route", detour: "+18 min detour", duration: "45 min experience", price: 350, rating: 4.9, popularity: 94, culturalValue: 5, summary: "Discover colourful lacquered wooden toys handcrafted in Channapatna for generations.", whyStop: "You’re already passing through Channapatna. An 18-minute detour lets you meet a traditional toy maker and experience the craft firsthand.", availability: "3 slots today", icon: "🧵" },
  { id: "channapatna-maker-studio", craftId: "channapatna", title: "Channapatna Maker Studio", kicker: "Verified artisan", kind: "Artisan", location: "Channapatna, Karnataka", image: "/manus-storage/channapatna-toys_8bfc72ef.jpg", distance: "2.4 km from your route", detour: "+7 min detour", duration: "30 min studio visit", price: 450, rating: 4.8, popularity: 88, culturalValue: 5, summary: "Visit a working toy studio and carry a small hand-turned story forward.", whyStop: "This studio is just beyond your route. Stop for a maker conversation, see the turning bench, and pick up directly from the hands behind the colour.", availability: "Pickup available", icon: "🛍" },
  { id: "mysuru-heritage", craftId: "rosewood-inlay", title: "Mysuru Heritage Experience", kicker: "Living heritage", kind: "Heritage", location: "Mysuru, Karnataka", image: "/manus-storage/mysuru-heritage-pavilion_6c4424ad.jpg", distance: "5 km from your route", detour: "+9 min detour", duration: "60 min experience", price: 250, rating: 4.7, popularity: 82, culturalValue: 4, summary: "See how patient inlay, wood, and local memory shape the detail inside Mysuru’s craft traditions.", whyStop: "You arrive in Mysuru anyway. A short final turn turns the end of the drive into a deeper cultural encounter.", availability: "Open until 6:30 PM", icon: "🏛" },
];

export const optimizationModes = [
  { id: "quickest", label: "Quickest", note: "31 min extra", detail: "A focused route with the closest cultural moments." },
  { id: "cultural", label: "Most cultural", note: "1h 05m extra", detail: "Prioritise craft significance and maker connection." },
  { id: "value", label: "Best value", note: "₹650 / person", detail: "A balanced day of making, meeting, and carrying stories." },
  { id: "popular", label: "Most popular", note: "4.9 ★ average", detail: "Follow the experiences travellers value most." },
];
