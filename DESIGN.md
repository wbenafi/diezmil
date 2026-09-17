# Design System

This document defines the visual language, reusable patterns, and component styling for the product.

It is intentionally application-agnostic.

Do not infer information architecture, page layouts, product behavior, or feature requirements from this file. Those belong to the product requirements.

Use this document to determine how interfaces look and feel, not what interfaces contain.

---

## 1. Visual Direction

The design language is:

**Dark · Modern · Technical · Precise · Premium · Energetic**

Interfaces should feel contemporary and technology-forward without becoming futuristic, gaming-heavy, or visually noisy.

The visual system is built around:

- Deep near-black backgrounds
- Layered dark surfaces
- Bright mint-green accent
- High-contrast typography
- Thin luminous borders
- Controlled translucency
- Subtle gradients
- Restrained glow
- Generous rounded geometry
- Clear hierarchy

The result should feel polished and dimensional while remaining highly functional.

Avoid interfaces that feel:

- Corporate
- Generic SaaS
- Flat and lifeless
- Cartoonish
- Retro
- Excessively neon
- Over-decorated

---

## 2. Core Principles

### Clarity before decoration

Visual effects must reinforce hierarchy.

Never add gradients, glow, glass, borders, or shadows simply because space is available.

### Dark surfaces create structure

Hierarchy should primarily come from layered dark surfaces rather than many different colors.

### Accent communicates importance

The primary accent color identifies interaction, selection, focus, and emphasis.

It should remain scarce enough to retain meaning.

### Depth should be subtle

Use small differences in surface color, border opacity, blur, and light to establish depth.

Avoid dramatic shadows or excessive contrast between neighboring surfaces.

### Interfaces should feel tactile

Interactive components should provide obvious hover, focus, active, pressed, and disabled states.

### Density should remain comfortable

Prefer efficient interfaces, but preserve sufficient spacing for scanning and touch interaction.

---

## 3. Color Tokens

Colors must be consumed through semantic tokens rather than arbitrary values throughout the application.

### Foundations

#### `--background`

`#071014`

Primary application background.

Almost black with a subtle cool green character.

#### `--surface`

`#0B171C`

Primary elevated surface.

#### `--surface-raised`

`#102127`

Used for components requiring stronger separation from their parent surface.

#### `--surface-hover`

`#14292F`

Interactive dark-surface hover state.

---

## 4. Accent Tokens

#### `--accent`

`#50E6A8`

Primary accent.

#### `--accent-bright`

`#62F2B4`

Used for highlights and gradients.

#### `--accent-deep`

`#087A59`

Used when the accent requires a darker endpoint or stronger contrast.

#### `--accent-subtle`

`rgba(80, 230, 168, 0.10)`

Used for selected backgrounds and subtle emphasis.

#### `--accent-border`

`rgba(80, 230, 168, 0.55)`

Used for active or selected borders.

#### `--accent-glow`

`rgba(80, 230, 168, 0.15)`

Used for restrained illumination.

Never use accent colors as large background fills unless the component is intentionally a high-priority action.

---

## 5. Text Tokens

#### `--text-primary`

`#F5F7F6`

Primary content.

#### `--text-secondary`

`#A9B8B7`

Supporting information.

#### `--text-muted`

`#6F8282`

Low-priority metadata.

#### `--text-on-accent`

`#071014`

Content displayed on bright accent surfaces.

Maintain accessible contrast at all times.

---

## 6. Semantic Colors

Semantic colors should only communicate their semantic meaning.

### Success

`#50E6A8`

### Warning

`#F2B84B`

### Danger

`#F05D5E`

### Information

`#3B9EFF`

Prefer subtle backgrounds derived from these colors rather than large saturated surfaces.

Do not use semantic colors decoratively.

---

## 7. Typography

Use a clean, modern sans-serif.

Preferred:

- Inter

Acceptable alternatives:

- Geist
- Manrope
- SF Pro

