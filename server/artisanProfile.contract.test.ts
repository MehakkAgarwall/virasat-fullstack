import { describe, expect, it } from "vitest";
import { artisanProfiles } from "../drizzle/schema";
import { appRouter } from "./routers";

describe("artisan public profile contract", () => {
  it("exposes the minimum persistent per-artisan profile operations", () => {
    expect(Object.keys((appRouter as any)._def.record.artisanProfile).sort()).toEqual(["get", "getOrCreate", "update"]);
  });

  it("stores every editable public profile field under a unique artisan identity", () => {
    expect(artisanProfiles.artisanKey.name).toBe("artisanKey");
    expect(artisanProfiles.primaryCraftId.name).toBe("primaryCraftId");
    expect(artisanProfiles.studioName.name).toBe("studioName");
    expect(artisanProfiles.personalName.name).toBe("personalName");
    expect(artisanProfiles.craftSpecialization.name).toBe("craftSpecialization");
    expect(artisanProfiles.profilePhotoUrl.name).toBe("profilePhotoUrl");
    expect(artisanProfiles.coverPhotoUrl.name).toBe("coverPhotoUrl");
    expect(artisanProfiles.experienceInfo.name).toBe("experienceInfo");
  });
});
