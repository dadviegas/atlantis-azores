Container queries let an element style itself based on the size or style of an ancestor *container*, not the viewport. They're the answer to "this card should be a row when it's wide enough, regardless of where on the page it lives". Combined with container units, they make truly composable responsive components possible.

## Setting up a container

You opt an ancestor in with `container-type`:

```css
.card-wrapper {
  container-type: inline-size;
  container-name: card;
}
```

| `container-type` value | Queries you can ask |
| --- | --- |
| `normal` (default) | None (size queries off). Style queries still work. |
| `inline-size` | Inline-axis size queries. |
| `size` | Both axes. Requires the container to have a determinate height. |

`inline-size` is what you want 95% of the time. `size` requires the container to have a known block size, which usually means it overflows or behaves unexpectedly inside flex/grid.

## Querying

```css
@container card (inline-size >= 30rem) {
  .card {
    display: grid;
    grid-template-columns: 12rem 1fr;
  }
}
```

The container name is optional — omit it and the query targets the nearest container of any name.

```css
@container (inline-size >= 30rem) { ... }
```

You can combine conditions with `and`, `or`, `not`:

```css
@container (inline-size >= 30rem) and (inline-size < 60rem) { ... }
```

## Container units

Inside a container, you can size things relative to it.

| Unit | Relative to |
| --- | --- |
| `cqw` | 1% of container's width. |
| `cqh` | 1% of container's height. |
| `cqi` | 1% of container's inline size. |
| `cqb` | 1% of container's block size. |
| `cqmin` / `cqmax` | Smaller / larger of `cqi` and `cqb`. |

```css
.title { font-size: clamp(1rem, 4cqi, 2rem); }
```

The title now scales with its container, not the viewport. Drop the card into a sidebar and the title shrinks.

## Style queries

Style queries match on custom property values of the nearest container:

```css
.theme { container-name: theme; }

@container theme style(--mode: dark) {
  .panel { background: #111; color: #eee; }
}
```

This is how you bridge variant logic from a parent (set `--mode: dark`) to descendants without a class-name-by-convention dance. As of 2026, style queries on registered properties of any type ship in evergreen browsers; queries on plain (string-typed) properties are also widely supported.

## A practical pattern

```html
<div class="card-wrap">
  <article class="card">
    <img src="..." alt="" />
    <div class="body">
      <h3>Title</h3>
      <p>Body text...</p>
    </div>
  </article>
</div>
```

```css
.card-wrap {
  container-type: inline-size;
}
.card {
  display: grid;
  gap: 1rem;
}
@container (inline-size >= 28rem) {
  .card {
    grid-template-columns: 10rem 1fr;
    align-items: start;
  }
}
@container (inline-size >= 48rem) {
  .card {
    grid-template-columns: 16rem 1fr;
    padding: 2rem;
  }
}
```

The card adapts to its own width. Place it in a `1fr` main column, a `300px` sidebar, or a three-column gallery — each instance picks the right layout on its own.

## Containment trade-offs

`container-type: inline-size` implies `contain: layout inline-size style`. That means:

- The container's *intrinsic* size depends only on its content, not its descendants' sizes in the contained axis.
- The container generates a new containing block (similar to `position: relative`'s effect for absolute children — though without the `position` change).
- Some properties like `position: fixed` inside a contained ancestor are now positioned relative to the container.

In practice these are usually what you want, but be aware before wrapping everything in containers.

## Container queries vs media queries

| | Media queries | Container queries |
| --- | --- | --- |
| Reacts to | Viewport size / device | Ancestor container's size or style |
| Component reusable? | Layout-coupled to its page position | Self-contained |
| Use for | Page-level layout, app shell | Components, cards, widgets |

A common pattern is media queries for the shell ("show/hide the sidebar") and container queries for everything inside ("switch this card to row layout").

## Gotchas

- A container with `container-type: size` and no explicit height inside a flex/grid parent often computes to 0 height — the contained child can't influence it. Use `inline-size` unless you genuinely need both axes.
- Container units only work *inside* a container. `cqi` outside any container falls back to small-viewport size (`svi`).
- Naming containers is optional but useful when you nest them — otherwise `@container` always matches the nearest one.
- Style queries don't (yet) support arbitrary value comparisons like `style(--gap > 1rem)`; they match on equality or presence.
- A self-targeting query (querying the container you're styling) is not allowed — query an ancestor.
