import { describe, expect, it } from "vitest";
import { toDisplay } from "./units";

describe("toDisplay", () => {
  it("rounds millimetre float noise", () => {
    expect(toDisplay(3.200000047683716, "mm")).toBe(3.2);
    expect(toDisplay(20, "mm")).toBe(20);
  });
});
