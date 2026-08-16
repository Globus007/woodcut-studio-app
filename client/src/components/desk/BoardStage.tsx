import { useMemo, useRef, useState, type PointerEvent } from "react";
import type { JSX } from "react";
import { FacePreview } from "@/components/desk/FacePreview";
import { derive, faceRow, formatLength, speciesColor } from "@/domain";
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
  onPaint?: (row: number, col: number) => void;
}): JSX.Element {
  const { project, view3d, unit, rotation, onRotation, onResetCamera, onPaint } = props;
  const drag = useRef<{ px: number; py: number; x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  const length = Math.max(0, project.board.length);
  const width = Math.max(0, project.board.width);
  const thickness = Math.max(0, project.board.thickness);
  const px = FACE_MAX_PX / Math.max(length, width, 1);
  const faceW = Math.max(96, width * px);
  const faceH = Math.max(96, length * px);
  const thick = Math.max(24, thickness * px);

  const derived = useMemo(() => derive(project), [project]);

  const edges = useMemo(() => {
    const hole = "#171311";
    const colorOf = (speciesId: string | undefined) =>
      speciesId ? speciesColor(project, speciesId) : hole;
    if (project.shopPath === "block") {
      const size = project.blockSize;
      const courses = project.courses;
      const west = courses.map((course, i) => ({
        key: `w-${i}`,
        flex: size,
        color: colorOf(course[0]),
      }));
      const east = courses.map((course, i) => ({
        key: `e-${i}`,
        flex: size,
        color: colorOf(course[course.length - 1]),
      }));
      if (derived.remainderY > 0) {
        west.push({ key: "w-hole", flex: derived.remainderY, color: hole });
        east.push({ key: "e-hole", flex: derived.remainderY, color: hole });
      }
      const first = courses[0] ?? [];
      const last = courses[courses.length - 1] ?? [];
      const north = first.map((id, i) => ({ key: `n-${i}`, flex: size, color: colorOf(id) }));
      const south =
        derived.remainderY > 0
          ? [{ key: "s-hole", flex: 1, color: hole }]
          : last.map((id, i) => ({ key: `s-${i}`, flex: size, color: colorOf(id) }));
      if (derived.remainderX > 0 && derived.remainderY === 0) {
        north.push({ key: "n-hole", flex: derived.remainderX, color: hole });
        south.push({ key: "s-hole-x", flex: derived.remainderX, color: hole });
      }
      return { west, east, north, south };
    }

    const motif = project.motifWidth;
    const length = project.board.length;
    const width = project.board.width;
    const west: { key: string; flex: number; color: string }[] = [];
    const east: { key: string; flex: number; color: string }[] = [];
    let lastVisible = -1;
    for (let i = 0; i < project.strips.length; i += 1) {
      const y = i * motif;
      if (y >= length) break;
      const h = Math.min(motif, length - y);
      const row = faceRow(project, i);
      west.push({ key: `w-${i}`, flex: h, color: colorOf(row[0]?.speciesId) });
      east.push({ key: `e-${i}`, flex: h, color: colorOf(row[row.length - 1]?.speciesId) });
      lastVisible = i;
    }
    if (derived.lengthShortfall > 0) {
      west.push({ key: "w-hole", flex: derived.lengthShortfall, color: hole });
      east.push({ key: "e-hole", flex: derived.lengthShortfall, color: hole });
    }
    const clipRow = (row: ReturnType<typeof faceRow>, prefix: string) => {
      const items: { key: string; flex: number; color: string }[] = [];
      let x = 0;
      for (let c = 0; c < row.length && x < width; c += 1) {
        const take = Math.min(row[c].width, width - x);
        items.push({ key: `${prefix}-${c}`, flex: take, color: colorOf(row[c].speciesId) });
        x += take;
      }
      if (derived.widthShortfall > 0) {
        items.push({ key: `${prefix}-hole`, flex: derived.widthShortfall, color: hole });
      }
      return items;
    };
    const north = clipRow(faceRow(project, 0), "n");
    const south =
      derived.lengthShortfall > 0
        ? [{ key: "s-hole", flex: 1, color: hole }]
        : clipRow(faceRow(project, Math.max(0, lastVisible)), "s");
    return { west, east, north, south };
  }, [project, derived]);

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
            <FacePreview project={project} onPaint={view3d ? undefined : onPaint} />
          </div>
        )}
      </div>

      {!view3d && (
        <>
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
        </>
      )}
      {project.shopPath === "strip" &&
        (derived.widthShortfall > 0 ||
          derived.widthTrim > 0 ||
          derived.lengthShortfall > 0 ||
          derived.lengthTrim > 0) && (
          <div className="face-fit">
            {derived.widthShortfall > 0 && (
              <span className="fit-tag shortfall">недобор ширины {formatLength(derived.widthShortfall, unit)}</span>
            )}
            {derived.widthTrim > 0 && (
              <span className="fit-tag trim">обрезь ширины {formatLength(derived.widthTrim, unit)}</span>
            )}
            {derived.lengthShortfall > 0 && (
              <span className="fit-tag shortfall">недобор длины {formatLength(derived.lengthShortfall, unit)}</span>
            )}
            {derived.lengthTrim > 0 && (
              <span className="fit-tag trim">обрезь длины {formatLength(derived.lengthTrim, unit)}</span>
            )}
          </div>
        )}

      {!view3d && (
        <div className="origin">
          {lengthLabel} × {widthLabel}
        </div>
      )}

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
