A handful of features that landed across all evergreen browsers in the last few years change how CSS is *written*, not just what it can do. `:has()` ends the era of "I'd need JS for this", `@layer` makes large codebases coexist, `@scope` localizes styles, nesting cleans up the file, and anchor positioning replaces an entire category of JS popover libraries.

## `:has()` — the parent selector

```css
.card:has(img) { padding-top: 0; }
.form-field:has(input:invalid) { border-color: red; }
label:has(input:checked) { font-weight: 600; }
article:has(> h2 + p) { /* article with a heading followed by a paragraph */ }
```

`:has(X)` matches an element if it has a descendant (or with combinators, a child/sibling) matching `X`. The argument can be any complex selector.

Implications:

- State-based styling that used to need a JS class toggle now works in pure CSS.
- "Layout depends on content" patterns are trivial.
- Specificity follows `:is()` rules: `:has()` takes the highest specificity of its arguments.

A common idiom — body-level state from a child:

```css
body:has(dialog[open]) { overflow: hidden; }
```

## `@layer`

`@layer` introduces explicit cascade buckets so library and app styles can coexist without specificity wars. See [cascade-and-inheritance](./cascade-and-inheritance.md) for the full mechanics.

```css
@layer reset, vendor, base, components, utilities;

@import url("normalize.css") layer(reset);
@import url("ui-kit.css") layer(vendor);
```

Anything in a later-declared layer beats earlier ones, regardless of selector specificity. Unlayered rules beat *all* layered rules.

## `@scope`

`@scope` localizes styles to a subtree, with an optional lower bound:

```css
@scope (.card) to (.card-footer) {
  h2 { font-size: 1.25rem; }
  a  { color: var(--accent); }
}
```

- Styles inside `@scope (.card)` only apply to descendants of `.card`.
- `to (.card-footer)` says "stop descending at `.card-footer`" — styles don't apply *inside* it.

`@scope` also has *scope proximity* as a cascade tiebreaker: when multiple scopes match, the closer scope wins. This is the only place specificity is sidestepped without an explicit layer.

```css
@scope (.dark-theme)   { a { color: white; } }
@scope (.bright-theme) { a { color: navy; } }
```

A link inside `.dark-theme .bright-theme` picks the `.bright-theme` rule because the scope root is closer in the ancestor chain.

## Nesting

Native nesting (no preprocessor required):

```css
.card {
  padding: 1rem;
  border: 1px solid #ddd;

  & .title { font-weight: 600; }

  &:hover { border-color: #aaa; }

  @media (width >= 48rem) {
    padding: 2rem;
  }
}
```

The `&` is the parent selector. Inside a nested rule, the implicit context is `:is(parent)`, so `.a, .b { & .c { ... } }` behaves like `:is(.a, .b) .c`. That's usually what you want, but it does mean the specificity is bumped to match the highest of the parent list.

## Anchor positioning

`anchor-name` marks an element as an anchor; another element references it via `position-anchor` and `anchor()`:

```css
.button {
  anchor-name: --menu-btn;
}

.menu {
  position-anchor: --menu-btn;
  position: absolute;
  top: anchor(bottom);
  left: anchor(left);
  min-width: anchor-size(width);
}
```

`anchor(<edge>)` returns the anchor's edge position. `anchor-size(<dimension>)` returns its size. The browser handles repositioning when the anchor moves — no JS observers required.

`position-try` lets you declare fallback positions if the primary one would overflow the viewport:

```css
.menu {
  position-try-fallbacks: --above, flip-block, flip-inline;
}

@position-try --above {
  top: auto;
  bottom: anchor(top);
}
```

Tooltips, dropdowns, popovers — all of these patterns are now styleable without a positioning library.

## `field-sizing`

Forms textareas and inputs can size themselves to their content:

```css
textarea {
  field-sizing: content;
  min-height: 4lh;
  max-height: 16lh;
}
```

The `lh` unit is one line-height of the element's own text — a natural unit for sizing text controls. `field-sizing: content` shrinks/grows the field as the user types, without a `resize` event listener or hidden mirror element.

## `text-box-trim`

Tightens space around text by trimming half-leading from cap height to alphabetic baseline:

```css
.heading {
  text-box: trim-both cap alphabetic;
}
```

This removes the inconsistent extra space above and below text, giving you the visual box you actually drew in Figma. Essential for precision typography.

## `popover` and `<dialog>`

Not CSS exclusively, but they pair with these features:

```html
<button popovertarget="menu">Open</button>
<div id="menu" popover>...</div>
```

The browser handles top-layer rendering, light dismiss, and ARIA. Style with `:popover-open` and combine with `@starting-style` for entry animation (see [transitions-and-animations](./transitions-and-animations.md)).

## Gotchas

- `:has()` selectors are not cheap on huge DOMs — keep arguments narrow (`:has(> .child)` beats `:has(.child)` for performance).
- Nested rules without `&` *can* work for type selectors (`div { span { ... } }`), but `&` is clearer and required for compound selectors like `&.active`.
- `@scope`'s lower bound is a selector matched against descendants — it doesn't exclude the element itself, only what's *inside* it.
- Anchor positioning falls back to the regular containing block when no anchor is set or the anchor is display-none. Always declare fallback positions.
- `@layer` order is established the *first* time each layer name is seen. Later `@layer foo { ... }` blocks add to the existing layer, they don't redefine its position.
