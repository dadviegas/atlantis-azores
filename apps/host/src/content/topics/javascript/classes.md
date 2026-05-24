Classes give a familiar syntax for prototypal inheritance plus a few capabilities you cannot easily replicate with plain functions: true private fields, static blocks, and a guaranteed call order for `super`. Most modern JavaScript code uses classes for stateful objects and plain functions for everything else.

## Anatomy

```js
class User {
  // public field
  role = 'member';

  // private field — only accessible inside the class body
  #password;

  // static field
  static count = 0;

  // static initialization block
  static {
    User.count = 0;
  }

  constructor(name, password) {
    this.name = name;
    this.#password = password;
    User.count++;
  }

  // method (on the prototype)
  check(p) { return p === this.#password; }

  // static method
  static fromJSON(json) { return new User(json.name, json.password); }

  // getter / setter
  get summary() { return `${this.name} (${this.role})`; }
  set summary(_) { throw new Error('read-only'); }
}
```

## Field placement matters

| Where | Lives on | Shared between instances |
| --- | --- | --- |
| `x = 1` in body | instance | no — fresh per instance |
| `static x = 1` | constructor function | yes |
| `method() {}` | `Class.prototype` | yes |
| `method = () => {}` | instance | no — one per instance |
| `#x` | instance, private | no |

Putting an arrow on the instance auto-binds `this` but allocates one closure per instance and breaks `super.method` calls in subclasses.

## Private fields

`#name` is enforced by the language. Access from outside the class throws a SyntaxError at parse time, not runtime.

```js
class Box {
  #value;
  constructor(v) { this.#value = v; }
  peek() { return this.#value; }
}

const b = new Box(1);
b.peek();      // 1
b.#value;      // SyntaxError
```

Private brand check — works without ever reading the field:

```js
class Box {
  #brand;
  static isBox(x) {
    try { x.#brand; return true; } catch { return false; }
  }
}
```

There is also a private-in-form: `#field in obj` returns `true`/`false` without throwing.

```js
static isBox(x) { return #brand in x; }
```

## `extends` and `super`

`extends` accepts any expression that produces a constructor — or `null` to opt out of `Object.prototype`.

```js
class Admin extends User {
  constructor(name, password, scopes) {
    super(name, password);     // must come before any `this`
    this.scopes = scopes;
  }

  summary() {
    return `${super.summary} [${this.scopes.join(',')}]`;
  }
}
```

Rules:

- `super(...)` in a derived constructor must be called before `this` is touched. Until then, `this` is in TDZ.
- `super.method()` looks up `method` on the *home object's* prototype, not on `this`'s prototype. This matters for mixins.
- Static methods are inherited too — `Admin.fromJSON` works without redefinition.

## `extends` an expression

```js
const Timestamped = (Base) => class extends Base {
  ts = Date.now();
};

class LoggedUser extends Timestamped(User) {}
```

Useful for composing behavior without manual prototype gymnastics.

## Getters, setters, and `Object.defineProperty`

Getters/setters defined in a class body land on the prototype as accessor descriptors. You rarely need `Object.defineProperty` for class members — use the syntax.

```js
class Temperature {
  #c;
  constructor(c) { this.#c = c; }
  get fahrenheit() { return this.#c * 9/5 + 32; }
  set fahrenheit(f) { this.#c = (f - 32) * 5/9; }
}
```

## Static blocks

Static initialization blocks run once when the class is evaluated. Useful for setup that needs access to private statics or runs imperatively.

```js
class Cache {
  static #map = new Map();
  static {
    // seed from somewhere
    for (const [k, v] of initialEntries()) Cache.#map.set(k, v);
  }
}
```

## Constructor return values

Returning an object from a constructor overrides the new instance. Returning a primitive is ignored.

```js
class Once {
  static #instance;
  constructor() {
    if (Once.#instance) return Once.#instance;
    Once.#instance = this;
  }
}
```

This is the canonical singleton pattern — rarely the right answer, but it works.

## Common mistakes

- Touching `this` before `super()` in a derived constructor.
- Defining methods as instance arrow fields when you wanted prototype methods (breaks `super`, costs memory).
- Adding mutable defaults as fields — `items = []` gives every instance its own array, which is usually what you want; on the *prototype* it would be shared.
- Using `class` for what's really a record. A plain object literal is faster and serialises trivially.
- Reaching for inheritance chains more than one level deep. Composition usually scales better.
