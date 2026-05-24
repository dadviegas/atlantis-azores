The standard library ships a set of utility types — generic transformations over existing types. They cover most of the day-to-day "I have this type and want a related one" needs, and serve as building blocks for custom mapped and conditional types.

## Partial and Required

`Partial<T>` makes every property optional; `Required<T>` removes optionality.

```ts
interface User { id: string; name: string; email?: string }

function update(id: string, patch: Partial<User>): void { /* ... */ }
update("u1", { name: "Ada" });

type CompleteUser = Required<User>; // email is now required
```

## Readonly

Shallowly marks all properties `readonly`. For deep, you need a recursive helper.

```ts
const frozen: Readonly<User> = { id: "1", name: "x" };
frozen.name = "y"; // error
```

## Pick and Omit

`Pick<T, K>` selects keys; `Omit<T, K>` removes them.

```ts
type PublicUser = Pick<User, "id" | "name">;
type WithoutId = Omit<User, "id">;
```

`Omit` is forgiving of unknown keys — `Omit<User, "doesNotExist">` does not error. Use `Exclude<keyof T, K>` with `Pick` if you want stricter behavior.

## Record

Builds an object type with given keys and value type.

```ts
type Permissions = Record<"read" | "write" | "admin", boolean>;
type ById<T> = Record<string, T>;
```

`Record<string, T>` is an index signature; access returns `T | undefined` only when `noUncheckedIndexedAccess` is on.

## Exclude, Extract, NonNullable

Set operations on union types.

| Helper | Meaning |
| --- | --- |
| `Exclude<U, X>` | members of `U` not assignable to `X` |
| `Extract<U, X>` | members of `U` assignable to `X` |
| `NonNullable<T>` | `Exclude<T, null \| undefined>` |

```ts
type Method = "GET" | "POST" | "PUT" | "DELETE";
type Safe   = Extract<Method, "GET" | "HEAD">;     // "GET"
type Unsafe = Exclude<Method, "GET" | "HEAD">;     // "POST" | "PUT" | "DELETE"
type Defined = NonNullable<string | null>;          // string
```

## ReturnType and Parameters

Extract from function types.

```ts
function load(id: string): Promise<User> { /* ... */ return null as any; }

type LoadReturn = ReturnType<typeof load>;     // Promise<User>
type LoadParams = Parameters<typeof load>;     // [id: string]
```

`ConstructorParameters<T>` and `InstanceType<T>` are the class equivalents.

## Awaited

Recursively unwraps `Promise` and thenables. Essential for typing the result of `await`.

```ts
type R = Awaited<Promise<Promise<number>>>; // number

async function fetchAll<T>(p: Promise<T>): Promise<Awaited<T>> {
  return await p;
}
```

Before `Awaited` (TS 4.5), `ReturnType` of an async function gave `Promise<T>` — now you can combine: `Awaited<ReturnType<typeof asyncFn>>`.

## NoInfer (TS 5.4+)

Marks a type parameter position as non-inferable. The compiler still checks assignability, but won't use that position to determine `T`.

```ts
function createState<T>(initial: T, reducer: (s: NoInfer<T>, a: unknown) => T) {
  // T is inferred only from `initial`
}

createState({ count: 0 }, (s, _) => ({ count: s.count + 1 }));
```

Without `NoInfer`, the second argument's return type would compete with `initial` for inferring `T`, often widening it.

## String case helpers

`Uppercase<S>`, `Lowercase<S>`, `Capitalize<S>`, `Uncapitalize<S>` operate on string literal types.

```ts
type Event = `on${Capitalize<"click" | "hover">}`; // "onClick" | "onHover"
```

## Gotchas

- `Partial<T>` doesn't recurse — nested objects remain required.
- `Omit` does not preserve discriminated unions cleanly; `Omit<A | B, "k">` collapses to a non-union. Use a distributive helper: `type DistOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never`.
- `Pick<T, K>` requires `K extends keyof T`. Use string literal unions, not `string`.
- `ReturnType<typeof asyncFn>` is `Promise<T>`, not `T`. Wrap in `Awaited` to get the resolved value.
