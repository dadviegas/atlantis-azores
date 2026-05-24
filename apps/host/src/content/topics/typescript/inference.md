TypeScript infers types whenever it can — from initializers, return statements, function call arguments, and context. Understanding when inference widens, when it narrows, and how to nudge it produces cleaner code than annotating everything, and is essential for writing generic helpers that infer well at the call site.

## Contextual typing

The expected type at a position flows *into* the expression, typing things that would otherwise be `any`.

```ts
window.addEventListener("click", (e) => {
  // e: MouseEvent — inferred from the handler signature
  console.log(e.clientX);
});

const numbers: number[] = [1, 2, 3].map((n) => n * 2);
// n: number — inferred from the array element type
```

Without context (a top-level arrow without an annotated target), the parameter would be implicit `any`.

## Best common type

When inferring the type of an array or a return position with multiple candidates, TS computes the best common supertype.

```ts
const xs = [1, "two", true];        // (string | number | boolean)[]
const ys = [new Dog(), new Cat()];  // (Dog | Cat)[]
```

If no common supertype exists, the result is the union of candidates.

## Widening

Mutable `let` widens literal types to their base.

```ts
let s = "hello";       // string, not "hello"
const c = "hello";     // "hello"
```

Object properties widen too:

```ts
const config = { mode: "dev" };   // { mode: string }
```

This is correct for `let` (you want to reassign) but often wrong for `const` object literals you want to treat as constant data.

## `as const`

Freezes literal types and makes object properties `readonly`.

```ts
const config = { mode: "dev", port: 3000 } as const;
// { readonly mode: "dev"; readonly port: 3000 }

const routes = ["/", "/about", "/contact"] as const;
// readonly ["/", "/about", "/contact"]

type Route = (typeof routes)[number]; // "/" | "/about" | "/contact"
```

Combine with `typeof` and indexed access for an entire derived-types pattern.

## The `satisfies` operator

`satisfies T` checks that a value matches `T`, *without* widening its inferred type. Annotating (`: T`) loses information; `satisfies` keeps it.

```ts
type Theme = Record<"primary" | "accent", string>;

const palette = {
  primary: "#1e40af",
  accent: "#f59e0b",
} satisfies Theme;

palette.primary.toUpperCase(); // still typed as string, key still narrow
```

Compare:

```ts
const annotated: Theme = { primary: "#1e40af", accent: "#f59e0b" };
// annotated.primary is string — fine, but inferred keys are lost on iteration
```

With `satisfies`, hover and iteration see the precise object; without it, you see the wider `Theme`.

## Inference in generic calls

The compiler picks `T` from the most specific source available. Arguments that are *literal* values produce literal types unless the parameter is widened by a non-literal context.

```ts
function identity<T>(x: T): T { return x }

const a = identity("hi");       // T = "hi"
const b = identity({ x: 1 });   // T = { x: number }
```

A widened parameter slot (`(x: string) => ...`) prevents literal inference.

## Const type parameters (TS 5.0+)

`<const T>` makes a type parameter behave as if every argument were passed `as const`.

```ts
function routes<const T extends readonly string[]>(rs: T): T {
  return rs;
}

const r = routes(["/", "/about"]);
// readonly ["/", "/about"] — without `const`, would be string[]
```

This is the cleanest way to preserve literal tuples through a generic function call.

## Return type inference

TS infers function return types from `return` statements. Explicit annotations help only when:

- You want the compiler to enforce a contract on the implementation.
- The inferred type would be too wide or noisy.
- It's a public API and you want stable types in declaration output.

```ts
export function load(id: string): Promise<User> {
  return db.find(id);
}
```

For internal helpers, lean on inference — every annotation is one more place to update.

## Inference cascades through generics

```ts
const ids = ["a", "b", "c"];
const fetched = await Promise.all(ids.map((id) => fetchUser(id)));
// fetched: User[]
```

`map`'s callback infers `id: string`, `fetchUser` returns `Promise<User>`, `Promise.all` resolves to `User[]`. Removing any one of those inferences cascades errors upward — but the chain is invisible when it works.

## Gotchas

- An empty array literal infers `never[]` until the first push. Annotate when declaring up-front.
- `as const` only applies to literal expressions — `as const` on the result of a function call does nothing.
- `satisfies` is the wrong tool when you want to *expand* a value's type (e.g. assigning a `(x: number) => number` to `Function`); use a type annotation instead.
- Inference inside conditional generics can fall back to the constraint. Use explicit type args at the boundary if a helper "always" infers wider than expected.
- Object literal arguments to generic functions sometimes widen aggressively. `satisfies` at the call site, or a `<const T>` parameter, restores precision.
