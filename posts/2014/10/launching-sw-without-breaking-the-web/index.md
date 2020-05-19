---
title: Launching ServiceWorker without breaking the web
date: 2014-10-23 00:00:01
mindframe: ""
summary: With ServiceWorkers you can control requests to any page on your
  origin, and any of the subresource requests made by those pages. This is
  powerful stuff, and I'm curious to know what security measure you think is
  appropriate…
meta: ""

---

**Update:** Thanks to everyone who read and commented, [you influenced the direction of the API](https://github.com/slightlyoff/ServiceWorker/issues/468#issuecomment-60276779). We're going for B, the path-based method, but allowing a header to relax these rules so you can put your worker script wherever you want. Many thanks!

With ServiceWorkers you can control requests to any page on your origin, and any of the subresource requests made by those pages. You can completely change what those requests return, from returning cached content, to generating your own response with JavaScript.

```js
navigator.serviceWorker.register('/sw.js').then(function() {
  // you now control all pages on the origin!
});
```

This is powerful stuff, and I'm curious to know what security measure you think is appropriate:

# A: JS content type & request header

* The ServiceWorker script must be on the same origin it intends to control.
* The script must be served with a recognised JavaScript `content-type` header, eg `application/javascript`.
* The request contains a `service-worker: script` header, so the service can tell these apart from normal script requests.

## Pros

* An XSS attack isn't enough, the attacker needs to be able to create a resource on the origin to act as the ServiceWorker.
* The JS content-type stops most user-generated content being used as a ServiceWorker (although [poor JSONP implementations](https://code.google.com/p/chromium/issues/detail?id=422966) could be a way in)
* An origin can block requests that have the `service-worker: script` header to disallow ServiceWorkers.
* Works on all static hosts (github pages, s3 etc).

## Cons

* Some hosts give you a portion of an origin to do what you want with, such as `//web.stanford.edu/~gwalton/` or `//jsbin.com/honawo/`. This is false security, as you're sharing localstorage, IDB, cookies etc. However, being able to hijack the request to `/` because you 'own' `/~whatever/` could be considered a security breach too far.

# B: Scoping to the ServiceWorker script location

* All the stuff in A.
* Your area of control is limited by the location of the ServiceWorker script, so if your script is in `/~username/sw.js` you can only control URLs that begin `/~username/`. If you want to control a whole origin, you need to be able to put a JS file in the root.

## Pros

* All the benefits of A.
* Protects `/~username/` hosts.
* [Appcache recently adopted this tactic](https://www.w3.org/Bugs/Public/show_bug.cgi?id=25699) for `FALLBACK` rules.

## Cons

* Doesn't protect hosts that allow you to put JS in the root [such as JSbin](https://jsbin.com/baseja.js), and maybe `/index.php?path=/whatever/blah.js` type URLs would be an issue (if they serve with a JS content-type). These sites can still block ServiceWorkers via the request header, [which JSBin already has](https://github.com/jsbin/jsbin/commit/ce53bb2218564d85e1620945a048662f98943ad2).
* Can't put your ServiceWorker in your static folder along with your other JS (although you often don't want to serve the ServiceWorker with the same expires headers as other JS)
* Depending on their path, may still be vulnerable to XSS + [broken JSONP](https://code.google.com/p/chromium/issues/detail?id=422966)
* Perhaps this [breaks a "web rule"](http://www.w3.org/2001/tag/issues.html#siteData-36) that features shouldn't be restricted by resource location (eg, `/favicon.ico` is bad).

# C: Require a special header

* All the stuff in A.
* Require a special header like `Service-Worker-Allowed: true` or a specific content-type like `text/sw+javascript`.

## Pros

* All the benefits of A (except static hosts).
* Protects `/~username/` hosts.
* Protects hosts that allow you to serve JS (even from the root).
* No restrictions on where you can serve the ServiceWorker from, as long as it's on the same origin.

## Cons

* No static sites support it from the start, even ones with a sensible security model like github pages.
* If a host allows you to run `.htaccess`, PHP, Perl within cgi-bin etc, you can still take over the origin.

# Over to you

Out of A, B and C, what's your order of preference and why?