import { describe, expect, it } from "vitest";
import { travellerPhotoValidationError } from "./TravellerProfile";

describe("Traveller personal photo validation", () => {
  it("accepts a supported personal-photo format under the managed upload limit", () => {
    expect(travellerPhotoValidationError({ type: "image/webp", size: 1_500_000 })).toBeNull();
  });

  it("rejects unsupported formats and oversized files before attempting an upload", () => {
    expect(travellerPhotoValidationError({ type: "image/gif", size: 50_000 })).toBe("Choose a JPG, PNG, or WebP image.");
    expect(travellerPhotoValidationError({ type: "image/png", size: 2 * 1024 * 1024 + 1 })).toBe("Choose an image smaller than 2 MB.");
  });
});
