import type { Project, Species } from "./types";

export const STORAGE_KEY = "woodcut-project-v1";

export const SPECIES: Species[] = [
  { id: "walnut", name: "Орех", code: "ORE", color: "#6f4735" },
  { id: "maple", name: "Клён", code: "KLE", color: "#e4c48f" },
  { id: "cherry", name: "Вишня", code: "VIS", color: "#a75845" },
  { id: "ash", name: "Ясень", code: "YAS", color: "#c9c2ad" },
  { id: "padauk", name: "Падук", code: "PAD", color: "#c85530" },
];

export const DEFAULT_KERF = 3.2;
export const DEFAULT_SURFACING = 2;
export const DEFAULT_EXTRA_LENGTH = 20;
export const DEFAULT_SQUARE_UP = 10;

export function emptyProject(name = "Полосы"): Project {
  return {
    version: 1,
    name,
    board: { length: 400, width: 280, thickness: 40 },
    kerf: DEFAULT_KERF,
    surfacing: DEFAULT_SURFACING,
    extraLength: DEFAULT_EXTRA_LENGTH,
    squareUp: DEFAULT_SQUARE_UP,
    species: SPECIES.map((s) => ({ ...s })),
    sticks: [],
    strips: [],
  };
}
