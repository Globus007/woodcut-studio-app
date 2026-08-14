# How real each instruction number must be

Type: grilling
Status: resolved
Blocked by: 03
Part of: Contest candy: spec for a shop-ready end-grain tool

## Question

For every number that appears on the shop instruction (and on the desk next to the board), is it measured, derived, estimated, or a carpenter-edited input?

[Which brief bonuses belong in this spec](./04-which-brief-bonuses-belong-in-this-spec.md) put kerf, cut map, glue-up, stock, waste, and the PDF **in**. Those numbers must be shop-real, not Woodcut Studio theatre (`waste = min(28, …)`, cost from cell counts). The manufacturing model in [Which manufacturing model the spec assumes](./03-which-manufacturing-model-the-spec-assumes.md) decides *which* quantities exist; this ticket decides *how honest* each one is.

Answer with a row per quantity the instruction is allowed to show (at least: board L×W×T, motif/stick widths, strip count, kerf, gen-1 blank size, stock to buy, waste, surfacing allowance). Each row: source (input / derived / estimate / out) and what the carpenter is allowed to distrust.

## Answer

Stored millimetres. Never show a number that looks measured if it is a default or a derivation — label the source on the desk and on the PDF.

| Quantity | Source | Carpenter may distrust |
| --- | --- | --- |
| Finished length, width, thickness | **input** | No — they typed the finished board. |
| Stick species + widths (gen-1 order) | **input** (or template/generator they accepted) | No — they accepted the sequence. |
| Kerf | **input**, default 3.2 mm labeled as default | Yes — must match *their* blade. |
| Surfacing allowance | **input**, default 2 mm labeled as default | Yes — their planer, not ours. |
| Strip count | **derived** from finished length ÷ gen-1 panel thickness (motif width) | Distrust the rounding; show the remainder and let them add a strip. |
| Crosscut width | **derived** = thickness + surfacing | Only if they distrust the surfacing default. |
| Gen-1 blank length | **derived** = strip count × crosscut width + strip count × kerf | Geometry, not a guess — unless they override extra length. |
| Gen-1 extra length | **input**, default 20 mm labeled | Yes — “why cut it close” is their call. |
| Gen-1 blank width | **derived** ≈ finished width + square-up | Square-up is a default (10 mm) they may edit. |
| Stock to buy | **derived** = the gen-1 sticks listed (species, width, length = blank length) | This is a cut list of sticks, not “buy 0.012 m³ of walnut.” No packed lumber optimization (later). |
| Waste | **derived** = (gen-1 volume − finished volume) / gen-1 volume | Honest leftover from kerf + surfacing + extra; not a mood formula. |
| Cost | **out** | Not on the instruction. |
| Weight / work hours | **out** | ТОРЦЕГРАММА theatre. |

Rule: a default is an **input with a label**, never a silent “measurement.”
