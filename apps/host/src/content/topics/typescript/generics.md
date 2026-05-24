Generics let a function, class, or type accept a type parameter and produce a related output type — preserving the relationship between input and output instead of widening to `any` or `unknown`. They are the backbone of every reusable typed helper.

## Type parameters

```ts
function identity<T>(value: T): T {
  return value;
}

const n = identity(42);        // number
const s = identity("hello");   // "hello" inferred as string
```

The parameter is inferred from the argument. Explicit `identity<number>(42)` is rarely needed.

## Constraints with `extends`

A constraint says "this type parameter must be assignable to this type". It also tells the compiler what members are safe to access inside the body.

```ts
function pluck<T, K extends keyof T>(obj: T, keys: readonly K[]): Pick<T, K> {
  const out = {} as Pick<T, K>;
  for (const k of keys) out[k] = obj[k];
  return out;
}

const user = { id: 1, name: "Ada", email: "a@b" };
const slim = pluck(user, ["id", "name"]); // { id: number; name: string }
```

Without `K extends keyof T`, indexing `obj[k]` wouldn't type-check.

## Defaults

Defaults let you omit type arguments while still allowing override.

```ts
interface ApiResponse<T = unknown, E = Error> {
  data?: T;
  error?: E;
}

const r1: ApiResponse = {};                 // unknown / Error
const r2: ApiResponse<User> = { data: u };  // User / Error
```

Defaults must come after non-defaulted parameters, just like JS function defaults.

## Multiple parameters

```ts
function zip<A, B>(as: readonly A[], bs: readonly B[]): Array<[A, B]> {
  return as.map((a, i) => [a, bs[i]] as [A, B]);
}
```

Each parameter is inferred independently from its argument's position.

## Generic constraints from another parameter

```ts
function setProp<T, K extends keyof T>(obj: T, key: K, value: T[K]): void {
  obj[key] = value;
}
```

`T[K]` is an indexed access type — the type of `T`'s `K` property. This binds `value` to whatever the chosen key's type is.

## Generic classes

```ts
class Cache<K, V> {
  private store = new Map<K, V>();
  get(k: K): V | undefined { return this.store.get(k); }
  set(k: K, v: V): void { this.store.set(k, v); }
}
```

Type parameters on a class scope to instance and method members.

## Variance basics

Variance describes how subtyping flows through a generic. TypeScript's variance is mostly *bivariant* (relaxed) for method parameters and *covariant* for properties, with a strict-function-types option that makes function parameter positions contravariant.

| Position | Behavior with `strictFunctionTypes` |
| --- | --- |
| Return type | covariant — `Dog` flows into `Animal` |
| Parameter (function type) | contravariant — `Animal` flows into `Dog` |
| Parameter (method shorthand) | bivariant — both directions allowed |

```ts
type Handler<T> = (value: T) => void;

const animalHandler: Handler<Animal> = (a) => console.log(a.name);
const dogHandler: Handler<Dog> = animalHandler; // OK: contravariant
```

Since TS 4.7, you can annotate variance with `in`, `out`, `in out`:

```ts
interface Producer<out T> { make(): T }
interface Consumer<in T> { take(value: T): void }
```

These improve error messages and let the compiler skip structural checks for known-variance types.

## NoInfer (TS 5.4+)

Block inference from a parameter position so callers must supply or rely on another source.

```ts
function pick<T>(value: T, fallback: NoInfer<T>): T {
  return value ?? fallback;
}

pick("a", "b");      // T inferred as string
pick<"a" | "b">("a", "b"); // T explicit
```

## Gotchas

- Unused type parameters are silently allowed but useless — if `T` doesn't appear in inputs or outputs, the function isn't generic.
- Excess constraints cause inference to fall back to the constraint type: `function f<T extends string>(x: T)` then `f("hi")` infers `"hi"`, but `function f<T extends string>(x: string)` infers `T` as `string`.
- Higher-order generics — passing a generic function through another — frequently widen. Use explicit type arguments at the boundary if inference disappoints.
- `Array<T>` is invariant in strict mode but tolerated in many positions; mutation through an aliased array is the canonical hole.
