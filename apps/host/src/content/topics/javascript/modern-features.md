A grab bag of features that have shipped across ES2022 through ES2025. None of these are exotic anymore — they all work in current Node, evergreen browsers, and Bun without flags. Reach for them instead of polyfills or hand-rolled equivalents.

## `structuredClone`

Deep clone that handles circular references, typed arrays, Maps, Sets, Dates, RegExps, and most built-ins. Does not handle functions, DOM nodes, or class instances (the clone is a plain object).

```js
const original = { a: 1, b: [1, 2], d: new Date(), m: new Map([['k', 'v']]) };
original.self = original;

const copy = structuredClone(original);
copy.self === copy;       // true — cycle preserved
copy.m instanceof Map;    // true
```

Replaces `JSON.parse(JSON.stringify(x))` for almost every use; it's also significantly faster.

You can transfer ownership of `ArrayBuffer`s instead of copying:

```js
const buf = new ArrayBuffer(1024);
const moved = structuredClone(buf, { transfer: [buf] });
// buf is now detached (byteLength === 0)
```

## `Array.prototype.at`

Negative index access without the `arr[arr.length - 1]` dance.

```js
[1, 2, 3].at(-1); // 3
'hello'.at(-1);   // 'o'
```

Same shape on `String` and typed arrays.

## `Object.hasOwn`

Replacement for `Object.prototype.hasOwnProperty.call(obj, key)` — safer because `obj` might shadow `hasOwnProperty` or have `null` prototype.

```js
Object.hasOwn({ a: 1 }, 'a');                // true
Object.hasOwn(Object.create(null), 'a');     // false (no throw)
```

## Top-level `await`

In ES modules only. The module's evaluation becomes the awaited promise; importers wait.

```js
// db.js
export const db = await connect(process.env.DATABASE_URL);
```

Use sparingly — every importer pays the wait cost on startup, and it can serialize module graphs that would otherwise initialise in parallel.

## Logical assignment

```js
a ||= b;   // a = a || b
a ??= b;   // a = a ?? b   (only assigns when a is null/undefined)
a &&= b;   // a = a && b   (only assigns when a is truthy)
```

```js
config.timeout ??= 5000;       // set default if missing
cache[key] ??= compute(key);    // memoise in place
```

## `Error.cause`

Wrap an underlying error without losing its stack.

```js
try { await fs.readFile(path); }
catch (cause) { throw new Error(`failed to load ${path}`, { cause }); }
```

## `Promise.withResolvers`

Get the promise and its `resolve`/`reject` functions in one call, useful for deferred patterns without a manual closure.

```js
const { promise, resolve, reject } = Promise.withResolvers();
emitter.once('done', resolve);
emitter.once('error', reject);
return promise;
```

## `Promise.try`

Calls a function and wraps its return value (or thrown error) in a promise — uniformly handling sync, async, and throwing functions.

```js
Promise.try(() => maybeAsync())
  .then(handle)
  .catch(report);
```

## Set methods (ES2025)

Full set algebra on `Set`. Each takes any "set-like" object (has `size`, `has`, `keys()`).

```js
const tags = new Set(['js', 'ts', 'css']);
tags.intersection(['ts', 'html']);   // {'ts'}
tags.difference(new Set(['css']));    // {'js', 'ts'}
tags.isSupersetOf(new Set(['js']));   // true
```

## Iterator helpers (ES2025)

Lazy methods on any iterator. No intermediate arrays.

```js
function* lines() { /* ... */ }

const heads = lines()
  .filter(l => !l.startsWith('#'))
  .map(JSON.parse)
  .take(100)
  .toArray();
```

## `Object.groupBy` and `Map.groupBy`

```js
const items = [{ k: 'a', v: 1 }, { k: 'b', v: 2 }, { k: 'a', v: 3 }];

Object.groupBy(items, i => i.k);
// { a: [{k:'a',v:1},{k:'a',v:3}], b: [{k:'b',v:2}] }

Map.groupBy(items, i => i.k); // same but keyed by any value
```

## Regex `/v` flag and set notation

Stronger Unicode handling, set operations inside character classes.

```js
/[\p{Script=Greek}--[\p{Letter}]]/v;   // Greek non-letters
/[[a-z]&&[\p{ASCII}]]/v;                // intersection
```

## Array `to*` variants (ES2023)

Non-mutating versions of `sort`, `reverse`, `splice`, plus `with(i, x)` to copy with one element replaced.

```js
const xs = [3, 1, 2];
const sorted = xs.toSorted();   // [1, 2, 3], xs unchanged
const updated = xs.with(0, 99); // [99, 1, 2]
```

## Array `findLast` / `findLastIndex`

```js
[1, 2, 3, 4].findLast(n => n % 2);     // 3
[1, 2, 3, 4].findLastIndex(n => n % 2); // 2
```

## Hashbangs in modules

A leading `#!` line is now permitted at the start of a JS source file — the spec catches up with the Node convention.

```js
#!/usr/bin/env node
import { run } from './cli.js';
run(process.argv.slice(2));
```

## Symbols as WeakMap keys (ES2023)

Unregistered symbols (i.e. created with `Symbol(...)`, not `Symbol.for(...)`) can now be used as `WeakMap`/`WeakSet`/`WeakRef`/`FinalizationRegistry` keys.

```js
const id = Symbol('session');
const sessions = new WeakMap();
sessions.set(id, { user: 'ada' });
```

## Temporal (stage 3, shipping)

Modern date/time API that replaces the broken `Date`. Already available in Firefox; Chromium and Safari are landing it.

```js
const now = Temporal.Now.zonedDateTimeISO('Europe/Lisbon');
now.add({ days: 7 });                    // a week from now
Temporal.PlainDate.from('2026-05-24').dayOfWeek; // 7 (Sunday)
```

If you're starting new date code today, Temporal is what you want. For the next year or so, you'll still see `Date` in libraries you can't replace — pick the smallest possible adapter at the boundary.

## Common mistakes

- Reaching for `JSON.parse(JSON.stringify(x))` out of habit. `structuredClone` is faster, safer, and supports types JSON doesn't.
- Using `||=` for default config when the field can legitimately be `0`, `''`, or `false`. Use `??=`.
- Calling `Object.groupBy` and expecting a `Map`. It returns a plain object; use `Map.groupBy` if keys aren't strings.
- Top-level `await` on the import-graph hot path. It blocks every importer.
- Forgetting that iterator helpers consume the iterator they're called on. After `.take(5).toArray()`, the original iterator is exhausted.
