# DiezMil
A Spanish, mobile-first scorekeeper for physical games of 10.000, built with Next.js, React and TypeScript.

## Run locally
```sh
npm install
npm run dev
```
Open http://localhost:3000.

## Checks
```sh
npm run typecheck
npm test
npm run build
```
Run the production build with `npm start`.

For the browser flow checks, run `npx playwright install chromium`, start the app, then run `APP_URL=http://localhost:3000 npm run test:browser`. Check the tie-penalty flow with `APP_URL=http://localhost:3000 node tests/tie-penalty.browser.mjs`.

## Persistence and rules
The browser saves setup and game state in localStorage under `diezmil.game.v1`. Reloading restores the active or finished game, including a pending valid score. Payload version 5 migrates versions 1–4 under the same key, with the tie rule disabled. Data stays on this browser/device; clearing browser data removes it. No backend or accounts are used.

Enter whole-number points, including zero. Quick-add buttons increment the entry and saving advances to the next player. The setup rules menu offers three independent options, all on by default for new games and individually configurable: exactly 10,000; a penalty that removes the latest eligible scoring annotation after three consecutive scoreless turns and resets that counter; and a tie penalty. With the tie rule enabled, adding points to match another player’s total deducts that opponent’s latest eligible positive annotation. Every opponent at that total is affected simultaneously, without cascading deductions. Zero-point turns, busts, and score losses do not trigger ties. Both penalties use the same eligible annotations, preventing double deductions and negative totals; incoming tie penalties do not count as the recipient’s turn or reset their scoreless streak. The live rules menu changes future turns only. Tie deductions appear before saving, in the last-turn result and standings, and in global and individual history. Undo restores the previous player’s turn and entered points together with all affected totals, including penalties, busts, and a winning turn. New games replace the previous game; replacing an active game requires confirmation. Player names are limited to 40 characters and per-turn input to 1,000,000 points to prevent accidental oversized input.

The original PRODUCT_REQUIREMENTS.md and DESIGN.md remain the source requirements.
