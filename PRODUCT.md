# Product
<!-- impeccable:product-schema 1 -->
## Platform
web
## Stack
Next.js App Router, React, TypeScript, localStorage. User requested Next.js and local persistence.
## Users and purpose
Groups sharing one phone while playing 10.000 with physical dice. Record manually calculated scores with very few taps.
## Capabilities and constraints
The authoritative feature brief is PRODUCT_REQUIREMENTS.md. Spanish interface. Player names and reorderable turn order; manual points and +50/+100/+500; save and automatic turn advance; undo including a winning turn; turn history. Tapping an entire scoreboard row opens that player's compact turn-history modal, with player-specific numbering, running totals, and the highlighted scoring turn at risk of a penalty. Setup includes two optional rules, disabled by default: exact 10,000 (going over records a scoreless bust) and a penalty that removes the last scoring turn after three consecutive turns without adding points, then resets that counter to zero. The three-dot menu allows changing either rule during play; changes affect upcoming turns, preserve past scores, and activating the penalty starts a fresh streak. Zero-point turns advance and are recorded (confirmed by user), and the live standings show scoreless streaks only while their rule is active.
Persist setup, rules, names, order, totals, active player, input, history, and finished status in this browser. No accounts, backend, digital dice rolling, statistics, or scoring configuration beyond the two supplied rules.
## Brand commitments
Follow the existing DESIGN.md and the supplied four-screen image. Mobile-first dark surfaces and mint accents. Desktop uses scoreboard and scoring controls side by side.
## Product principles
Keep scores visible, emphasize the current player, avoid confirmations except when replacing an active game, and recover quickly from mistaken entries.
