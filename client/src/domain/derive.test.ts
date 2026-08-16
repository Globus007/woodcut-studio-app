import { describe, expect, it } from "vitest";
import { generateSequence } from "./generate";
import { applyTemplate } from "./templates";
import {
  addStrip,
  bakeToBlocks,
  derive,
  faceGrid,
  faceRow,
  gen1Blank,
  moveStrip,
  removeStrip,
  setShopPath,
  stripCount,
} from "./derive";

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

  it("reads motif width from the project, not the first stick", () => {
    const project = applyTemplate("butcher");
    expect(project.sticks[0].width).toBe(40);
    expect(project.motifWidth).toBe(20);
    expect(derive(project).motifWidth).toBe(20);
    expect(gen1Blank(project).thickness).toBe(20);
    expect(stripCount(project)).toBe(20);
  });

  it("checker flips every other strip", () => {
    const project = applyTemplate("checker");
    const first = project.sticks[0].speciesId;
    const last = project.sticks[project.sticks.length - 1].speciesId;
    expect(faceRow(project, 0)[0].speciesId).toBe(first);
    expect(faceRow(project, 1)[0].speciesId).toBe(last);
  });

  it("names a length shortfall when strips do not cover the board", () => {
    const project = applyTemplate("stripes");
    project.board.length = 409;
    const d = derive(project);
    expect(d.coverage).toBe(400);
    expect(d.lengthShortfall).toBe(9);
    expect(d.lengthTrim).toBe(0);
  });

  it("names a length trim when coverage overruns the board", () => {
    const project = addStrip(applyTemplate("stripes"));
    const d = derive(project);
    expect(project.board.length).toBe(400);
    expect(d.coverage).toBe(420);
    expect(d.lengthTrim).toBe(20);
    expect(d.lengthShortfall).toBe(0);
  });

  it("names a width shortfall when sticks do not fill the board", () => {
    const project = applyTemplate("stripes");
    project.board.width = 300;
    const d = derive(project);
    expect(d.stickSum).toBe(280);
    expect(d.widthShortfall).toBe(20);
    expect(d.widthTrim).toBe(0);
  });

  it("names a width trim when sticks overrun the board", () => {
    const project = applyTemplate("stripes");
    project.board.width = 260;
    const d = derive(project);
    expect(d.widthTrim).toBe(20);
    expect(d.widthShortfall).toBe(0);
  });

  it("does not change length when a strip is added or removed", () => {
    const project = applyTemplate("stripes");
    const added = addStrip(project);
    expect(added.board.length).toBe(400);
    expect(added.strips).toHaveLength(21);
    expect(added.strips[20]).toEqual({ flip: false, offset: 0 });
    const removed = removeStrip(added, 20);
    expect(removed.board.length).toBe(400);
    expect(removed.strips).toHaveLength(20);
  });

  it("swaps two strips without touching length", () => {
    const project = applyTemplate("checker");
    const swapped = moveStrip(project, 0, 1);
    expect(swapped.board.length).toBe(400);
    expect(swapped.strips[0].flip).toBe(true);
    expect(swapped.strips[1].flip).toBe(false);
  });

  it("keeps flip and offset rows when length changes", () => {
    const project = applyTemplate("checker");
    const strips = project.strips.map((strip) => ({ ...strip }));
    project.board.length = 409;
    expect(project.strips).toEqual(strips);
    expect(stripCount(project)).toBe(20);
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

  it("clips the finished face to the typed width from the first stick", () => {
    const project = applyTemplate("stripes");
    project.board.width = 30;
    const row = faceGrid(project)[0];
    expect(row.reduce((sum, cell) => sum + cell.width, 0)).toBe(30);
    expect(row[0].speciesId).toBe(project.sticks[0].speciesId);
    expect(row[1].width).toBe(10);
  });

  it("leaves a hole when sticks fall short of the typed width", () => {
    const project = applyTemplate("stripes");
    project.board.width = 300;
    const row = faceGrid(project)[0];
    expect(row.reduce((sum, cell) => sum + cell.width, 0)).toBe(280);
  });

  it("does not draw a strip that starts past finished length", () => {
    const project = addStrip(applyTemplate("stripes"));
    expect(faceGrid(project)).toHaveLength(20);
  });
});

describe("templates and generate", () => {
  it("writes enough strips that a 409 mm board is trim, not shortfall", () => {
    const base = applyTemplate("stripes");
    base.board.length = 409;
    const project = applyTemplate("stripes", base);
    expect(project.board.length).toBe(409);
    expect(project.strips).toHaveLength(21);
    expect(derive(project).lengthTrim).toBe(11);
    expect(derive(project).lengthShortfall).toBe(0);
  });

  it("keeps an existing motif width when a template is applied", () => {
    const base = applyTemplate("stripes");
    base.motifWidth = 25;
    const project = applyTemplate("butcher", base);
    expect(project.motifWidth).toBe(25);
    expect(project.board.thickness).toBe(40);
    expect(project.strips).toHaveLength(16);
  });

  it("generate keeps motif width and covers typed length", () => {
    const base = applyTemplate("stripes");
    base.motifWidth = 25;
    base.board.length = 409;
    const project = generateSequence(base, 7);
    expect(project.motifWidth).toBe(25);
    expect(project.board.length).toBe(409);
    expect(project.board.width).toBe(project.sticks.reduce((sum, stick) => sum + stick.width, 0));
    expect(project.strips).toHaveLength(17);
  });
});

describe("block path", () => {
  it("does not bake a width shortfall hole as the last stick", () => {
    const project = applyTemplate("stripes");
    project.board.width = 300;
    const baked = bakeToBlocks(project);
    const lastCol = baked.courses[0][baked.courses[0].length - 1];
    expect(lastCol).toBe(project.species[0].id);
  });

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
