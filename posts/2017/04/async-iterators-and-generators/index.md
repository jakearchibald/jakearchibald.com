---
title: Async iterators and generators
date: 2017-04-18 15:25:28
mindframe: ""
summary: "[Async iterators](https://github.com/tc39/proposal-async-iteration)
  are arriving soon, and they make reading a stream really easy. Here's how they
  work, and how to make streams iterate…"
meta: Async iterators are arriving soon, and they make reading a stream really
  easy. Here's how they work, and how to make streams iterate…

---

Streaming fetches are supported in Chrome, Edge, and Safari, and they look a little like this:

```js
async function getResponseSize(url) {
  const response = await fetch(url);
  const reader = response.body.getReader();
  let total = 0;

  while (true) {
    const {done, value} = await reader.read();
    if (done) return total;
    total += value.length;
  }
}
```

This code is pretty readable thanks to async functions ([here's a tutorial](https://developers.google.com/web/fundamentals/getting-started/primers/async-functions) if you're unfamiliar with those), but it's still a little clumsy.

Thankfully, [async iterators](https://github.com/tc39/proposal-async-iteration) are arriving soon, which makes it much neater:

```js
async function getResponseSize(url) {
  const response = await fetch(url);
  let total = 0;

  for await (const chunk of response.body) {
    total += chunk.length;
  }
  return total;
}
```

Async iterators are available in Chrome Canary if you launch it with the flag `--js-flags=--harmony-async-iteration`. Here's how they work, and how we can use them to make streams iterate…

# Async iterators

Async iterators work pretty much the same as [regular iterators](https://jakearchibald.com/2014/iterators-gonna-iterate/), but they involve promises:

```js
async function example() {
  // Regular iterator:
  const iterator = createNumberIterator();
  iterator.next(); // Object {value: 1, done: false}
  iterator.next(); // Object {value: 2, done: false}
  iterator.next(); // Object {value: 3, done: false}
  iterator.next(); // Object {value: undefined, done: true}

  // Async iterator:
  const asyncIterator = createAsyncNumberIterator();
  const p = asyncIterator.next(); // Promise
  await p;                    // Object {value: 1, done: false}
  await asyncIterator.next(); // Object {value: 2, done: false}
  await asyncIterator.next(); // Object {value: 3, done: false}
  await asyncIterator.next(); // Object {value: undefined, done: true}
}
```

Both types of iterator have a `.return()` method, which tells the iterator to end early, and do any clean-up it needs to do.

# Iterators & loops

It's fairly uncommon to use iterator objects directly, instead we use the appropriate for loop, which uses the iterator object behind-the-scenes:

```js
async function example() {
  // Regular iterator:
  for (const item of thing) {
    // …
  }

  // Async iterator:
  for await (const item of asyncThing) {
    // …
  }
}
```

The for-of loop will get its iterator by calling `thing[Symbol.iterator]`. Whereas the for-await loop will get its iterator by calling `asyncThing[Symbol.asyncIterator]` if it's defined, otherwise it will fall back to `asyncThing[Symbol.iterator]`.

For-await will give you each value once `asyncIterator.next()` resolves. Because this involves awaiting promises, other things can happen on the main thread during iteration. `asyncIterator.next()` isn't called for the next item until your current iteration is complete. This means you'll always get the items in order, and iterations of your loop won't overlap.

It's pretty cool that for-await falls back to `Symbol.iterator`. It means you can use it with regular iterables like arrays:

```js
async function example() {
  const arrayOfFetchPromises = [
    fetch('1.txt'),
    fetch('2.txt'),
    fetch('3.txt')
  ];

  // Regular iterator:
  for (const item of arrayOfFetchPromises) {
    console.log(item); // Logs a promise
  }

  // Async iterator:
  for await (const item of arrayOfFetchPromises) {
    console.log(item); // Logs a response
  }
}
```

In this case, for-await takes each item from the array and waits for it to resolve. You'll get the first response even if the second response isn't ready yet, but you'll always get the responses in the correct order.

# Async generators: Creating your own async iterator

Just as you can [use generators to create iterator factories](https://jakearchibald.com/2014/iterators-gonna-iterate/#generators), you can use **async generators** to create async iterator factories.

Async generators a mixture of async functions and generators. Let's say we wanted to create an iterator that returned random numbers, but those random numbers came from a web service:

```js
// Note the * after "function"
async function* asyncRandomNumbers() {
  // This is a web service that returns a random number
  const url = 'https://www.random.org/decimal-fractions/?num=1&dec=10&col=1&format=plain&rnd=new';

  while (true) {
    const response = await fetch(url);
    const text = await response.text();
    yield Number(text);
  }
}
```

This iterator doesn't have a natural end – it'll just keep fetching numbers. Thankfully, you can use `break` to stop it:

```js
async function example() {
  for await (const number of asyncRandomNumbers()) {
    console.log(number);
    if (number > 0.95) break;
  }
}
```

**[Live demo](https://jsbin.com/folotu/edit?js,console)**

Like regular generators, you `yield` values, but unlike regular generators you can `await` promises.

Like all for-loops, you can `break` whenever you want. This results in the loop calling `iterator.return()`, which causes the generator to act as if there was a `return` statement after the current (or next) `yield`.

Using a web service to get random numbers is a bit of a silly example, so let's look at something more practical…

# Making streams iterate

Like I mentioned at the start of the article, soon you'll be able to do:

```js
async function example() {
  const response = await fetch(url);

  for await (const chunk of response.body) {
    // …
  }
}
``` 

…but it hasn't been spec'd yet. So, let's write our own async generator that lets us iterate over a stream! We want to:

* Get a lock on the stream, so nothing else can use it while we're iterating.
* Yield the values of the stream.
* Release the lock when we're done.

Releasing the lock is important. If the developer breaks the loop, we want them to be able to continue to use the stream from wherever they left off. So:

```js
async function* streamAsyncIterator(stream) {
  // Get a lock on the stream
  const reader = stream.getReader();

  try {
    while (true) {
      // Read from the stream
      const {done, value} = await reader.read();
      // Exit if we're done
      if (done) return;
      // Else yield the chunk
      yield value;
    }
  }
  finally {
    reader.releaseLock();
  }
}
```

The `finally` clause there is pretty important. If the user breaks out of the loop it'll cause our async generator to return after the current (or next) yield point. If this happens, we still want to release the lock on the reader, and a `finally` is the only thing that can execute after a `return`.

And that's it! Now you can do:

```js
async function example() {
  const response = await fetch(url);

  for await (const chunk of streamAsyncIterator(response.body)) {
    // …
  }
}
```

**[Live demo](https://jsbin.com/codapog/edit?js,console)**

Releasing the lock means you can still control the stream after the loop. Say we wanted to find the byte-position of the first `J` in the HTML spec…

```js
async function example() {
  const find = 'J';
  const findCode = find.codePointAt(0);
  const response = await fetch('https://html.spec.whatwg.org');
  let bytes = 0;

  for await (const chunk of streamAsyncIterator(response.body)) {
    const index = chunk.indexOf(findCode);
    
    if (index != -1) {
      bytes += index;
      console.log(`Found ${find} at byte ${bytes}.`);
      break;
    }
    
    bytes += chunk.length;
  }
  
  response.body.cancel();
}
```

**[Live demo](https://jsbin.com/gucesat/edit?js,console)**

Here we break out of the loop when we find a match. Since `streamAsyncIterator` releases its lock on the stream, we can cancel the rest of it & save bandwidth.

Note that we don't assign `streamAsyncIterator` to `ReadableStream.prototype[Symbol.asyncIterator]`. This would work – allowing us to iterate over streams directly, but it's also messing with objects we don't own. If streams become proper async iterators, we could end up with weird bugs if the spec'd behaviour is different to ours.

# A shorter implementation

You don't need to use async generators to create async iterables, you could create the iterator object yourself. And that's what [Domenic Denicola](https://twitter.com/domenic/) did. Here's his implementation:

```js
function streamAsyncIterator(stream) {
  // Get a lock on the stream:
  const reader = stream.getReader();

  return {
    next() {
      // Stream reads already resolve with {done, value}, so
      // we can just call read:
      return reader.read();
    },
    return() {
      // Release the lock if the iterator terminates.
      reader.releaseLock();
      return {};
    },
    // for-await calls this on whatever it's passed, so
    // iterators tend to return themselves.
    [Symbol.asyncIterator]() {
      return this;
    }
  };
}
```

You can play with all of the above in Chrome Canary today by launching it with the flag `--js-flags=--harmony-async-iteration`. If you want to use them in production today, [Babel can transpile them](https://goo.gl/uRj0CJ).