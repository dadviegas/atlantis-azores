The `position` property changes how an element participates in normal flow and what coordinate system its offsets resolve against. Get the containing block wrong and `top: 0` lands somewhere baffling; get the stacking context wrong and `z-index: 999` does nothing.

## The five values

| Value | In flow? | Offsets relative to |
| --- | --- | --- |
| `static` (default) | Yes | N/A — offsets ignored. |
| `relative` | Yes | Its own original position. |
| `absolute` | No | Nearest *positioned* ancestor (or initial containing block). |
| `fixed` | No | The viewport (usually). |
| `sticky` | Yes | Its scroll container, within its containing block. |

```css
.relative-shift { position: relative; top: 4px; }   /* nudges, leaves a gap */
.tooltip        { position: absolute; inset: 0 0 auto auto; } /* top-right of parent */
.toolbar        { position: sticky; top: 0; }       /* sticks while scrolling */
.modal-backdrop { position: fixed; inset: 0; }      /* covers viewport */
```

`inset` is the shorthand for `top`/`right`/`bottom`/`left`. `inset: 0` is the modern way to write "stretch to fill".

## Containing block

The containing block is the rectangle an element's offsets and percentages resolve against. The rules:

- `position: static` or `relative` — containing block is the nearest block-level ancestor's content box.
- `position: absolute` — the nearest ancestor with a non-`static` position. If none, the **initial containing block** (viewport-sized).
- `position: fixed` — the viewport, *unless* an ancestor has `transform`, `filter`, `perspective`, `backdrop-filter`, `will-change` on any of those, or `contain: paint/layout/strict`. Then *that* ancestor becomes the containing block.

This is the "my fixed header isn't fixed" trap. Add `transform: translateZ(0)` to a parent and any `position: fixed` descendants are now positioned relative to it.

## Sticky

`position: sticky` is `relative` until the element would scroll past a given threshold, then it becomes `fixed` to that threshold within its scroll container. It stops sticking when its parent's bottom edge passes by.

```css
.section-heading {
  position: sticky;
  top: 0;
  background: white;
}
```

For sticky to work:

- An offset (`top`, `bottom`, `left`, or `right`) must be set.
- The scroll container must actually scroll (not `overflow: hidden` or `auto` with no overflow).
- No ancestor between the sticky element and the scroll container can have `overflow: hidden`.

## Stacking contexts

Within a stacking context, `z-index` decides paint order; across contexts, the *parent's* context decides who sits on top regardless of child `z-index` values.

An element creates a stacking context when it has any of:

- `position` other than `static` *and* a `z-index` other than `auto`
- `opacity` less than 1
- `transform`, `filter`, `perspective`, `clip-path`, `mask`, `mix-blend-mode` set
- `isolation: isolate`
- `will-change` on any property that triggers a context
- `position: fixed` or `sticky` (always, regardless of `z-index`)

```css
.card { isolation: isolate; }   /* contains z-index drama */
.card .badge { position: absolute; z-index: 1; }
```

`isolation: isolate` is the cleanest way to create a stacking context without side effects.

## `z-index` rules of thumb

- Use small integers: `1`, `2`, `10`. Skipping straight to `9999` paints you into a corner.
- Keep a layer scale documented (e.g. `--z-dropdown: 100; --z-modal: 1000; --z-toast: 1100`).
- `z-index: auto` participates in stacking order at position 0 — *not* the same as `0` for stacking context creation.
- A child with `z-index: 9999` cannot escape a parent with `opacity: 0.9`. The parent's stacking context contains it.

## Absolute positioning inside grid/flex

Absolute positioning escapes normal flow but still respects the parent's grid area if you give it explicit row/column placement:

```css
.grid { display: grid; grid-template-columns: 1fr 1fr; }
.overlay {
  position: absolute;
  grid-column: 1 / -1;
  grid-row: 1;
  inset: 0;
}
```

The parent needs `position: relative` (or another positioning context) for the absolute element to use its area as the containing block.

## Anchor positioning

Modern browsers ship `position-anchor` and `anchor()` for tethering one element to another without JS — see [modern-features](./modern-features.md).

## Gotchas

- A scrolling parent with `transform: translate(0)` becomes the containing block for any descendant `position: fixed`. Diagnose by checking for transforms up the tree.
- `position: sticky` in a flex/grid item often "doesn't work" because the parent flex item has the default `align-items: stretch`, making it the height of the container — so it never scrolls past its own bottom. Set `align-self: start` to fix.
- `top` and `bottom` together on an absolutely positioned element stretch it. Same for `left`/`right`. `inset: 0` is the four-sided version.
- An `<html>` or `<body>` with `overflow: hidden` breaks sticky on the page itself.
- `z-index` on a `static`-positioned element is ignored entirely (unless it's a flex/grid item).
