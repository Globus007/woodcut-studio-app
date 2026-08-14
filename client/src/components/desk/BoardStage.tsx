import { useMemo, useRef, useState, type PointerEvent } from "react";
import type { JSX } from "react";
import { FacePreview } from "@/components/desk/FacePreview";
import { faceGrid, formatLength, speciesColor, syncStrips } from "@/domain";
import type { Project, Unit } from "@/domain";

const PITCH_MIN = 10;
const PITCH_MAX = 70;
const FACE_MAX_PX = 380;

function clampPitch(value: number): number {
  return Math.min(PITCH_MAX, Math.max(PITCH_MIN, value));
}

function rulerMarks(total: number): number[] {
  if (!(total > 0)) return [0];
  const raw = total / 4;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const n = raw / pow;
  const step = (n >= 5 ? 5 : n >= 2 ? 2 : 1) * pow;
  const marks = [0];
  for (let value = step; value < total - step * 0.2; value += step) {
    marks.push(Math.round(value * 10) / 10);
  }
  marks.push(total);
  return marks;
}

function ColorBands(props: {
  items: { key: string; flex: number; color: string }[];
  axis: "x" | "y";
}) {
  return (
    <div className={`desk-bands${props.axis === "y" ? " desk-bands-y" : ""}`}>
      {props.items.map((item) => (
        <span key={item.key} className="desk-band" style={{ flex: item.flex, background: item.color }} />
      ))}
    </div>
  );
}

export function BoardStage(props: {
  project: Project;
  view3d: boolean;
  unit: Unit;
  rotation: { x: number; y: number };
  onRotation: (next: { x: number; y: number }) => void;
  onResetCamera: () => void;
}): JSX.Element {
  const { project, view3d, unit, rotation, onRotation, onResetCamera } = props;
  const drag = useRef<{ px: number; py: number; x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  const length = Math.max(0, project.board.length);
  const width = Math.max(0, project.board.width);
  const thickness = Math.max(0, project.board.thickness);
  const px = FACE_MAX_PX / Math.max(length, width, 1);
  const faceW = Math.max(96, width * px);
  const faceH = Math.max(96, length * px);
  const thick = Math.max(24, thickness * px);

  const edges = useMemo(() => {
    const synced = syncStrips(project);
    const grid = faceGrid(synced);
    const colorOf = (speciesId: string | undefined) => speciesColor(synced, speciesId ?? "");
    return {
      west: grid.map((row, i) => ({
        key: `w-${i}`,
        flex: 1,
        color: colorOf(row[0]?.speciesId),
      })),
      east: grid.map((row, i) => ({
        key: `e-${i}`,
        flex: 1,
        color: colorOf(row[row.length - 1]?.speciesId),
      })),
      north: (grid[0] ?? []).map((cell, i) => ({
        key: `n-${i}`,
        flex: Math.max(cell.width, 1),
        color: colorOf(cell.speciesId),
      })),
      south: (grid[grid.length - 1] ?? []).map((cell, i) => ({
        key: `s-${i}`,
        flex: Math.max(cell.width, 1),
        color: colorOf(cell.speciesId),
      })),
    };
  }, [project]);

  const endDrag = (event?: PointerEvent<HTMLDivElement>) => {
    if (event && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    drag.current = null;
    setDragging(false);
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!view3d || event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { px: event.clientX, py: event.clientY, x: rotation.x, y: rotation.y };
    setDragging(true);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current || !view3d) return;
    const dx = event.clientX - drag.current.px;
    const dy = event.clientY - drag.current.py;
    onRotation({
      x: clampPitch(drag.current.x - dy * 0.28),
      y: drag.current.y + dx * 0.35,
    });
  };

  const lengthLabel = formatLength(length, unit);
  const widthLabel = formatLength(width, unit);
  const thickLabel = formatLength(thickness, unit);

  return (
    <div
      className={`board-stage${view3d ? " stage-3d" : ""}${dragging ? " is-dragging" : ""}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={(event) => {
        if (drag.current && !event.currentTarget.hasPointerCapture(event.pointerId)) endDrag();
      }}
      onDoubleClick={() => {
        if (view3d) onResetCamera();
      }}
    >
      {!view3d && (
        <>
          <div className="ruler ruler-top">
            {rulerMarks(width).map((mark) => (
              <span key={`tw-${mark}`}>{formatLength(mark, unit)}</span>
            ))}
          </div>
          <div className="ruler ruler-left">
            {rulerMarks(length).map((mark) => (
              <span key={`lh-${mark}`}>{formatLength(mark, unit)}</span>
            ))}
          </div>
        </>
      )}

      <div
        className={`board-shadow${view3d ? " desk-board" : ""}`}
        style={{
          width: faceW,
          height: faceH,
          ["--desk-w" as string]: `${faceW}px`,
          ["--desk-l" as string]: `${faceH}px`,
          ["--desk-t" as string]: `${thick}px`,
          transform: view3d ? `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` : undefined,
        }}
      >
        {view3d ? (
          <>
            <div className="desk-face desk-face-top">
              <FacePreview project={project} />
            </div>
            <div className="desk-face desk-face-bottom" />
            <div className="desk-face desk-face-north">
              <ColorBands items={edges.north} axis="x" />
            </div>
            <div className="desk-face desk-face-south">
              <ColorBands items={edges.south} axis="x" />
            </div>
            <div className="desk-face desk-face-west">
              <ColorBands items={edges.west} axis="y" />
            </div>
            <div className="desk-face desk-face-east">
              <ColorBands items={edges.east} axis="y" />
            </div>
          </>
        ) : (
          <div className="desk-face-2d">
            <FacePreview project={project} />
          </div>
        )}
      </div>

      <div className="dimension dimension-width">
        <span />
        <b>{widthLabel}</b>
        <span />
      </div>
      <div className="dimension dimension-height">
        <span />
        <b>{lengthLabel}</b>
        <span />
      </div>
      {view3d && (
        <div className="dimension dimension-thick">
          <b>T {thickLabel}</b>
        </div>
      )}
      <div className="origin">
        {lengthLabel} × {widthLabel}
        {view3d ? ` × ${thickLabel}` : ""}
      </div>

      {view3d && (
        <button
          type="button"
          className="desk-reset"
          onClick={(event) => {
            event.stopPropagation();
            onResetCamera();
          }}
          onPointerDown={(event) => event.stopPropagation()}
        >
          СБРОС
        </button>
      )}
    </div>
  );
}
