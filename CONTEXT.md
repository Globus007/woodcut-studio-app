# End-grain board tool

A carpenter designs an end-grain cutting board along one shop path. On the strip path the face is a consequence of two generations. On the block path the face is a grid of blocks that will be glued into courses.

## Language

**Board**:
The finished end-grain cutting board: a length, width, and thickness the carpenter set.
_Avoid_: canvas, product, slab

**Shop path**:
Which construction a project uses: the strip path or the block path.
_Avoid_: mode, theme, view, editor tab

**Strip path**:
Sticks glued into generation 1, crosscut into strips, rearranged, glued as generation 2.
_Avoid_: calling this a painted grid

**Block path**:
Blocks arranged on the face, glued into courses, courses glued into the board.
_Avoid_: cube mosaic as decoration, pixel grid, jewellery-box swirl as if it were the strip path

**Stick**:
A milled long-grain member with one species and one width. Sticks are glued edge-to-edge in generation 1 on the strip path.
_Avoid_: cell, cube, tile, run, lamella

**Block**:
A sawn end-grain piece of one species on the block path. Its face size is a width the carpenter set; its height is the board thickness.
_Avoid_: cube, cell, tile, pixel

**Standard width**:
A width from the set 15, 20, 25, 30, 40 mm. Templates emit only these. The default is 20 mm.
_Avoid_: 35 mm as a hidden house size, cell size, grid size

**Course**:
One full-width row of blocks, glued as a member. Courses are then glued into the board.
_Avoid_: strip (that is the other path), lamella, Excel row

**Generation**:
One clamp-up of full-length members on the strip path. That path uses two generations.
_Avoid_: layer, step (except as UI copy for a glue-up step), glue-up generation count beyond two, calling a course a generation

**Generation 1**:
The long-grain panel. Its thickness becomes the motif width on the finished face; its width is the finished board width.
_Avoid_: first glue-up as a grid of cells

**Strip**:
A crosscut slice of the generation-1 panel, stood on end so end grain faces up, then rearranged as a whole.
_Avoid_: row, lamella, part (ТОРЦЕГРАММА)

**Generation 2**:
The end-grain panel made by gluing the standing strips. On the strip path this is the board.
_Avoid_: calling generation 2 a mosaic of blocks

**Kerf**:
Saw-kerf as stock the saw eats, never a painted gap on the face. On the strip path it is a length tax on generation 1 (one kerf per crosscut). On the block path it is a tax on every cut that frees a block.
_Avoid_: cell inset, margin, drawing kerf between blocks on the face

**End grain**:
The face of the finished board — the pattern the carpenter sees from above.
_Avoid_: top texture, print

**Face grain**:
The long-grain surface of a stick or of the generation-1 panel, before rotation.
_Avoid_: side texture (except as loose UI copy)

**Takeoff**:
The list to take to the saw. On the strip path: sticks to rip — species, width, generation-1 blank length. On the block path: the same kind of sticks (width = block face size) plus how many blocks each blank yields after kerf.
_Avoid_: BOM, bill of materials, m³ shopping cart, a bag of loose cubes

**Waste**:
Derived leftover: stock volume minus finished volume, as a percentage. Kerf, surfacing, extra length, and remainder at the board edge are the causes.
_Avoid_: a mood formula, contingency percent

**Shop instruction**:
The one printable document of the construction sequence. The carpenter reads and prints it on its own sheet page, not in a desk pane.
_Avoid_: worksheet of the whole UI, invoice, Build view as a third desk pane
