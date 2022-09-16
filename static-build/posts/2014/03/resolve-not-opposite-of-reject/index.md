---
title: 'Promises: resolve is not the opposite of reject'
date: 2014-03-13 00:00:42
summary:
  When I first started working with promises I had the overly simplistic
  view that passing a value into `reject` would mark the promise as "failed",
  and passing a value into `resolve` would mark it as "successful". However, the
  latter isn't always true.
mindframe: and still refusing to do promise-based puns
image: null
meta: ''
---

When I first started working with promises I had the overly simplistic view that passing a value into `reject` would mark the promise as "failed", and passing a value into `resolve` would mark it as "successful". However, the latter isn't always true.

```js
new Promise((resolve, reject) => {
  resolve(something);
}).then(
  () => console.log('Yey'),
  () => console.log('Boo'),
);
```

Even though we aren't calling `reject()`, the rejection callback `console.log("Boo")` will be called if either:

- `something` is not defined, resulting in an error being thrown, which is caught by the promise and turned into a rejection, or
- `something` is a promise that rejects

So:

```js
new Promise((resolve, reject) => {
  resolve(Promise.reject());
}).catch(() => {
  // This is called
});
```

This is a good thing, as it behaves the same as `Promise.resolve()` and the return value from callbacks:

```js
const promise1 = Promise.resolve(Promise.reject());

const promise2 = Promise.resolve().then(() => {
  return Promise.reject();
});

const promise3 = Promise.reject().catch(() => {
  return Promise.reject();
});
```

All promises above are rejected. When you resolve a value with a "then" method, you're deferring the resolution to the eventual non-promise value.

# In Practice

You can resolve a value without worrying if it's a value, a promise, or a promise that resolves to a promise that resolves to a promise etc etc.

```js
function apiCall(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    if (!url) throw TypeError('apiCall: You must provide a URL');
    resolve(fetch(url, { method }));
  });
}
```

Now `apiCall` will reject if `url` isn't provided, or if `fetch` rejects for whatever reason. You've safely handed off the resolution of the promise onto `fetch`.

# Further reading

- [JavaScript promises, there and back again](https://web.dev/promises/) - guide to promises
- [ES7 async functions](/2014/es7-async-functions/) - use promises to make async code even easier
