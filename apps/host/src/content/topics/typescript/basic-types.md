TypeScript's primitive types mirror JavaScript's runtime types, but adds tuples, enums, and literal types that let you describe values more precisely. Most day-to-day typing is built from these primitives plus arrays and objects.

## Primitives

`string`, `number`, `boolean`, `bigint`, `symbol`, `null`, `undefined`. Use the lowercase forms — `String`, `Number`, `Boolean` refer to the boxed object types and you almost never want them.

```ts
const name: string = "Ada";
const count: number = 42;
const flag: boolean = true;
const id: bigint = 9007199254740993n;
const key: symbol = Symbol("k");
```

`void` is the absence of a return value; `never` is the type of a value that can never exist (a function that always throws, an exhausted union).

## Arrays and ReadonlyArray

```ts
const xs: number[] = [1, 2, 3];
const ys: Array<number> = [1, 2, 3];
const frozen: ReadonlyArray<number> = xs;
```

`ReadonlyArray<T>` (or `readonly T[]`) forbids `push`, `pop`, assignment by index, etc. Prefer it for function parameters you don't intend to mutate — it documents intent and prevents accidental writes.

## Tuples

Fixed-length, positionally-typed arrays. Useful for return pairs and React-style hooks.

```ts
type UseToggle = readonly [value: boolean, toggle: () => void];

function useToggle(initial: boolean): UseToggle {
  let v = initial;
  return [v, () => { v = !v; }] as const;
}
```

Tuples support labels (`[x: number, y: number]`), rest elements (`[string, ...number[]]`), and optional trailing elements (`[number, number?]`).

## Enums vs const objects

Numeric `enum`s emit a runtime object and are reverse-mapped. They have subtle pitfalls: numeric enums are assignable from any `number`, and `const enum`s don't play well with `isolatedModules` or bundlers.

```ts
enum Status { Pending, Active, Done }
const s: Status = 99;
```

The modern recommendation is a `const` object plus a derived union type:

```ts
const Status = {
  Pending: "pending",
  Active: "active",
  Done: "done",
} as const;
type Status = (typeof Status)[keyof typeof Status];
```

This gives you string literal members, no runtime weirdness, and works in any bundler.

| Concern | `enum` | `as const` object |
| --- | --- | --- |
| Runtime cost | object emitted | object emitted |
| Reverse mapping | yes (numeric) | no |
| String unions | manual | natural |
| `isolatedModules` safe | not for `const enum` | yes |
| Tree-shakable | partial | yes |

## Literal types

A literal type is a single value used as a type. They become powerful when combined into unions.

```ts
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

function request(method: HttpMethod, url: string): Promise<Response> {
  return fetch(url, { method });
}
```

Literal types are also produced by `as const`:

```ts
const config = { region: "eu-west-1", retries: 3 } as const;
// config.region is "eu-west-1", not string
```

## `any`, `unknown`, `never`

- `any` opts out of type checking entirely — avoid except at trusted boundaries.
- `unknown` is the safe counterpart: you must narrow before use.
- `never` is the empty type — used for exhaustiveness checks and unreachable branches.

```ts
function assertNever(x: never): never {
  throw new Error(`Unexpected: ${String(x)}`);
}
```

## Object types

```ts
type User = {
  id: string;
  name: string;
  email?: string;          // optional
  readonly createdAt: Date; // immutable
};
```

`Record<K, V>` builds an object type keyed by `K`:

```ts
type Translations = Record<"en" | "pt", string>;
```

## Gotchas

- `Number(...)` and `number` are different — never type something as `Number`.
- A numeric `enum` value is assignable from arbitrary numbers; a string enum is not.
- Empty arrays default to `never[]` unless given context: `const xs = [];` then `xs.push(1)` errors. Annotate, or push immediately.
- `Object` and `{}` mean "any non-null value" — almost never what you want; use `Record<string, unknown>` or a concrete shape.
