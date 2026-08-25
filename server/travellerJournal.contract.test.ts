import { describe, expect, it } from "vitest";
import { travellerReflections } from "../drizzle/schema";
import { appRouter } from "./routers";

describe("travellerJournal contract", () => {
  it("exposes private list and create procedures keyed to the existing traveller identity", () => {
    const procedures = Object.keys((appRouter as any)._def.record.travellerJournal).sort();
    expect(procedures).toEqual(["create", "list", "listShared", "publish"]);
    expect(travellerReflections.travellerKey.name).toBe("travellerKey");
    expect(travellerReflections.content.name).toBe("content");
    expect(travellerReflections.isShared.name).toBe("isShared");
  });
});
