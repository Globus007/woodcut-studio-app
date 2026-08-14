# What the printed instruction contains

Type: grilling
Status: resolved
Blocked by: 03
Part of: Contest candy: spec for a shop-ready end-grain tool

## Question

What is on the one PDF the carpenter takes to the shop?

[Which brief bonuses belong in this spec](./04-which-brief-bonuses-belong-in-this-spec.md) put the PDF **in** as one artifact of the shop path, not `window.print()` of the UI. [How an end-grain board is actually built](./01-how-end-grain-boards-are-built.md) already lists what a shop instruction must name to reproduce a board without guessing (species and gen-1 order, blank size with kerf, crosscut width and strip count, strip map for gen-2, plus later-ticket numbers).

This ticket is the page inventory, not the honesty of each number ([How real each instruction number must be](./08-how-real-each-instruction-number-must-be.md)) and not the project file format.

Answer with the ordered sections of the PDF, what is deliberately left off the paper (3D, cost, generator seed, …), and whether the on-screen instruction is the same document or a shorter preview.

## Answer

One printable document. The inspector **Build** view *is* that document (print CSS / `window.print` of this sheet only — not the whole app chrome).

**On the paper, in order:**

1. Name, finished L × W × T, units.
2. Face thumbnail (2D top) — so they know which board this is.
3. Species list used.
4. **Generation 1** — stick order left → right (species + width), target blank L × W × thickness, kerf, extra length, surfacing. Each default labeled.
5. **Crosscut** — width, strip count, remainder note if length does not divide cleanly.
6. **Generation 2** — numbered strip map: which strip is flipped, any offset.
7. **Takeoff** — one row per stick to rip (species, width, length). Waste % as derived.
8. Fired **warnings**. One-line surfacing caution (end grain through a planer tears out).

**Off the paper:** 3D, cost, generator seed, palette lab, rail, Noofit chrome, work-hours, weight, English keys.

If a hard-refuse check is red, there is no paper.
