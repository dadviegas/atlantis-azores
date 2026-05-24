Every element renders as a rectangular box composed of four nested regions: content, padding, border, and margin. How those regions add up to a final width and height depends on `box-sizing`, and how adjacent boxes interact depends on whether margins collapse. Most "my layout is off by 32 pixels" bugs live here.

## The four regions

```
+-----------------------------------+
|             margin                |
|  +-----------------------------+  |
|  |           border            |  |
|  |  +-----------------------+  |  |
|  |  |        padding        |  |  |
|  |  |  +-----------------+  |  |  |
|  |  |  |     content     |  |  |  |
```

- **content** — where text and child boxes live; its size is `width`/`height`.
- **padding** — transparent space inside the border; takes the element's background.
- **border** — a visible (or invisible) line around padding.
- **margin** — transparent space *outside* the border, used to push siblings away.

## `box-sizing`

| Value | What `width` measures |
| --- | --- |
| `content-box` (default) | Just the content. Padding and border add to the total. |
| `border-box` | Content + padding + border. Margin still adds on top. |

Almost every project ships with this reset:

```css
*, *::before, *::after {
  box-sizing: border-box;
}
```

With `border-box`, `width: 300px` means "300px on screen including padding and border", which matches how designers and humans think.

## Margin collapsing

Vertical margins between block siblings (and between a parent and its first/last child) merge into a single margin equal to the larger of the two. This is *only* a thing in block layout.

```html
<section>
  <p style="margin-bottom: 24px">A</p>
  <p style="margin-top: 16px">B</p>
</section>
```

The gap between A and B is `24px`, not `40px`.

Collapsing is blocked by:

- Padding or border on the parent.
- The parent being a flex/grid container (children's margins don't collapse with each other or with the parent).
- The parent establishing a block formatting context (`overflow: hidden`, `display: flow-root`, `contain: layout`).
- Margins on horizontally adjacent siblings (horizontal margins never collapse).

`display: flow-root` is the modern way to opt out without side effects.

## Intrinsic vs extrinsic sizing

**Extrinsic** sizing means "the box is told how big to be" (`width: 400px`, `width: 50%`). **Intrinsic** sizing means "the box sizes to its content" (`width: max-content`, `min-content`, `fit-content`).

| Keyword | Behavior |
| --- | --- |
| `max-content` | As wide as the content wants — no wrapping. |
| `min-content` | As narrow as the longest unbreakable token (longest word). |
| `fit-content` | Behaves like `max-content` until it would exceed the available space, then wraps. |
| `auto` | Layout-dependent default (often equivalent to `fit-content` in flex/grid). |

```css
.tag {
  width: fit-content;
  padding: 0.25rem 0.75rem;
}
```

A `fit-content` width is the easy way to get a pill-shaped chip without absolute positioning or `display: inline-block` quirks.

## `min-*`, `max-*`, and clamping

`min-width`/`max-width` always win over `width`. `min-width` beats `max-width` if they conflict. Use them together with `clamp()` for fluid sizing:

```css
.container {
  width: clamp(20rem, 80vw, 60rem);
}
```

See [responsive-design](./responsive-design.md) for more on `clamp()`.

## `aspect-ratio`

Lock a box to a ratio without padding hacks:

```css
.media {
  aspect-ratio: 16 / 9;
  width: 100%;
}
```

If both `width` and `height` are explicit, `aspect-ratio` is ignored.

## Gotchas

- A child's `margin-top` can escape and apply to the *parent* if nothing blocks collapse. The visible result is the page scrolling unexpectedly. Add `padding-top: 1px` or `display: flow-root` on the parent to contain it.
- `box-sizing` does not affect `margin` — margins always add outside the declared `width`.
- Percentage padding and margin are resolved against the *inline* size of the containing block, even when applied to the block axis. `padding-top: 50%` is 50% of the parent's width.
- `width: 100%` plus `padding` and `content-box` overflows the parent. Switch to `border-box` or drop the explicit width.
- `min-content` on a container with a long URL or unbreakable word can force unwanted horizontal scroll; pair with `overflow-wrap: anywhere` to recover.
