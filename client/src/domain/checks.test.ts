import { describe, expect, it } from "vitest";
import { evaluateChecks, hasRefuse } from "./checks";
import { applyTemplate } from "./templates";

describe("physical checks", () => {
  it("accepts the stripes template", () => {
    const checks = evaluateChecks(applyTemplate("stripes"));
    expect(hasRefuse(checks)).toBe(false);
  });

  it("refuses a board thinner than 18 mm", () => {
    const project = applyTemplate("stripes");
    project.board.thickness = 17;
    const checks = evaluateChecks(project);
    expect(checks.some((c) => c.code === "thin-board" && c.level === "refuse")).toBe(true);
  });

  it("refuses a stick narrower than 12 mm", () => {
    const project = applyTemplate("stripes");
    project.sticks[0].width = 11;
    const checks = evaluateChecks(project);
    expect(checks.some((c) => c.code === "stick-too-narrow" && c.level === "refuse")).toBe(true);
  });

  it("warns when extra length is zero but still allows print", () => {
    const project = applyTemplate("stripes");
    project.extraLength = 0;
    const checks = evaluateChecks(project);
    expect(hasRefuse(checks)).toBe(false);
    expect(checks.some((c) => c.code === "no-extra")).toBe(true);
  });

  it("refuses an empty strip list", () => {
    const project = applyTemplate("stripes");
    project.strips = [];
    const checks = evaluateChecks(project);
    expect(checks.some((c) => c.code === "empty-strips" && c.level === "refuse")).toBe(true);
  });

  it("refuses a width shortfall", () => {
    const project = applyTemplate("stripes");
    project.board.width = 300;
    const checks = evaluateChecks(project);
    expect(checks.some((c) => c.code === "width-shortfall" && c.level === "refuse")).toBe(true);
  });

  it("refuses a length shortfall", () => {
    const project = applyTemplate("stripes");
    project.board.length = 409;
    const checks = evaluateChecks(project);
    expect(checks.some((c) => c.code === "length-shortfall" && c.level === "refuse")).toBe(true);
  });

  it("warns a width trim but still allows print", () => {
    const project = applyTemplate("stripes");
    project.board.width = 260;
    const checks = evaluateChecks(project);
    expect(hasRefuse(checks)).toBe(false);
    expect(checks.some((c) => c.code === "width-trim" && c.level === "warn")).toBe(true);
  });

  it("warns a length trim but still allows print", () => {
    const project = applyTemplate("stripes");
    project.strips = [...project.strips, { flip: false, offset: 0 }];
    const checks = evaluateChecks(project);
    expect(hasRefuse(checks)).toBe(false);
    expect(checks.some((c) => c.code === "length-trim" && c.level === "warn")).toBe(true);
  });
});
