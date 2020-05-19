---
title: Caching best practices & max-age gotchas
date: 2016-04-27 17:01:06
summary: Getting caching right yields huge performance benefits, saves
  bandwidth, and reduces server costs, but many sites half-arse their caching,
  creating race conditions resulting in interdependent resources getting out of
  sync.
mindframe: '- this post was brought to you by: procrastination!'
image: asset-url:./post.png
meta: How to get the most out of caching without nasty race conditions
---

Getting caching right yields huge performance benefits, saves bandwidth, and reduces server costs, but many sites half-arse their caching, creating race conditions resulting in interdependent resources getting out of sync.

The vast majority of best-practice caching falls into one of two patterns:

# Pattern 1: Immutable content + long max-age

```
Cache-Control: max-age=31536000
```

- The content at this URL never changes, therefore…
- The browser/CDN can cache this resource for a year without a problem
- Cached content younger than `max-age` seconds can be used without consulting the server

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
    Hey, I need <span class="chat-nowrap">"/script-v1.js"</span>, <span class="chat-nowrap">"/styles-v1.css"</span> and <span class="chat-nowrap">"/cats-v1.jpg"</span>
    <span class="time">10:24</span>
  </p>

  <p class="chat-item cache-chat">
    <span class="author">Cache<span>:</span></span>
    I got nuthin', how about you Server?
    <span class="time">10:24</span>
  </p>

  <p class="chat-item server-chat">
    <span class="author">Server<span>:</span></span>
    Sure, here you go. Btw Cache: these are fine to use for like, a year.
    <span class="time">10:25</span>
  </p>

  <p class="chat-item cache-chat">
    <span class="author">Cache<span>:</span></span>
    Thanks!
    <span class="time">10:25</span>
  </p>

  <p class="chat-item page-chat">
    <span class="author">Page<span>:</span></span>
    Cheers!
    <span class="time">10:25</span>
  </p>

  <p class="chat-direction">The next day</p>

  <p class="chat-item page-chat">
    <span class="author">Page<span>:</span></span>
    Hey, I need <span class="chat-nowrap">"/script-<strong>v2</strong>.js"</span>, <span class="chat-nowrap">"/styles-<strong>v2</strong>.css"</span> and <span class="chat-nowrap">"/cats-v1.jpg"</span>
    <span class="time">08:14</span>
  </p>

  <p class="chat-item cache-chat">
    <span class="author">Cache<span>:</span></span>
    I've got the cats one, here you go. I don't have the others. Server?
    <span class="time">08:14</span>
  </p>

  <p class="chat-item server-chat">
    <span class="author">Server<span>:</span></span>
    Sure, here's the new CSS & JS. Btw Cache: these are also fine to use for a year.
    <span class="time">08:15</span>
  </p>

  <p class="chat-item cache-chat">
    <span class="author">Cache<span>:</span></span>
    Brilliant!
    <span class="time">08:15</span>
  </p>

  <p class="chat-item page-chat">
    <span class="author">Page<span>:</span></span>
    Thanks!
    <span class="time">08:15</span>
  </p>

  <p class="chat-direction">Later</p>

  <p class="chat-item cache-chat">
    <span class="author">Cache<span>:</span></span>
    Hm, I haven't used <span class="chat-nowrap">"/script-v1.js"</span> & <span class="chat-nowrap">"/styles-v1.css"</span> for a while. I'll just delete them.
    <span class="time">12:32</span>
  </p>
</div>

In this pattern, you never change content at a particular URL, you change the URL:

```html
<script src="/script-f93bca2c.js"></script>
<link rel="stylesheet" href="/styles-a837cb1e.css" />
<img src="/cats-0e9a2ef4.jpg" alt="…" />
```

Each URL contains something that changes along with its content. It could be a version number, the modified date, or a hash of the content - which is what I do on this blog.