Avoid decorative fonts.

Personality should come from hierarchy, composition, spacing, and color rather than novelty typography.

### Weight

Prefer:

- 400 — body
- 500 — emphasized body / controls
- 600 — labels and smaller headings
- 700 — headings
- 800 — large display values when appropriate

Avoid excessive use of bold text.

### Type scale

| Style | Size |
| --- | --- |
| Display | 48–64px |
| Heading 1 | 32–40px |
| Heading 2 | 24–28px |
| Heading 3 | 18–22px |
| Body Large | 17–18px |
| Body | 15–16px |
| Small | 13–14px |
| Micro | 11–12px |

Use display type for rare, high-emphasis values or titles.

Exact sizes may adapt responsively.

Hierarchy matters more than matching exact pixel values.

---

## 8. Numeric Content

When displaying changing numeric values, prefer tabular numbers:

```css
font-variant-numeric: tabular-nums;
```

Use stronger weight and contrast for important numerical information.

Numbers that represent primary state may use significantly larger typography than surrounding labels.

---

## 9. Spacing

Use a 4px-based spacing system.

Tokens:

```text
4
8
12
16
20
24
32
40
48
64
```

Do not introduce arbitrary spacing values unless necessary.

General guidance:

- Related elements → 8–12px
- Component internal spacing → 12–20px
- Related component groups → 20–24px
- Major sections → 32–48px

Prefer whitespace over unnecessary separators.

---

## 10. Corner Radius

Rounded geometry is a defining characteristic of the system.

| Size | Radius | Usage |
| --- | --- | --- |
| Small | 8px | Small controls and compact elements |
| Medium | 12px | Standard controls |
| Large | 16px | Inputs, buttons, and standard cards |
| Extra Large | 20–24px | Prominent containers |
| Full | 9999px | Genuinely pill-shaped controls, tags, indicators, or circular elements |

Do not make every component pill-shaped.

---

## 11. Borders

Default border:

```css
border: 1px solid rgba(255, 255, 255, 0.08);
```

Stronger separation:

```css
border: 1px solid rgba(255, 255, 255, 0.12);
```

Active:

```css
border-color: var(--accent-border);
```

Borders should normally be thin.

Avoid heavy outlines.

---

## 12. Shadows and Glow

Dark interfaces should rely more on surface hierarchy than traditional drop shadows.

Standard elevation:

```css
box-shadow:
  0 8px 24px rgba(0, 0, 0, 0.18);
```

Accent glow:

```css
box-shadow:
  0 0 20px var(--accent-glow);
```

Use accent glow only for:

- Focus
- Selection
- High-priority interaction
- Temporary emphasis

Never apply glow to every component.

---

## 13. Glass Surfaces

Glass treatment is allowed as a secondary visual device.

Example:

```css
background: rgba(16, 33, 39, 0.72);
border: 1px solid rgba(255, 255, 255, 0.08);
backdrop-filter: blur(12px);
```

Use glass when:

- A surface floats above another layer
- Background context should remain subtly visible
- Additional depth improves hierarchy

Do not use glass when:

- A simple opaque surface communicates hierarchy better
- Large amounts of text require maximum readability
- Many nested glass surfaces would appear noisy

Glass is an accent, not the foundation of every component.

---

## 14. Buttons

Buttons should communicate hierarchy primarily through surface treatment.

### Primary Button

Use for the highest-priority action within a context.

Style:

```css
background: linear-gradient(
  135deg,
  var(--accent),
  var(--accent-bright)
);
color: var(--text-on-accent);
```

Characteristics:

- Strong contrast
- Medium/large radius
- Bold or semibold label
- Large interaction target
- Optional supporting icon

Recommended height:

52–60px for prominent touch interfaces.

Avoid placing multiple primary buttons next to each other unless the actions genuinely have equal importance.

### Secondary Button

Use for normal actions that should remain clearly available without dominating.

Style direction:

