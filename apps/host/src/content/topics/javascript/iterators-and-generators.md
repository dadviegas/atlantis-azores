Iteration in JavaScript is protocol-based. Any object that follows the iterator protocol can be used with `for..of`, spread, destructuring, `Array.from`, `Map`/`Set` constructors, `Promise.all`, and many other APIs. Generators are a syntax for writing iterators by hand without the boilerplate.

## The protocols

An *iterable* has a `[Symbol.iterator]()` method that returns an *iterator*. An iterator has a `next()` method that returns `{ value, done }`.

```js
const range = {
  from: 1, to: 3,
  [Symbol.iterator]() {
    let n = this.from;
    return {
      next: () => n <= this.to
        ? { value: n++, done: false }
        : { value: undefined, done: true },
    };
  },
};

for (const n of range) console.log(n); // 1, 2, 3
[...range];                              // [1, 2, 3]
Array.from(range, x => x * 2);           // [2, 4, 6]
```

Built-in iterables include `Array`, `String`, `Map`, `Set`, `TypedArray`, `arguments`, NodeLists, and generators.

## `for..of` vs `for..in`

| Form | Iterates | Use for |
| --- | --- | --- |
| `for (const x of iter)` | values from the iterable protocol | arrays, maps, sets, strings |
| `for (const k in obj)` | enumerable string keys (own + inherited) | rarely — prefer `Object.keys/entries` |
| `arr.forEach(fn)` | values + index | when you don't need `await`/`break` |

`for..of` plays well with `await`, `break`, `continue`, and `return`. `forEach` doesn't — `break` is impossible and `await` inside doesn't pause the loop.

## Generators

A `function*` returns an iterator on each call. `yield` pauses execution and exposes a value; the next `next()` resumes after the `yield`.

```js
function* fib() {
  let [a, b] = [0, 1];
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

const g = fib();
g.next().value; // 0
g.next().value; // 1
g.next().value; // 1
```

Generators are inherently lazy — they only compute the next value when asked. `take` the first N with a helper or with the new iterator helpers.

### Delegating with `yield*`

```js
function* letters() { yield 'a'; yield 'b'; }
function* mix() { yield 1; yield* letters(); yield 2; }
[...mix()]; // [1, 'a', 'b', 2]
```

`yield*` forwards `next`, `return`, and `throw` to the inner iterator. Useful for building tree traversals.

### Two-way communication

`next(value)` sends a value *into* the generator — it becomes the result of the paused `yield` expression.

```js
function* echo() {
  const a = yield 'first?';
  const b = yield `you said ${a}`;
  return `and ${b}`;
}

const g = echo();
g.next();         // { value: 'first?', done: false }
g.next('hello');  // { value: 'you said hello', done: false }
g.next('bye');    // { value: 'and bye', done: true }
```

Generators can also be terminated externally with `g.return(value)` or made to throw with `g.throw(err)`.

## Iterator helpers (ES2025)

Iterator prototypes now have lazy `map`, `filter`, `take`, `drop`, `flatMap`, `reduce`, `toArray`, `some`, `every`, `find`, `forEach`.

```js
function* naturals() { for (let i = 1; ; i++) yield i; }

const squares = naturals()
  .filter(n => n % 2 === 1)
  .map(n => n * n)
  .take(5)
  .toArray();
// [1, 9, 25, 49, 81]
```

This is fundamentally different from chaining `Array` methods — no intermediate arrays are allocated. Each helper pulls one value at a time through the pipeline.

## Async iterators

`Symbol.asyncIterator` is the async counterpart. `next()` returns a promise of `{ value, done }`. `for await..of` consumes them.

```js
async function* lines(stream) {
  let buf = '';
  for await (const chunk of stream) {
    buf += chunk;
    const parts = buf.split('\n');
    buf = parts.pop();
    for (const line of parts) yield line;
  }
  if (buf) yield buf;
}

for await (const line of lines(process.stdin)) {
  console.log(line.toUpperCase());
}
```

Node streams, `ReadableStream`, and observables-as-async-iterables all expose this protocol. `for await..of` handles backpressure naturally — the producer can't get ahead of the consumer.

## Generators as state machines

Generators express step-by-step processes cleanly — parsers, animations, retry logic.

```js
function* retry(times) {
  for (let i = 0; i < times; i++) {
    const err = yield i;
    if (!err) return;
  }
  throw new Error('exhausted');
}
```

## Common mistakes

- Calling `[Symbol.iterator]()` to "get the values" instead of iterating. You get an iterator, not an array. Use `[...iter]` or `Array.from`.
- Reusing an iterator after a `break`. Most iterators are single-pass — once exhausted or aborted, they yield `{ done: true }` forever.
- Forgetting `await` in `for await..of` — the loop variable is the resolved value, not a promise, only if you used `for await`. Plain `for..of` over async iterators yields promises.
- Generators that allocate per-step in a hot loop. The overhead is real; benchmark against a hand-written iterator if it matters.
- Building a generator pipeline and then calling `toArray()` immediately — you've thrown away the laziness benefit.
