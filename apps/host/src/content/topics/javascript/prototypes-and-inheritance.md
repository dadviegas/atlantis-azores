Every JavaScript object has an internal `[[Prototype]]` slot pointing to another object (or `null`). Property lookups walk this chain until the property is found or the chain ends. Classes are syntactic sugar over this same machinery — there is no separate inheritance system underneath.

## The chain

```js
const arr = [1, 2, 3];
arr.map;                  // function — found on Array.prototype
arr.toString;             // function — found on Object.prototype
arr.nope;                 // undefined — chain exhausted

Object.getPrototypeOf(arr) === Array.prototype;          // true
Object.getPrototypeOf(Array.prototype) === Object.prototype; // true
Object.getPrototypeOf(Object.prototype);                 // null
```

Reads walk the chain. Writes (in most cases) create an own property on the receiver — they do not modify the prototype.

```js
const a = { x: 1 };
const b = Object.create(a);
b.x = 2;       // own property on b
a.x;           // still 1
b.x;           // 2
```

## Creating objects with a specific prototype

```js
const proto = { greet() { return `hi, ${this.name}`; } };
const u = Object.create(proto, { name: { value: 'Ada', enumerable: true } });
u.greet(); // 'hi, Ada'
```

`Object.create(null)` produces an object with no prototype — handy for dictionaries where you don't want `__proto__`, `toString`, etc. to collide with user keys.

```js
const dict = Object.create(null);
dict.toString = 'hello';   // safe — no inherited toString to shadow
'toString' in dict;        // true — own property only
```

## `__proto__` vs `Object.getPrototypeOf`

`__proto__` is a legacy accessor standardized for web compat. Prefer the explicit functions:

| Legacy | Modern |
| --- | --- |
| `obj.__proto__` | `Object.getPrototypeOf(obj)` |
| `obj.__proto__ = p` | `Object.setPrototypeOf(obj, p)` |
| `{ __proto__: p, ... }` literal | `Object.create(p, descriptors)` |

`Object.setPrototypeOf` is slow — engines deoptimise objects whose prototype has been mutated after creation. Set the prototype at construction time.

## Classes desugared

```js
class Animal {
  constructor(name) { this.name = name; }
  speak() { return `${this.name} makes a noise`; }
}

class Dog extends Animal {
  speak() { return `${this.name} barks`; }
}
```

Is roughly:

```js
function Animal(name) { this.name = name; }
Animal.prototype.speak = function () { return `${this.name} makes a noise`; };

function Dog(name) { Animal.call(this, name); }
Object.setPrototypeOf(Dog.prototype, Animal.prototype); // instance chain
Object.setPrototypeOf(Dog, Animal);                     // static chain
Dog.prototype.speak = function () { return `${this.name} barks`; };
```

Two chains exist for any `extends`: one between the prototype objects (for instance methods) and one between the constructor functions themselves (for static methods).

## `instanceof`

`a instanceof B` walks the prototype chain of `a` looking for `B.prototype`. It is not a type check — it's a chain check.

```js
[] instanceof Array;                    // true
[] instanceof Object;                   // true
Object.create(null) instanceof Object;  // false — no chain to Object.prototype
```

This breaks across realms (iframes, worker boundaries) because each realm has its own `Array.prototype`. Use `Array.isArray`, `Number.isInteger`, etc. instead when crossing realms.

## Method lookup uses the receiver

Inherited methods see `this` as the receiver, not the prototype.

```js
const animal = { sound() { return this.name; } };
const dog = Object.create(animal);
dog.name = 'Rex';
dog.sound(); // 'Rex'
```

## Mixins

Because the chain is single-parent, "multiple inheritance" is typically done by copying methods.

```js
const Serializable = {
  toJSON() { return { ...this }; },
};
Object.assign(User.prototype, Serializable);
```

For a chain-based composition, you can build the prototype yourself:

```js
class Base {}
const mix = (Sup) => class extends Sup {
  log() { return JSON.stringify(this); }
};
class User extends mix(Base) {}
```

## Common mistakes

- Mutating a shared prototype: `Array.prototype.foo = ...`. Every array everywhere now has `foo`, and `for..in` loops will see it.
- Using `Object.setPrototypeOf` in a hot path — major perf cliff.
- Treating `__proto__` as a normal property name in JSON. It is intercepted by the legacy setter in some parsers.
- Assuming `instanceof` works across iframes or `vm.runInNewContext`.
- Forgetting to call `super(...)` first in a derived class constructor — `this` is in TDZ until you do.
- Putting shared mutable state on the prototype (`Class.prototype.items = []`) — every instance now shares the same array.
