JavaScript engines manage memory automatically with a tracing garbage collector. Values are reachable if there's a path of references from a root (the call stack, globals, active closures, the DOM); unreachable values are eventually freed. Leaks happen when something stays reachable that you've stopped caring about — not because GC failed, but because GC works as specified.

## Reachability

Roots include:

- The current call stack (locals, parameters, temporaries).
- The global object / module-scoped bindings.
- Live DOM nodes (in the browser) and what they reference (event listeners, expando properties).
- Any closure that's pending in a queue (microtask, timer, event listener, promise reaction).
- Internal slots of active workers, sockets, etc.

A value is reclaimable when no such path reaches it. Cycles among unreachable objects are not a problem for tracing collectors — only mark-sweep or mark-compact's reachability matters, not reference counting.

## Generational collection

V8 and SpiderMonkey use generational collectors built on the observation that most objects die young. Memory is split into:

- **Young generation (nursery)** — small, collected often with a fast copying collector. Survivors get promoted.
- **Old generation** — collected less often with a mark-sweep/compact cycle.

Implications:

- Short-lived allocations are cheap. Reusing buffers to "save GC" is often a premature optimization.
- Long-lived objects that briefly reference young objects (e.g. a cache holding the latest request) prolong the young generation's work; engines use write barriers to track those references.
- Big spike allocations stress the old generation. Streaming data through small buffers is friendlier than building one giant string.

## Common leaks

### Forgotten timers

```js
// leaks `bigState` for the lifetime of the page
const id = setInterval(() => check(bigState), 1000);
// fix: clearInterval(id) when no longer needed
```

### Listeners on objects you don't unmount

```js
window.addEventListener('resize', onResize);
// fix: removeEventListener, or pass { signal: ac.signal } and abort
```

The `AbortSignal` form is cleanest because one abort cleans up many subscriptions at once.

```js
const ac = new AbortController();
window.addEventListener('resize', onResize, { signal: ac.signal });
window.addEventListener('scroll', onScroll, { signal: ac.signal });
// later
ac.abort();
```

### Detached DOM

A removed DOM node that's still referenced by JS lives on in memory, taking its children with it.

```js
let cache = document.querySelector('.toolbar');
document.body.removeChild(cache);
// cache (and the subtree) is alive until you null `cache`
```

DevTools' "Detached HTMLDivElement" entries in a heap snapshot are exactly this.

### Closures capturing more than they need

```js
function init() {
  const huge = loadBigBlob();
  const id = huge.id;
  return () => log(id); // many engines retain `huge` because of `huge.id`
}
```

Engines try to optimise, but the safest fix is to narrow the capture explicitly:

```js
function init() {
  const id = (() => loadBigBlob().id)();
  return () => log(id);
}
```

### Global caches with no eviction

A `Map` keyed by user ID grows forever in a long-running server. Use an LRU, a `WeakMap` keyed by request context, or a TTL.

## WeakRef

`WeakRef` lets you hold a reference that does *not* prevent collection. Call `.deref()` to get the value, or `undefined` if it's gone.

```js
class Cache {
  #map = new Map(); // string → WeakRef<Result>
  get(key) { return this.#map.get(key)?.deref(); }
  set(key, value) { this.#map.set(key, new WeakRef(value)); }
}
```

Caveat: the spec gives engines wide latitude on *when* a `WeakRef` is cleared. Two `deref()` calls in the same turn return the same value; across turns, anything can change. Use sparingly and never as the only reference to data you care about.

## FinalizationRegistry

Registers a callback to run *after* a registered object is collected. The held value is passed to the callback so you can clean up associated external resources.

```js
const registry = new FinalizationRegistry((handle) => {
  closeNativeResource(handle);
});

function open() {
  const handle = openNativeResource();
  const wrapper = { handle };
  registry.register(wrapper, handle);
  return wrapper;
}
```

Caveats:

- The callback is best-effort. Engines may not run it at all (e.g. at process exit).
- It can run on any turn. Don't rely on ordering.
- Don't reach the registered object from inside the callback — by definition it no longer exists.

Treat `FinalizationRegistry` as a backstop. Real resource management still belongs in `try`/`finally` or `using` (ES2026).

## Explicit resource management (`using`)

```js
{
  using file = openFile('data.txt');
  process(file);
} // file[Symbol.dispose]() runs here, even if process threw
```

`await using` for async disposal. This removes a whole class of "forgot to close" leaks.

## Measuring

- Browser DevTools: Memory tab. Take a heap snapshot, exercise the suspect flow, take another, diff them. Look for "Retained Size" outliers.
- Node: `--inspect` and Chrome DevTools; `process.memoryUsage()` for coarse numbers; `--heapsnapshot-signal=SIGUSR2` to capture on demand in production.
- `performance.measureUserAgentSpecificMemory()` for total memory of a same-origin page (browser).

## Common mistakes

- Assuming GC will fix what reachability won't. If a reference exists, GC will not collect.
- Using `WeakRef` as a cache and being surprised that the cached value is gone "too soon" or "too late".
- Storing large objects on the global scope "temporarily" for debugging and forgetting them.
- Adding listeners in components without removing them on teardown. The component object is collected; its handler isn't, and the handler still pins `this`.
- Treating `delete obj.x` as a perf win. It deoptimises object shape and is slower than setting `obj.x = undefined` in many cases. Reach for a `Map` if entries actually come and go.
- Profiling memory in dev mode with hot module reload on — every reload duplicates code and inflates the heap.
