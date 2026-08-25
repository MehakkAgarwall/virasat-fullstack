export type CraftDetailExperience = {
  id: string;
  craftId: number;
  available: number;
  title: string;
  location: string;
  duration: string;
  price: number;
  capacity: number;
};

/**
 * A zero price is not presented as a traveller-facing price. It can be a
 * prototype default rather than a published commercial detail, so the detail
 * page should continue to show the craft route instead of implying a free
 * experience.
 */
export function findBookableExperienceForCraft(experiences: CraftDetailExperience[], craftId: number | null) {
  if (craftId == null) return null;
  return experiences.find((experience) => (
    experience.craftId === craftId
    && Number(experience.available) === 1
    && Number(experience.price) > 0
  )) ?? null;
}

export function formatPublishedExperiencePrice(price: number) {
  return Number(price) > 0 ? `₹${Number(price).toLocaleString("en-IN")} / person` : null;
}
