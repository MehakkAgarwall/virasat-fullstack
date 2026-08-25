import { describe, expect, it } from "vitest";
import { landingFaqs } from "./landingFaq";

describe("landing FAQ content", () => {
  it("keeps the requested numbered source-honest question set", () => {
    expect(landingFaqs.map((item) => item.id)).toEqual(["01", "02", "03", "04", "05", "06", "07", "08"]);
    expect(landingFaqs.some((item) => item.answer.includes("government verification"))).toBe(false);
    expect(landingFaqs.find((item) => item.id === "05")?.answer).toContain("accept or reject");
  });
});
