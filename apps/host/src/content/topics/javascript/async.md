JavaScript handles concurrency through non-blocking I/O and a single-threaded event loop. The three layers — callbacks, promises, `async`/`await` — are not alternatives; `async`/`await` is built on promises, which were built to tame callbacks. Knowing all three is necessary because old APIs and new APIs coexist in every codebase.

## Callbacks

The original async pattern. The convention in Node is `(err, result)` — error first.

```js
import { readFile } from 'node:fs';

readFile('config.json', 'utf8', (err, data) => {
  if (err) return console.error(err);
  console.log(data);
});
```

Callbacks compose badly. Nesting four levels deep is "callback hell"; the harder issue is error propagation — you have to remember to check `err` in every callback, and a thrown synchronous error inside the callback won't reach the caller.

## Promises

A promise is a placeholder for a future value. It's in one of three states: pending, fulfilled, or rejected. Once settled, it never changes.

```js
const p = fetch('/api/user');
p.then(res => res.json())
 .then(user => console.log(user))
 .catch(err => console.error(err))
 .finally(() => console.log('done'));
```

A `then` handler can return a value or another promise; the chain flattens it. `catch` is sugar for `then(undefined, fn)`. `finally` runs regardless and does not change the resolved value.

### Constructing promises

You should rarely use the constructor — it's there for wrapping callback APIs.

```js
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const readFileP = (path) =>
  new Promise((resolve, reject) =>
    readFile(path, 'utf8', (err, data) => err ? reject(err) : resolve(data))
  );
```

`util.promisify` in Node automates this for `(err, result)` callbacks.

## async / await

Syntactic sugar over promise chains. An `async` function always returns a promise; `await` suspends until the awaited value settles.

```js
async function loadUser(id) {
  const res = await fetch(`/api/users/${id}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
```

`try`/`catch` works for async errors:

```js
try {
  const user = await loadUser(1);
} catch (err) {
  // covers fetch failures, !ok throws, and json parse errors
}
```

## Parallel vs serial

`await` in a loop runs serially. To run in parallel, start the work first, await later.

```js
// serial — N round trips back-to-back
for (const id of ids) {
  results.push(await loadUser(id));
}

// parallel — all in flight, wait for the slowest
const results = await Promise.all(ids.map(loadUser));
```

| Combinator | Resolves when | Rejects when |
| --- | --- | --- |
| `Promise.all` | all fulfill | first rejection |
| `Promise.allSettled` | all settle | never (returns status objects) |
| `Promise.race` | first to settle | first to reject (if first) |
| `Promise.any` | first to fulfill | all reject (with `AggregateError`) |

`Promise.allSettled` is the right tool when one failure shouldn't abort the others.

```js
const results = await Promise.allSettled(ids.map(loadUser));
const ok = results.filter(r => r.status === 'fulfilled').map(r => r.value);
```

## Concurrency control

`Promise.all` fires everything at once. For rate-limited APIs you need a worker pool.

```js
async function pool(items, limit, worker) {
  const results = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: limit }, async () => {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await worker(items[idx]);
    }
  }));
  return results;
}
```

## Cancellation with AbortController

There is no built-in promise cancellation. The convention is `AbortSignal`:

```js
const ac = new AbortController();
setTimeout(() => ac.abort(), 5000);

try {
  const res = await fetch(url, { signal: ac.signal });
} catch (err) {
  if (err.name === 'AbortError') return;
  throw err;
}
```

Newer APIs (`fetch`, `addEventListener`, `setTimeout` in Node) accept an `AbortSignal`. Build your own async functions to accept one too.

## Error propagation

Throwing inside an `async` function rejects the returned promise. An unhandled rejection emits a process warning and, in Node, will eventually crash the process (default since Node 15).

```js
async function risky() { throw new Error('boom'); }
risky(); // unhandled rejection — listen for it or await it
```

Synchronous throws in a `new Promise` executor are caught and become rejections. Throws in a `setTimeout` callback are not — they're synchronous errors on the next tick.

## Common mistakes

- Forgetting to `await` a promise. The function returns a pending promise and the next line runs immediately.
- Wrapping a promise in `new Promise((resolve) => ...)` — the "promise constructor antipattern". Just return the inner promise.
- Awaiting in a loop when the iterations are independent.
- Catching errors at the wrong layer and turning them into silent successes (`.catch(() => null)` in a place that needed to propagate).
- Using `Promise.all` on user input — one bad request rejects the whole batch. Use `allSettled`.
- Forgetting that `async` functions always return a promise — returning a value inside one wraps it.
