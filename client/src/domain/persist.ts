import { syncCourses } from "./blocks";
import { DEFAULT_BLOCK_SIZE, DEFAULT_MOTIF_WIDTH, emptyProject, SPECIES } from "./defaults";
import type { Project, ShopPath, Species, Stick, StripOp, Unit } from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function parseSpecies(value: unknown): Species[] {
  if (!Array.isArray(value) || value.length === 0) return SPECIES.map((s) => ({ ...s }));
  return value.flatMap((item) => {
    if (!isRecord(item) || typeof item.id !== "string") return [];
    return [
      {
        id: item.id,
        name: asString(item.name, item.id),
        code: asString(item.code, item.id.slice(0, 3).toUpperCase()),
        color: asString(item.color, "#888888"),
      },
    ];
  });
}

function parseSticks(value: unknown): Stick[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!isRecord(item) || typeof item.speciesId !== "string") return [];
    return [{ speciesId: item.speciesId, width: asNumber(item.width, 0) }];
  });
}

function parseStrips(value: unknown): StripOp[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!isRecord(item)) return [];
    return [{ flip: Boolean(item.flip), offset: asNumber(item.offset, 0) }];
  });
}

function parseShopPath(value: unknown): ShopPath {
  return value === "block" ? "block" : "strip";
}

function parseCourses(value: unknown): string[][] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((row) => {
    if (!Array.isArray(row)) return [];
    return [row.flatMap((cell) => (typeof cell === "string" ? [cell] : []))];
  });
}

export function serializeProject(project: Project): string {
  return JSON.stringify(project);
}

export function parseProject(raw: string): Project | null {
  try {
    const data: unknown = JSON.parse(raw);
    if (!isRecord(data) || data.version !== 1) return null;
    const board = isRecord(data.board) ? data.board : {};
    const fallback = emptyProject();
    const sticks = parseSticks(data.sticks);
    const strips = parseStrips(data.strips);
    const project: Project = {
      version: 1,
      name: asString(data.name, fallback.name),
      shopPath: parseShopPath(data.shopPath),
      board: {
        length: asNumber(board.length, fallback.board.length),
        width: asNumber(board.width, fallback.board.width),
        thickness: asNumber(board.thickness, fallback.board.thickness),
      },
      motifWidth:
        "motifWidth" in data
          ? asNumber(data.motifWidth, sticks[0]?.width ?? DEFAULT_MOTIF_WIDTH)
          : (sticks[0]?.width ?? DEFAULT_MOTIF_WIDTH),
      kerf: asNumber(data.kerf, fallback.kerf),
      surfacing: asNumber(data.surfacing, fallback.surfacing),
      extraLength: asNumber(data.extraLength, fallback.extraLength),
      squareUp: asNumber(data.squareUp, fallback.squareUp),
      species: parseSpecies(data.species),
      sticks,
      strips,
      blockSize: asNumber(data.blockSize, DEFAULT_BLOCK_SIZE),
      courses: parseCourses(data.courses),
    };
    return project.shopPath === "block" ? syncCourses(project) : project;
  } catch {
    return null;
  }
}

export function loadProject(storage: Pick<Storage, "getItem">, key: string): Project | null {
  const raw = storage.getItem(key);
  return raw ? parseProject(raw) : null;
}

export function saveProject(storage: Pick<Storage, "setItem">, key: string, project: Project): void {
  storage.setItem(key, serializeProject(project));
}

export function loadUnit(storage: Pick<Storage, "getItem">, key: string): Unit {
  return storage.getItem(key) === "in" ? "in" : "mm";
}

export function saveUnit(storage: Pick<Storage, "setItem">, key: string, unit: Unit): void {
  storage.setItem(key, unit);
}

export function downloadProject(project: Project): void {
  const blob = new Blob([serializeProject(project)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${project.name.replace(/\s+/g, "-").toLowerCase()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
