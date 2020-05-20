---
title: HTTP/2 push is tougher than I thought
date: 2017-05-30 00:36:05
summary: "\"HTTP/2 push will solve that\" is something I've heard a lot when it
  comes to page load performance problems, but I didn't know much about it, so I
  decided to dig in.\r

  \r

  HTTP/2 push is more complicated and low-level than I initially thought, but
  what really caught me off-guard is how inconsistent it is between browsers –
  I'd assumed it was a done deal & totally ready for production."
mindframe: ''
image: ''
meta: There are lots of edge cases I hadn't considered, and it's very
  inconsistent between browsers. Here's what I found…
---

"HTTP/2 push will solve that" is something I've heard a lot when it comes to page load performance problems, but I didn't know much about it, so I decided to dig in.

HTTP/2 push is more complicated and low-level than I initially thought, but what really caught me off-guard is how inconsistent it is between browsers – I'd assumed it was a done deal & totally ready for production.

This isn't an "HTTP/2 push is a douchebag" hatchet job – I think HTTP/2 push is really powerful and will improve over time, but I no longer think it's a silver bullet from a golden gun.

# Map of fetching

Between your page and the destination server there's a series of caches & things that can intercept the request:

<link href="https://fonts.googleapis.com/css?family=Just+Another+Hand" rel="stylesheet"><figure class="full-figure blueprint"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 901.7 1785.5"><text fill="#FFF" transform="translate(305.194 784.67)" font-family="Just Another Hand" font-size="95.7">Service worker</text><text fill="#FFF" transform="translate(327.786 987.934)" font-family="Just Another Hand" font-size="95.7">HTTP cache</text><text fill="#FFF" transform="translate(387.93 1694.247)" font-family="Just Another Hand" font-size="95.7">Server</text><text fill="#FFF" transform="translate(168.27 138.835)" font-family="Just Another Hand" font-size="95.7">Page</text><text fill="#FFF" transform="translate(84.316 337.606)" font-family="Just Another Hand" font-size="95.7">Image cache</text><text fill="#FFF" transform="translate(75.134 551.393)" font-family="Just Another Hand" font-size="95.7">Preload cache</text><path fill="none" stroke="#FFF" stroke-width="6" stroke-miterlimit="10" d="M216 191.3v76"/><path fill="#FFF" d="M206 203.2l10-10.2 10.3 10.2v-8.6L216 184.4l-10 10.2m0 61l10 10 10.3-10v8.5L216 275l-10-11"/><path fill="none" stroke="#FFF" stroke-width="6" stroke-miterlimit="10" d="M216 393.3v76"/><path fill="#FFF" d="M206 405.2l10-10.2 10.3 10.2v-8.6L216 386.4l-10 10.2m0 61l10 10 10.3-10v8.5L216 477l-10-11"/><path fill="none" stroke="#FFF" stroke-width="6" stroke-miterlimit="10" d="M458.2 816.7V893"/><path fill="#FFF" d="M448 828.7l10.2-10.2 10.2 10.2V820l-10.2-10-10.2 10m0 61l10.2 10 10.2-10v8.6l-10.2 10-10.2-10"/><text fill="#FFF" transform="translate(645.434 138.835)" font-family="Just Another Hand" font-size="95.7">Page</text><text fill="#FFF" transform="translate(561.48 337.606)" font-family="Just Another Hand" font-size="95.7">Image cache</text><text fill="#FFF" transform="translate(552.3 551.393)" font-family="Just Another Hand" font-size="95.7">Preload cache</text><path fill="none" stroke="#FFF" stroke-width="6" stroke-miterlimit="10" d="M693.3 191.3v76"/><path fill="#FFF" d="M683 203.2l10.3-10.2 10 10.2v-8.6l-10-10.2-10.2 10.2m0 61l11 10 10-10v8.5l-10 11-11-11"/><path fill="none" stroke="#FFF" stroke-width="6" stroke-miterlimit="10" d="M693.3 393.3v76"/><path fill="#FFF" d="M683 405.2l10.3-10.2 10 10.2v-8.6l-10-10.2-10.2 10.2m0 61l11 10 10-10v8.5l-10 11-11-11"/><path fill="none" stroke="#FFF" stroke-width="6" stroke-miterlimit="10" d="M216.3 579c5.5 119 157 0 162.5 119"/><path fill="#FFF" d="M206.4 591l10-10.3 10.4 10-.3-8.8-10.4-10-9 10m162 104l11 10 10-11v8l-10 11-10-10"/><path fill="none" stroke="#FFF" stroke-width="6" stroke-miterlimit="10" d="M693 579c-5.4 119-157 0-162.4 119"/><path fill="#FFF" d="M682.6 590.6l10.4-10 10 10.5.2-8-10-10-10.4 10m-162 103l10 11 10.3-10v9l-10 10-10-10.3"/><text fill="#FFF" transform="translate(99.573 1493.735)" font-family="Just Another Hand" font-size="95.7">Push cache</text><path fill="none" stroke="#FFF" stroke-width="6" stroke-miterlimit="10" d="M197.2 1408c-48.2-100.4-1-256.8 119.3-395.3" id="line-1"/><path fill="#FFF" d="M201 1392.6l-4.5 13.6-13.6-4.7 3 7.8 13 4.6 4-14-4-8zm115.4-364.2l-1-14.4-14.4 1 5.6-6.5 14.3-1 1 14.3-6 6.6z"/><text style="dominant-baseline: ideographic"><textPath xlink:href="#line-1" startOffset="23.1%"> <tspan fill="#FFF" font-family="Just Another Hand" font-size="72">HTTP/2 connection</tspan> </textPath></text><path fill="none" stroke="#FFF" stroke-width="6" stroke-miterlimit="10" d="M252.8 1535.2c28.2 58 45.4 114.2 100.5 118.5"/><path fill="#FFF" d="M248.7 1550.4l4.8-13.5 13.6 4-3-8-13-5-5 13m96 121l11-10-9.3-11 8.6.3 9.7 10.6-10.4 9.5"/><text fill="#FFF" transform="translate(589.126 1493.735)" font-family="Just Another Hand" font-size="95.7">Push cache</text><path id="line-2" fill="none" stroke="#FFF" stroke-width="6" stroke-miterlimit="10" d="M595.2 1012.7 C 715.6 1151.2 762.7 1307.6 714.5 1407.9"/><path fill="#FFF" d="M729 1401.6l-13.7 4.7-4.6-13.6-3.8 7.8 4 13.6 13-4 4-8zM610.7 1015l-14.4-1-1 14.5-5.6-6.5 1-14.3 14.3 1 5.7 6.4z"/><text style="dominant-baseline: ideographic"><textPath xlink:href="#line-2" startOffset="6%"> <tspan fill="#FFF" font-family="Just Another Hand" font-size="72">HTTP/2 connection</tspan> </textPath></text><path fill="none" stroke="#FFF" stroke-width="6" stroke-miterlimit="10" d="M659 1535.2c-28.3 58-45.5 114.2-100.6 118.5"/><path fill="#FFF" d="M644.6 1541.7l13.6-4.8 4.8 13 3.7-8-4.8-14-14 5m-78 110l-10 10 10 9.3-8.8.4-10.6-9.7 9.7-10.6"/></svg></figure>

