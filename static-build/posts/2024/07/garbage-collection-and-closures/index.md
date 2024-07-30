---
title: Garbage collection and closures
date: 2024-07-30 01:00:00
summary: GC within a function doesn't work like I expected
meta: GC within a function doesn't work like I expected
image: './img.png'
---

Me, [Surma](https://twitter.com/DasSurma), and [Jason](https://twitter.com/_developit) were hacking on a thing, and discovered that garbage collection within a function doesn't quite work like we expected.

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

1. The engine knows it needs to retain `bigArrayBuffer` beyond the initial execution of the function, so it's kept around. It's associated with the scope that was created when `demo()` was called.
1. After a second, the function referencing `bigArrayBuffer` is no longer callable.
1. Since nothing within the scope is callable, the scope is garbage collected, along with `bigArrayBuffer`.

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

In this case, the engine knows it doesn't need to retain `bigArrayBuffer` beyond the initial execution of the function, as none of the future-callables access it.

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

1. The engine knows it needs to retain `bigArrayBuffer` beyond the initial execution of the function, so it's kept around. It's associated with the scope that was created when `demo()` was called.
1. After a second, the function referencing `bigArrayBuffer` is no longer callable.
1. But, the scope remains, because the cleanup function within is still callable.
1. `bigArrayBuffer` is associated with the scope, so it remains in memory.

I thought engines would be smarter, and GC `bigArrayBuffer` since it's no longer referenceable, but that isn't the case.

```js
globalThis.cancelDemo = null;
```

_Now_ `bigArrayBuffer` is GC'd, since nothing within the scope is callable.

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
