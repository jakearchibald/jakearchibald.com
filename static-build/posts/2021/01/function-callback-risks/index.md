---
title: Don't use functions as callbacks unless they're designed for it
date: 2021-01-29 01:00:00
summary: …same goes for option objects.
meta: …same goes for option objects.
image: 'asset-url:./img.png'
---

Here's an old pattern that seems to be making a comeback:

```js
// Convert some numbers into human-readable strings:
import { toReadableNumber } from 'some-library';
const readableNumbers = someNumbers.map(toReadableNumber);
```

Where the implementation of `toReadableNumber` is like this:

```js
export function toReadableNumber(num) {
  // Return num as string in a human readable form.
  // Eg 10000000 might become '10,000,000'
}
```

Everything works great until `some-library` is updated, then everything breaks. But it isn't `some-library`'s fault – they never designed `toReadableNumber` to be a callback to `array.map`.

Here's the problem:

```js
// We think of:
const readableNumbers = someNumbers.map(toReadableNumber);
// …as being like:
const readableNumbers = someNumbers.map((n) => toReadableNumber(n));
// …but it's more like:
const readableNumbers = someNumbers.map((item, index, arr) =>
  toReadableNumber(item, index, arr),
);
```

We're also passing the index of the item in the array, and the array itself to `toReadableNumber`. This worked fine at first, because `toReadableNumber` only had one parameter, but in the new version:

```js
export function toReadableNumber(num, base = 10) {
  // Return num as string in a human readable form.
  // In base 10 by default, but this can be changed.
}
```

The developers of `toReadableNumber` felt they were making a backwards-compatible change. They added a new parameter, and gave it a default value. However, they didn't expect that some code would have already been calling the function with three arguments.

`toReadableNumber` wasn't designed to be a callback to `array.map`, so the safe thing to do is create your own function that _is_ designed to work with `array.map`:

```js
const readableNumbers = someNumbers.map((n) => toReadableNumber(n));
```

And that's it! The developers of `toReadableNumber` can now add parameters without breaking our code.

## The same issue, but with web platform functions

Here's an example I saw recently:

```js
// A promise for the next frame:
const nextFrame = () => new Promise(requestAnimationFrame);
```

But this is equivalent to:

```js
const nextFrame = () =>
  new Promise((resolve, reject) => requestAnimationFrame(resolve, reject));
```

This works today because `requestAnimationFrame` only does something with the first argument, but that might not be true forever. A extra parameter might be added, and the above code could break in whatever browser ships the updated `requestAnimationFrame`.

The best example of this pattern going wrong is probably:

```js
const parsedInts = ['-10', '0', '10', '20', '30'].map(parseInt);
```

If anyone asks you the result of that in a tech interview, I recommend rolling your eyes and walking out. But anyway, the answer is `[-10, NaN, 2, 6, 12]`, because [`parseInt` has a second parameter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseInt).

# Option objects can have the same gotcha

