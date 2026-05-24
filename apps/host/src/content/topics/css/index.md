Modern CSS is a different language than the one most people learned. Layout has grids and container queries, color has wide-gamut spaces and `color-mix()`, selectors can look forward with `:has()`, and the cascade itself is now layerable. The browser does more for you — but only if you know what to ask for.

The notes below move from the fundamentals of how rules apply, through layout and theming systems, and into the features that have landed across all evergreen browsers in the last few years.

## Subtopics

| File | What it covers |
| --- | --- |
| [selectors-and-specificity](./selectors-and-specificity.md) | selector types, the (a,b,c) tuple, `!important`, `:where`/`:is` to control weight |
| [cascade-and-inheritance](./cascade-and-inheritance.md) | origins, layers, tiebreakers, inheritance, `initial`/`inherit`/`revert`/`unset` |
| [box-model](./box-model.md) | content/padding/border/margin, `box-sizing`, margin collapsing, intrinsic sizing |
| [flexbox](./flexbox.md) | main vs cross axis, `justify`/`align`, the `flex` shorthand, `gap`, common patterns |
| [grid](./grid.md) | `grid-template`, `fr` units, named lines and areas, `auto-fit`/`auto-fill`, subgrid |
| [positioning](./positioning.md) | the five `position` values, containing block, stacking contexts, `z-index` |
| [custom-properties](./custom-properties.md) | declaration, scoping, theming, `@property`, registered types, fallbacks |
| [responsive-design](./responsive-design.md) | mobile-first, `svh`/`dvh`/`lvh`, `clamp()`, media query range syntax |
| [container-queries](./container-queries.md) | `container-type`, `@container`, `cqw`/`cqi` units, style queries |
| [typography](./typography.md) | web fonts, `font-display`, variation settings, `text-wrap`, fluid type |
| [color](./color.md) | rgb/hsl/hwb/lab/lch/oklch, `color-mix()`, relative color syntax, `color-scheme` |
| [transitions-and-animations](./transitions-and-animations.md) | `transition`, easing, `@keyframes`, `@starting-style`, View Transitions API |
| [logical-properties](./logical-properties.md) | inline/block axes, `margin-inline-start`, RTL support, `writing-mode` |
| [modern-features](./modern-features.md) | `:has()`, `@layer`, `@scope`, nesting, anchor positioning, `field-sizing` |
| [pitfalls](./pitfalls.md) | margin collapse, percentage heights, fixed inside transforms, `vh` on mobile |

## How to read these

Each page is self-contained. If you only have time for two, start with [cascade-and-inheritance](./cascade-and-inheritance.md) and [grid](./grid.md) — they cover the largest gap between "writes CSS daily" and "understands CSS".
