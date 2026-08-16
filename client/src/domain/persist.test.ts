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

  it("reads a missing motif width from the first stick", () => {
    const raw = JSON.stringify({
      version: 1,
      name: "старый",
      board: { length: 400, width: 280, thickness: 40 },
      sticks: [{ speciesId: "walnut", width: 40 }],
      strips: [{ flip: true, offset: 15 }],
    });
    const project = parseProject(raw);
    expect(project?.motifWidth).toBe(40);
    expect(project?.strips).toEqual([{ flip: true, offset: 15 }]);
  });

  it("writes motif width on the next save after inferring it", () => {
    const parsed = parseProject(
      JSON.stringify({
        version: 1,
        name: "старый",
        sticks: [{ speciesId: "walnut", width: 40 }],
        strips: [{ flip: false, offset: 0 }],
      }),
    );
    const saved = JSON.parse(serializeProject(parsed!)) as { motifWidth: number };
    expect(saved.motifWidth).toBe(40);
  });

  it("defaults a missing motif width to 20 when there are no sticks", () => {
    const project = parseProject(JSON.stringify({ version: 1, name: "пустой" }));
    expect(project?.motifWidth).toBe(20);
    expect(project?.strips).toEqual([]);
  });

  it("does not resize strips to length divided by motif", () => {
    const raw = JSON.stringify({
      version: 1,
      name: "короткий",
      motifWidth: 20,
      board: { length: 400, width: 280, thickness: 40 },
      sticks: [{ speciesId: "walnut", width: 20 }],
      strips: [
        { flip: false, offset: 0 },
        { flip: true, offset: 20 },
      ],
    });
    const project = parseProject(raw);
    expect(project?.strips).toHaveLength(2);
    expect(project?.strips[1]).toEqual({ flip: true, offset: 20 });
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
