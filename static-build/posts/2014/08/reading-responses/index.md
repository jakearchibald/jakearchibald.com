---
title: What happens when you read a response?
date: 2014-08-12 00:01:00
summary: There's a bit of disagreement over the behaviour of requests and
  responses in the [fetch API](http://fetch.spec.whatwg.org/#fetch-api), curious
  to know what you think…
mindframe: ""
image: null
meta: ""

---

There's a bit of disagreement over the behaviour of requests and responses in the [fetch API](http://fetch.spec.whatwg.org/#fetch-api), curious to know what you think…

# Setting the scene

The new [fetch API](http://fetch.spec.whatwg.org/#fetch-api) gives the web proper `Request` and `Response` primitives.

```js
fetch('/whatever').then(function(response) {
  return response.body.asJSON();
}).then(function(data) {
  // fetch gave us a response & we
  // successfully read it as JSON
}).catch(function(err) {
  // either fetch had a network failure,
  // or parsing as JSON failed
});
```

Fetch takes a URL or a request object:

```js
var request = new Request('/whatever', {
  mode: 'POST',
  body: formData // or a string, or a blob
});
```

You can store responses in caches:

```js
caches.get('cache-name').then(function(cache) {
  cache.put(request, response).then(function() {
    // response is now fully cached
  });
});
```

You can use responses in ServiceWorkers to respond to requests:

```js
this.onfetch = function(event) {
  event.respondWith(
    fetch('/whatever')
  );
};
```

# The question

Take this bit of code:

```js
fetch('/whatever').then(function(response) {
  response.body.asJSON().catch(function() {
    // parsing as JSON failed, let's get the text
    response.body.asText().then(function(text) {
      // ...
    });
  });
});
```

Or this bit:

```js
// assume request & cache are in scope
fetch(request).then(function(response) {
  response.body.toJSON().then(function(data) {
    // make sure the JSON isn't an error response
    if (!data.err) {
      // put it in the cache
      cache.put(request, response);
    }
  });
});
```

Or this:

```js
this.onfetch = function(event) {
  event.respondWith(
    caches.get('content').then(function(cache) {
      // fetch the resource
      return fetch(event.request).then(function(response) {
        // put it in the cache
        cache.put(event.request, response);
        // and send it to the browser
        return response;
      });
    })
  );
};
```

Would it suprise you if all those were 'wrong'? Each example involves reading the body of the response more than once, and there's a proposal that multiple reads should fail.

The first example tries to read as JSON then text. The second example reads as JSON then reads into a cache. The third reads into a cache then hands it back to the browser to read & parse.

# Why fail on multiple reads?

Memory efficiency. The idea is to treat the request/response body as a stream, when you call `cache.put(request, response)` the response stream is piped to the cache. This means large responses can be handled without buffering them into memory.

```js
fetch('/whatever').then(function(response) {
  return response.body.asJSON();
}).then(function(data) {
  // ...
});
```

With the above, we don't need to keep the original response in memory as well as the JSON representation. You can stringify the JSON of course, but you'll have lost parts of the original response that mean nothing to JSON, such as whitespace.

Because reading means the original stream is gone, there's no opportunity to do a second read, unless…

# Opting into buffering

There are cases such as above where you *want* to read twice. The solution is to allow cloning of the stream:

```js
fetch('/whatever').then(function(response) {
  return response.clone().body.asJSON().catch(function() {
    // parsing as JSON failed, let's get the text
    response.body.asText().then(function(text) {
      // ...
    });
  });
});
```

The above works, because `.clone` is called on the response before the first read. This means the original `response` can still be read. By doing this, you opt into the memory overhead of retaining the original stream.

```js
this.onfetch = function(event) {
  event.respondWith(
    caches.get('content').then(function(cache) {
      // fetch the resource
      return fetch(event.request).then(function(response) {
        // put it in the cache
        cache.put(event.request, response.clone()).then(function() {
          // done!
        });
        // and send it to the browser
        return response;
      });
    })
  );
};
```

In the above we send a clone into the cache, and the original back to the browser. Although we're cloning the stream, it's still memory efficient as both streams are being consumed, so we don't need to hold the original in memory. However, if we also `.clone`d the stream being sent back to the browser, we may be in trouble, as the original `response` would be unread and in scope.

# An alternative solution

The other proposal is to have all body-reading methods automatically clone, so all the examples above just work. However:

```js
fetch('/huge-resource').then(function(response) {
  cache.put('/huge-resource', response).then(function() {
    console.log('It worked!');
  });
});
```

This could be problematic as `response` stays in scope, meaning it can be read again after consuming the whole thing. The browser would have to store the original response in either memory or more likely disk. It's already on disk in the cache of course, but that may not be true in all cases (imagine streaming a video response to a video element).

In this model, if you want memory efficiency you interact directly with the low-level stream `response.body`. That low-level access won't be there at the start, as the [streams spec](https://github.com/whatwg/streams) is still in-progress.

# Over to you!

Did it surprise you that multiple reads would fail? Does it make sense after my attempt to explain it? Perhaps it makes sense but you still think it's the wrong thing to do?

What do you think? Help us do the right thing!