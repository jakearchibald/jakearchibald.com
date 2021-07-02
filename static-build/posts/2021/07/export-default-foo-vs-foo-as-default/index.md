---
title: '`export default val` is different to `export { val as default }`'
date: 2021-07-05 01:00:00
summary: Here's how they differ, and when it matters…
meta: Here's how they differ, and when it matters…
#image: 'asset-url:./img.png'
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
  console.log(importedThing, module.thing, thing);
}, 1000);
```

This logs `"changed", "changed", "initial"` because imports are live references. The destructured import works differently because destructuing assigns the current value to a new identifier rather than a live reference.

It's similar to how this works:

```js
const obj = { foo: 'bar' };

// This is shorthand for:
// let foo = obj.foo;
let { foo } = obj;

obj.foo = 'hello';
console.log(foo); // Still "bar"
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
  console.log(thing, defaultThing, anotherDefaultThing);
}, 1000);
```

This logs `"changed", "initial", "initial"`, and that was news to me!

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

To make the `export default 'hello!'` thing work, the [spec defines it](https://tc39.es/ecma262/#sec-identifiers-static-semantics-boundnames) as:

```
ExportDeclaration : export default AssignmentExpression ;
```

Because it's an `AssignmentExpression`, you're assigning a value to the default, rather than passing it by reference. This means it behaves more like the destructured import from earlier.

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

And:

```js
// main.js
import { thing, default as defaultThing } from './module.js';
import anotherDefaultThing from './module.js';

setTimeout(() => {
  console.log(thing, defaultThing, anotherDefaultThing);
}, 1000);
```

…logs `"changed", "changed", "changed"`. Fun eh? Oh, we're not done yet…

# But 'export default function' is a special case

The spec has a special case for this, so:

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
  console.log(thing);
}, 1000);
```

…logs `"changed"`, because `export default function` is treated differently; the function is passed by reference. If we change `module.js` to:

```js
// module.js
function thing() {}

export default thing;

setTimeout(() => {
  thing = 'changed';
}, 500);
```

…it no longer matches the special case, so it logs `ƒ thing() {}`, as it's an `AssignmentExpression` again.

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
doesntWorker();
// Doesn't work either
new DoesntWork();

const doesntWork = function () {
  console.log('nope');
};
class DoesntWork {}
```

In fact, if you try to access a `let`/`const`/`class` identifier before it's declared, it's a parse error.

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

The above logs `undefined`, because the declaration of `var foo` in the function is hoisted, but the assignment is left where it is.

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

…it fails. `module.js` would execute first, and as a result it tries to access `hello` before it's declared, triggering a parse error.

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

This is the example Dominic messaged me with. The above fails, because `hello` is accessed before it's declared, and that's down to how `export default` works like an assignment.

If `main.js` used `export { hello as default }`, it doesn't fail, because it's passing the function by reference and gets hoisted. If `main.js` used `export default function hello()`, again it doesn't fail, but this time it's because it hits that super-magic-special-case of `export default function`.

So there you go! I learned something new. But, as with my last few posts, please don't add this to your interview questions, just avoid circular dependencies 😀.
