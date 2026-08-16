# Spec: shop-ready end-grain tool

One-week contest candy. A carpenter invents a pattern, sees the board, understands cuts and glue-ups, sizes parts, counts stock and waste, saves, and prints a shop instruction. After this spec, we build.

Source of truth: the contest brief, then this file. Woodcut Studio and ТОРЦЕГРАММА are evidence. Carpenter beats vibe. Working product beats a long list. Vocabulary: [`CONTEXT.md`](../../CONTEXT.md).

Decisions: [ADR-0001](../../docs/adr/0001-glue-first-construction.md) glue-first · [ADR-0002](../../docs/adr/0002-two-shop-paths.md) two shop paths · [ADR-0003](../../docs/adr/0003-shop-instruction-is-a-sheet-page.md) sheet page · [ADR-0004](../../docs/adr/0004-motif-width-is-an-input.md) motif width · [ADR-0005](../../docs/adr/0005-strip-width-shortfall-is-not-a-remainder.md) width leftover · [ADR-0006](../../docs/adr/0006-strip-count-is-stored.md) strip count and length leftover · [ADR-0007](../../docs/adr/0007-block-to-strip-restores.md) block-to-strip restores.

## Product

- **Form:** Vite/React web app in this repo. Open a URL in a desktop browser, land on a template board, edit or generate, print. No accounts, stores, installers, or native wrappers.
- **Language:** Russian only. No English chrome, including the sheet kicker.
- **Units:** millimetres stored and default; one toggle to inches. One system at a time. Persist the toggle in `localStorage` next to the project so a new tab does not revert to mm. Do not autosave the draft.
- **Money:** none.

A project is on exactly one **shop path**: strip or block. Mixing them on one face — painting blocks while printing a strip instruction — is forbidden.

## Construction

### Strip path

Glue-first, two generations. The face is a consequence.

1. Mill sticks (species + width).
2. Generation 1 — long-grain panel. The carpenter sets **motif width**; that is the panel thickness and the width of each strip on the finished face. It is not a stick width. As glued, panel width is the stick sum; after jointing that width is the finished board width.
3. Crosscut strips. Crosscut width = finished thickness + surfacing.
4. Rotate end grain up.
5. Rearrange whole strips (flip, swap, offset). Add or remove a strip when coverage does not match length.
6. Generation 2 — the board.

Finished L × W × T stay inputs. Stick widths stay inputs. Motif width stays an input. Strip count is stored: `strips[]` is the count. Add or remove a strip changes that list only — length does not move. Changing length or motif does not rewrite flip/offset rows and does not pad or truncate the list.

Coverage is `count × motif`. Built size vs finished size on each axis is **shortfall** or **trim**, never a block-path remainder field.

| Axis | Built | Shortfall | Trim |
| --- | --- | --- | --- |
| Width | stick sum | hole on the far edge; that board does not exist; refuse | clip the face to W from the first stick; warn; print allowed |
| Length | count × motif | hole on the far end; that board does not exist; refuse | clip the face to L from the first strip; warn; print allowed |

Float epsilon only. They type a new length or width if they want a clean fit. No “fit length” button.

Add a strip: append `{ flip: false, offset: 0 }`. Remove: drop that row. Empty list → refuse.

Gen-1 blank: length = `count × (T + surfacing) + count × kerf + extraLength`; width = **stick sum + square-up** (not finished width + square-up); thickness = motif width.

The tool must not emit what the shop cannot build. Generators and templates write a stick list + a strip map + an explicit motif width.

### Block path

Blocks on the face, glued into courses, courses glued into the board. The shop instruction names blocks and courses, not generations.

- Block face size is an input (default 20 mm, standard-width chips plus a millimetre field). Block height is board thickness.
- Courses fill `floor(W / size)` columns by `floor(L / size)` rows. Leftover millimetres on the far edges are a **remainder field** (dark, empty). That field is allowed on this path only. Warn, print allowed.
- Photo import maps onto courses; the carpenter corrects with a brush. Photo exists only on this path.
- Strip → block bakes the current face onto the grid. Block → strip restores the stored stick-and-strip construction; it does not read the grid back into sticks. The carpenter is warned that the block face (photo, brush, rows) leaves the desk.

### Templates and generate

Start set on the desk: stripes, checker, brick, herring, weave, sunset, butcher, accent. Those eight are frozen presets. Generate is a family plus a seed, not independent snow.

