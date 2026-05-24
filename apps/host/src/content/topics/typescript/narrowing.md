Narrowing is how TypeScript tracks the *current* type of a value through a sequence of checks. The compiler models control flow, and every branch shrinks (or widens) the possibilities. Understanding which expressions narrow — and which don't — is one of the highest-leverage skills in the language.

## `typeof`

Works on primitives. The set of recognised strings is `"string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function"`.

```ts
function pad(value: string | number): string {
  if (typeof value === "number") {
    return " ".repeat(value);
  }
  return value;
}
```

## `instanceof`

Narrows to the class on the right.

```ts
function read(input: Request | URL): string {
  if (input instanceof URL) return input.toString();
  return input.url;
}
```

`instanceof` checks the prototype chain at runtime — it won't help with cross-realm objects (iframes, workers).

## `in` operator

Discriminates by presence of a property.

```ts
type Cat = { meow(): void };
type Dog = { bark(): void };

function speak(animal: Cat | Dog) {
  if ("bark" in animal) animal.bark();
  else animal.meow();
}
```

`in` checks own *and* inherited properties — narrowing reflects that.

## Discriminated unions

The cleanest pattern when you control the data model. Add a literal-typed `kind`/`type` field and switch on it.

```ts
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rect"; width: number; height: number };

function area(s: Shape): number {
  switch (s.kind) {
    case "circle": return Math.PI * s.radius ** 2;
    case "rect":   return s.width * s.height;
  }
}
```

Combine with `never` for exhaustiveness — see below.

## Custom type guards

A function returning `x is T` becomes a user-defined narrowing predicate.

```ts
function isError(x: unknown): x is Error {
  return x instanceof Error;
}

try {
  // ...
} catch (e) {
  if (isError(e)) console.error(e.message);
}
```

Guards are *trusted* — TS does not verify the body actually matches the claim. A wrong predicate silently corrupts narrowing.

## Assertion functions

`asserts x is T` (or `asserts x`) tells the compiler that, if the function returns, the assertion held.

```ts
function assertString(x: unknown): asserts x is string {
  if (typeof x !== "string") throw new TypeError("expected string");
}

function upper(x: unknown): string {
  assertString(x);
  return x.toUpperCase(); // x is string here
}
```

Assertion functions must have an explicit return type annotation — TS won't infer them.

## Equality narrowing

Narrowing also flows through `===` against a literal.

```ts
function handle(method: "GET" | "POST", body: unknown) {
  if (method === "POST") {
    // body is still unknown — narrowing only narrows the *tested* expression
  }
}
```

Narrowing one variable does not narrow another, even if they're logically linked. To get cross-variable narrowing, combine them into a single discriminated value.

## Truthiness

`if (x)` removes `null`, `undefined`, `0`, `""`, `0n`, `NaN`, `false` from the type — sometimes more than intended.

```ts
function len(s: string | undefined): number {
  if (!s) return 0;     // also catches "" — likely fine
  return s.length;
}
```

## `never` and exhaustive switch

After every case is handled in a discriminated union, the remaining type is `never`. Pass it to an `assertNever` helper to make missing cases a compile error.

```ts
function assertNever(x: never): never {
  throw new Error(`unhandled: ${JSON.stringify(x)}`);
}

function area(s: Shape): number {
  switch (s.kind) {
    case "circle": return Math.PI * s.radius ** 2;
    case "rect":   return s.width * s.height;
    default:       return assertNever(s);
  }
}
```

Adding a new `Shape` variant now fails the build until it's handled.

## Gotchas

- Narrowing inside a closure is lost: if you capture a variable in a callback, TS re-widens because the callback may run later, after a reassignment.
- `Array.prototype.filter(Boolean)` does not narrow — use `.filter((x): x is T => x !== null)` or `.filter(Boolean as unknown as ...)` cautiously.
- `typeof x === "object"` includes `null`. Always pair with `x !== null` or use `x != null`.
- Calling a method that the compiler can't prove pure (`obj.method()`) sometimes resets narrowing on `obj`'s properties; cache to a local first.
