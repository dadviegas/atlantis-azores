CSS Grid is a two-dimensional layout system: you define a template of rows and columns, then place items into it. Where flexbox distributes items along one axis, grid lets you say "this goes in row 2, column 3, spanning two columns". The result is layouts that used to require frameworks, expressed in a handful of lines.

## The minimum viable grid

```css
.layout {
  display: grid;
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  gap: 1rem;
}
```

That's a classic three-column page with header and footer. Items flow into cells in source order unless you place them explicitly.

## The `fr` unit

`fr` means "fraction of leftover space". After fixed and `auto`-sized tracks are resolved, `fr` tracks divide what remains.

```css
grid-template-columns: 200px 1fr 2fr;
```

In a 1000px container, that's `200px`, `~266px`, `~533px`.

`minmax(min, max)` sets a track's bounds:

```css
grid-template-columns: minmax(12rem, 1fr) 3fr;
```

The first column is at least 12rem, never less, and shares space proportionally otherwise.

## `auto-fit` vs `auto-fill`

`repeat()` with `auto-fit` or `auto-fill` produces as many columns as fit. They differ when there are too few items to fill the row:

| Function | Empty tracks |
| --- | --- |
| `auto-fill` | Reserved (kept as empty tracks). |
| `auto-fit` | Collapsed (existing items expand to fill). |

```css
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: 1rem;
}
```

This is the responsive card grid pattern — no media queries needed. Items reflow as the container changes width.

## Named lines and areas

You can name the lines between tracks and place items by line names:

```css
.page {
  display: grid;
  grid-template-columns: [start] 1fr [main-start] 3fr [main-end] 1fr [end];
}
.sidebar { grid-column: start / main-start; }
.content { grid-column: main-start / main-end; }
```

Areas are easier to read for whole-page layouts:

```css
.app {
  display: grid;
  grid-template-areas:
    "header header"
    "nav    main"
    "footer footer";
  grid-template-columns: 200px 1fr;
  grid-template-rows: auto 1fr auto;
  min-height: 100dvh;
}
header { grid-area: header; }
nav    { grid-area: nav; }
main   { grid-area: main; }
footer { grid-area: footer; }
```

A `.` represents an empty cell.

## Placement shorthand

```css
.item {
  grid-column: 2 / 4;       /* line 2 to line 4 */
  grid-column: 2 / span 2;  /* line 2, span 2 tracks */
  grid-row: 1 / -1;         /* first row to last row */
}
```

Negative indices count from the end. `-1` is the last line, `-2` is the second-to-last.

## Implicit tracks

Items placed beyond the explicit template create *implicit* tracks. Control their size with `grid-auto-rows` / `grid-auto-columns` and direction with `grid-auto-flow`.

```css
.masonry {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: minmax(8rem, auto);
  grid-auto-flow: dense; /* fill earlier gaps when possible */
}
```

`dense` packing reorders items visually (not in the DOM), which can confuse screen readers — use carefully.

## Subgrid

A nested grid can inherit the parent's tracks with `subgrid`, keeping child elements aligned across siblings.

```css
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: 1rem;
}
.card {
  display: grid;
  grid-template-rows: subgrid;
  grid-row: span 3; /* image, title, body all aligned across cards */
}
```

Without subgrid, each card has its own row tracks and titles won't line up if image heights differ.

## Alignment

Grid uses the same `justify-*` / `align-*` family as flex, but `justify-*` is on the inline axis and `align-*` on the block axis (regardless of flow). `place-items` and `place-content` are the shorthands.

```css
.cell { display: grid; place-items: center; } /* center every item in its cell */
```

`justify-self` and `align-self` are honored in grid (unlike flex).

## Gotchas

- `1fr` is shorthand for `minmax(auto, 1fr)`, *not* `minmax(0, 1fr)`. A long word in one column can push other `1fr` columns smaller than expected. Use `minmax(0, 1fr)` for strict equal distribution.
- `grid-template` is a powerful shorthand for rows, columns, and areas at once — but the syntax is dense; many teams prefer the long-form properties.
- Items with `position: absolute` inside a grid use the grid area as their containing block if `grid-column`/`grid-row` is set — useful for overlays.
- `gap` is not the same as `margin` — it doesn't collapse, doesn't apply at edges, and works in both flex and grid.

## When grid beats flex

Anything two-dimensional, anything where alignment across rows *and* columns matters, anything where you want to swap layouts at breakpoints by redefining `grid-template-areas`. For a single row of items that flow and wrap, [flexbox](./flexbox.md) is still simpler.
