# Physical-check rule set a carpenter would trust

Type: grilling
Status: resolved
Blocked by: 03
Part of: Contest candy: spec for a shop-ready end-grain tool

## Question

What does the tool refuse to emit, and what does it only warn about?

[Which brief bonuses belong in this spec](./04-which-brief-bonuses-belong-in-this-spec.md) put physical realizability checks **in**: the tool must not print a lie. Woodcut Studio’s `kerf <= 4 && thickness >= 30` is theatre. ТОРЦЕГРАММА’s checklist (cell size, thickness, part-fits-stock) is a different machine ([How an end-grain board is actually built](./01-how-end-grain-boards-are-built.md)).

This ticket writes the rule set for the manufacturing model chosen in [Which manufacturing model the spec assumes](./03-which-manufacturing-model-the-spec-assumes.md). Candidates from the research, not a closed list: machine envelope, minimum stick width, kerf allowance on gen-1 length, grain/ring orientation, mixed-species shrinkage, generation count, pattern families the model cannot build.

Answer with two lists — **hard refuse** (no PDF, pattern is invalid) and **warn** (print anyway, named risk) — plus what we explicitly do *not* check.

## Answer

**Hard refuse** (pattern invalid, Print disabled, no PDF):

- Empty stick list, or a stick width ≤ 0.
- Any stick **narrower than 12 mm**.
- Finished thickness **< 18 mm**.
- Gen-1 blank length shorter than strip count × (thickness + surfacing) + strip count × kerf.
- Kerf < 0.
- A face that is not a gen-1 + gen-2 rearrangement (should be unrepresentable; if a generator emits one, it is a bug and refuse).

**Warn** (print allowed, named line on the instruction):

- Stick width < 18 mm — fiddly to glue.
- Thickness < 25 mm — light for a meat board.
- Thickness > 50 mm — heavy, long clamp time.
- More than 4 species.
- Finished width > 400 mm — wide glue-up.
- Surfacing allowance = 0.
- Extra length = 0 — “why cut it close.”
- Kerf > 5 mm — unusual waste.

**Do not check** (we do not model them this week):

- Annular-ring orientation and shrinkage pairing.
- Moisture, glue brand, food-safe finish, clamp count.
- Their actual machine envelope.
- Packed-lumber fit (cut-list optimization is later).
- Rings / swirl / photo — they cannot be expressed, so no checklist row.