```css
background: var(--surface-raised);
border: 1px solid rgba(255,255,255,.10);
color: var(--text-primary);
```

### Ghost Button

Use for low-emphasis actions.

Default background should be transparent.

Hover may introduce `--surface-hover`.

Do not use ghost styling for important actions.

### Destructive Button

Use danger colors only for destructive actions.

Prefer a restrained danger treatment until the user is actively confirming or hovering over the destructive action.

### Icon Button

Use for recognizable compact actions.

Requirements:

- Minimum 44×44px interaction target
- Clear hover/focus state
- Tooltip when meaning may not be obvious
- Consistent icon sizing

---

## 15. Button States

All interactive controls must define:

- Default
- Hover
- Focus
- Active / pressed
- Disabled

Pressed states should feel tactile.

Prefer subtle:

- Scale change
- Brightness change
- Surface shift

Example:

```css
transform: scale(0.98);
```

Avoid exaggerated motion.

---

## 16. Inputs

Inputs should feel integrated into the dark surface system.

Default:

- `--surface-raised` background
- Subtle border
- Primary text
- Secondary placeholder

Focus:

- Accent border
- Restrained accent glow

Error:

- Danger border
- Supporting error text

Standard inputs should generally use:

48–56px height.

Large or high-priority inputs may exceed this.

Labels should remain visible rather than relying solely on placeholders.

---

## 17. Cards

Cards group related content.

Default card:

- `--surface`
- Thin neutral border
- Large radius
- Comfortable padding

Raised card:

- `--surface-raised`
- Optional subtle shadow

Interactive card:

- Hover surface
- Clear pointer affordance
- Optional accent border when selected

Avoid wrapping every section in a card.

Use cards only when grouping or separation adds meaning.

---

## 18. List Rows

Prefer compact rows over individual cards when displaying repeated homogeneous information.

A row may contain:

- Leading visual identifier
- Primary label
- Secondary information
- Trailing value
- Optional action

Rows should maintain consistent alignment.

Use dividers, spacing, or subtle surface differences rather than separate heavy containers for every item.

---

## 19. Badges and Status Indicators

Badges communicate compact state or metadata.

Use:

- Small typography
- Subtle tinted background
- Corresponding foreground color
- Pill geometry

Avoid saturated filled badges unless emphasis is necessary.

A badge should never compete visually with a primary action.

---

## 20. Avatars and Identifiers

When no image is available, use generated identifiers such as:

- Initial
- Icon
- Symbol

Default avatar:

- Circular
- Accent or generated color
- High-contrast content

Use avatars primarily to improve scanning, not as decoration.

---

## 21. Icons

Use one consistent outline icon family.

Preferred:

- Lucide

Recommended characteristics:

- 1.5–2px stroke
- Rounded line caps
- Consistent optical sizing

Common icon sizes:

- 16px compact
- 20px standard
- 24px prominent

Icons should support labels rather than replace them when meaning is ambiguous.

Do not mix unrelated icon styles.

---

## 22. Navigation

Navigation should remain visually quieter than primary content.

Use:

- Dark or transparent surfaces
- Clear active state
- Accent used sparingly

Active navigation may use:

- Accent icon/text
- Accent-subtle background
- Small indicator

Avoid large saturated navigation bars.

---

## 23. Modals and Overlays

Use overlays for focused temporary tasks, not ordinary navigation.

Backdrop:

```css
background: rgba(0, 0, 0, 0.6);
```

Modal surface:

- `--surface-raised`
- Large radius
- Thin border
- Strong hierarchy

Avoid stacking multiple overlays.

---

## 24. Dividers

Prefer spacing before introducing dividers.

When necessary:

```css
border-color: rgba(255,255,255,.07);
```

Dividers should be subtle enough that content remains dominant.

---

## 25. Focus States

Keyboard focus must always be visible.

Preferred treatment:

- Accent border
- Small outer ring or glow

Example:

