# Contest candy: spec for a shop-ready end-grain tool

## Destination

A locked spec for a one-week contest candy: a working end-grain board tool a carpenter can use to invent a pattern, see the finished board, understand the cuts and glue-ups, size the parts, count stock and waste, save the project, and print a shop instruction — with enough vibe that judges stop. After the spec is locked, we build it.

## Notes

- Domain: end-grain cutting boards / торцевые разделочные доски.
- Skills every session should consult: grilling, domain-modeling, research, prototype. After the way is clear: implement.
- The contest brief is the source of truth, not Woodcut Studio and not ТОРЦЕГРАММА. Existing artifacts are evidence, not identity.
- If vibe and “a carpenter can make the board” conflict, the carpenter wins. Working product beats a long feature list.
- Execution is in scope once nothing is left to decide. This map still produces decisions, not the candy itself.
- Settled before this map: destination is a spec we then build; brief is source of truth; carpenter-first.
- Existing artifacts to treat as evidence: `client/src/pages/Home.tsx` (Woodcut Studio skin, shop math is theatre), `docs/inspiration.html` (ТОРЦЕГРАММА: per-row packing/glue-up/print — a different machine than shop strip generations), `ideas.md` (visual direction «Артефакт из мастерской будущего»), Dribbble Noofit (retrieved: [`docs/research/noofit-shot.md`](../../docs/research/noofit-shot.md)).

## Decisions so far

<!-- the index — one line per closed ticket -->
- [What the Noofit clothes-builder shot actually specifies](./issues/02-what-noofit-shot-specifies.md) — Single-screen 3D polo decorator (stage + inspector); steal the desk, refuse apparel chrome.
- [How an end-grain board is actually built](./issues/01-how-end-grain-boards-are-built.md) — Shop process is laminate → slice → rotate → laminate; ТОРЦЕГРАММА’s per-row grid is a different machine.
- [Which brief bonuses belong in this spec](./issues/04-which-brief-bonuses-belong-in-this-spec.md) — Shop-path bundle + gen/templates/3D-object/units in; cost, explode, optimization, insane feature later; image-import out.
- [Which manufacturing model the spec assumes](./issues/03-which-manufacturing-model-the-spec-assumes.md) — Glue-first, two generations; face is a consequence; generate nothing the shop cannot build.
- [What form the carpenter opens](./issues/05-what-form-the-carpenter-opens.md) — Vite web app in this repo; open URL, template on the desk, print; no stores/accounts/installers.
- [Locale, units, and currency for a carpenter](./issues/06-locale-units-and-currency.md) — Russian only; mm default, inch toggle; no money (later: ₽/m³ carpenter-edited).
- [Visual north star after Noofit](./issues/07-visual-north-star-after-noofit.md) — Keep ideas.md workbench; steal Noofit object-first / no modal; keep Woodcut chassis, kill lying panels.
- [How real each instruction number must be](./issues/08-how-real-each-instruction-number-must-be.md) — LWT and sticks are inputs; kerf/surfacing/extra are labeled defaults; blank/takeoff/waste derived; cost out.
- [Physical-check rule set a carpenter would trust](./issues/09-physical-check-rule-set.md) — Refuse skinny/thin/short-blank/invalid sequence; warn fiddly/heavy/wide; do not check rings or machines.
- [What the printed instruction contains](./issues/10-what-the-printed-instruction-contains.md) — One document = on-screen Build: gen-1, crosscut, strip map, takeoff; no 3D/cost/chrome.
- [What the on-desk 3D object must show](./issues/11-what-the-on-desk-3d-object-must-show.md) — Thick extrusion: top = end grain, edges = strip stack; clamped orbit; no explode.
- [Project file format](./issues/12-project-file-format.md) — JSON, mm, sticks + strips; localStorage + download.

Locked spec: [`spec.md`](./spec.md) — revised in place by [Contest-ready: the candy does not lie](../contest-ready/map.md) so it matches two shop paths and this desk. Glossary: [`CONTEXT.md`](../../CONTEXT.md). ADRs: 0001–0006.

## Not yet specified

- What “one insane feature” is, after this spec ships (explicitly later, not this week).

## Out of scope

- Accounts, cloud sync, multiplayer, a shop or marketplace.
- Anything that is not a tool one carpenter uses to make a board from a pattern.
- Rewriting the contest brief.
- Image import → pattern — photo-as-pixels is not a strip-shop process; scored **out** in [Which brief bonuses belong in this spec](./issues/04-which-brief-bonuses-belong-in-this-spec.md).
