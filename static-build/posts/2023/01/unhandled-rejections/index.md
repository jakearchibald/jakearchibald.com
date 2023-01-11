---
title: The gotcha of unhandled promise rejections
date: 2023-01-11 01:00:00
summary: A rough edge with promises that can sneak up on you.
meta: A rough edge with promises that can sneak up on you.
image: 'asset-url:./img.png'
---

Let's say you wanted to display a bunch of chapters on the page, and for whatever reason, the API only gives you a chapter at a time. You could do this:

```js
async function showChapters(chapterURLs) {
  for (const url of chapterURLs) {
    const response = await fetch(url);
    const chapterData = await response.json();
    appendChapter(chapterData);
  }
}
```

This gives the correct result – all the chapters appear in the right order. But, it's kinda slow, because it waits for each chapter to finish fetching before it tries to fetch the next one.

Alternatively, you could do the fetches in parallel:

```js
async function showChapters(chapterURLs) {
  const chapterPromises = chapterURLs.map(async (url) => {
    const response = await fetch(url);
    return response.json();
  });

  const chapters = await Promise.all(chapterPromises);

  for (const chapterData of chapters) appendChapter(chapterData);
}
```

Great! Except, you're now waiting on the last chapter before showing the first.

For the best performance, do the fetches in parallel, but handle them in sequence:

```js
async function showChapters(chapterURLs) {
  const chapterPromises = chapterURLs.map(async (url) => {
    const response = await fetch(url);
    return response.json();
  });

  for await (const chapterData of chapterPromises) {
    appendChapter(chapterData);
  }
}
```

However, this has introduced a tricky bug involving unhandled promise rejections.

# Unhandled promise rejections

Unhandled promise rejections happen when a promise… is rejected… but isn't handled.

Ok ok, they're like the promise equivalent of an uncaught error. Like this:

```js
const promise = Promise.reject(Error('BAD'));
```

The rejected state of this promise is 'unhandled' because nothing is dealing with the rejection.

Here are a few ways it could be handled:

```js
// Like this:
try {
  await promise;
} catch (err) {
  // …
}

// Or this:
promise.catch(() => {
  // …
});

// Or even just this:
await promise;
// In this case the promise is handled,
// but a rejection will be turned into a throw.

// But not this:
promise.then(() => {
  // …
});
// …because it doesn't handle the rejected case,
// it only handles the success case.
```

A promise is handled when something is done in reaction to promise rejection, even if it's creating another rejected promise, or turning a rejected promise into a throw.

Once a promise is rejected, you have until just-after the next processing of microtasks to handle that rejection, else it may count as an unhandled rejection ('may', because there's a little bit of wiggle room with task queuing).

```js
const promise = Promise.reject(Error('BAD'));

// You can handle the promise here
// without it being an 'unhandled rejection'.

queueMicrotask(() => {
  // Or here.
});

setTimeout(() => {
  // But here might be too late.
}, 0);
```

## Unhandled rejections are problematic

Unhandled rejections are a bit like uncaught errors, in that they cause the entire program to exit with an error code in Node and Deno.

In browsers, you get errors appearing in the console, again similar to uncaught errors:

<figure class="full-figure max-figure">
<picture>
  <source type="image/avif" srcset="asset-url:./console.avif" />
  <img src="asset-url:./console.png" width="1598" height="288" alt="In the console: Uncaught (in promise) TypeError: Failed to fetch" style="height: auto" />
</picture>
</figure>

They might also appear in error logging systems, if the system listens for unhandled rejections:

```js
addEventListener('unhandledrejection', (event) => {
  // …Log the error to the server…
});
```

The point is, you want to avoid unhandled rejections.

# But where are the unhandled rejections in the example?

It's not immediately obvious:

```js
async function showChapters(chapterURLs) {
  const chapterPromises = chapterURLs.map(async (url) => {
    const response = await fetch(url);
    return response.json();
  });

  for await (const chapterData of chapterPromises) {
    appendChapter(chapterData);
  }
}
```

The promises in `chapterPromises` are handled by the `for await` in each iteration of the loop. When the loop encounters a rejected promise, it becomes a throw, which abandons the function and rejects the promise `showChapters` returned.

The bug happens if a promise rejects before the `for await` handles that promise, or if that promise is never reached.

For example: If `chapterPromises[0]` takes a long time to resolve, and meanwhile `chapterPromises[1]` rejects, then `chapterPromises[1]` is an unhandled rejection, because the loop hasn't reached it yet.

Or: If `chapterPromises[0]` _and_ `chapterPromises[1]` reject, then `chapterPromises[1]` is an unhandled rejection, because the loop is abandoned before it gets to `chapterPromises[1]`.

Ugh. The "unhandled promise rejection" feature is there so you don't 'miss' rejected promises, but in this case it's a false positive, because the promise returned by `showChapters` already sufficiently captures the success/failure of the operation.

This issue doesn't always involve fetches, it could be any bit of work you start early, then pick up the result later. Like a worker task.

This doesn't always involve `for await` either. It impacts any situation where you start the work early, then handle the result later, asynchronously.

It _wasn't_ an issue for the `Promise.all` example:

```js
async function showChapters(chapterURLs) {
  const chapterPromises = chapterURLs.map(async (url) => {
    const response = await fetch(url);
    return response.json();
  });

  const chapters = await Promise.all(chapterPromises);

  for (const chapterData of chapters) appendChapter(chapterData);
}
```

In this case all the promises in `chapterPromises` are handled immediately, by `Promise.all`, which returns a single promise that's immediately handled by the `await`. But this solution has worse performance than our sequential solution.

# What's the real solution?

Unfortunately it's a bit of a hack. The solution is to immediately mark the promises as handled, before they have a chance to become unhandled rejections.

```js
async function showChapters(chapterURLs) {
  const chapterPromises = chapterURLs.map(async (url) => {
    const response = await fetch(url);
    return response.json();
  });

  // TODO: 'handle' every promise in chapterPromises here

  for await (const chapterData of chapterPromises) {
    appendChapter(chapterData);
  }
}
```

One way to do this is to add a dummy `catch` handler to each promise:

```js
for (const promise of chapterPromises) promise.catch(() => {});
```

Or, a shorter way to achieve the same thing is [`Promise.allSettled`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled):

```js
Promise.allSettled(chapterPromises);
```

This works because `allSettled` handles all the promises you give it, similar to `Promise.all`, but unlike `Promise.all` it never returns a rejected promise itself (unless something is fundamentally wrong with the input iterator).

Both of these look pretty hacky, and likely to confuse others that read the code later. Because of this, I'd probably create a helper function like `markHandled`:

```js
function markHandled(...promises) {
  for (const promise of promises) promise.catch(() => {});
}
```

And comment its usage:

```js
async function showChapters(chapterURLs) {
  const chapterPromises = chapterURLs.map(async (url) => {
    const response = await fetch(url);
    return response.json();
  });

  // Avoid unhandled rejections leaking out of this function.
  // The subsequent `for await` handles all the relevant promises.
  markHandled(...chapterPromises);

  for await (const chapterData of chapterPromises) {
    appendChapter(chapterData);
  }
}
```

I wish there was a less 'blunt' way of handling this in JavaScript, but I'm not sure what that would look like. The design of the "unhandled rejections" feature directly clashes with starting work early and handling the result later, or not handling the result if a prerequisite fails.

<small>For completeness, here's an [abortable implementation of `showChapters`](https://gist.github.com/jakearchibald/8bc2360a6d3f6240d1bad2de375fa92a).</small>
