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

For the browser flow checks, run `npx playwright install chromium`, start the app, then run `APP_URL=http://localhost:3000 npm run test:browser`.

## Persistence and rules
The browser saves setup and game state in localStorage under `diezmil.game.v1`. Reloading restores the active or finished game, including a pending valid score. Data stays on this browser/device; clearing browser data removes it. No backend or accounts are used.

Enter whole-number points, including zero. Quick-add buttons increment the entry and saving advances to the next player. New games start with classic scoring, where reaching or exceeding 10,000 wins. The setup rules menu can independently require exactly 10,000 and enable a penalty that removes the latest unpenalized scoring turn after three consecutive scoreless turns, then resets the counter to zero. Undo restores the previous player's turn and entered points, including penalties, busts, and a winning turn. New games replace the previous game; replacing an active game requires confirmation. Player names are limited to 40 characters and per-turn input to 1,000,000 points to prevent accidental oversized input.

The original PRODUCT_REQUIREMENTS.md and DESIGN.md remain the source requirements.
