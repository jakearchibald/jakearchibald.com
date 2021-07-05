---
title: '`export default thing` is different to `export { thing as default }`'
date: 2021-07-03 01:00:00
summary: Here's how they differ, and when it matters…
meta: Here's how they differ, and when it matters…
image: 'asset-url:./img.png'
---

[Dominic Elm](https://twitter.com/elmd_) DM'd me on Twitter to ask me questions about circular dependencies, and, well, I didn't know the answer. After some testing, discussion, and _\*ahem\*_ chatting to the V8 team, we figured it out, but I learned something new about JavaScript along the way.

I'm going to leave the circular dependency stuff to the end of the article, as it isn't totally related. First up:

# Imports are references, not values

Here's an import:

```js
import { thing } from './module.js';
```

In the above example, `thing` is the same as `thing` in `./module.js`. I know that maybe sounds obvious, but what about:

```js
const module = await import('./module.js');
const { thing: destructuredThing } = await import('./module.js');
```

In this case `module.thing` is the same as `thing` in `./module.js`, whereas `destructuredThing` is a new identifier that's assigned the value of `thing` in `./module.js`, and that behaves differently.

Let's say this is `./module.js`:

```js
// module.js
export let thing = 'initial';

setTimeout(() => {
  thing = 'changed';
}, 500);
```

And this is `./main.js`:

```js
// main.js
import { thing as importedThing } from './module.js';
const module = await import('./module.js');
let { thing } = await import('./module.js');

setTimeout(() => {
  console.log(importedThing); // "changed"
  console.log(module.thing); // "changed"
  console.log(thing); // "initial"
}, 1000);
```

Imports are 'live bindings' or what some other languages call a 'reference'. This means when a different value is assigned to `thing` in `module.js`, that change is reflected in the import in `main.js`. The destructured import doesn't pick up the change because destructuring assigns the _current value_ (rather than a live reference) to a new identifier.

The destructuring behaviour isn't unique to imports:

```js
const obj = { foo: 'bar' };

// This is shorthand for:
// let foo = obj.foo;
let { foo } = obj;

obj.foo = 'hello';
console.log(foo); // Still "bar"
```

The above feels natural in my opinion. The potential gotcha here is that named static imports (`import { thing } …`) kinda look like destructuring, but they don't behave like destructuring.

Ok, so here's where we're at:

```js
// These give you a live reference to the exported thing(s):
import { thing } from './module.js';
import { thing as otherName } from './module.js';
import * as module from './module.js';
const module = await import('./module.js');
// This assigns the current value of the export to a new identifier:
let { thing } = await import('./module.js');
```

# But 'export default' works differently

Here's `./module.js`:

```js
// module.js
let thing = 'initial';

export { thing };
export default thing;

setTimeout(() => {
  thing = 'changed';
}, 500);
```

And `./main.js`:

```js
// main.js
import { thing, default as defaultThing } from './module.js';
import anotherDefaultThing from './module.js';

setTimeout(() => {
  console.log(thing); // "changed"
  console.log(defaultThing); // "initial"
  console.log(anotherDefaultThing); // "initial"
}, 1000);
```

…and I wasn't expecting those to be `"initial"`!

## But… why?

You can `export default` a value directly:

```js
export default 'hello!';
```

…which is something you _can't_ do with named exports:

```js
// This doesn't work:
export { 'hello!' as thing };
```

To make `export default 'hello!'` work, the spec gives `export default thing` different semantics to `export thing`. The bit after `export default` is treated like an expression, which allows for things like `export default 'hello!'` and `export default 1 + 2`. This also 'works' for `export default thing`, but since `thing` is treated as an expression it causes `thing` to be passed by value. It's as if it's assigned to a hidden variable before it's exported, and as such, when `thing` is assigned a new value in the `setTimeout`, that change isn't reflected in the hidden variable that's actually exported.

So:

```js
// These give you a live reference to the exported thing(s):
import { thing } from './module.js';
import { thing as otherName } from './module.js';
import * as module from './module.js';
const module = await import('./module.js');
// This assigns the current value of the export to a new identifier:
let { thing } = await import('./module.js');

// These export a live reference:
export { thing };
export { thing as otherName };
// These export the current value:
export default thing;
export default 'hello!';
```

# And 'export { thing as default }' is different

Since you can't use `export {}` to export values directly, it always passes a live reference. So:

```js
// module.js
let thing = 'initial';

export { thing, thing as default };

setTimeout(() => {
  thing = 'changed';
}, 500);
```

And the same `./main.js` as before:

```js
// main.js
import { thing, default as defaultThing } from './module.js';
import anotherDefaultThing from './module.js';

setTimeout(() => {
  console.log(thing); // "changed"
  console.log(defaultThing); // "changed"
  console.log(anotherDefaultThing); // "changed"
}, 1000);
```

Unlike `export default thing`, `export { thing as default }` exports `thing` as a live reference. So:

```js
// These give you a live reference to the exported thing(s):
import { thing } from './module.js';
import { thing as otherName } from './module.js';
import * as module from './module.js';
const module = await import('./module.js');
// This assigns the current value of the export to a new identifier:
let { thing } = await import('./module.js');

// These export a live reference:
export { thing };
export { thing as otherName };
export { thing as default };
// These export the current value:
export default thing;
export default 'hello!';
```

Fun eh? Oh, we're not done yet…

# 'export default function' is another special case

I said that the bit after `export default` is treated like an expression, but there are exceptions to that rule. Taking:

```js
// module.js
export default function thing() {}

setTimeout(() => {
  thing = 'changed';
}, 500);
```

And:

```js
// main.js
import thing from './module.js';

setTimeout(() => {
  console.log(thing); // "changed"
}, 1000);
```

It logs `"changed"`, because `export default function` is given its own special semantics; the function _is_ passed by reference in this case. If we change `module.js` to:

```js
// module.js
function thing() {}

export default thing;

setTimeout(() => {
  thing = 'changed';
}, 500);
```

…it no longer matches the special case, so it logs `ƒ thing() {}`, as it's passed by value again.

## But… why?

It isn't just `export default function` – `export default class` is special-cased in the same way. It's to do with how these statements change behaviour when they're expressions:

```js
function someFunction() {}
class SomeClass {}

console.log(typeof someFunction); // "function"
console.log(typeof SomeClass); // "function"
```

But if we make them expressions:

```js
(function someFunction() {});
(class SomeClass {});

console.log(typeof someFunction); // "undefined"
console.log(typeof SomeClass); // "undefined"
```

`function` and `class` statements create an identifier in the scope/block, whereas `function` and `class` _expressions_ do not (although their names can be used internal to the function/class).

So:

```js
export default function someFunction() {}
console.log(typeof someFunction); // "function"
```

If `export default function` wasn't special-cased, then the function would be treated as an expression, and the log would be `"undefined"`. Special-casing functions also helps with circular dependencies, but I'll get onto that shortly.

To sum up:

```js
// These give you a live reference to the exported thing(s):
import { thing } from './module.js';
import { thing as otherName } from './module.js';
import * as module from './module.js';
const module = await import('./module.js');
// This assigns the current value of the export to a new identifier:
let { thing } = await import('./module.js');

// These export a live reference:
export { thing };
export { thing as otherName };
export { thing as default };
export default function thing() {}
// These export the current value:
export default thing;
export default 'hello!';
```

This kinda makes `export default identifier` the odd one out. I get that `export default 'hello!'` needs to be passed by value, but since there's a special case that makes `export default function` passed by reference, it feels like there should be a special case for `export default identifier` too. I guess it's too late to change it now.

I had a chat with [Dave Herman](https://twitter.com/littlecalculist) about this, who was involved in the design of JavaScript modules. He said that some earlier designs of default exports were in the form `export default = thing`, which would have made it more obvious that `thing` is treated as an expression. I agree!

# What about circular dependencies?

This came to light when Dominic messaged me about circular dependencies. First we need to talk about 'hoisting':

## Hoisting

You might have encountered the age-old weird thing JavaScript does to functions:

```js
thisWorks();

function thisWorks() {
  console.log('yep, it does');
}
```

Function definitions are essentially moved to the top of the file. That only really happens with plain function declarations:

```js
// Doesn't work
assignedFunction();
// Doesn't work either
new SomeClass();

const assignedFunction = function () {
  console.log('nope');
};
class SomeClass {}
```

If you try to access a `let`/`const`/`class` identifier before it's instantiated, it throws an error.

## var is different

…because of course it is.

```js
var foo = 'bar';

function test() {
  console.log(foo);
  var foo = 'hello';
}

test();
```

The above logs `undefined`, because the declaration of `var foo` in the function is hoisted to the start of the function, but the assignment of `'hello'` is left where it is. This was seen as a bit of a gotcha, which is why `let`/`const`/`class` throw an error in similar cases.

## What about circular dependencies?

Circular dependencies are allowed in JavaScript, but they're messy and should be avoided. For example, with:

```js
// main.js
import { foo } from './module.js';

foo();

export function hello() {
  console.log('hello');
}
```

And:

```js
// module.js
import { hello } from './main.js';

hello();

export function foo() {
  console.log('foo');
}
```

This works! It logs `"hello"` then `"foo"`. However, this only works due to hoisting, which lifts both function definitions above both of their calls. If we change the code to:

```js
// main.js
import { foo } from './module.js';

foo();

export const hello = () => console.log('hello');
```

And:

```js
// module.js
import { hello } from './main.js';

hello();

export const foo = () => console.log('foo');
```

…it fails. `module.js` executes first, and as a result it tries to access `hello` before it's instantiated, and throws an error.

Let's get `export default` involved with:

```js
// main.js
import foo from './module.js';

foo();

function hello() {
  console.log('hello');
}

export default hello;
```

And:

```js
// module.js
import hello from './main.js';

hello();

function foo() {
  console.log('foo');
}

export default foo;
```

This is the example Dominic gave me. The above fails, because `hello` in `module.js` points to the hidden variable exported by `main.js`, and it's accessed before it's initialized.

If `main.js` is changed to use `export { hello as default }`, it doesn't fail, because it's passing the function by reference and gets hoisted. If `main.js` is changed to use `export default function hello()`, again it doesn't fail, but this time it's because it hits that super-magic-special-case of `export default function`.

I suspect this is another reason `export default function` was special-cased; to make hoisting work as expected. But again, it feels like `export default identifier` should have been special-cased in the same way for consistency.

So there you go! I learned something new. But, as with my last few posts, please don't add this to your interview questions, just avoid circular dependencies 😀.

<small>Huge thanks to [Toon Verwaest](https://twitter.com/tverwaes), [Marja Hölttä](https://twitter.com/marjakh), and [Mathias Bynens](https://twitter.com/mathias) from the V8 team for making sure I'm using the correct terminology throughout this post, [Dave Herman](https://twitter.com/littlecalculist) and [Daniel Ehrenberg](https://twitter.com/littledan) for giving me some of the history around this, proof-readers [Surma](https://twitter.com/DasSurma), [Adam Argyle](https://twitter.com/argyleink), [Ada Rose Cannon](https://twitter.com/AdaRoseCannon), [Remy Sharp](https://twitter.com/rem), [Lea Verou](https://twitter.com/LeaVerou) (heh, I got a lot of folks to read this, I wanted it to make as much sense as possible) and of course thanks to [Dominic Elm](https://twitter.com/elmd_) for triggering this whole adventure!</small>
