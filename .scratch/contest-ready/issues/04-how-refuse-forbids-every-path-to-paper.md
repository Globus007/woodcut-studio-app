# How refuse forbids every path to paper

Type: grilling
Status: resolved
Part of: Contest-ready: the candy does not lie

## Question

[Physical-check rule set a carpenter would trust](../../contest-candy/issues/09-physical-check-rule-set.md) and [What the printed instruction contains](../../contest-candy/issues/10-what-the-printed-instruction-contains.md): a hard refuse means there is no paper.

Today the sheet page still renders the document, the Print button is disabled, and the browser’s own print (Ctrl/Cmd+P) still works.

What is “no paper”?

Candidates:

- The sheet page may be read on screen (with the refuse banner) but every print path is blocked (`beforeprint` / print CSS empty / button disabled).
- The sheet page itself is refused — `/instruction` does not show the document, only the refuse and a way back to the desk.
- Soft: button disabled is enough; browser print is the carpenter’s problem.

Answer with: what they see when they open the sheet while refused, and which print paths must produce nothing.

## Answer

The sheet page stays readable. `/instruction` still opens (do not block the route). On screen: the document plus a refuse banner that lists **every** refuse, not the first one, and a way back to the desk. They need the numbers to see what to fix.

There is no shop instruction on paper.

- Print button: disabled (already).
- Ctrl/Cmd+P, browser File → Print, Save as PDF: `@media print` must not emit gen-1, gen-2, takeoff, or the face. Print output is the refuse list only — so the printer is not “broken”, and they cannot take cuts from it.
- `beforeprint` is optional belt; print CSS is the lock (`beforeprint` cannot cancel print in every browser).

Soft “button disabled, browser print is their problem” is rejected. Hiding the whole on-screen document is rejected — diagnosis lives on the sheet, and the desk footer today shows only the first check.

Desk Ctrl+P is not the shop instruction ([ADR-0003](../../../docs/adr/0003-shop-instruction-is-a-sheet-page.md)); this ticket does not add a desk print path.
