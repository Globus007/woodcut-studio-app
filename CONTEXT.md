# End-grain board tool

A carpenter designs a construction sequence for a patterned end-grain cutting board. The face is a consequence of that sequence, not a painted grid.

## Language

**Board**:
The finished end-grain cutting board: a length, width, and thickness the carpenter set.
_Avoid_: canvas, product, slab

**Stick**:
A milled long-grain member with one species and one width. Sticks are glued edge-to-edge in generation 1.
_Avoid_: cell, cube, tile, run, lamella

**Generation**:
One clamp-up of full-length members. This spec uses two generations.
_Avoid_: layer, step (except as UI copy for a glue-up step), glue-up generation count beyond two

**Generation 1**:
The long-grain panel. Its thickness becomes the motif width on the finished face; its width is the finished board width.
_Avoid_: first glue-up as a grid of cells

**Strip**:
A crosscut slice of the generation-1 panel, stood on end so end grain faces up, then rearranged as a whole.
_Avoid_: row, lamella, part (ТОРЦЕГРАММА)

**Generation 2**:
The end-grain panel made by gluing the standing strips. This is the board.
_Avoid_: final mosaic of independent cubes

**Kerf**:
Saw-kerf as a length tax on generation 1 (one kerf per crosscut), not a gap around a painted cell.
_Avoid_: cell inset, margin

**End grain**:
The face of the finished board — the pattern the carpenter sees from above.
_Avoid_: top texture, print

**Face grain**:
The long-grain surface of a stick or of the generation-1 panel, before rotation.
_Avoid_: side texture (except as loose UI copy)

**Takeoff**:
The list of sticks to rip: species, width, and generation-1 blank length.
_Avoid_: BOM, bill of materials, m³ shopping cart

**Waste**:
Derived leftover: generation-1 volume minus finished volume, as a percentage. Kerf, surfacing, and extra length are the causes.
_Avoid_: a mood formula, contingency percent

**Shop instruction**:
The one printable document of the construction sequence. The on-desk Build view is that document.
_Avoid_: worksheet of the whole UI, invoice
