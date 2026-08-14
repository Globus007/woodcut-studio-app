# Which manufacturing model the spec assumes

Type: grilling
Status: resolved
Blocked by: 01
Part of: Contest candy: spec for a shop-ready end-grain tool

## Question

How does a pattern become a physical board in this product?

This is the domain decision everything else hangs from: cut map, glue-up steps, feasibility, 3D explode, waste, and whether a wild generator is allowed to emit jewellery-box fantasy.

Candidates, not a closed list:

- **Grid-then-interpret** (ТОРЦЕГРАММА): the carpenter paints or generates a species grid; the tool interprets rows as runs, glue-ups, and packed parts.
- **Glue-first**: the carpenter designs strips and glue-up generations; the face pattern is a consequence, so every pattern is constructible by definition.
- **Restricted generators**: the tool only emits patterns that a stated construction sequence can build, even if the editor looks like a grid.
- Something else the research in [How an end-grain board is actually built](./01-how-end-grain-boards-are-built.md) makes obvious.

The contest brief is the source of truth: a carpenter must understand how to cut and glue the board. Vibe loses if it requires a process no shop uses.

Answer with one model, the stages it names, and what the tool is allowed to generate that the shop cannot build.

## Answer

**Glue-first.** The carpenter (or a generator/template) designs a construction sequence. The face is a consequence. There is no species grid as source of truth.

Stages this spec names:

1. **Mill** — rip **sticks** (species + width). Heights match.
2. **Generation 1** — edge-glue sticks into a long-grain panel. Panel **thickness** becomes the **motif width** on the finished face. Panel **width** ≈ finished board **width**.
3. **Crosscut** — slice the panel into **strips**. Strip width = finished **thickness** + surfacing allowance.
4. **Rotate** — stand each strip so **end grain** faces up.
5. **Rearrange** — flip, swap, or offset **whole strips** only.
6. **Generation 2** — glue the standing strips. This is the finished board.

This spec stops at two generations. Chevron / angled mosaic (gen 3+) is later.

**Allowed to generate that the shop cannot build: nothing.** Generators and the short template set (stripes, checker, brick) only write a gen-1 stick list + a gen-2 strip map. Rotate/flip in the brief are strip operations, not cell paint.

Refuse as a model: grid-then-interpret (ТОРЦЕГРАММА), cube mosaics, rings, swirl, photo-pixels. Do not port ТОРЦЕГРАММА’s per-row engine; keep only the *idea* of a printed takeoff.

## Comments

- [Which brief bonuses belong in this spec](./04-which-brief-bonuses-belong-in-this-spec.md) locked the shop-path bundle as **in** (cut map, glue-up, stock, waste, kerf, PDF, physical checks) and image-import as **out**. This ticket still decides *how* a pattern becomes a board; it cannot pick a model that cannot emit that instruction, and it cannot treat a photo grid as an in-spec generator.
