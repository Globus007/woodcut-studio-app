# Which brief bonuses belong in this spec

Type: grilling
Status: resolved
Part of: Contest candy: spec for a shop-ready end-grain tool

## Question

Which scoring items from the contest brief are **in this spec**, and which are explicit later or out?

The brief already locked the MVP unless we cut it: pattern editor; several woods or colours; rotate and flip; board size; save project; export a pattern image.

Scoring list to mark **in / later / out**, with a one-line reason each:

- generative and random patterns
- template library
- interactive 3D preview
- kerf
- cut map
- step-by-step glue-up
- stock / wood takeoff
- waste
- cost
- millimetres and inches
- PDF shop instruction
- physical realizability checks
- cut-list optimization
- image import → pattern
- one insane feature nobody asked for

Standing rules already settled: the brief is source of truth; a carpenter who can make the board beats vibe; a working product beats a long feature list.

The answer is a table, not a speech. Anything marked **in** must be real enough to take to the shop, not theatre.

## Answer

MVP stays **in** (editor, several woods, rotate/flip, board size, save, pattern image). Scoring items:

| Item | Verdict | Why |
| --- | --- | --- |
| generative and random patterns | **in** | Inventing a pattern is the destination; generators later constrained to what the shop can build ([Which manufacturing model the spec assumes](./03-which-manufacturing-model-the-spec-assumes.md)). |
| template library | **in** | Short start set only: stripes, checker, brick — a known-good board on night one, not a catalog. |
| interactive 3D preview | **in** | Object on the desk (turn to see face, edge, end grain). Explode / “how to glue” is later. |
| kerf | **in** | Length tax on the shop path, printed as a real allowance, not a cell-gap toy. |
| cut map | **in** | Destination: carpenter understands the cuts. Must be shop-real. |
| step-by-step glue-up | **in** | Destination: carpenter understands the glue-ups. Must be shop-real. |
| stock / wood takeoff | **in** | Destination: count stock. |
| waste | **in** | Destination: count waste. |
| cost | **later** | Not in the destination sentence; money waits on [Locale, units, and currency for a carpenter](./06-locale-units-and-currency.md). Takeoff without a price still tells the carpenter what to buy. |
| millimetres and inches | **in** | Brief scoring item. Capability exists; mm is default. Display rules live on ticket 06. |
| PDF shop instruction | **in** | Destination: print a shop instruction. One artifact with the shop path, not `window.print()` of the UI. |
| physical realizability checks | **in** | Refuse to emit an unbuildable board. Rule set is the next ticket. |
| cut-list optimization | **later** | Hangs on the manufacturing model; packing is a week-eater. Honest takeoff first. |
| image import → pattern | **out** | Photo-as-pixels is jewellery-box fantasy for a strip shop ([How an end-grain board is actually built](./01-how-end-grain-boards-are-built.md)). Studio already has it as theatre. |
| one insane feature nobody asked for | **later** | Still unnamed. Vibe this week comes from a real instruction + the Noofit desk, not a mystery feature. |

Shop-path bundle (cut map, glue-up, stock, waste, kerf, PDF, physical checks) is one commitment: numbers a carpenter can take to the shop, not Woodcut Studio theatre.
