`this` is a parameter that gets bound implicitly at the moment a function is called. Its value depends on the *call site*, not the definition site — except for arrow functions, which don't have their own `this` at all. Understanding the four binding rules removes most of the confusion.

## The four rules

In order of precedence:

1. **`new` binding** — `new fn()` creates a fresh object and binds `this` to it.
2. **Explicit binding** — `fn.call(obj)`, `fn.apply(obj, args)`, `fn.bind(obj)`.
3. **Implicit binding** — `obj.fn()` binds `this` to `obj`.
4. **Default binding** — bare `fn()` binds `this` to `undefined` in strict mode, or the global object in sloppy mode.

```js
function who() { return this?.name ?? 'nobody'; }

const user = { name: 'Ada', who };
user.who();           // 'Ada'        (implicit)
who();                // 'nobody'     (default, strict mode)
who.call({ name: 'Grace' }); // 'Grace' (explicit)
new who();            // 'nobody'     (new — fresh object has no name)
```

## Losing `this`

The most common bug: extracting a method and calling it standalone.

```js
const log = user.who;
log(); // 'nobody' — implicit binding is gone
```

Same thing happens passing methods as callbacks:

```js
setTimeout(user.who, 0);     // 'nobody'
setTimeout(() => user.who(), 0); // 'Ada' — arrow preserves the call
setTimeout(user.who.bind(user), 0); // 'Ada' — explicit bind
```

## Arrow functions

Arrows do not have their own `this`, `arguments`, `super`, or `new.target`. They close over the enclosing lexical `this`.

```js
class Timer {
  constructor() {
    this.seconds = 0;
    setInterval(() => this.seconds++, 1000); // arrow keeps `this`
  }
}
```

Replace the arrow with `function () { this.seconds++ }` and `this` becomes `undefined` (strict) or the global object — `setInterval` calls it with no receiver.

Because arrows can't be rebound, `fn.call(other)` on an arrow is a no-op for `this`.

## `call`, `apply`, `bind`

| Method | Calls now? | Argument shape |
| --- | --- | --- |
| `fn.call(thisArg, a, b, c)` | yes | spread |
| `fn.apply(thisArg, [a, b, c])` | yes | array |
| `fn.bind(thisArg, a, b)` | no — returns a new function | spread (partial application) |

`Reflect.apply(fn, thisArg, args)` is the modern equivalent of `apply` that doesn't break on functions whose `apply` has been shadowed.

`bind` is permanent. You cannot rebind a bound function:

```js
const bound = who.bind({ name: 'A' });
bound.call({ name: 'B' }); // 'A' — bind wins
```

## Methods on classes

Class methods are not auto-bound. The same "losing `this`" hazard applies.

```js
class Counter {
  count = 0;
  inc() { this.count++; }
}

const c = new Counter();
const f = c.inc;
f(); // TypeError: Cannot read properties of undefined
```

Three common workarounds:

```js
// Bind in the constructor
class A { constructor() { this.inc = this.inc.bind(this); } inc() {} }

// Class field arrow — auto-bound per instance
class B { inc = () => { /* this is fixed to the instance */ }; }

// Bind at the call site
button.addEventListener('click', () => c.inc());
```

The class field arrow has a cost — one function allocation per instance instead of one shared on the prototype.

## `new` and constructors

`new Fn(args)` does four things: creates a new object, sets its `[[Prototype]]` to `Fn.prototype`, calls `Fn` with `this` bound to the new object, and returns the new object (unless the constructor explicitly returns another object).

```js
function User(name) { this.name = name; }
const u = new User('Ada');
u.name; // 'Ada'
Object.getPrototypeOf(u) === User.prototype; // true
```

Arrow functions cannot be used with `new` — they have no `[[Construct]]` slot.

## `globalThis` and the default

In a browser, sloppy-mode default `this` is `window`. In a Node module (CJS), it's `module.exports`. In ESM and strict mode, it's `undefined`. `globalThis` is the portable global reference.

## Common mistakes

- Defining an event handler as a regular method on a class without binding it.
- Using an arrow function as a method when you actually want `this` to be the object the method is called on — arrows fix `this` to the *enclosing* scope, which is rarely what an object literal wants.
- Calling `fn.bind(this)` inside `render` on every call — produces a new function each time and breaks memoization downstream.
- Expecting `setTimeout(this.method, 0)` to work. It won't — bind or wrap it.
- Using `function` for array callbacks when you want `this` from outside (`map`, `forEach`, etc., pass a second argument for `thisArg`, but arrows are clearer).
