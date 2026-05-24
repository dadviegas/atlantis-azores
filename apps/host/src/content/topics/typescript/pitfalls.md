TypeScript's soundness compromises are deliberate — strict soundness would reject huge amounts of working JavaScript. The result is a handful of recurring traps where the type checker accepts code that misbehaves at runtime, or vice versa. Knowing them turns most "TypeScript is lying to me" moments into "ah, that one again".

## `any` vs `unknown`

`any` disables checking *through* the value — any property access, any call, anything goes.

```ts
const x: any = JSON.parse("[1,2,3]");
x.toUpperCase();  // no error, runtime crash
x.foo.bar.baz();  // no error, runtime crash
```

`unknown` is the safe alternative: you must narrow before use.

```ts
const x: unknown = JSON.parse("[1,2,3]");
if (typeof x === "string") x.toUpperCase();
if (Array.isArray(x)) x.length;
```

Reach for `any` only at trusted boundaries you cannot type — and document why with a comment.

## Structural typing surprises

Extra properties are usually allowed when an object is passed via a variable, but rejected as object literals — the "excess property check".

```ts
type Config = { host: string; port: number };

function init(c: Config) {}

init({ host: "x", port: 1, secure: true });   // error: excess property

const c = { host: "x", port: 1, secure: true };
init(c);                                       // OK — assigned via variable
```

The check exists to catch typos at the call site. Disable per-call with a cast (`as Config`), or per-type with an index signature.

## `any[]` vs `unknown[]`

```ts
function logAll(xs: any[]) {
  for (const x of xs) x.toUpperCase(); // no error
}

function logAll(xs: unknown[]) {
  for (const x of xs) {
    if (typeof x === "string") x.toUpperCase();
  }
}
```

Default to `unknown[]` for generic collection parameters; `any[]` is rarely the right choice.

## Function parameter bivariance (method shorthand)

Method-shorthand syntax (`foo(x: T): void`) is bivariant — assigning a stricter handler into a looser slot works, even when it shouldn't.

```ts
interface EventTarget {
  addListener(handler: (e: Event) => void): void;
}

const target: EventTarget = {
  addListener(handler: (e: MouseEvent) => void) {}, // accepted
};
```

Use function-property syntax (`foo: (x: T) => void`) to get `strictFunctionTypes` contravariance.

## `this` typing

Free-standing functions don't know about `this` unless you tell them.

```ts
function bad() {
  console.log(this.value);  // error with noImplicitThis
}

function good(this: { value: number }) {
  console.log(this.value);
}

const obj = { value: 1, method: good };
obj.method();   // OK
const m = obj.method;
m();            // runtime error: this is undefined
```

The `this: T` parameter is erased at runtime — it's a contract for callers, not a binding.

## Excess property checks on intersections

Intersections relax excess property checking, which sometimes silently swallows typos.

```ts
type A = { x: number };
type B = { y: number };
const ab: A & B = { x: 1, y: 2, z: 3 }; // OK — extra property allowed
```

When you intend a closed shape, define it as a single type.

## Index signatures hide misses

```ts
type Dict = { [key: string]: number };
const d: Dict = { a: 1 };
d.nonexistent.toFixed(); // no error, runtime crash
```

Enable `noUncheckedIndexedAccess` so `d.nonexistent` types as `number | undefined`.

## `Object.keys` returns `string[]`

```ts
const obj = { a: 1, b: 2 };
Object.keys(obj).forEach((k) => {
  obj[k]; // error: string can't index { a: number; b: number }
});
```

The type is honest: `Object.keys` doesn't know your object doesn't have extra runtime properties. Cast when you've proven safety:

```ts
(Object.keys(obj) as Array<keyof typeof obj>).forEach((k) => obj[k]);
```

## Array methods that lie

```ts
const xs = [1, 2, 3];
const y = xs[10];        // number — but actually undefined at runtime
xs.find((x) => x > 100); // number | undefined — honest
```

`noUncheckedIndexedAccess` fixes the first; `.find` is already correctly typed.

## `JSON.parse` returns `any`

```ts
const data = JSON.parse(raw); // any — taints everything downstream
```

Wrap and narrow at the boundary:

```ts
function safeParse(raw: string): unknown {
  return JSON.parse(raw);
}
```

Then validate with `zod`, `valibot`, or a hand-written guard before trusting the shape.

## `Promise` flattening surprises

`Promise<Promise<T>>` doesn't exist at runtime — promises auto-flatten. The type system also flattens via `Awaited`, but explicit annotations may not.

```ts
async function get(): Promise<Promise<number>> {
  return Promise.resolve(1); // accepted, but the actual value is number
}

const v = await get();      // number, not Promise<number>
```

Annotate as `Promise<number>` to match runtime.

## Discriminated union shape loss through utility types

```ts
type E = { kind: "a"; x: number } | { kind: "b"; y: string };
type EOmit = Omit<E, "kind">;
// { x: number } | { y: string } — collapses; cannot discriminate
```

Write a distributive helper if you need shape preservation:

```ts
type DistOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;
```

## Gotchas summary

- `any` is contagious through return types — one untyped helper poisons every caller.
- `as` is unchecked. The compiler will let you assert anything to anything (via `unknown` if direct).
- `enum` numeric members accept arbitrary numbers; prefer string enums or `as const` objects.
- DOM types (`HTMLElement`, `Event`) frequently use bivariant method shorthand — wrapping in your own function types restores strictness.
- `void` as a return type means "I don't care what you return" in callback positions — `() => void` accepts `() => number`. Use `() => undefined` if you really want to forbid a value.
