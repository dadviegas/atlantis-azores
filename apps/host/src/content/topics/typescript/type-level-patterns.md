Beyond describing data, TypeScript's type system can encode invariants the structural rules don't enforce on their own — identity, exhaustiveness, fluent build state. These patterns combine the primitives (literal types, intersections, conditionals, mapped types) into reusable idioms that pay off across a codebase.

## Branded (nominal) types

Structural typing means `type UserId = string` is interchangeable with any other `string`. A *brand* tags a value so the compiler refuses to mix it with plain strings.

```ts
declare const brand: unique symbol;
type Brand<T, B extends string> = T & { [brand]: B };

type UserId = Brand<string, "UserId">;
type OrderId = Brand<string, "OrderId">;

function asUserId(s: string): UserId { return s as UserId }
function loadUser(id: UserId) { /* ... */ }

const id = asUserId("u_1");
loadUser(id);                  // OK
loadUser("u_1");               // error
loadUser("o_1" as OrderId);    // error
```

The `unique symbol` key has no runtime presence — the brand exists only in the type system, but it makes IDs, currencies, and units mutually exclusive without runtime cost.

## Opaque types

A branded type whose constructor is the only way in. The internals are unforgeable from outside the module.

```ts
// money.ts
declare const eur: unique symbol;
export type Eur = number & { [eur]: never };

export function eurFromCents(n: number): Eur {
  return (n / 100) as Eur;
}

export function add(a: Eur, b: Eur): Eur {
  return (a + b) as Eur;
}
```

Consumers can `add(eurFromCents(100), eurFromCents(50))` but cannot pass a raw `number` — and cannot synthesize an `Eur` themselves without importing the constructor.

## Exhaustive switch

Pair discriminated unions with `never` to catch missing cases at compile time.

```ts
type Event =
  | { type: "click"; x: number; y: number }
  | { type: "key"; code: string }
  | { type: "scroll"; delta: number };

function handle(e: Event): string {
  switch (e.type) {
    case "click":  return `click ${e.x},${e.y}`;
    case "key":    return `key ${e.code}`;
    case "scroll": return `scroll ${e.delta}`;
    default:       return assertNever(e);
  }
}

function assertNever(x: never): never {
  throw new Error(`unhandled: ${JSON.stringify(x)}`);
}
```

Adding a new variant to `Event` immediately fails the build until handled.

## Builder return types

Track builder state in the return type so methods become available only when their prerequisites are met.

```ts
interface QueryBuilder<Selected extends boolean, Filtered extends boolean> {
  select(cols: string[]): QueryBuilder<true, Filtered>;
  where(pred: string): QueryBuilder<Selected, true>;
  execute(this: QueryBuilder<true, boolean>): Promise<unknown[]>;
}

declare const qb: QueryBuilder<false, false>;
qb.execute();                       // error: select required first
qb.select(["id"]).execute();        // OK
qb.select(["id"]).where("x = 1").execute(); // OK
```

The `this` parameter on `execute` enforces the call-site state — the builder only lets you call it once `Selected` is `true`.

## Phantom types for state machines

A class parameterized by a state token, where each transition returns a new instance with the next state.

```ts
class Door<S extends "open" | "closed"> {
  private constructor(private state: S) {}
  static closed(): Door<"closed"> { return new Door("closed") }
  open(this: Door<"closed">): Door<"open"> { return new Door("open") }
  close(this: Door<"open">): Door<"closed"> { return new Door("closed") }
}

const d = Door.closed();
const o = d.open();   // OK
o.open();             // error: open is only on Door<"closed">
```

## Tuple-tracked accumulation

Use tuple manipulation to accumulate types across calls (`zod`-style chained schemas, parser combinators).

```ts
type Append<T extends readonly unknown[], U> = readonly [...T, U];

class Tup<T extends readonly unknown[]> {
  constructor(private xs: T) {}
  push<U>(x: U): Tup<Append<T, U>> {
    return new Tup([...this.xs, x] as Append<T, U>);
  }
  values(): T { return this.xs }
}

const t = new Tup([] as const).push(1).push("a").push(true);
const v = t.values(); // readonly [1, "a", true]
```

## Variadic tuple helpers

```ts
type Head<T extends readonly unknown[]> = T extends readonly [infer H, ...unknown[]] ? H : never;
type Tail<T extends readonly unknown[]> = T extends readonly [unknown, ...infer R] ? R : [];
type Last<T extends readonly unknown[]> = T extends readonly [...unknown[], infer L] ? L : never;
```

Foundation for typed currying, function composition, and route parameter parsing.

## Const type parameters for literals

```ts
function pick<const K extends readonly string[]>(keys: K): K {
  return keys;
}

const ks = pick(["a", "b"]); // readonly ["a", "b"]
```

Without `const`, the parameter would widen to `string[]` and downstream `K[number]` would be `string` instead of `"a" | "b"`.

## Gotchas

- Brands are forgeable with `as` — they're a guard, not a security boundary. The discipline lives at the cast site.
- Builder return types are easy to design and easy to over-design. Keep state to one or two flags; more becomes a maintenance burden.
- Exhaustive `assertNever` only protects you if every `switch` uses it. A `// TODO` `default` defeats the check.
- Variadic recursion has a depth limit. Refactor toward tail recursion when you hit "type instantiation is excessively deep".
- Phantom-typed classes don't survive serialization — the state lives in the type, not the value. Persist and restore explicitly.
