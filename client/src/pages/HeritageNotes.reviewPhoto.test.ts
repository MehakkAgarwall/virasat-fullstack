import { describe, expect, it } from "vitest";
import { REVIEW_PHOTO_MAX_BYTES, reviewPhotoValidationError } from "./HeritageNotes";

describe("Heritage Notes review photos", () => {
  it("accepts the supported personal-photo formats within the managed upload limit", () => {
    const photo = new File(["trail"], "moment.jpg", { type: "image/jpeg" });
    expect(reviewPhotoValidationError(photo)).toBe("");
    expect(REVIEW_PHOTO_MAX_BYTES).toBe(2 * 1024 * 1024);
  });

  it("rejects a non-image review attachment before upload", () => {
    const file = new File(["notes"], "moment.txt", { type: "text/plain" });
    expect(reviewPhotoValidationError(file)).toMatch(/JPG, PNG, or WebP/);
  });
});
