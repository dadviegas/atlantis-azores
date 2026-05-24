Typography is where craft shows. The browser will happily render any system font with no hinting, no kerning niceties, and a default line-height that's wrong for body copy. A few well-chosen properties — plus variable fonts and the new `text-wrap` values — get you most of the way to "designed".

## Loading web fonts

```css
@font-face {
  font-family: "Inter";
  src: url("/fonts/Inter.woff2") format("woff2-variations");
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}
```

`woff2` is the only format you need to ship; every evergreen browser supports it. Variable fonts (`woff2-variations`) combine many weights and styles into one file, which is almost always smaller than shipping individual weights once you need three or more.

## `font-display`

| Value | First paint | If font is slow |
| --- | --- | --- |
| `auto` | Browser default (usually `block`). | — |
| `block` | Hide text up to ~3s waiting for font. | Show fallback after. |
| `swap` | Show fallback immediately. | Swap when font arrives. |
| `fallback` | Brief block, then fallback, no swap if very late. | — |
| `optional` | Brief block. If the font isn't cached, don't use it at all this load. | — |

`swap` is the default choice for most sites — text is always readable. `optional` is the right call for performance-critical pages where layout shift matters more than typeface fidelity.

## `size-adjust` to tame fallback shift

```css
@font-face {
  font-family: "Inter-fallback";
  src: local("Arial");
  size-adjust: 107%;
  ascent-override: 90%;
  descent-override: 22%;
  line-gap-override: 0%;
}
body { font-family: "Inter", "Inter-fallback", sans-serif; }
```

Tuning the fallback's metrics to match the web font means almost no visual jump when the real font loads.

## Variable fonts

A variable font exposes one or more *axes* you can set continuously.

```css
.headline {
  font-family: "Inter";
  font-variation-settings: "wght" 720, "slnt" -4;
}
```

Standard axes have named shorthands:

| Axis tag | Shorthand |
| --- | --- |
| `wght` | `font-weight` |
| `wdth` | `font-stretch` |
| `slnt` | `font-style: oblique 14deg` |
| `ital` | `font-style: italic` |
| `opsz` | `font-optical-sizing: auto` (automatic) |

Prefer the shorthands — they're better understood by browsers (e.g. for animation interpolation) and don't suffer from the all-or-nothing nature of `font-variation-settings`.

## Line-height

The default is around `1.2`, which is too tight for body copy. A common scale:

| Use | line-height |
| --- | --- |
| Display / headings | `1.05` – `1.2` |
| Body | `1.5` – `1.65` |
| Captions / UI | `1.3` – `1.45` |

Set it unitless so it scales with `font-size`:

```css
body { line-height: 1.6; }
h1   { line-height: 1.1; }
```

A unitless `1.5` on `<body>` makes every descendant's line-height 1.5x *their own* font-size. A `line-height: 24px` would lock every descendant to 24px regardless of font-size.

## `text-wrap`

| Value | Behavior |
| --- | --- |
| `wrap` (default) | Greedy line-breaking. |
| `balance` | Distributes lines so they're roughly equal length (for short text — headings, captions). |
| `pretty` | Optimizes the last few lines to avoid orphans (for body text). |
| `nowrap` | No wrapping. |
| `stable` | Wrapping doesn't change when the user is editing (for `contenteditable`). |

```css
h1, h2, h3 { text-wrap: balance; }
p          { text-wrap: pretty; }
```

`balance` has a line-count limit (commonly 6) for performance — use it on titles, not paragraphs.

## Fluid type

```css
:root {
  --step-0: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
  --step-1: clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem);
  --step-2: clamp(1.5rem, 1.2rem + 1.5vw, 2rem);
  --step-3: clamp(2rem, 1.6rem + 2vw, 3rem);
}
body { font-size: var(--step-0); }
h1   { font-size: var(--step-3); }
```

A small set of steps, fluid between breakpoints, beats a dozen explicit sizes per breakpoint.

## Readable measure

Aim for 45–75 characters per line for body copy. `ch` units make this easy:

```css
.prose { max-width: 65ch; }
```

## OpenType features

```css
.tabular { font-variant-numeric: tabular-nums; }
.smallcaps { font-variant-caps: small-caps; }
.ligatures-off { font-variant-ligatures: none; }
```

Or via raw feature tags:

```css
.figures { font-feature-settings: "lnum", "tnum", "ss01"; }
```

`tabular-nums` is essential for any column of numbers — without it, digit widths vary and columns won't align.

## Gotchas

- `font-display: swap` causes layout shift unless paired with `size-adjust`. Tools like Fontaine can generate the metric overrides automatically.
- `text-wrap: balance` is ignored if the element has too many lines; relying on it for paragraphs is wasted effort.
- `font-variation-settings` overrides everything, even named axis properties on the same selector. Mix-and-match is risky.
- Hosting fonts on a CDN with the wrong CORS headers will silently break loading from cross-origin pages. Add `Access-Control-Allow-Origin: *` and use `crossorigin` on `<link rel="preload">`.
- `letter-spacing` on small text hurts readability; reserve it for headings and uppercase labels.
