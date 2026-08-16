import { blockCols, blockRows, syncCourses } from "./blocks";
import { SPECIES, STANDARD_WIDTHS } from "./defaults";
import { stripsToCover } from "./derive";
import { isTemplateId, stripOps, TEMPLATES, type TemplateId } from "./templates";
import type { Project, Stick } from "./types";

export const BLOCK_GEN_FAMILIES = [
  { id: "swirl", name: "Вихрь" },
  { id: "rings", name: "Кольца" },
  { id: "waves", name: "Волны" },
  { id: "nested", name: "Рамки" },
  { id: "terrazzo", name: "Терраццо" },
  { id: "chevron", name: "Шевроны" },
  { id: "noise", name: "Органика" },
] as const;

export type BlockGenFamily = (typeof BLOCK_GEN_FAMILIES)[number]["id"];

export type GenerateOpts = {
  family?: TemplateId | BlockGenFamily;
  scale?: number;
};

type Rng = () => number;
type SetCell = (row: number, col: number, speciesIndex: number) => void;

export function isBlockGenFamily(id: string): id is BlockGenFamily {
  return BLOCK_GEN_FAMILIES.some((family) => family.id === id);
}

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function pmod(value: number, modulo: number): number {
  if (modulo <= 0) return 0;
  return ((value % modulo) + modulo) % modulo;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function clampScale(scale?: number): number {
  if (scale == null || !Number.isFinite(scale)) return 2;
  return clamp(Math.round(scale), 1, 4);
}

function padded(seed: number): string {
  return String(seed).padStart(2, "0");
}

function paletteIds(project: Project): string[] {
  const ids = project.species.map((item) => item.id);
  return ids.length ? ids : SPECIES.map((item) => item.id);
}

function pickWidth(rand: Rng): number {
  return STANDARD_WIDTHS[Math.floor(rand() * STANDARD_WIDTHS.length)] ?? 20;
}

function fillToWidth(target: number, at: (index: number) => Stick): Stick[] {
  const sticks: Stick[] = [];
  let sum = 0;
  let index = 0;
  const goal = Math.max(target, 1);
  while (sum < goal && index < 64) {
    const stick = at(index);
    sticks.push(stick);
    sum += stick.width;
    index += 1;
  }
  if (sticks.length === 0) sticks.push(at(0));
  return sticks;
}

function familyName(family: TemplateId | BlockGenFamily): string {
  const block = BLOCK_GEN_FAMILIES.find((item) => item.id === family);
  if (block) return block.name;
  return TEMPLATES.find((item) => item.id === family)?.name ?? "Узор";
}

const FIELDS: Record<BlockGenFamily, (set: SetCell, cols: number, rows: number, k: number, rnd: Rng, count: number) => void> =
  {
    swirl(set, cols, rows, k, rnd, count) {
      const cx = (cols - 1) / 2;
      const cy = (rows - 1) / 2;
      const tw = 1 + rnd() * 2;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const a = Math.atan2(r - cy, c - cx);
          const d = Math.hypot(c - cx, r - cy);
          set(r, c, Math.floor((a / Math.PI) * (count / 2) + (d / k) * tw));
        }
      }
    },
    rings(set, cols, rows, k) {
      const cx = (cols - 1) / 2;
      const cy = (rows - 1) / 2;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          set(r, c, Math.floor(Math.hypot(c - cx, r - cy) / k));
        }
      }
    },
    waves(set, cols, rows, k, rnd) {
      const ph = rnd() * 6.28;
      const amp = k * (1 + rnd() * 1.4);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          set(r, c, Math.floor((r + Math.sin(c * 0.55 + ph) * amp) / k));
        }
      }
    },
    nested(set, cols, rows, k) {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const d = Math.min(c, r, cols - 1 - c, rows - 1 - r);
          set(r, c, Math.floor(d / k));
        }
      }
    },
    terrazzo(set, cols, rows, k, rnd, count) {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) set(r, c, 0);
      }
      const blobs = 14 + Math.floor((rnd() * (cols * rows)) / 7);
      for (let i = 0; i < blobs; i++) {
        const bx = rnd() * cols;
        const by = rnd() * rows;
        const rad = k * (0.8 + rnd() * 2.4);
        const si = Math.floor(rnd() * count);
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            if (Math.hypot(c - bx, r - by) <= rad) set(r, c, si);
          }
        }
      }
    },
    chevron(set, cols, rows, k) {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const t = Math.abs(pmod(c, 2 * k) - k);
          set(r, c, Math.floor((r + t) / k));
        }
      }
    },
    noise(set, cols, rows, k, rnd, count) {
      const gs = Math.ceil(Math.max(cols, rows) / k) + 3;
      const lat: number[] = [];
      for (let i = 0; i < gs * gs; i++) lat.push(rnd());
      const sample = (x: number, y: number) => {
        const x0 = Math.floor(x);
        const y0 = Math.floor(y);
        const fx = x - x0;
        const fy = y - y0;
        const sx = fx * fx * (3 - 2 * fx);
        const sy = fy * fy * (3 - 2 * fy);
        const g = (a: number, b: number) => lat[clamp(b, 0, gs - 1) * gs + clamp(a, 0, gs - 1)] ?? 0;
        return (
          g(x0, y0) * (1 - sx) * (1 - sy) +
          g(x0 + 1, y0) * sx * (1 - sy) +
          g(x0, y0 + 1) * (1 - sx) * sy +
          g(x0 + 1, y0 + 1) * sx * sy
        );
      };
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const t = sample(c / k, r / k);
          set(r, c, clamp(Math.floor(t * count * 1.35 - count * 0.18), 0, count - 1));
        }
      }
    },
  };

