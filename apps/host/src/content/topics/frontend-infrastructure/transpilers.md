A transpiler converts source in one language or syntax level to another — TypeScript to JavaScript, modern ES syntax to older ES, JSX to function calls. Bundlers don't transpile themselves; they delegate to one of four engines: Babel (JS), SWC (Rust), esbuild (Go), or `tsc` (TypeScript's own compiler). The choice affects build speed, what syntax you can use, and which plugins are available.

## The four engines

| Engine | Language | Type-checks? | Emits JS? | Plugin ecosystem |
| --- | --- | --- | --- | --- |
| `tsc` | TS | yes | yes | tsc transformer API, small |
| Babel | JS | no | yes | huge (Babel plugins) |
| SWC | Rust | no | yes | growing |
| esbuild | Go | no | yes | small, intentional |

The critical point: **only `tsc` does TypeScript type-checking**. Babel, SWC, and esbuild *strip* TypeScript types — they do not validate them. You still need `tsc --noEmit` in your CI even if your bundler uses SWC for transpilation.

## What each is actually for

- `tsc` — the source of truth for type-checking. In most modern pipelines it runs in `--noEmit` mode purely to catch type errors; the actual JS emit comes from a faster tool.
- Babel — historically the universal transpiler. Still required if you rely on Babel plugins (Emotion's `babel-plugin-emotion`, `babel-plugin-styled-components`, custom AST transforms, decorator stage-2 semantics).
- SWC — Babel-compatible enough for most apps, 10-50x faster. Default in Next.js, Rspack, Parcel, and `swc-loader` for Webpack.
- esbuild — fastest of all, used as the dev transformer inside Vite. Plugin API is intentionally minimal — you cannot do AST manipulation; you can only transform whole files.

## Downlevel targets

The `target` setting (or browserslist) controls what older syntax you compile down to:

```jsonc
// tsconfig.json
{ "compilerOptions": { "target": "ES2020" } }

// .swcrc
{ "jsc": { "target": "es2020" } }

// .browserslistrc
> 0.5%, last 2 versions, not dead
```

Targeting older browsers makes the output bigger because async/await, classes, optional chaining, and nullish coalescing all expand into helper code. In 2026, targeting `ES2020` covers ~98% of users and avoids the worst of the bloat. Targeting `ES5` adds ~30-50% to bundle size with regenerator-runtime, core-js polyfills, and class transforms.

## JSX

Babel, SWC, esbuild, and `tsc` all support JSX. The setting you care about is the `jsx` mode:

| Mode | What it emits |
| --- | --- |
| `preserve` | leaves JSX in output (Vite dev, Next.js) |
| `react` | `React.createElement(...)` (old) |
| `react-jsx` | `_jsx(...)` from `react/jsx-runtime` (new, since React 17) |
| `react-jsxdev` | dev variant with source line info |

Use `react-jsx` — it removes the need to `import React` in every file and produces smaller output.

## Decorators

A multi-decade-long TC39 saga. As of 2026:

- TC39 Stage 3 decorators are supported by `tsc` (`experimentalDecorators: false`), SWC (`decorators: true`, `decoratorMetadata` optional), and Babel (`@babel/plugin-proposal-decorators` with `version: '2023-05'`).
- Legacy ("experimental") TypeScript decorators (`experimentalDecorators: true`) are still what most existing code uses — MobX, TypeORM, NestJS.
- These two flavors are not compatible. Pick one per project.

esbuild only supports the legacy TS decorators. If you use Stage 3 decorators, esbuild is not an option.

## Polyfills

A transpiler lowers *syntax*; it doesn't add *runtime* APIs. `Array.prototype.flat`, `Promise.allSettled`, `structuredClone` need a polyfill if your target browsers lack them. Options:

- `core-js` imported globally or via `@babel/preset-env`'s `useBuiltIns: 'usage'`.
- SWC has `env.coreJs` for the same automation.
- Or ship a script-tag polyfill from polyfill.io / cdnjs.

The modern stance: target browsers that support what you use, skip polyfills, save the bytes.

## Speed comparison (rough)

| Engine | 1 MB of TS source | Notes |
| --- | --- | --- |
| `tsc` | 3-5 s | Includes type-checking |
| Babel | 2-4 s | Plugin-heavy configs slower |
| SWC | 100-300 ms | 10-50x Babel |
| esbuild | 30-80 ms | Fastest, fewest features |

Numbers depend hugely on plugin count and AST work, but the ordering is consistent.

## Choosing

- If you have a custom Babel plugin you can't replace, stay on Babel.
- Otherwise, default to SWC. It's faster, has decent plugins, and is what Rspack/Next.js/Parcel ship.
- Use esbuild only as a dev-time transformer inside another tool (Vite). Don't pick it as your production transpiler unless your needs are minimal.
- Run `tsc --noEmit` separately in CI for type-checking, regardless of which transpiler emits JS.

## Gotchas

- "Build passes but types are broken" — happens when you forget to run `tsc --noEmit` in CI because your bundler stripped types without checking them.
- SWC and Babel produce slightly different output for the same input. Source maps and stack traces won't be byte-identical.
- `useBuiltIns: 'entry'` vs `'usage'` in Babel — `'entry'` imports all polyfills you might need based on target, `'usage'` only what your code actually touches.
- Emotion and styled-components need their dedicated SWC plugin (`@swc/plugin-emotion`, `@swc/plugin-styled-components`) — without it, you lose component display names and SSR class hashing.
- `target: ESNext` does not mean "no transpile" — it means "no syntax downleveling", but module format, JSX, and TS-stripping still happen.
