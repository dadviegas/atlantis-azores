JavaScript has two module systems in active use: ECMAScript Modules (ESM) — the standard — and CommonJS (CJS) — Node's original system. New code should use ESM. Older code, especially in Node, still uses CJS, and interop between the two has sharp edges worth knowing.

## ESM at a glance

```js
// math.js
export const add = (a, b) => a + b;
export const sub = (a, b) => a - b;
export default function mul(a, b) { return a * b; }

// app.js
import mul, { add, sub } from './math.js';
import * as math from './math.js';
import { add as plus } from './math.js';
```

Key properties:

- **Static** — imports and exports are resolved at parse time. You can't conditionally `import` at the top level; use `import()` for that.
- **Live bindings** — importers see the latest value of an exported binding, not a snapshot.
- **Strict mode** — automatic.
- **Module scope** — top-level `let`, `const`, and `var` do not touch `globalThis`.
- **Top-level `await`** — supported. The module's evaluation is the awaited promise; importers wait for it.

```js
// config.js
export const config = await fetch('/config.json').then(r => r.json());

// app.js
import { config } from './config.js'; // waits for fetch
```

## CommonJS

```js
// math.js
const add = (a, b) => a + b;
module.exports = { add };
module.exports.sub = (a, b) => a - b;

// app.js
const { add, sub } = require('./math.js');
```

- `require` is **synchronous**, blocking I/O.
- `module.exports` is a single object — reassigning it replaces the entire export.
- Each module gets `require`, `module`, `exports`, `__dirname`, `__filename` as locals.
- No live bindings — `require` returns the value of `module.exports` at the moment the call resolves.

## ESM vs CJS

| Aspect | ESM | CJS |
| --- | --- | --- |
| Resolution | static, async | dynamic, sync |
| Mode | strict | sloppy by default |
| `this` at top level | `undefined` | `module.exports` |
| Bindings | live, read-only | value copy |
| File extension | required in spec ESM | optional |
| Top-level await | yes | no |
| Tree-shakable | yes | rarely |
| `import.meta` | yes | no — use `__filename` etc. |

## Which one am I in?

In Node:

- `.mjs` → ESM. `.cjs` → CJS. `.js` → depends on the nearest `package.json` `"type"` field (`"module"` → ESM, anything else → CJS).
- In ESM you must include the file extension: `import './util.js'`, not `import './util'`.

In the browser:

- `<script type="module">` is ESM. Plain `<script>` is a classic script with global scope.
- Bundlers usually normalize everything to ESM in their output regardless of source.

## Interop

ESM can import CJS:

```js
import pkg from 'cjs-pkg';            // pkg is module.exports
import { x } from 'cjs-pkg';          // works if Node detects named exports statically
```

CJS importing ESM is async — `require('esm-pkg')` works in recent Node, but only for synchronous ESM (no top-level await).

The safest pattern in a library you publish: ship both, with `"exports"` in `package.json`.

```json
{
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  }
}
```

## Dynamic import

`import()` returns a promise that resolves to the module namespace. Works in ESM and CJS, in any context (function body, conditional, etc.).

```js
async function openSettings() {
  const { Settings } = await import('./settings.js');
  Settings.open();
}
```

Bundlers use `import()` as a code-splitting boundary — each `import()` becomes a separate chunk that loads on demand.

## Tree shaking

Tree shaking removes unused exports at bundle time. It depends on:

- **Static structure** — ESM's static imports allow analysis; CJS's dynamic `require` mostly defeats it.
- **No side effects** — the bundler must trust that removing an unused export doesn't lose work. Mark with `"sideEffects": false` in `package.json` (or list the exceptions).
- **Pure helpers** — top-level statements that call functions are assumed to have side effects unless annotated with `/*#__PURE__*/`.

```js
// keeps everything — top-level call is a side effect
const log = createLogger();
export const a = () => log('a');

// tree-shakable
export const a = () => createLogger()('a');
```

## `import.meta`

Provides module-local metadata. The portable bits:

```js
import.meta.url;                       // file:// URL of the current module
new URL('./data.json', import.meta.url); // resolve sibling files
```

Node adds `import.meta.resolve(specifier)`. Browsers expose `import.meta.url` only.

## Common mistakes

- Mixing default and named imports for the same module and being surprised by what the default actually is — for CJS interop, the default is the entire `module.exports`.
- Forgetting the file extension in spec ESM. `import './x'` works in TypeScript and bundlers but not in `node --experimental-vm-modules` or browsers.
- Reassigning an imported binding. Imports are read-only.
- Reading a module's exports too early — in ESM, a circular import returns a partially initialized namespace.
- Top-level `await` in a hot module — every importer pays the wait cost on startup.
- Calling `require()` from ESM. Use `import` or `createRequire(import.meta.url)`.
