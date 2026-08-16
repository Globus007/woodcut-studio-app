import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import {
  AlertTriangle,
  Check,
  Download,
  FolderOpen,
  ImageDown,
  ImagePlus,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minus,
  Plus,
  Save,
  ScrollText,
  WandSparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  applyTemplate,
  generateSequence,
  derive,
  evaluateChecks,
  hasRefuse,
  loadProject,
  loadUnit,
  saveProject,
  saveUnit,
  downloadProject,
  parseProject,
  STORAGE_KEY,
  UNIT_KEY,
  formatLength,
  fromDisplay,
  toDisplay,
  addStrip,
  removeStrip,
  moveStrip,
  syncCourses,
  TEMPLATES,
  faceRow,
  speciesColor,
  setShopPath,
  paintBlock,
  imageToCourses,
  DEFAULT_MOTIF_WIDTH,
  DEFAULT_STICK_WIDTH,
  STANDARD_WIDTHS,
  type Project,
  type ShopPath,
  type TemplateId,
  type Unit,
} from "@/domain";
import { BoardStage } from "@/components/desk/BoardStage";
import { FacePreview } from "@/components/desk/FacePreview";

const DEFAULT_ROTATION = { x: 18, y: -22 };
const HINT_KERF = 3.2;
const HINT_SURFACING = 2;
const HINT_EXTRA = 20;
const HINT_SQUARE = 10;

function readMm(raw: string, unit: Unit): number | null {
  if (raw.trim() === "") return 0;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  return fromDisplay(n, unit);
}

function exportFaceSvg(project: Project) {
  const w = Math.max(1, project.board.width);
  const h = Math.max(1, project.board.length);
  const rects: string[] = [];
  if (project.shopPath === "block") {
    const size = project.blockSize;
    project.courses.forEach((course, r) => {
      course.forEach((speciesId, c) => {
        rects.push(
          `<rect x="${c * size}" y="${r * size}" width="${size}" height="${size}" fill="${speciesColor(project, speciesId)}"/>`,
        );
      });
    });
  } else {
    const motif = project.motifWidth;
    project.strips.forEach((_, index) => {
      const y = index * motif;
      if (y >= h) return;
      const rowH = Math.min(motif, h - y);
      const cells = faceRow(project, index);
      let x = 0;
      for (const cell of cells) {
        if (x >= w) break;
        const cw = Math.min(cell.width, w - x);
        rects.push(
          `<rect x="${x}" y="${y}" width="${cw}" height="${rowH}" fill="${speciesColor(project, cell.speciesId)}"/>`,
        );
        x += cw;
      }
    });
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${rects.join("")}</svg>`;
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${project.name.replace(/\s+/g, "-").toLowerCase()}-face.svg`;
  a.click();
  URL.revokeObjectURL(url);
}

function UnitField({
  valueMm,
  unit,
  onMm,
  step,
}: {
  valueMm: number;
  unit: Unit;
  onMm: (mm: number) => void;
  step?: number;
}) {
  return (
    <Input
      type="number"
      step={step ?? (unit === "in" ? 0.05 : 1)}
      value={toDisplay(valueMm, unit)}
      onChange={(e) => {
        const mm = readMm(e.target.value, unit);
        if (mm !== null) onMm(mm);
      }}
    />
  );
}

async function pixelsFromFile(file: File): Promise<{ width: number; height: number; data: Uint8ClampedArray } | null> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(bitmap, 0, 0);
  const image = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
  bitmap.close();
  return image;
}

