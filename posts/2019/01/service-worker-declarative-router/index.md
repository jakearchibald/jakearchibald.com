---
title: A declarative router for service workers
date: 2019-01-07 14:19:11
mindframe: ""
summary: We're thinking of adding a declarative router to service workers, and
  we want feedback.
meta: ""

---

**I'm looking for feedback on this API. It isn't yet supported in any standard or browser.**

In the very early days of service workers (while they were still named "navigation controllers") we [had the idea of a declarative router](https://github.com/w3c/ServiceWorker/commit/5c26b561c5d737591a118a4db94135f5ac6e1ea7). This provided a high-level API to define the behaviour of particular routes, so the service worker wouldn't need to be started. We dropped the idea because we didn't want to optimise for things without clear evidence of what needed optimising, and we didn't want to design high-level APIs before common behaviours became clear.

Well, 5 years later, things are somewhat clearer now, and it seems like we'd benefit from something like this. But, I'd like you to be the judge.

# The proposal

The idea is you can define routes during the `install` event of the service worker:

```js
addEventListener('install', (event) => {
  const router = event.router;

  router.get(
    new RouterIfURLStarts('/avatars/'),
    [new RouterSourceCache(), new RouterSourceNetwork()],
  );

  router.get(
    new RouterIfURLEnds('.mp4', { ignoreSearch: true }),
    new RouterSourceNetwork(),
  );

  router.get(
    new RouterIfURL('/', { ignoreSearch: true }),
    new RouterSourceCache('/shell.html'),
  );
  // …
});
```

The above defines three routes. The first matches `GET` requests for URLs that begin `/avatars/`, and looks for a match in the cache, and failing that, goes to the network.

The second matches `GET` requests for URLs that end `.mp4` (ignoring any query string), and goes straight to the network.

The third matches `GET` requests for `/` (ignoring any query string) and serves a particular item from the cache.

For any fetch that would usually trigger a `fetch` event in a particular service worker, the routes would be checked in the order they were declared. If the conditions of a particular route are met, then that route will be used instead of triggering a `fetch` event.

These routes are scoped to this service worker. If you update the service worker to one without any routes, all the routes are gone. This is different to things like the cache API and IndexedDB, which live independently of the service worker.

## router.add, router.get

```js
router.add(conditions, sources);
router.get(conditions, sources);
```

`conditions` is a single condition, or an array of conditions for this route. All conditions must match for the route to be used.

`sources` is a single source, or an array of sources. A source is somewhere the service worker should attempt to get a response from. Each is tried in sequence until a response is found, and that response is used.

`router.get` is the same as `router.add`, except it includes the condition that the request must use the `GET` method.

## Conditions

I'm not sure which conditions we'd want to launch with, but here are a few I have in mind:

### RouterIfMethod

```js
router.add(
  new RouterIfMethod('POST'),
  // …
);
```

A condition that checks the method of the request.

### RouterIfURL

```js
router.add(
  new RouterIfURL(url, { ignoreSearch }),
  // …
);
```

A condition that checks the URL of the request. The whole URL must match, although the query string is ignored if `ignoreSearch` is true. If `url` is not absolute, it's resolved against the URL of the service worker.

### RouterIfURLStarts

```js
router.add(
  new RouterIfURLStarts(url),
  // …
);
```

A condition that checks if the URL of the request starts with `url`. If `url` is not absolute, it's resolved against the URL of the service worker. This means `/articles/` will match a same-origin request to `/articles/2019/css/`.

### RouterIfURLEnds

```js
router.add(
  new RouterIfURLEnds(end, { ignoreSearch }),
  // …
);
```

A condition that checks if the URL of the request ends with `end`. This means `new RouterIfURLEnds('.jpg', { ignoreSearch: true })` will match requests to any origin where the path ends `.jpg`.

### RouterIfDate

```js
router.add(
  new RouterIfDate({ from, to })
  // …
);
```

A condition that checks the current UTC date. `from` defaults to 0, `to` defaults to infinity.

This kinda feels like an edge case to me, but it's something Facebook are very interested in. They want to use it to 'expire' an old service worker. Eg, if the service worker is 5 days old, go straight to the network for everything.

### Combining conditions

```js
router.add(
  [
    new RouterIfURLStarts('/'),
    new RouterIfURLEnds('.jpg', { ignoreSearch: true }),
  ]
  // …
);
```

The above matches same-origin requests with a path that ends `.jpg`.

### Shortcuts

It might be intuitive to allow strings to be used as conditions:

* `'/'` means `new RouterIfURL('/', { ignoreSearch: true })`.
* `'/articles/*'` means `new RouterIfURLStarts('/articles/')`.
* `'*.jpg'` means `new RouterIfURLEnds('.jpg', { ignoreSearch: true })`.

This means you could do:

```js
router.get('/', new RouterSourceCache('/shell.html'));
router.get('*.mp4', new RouterSourceNetwork());
```

## Sources

Again, this is something that can be expanded over time. Here are a few:

### RouterSourceNetwork

```js
router.add(
  conditions,
  new RouterSourceNetwork({ request, requireOkStatus }),
);
```

Try to get a response from the network. The current request will be used, although you can provide your own using the `request` option.

A 404 will be treated as a successful response, unless `requireOkStatus` is true.

### RouterSourceCache

```js
router.add(
  conditions,
  new RouterSourceCache({ request, cacheName, ignoreSearch, ignoreMethod, ignoreVary }),
);
```

Try to get a response from the cache API. The current request will be used, although you can provide your own using the `request` option. The rest of the options are the same as `caches.match`.

### RouterSourceFetchEvent

```js
router.add(
  conditions,
  new RouterSourceFetchEvent({ id }),
);
```

If a router matches, it's used instead of dispatching a `fetch` event. `RouterSourceFetchEvent` allows you to override this and fire a `fetch` event. For example:

```js
addEventListener('install', (event) => {
  event.router.get('/articles/*', [
    new RouterSourceCache({ ignoreSearch: true }),
    new RouterSourceFetchEvent({ id: 'article-not-in-cache' }),
  ]);
  // …
});

addEventListener('fetch', (event) => {
  if (event.routerDispatchId === 'article-not-in-cache') {
    // Get the article from the network & cache it
  }
  // …
});
```

I haven't thought much about the naming of `routerDispatchId`, but you get the picture. This allows you to fall back to JS logic in cases the router can't handle.

# Goals

Ok, that's the proposal. Here's the requirements that led me to the above design:

## Handle fetches without starting the service worker

Right now, each request from a controlled page dispatches a `fetch` event in the service worker. This means each request results in executing JS, which may also incur the cost of starting up the service worker.

If you're responding from the cache, you make a net performance gain, but if the service worker requests the response from the network (which is the default action without a service worker), then the service worker start-up and execution time is a waste.

Declarative routes allow you to avoid this cost for requests where the logic is simple and common.

However, this means the route logic needs to work without running JavaScript, that's why the proposal uses things like `RouterIfURL` rather than plain if statements. It also means we can't use callbacks.

Things like RegExp are tricky as there's currently no definition for how they could work without JavaScript. This is complicated further when you [consider the state held within a RegExp object](https://jsbin.com/weqahapeho/edit?js,console). Also, writing URL paths in RegExp suuuuuuucks `/\/wtf\/is\/this\//`.

## Be composable

I've been looking at APIs like Express and Workbox when designing this.

Looking at [`registerRoute` in Workbox](https://developers.google.com/web/tools/workbox/reference-docs/latest/workbox.routing#.registerRoute), I wanted to avoid the pattern where the 'handler' is in-between two conditions. Instead, I want to group the conditions together at the start.

I also wanted to avoid [separate strategies](https://developers.google.com/web/tools/workbox/reference-docs/latest/workbox.strategies) for "network first", "network only", "cache first" etc etc. Instead, by having a network and a cache source, you can achieve all of these patterns by changing the combination and order.

## Be a layer on top of the 'fetch' event

You shouldn't be able to do anything with the router that you can't already do within a `fetch` event. If we want to add new behaviours, we should add them at a lower level first.

This means the router can be polyfilled as a `fetch` event listener.

## Avoid nibbling at the problem

We took a swing at some performance issues with [navigation preload](https://developers.google.com/web/updates/2017/02/navigation-preload). I'm still happy with this API, as it's pretty low-level. However, I'm worried about adding a series of APIs that deal with individual performance issues.

For example:

```js
addEventListener('install', (event) => {
  event.router.get(
    new RouterIfDate({ to: Date.now() + fiveDays }),
    new RouterSourceNetwork(),
  );
  event.router.get('*.mp4', new RouterSourceNetwork());
});
```

…could instead be something like:

```js
addEventListener('install', (event) => {
  event.expireFetchEvent(Date.now() + fiveDays);

  event.addPathExclusion({
    method: 'GET',
    endsWith: '.mp4'
  });
});
```

…where we battle each use-case with a separate API. However, the composability of the router feels like it would cover more use-cases and involve fewer independent moving parts for developers to learn.

## Avoid state across service workers

The router could be stored along with the service worker registration, and be mutated from both pages and service workers (this is now [navigation preload](https://developers.google.com/web/updates/2017/02/navigation-preload) works).

However, this would create a footgun where service worker v1 adds some routes, v2 removes some, v3 adds some more… if the user jumps from v1 to v3 they could end up in a broken state that's really hard to debug. You'd probably need an upgrade system similar to IndexedDB to prevent this, and if you're looking to IndexedDB for API guidance… well it's probably best to rethink.

So yeah, I think it's important to tie the state to a single service worker. Routes would need to be defined before the `install` event completes, so the routes a service worker activates with are the same throughout its life.

# Feedback please!

Is this an API you'd be happy using? Is it something you'd use even if you weren't trying to optimise for a particular performance problem? Is there anything missing?

The goal isn't to replace the `fetch` event, we're only trying to avoid it for common cases where the execution of the service worker outweighs its result.

Leave your comments below, or if you want to dive into more of the technical details [see the GitHub thread](https://github.com/w3c/ServiceWorker/issues/1373#issuecomment-451436409).

**Update:** I've also explored [a similar API that doesn't involve as many constructors](https://github.com/w3c/ServiceWorker/issues/1373#issuecomment-452247362).
