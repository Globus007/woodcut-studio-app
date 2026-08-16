import type { PointerEvent } from "react";
import { blockCols, blockRows, faceRow, speciesColor, syncCourses } from "@/domain";
import type { Project } from "@/domain";

function cellAt(project: Project, clientX: number, clientY: number, el: HTMLElement): { row: number; col: number } | null {
  const rect = el.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return null;
  const x = ((clientX - rect.left) / rect.width) * project.board.width;
  const y = ((clientY - rect.top) / rect.height) * project.board.length;
  const col = Math.floor(x / project.blockSize);
  const row = Math.floor(y / project.blockSize);
  if (row < 0 || col < 0 || row >= blockRows(project) || col >= blockCols(project)) return null;
  return { row, col };
}

export function FacePreview({
  project,
  className,
  onPaint,
}: {
  project: Project;
  className?: string;
  onPaint?: (row: number, col: number) => void;
}) {
  const painting = Boolean(onPaint) && project.shopPath === "block";

  const handle = (event: PointerEvent<HTMLDivElement>) => {
    if (!onPaint || !painting) return;
    if (event.buttons !== 1 && event.type !== "pointerdown") return;
    const at = cellAt(project, event.clientX, event.clientY, event.currentTarget);
    if (at) onPaint(at.row, at.col);
  };

  if (project.shopPath === "block") {
    const synced = syncCourses(project);
    const size = synced.blockSize;
    const w = Math.max(1, synced.board.width);
    const h = Math.max(1, synced.board.length);
    return (
      <div
        className={`${className ?? ""}${painting ? " face-paint" : ""}`}
        style={{ position: "relative", width: "100%", height: "100%", background: "#171311" }}
        onPointerDown={handle}
        onPointerMove={handle}
      >
        {synced.courses.map((course, r) =>
          course.map((speciesId, c) => (
            <span
              key={`${r}-${c}`}
              style={{
                position: "absolute",
                left: `${(c * size / w) * 100}%`,
                top: `${(r * size / h) * 100}%`,
                width: `${(size / w) * 100}%`,
                height: `${(size / h) * 100}%`,
                background: speciesColor(synced, speciesId),
                boxShadow: "inset 0 0 0 1px rgba(0,0,0,.18)",
              }}
            />
          )),
        )}
      </div>
    );
  }

  const length = Math.max(1, project.board.length);
  const width = Math.max(1, project.board.width);
  const motif = project.motifWidth;
  return (
    <div
      className={className}
      style={{ position: "relative", width: "100%", height: "100%", background: "#171311" }}
    >
      {project.strips.flatMap((_, index) => {
        const y = index * motif;
        if (y >= length) return [];
        const height = Math.min(motif, length - y);
        const cells = faceRow(project, index);
        let x = 0;
        const rects = [];
        for (let c = 0; c < cells.length && x < width; c += 1) {
          const cell = cells[c];
          const cellW = Math.min(cell.width, width - x);
          rects.push(
            <span
              key={`${index}-${c}`}
              style={{
                position: "absolute",
                left: `${(x / width) * 100}%`,
                top: `${(y / length) * 100}%`,
                width: `${(cellW / width) * 100}%`,
                height: `${(height / length) * 100}%`,
                background: speciesColor(project, cell.speciesId),
                boxShadow: "inset 0 0 0 1px rgba(0,0,0,.18)",
              }}
            />,
          );
          x += cellW;
        }
        return rects;
      })}
    </div>
  );
}