The above is probably like those flow diagrams people use to try and explain Git or observables – they're reassuring to someone who already knows the thing, but terrifying to others. If that's the case, sorry! Hopefully the next few sections will help.

# How HTTP/2 push works

<style>
.chat {
  overflow: hidden;
  background: #ebe4db;
  padding: 17px 17px 7px;
  margin: 0 -20px;
  line-height: 1.3;
  display: flex;
  flex-flow: column;
  align-items: flex-start;
}

@media (min-width: 530px) {
  .chat {
    margin: 0 0 0 -32px;
    padding-left: 32px;
  }
}

.chat-item,
.chat-direction {
  position: relative;
  background: #fff;
  padding: 7px 10px;
  margin: 0 40px 10px 0;
  border-radius: 0 7px 7px 7px;
  -webkit-filter: drop-shadow(0 1px 1px rgba(0,0,0,0.2));
  filter: drop-shadow(0 1px 1px rgba(0,0,0,0.2));
}

.page-chat {
  background: #e1ffc7;
  border-radius: 7px 0 7px 7px;
  margin: 0 0 10px 40px;
  align-self: flex-end;
}

.chat-item::before {
  content: '';
  position: absolute;
  top: 0;
  right: 100%;
  border: solid 5px #fff;
  border-top-width: 15px;
  border-width: 6px 4px;
  border-color: #fff #fff transparent transparent;
}

.page-chat::before {
  top: 0;
  left: 100%;
  border-color: #e1ffc7 transparent transparent #e1ffc7;
  width: 0;
}

.chat-item .author {
  display: block;
  color: #ff702c;
  font-weight: bold;
  font-size: 0.9rem;
  margin: 0 0 5px 0;
}

