JavaScript has a small set of primitive types and one composite type (object). The coercion rules between them are the source of most "wat" moments. Knowing the rules — and avoiding the operators that trigger them — keeps surprises out of production.

## The type list

| Category | Types |
| --- | --- |
| Primitives | `string`, `number`, `boolean`, `bigint`, `symbol`, `null`, `undefined` |
| Objects | everything else — plain objects, arrays, functions, dates, maps, etc. |

Primitives are immutable and compared by value. Objects are compared by reference.

```js
'abc' === 'abc';      // true
[1, 2] === [1, 2];    // false — different references
```

`typeof null` returns `'object'` — a historical bug that can't be fixed without breaking the web.

## `==` vs `===`

`===` compares without coercion. `==` applies the abstract equality algorithm, which converts operands toward numbers in most cases.

| Expression | Result | Why |
| --- | --- | --- |
| `0 == '0'` | `true` | string coerced to number |
| `0 == []` | `true` | `[]` → `''` → `0` |
| `0 == '0' == false` | `true` | left-to-right: `true == false` → coerce |
| `null == undefined` | `true` | special case |
| `null == 0` | `false` | `null` only equals `undefined` |
| `NaN == NaN` | `false` | `NaN` is never equal to anything |

Use `===` by default. The one common exception is `x == null` to catch both `null` and `undefined` in a single check.

## Falsy values

These eight values coerce to `false` in a boolean context. Everything else — including `[]`, `{}`, and `'0'` — is truthy.

```js
false, 0, -0, 0n, '', null, undefined, NaN
```

```js
if ('0') console.log('truthy');     // logs
if ([]) console.log('truthy');      // logs
if (new Boolean(false)) console.log('truthy'); // logs — it's an object
```

## Nullish vs falsy

`??` only falls back on `null` or `undefined`. `||` falls back on any falsy value. This matters for numeric and string config.

```js
const port = userPort || 3000;  // 0 becomes 3000 — bug
const port2 = userPort ?? 3000; // 0 stays 0
```

`?.` short-circuits on `null`/`undefined` and returns `undefined`.

```js
user?.address?.city; // safe deep read
fn?.(arg);           // call if defined
arr?.[0];            // index if defined
```

## NaN

`NaN` is a number that represents the result of an invalid numeric operation. It is not equal to itself, so use `Number.isNaN` (not the global `isNaN`, which coerces).

```js
Number.isNaN(NaN);     // true
Number.isNaN('foo');   // false
isNaN('foo');          // true — coerces 'foo' to NaN first
```

Use `Number.isFinite` to validate user-supplied numbers.

## BigInt

`bigint` is an arbitrary-precision integer type. Literals use a trailing `n`. You cannot mix `bigint` and `number` in arithmetic without an explicit cast.

```js
2n ** 64n;            // 18446744073709551616n
1n + 1;               // TypeError
1n + BigInt(1);       // 2n
Number(2n ** 53n);    // safe — but anything above MAX_SAFE_INTEGER loses precision
```

`JSON.stringify` does not serialize `bigint` — it throws. Convert to string at the boundary.

## Coercion rules worth memorising

- `+` with any string operand produces a string. Otherwise it's numeric.
- `-`, `*`, `/`, `%`, `**` always coerce to number (or bigint).
- `String(x)` and `` `${x}` `` use the `Symbol.toPrimitive` / `toString` path.
- `Number(x)` and unary `+x` use the numeric path; `''` becomes `0`, `'  '` becomes `0`, `'1abc'` becomes `NaN`.
- `[1] + [2]` is `'12'` — both arrays coerce to strings, then concatenate.

```js
+'';      // 0
+'  ';    // 0
+'1abc';  // NaN
+null;    // 0
+undefined; // NaN
+true;    // 1
+[];      // 0
+[1];     // 1
+[1, 2];  // NaN
+{};      // NaN
```

## Common mistakes

- Using `==` "because it's shorter". You will regret the one time `0 == ''` matters.
- Validating numbers with `if (n)` — `0` is falsy.
- Calling the global `isNaN` instead of `Number.isNaN`.
- Trusting `typeof` for arrays. Use `Array.isArray`.
- Serialising a `BigInt` without converting first.
- Comparing dates with `===`. Use `+a === +b` or `a.getTime() === b.getTime()`.
