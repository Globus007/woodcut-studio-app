# Project file format

Type: grilling
Status: resolved
Part of: Contest candy: spec for a shop-ready end-grain tool

## Question

What is saved when the carpenter hits save, and what is enough to reopen the same board?

Save is in the brief MVP. Cost, image-import, and cut-list optimization are not in this spec. The source of truth is glue-first ([Which manufacturing model the spec assumes](./03-which-manufacturing-model-the-spec-assumes.md)).

## Answer

One JSON document. localStorage for the last project; download/open the same JSON for a file the carpenter can keep.

Stored always in millimetres.

```
version
name
board { length, width, thickness }
kerf
surfacing
extraLength
squareUp
species[] { id, name, code, color }
sticks[] { speciesId, width }          // gen-1, left → right
strips[] { flip, offset }              // gen-2, in crosscut order
```

`flip` is a boolean (end-for-end + upside-down as one shop move). `offset` is millimetres along the strip, 0 for stripes/checker.

Out of the file: cost, seed (optional later), image bits, 3D camera, UI chrome, English labels.
