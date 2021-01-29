---
title: Don't use functions as callbacks unless they're designed for it
date: 2021-01-29 01:00:00
summary: …same goes for option objects.
meta: …same goes for option objects.
image: 'asset-url:./img.png'
---

Here's an old pattern that seems to be making a comeback:

```js
import { toReadableNumber } from 'some-library';
const readableNumbers = someNumbers.map(toReadableNumber);

const nextFrame = () => new Promise(requestAnimationFrame);

const controller = new AbortController();
el.addEventListener(name, callback, controller);
```

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

# Same goes for option objects

Chrome 90 will allow you to use an `AbortSignal` to remove an event listener, meaning a single `AbortSignal` can be used to remove event listeners, cancel fetches, and anything else that's looking for the `abort` event:

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

Watch out for functions being used as callbacks, and objects being used as options, unless they were designed for those purposes. Unfortunately it [isn't something TypeScript warns about](https://www.typescriptlang.org/play?ts=4.2.0-beta#code/PTAEEFQBwJwewLYEsDOBTUAzONQBcALDAOzQA88sYBDBNALgCgBjOYlS0igMRrtAC8oABQBKQQD5QpAO6gACvGTphMNAEcArmg7hiSBNTxI2vWmlEBuIA), and I'm not aware of a linting rule that catches it.
