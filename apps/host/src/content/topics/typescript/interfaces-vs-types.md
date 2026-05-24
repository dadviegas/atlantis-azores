`interface` and `type` overlap heavily — both describe object shapes, both can extend, both compose. The differences are small but real, and the choice affects declaration merging, error messages, and (in large codebases) compile-time performance.

## What each can do

| Capability | `interface` | `type` |
| --- | --- | --- |
| Describe object shape | yes | yes |
| Extend / intersect | `extends` | `&` |
| Declaration merging | yes | no |
| Union types | no | yes |
| Tuple aliases | no | yes |
| Mapped/conditional/template | no | yes |
| Primitive aliasing | no | yes |
| Implements (class) | yes | yes (object-like) |

## When to prefer `interface`

For public API shapes consumers may need to augment — DOM types, library options, framework prop types. The compiler can also short-circuit some checks on interfaces, giving slightly better performance in very large unions.

```ts
interface ButtonProps {
  variant?: "primary" | "secondary";
  onClick(event: MouseEvent): void;
}
```

## When to prefer `type`

When you need anything beyond object shape — unions, tuples, mapped or conditional types, or aliasing a primitive.

```ts
type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };
type Pair<T> = readonly [T, T];
type EventName = `on${Capitalize<string>}`;
```

## Extending

`interface` uses `extends`; `type` uses intersection.

```ts
interface Animal { name: string }
interface Dog extends Animal { breed: string }

type AnimalT = { name: string };
type DogT = AnimalT & { breed: string };
```

You can cross the boundary: an `interface` can extend a `type` (when it's object-shaped), and a `type` intersection can include an interface.

## Declaration merging

Interfaces with the same name in the same scope are merged. This is the mechanism behind module augmentation.

```ts
interface Window {
  myAnalytics?: { track(event: string): void };
}

window.myAnalytics?.track("page_view");
```

Two `type` declarations with the same name in the same scope are an error — there is no merge.

## Class implementation

Both work, but `implements` checks structurally, so it doesn't prevent the class from being assignable to other shapes.

```ts
interface Logger { log(msg: string): void }
class ConsoleLogger implements Logger {
  log(msg: string) { console.log(msg); }
}
```

`implements` is a *check*, not a contract on the consumer — callers still see the class's full public surface.

## Intersections vs `extends`

These usually behave the same, but they diverge with conflicting members:

```ts
interface A { x: number }
interface B extends A { x: string } // error: incompatible

type AT = { x: number };
type BT = AT & { x: string }; // BT.x is never
```

`extends` errors loudly. `&` silently produces `never` for the conflicting key — a subtle source of bugs.

## Performance

Object types built from many intersections (`A & B & C & D & ...`) force the compiler to recompute member resolution at every use site. Interfaces with `extends` cache the resolved shape. In hot type-checking paths (component prop spreads, deeply generic helpers), preferring `interface ... extends` can measurably speed `tsc`.

## Gotchas

- `type` aliases cannot be re-opened. If consumers might need to add fields (think Express `Request`), expose an `interface`.
- A `type` aliasing a union can't be `extend`ed by an interface (`interface X extends Union {}` is an error).
- Hover output differs: a `type` alias often shows the expanded shape; an interface shows the name. For deeply nested generics this matters for readability.
- Both are erased at runtime — neither exists after compilation.
