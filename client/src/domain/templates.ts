import { DEFAULT_BLOCK_SIZE, DEFAULT_MOTIF_WIDTH, DEFAULT_STICK_WIDTH, emptyProject } from "./defaults";
import { blockCols, blockRows, syncCourses } from "./blocks";
import { stripsToCover } from "./derive";
import type { Project, Stick } from "./types";

export type TemplateId =
  | "stripes"
  | "checker"
  | "brick"
  | "herring"
  | "weave"
  | "sunset"
  | "butcher"
  | "accent";

export type Template = {
  id: TemplateId;
  name: string;
  description: string;
  blockDescription: string;
};

export const TEMPLATES: Template[] = [
  { id: "stripes", name: "Полосы", description: "слои вдоль доски", blockDescription: "столбцы по породам" },
  { id: "checker", name: "Шахматы", description: "переворот через одну", blockDescription: "клетка через одну" },
  { id: "brick", name: "Кирпич", description: "сдвиг на одну палку", blockDescription: "ряд со сдвигом" },
  { id: "herring", name: "Ёлочка", description: "ступенчатая диагональ", blockDescription: "диагональ по клеткам" },
  { id: "weave", name: "Плетёнка", description: "AABB и сдвиг на две", blockDescription: "пары клеток со сдвигом" },
  { id: "sunset", name: "Закат", description: "породы по светлоте", blockDescription: "породы по светлоте" },
  { id: "butcher", name: "Мясная лавка", description: "широкие жилы", blockDescription: "широкие жилы" },
  { id: "accent", name: "Акцент", description: "поле и тонкая жила", blockDescription: "поле и жила по центру" },
];

function pair(project: Project): [string, string] {
  return [project.species[0]?.id ?? "walnut", project.species[1]?.id ?? "maple"];
}

function third(project: Project): string {
  return project.species[2]?.id ?? pair(project)[1];
}

function repeatPair(a: string, b: string, count: number): Stick[] {
  return Array.from({ length: count }, (_, i) => ({
    speciesId: i % 2 === 0 ? a : b,
    width: DEFAULT_STICK_WIDTH,
  }));
}

function aabbSticks(a: string, b: string, count: number): Stick[] {
  return Array.from({ length: count }, (_, i) => ({
    speciesId: Math.floor(i / 2) % 2 === 0 ? a : b,
    width: DEFAULT_STICK_WIDTH,
  }));
}

function sunsetSticks(project: Project): Stick[] {
  const order = ["padauk", "cherry", "walnut", "maple", "ash"]
    .map((id) => project.species.find((s) => s.id === id)?.id)
    .filter((id): id is string => Boolean(id));
  const ids = order.length ? order : project.species.map((s) => s.id);
  const count = 14;
  return Array.from({ length: count }, (_, i) => ({
    speciesId: ids[Math.min(ids.length - 1, Math.floor((i / count) * ids.length))],
    width: DEFAULT_STICK_WIDTH,
  }));
}

function butcherSticks(project: Project): Stick[] {
  const [maple, walnut] = [project.species.find((s) => s.id === "maple")?.id ?? pair(project)[1], pair(project)[0]];
  const cherry = third(project);
  const pattern: { speciesId: string; width: number }[] = [
    { speciesId: maple, width: 40 },
    { speciesId: walnut, width: 20 },
    { speciesId: cherry, width: 40 },
    { speciesId: walnut, width: 20 },
    { speciesId: maple, width: 40 },
    { speciesId: walnut, width: 20 },
    { speciesId: cherry, width: 40 },
    { speciesId: walnut, width: 20 },
    { speciesId: maple, width: 40 },
  ];
  return pattern;
}

function accentSticks(project: Project): Stick[] {
  const field = project.species.find((s) => s.id === "maple")?.id ?? pair(project)[1];
  const vein = pair(project)[0];
  return [
    ...Array.from({ length: 6 }, () => ({ speciesId: field, width: DEFAULT_STICK_WIDTH })),
    { speciesId: vein, width: 15 },
    ...Array.from({ length: 7 }, () => ({ speciesId: field, width: DEFAULT_STICK_WIDTH })),
  ];
}

function withSticks(base: Project, name: string, sticks: Stick[]): Project {
  const width = sticks.reduce((sum, stick) => sum + stick.width, 0);
  return {
    ...base,
    name,
    board: { ...base.board, width },
    sticks,
  };
}

export function isTemplateId(id: string): id is TemplateId {
  return TEMPLATES.some((template) => template.id === id);
}

export function stripOps(id: TemplateId, count: number, unit: number): Project["strips"] {
  if (id === "checker") {
    return Array.from({ length: count }, (_, i) => ({ flip: i % 2 === 1, offset: 0 }));
  }
  if (id === "brick") {
    return Array.from({ length: count }, (_, i) => ({ flip: false, offset: i % 2 === 1 ? unit : 0 }));
  }
  if (id === "herring") {
    return Array.from({ length: count }, (_, i) => ({ flip: false, offset: i * unit }));
  }
  if (id === "weave") {
    return Array.from({ length: count }, (_, i) => ({ flip: false, offset: i % 2 === 1 ? unit * 2 : 0 }));
  }
  return Array.from({ length: count }, () => ({ flip: false, offset: 0 }));
}

