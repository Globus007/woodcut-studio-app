import type { Project, TakeoffRow } from "./types";

export function blockCols(project: Project): number {
  if (project.blockSize <= 0) return 0;
  return Math.max(0, Math.floor(project.board.width / project.blockSize));
}

export function blockRows(project: Project): number {
  if (project.blockSize <= 0) return 0;
  return Math.max(0, Math.floor(project.board.length / project.blockSize));
}

export function remainderX(project: Project): number {
  return project.board.width - blockCols(project) * project.blockSize;
}

export function remainderY(project: Project): number {
  return project.board.length - blockRows(project) * project.blockSize;
}

export function syncCourses(project: Project): Project {
  const rows = blockRows(project);
  const cols = blockCols(project);
  const fill = project.species[0]?.id ?? "walnut";
  const courses = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => project.courses[r]?.[c] ?? fill),
  );
  return { ...project, courses };
}

export function paintBlock(project: Project, row: number, col: number, speciesId: string): Project {
  const synced = syncCourses(project);
  if (row < 0 || col < 0 || row >= synced.courses.length || col >= (synced.courses[0]?.length ?? 0)) {
    return synced;
  }
  const courses = synced.courses.map((course, r) =>
    course.map((id, c) => (r === row && c === col ? speciesId : id)),
  );
  return { ...synced, courses };
}

export function usedCourseSpecies(project: Project): string[] {
  const ids: string[] = [];
  for (const course of project.courses) {
    for (const id of course) {
      if (!ids.includes(id)) ids.push(id);
    }
  }
  return ids;
}

export function blockTakeoff(project: Project): TakeoffRow[] {
  const counts = new Map<string, number>();
  for (const course of project.courses) {
    for (const id of course) {
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
  }
  const cut = project.board.thickness + project.surfacing;
  return [...counts.entries()].map(([speciesId, blocks]) => {
    const species = project.species.find((s) => s.id === speciesId);
    return {
      speciesId,
      speciesName: species?.name ?? speciesId,
      width: project.blockSize,
      length: blocks * cut + blocks * project.kerf + project.extraLength,
      blocks,
    };
  });
}

export function blockStockVolume(project: Project): number {
  return blockTakeoff(project).reduce((sum, row) => {
    return sum + row.length * (row.width + project.squareUp) * project.blockSize;
  }, 0);
}
