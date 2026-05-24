The cascade is the algorithm browsers run to resolve a declared value for every property on every element. It is a *sort*, not a search — every matching declaration is collected, then ordered by a fixed list of criteria. Knowing that list turns "CSS is unpredictable" into "I know exactly which rule won and why".

## The cascade order

For each property on each element, the browser sorts matching declarations by, in priority order:

1. **Origin and importance** — user-agent, user, author, plus their `!important` reversals.
2. **Context** — `@scope` proximity (closer scope wins among equals).
3. **Layer order** — declarations in later `@layer` blocks beat earlier ones (reversed for `!important`).
4. **Specificity** — the (a,b,c) tuple from selectors.
5. **Order of appearance** — the later declaration in the document wins.

The first criterion that breaks the tie decides it. Specificity is *fourth*, not first; layers and origins outrank it.

## Origins

| Origin | Where it comes from |
| --- | --- |
| User-agent | Browser default stylesheet. |
| User | OS or browser-level user stylesheet (rare in 2026). |
| Author | The stylesheet your site ships. |

## Cascade layers

`@layer` lets you declare buckets of authority. Later-declared layers win over earlier ones, regardless of selector specificity.

```css
@layer reset, base, components, utilities;

@layer reset {
  * { margin: 0; }
}

@layer components {
  .button { padding: 0.5rem 1rem; background: navy; color: white; }
}

@layer utilities {
  .p-0 { padding: 0; }
}
```

`.p-0` wins over `.button`'s padding even though both have specificity (0,1,0), because `utilities` is declared after `components`. Unlayered styles win over any layered styles (they're treated as an implicit final layer).

## Inheritance

Some properties inherit from parent to child by default (`color`, `font-*`, `line-height`, `visibility`, `cursor`). Most do not (`margin`, `padding`, `border`, `background`, `display`).

You can force either behavior with the CSS-wide keywords:

| Keyword | Effect |
| --- | --- |
| `inherit` | Use the parent's computed value, even on non-inheriting properties. |
| `initial` | Use the property's spec-defined initial value (e.g. `display: inline`). |
| `unset` | Acts like `inherit` for inheriting properties, `initial` otherwise. |
| `revert` | Roll back to the value the *previous* origin/layer would have set. |
| `revert-layer` | Roll back to the value from the previous layer. |

```css
.reset-button {
  all: unset;
  cursor: pointer;
}
```

`all` is the shorthand that applies a CSS-wide keyword to every property at once — handy for stripping inherited styles from a `<button>` you want to restyle from scratch.

## `revert` vs `initial`

`initial` is rarely what you want. The initial value of `display` is `inline`, not `block` — so `display: initial` on a `<div>` makes it `inline`. `revert` gives you back the user-agent value (`block` for `<div>`), which is almost always what you meant.

## Custom properties and inheritance

Custom properties (`--name`) inherit by default. This is what makes theming with them ergonomic — set `--accent` on `:root` and every descendant can read it. See [custom-properties](./custom-properties.md) for the full mechanics, including `@property` for non-inheriting registered props.

## Computed values vs used values

There are several "value" stages: declared, cascaded, specified, computed, used, actual. The cascade produces the *cascaded* value. Inheritance, defaults, and `inherit`/`initial`/etc. resolve it to a *computed* value. Layout then turns relative units into *used* values. DevTools' "Computed" panel shows the computed value — what every JS API and child element actually sees.

## Gotchas

- Unlayered rules beat layered rules. If you wrap legacy CSS in `@layer legacy { ... }`, anything outside layers will still override it.
- `!important` reverses layer order: among important declarations, the *first* layer wins.
- `inherit` on a property whose parent has `auto` resolves to `auto`, which may not be a usable value in every context.
- `all: unset` does not reset custom properties — they're a separate space.

## A mental model

When debugging, ask in this order:

1. Are there `!important` declarations involved?
2. Are these rules in different layers?
3. What's the specificity?
4. Which one comes later?

Stop at the first "yes" — that's your tiebreaker.
