---
title: Service worker meeting notes
date: 2016-08-04 08:57:44
summary: On July 28th-29th we met up in the Mozilla offices in Toronto to
  discuss the core service worker spec. here are the headlines…
mindframe: "- using my year's quota of bullets in one post"
image: ""
meta: ""

---

On July 28th-29th we met up in the Mozilla offices in Toronto to discuss the core service worker spec. I'll try and cover the headlines here.

Before I get stuck in to the meaty bits of the meeting, our intent here is to do what's best for developers and the future of the web, so if you disagree with any of this, please make your voice heard. You can do this in the relevent GitHub issue, in the comments below, or [email me](mailto:jakearchibald@google.com) if you don't want to comment publicly.

# Attendees

* **Mozilla** - Ben Kelly, Ehsan Akhgari, Andrew Sutherland, Tom Tung
* **Microsoft** - Ali Alabbas
* **Apple** - Brady Eidson, Theresa O'Connor, Sam Weinig
* **Google** - Jake Archibald, Marijn Kruisselbrink, Kenji Baheux
* **Samsung** - Jungkee Song
* **Facebook** - Nathan Schloss

# Multiple service worker instances for parallelisation

**This is the big one**, so if you only have time to give feedback on one thing, make it this thing.

* The service worker shuts down when it isn't in use to save resources, this means its global scope is unreliable.
* At the moment implementations will only run one instance of your active worker at once.
* **Change:** We're considering allowing the browser to run multiple concurrent instances of a service worker.

If your page makes hundreds of requests (which may be best-practice in HTTP/2) we have to dispatch hundreds of fetch events. We don't have to wait for a response to each before we dispatch the next, but JavaScript is still single threaded, so we have to wait for each event callback to return before we can dispatch the next. This isn't true if we can run multiple instances of the service worker.

Apple and Microsoft are particularly keen on this from a performance point of view, and Mozilla feel it would simplify their implementation.

