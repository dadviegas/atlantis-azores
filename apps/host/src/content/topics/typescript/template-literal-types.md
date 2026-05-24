Template literal types lift JavaScript's template strings into the type system. Combined with unions, mapped types, and `infer`, they let you describe and manipulate string shapes at compile time — typed event names, CSS variables, route paths, and structured keys.

## Basic syntax

```ts
type Greeting = `Hello, ${string}`;

const ok: Greeting = "Hello, world";
const bad: Greeting = "Hi";       // error
```

A template literal type is a string literal where one or more positions are types.

## Distribution over unions

When a hole is a union, the template distributes — producing every combination.

```ts
type Lang = "en" | "pt";
type Page = "home" | "about";

type Path = `/${Lang}/${Page}`;
// "/en/home" | "/en/about" | "/pt/home" | "/pt/about"
```

This is exact: only those four strings are assignable. Useful for route tables, translation keys, and any controlled vocabulary.

## Intrinsic string types

TS ships four compiler-implemented helpers that operate on string literal types:

| Helper | Effect |
| --- | --- |
| `Uppercase<S>` | `"abc"` → `"ABC"` |
| `Lowercase<S>` | `"ABC"` → `"abc"` |
| `Capitalize<S>` | `"abc"` → `"Abc"` |
| `Uncapitalize<S>` | `"ABC"` → `"aBC"` |

```ts
type ClickEvent = `on${Capitalize<"click" | "hover">}`; // "onClick" | "onHover"
```

These are compiler intrinsics — you can't reproduce them in user-land for non-literal strings.

## Combined with mapped key remapping

```ts
type Setters<T> = {
  [K in keyof T as `set${Capitalize<string & K>}`]: (value: T[K]) => void;
};

type S = Setters<{ name: string; age: number }>;
// { setName: (value: string) => void; setAge: (value: number) => void }
```

## Inference with `infer`

You can parse a string literal type with conditional types and `infer`.

```ts
type Split<S extends string, D extends string> =
  S extends `${infer Head}${D}${infer Tail}`
    ? [Head, ...Split<Tail, D>]
    : [S];

type Parts = Split<"a.b.c.d", ".">; // ["a", "b", "c", "d"]
```

```ts
type RouteParams<S extends string> =
  S extends `${string}:${infer P}/${infer Rest}`
    ? P | RouteParams<`/${Rest}`>
    : S extends `${string}:${infer P}`
      ? P
      : never;

type P = RouteParams<"/users/:id/posts/:postId">; // "id" | "postId"
```

## Typed event names

```ts
type EventMap = {
  click: MouseEvent;
  change: Event;
  keydown: KeyboardEvent;
};

type Handlers = {
  [K in keyof EventMap as `on${Capitalize<K>}`]?: (e: EventMap[K]) => void;
};

const h: Handlers = {
  onClick: (e) => console.log(e.clientX),
  onKeydown: (e) => console.log(e.key),
};
```

## CSS variable example

```ts
type CssVar<Name extends string> = `--${Name}`;
type Theme = {
  [K in "primary" | "accent" | "bg" as CssVar<K>]: string;
};
// { "--primary": string; "--accent": string; "--bg": string }
```

## Gotchas

- A template with a `string` hole accepts any string — `` `prefix-${string}` `` is essentially a pattern match, not a literal. Pair with `extends` checks if you need exhaustive narrowing.
- Distribution can explode combinations. `${A}${B}${C}` over three 10-member unions produces 1000 literals — the compiler will slow down.
- `Capitalize<string>` is itself `string`, not a refined type — intrinsics preserve precision only for literal inputs.
- Numeric holes coerce: `` `${number}` `` accepts `"1"`, `"-3.5"`, `"1e10"` — anything `Number(...)` would parse — not just integer strings.
- Pattern inference (`` `${infer A}.${infer B}` ``) is greedy on the *first* match for `A`. Recurse or constrain when you need different splits.