function paintBlockField(base: Project, seed: number, family: BlockGenFamily, scale: number): Project {
  const draft = syncCourses({
    ...base,
    name: `${familyName(family)} / ${padded(seed)}`,
  });
  const rows = blockRows(draft);
  const cols = blockCols(draft);
  const ids = paletteIds(draft);
  const count = Math.max(1, ids.length);
  const rnd = mulberry32(seed * 7919 + 13);
  const courses = Array.from({ length: rows }, () => Array.from({ length: cols }, () => ids[0] ?? "walnut"));
  const set: SetCell = (row, col, speciesIndex) => {
    if (row < 0 || col < 0 || row >= rows || col >= cols) return;
    courses[row][col] = ids[pmod(speciesIndex, count)] ?? ids[0] ?? "walnut";
  };
  FIELDS[family](set, cols, rows, scale, rnd, count);
  return { ...draft, courses };
}

function pickStripFamily(rand: Rng, requested?: TemplateId | BlockGenFamily): TemplateId {
  if (requested && isTemplateId(requested)) return requested;
  const ids = TEMPLATES.map((item) => item.id);
  return ids[Math.floor(rand() * ids.length)] ?? "stripes";
}

function twoSpecies(ids: string[], rand: Rng): [string, string] {
  const a = ids[Math.floor(rand() * ids.length)] ?? "walnut";
  const rest = ids.filter((id) => id !== a);
  const b = rest[Math.floor(rand() * rest.length)] ?? ids[1] ?? a;
  return [a, b];
}

function sunsetOrder(project: Project): string[] {
  const order = ["padauk", "cherry", "walnut", "maple", "ash"]
    .map((id) => project.species.find((item) => item.id === id)?.id)
    .filter((id): id is string => Boolean(id));
  return order.length ? order : paletteIds(project);
}

function stripSticks(project: Project, family: TemplateId, rand: Rng): Stick[] {
  const ids = paletteIds(project);
  const target = Math.max(project.board.width, 1);
  const [a, b] = twoSpecies(ids, rand);
  const c = ids.find((id) => id !== a && id !== b) ?? b;

  if (family === "butcher") {
    return fillToWidth(target, (index) => ({
      speciesId: index % 2 === 0 ? (Math.floor(index / 2) % 2 === 0 ? a : c) : b,
      width: index % 2 === 0 ? 40 : 20,
    }));
  }

  if (family === "accent") {
    const field = a;
    const vein = b;
    const fieldWidths = STANDARD_WIDTHS.filter((width) => width !== 15);
    const fieldWidth = fieldWidths[Math.floor(rand() * fieldWidths.length)] ?? 20;
    const fieldSticks = fillToWidth(target, () => ({ speciesId: field, width: fieldWidth }));
    const veinAt = Math.min(fieldSticks.length - 1, Math.floor(rand() * fieldSticks.length));
    const withVein = fieldSticks.map((stick, index) =>
      index === veinAt ? { speciesId: vein, width: 15 } : stick,
    );
    const sum = withVein.reduce((total, stick) => total + stick.width, 0);
    if (sum >= target) return withVein;
    return [...withVein, { speciesId: field, width: fieldWidth }];
  }

  if (family === "sunset") {
    const order = sunsetOrder(project);
    const width = pickWidth(rand);
    const approx = Math.max(1, Math.ceil(target / width));
    return fillToWidth(target, (index) => ({
      speciesId: order[Math.min(order.length - 1, Math.floor((index / approx) * order.length))] ?? a,
      width,
    }));
  }

  if (family === "herring" || family === "weave") {
    return fillToWidth(target, (index) => ({
      speciesId: Math.floor(index / 2) % 2 === 0 ? a : b,
      width: pickWidth(rand),
    }));
  }

  return fillToWidth(target, (index) => ({
    speciesId: index % 2 === 0 ? a : b,
    width: pickWidth(rand),
  }));
}

function generateStrip(base: Project, seed: number, requested?: TemplateId | BlockGenFamily): Project {
  const rand = mulberry32(seed);
  const family = pickStripFamily(rand, requested);
  const sticks = stripSticks(base, family, rand);
  const width = sticks.reduce((sum, stick) => sum + stick.width, 0);
  const count = stripsToCover(base.board.length, base.motifWidth);
  const unit = sticks[0]?.width ?? 20;
  return {
    ...base,
    name: `${familyName(family)} / ${padded(seed)}`,
    board: { ...base.board, width },
    sticks,
    strips: stripOps(family, count, unit),
  };
}

export function generateSequence(base: Project, seed: number, opts: GenerateOpts = {}): Project {
  if (base.shopPath === "block") {
    const family = opts.family && isBlockGenFamily(opts.family) ? opts.family : "swirl";
    return paintBlockField(base, seed, family, clampScale(opts.scale));
  }
  return generateStrip(base, seed, opts.family);
}
