import { faceGrid, speciesColor, syncStrips } from "@/domain";
import type { Project } from "@/domain";

export function FacePreview({ project, className }: { project: Project; className?: string }) {
  const synced = syncStrips(project);
  const rows = faceGrid(synced);
  const maxWidth = Math.max(1, synced.sticks.reduce((s, st) => s + st.width, 0));
  return (
    <div className={className} style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
      {rows.map((row, y) => {
        const offset = synced.strips[y]?.offset ?? 0;
        return (
          <div
            key={y}
            style={{
              display: "flex",
              flex: 1,
              minHeight: 0,
              transform: offset ? `translateX(${(offset / maxWidth) * 100}%)` : undefined,
            }}
          >
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
        );
      })}
    </div>
  );
}
