import { SPECIES } from "./defaults";
import { stripCount, syncStrips } from "./derive";
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
  const stickCount = 4 + Math.floor(rand() * 5);
  const sticks: Stick[] = Array.from({ length: stickCount }, () => ({
    speciesId: palette[Math.floor(rand() * palette.length)].id,
    width: 20 + Math.round(rand() * 25),
  }));
  const width = sticks.reduce((sum, s) => sum + s.width, 0);
  const draft: Project = {
    ...base,
    name: `Случай / ${String(seed).padStart(2, "0")}`,
    board: { ...base.board, width },
    sticks,
    strips: [],
  };
  const synced = syncStrips(draft);
  const n = stripCount(synced);
  return {
    ...synced,
    strips: Array.from({ length: n }, () => ({
      flip: rand() > 0.55,
      offset: rand() > 0.7 ? Math.round(sticks[0].width / 2) : 0,
    })),
  };
}
