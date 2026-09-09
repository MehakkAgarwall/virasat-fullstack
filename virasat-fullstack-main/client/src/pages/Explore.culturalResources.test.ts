import { describe, expect, it } from "vitest";
import { filterCulturalResources } from "./Explore";

const resources = [
  { id: "banarasi-silk-saree-discovery", craftId: 104, title: "Banarasi Silk Saree cultural discovery", summary: "Gold and silver brocade weaving in Varanasi.", location: "Varanasi, Uttar Pradesh", imageUrl: "https://example.test/banarasi.jpg" },
  { id: "pattachitra-discovery", craftId: 115, title: "Pattachitra cultural discovery", summary: "Cloth-based scroll painting in Puri.", location: "Puri, Odisha", imageUrl: "https://example.test/pattachitra.jpg" },
];

describe("cultural-resource discovery filtering", () => {
  it("matches the requested Banarasi Silk record by craft name and place", () => {
    expect(filterCulturalResources(resources, "Banarasi").map((item) => item.id)).toEqual(["banarasi-silk-saree-discovery"]);
    expect(filterCulturalResources(resources, "varanasi").map((item) => item.id)).toEqual(["banarasi-silk-saree-discovery"]);
  });

  it("keeps the full source-linked registry visible without a search term", () => {
    expect(filterCulturalResources(resources, "")).toHaveLength(2);
  });
});