On the **block path**, generate paints the existing course grid with a named field: swirl, rings, waves, nested, terrazzo, chevron, noise. The carpenter picks the family and a scale `k` (1–4, default 2). Generate keeps typed L × W × T, block size, and the species list; it rewrites only `courses`. Family, seed, and scale are inspector state — not in the project file.

On the **strip path**, the desk thumbs *are* the family. Generate varies the selected (or last) template: new sticks and strip map inside that family. No second chip row. If no template is selected, generate picks one of the eight. It does not paint rings, swirl, frames, waves, or terrazzo onto sticks.

On the strip path, templates and generate:

- write `width = stickSum` so a new pattern does not open in width shortfall;
- keep typed length;
- write `count = max(1, ceil((length − ε) / motif))` so a new pattern does not open in length shortfall (trim-warn on a 409 mm board is allowed);
- write `motifWidth: 20` on a fresh board; when applied onto an existing project, keep that project’s motif width and thickness;
- generate keeps the project’s motif width — it does not read the new sticks;
- generate accumulates sticks until their sum covers the typed width, then sets `width = stickSum` so the board does not jump smaller;
- generate stays inside the family: accent is a field plus one 15 mm vein; butcher is a 40/20 rhythm; sunset orders species by the house lightness run; checker is alternate flips; brick / herring / weave offsets are stick-width steps, not motif.

## Desk

Keep the Woodcut chassis: dark workbench, ember `#F26B38`, Space Grotesk + IBM Plex Mono. Steal Noofit’s object-first desk, no modal, board as identity. Kill the library dialog (thumbs on the desk) and the fake BUILD/COST panels. Do not redraw the chassis. Do not add a left rail. Do not purge dead CSS this pass.

**Stage:** 2D top = end-grain face, to scale in millimetres, no flex. 3D = thick extrusion; top is the face; long edges show the strip stack (strip path) or the course stack (block path). Orbit, pitch clamped about 10°–70°, no roll, reset. No explode, no photoreal hero, no dimensions in 3D.

**Strip-path face:** rectangle is the typed L × W. First stick at the origin (generation-1 order). First strip at the origin (generation-2 order). Sticks and strips in millimetres. Shortfall is a hole, not a painted empty field. Trim is clipped — the extra is not drawn on the finished face.

**Block-path face:** grid of block-size cells plus the remainder field on the far edges.

**Inspector:** the pattern form, not the shop instruction.

- Shop-path switch: ПАЛКИ / ШАШКИ. Heading **КАК КЛЕИМ**. Each side has a one-sentence recipe. Either direction asks before discarding the face that is leaving the desk.
- Motif width (strip path): one millimetre field plus standard-width chips (15, 20, 25, 30, 40). They can type 18.
- Sticks: species, width, add, remove.
- Strips: flip, offset, add, remove, **up/down swap**. Not drag on the face.
- Block size + brush (block path only).
- Board L × W × T. Kerf, surfacing, extra length, square-up — each default labeled.
- Generate. On the block path: family chips (вихрь, кольца, волны, рамки, терраццо, шевроны, органика) and scale 1–4. On the strip path: no extra chips — the desk thumbs select the family. Templates as whole-board thumbs on the desk.
- **«Фото на шашки»** is hidden on the strip path. No silent path switch.

**Footer / status:** waste; gen-1 blank (strip) or grid size (block); unit toggle; **ЛИСТ**. List **every** refuse. Warns as the full list or a count plus the lines. Name width and length leftover as shortfall or trim, next to the board — not only on the sheet.

The shop instruction is its own page (`/instruction`), opened from the footer. The desk is not paper.

## Numbers

Stored millimetres. Never show a number that looks measured if it is a default or a derivation — label the source.

| Quantity | Source |
| --- | --- |
| Finished L × W × T | input |
| Motif width | input, default 20 mm, labeled |
| Sticks (species + width) | input / accepted template or generate |
| Strips (flip, offset; count = list length) | input / accepted template or generate |
| Block size, courses | input / accepted template, generate, photo, or brush |
| Kerf | input, default 3.2 mm, labeled |
| Surfacing | input, default 2 mm, labeled |
| Extra length / square-up | input, defaults 20 / 10 mm, labeled |
| Crosscut width | derived = T + surfacing |
| Coverage | derived = count × motif |
| Stick sum | derived |
| Shortfall / trim (each axis) | derived; not a remainder field |
| Block remainder X × Y | derived (block path only) |
| Gen-1 blank | derived (see Construction) |
| Takeoff, waste | derived |

