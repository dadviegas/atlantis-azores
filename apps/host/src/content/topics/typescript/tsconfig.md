`tsconfig.json` is the project root for the TypeScript compiler. It defines what files are part of the program, how modules resolve, what runtime features are assumed available, and how strict the type checker is. Most production issues with TS — phantom red squiggles, mysterious import failures, missing globals — come down to a misconfigured `tsconfig`.

## `target`

The ECMAScript version emitted by `tsc`. Affects downleveling (`async`/`await`, classes, optional chaining) and the *default* `lib`.

```json
{ "compilerOptions": { "target": "ES2022" } }
```

For modern web apps bundled by Vite/Rspack/esbuild, `ES2022` or `ESNext` is standard — the bundler handles legacy targets if needed.

## `module` and `moduleResolution`

These two often confuse. `module` controls the emitted module format; `moduleResolution` controls how imports are looked up.

| Use case | `module` | `moduleResolution` |
| --- | --- | --- |
| Modern bundler (Vite, Rspack, webpack) | `ESNext` | `bundler` |
| Node ESM | `NodeNext` | `NodeNext` |
| Node CJS | `CommonJS` | `Node10` |
| Library targeting both | `NodeNext` | `NodeNext` |

`moduleResolution: "bundler"` (TS 5.0+) is the right choice for any project where a bundler resolves modules — it relaxes the strict file-extension rules of `NodeNext` while still honoring `exports` conditions.

## `lib`

The set of ambient typings included. Defaults derive from `target` (`DOM` is included when targeting browsers).

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"]
  }
}
```

Omitting `DOM` for a Node project is how you make `document` and `window` errors. Adding `WebWorker` types a worker entry point.

## `paths` and `baseUrl`

Module name aliases for the compiler. The bundler must replicate the same mapping at runtime.

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@app/*": ["src/*"],
      "@design/*": ["packages/design-system/src/*"]
    }
  }
}
```

With `moduleResolution: "bundler"`, `baseUrl` is optional — `paths` works from the `tsconfig.json` location directly.

## `jsx`

Controls how `.tsx` files compile.

| Value | Output |
| --- | --- |
| `preserve` | leaves JSX intact (for a separate transform) |
| `react-jsx` | new automatic runtime (`react/jsx-runtime`) |
| `react-jsxdev` | dev variant with source info |
| `react` | classic `React.createElement` (legacy) |

Modern React is `react-jsx` in production and `react-jsxdev` in development.

## `esModuleInterop` and `allowSyntheticDefaultImports`

`esModuleInterop: true` emits helpers so `import x from "cjs-module"` works against CommonJS exports. It also implies `allowSyntheticDefaultImports` for type checking. Leave it on unless you're authoring a library and have a specific reason.

## The strict family

`strict: true` is shorthand for the full set:

| Flag | What it enforces |
| --- | --- |
| `noImplicitAny` | implicit `any` is an error |
| `strictNullChecks` | `null` and `undefined` are separate types |
| `strictFunctionTypes` | contravariant function parameter checks |
| `strictBindCallApply` | typed `bind`/`call`/`apply` |
| `strictPropertyInitialization` | class fields must be initialized |
| `noImplicitThis` | implicit `any` for `this` is an error |
| `useUnknownInCatchVariables` | `catch (e)` types `e` as `unknown` |
| `alwaysStrict` | emits `"use strict"` |

See the `strict-mode` notes for the why behind each.

## Other useful options

```json
{
  "compilerOptions": {
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true
  }
}
```

- `noUncheckedIndexedAccess` — `arr[i]` becomes `T | undefined`. Catches an enormous class of bugs.
- `exactOptionalPropertyTypes` — `{ x?: number }` no longer accepts `{ x: undefined }`. Match the JS semantics you actually want.
- `isolatedModules` — required for `swc`/`esbuild`/`babel` based transpilers that compile file-by-file.
- `verbatimModuleSyntax` — forces explicit `import type` and emits exactly what you wrote.
- `skipLibCheck` — skips type-checking declaration files; almost always on for build speed.

## Project references

For monorepos, `references` lets `tsc -b` build packages in dependency order with incremental caching.

```json
{
  "references": [
    { "path": "../design-system" },
    { "path": "../remote" }
  ]
}
```

Each referenced project needs `composite: true` and emits `.d.ts` outputs.

## Gotchas

- Changing `moduleResolution` without updating imports (file extensions, especially) breaks the build silently in the editor and loudly in CI.
- `target: "ES5"` with `lib: ["ES2022"]` will type-check `Array.prototype.at` but downlevel-emit calls a runtime that doesn't have it. Keep `target` and `lib` aligned.
- `paths` is a compile-time fiction. Bundler config and Jest's `moduleNameMapper` must mirror it or you'll see runtime resolution failures.
- `skipLibCheck: false` is honest but slow — leave it `true` unless debugging a specific type clash from a dependency.