```css
outline: 2px solid rgba(80, 230, 168, 0.45);
outline-offset: 2px;
```

Do not remove focus indicators without providing an accessible replacement.

---

## 26. Motion

Motion should communicate state changes, hierarchy, and responsiveness.

Default duration:

150–250ms

Default easing:

```css
cubic-bezier(0.2, 0.8, 0.2, 1)
```

Good uses:

- Hover
- Press
- Expand/collapse
- Selection
- Content entering/leaving
- State transitions
- Value changes

Avoid animations that delay interaction.

Respect:

```css
prefers-reduced-motion
```

---

## 27. Responsive Layout

The system is mobile-first but must adapt naturally to larger screens.

### Mobile

Typical horizontal padding:

20–24px

Favor:

- Single-column layouts
- Large touch targets
- Clear vertical hierarchy

### Larger screens

Do not simply stretch mobile components.

Use:

- Maximum content widths
- Additional columns where meaningful
- Increased whitespace
- Stable component sizes

Dense content should remain readable rather than expanding indefinitely.

---

## 28. Touch Targets

Minimum interactive target:

44×44px

For frequent touch interactions prefer:

48–56px

Visual elements may appear smaller if their interactive hit area still meets this requirement.

---

## 29. Accessibility

Maintain sufficient contrast.

Never communicate meaning through color alone.

State should also be represented through one or more of:

- Text
- Icon
- Border
- Shape
- Position
- Typography

Support:

- Keyboard navigation
- Visible focus
- Screen readers
- Reduced motion
- Dynamic content sizes where practical

---

## 30. Visual Hierarchy

A screen should usually have only one dominant visual focal point.

Hierarchy should generally follow:

Primary state/content → primary action → supporting content → secondary actions → metadata

Do not allow multiple components to compete for maximum emphasis.

Use accent color according to hierarchy, not decoration.

---

## 31. Decorative Effects

Atmospheric gradients, abstract light, subtle noise, and glow may be used to create depth and identity.

They must:

- Remain low contrast
- Never reduce readability
- Never interfere with interaction
- Remain behind functional content
- Be used selectively

Decorative effects should disappear before functional hierarchy becomes compromised.

---

## 32. Composition Rules

Prefer:

- Strong alignment
- Consistent edges
- Clear grouping
- Intentional whitespace
- Few visual layers
- Large primary elements paired with quieter secondary content

Avoid:

- Excessive nested containers
- Card-inside-card repetition
- Unnecessary separators
- Multiple competing gradients
- Random radius values
- Arbitrary colors
- Inconsistent component treatments

---

## 33. Component Selection

Before creating a new component style, determine whether the interface can use an existing pattern:

- Primary button
- Secondary button
- Ghost button
- Icon button
- Input
- Card
- List row
- Badge
- Avatar
- Modal
- Navigation item

New visual patterns should only be introduced when existing components cannot express the required interaction clearly.

Consistency is more important than novelty.

---

## 34. Restraint Rule

The system uses several expressive tools:

- Bright accent
- Gradient
- Glow
- Glass
- Large typography
- Motion

Do not use all of them simultaneously on every component.

A useful rule:

> Dark surfaces create structure.  
> Accent indicates importance.  
> Glow indicates focus.  
> Motion communicates change.

If everything is emphasized, nothing is emphasized.

---

## 35. Implementation Rule

When implementing a new interface:

1. Determine the information hierarchy from the product requirements.
2. Select the appropriate components from this system.
3. Apply semantic design tokens.
4. Establish hierarchy using typography, spacing, and surfaces first.
5. Introduce accent only where interaction or importance requires it.
6. Add effects such as glow, glass, gradients, and motion last.
7. Remove any effect that does not improve hierarchy, feedback, or comprehension.

The design system should remain recognizable regardless of the application using it.

A screen built with this system should feel related to every other screen because of its typography, geometry, surfaces, interaction patterns, color semantics, and restraint—not because it copies a predefined layout.
