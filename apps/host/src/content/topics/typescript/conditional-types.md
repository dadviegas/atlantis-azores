A conditional type chooses between two type expressions based on an assignability test: `T extends U ? X : Y`. They are the type-system equivalent of an `if` expression and underpin much of what feels like "magic" in TypeScript — `ReturnType`, `Awaited`, `Parameters`, all the way up to complex inference-driven libraries.

## Basic form

```ts
type IsString<T> = T extends string ? true : false;

type A = IsString<"hi">;   // true
type B = IsString<number>; // false
```

The check is structural assignability, not equality.

## `infer` — pattern matching in types

`infer X` introduces a fresh type variable inside the `extends` clause, capturing whatever fits the position.

```ts
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
type Parameters<T> = T extends (...args: infer P) => any ? P : never;

type R = ReturnType<() => Promise<User>>; // Promise<User>
```

Nested `infer` is allowed:

```ts
type FirstArg<T> = T extends (first: infer F, ...rest: any[]) => any ? F : never;
type ArrayItem<T> = T extends ReadonlyArray<infer I> ? I : never;
```

## Distributive conditionals

When the checked type is a *naked* type parameter and the input is a union, the conditional distributes over each member.

```ts
type Nullable<T> = T extends null | undefined ? T : never;

type N = Nullable<string | null | undefined>; // null | undefined
```

This is how `Exclude` and `Extract` work:

```ts
type Exclude<T, U> = T extends U ? never : T;
type Extract<T, U> = T extends U ? T : never;
```

### Disabling distribution

Wrap the parameter in a tuple on both sides to prevent distribution.

```ts
type IsUnion<T, U = T> = T extends any
  ? [U] extends [T] ? false : true
  : never;

type Yes = IsUnion<"a" | "b">; // true
type No  = IsUnion<"a">;       // false
```

Without the tuple wrap, the inner `[U] extends [T]` would also distribute, breaking the test.

## `infer` with constraints (TS 4.7+)

`infer` can carry an `extends` constraint that narrows what the variable is allowed to capture.

```ts
type FirstNumber<T extends readonly unknown[]> =
  T extends readonly [infer F extends number, ...unknown[]] ? F : never;

type X = FirstNumber<[42, "x"]>; // 42
type Y = FirstNumber<["x", 1]>;  // never
```

## Recursive conditionals

Conditionals can recurse on themselves, up to the compiler's instantiation depth limit (~50 by default, ~1000 with tail recursion).

```ts
type Flatten<T> = T extends readonly (infer U)[]
  ? Flatten<U>
  : T;

type F = Flatten<number[][][]>; // number
```

Tail-position recursion is much cheaper for `tsc` than nested recursion — restructure to use it when types get slow.

## Combining with mapped types

```ts
type FunctionKeys<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];

type SaveOnly = FunctionKeys<{ id: string; save(): void; load(): void }>;
// "save" | "load"
```

The `[keyof T]` lookup turns the mapped object into a union of its non-`never` values.

## Real-world example: untaggable promise unwrap

```ts
type DeepAwaited<T> =
  T extends Promise<infer U> ? DeepAwaited<U> :
  T extends readonly unknown[] ? { [K in keyof T]: DeepAwaited<T[K]> } :
  T;
```

## Gotchas

- Distribution happens *only* for naked type parameters. `T extends U ? ...` distributes; `[T] extends [U] ? ...` does not.
- `T extends any ? ... : ...` is the common idiom for "distribute over T", even though the condition is trivially true.
- `boolean` is `true | false` — conditionals distribute over it, often producing surprising `true | false` results that look identical to `boolean` but break exact comparisons.
- Recursive types that don't terminate raise "Type instantiation is excessively deep" — check for missing base cases or refactor toward tail recursion.
- `infer` is positional: `(infer A) => infer A` doesn't unify, the second binding shadows the first in different conditional clauses.
