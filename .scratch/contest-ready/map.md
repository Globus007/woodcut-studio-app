# Contest-ready: the candy does not lie

## Destination

A contest-ready desk: the strip-path face and shop numbers match the two-generation construction, refuse actually blocks paper, and the locked spec matches the two-path product. After the way is clear, we make those changes in this repo.

## Notes

- Domain: end-grain cutting boards. Vocabulary: [`CONTEXT.md`](../../CONTEXT.md).
- Skills every session should consult: grilling, domain-modeling. Prototype only if a ticket is `prototype`. After the way is clear: implement.
- Parent effort: [Contest candy: spec for a shop-ready end-grain tool](../contest-candy/map.md). That map locked the spec; this one closes the gaps between that spec, the ADRs, and the desk.
- Carpenter beats vibe. No new features, no cost, no explode, no insane feature.
- Two shop paths stay ([Two shop paths, not one painted grid](../../docs/adr/0002-two-shop-paths.md)). Motif width is an input ([Motif width is an input, not the first stick](../../docs/adr/0004-motif-width-is-an-input.md)). Width leftover is shortfall/trim ([ADR-0005](../../docs/adr/0005-strip-width-shortfall-is-not-a-remainder.md)). Strip count is stored; length leftover is the same rule ([ADR-0006](../../docs/adr/0006-strip-count-is-stored.md)). Block-to-strip restores the stored strip construction ([ADR-0007](../../docs/adr/0007-block-to-strip-restores.md)).
- Execution is in scope: the spec matches the desk. Implement from [`spec.md`](../contest-candy/spec.md).
- Settled before this map: destination is contest-ready honesty, not a new product; motif width is independent of stick width.

## Decisions so far

<!-- the index — one line per closed ticket -->
- [How the strip-path face treats leftover width](./issues/01-how-the-strip-path-face-treats-leftover-width.md) — Width and sticks stay inputs; shortfall refuses, trim warns and clips from the first stick; not a block remainder. [ADR-0005](../../docs/adr/0005-strip-width-shortfall-is-not-a-remainder.md).
- [What adding or removing a strip does to finished length](./issues/02-what-adding-or-removing-a-strip-does-to-finished-length.md) — Length stays an input; strip list is the count; add/remove does not change L; length shortfall refuses, trim warns and clips; no `syncStrips` resize; swap is list up/down. [ADR-0006](../../docs/adr/0006-strip-count-is-stored.md).
- [Motif width in the project file](./issues/03-motif-width-in-the-project-file.md) — `motifWidth` mm on `Project`; new default 20; missing field → first stick ?? 20; `version` stays 1; inspector is field + standard chips.
- [How refuse forbids every path to paper](./issues/04-how-refuse-forbids-every-path-to-paper.md) — Sheet stays readable with every refuse listed; print CSS emits refuse only; button disabled; browser print is not the carpenter’s problem.
- [Which honesty leftovers belong on this map](./issues/05-which-honesty-leftovers-belong-on-this-map.md) — In: Russian kicker, all checks on the desk, length leftover on the desk, unit in localStorage, photo button hidden on the strip path. Out: autosave, dead CSS, left rail.
- [Rewrite the spec to match two paths and this desk](./issues/06-rewrite-the-spec-to-match-two-paths-and-this-desk.md) — [`spec.md`](../contest-candy/spec.md) is again the source of truth.

## Not yet specified

- Nothing left to decide on this map. Implement.

## Out of scope

- Cost, 3D explode, cut-list optimization, English, the unnamed insane feature.
- Accounts, cloud, marketplace.
- Rewriting the contest brief.
- Changing what the block path is (photo + brush stays as ADR-0002 decided).
- A visual redraw of the chassis (left rail, dead CSS purge) unless a ticket on this map pulls a sliver in.
