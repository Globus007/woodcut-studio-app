import { describe, expect, it } from "vitest";
import { applyTemplate } from "./templates";
import { parseProject, serializeProject } from "./persist";

describe("project file", () => {
  it("round-trips a template", () => {
    const project = applyTemplate("brick");
    const again = parseProject(serializeProject(project));
    expect(again?.name).toBe(project.name);
    expect(again?.sticks).toEqual(project.sticks);
    expect(again?.strips).toEqual(project.strips);
    expect(again?.kerf).toBe(3.2);
  });

  it("rejects a foreign version", () => {
    expect(parseProject(JSON.stringify({ version: 2, name: "x" }))).toBeNull();
  });
});
