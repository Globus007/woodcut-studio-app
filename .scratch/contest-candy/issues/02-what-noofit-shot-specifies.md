# What the Noofit clothes-builder shot actually specifies

Type: research
Status: resolved
Part of: Contest candy: spec for a shop-ready end-grain tool

## Question

What does the Dribbble shot [Product for a Clothes Builder — Noofit](https://dribbble.com/shots/27647587-Product-for-a-Clothes-Builder-Noofit) actually specify as a product-builder interface — layout, hierarchy, density, and interaction — that we could steal or reject for a board generator?

This ticket exists because the shot was named as a visual reference and could not be retrieved in the charting session. It is not the source of truth (the contest brief is). It is evidence for a later visual decision.

Answer from the shot itself and any first-party Noofit product pages, not from third-party recaps. Capture:

1. Information architecture: what sits left / center / right / top / bottom.
2. What the center stage is (3D garment? flat? configurator?).
3. How materials, parts, and options are chosen.
4. What is persistent vs modal.
5. Typography, density, and color role — only as observed, not as a moodboard essay.
6. Which of those patterns help a carpenter, and which are clothes-retail chrome we should refuse.

Write findings to a single Markdown file under `docs/research/`, including a description precise enough that a later session can decide visual language without reopening Dribbble. Leave a context pointer on this ticket.

## Answer

Agency still of a **single-screen 3D polo configurator**: dark header (category rail), photoreal garment + turntable center, light inspector right (pattern thumbs, jersey name, logo drop). No modal, no first-party Noofit product. Steal the object-first desk and quiet chrome; refuse apparel catalog / surname / logo merch. Full writeup + crop: [`docs/research/noofit-shot.md`](../../../docs/research/noofit-shot.md).
