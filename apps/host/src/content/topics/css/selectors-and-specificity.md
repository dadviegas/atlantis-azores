Selectors decide *what* a rule matches; specificity decides *which* rule wins when several match the same element. Most "why isn't my style applying" mysteries trace back to a specificity miscount or a forgotten `!important` in a third-party stylesheet.

## Selector types

| Category | Examples | Notes |
| --- | --- | --- |
| Universal | `*` | Specificity (0,0,0). |
| Type | `div`, `h1` | Matches element names. |
| Class | `.card`, `.is-open` | The workhorse. |
| Attribute | `[type="email"]`, `[data-state]` | Same weight as a class. |
| Pseudo-class | `:hover`, `:nth-child(2n)` | Same weight as a class. |
| ID | `#main` | High weight — avoid for styling. |
| Pseudo-element | `::before`, `::marker` | Same weight as a type. |

## Combinators

```css
.list > .item        /* direct child */
.list .item          /* any descendant */
.heading + p         /* immediately following sibling */
.heading ~ p         /* any following sibling */
```

## Specificity calculation

Specificity is a tuple `(a, b, c)` — IDs, then classes/attributes/pseudo-classes, then types/pseudo-elements. Compare left to right; the universal selector and combinators count as zero.

```css
#nav .item a:hover   /* (1, 2, 1) */
.button.primary      /* (0, 2, 0) */
a:visited            /* (0, 1, 1) */
```

A higher tuple wins regardless of source order. If tuples tie, the later rule wins.

## `!important` and how it loses

`!important` flips the rule into a separate, reverse-ordered cascade. Inside the *same* origin and layer, important wins. But the cascade order across origins for important rules is *inverted*:

1. user-agent `!important`
2. user `!important`
3. author `!important`
4. CSS animations
5. author normal
6. user normal
7. user-agent normal

So a user stylesheet's `!important` beats an author's `!important`. Reach for it last; it tends to start specificity wars.

## `:is()`, `:where()`, `:not()`

`:is()` takes the **highest** specificity of its arguments. `:where()` is identical in matching but always contributes **zero** specificity. `:not()` takes the highest from its argument list.

```css
:is(h1, h2, h3) + p { margin-top: 0; }    /* (0, 0, 1) + type, same as h1+p */
:where(h1, h2, h3) + p { margin-top: 0; } /* (0, 0, 1) — h1/h2/h3 add 0 */
```

Use `:where()` to ship low-specificity defaults that consumers can override with a single class.

```css
:where(button, [role="button"]) {
  cursor: pointer;
  font: inherit;
}
```

## Nesting and `&`

Nesting is now native. The `&` placeholder represents the parent selector and lets you scope variants without repeating yourself.

```css
.card {
  padding: 1rem;

  &:hover { background: #f5f5f5; }

  & .title { font-weight: 600; }

  @media (min-width: 768px) {
    padding: 2rem;
  }
}
```

Nested rules behave as if wrapped in `:is(parent-selector)`, which means parent selectors with commas can inflate specificity. Be deliberate when nesting under `:is(.a, #b)`.

## Inline styles, attributes, and the style attribute

Inline styles via `style="..."` count as `(1, 0, 0, 0)` — a fourth, leftmost slot that beats any selector. They lose only to `!important` and to declarations from a higher origin/layer.

## Gotchas

- `.foo.foo` is a legal and intentional way to bump specificity by one class without using `!important`.
- `[id="x"]` matches the same element as `#x` but has class-level specificity (0,1,0) vs ID (1,0,0).
- Pseudo-element selectors with `::` are *not* the same weight as pseudo-class `:`. `::before` is (0,0,1), `:hover` is (0,1,0).
- A selector list like `.a, .b { ... }` is evaluated per-selector for specificity, not as a whole.

## Practical rules of thumb

- Style with classes; reserve IDs for fragments and JS hooks.
- Use `:where()` for base/reset styles you want to be easy to override.
- Use `:is()` to keep selector lists DRY without losing matching power.
- If you need `!important`, ask first whether a layer ([cascade-and-inheritance](./cascade-and-inheritance.md)) would do the job more cleanly.
