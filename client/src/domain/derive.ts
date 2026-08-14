import type { Derived, FaceCell, Gen1Blank, Project, TakeoffRow } from "./types";

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
  const blank = gen1Blank(project);
  return project.sticks.map((stick) => {
    const species = project.species.find((s) => s.id === stick.speciesId);
    return {
      speciesId: stick.speciesId,
      speciesName: species?.name ?? stick.speciesId,
      width: stick.width,
      length: blank.length,
    };
  });
}

export function wasteRatio(project: Project): number | null {
  const blank = gen1Blank(project);
  const gen1 = blank.length * blank.width * blank.thickness;
  const finished = project.board.length * project.board.width * project.board.thickness;
  if (gen1 <= 0) return null;
  return Math.max(0, (gen1 - finished) / gen1);
}

export function derive(project: Project): Derived {
  const motif = motifWidth(project);
  const count = stripCount(project);
  const blank = gen1Blank(project);
  const finishedVolume = project.board.length * project.board.width * project.board.thickness;
  const gen1Volume = blank.length * blank.width * blank.thickness;
  return {
    motifWidth: motif,
    stripCount: count,
    crosscutWidth: crosscutWidth(project),
    remainder: motif > 0 ? project.board.length - count * motif : project.board.length,
    blank,
    stickSum: stickSum(project),
    takeoff: takeoff(project),
    wasteRatio: wasteRatio(project),
    finishedVolume,
    gen1Volume,
  };
}

export function faceRow(project: Project, stripIndex: number): FaceCell[] {
  const strip = project.strips[stripIndex] ?? { flip: false, offset: 0 };
  const cells = project.sticks.map((stick) => ({
    speciesId: stick.speciesId,
    width: stick.width,
  }));
  return strip.flip ? cells.slice().reverse() : cells;
}

export function faceGrid(project: Project): FaceCell[][] {
  const synced = syncStrips(project);
  return synced.strips.map((_, index) => faceRow(synced, index));
}

export function speciesColor(project: Project, speciesId: string): string {
  return project.species.find((s) => s.id === speciesId)?.color ?? "#888";
}
