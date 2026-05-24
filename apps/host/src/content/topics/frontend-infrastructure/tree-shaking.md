Tree-shaking is the bundler's dead-code elimination — analyzing the import graph, determining which exports are actually used, and dropping the rest from the output. It works because ES modules have static import/export syntax that can be analyzed without executing the code. It silently fails for many reasons: CommonJS modules, side-effectful files, dynamic property access, and aggressive minification quirks. A bundle that "should be tree-shaken" but isn't is the single most common cause of bloated output.

## The precondition: ES modules

Tree-shaking requires `import` / `export` syntax. `require()` and `module.exports` are dynamic — the bundler can't know at build time which properties will be accessed:

```js
// Tree-shakable
import { Button } from 'ui';

// Not tree-shakable — whole module included
const { Button } = require('ui');
```

If a library ships only CommonJS, importing one named export pulls the whole thing in. Check the package's `exports` field or look for an `module` / `exports.import` entry:

```jsonc
// package.json — tree-shakable
{
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  }
}
```

## The `sideEffects` field

By default, the bundler assumes every module might have side effects on import (modifying globals, registering plugins) and conservatively keeps it. You opt in to tree-shaking with `sideEffects` in `package.json`:

```jsonc
{
  "sideEffects": false
}
```

Or list the files that *do* have side effects:

```jsonc
{
  "sideEffects": ["./src/polyfills.js", "*.css"]
}
```

Without this declaration, even pure ESM code may not be tree-shaken because the bundler plays it safe.

## /\*#\_\_PURE\_\_\*/

The annotation marks a call expression as pure — meaning it has no side effects beyond returning a value. If the result is unused, the call can be dropped:

```js
export const config = /*#__PURE__*/ createConfig({ feature: true });
```

If nobody imports `config`, the `createConfig(...)` call is eliminated. Without the annotation, the bundler keeps the call because `createConfig` *might* have side effects.

Minifiers (Terser, SWC, esbuild) all honor this annotation. Babel's `@babel/preset-env` and Rollup add it automatically for some patterns; otherwise add it by hand for expensive expressions.

## Where tree-shaking silently fails

| Pattern | Why it breaks |
| --- | --- |
| `import * as utils from 'utils'` | Whole namespace stays in |
| `import _ from 'lodash'` (default) | Whole lodash, use `lodash-es` named imports |
| Re-exports through index files (`export * from './a'`) | Side-effect assumption keeps everything unless `sideEffects: false` |
| Module that runs code at top level (`window.x = 1`) | Side-effectful, stays in |
| TS `enum` (non-const) | Compiles to an IIFE with assignment, looks side-effectful |
| Decorators on classes | Decorator calls execute at module evaluation, kept in |
| Dynamic access: `obj[key]` | Bundler can't know which property |

## Lodash example

```js
// Bad — pulls all of lodash
import _ from 'lodash';
_.debounce(fn, 100);

// Better — pulls only debounce, but only if lodash-es
import { debounce } from 'lodash-es';
debounce(fn, 100);

// Best — direct path import works for plain lodash
import debounce from 'lodash/debounce';
```

Run `npx source-map-explorer dist/main.js` to confirm.

## Verifying tree-shaking worked

1. Build for production with minification on.
2. `grep` the output for a function name that should have been shaken:
   ```bash
   grep -c "_unusedFunction" dist/*.js
   ```
3. Or use `webpack-bundle-analyzer` / `rsdoctor` — search for the module in the visual map.
4. The `usedExports` info in Webpack stats (`stats: { usedExports: true }`) marks which exports were retained.

## Library authoring

If you publish a package, make sure consumers can tree-shake it:

- Ship ESM (or both ESM and CJS via `exports` conditions).
- Set `"sideEffects": false` (or list the few files that have them).
- Avoid top-level side-effects: no `Object.assign(globalThis, ...)`, no auto-running setup.
- Don't barrel everything through a giant `index.ts` re-export if you can avoid it — direct imports tree-shake better in some bundlers.
- Mark factory calls with `/*#__PURE__*/`.

## Cross-bundler differences

| Bundler | Tree-shaking quality |
| --- | --- |
| Rollup | Best in class, designed for ESM |
| Webpack 5 | Good with `sideEffects` declared |
| Rspack | Matches Webpack 5 |
| Vite (Rollup-prod) | Same as Rollup |
| esbuild | Decent but skips some opportunities |
| Parcel | Good with ESM, weaker with CJS |

If you're publishing a library, Rollup-built output trees-shakes most reliably in consumers.

## Common mistakes

- Adding `sideEffects: false` to a package that has CSS imports — the CSS gets dropped silently because it's treated as side-effect-free.
- Assuming TS `const enum` and TS `enum` behave the same — only `const enum` inlines and is shaken.
- Wrapping a pure helper in a class — class methods are kept if the class is referenced anywhere.
- Using `import * as React` in a Webpack build without a modern target — old React-CJS interop pulls the whole React in.
- Trusting a "tree-shakable" claim on a library without verifying with a bundle analyzer.
- Production minification is what actually deletes the dead code — if you check a dev build, you'll see all the "dead" code is still there. That's expected.
