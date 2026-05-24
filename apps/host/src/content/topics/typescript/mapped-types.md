A mapped type iterates over the keys of another type and produces a new property for each. They power most of the built-in utility types (`Partial`, `Readonly`, `Pick`, `Record`) and unlock a large amount of reusable, type-safe transformation.

## Basic shape

```ts
type Stringify<T> = {
  [K in keyof T]: string;
};

type S = Stringify<{ a: number; b: boolean }>;
// { a: string; b: string }
```

`K in keyof T` is the iteration. The type after `:` is what each property becomes.

## Iterating a union of strings

`keyof T` is one source; any string union works.

```ts
type Flags = {
  [K in "debug" | "verbose" | "trace"]: boolean;
};
// { debug: boolean; verbose: boolean; trace: boolean }
```

This is exactly what `Record<K, V>` does:

```ts
type Record<K extends keyof any, V> = { [P in K]: V };
```

## Modifiers: `?` and `readonly`

You can add or remove modifiers with `+` (default) and `-`.

```ts
type Partial<T>   = { [K in keyof T]?: T[K] };
type Required<T>  = { [K in keyof T]-?: T[K] };
type Readonly<T>  = { readonly [K in keyof T]: T[K] };
type Mutable<T>   = { -readonly [K in keyof T]: T[K] };
```

`-?` removes optionality (and `undefined` from the value type if `strictNullChecks` is on); `-readonly` strips immutability. There is no built-in `Mutable` — you write it when you need it.

## Key remapping with `as`

Since TS 4.1, you can transform the key during the map. Returning `never` filters keys out.

```ts
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

type UserGetters = Getters<{ id: string; name: string }>;
// { getId: () => string; getName: () => string }
```

Filtering:

```ts
type NonFunctionKeys<T> = {
  [K in keyof T as T[K] extends Function ? never : K]: T[K];
};

type Data = NonFunctionKeys<{ id: string; save(): void }>;
// { id: string }
```

## Combined with conditional types

Mapped + conditional is where most "real" type-level work happens.

```ts
type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};

type DeepReadonly<T> = T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;
```

## Indexed access in the value position

You can re-key while keeping the value type from another property of the same object.

```ts
type EventHandlers<T> = {
  [K in keyof T as `on${Capitalize<string & K>}Change`]: (value: T[K]) => void;
};

type FormHandlers = EventHandlers<{ name: string; age: number }>;
// { onNameChange: (value: string) => void; onAgeChange: (value: number) => void }
```

## Mapping over tuples and arrays

Mapped types preserve tuple-ness when the input is a tuple.

```ts
type Promised<T extends readonly unknown[]> = {
  [K in keyof T]: Promise<T[K]>;
};

type P = Promised<[number, string]>; // [Promise<number>, Promise<string>]
```

This is exactly the technique `Promise.all`'s type uses.

## Gotchas

- `keyof` on a type with an index signature includes `string`/`number`, which can wash out specific keys. Combine with `as` filtering to drop them.
- Symbol keys are included in `keyof T` — when remapping to strings, use `Extract<keyof T, string>` or the `string & K` constraint shown above.
- A mapped type that adds new keys (not derived from `T`) is not really mapped — use an intersection: `{ [K in keyof T]: T[K] } & { extra: number }`.
- `Readonly` is shallow. Don't claim a deep guarantee unless you wrote a recursive helper and tested it on the actual shape.
