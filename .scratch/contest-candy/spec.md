# Spec: shop-ready end-grain tool

One-week contest candy. A carpenter invents a pattern, sees the board, understands cuts and glue-ups, sizes parts, counts stock and waste, saves, and prints a shop instruction. After this spec, we build.

Source of truth: the contest brief, then this file. Woodcut Studio and ТОРЦЕГРАММА are evidence. Carpenter beats vibe. Working product beats a long list. Vocabulary: [`CONTEXT.md`](../../CONTEXT.md). Construction decision: [`docs/adr/0001-glue-first-construction.md`](../../docs/adr/0001-glue-first-construction.md).

## Product

- **Form:** Vite/React web app in this repo. Open a URL in a desktop browser, land on a template board, edit or generate, print. No accounts, stores, installers, or native wrappers.
- **Language:** Russian only.
- **Units:** millimetres stored and default; one toggle to inches.
- **Money:** none.

## Construction

Glue-first, two generations.

1. Mill sticks (species + width).
2. Generation 1 — long-grain panel. Thickness → motif width. Width → finished width.
3. Crosscut strips. Width = finished thickness + surfacing.
4. Rotate end grain up.
5. Rearrange whole strips (flip, swap, offset).
6. Generation 2 — the board.

The face is a consequence. Generators and templates write a stick list + strip map. The tool must not emit what the shop cannot build.

Templates this week: stripes, checker, brick. Generate: random stick widths/species from the palette + random strip flips/offsets.

## Desk

Keep the Woodcut chassis: dark workbench, ember `#F26B38`, three zones, Space Grotesk + IBM Plex Mono. Steal Noofit’s object-first desk, no modal, board as identity. Kill the library dialog (thumbs on the desk) and the fake BUILD/COST panels.

**Stage:** 2D top = end-grain face. 3D = thick extrusion; top is the face; long edges show the strip stack. Orbit, clamped pitch, reset. No explode, no photoreal hero.

**Inspector Build** is the shop instruction.

## Numbers

| Quantity | Source |
| --- | --- |
| Finished L × W × T | input |
| Sticks | input / accepted template or generate |
| Kerf | input, default 3.2 mm, labeled |
| Surfacing | input, default 2 mm, labeled |
| Extra length / square-up | input, defaults 20 / 10 mm, labeled |
| Strip count, crosscut width, gen-1 blank, takeoff, waste | derived |

No cost, weight, or work-hours.

## Checks

**Refuse** (no PDF): empty or non-positive sticks; stick < 12 mm; thickness < 18 mm; blank shorter than strips × (T + surfacing) + strips × kerf; kerf < 0; a non-sequence face.

**Warn** (print anyway): stick < 18 mm; thickness < 25 or > 50 mm; > 4 species; width > 400 mm; surfacing 0; extra length 0; kerf > 5 mm.

Do not check rings, moisture, glue, clamps, their machines, or lumber packing.

## Print

One document, same as on-screen Build: name, finished size, 2D thumbnail, species, gen-1 (order, blank, kerf, extra, surfacing), crosscut, gen-2 strip map, takeoff + waste, warnings, one surfacing caution.

Off paper: 3D, cost, seed, chrome.

## Save

JSON in localStorage and as a downloadable file. Millimetres. `version`, `name`, `board`, `kerf`, `surfacing`, `extraLength`, `squareUp`, `species[]`, `sticks[]`, `strips[]`. No cost, image, or camera.

## In / later / out

**In:** editor, several woods, rotate/flip as strip ops, board size, save, pattern image export, generate, short templates, on-desk 3D, kerf, cut map, glue-up, takeoff, waste, mm/in, PDF, physical checks.

**Later:** cost (then carpenter-edited ₽/m³), 3D explode, cut-list optimization, gen 3+, English, insane feature.

**Out:** image → pattern, accounts, cloud, marketplace, rewriting the brief.

## Not this spec

How pretty the wood shader is. Porting ТОРЦЕГРАММА’s engine (do not). The unnamed insane feature.
