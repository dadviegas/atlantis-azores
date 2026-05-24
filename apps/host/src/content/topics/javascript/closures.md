A closure is a function bundled with the lexical environment in which it was defined. When the function runs, it can still read and write variables from that environment even if the outer call has long since returned. Closures are the foundation for most non-trivial JavaScript patterns — module privacy, partial application, memoization, hooks.

## Lexical scope

Scope is determined by *where* a function is written, not where it's called. The inner function captures references to bindings, not snapshots of their values.

```js
function makeCounter() {
  let count = 0;
  return () => ++count;
}

const next = makeCounter();
next(); // 1
next(); // 2
```

`count` survives because `next` still holds a reference to the environment that owns it. The engine cannot collect it.

## Multiple closures over the same scope

Every function defined inside the same call shares one environment record. They see each other's mutations.

```js
function makeAccount(balance) {
  return {
    deposit: (n) => (balance += n),
    withdraw: (n) => (balance -= n),
    get: () => balance,
  };
}

const a = makeAccount(100);
a.deposit(50);
a.get(); // 150
```

This is real encapsulation — `balance` cannot be read or written from the outside.

## Loops and closures

The canonical bug:

```js
const fns = [];
for (var i = 0; i < 3; i++) fns.push(() => i);
fns.map(f => f()); // [3, 3, 3] — all closures share one `i`
```

Fixed with `let`, which creates a fresh binding per iteration:

```js
for (let i = 0; i < 3; i++) fns.push(() => i);
```

Or with an IIFE that captures the current value:

```js
for (var i = 0; i < 3; i++) {
  ((j) => fns.push(() => j))(i);
}
```

## Common patterns

### Module / private state

```js
const store = (() => {
  const data = new Map();
  return {
    set: (k, v) => data.set(k, v),
    get: (k) => data.get(k),
  };
})();
```

### Partial application

```js
const partial = (fn, ...preset) => (...rest) => fn(...preset, ...rest);
const greet = (greeting, name) => `${greeting}, ${name}`;
const hi = partial(greet, 'Hi');
hi('Ada'); // 'Hi, Ada'
```

### Memoization

```js
const memo = (fn) => {
  const cache = new Map();
  return (key) => {
    if (cache.has(key)) return cache.get(key);
    const value = fn(key);
    cache.set(key, value);
    return value;
  };
};
```

### Debounce

```js
const debounce = (fn, ms) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
};
```

`timer` is private to each debounced function — exactly what you want.

## Memory implications

A closure keeps its entire enclosing environment alive, not just the variables it references. Most engines optimize away unused captures, but you cannot rely on it — especially across module or transpile boundaries.

```js
function attach(node) {
  const huge = new Array(1_000_000).fill('x');
  const small = node.id;
  node.onclick = () => console.log(small);
  // `huge` may stay alive as long as `onclick` does, depending on the engine
}
```

The fix is to scope expensive data narrowly:

```js
function attach(node) {
  const small = (() => {
    const huge = new Array(1_000_000).fill('x');
    return node.id; // huge goes out of scope here
  })();
  node.onclick = () => console.log(small);
}
```

## Closures in async code

Async callbacks capture the environment as it exists at *definition* time. The variables can keep mutating between definition and invocation.

```js
async function process(items) {
  for (const item of items) {
    setTimeout(() => console.log(item), 10);
  }
}
```

This logs each `item` correctly because `for..of` produces a fresh `item` binding per iteration — the same fix as the `for (let i ...)` loop.

## Common mistakes

- Capturing a loop variable declared with `var` and expecting per-iteration values.
- Building a "private" field that's only private until someone serialises the closure with `toString` and reads the source. Use `#private` fields if you need real privacy enforced by the language.
- Holding references to DOM nodes inside long-lived closures — a classic source of detached-DOM leaks.
- Building closure-heavy hot paths when a plain function plus an explicit argument would do the same job with less allocation.
