---
title: Service workers and base URIs
date: 2016-02-02 13:59:39
summary: "Previously when we've run into a contentious service worker design
  issue, we've asked web developers what they think. This has worked out [pretty
  well](/2014/reading-responses/) in [the
  past](/2014/launching-sw-without-breaking-the-web/), with developer feedback
  directly informing spec changes. It's also great because we can blame y'all if
  you pick the wrong thing.\r

  \r

  Well, it's that time again! Help us!"
mindframe: ''
image: ''
meta: We've ran into a contentious service worker design issue, help us resolve it!
---

Previously when we've run into a contentious service worker design issue, we've asked web developers what they think. This has worked out [pretty well](/2014/reading-responses/) in [the past](/2014/launching-sw-without-breaking-the-web/), with developer feedback directly informing spec changes. It's also great because we can blame y'all if you pick the wrong thing.

Well, it's that time again! Help us!

# Making a regular request

In a service worker fetch event, if you don't call `event.respondWith` within the event callback the browser handles the request and response as it usually would.

However, you can also do:

```js
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
```

**Our goal is for the above to behave as much as possible as if the service worker wasn't there.** This means you can decide whether to do the normal browser thing asynchronously, or do the normal browser thing then do something with the response (eg cache it), without picking up weird behavioral changes.

# CSS & base URIs

CSS is unique in that it's a subresource with its own base URI. Documents and workers also have their own base URI, but they aren't subresources.

The base URI of a CSS resource is its final response URL. The page and request URL are not involved in selecting CSS's base URI.

So if `https://example.com/hello/` contains:

```html
<!DOCTYPE html> <link rel="stylesheet" href="/foo.css" />
```

And `/foo.css` redirects to `https://static.example.com/foo/style.css` which contains:

```css
html {
  background: url('bar.jpg');
}
```

The background's full URL is `https://static.example.com/foo/bar.jpg`.

## But what about with a service worker?

If `https://example.com/question1/` contains:

```html
<!DOCTYPE html> <link rel="stylesheet" href="/bar.css" />
```

…and is controlled by a service worker containing:

```js
self.addEventListener('fetch', (event) => {
  if (event.request.url.endsWith('/bar.css')) {
    event.respondWith(fetch('https://static.example.com/bar/style.css'));
  }
});
```

…and `https://static.example.com/bar/style.css` contains:

```css
html {
  background: url('yo.jpg');
}
```

- What should the full URL of the background image be when the user loads `https://example.com/question1/`?
- If your answer differs from the "base URI of a CSS resource is its response URL" behaviour that occurs without service workers (therefore breaking our current rule of `event.respondWith(fetch(event.request))` behaving as if the service worker isn't present), why?
- Would you expect the same behaviour if `fetch` was replaced with `caches.match` in the above example? (assuming the resource is cached)

This isn't a quiz about current behaviour, your answer doesn't need to be what the spec says, or what a browser currently does.

# Pages & base URIs

Pages also have a base URI. It's independent to the URL in the browser's location bar, as the base URI can be set using [`<base>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/base).

## But what about with a service worker?

If `https://example.com/question2/` is controlled by the following service worker:

```js
self.addEventListener('fetch', (event) => {
  if (event.request.url.endsWith('/question2/')) {
    event.respondWith(fetch('https://static.example.com/foo/page-shell.html'));
  }
});
```

…and `https://static.example.com/foo/page-shell.html` contains:

```html
<!DOCTYPE html> <a href="bar/">Click me!</a>
```

- What is displayed in the URL bar when the user loads `https://example.com/question2/`? (assuming the full URL is shown)
- Where does the user go when they click the link?
- If your answer differs from the CSS behaviour, why?
- Would you expect the same behaviour if `fetch` was replaced with `caches.match` in the above example? (assuming the resource is cached)

Again, this isn't a quiz about current behaviour, your answer doesn't need to be what the spec says, or what a browser currently does.

# Over to you!

Pop your answer in the comments below, with as much reasoning as you can bare. Thank you!

We'd like an answer for each question so we know we're representing you properly, you can use the following template in Disqus-friendly format:

```
<strong>CSS:</strong>

<blockquote>
  What should the full URL of the background image be when the user loads
  <code>https://example.com/question1/</code>?
</blockquote>

-Your answer-

<blockquote>
  If your answer differs from the "base URI of a CSS resource is its response
  URL" behaviour that occurs without service workers (therefore breaking our
  current rule of <code>event.respondWith(fetch(event.request))</code> behaving
  as if the service worker isn't present), why?
</blockquote>

-Your answer-

<blockquote>
  Would you expect the same behaviour if <code>fetch</code> was replaced with
  <code>caches.match</code> in the above example? (assuming the resource is
  cached)
</blockquote>

-Your answer-

<strong>Pages:</strong>

<blockquote>
  What is displayed in the URL bar when the user loads
  <code>https://example.com/question2/</code>? (assuming the full URL is shown)
</blockquote>

-Your answer-

<blockquote>Where does the user go when they click the link?</blockquote>

-Your answer-

<blockquote>If your answer differs from the CSS behaviour, why?</blockquote>

-Your answer-

<blockquote>
  Would you expect the same behaviour if <code>fetch</code> was replaced with
  <code>caches.match</code> in the above example? (assuming the resource is
  cached)
</blockquote>

-Your answer-
```