.server-chat .author {
  color: #4dbaba;
}

.page-chat .author {
  color: #778868;
}

.chat-item .author span {
  color: transparent;
}

.chat-item .time {
  float: right;
  font-size: 0.9rem;
  position: relative;
  top: 5px;
  left: 3px;
  color: rgba(0,0,0,0.5);
  margin-left: 10px;
}

.chat-direction {
  border-radius: 7px;
  background: #d4eaf4;
  text-transform: uppercase;
  align-self: center;
  margin: 5px 0 15px 0;
  font-size: 0.9rem;
  line-height: 1;
  padding: 10px;
  color: #666;
}

.chat-nowrap {
  white-space: nowrap;
}
</style>

<div class="chat">
  <p class="chat-item page-chat">
    <span class="author">Page<span>:</span></span>
    Hey example.com, can I have your homepage please?
    <span class="time">10:24</span>
  </p>

  <p class="chat-item server-chat">
    <span class="author">Server<span>:</span></span>
    Sure thing! Oh, but while I'm sending you that, here's a stylesheet, some images, some JavaScript, and some JSON.
    <span class="time">10:24</span>
  </p>

  <p class="chat-item page-chat">
    <span class="author">Page<span>:</span></span>
    Uh, sure.
    <span class="time">10:24</span>
  </p>

  <p class="chat-item page-chat">
    <span class="author">Page<span>:</span></span>
    I'm just reading the HTML here, and it looks like I'm going to need a stylesh… oh it's the one you're already sending me, cool!
    <span class="time">10:25</span>
  </p>
</div>

When the server responds to a request it can include additional resources. This includes a set of request headers, so the browser knows how to match it up later. They sit in a cache until the browser asks for a resource that matches its description.

You get a performance boost because you start sending the resources without waiting for the browser to ask for them. In theory, this means the page loads faster.

This is pretty much all I knew about HTTP/2 push for years, and it sounded relatively simple, but the devil is in the details…

# Anything can use the push cache

HTTP/2 push is a low-level networking feature – anything that uses the networking stack can make use of it. The key to it being useful is consistency and predictability.

I gave this a spin by pushing resources and trying to collect them with:

- `fetch()`
- `XMLHttpRequest`
- `<link rel="stylesheet" href="…">`
- `<script src="…">`
- `<iframe src="…">`

