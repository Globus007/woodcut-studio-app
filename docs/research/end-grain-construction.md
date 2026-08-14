# How an end-grain board is actually built

Evidence for [Which manufacturing model the spec assumes](../../.scratch/contest-candy/issues/03-which-manufacturing-model-the-spec-assumes.md). Not a product spec.

## Sources

| Source | Role | What this session actually got |
| --- | --- | --- |
| Jonathan Brower, [“Make mosaic cutting boards”](https://www.finewoodworking.com/2021/12/07/make-mosaic-cutting-boards), *Fine Woodworking* #294 (Jan/Feb 2022) | Primary shop process, mosaic / multi-generation. | Full free-tier article body: first edge-glue, 90° crosscut, flip end-grain up, then further angled generations. Later pages are paywalled; claims below use only the published text. |
| Mark Koons, [“End-Grain Coffee Table”](https://www.finewoodworking.com/project-guides/tables-and-desks/end-grain-up), *Fine Woodworking* #205 (May/June 2009) | Primary: two-glue-up geometry, grain-balance, kerf, what is *not* done. | Long published excerpt: two big glue-ups, strip flips, dimension relationships, wood movement. |
| Tim Albers, [“Smart, Stylish Cutting Boards”](https://www.finewoodworking.com/project-guides/beginner-projects/smart-stylish-cutting-boards), *Fine Woodworking* #183 (Mar/Apr 2006) | Primary: why end grain, species caution. | Free-tier synopsis + species/function notes. Construction steps are paywalled and unused. |
| Marc Spagnuolo, [“Make an End-Grain Cutting Board”](https://www.finewoodworking.com/project-guides/beginner-projects/make-an-end-grain-cutting-board), *Fine Woodworking* #190 (Mar/Apr 2007) | Pointer only. | Page is a video-excerpt stub (maple + purpleheart). No step list on the page; not used as process evidence. |
| Scott Lewis, [“A Unique Cutting Board”](https://www.finewoodworking.com/2013/04/04/a-unique-cutting-board), *Fine Woodworking* #233 (May/June 2013) | Contrast: not strip-mosaic end grain. | Curved through-thickness inlay via router template. Different method; cited only to keep it out of the strip model. |
| R. Bruce Hoadley, *Understanding Wood* (The Taunton Press, 2005), cited by Koons | Primary textbook for shrinkage. | Not opened this session. Koons names it (and USDA Forest Products Laboratory) as the place to look up radial/tangential rates. |
| John Boos / butcherblockco manufacturer pages | Wanted first-party factory notes. | butcherblockco.com returned unavailable here. Not cited. |
| `docs/inspiration.html` (ТОРЦЕГРАММА) | In-repo contrast, not shop physics. | Grid → row-runs → lamella → panel + `packRects`. |

Forum posts, Instructables, YouTube recaps, and Reddit were not used as sources.

## 1. Named stages, in order

Shop end-grain is **laminate, slice, rotate, laminate again** — not a pile of independent cubes.

Koons states the process in one sentence: two big glue-ups, “a long grain glue-up and then an end-grain glue-up. Basically, he glues sticks together, surfaces and crosscuts them, and then reglues them as end grain.” He also says what it is *not*: “Creating fields of end grain does not require fitting together hundreds of little cubes. Nor does it involve sawing off laminations like slices of salami, although some manufacturers do exactly that.”

Brower describes the same first two stages, then extra generations: “I start by gluing together pieces of different widths and lengths much as with any other edge glue-up for a cutting board. After the first glue-up is surfaced, I crosscut it at 90°, and then cut it into strips. I turn the strips end-grain up… rearrange the strips and then glue them back together.” After that end-grain-up assembly he “really start[s] slicing, dicing, and reassembling,” cutting a few degrees off 90° before ripping into strips. “In the end, I’ll have done five separate glue-ups, the last three with strips cut on an angle.”

Named stages a later spec can use:

| Stage | What happens | What the face learns |
| --- | --- | --- |
| **Mill** | Rip sticks. Heights match; widths and species may vary (Brower). | Stick widths become the *period* of the first pattern. |
| **Generation 1 — long-grain panel** | Edge-glue sticks into a panel. Surface. | This panel *is* the repeating motif. Its **thickness** becomes the **width of the motif** on the finished face (Koons). |
| **Crosscut** | Cut the panel into strips. Strip **width** becomes finished **board thickness** (Koons: 1 in top → crosscuts 1 1/32 in). | Kerf is consumed *along the panel’s length*. You must add kerfs into gen-1 length (Koons: “18 in plus the amount of 15 sawkerfs”). |
| **Rotate** | Stand each strip so end grain faces up. | The gen-1 motif is now the face. |
| **Rearrange** | Flip, rotate, swap strips. Brower: “playtime.” Koons: mark, experiment, then “flip every other stick upside down and end for end.” | This is almost the only freedom after gen-1: **whole strips**, not cells. |
| **Generation 2 — end-grain panel** | Glue the standing strips. Surface (carefully: end-grain through a planer/jointer tears out — Brower). | Finished board, or the blank for more generations. |
| **Generations 3+** (optional) | Crosscut the *end-grain* blank, often off-square, rip, reglue (Brower). | Distorts the motif (skew, chevron-ish, mosaic). Each generation is another full glue-up. |

Albers (why, not how): end-grain boards are for meat / pounding; they dull knives less than edge or face grain; extra mass keeps the board still. Maple is the traditional species. Avoid oily or allergenic woods (rosewoods/cocobolo, olive, yew, sassafras) and softwoods.

## 2. What one glue-up generation buys

A generation is **one clamp-up of full-length members**, not one cell.

- **Gen 1** buys a *1-D motif*: a sequence of species (and widths) that will appear as a repeating stripe across every later strip. You cannot change that sequence per strip without building a *different* gen-1 panel.
- **Gen 2** buys a *2-D face* by stacking those identical (or flipped) slices. Checker, offset brick, and “controlled chaos of strips” live here. Independent pixels do **not**.
- **Gen 3+** (Brower) buys distortion: small off-90° cuts “elevate” a traditional glue-up into a mosaic. Still strip-based. Still not an arbitrary bitmap.

Koons’s dimension identities, which a shop instruction must print:

- gen-1 **thickness** → motif **width** on the face
- crosscut **width** → finished **thickness**
- gen-1 **length** ≥ (number of strips × crosscut width) + (kerfs) + waste
- gen-1 **width** ≈ finished board **width** (plus square-up)

Brower on cost of extra generations: “typically, three to four times the board footage is required to net one board foot of finished board.” First bundles stay “under 13 in. wide, under 2 in. thick” for his machines.

## 3. Contest pattern families vs generations

Constructible = can be produced by the strip process above without assembling hundreds of cubes.

| Pattern | Generations | Verdict | Why (from the sources, not from taste) |
| --- | --- | --- | --- |
| **Stripes** | 1 + rotate + 2 | Shop-standard | Gen-1 is the stripe sequence; gen-2 stacks matching slices. |
| **Checker** | 1 + flip-every-other + 2 | Shop-standard | Koons’s documented move: flip every other stick end-for-end and upside down after crosscut. Two species of equal stick width. |
| **Brick / weave** | 1 + offset + 2 | Shop-possible | Same strips, shifted by a half-period when stacking. Not named by Koons/Brower; it is still whole-strip rearrangement, so it stays inside gen-2 freedom. |
| **Chevron** | 2–3, often angled | Shop-possible as mosaic | Brower’s off-90° later generations. Not a painted zigzag on a grid. |
| **Chaos** (strip) | 2 | Shop-possible | Brower after the first end-grain flip: “rotating, turning, and trading the strips until nothing looks the same.” Chaos is **1-D** (per strip), not per cell. |
| **Rings** | not strip-gen | Jewellery-box / other method | Concentric rings are not rearrangements of one gen-1 panel. Sources do not describe a ring glue-up. Would be cubes, turning, or inlay. |
| **Swirl** | not strip-gen | Jewellery-box / other method | Same: no source produces a spiral by flipping strips. Brower’s mosaics get busy, not orbital. |
| **Image-as-pixels** | cubes or factory “salami” | Fantasy for a strip shop | Koons: you do *not* fit hundreds of cubes; some *manufacturers* slice a laminated blank like salami. An arbitrary photo grid is cube-mosaic or CNC, not two glue-ups. |
| **Lewis curved inlay** | other | Out of this model | Router-template through-thickness inlay. Cite only so it is not confused with end-grain strip work. |

Implication for ТОРЦЕГРАММА: it treats the face as a species **grid**, then interprets **each row** as its own run-length lamella. That is physically a **separate gen-1 for every row** (or a cube mosaic). A shop following Koons/Brower builds **one** gen-1 and slices it. A generator that paints unrelated rows is asking the carpenter to do N first glue-ups, not two.

## 4. Where kerf, thickness, and grain actually constrain the pattern

**Kerf (Koons).** It is a *length tax on generation 1*, not a gap painted on the face. Each crosscut eats one kerf of gen-1 length. The face motif width is gen-1 thickness, which the saw does not shrink. A cut map that “insets every cell by kerf” as if cells were independently sawn is a different (cube) process.

**Thickness (Koons + Brower).** Finished thickness is the crosscut width, after surfacing. Brower surfaces the end-grain-up blank “until it is just clean enough to lie flat.” End-grain through jointer/planer tears out at the trailing end; he chamfers or adds a support block. Albers wants thickness/mass for meat boards. A 6 mm “cell” that is also the board thickness is a different object than a 36 mm-thick board with a 30 mm face motif.

**Grain direction and movement (Koons).** Random strip orientation is a structural defect, not a style. Alternating annular rings restrain each other; a row that all moves the same way, compounded in the next row, “will pull apart in about one year’s time.” Mixed species must be paired by shrinkage (Hoadley / FPL). Smaller and thinner slabs accumulate less stress. Single-species (he names walnut) is easier than a rainbow. This is a **feasibility check** a generator must be allowed to fail.

**Machine envelope (Brower).** First glue-ups sized to clamps, planer, and crosscut capacity — his numbers: < 13 in wide, < 2 in thick, “manageable length.”

## 5. What a shop instruction must list

So a carpenter reproduces one board without guessing, the instruction has to name the **generations**, not only the pretty face:

1. Species list, stick widths, and **gen-1 order** (left → right), plus grain/ring orientation (Koons: mark with pencil and keep marks through every flip).
2. Gen-1 target size, including **kerf allowance** and extra length (“why cut it close?” — Koons).
3. Crosscut width (= finished thickness + surfacing allowance) and how many strips.
4. A **strip map** for gen-2: which strip is flipped end-for-end, which is rotated, any offset. Not a pixel grid unless the model is cubes.
5. Clamp/caul setup and adhesive. Brower: Titebond III, roller, risers, clamps alternating top and bottom. Koons: flexible PVA (yellow glue’s creep is an *asset* for movement), corked cauls, dry run, sometimes glue half the lamination first.
6. Surfacing warning: end-grain-up through jointer/planer (Brower); belt sander / low-angle plane (Koons).
7. Expected waste if generations > 2 (Brower: 3–4× board footage).
8. Species cautions (Albers) if the palette includes oily or allergenic woods.

If the tool cannot emit (1)–(4) from the on-screen pattern, the carpenter cannot build that pattern. That is the test for ticket 03.

## Contrast: ТОРЦЕГРАММА is a different machine

`docs/inspiration.html` `analyze()` walks **rows**, merges same-species **runs**, treats each run as a part `len×cell`, packs those parts onto stock with kerf, then glue-up text says “each row is a lamella, then lamellae into a panel.”

That model is coherent **if** the product is “build every row from bricks, then glue rows.” It is **not** the Koons/Brower shop default. It will happily score a swirl or a photo-grid as “physically realizable” as long as the longest run fits the stock — which says nothing about whether those runs come from one shared gen-1 panel.

A later manufacturing decision is therefore not “which UI tab holds the cut map.” It is: **does the spec generate faces that are rearrangements of one (or few) long-grain panels, or faces that are independent cells?**
