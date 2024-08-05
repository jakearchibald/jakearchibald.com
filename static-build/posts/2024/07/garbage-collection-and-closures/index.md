---
title: Garbage collection and closures
date: 2024-07-30 01:00:00
summary: GC within a function doesn't work how I expected
meta: GC within a function doesn't work how I expected
image: './img.png'
---

Me, [Surma](https://twitter.com/DasSurma), and [Jason](https://twitter.com/_developit) were hacking on a thing, and discovered that garbage collection within a function doesn't quite work how we expected.

```js
function demo() {
  const bigArrayBuffer = new ArrayBuffer(100_000_000);
  const id = setTimeout(() => {
    console.log(bigArrayBuffer.byteLength);
  }, 1000);

  return () => clearTimeout(id);
}

globalThis.cancelDemo = demo();
```

With the above, `bigArrayBuffer` is leaked forever. I didn't expect that, because:

- After a second, the function referencing `bigArrayBuffer` is no longer callable.
- The returned cancel function doesn't reference `bigArrayBuffer`.

But that doesn't matter. Here's why:

# JavaScript engines are reasonably smart

This doesn't leak:

```js
function demo() {
  const bigArrayBuffer = new ArrayBuffer(100_000_000);
  console.log(bigArrayBuffer.byteLength);
}

demo();
```

The function executes, `bigArrayBuffer` is no longer needed, so it's garbage collected.

This also doesn't leak:

```js
function demo() {
  const bigArrayBuffer = new ArrayBuffer(100_000_000);

  setTimeout(() => {
    console.log(bigArrayBuffer.byteLength);
  }, 1000);
}

demo();
```

In this case:

1. The engine sees `bigArrayBuffer` is referenced by inner functions, so it's kept around. It's associated with the scope that was created when `demo()` was called.
1. After a second, the function referencing `bigArrayBuffer` is no longer callable.
1. Since nothing within the scope is callable, the scope can be garbage collected, along with `bigArrayBuffer`.

This also doesn't leak:

```js
function demo() {
  const bigArrayBuffer = new ArrayBuffer(100_000_000);

  const id = setTimeout(() => {
    console.log('hello');
  }, 1000);

  return () => clearTimeout(id);
}

globalThis.cancelDemo = demo();
```

In this case, the engine knows it doesn't need to retain `bigArrayBuffer`, as none of the inner-callables access it.

# The problem case

Here's where it gets messy:

```js
function demo() {
  const bigArrayBuffer = new ArrayBuffer(100_000_000);

  const id = setTimeout(() => {
    console.log(bigArrayBuffer.byteLength);
  }, 1000);

  return () => clearTimeout(id);
}

globalThis.cancelDemo = demo();
```

This leaks, because:

1. The engine sees `bigArrayBuffer` is referenced by inner functions, so it's kept around. It's associated with the scope that was created when `demo()` was called.
1. After a second, the function referencing `bigArrayBuffer` is no longer callable.
1. But, the scope remains, because the 'cancel' function is still callable.
1. `bigArrayBuffer` is associated with the scope, so it remains in memory.

I thought engines would be smarter, and GC `bigArrayBuffer` since it's no longer referenceable, but that isn't the case.

```js
globalThis.cancelDemo = null;
```

_Now_ `bigArrayBuffer` can be GC'd, since nothing within the scope is callable.

This isn't specific to timers, it's just how I encountered the issue. For example:

```js
function demo() {
  const bigArrayBuffer = new ArrayBuffer(100_000_000);

  globalThis.innerFunc1 = () => {
    console.log(bigArrayBuffer.byteLength);
  };

  globalThis.innerFunc2 = () => {
    console.log('hello');
  };
}

demo();
// bigArrayBuffer is retained, as expected.

globalThis.innerFunc1 = undefined;
// bigArrayBuffer is still retained, as unexpected.

globalThis.innerFunc2 = undefined;
// bigArrayBuffer can now be collected.
```

TIL!

# Updates

## An IIFE is enough to trigger the leak

I originally thought this 'capturing' of values only happened for functions that outlive the initial execution of the parent function, but that isn't the case:

```js
function demo() {
  const bigArrayBuffer = new ArrayBuffer(100_000_000);

  (() => {
    console.log(bigArrayBuffer.byteLength);
  })();

  globalThis.innerFunc = () => {
    console.log('hello');
  };
}

demo();
// bigArrayBuffer is retained, as unexpected.
```

Here, the inner IIFE is enough to trigger the leak.

## It's a cross-browser issue

This whole thing is an issue across browsers, and is unlikely to be fixed due to performance issues.

- [Chromium issue](https://issues.chromium.org/issues/41070945)
- [Firefox issue](https://bugzilla.mozilla.org/show_bug.cgi?id=894971)
- [WebKit issue](https://bugs.webkit.org/show_bug.cgi?id=224077)

## I'm not the first to write about this

- [A low level look at why this happens](https://mrale.ph/blog/2012/09/23/grokking-v8-closures-for-fun.html), by Slava Egorov, back in 2012
- [Meteor engineers discover it](https://point.davidglasser.net/2013/06/27/surprising-javascript-memory-leak.html), by David Glasser, in 2013
- [This React-centric look at it](https://schiener.io/2024-03-03/react-closures), by Kevin Schiener, as recently as May 2024.

## And no, this is not due to `eval()`

Folks on [Hacker News](https://news.ycombinator.com/item?id=41111062) and Twitter were quick to point out that this is all because of `eval()`, but it isn't.

Eval is tricky, because it means code can exist within a scope that can't be statically analysed:

```js
function demo() {
  const bigArrayBuffer1 = new ArrayBuffer(100_000_000);
  const bigArrayBuffer2 = new ArrayBuffer(100_000_000);

  globalThis.innerFunc = () => {
    eval(whatever);
  };
}

demo();
```

Are either of the buffers accessed within `innerFunc`? There's no way of knowing. But the browser can statically determine that `eval` is there. This causes a deopt where everything in the parent scopes is retained.

The browser can statically determine this, because `eval` acts kinda like a keyword. In this case:

```js
const customEval = eval;

function demo() {
  const bigArrayBuffer1 = new ArrayBuffer(100_000_000);
  const bigArrayBuffer2 = new ArrayBuffer(100_000_000);

  globalThis.innerFunc = () => {
    customEval(whatever);
  };
}

demo();
```

…the deopt doesn't happen. Because the `eval` keyword isn't used directly, `whatever` will be executed in the global scope, not within `innerFunc`. This is known as 'indirect eval', and [MDN has more on the topic](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval#direct_and_indirect_eval).

This behaviour exists specifically so browsers can limit this deopt to cases that can be statically analysed.
