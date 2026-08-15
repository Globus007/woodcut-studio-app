import { blockCols, blockRows, syncCourses } from "./blocks";
import type { Project, Species } from "./types";

export type PixelBuffer = {
  width: number;
  height: number;
  data: ArrayLike<number>;
};

function hexRgb(color: string): [number, number, number] {
  const hex = color.replace("#", "");
  if (hex.length < 6) return [136, 136, 136];
  return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
}

export function nearestSpecies(species: Species[], r: number, g: number, b: number): string {
  if (species.length === 0) return "walnut";
  let best = species[0].id;
  let bestDist = Infinity;
  for (const item of species) {
    const [sr, sg, sb] = hexRgb(item.color);
    const dist = (r - sr) ** 2 + (g - sg) ** 2 + (b - sb) ** 2;
    if (dist < bestDist) {
      bestDist = dist;
      best = item.id;
    }
  }
  return best;
}

function pixelAt(buffer: PixelBuffer, x: number, y: number): [number, number, number] {
  const px = Math.min(buffer.width - 1, Math.max(0, Math.floor(x)));
  const py = Math.min(buffer.height - 1, Math.max(0, Math.floor(y)));
  const i = (py * buffer.width + px) * 4;
  return [buffer.data[i] ?? 0, buffer.data[i + 1] ?? 0, buffer.data[i + 2] ?? 0];
}

export function imageToCourses(project: Project, buffer: PixelBuffer): Project {
  const next = syncCourses({ ...project, shopPath: "block" });
  const rows = blockRows(next);
  const cols = blockCols(next);
  if (rows === 0 || cols === 0 || buffer.width < 1 || buffer.height < 1) return next;
  const courses = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => {
      const [red, green, blue] = pixelAt(buffer, ((c + 0.5) / cols) * buffer.width, ((r + 0.5) / rows) * buffer.height);
      return nearestSpecies(next.species, red, green, blue);
    }),
  );
  return { ...next, courses };
}
