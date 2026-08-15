import { describe, expect, it } from "vitest";
import { applyTemplate } from "./templates";
import { imageToCourses, nearestSpecies } from "./imageMap";

describe("image map", () => {
  it("picks the closest species color", () => {
    const project = applyTemplate("stripes");
    expect(nearestSpecies(project.species, 232, 196, 143)).toBe("maple");
    expect(nearestSpecies(project.species, 200, 85, 48)).toBe("padauk");
  });

  it("covers the block grid from a pixel buffer", () => {
    const base = applyTemplate("stripes", { ...applyTemplate("stripes"), shopPath: "block" });
    const mapped = imageToCourses(base, {
      width: 2,
      height: 2,
      data: [0, 0, 0, 255, 255, 220, 180, 255, 200, 80, 40, 255, 255, 255, 255, 255],
    });
    expect(mapped.courses).toHaveLength(20);
    expect(mapped.courses[0]).toHaveLength(14);
    expect(mapped.courses.flat().every((id) => base.species.some((s) => s.id === id))).toBe(true);
  });
});
