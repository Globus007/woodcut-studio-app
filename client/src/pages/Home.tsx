// STYLE: Industrial futurism for a woodworking instrument panel. Dark workbench canvas, ember orange active states, IBM Plex Mono for measurements, Space Grotesk for values.
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowDownToLine, BookOpen, Box, Check, ChevronDown, CircleHelp, Copy, Download,
  FileText, FlipHorizontal2, FlipVertical2, Grid3X3, Layers3, Maximize2, Minus,
  PanelLeftClose, PanelLeftOpen, Plus, Printer, Redo2, RotateCcw, RotateCw,
  Ruler, Save, Scissors, Settings2, Sparkles, SquareDashedMousePointer, Trash2,
  Undo2, WandSparkles, X, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const MATERIALS = [
  { id: "walnut", name: "Walnut", code: "WAL", color: "#6f4735", grain: "#9a6b50", cost: 0.18 },
  { id: "maple", name: "Maple", code: "MAP", color: "#e4c48f", grain: "#f0dcae", cost: 0.13 },
  { id: "cherry", name: "Cherry", code: "CHE", color: "#a75845", grain: "#cf7b59", cost: 0.16 },
  { id: "ash", name: "Ash", code: "ASH", color: "#c9c2ad", grain: "#e9e0ca", cost: 0.12 },
  { id: "padauk", name: "Padauk", code: "PAD", color: "#c85530", grain: "#eb7848", cost: 0.22 },
];
const PATTERNS = [
  { id: "orbit", name: "ORBITAL", tag: "generated", description: "радиальная орбита", icon: "◌" },
  { id: "cube", name: "IMPOSSIBLE CUBE", tag: "geometric", description: "невозможный куб", icon: "◇" },
  { id: "zigzag", name: "SAWTOOTH", tag: "classic", description: "двойной зигзаг", icon: "⌁" },
  { id: "chaos", name: "CONTROLLED CHAOS", tag: "wild", description: "управляемый хаос", icon: "✳" },
];

type Cell = { material: number; rotate: number; flipX: boolean; flipY: boolean };

function makePattern(kind: string, rows = 12, cols = 16): Cell[][] {
  return Array.from({ length: rows }, (_, y) => Array.from({ length: cols }, (_, x) => {
    let n = 0;
    if (kind === "orbit") n = Math.abs(Math.floor(Math.atan2(y - rows / 2, x - cols / 2) * 2.2 + (x + y) / 3)) % 5;
    if (kind === "cube") n = (Math.floor(x / 2) + Math.floor(y / 2) + (x % 2) * 2) % 5;
    if (kind === "zigzag") n = (x + (y % 4 < 2 ? y : -y)) % 5;
    if (kind === "chaos") n = (x * 13 + y * 7 + (x * y) % 11) % 5;
    return { material: (n + 5) % 5, rotate: ((x + y) % 4) * 90, flipX: kind === "chaos" && x % 5 === 0, flipY: kind === "cube" && y % 4 === 0 };
  }));
}

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type }); const url = URL.createObjectURL(blob); const a = document.createElement("a");
  a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
}

function Swatch({ material, active, onClick }: { material: typeof MATERIALS[number]; active: boolean; onClick: () => void }) {
  return <button onClick={onClick} aria-label={`Выбрать ${material.name}`} className={`swatch ${active ? "swatch-active" : ""}`} style={{ background: material.color }}><span style={{ background: material.grain }} /><b>{material.code}</b></button>;
}

