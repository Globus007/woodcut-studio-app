import { describe, expect, it } from "vitest";
import { applyTemplate } from "./templates";
import { loadUnit, parseProject, saveUnit, serializeProject } from "./persist";

describe("project file", () => {
  it("round-trips a template", () => {
    const project = applyTemplate("brick");
    const again = parseProject(serializeProject(project));
    expect(again?.name).toBe(project.name);
    expect(again?.sticks).toEqual(project.sticks);
    expect(again?.strips).toEqual(project.strips);
    expect(again?.shopPath).toBe("strip");
    expect(again?.blockSize).toBe(20);
    expect(again?.kerf).toBe(3.2);
  });

  it("round-trips a block project", () => {
    const project = applyTemplate("weave", { ...applyTemplate("stripes"), shopPath: "block" });
    const again = parseProject(serializeProject(project));
    expect(again?.shopPath).toBe("block");
    expect(again?.courses).toEqual(project.courses);
  });

  it("rejects a foreign version", () => {
    expect(parseProject(JSON.stringify({ version: 2, name: "x" }))).toBeNull();
  });

  it("reads units from storage", () => {
    const store = new Map<string, string>();
    const storage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
    };
    expect(loadUnit(storage, "u")).toBe("mm");
    saveUnit(storage, "u", "in");
    expect(loadUnit(storage, "u")).toBe("in");
  });
});
