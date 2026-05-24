JavaScript is a single-threaded, dynamically typed language with first-class functions, prototypal inheritance, and an event-driven concurrency model. The language is standardised as ECMAScript by TC39, which ships a new edition every June; engines like V8, SpiderMonkey, and JavaScriptCore land features incrementally well before they're stamped into a spec. Runtimes (browsers, Node, Deno, Bun, workerd) add their own host APIs on top of the same core language.

## Runtime model in one breath

A JS program runs on a single thread driven by an event loop. Synchronous code executes to completion on the call stack; async work parks itself in host-provided queues (tasks, microtasks) and resumes when the stack drains. There is no shared-memory multithreading by default — workers and `SharedArrayBuffer` exist but are opt-in.

## Spec landscape (2026)

ES2025 is the current edition. Features that matured in the last two cycles include `Promise.try`, `Set` methods (`union`, `intersection`, `difference`), `Iterator` helpers (`map`, `filter`, `take`), `Float16Array`, and regex `/v` flag set notation. Decorators, Records & Tuples, and Temporal are at varying stages — Temporal has shipped in most engines.

## Topic map

- **Variables and scope** — `var`/`let`/`const`, hoisting, the temporal dead zone, block semantics.
- **Types and coercion** — primitives vs objects, `==` vs `===`, falsy table, `NaN`, `BigInt`.
- **Closures** — lexical capture, module patterns, memory footprint.
- **`this` and binding** — call sites, `bind`/`call`/`apply`, arrow functions, class methods.
- **Prototypes and inheritance** — the chain, `Object.create`, what `class` desugars to.
- **Classes** — modern syntax: `#private`, `static`, `extends`, `super`, accessors.
- **Async** — callbacks, promises, `async`/`await`, parallel vs serial, cancellation.
- **Event loop** — stack, macrotasks, microtasks, rendering, starvation.
- **Iterators and generators** — protocols, `for..of`, lazy sequences, async iteration.
- **Modules** — ESM vs CJS, named/default exports, dynamic `import()`, tree shaking.
- **Error handling** — `throw`, `try`/`catch`, `Error` subclasses, async errors, `AggregateError`.
- **Collections** — `Array`, `Map`, `Set`, `WeakMap`/`WeakSet`, typed arrays.
- **Memory and GC** — reachability, generational collection, leaks, `WeakRef`.
- **Modern features** — recent ES additions worth knowing.
- **Pitfalls** — floating point, `sort` default, `Date`, `JSON`, mutation traps.

## How to read these notes

Examples are runnable in any modern engine unless flagged otherwise. Where behaviour differs between Node and the browser, that's called out inline. Nothing here assumes a build step — TypeScript, JSX, and bundler-specific behaviour are covered elsewhere.
