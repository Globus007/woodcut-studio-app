# How an end-grain board is actually built

Type: research
Status: resolved
Part of: Contest candy: spec for a shop-ready end-grain tool

## Question

How is a patterned end-grain cutting board actually made in a shop — the sequence of cuts, rotations, and glue-ups — and which pattern families that sequence can and cannot produce?

This ticket exists so later decisions do not treat ТОРЦЕГРАММА’s model as physics. That file (`docs/inspiration.html`) assumes: the face is a species grid; each row is a run of same-species blocks; each row is glued into a lamella; lamellae are glued into a panel; parts are packed onto stock with kerf. Real end-grain work often starts as a face-grain glue-up, then crosscuts, 90° rotations to end grain, optional further rearrangements, and a second (or third) glue-up.

Answer against primary sources: woodworking textbooks, manufacturer process notes, or first-party shop documentation — not blog recaps. For each claim, cite the source that owns it.

The answer must make these later questions decidable:

1. What are the named stages of construction, in order?
2. What does one “generation” of glue-up buy on the finished face?
3. Which common contest patterns (checker, stripes, chevron, brick/weave, rings, swirl, chaos, image-as-pixels) are constructible by 1, 2, or 3 glue-up generations — and which are jewellery-box fantasy?
4. Where do kerf, thickness, and grain direction actually constrain the pattern?
5. What would a shop instruction have to list for a carpenter to reproduce one board without guessing?

Write findings to a single Markdown file under `docs/research/`, then leave a context pointer on this ticket.

## Answer

Shop end-grain is laminate → slice → rotate → laminate, not a cell grid. Two glue-ups make stripes/checker/strip-chaos; rings, swirls, and photo-pixels are not that process. ТОРЦЕГРАММА’s per-row runs are a different machine. Full writeup: [`docs/research/end-grain-construction.md`](../../../docs/research/end-grain-construction.md).
