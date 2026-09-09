import { describe, expect, it } from "vitest";
import { animatedNumberAt } from "./AnimatedNumber";

describe("animatedNumberAt", () => {
  it("clamps a counter animation before its first animation frame", () => {
    expect(animatedNumberAt(1284, -4)).toBe(0);
  });

  it("returns the requested value after the animation duration", () => {
    expect(animatedNumberAt(86, 900)).toBe(86);
  });
});
