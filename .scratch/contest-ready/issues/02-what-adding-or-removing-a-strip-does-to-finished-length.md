# What adding or removing a strip does to finished length

Type: grilling
Status: resolved
Part of: Contest-ready: the candy does not lie

## Question

The carpenter must be able to rearrange whole strips (flip, **swap**, offset) and to add a strip when length does not divide motif width — [How real each instruction number must be](../../contest-candy/issues/08-how-real-each-instruction-number-must-be.md).

Today strip count is only derived (`length ÷ motif`) and the UI cannot swap or add. Motif width is now an input ([Motif width is an input, not the first stick](../../../docs/adr/0004-motif-width-is-an-input.md)).

When they add or remove a strip, what happens to finished length? When they change length or motif, what happens to the strip list?

Candidates:

- Finished length stays an input. Add/remove changes strip count; remainder is `length − count × motif` (may go negative). They edit length if they want a clean fit.
- Add a strip grows finished length by one motif; remove shrinks it. Remainder stays near zero unless they edit length.
- Both: add/remove changes count; a separate “fit length” snaps `length = count × motif`.

Also lock: swap is a desk operation (what control is enough — up/down on the strip list, or must it be drag on the face?).

Answer with: source of strip count (input vs derived), what add/remove does to length, what length/motif edits do to existing flip/offset rows, and the swap control.

## Answer

Finished length stays an input. Strip count is stored: the list `strips[]` is the count. Add or remove a strip changes that list only — length does not move.

Coverage is `count × motif`. Same honesty as width ([ADR-0005](../../../docs/adr/0005-strip-width-shortfall-is-not-a-remainder.md)):

- **Shortfall** (`coverage < length`): a hole on the far end — that finished board does not exist. Refuse (float epsilon only).
- **Trim** (`coverage > length`): the finished face is clipped to L from the first strip; the extra is not drawn. Warn, print allowed.

They type a new length if they want a clean fit. No separate “fit length” control this map.

Changing length or motif does **not** rewrite flip/offset rows and does **not** pad or truncate the list. Today’s `syncStrips` on every length edit is the lie. `parseProject` must stop resizing strips to `round(length / motif)`.

Add: append `{ flip: false, offset: 0 }`. Remove: drop that row. Empty list → refuse (same as empty sticks).

Templates and generate keep typed length and write `count = max(1, ceil((length − ε) / motif))` so a new pattern does not open in shortfall. Trim-warn on a 409 mm board is allowed.

Swap: up/down on the strip list. Not drag on the face — that invites painting the grid.

Glossary: [`CONTEXT.md`](../../../CONTEXT.md) (Shortfall, Trim, Strip). Decision: [Strip count is stored; length shortfall is not a remainder](../../../docs/adr/0006-strip-count-is-stored.md).
