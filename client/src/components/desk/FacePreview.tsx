import type { PointerEvent } from "react";
import { blockCols, blockRows, faceGrid, speciesColor, syncCourses, syncStrips } from "@/domain";
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

  const synced = syncStrips(project);
  const rows = faceGrid(synced);
  return (
    <div className={className} style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
      {rows.map((row, y) => (
        <div key={y} style={{ display: "flex", flex: 1, minHeight: 0 }}>
          {row.map((cell, x) => (
            <span
              key={`${y}-${x}`}
              style={{
                flex: cell.width,
                background: speciesColor(synced, cell.speciesId),
                boxShadow: "inset 0 0 0 1px rgba(0,0,0,.18)",
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
