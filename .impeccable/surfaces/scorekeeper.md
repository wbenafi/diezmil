# Scorekeeper surface

Mode: **Operate**. Spanish Next.js App Router application for a group sharing a device while playing 10.000 with physical dice.

Authority: `PRODUCT_REQUIREMENTS.md` defines behavior, `PRODUCT.md` records confirmed product facts, and the existing `DESIGN.md` defines visual language. The supplied four-screen reference guides home, player setup, active play, and winner composition. This implementation extends that authority; it does not establish a new visual system.

- Home introduces the game with a prominent “Nueva partida” action and a generated, transparent product image of authentic poker dice. Visible faces use the game ranks 9, 10, J, Q, K, and A rather than ordinary dot pips; mint rim lighting connects the image to the established tabletop atmosphere.
- Setup supports named players, removal, and accessible turn-order changes through labeled up/down buttons with 44px targets and disabled boundary states.
- Playing keeps scores visible, identifies the current player with text and accent treatment, and offers manual entry, +50/+100/+500, save, history, and undo. Desktop places the scoreboard and scoring controls in two columns; at 700px and below they stack.
- Winner presents the first player reaching the configured 10.000 target, sorted standings, a new-game action, history, and undo of the winning turn.
- Browser localStorage restores setup and game state, including current input and history. Visible warnings explain unavailable storage. Starting over during active play requires confirmation.
- Zero-point turns are explicitly user-confirmed product behavior: saving zero records the turn and advances play without an additional confirmation.
- A compact setup menu offers two independent rules, disabled by default. Exact target makes going over 10.000 a visible scoreless bust; the three-turn penalty removes the latest unpenalized scoring turn after three turns without points, resets the counter to zero, and shows compact live streak counters beside player names.
- During play, the three-dot menu opens a compact rules dialog. Rule changes apply to future turns; activating the penalty starts a fresh scoreless streak. Each complete player row opens a compact history dialog with player-specific turn numbering, running totals, and a highlighted scoring turn that would be deducted under the active penalty rule.

The stylesheet's foundation, accent, and text custom properties match `DESIGN.md`, as does the danger color. Components use these semantic tokens for dark surfaces, mint priority actions, focus, and selected rows; tabular scores, outline icons, rounded controls, and reduced-motion handling preserve the incumbent language.

Observed exceptions, left unchanged: decorative dice use literal ivory colors and shadows; the sixth avatar color is a literal value; `--gold` reuses the specified warning color for the trophy/confetti as well as storage warnings. These fall outside the document's strict semantic-color guidance. The shared border token uses 10% white rather than the documented default 8%, and the reference-led home display exceeds the suggested 48–64px type range. These observations are not new system-wide rules.

Evidence: source review of `app/page.tsx`, `app/globals.css`, `PRODUCT.md`, and `DESIGN.md`. This brief makes no independent browser-verification claim.

## Gameplay refinements
- Compact live standings retain turn order and show medal emoji for positive scores in the first three competition ranks; tied scores share a rank.
- A small “+ Jugador” action below the standings opens an inline name field. Joining appends a zero-score player without changing the current turn, pending score, or history. Cancel/Escape closes the field; successful addition restores focus to its trigger.
- The active turn's heading, top border, and background tint use the current player's assigned identity color.
- A quiet global footer credits “Walter Benavides” and links to the same GitHub profile used by Ron 500.
- Verified midgame joining, validation, cancellation, refresh recovery, turn progression, undo, and player colors in browser automation, including narrow mobile layout.
