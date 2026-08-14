import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  Box,
  Check,
  Download,
  FolderOpen,
  Grid3X3,
  ImageDown,
  Maximize2,
  Minus,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Printer,
  Save,
  Scissors,
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
  saveProject,
  downloadProject,
  parseProject,
  STORAGE_KEY,
  formatLength,
  fromDisplay,
  toDisplay,
  syncStrips,
  TEMPLATES,
  faceGrid,
  speciesColor,
  type Project,
  type TemplateId,
  type Unit,
} from "@/domain";
import { BoardStage } from "@/components/desk/BoardStage";
import { Instruction } from "@/components/desk/Instruction";
import { FacePreview } from "@/components/desk/FacePreview";

const DEFAULT_ROTATION = { x: 18, y: -22 };
const HINT_KERF = 3.2;
const HINT_SURFACING = 2;
const HINT_EXTRA = 20;
const HINT_SQUARE = 10;

type Tab = "pattern" | "build";

function readMm(raw: string, unit: Unit): number | null {
  if (raw.trim() === "") return 0;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  return fromDisplay(n, unit);
}

function exportFaceSvg(project: Project) {
  const synced = syncStrips(project);
  const rows = faceGrid(synced);
  const w = 800;
  const h = 480;
  const rowH = h / Math.max(rows.length, 1);
  const maxWidth = Math.max(1, synced.sticks.reduce((sum, stick) => sum + stick.width, 0));
  const rects = rows.flatMap((row, y) => {
    const offset = synced.strips[y]?.offset ?? 0;
    let x = (offset / maxWidth) * w;
    return row.map((cell) => {
      const cw = (cell.width / maxWidth) * w;
      const rect = `<rect x="${x}" y="${y * rowH}" width="${cw}" height="${rowH}" fill="${speciesColor(synced, cell.speciesId)}"/>`;
      x += cw;
      return rect;
    });
  });
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

export default function Home() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [project, setProject] = useState<Project>(
    () => loadProject(localStorage, STORAGE_KEY) ?? applyTemplate("stripes"),
  );
  const [unit, setUnit] = useState<Unit>("mm");
  const [seed, setSeed] = useState(1);
  const [saved, setSaved] = useState(false);
  const [view3d, setView3d] = useState(false);
  const [rotation, setRotation] = useState(DEFAULT_ROTATION);
  const [activeTab, setActiveTab] = useState<Tab>("pattern");
  const [railOpen, setRailOpen] = useState(true);
  const [templateId, setTemplateId] = useState<TemplateId | null>("stripes");

  const derived = useMemo(() => derive(project), [project]);
  const checks = useMemo(() => evaluateChecks(project), [project]);
  const refuse = hasRefuse(checks);
  const firstRefuse = checks.find((c) => c.level === "refuse");
  const firstWarn = checks.find((c) => c.level === "warn");
  const unitShort = unit === "in" ? "″" : "мм";

  const commit = (next: Project, sync = false) => {
    setProject(sync ? syncStrips(next) : next);
    setSaved(false);
  };

  const patchSticksBoard = (updater: (p: Project) => Project) => {
    setTemplateId(null);
    setProject((p) => syncStrips(updater(p)));
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

  const resetCamera = () => setRotation({ ...DEFAULT_ROTATION });

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

  const statusKind = refuse ? "refuse" : firstWarn ? "warn" : "ok";
  const statusTitle = refuse ? "Нельзя печатать" : firstWarn ? firstWarn.message : "Можно пилить";
  const statusDetail = refuse
    ? firstRefuse?.message ?? "Проверка не пройдена"
    : firstWarn
      ? firstWarn.message
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

      <div className="workspace">
        <aside className={`left-rail ${railOpen ? "" : "closed"}`}>
          <button className="rail-toggle" onClick={() => setRailOpen(!railOpen)} aria-label="Свернуть рейку">
            {railOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
          </button>
          {railOpen && (
            <>
              <div className="rail-label">СТОЛ</div>
              <button
                className={`rail-item ${activeTab === "pattern" ? "active" : ""}`}
                onClick={() => setActiveTab("pattern")}
              >
                <Grid3X3 size={18} />
                <span>Узор</span>
                <kbd>1</kbd>
              </button>
              <button
                className={`rail-item ${activeTab === "build" ? "active" : ""}`}
                onClick={() => setActiveTab("build")}
              >
                <Scissors size={18} />
                <span>Инструкция</span>
                <kbd>2</kbd>
              </button>
              <div className="rail-label rail-label-spaced">ВИД</div>
              <button className="rail-item" onClick={() => setView3d((v) => !v)}>
                <Box size={18} />
                <span>3D</span>
                <i className={`toggle-dot ${view3d ? "on" : ""}`} />
              </button>
            </>
          )}
        </aside>

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
                    <FacePreview project={applyTemplate(tpl.id)} />
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
          <div className="inspector-tabs">
            <button className={activeTab === "pattern" ? "active" : ""} onClick={() => setActiveTab("pattern")}>
              УЗОР
            </button>
            <button className={activeTab === "build" ? "active" : ""} onClick={() => setActiveTab("build")}>
              ИНСТРУКЦИЯ
            </button>
          </div>

          {activeTab === "pattern" && (
            <>
              <section className="panel-section">
                <div className="section-heading">
                  <span>ГЕНЕРАТОР</span>
                  <WandSparkles size={14} />
                </div>
                <Button className="generate-button" onClick={generate}>
                  <WandSparkles size={16} /> Собрать узор <kbd>G</kbd>
                </Button>
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
                        sticks: [...p.sticks, { speciesId, width: 35 }],
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
                  <span className="cell-coord">{project.strips.length}</span>
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
                  </div>
                ))}
              </section>

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
            </>
          )}

          {activeTab === "build" && <Instruction project={project} unit={unit} />}
        </aside>
      </div>

      <footer className="bottom-status">
        <div>
          <span className="status-key">ПРОЕКТ</span> {project.name}
        </div>
        <div>
          <span className="status-key">КЕРФ</span> {formatLength(project.kerf, unit)}
          <span className="status-key">ПОЛОСЫ</span> {derived.stripCount}
        </div>
        <div className="footer-right">
          <span className="status-key">ЕДИНИЦЫ</span>
          <div className="unit-switch">
            <button className={`unit-toggle ${unit === "mm" ? "selected" : ""}`} onClick={() => setUnit("mm")}>
              MM
            </button>
            <button className={`unit-toggle ${unit === "in" ? "selected" : ""}`} onClick={() => setUnit("in")}>
              ДЮЙМ
            </button>
          </div>
          <button
            onClick={() => {
              setActiveTab("build");
              requestAnimationFrame(() => window.print());
            }}
            className="footer-action"
            disabled={refuse}
          >
            <Printer size={13} /> ПЕЧАТЬ
          </button>
        </div>
      </footer>
    </div>
  );
}