I also slowed the delivery of the body of the pushed resources to see if browsers would match items that were still being pushed. The fairly scrappy test suite is [on github](https://github.com/jakearchibald/http2-push-test).

<style>
.browser-support {
  display: flex;
  padding: 0;
}

.browser-support .result {
  flex: 1;
  margin: 1px;
  margin-right: 0;
  background-size: 78%;
  background-repeat: no-repeat;
  background-position: center center;
  overflow: hidden;
  display: block;
}

.browser-support .result::after {
  display: block;
  content: '';
  padding-top: 100%;
}

.browser-support .result:first-child {
  margin-left: 0;
}

.browser-support .result.chrome {
  background-image: url('asset-url:static-build/imgs/browser-icons/chrome.png');
}

.browser-support .result.safari {
  background-image: url('asset-url:static-build/imgs/browser-icons/safari.png');
}

.browser-support .result.firefox {
  background-image: url('asset-url:static-build/imgs/browser-icons/firefox.png');
}

.browser-support .result.edge {
  background-image: url('asset-url:static-build/imgs/browser-icons/edge.png');
}

.browser-support .result.good {
  background-color: #376D37;
}

.browser-support .result.bad {
  background-color: #b12929;
}

.browser-support .result.ish {
  background-color: #D5BB00;
}

.browser-support .result.unknown {
  background-color: #000;
  -webkit-filter: grayscale(100%);
  filter: grayscale(100%);
  opacity: 0.25;
}

.browser-support span {
  position: absolute;
  opacity: 0;
}
</style>

<ul class="browser-support">
  <li class="result chrome good">
    <span>Chrome - good support</span>
  </li>
  <li class="result safari bad">
    <span>Safari - bad support</span>
  </li>
  <li class="result firefox good">
    <span>Firefox - good support</span>
  </li>
  <li class="result edge ish">
    <span>Edge - some support</span>
  </li>
</ul>

**Edge** didn't retrieve the item from the push cache when using `fetch()`, `XMLHttpRequest`, or `<iframe>` ([issue, including video](https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/12142852/)).

**Safari** is a weird one. When it will/won't use the push cache seems like a flip of a coin. Safari defers to OSX's network stack, which is closed-source, but I _think_ some of the bugs are in Safari-land. It seems like it opens too many connections and pushed items end up being distributed between them. This means you only get a cache hit if the request is lucky enough to use same connection – but it's really above my brain-grade ([issue, including video](https://bugs.webkit.org/show_bug.cgi?id=172639)).

All browsers (except Safari when it's being weird) will use matching pushed items even if they're still in-progress of being pushed. That's pretty good.

Unfortunately, **Chrome** is the only browser with devtools support. The network panel will tell you which items have been fetched from the push cache.

## Recommendations

If the browser won't retrieve the item from the push cache, you'll end up being slower than if you hadn't pushed it at all.

Edge's support is poor, but at least it's consistently poor. You could use user-agent sniffing to ensure you only push resources you know it'll use. If that isn't possible for whatever reason, it's probably safer to avoiding pushing anything to Edge users.

Safari's behaviour doesn't appear to be deterministic, so it isn't something you can hack around. Use user-agent sniffing to avoid pushing resources to Safari users.

# You can push no-cache and no-store resources

With the HTTP cache, an item must have something like a `max-age` to allow the browser to use it without server revalidation ([here's a post on caching headers](/2016/caching-best-practices/)). HTTP/2 push is different – an item's "freshness" isn't checked when matching items.

<ul class="browser-support">
  <li class="result chrome good">
    <span>Chrome - good support</span>
  </li>
  <li class="result safari good">
    <span>Safari - good support</span>
  </li>
  <li class="result firefox good">
    <span>Firefox - good support</span>
  </li>
  <li class="result edge good">
    <span>Edge - good support</span>
  </li>
</ul>

All browsers behave this way.

## Recommendations

Some single-page apps suffer in performance because they're not only render-blocked by JS, but also by some data (JSON or whatever) the JS starts fetching once it executes. Server rendering is the best solution here, but if that isn't possible you can push the JS and the JSON along with the page.

However, given the Edge/Safari issues mentioned earlier, inlining the JSON is more reliable.

# The HTTP/2 push cache is the last cache the browser checks

Pushed items sit with the HTTP/2 connection meaning the browser will only use pushed items if nothing before it provides a response. This includes the [image cache](https://html.spec.whatwg.org/#the-list-of-available-images), the preload cache, the service worker, and the HTTP cache.

<ul class="browser-support">
  <li class="result chrome good">
    <span>Chrome - good support</span>
  </li>
  <li class="result safari good">
    <span>Safari - good support</span>
  </li>
  <li class="result firefox good">
    <span>Firefox - good support</span>
  </li>
  <li class="result edge good">
    <span>Edge - good support</span>
  </li>
</ul>

All browsers behave this way.

## Recommendations

Just be aware of it. For instance, if you have a matching item in the HTTP cache that's fresh according to its max-age, and you push an item that's fresher, the pushed item will be ignored in favour of the older item in the HTTP cache (unless the API bypasses the HTTP cache for whatever reason).

Being last in the chain isn't really a problem, but knowing cached items sit with the connection helped me understand a lot of other behaviours I saw. For instance…

# If the connection closes, bye bye push cache

The push cache sits with the HTTP/2 connection, so you lose it if the connection closes. This happens even if a pushed resource is highly cacheable.

The push cache sits beyond the HTTP cache, so items don't enter the HTTP cache until the browser requests them. At that point they're pulled out of the push cache, through the HTTP cache, the service worker etc etc, and into the page.

If the user is on a flaky connection, you may successfully push something, but lose the connection before the page manages to get it. This means they'll have to set up a new connection and re-download the resource.

<ul class="browser-support">
  <li class="result chrome good">
    <span>Chrome - good support</span>
  </li>
  <li class="result safari good">
    <span>Safari - good support</span>
  </li>
  <li class="result firefox good">
    <span>Firefox - good support</span>
  </li>
  <li class="result edge good">
    <span>Edge - good support</span>
  </li>
</ul>

All browsers behave this way.

## Recommendations

Don't rely on items hanging around in the push cache for a long time. Push is best-used for urgent resources, so there shouldn't be much time between pushing a resource and the page picking it up.

# Multiple pages can use the same HTTP/2 connection

Each connection has its own push cache, but multiple pages can use a single connection, meaning multiple pages may share a push cache.

In practice, this means if you push a resource along with a navigation response (eg an HTML page), it _isn't_ exclusively available to that page (I'm going to use "pages" throughout the rest of this post, but in reality this includes other contexts that can fetch resources, such as workers).

<ul class="browser-support">
  <li class="result chrome good">
    <span>Chrome - good support</span>
  </li>
  <li class="result safari bad">
    <span>Safari - bad support</span>
  </li>
  <li class="result firefox good">
    <span>Firefox - good support</span>
  </li>
  <li class="result edge ish">
    <span>Edge - some support</span>
  </li>
</ul>

**Edge** seems to use a new connection per tab ([issue, including video](https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/12144186/)).

**Safari** creates multiple connections to the same origin unnecessarily. I'm pretty sure this is the root its weirdness ([issue, including video](https://bugs.webkit.org/show_bug.cgi?id=172639)).

## Recommendations

Watch out for this when you're pushing stuff like JSON data along with a page – you can't rely on the same page picking it up.

This behaviour can become an advantage, as resources you push along with a page can be picked up by requests made from an installing service worker.

Edge's behaviour isn't optimal, but it isn't anything to worry about right now. Once Edge has service worker support, it _could_ become an issue.

Again, I would avoid pushing resources for Safari users.

# Requests without credentials use a separate connection

"Credentials" are going to pop up a few times in this article. Credentials are things the browser sends that identify a particular user. This generally means cookies, but can also mean HTTP basic auth and connection-level identifiers like client certificates.

If you think of an HTTP/2 connection like a single phone call, once you introduce yourself the call is no longer anonymous, and that includes anything you said prior to introducing yourself. For privacy reasons, the browser sets up a separate 'call' for "anonymous" requests.

However, because the push cache sits with connection, you can end up missing cached items by making non-credentialed requests. For instance, if you push a resource along with a page (a credentialed request), then `fetch()` it (non-credentialed), it will set up a new connection and miss the pushed item.

If a cross-origin stylesheet (credentialed) pushes a font, the browser's font request (non-credentialed) will miss the font in the push cache.

## Recommendations

Ensure your requests use the same credentials mode. In most cases this means ensuring your requests include credentials, as your page request is always made with credentials.

To fetch with credentials, use:

```js
fetch(url, { credentials: 'include' });
```

You can't add credentials to a cross-origin font request, but you _can_ remove them from the stylesheet:

```html
<link rel="stylesheet" href="…" crossorigin />
```

…this means both the stylesheet & font request will go down the same connection. However, if that stylesheet also applies background images, those requests are always credentialed, so you'll end up with another connection again. The only solution here is a service worker, which can change how the fetch is performed per request.

I've heard developers say that non-credentialed requests are better for performance as they don't need to send cookies, but you have to weigh this against the much greater cost of setting up a new connection. Also, HTTP/2 can compress-away headers repeated between requests, so cookies aren't really an issue.

## Maybe we should change the rules

Edge is the only browser that doesn't follow the rules here. It allows credentialed & non-credentialed requests to share a connection. However, I've skipped the usual row of browser icons as I'd like to see the spec changed here.

If a page makes a non-credentialed request to its origin, there's little point setting up a separate connection. A credentialed resource initiated the request, so it could add its credentials to the "anonymous" request through the URL.

I'm less sure about other cases, but due to browser fingerprinting there isn't much in the way of anonymity if you're making credentialed & non-credentialed requests to the same server. If you want to dig deeper on this there's [discussion on GitHub](https://github.com/whatwg/fetch/issues/341), [a Mozilla mailing list](https://groups.google.com/forum/#!topic/mozilla.dev.tech.network/glqron0mRko/discussion), and [Firefox's bug tracker](https://bugzilla.mozilla.org/show_bug.cgi?id=1363284).

Phew. That was a bit jargon-heavy. Sorry about that.

# Items in the push cache can only be used once

Once the browser uses something in the push cache, it's removed. It may end up in the HTTP cache (depending on [caching headers](https://jakearchibald.com/2016/caching-best-practices/)), but it's no longer in the push cache.

<ul class="browser-support">
  <li class="result chrome good">
    <span>Chrome - good support</span>
  </li>
  <li class="result safari bad">
    <span>Safari - bad support</span>
  </li>
  <li class="result firefox good">
    <span>Firefox - good support</span>
  </li>
  <li class="result edge good">
    <span>Edge - good support</span>
  </li>
</ul>

**Safari** suffers from race conditions here. If a resource is fetched multiple times while it's pushing, it'll get the pushed item multiple times ([issue, including video](https://bugs.webkit.org/show_bug.cgi?id=172639)). If it's fetched twice _after_ the item has finished pushing, it behaves correctly – the first will return from the push cache, whereas the second won't.

## Recommendations

If you decide to push stuff to Safari users, be aware of this bug when you're pushing no-cache resources (eg, JSON data). Maybe pass a random ID along with the response, and if you get the same ID back twice, you know you've hit the bug. In that case, wait a second and try again.

In general, use caching headers or a service worker to cache your pushed resources once they're fetched, unless caching isn't desirable (such as one-off JSON fetches).

# The browser can abort pushed items if it already has them

When you push content, you do it without much negotiation with the client. This means you can be pushing something the browser already has in one of its caches. The HTTP/2 spec allows the browser to abort the incoming stream using the `CANCEL` or `REFUSED_STREAM` code in this case, to avoid wasting bandwidth.

<ul class="browser-support">
  <li class="result chrome ish">
    <span>Chrome - some support</span>
  </li>
  <li class="result safari ish">
    <span>Safari - some support</span>
  </li>
  <li class="result firefox bad">
    <span>Firefox - poor support</span>
  </li>
  <li class="result edge good">
    <span>Edge - good support</span>
  </li>
</ul>

The spec isn't strict here, so my judgements here are based on what's useful to developers.

**Chrome** will reject pushes if it already has the item in the _push cache_. It rejects with `PROTOCOL_ERROR` rather than `CANCEL` or `REFUSED_STREAM`, but that's a minor thing ([issue](https://bugs.chromium.org/p/chromium/issues/detail?id=726725)). Unfortunately it doesn't reject items it already has in the HTTP cache. It sounds like this is almost fixed, but I haven't been able to test it ([issue](https://bugs.chromium.org/p/chromium/issues/detail?id=232040)).

**Safari** will reject pushes if it already has the item in the _push cache_, but only if the item in the push cache is 'fresh' according to cache headers (eg max-age), _unless_ the user hit refresh. This is different to Chrome, but I don't think it's 'wrong'. Unfortunately, like Chrome, it doesn't reject items it already has in the HTTP cache ([issue](https://bugs.webkit.org/show_bug.cgi?id=172646)).

**Firefox** will reject pushes if it already has the item in the _push cache_, but then it also drops the item it already had in the push cache, leaving it with nothing! This makes it pretty unreliable, and difficult to defend against ([issue, including video](https://bugzilla.mozilla.org/show_bug.cgi?id=1368080)). Firefox also doesn't reject items it already has in the HTTP cache ([issue](https://bugzilla.mozilla.org/show_bug.cgi?id=1367551)).

**Edge** doesn't reject pushes for items already in the push cache, but it _does_ reject if the item is in the HTTP cache.

## Recommendations

Unfortunately, even with perfect browser support you'll have wasted bandwidth and server I/O before you get the cancel message. [Cache digests](http://httpwg.org/http-extensions/cache-digest.html) aim to solve this, by telling the server in-advance what it has cached.

In the meantime, you may want to use cookies to track if you've already pushed cachable assets to the user. However, items can disappear from the HTTP cache at the browser's whim, whereas cookies persist, so the presence of the cookies doesn't mean the user still has the items in their cache.

# Items in the push cache should be matched using HTTP semantics, aside from freshness

We've already seen that freshness is ignored when it comes to matching items in the push cache (that's how `no-store` and `no-cache` items are matched), but other matching mechanisms should be used. I tested `POST` requests, and `Vary: Cookie`.

**Update:** The spec says pushed requests "MUST be [cacheable](http://httpwg.org/specs/rfc7231.html#cacheable.methods), MUST be [safe](http://httpwg.org/specs/rfc7231.html#safe.methods), and MUST NOT include a request body" – I missed these definitions at first. `POST` requests don't fall into the definition of "safe", so browsers should reject `POST`s.

<ul class="browser-support">
  <li class="result chrome bad">
    <span>Chrome - poor support</span>
  </li>
  <li class="result safari ish">
    <span>Safari - some support</span>
  </li>
  <li class="result firefox bad">
    <span>Firefox - poor support</span>
  </li>
  <li class="result edge bad">
    <span>Edge - poor support</span>
  </li>
</ul>

**Chrome** accepts POST push streams, but doesn't appear to use them ([issue](https://bugs.chromium.org/p/chromium/issues/detail?id=727653)). Chrome also ignores the Vary header when matching pushed items ([issue](https://bugs.chromium.org/p/chromium/issues/detail?id=554220)), although the issue suggests it works when using QUIC.

**Firefox** rejects the pushed POST stream. However, Firefox ignores the Vary header when matching pushed items ([issue](https://bugzilla.mozilla.org/show_bug.cgi?id=1368664)).

**Edge** also rejects the pushed POST stream. But also ignores the Vary header ([issue](https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/12173342/)).

**Safari**, like Chrome, accepts POST push streams, but doesn't appear to use them ([issue](https://bugs.webkit.org/show_bug.cgi?id=172706)). It does obey the Vary header though, and it's the only browser to do so.

## Recommendations

I'm kinda sad that no one but Safari observes the Vary header for pushed items. This means that you could push some JSON intended for one user, then that user logs out & another logs in, but you still get the pushed JSON for the previous user if it wasn't already collected.

If you're pushing data intended for one user, also respond with the expected user ID. If it's different to what you're expecting, make the request again (as the pushed item will have gone).

In Chrome, you can use the [clear site data header](https://www.w3.org/TR/clear-site-data/) when a user logs out. This also clears items in the push cache by terminating the HTTP/2 connections.

# You can push items for other origins

As the owners of developers.google.com/web, we could get our server to push a response containing whatever we wanted for android.com, and set it to cache for a year. A simple fetch would be enough to drag that in the HTTP cache. Then, if our visitors went to android.com, they'd see "NATIVE SUX – PWA RULEZ" in large pink comic sans, or whatever we wanted.

Of course, we wouldn't do that, we love Android. I'm just saying… Android: if you mess with the web, we'll fuck you up.

Ok ok, I jest, but the above actually works. You can't push assets for _any origin_, but you can push assets for origins which your connection is "authoritative" for.

If you look at the certificate for developers.google.com, you can see it's authoritative for all sorts of Google origins, including android.com.

<figure class="full-figure">
<div class="video"><iframe src="//www.youtube.com/embed/i9uXp64KUcw?rel=0&amp;html5=1" frameborder="0" allowfullscreen=""></iframe></div>
<figcaption>Viewing certificate information in Chrome</figcaption>
</figure>

Now, I lied a little, because when we fetch android.com it'll perform a DNS lookup and see that it terminates at a different IP to developers.google.com, so it'll set up a new connection and miss our item in the push cache.

We could work around this using an [ORIGIN frame](http://httpwg.org/http-extensions/origin-frame.html). This lets the connection say "Hey, if you need anything from android.com, just ask me. No need to do any of that DNS stuff", as long as it's authoritative. This is useful for general connection coalescing, but it's pretty new and only supported in Firefox Nightly.

If you're using a CDN or some kind of shared host, take a look at the certificate, see which origins could start pushing content for your site. It's kinda terrifying. Thankfully, no host (that I'm aware of) offers full control over HTTP/2 push, and is unlikely to thanks to this little note in the spec:

<blockquote class="quote"><p>Where multiple tenants share space on the same server, that server MUST ensure that tenants are not able to push representations of resources that they do not have authority over.</p>— <a href="https://http2.github.io/http2-spec/#rfc.section.10.4">HTTP/2 spec</a></blockquote>

That ought to do it.

<ul class="browser-support">
  <li class="result chrome good">
    <span>Chrome - good support</span>
  </li>
  <li class="result safari ish">
    <span>Safari - some support</span>
  </li>
  <li class="result firefox unknown">
    <span>Firefox - unknown support</span>
  </li>
  <li class="result edge unknown">
    <span>Edge - unknown support</span>
  </li>
</ul>

**Chrome** allows sites to push resources for origins it has authority over. It will reuse the connection if the other origin terminates at the same IP, so those pushed items are used. Chrome doesn't support the ORIGIN frame yet.

**Safari** allows sites to push resources for origins it has authority over, but it sets up a new connection for other origins, so these pushed items are never used. Safari doesn't support the ORIGIN frame.

**Firefox** rejects other-origin pushes. Like Safari, it sets up a new connection for other origins. However, I'm bypassing certificate warnings in Firefox, so I'm not confident in my results. Firefox Nightly supports the ORIGIN frame.

**Edge** also rejects other-origins pushes. Again, I'm bypassing certificate warnings, so these results may be different with a proper certificate. Edge doesn't support the ORIGIN frame.

## Recommendations

If you make use of multiple origins on the same page that end up using the same server, start looking into the [ORIGIN frame](http://httpwg.org/http-extensions/origin-frame.html). Once it's supported it removes the need for a DNS lookup, improving performance.

If you think you'd benefit from cross-origin pushes, write some better tests than I did & ensure browsers will actually use what you pushed. Otherwise, use user-agent sniffing to push to particular browsers.

# Push vs preload

Instead of pushing resources, you can ask the browser to preload them using HTML:

```html
<link
  rel="preload"
  href="https://fonts.example.com/font.woff2"
  as="font"
  crossorigin
  type="font/woff2"
/>
```

Or a page header:

```
Link: <https://fonts.example.com/font.woff2>; rel=preload; as=font; crossorigin; type='font/woff2'
```

- `href` – the URL to preload
- `as` – the [destination](https://fetch.spec.whatwg.org/#concept-request-destination) of the response. This means the browser can set the right headers and apply the correct CSP policies.
- `crossorigin` – Optional. Indicates that the request should be a CORS request. The CORS request will be sent without credentials unless `crossorigin="use-credentials"`.
- `type` – Optional. Allows the browser to ignore the preload if the provided MIME type is unsupported.

Once the browser sees a preload link, it fetches it. The functionality is similar to HTTP/2 push, in that:

- Anything can be preloaded.
- `no-cache` & `no-store` items can be preloaded.
- Your request will only match a preloaded item if its credentials mode is the same.
- Cached items can only be used once, although they may be in the HTTP cache for future fetches.
- Items should be matched using HTTP semantics, aside from freshness.
- You can preload items from other origins.

But also different:

**The browser fetches the resource**, meaning it will look for responses from the service worker, HTTP cache, HTTP/2 cache, or destination server – in that order.

**Preloaded resources are stored alongside the page** (or worker). This makes it one of the first caches the browser will check (before the service worker and HTTP cache), and losing a connection doesn't lose you preloaded items. The direct link to the page also means devtools can show a useful warning if preloaded items aren't used.

Each page has its own preload cache, so it's kinda pointless to preload things intended for another page. As in, you can't preload items intended for use after a page load. It's also pointless to preload stuff from a page for use in a service worker install – the service worker won't check the page's preload cache.

<ul class="browser-support">
  <li class="result chrome ish">
    <span>Chrome - some support</span>
  </li>
  <li class="result safari ish">
    <span>Safari - some support</span>
  </li>
  <li class="result firefox bad">
    <span>Firefox - no support</span>
  </li>
  <li class="result edge bad">
    <span>Edge - no support</span>
  </li>
</ul>

**Chrome** doesn't support preloading with all APIs. For instance, `fetch()` doesn't use the preload cache. XHR will, but only if it's sent with credentials ([issue](https://bugs.chromium.org/p/chromium/issues/detail?id=652228)).

**Safari** only supports preloading in its latest [technology preview](https://developer.apple.com/safari/technology-preview/). `fetch()` doesn't use the preload cache, and neither does XHR ([issue](https://bugs.webkit.org/show_bug.cgi?id=158720)).

**Firefox** doesn't support preloading, but their implementation is in progress ([issue](https://bugzilla.mozilla.org/show_bug.cgi?id=1222633)).

**Edge** doesn't support preloading. [Give it an upvote if you want](https://wpdev.uservoice.com/forums/257854-microsoft-edge-developer/suggestions/7666725-preload).

## Recommendations

The perfect preload will always be slightly slower than the perfect HTTP/2 push, since it doesn't need to wait for the browser to make the request. However, preloading is drastically simpler and easier to debug. I recommend using it today, as browser support is only going to get better – but do keep an eye on devtools to ensure your pushed items are being used.

Some services will turn preload headers into HTTP/2 pushes. I think this is a mistake given how subtly different the behaviour is between the two, but it's probably something we're going to have to live with for a while. However, you should ensure these services strip the header from the final response, else you may end up with a race conditions where the preload happens before the push, resulting in double the bandwidth usage.

# The future of push

There are some pretty gnarly bugs around HTTP/2 push right now, but once those are fixed I think it becomes ideal for the kinds of assets we currently inline, especially render-critical CSS. Once cache digests land, we'll hopefully get the benefit of inlining, but also the benefit of caching.

Getting this right will depend on smarter servers which allow us to correctly prioritise the streaming of content. Eg, I want to be able to stream my critical CSS in parallel with the head of the page, but then give full priority to the CSS, as it's a waste spending bandwidth on body content that the user can't yet render.

If your server is a little slow to respond (due to expensive database lookups or whatever), you could also fill that time pushing assets the page will likely need, then change the priorities once the page is available.

Like I said, this post isn't a hatchet job and I hope it doesn't come across as one. HTTP/2 push can improve performance, just don't use it without careful testing, else you might be making things slower.

<small>Thanks to [Gray Norton](https://twitter.com/graynorton), [Addy Osmani](https://twitter.com/addyosmani), and [Surma](https://twitter.com/dassurma) for proofreading and giving feedback.</small>