This is an idea [we've been throwing around for years](https://github.com/slightlyoff/ServiceWorker/issues/756), but given this isn't how browsers currently work, it could break some existing assumptions. Although the global scope is unreliable over medium periods of time, events that happen in quick succession are (currently) likely to happen in the same service worker instance, so the global scope becomes somewhat reliable. This multi-instance change would break that.

If you need a single global to coordinate things, you could use `SharedWorker`. No browser supports `SharedWorker` inside a service worker yet, but it's on our TODO list. The shared worker would shut down once all of its connected clients shut down, so it would have a lifecycle similar to service workers today.

## Over to you

So what we want to know is:

* Are you maintaining global state within the service worker?
* Would this change break your stuff?
* If so, could you use a more persistent storage like shared workers / IndexedDB instead?

Answers [on the issue](https://github.com/slightlyoff/ServiceWorker/issues/756) please!

# Changing update-checking to behave as expected

* We respect the `max-age` on service worker scripts & their imported scripts, but only up to a maximum of 24 hours to avoid lock-in.
* Respecting `max-age` seems to catch developers out, especially on places like GitHub pages where a `max-age` is set and you cannot change it.
* Some developers, notably from larger sites, find max-age useful for service worker scripts to stagger the rollout of new service workers.
* **Change:** We're planning to ignore `max-age` for service worker scripts & their imports, but provide an opt-in for the current behaviour. [[issue](https://github.com/slightlyoff/ServiceWorker/issues/893)]

Also:

* When we check the SW for updates, we only check the top level script, not things imported via `importScripts`.
* This also seems to catch developers out, and service worker library developers find it particularly annoying because they lose control of the update cycle of their library.
* It's likely to catch more people out as we start using JS modules.
* **Change:** We're going to include imported scripts as part of the update check, so a service worker is considered 'new' if it or any of its imported scripts are byte different. [[issue](https://github.com/slightlyoff/ServiceWorker/issues/839#issuecomment-236256162)] 

# Providing an opt-in concurrent fetch

* The service worker comes with a startup cost for the very first request. It's around 250ms right now, we can reduce it a lot, but it'll always be > 0.
* Native apps have a similar problem, and work around it by sending a simple UDP ping to the server while they're starting up.
* **New feature:** 
    * We could do something similar, like an opt-in concurrent fetch for navigations, which is surfaced as `fetchEvent.concurrentResponse`.
    * Headers can be added to this, so the server knows it isn't a regular request.

Here's a sketch of what the API could look like:

## In the page

```js
navigator.serviceWorker.register('/sw.js').then(reg => {
  // Yeah we'll come up with better names…
  reg.fetchManager.addNavigationConcurrentRequest({
    addHeaders: {'Return-Middle-Only': 'Yep'}
  });
});
```

## In the service worker

```js
self.addEventListener('fetch', event => {
  if (isArticleRequest) {
    const header = caches.match('/header.inc');
    const footer = caches.match('/footer.inc');
    // concurrentResponse is a promise
    const body = event.concurrentResponse || fetch(event.request, {
      headers: {'Return-Middle-Only': 'Yep'}
    });

    const stream = createMergedStream(header, body, footer);

    event.respondWith(new Response(stream, {
      headers: {'Content-Type': 'text/html'}
    }));
    return;
  }
});
```

Today, the fetch for the body of the page is delayed by the service worker startup & execution time. With this new feature it isn't, it can happen during SW startup, or maybe even during startup of large parts of the browser (while launching from homescreen).

If you have any opinions on this, drop them [in the issue](https://github.com/slightlyoff/ServiceWorker/issues/920).

# Fetch event & clients

* A "client" is a context with its own security policy, as in documents & workers.
* `fetchEvent.clientId` - the client ID that initiated the request.
* **New feature:**
    * `fetchEvent.reservedClientId` - the client ID that the response will create (unless the response is a network error or `Content-Disposition`).
    * `fetchEvent.targetClientId` - the client ID that this response will replace.

At the moment there's only `fetchEvent.clientId`, which is the client ID that initiated the request or `undefined` for navigation fetches. This feels really inconsistent, so we're fixing that while providing developers with as much information as we can.

In the case of:

```html
<a href="foo.html" target="bar">Click me!</a>
```

…each client ID is different. In this case:

```js
self.addEventListener('fetch', event => {
  event.clientId; // the page containing the link element
  event.reservedClientId; // the client of foo.html's document
  event.targetClientId; // the client of whatever's in the window named "bar", if anything

  // postMessage to reserved clients is buffered until the client exists
  event.waitUntil(
    clients.get(event.reservedClientId)
      .then(client => client.postMessage("Hey there!"))
  )
});
```

Client IDs will be undefined if they don't apply (eg an `<img>` doesn't have a reserved or target client) or the client is cross-origin. If you have any comments, [let us know](https://github.com/slightlyoff/ServiceWorker/issues/870#issuecomment-208487588)!

# Dropping "opener" for service worker pages

* Following a `target="_blank"` link from an HTTP page to an HTTPS page means the HTTPS is not considered a secure context. This is because the HTTPS page has a channel back to the HTTP page via `window.opener`.
* This means the otherwise secure HTTPS page won't be able to use things like geolocation and service worker. This means, depending on how you get to your site, it may not work offline. We think this creates a really odd user experience.
* No browser does this yet, but it's what the [Secure Contexts spec](https://w3c.github.io/webappsec-secure-contexts/) says.
* In future you'll be able to use a header to "disown" `window.opener` so you'll remain a secure context no matter how you were loaded. [[issue](https://github.com/w3c/webappsec/issues/517)]
* …unfortunately a response header is too late for service worker, since it needs to decide whether it should trigger a fetch event for this request.
* **Change:** If browsers go ahead and comply with this part of security contexts, we plan to auto-disown opener for service worker controlled pages if the opener is not a secure context, meaning the service worker (and geolocation and such) will work no matter how you're linked to. [[issue](https://github.com/slightlyoff/ServiceWorker/issues/890)]

Wow I love bullet points.

# Handling failed requests

* If you `respondWith` to a navigation request and fail to provide a valid response, you'll get a browser error page.
* **Change:** We're going to help these errors be less generic. [[issue](https://github.com/whatwg/fetch/issues/352)]
* Also, it was suggested that browsers should auto-retry without the service worker in this case. [[issue](https://github.com/slightlyoff/ServiceWorker/issues/892)]
* Other developers I've spoken to don't like the "magic" of this.
* Instead we're going to leave this to browsers. If an error is generated in the service worker, the browser can provide a "Retry without service worker" button (using language that user would actually understand).
* **Some thinking is happening:** We're throwing around ideas for how to better recover from fetch errors. [[issue](https://github.com/slightlyoff/ServiceWorker/issues/939)]

The main problem is that there's no easy way to know if the browser will happily take a response you give it. Eg things will fail post-service worker if you provide an opaque response to something that requires a non-opaque response (CORS). An `isResponseAcceptable` method would help here, or maybe a global `fetcherror` event is better.

# Fetches from within a service worker that should go via a fetch event

* At the moment all fetches made within a service worker bypass the service worker. This is how we avoid infinite loops.
* This isn't great for `registration.showNotification(…)`, as icons should ideally work offline.
* **Change:** We're going to special-case notification so it triggers a fetch event. [[issue](https://github.com/whatwg/fetch/issues/303)]

We may do the same for other APIs in future. Let us know if there's an API we should do this for! 

# Range requests

This is a pretty minor thing, but I find it interesting…

* We need to spec when browsers make ranged requests and which responses are acceptable, specifically in terms of security.
* All browsers should improve their handling of HTTP 200 responses when it comes to media.
* We're not making range-specific changes to cache API matching yet, but may in future. [[issue](https://github.com/slightlyoff/ServiceWorker/issues/913)]
* If you need to generate ranged responses from a full response, [you already can](https://github.com/jakearchibald/range-request-test/blob/master/static/sw.js#L3).
* **Change**: We're going to prevent 206 responses entering the cache, we may later come up with special behaviour of this. [[issue](https://github.com/slightlyoff/ServiceWorker/issues/937)]

## Adding ranged requests & responses to the HTML spec

The way browsers use ranges is completely unspecified, so we need to sort that out. Like most unspecced things, it's a bit of a cross-browser nightmare. Specifically, we should fix browsers so they accept HTTP 200 correctly in response to a ranged request, which the HTTP spec mandates, but I did some quick testing and the reality is [all over the place](https://docs.google.com/document/d/1SphP-WNxqzZrSv_6ApC9_FpM-m_tLzm57oL3SNGg-40/edit#).

As part of this spec work, we need to [prevent the service worker responding with multiple opaque ranges from different request URLs](https://github.com/slightlyoff/ServiceWorker/issues/703) if this can be used to break the origin model. As in, if a CSS resource is requested in three ranged parts, we can't let those be:

* `html { background: url('`
* Your private messages
* `');}`

…else you'd be able to use `window.getComputedStyle` to read someone's emails.

The only web things I'm aware of that generate range requests are `<audio>` and `<video>` (and I guess resumable downloads), so it's not exploitable as above, but we need to spec when range requests can be made, and that a given resource won't accept ranges from cross-origin locations it wasn't expecting. Only the thing initiating the request can know this, so these changes need to be in the HTML spec, not the fetch or service worker spec.

We've been fixing these security issues in browsers as we've implemented service worker, but the how-tos for this need to live in the spec rather than deep in the comments of GitHub issues.

Yeah ok, maybe I'm the only person who finds this interesting.

# Minor things

* **Change:** `caches.match(request)` currently generates a HEAD response from a stored GET if `request.method` is HEAD. This isn't how the HTTP cache works, so it will now fail to match & resolve with undefined. [[issue](https://github.com/slightlyoff/ServiceWorker/issues/710#issuecomment-235896038)]
* **Change:** We're removing `client.frameType` until we get better use cases. `client.ancestorOrigins` solves a lot of similar cases and provides more detail. [[issue](https://github.com/slightlyoff/ServiceWorker/issues/732)]
* **Brains be thinkin':** Early ideas for a `clientcontrolled` event, since this can happen without a fetch when iframes are reattached to a document, or a page is fetched from the bfcache. Also a `clientuncontrolled` event to match. Let us know if this is useful to you & why. [[issue](https://github.com/slightlyoff/ServiceWorker/issues/886)]
* **Change:** We're removing `fetchEvent.isReload` in favour of `fetchEvent.request.cache` which communicates the browser's intended interaction with the HTTP cache. [[issue](https://github.com/slightlyoff/ServiceWorker/issues/875)]
* **I dunno, does this count as a change?:** We plan on splitting the cache API into its own spec. Hopefully this will help communicate that it's available on window objects too. We'll do this the next time we're making a major change/addition to the cache API. [[issue](https://github.com/slightlyoff/ServiceWorker/issues/879)]
* **Possible change:** We're debating the ordering of results in `clients.matchAll`, the intent is to return clients with the most relevent first, but the current specced behaviour (most-recently-focused) isn't easily doable for Apple. [[issue](https://github.com/slightlyoff/ServiceWorker/issues/887)]
* **Change:** Throwing within an event handler shouldn't have any special meaning. At the moment, in Chrome, a throw during the dispatch of the install event will prevent install happening, but no other event behaves like this so we're going to change it. I'm a little worried about this. [[issue](https://github.com/slightlyoff/ServiceWorker/issues/896)]
* **Change:** We're aware that copying a request with minor changes is tough right now & full of edge cases. We're working to make this easier. [[issue](https://github.com/whatwg/fetch/issues/245#issuecomment-236268491)]

# Related links

* [Full meeting notes](https://gist.github.com/jakearchibald/c65009efa2ed9dbe3ad38f5fef5a4ef1) - we took notes in IRC, this is the log. Massive thanks to Kenji for note-taking!
* [Agenda](https://github.com/slightlyoff/ServiceWorker/issues/932) - follow links to the various issues to see resolutions, but I've summarised the important bits in this post

Phew! I think I need a lie down after all that.