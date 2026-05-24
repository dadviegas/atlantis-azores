JavaScript's built-in collections cover ordered sequences (`Array`, typed arrays), keyed associations (`Map`, `Object`), unique values (`Set`), and weakly-held variants (`WeakMap`, `WeakSet`, `WeakRef`). Picking the right one is mostly about key type, iteration order, mutability characteristics, and whether you need keys to be garbage-collectable.

## Array

A resizable, ordered list with integer keys. Backing storage is contiguous when the array is dense; once you create "holes" (`arr[100] = x` on a length-1 array), the engine downgrades it to a sparse representation that's slower.

```js
const xs = [1, 2, 3];
xs.push(4);              // mutates, returns new length
xs.toSorted((a, b) => b - a); // ES2023 — non-mutating sort
xs.toReversed();
xs.with(0, 99);          // copy with one element replaced
xs.at(-1);               // last element
```

The new `to*` variants (`toSorted`, `toReversed`, `toSpliced`, `with`) return a copy and are the preferred immutable-style operations.

| Operation | Mutating | Non-mutating |
| --- | --- | --- |
| sort | `sort` | `toSorted` |
| reverse | `reverse` | `toReversed` |
| splice | `splice` | `toSpliced` |
| set at index | `arr[i] = x` | `with(i, x)` |

## Map vs Object

| Feature | `Map` | Object |
| --- | --- | --- |
| Key types | any value | string, symbol |
| Iteration order | insertion | insertion (mostly) |
| Size | `map.size` | `Object.keys(o).length` |
| Default keys | none | inherits from `Object.prototype` |
| Iteration | `for..of` | `for..in`, `Object.keys/entries` |
| JSON-friendly | no | yes |
| Performance for frequent add/delete | better | worse |

Use `Map` for:

- Keys you don't control (user input, objects).
- Frequent insertion/deletion.
- Needing to iterate in insertion order without surprises.

Use a plain object for:

- Fixed, known-at-write-time keys.
- JSON serialisation.
- Record-shaped data.

```js
const counts = new Map();
for (const word of words) counts.set(word, (counts.get(word) ?? 0) + 1);
```

## Set

Unique values, insertion-ordered, any value type. ES2025 added set algebra methods:

```js
const a = new Set([1, 2, 3]);
const b = new Set([2, 3, 4]);

a.union(b);        // {1,2,3,4}
a.intersection(b); // {2,3}
a.difference(b);   // {1}
a.symmetricDifference(b); // {1,4}
a.isSubsetOf(b);   // false
a.isDisjointFrom(b); // false
```

These accept any object with a `size` getter and `has`/`keys` methods, not just other `Set`s.

## WeakMap and WeakSet

Keys must be objects (or unregistered symbols, in ES2023+). The collection does not prevent garbage collection of its keys, and it's not iterable — no `keys`, `values`, `entries`, or `size`.

Use them for *associating* metadata with objects you don't own:

```js
const handlers = new WeakMap();
function onClick(node, fn) {
  handlers.set(node, fn);
  node.addEventListener('click', fn);
}
// when `node` is removed and forgotten, the handler entry vanishes too
```

WeakMaps are the canonical implementation strategy for private state in libraries that pre-date `#private` fields.

## Typed arrays

Fixed-length views over a binary `ArrayBuffer`. Pick the type by the size and signedness you need; the buffer is the same shape underneath.

| View | Element type | Size |
| --- | --- | --- |
| `Int8Array` / `Uint8Array` / `Uint8ClampedArray` | int8 / uint8 | 1 |
| `Int16Array` / `Uint16Array` | int16 / uint16 | 2 |
| `Int32Array` / `Uint32Array` | int32 / uint32 | 4 |
| `Float16Array` (ES2025) | float16 | 2 |
| `Float32Array` / `Float64Array` | float32 / float64 | 4 / 8 |
| `BigInt64Array` / `BigUint64Array` | bigint | 8 |

```js
const buf = new ArrayBuffer(8);
const view = new DataView(buf);
view.setUint32(0, 0xdeadbeef, /* littleEndian */ false);
const f = new Float64Array(buf)[0];
```

Typed arrays don't grow, they don't have holes, and they're zero-initialised. They're the right choice for image data, audio samples, network buffers, and anything you'd reach for `Buffer` for in Node.

`Uint8ClampedArray` clamps writes outside 0-255 instead of wrapping — the right pick for canvas pixel data.

## Choosing

| You have | Reach for |
| --- | --- |
| Ordered list of homogeneous values | `Array` |
| Bytes / binary protocol | `Uint8Array` (or `Buffer` in Node) |
| Key → value, keys you can't predict | `Map` |
| Key → value, keys are well-known strings | object literal |
| Membership test | `Set` |
| Metadata keyed by an object you don't own | `WeakMap` |
| Marker on an object ("seen", "registered") | `WeakSet` |

## Iteration helpers

All keyed collections expose `keys()`, `values()`, `entries()`. Convert with `Array.from` or spread.

```js
const m = new Map([['a', 1], ['b', 2]]);
for (const [k, v] of m) console.log(k, v);
[...m.keys()];              // ['a', 'b']
Object.fromEntries(m);      // { a: 1, b: 2 }
```

## Common mistakes

- Using a plain object as a `Map` and then having a key collide with `__proto__` or `toString`. Either use `Map` or `Object.create(null)`.
- Iterating with `for..in` over an array. You'll get inherited properties and string keys, not values.
- Calling `arr.sort()` on numbers and getting lexicographic order (`[1, 10, 2]`). Always pass a comparator: `arr.sort((a, b) => a - b)`.
- Mutating an array while iterating it with `forEach`. The behavior is defined but rarely what you want.
- Treating typed arrays like regular arrays — they have no `push`, `pop`, `splice`. To grow, allocate a new buffer and copy.
- Holding a `WeakMap` value that itself references the key (cycle through the value side). Cycles defeat the weak reference because the value chain keeps the key reachable.
