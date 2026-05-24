Transitions interpolate between two states of an element; animations script a sequence of keyframes that can run independently of state. Both run on the compositor when the animated properties allow it, which is what separates a 60fps animation from a janky one. Newer additions — `@starting-style`, View Transitions, animating to `auto` — close the last gaps that used to require JavaScript.

## Transitions

```css
.button {
  background: var(--brand);
  transition: background 200ms ease, transform 150ms ease-out;
}
.button:hover { background: var(--brand-dark); transform: translateY(-1px); }
```

A transition fires when a transition*able* property changes. List properties explicitly to avoid surprises — `transition: all` makes the browser try to animate every property change, including ones that shouldn't (`display`, `position`).

## Shorthand syntax

`transition: <property> <duration> <timing-function> <delay>`. List multiple comma-separated:

```css
transition:
  opacity 200ms ease-out,
  transform 200ms ease-out 50ms;
```

## Easing

| Keyword | Curve |
| --- | --- |
| `linear` | No easing — robotic. |
| `ease` | Default; slow start, fast middle, slow end. |
| `ease-in` | Slow start. |
| `ease-out` | Slow end. Often the right choice for entrances. |
| `ease-in-out` | Symmetric. |
| `cubic-bezier(x1, y1, x2, y2)` | Custom curve. |
| `linear(0, 0.5 30%, 1)` | Multi-point linear curve — for spring/bounce shapes. |
| `steps(n, jump-end)` | Discrete steps. |

`linear()` is the modern way to approximate spring physics without a JS library:

```css
.bounce {
  transition: transform 600ms linear(
    0, 0.45 12%, 1.05 30%, 0.95 50%, 1.01 70%, 1
  );
}
```

## Keyframes

```css
@keyframes fade-up {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: none; }
}

.toast {
  animation: fade-up 240ms ease-out both;
}
```

`both` fills the element's style with the `from` state before the animation starts and the `to` state after it ends — the most common choice for entrances.

## Animation shorthand

`animation: <name> <duration> <timing> <delay> <iteration-count> <direction> <fill-mode> <play-state>`:

```css
animation: spin 1s linear infinite;
animation: pulse 2s ease-in-out 0s infinite alternate;
```

## `@starting-style`

`@starting-style` defines the *initial* state for an element so it can transition *in*:

```css
.popover {
  opacity: 1;
  transform: scale(1);
  transition: opacity 150ms, transform 150ms;
}
@starting-style {
  .popover {
    opacity: 0;
    transform: scale(0.95);
  }
}
```

When the popover first renders (or returns to the DOM), it starts at the `@starting-style` values and transitions to its normal values. No `requestAnimationFrame` dance, no class toggling.

This pairs perfectly with `display: none` ↔ visible transitions using `transition-behavior`:

```css
.popover {
  display: none;
  opacity: 0;
  transition: opacity 150ms, display 150ms allow-discrete;
}
.popover.open { display: block; opacity: 1; }
@starting-style { .popover.open { opacity: 0; } }
```

`allow-discrete` is what lets `display` (a discrete property) participate in transitions.

## Animating to `auto`

```css
details::details-content {
  block-size: 0;
  overflow: hidden;
  transition: block-size 200ms, content-visibility 200ms allow-discrete;
  interpolate-size: allow-keywords;
}
details[open]::details-content {
  block-size: auto;
}
```

`interpolate-size: allow-keywords` opts in to interpolating between a fixed value and `auto`, finally killing the JavaScript-measures-height-then-sets-it pattern.

## View Transitions API

Same-document view transitions snapshot the page, swap the DOM, and crossfade between the snapshots automatically:

```js
document.startViewTransition(() => {
  updateDOM();
});
```

```css
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 300ms;
}

.hero {
  view-transition-name: hero;
}
```

Naming an element with `view-transition-name` makes it transition independently, morphing position and size between states. Cross-document view transitions (between navigations) ship behind a similar opt-in:

```css
@view-transition { navigation: auto; }
```

## What's GPU-friendly

| Property | Compositor-only |
| --- | --- |
| `transform` | Yes |
| `opacity` | Yes |
| `filter` | Yes (mostly) |
| `width`, `height` | No — triggers layout |
| `top`, `left` | No — triggers layout |
| `background-color` | No — triggers paint |

Animate `transform` and `opacity` whenever you can. `will-change: transform` hints the browser to promote the element to its own layer, but use it sparingly — every layer costs memory.

## `prefers-reduced-motion`

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Setting durations to a tiny value (rather than zero) preserves any "after-animation" callbacks JS code might rely on.

## Gotchas

- A transition won't run if the property's *computed value* doesn't change. Setting `background: red` on an element whose computed background is already red is a no-op.
- `transition: all` is a footgun: switching `display` instantly cancels other transitions, and any third-party CSS that changes a property you didn't intend will animate.
- View Transitions snapshot the *rendered* output, not the DOM — fixed/sticky elements may transition unexpectedly. Give them their own `view-transition-name`.
- `@starting-style` only applies to the *first* render of an element in its containing scope. Once it's rendered, subsequent state changes use normal transitions.
- Compositor animations don't block the main thread, but starting/stopping them does. Batch DOM changes that trigger animations.
