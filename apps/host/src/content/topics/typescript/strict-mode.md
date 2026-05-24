`strict: true` is the single most important `tsconfig` setting. It enables eight separate checks, each catching a different class of real bug. New projects should default to it; existing projects benefit from turning the individual flags on one at a time and fixing the resulting errors.

## `noImplicitAny`

Parameters and variables without an annotation that the compiler can't infer become an error instead of silently typing as `any`.

```ts
function greet(name) {        // error: parameter 'name' implicitly has an 'any' type
  return `hi ${name}`;
}
```

Fix: annotate or rely on inference from a known callsite.

## `strictNullChecks`

`null` and `undefined` become their own types, not assignable to `string`/`number`/etc.

```ts
function len(s: string): number { return s.length }
len(null); // error
```

This is the highest-impact flag — it eliminates the entire "cannot read property X of undefined" family of bugs.

Common fix patterns:

```ts
function first<T>(xs: readonly T[]): T | undefined {
  return xs[0];
}

function load(id: string | undefined): User | undefined {
  if (!id) return undefined;
  return db.find(id); // id is string
}
```

## `strictFunctionTypes`

Function-typed parameters are checked *contravariantly* — a callback taking `Animal` is not assignable to a callback slot expecting `Dog`.

```ts
type Handler<T> = (value: T) => void;

const animal: Handler<Animal> = (a) => console.log(a.name);
const dog: Handler<Dog> = animal;  // OK — Animal handler accepts a Dog
const wrong: Handler<Animal> = (d: Dog) => console.log(d.breed); // error
```

Does not apply to method *shorthand* (`foo(x: T): void`), which remains bivariant for legacy DOM compatibility.

## `strictBindCallApply`

The argument types of `bind`, `call`, and `apply` are checked against the original function signature.

```ts
function add(a: number, b: number): number { return a + b }
add.call(null, 1, "two"); // error: 'string' is not assignable to 'number'
```

## `strictPropertyInitialization`

Class instance fields must be assigned in the constructor (or have a default).

```ts
class User {
  id: string;           // error
  name = "anon";        // OK — default
  age!: number;         // OK — definite assignment assertion
  constructor(id: string) { this.id = id } // also OK
}
```

The `!` opt-out is for cases where initialization happens via a setup method or framework — use sparingly.

## `noImplicitThis`

A `this` referenced inside a function whose type can't be inferred is an error.

```ts
function bad() { console.log(this.value) }   // error

function good(this: { value: number }) {
  console.log(this.value);                    // typed
}
```

Arrow functions lexically capture `this`, so they're unaffected.

## `useUnknownInCatchVariables`

`catch (e)` types `e` as `unknown` instead of `any`. You must narrow before use.

```ts
try {
  doWork();
} catch (e) {
  if (e instanceof Error) console.error(e.message);
  else console.error(String(e));
}
```

This matches the runtime reality — anything can be thrown in JS, not just `Error`.

## `alwaysStrict`

Parses every file in strict mode and emits `"use strict"` in scripts. With ES modules, strict mode is already implicit — this mostly matters for legacy script targets.

## Worth adding alongside

These aren't part of `strict` but are equally valuable:

| Flag | Why |
| --- | --- |
| `noUncheckedIndexedAccess` | `arr[i]` becomes `T \| undefined` |
| `exactOptionalPropertyTypes` | `{ x?: T }` rejects explicit `undefined` |
| `noImplicitOverride` | `override` keyword required when overriding base methods |
| `noFallthroughCasesInSwitch` | missing `break` becomes an error |

## Migrating an existing codebase

A workable order, smallest blast radius first:

1. `noImplicitAny` — annotate the rest as you go.
2. `strictFunctionTypes`, `strictBindCallApply`, `noImplicitThis` — usually trivial.
3. `strictNullChecks` — the big one. Most fixes are guards and `?.` / `??`.
4. `strictPropertyInitialization` — easy if your classes are small.
5. `useUnknownInCatchVariables` — touch every `catch`, narrow.

Per-file opt-outs (`// @ts-strict-ignore` via tooling, or `// @ts-expect-error` on individual lines) let you ship incrementally.

## Gotchas

- `strictNullChecks: false` poisons inference: `Array.prototype.find` returns `T` instead of `T | undefined`, hiding bugs project-wide. There's no half-measure that's worth the lost guarantees.
- `useUnknownInCatchVariables` can quietly break code that did `e.message` everywhere — expect to touch every `catch`.
- `strictPropertyInitialization` interacts with frameworks that initialize via decorators or DI. Use `!:` only when the framework provably initializes the field.
