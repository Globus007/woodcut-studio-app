import type { JSX } from "react";
import { FacePreview } from "@/components/desk/FacePreview";
import {
  DEFAULT_EXTRA_LENGTH,
  DEFAULT_KERF,
  DEFAULT_MOTIF_WIDTH,
  DEFAULT_SQUARE_UP,
  DEFAULT_SURFACING,
  derive,
  evaluateChecks,
  faceRow,
  formatLength,
  hasRefuse,
  speciesColor,
} from "@/domain";
import type { Project, Unit } from "@/domain";

function labeledLength(mm: number, unit: Unit, isDefault: boolean): string {
  const text = formatLength(mm, unit);
  return isDefault ? `${text} · дефолт` : text;
}

function speciesName(project: Project, speciesId: string): string {
  return project.species.find((s) => s.id === speciesId)?.name ?? speciesId;
}

function usedSpeciesIds(project: Project): string[] {
  const source = project.shopPath === "block" ? project.courses.flat() : project.sticks.map((stick) => stick.speciesId);
  const ids: string[] = [];
  for (const id of source) {
    if (!ids.includes(id)) ids.push(id);
  }
  return ids;
}

function courseRuns(project: Project, course: string[]): string {
  const runs: string[] = [];
  let last = "";
  let n = 0;
  for (const id of course) {
    if (id === last) n += 1;
    else {
      if (last) runs.push(`${speciesName(project, last)} ${n}`);
      last = id;
      n = 1;
    }
  }
  if (last) runs.push(`${speciesName(project, last)} ${n}`);
  return runs.join(" · ");
}

function StickOrderMap(props: { project: Project; unit: Unit }): JSX.Element {
  const { project, unit } = props;
  if (project.sticks.length === 0) {
    return <p className="sheet-empty">Палок нет</p>;
  }
  return (
    <div className="sheet-map" aria-label="Порядок палок поколения 1">
      {project.sticks.map((stick, index) => (
        <div
          key={`${stick.speciesId}-${index}`}
          className="sheet-map-cell"
          style={{ flexGrow: Math.max(stick.width, 1), background: speciesColor(project, stick.speciesId) }}
        >
          <span>{String(index + 1).padStart(2, "0")}</span>
          <b>{speciesName(project, stick.speciesId)}</b>
          <small>{formatLength(stick.width, unit)}</small>
        </div>
      ))}
    </div>
  );
}

