Responsive design used to mean "swap layouts at breakpoints". Modern CSS gives you tools to make most layouts respond *continuously* — fluid type with `clamp()`, intrinsic grids with `auto-fit`, container-driven components, and viewport units that finally behave on mobile. Media queries are now the exception, not the rule.

## Mobile-first

Write base styles for the smallest viewport, then layer on enhancements with `min-width` queries. This keeps the cascade going from small-and-simple to larger-and-more-complex, which is the natural direction for CSS.

```css
.layout { display: grid; gap: 1rem; }

@media (min-width: 48rem) {
  .layout { grid-template-columns: 1fr 2fr; }
}

@media (min-width: 80rem) {
  .layout { grid-template-columns: 1fr 3fr 1fr; }
}
```

Use `rem` for breakpoints — they scale with the user's root font size, which respects accessibility preferences. Pixel breakpoints lock you to the browser default.

## Viewport units

| Unit | Meaning |
| --- | --- |
| `vw` / `vh` | 1% of the layout viewport's width/height. |
| `vmin` / `vmax` | Smaller/larger of `vw` and `vh`. |
| `svw` / `svh` | **Small** viewport — as if browser UI is fully expanded. |
| `lvw` / `lvh` | **Large** viewport — as if browser UI is fully retracted. |
| `dvw` / `dvh` | **Dynamic** viewport — updates as UI shows/hides. |
| `vi` / `vb` | Inline / block axes (writing-mode aware). |

On mobile, the address bar collapses on scroll, so the viewport grows. `100vh` is the *large* viewport, which means a hero set to `100vh` overflows when the bar is visible. `100dvh` is the fix:

```css
.hero { min-height: 100dvh; }
```

`dvh` is the right default for "fill the screen now". Use `svh` when you must guarantee the content fits with browser UI shown (e.g. a full-screen modal that should never scroll behind the address bar).

## `clamp()`

`clamp(min, preferred, max)` returns the preferred value bounded by min and max. It's the workhorse of fluid sizing:

```css
.title {
  font-size: clamp(1.5rem, 2.5vw + 1rem, 3rem);
}

.container {
  width: clamp(20rem, 90vw, 64rem);
  margin-inline: auto;
}
```

The middle expression usually mixes a relative unit (`vw`, `%`) with a fixed offset (`rem`) so the value scales but doesn't start at zero.

## Fluid type formula

A common pattern:

```css
:root {
  font-size: clamp(1rem, 0.9rem + 0.4vw, 1.25rem);
}
```

Every `rem`-based size in the design then scales with the viewport between sensible bounds, without breakpoints.

## Media query range syntax

The old `min-width` / `max-width` style still works, but modern syntax uses comparison operators:

```css
@media (width >= 48rem) { ... }
@media (48rem <= width <= 80rem) { ... }
@media (orientation: landscape) and (width > 60rem) { ... }
```

The range form is unambiguous (no off-by-one between `max-width: 47.999rem` and `min-width: 48rem`) and reads more naturally.

## Preference queries

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

@media (prefers-color-scheme: dark) { ... }
@media (prefers-contrast: more) { ... }
@media (prefers-reduced-transparency: reduce) { ... }
```

Honoring `prefers-reduced-motion` is non-negotiable for accessibility — vestibular disorders can make casual animation literally nauseating.

## Container queries

For component-driven responsiveness, prefer [container-queries](./container-queries.md) over media queries. A card that's wide enough deserves a row layout regardless of where it lives on the page.

## Intrinsic responsive grids

```css
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(16rem, 100%), 1fr));
  gap: 1rem;
}
```

The `min(16rem, 100%)` guards against the 16rem track being wider than its container (e.g. inside a narrow sidebar), which would otherwise cause horizontal overflow.

## Images

```css
img {
  max-width: 100%;
  height: auto;
  display: block;
}
```

Pair with `srcset` and `sizes` for resolution switching, or `<picture>` for art direction:

```html
<picture>
  <source srcset="hero-wide.avif" media="(min-width: 60rem)" />
  <img src="hero-tall.avif" alt="" width="800" height="600" />
</picture>
```

Always set `width` and `height` attributes — the browser uses them to reserve space and prevent layout shift before the image loads.

## Gotchas

- `vh` on iOS Safari was historically the *large* viewport, so a `100vh` modal got cut off by the address bar. `dvh` solves this everywhere modern.
- Be careful animating `dvh` — it changes when the address bar moves, which can trigger reflow during scroll.
- `clamp()`'s preferred value can be ignored entirely on viewports where it falls outside the min/max bounds — make sure the middle expression actually does something between your thresholds.
- Media queries don't see CSS custom properties, but they *can* be set from them via the (limited) `@container style(--x)` queries — see [container-queries](./container-queries.md).
- Mobile-first does not mean "design only for phones first". It means *write the CSS in size order*; the design process can start wherever you like.
