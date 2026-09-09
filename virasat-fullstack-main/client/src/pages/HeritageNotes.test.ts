import { describe, expect, it } from "vitest";
import { readingNotes, travellerJournalCopy } from "./HeritageNotes";

describe("Heritage Notes reading cards", () => {
  it("keeps each reading-card pathway supplied with readable supporting copy and an action", () => {
    expect(readingNotes).toHaveLength(3);
    readingNotes.forEach((note) => {
      expect(note.body.length).toBeGreaterThan(40);
      expect(note.action.length).toBeGreaterThan(6);
      expect(note.href.startsWith("/")).toBe(true);
    });
  });

  it("keeps the Traveller field journal explicitly private and presentable", () => {
    expect(travellerJournalCopy.eyebrow).toBe("Your field journal");
    expect(travellerJournalCopy.prompt.length).toBeGreaterThan(8);
    expect(travellerJournalCopy.privacy).toContain("Private");
    expect(travellerJournalCopy.empty).toContain("saved reflections");
  });
});
