CSS color in 2026 is wide-gamut, perceptually uniform, and mixable at the function level. `rgb()` and `hsl()` are still around but you should default to `oklch()` for new work — it produces predictable lightness ramps and avoids the dead zones (greens look fine, purples look bruised) that plague HSL.

## Color spaces and functions

| Function | Space | Use for |
| --- | --- | --- |
| `rgb()` | sRGB | Legacy, exact hex equivalents. |
| `hsl()` | sRGB (cylinder) | Quick edits; uneven perceptual lightness. |
| `hwb()` | sRGB | Hue + white + black — natural for tinting. |
| `lab()` / `lch()` | CIE Lab | Perceptually uniform, wider than sRGB. |
| `oklab()` / `oklch()` | OKLab | Perceptually uniform, modern default. |
| `color(display-p3 ...)` | Display P3 | Wide-gamut for capable screens. |
| `color(rec2020 ...)` | Rec.2020 | Even wider; HDR pipelines. |

The modern syntax drops commas and uses `/` for alpha:

```css
.fg { color: rgb(20 30 40 / 0.8); }
.bg { background: oklch(70% 0.18 250); }
```

## Why OKLCH

OKLCH separates lightness, chroma (saturation), and hue in a way that matches human perception. A 10% lightness change *looks* like a 10% lightness change across all hues. With HSL, a `50%` lightness yellow looks much brighter than a `50%` lightness blue.

```css
:root {
  --brand-50:  oklch(98% 0.02 250);
  --brand-100: oklch(95% 0.04 250);
  --brand-500: oklch(70% 0.18 250);
  --brand-900: oklch(30% 0.12 250);
}
```

A whole brand ramp from one hue, with even visual spacing.

## `color-mix()`

```css
.button {
  background: var(--brand-500);
  border: 1px solid color-mix(in oklch, var(--brand-500) 80%, black);
}
.button:hover {
  background: color-mix(in oklch, var(--brand-500), white 12%);
}
```

The `in <space>` argument picks the interpolation space — `oklch` and `oklab` give the smoothest perceptual mixes. Without it, you'll mix in sRGB and pass through muddy grays.

## Relative color syntax

You can construct a color *from* another color, modifying channels:

```css
.surface {
  background: hsl(from var(--brand) h s calc(l + 10%));
}

.translucent {
  background: oklch(from var(--brand) l c h / 0.5);
}

.complement {
  color: oklch(from var(--accent) l c calc(h + 180));
}
```

Inside `from`, the channels become identifiers (`l`, `c`, `h` for OKLCH; `r`, `g`, `b` for RGB; etc.) and you can use `calc()` on them. This is how you build "10% darker" or "rotate hue by 30deg" without preprocessor math.

## Wide-gamut

```css
.vivid { background: color(display-p3 1 0 0.4); }
```

Display P3 covers roughly 25% more area than sRGB and is supported on most modern displays. For colors that fall outside sRGB the browser does gamut mapping; for in-gamut colors the result is identical to sRGB.

```css
@media (color-gamut: p3) {
  :root { --accent: color(display-p3 0.1 0.5 1); }
}
```

## `color-scheme`

`color-scheme` tells the browser what color schemes your page supports, which affects form controls, scrollbars, and the default canvas color before your CSS loads.

```css
:root { color-scheme: light dark; }
```

With this, a user-agent dark-mode preference renders form controls and scrollbars in dark style automatically. Without it, you'll get light controls on a dark background.

## `accent-color`

```css
:root { accent-color: var(--brand-500); }
```

One declaration tints checkboxes, radio buttons, progress bars, and range inputs across the page.

## Contrast and accessibility

WCAG contrast minimums:

| Text size | Minimum (AA) | Enhanced (AAA) |
| --- | --- | --- |
| Body (under 18pt or 14pt bold) | 4.5:1 | 7:1 |
| Large text (18pt+, or 14pt bold+) | 3:1 | 4.5:1 |
| UI components, graphical objects | 3:1 | — |

WCAG 2.x uses sRGB luminance, which is known to be wrong in edge cases (especially for dark mode). APCA is the proposed successor and is what you'll see in design tooling — but legal/audit standards still reference WCAG 2.x in 2026.

The newer `contrast-color()` function lets you ask for a foreground color guaranteed to meet contrast against a background:

```css
.badge {
  background: var(--brand-500);
  color: contrast-color(var(--brand-500));
}
```

## Gotchas

- `color-mix()` defaults to no space when none is specified — always pass `in oklch` (or `in srgb` if you genuinely want the old behavior).
- `oklch()` lightness above ~99% can produce out-of-gamut colors for some hues; the browser clips and you get something close to white.
- Relative color syntax's channels are normalized to the function's expected ranges — `r g b` in `rgb(from ...)` are `0–255`, but in `color(from ... srgb ...)` they're `0–1`.
- `color-scheme: dark` alone *changes the default background* of `<html>` to black even before your styles paint. Use `light dark` so the user's preference wins.
- High-chroma `oklch` colors can look washed-out on non-P3 displays — gamut-map intentionally with `@media (color-gamut: p3)` if it matters.
