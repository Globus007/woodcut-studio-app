import { derive } from "./derive";
import type { Check, Project } from "./types";

export function evaluateChecks(project: Project): Check[] {
  const derived = derive(project);
  const out: Check[] = [];

  if (project.shopPath === "block") {
    if (project.blockSize <= 0 || derived.blockCols === 0 || derived.blockRows === 0) {
      out.push({
        level: "refuse",
        code: "empty-blocks",
        message: "Нет шашек — сторона слишком велика или равна нулю.",
      });
    }
    if (project.blockSize > 0 && project.blockSize < 12) {
      out.push({
        level: "refuse",
        code: "block-too-small",
        message: `Шашка ${project.blockSize} мм уже 12 мм — так не клеят.`,
      });
    } else if (project.blockSize > 0 && project.blockSize < 18) {
      out.push({
        level: "warn",
        code: "block-fiddly",
        message: `Шашка ${project.blockSize} мм — узко, возиться будете.`,
      });
    }
    if (project.courses.length === 0 && derived.blockCols > 0 && derived.blockRows > 0) {
      out.push({
        level: "refuse",
        code: "empty-courses",
        message: "Сетка шашек пустая — пилить нечего.",
      });
    }
  } else {
    if (project.sticks.length === 0 || project.sticks.some((s) => s.width <= 0)) {
      out.push({
        level: "refuse",
        code: "empty-sticks",
        message: "Нет палок или ширина ≤ 0 — пилить нечего.",
      });
    }

    for (const stick of project.sticks) {
      if (stick.width > 0 && stick.width < 12) {
        out.push({
          level: "refuse",
          code: "stick-too-narrow",
          message: `Палка ${stick.width} мм уже 12 мм — так не клеят.`,
        });
      } else if (stick.width > 0 && stick.width < 18) {
        out.push({
          level: "warn",
          code: "stick-fiddly",
          message: `Палка ${stick.width} мм — узко, возиться будете.`,
        });
      }
    }
  }

  if (project.board.thickness < 18) {
    out.push({
      level: "refuse",
      code: "thin-board",
      message: `Толщина ${project.board.thickness} мм меньше 18 мм.`,
    });
  } else if (project.board.thickness < 25) {
    out.push({
      level: "warn",
      code: "light-board",
      message: `Толщина ${project.board.thickness} мм — легковато для мясной доски.`,
    });
  } else if (project.board.thickness > 50) {
    out.push({
      level: "warn",
      code: "heavy-board",
      message: `Толщина ${project.board.thickness} мм — тяжело и долго зажимать.`,
    });
  }

  if (project.shopPath !== "block") {
    const needed = derived.stripCount * derived.crosscutWidth + derived.stripCount * project.kerf;
    if (derived.stripCount > 0 && derived.blank.length < needed) {
      out.push({
        level: "refuse",
        code: "short-blank",
        message: "Заготовка короче, чем торцовки плюс керф.",
      });
    }
  }

  if (project.kerf < 0) {
    out.push({
      level: "refuse",
      code: "negative-kerf",
      message: "Керф меньше нуля.",
    });
  } else if (project.kerf > 5) {
    out.push({
      level: "warn",
      code: "fat-kerf",
      message: `Керф ${project.kerf} мм — необычно жирный отход.`,
    });
  }

  const used =
    project.shopPath === "block"
      ? new Set(project.courses.flat())
      : new Set(project.sticks.map((s) => s.speciesId));
  if (used.size > 4) {
    out.push({
      level: "warn",
      code: "many-species",
      message: `Пород в узоре: ${used.size}. Больше четырёх — много перенастроек.`,
    });
  }

  if (project.board.width > 400) {
    out.push({
      level: "warn",
      code: "wide-glue",
      message: `Ширина ${project.board.width} мм — широкая склейка.`,
    });
  }

  if (project.surfacing === 0) {
    out.push({
      level: "warn",
      code: "no-surfacing",
      message: "Припуск на фуговку 0 — режете в чистый размер.",
    });
  }

  if (project.extraLength === 0) {
    out.push({
      level: "warn",
      code: "no-extra",
      message: "Запас по длине 0 — зачем резать впритык.",
    });
  }

  if (
    project.shopPath !== "block" &&
    derived.stickSum > 0 &&
    Math.abs(derived.stickSum - project.board.width) > 5
  ) {
    out.push({
      level: "warn",
      code: "width-mismatch",
      message: `Сумма палок ${derived.stickSum} мм, ширина доски ${project.board.width} мм.`,
    });
  }

  if (project.shopPath === "block" && (derived.remainderX > 0 || derived.remainderY > 0)) {
    out.push({
      level: "warn",
      code: "block-remainder",
      message: `По краю остаётся поле ${derived.remainderX} × ${derived.remainderY} мм.`,
    });
  }

  return out;
}

export function hasRefuse(checks: Check[]): boolean {
  return checks.some((c) => c.level === "refuse");
}
