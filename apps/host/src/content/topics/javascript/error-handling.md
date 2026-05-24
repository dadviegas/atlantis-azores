Errors in JavaScript are thrown values — usually but not always instances of `Error`. The control-flow primitives (`throw`, `try`/`catch`/`finally`) are simple; the rules that make error handling robust live in *what* you throw, *where* you catch, and how errors flow through async boundaries.

## `throw` and `try`/`catch`

```js
function parseInteger(s) {
  const n = Number(s);
  if (!Number.isInteger(n)) throw new TypeError(`not an int: ${s}`);
  return n;
}

try {
  parseInteger('1.5');
} catch (err) {
  if (err instanceof TypeError) console.warn(err.message);
  else throw err; // rethrow what you can't handle
}
```

`finally` runs whether or not an error was thrown — useful for releasing resources. Returning from `finally` overrides any prior return or throw, which is almost always a bug.

```js
function leak() {
  try { return 1; }
  finally { return 2; } // returns 2, swallows the 1 and any throw
}
```

## The `Error` family

| Constructor | Use for |
| --- | --- |
| `Error` | generic |
| `TypeError` | wrong type, calling a non-function |
| `RangeError` | argument outside legal range |
| `SyntaxError` | bad input to a parser (`JSON.parse`, `new Function`) |
| `ReferenceError` | undeclared identifier |
| `URIError` | malformed URI in `decodeURIComponent` etc. |
| `AggregateError` | multiple errors collected into one |

Always throw an `Error` (or subclass), never a string or plain object. Engines populate `stack` only on `Error` instances; `throw 'oops'` strips that information immediately.

## Custom error classes

```js
class HttpError extends Error {
  constructor(status, message, { cause } = {}) {
    super(message, { cause });
    this.name = 'HttpError';
    this.status = status;
  }
}

throw new HttpError(404, 'not found');
```

Setting `name` explicitly is a habit worth keeping — it's what shows up in `err.toString()` and most loggers. The `cause` option (ES2022) preserves the underlying error when you wrap.

```js
try { await db.query(sql); }
catch (cause) {
  throw new HttpError(500, 'database failure', { cause });
}
```

## Async errors

A thrown error inside an `async` function rejects the returned promise. `await` rethrows a rejection as a synchronous-looking throw.

```js
async function loadUser(id) {
  const res = await fetch(`/api/users/${id}`);
  if (!res.ok) throw new HttpError(res.status, await res.text());
  return res.json();
}

try {
  const user = await loadUser(1);
} catch (err) {
  // catches both network failures and the explicit throw
}
```

A promise that rejects with no `catch` handler attached anywhere by the time the microtask queue drains is an *unhandled rejection*. In Node this terminates the process by default. In the browser it fires a `window.unhandledrejection` event.

Hook it for observability:

```js
process.on('unhandledRejection', (err) => log.error('unhandled', err));
window.addEventListener('unhandledrejection', (e) => log.error('unhandled', e.reason));
```

## Errors across async boundaries

Errors thrown in `setTimeout`, `setInterval`, or event handlers are *not* caught by surrounding `try`/`catch` — they run on a fresh call stack. Promise-based equivalents are caught.

```js
try {
  setTimeout(() => { throw new Error('boom'); }, 0); // uncaught
} catch (err) {
  // never reached
}
```

Always wrap timer bodies in `try`/`catch` if you need recovery, or convert to a promise.

## AggregateError and `Promise.any`

When multiple operations fail simultaneously, `AggregateError` carries them all.

```js
try {
  await Promise.any([fetch(a), fetch(b), fetch(c)]);
} catch (err) {
  // err is AggregateError; err.errors is the list of individual failures
  for (const sub of err.errors) console.warn(sub);
}
```

You can throw it yourself when collecting errors:

```js
function validateAll(checks) {
  const errors = checks.filter(c => !c.ok).map(c => new Error(c.message));
  if (errors.length) throw new AggregateError(errors, 'validation failed');
}
```

## Error.cause and chains

`err.cause` (ES2022) attaches the underlying error. Modern formatters (`util.format`, browser devtools) print the chain automatically.

```js
function unwrap(err) {
  const chain = [];
  while (err) { chain.push(err); err = err.cause; }
  return chain;
}
```

## Result types vs throws

Throws cross arbitrary call depths but make control flow implicit. A `Result`-style return is explicit but viral. The pragmatic split most codebases land on:

- Throw for programmer errors and exceptional conditions (`ENOENT`, network failure, bug).
- Return a `{ ok, value, error }` shape for expected, recoverable outcomes that callers always need to branch on (validation, parsing user input).

## Common mistakes

- Throwing a string. You lose the stack trace and `instanceof Error` breaks everywhere downstream.
- Catching everything with `catch (e) { /* ignore */ }`. At minimum, log it.
- Catching, logging, then rethrowing in every layer — you end up with the same error logged five times. Decide who owns the log.
- Forgetting that `await` outside an `async` function or module is a syntax error in non-module scripts.
- Not handling rejection of a promise returned from a sync function — `fn().catch(...)` is required if you don't `await`.
- Confusing `Promise.all` (rejects on first failure) with `Promise.allSettled` (never rejects) when you want partial results.