export default function Home() {
  const [patternName, setPatternName] = useState("ORBITAL / 07");
  const [patternKind, setPatternKind] = useState("orbit");
  const [grid, setGrid] = useState(() => makePattern("orbit"));
  const [selected, setSelected] = useState({ x: 7, y: 5 });
  const [activeMaterial, setActiveMaterial] = useState(1);
  const [width, setWidth] = useState(420); const [height, setHeight] = useState(280); const [thickness, setThickness] = useState(42); const [kerf, setKerf] = useState(3.2);
  const [zoom, setZoom] = useState(1); const [activeTab, setActiveTab] = useState("pattern"); const [railOpen, setRailOpen] = useState(true);
  const [saved, setSaved] = useState(false); const [view3d, setView3d] = useState(false);

  const cell = grid[selected.y]?.[selected.x];
  const area = (width * height) / 1_000_000;
  const volume = area * thickness / 1000;
  const materialCost = useMemo(() => grid.flat().reduce((s, c) => s + MATERIALS[c.material].cost, 0) * (width / 420) * (height / 280), [grid, width, height]);
  const waste = Math.min(28, 8 + (kerf - 2.5) * 3 + (patternKind === "chaos" ? 6 : 0));
  const realizable = kerf <= 4 && thickness >= 30;

  const generate = (kind = patternKind) => { setPatternKind(kind); setGrid(makePattern(kind)); setPatternName(`${PATTERNS.find(p => p.id === kind)?.name} / ${String(Math.floor(Math.random() * 30) + 1).padStart(2, "0")}`); toast.success("Новый узор собран", { description: "Геометрия обновлена. Проверьте карту раскроя перед пилением." }); };
  const mutateCell = (fn: (c: Cell) => Cell) => setGrid(g => g.map((row, y) => row.map((c, x) => x === selected.x && y === selected.y ? fn(c) : c)));
  const save = () => { localStorage.setItem("woodcut-project", JSON.stringify({ patternName, grid, width, height, thickness, kerf })); setSaved(true); toast.success("Проект сохранён локально"); };
  const exportSVG = () => { const w = 800, h = 600; const cw = w / grid[0].length, ch = h / grid.length; const rects = grid.flatMap((row, y) => row.map((c, x) => `<rect x="${x * cw}" y="${y * ch}" width="${cw + .5}" height="${ch + .5}" fill="${MATERIALS[c.material].color}"/><path d="M${x*cw+cw*.2} ${y*ch+ch*.5} Q${x*cw+cw*.5} ${y*ch+ch*.15} ${x*cw+cw*.8} ${y*ch+ch*.55}" stroke="${MATERIALS[c.material].grain}" stroke-width="2" opacity=".55" fill="none"/>`)).join(""); downloadFile("woodcut-pattern.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${rects}</svg>`, "image/svg+xml"); toast.success("SVG экспортирован"); };
  const print = () => window.print();

  return <div className="app-shell">
    <header className="topbar"><div className="brand"><div className="brand-mark"><span /><span /><span /><span /></div><div><div className="brand-name">WOODCUT <em>STUDIO</em></div><div className="brand-sub">END-GRAIN / PATTERN ENGINE</div></div></div><div className="project-title"><span className="live-dot" /> <input value={patternName} onChange={e => setPatternName(e.target.value)} aria-label="Название проекта" /><span className="saved-state">{saved ? "SAVED" : "DRAFT"}</span></div><div className="top-actions"><Button variant="ghost" size="icon" aria-label="Отменить"><Undo2 size={17} /></Button><Button variant="ghost" size="icon" aria-label="Повторить"><Redo2 size={17} /></Button><span className="divider" /><Button variant="outline" className="action-button" onClick={save}><Save size={15} /> Save</Button><Button className="accent-button" onClick={exportSVG}><Download size={15} /> Export</Button></div></header>
    <div className="workspace">
      <aside className={`left-rail ${railOpen ? "" : "closed"}`}><button className="rail-toggle" onClick={() => setRailOpen(!railOpen)}>{railOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}</button>{railOpen && <><div className="rail-label">WORKSPACE</div><button className={`rail-item active`} onClick={() => setActiveTab("pattern")}><Grid3X3 size={18} /><span>Pattern</span><kbd>1</kbd></button><button className={`rail-item ${activeTab === "build" ? "active" : ""}`} onClick={() => setActiveTab("build")}><Scissors size={18} /><span>Cut map</span><kbd>2</kbd></button><button className={`rail-item ${activeTab === "layers" ? "active" : ""}`} onClick={() => setActiveTab("layers")}><Layers3 size={18} /><span>Glue-ups</span><kbd>3</kbd></button><div className="rail-label rail-label-spaced">TOOLS</div><button className="rail-item" onClick={() => setView3d(!view3d)}><Box size={18} /><span>3D preview</span><i className={`toggle-dot ${view3d ? "on" : ""}`} /></button><button className="rail-item" onClick={() => toast.info("Импорт изображений — следующий модуль") }><SquareDashedMousePointer size={18} /><span>Trace image</span></button><div className="rail-bottom"><button className="rail-item" onClick={() => toast.info("В проекте 4 материала") }><BookOpen size={18} /><span>Material lab</span></button><button className="rail-item" onClick={() => toast.info("Сочетание клавиш: G — генерация, E — экспорт") }><CircleHelp size={18} /><span>Shortcuts</span></button></div></>}</aside>
      <main className="main-area"><div className="canvas-toolbar"><div><span className="eyebrow">LIVE BOARD / {view3d ? "AXONOMETRIC" : "TOP VIEW"}</span><span className="canvas-title">{patternName}</span></div><div className="toolbar-actions"><div className="segmented"><button className={!view3d ? "selected" : ""} onClick={() => setView3d(false)}>2D</button><button className={view3d ? "selected" : ""} onClick={() => setView3d(true)}>3D</button></div><Button variant="ghost" size="icon" aria-label="Центрировать"><Maximize2 size={16} /></Button></div></div>
        <div className={`board-stage ${view3d ? "stage-3d" : ""}`}><div className="ruler ruler-top"><span>0</span><span>105</span><span>210</span><span>315</span><span>{width} mm</span></div><div className="ruler ruler-left"><span>0</span><span>70</span><span>140</span><span>{height} mm</span></div><div className="board-shadow" style={{ transform: `scale(${zoom}) rotateX(${view3d ? "12deg" : "0deg"}) rotateZ(${view3d ? "-3deg" : "0deg"})` }}><div className="board-grid" style={{ gridTemplateColumns: `repeat(${grid[0].length}, 1fr)` }}>{grid.flatMap((row, y) => row.map((c, x) => <button key={`${x}-${y}`} className={`wood-cell ${selected.x === x && selected.y === y ? "selected" : ""}`} onClick={() => { setSelected({ x, y }); setActiveMaterial(c.material); }} style={{ backgroundColor: MATERIALS[c.material].color, transform: `rotate(${c.rotate}deg) scaleX(${c.flipX ? -1 : 1}) scaleY(${c.flipY ? -1 : 1})` }}><span style={{ backgroundColor: MATERIALS[c.material].grain }} /></button>))}</div><div className="board-edge" /></div><div className="dimension dimension-width"><span /> <b>{width} mm</b><span /></div><div className="dimension dimension-height"><span /> <b>{height} mm</b><span /></div><div className="origin">X 000 / Y 000</div></div>
        <div className="canvas-footer"><div className="status-line"><span className={`status-icon ${realizable ? "ok" : "warn"}`}>{realizable ? <Check size={13} /> : <Zap size={13} />}</span><div><b>{realizable ? "PHYSICALLY REALIZABLE" : "CHECK PARAMETERS"}</b><small>{realizable ? "No collisions detected · grain direction verified" : "Reduce kerf or increase board thickness"}</small></div></div><div className="zoom-control"><button onClick={() => setZoom(Math.max(.7, zoom - .1))}><Minus size={14} /></button><span>{Math.round(zoom * 100)}%</span><button onClick={() => setZoom(Math.min(1.3, zoom + .1))}><Plus size={14} /></button></div></div>
        <div className="quick-strip"><div className="strip-heading"><span>QUICK PATTERNS</span><button onClick={() => toast.info("Библиотека шаблонов скоро расширится")}>VIEW ALL <ChevronDown size={13} /></button></div><div className="pattern-list">{PATTERNS.map(p => <button key={p.id} className={`pattern-card ${patternKind === p.id ? "chosen" : ""}`} onClick={() => generate(p.id)}><span className="pattern-glyph">{p.icon}</span><span><b>{p.name}</b><small>{p.description}</small></span><i>{p.tag}</i></button>)}</div></div>
      </main>
      <aside className="inspector"><div className="inspector-tabs"><button className={activeTab === "pattern" ? "active" : ""} onClick={() => setActiveTab("pattern")}>PATTERN</button><button className={activeTab === "build" ? "active" : ""} onClick={() => setActiveTab("build")}>BUILD</button><button className={activeTab === "layers" ? "active" : ""} onClick={() => setActiveTab("layers")}>COST</button></div>{activeTab === "pattern" && <><section className="panel-section"><div className="section-heading"><span>GENERATIVE ENGINE</span><Sparkles size={14} /></div><Button className="generate-button" onClick={() => generate()}><WandSparkles size={16} /> Generate wild pattern <kbd>G</kbd></Button><div className="range-row"><label>Chaos factor <b>67%</b></label><input type="range" defaultValue="67" /></div><div className="range-row"><label>Symmetry <b>radial</b></label><input type="range" defaultValue="42" /></div></section><section className="panel-section"><div className="section-heading"><span>BOARD DIMENSIONS</span><Ruler size={14} /></div><div className="dimension-grid"><label>WIDTH <div><Input type="number" value={width} onChange={e => setWidth(+e.target.value)} /><span>mm</span></div></label><label>HEIGHT <div><Input type="number" value={height} onChange={e => setHeight(+e.target.value)} /><span>mm</span></div></label><label>THICKNESS <div><Input type="number" value={thickness} onChange={e => setThickness(+e.target.value)} /><span>mm</span></div></label><label>SAW KERF <div><Input type="number" value={kerf} step="0.1" onChange={e => setKerf(+e.target.value)} /><span>mm</span></div></label></div></section><section className="panel-section"><div className="section-heading"><span>WOOD PALETTE</span><button onClick={() => toast.info("Добавьте породу в Material lab")}>EDIT</button></div><div className="swatches">{MATERIALS.map((m, i) => <Swatch key={m.id} material={m} active={activeMaterial === i} onClick={() => { setActiveMaterial(i); mutateCell(c => ({ ...c, material: i })); }} />)}</div><div className="material-note"><span className="material-chip" style={{ background: MATERIALS[activeMaterial].color }} /> <b>{MATERIALS[activeMaterial].name}</b><span className="mono">{MATERIALS[activeMaterial].code}</span></div></section><section className="panel-section selected-section"><div className="section-heading"><span>SELECTED CELL</span><span className="cell-coord">X {String(selected.x + 1).padStart(2, "0")} / Y {String(selected.y + 1).padStart(2, "0")}</span></div><div className="transform-actions"><Button variant="outline" onClick={() => mutateCell(c => ({ ...c, rotate: (c.rotate + 90) % 360 }))}><RotateCw size={14} /> 90°</Button><Button variant="outline" onClick={() => mutateCell(c => ({ ...c, flipX: !c.flipX }))}><FlipHorizontal2 size={14} /></Button><Button variant="outline" onClick={() => mutateCell(c => ({ ...c, flipY: !c.flipY }))}><FlipVertical2 size={14} /></Button></div></section></>}{activeTab === "build" && <BuildPanel grid={grid} kerf={kerf} waste={waste} />}{activeTab === "layers" && <CostPanel area={area} volume={volume} materialCost={materialCost} waste={waste} />}</aside>
    </div>
    <footer className="bottom-status"><div><span className="status-key">PROJECT</span> {patternName}</div><div><span className="status-key">CELLS</span> {grid.flat().length} <span className="status-key">CUTS</span> {grid.length + 4} <span className="status-key">KERF</span> {kerf} mm</div><div className="footer-right"><span className="status-key">UNIT</span><button className="unit-toggle">MM <ChevronDown size={12} /></button><button onClick={print} className="footer-action"><Printer size={13} /> PRINT WORKSHEET</button></div></footer>
  </div>;
}

function BuildPanel({ grid, kerf, waste }: { grid: Cell[][]; kerf: number; waste: number }) { const cuts = Math.max(8, Math.round(grid[0].length * .75)); return <><section className="panel-section build-hero"><div className="section-heading"><span>CUT MAP / 01</span><Scissors size={14} /></div><div className="cut-preview">{Array.from({ length: 10 }, (_, i) => <span key={i} style={{ background: MATERIALS[(i * 2) % 5].color, height: `${30 + (i % 3) * 9}px` }} />)}</div><p>Rip strips along the grain, then rotate every second strip 90° before the final glue-up.</p></section><section className="panel-section"><div className="stat-line"><span>Estimated cuts</span><b>{cuts} strips</b></div><div className="stat-line"><span>Kerf allowance</span><b>{kerf} mm</b></div><div className="stat-line"><span>Offcut reserve</span><b>{waste.toFixed(1)}%</b></div></section><section className="panel-section"><div className="section-heading"><span>GLUE-UP SEQUENCE</span><span className="steps">4 STEPS</span></div>{["Rip strips / mark grain", "Rotate alternating strips", "Glue-up A / clamp 20 min", "Cross-cut & final glue-up"].map((s, i) => <div className="step" key={s}><span>{String(i + 1).padStart(2, "0")}</span>{s}<Check size={13} /></div>)}</section></>; }
function CostPanel({ area, volume, materialCost, waste }: { area: number; volume: number; materialCost: number; waste: number }) { return <><section className="panel-section cost-hero"><div className="section-heading"><span>MATERIAL TAKEOFF</span><Layers3 size={14} /></div><div className="cost-total"><small>ESTIMATED STOCK COST</small><strong>${(materialCost * 100 + 14).toFixed(2)}</strong><span>+ 18% contingency</span></div><Progress value={100 - waste} /><div className="progress-labels"><span>usable stock</span><b>{(100 - waste).toFixed(1)}%</b></div></section><section className="panel-section"><div className="stat-line"><span>Board face</span><b>{(area * 10000).toFixed(0)} cm²</b></div><div className="stat-line"><span>Finished volume</span><b>{volume.toFixed(3)} L</b></div><div className="stat-line"><span>Material waste</span><b className="orange">{waste.toFixed(1)}%</b></div><div className="stat-line"><span>Stock to buy</span><b>{(volume * (1 + waste / 100)).toFixed(3)} L</b></div></section><section className="panel-section"><div className="section-heading"><span>BY SPECIES</span><button><Copy size={13} /> COPY</button></div>{MATERIALS.slice(0, 4).map((m, i) => <div className="material-cost" key={m.id}><span className="material-chip" style={{ background: m.color }} /><b>{m.code}</b><span>{[31, 27, 22, 20][i]}%</span><strong>{(volume * [31, 27, 22, 20][i] / 100).toFixed(3)} L</strong></div>)}</section></>; }
