TypeScript's module system tracks two parallel worlds: the runtime modules JS resolves at execution, and the type-only declarations that describe them. `.d.ts` files, ambient modules, and module augmentation are the mechanisms that let typed and untyped JavaScript coexist.

## `.d.ts` files

A `.d.ts` file contains declarations — no executable code. The compiler reads them as if they were `.ts`, but never emits anything for them.

```ts
// types/legacy-lib.d.ts
export interface Options { retries: number; verbose?: boolean }
export function connect(url: string, opts?: Options): Promise<void>;
```

These ship alongside JS libraries (or live in `@types/...` packages on npm) so consumers get types without consuming the source.

## Generating declarations

`tsc --declaration` (or `"declaration": true` in `tsconfig.json`) emits `.d.ts` next to each compiled `.js`. `"declarationMap": true` adds source maps so jump-to-definition lands in your `.ts`.

```json
{
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true,
    "emitDeclarationOnly": false
  }
}
```

For libraries, `declaration: true` is required — that's how downstream TS projects see your types.

## Ambient declarations

`declare` introduces a name into the type space without producing runtime code. The classic case is global injection by a bundler or test environment.

```ts
// globals.d.ts
declare const __BUILD_HASH__: string;
declare function loadFixture(name: string): unknown;
```

Now `__BUILD_HASH__` is callable anywhere in the project, with the compiler trusting that it exists at runtime.

## Ambient modules

`declare module "name"` describes a module the compiler doesn't know how to resolve — common for non-JS imports (CSS, SVG) or untyped packages.

```ts
declare module "*.svg" {
  const src: string;
  export default src;
}

declare module "untyped-lib" {
  export function doThing(input: string): number;
}
```

Wildcards (`*.svg`, `*.css?inline`) let one declaration cover a whole category of imports.

## Module augmentation

Re-open an existing module to add to its types. The augmenting file must itself be a module (`export {}` if needed).

```ts
// augment-express.d.ts
import "express";

declare module "express-serve-static-core" {
  interface Request {
    user?: { id: string; role: "admin" | "member" };
  }
}

export {};
```

This is how middleware ecosystems extend `Request`, how store libraries extend `Window`, and how framework plugins add fields.

## Global augmentation

`declare global { ... }` opens the global scope from inside a module file.

```ts
export {};

declare global {
  interface Window {
    myAnalytics?: { track(event: string): void };
  }
}
```

Without the `export {}`, the file would be a script and `declare global` wouldn't work.

## `types` vs `typings`

Both fields in `package.json` point to the entry `.d.ts`. They are aliases — `types` is the modern name, `typings` is the older one, both still honored.

```json
{
  "name": "my-lib",
  "main": "dist/index.js",
  "types": "dist/index.d.ts"
}
```

For ESM-first packages, prefer `exports` conditions:

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  }
}
```

The `types` condition *must* come first in each block — Node's resolver picks the first matching condition.

## Triple-slash directives

`/// <reference types="..." />` pulls in another package's ambient declarations. Mostly legacy now; prefer `compilerOptions.types` in `tsconfig.json`.

```ts
/// <reference types="node" />
```

`/// <reference path="..." />` references another local declaration file — useful for stitching `.d.ts` files when not using modules.

## `verbatimModuleSyntax` and type-only imports

```ts
import type { User } from "./types";
import { type User, getUser } from "./api";
```

`import type` (or the inline `type` keyword) is fully erased at emit, regardless of `isolatedModules`. With `verbatimModuleSyntax: true`, the compiler requires this distinction explicitly — no automatic erasure of value imports that happen to be used only as types.

## Gotchas

- A `.d.ts` file with no top-level `import` or `export` is treated as a *script* — all its declarations leak to the global scope. Add `export {}` to make it a module.
- Augmenting a module before importing the original may fail; the original must already be in the program (transitively imported).
- `@types/*` packages and inline `types` field can conflict. If both exist, the package's own `types` wins.
- `declare module "*"` (no extension) matches every unknown import — convenient but hides genuine missing-type errors.
