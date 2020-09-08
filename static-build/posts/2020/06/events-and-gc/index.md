---
title: Event listeners and garbage collection
date: 2020-06-12 01:00:00
summary: "Sometimes, leaving event listeners attached to an object feels like an anti-pattern, but sometimes it's fine. Here's how it works…"
mindframe: "- ohh it's been a while"
image: 'asset-url:./post.png'
meta: 'The browser is pretty smart when it comes to GCing listeners…'
---

Imagine a bit of code like this:

```js
async function showImageSize(url) {
  const blob = await fetch(url).then((r) => r.blob());
  const img = await createImageBitmap(blob);
  updateUISomehow(img.width, img.height);
}

btn1.onclick = () => showImageSize(url1);
btn2.onclick = () => showImageSize(url2);
```

This has a race condition. If the user clicks `btn1`, then `btn2`, it's possible that the result for `url2` will arrive before `url1`. This isn't the order the user clicked the buttons, so the user is left looking at incorrect data.

Sometimes the best way to solve this is to queue the two actions, but in this case it's better to 'abort' the previous `showImageSize` operation, because the new operation supersedes it. [`fetch` supports aborting requests](https://developers.google.com/web/updates/2017/09/abortable-fetch), but unfortunately `createImageBitmap` doesn't. However, you can at least exit early and ignore the result. I wrote a little helper for this:

```js
async function abortable(signal, promise) {
  if (signal.aborted) throw new DOMException('AbortError', 'AbortError');
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      signal.addEventListener('abort', () => {
        reject(new DOMException('AbortError', 'AbortError'));
      });
    }),
  ]);
}
```

And here's how you'd use it:

```js
let controller;

async function showImageSize(url) {
  // Abort any previous instance of this
  if (controller) controller.abort();

  try {
    const { signal } = (controller = new AbortController());
    const blob = await fetch(url, { signal }).then((r) => r.blob());
    const img = await abortable(signal, createImageBitmap(blob));
    updateUISomehow(img.width, img.height);
  } catch (err) {
    if (err.name === 'AbortError') return;
    throw err;
  }
}

btn1.onclick = () => showImageSize(url1);
btn2.onclick = () => showImageSize(url2);
```

Problem solved! I [tweeted about it](https://twitter.com/jaffathecake/status/1271382532320264193) and got this reply:

<blockquote class="quote"><p>Isn't this missing { once: true } to not leak the listener?</p>&mdash; <a href="https://twitter.com/felixfbecker/status/1271418446652334081">Felix Becker (@felixfbecker)
</a></blockquote>

And that's a good question!

# What's the problem?

Let's make a more 'extreme' version:

```js
async function abortable(signal, promise) {
  if (signal.aborted) throw new DOMException('AbortError', 'AbortError');

  // Allocate 100mb of memory
  const lotsOfMemory = new Uint8Array(1000 * 1000 * 100);

  return Promise.race([
    promise,
    new Promise((_, reject) => {
      signal.addEventListener('abort', () => {
        // Log it part of it
        console.log('async task aborted', lotsOfMemory[0]);

        reject(new DOMException('AbortError', 'AbortError'));
      });
    }),
  ]);
}
```

In this version, I allocate 100mb of memory in a `Uint8Array`. That object is referenced in the `'abort'` listener, so it needs to stay in memory. But for how long?

`'abort'` may never fire. But also, `'abort'` may fire multiple times.

If you call `controller.abort()` multiple times, the browser will only fire the `'abort'` event once. But it's a regular DOM event, so there's nothing stopping anyone from doing something weird like this:

```js
signal.dispatchEvent(new Event('abort'));
signal.dispatchEvent(new Event('abort'));
signal.dispatchEvent(new Event('abort'));
```

So, is each call of `abortable` leaking 100mb of memory? The original version of `abortable` didn't allocate 100mb of course, but it still adds an event listener to an object. Is that leaking?

# Is it actually a problem?

Let's test it by creating 10 async tasks that just wait around:

```js
const resolvers = [];

async function asyncTask() {
  const controller = new AbortController();

  await abortable(
    controller.signal,
    new Promise((resolve) => {
      resolvers.push(resolve);
    }),
  );

  console.log('async task complete');
}

for (let i = 0; i < 10; i++) asyncTask();
```

And let's poke that with Chrome's DevTools:

<figure class="full-figure max-figure">
<video src="asset-url:./1.mp4" width="1920" height="1080" style="width: 100%; height: auto;" controls></video>
</figure>

And yes, our large objects are hanging around in memory. But that's understandable, because the async task hasn't completed. Let's complete them:

```js
while (resolvers[0]) {
  const resolve = resolvers.shift();
  resolve();
}
```

And see if there's a change:

<figure class="full-figure max-figure">
<video src="asset-url:./2.mp4" width="1920" height="1080" style="width: 100%; height: auto;" controls></video>
</figure>

Yes! All of our objects have been garbage collected. So, the answer is: no, `abortable` doesn't leak.

[Here's the demo I used for the videos](/demos/event-listener-leak/), so you can try it yourself.

# But, why?

Here's a less-code example:

```js
async function abortable(signal, promise) {
  if (signal.aborted) throw new DOMException('AbortError', 'AbortError');
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      signal.addEventListener('abort', () => {
        reject(new DOMException('AbortError', 'AbortError'));
      });
    }),
  ]);
}

async function demo() {
  const controller = new AbortController();
  const { signal } = controller;
  const img = await abortable(signal, someAsyncAPI());
}

demo();
```

The event listener added to `signal`, and everything that listener can access, needs to stay in memory as long as the `'abort'` event can fire. There are two ways it can fire:

- Something calls `signal.dispatchEvent(new Event('abort'))`.
- The browser decides to dispatch the `'abort'` event on `signal`, which only happens the first time `controller.abort()` is called.

While we're waiting for `someAsyncAPI()` to resolve, there are live references to `signal` and `controller` within `demo()`.

But, once `someAsyncAPI()` resolves, `demo()` pops off the stack. It no longer holds references to `signal` or `controller`. With those gone, the browser realises `signal` can no longer receive events, and that event listener will never be called, so it can be garbage collected along with anything it references.

# And that's it!

Browsers are generally pretty smart when it comes to callbacks:

```js
fetch(url).then(
  () => console.log('It worketh!'),
  () => console.log('It didnth!'),
);
```

In this case you have two callbacks, but only one is ever called. The browser knows it can GC both once the promise resolves. Same goes for this:

```js
function demo() {
  const xhr = new XMLHttpRequest();
  xhr.addEventListener('load', () => console.log('It worketh!'));
  xhr.addEventListener('error', () => console.log('It didnth!'));
  xhr.open('GET', url);
  xhr.send();
}
```

Once either `'load'` or `'error'` fires, the browser sets a flag on the `xhr` instance to say "I hereby shall not fire any more events on this object", and since you no longer have a reference to `xhr`, you can't fire events on it either, all the event listeners can be GCed.

These are browser optimisations, rather than spec'd behaviours. If you're unsure if a particular thing will be correctly GCed, test it!
