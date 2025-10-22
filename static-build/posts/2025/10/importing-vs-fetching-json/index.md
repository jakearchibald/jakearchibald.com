---
title: Importing vs fetching JSON
date: 2025-10-22 01:00:00
summary: They behave differently, so make sure you pick the right one.
meta: They behave differently, so make sure you pick the right one.
image: './img.png'
---

This year, [JSON module imports became baseline 'newly available'](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import/with), meaning they're implemented across browser engines.

```js
import data from './data.json' with { type: 'json' };

// And…

const { default: data } = await import('./data.json', {
  with: { type: 'json' },
});
```

I'm glad JavaScript has this feature, but I can't see myself using it in a browser environment, other than small demos. It comes down to the behaviour differences with this:

```js
const response = await fetch('./data.json');
const data = await response.json();
```

Here's why…

# Error handling

With a static import:

```js
import data from './data.json' with { type: 'json' };
```

If the above fails, it takes the whole module graph down with it. Because of this, I'd never use this pattern with some third-party JSON, as I'd want to be able to provide a fallback if the third-party service fails.

But `import()` allows exactly that:

```js
try {
  const { default: data } = await import(url, {
    with: { type: 'json' },
  });
} catch (error) {
  // Fallback logic
}
```

This is pretty good. Although the `fetch()` alternative:

```js
try {
  const response = await fetch('./data.json');
  const data = await response.json();
} catch (error) {
  // Fallback logic
}
```

…allows much more introspection in event of a failure. There's `response.status`, or you can use `response.text()`, meaning you still have the source if JSON parsing fails. Maybe that doesn't matter in all cases.

I think the bigger issue is…

# Caching and garbage collection

When you import a module (be it JS, WASM, CSS, or JSON), it's cached for the lifetime of the environment (e.g. a page or worker), even if the result is a network or parsing failure. All imports for a given specifier & type return the same module.

This is generally a good thing, as it means your JS module returns the same objects every time, and state can be shared across all importers. But if you're doing something like:

```js
const { default: results } = await import('/api/search?q=whatever', {
  with: { type: 'json' },
});
```

…then you have a memory leak, because each set of search results will live in the module graph for the life of the page. That isn't the case with `fetch()`, where returned objects can be garbage collected once they're out of reference.

The same applies to cases like:

```js
let { default: largeData } = await import('/large-data.json', {
  with: { type: 'json' },
});

const someSmallPart = largeData.slice(0, 10);
largeData = null;
```

If the above used `fetch()`, then the data other than `someSmallPart` could be garbage collected. But with `import()`, the whole `largeData` object remains in memory for the life of the page.

# When should JSON modules be used?

It makes sense to use JSON module imports for local static JSON resources where you need all/most of the data within. Particularly since bundlers can understand JSON imports, and bundle the object with other modules. That isn't possible with `fetch()`, unless you use some pretty hacky plugins.

In server code, I might import `package.json` to get the version number. However, I wouldn't do this with frontend code, as it's wasteful to bundle all of `package.json` just to get a single value – bundlers don't perform tree-shaking of individual object keys.

**Update:** [Jed points out](https://mastodon.social/@jed/115418637695312552) that [esbuild has an option](https://esbuild.github.io/content-types/#json) at allows you to import JSON as if each top level key is individually exported, and in this case it will tree-shake. You could make a fairly trivial plugin to make the same work for Rollup/Vite. It still requires you to use the right kind of import, though.

Generally, I'd write a Vite/Rollup plugin to extract just the data I needed at build time (with Vite, [the define option](https://vite.dev/config/shared-options.html#define) is handy).

I'm glad this feature exists, but it should be used with care, and not as a blanket replacement for `fetch()`ing JSON.
