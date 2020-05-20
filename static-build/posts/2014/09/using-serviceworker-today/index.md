---
title: Using ServiceWorker in Chrome today
date: 2014-09-24 00:25:27
summary: The implementation for ServiceWorker has been landing in Chrome Canary
  over the past few months, and there's now enough of it to do some cool shit!
mindframe: ''
image: null
meta: ''
---

The implementation for ServiceWorker has been landing in Chrome Canary over the past few months, and there's now enough of it to do some cool shit!

<figure class="full-figure">
<img src="asset-url:./cool-shit.png" alt style="margin: 20px auto">
<figcaption>Unnecessary representation of "cool shit"</figcaption>
</figure>

# What is ServiceWorker?

ServiceWorker is a background worker, it gives us a JavaScript context to add features such as push messaging, background sync, geofencing and network control.

In terms of network control, it acts like a proxy server sitting on the client, you get to decide what to do on a request-by-request basis. You can use this to make stuff work faster, offline, or build new features.

I'm biased, but I think ServiceWorker changes the scope of the web more than any feature since XHR.

If you want more of an overview on ServiceWorker, check out:

- [ServiceWorker is coming, look busy](https://www.youtube.com/watch?v=SmZ9XcTpMS4) - 30min talk
- [Is ServiceWorker ready?](https://jakearchibald.github.io/isserviceworkerready/) - feature support status across browsers
- [ServiceWorker first draft](/2014/service-worker-first-draft/) - blog post
- [ServiceWorker API](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorker_API) - on MDN

# In Canary today

Google & Mozilla are actively developing ServiceWorker. The developer tooling in Canary makes it easier to use at the moment, but expect Firefox to ([catch up soon](https://bugzilla.mozilla.org/show_bug.cgi?id=1058644)).

If you want to hack around with ServiceWorker, open [Chrome Canary](https://www.google.co.uk/intl/en/chrome/browser/canary.html), go to `chrome://flags` and enable "experimental Web Platform features". Give the browser a restart, and you're ready to go!

<figure class="full-figure">
<img src="asset-url:./about-flags.png" alt>
<figcaption>Enable experimental Web Platform features</figcaption>
</figure>

By playing with this today, you'll become one of the first developers in the world to do. You may create some cool shit, but there's also a chance you'll step in some uncool shit. If that happens, [please file bugs](https://code.google.com/p/chromium/issues/list). If you're unsure if you've found a bug or some unexpected-but-correct behaviour, comment on this article (demos of the issue will help massively).

# Demos

Check out [ServiceWorkersDemos](https://github.com/w3c-webmob/ServiceWorkersDemos#basic-demos), which includes things like [offline-first news](https://offline-news-service-worker.herokuapp.com/), a [clientside wiki](https://sandropaganotti.github.io/service-worker-wiki/), and [some trains](https://jakearchibald.github.io/trained-to-thrill/).

## Trained-to-thrill

[The trains one](https://jakearchibald.github.io/trained-to-thrill/) in particular highlights the performance benefits of ServiceWorker. Not only does it work offline, it feels lightning-fast on any connection. Here's a comparrison on a connection throttled to 250kbits:

<figure class="full-figure">
<div class="video"><iframe src="//www.youtube.com/embed/px-J9Ghvcx4?rel=0&amp;html5=1" frameborder="0" allowfullscreen></iframe></div>
<figcaption>Without vs with ServiceWorker</figcaption>
</figure>

With the ServiceWorker, we get to first-render over a second faster, and our first render includes images, which takes 16 seconds without ServiceWorker. They're cached images of course, but ServiceWorker allows us to present a fully-rendered view while we go to the network for latest content.

# Getting started

To begin, you need to register for a ServiceWorker from your page:

```js
navigator.serviceWorker.register('/worker.js').then(
  function (reg) {
    console.log('◕‿◕', reg);
  },
  function (err) {
    console.log('ಠ_ಠ', err);
  },
);
```

As you can see, `.register` take a URL for your worker script and returns a promise. The ServiceWorker script must be on the same origin as your page.

If you're new to promises, check out the [HTML5Rocks article](http://www.html5rocks.com/en/tutorials/es6/promises/) - I use visits to this to justify my employment, so thanks!

You can also limit the scope of the ServiceWorker to a subset of your origin:

```js
navigator.serviceWorker
  .register('/worker.js', {
    scope: '/trained-to-thrill/',
  })
  .then(
    function (reg) {
      console.log('◕‿◕', reg);
    },
    function (err) {
      console.log('ಠ_ಠ', err);
    },
  );
```

This is particularly useful for origins that contain many separate sites, such as Github pages.

## HTTPS only

Using ServiceWorker you can hijack connections, respond differently, & filter responses. Powerful stuff. While you would use these powers for good, a man-in-the-middle might not. To avoid this, you can only register for ServiceWorkers on pages served over HTTPS, so we know the ServiceWorker the browser receives hasn't been tampered with during its journey through the network.

Github Pages are served over HTTPS, so they're a great place to host demos.

# Devtools

It's early days for Chrome's ServiceWorker devtools, but what we have today is better than we ever had with AppCache. Go to `chrome://serviceworker-internals`, you'll get a list of all the ServiceWorker registrations the browser is aware of along with the state of each worker within it. Click "Inspect" to open a devtools window for the worker, this allows you to set breakpoints & test code in the console.

<figure class="full-figure">
<img src="asset-url:./serviceworker-internals.png" alt>
<figcaption>chrome://serviceworker-intervals</figcaption>
</figure>

- **Installation Status** - This is useful during updates.
- **Running Status / Start / Stop** - The ServiceWorker closes when it isn't needed to save memory, this gives you control over that.
- **Sync/Push** - These fire events in the ServiceWorker. They're not particularly useful right now.
- **Inspect** - Launch a devtools window for the worker. This lets you set breakpoints & interact with the console.
- **Unregister** - Throw the ServiceWorker away.
- **Opens the DevTools window … on start** - What it says on the tin. Useful for debugging startup issues.

Also, shift+refresh loads the current page without the ServiceWorker, this is useful for checking CSS and page script changes without having to wait for a background update.

# worker.js

Let's start with:

```js
// The SW will be shutdown when not in use to save memory,
// be aware that any global state is likely to disappear
console.log('SW startup');

self.addEventListener('install', function (event) {
  console.log('SW installed');
});

self.addEventListener('activate', function (event) {
  console.log('SW activated');
});

self.addEventListener('fetch', function (event) {
  console.log('Caught a fetch!');
  event.respondWith(new Response('Hello world!'));
});
```

Now if you navigate to your page, the SW above should install & activate. Refreshing the page will cause the SW to take over the page and respond "Hello world". [Here's a demo](https://jakearchibald.github.io/isserviceworkerready/demos/manual-response/).

**You won't see the above console logs in your page**, they happen within the worker itself. You can launch a devtools window for the worker from `chrome://serviceworker-internals`.

## event.respondWith

This is what you call to hijack the fetch and respond differently. It must be called synchronously, passing in a `Response` or a promise that resolves to one. If you don't call it, you get normal browser behaviour.

You'll likely get your response from:

- `new Response(body, opts)` - manually created as above. This API is in the [fetch spec](https://fetch.spec.whatwg.org/#response-class).
- `fetch(urlOrRequest)` - the network. This API is also in the [fetch spec](https://fetch.spec.whatwg.org/#fetch-method).
- `caches.match(urlOrRequest)` - the cache. We'll pick this up later in the article.

`event.request` gives you information about the request, so you can do what you want per request. Also, since `match` and `fetch` are promise-based, you can combine them. Fallback from cache, to network, to a manually created response, for instance.

# Updating your ServiceWorker

The lifecycle of a ServiceWorker is based on Chrome's update model: Do as much as possible in the background, don't disrupt the user, complete the update when the current version closes.

Whenever you navigate to page within scope of your ServiceWorker, the browser checks for updates in the background. If the script is byte-different, it's considered to be a new version, and installed (note: only the script is checked, not external `importScripts`). However, the old version remains in control over pages until all tabs using it are gone. Then the old version is garbage collected and the new version takes over.

This avoids the problem of two versions of a site running at the same time, in different tabs. Our current strategy for this is ["cross fingers, hope it doesn't happen"](https://twitter.com/jaffathecake/status/502779501936652289).

You navigate through this using the install & activate events:

## install

This is called when the browser sees this version of the ServiceWorker for the first time. You can pass a promise to `event.waitUntil` to extend this part of the lifecycle:

```js
self.addEventListener('install', function (event) {
  console.log('Installing…');

  event.waitUntil(
    somethingThatReturnsAPromise().then(function () {
      console.log('Installed!');
    }),
  );
});
```

If the promise rejects, that indicates installation failure, and this ServiceWorker will become redundant and be garbage collected.

This all happens in the background while an existing version remains in control. You're not disrupting the user, so you can do some heavy-lifting. Fetch stuff from the network, populate caches, get everything ready. Just don't delete/move anything that would disrupt the current version.

The installing worker can take over immediately if it wants, kicking the old version out by calling `event.replace()`, although this isn't implemented in Chrome yet.

By default, the old version will remain in control until no pages are open within its scope.

## activate

This happens when the old version is gone. Here you can make changes that would have broken the old version, such as deleting old caches and migrating data.

```js
self.addEventListener('activate', function (event) {
  console.log('Activating…');

  event.waitUntil(
    somethingThatReturnsAPromise().then(function () {
      console.log('Activated!');
    }),
  );
});
```

`waitUntil` is here too. Fetch (and other) events will be delayed until this promise settles. This may delay the load of a page & resources, so use `install` for anything that can be done while an old version is still in control.

## On navigate

When a new document is loaded, it decides which ServiceWorker it will use for its lifetime. So when you first visit an origin, and it registers, installs, & activates a ServiceWorker, the page won't be controlled by this worker until the next navigate (or refresh). The exception is if the worker calls `event.replace()` in the install event, then it takes control of all in-scope pages immediately.

`navigator.serviceWorker.controller` points to the ServiceWorker controlling the page, which is null if the page isn't controlled.

## In practice:

Here's how that looks:

<figure class="full-figure">
<div class="video"><iframe src="//www.youtube.com/embed/VEshtDMHYyA?rel=0&amp;html5=1" frameborder="0" allowfullscreen></iframe></div>
<figcaption>Updating a ServiceWorker</figcaption>
</figure>

And [here's the code](https://github.com/jakearchibald/isserviceworkerready/tree/master/www/demos/slow-update). In that demo I'm forcing install/activate to take 5 seconds.

Unfortunately refreshing a single tab isn't enough to allow an old worker to be collected and a new one take over. Browsers make the next page request before unloading the current page, so there isn't a moment when current active worker can be released. We're looking to solve this issue with some special-casing, or a "Replace" button in serviceworker-internals.

The easiest way at the moment is to close & reopen the tab (cmd+w, then cmd+shift+t on Mac), or shift+reload then normal reload.

# The Cache

ServiceWorker comes with a caching API, letting you create stores of responses keyed by request. The entry point, `caches`, is present in Canary, but it isn't useful yet. In the mean time, [check out the polyfill](https://github.com/coonsta/cache-polyfill).

```js
importScripts('serviceworker-cache-polyfill.js');

self.addEventListener('install', function (event) {
  // pre cache a load of stuff:
  event.waitUntil(
    cachesPolyfill.open('myapp-static-v1').then(function (cache) {
      return cache.addAll([
        '/',
        '/styles/all.css',
        '/styles/imgs/bg.png',
        '/scripts/all.js',
      ]);
    }),
  );
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    cachesPolyfill.match(event.request).then(function (response) {
      return response || fetch(event.request);
    }),
  );
});
```

[Trained-to-thrill](https://github.com/jakearchibald/trained-to-thrill/blob/master/www/static/js-unmin/sw/index.js) manages caches dynmanically and at install time to create its offline-first experience.

The cache polyfill is backed by IndexedDB, so you can kinda sorta use devtools to see what's in the cache.

<figure class="full-figure">
<img src="asset-url:./idb-cache.png" alt>
<figcaption>Cache polyfill in IndexedDB</figcaption>
</figure>

# Rough edges & gotchas

As I said earlier, this stuff is really new. Here's a collection of issues that get in the way. Hopefully I'll be able to delete this section in the coming weeks, in fact I've deleted loads since I originally posted this article.

## fetch() doesn't send credentials by default

When you use `fetch`, those request won't contain credentials such as cookies. If you want credentials, instead call:

```js
fetch(url, {
  credentials: 'include',
});
```

This behaviour is on purpose, and is arguably better than XHR's more complex default of sending credentials if the URL is same-origin, but omiting them otherwise. Fetch's behaviour is more like other CORS requests, such as `<img crossorigin>`, which never sends cookies unless you opt-in with `<img crossorigin="use-credentials">` However, I'm concerned this is going to catch developers out. Interested to hear your feedback on this!

## fetch() is only available in ServiceWorkers

`fetch` should be available in pages, but Chrome's implementation isn't. The cache API should also be available from pages too, but the polyfill depends on `fetch`, so that too is ServiceWorker-only for the moment. [Here's the ticket](https://code.google.com/p/chromium/issues/detail?id=408041).

This got in the way a little when building Trained-To-Thrill. I wanted to fetch content from the cache while fetching the same content from the network (the search feed from Flickr). I did this by making two XHR requests, but adding a made-up header to one so I could tell them apart when they hit the ServiceWorker.

## The cache polyfill cannot store opaque responses

```js
self.addEventListener('fetch', function (event) {
  if (/\.jpg$/.test(event.request.url)) {
    event.respondWith(
      fetch('https://www.google.co.uk/….gif', {
        mode: 'no-cors',
      }),
    );
  }
});
```

[The above works fine](https://jakearchibald.github.io/isserviceworkerready/demos/img-rewrite/), even though the image doesn't have CORS headers. It's an opaque response, you can use it in response to requests that don't require CORS (such as `<img>`), but you cannot get access to the response's content with JavaScript.

You can also store these responses in the cache for later use, however this isn't possible with the polyfill, which depends on JavaScript access to the response.

No workarounds for this, we need to wait for the native implementation.

## If installation fails, we're not so good at telling you about it

If a worker registers, but then doesn't appear in serviceworker-internals, it's likely it failed to install due an error being thrown, or a rejected promise being passed to `event.waitUntil`.

To work around this, check "Opens the DevTools window for ServiceWorker on start for debugging", and put a `debugger;` statement at the start of your install event. This, along with "Pause on uncaught exceptions", should reveal the issue.

# Over to you

Developer feedback at this point is crucial. It lets us catch not only issues with our implementation, but also design issues with ServiceWorker itself.

File [bugs against Chrome](https://code.google.com/p/chromium/issues/list), bugs [against the spec](https://github.com/slightlyoff/ServiceWorker/issues), or leave a comment below. Let us know what works & what doesn't!
