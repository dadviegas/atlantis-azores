CSS custom properties (a.k.a. CSS variables) are scoped, cascading, inheritable values you can reference at runtime with `var()`. They're not preprocessor variables — they live inside the cascade, can be changed by media queries or JavaScript, and are the foundation of modern theming.

## Declaring and using

```css
:root {
  --space: 8px;
  --accent: oklch(70% 0.18 250);
}

.card {
  padding: calc(var(--space) * 2);
  border: 1px solid var(--accent);
}
```

Names start with `--` and are case-sensitive. The value can be almost anything: a length, color, comma list, full shorthand, even an unfinished snippet that only makes sense once interpolated.

## Scoping

Custom properties cascade and inherit like normal properties. A `--gap` set on `.card` applies to that card and all descendants but not to siblings.

```css
:root        { --gap: 1rem; }
.cards       { --gap: 2rem; } /* override for this subtree */
.cards > *   { margin-bottom: var(--gap); }
```

This is what makes theming so clean — change a value at any level and the subtree picks it up.

## Fallbacks

`var()` accepts a fallback after a comma:

```css
.button { background: var(--bg, transparent); }
```

The fallback can itself be a `var()`, which is how you build layered defaults:

```css
.button { color: var(--button-fg, var(--fg, black)); }
```

## Theming via attribute or media

```css
:root            { --bg: white; --fg: black; }
[data-theme="dark"] { --bg: #111;  --fg: #eee;  }

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { --bg: #111; --fg: #eee; }
}

body { background: var(--bg); color: var(--fg); }
```

Switching themes is a single class/attribute change at the root; nothing downstream needs to know.

## `@property`

By default, every custom property is treated as a generic string. Browsers can't animate them, validate them, or know what an "initial" value would be. `@property` registers a typed property with a syntax and inheritance behavior.

```css
@property --hue {
  syntax: "<number>";
  inherits: true;
  initial-value: 220;
}

.dial {
  background: oklch(70% 0.2 var(--hue));
  transition: --hue 300ms ease;
}
.dial:hover { --hue: 320; }
```

Without `@property`, that transition wouldn't animate — the browser has no idea `--hue` is interpolatable.

## `syntax` values

| Syntax | Matches |
| --- | --- |
| `"*"` | Anything (default for unregistered). |
| `"<number>"` | A `<number>` token. |
| `"<integer>"` | Integer. |
| `"<length>"` | `px`, `rem`, `em`, etc. |
| `"<percentage>"` | `%`. |
| `"<length-percentage>"` | Length or percent. |
| `"<color>"` | Any valid color. |
| `"<angle>"`, `"<time>"`, `"<resolution>"` | Self-explanatory. |
| `"<custom-ident>"` | Identifier. |
| `"<image>"` | `url()`, gradient, etc. |
| `"a \| b \| c"` | Enum of identifiers. |

Combine: `"<length> | <percentage>"`, `"<length>+"` for space-separated lists, `"<length>#"` for comma-separated lists.

## Why typed properties matter

```css
@property --angle {
  syntax: "<angle>";
  inherits: false;
  initial-value: 0deg;
}

@keyframes spin {
  to { --angle: 360deg; }
}

.gradient {
  background: conic-gradient(from var(--angle), red, blue, red);
  animation: spin 3s linear infinite;
}
```

You can now animate a value *inside* a gradient — impossible without a registered property.

## Setting from JavaScript

```js
element.style.setProperty('--accent', '#06f');
const v = getComputedStyle(element).getPropertyValue('--accent').trim();
```

Reading returns whatever string was set, with whitespace preserved. There's no type coercion — `--space` always comes back as a string like `"8px"`.

## Invalid values and the IACVT rule

If a `var()` resolves to a value invalid for the property, the property reverts to its *unset* value, not the rule's previous value. This is called "Invalid At Computed-Value Time".

```css
.box {
  background: red;
  background: var(--missing); /* falls back to initial (transparent), not red */
}
```

To avoid this, use a fallback in `var()` or register the property with a valid `initial-value`.

## Gotchas

- `var()` cannot be used in selectors, media query conditions, or `@property` itself. Use a feature query (`@supports`) for capability detection instead.
- Custom properties inherit by default — `inherits: false` in `@property` opts out, which matters for animations you only want to run on the specific element.
- Spaces matter: `var(--x,red)` works, but consider `var(--x, red)` for readability.
- A custom property whose value is the literal string `initial` is treated as if unset, *not* set to "initial".
- Don't store fragments that contain `{` or `}` — only declaration values are allowed.

## When to reach for them

Use custom properties for any value that:

- Changes per theme, breakpoint, or component state.
- Is referenced in more than one place.
- Needs to be read or written from JavaScript.

For one-off literals, just write the literal — variables aren't free in terms of readability.
