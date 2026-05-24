JavaScript has three binding forms — `var`, `let`, and `const` — and they differ in scope, hoisting, and reassignability. The differences look small until they bite, usually inside a loop or a callback.

## The three forms

| Keyword | Scope | Hoisted | Initialized on hoist | Reassignable | Redeclarable |
| --- | --- | --- | --- | --- | --- |
| `var` | function | yes | `undefined` | yes | yes |
| `let` | block | yes | no (TDZ) | yes | no |
| `const` | block | yes | no (TDZ) | no (binding) | no |

`const` freezes the *binding*, not the value. The object it points to is still mutable.

```js
const user = { name: 'Ada' };
user.name = 'Grace';    // fine
user = { name: 'Grace' }; // TypeError
```

## Hoisting

Declarations are processed before the body of their scope runs. `var` declarations are initialized to `undefined`; `let` and `const` are created but left uninitialized, producing the temporal dead zone.

```js
console.log(a); // undefined
var a = 1;

console.log(b); // ReferenceError: Cannot access 'b' before initialization
let b = 1;
```

Function declarations are hoisted *with their value*, which is why this works:

```js
greet();
function greet() { console.log('hi'); }
```

Function *expressions* assigned to `var` aren't:

```js
greet(); // TypeError: greet is not a function
var greet = function () { console.log('hi'); };
```

## The temporal dead zone

The TDZ is the window between entering a scope and the `let`/`const` declaration being evaluated. Touching the binding in that window throws. This is intentional — it catches the class of bugs where you read a variable before it has a meaningful value.

```js
{
  // TDZ for x starts here
  typeof x; // ReferenceError — yes, even typeof
  let x = 1;
}
```

## Block scope and loops

Block scoping fixes the classic "all my callbacks see the last value" problem:

```js
const handlers = [];
for (var i = 0; i < 3; i++) handlers.push(() => i);
handlers.map(h => h()); // [3, 3, 3]

for (let j = 0; j < 3; j++) handlers.push(() => j);
handlers.slice(3).map(h => h()); // [0, 1, 2]
```

Each iteration of a `let`-headed `for` loop creates a fresh binding. `var` shares a single binding across all iterations.

## Global declarations

At the top level of a script, `var` and function declarations create properties on the global object (`window`, `globalThis`). `let`, `const`, and `class` do not.

```js
var a = 1;
let b = 2;
globalThis.a; // 1
globalThis.b; // undefined
```

In ES modules, top-level declarations are module-scoped — none of them touch `globalThis`.

## Common mistakes

- Reaching for `var` out of habit. There is no reason to use it in new code.
- Assuming `const` makes an object immutable. Use `Object.freeze` (shallow) or a library if you need real immutability.
- Declaring a `let` inside a loop body and treating it like loop state — it resets every iteration.
- Forgetting that `for (const x of arr)` works fine; each iteration produces a fresh binding so `const` doesn't fight you.
- Relying on hoisted `var` for control flow. It looks like it works until two declarations collide.

## Strict mode

ES modules and class bodies run in strict mode automatically. Strict mode bans implicit globals — assigning to an undeclared identifier throws instead of silently creating a global:

```js
'use strict';
function f() { x = 1; } // ReferenceError when called
```

If you ever wonder why a typo'd variable name silently swallowed your value, you were running sloppy mode.
