# Which honesty leftovers belong on this map

Type: grilling
Status: resolved
Part of: Contest-ready: the candy does not lie

## Question

The audit after [Contest candy: spec for a shop-ready end-grain tool](../../contest-candy/map.md) listed honesty leftovers that are not shop-math. Which of these are **in this map**, and which stay out?

| Leftover | Why it was flagged |
| --- | --- |
| English kicker `SHOP INSTRUCTION` on the sheet | [Locale, units, and currency for a carpenter](../../contest-candy/issues/06-locale-units-and-currency.md) is Russian only |
| Desk status shows only the first refuse/warn | Carpenter misses the rest before print |
| Remainder on length is on the sheet, not the desk footer | Ticket 08 wanted it visible next to the board |
| Draft is not autosaved; units live in `sessionStorage` | Refresh / new tab loses work or the inch toggle |
| «Фото на шашки» on the strip path silently switches shop path | ADR-0002 allows photo only on the block path |
| Dead CSS (library modal, Material Lab, cost) | Noise, not a lie |
| Missing left rail (three-zone desk) | Vibe from [Visual north star after Noofit](../../contest-candy/issues/07-visual-north-star-after-noofit.md), not shop honesty |

This map’s destination is that the candy does not lie. Vibe-only work is out unless you pull a sliver in.

Answer with in / out for each row, one line each.

## Answer

- English kicker `SHOP INSTRUCTION` — **in**. Locale is Russian only; English on the sheet is a lie. One Russian kicker.
- Desk status shows only the first refuse/warn — **in**. List every refuse; warns as the full list or a count plus the lines. They must see all of them before paper.
- Remainder on length is on the sheet, not the desk footer — **in**. After [ticket 02](./02-what-adding-or-removing-a-strip-does-to-finished-length.md) this is shortfall/trim on length; the desk face and footer name it the same way as width.
- Draft is not autosaved; units live in `sessionStorage` — **out** (autosave) / **in** as a sliver (units). Autosave is a feature, not a lying number. Persist the inch toggle in `localStorage` next to the project so a new tab does not silently revert to mm.
- «Фото на шашки» on the strip path silently switches shop path — **in**. Photo is a block-path tool ([ADR-0002](../../../docs/adr/0002-two-shop-paths.md)). Hide the button on the strip path; they switch to ШАШКИ first. No silent `setShopPath`.
- Dead CSS — **out**. Noise, not a lie.
- Missing left rail — **out**. Vibe from Noofit, not shop honesty.
