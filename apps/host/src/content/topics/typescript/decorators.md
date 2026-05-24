Decorators are a syntactic mechanism for wrapping classes, methods, accessors, properties, and parameters with metadata or behavior. After years in proposal stage, the TC39 *Stage 3* decorators proposal is now stable and supported by TypeScript 5.0+. Older "experimental" or "legacy" decorators (`experimentalDecorators: true`) are a different, incompatible system that still exists for compatibility with frameworks built on the old shape.

## Stage 3 decorators

Stage 3 decorators are plain functions called with the decorated value and a context object describing what's being decorated.

```ts
function logged<T extends (...args: any[]) => any>(
  fn: T,
  context: ClassMethodDecoratorContext,
): T {
  return function (this: unknown, ...args: unknown[]) {
    console.log(`call ${String(context.name)}`, args);
    return (fn as any).apply(this, args);
  } as T;
}

class Service {
  @logged
  fetch(id: string) { return id }
}
```

The `context` parameter is the key distinction — Stage 3 hands the decorator structured metadata (`kind`, `name`, `static`, `private`, `addInitializer`) instead of the legacy `(target, propertyKey, descriptor)` triple.

## Decorator targets

| Kind | Context type | What it decorates |
| --- | --- | --- |
| class | `ClassDecoratorContext` | the class constructor |
| method | `ClassMethodDecoratorContext` | a class method |
| getter | `ClassGetterDecoratorContext` | a getter accessor |
| setter | `ClassSetterDecoratorContext` | a setter accessor |
| field | `ClassFieldDecoratorContext` | a class field |
| accessor | `ClassAccessorDecoratorContext` | an `accessor` field |

There is no parameter decorator in Stage 3 — that part of the legacy system was dropped.

## `addInitializer`

The context lets decorators register a function to run when the instance is constructed (for instance decorators) or when the class is defined (for static decorators).

```ts
function bound(_: Function, context: ClassMethodDecoratorContext) {
  context.addInitializer(function (this: any) {
    this[context.name] = this[context.name].bind(this);
  });
}

class Button {
  @bound onClick() { console.log(this) }
}
```

This is the modern way to do auto-binding without the legacy descriptor dance.

## Field decorators

A field decorator receives `undefined` (the field has no initial accessor) plus the context, and returns either nothing or an initializer-transformer.

```ts
function defaultTo<V>(value: V) {
  return function (_: unknown, context: ClassFieldDecoratorContext) {
    return function (initial: V) {
      return initial ?? value;
    };
  };
}

class Config {
  @defaultTo("info") level!: "debug" | "info" | "warn" | "error";
}
```

## `accessor` keyword

Stage 3 introduces `accessor` fields — auto-generated getter/setter pairs you can decorate.

```ts
function observable<T>(
  { get, set }: ClassAccessorDecoratorTarget<unknown, T>,
  context: ClassAccessorDecoratorContext<unknown, T>,
) {
  return {
    get() { return get.call(this) },
    set(value: T) {
      console.log(`${String(context.name)} =`, value);
      set.call(this, value);
    },
  };
}

class Store {
  @observable accessor count = 0;
}
```

## Legacy ("experimental") decorators

Enabled by `"experimentalDecorators": true` in `tsconfig`. The shape is older and tied to a draft proposal that never advanced.

```ts
function legacyLogged(
  target: object,
  propertyKey: string,
  descriptor: PropertyDescriptor,
) {
  const original = descriptor.value;
  descriptor.value = function (...args: unknown[]) {
    console.log(`call ${propertyKey}`, args);
    return original.apply(this, args);
  };
}

class OldService {
  @legacyLogged
  fetch(id: string) { return id }
}
```

Pair with `emitDecoratorMetadata: true` and `reflect-metadata` for runtime type metadata — the basis of DI libraries like InversifyJS and frameworks like NestJS and TypeORM.

| Feature | Stage 3 | Legacy |
| --- | --- | --- |
| `tsconfig` flag | none — default | `experimentalDecorators: true` |
| Parameter decorators | no | yes |
| Metadata reflection | not built-in | via `emitDecoratorMetadata` |
| Stable standard | yes (TC39) | no (defunct draft) |
| Framework ecosystem | growing | dominant (Nest, TypeORM, Angular pre-v17) |

The two are *not* interchangeable — code written for one will not run as the other.

## Common patterns

### Memoization

```ts
function memo<T extends (...args: any[]) => any>(
  fn: T,
  _: ClassMethodDecoratorContext,
): T {
  const cache = new Map<string, unknown>();
  return function (this: unknown, ...args: unknown[]) {
    const key = JSON.stringify(args);
    if (!cache.has(key)) cache.set(key, (fn as any).apply(this, args));
    return cache.get(key);
  } as T;
}
```

### Validation

```ts
function nonEmpty(_: unknown, context: ClassSetterDecoratorContext<unknown, string>) {
  return function (this: unknown, value: string) {
    if (!value) throw new Error(`${String(context.name)} must be non-empty`);
  };
}
```

## Gotchas

- Stage 3 decorators don't support parameter decorators. Frameworks that need them (Nest, Angular pre-v17) require legacy mode.
- Mixing `experimentalDecorators: true` with Stage 3 decorator syntax falls back to the legacy semantics — there is no warning.
- `addInitializer` runs every time an instance is constructed. Avoid heavy work; cache outside if needed.
- Legacy decorators rely on `Object.defineProperty` semantics for class fields; with `useDefineForClassFields: true` (the modern default) some patterns silently change behavior.
- Stage 3 decorators run *bottom-up* per declaration but *top-down* across multiple decorators on the same element — same as legacy, but worth re-reading the spec when stacking.