Strip-path takeoff: one row per stick (species, width, length = blank length). Block-path takeoff: one row per species (width = block size, length from block count × (T + surfacing + kerf) + extra, plus how many blocks). Waste = (stock volume − finished volume) / stock volume. Causes: kerf, surfacing, extra, trim, block-path remainder. A shortfall is not waste.

No cost, weight, or work-hours.

## Checks

**Refuse** (no paper):

- Empty stick list, or a stick width ≤ 0 (strip path).
- Empty strip list (strip path).
- Any stick narrower than 12 mm.
- Finished thickness < 18 mm.
- Width shortfall (`stickSum < width`, float epsilon only).
- Length shortfall (`count × motif < length`, float epsilon only).
- Gen-1 blank length shorter than `count × (T + surfacing) + count × kerf`.
- Kerf < 0.
- A face that is not a gen-1 + gen-2 rearrangement (unrepresentable; a generator bug).
- Block path: no blocks (size ≤ 0 or grid 0); block size < 12 mm; empty courses.

**Warn** (print allowed, named line):

- Stick or block < 18 mm — fiddly.
- Thickness < 25 mm — light for a meat board; > 50 mm — heavy, long clamp time.
- More than 4 species.
- Finished width > 400 mm — wide glue-up.
- Surfacing 0; extra length 0; kerf > 5 mm.
- Width trim; length trim.
- Block-path remainder field > 0.

**Do not check:** rings, moisture, glue, clamps, their machines, lumber packing, photo/swirl as a strip-path pattern.

## Print

One document, on `/instruction`. Browser print of that page is the PDF. The inspector is not the document.

**On screen, always:** the document, plus — if refused — a banner that lists every refuse, and a way back to the desk. The route stays open.

**On paper if any refuse is red:** the refuse list only. No face, no generations, no courses, no takeoff. Print button disabled. `@media print` is the lock (`beforeprint` is optional belt). Soft “button disabled, browser print is their problem” is rejected.

**On paper if printable, in order:**

1. Russian kicker, name, finished L × W × T, units, which shop path.
2. Face thumbnail (2D top).
3. Species used.
4. **Strip path:** generation 1 (stick order, blank, kerf, extra, surfacing, square-up; defaults labeled); crosscut (width, strip count, shortfall/trim if any); generation 2 strip map (number, flip, offset).
5. **Block path:** block size, grid, remainder field if any, allowances; numbered courses.
6. Takeoff + waste %.
7. Fired warnings. One-line surfacing caution (end grain through a planer tears out).

Off paper: 3D, cost, seed, chrome, English keys. Desk Ctrl+P is not a shop-instruction path.

## Save

JSON in `localStorage` (last project, explicit save) and as a downloadable file. Open the same JSON. Millimetres. `version` stays `1`.

```
version
name
shopPath
board { length, width, thickness }
motifWidth
kerf
surfacing
extraLength
squareUp
species[] { id, name, code, color }
sticks[] { speciesId, width }     // gen-1, left → right
strips[] { flip, offset }         // gen-2, stored count
blockSize
courses[][]                       // species ids, row = course
```

`flip` is one shop move (end-for-end + upside-down). `offset` is millimetres along the strip.

Missing `motifWidth` on an old file: `sticks[0].width ?? 20`. Next save writes the field. After that, do not infer from sticks.

`parseProject` must not resize `strips[]` to `round(length / motif)`.

Out of the file: cost, seed, image bits, 3D camera, UI chrome, English labels.

## In / later / out

**In:** editor, two shop paths, several woods, strip ops (flip / swap / offset / add / remove), board size, motif width, save, pattern image export, generate, short templates, on-desk 3D, kerf, cut map, glue-up, takeoff, waste, mm/in, sheet-page PDF, physical checks, photo-on-blocks + brush.

**Later:** cost (then carpenter-edited ₽/m³), 3D explode, cut-list optimization, gen 3+, English, insane feature, draft autosave, chassis redraw, dead-CSS purge.

**Out:** photo on the strip path, accounts, cloud, marketplace, rewriting the brief, treating a shortfall as a remainder field, deriving motif from the first stick, deriving strip count from length.

## Not this spec

How pretty the wood shader is. Porting ТОРЦЕГРАММА’s engine (do not). The unnamed insane feature.
