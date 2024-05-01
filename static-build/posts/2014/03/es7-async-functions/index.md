---
title: ES7 async functions
date: 2014-03-27 00:00:40
summary:
  They're brilliant. They're brilliant and I want laws changed so I can
  marry them.
mindframe: "- hey at least it's not another progressive enhancement article"
image: null
meta: ''
---

They're brilliant. They're brilliant and I want laws changed so I can marry them.

**Update:** This feature is now shipping in browsers. I've written a more [up-to-date and in-depth guide](https://developers.google.com/web/fundamentals/getting-started/primers/async-functions).

# Async with promises

In the [HTML5Rocks article on promises](http://www.html5rocks.com/en/tutorials/es6/promises/#toc-parallelism-sequencing), the final example show how you'd load some JSON data for a story, then use that to fetch more JSON data for the chapters, then render the chapters in order as soon as they arrived.

The code looks like this:

```js
function loadStory() {
  return getJSON('story.json')
    .then(function (story) {
      addHtmlToPage(story.heading);

      return story.chapterURLs
        .map(getJSON)
        .reduce(function (chain, chapterPromise) {
          return chain
            .then(function () {
              return chapterPromise;
            })
            .then(function (chapter) {
              addHtmlToPage(chapter.html);
            });
        }, Promise.resolve());
    })
    .then(function () {
      addTextToPage('All done');
    })
    .catch(function (err) {
      addTextToPage('Argh, broken: ' + err.message);
    })
    .then(function () {
      document.querySelector('.spinner').style.display = 'none';
    });
}
```

Not bad, but…

# This time with ES7 async functions…

```js
async function loadStory() {
  try {
    let story = await getJSON('story.json');
    addHtmlToPage(story.heading);
    for (let chapter of story.chapterURLs.map(getJSON)) {
      addHtmlToPage((await chapter).html);
    }
    addTextToPage('All done');
  } catch (err) {
    addTextToPage('Argh, broken: ' + err.message);
  }
  document.querySelector('.spinner').style.display = 'none';
}
```

With async functions ([full proposal](https://github.com/lukehoban/ecmascript-asyncawait)), you can `await` on a promise. This halts the function in a non-blocking way, waits for the promise to resolve & returns the value. If the promise rejects, it throws with the rejection value, so you can deal with it using `catch`.

**Edit:** I originally used `await` within an arrow function, [apparently that's not allowed](https://twitter.com/mraleph/status/449192750735704065) so I've replaced it with a `for` loop. Domenic gave me a knowledge smack-down on [why `await` can't be used in arrow functions](https://github.com/lukehoban/ecmascript-asyncawait/issues/7).

`loadStory` returns a promise, so you can use it in other async functions.

```js
(async function () {
  await loadStory();
  console.log('Yey, story successfully loaded!');
})();
```

# Until ES7 arrives…

You can use async functions and other ES6/7 features today using the [Traceur transpiler](http://goo.gl/Dc6V1B). Also, you can use ES6 generators to create something akin to async functions.

You need a small bit of library code, [a spawn function](https://gist.github.com/jakearchibald/31b89cba627924972ad6). Then you can use generators similar to async functions:

```js
function loadStory() {
  return spawn(function* () {
    try {
      let story = yield getJSON('story.json');
      addHtmlToPage(story.heading);
      for (let chapter of story.chapterURLs.map(getJSON)) {
        addHtmlToPage((yield chapter).html);
      }
      addTextToPage('All done');
    } catch (err) {
      addTextToPage('Argh, broken: ' + err.message);
    }
    document.querySelector('.spinner').style.display = 'none';
  });
}
```

In the above, I'm passing a generator function to `spawn`, you can tell it's a generator because for the asterisk in `function *()`. The `spawn` function calls `.next()` on the generator, receives the promise at the `yield` call, and waits for it to resolve before calling `.next()` with the result (or `.throw()` if it rejects).

ES7 brings the spawn function into the spec and makes it even easier to use. Having a standard way to simplify async coding like this is fantastic!

# Further reading

- [JavaScript promises, there and back again](http://www.html5rocks.com/en/tutorials/es6/promises/) - guide to promises
- [`Promise.resolve()` is not the opposite of `Promise.reject()`](/2014/resolve-not-opposite-of-reject/) - a common misunderstanding with promises
