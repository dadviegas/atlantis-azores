TypeScript is a structural type system layered on top of JavaScript. It compiles away at build time, leaving plain JS to run in the browser or on the server, but in the editor and during `tsc` it catches whole categories of mistakes that JS will happily run into production. Its philosophy is *structural*: two types are compatible if their shapes match, regardless of name or declaration.

The notes below are organized from concrete syntax up to type-level techniques and operational concerns (config, tooling, escape hatches).

## What TS adds over JS

- Static types checked at compile time, erased at runtime.
- Editor tooling: autocomplete, refactors, jump-to-definition that actually works.
- A type-level language rich enough to model API contracts, state machines, and DSLs.
- A common dialect for shared libraries — `.d.ts` files describe JS for typed consumers.

## Structural typing in one sentence

If an object has the required shape, it is assignable to the type — no `implements` clause required.

```ts
type Point = { x: number; y: number };
const p: Point = { x: 1, y: 2, z: 3 } as { x: number; y: number; z: number };
```

## Subtopics

| File | What it covers |
| --- | --- |
| [basic-types](./basic-types.md) | primitives, arrays, tuples, enums vs const objects, literal types |
| [interfaces-vs-types](./interfaces-vs-types.md) | when each is preferable, merging, extending, perf |
| [generics](./generics.md) | type parameters, constraints, defaults, variance basics |
| [narrowing](./narrowing.md) | typeof/instanceof/in, discriminated unions, guards, assertions, never |
| [utility-types](./utility-types.md) | Partial, Pick, Omit, Record, ReturnType, Awaited, NoInfer |
| [mapped-types](./mapped-types.md) | key remapping with `as`, `+/-?`, `+/-readonly` |
| [conditional-types](./conditional-types.md) | `extends`, `infer`, distributive conditionals |
| [template-literal-types](./template-literal-types.md) | string manipulation at the type level, intrinsics |
| [modules-and-declarations](./modules-and-declarations.md) | `.d.ts`, ambient modules, module augmentation |
| [tsconfig](./tsconfig.md) | target, module, moduleResolution, paths, lib, jsx, strict family |
| [strict-mode](./strict-mode.md) | every `--strict` flag, why it matters, common fixes |
| [inference](./inference.md) | contextual typing, widening, `const`, `satisfies` |
| [decorators](./decorators.md) | Stage 3 decorators, legacy distinction, patterns |
| [type-level-patterns](./type-level-patterns.md) | branded/nominal, builder returns, exhaustive switch |
| [pitfalls](./pitfalls.md) | any vs unknown, excess properties, `this`, function variance |
