# How the strip-path face treats leftover width

Type: grilling
Status: resolved
Part of: Contest-ready: the candy does not lie

## Question

On the strip path, what is true when the sum of stick widths is not the finished board width?

Today the stage rectangle is `board.width × board.length` and the sticks flex to fill it, so the face lies. Finished L × W × T are inputs. Stick widths are also inputs. [Motif width is an input, not the first stick](../../../docs/adr/0004-motif-width-is-an-input.md) does not decide width leftover.

Candidates:

- Face is to scale in millimetres. Extra board width is a dark remainder field (same idea as the block path). Extra sticks beyond the board are clipped and warned or refused.
- Finished width is derived from the stick sum. Editing sticks changes the board; there is no leftover width.
- Templates and generate snap width to the stick sum; a manual mismatch stays visible as remainder.

Answer with: what the carpenter edits, what the face must show, and what the check does (warn / refuse / nothing) when they disagree.

## Answer

Finished width and stick widths stay independent inputs. Templates and generate still write `width = stickSum` so a new pattern does not open in refuse.

The face rectangle is the typed L × W, sticks in millimetres, no flex. First stick at the origin (generation-1 order). **Shortfall** (`stickSum < width`): a hole in the target on the far edge — not a block-path remainder; that finished board does not exist. **Trim** (`stickSum > width`): the finished face is clipped to W; the extra is not drawn on the end grain.

Check: shortfall → refuse (float epsilon only). Trim → warn, print allowed.

Gen-1 blank width is stick sum + square-up, not finished width + square-up.

Glossary: [`CONTEXT.md`](../../../CONTEXT.md) (Shortfall, Trim). Decision: [Strip-path width shortfall is not a remainder field](../../../docs/adr/0005-strip-width-shortfall-is-not-a-remainder.md).

## Comments

- Parallel grill of this map stands by this answer. The same shortfall/trim rule is now on the length axis in [ticket 02](./02-what-adding-or-removing-a-strip-does-to-finished-length.md) / [ADR-0006](../../../docs/adr/0006-strip-count-is-stored.md).
