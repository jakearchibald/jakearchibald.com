---
title: The browser cache is Vary broken
date: 2014-03-04 16:38:38
mindframe: now I'm off to the pub
summary: "<blockquote class=\"quote\"><p>Jake, why are your blog posts always so
  depressing?</p>&mdash; <a
  href=\"https://twitter.com/domenic/statuses/438747592265322496\">Domenic
  Denicola (@domenic)</a></blockquote>\r

  \r

  Well, I wouldn't want to disappoint…"
meta: ""

---

<blockquote class="quote"><p>Jake, why are your blog posts always so depressing?</p>&mdash; <a href="https://twitter.com/domenic/statuses/438747592265322496">Domenic Denicola (@domenic)</a></blockquote>

Well, I wouldn't want to disappoint…

**TL;DR** If you use "Vary" to negotiate content, the responses will fight for the same cache space. Additionally, IE ignores "max-age" and Safari is buggy.

# Content negotiation using "Vary"

An item in the HTTP cache is matched by its URL and method (GET, POST etc), but you can specify additional constraints via the "Vary" header. You can use this to serve different content…

* depending on language via `Vary: Accept-Language`
* depending on supported types, eg WebP for images via `Vary: Accept`
* when [client hints](https://github.com/igrigorik/http-client-hints) ship, depending on screen DPR and render-width via `Vary: CH-DPR, CH-RW`

Some people are [against content negotiation](http://wiki.whatwg.org/wiki/Why_not_conneg), but I thought it worked well for the cases above. However if you mix it with caching, browsers barf in your face. *In your face*.

# Serving WebP conditionally

Put your eyes on this:

<figure class="full-figure checked">
  <img src="/demos/conditional-content-cached/dice.png" alt="Some dice">
</figure>

The above is a 90k PNG, unless you're in a browser that supports (and advertises) [WebP](http://en.wikipedia.org/wiki/WebP), then you get a 44k WebP equivalent. At the moment you'll get the WebP in Chrome and Opera.

The server looks to see if the "Accept" request header contains 'image/webp', then it serves the relevant file, instructs it to cache for an hour via `Cache-Control: max-age=3600`, and uses `Vary: Accept` to indicate the response differs depending on the "Accept" header.

## IE fails us

All versions of IE ignore the `max-age=3600` bit when "Vary" is present, so they go back to the server for revalidation. For the above image, that means downloading the whole thing again, although from IE7 onwards you can reduce this to an HTTP 304 by using an ETag.

MSDN has more details on [IE's caching of "Vary" responses](http://blogs.msdn.com/b/ieinternals/archive/2009/06/17/vary-header-prevents-caching-in-ie.aspx).

To avoid this, don't send the "Vary" header to IE, and prevent intermediate caches storing it with `Cache-Control: max-age=3600, private`. [Ilya Grigorik covers the server setup for this](http://www.igvita.com/2013/05/01/deploying-webp-via-accept-content-negotiation/).

## And the other browsers?

In this case, Firefox, Chrome, Opera and Safari do pretty well. Although there are some caching oddities lurking underneath that you'd only see if you XHR fetched the image with a different accept header. For example…

# Serving a language pack conditionally

<p>
  <label for="lang-select">Pick a language</label>
  <select id="lang-select">
    <option value="en" selected>English</option>
    <option value="fr">French</option>
    <option value="es">Spanish</option>
    <option value="de">German</option>
    <option value="it">Italian</option>
    <option value="en-gb-scot">Scottish</option>
  </select>
  <button class="lang-rerequest">Re-request</button>
</p>
<p>Greeting: <span class="greeting">Loading…</span></p>
<script>
  (function() {
    function fetch(url, headers, cb) {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url);
      for (var key in headers) {
        xhr.setRequestHeader(key, headers[key]);
      }
      xhr.onload = function() {
        if (xhr.status == 200) {
          cb(xhr.responseText);
        }
      }
      xhr.send();
    }

    var greet = document.querySelector('.greeting');
    var langSelect = document.querySelector('#lang-select');

    function update() {
      greet.textContent = "Loading…";
      fetch("/demos/conditional-lang-cached/lang-pack", {
        "Accept-Language": langSelect.value
      }, function(response) {
        greet.textContent = JSON.parse(response).greeting;
      });

    }
    langSelect.addEventListener('change', update);
    document.querySelector('.lang-rerequest').addEventListener('click', update);
    update();
    
  }());
</script>

When you change the select above, it makes a GET request for "/demos/conditional-lang-cached/lang-pack" with the "Accept-Language" header set to whatever you select. The response is set to cache for an hour via `Cache-Control: max-age=3600`.

## Many responses, only one gap in the cache

Unless you're using IE, pressing "Re-request" doesn't result in a request to the server, `max-age=3600` is respected and the cache is used. However, if you switch to another language then back again, you get two full server requests, ETags don't even help.

I assumed the browser would cache both responses independently, but no, the "Vary" header is used for validation, not keying. Here's what the browser does:

* Request "English"
* Look for an entry in the cache for the URL+method, none found
* Request from the network
* Cache it against the URL+method
* Request "Scottish"
* Look for an entry in the cache for the URL+method, "English" entry found
* "English" response has `Vary: Accept-Language`, but the "English" request has a different "Accept-Language" header to this request, so the cache item doesn't match
* Request from the network
* Cache it against the URL+method, which overwrites the "English" entry

So, **if you want to get the most out of caching, use different URLs rather than content negotiation**, else your responses will be fighting over the same space in the cache. I hope we can fix this before Client Hints ship.

# Changing API response type based on Accept

<p>
  <label for="content-type-select">Pick content-type:</label>
  <select id="content-type-select">
    <option value="application/javascript" selected>JavaScript</option>
    <option value="application/json">JSON</option>
  </select>
  <button class="content-type-rerequest">Re-request</button>
</p>
<pre class="content-type-output">Loading…</pre>
<script>
  (function() {
    function fetch(url, headers, cb) {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url);
      for (var key in headers) {
        xhr.setRequestHeader(key, headers[key]);
      }
      xhr.onload = function() {
        if (xhr.status == 200) {
          cb(xhr.responseText);
        }
      }
      xhr.send();
    }

    var output = document.querySelector('.content-type-output');
    var langSelect = document.querySelector('#content-type-select');

    function update() {
      output.textContent = "Loading…";
      fetch("/demos/conditional-content-cached/code", {
        "Accept": langSelect.value
      }, function(response) {
        output.textContent = response;
      });
    }
    langSelect.addEventListener('change', update);
    document.querySelector('.content-type-rerequest').addEventListener('click', update);
    update();
    
  }());
</script>

When you change the select above, it makes a GET request for "/demos/conditional-content-cached/code" with the "Accept" header set to whatever you select. The response is set to cache for an hour via `Cache-Control: max-age=3600`.

This is similar to the WebP example, except this time the browser can make multiple requests with different headers, as we did with "Accept-Language".

Most browsers exhibit the same caching issues we saw with the previous example, except…

## Safari isn't listening

The example above doesn't work in Safari. No matter what you select, it'll fetch the previous response from the cache, meaning it comes back with the wrong content. You ask for JSON, it fetches the JavaScript response from the cache. It's ignoring the "Vary" header in this case, despite getting it right in the "Accept-Language" example.

Once again, having different URLs would have avoided this, and given us better caching in other browsers, but this is a bug in Safari ([bug ticket](https://bugs.webkit.org/show_bug.cgi?id=58797)).

# Why don't browsers cache these things independently?

It wasn't clear to me until I tried to write an implementation. Let's say we make a GET request to "/whatever/url":

```
# Request:
Accept: application/json

# Response
Cache-Control: max-age=3600
Vary: Accept
…some JSON…
```

Now let's make another request:

```
# Request:
Accept: */*

# Response
Cache-Control: max-age=3600
…some HTML…
```

Say we cached both, what happens if we made this request?…

```
# Request:
Accept: application/json
```

Unfortunately the above request matches both entries in the cache. The first entry matches because we vary on "Accept", but the "Accept" header is the same. The second entry matches because it doesn't care about the "Accept" header, it has no "Vary" header.

It feels like the first entry should be the match because it's more specific, but HTTP caching has no concept of specificity. Having different "Vary" headers for the same URL messes things up.

I recently drafted [a programmable HTTP cache for the ServiceWorker](https://github.com/slightlyoff/ServiceWorker/blob/master/caching.md#storing-entries-for-different-methods), the rule we use here is "first match wins". But when adding to the cache, anything the request matches is overridden. So if we added a new entry:

```
# Request:
Accept: application/json

# Response
Cache-Control: max-age=3600
Vary: Accept
…some newer JSON…
```

…that would overwrite both previous entries because the request matches. Otherwise, we'd be adding a request to the cache that cannot be reached, because the `Accept: */*` entry would always match first.

Hopefully that'll work!