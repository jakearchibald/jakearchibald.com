---
title: Garbage collection and closures
date: 2024-07-30 01:00:00
summary: GC within a function doesn't work like I expected
meta: GC within a function doesn't work like I expected
#image: './img.png'
---

Me, [Surma](https://twitter.com/DasSurma), and [Jason](https://twitter.com/_developit) were hacking on a thing, and discovered that garbage collection within a function doesn't work quite like we expected.

```js
function demo() {
  const massiveArrayBuffer = new ArrayBuffer(1024 * 1024 * 1024);

  const id = setTimeout(() => {
    console.log(massiveArrayBuffer.byteLength);
  }, 1000);

  return () => clearTimeout(id);
}

globalThis.cancelDemo = demo();
```

With the above, `massiveArrayBuffer` is leaked forever. I didn't expect that, because:

- After a second, the function referencing `massiveArrayBuffer` is no longer callable.
- The returned cancel function doesn't reference `massiveArrayBuffer`.

But that doesn't matter. Here's why:

# JavaScript engines are reasonably smart

This doesn't leak:

```js
function demo() {
  const massiveArrayBuffer = new ArrayBuffer(1024 * 1024 * 1024);
  console.log(massiveArrayBuffer.byteLength);
}

demo();
```

The function executes, `massiveArrayBuffer` is no longer needed, so it's garbage collected.

This also doesn't leak:

```js
function demo() {
  const massiveArrayBuffer = new ArrayBuffer(1024 * 1024 * 1024);

  setTimeout(() => {
    console.log(massiveArrayBuffer.byteLength);
  }, 1000);
}

demo();
```

In this case:

1. The engine knows it needs to retain `massiveArrayBuffer` beyond the initial execution of the function, so it's kept around. It's associated with the scope that was created when `demo()` was called.
1. After a second, the function referencing `massiveArrayBuffer` is no longer callable.
1. Since nothing within the scope is callable, the scope is garbage collected, along with `massiveArrayBuffer`.

This also doesn't leak:

```js
function demo() {
  const massiveArrayBuffer = new ArrayBuffer(1024 * 1024 * 1024);

  const id = setTimeout(() => {
    console.log('hello');
  }, 1000);

  return () => clearTimeout(id);
}

globalThis.cancelDemo = demo();
```

In this case, the engine knows it doesn't need to retain `massiveArrayBuffer` beyond the initial execution of the function, as none of the future-callables access it.

# The problem case

```js
function demo() {
  const massiveArrayBuffer = new ArrayBuffer(1024 * 1024 * 1024);

  const id = setTimeout(() => {
    console.log(massiveArrayBuffer.byteLength);
  }, 1000);

  return () => clearTimeout(id);
}

globalThis.cancelDemo = demo();
```

This leaks, because:

1. The engine knows it needs to retain `massiveArrayBuffer` beyond the initial execution of the function, so it's kept around. It's associated with the scope that was created when `demo()` was called.
1. After a second, the function referencing `massiveArrayBuffer` is no longer callable.
1. But, the scope remains, because the cleanup function within is still callable.
1. `massiveArrayBuffer` is associated with the scope, so it remains in memory.

I thought engines would be smarter, and GC `massiveArrayBuffer` since it's no longer referenceable, but that isn't the case.

```js
globalThis.cancelDemo = null;
```

_Now_ `massiveArrayBuffer` is GC'd, since nothing within the scope is callable.

This isn't specific to timers, it's just how I encountered the issue. For example:

```js
function demo() {
  const massiveArrayBuffer = new ArrayBuffer(1024 * 1024 * 1024);

  globalThis.innerFunc1 = () => {
    console.log(massiveArrayBuffer.byteLength);
  };

  globalThis.innerFunc2 = () => {
    console.log('hello');
  };
}

demo();
// massiveArrayBuffer is retained, as expected.

globalThis.innerFunc1 = undefined;
// massiveArrayBuffer is still retained, as unexpected.

globalThis.innerFunc2 = undefined;
// massiveArrayBuffer can now be collected.
```

TIL!
