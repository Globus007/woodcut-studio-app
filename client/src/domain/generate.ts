import { blockCols, blockRows, syncCourses } from "./blocks";
import { SPECIES } from "./defaults";
import { stripsToCover } from "./derive";
import type { Project, Stick } from "./types";

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateSequence(base: Project, seed: number): Project {
  const rand = mulberry32(seed);
  const palette = base.species.length ? base.species : SPECIES;
  if (base.shopPath === "block") {
    const draft = syncCourses({
      ...base,
      name: `Случай / ${String(seed).padStart(2, "0")}`,
    });
    const rows = blockRows(draft);
    const cols = blockCols(draft);
    return {
      ...draft,
      courses: Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => palette[Math.floor(rand() * palette.length)].id),
      ),
    };
  }
  const stickCount = 4 + Math.floor(rand() * 5);
  const widths = [20, 25, 30, 40];
  const sticks: Stick[] = Array.from({ length: stickCount }, () => ({
    speciesId: palette[Math.floor(rand() * palette.length)].id,
    width: widths[Math.floor(rand() * widths.length)],
  }));
  const width = sticks.reduce((sum, s) => sum + s.width, 0);
  const count = stripsToCover(base.board.length, base.motifWidth);
  return {
    ...base,
    name: `Случай / ${String(seed).padStart(2, "0")}`,
    board: { ...base.board, width },
    sticks,
    strips: Array.from({ length: count }, () => ({
      flip: rand() > 0.55,
      offset: rand() > 0.7 ? (sticks[0]?.width ?? 0) : 0,
    })),
  };
}
