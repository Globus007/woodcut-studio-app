import { describe, expect, it } from "vitest";
import { applyTemplate } from "./templates";
import { bakeToBlocks, derive, faceRow, gen1Blank, setShopPath, stripCount } from "./derive";

describe("glue-first derive", () => {
  it("computes blank length from strips, kerf and extra", () => {
    const project = applyTemplate("stripes");
    expect(project.sticks[0].width).toBe(20);
    expect(project.sticks).toHaveLength(14);
    expect(stripCount(project)).toBe(20);
    const blank = gen1Blank(project);
    expect(blank.length).toBe(924);
    expect(blank.width).toBe(280 + 10);
    expect(blank.thickness).toBe(20);
  });

  it("checker flips every other strip", () => {
    const project = applyTemplate("checker");
    const first = project.sticks[0].speciesId;
    const last = project.sticks[project.sticks.length - 1].speciesId;
    expect(faceRow(project, 0)[0].speciesId).toBe(first);
    expect(faceRow(project, 1)[0].speciesId).toBe(last);
  });

  it("reports remainder when length does not divide motif", () => {
    const project = applyTemplate("stripes");
    project.board.length = 409;
    const d = derive(project);
    expect(d.remainder).toBe(409 - 20 * 20);
  });

  it("herring steps offset by one stick", () => {
    const project = applyTemplate("herring");
    expect(project.sticks[0].speciesId).toBe(project.sticks[1].speciesId);
    expect(project.strips[0].offset).toBe(0);
    expect(project.strips[1].offset).toBe(20);
    expect(project.strips[2].offset).toBe(40);
  });

  it("weave uses AABB and a two-stick offset", () => {
    const project = applyTemplate("weave");
    expect(project.sticks.map((s) => s.speciesId).slice(0, 4)).toEqual([
      project.sticks[0].speciesId,
      project.sticks[0].speciesId,
      project.sticks[2].speciesId,
      project.sticks[2].speciesId,
    ]);
    expect(project.strips[1].offset).toBe(40);
  });
});

describe("block path", () => {
  it("bakes a strip face onto courses and refuses the reverse", () => {
    const strip = applyTemplate("checker");
    const baked = bakeToBlocks(strip);
    expect(baked.shopPath).toBe("block");
    expect(baked.courses.length).toBe(20);
    expect(baked.courses[0].length).toBe(14);
    expect(setShopPath(baked, "strip")).toBeNull();
  });

  it("counts blocks on the takeoff", () => {
    const project = applyTemplate("stripes", { ...applyTemplate("stripes"), shopPath: "block" });
    const d = derive(project);
    expect(d.takeoff.some((row) => row.blocks > 0)).toBe(true);
    expect(d.blockCols).toBe(14);
    expect(d.blockRows).toBe(20);
  });
});
