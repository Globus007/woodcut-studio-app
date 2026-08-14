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
- Existing artifacts to treat as evidence: `client/src/pages/Home.tsx` (Woodcut Studio skin, shop math is theatre), `docs/inspiration.html` (ТОРЦЕГРАММА: real-ish packing, glue-up, checks, print), `ideas.md` (visual direction «Артефакт из мастерской будущего»), Dribbble Noofit (visual reference, not yet retrieved).

## Decisions so far

<!-- the index — one line per closed ticket -->
- [What the Noofit clothes-builder shot actually specifies](./issues/02-what-noofit-shot-specifies.md) — Single-screen 3D polo decorator (stage + inspector); steal the desk, refuse apparel chrome.

## Not yet specified

- Domain glossary: cell, run, lamella, glue-up, stock, kerf, face vs end grain.
- How real vs estimated each number on the instruction must be.
- Visual language once Noofit is seen next to `ideas.md`.
- The one insane feature nobody asked for.
- Whether to port ТОРЦЕГРАММА’s engine, rewrite it, or keep only its ideas.
- 3D stack and how much of the board it must explain.
- Cut-list optimization.
- Project file format and the shape of the printed instruction.
- The physical-check rule set a carpenter would trust.

## Out of scope

- Accounts, cloud sync, multiplayer, a shop or marketplace.
- Anything that is not a tool one carpenter uses to make a board from a pattern.
- Rewriting the contest brief.
