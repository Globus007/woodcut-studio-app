import { DEFAULT_BLOCK_SIZE } from "./defaults";
import {
  blockCols,
  blockRows,
  blockStockVolume,
  blockTakeoff,
  remainderX,
  remainderY,
  syncCourses,
} from "./blocks";
import type { Derived, FaceCell, Gen1Blank, Project, ShopPath, TakeoffRow } from "./types";

export function motifWidth(project: Project): number {
  return project.sticks[0]?.width ?? 0;
}

export function stickSum(project: Project): number {
  return project.sticks.reduce((sum, stick) => sum + stick.width, 0);
}

export function stripCount(project: Project): number {
  const motif = motifWidth(project);
  if (motif <= 0) return 0;
  return Math.max(1, Math.round(project.board.length / motif));
}

export function crosscutWidth(project: Project): number {
  return project.board.thickness + project.surfacing;
}

export function gen1Blank(project: Project): Gen1Blank {
  const count = stripCount(project);
  return {
    length: count * crosscutWidth(project) + count * project.kerf + project.extraLength,
    width: stickSum(project) + project.squareUp,
    thickness: motifWidth(project),
  };
}

export function syncStrips(project: Project): Project {
  const count = stripCount(project);
  const strips = project.strips.slice(0, count);
  while (strips.length < count) {
    const prev = strips[strips.length - 1];
    strips.push({ flip: false, offset: prev?.offset ?? 0 });
  }
  return { ...project, strips };
}

export function takeoff(project: Project): TakeoffRow[] {
  if (project.shopPath === "block") return blockTakeoff(syncCourses(project));
  const blank = gen1Blank(project);
  return project.sticks.map((stick) => {
    const species = project.species.find((s) => s.id === stick.speciesId);
    return {
      speciesId: stick.speciesId,
      speciesName: species?.name ?? stick.speciesId,
      width: stick.width,
      length: blank.length,
      blocks: 0,
    };
  });
}

export function wasteRatio(project: Project): number | null {
  const finished = project.board.length * project.board.width * project.board.thickness;
  if (project.shopPath === "block") {
    const stock = blockStockVolume(syncCourses(project));
    if (stock <= 0) return null;
    return Math.max(0, (stock - finished) / stock);
  }
  const blank = gen1Blank(project);
  const gen1 = blank.length * blank.width * blank.thickness;
  if (gen1 <= 0) return null;
  return Math.max(0, (gen1 - finished) / gen1);
}

export function derive(project: Project): Derived {
  const motif = motifWidth(project);
  const count = stripCount(project);
  const blank = gen1Blank(project);
  const finishedVolume = project.board.length * project.board.width * project.board.thickness;
  const cols = blockCols(project);
  const rows = blockRows(project);
  const remX = remainderX(project);
  const remY = remainderY(project);
  const gen1Volume =
    project.shopPath === "block"
      ? blockStockVolume(syncCourses(project))
      : blank.length * blank.width * blank.thickness;
  return {
    motifWidth: motif,
    stripCount: count,
    crosscutWidth: crosscutWidth(project),
    remainder: project.shopPath === "block" ? remY : motif > 0 ? project.board.length - count * motif : project.board.length,
    remainderX: remX,
    remainderY: remY,
    blockCols: cols,
    blockRows: rows,
    blank,
    stickSum: stickSum(project),
    takeoff: takeoff(project),
    wasteRatio: wasteRatio(project),
    finishedVolume,
    gen1Volume,
  };
}

function cycleCells(cells: FaceCell[], offset: number, span: number): FaceCell[] {
  if (cells.length === 0 || span <= 0) return cells;
  const period = cells.reduce((sum, cell) => sum + cell.width, 0);
  if (period <= 0) return cells;
  let pos = ((offset % period) + period) % period;
  const out: FaceCell[] = [];
  let filled = 0;
  let guard = 0;
  while (filled < span && guard < 512) {
    let walked = 0;
    for (const cell of cells) {
      if (pos >= walked + cell.width) {
        walked += cell.width;
        continue;
      }
      const take = Math.min(cell.width - (pos - walked), span - filled);
      if (take > 0) out.push({ speciesId: cell.speciesId, width: take });
      filled += take;
      pos = (pos + take) % period;
      break;
    }
    guard += 1;
  }
  return out;
}

export function faceRow(project: Project, stripIndex: number): FaceCell[] {
  const strip = project.strips[stripIndex] ?? { flip: false, offset: 0 };
  const cells = project.sticks.map((stick) => ({
    speciesId: stick.speciesId,
    width: stick.width,
  }));
  const oriented = strip.flip ? cells.slice().reverse() : cells;
  const span = stickSum(project) || project.board.width;
  return cycleCells(oriented, strip.offset, span);
}

export function faceGrid(project: Project): FaceCell[][] {
  if (project.shopPath === "block") {
    const synced = syncCourses(project);
    const size = synced.blockSize || DEFAULT_BLOCK_SIZE;
    return synced.courses.map((course) => course.map((speciesId) => ({ speciesId, width: size })));
  }
  const synced = syncStrips(project);
  return synced.strips.map((_, index) => faceRow(synced, index));
}

function speciesAtX(row: FaceCell[], x: number): string {
  if (row.length === 0) return "walnut";
  let cursor = x;
  for (const cell of row) {
    if (cursor < cell.width) return cell.speciesId;
    cursor -= cell.width;
  }
  return row[row.length - 1].speciesId;
}

export function bakeToBlocks(project: Project): Project {
  const sized = {
    ...project,
    shopPath: "block" as const,
    blockSize: project.blockSize > 0 ? project.blockSize : DEFAULT_BLOCK_SIZE,
  };
  const next = syncCourses({ ...sized, courses: [] });
  const synced = syncStrips(project);
  const motif = motifWidth(synced);
  const rows = blockRows(next);
  const cols = blockCols(next);
  if (motif <= 0 || synced.sticks.length === 0) return next;
  const courses = Array.from({ length: rows }, (_, r) => {
    const y = (r + 0.5) * next.blockSize;
    const stripIndex = Math.min(synced.strips.length - 1, Math.max(0, Math.floor(y / motif)));
    const row = faceRow(synced, stripIndex);
    return Array.from({ length: cols }, (_, c) => speciesAtX(row, (c + 0.5) * next.blockSize));
  });
  return { ...next, courses };
}

export function setShopPath(project: Project, path: ShopPath): Project | null {
  if (project.shopPath === path) return project;
  if (path === "block") return bakeToBlocks(project);
  return null;
}

export function speciesColor(project: Project, speciesId: string): string {
  return project.species.find((s) => s.id === speciesId)?.color ?? "#888";
}
