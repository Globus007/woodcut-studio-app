import type { Unit } from "./types";

export function formatLength(mm: number, unit: Unit): string {
  if (unit === "in") return `${(mm / 25.4).toFixed(2)}″`;
  return `${Number.isInteger(mm) ? mm : Math.round(mm * 10) / 10} мм`;
}

export function toDisplay(mm: number, unit: Unit): number {
  if (unit === "in") return Math.round((mm / 25.4) * 100) / 100;
  return mm;
}

export function fromDisplay(value: number, unit: Unit): number {
  if (unit === "in") return Math.round(value * 25.4 * 10) / 10;
  return value;
}
