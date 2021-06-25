---
title: In JS functions, the 'last' return wins
date: 2021-06-24 01:00:00
summary: An edge case has convinced me it's the 'last' return that always wins…
meta: An edge case has convinced me it's the 'last' return that always wins…
image: 'asset-url:./img.png'
mindframe: and I apologise in advance
---

In JavaScript functions, which `return` wins?

```js
function test() {
  return 'one';
  return 'two';
  return 'three';
}
```

You might say, "well it's the first one", but I'm going to try and convince you it's the _last one_.

Don't worry, the function above definitely returns `'one'`, but in this case the first return statement prevents the others from executing. The _last_ return is `return 'one'`, and that's the one that wins. Sure, it's also the first return, but I'm still right. _[folds arms and looks smug]_

I know what you're thinking, you're thinking "shut up jake", but bear with me…

# Finally

`finally` is a thing:

```js
function finallyTest() {
  try {
    console.log('one');
    return 'three';
  } catch (err) {
    console.log('error');
  } finally {
    console.log('two');
  }
}

console.log(finallyTest());
console.log('four');
```

The above logs `'one'`, `'two'`, `'three'`, `'four'`. The `finally` block always runs after a `try`/`catch`, even if the `try` or `catch` return.

I hadn't used `finally` much in JavaScript until recently, where I find myself using it like this in async functions:

```js
async function someAsyncThing() {
  startSpinner();

  try {
    await asyncWork();
  } catch (err) {
    if (err.name === 'AbortError') return;
    showErrorUI();
  } finally {
    stopSpinner();
  }
}
```

Anyway, the exciting thing about `finally` is it gives us the opportunity to **return many times from a single function call**:

```js
function manyHappyReturns() {
  try {
    return 'one';
  } finally {
    try {
      return 'two';
    } finally {
      return 'three';
    }
  }
}
```

…and the result of calling `manyHappyReturns()` is `'three'`.

_The last return always wins._ Not the last to appear in the function, no, that would be mad, but the last _execute_. The last return wins in the same way the last variable assignment wins; we don't count variable assignments that don't happen. In fact, it's spec'd very much like an assignment. The `return` assigns a conclusion to the function, so a `return` overrides a previous `return`. The same happens in Java and Python too. Thanks to [Daniel Ehrenberg](https://twitter.com/littledan/status/1407883941634359298) for making me aware of this little quirk!

As a side-effect, returning from `finally` clears a thrown error:

```js
function catchThis() {
  try {
    throw Error('boom');
  } finally {
    return 'phew';
  }
}
```

The result of calling `catchThis()` is `'phew'`.

## What's the practical application of this?

There isn't one. Thanks for reading! Please never quiz folks about this in a job interview.

# Bonus: Promises

Async functions behave the same as above (aside from returning a promise). However, `promise.finally()` behaves differently:

```js
const promise = Promise.resolve('one').finally(() => 'two');
```

Here, `promise` fulfils with `'one'`. This is probably because promise reactions are callbacks, and the caller of a callback (which is the promise in this case) has no way of telling the difference between a function that runs `return undefined` and one that doesn't run `return` at all. Since it can't mimic the `finally` edge case above, it just ignores it.

Although, `promise.finally` does impact _when_ the promise resolves:

```js
const wait = (ms) => new Promise((r) => setTimeout(() => r(), ms));

const promise = Promise.resolve('one').finally(async () => {
  await wait(2000);
  return 'two';
});
```

In this case `promise` still fulfils with `'one'`, but it takes two seconds to do so.
