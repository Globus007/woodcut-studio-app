# Motif width in the project file

Type: grilling
Status: resolved
Part of: Contest-ready: the candy does not lie

## Question

[Motif width is an input, not the first stick](../../../docs/adr/0004-motif-width-is-an-input.md) locked the domain. What is stored, what is the default, and what happens to JSON already saved without the field?

[Project file format](../../contest-candy/issues/12-project-file-format.md) listed sticks and strips and did not name motif width. Version is `1`. Templates today happen to use 20 mm sticks, so `sticks[0].width` often matches the intended motif — except butcher and accent.

Answer with: field name on `Project`, unit (mm), default for new projects, how `parseProject` treats a missing field, whether `version` stays `1`, and what generate/templates write.

## Answer

On `Project`: `motifWidth: number`, stored millimetres.

New projects and `emptyProject`: **20** (the standard default). Not the first stick.

`version` stays `1`. Additive field. Bumping to 2 would unload every saved file (`parseProject` rejects `version !== 1`).

Missing field: `sticks[0].width ?? 20`. That is the board the old file last showed (including butcher’s first-stick 40). Next save writes `motifWidth` explicitly. After that the field is the source — no more inferring.

Templates: write `20` on a fresh board; when applied onto an existing project, keep that project’s `motifWidth` (same as thickness). Generate: keep the project’s `motifWidth`; do not read the new random sticks.

Inspector (this unblocks the map leftover): one millimetre field plus the standard-width chips as shortcuts — same shape as block size. They can type 18. Not chips-only.

Brick/herring offsets stay stick-width steps, not motif.
