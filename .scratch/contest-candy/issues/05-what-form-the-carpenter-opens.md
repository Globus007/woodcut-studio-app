# What form the carpenter opens

Type: grilling
Status: resolved
Part of: Contest candy: spec for a shop-ready end-grain tool

## Question

What does the carpenter actually open?

The brief allows any form: web app, desktop, mobile, plugin, script, terminal. We already have two web artifacts — a Vite/React Woodcut Studio shell and a single-file ТОРЦЕГРАММА. Neither is the source of truth.

This ticket is not “which repo folder to keep.” It is: what is the shipped product a person who did not write the code can use this week?

Answer with the form (e.g. local web app in this repo), what “open it and make a board” looks like in one sentence, and what we refuse (native app store, accounts, installers) if anything.

## Answer

**Local web app in this repo** (the existing Vite/React shell, rebuilt against glue-first — not a new native binary, not `docs/inspiration.html` as the product).

Open it and make a board: open the URL in a desktop browser, land on a desk with a template board already on stage, change sticks or hit generate, print the shop instruction.

Refuse: app stores, accounts, cloud, installers, Electron/Tauri, a phone-first layout as a goal. Mobile may not be broken; it is not a target.
