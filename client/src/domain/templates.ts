import { emptyProject } from "./defaults";
import { stripCount, syncStrips } from "./derive";
import type { Project } from "./types";

export type TemplateId = "stripes" | "checker" | "brick";

export type Template = {
  id: TemplateId;
  name: string;
  description: string;
};

export const TEMPLATES: Template[] = [
  { id: "stripes", name: "Полосы", description: "слои вдоль доски" },
  { id: "checker", name: "Шахматы", description: "переворот через одну" },
  { id: "brick", name: "Кирпич", description: "сдвиг на полпериода" },
];

function stripedSticks(project: Project): Project {
  const a = project.species[0]?.id ?? "walnut";
  const b = project.species[1]?.id ?? "maple";
  const width = 35;
  const count = 8;
  const sticks = Array.from({ length: count }, (_, i) => ({
    speciesId: i % 2 === 0 ? a : b,
    width,
  }));
  return {
    ...project,
    board: { ...project.board, width: count * width },
    sticks,
  };
}

export function applyTemplate(id: TemplateId, base?: Project): Project {
  const named = emptyProject(TEMPLATES.find((t) => t.id === id)?.name ?? id);
  const seeded = stripedSticks(base ? { ...named, species: base.species } : named);
  const withCount = syncStrips(seeded);
  const n = stripCount(withCount);
  const half = seeded.sticks[0]?.width ?? 0;

  if (id === "checker") {
    return {
      ...withCount,
      name: "Шахматы",
      strips: Array.from({ length: n }, (_, i) => ({ flip: i % 2 === 1, offset: 0 })),
    };
  }
  if (id === "brick") {
    return {
      ...withCount,
      name: "Кирпич",
      strips: Array.from({ length: n }, (_, i) => ({ flip: false, offset: i % 2 === 1 ? half : 0 })),
    };
  }
  return { ...withCount, name: "Полосы", strips: Array.from({ length: n }, () => ({ flip: false, offset: 0 })) };
}
