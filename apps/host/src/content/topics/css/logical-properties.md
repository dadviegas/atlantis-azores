Logical properties describe layout in terms of *flow* — inline and block axes, start and end edges — rather than physical directions like left/right/top/bottom. Write the same CSS once and it works in English, Arabic, and Japanese. They're also just better names: `margin-inline` is what you almost always mean by "horizontal margin".

## Inline and block axes

The **inline axis** is the direction text flows on a single line. The **block axis** is the direction new lines stack.

| Writing mode | Inline axis | Block axis |
| --- | --- | --- |
| `horizontal-tb` (English, default) | left ↔ right | top ↔ bottom |
| `vertical-rl` (Japanese vertical) | top ↔ bottom | right ↔ left |
| `horizontal-tb` + `dir="rtl"` (Arabic) | right ↔ left | top ↔ bottom |

`-start` and `-end` are the edges along each axis. In English LTR, `inline-start` is left; in Arabic RTL, `inline-start` is right.

## Property mapping

| Physical | Logical |
| --- | --- |
| `width` | `inline-size` |
| `height` | `block-size` |
| `min-width` | `min-inline-size` |
| `max-height` | `max-block-size` |
| `margin-top` | `margin-block-start` |
| `margin-bottom` | `margin-block-end` |
| `margin-left` | `margin-inline-start` |
| `margin-right` | `margin-inline-end` |
| `padding-*` | `padding-block-*`, `padding-inline-*` |
| `border-*` | `border-block-*`, `border-inline-*` |
| `top`, `bottom` | `inset-block-start`, `inset-block-end` |
| `left`, `right` | `inset-inline-start`, `inset-inline-end` |

Two-value shorthands cover both edges of an axis:

```css
.card {
  padding-block: 1rem;       /* top and bottom */
  padding-inline: 1.5rem;    /* left and right */
  margin-inline: auto;       /* horizontal center */
}
```

This is shorter than `padding: 1rem 1.5rem` *and* survives RTL flipping automatically.

## `inset` shorthand

```css
.overlay {
  position: absolute;
  inset: 0;                    /* top:0 right:0 bottom:0 left:0 */
}
.tooltip {
  position: absolute;
  inset-block-start: 100%;     /* below the anchor */
  inset-inline-start: 0;       /* aligned to its leading edge */
}
```

## Sizes

```css
.panel {
  inline-size: clamp(20rem, 80vw, 60rem);
  block-size: auto;
}
```

`inline-size` is `width` in horizontal writing modes and `height` in vertical ones. If you want a fixed *visual* width regardless of writing mode, keep using `width`. Otherwise prefer the logical version.

## RTL with the `dir` attribute

```html
<html lang="ar" dir="rtl">
```

That single attribute change reverses the inline axis for the whole document. With logical properties throughout, your layout mirrors itself — buttons flip to the other side, padding "before" the start edge moves to the right edge, scrollbars switch sides — with no CSS changes.

For per-element overrides:

```html
<bdi dir="ltr">Latin text in RTL context</bdi>
```

## `writing-mode`

| Value | Effect |
| --- | --- |
| `horizontal-tb` | Default. Lines run left-to-right (or per `dir`), stack top to bottom. |
| `vertical-rl` | Lines run top to bottom, stack right to left. |
| `vertical-lr` | Lines run top to bottom, stack left to right. |
| `sideways-rl` | Sideways but glyphs upright. |

```css
.tag-cloud-side {
  writing-mode: vertical-rl;
  text-orientation: mixed;
}
```

Useful for non-CJK use cases too — vertical legends on charts, badges, sidebar nav.

## Logical text properties

| Physical | Logical |
| --- | --- |
| `text-align: left` | `text-align: start` |
| `text-align: right` | `text-align: end` |
| `float: left` | `float: inline-start` |
| `clear: right` | `clear: inline-end` |

`text-align: start` is what you want for body copy — it's left in English, right in Arabic, and correct in both.

## When physical wins

Use physical properties when you genuinely mean a physical direction:

- An icon that should always sit on the **right** regardless of language (e.g. a chevron tied to the writing direction is logical; one tied to a global UI corner is physical).
- Box shadows offset down-and-right look the same in any locale; use `0 4px 8px`, not a logical version.
- Backgrounds with directional gradients.

## Gotchas

- Mixing physical and logical on the same element can produce surprising cascades. `padding-left: 1rem` and `padding-inline-start: 2rem` are both valid and the later (in source) wins — but in RTL, "left" no longer means "start", and they may stop opposing each other.
- `inline-size` and `block-size` can't be used in some legacy properties like `aspect-ratio` (where the ratio is still `width / height`).
- Bidirectional text (Arabic with embedded English) needs `unicode-bidi: isolate` (or the `<bdi>` element) for correct rendering; logical properties alone won't fix mirror-mode glyph order.
- Some browser-specific quirks remain around `inset` shorthand interacting with `position: sticky`'s threshold — test both directions if your app supports RTL.

## A practical baseline

Replace, as a default:

- `margin: 1rem 0` → `margin-block: 1rem`
- `padding: 1rem 1.5rem` → `padding-block: 1rem; padding-inline: 1.5rem;`
- `text-align: left` → `text-align: start`
- `margin-left: auto` (on a flex item, "push to end") → `margin-inline-start: auto`

The diff is small, and you've just made the app translation-ready for free.
