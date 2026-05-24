Flexbox lays out items along a single axis with explicit rules for how leftover space is distributed and how items shrink under pressure. It is the right tool when content drives the layout and you want one axis of alignment with the other handled automatically.

## Axes

A flex container has a **main axis** (set by `flex-direction`) and a **cross axis** (perpendicular). All the alignment properties are named relative to those axes — not to "horizontal" or "vertical".

```css
.row    { display: flex; flex-direction: row; }    /* main = inline */
.column { display: flex; flex-direction: column; } /* main = block */
```

`row-reverse` and `column-reverse` flip the main axis direction, which affects visual order *and* keyboard tab order in some browsers — keep that in mind for accessibility.

## Alignment

| Property | Axis | Notes |
| --- | --- | --- |
| `justify-content` | main | Distributes free space along the main axis. |
| `align-items` | cross | Aligns items on the cross axis (single line). |
| `align-content` | cross | Distributes lines when wrapped. |
| `align-self` | cross | Overrides `align-items` per item. |
| `justify-self` | main | No effect in flex — use auto margins. |

Common values: `flex-start`, `flex-end`, `center`, `space-between`, `space-around`, `space-evenly`, `stretch`, `baseline`.

```css
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}
```

## The `flex` shorthand

`flex: <grow> <shrink> <basis>` controls how an item shares space.

| Value | Means |
| --- | --- |
| `flex: 0 1 auto` (default) | Don't grow, do shrink, size from content/`width`. |
| `flex: 1` | Shorthand for `1 1 0` — grow equally, ignore intrinsic size. |
| `flex: auto` | `1 1 auto` — grow but respect intrinsic size. |
| `flex: none` | `0 0 auto` — rigid; no grow, no shrink. |

```css
.sidebar { flex: 0 0 240px; }
.main    { flex: 1; }
```

`flex: 1` makes items split free space *equally regardless of content* — the `0` basis is what makes this work. `flex: auto` weights the split by content size.

## `gap`

`gap` works in flex (and grid) and replaces the old `margin` tricks for spacing. It applies *between* items only, never around the edges, which composes much better.

```css
.list {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 2rem; /* row-gap column-gap */
}
```

## Wrapping

`flex-wrap: wrap` allows items to break onto multiple lines. Combined with `flex-basis` it gives you a responsive row without media queries:

```css
.cards {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
.cards > * {
  flex: 1 1 16rem; /* minimum 16rem, grow to fill */
}
```

Items wrap when their basis no longer fits; on the new line they grow to fill remaining space.

## Common patterns

**Centering anything:**

```css
.center { display: flex; place-items: center; min-height: 100vh; }
```

**Push the last item to the end:**

```css
.bar { display: flex; gap: 1rem; }
.bar > .right { margin-left: auto; }
```

**Holy grail with sticky footer:**

```css
body { display: flex; flex-direction: column; min-height: 100dvh; }
main { flex: 1; }
```

**Two-line header where left wraps, right stays put:**

```css
.header { display: flex; flex-wrap: wrap; gap: 1rem; justify-content: space-between; }
```

## Gotchas

- `min-width: 0` is often needed on flex children with text — by default they refuse to shrink below their content's `min-content`, which prevents `text-overflow: ellipsis` from kicking in.
- `flex-basis: 0` vs `0%` differ in some browsers when the container has no defined main size. Prefer `0`.
- `align-items: stretch` (default) on a row makes children equal height — great for cards, surprising when you wanted intrinsic heights.
- `justify-self` is ignored in flex layouts. Use `margin-left: auto` for the "push to end" trick.
- Percentages on `flex-basis` resolve against the *content box* of the container, not its padding box.

## Flex vs Grid

Reach for flex when you have a 1D list whose items size themselves and you want alignment along one axis. Reach for [grid](./grid.md) when you have a 2D layout or you want to position items into named regions of a defined template.