function StripMap(props: { project: Project; unit: Unit; count: number }): JSX.Element {
  const { project, unit, count } = props;
  if (count === 0) {
    return <p className="sheet-empty">Ломтей нет</p>;
  }
  return (
    <div className="sheet-rows" aria-label="Карта ломтей поколения 2">
      {Array.from({ length: count }, (_, index) => {
        const strip = project.strips[index] ?? { flip: false, offset: 0 };
        const row = faceRow(project, index);
        return (
          <div className="sheet-row" key={index}>
            <span className="sheet-row-num">{String(index + 1).padStart(2, "0")}</span>
            <div className="sheet-row-bar">
              {row.map((cell, x) => (
                <span
                  key={`${index}-${x}`}
                  style={{ flexGrow: Math.max(cell.width, 1), background: speciesColor(project, cell.speciesId) }}
                />
              ))}
            </div>
            <div className="sheet-row-meta">
              <b>{strip.flip ? "переворот" : "как есть"}</b>
              <span>сдвиг {formatLength(strip.offset, unit)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CourseMap(props: { project: Project }): JSX.Element {
  const { project } = props;
  if (project.courses.length === 0) {
    return <p className="sheet-empty">Рядов нет</p>;
  }
  return (
    <div className="sheet-rows" aria-label="Карта рядов">
      {project.courses.map((course, index) => (
        <div className="sheet-row" key={index}>
          <span className="sheet-row-num">{String(index + 1).padStart(2, "0")}</span>
          <div className="sheet-row-bar">
            {course.map((id, col) => (
              <span key={`${index}-${col}`} style={{ flexGrow: 1, background: speciesColor(project, id) }} />
            ))}
          </div>
          <div className="sheet-row-meta">
            <span>{courseRuns(project, course)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Instruction(props: {
  project: Project;
  unit: Unit;
}): JSX.Element {
  const { project, unit } = props;
  const derived = derive(project);
  const checks = evaluateChecks(project);
  const refused = hasRefuse(checks);
  const refuses = checks.filter((check) => check.level === "refuse");
  const warnings = checks.filter((check) => check.level === "warn");
  const usedIds = usedSpeciesIds(project);
  const blockPath = project.shopPath === "block";
  const wasteText = derived.wasteRatio == null ? "—" : `${(derived.wasteRatio * 100).toFixed(1)}%`;
  const unitLabel = unit === "in" ? "дюймы" : "миллиметры";

  return (
    <article id="shop-instruction" className={`sheet-doc${refused ? " is-refused" : ""}`}>
      {refused && (
        <div className="sheet-refuse">
          <p>Печать запрещена — такой доски нет.</p>
          <ul>
            {refuses.map((check, index) => (
              <li key={`${check.code}-${index}`}>{check.message}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="sheet-print-body">
      <header className="sheet-head">
        <div>
          <p className="sheet-kicker">ЦЕХОВАЯ ИНСТРУКЦИЯ</p>
          <h1>{project.name}</h1>
          <p className="sheet-sub">{blockPath ? "шашки → ряды → щит" : "палки → ломти"}</p>
        </div>
        <dl className="sheet-facts">
          <div>
            <dt>Готовый размер</dt>
            <dd>
              {formatLength(project.board.length, unit)} × {formatLength(project.board.width, unit)} ×{" "}
              {formatLength(project.board.thickness, unit)}
            </dd>
          </div>
          <div>
            <dt>Единицы</dt>
            <dd>{unitLabel}</dd>
          </div>
          <div>
            <dt>Цех</dt>
            <dd>{blockPath ? "шашки" : "палки"}</dd>
          </div>
        </dl>
      </header>

      <div className="sheet-split">
        <section>
          <h2>Лицо</h2>
          <div className="sheet-face">
            <FacePreview project={project} />
          </div>
        </section>
        <section>
          <h2>Породы</h2>
          {usedIds.length === 0 ? (
            <p className="sheet-empty">В узоре нет пород</p>
          ) : (
            <ul className="sheet-species">
              {usedIds.map((id) => {
                const spec = project.species.find((s) => s.id === id);
                return (
                  <li key={id}>
                    <i style={{ background: spec?.color ?? "#888" }} />
                    <span>{spec?.name ?? id}</span>
                    <b>{spec?.code ?? id}</b>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {blockPath ? (
        <>
          <section>
            <h2>Шашки</h2>
            <dl className="sheet-stats">
              <div>
                <dt>Сторона шашки</dt>
                <dd>{formatLength(project.blockSize, unit)}</dd>
              </div>
              <div>
                <dt>Сетка ряды × столбцы</dt>
                <dd>
                  {derived.blockRows} × {derived.blockCols}
                </dd>
              </div>
              {(derived.remainderX > 0 || derived.remainderY > 0) && (
                <div>
                  <dt>Поле по краю</dt>
                  <dd>
                    {formatLength(derived.remainderX, unit)} × {formatLength(derived.remainderY, unit)}
                  </dd>
                </div>
              )}
              <div>
                <dt>Керф</dt>
                <dd>{labeledLength(project.kerf, unit, project.kerf === DEFAULT_KERF)}</dd>
              </div>
              <div>
                <dt>Запас по длине</dt>
                <dd>{labeledLength(project.extraLength, unit, project.extraLength === DEFAULT_EXTRA_LENGTH)}</dd>
              </div>
              <div>
                <dt>Припуск на фуговку</dt>
                <dd>{labeledLength(project.surfacing, unit, project.surfacing === DEFAULT_SURFACING)}</dd>
              </div>
              <div>
                <dt>Выравнивание</dt>
                <dd>{labeledLength(project.squareUp, unit, project.squareUp === DEFAULT_SQUARE_UP)}</dd>
              </div>
            </dl>
          </section>
          <section>
            <h2>Ряды · {derived.blockRows}</h2>
            <CourseMap project={project} />
          </section>
        </>
      ) : (
        <>
          <section>
            <h2>Поколение 1</h2>
            <StickOrderMap project={project} unit={unit} />
            <dl className="sheet-stats">
              <div>
                <dt>Заготовка Д × Ш × Т</dt>
                <dd>
                  {formatLength(derived.blank.length, unit)} × {formatLength(derived.blank.width, unit)} ×{" "}
                  {formatLength(derived.blank.thickness, unit)}
                </dd>
              </div>
              <div>
                <dt>Ширина мотива</dt>
                <dd>
                  {labeledLength(
                    project.motifWidth,
                    unit,
                    project.motifWidth === DEFAULT_MOTIF_WIDTH,
                  )}
                </dd>
              </div>
              <div>
                <dt>Керф</dt>
                <dd>{labeledLength(project.kerf, unit, project.kerf === DEFAULT_KERF)}</dd>
              </div>
              <div>
                <dt>Запас по длине</dt>
                <dd>{labeledLength(project.extraLength, unit, project.extraLength === DEFAULT_EXTRA_LENGTH)}</dd>
              </div>
              <div>
                <dt>Припуск на фуговку</dt>
                <dd>{labeledLength(project.surfacing, unit, project.surfacing === DEFAULT_SURFACING)}</dd>
              </div>
              <div>
                <dt>Выравнивание</dt>
                <dd>{labeledLength(project.squareUp, unit, project.squareUp === DEFAULT_SQUARE_UP)}</dd>
              </div>
            </dl>
          </section>
          <section>
            <h2>Торцовка</h2>
            <dl className="sheet-stats">
              <div>
                <dt>Ширина реза</dt>
                <dd>{formatLength(derived.crosscutWidth, unit)}</dd>
              </div>
              <div>
                <dt>Полос</dt>
                <dd>{derived.stripCount}</dd>
              </div>
              {derived.widthShortfall > 0 && (
                <div>
                  <dt>Недобор ширины</dt>
                  <dd>{formatLength(derived.widthShortfall, unit)}</dd>
                </div>
              )}
              {derived.widthTrim > 0 && (
                <div>
                  <dt>Обрезь ширины</dt>
                  <dd>{formatLength(derived.widthTrim, unit)}</dd>
                </div>
              )}
              {derived.lengthShortfall > 0 && (
                <div>
                  <dt>Недобор длины</dt>
                  <dd>{formatLength(derived.lengthShortfall, unit)}</dd>
                </div>
              )}
              {derived.lengthTrim > 0 && (
                <div>
                  <dt>Обрезь длины</dt>
                  <dd>{formatLength(derived.lengthTrim, unit)}</dd>
                </div>
              )}
            </dl>
          </section>
          <section>
            <h2>Поколение 2 · {derived.stripCount}</h2>
            <StripMap project={project} unit={unit} count={derived.stripCount} />
          </section>
        </>
      )}

      <section>
        <h2>Раскрой</h2>
        <table className="sheet-takeoff">
          <thead>
            <tr>
              <th>Порода</th>
              <th>Ширина</th>
              <th>Длина</th>
              {blockPath ? <th>Шашки</th> : null}
            </tr>
          </thead>
          <tbody>
            {derived.takeoff.map((row, index) => (
              <tr key={`${row.speciesId}-${index}`}>
                <td>{row.speciesName}</td>
                <td>{formatLength(row.width, unit)}</td>
                <td>{formatLength(row.length, unit)}</td>
                {blockPath ? <td>{row.blocks > 0 ? row.blocks : "—"}</td> : null}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="sheet-waste">
          Отход <b>{wasteText}</b>
        </p>
      </section>

      <section>
        <h2>Предупреждения</h2>
        {warnings.length === 0 ? (
          <p className="sheet-empty">Предупреждений нет</p>
        ) : (
          <ul className="sheet-warns">
            {warnings.map((check, index) => (
              <li key={`${check.code}-${index}`}>{check.message}</li>
            ))}
          </ul>
        )}
        <p className="sheet-caution">Торцы через рейсмус рвутся — подпорный брусок или ручной рубанок.</p>
      </section>
      </div>
    </article>
  );
}
