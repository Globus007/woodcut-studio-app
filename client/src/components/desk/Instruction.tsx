import type { JSX } from "react";
import { FacePreview } from "@/components/desk/FacePreview";
import {
  DEFAULT_EXTRA_LENGTH,
  DEFAULT_KERF,
  DEFAULT_SQUARE_UP,
  DEFAULT_SURFACING,
  derive,
  evaluateChecks,
  formatLength,
  hasRefuse,
} from "@/domain";
import type { Project, Unit } from "@/domain";

function labeledLength(mm: number, unit: Unit, isDefault: boolean): string {
  const text = formatLength(mm, unit);
  return isDefault ? `${text} · дефолт` : text;
}

function speciesName(project: Project, speciesId: string): string {
  return project.species.find((s) => s.id === speciesId)?.name ?? speciesId;
}

export function Instruction(props: {
  project: Project;
  unit: Unit;
}): JSX.Element {
  const { project, unit } = props;
  const derived = derive(project);
  const checks = evaluateChecks(project);
  const refused = hasRefuse(checks);
  const warnings = checks.filter((check) => check.level === "warn");
  const usedIds: string[] = [];
  const source = project.shopPath === "block" ? project.courses.flat() : project.sticks.map((stick) => stick.speciesId);
  for (const id of source) {
    if (!usedIds.includes(id)) usedIds.push(id);
  }
  const blockPath = project.shopPath === "block";
  const wasteText =
    derived.wasteRatio == null ? "—" : `${(derived.wasteRatio * 100).toFixed(1)}%`;
  const unitLabel = unit === "in" ? "дюймы" : "миллиметры";

  return (
    <article id="shop-instruction">
      {refused && (
        <section className="panel-section">
          <div className="stat-line">
            <span>Печать запрещена</span>
            <b>проверка не пройдена</b>
          </div>
        </section>
      )}

      <section className="panel-section">
        <div className="section-heading">
          <span>ДОСКА</span>
        </div>
        <div className="stat-line">
          <span>Имя</span>
          <b>{project.name}</b>
        </div>
        <div className="stat-line">
          <span>Цех</span>
          <b>{blockPath ? "шашки → ряды → щит" : "палки → ломти"}</b>
        </div>
        <div className="stat-line">
          <span>Готовый размер Д × Ш × Т</span>
          <b>
            {formatLength(project.board.length, unit)} × {formatLength(project.board.width, unit)} ×{" "}
            {formatLength(project.board.thickness, unit)}
          </b>
        </div>
        <div className="stat-line">
          <span>Единицы</span>
          <b>{unitLabel}</b>
        </div>
      </section>

      <section className="panel-section">
        <div className="section-heading">
          <span>ЛИЦО</span>
        </div>
        <div className="instruction-face">
          <FacePreview project={project} />
        </div>
      </section>

      <section className="panel-section">
        <div className="section-heading">
          <span>ПОРОДЫ</span>
        </div>
        {usedIds.length === 0 ? (
          <div className="stat-line">
            <span>В узоре</span>
            <b>нет</b>
          </div>
        ) : (
          usedIds.map((id) => (
            <div className="stat-line" key={id}>
              <span>{speciesName(project, id)}</span>
              <b>{project.species.find((s) => s.id === id)?.code ?? id}</b>
            </div>
          ))
        )}
      </section>

      {blockPath ? (
        <>
          <section className="panel-section">
            <div className="section-heading">
              <span>ШАШКИ</span>
            </div>
            <div className="stat-line">
              <span>Сторона шашки</span>
              <b>{formatLength(project.blockSize, unit)}</b>
            </div>
            <div className="stat-line">
              <span>Сетка ряды × столбцы</span>
              <b>
                {derived.blockRows} × {derived.blockCols}
              </b>
            </div>
            {(derived.remainderX > 0 || derived.remainderY > 0) && (
              <div className="stat-line">
                <span>Поле по краю</span>
                <b>
                  {formatLength(derived.remainderX, unit)} × {formatLength(derived.remainderY, unit)}
                </b>
              </div>
            )}
            <div className="stat-line">
              <span>Керф</span>
              <b>{labeledLength(project.kerf, unit, project.kerf === DEFAULT_KERF)}</b>
            </div>
            <div className="stat-line">
              <span>Запас по длине</span>
              <b>{labeledLength(project.extraLength, unit, project.extraLength === DEFAULT_EXTRA_LENGTH)}</b>
            </div>
            <div className="stat-line">
              <span>Припуск на фуговку</span>
              <b>{labeledLength(project.surfacing, unit, project.surfacing === DEFAULT_SURFACING)}</b>
            </div>
            <div className="stat-line">
              <span>Выравнивание</span>
              <b>{labeledLength(project.squareUp, unit, project.squareUp === DEFAULT_SQUARE_UP)}</b>
            </div>
          </section>

          <section className="panel-section">
            <div className="section-heading">
              <span>РЯДЫ</span>
              <span>{derived.blockRows}</span>
            </div>
            {project.courses.map((course, index) => {
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
              return (
                <div className="step" key={index}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {runs.join(" · ")}
                </div>
              );
            })}
          </section>
        </>
      ) : (
        <>
          <section className="panel-section">
            <div className="section-heading">
              <span>ПОКОЛЕНИЕ 1</span>
            </div>
            {project.sticks.map((stick, index) => (
              <div className="step" key={`${stick.speciesId}-${index}`}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {speciesName(project, stick.speciesId)} · {formatLength(stick.width, unit)}
              </div>
            ))}
            <div className="stat-line">
              <span>Заготовка Д × Ш × Т</span>
              <b>
                {formatLength(derived.blank.length, unit)} × {formatLength(derived.blank.width, unit)} ×{" "}
                {formatLength(derived.blank.thickness, unit)}
              </b>
            </div>
            <div className="stat-line">
              <span>Керф</span>
              <b>{labeledLength(project.kerf, unit, project.kerf === DEFAULT_KERF)}</b>
            </div>
            <div className="stat-line">
              <span>Запас по длине</span>
              <b>{labeledLength(project.extraLength, unit, project.extraLength === DEFAULT_EXTRA_LENGTH)}</b>
            </div>
            <div className="stat-line">
              <span>Припуск на фуговку</span>
              <b>{labeledLength(project.surfacing, unit, project.surfacing === DEFAULT_SURFACING)}</b>
            </div>
            <div className="stat-line">
              <span>Выравнивание</span>
              <b>{labeledLength(project.squareUp, unit, project.squareUp === DEFAULT_SQUARE_UP)}</b>
            </div>
          </section>

          <section className="panel-section">
            <div className="section-heading">
              <span>ТОРЦОВКА</span>
            </div>
            <div className="stat-line">
              <span>Ширина реза</span>
              <b>{formatLength(derived.crosscutWidth, unit)}</b>
            </div>
            <div className="stat-line">
              <span>Полос</span>
              <b>{derived.stripCount}</b>
            </div>
            {derived.remainder !== 0 && (
              <div className="stat-line">
                <span>Остаток</span>
                <b>{formatLength(derived.remainder, unit)}</b>
              </div>
            )}
          </section>

          <section className="panel-section">
            <div className="section-heading">
              <span>ПОКОЛЕНИЕ 2</span>
              <span>{derived.stripCount}</span>
            </div>
            {Array.from({ length: derived.stripCount }, (_, index) => {
              const strip = project.strips[index] ?? { flip: false, offset: 0 };
              return (
                <div className="step" key={index}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  переворот {strip.flip ? "да" : "нет"} · сдвиг {formatLength(strip.offset, unit)}
                </div>
              );
            })}
          </section>
        </>
      )}

      <section className="panel-section">
        <div className="section-heading">
          <span>РАСКРОЙ</span>
        </div>
        {derived.takeoff.map((row, index) => (
          <div className="stat-line" key={`${row.speciesId}-${index}`}>
            <span>
              {row.speciesName} · {formatLength(row.width, unit)}
              {row.blocks > 0 ? ` · ${row.blocks} шаш.` : ""}
            </span>
            <b>{formatLength(row.length, unit)}</b>
          </div>
        ))}
        <div className="stat-line">
          <span>Отход</span>
          <b>{wasteText}</b>
        </div>
      </section>

      <section className="panel-section">
        <div className="section-heading">
          <span>ПРЕДУПРЕЖДЕНИЯ</span>
        </div>
        {warnings.length === 0 ? (
          <div className="stat-line">
            <span>Предупреждений нет</span>
            <b>—</b>
          </div>
        ) : (
          warnings.map((check, index) => (
            <div className="stat-line" key={`${check.code}-${index}`}>
              <span>{check.message}</span>
            </div>
          ))
        )}
      </section>

      <section className="panel-section">
        <div className="stat-line">
          <span>Торцы через рейсмус рвутся — подпорный брусок или ручной рубанок.</span>
        </div>
      </section>
    </article>
  );
}
