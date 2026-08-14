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
});
