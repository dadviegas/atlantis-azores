The event loop is the scheduler that lets a single-threaded language do asynchronous work. It drains the call stack, processes queued tasks one at a time, and yields to rendering and I/O in between. Knowing the order in which the queues drain explains why a `setTimeout(fn, 0)` can fire after a `Promise.resolve().then(fn)` even though both were scheduled "immediately".

## The pieces

- **Call stack** — synchronous execution. A function call pushes a frame; return pops it. The stack must be empty before the loop picks the next task.
- **Task queue (macrotasks)** — `setTimeout`, `setInterval`, `setImmediate` (Node), I/O completions, message events, UI events.
- **Microtask queue** — promise callbacks (`then`, `catch`, `finally`), `queueMicrotask`, `MutationObserver`.
- **Render step** (browser only) — style, layout, paint. Interleaved with the task loop.

The loop's high-level cycle:

1. Pop one task from the task queue and run it to completion.
2. Drain the entire microtask queue.
3. (Browser) If a render is due, run the render steps.
4. Repeat.

Microtasks drain *between* tasks, not in parallel with them — and a microtask that schedules another microtask runs that one too before yielding.

## Ordering example

```js
console.log('1');

setTimeout(() => console.log('2'), 0);

Promise.resolve().then(() => console.log('3'))
                 .then(() => console.log('4'));

queueMicrotask(() => console.log('5'));

console.log('6');
```

Output: `1, 6, 3, 5, 4, 2`. The script itself is a task; once it finishes, microtasks drain (in queue order: the first `then`, then `queueMicrotask`, then the second `then`), and only then the `setTimeout`.

## Microtask starvation

A microtask that keeps queueing microtasks can block the UI indefinitely — rendering never gets a chance because the microtask queue never empties.

```js
function spin() {
  queueMicrotask(spin);
}
spin(); // browser hangs
```

`setTimeout(spin, 0)` is safe because each tick is a separate task and rendering can interleave.

## `setTimeout(fn, 0)` isn't 0

Browsers clamp nested timers to 4ms after a few levels of nesting. Node has its own minimum. If you actually need "as soon as possible after this stack drains", use `queueMicrotask` (microtask) or `setImmediate` (Node task) or `MessageChannel`-based scheduling (browser).

```js
// Browser zero-delay task
const { port1, port2 } = new MessageChannel();
port1.onmessage = () => doWork();
port2.postMessage(null);
```

## Rendering and the frame budget

A browser tries to paint at the display refresh rate (typically 60Hz — 16.7ms per frame). Within a frame:

1. Tasks run until a render is due.
2. `requestAnimationFrame` callbacks run.
3. Style/layout/paint.
4. `requestIdleCallback` runs if there's spare time.

Long-running synchronous work blocks rendering — the page is unresponsive until the stack clears. Break work into chunks and yield between them:

```js
async function chunked(items, work) {
  for (let i = 0; i < items.length; i++) {
    work(items[i]);
    if (i % 100 === 0) await new Promise(r => setTimeout(r));
  }
}
```

`scheduler.yield()` (Prioritized Task Scheduling) is the modern dedicated API, available in Chromium.

## Node specifics

Node's loop has more phases than the browser. Most matter only for low-level tuning, but two are worth knowing:

| Phase | What it runs |
| --- | --- |
| Timers | expired `setTimeout`/`setInterval` callbacks |
| Pending callbacks | some system operations |
| Poll | I/O callbacks; blocks here when idle |
| Check | `setImmediate` callbacks |
| Close | `close` event callbacks |

`process.nextTick` is *not* a microtask in spec terms — it's Node's own queue that drains before microtasks. Both drain between every phase.

```js
setImmediate(() => console.log('immediate'));
setTimeout(() => console.log('timeout'), 0);
Promise.resolve().then(() => console.log('promise'));
process.nextTick(() => console.log('nextTick'));
```

Output (typically): `nextTick, promise, timeout, immediate`.

## The stack matters too

Recursive code that doesn't terminate blows the stack with `RangeError: Maximum call stack size exceeded`. ES has no general tail-call optimization in mainstream engines (Safari is the exception). Convert to iteration or trampoline.

```js
function trampoline(fn) {
  return (...args) => {
    let result = fn(...args);
    while (typeof result === 'function') result = result();
    return result;
  };
}
```

## Common mistakes

- Assuming `setTimeout(fn, 0)` runs before any promise that's already resolved. It doesn't.
- Expecting `Promise.resolve().then(...)` to yield to rendering. It doesn't — microtasks drain before paint.
- Blocking the main thread with a tight CPU loop and wondering why animations stutter. Move heavy work to a Worker.
- Using `process.nextTick` for "later" in Node when you actually wanted `setImmediate` — `nextTick` can starve I/O.
- Trying to "await" a microtask drain. The closest you have is `await Promise.resolve()` — and even that only yields one microtask cycle.
- Setting up an interval inside a `then` handler in a long-running app and never clearing it.