Most server-side frameworks come with tools to make this easy (I use [Django's `ManifestStaticFilesStorage`](https://docs.djangoproject.com/en/1.9/ref/contrib/staticfiles/#manifeststaticfilesstorage)), and there are smaller Node.js libraries that achieve the same thing, such as [gulp-rev](https://github.com/sindresorhus/gulp-rev).

However, this pattern doesn't work for things like articles & blog posts. Their URLs cannot be versioned and their content must be able to change. Seriously, given the basic spelling and grammar mistakes I make, I need to be able to update content quickly and frequently.

# Pattern 2: Mutable content, always server-revalidated

```
Cache-Control: no-cache
```

- The content at this URL may change, therefore…
- Any locally cached version isn't trusted without the server's say-so

<div class="chat">
  <p class="chat-item page-chat">
    <span class="author">Page<span>:</span></span>
    Hey, I need the content for <span class="chat-nowrap">"/about/"</span> and <span class="chat-nowrap">"/sw.js"</span>
    <span class="time">11:32</span>
  </p>

  <p class="chat-item cache-chat">
    <span class="author">Cache<span>:</span></span>
    I can't help you. Server?
    <span class="time">11:32</span>
  </p>

  <p class="chat-item server-chat">
    <span class="author">Server<span>:</span></span>
    Yep, I've got those, here you go. Cache: you can hold onto these, but don't use them without asking.
    <span class="time">11:33</span>
  </p>

  <p class="chat-item cache-chat">
    <span class="author">Cache<span>:</span></span>
    Sure thing!
    <span class="time">11:33</span>
  </p>

  <p class="chat-item page-chat">
    <span class="author">Page<span>:</span></span>
    Thanks!
    <span class="time">11:33</span>
  </p>

  <p class="chat-direction">The next day</p>

  <p class="chat-item page-chat">
    <span class="author">Page<span>:</span></span>
    Hey, I need content for <span class="chat-nowrap">"/about/"</span> and <span class="chat-nowrap">"/sw.js"</span> again
    <span class="time">09:46</span>
  </p>

  <p class="chat-item cache-chat">
    <span class="author">Cache<span>:</span></span>
    One moment. Server: am I good to use my copies of these? My copy of <span class="chat-nowrap">"/about/"</span> was last updated on Monday, and <span class="chat-nowrap">"/sw.js"</span> was last updated yesterday.
    <span class="time">09:46</span>
  </p>

  <p class="chat-item server-chat">
    <span class="author">Server<span>:</span></span>
    <span class="chat-nowrap">"/sw.js"</span> hasn't changed since then…
    <span class="time">09:47</span>
  </p>

  <p class="chat-item cache-chat">
    <span class="author">Cache<span>:</span></span>
    Cool. Page: here's <span class="chat-nowrap">"/sw.js"</span>.
    <span class="time">09:47</span>
  </p>

  <p class="chat-item server-chat">
    <span class="author">Server<span>:</span></span>
    …but <span class="chat-nowrap">"/about/"</span> has, here's the new version. Cache: like before, you can hold onto this, but don't use it without asking.
    <span class="time">09:47</span>
  </p>

  <p class="chat-item cache-chat">
    <span class="author">Cache<span>:</span></span>
    Got it!
    <span class="time">09:47</span>
  </p>

  <p class="chat-item page-chat">
    <span class="author">Page<span>:</span></span>
    Excellent!
    <span class="time">09:47</span>
  </p>
</div>

_Note:_ `no-cache` doesn't mean "don't cache", it means it must check (or "revalidate" as it calls it) with the server before using the cached resource. `no-store` tells the browser not to cache it at all. Also `must-revalidate` doesn't mean "must revalidate", it means the local resource can be used if it's younger than the provided `max-age`, otherwise it must revalidate. Yeah. I know.

In this pattern you can add an `ETag` (a version ID of your choosing) or `Last-Modified` date header to the response. Next time the client fetches the resource, it echoes the value for the content it already has via `If-None-Match` and `If-Modified-Since` respectively, allowing the server to say "Just use what you've already got, it's up to date", or as it spells it, "HTTP 304".

If sending `ETag`/`Last-Modified` isn't possible, the server always sends the full content.

This pattern always involves a network fetch, so it isn't as good as pattern 1 which can bypass the network entirely.

It's not uncommon to be put off by the infrastructure needed for pattern 1, but be similarly put off by the network request pattern 2 requires, and instead go for something in the middle: a smallish `max-age` and mutable content. This is a baaaad compromise.

# max-age on mutable content is often the wrong choice

…and unfortunately it isn't uncommon, for instance it happens on Github pages.

Imagine:

- `/article/`
- `/styles.css`
- `/script.js`

…all served with:

```
Cache-Control: must-revalidate, max-age=600
```

- Content at the URLs changes
- If the browser has a cached version less than 10 minutes old, use it without consulting the server
- Otherwise make a network fetch, using `If-Modified-Since` or `If-None-Match` if available

<div class="chat">
  <p class="chat-item page-chat">
    <span class="author">Page<span>:</span></span>
    Hey, I need <span class="chat-nowrap">"/article/"</span>, <span class="chat-nowrap">"/script.js"</span> and <span class="chat-nowrap">"/styles.css"</span>
    <span class="time">10:21</span>
  </p>

  <p class="chat-item cache-chat">
    <span class="author">Cache<span>:</span></span>
    Nothing here, Server?
    <span class="time">10:21</span>
  </p>

  <p class="chat-item server-chat">
    <span class="author">Server<span>:</span></span>
    No problem, here they are. Btw Cache: these are fine to use for the next 10 minutes.
    <span class="time">10:22</span>
  </p>

  <p class="chat-item cache-chat">
    <span class="author">Cache<span>:</span></span>
    Gotcha!
    <span class="time">10:22</span>
  </p>

  <p class="chat-item page-chat">
    <span class="author">Page<span>:</span></span>
    Thanks!
    <span class="time">10:22</span>
  </p>

  <p class="chat-direction">6 minutes later</p>

  <p class="chat-item page-chat">
    <span class="author">Page<span>:</span></span>
    Hey, I need <span class="chat-nowrap">"/article/"</span>, <span class="chat-nowrap">"/script.js"</span> and <span class="chat-nowrap">"/styles.css"</span> again
    <span class="time">10:28</span>
  </p>

  <p class="chat-item cache-chat">
    <span class="author">Cache<span>:</span></span>
    Omg, I'm really sorry, I lost the <span class="chat-nowrap">"/styles.css"</span>, but I've got the others, here you go. Server: can you give me <span class="chat-nowrap">"/styles.css"</span>?
    <span class="time">10:28</span>
  </p>

  <p class="chat-item server-chat">
    <span class="author">Server<span>:</span></span>
    Sure thing, it's actually changed since you last asked for it. It's also fine to use for the next 10 minutes.
    <span class="time">10:29</span>
  </p>

  <p class="chat-item cache-chat">
    <span class="author">Cache<span>:</span></span>
    No problem.
    <span class="time">10:29</span>
  </p>

  <p class="chat-item page-chat">
    <span class="author">Page<span>:</span></span>
    Thanks! Wait! Everything's broken!! What's going on?
    <span class="time">10:29</span>
  </p>
</div>

This pattern can appear to work in testing, but break stuff in the real world, and it's really difficult to track down. In the example above, the server actually had updated HTML, CSS & JS, but the page ended up with the old HTML & JS from the cache, and the updated CSS from the server. The version mismatch broke things.

Often, when we make significant changes to HTML, we're likely to also change the CSS to reflect the new structure, and update the JS to cater for changes to the style and content. These resources are interdependent, but the caching headers can't express that. Users may end up with the new version of one/two of the resources, but the old version of the other(s).

`max-age` is relative to the response time, so if all the above resources are requested as part of the same navigation they'll be set to expire at roughly the same time, but there's still the small possibility of a race there. If you have some pages that don't include the JS, or include different CSS, your expiry dates can get out of sync. And worse, the browser drops things from the cache all the time, and it doesn't know that the HTML, CSS, & JS are interdependent, so it'll happily drop one but not the others. Multiply all this together and it becomes not-unlikely that you can end up with mismatched versions of these resources.

For the user, this can result in broken layout and/or functionality. From subtle glitches, to entirely unusable content.

Thankfully, there's an escape hatch for the user…

## A refresh sometimes fixes it

If the page is loaded as part of a refresh, browsers will always revalidate with the server, ignoring `max-age`. So if the user is experiencing something broken because of `max-age`, hitting refresh should fix everything. Of course, forcing the user to do this reduces trust, as it gives the perception that your site is temperamental.

## A service worker can extend the life of these bugs

Say you have the following service worker:

```js
const version = '2';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(`static-${version}`)
      .then((cache) => cache.addAll(['/styles.css', '/script.js'])),
  );
});

self.addEventListener('activate', (event) => {
  // …delete old caches…
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => response || fetch(event.request)),
  );
});
```

This service worker…

- Caches the script and styles up front
- Serves from the cache if there's a match, otherwise goes to the network

If we change our CSS/JS we bump the `version` to make the service worker byte-different, which triggers an update. However, since `addAll` fetches through the HTTP cache (like almost all fetches do), we could run into the `max-age` race condition and cache incompatible versions of the CSS & JS.

Once they're cached, that's it, we'll be serving incompatible CSS & JS until we next update the service worker - and that's assuming we don't run into another race condition in the next update.

You _could_ bypass the cache in the service worker:

```js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(`static-${version}`)
      .then((cache) =>
        cache.addAll([
          new Request('/styles.css', { cache: 'no-cache' }),
          new Request('/script.js', { cache: 'no-cache' }),
        ]),
      ),
  );
});
```

Unfortunately the cache options aren't yet supported in [Chrome/Opera](https://bugs.chromium.org/p/chromium/issues/detail?id=453190) and only [recently landed in Firefox Nightly](https://bugzilla.mozilla.org/show_bug.cgi?id=1120715), but you can sort-of do it yourself:

```js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(`static-${version}`).then((cache) =>
      Promise.all(
        ['/styles.css', '/script.js'].map((url) => {
          // cache-bust using a random query string
          return fetch(`${url}?${Math.random()}`).then((response) => {
            // fail on 404, 500 etc
            if (!response.ok) throw Error('Not ok');
            return cache.put(url, response);
          });
        }),
      ),
    ),
  );
});
```

In the above I'm cache-busting with a random number, but you could go one step further and use a build-step to add a hash of the content (similar to what [sw-precache](https://github.com/GoogleChrome/sw-precache) does). This is kinda reimplementing pattern 1 in JavaScript, but only for the benefit of service worker users rather than all browsers & your CDN.

# The service worker & the HTTP cache play well together, don't make them fight!

As you can see, you can hack around poor caching in your service worker, but you're way better off fixing the root of the problem. Getting your caching right makes things easier in service worker land, but also benefits browsers that don't support service worker (Safari, IE/Edge), and lets you get the most out of your CDN.

Correct caching headers means you can massively streamline service worker updates too:

```js
const version = '23';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(`static-${version}`)
      .then((cache) =>
        cache.addAll([
          '/',
          '/script-f93bca2c.js',
          '/styles-a837cb1e.css',
          '/cats-0e9a2ef4.jpg',
        ]),
      ),
  );
});
```

Here I'd cache the root page using pattern 2 (server revalidation), and the rest of the resources using pattern 1 (immutable content). Each service worker update will trigger a request for the root page, but the rest of the resources will only be downloaded if their URL has changed. This is great because it saves bandwidth and improves performance whether you're updating from the previous version, or 10 versions ago.

This is a huge advantage over native, where the whole binary is downloaded even for a minor change, or involves complex binary diffing. Here we can update a large web app with relatively little download.

Service workers work best as an enhancement rather than a workaround, so instead of fighting the cache, work with it!

# Used carefully, max-age & mutable content can be beneficial

`max-age` on mutable content is _often_ the wrong choice, but not always. For instance this page has a `max-age` of three minutes. Race conditions aren't an issue here because this page doesn't have any dependencies that follow the same caching pattern (my CSS, JS & image URLs follow pattern 1 - immutable content), and nothing dependent on this page follows the same pattern.

This pattern means, if I'm lucky enough to write a popular article, my CDN (Cloudflare) can take the heat off my server, as long as I can live with it taking up to three minutes for article updates to be seen by users, which I am.

This pattern shouldn't be used lightly. If I added a new section to one article and linked to it in another article, I've created a dependency that could race. The user could click the link and be taken to a copy of the article without the referenced section. If I wanted to avoid this, I'd update the first article, flush Cloudflare's cached copy using their UI, wait three minutes, _then_ add the link to it in the other article. Yeah… you have to be pretty careful with this pattern.

Used correctly, caching is a massive performance enhancement and bandwidth saver. Favour immutable content for any URL that can easily change, otherwise play it safe with server revalidation. Only mix `max-age` and mutable content if you're feeling brave, and you're sure your content has no dependancies or dependents that could get out of sync.
