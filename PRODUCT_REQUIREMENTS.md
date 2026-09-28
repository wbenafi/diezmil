# Build “DiezMil”, a simple scorekeeper for the dice game “10.000”

Build a simple, mobile-first web application for keeping score during a game of 10.000.

The application is a scorekeeper, not a digital implementation of the dice game. Players roll physical dice, calculate their own score, and enter the resulting points into the application.

## Design

Before implementing any UI, read and follow `DESIGN.md`.

`DESIGN.md` is the source of truth for visual decisions such as colors, typography, spacing philosophy, component appearance, borders, shadows, visual hierarchy, etc.

The requirements below define the layout, information architecture, interactions, and UX, but should not override the visual language established in `DESIGN.md`.

The experience should be optimized primarily for mobile phones and for use by several people sharing a single device during a physical game.

---

## Core flow

The entire experience should be centered around this loop:

Create game → Add players → Start game → Show current player → Enter score → Save → Automatically move to next player

Keep this loop extremely fast.

Avoid unnecessary screens, confirmations, modals, menus, or navigation.

---

## 1. New Game

When there is no active game, show a simple starting screen with:

- App name: DiezMil
- Primary action: Nueva partida

Starting a new game takes the user to player setup.

---

## 2. Player Setup

Allow the user to create the list of players participating in the game.

Example:

```text
Jugadores
Walter
Keylor
Eli
+ Agregar jugador
[ Empezar partida ]
```

Requirements:

- Players only need a name.
- Adding players should be very quick.
- Players can be removed before starting.
- Players should be reorderable if reasonably simple to implement.
- The displayed order determines the turn order.
- Do not require accounts, avatars, emails, profiles, or any other information.

The goal is to go from opening the application to playing in a few seconds.

---

## 3. Main Game Screen

This is the most important screen in the application.

It should clearly communicate two things at a glance:

1. Whose turn it is
2. The current standings/scores

The current player should have significantly more visual prominence than the other players.

Example information hierarchy:

```text
10.000
Walter       2.350
Keylor       1.900
Eli          3.100
Turno de Walter
Puntaje
┌─────────────────────────────┐
│ 350                       × │
└─────────────────────────────┘
[ +50 ]    [ +100 ]    [ +500 ]
[ Guardar 350 ]
```

This is illustrative layout guidance, not a visual design specification. Follow `DESIGN.md` for styling.

---

## 4. Score Input

Players calculate their score themselves.

The application should not calculate poker/dice combinations.

Provide one numeric score input.

On mobile, it should invoke the numeric keyboard.

Next to or inside the input, provide a clear × / clear action whenever there is a value.

Clearing resets the entered score.

Below the input provide exactly these quick-add actions:

- +50
- +100
- +500

These buttons increment the current value rather than replacing it.

Examples:

```text
0
+500 → 500
+100 → 600
+50  → 650
```

Manual input and quick-add buttons should work together.

For example:

```text
User types 1000
+100
+50
Result: 1150
```

Do not add buttons for every possible score or dice combination.

The goal is to keep the controls extremely easy to scan and operate during a game.

---

## 5. Saving a Turn

The primary action should communicate the score being saved when possible:

```text
Guardar 650
```

When the user saves:

1. Add the entered score to the current player’s total.
2. Record the turn in the game history.
3. Reset the score input.
4. Automatically advance to the next player.

There should be no intermediate confirmation screen.

The next player should immediately become visually prominent.

---

## 6. Undo

Mistakes will be common because the application is being used quickly while people are playing.

After saving a turn, provide an easy way to undo the last action.

For example:

```text
Walter +650 ✓     Deshacer
```

Undo should:

- Remove those points from Walter.
- Remove that turn from history.
- Return the active turn to Walter.
- Restore the score input when appropriate.

Only the most recent saved turn needs to be immediately undoable.

Avoid confirmation dialogs for this action.

---

## 7. Scoreboard

The scores of all players should remain visible during normal gameplay whenever screen space reasonably allows it.

For each player show at minimum:

- Name
- Total score

Make the current player visually distinguishable.

The scoreboard should support different numbers of players without breaking the main scoring interaction.

Do not make users navigate to another screen just to see everyone’s score.

Tapping any part of a player's scoreboard row opens a compact modal with that player's turns, numbered consecutively for that player and showing the running total. When the three-turn penalty rule is active, highlight the scoring turn that would be removed and show the resulting score.

---

## 8. Winning

The target score is:

10,000 points

By default, reaching or exceeding 10,000 wins. During player setup, provide a compact rules menu where either optional rule can be enabled or disabled independently.

During an active game, the three-dot menu also allows either rule to be changed. Changes affect future turns only; saved turn results and scores remain unchanged. Activating the three-turn penalty starts a new scoreless streak.

- Exact target: the player must reach exactly 10,000. Going over does not add the entered points; record the turn as a bust, advance to the next player, and make the result clear in the active game and history.

- Three-turn penalty: after a player has three consecutive turns without adding points, remove the points from that player’s latest scoring turn that has not already been penalized, then reset the scoreless counter to zero. Zero-point turns and busts both count toward the streak. While this rule is active, show a compact streak counter beside the player only when its value is greater than zero.

Show the winner and final scores.

Provide an obvious action to:

```text
Nueva partida
```

Do not automatically destroy the completed game’s state immediately when someone wins.

---

## 9. Game State

Preserve the active game locally so accidentally refreshing or closing the browser does not destroy the game.

At minimum persist:

- Players
- Player order
- Scores
- Current turn
- Turn history
- Game status

Opening the application again should resume an unfinished game.

No authentication or backend is required solely for this functionality; prefer simple local persistence unless the existing project architecture indicates otherwise.

---

## 10. Secondary actions

During an active game, provide access to secondary actions such as:

- Restart/new game
- View turn history if useful

These actions should remain visually secondary and should not compete with score entry or “Guardar”.

Starting a new game while another game is active should require confirmation because it can destroy the current game state.

---

## UX principles

Optimize for a group of people playing around a table with one shared phone.

The application should require as little attention as possible.

Prioritize:

- Very few taps
- Large touch targets
- Fast score entry
- Easy scanning
- Clear current-player indication
- Immediate feedback
- No unnecessary navigation
- No unnecessary configuration
- No unnecessary features

The most frequent interaction in the entire application is:

enter score → save score

Optimize aggressively for that interaction.

Do not turn this into a complex game-management application.

For the first version, explicitly avoid:

- User accounts
- Online multiplayer
- Dice rolling
- Automatic recognition of dice combinations
- Player profiles
- Statistics dashboards
- Achievements
- Additional configurable scoring rules beyond the two supplied options
- Social features

Keep the product focused on doing one thing extremely well:

Keeping track of turns and scores so the players can focus on playing 10.000.
