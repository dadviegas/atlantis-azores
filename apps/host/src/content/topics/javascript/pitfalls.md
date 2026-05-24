Every language has corners that produce unexpected results. JavaScript has more than most because of its compatibility history. This is a tour of the ones that show up in real bug reports — not party tricks, but behaviour you will hit if you write enough JS.

## Floating point

All `number` arithmetic uses IEEE 754 doubles. Decimal fractions don't round-trip.

```js
0.1 + 0.2;          // 0.30000000000000004
0.1 + 0.2 === 0.3;  // false
(0.1 + 0.2).toFixed(20); // "0.30000000000000004441"
```

Comparison strategies:

```js
const eq = (a, b, eps = 1e-9) => Math.abs(a - b) < eps;
```

For money, use integers (cents) or a decimal library. Never `Number` for currency arithmetic in a real app.

## `Array.prototype.sort` defaults to string order

```js
[10, 2, 1, 20].sort();              // [1, 10, 2, 20] — lexicographic
[10, 2, 1, 20].sort((a, b) => a - b); // [1, 2, 10, 20]
```

The default also fails for objects, dates, and anything that doesn't stringify into the order you want. Always pass a comparator unless you're sorting strings.

A comparator must return a number with consistent sign. Returning a boolean (`a > b`) silently breaks the sort.

## `Date` quirks

`Date` is a thin wrapper over a millisecond timestamp with timezone helpers stapled on. The API has many traps.

```js
new Date(2026, 0, 1);  // January 1, 2026 — months are 0-indexed
new Date(2026, 12, 1); // January 1, 2027 — overflow wraps
new Date('2026-05-24'); // parsed as UTC midnight
new Date('2026/05/24'); // parsed as local midnight
new Date('05/24/2026'); // depends on the engine and locale
```

`getDay()` returns the day of the week (0 = Sunday). `getDate()` returns the day of the month. Easy to swap by accident.

DST means a day isn't always 24 hours. Adding `24 * 60 * 60 * 1000` to a `Date` can land you on the same wall-clock time the next day, the hour before, or the hour after.

Use `Temporal` when you can. When you can't, use `date-fns` or `Luxon` and never compute timezone-sensitive arithmetic by hand.

## `JSON` quirks

- `JSON.parse` accepts only a strict subset of literals. No trailing commas, no comments, no `undefined`, no single quotes.
- `JSON.stringify(undefined)` returns `undefined`, not `'undefined'`.
- `undefined`, functions, and symbols inside objects are dropped silently; inside arrays they become `null`.
- `BigInt` throws.
- `NaN` and `Infinity` become `null`.
- `Date` becomes its ISO string — but parsing it back gives you a string, not a `Date`.

```js
JSON.stringify({ a: undefined, b: () => 1, c: Symbol() });
// '{}'

JSON.stringify([undefined, () => 1, Symbol()]);
// '[null,null,null]'

JSON.stringify({ d: new Date() });
// '{"d":"2026-05-24T12:00:00.000Z"}'
```

Use the `replacer` and `reviver` arguments to handle special types deliberately.

## Mutation gotchas

`Array.prototype.sort`, `reverse`, `splice`, `push`, `pop`, `shift`, `unshift`, `fill`, `copyWithin` all mutate. So do `Map.set`, `Set.add`, `Object.assign(target, ...)`.

```js
const xs = [3, 1, 2];
const sorted = xs.sort(); // mutates xs AND returns it
sorted === xs;            // true
```

Use the `to*` non-mutating variants when you don't want this.

`Object.freeze` is shallow. Nested objects can still be mutated.

```js
const cfg = Object.freeze({ db: { host: 'x' } });
cfg.db.host = 'y'; // silently allowed
```

## Spread is shallow

```js
const a = { x: 1, nested: { y: 2 } };
const b = { ...a };
b.nested === a.nested; // true — same reference
```

Same for `Object.assign`. Use `structuredClone` for a real deep copy.

## `typeof` quirks

```js
typeof null;         // 'object'
typeof [];           // 'object'
typeof function(){}; // 'function'
typeof NaN;          // 'number'
typeof undeclared;   // 'undefined' — doesn't throw
```

Use `Array.isArray`, `Number.isNaN`, `value === null`, etc. — `typeof` only helps for primitives, and even there it lies about `null`.

## Numeric edge cases

```js
parseInt('08');     // 8 — but historically was 0 in old browsers
parseInt('1.5e2');  // 1 — stops at the dot
Number('1.5e2');    // 150
parseFloat('0x10'); // 0 — stops at 'x'
Number('0x10');     // 16

Math.max();         // -Infinity
Math.min();         // Infinity
Math.max(...[]);    // -Infinity
```

Empty `Math.max`/`min` is a frequent off-by-one in reducers that should have used `arr.reduce((a, b) => Math.max(a, b))` or guarded the empty case.

## `for..in` on arrays

```js
const arr = [10, 20];
arr.foo = 'bar';
for (const k in arr) console.log(k); // '0', '1', 'foo'
```

`for..in` iterates string keys, including inherited enumerable ones. For arrays, always use `for..of`, `forEach`, or index-based loops.

## `==` coercion table — the worst pairs

```js
[] == false;       // true
[] == ![];         // true
'' == 0;           // true
'0' == false;      // true
null == 0;         // false
null == undefined; // true
```

Use `===`. The only legitimate `==` is `x == null` to mean "null or undefined".

## `delete` and array length

```js
const xs = [1, 2, 3];
delete xs[1];
xs;        // [1, <empty>, 3]
xs.length; // 3 — unchanged
xs[1];     // undefined
```

`delete` punches a hole rather than removing the element. Use `splice` or filter.

## Equality of `+0` and `-0`

```js
0 === -0;            // true
Object.is(0, -0);    // false
1 / -0;              // -Infinity
1 / 0;               // Infinity
```

`Object.is` is the right check when sign of zero or `NaN` matters (`Object.is(NaN, NaN)` is `true`).

## Implicit conversion in template literals

```js
`${[1, 2, 3]}`;        // '1,2,3'
`${{ a: 1 }}`;         // '[object Object]'
`${{ toString() { return 'hi'; } }}`; // 'hi'
```

Logging objects with template literals gives `[object Object]`. Use `JSON.stringify` or `console.log(obj)` directly.

## Common mistakes

- Comparing floats with `===`. Use a tolerance.
- Sorting numbers without a comparator.
- Storing money as `number`. Use minor units (cents) or a decimal library.
- Mutating an array returned from `arr.sort()` thinking it's a copy. It isn't.
- Trusting `new Date('YYYY-MM-DD')` to mean "local midnight". It's UTC.
- Spreading a deeply nested object and being surprised that mutations leak.
- Using `for..in` on arrays.