Chrome 90 will allow you to use an `AbortSignal` to remove an event listener, meaning a single `AbortSignal` can be used to remove event listeners, [cancel fetches](https://developers.google.com/web/updates/2017/09/abortable-fetch), and anything else that supports signals:

```js
const controller = new AbortController();
const { signal } = controller;

el.addEventListener('mousemove', callback, { signal });
el.addEventListener('pointermove', callback, { signal });
el.addEventListener('touchmove', callback, { signal });

// Later, remove all three listeners:
controller.abort();
```

However, I saw an example where instead of:

```js
const controller = new AbortController();
const { signal } = controller;
el.addEventListener(name, callback, { signal });
```

…they did this:

```js
const controller = new AbortController();
el.addEventListener(name, callback, controller);
```

As with the callback examples, this works _today_, but it might break in future.

An `AbortController` was not designed to be an option object to `addEventListener`. It works right now because the only thing [`AbortController`](https://dom.spec.whatwg.org/#abortcontroller) and the [`addEventListener` options](https://dom.spec.whatwg.org/#dictdef-addeventlisteneroptions) have in common is the `signal` property.

If, say in future, `AbortController` gets a `controller.capture(otherController)` method, the behaviour of your listeners will change, because `addEventListener` will see a truthy value in the `capture` property, and `capture` is a valid option for `addEventListener`.

As with the callback examples, it's best to create an object that's designed to be `addEventListener` options:

```js
const controller = new AbortController();
const options = { signal: controller.signal };
el.addEventListener(name, callback, options);
// Although I find this pattern easier when multiple things
// get the same signal:
const { signal } = controller;
el.addEventListener(name, callback, { signal });
```

And that's it! Watch out for functions being used as callbacks, and objects being used as options, unless they were designed for those purposes. Unfortunately I'm not aware of a linting rule that catches it (edit: looks like there's [a rule that catches some cases](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-array-callback-reference.md), thanks [James Ross](https://twitter.com/CherryJimbo/status/1355190401037180931)!).

# TypeScript doesn't solve this

Edit: When I first posted this, it had a little note at the end showing that TypeScript doesn't prevent this issue, but I still got folks on Twitter telling me to "just use TypeScript", so let's look at it in more detail.

TypeScript [doesn't like this](https://www.typescriptlang.org/play?ts=4.2.0-beta#code/GYVwdgxgLglg9mABAgpgQQE4HMAUBDbARgC5EBnKDGMLASkQG8AoRRCBMuAGxQDou4uAlkK0A3EwC+TJqky4A5AAsUXAQoA0iBQHc4GLgBMF4oA):

```ts
function oneArg(arg1: string) {
  console.log(arg1);
}

oneArg('hello', 'world');
//              ^^^^^^^
// Expected 1 arguments, but got 2.
```

But it's [fine with this](https://www.typescriptlang.org/play?ts=4.2.0-beta#code/GYVwdgxgLglg9mABAgpgQQE4HMAUBDbARgC5EBnKDGMLASkQG8AoRRCBMuAGxQDou4uAlkK0A3EwC+TJqEiwEiKAHc4mLAGE8XLgCM8EANY4Iu0viKkKVGgBpEwgExXK1OogC8APkQA3ODAAJvTMrKY4AOQAFig6cBH2EaoYXIER4lIyKmrYWjr6Rjio6uJAA):

```ts
function twoArgCallback(cb: (arg1: string, arg2: string) => void) {
  cb('hello', 'world');
}

twoArgCallback(oneArg);
```

…even though the result is the same.

Therefore TypeScript is [fine with this](https://www.typescriptlang.org/play?ts=4.2.0-beta&ssl=7&ssc=57&pln=1&pc=1#code/GYVwdgxgLglg9mABFOAlApgQwCaYEYA26AciALZ7oBOAFGOQFyL0XUCUTAzlFTGAOaIA3gChEiAPQTEGKCCpIWiTJ0TdeAxH2WIAFuUxIqWXIXSJgcKmQB0YydICiggIwAGD57eIyMfrqhESgg4MnMAcncAGk8Yj3D7YzkFRHDwgG4RAF8RERCwbkRjHHwiUlYqVQBeRABtFyjEACZGgGYAXRsyTAAHGhQMErNyyio2dKA):

```ts
function toReadableNumber(num): string {
  // Return num as string in a human readable form.
  // Eg 10000000 might become '10,000,000'
  return '';
}

const readableNumbers = [1, 2, 3].map(toReadableNumber);
```

If `toReadableNumber` changed to add a second _string_ param, [TypeScript would complain](https://www.typescriptlang.org/play?ts=4.2.0-beta&ssl=7&ssc=57&pln=1&pc=1#code/GYVwdgxgLglg9mABFOAlApgQwCaYEYA26AciALZ7oBOAFGOQFyL0XUA0iA7gBaZToA3akwDOUKjDABzAJSjxkqYgDeAKESIA9JsQYoIKkhaJMIxGInTEkk4m7lMSKllyF0iYHCpkAdOq06AKJKAIwADBGRYYhkMFLcUIiUEHBk7gDk4WyR2RHp-s76hojp6QDcqgC+qqopYGKIzjj4RKSsVGYAvIgA2iEcAEwcAMwAuj5kmAAONCgYzW5tlFQyZUA), but that isn't what happened in the example. An additional _number_ param was added, and this [meets the type constraints](https://www.typescriptlang.org/play?ts=4.2.0-beta#code/GYVwdgxgLglg9mABFOAlApgQwCaYEYA26AciALZ7oBOAFGOQFyL0XUA0iA7gBaZToA3akxaUqASiYBnKFRhgA5ogDeAKESIA9JsQYoIKkhaJMUxDLmLE8k4m7lMSKllyF0iYHCpkAdOq06AKJKAIwADBGRYYhkMArcUIiUEHBk7gDk4WyR2RHp-s76hojp6QDcqgC+qqopYDKIzjj4RKSsVGYAvIgA2iEcAEwcAMwAuj5kmAAONCgYzW5tYuJlQA).

Things get worse with the `requestAnimationFrame` example, because this goes wrong after a new version of a _browser_ is deployed, not when a new version of your _project_ is deployed. Additionally, TypeScript DOM types tend to lag behind what browsers ship by months.

I'm a fan of TypeScript, this blog is built using TypeScript, but it does not solve this problem, and probably shouldn't.

Most other typed languages behave differently to TypeScript here, and [disallow casting callbacks in this way](https://dartpad.dev/342c8d1bb4779bd1ff10610bb3e9ac30), but TypeScript's behaviour here is [intentional](https://github.com/Microsoft/TypeScript/wiki/FAQ#why-are-functions-with-fewer-parameters-assignable-to-functions-that-take-more-parameters), otherwise it'd reject the following:

```ts
const numbers = [1, 2, 3];
const doubledNumbers = numbers.map((n) => n * 2);
```

…since the callback given to `map` is cast to a callback with more params. The above is an extremely common pattern in JavaScript, and totally safe, so it's understandable that TypeScript made an exception for it.

The question is "is the function intended to be a callback to `map`?", and in a JavaScript world that isn't really solvable with types. Instead, I wonder if new JS and web functions should throw if they're called with too many arguments. This would 'reserve' additional parameters for future use. We couldn't do it with existing functions, as that would break backwards compatibility, but we could show console warnings for existing functions that we might want to add parameters to later. [I proposed this idea](https://github.com/heycam/webidl/issues/954), but folks don't seem too excited about it 😀.

Things are a bit tougher when it comes to option objects:

```ts
interface Options {
  reverse?: boolean;
}

function whatever({ reverse = false }: Options = {}) {
  console.log(reverse);
}
```

You could say that APIs should warn/fail if the object passed to `whatever` has properties other than `reverse`. But in this example:

```ts
whatever({ reverse: true });
```

…we're passing an object with properties like `toString`, `constructor`, `valueOf`, `hasOwnProperty` etc etc since the object above is an instance of `Object`. It seems too restrictive to require that the properties are 'own' properties (that isn't how it currently works at runtime), but maybe we could add some allowance for properties that come with `Object`.

<small>

Thanks to [my podcast husband](https://http203.libsyn.com/) [Surma](https://twitter.com/DasSurma) for proof-reading and suggestions, and [Ryan Cavanaugh](https://twitter.com/SeaRyanC) for correcting me on the TypeScript stuff.

</small>