export default function Home() {
  const [, setLocation] = useLocation();
  const fileRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const [project, setProject] = useState<Project>(
    () => loadProject(localStorage, STORAGE_KEY) ?? applyTemplate("stripes"),
  );
  const [unit, setUnit] = useState<Unit>(() => loadUnit(localStorage, UNIT_KEY));
  const [seed, setSeed] = useState(1);
  const [saved, setSaved] = useState(false);
  const [view3d, setView3d] = useState(false);
  const [rotation, setRotation] = useState(DEFAULT_ROTATION);
  const [templateId, setTemplateId] = useState<TemplateId | null>("stripes");
  const [brushId, setBrushId] = useState("walnut");

  const derived = useMemo(() => derive(project), [project]);
  const checks = useMemo(() => evaluateChecks(project), [project]);
  const refuse = hasRefuse(checks);
  const refuses = checks.filter((c) => c.level === "refuse");
  const warns = checks.filter((c) => c.level === "warn");
  const unitShort = unit === "in" ? "″" : "мм";

  const align = (next: Project) => (next.shopPath === "block" ? syncCourses(next) : next);

  const commit = (next: Project, sync = false) => {
    setProject(sync ? align(next) : next);
    setSaved(false);
  };

  const patchSticksBoard = (updater: (p: Project) => Project) => {
    setTemplateId(null);
    setProject((p) => align(updater(p)));
    setSaved(false);
  };

  const save = () => {
    saveProject(localStorage, STORAGE_KEY, project);
    setSaved(true);
    toast.success("Проект сохранён");
  };

  const downloadJson = () => {
    downloadProject(project);
    toast.success("JSON скачан");
  };

  const openFile = async (file?: File) => {
    if (!file) return;
    const parsed = parseProject(await file.text());
    if (!parsed) {
      toast.error("Не удалось открыть файл");
      return;
    }
    setProject(parsed);
    setTemplateId(null);
    setSaved(false);
    toast.success("Проект открыт");
  };

  const generate = () => {
    const nextSeed = seed + 1;
    setSeed(nextSeed);
    setTemplateId(null);
    commit(generateSequence(project, nextSeed));
    toast.success("Узор собран", { description: `Зерно ${nextSeed}` });
  };

  const applyQuick = (id: TemplateId) => {
    setTemplateId(id);
    commit(applyTemplate(id, project));
    toast.success(`Шаблон «${TEMPLATES.find((t) => t.id === id)?.name ?? id}» применён`);
  };

  const changePath = (path: ShopPath) => {
    const next = setShopPath(project, path);
    if (!next) {
      toast.error("Из шашек обратно в палки нельзя — сетка уже не один щит.");
      return;
    }
    setTemplateId(null);
    commit(next);
    toast.success(path === "block" ? "Цех шашек: лицо запечено в сетку" : "Цех палок");
  };

  const paint = (row: number, col: number) => {
    setTemplateId(null);
    setProject((p) => paintBlock(p, row, col, brushId));
    setSaved(false);
  };

  const importPhoto = async (file?: File) => {
    if (!file) return;
    try {
      const pixels = await pixelsFromFile(file);
      if (!pixels) {
        toast.error("Не удалось прочитать снимок");
        return;
      }
      if (project.shopPath !== "block") {
        toast.error("Фото только на шашки — путь сам не переключается.");
        return;
      }
      setTemplateId(null);
      commit(imageToCourses(project, pixels));
      toast.success("Фото село на шашки — поправь кистью");
    } catch {
      toast.error("Не удалось прочитать снимок");
    }
  };

  const resetCamera = () => setRotation({ ...DEFAULT_ROTATION });

  const changeUnit = (next: Unit) => {
    setUnit(next);
    saveUnit(localStorage, UNIT_KEY, next);
  };

  const openSheet = () => {
    saveProject(localStorage, STORAGE_KEY, project);
    saveUnit(localStorage, UNIT_KEY, unit);
    setLocation("/instruction");
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "g") return;
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "SELECT" || target.tagName === "TEXTAREA")) return;
      event.preventDefault();
      generate();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const statusKind = refuse ? "refuse" : warns.length ? "warn" : "ok";
  const statusTitle = refuse
    ? "Нельзя печатать"
    : warns.length
      ? `${warns.length} предупр.`
      : "Можно пилить";
  const statusDetail = refuse
    ? refuses.map((c) => c.message).join(" · ")
    : warns.length
      ? warns.map((c) => c.message).join(" · ")
      : "Проверки пройдены · можно в мастерскую";

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">
            <span />
            <span />
            <span />
            <span />
          </div>
          <div>
            <div className="brand-name">
              WOODCUT <em>STUDIO</em>
            </div>
            <div className="brand-sub">ТОРЦЕВАЯ ДОСКА</div>
          </div>
        </div>
        <div className="project-title">
          <span className="live-dot" />
          <input
            value={project.name}
            onChange={(e) => commit({ ...project, name: e.target.value })}
            aria-label="Название проекта"
          />
          <span className="saved-state">{saved ? "СОХРАНЁН" : "ЧЕРНОВИК"}</span>
        </div>
        <div className="top-actions">
          <Button variant="outline" className="action-button" onClick={save}>
            <Save size={15} /> Сохранить
          </Button>
          <Button variant="outline" className="action-button" onClick={downloadJson}>
            <Download size={15} /> JSON
          </Button>
          <Button variant="outline" className="action-button" onClick={() => fileRef.current?.click()}>
            <FolderOpen size={15} /> Открыть
          </Button>
          <Button
            className="accent-button"
            onClick={() => {
              exportFaceSvg(project);
              toast.success("Лицо сохранено в SVG");
            }}
          >
            <ImageDown size={15} /> SVG
          </Button>
        </div>
      </header>

      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden-file-input"
        onChange={(e) => {
          void openFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <input
        ref={imageRef}
        type="file"
        accept="image/*"
        className="hidden-file-input"
        onChange={(e) => {
          void importPhoto(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      <div className="workspace">
        <main className="main-area">
          <div className="canvas-toolbar">
            <div>
              <span className="eyebrow">{view3d ? "ЖИВАЯ ДОСКА / 3D" : "ЖИВАЯ ДОСКА / СВЕРХУ"}</span>
              <span className="canvas-title">{project.name}</span>
            </div>
            <div className="toolbar-actions">
              <div className="segmented">
                <button className={!view3d ? "selected" : ""} onClick={() => setView3d(false)}>
                  2D
                </button>
                <button className={view3d ? "selected" : ""} onClick={() => setView3d(true)}>
                  3D
                </button>
              </div>
              <Button variant="ghost" size="icon" aria-label="Сбросить камеру" onClick={resetCamera}>
                <Maximize2 size={16} />
              </Button>
            </div>
          </div>

          <BoardStage
            project={project}
            view3d={view3d}
            unit={unit}
            rotation={rotation}
            onRotation={setRotation}
            onResetCamera={resetCamera}
            onPaint={project.shopPath === "block" ? paint : undefined}
          />

          <div className="canvas-footer">
            <div className="status-line">
              <span className={`status-icon ${statusKind}`}>
                {statusKind === "ok" ? <Check size={13} /> : <AlertTriangle size={13} />}
              </span>
              <div>
                <b>{statusTitle}</b>
                <small>{statusDetail}</small>
              </div>
            </div>
          </div>

          <div className="quick-strip">
            <div className="strip-heading">
              <span>ШАБЛОНЫ</span>
            </div>
            <div className="pattern-list desk-templates">
              {TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  className={`pattern-card ${templateId === tpl.id ? "chosen" : ""}`}
                  onClick={() => applyQuick(tpl.id)}
                >
                  <span className="desk-thumb">
                    <FacePreview project={applyTemplate(tpl.id, project)} />
                  </span>
                  <span>
                    <b>{tpl.name}</b>
                    <small>{tpl.description}</small>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </main>

        <aside className="inspector">
              <section className="panel-section">
                <div className="section-heading">
                  <span>ЦЕХ</span>
                </div>
                <div className="segmented path-switch">
                  <button
                    className={project.shopPath === "strip" ? "selected" : ""}
                    onClick={() => changePath("strip")}
                  >
                    ПАЛКИ
                  </button>
                  <button
                    className={project.shopPath === "block" ? "selected" : ""}
                    onClick={() => changePath("block")}
                  >
                    ШАШКИ
                  </button>
                </div>
              </section>

              <section className="panel-section">
                <div className="section-heading">
                  <span>ГЕНЕРАТОР</span>
                  <WandSparkles size={14} />
                </div>
                <Button className="generate-button" onClick={generate}>
                  <WandSparkles size={16} /> Собрать узор <kbd>G</kbd>
                </Button>
                {project.shopPath === "block" && (
                  <Button
                    variant="outline"
                    className="library-button"
                    onClick={() => imageRef.current?.click()}
                  >
                    <ImagePlus size={14} /> Фото на шашки
                  </Button>
                )}
              </section>

              {project.shopPath === "block" && (
                <section className="panel-section">
                  <div className="section-heading">
                    <span>ШАШКА / КИСТЬ</span>
                    <span className="cell-coord">
                      {derived.blockRows}×{derived.blockCols}
                    </span>
                  </div>
                  <div className="width-chips">
                    {STANDARD_WIDTHS.map((width) => (
                      <button
                        key={width}
                        type="button"
                        className={project.blockSize === width ? "chosen" : ""}
                        onClick={() => {
                          setTemplateId(null);
                          commit(syncCourses({ ...project, blockSize: width }));
                        }}
                      >
                        {width}
                      </button>
                    ))}
                  </div>
                  <div className="width-field block-size-field">
                    <UnitField
                      valueMm={project.blockSize}
                      unit={unit}
                      onMm={(blockSize) => {
                        setTemplateId(null);
                        commit(syncCourses({ ...project, blockSize }));
                      }}
                    />
                    <span>{unitShort}</span>
                  </div>
                  <div className="swatches brush-swatches">
                    {project.species.map((sp) => (
                      <button
                        key={sp.id}
                        type="button"
                        className={`swatch ${brushId === sp.id ? "swatch-active" : ""}`}
                        style={{ background: sp.color }}
                        onClick={() => setBrushId(sp.id)}
                        aria-label={sp.name}
                      >
                        <b>{sp.code}</b>
                      </button>
                    ))}
                  </div>
                  <p className="material-note">На 2D лице крась выбранной породой.</p>
                </section>
              )}

              {project.shopPath === "strip" && (
              <>
              <section className="panel-section">
                <div className="section-heading">
                  <span>МОТИВ</span>
                </div>
                <div className="width-chips">
                  {STANDARD_WIDTHS.map((width) => (
                    <button
                      key={width}
                      type="button"
                      className={project.motifWidth === width ? "chosen" : ""}
                      onClick={() => {
                        setTemplateId(null);
                        commit({ ...project, motifWidth: width });
                      }}
                    >
                      {width}
                    </button>
                  ))}
                </div>
                <div className="width-field block-size-field">
                  <UnitField
                    valueMm={project.motifWidth}
                    unit={unit}
                    onMm={(motifWidth) => {
                      setTemplateId(null);
                      commit({ ...project, motifWidth });
                    }}
                  />
                  <span>{unitShort}</span>
                </div>
                <i className="field-hint">
                  {project.motifWidth === DEFAULT_MOTIF_WIDTH
                    ? `дефолт ${formatLength(DEFAULT_MOTIF_WIDTH, unit)}`
                    : "вход"}
                </i>
              </section>
              <section className="panel-section">
                <div className="section-heading">
                  <span>ПАЛКИ</span>
                  <button
                    type="button"
                    onClick={() => {
                      const speciesId = project.species[0]?.id;
                      if (!speciesId) return;
                      patchSticksBoard((p) => ({
                        ...p,
                        sticks: [...p.sticks, { speciesId, width: DEFAULT_STICK_WIDTH }],
                      }));
                    }}
                  >
                    <Plus size={12} /> добавить
                  </button>
                </div>
                {project.sticks.map((stick, index) => (
                  <div className="stick-row" key={`${stick.speciesId}-${index}`}>
                    <select
                      aria-label={`Порода палки ${index + 1}`}
                      value={stick.speciesId}
                      onChange={(e) => {
                        const speciesId = e.target.value;
                        patchSticksBoard((p) => ({
                          ...p,
                          sticks: p.sticks.map((s, i) => (i === index ? { ...s, speciesId } : s)),
                        }));
                      }}
                    >
                      {project.species.map((sp) => (
                        <option key={sp.id} value={sp.id}>
                          {sp.name}
                        </option>
                      ))}
                    </select>
                    <div className="width-field">
                      <UnitField
                        valueMm={stick.width}
                        unit={unit}
                        onMm={(width) =>
                          patchSticksBoard((p) => ({
                            ...p,
                            sticks: p.sticks.map((s, i) => (i === index ? { ...s, width } : s)),
                          }))
                        }
                      />
                      <span>{unitShort}</span>
                    </div>
                    <button
                      type="button"
                      className="icon-mini"
                      aria-label={`Удалить палку ${index + 1}`}
                      onClick={() =>
                        patchSticksBoard((p) => ({
                          ...p,
                          sticks: p.sticks.filter((_, i) => i !== index),
                        }))
                      }
                    >
                      <Minus size={13} />
                    </button>
                  </div>
                ))}
              </section>

              <section className="panel-section">
                <div className="section-heading">
                  <span>ПОЛОСЫ</span>
                  <button type="button" onClick={() => commit(addStrip(project))}>
                    <Plus size={12} /> добавить
                  </button>
                </div>
                {project.strips.map((strip, index) => (
                  <div className="strip-row" key={index}>
                    <label className="flip">
                      <input
                        type="checkbox"
                        checked={strip.flip}
                        onChange={(e) => {
                          const flip = e.target.checked;
                          commit({
                            ...project,
                            strips: project.strips.map((s, i) => (i === index ? { ...s, flip } : s)),
                          });
                        }}
                      />
                      переворот {String(index + 1).padStart(2, "0")}
                    </label>
                    <div className="offset-field">
                      <UnitField
                        valueMm={strip.offset}
                        unit={unit}
                        onMm={(offset) =>
                          commit({
                            ...project,
                            strips: project.strips.map((s, i) => (i === index ? { ...s, offset } : s)),
                          })
                        }
                      />
                      <span>{unitShort}</span>
                    </div>
                    <button
                      type="button"
                      className="icon-mini"
                      aria-label={`Полоса ${index + 1} вверх`}
                      disabled={index === 0}
                      onClick={() => commit(moveStrip(project, index, index - 1))}
                    >
                      <ChevronUp size={13} />
                    </button>
                    <button
                      type="button"
                      className="icon-mini"
                      aria-label={`Полоса ${index + 1} вниз`}
                      disabled={index === project.strips.length - 1}
                      onClick={() => commit(moveStrip(project, index, index + 1))}
                    >
                      <ChevronDown size={13} />
                    </button>
                    <button
                      type="button"
                      className="icon-mini"
                      aria-label={`Удалить полосу ${index + 1}`}
                      onClick={() => commit(removeStrip(project, index))}
                    >
                      <Minus size={13} />
                    </button>
                  </div>
                ))}
              </section>
              </>
              )}

              <section className="panel-section">
                <div className="section-heading">
                  <span>РАЗМЕР ДОСКИ</span>
                </div>
                <div className="dimension-grid">
                  <label>
                    ДЛИНА
                    <div>
                      <UnitField
                        valueMm={project.board.length}
                        unit={unit}
                        onMm={(length) =>
                          patchSticksBoard((p) => ({ ...p, board: { ...p.board, length } }))
                        }
                      />
                      <span>{unitShort}</span>
                    </div>
                  </label>
                  <label>
                    ШИРИНА
                    <div>
                      <UnitField
                        valueMm={project.board.width}
                        unit={unit}
                        onMm={(width) =>
                          patchSticksBoard((p) => ({ ...p, board: { ...p.board, width } }))
                        }
                      />
                      <span>{unitShort}</span>
                    </div>
                  </label>
                  <label>
                    ТОЛЩИНА
                    <div>
                      <UnitField
                        valueMm={project.board.thickness}
                        unit={unit}
                        onMm={(thickness) =>
                          patchSticksBoard((p) => ({ ...p, board: { ...p.board, thickness } }))
                        }
                      />
                      <span>{unitShort}</span>
                    </div>
                  </label>
                </div>
              </section>

              <section className="panel-section">
                <div className="section-heading">
                  <span>ПРИПУСКИ</span>
                </div>
                <div className="dimension-grid allowance-grid">
                  <label>
                    КЕРФ
                    <div>
                      <UnitField
                        valueMm={project.kerf}
                        unit={unit}
                        step={unit === "in" ? 0.01 : 0.1}
                        onMm={(kerf) => commit({ ...project, kerf })}
                      />
                      <span>{unitShort}</span>
                    </div>
                    <i className="field-hint">дефолт {formatLength(HINT_KERF, unit)}</i>
                  </label>
                  <label>
                    ФУГОВКА
                    <div>
                      <UnitField
                        valueMm={project.surfacing}
                        unit={unit}
                        onMm={(surfacing) => commit({ ...project, surfacing })}
                      />
                      <span>{unitShort}</span>
                    </div>
                    <i className="field-hint">дефолт {formatLength(HINT_SURFACING, unit)}</i>
                  </label>
                  <label>
                    ЗАПАС
                    <div>
                      <UnitField
                        valueMm={project.extraLength}
                        unit={unit}
                        onMm={(extraLength) => commit({ ...project, extraLength })}
                      />
                      <span>{unitShort}</span>
                    </div>
                    <i className="field-hint">дефолт {formatLength(HINT_EXTRA, unit)}</i>
                  </label>
                  <label>
                    ВЫРАВН.
                    <div>
                      <UnitField
                        valueMm={project.squareUp}
                        unit={unit}
                        onMm={(squareUp) => commit({ ...project, squareUp })}
                      />
                      <span>{unitShort}</span>
                    </div>
                    <i className="field-hint">дефолт {formatLength(HINT_SQUARE, unit)}</i>
                  </label>
                </div>
              </section>
        </aside>
      </div>

      <footer className="bottom-status">
        <div>
          <span className="status-key">ПРОЕКТ</span> {project.name}
        </div>
        <div>
          <span className="status-key">ОТХОД</span>{" "}
          {derived.wasteRatio == null ? "—" : `${(derived.wasteRatio * 100).toFixed(1)}%`}
          {project.shopPath === "block" ? (
            <>
              <span className="status-key">ШАШКИ</span> {derived.blockRows}×{derived.blockCols}
            </>
          ) : (
            <>
              <span className="status-key">ЗАГОТОВКА</span>{" "}
              {formatLength(derived.blank.length, unit)} × {formatLength(derived.blank.width, unit)} ×{" "}
              {formatLength(derived.blank.thickness, unit)}
              {derived.widthShortfall > 0 && (
                <>
                  <span className="status-key">НЕДОБОР Ш</span> {formatLength(derived.widthShortfall, unit)}
                </>
              )}
              {derived.widthTrim > 0 && (
                <>
                  <span className="status-key">ОБРЕЗЬ Ш</span> {formatLength(derived.widthTrim, unit)}
                </>
              )}
              {derived.lengthShortfall > 0 && (
                <>
                  <span className="status-key">НЕДОБОР Д</span> {formatLength(derived.lengthShortfall, unit)}
                </>
              )}
              {derived.lengthTrim > 0 && (
                <>
                  <span className="status-key">ОБРЕЗЬ Д</span> {formatLength(derived.lengthTrim, unit)}
                </>
              )}
            </>
          )}
        </div>
        <div className="footer-right">
          <span className="status-key">ЕДИНИЦЫ</span>
          <div className="unit-switch">
            <button className={`unit-toggle ${unit === "mm" ? "selected" : ""}`} onClick={() => changeUnit("mm")}>
              MM
            </button>
            <button className={`unit-toggle ${unit === "in" ? "selected" : ""}`} onClick={() => changeUnit("in")}>
              ДЮЙМ
            </button>
          </div>
          <button onClick={openSheet} className="footer-action">
            <ScrollText size={13} /> ЛИСТ
          </button>
        </div>
      </footer>
    </div>
  );
}