function applyStripTemplate(id: TemplateId, base: Project): Project {
  const [a, b] = pair(base);
  let named = withSticks(base, "Полосы", repeatPair(a, b, 14));
  if (id === "checker") named = withSticks(base, "Шахматы", repeatPair(a, b, 14));
  if (id === "brick") named = withSticks(base, "Кирпич", repeatPair(a, b, 14));
  if (id === "herring") named = withSticks(base, "Ёлочка", aabbSticks(a, b, 14));
  if (id === "weave") named = withSticks(base, "Плетёнка", aabbSticks(a, b, 14));
  if (id === "sunset") named = withSticks(base, "Закат", sunsetSticks(base));
  if (id === "butcher") named = withSticks(base, "Мясная лавка", butcherSticks(base));
  if (id === "accent") named = withSticks(base, "Акцент", accentSticks(base));
  const motif = named.motifWidth > 0 ? named.motifWidth : DEFAULT_MOTIF_WIDTH;
  const unit = named.sticks[0]?.width ?? DEFAULT_STICK_WIDTH;
  const count = stripsToCover(named.board.length, motif);
  return { ...named, motifWidth: motif, strips: stripOps(id, count, unit) };
}

function fillCourses(base: Project, name: string, cell: (r: number, c: number, cols: number) => string): Project {
  const blockSize = base.blockSize > 0 ? base.blockSize : DEFAULT_BLOCK_SIZE;
  const next = syncCourses({ ...base, name, shopPath: "block", blockSize, courses: [] });
  const rows = blockRows(next);
  const cols = blockCols(next);
  const courses = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => cell(r, c, cols)),
  );
  return { ...next, courses };
}

function applyBlockTemplate(id: TemplateId, base: Project): Project {
  const [a, b] = pair(base);
  const c = third(base);
  const sunsetIds = ["padauk", "cherry", "walnut", "maple", "ash"]
    .map((sid) => base.species.find((s) => s.id === sid)?.id)
    .filter((sid): sid is string => Boolean(sid));
  const gradient = sunsetIds.length ? sunsetIds : base.species.map((s) => s.id);
  const field = base.species.find((s) => s.id === "maple")?.id ?? b;

  if (id === "checker") {
    return fillCourses(base, "Шахматы", (r, col) => ((r + col) % 2 === 0 ? a : b));
  }
  if (id === "brick") {
    return fillCourses(base, "Кирпич", (r, col) => ((col + (r % 2)) % 2 === 0 ? a : b));
  }
  if (id === "herring") {
    return fillCourses(base, "Ёлочка", (r, col) => (Math.floor((r + col) / 2) % 2 === 0 ? a : b));
  }
  if (id === "weave") {
    return fillCourses(base, "Плетёнка", (r, col) => {
      const shifted = col + (r % 2 === 1 ? 2 : 0);
      return Math.floor(shifted / 2) % 2 === 0 ? a : b;
    });
  }
  if (id === "sunset") {
    return fillCourses(base, "Закат", (_r, col, cols) => {
      const i = Math.min(gradient.length - 1, Math.floor((col / Math.max(cols, 1)) * gradient.length));
      return gradient[i];
    });
  }
  if (id === "butcher") {
    return fillCourses(base, "Мясная лавка", (_r, col) => {
      const band = Math.floor(col / 2) % 4;
      if (band === 0) return field;
      if (band === 2) return c;
      return a;
    });
  }
  if (id === "accent") {
    return fillCourses(base, "Акцент", (_r, col, cols) => (col === Math.floor(cols / 2) ? a : field));
  }
  return fillCourses(base, "Полосы", (_r, col) => (col % 2 === 0 ? a : b));
}

export function applyTemplate(id: TemplateId, base?: Project): Project {
  const seed = emptyProject(TEMPLATES.find((t) => t.id === id)?.name ?? id);
  const next: Project = {
    ...seed,
    species: base?.species ? base.species.map((s) => ({ ...s })) : seed.species,
    shopPath: base?.shopPath ?? "strip",
    blockSize: base?.blockSize ?? DEFAULT_BLOCK_SIZE,
    motifWidth: base?.motifWidth ?? seed.motifWidth,
    board: {
      ...seed.board,
      length: base?.board.length ?? seed.board.length,
      thickness: base?.board.thickness ?? seed.board.thickness,
    },
    kerf: base?.kerf ?? seed.kerf,
    surfacing: base?.surfacing ?? seed.surfacing,
    extraLength: base?.extraLength ?? seed.extraLength,
    squareUp: base?.squareUp ?? seed.squareUp,
  };
  return next.shopPath === "block" ? applyBlockTemplate(id, next) : applyStripTemplate(id, next);
}
