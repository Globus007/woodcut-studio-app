import { describe, expect, it } from "vitest";
import { derive } from "./derive";
import { generateSequence } from "./generate";
import { applyTemplate } from "./templates";
import type { Project } from "./types";

function blockFace(length = 100, width = 100, blockSize = 20): Project {
  const base = applyTemplate("stripes");
  return {
    ...base,
    shopPath: "block",
    board: { ...base.board, length, width },
    blockSize,
    courses: [],
  };
}

describe("generateSequence block fields", () => {
  it("paints rings as radial bands and keeps the typed board", () => {
    const base = blockFace();
    const project = generateSequence(base, 1, { family: "rings", scale: 2 });

    expect(project.board).toEqual(base.board);
    expect(project.blockSize).toBe(20);
    expect(project.motifWidth).toBe(base.motifWidth);
    expect(project.kerf).toBe(base.kerf);
    expect(project.courses).toHaveLength(5);
    expect(project.courses[0]).toHaveLength(5);

    const walnut = base.species[0].id;
    const maple = base.species[1].id;
    expect(project.courses[2][2]).toBe(walnut);
    expect(project.courses[2][1]).toBe(walnut);
    expect(project.courses[2][0]).toBe(maple);
    expect(project.courses[0][0]).toBe(maple);
    expect(project.courses[0]).toEqual([maple, maple, maple, maple, maple]);
    expect(project.courses[2]).toEqual([maple, walnut, walnut, walnut, maple]);
  });

  it("paints nested frames from the edge inward", () => {
    const project = generateSequence(blockFace(), 1, { family: "nested", scale: 1 });
    const walnut = project.species[0].id;
    const maple = project.species[1].id;
    const cherry = project.species[2].id;

    expect(project.courses[0][0]).toBe(walnut);
    expect(project.courses[0][2]).toBe(walnut);
    expect(project.courses[1][1]).toBe(maple);
    expect(project.courses[2][2]).toBe(cherry);
  });

  it("paints a chevron V in the first course", () => {
    const project = generateSequence(blockFace(), 1, { family: "chevron", scale: 2 });
    const walnut = project.species[0].id;
    const maple = project.species[1].id;
    expect(project.courses[0]).toEqual([maple, walnut, walnut, walnut, maple]);
  });

  it("does not paint independent snow on swirl or terrazzo", () => {
    const swirl = generateSequence(blockFace(200, 200), 3, { family: "swirl", scale: 2 });
    const again = generateSequence(blockFace(200, 200), 3, { family: "swirl", scale: 2 });
    const other = generateSequence(blockFace(200, 200), 4, { family: "swirl", scale: 2 });
    const terrazzo = generateSequence(blockFace(200, 200), 8, { family: "terrazzo", scale: 2 });

    const swirlIds = new Set(swirl.courses.flat());
    const terraIds = new Set(terrazzo.courses.flat());
    expect(swirlIds.size).toBeGreaterThan(1);
    expect(terraIds.size).toBeGreaterThan(1);
    expect(swirl.courses).toEqual(again.courses);
    expect(swirl.courses).not.toEqual(other.courses);
    expect(terraIds.has(terrazzo.species[0].id)).toBe(true);
  });
});

describe("generateSequence strip families", () => {
  it("covers the typed width with an accent field and one thin vein", () => {
    const base = applyTemplate("stripes");
    base.motifWidth = 25;
    base.board.length = 409;
    const project = generateSequence(base, 4, { family: "accent" });

    expect(project.motifWidth).toBe(25);
    expect(project.board.length).toBe(409);
    expect(project.board.thickness).toBe(base.board.thickness);
    expect(project.kerf).toBe(base.kerf);
    expect(project.board.width).toBe(project.sticks.reduce((sum, stick) => sum + stick.width, 0));
    expect(project.board.width).toBeGreaterThanOrEqual(base.board.width);
    expect(project.strips).toHaveLength(17);
    expect(derive(project).lengthShortfall).toBe(0);

    const thin = project.sticks.filter((stick) => stick.width === 15);
    expect(thin).toHaveLength(1);
    const fieldId = project.sticks.find((stick) => stick.width !== 15)?.speciesId;
    expect(fieldId).toBeTruthy();
    expect(project.sticks.filter((stick) => stick.speciesId !== thin[0].speciesId).length).toBeGreaterThan(0);
    expect(project.strips.every((strip) => strip.flip === false && strip.offset === 0)).toBe(true);
  });

  it("keeps the butcher 40/20 vein rhythm", () => {
    const project = generateSequence(applyTemplate("stripes"), 2, { family: "butcher" });
    expect(project.sticks.length).toBeGreaterThan(1);
    expect(project.sticks.every((stick, i) => stick.width === (i % 2 === 0 ? 40 : 20))).toBe(true);
    expect(project.board.width).toBeGreaterThanOrEqual(280);
    expect(project.strips.every((strip) => strip.offset === 0)).toBe(true);
  });

  it("varies checker as alternate flips of a two-species run", () => {
    const project = generateSequence(applyTemplate("stripes"), 5, { family: "checker" });
    expect(project.board.width).toBeGreaterThanOrEqual(280);
    expect(project.strips.every((strip, i) => strip.flip === (i % 2 === 1) && strip.offset === 0)).toBe(true);
    const ids = [...new Set(project.sticks.map((stick) => stick.speciesId))];
    expect(ids.length).toBe(2);
  });

  it("steps herring offsets by a stick-width unit", () => {
    const project = generateSequence(applyTemplate("stripes"), 6, { family: "herring" });
    const unit = project.sticks[0]?.width ?? 0;
    expect(unit).toBeGreaterThan(0);
    expect(project.strips.map((strip) => strip.offset)).toEqual(project.strips.map((_, i) => i * unit));
  });
});
