# Locale, units, and currency for a carpenter

Type: grilling
Status: resolved
Part of: Contest candy: spec for a shop-ready end-grain tool

## Question

What language, default units, and money does the carpenter see?

Facts already in evidence, not decisions:

- The contest brief is in Russian and lists millimetres and inches as a scoring item.
- Woodcut Studio’s UI is mixed English/Russian and prices in `$ / cm³`.
- ТОРЦЕГРАММА is Russian and prices in `₽ / m³`, with density in kg/m³.

Answer all three:

1. UI language (ru / en / bilingual, and which is default).
2. Units (mm default with in toggle, or the reverse, or both always visible).
3. Currency and the unit it is per (board, m³, board-foot, cm³) — including whether cost is a shop estimate the carpenter edits, or a baked-in catalogue.

The brief is source of truth. A person who did not write the code must not have to guess what a number means.

## Answer

1. **UI language: Russian only** this week. Brief and carpenter are Russian. No bilingual chrome (Woodcut’s EN rail + RU toasts is what we refuse). English is later.
2. **Units: millimetres default, one toggle to inches.** One system at a time, never both on the same number. Toggle converts the same stored millimetre values; stored project is always mm.
3. **Money: none on screen.** Cost is later. When it returns: carpenter-edited ₽ / m³, not a baked catalogue and not `$ / cm³`.

## Comments

- [Which brief bonuses belong in this spec](./04-which-brief-bonuses-belong-in-this-spec.md) put millimetres and inches **in** (mm default) and cost **later**. This ticket still locks UI language and how units display. Currency can be named as a later default; do not pull a live price into this spec.
