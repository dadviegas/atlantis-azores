CSS has a small number of recurring bugs that catch almost everyone at least once. Each of them follows from a rule that's correct on its own but surprising in context. Recognizing the *shape* of the bug — "ah, this is the percentage-heights thing" — saves hours of poking at DevTools.

## Margin collapsing eats your spacing

Vertical margins between block siblings (and between a parent and its first/last child) collapse to the larger of the two. A `<section>` with a child `<h2 style="margin-top: 24px">` may push the *parent* down by 24px instead of creating space inside.

```css
/* Symptom: page scrolls when nothing should make it scroll */
section { background: lightgray; }
section > h2 { margin-top: 24px; }
```

**Fix**: establish a block formatting context on the parent — `display: flow-root` is the side-effect-free option. Or add `padding-top` (even `0.1px`), or switch the parent to flex/grid (children's margins don't collapse there).

## Percentage heights need a fixed ancestor

```html
<div class="parent">
  <div class="child" style="height: 50%">...</div>
</div>
```

If `.parent` doesn't have an explicit `height` (not `auto`), the child's `50%` resolves against indeterminate space and falls back to `auto`. Result: the child has no visible height.

**Fix**: give the parent an explicit height, use flex/grid (where children can stretch via `align-items` / `align-self`), or switch to `dvh` / `cqi` units that don't depend on the ancestor.

## `position: fixed` inside a transformed ancestor

A `transform` on any ancestor turns it into the containing block for any descendant `position: fixed` element. The "fixed" element now scrolls with the transformed ancestor.

```css
.app { transform: translateZ(0); }    /* often added for "GPU acceleration" */
.modal { position: fixed; inset: 0; } /* no longer fixed to the viewport */
```

Same trap for `filter`, `perspective`, `backdrop-filter`, `will-change` of those properties, and `contain: paint/layout/strict`.

**Fix**: remove the transform from the ancestor, move the fixed element to the body (via portal), or use the `<dialog>` element / popover API which render in the top layer above all containing-block tricks.

## `100vh` cuts off on mobile

`vh` is the *large* viewport, computed as if browser UI is fully retracted. While the address bar is visible, `100vh` overflows the visible area. A hero, login screen, or modal sized `100vh` looks broken until you scroll.

**Fix**: use `100dvh` (dynamic — updates with the UI) for content that should fill the *current* visible area. Use `100svh` for "must always fit even with UI showing". See [responsive-design](./responsive-design.md) for the full unit table.

## `z-index` doing nothing

Two common reasons:

1. The element is `position: static` (the default). `z-index` is ignored unless the element is positioned (or is a flex/grid item).
2. The element is trapped in a parent's stacking context. A parent with `opacity: 0.99` creates a stacking context; *any* descendant `z-index`, no matter how high, can't paint above siblings of the *parent*.

**Fix**: ensure the element is positioned, and add `isolation: isolate` to siblings/parents whose stacking contexts you want to contain. See [positioning](./positioning.md).

## Specificity wars

You inherited a stylesheet where every rule is `#main .sidebar ul li a.active:hover { color: red !important }`. Now every override requires more `!important` and more IDs.

**Fix going forward**: wrap the legacy CSS in `@layer legacy { ... }`. Your new styles, outside layers (or in a later layer), automatically win regardless of specificity. See [cascade-and-inheritance](./cascade-and-inheritance.md).

## `flex` shrinking past `min-content`

A flex item with long text doesn't shrink below its longest word's width by default — the implicit `min-width: auto` keeps it intrinsic-sized. Result: a sibling column gets squeezed or the container overflows.

```css
.flex-row > .with-long-text {
  min-width: 0;            /* allow shrinking */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

The same applies to grid items (`min-width: 0` and/or `min-height: 0`).

## `1fr` columns becoming unequal

```css
.grid { display: grid; grid-template-columns: repeat(3, 1fr); }
```

If one column has a long URL or unbreakable token, that column expands and `1fr` no longer means "one equal share". `1fr` is shorthand for `minmax(auto, 1fr)`.

**Fix**: use `minmax(0, 1fr)` for strictly equal columns.

## `transform` blurs text

A `transform: translate(50%, 50%)` on an element at fractional pixel positions can subpixel-render text into blur, especially with `scale()` or low-DPI displays.

**Fix**: snap to whole pixels (`transform: translate(50px, 50px)`), or use `transform: translateZ(0)` to promote the layer (forces integer rendering in some browsers). For animations, end on a whole pixel.

## `:hover` on touch devices

`:hover` styles "stick" on touch devices because there's no `mouseleave`. A button that gets darker on hover stays dark after being tapped.

**Fix**: scope hover styles to devices that support it:

```css
@media (hover: hover) {
  .button:hover { background: var(--brand-dark); }
}
```

`:active` and focus-visible styles cover touch and keyboard cases.

## `overflow: hidden` breaks `position: sticky`

Sticky elements look for the nearest scroll container. If an ancestor between the sticky element and the intended scroll container has `overflow: hidden` (often added "to clip rounded corners"), the sticky breaks silently.

**Fix**: move the `overflow` ancestor, use `overflow: clip` (which doesn't establish a scroll container), or restructure.

## Background on the wrong box

`background-clip` defaults to `border-box`. A border with `transparent` color *plus* a background paints the background under the transparent border, which often isn't what you want.

```css
.input {
  border: 2px solid transparent;
  background-clip: padding-box;   /* keep background inside padding */
}
```

## Quick triage checklist

When a CSS bug surprises you, ask in this order:

1. Is the element actually rendering? (DevTools: is it in the DOM, computed `display` not `none`?)
2. What is the *computed* value of the property? (Not the declared one.)
3. Which rule won — is it the one I expected? (DevTools shows the cascade.)
4. What's the containing block? Stacking context? Scroll container?
5. Is a parent's `transform`, `overflow`, `contain`, or `filter` changing the rules?

Most of these pitfalls are one of those questions away from a fix.
