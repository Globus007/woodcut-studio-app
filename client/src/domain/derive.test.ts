import { describe, expect, it } from "vitest";
import { applyTemplate } from "./templates";
import { derive, faceRow, gen1Blank, stripCount } from "./derive";

describe("glue-first derive", () => {
  it("computes blank length from strips, kerf and extra", () => {
    const project = applyTemplate("stripes");
    // 8 sticks × 35 = 280 wide; first stick 35 → motif 35; length 400 → 11 strips
    expect(project.sticks[0].width).toBe(35);
    expect(stripCount(project)).toBe(11);
    const blank = gen1Blank(project);
    // crosscut 40+2=42; 11*42 + 11*3.2 + 20 = 462 + 35.2 + 20 = 517.2
    expect(blank.length).toBe(517.2);
    expect(blank.width).toBe(280 + 10);
    expect(blank.thickness).toBe(35);
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
    project.board.length = 400;
    const d = derive(project);
    expect(d.remainder).toBe(400 - 11 * 35);
  });
});
