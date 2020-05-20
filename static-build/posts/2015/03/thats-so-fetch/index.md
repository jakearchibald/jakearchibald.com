---
title: That's so fetch!
date: 2015-03-24 00:00:59
summary: There's been some confusion around the new [fetch
  API](https://fetch.spec.whatwg.org/#fetch-api) recently. Let's clear things
  up.
mindframe: "- and I've even included a meme"
image: ''
meta: ''
---

There's been some confusion around the new [fetch API](https://fetch.spec.whatwg.org/#fetch-api) recently. Let's clear things up.

The first thing you'll notice about fetch is it's a massive improvement on `XMLHttpRequest` in terms of API design. Here's how to get some JSON using XHR:

```js
var xhr = new XMLHttpRequest();
xhr.open('GET', url);
xhr.responseType = 'json';

xhr.onload = function () {
  console.log(xhr.response);
};

xhr.onerror = function () {
  console.log('Booo');
};

xhr.send();
```

Now mop up that vomit and take a look at how fetch does the same thing:

```js
fetch(url)
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    console.log(data);
  })
  .catch(function () {
    console.log('Booo');
  });
```

Mix in some ES6 arrow functions and it gets even more compact:

```js
fetch(url)
  .then((r) => r.json())
  .then((data) => console.log(data))
  .catch((e) => console.log('Booo'));
```

And with [ES7 async functions](/2014/es7-async-functions/) it can be structured like sync code, whilst still being async:

```js
(async () => {
  try {
    var response = await fetch(url);
    var data = await response.json();
    console.log(data);
  } catch (e) {
    console.log('Booo');
  }
})();
```

Unfortunately, not everyone was throwing "SHUT UP AND TAKE MY MONEY" memes at it. One particular high-profile JavaScript community member was unconvinced…

<figure class="full-figure fetch-vid-figure" style="position:relative;display:none;">
<video class="fetch-vid" preload="auto" autoplay="autoplay" muted="muted" loop="loop" webkit-playsinline style="width:100%">
  <source src="asset-url:./fetch.webm" type="video/webm">
  <source src="asset-url:./fetch.mp4" type="video/mp4">
</video>
<svg role="button" tabindex="0" class="fetch-vid-play" xmlns="http://www.w3.org/2000/svg" viewBox="-100 0 300 77" style="position:absolute; top:0; left:0; width: 100%; height: 100%;"><path d="M84.2 73H18C9 73 1.5 65.6 1.5 56.6V20.4C1.5 11.4 9 4 18 4h66.2c9 0 16.5 7.4 16.5 16.4v36.2c0 9-7.4 16.4-16.5 16.4zM18 14c-3.7 0-6.6 2.8-6.6 6.4v36.2c0 3.6 3 6.5 6.6 6.5h66.2c3.7 0 6.6-2.8 6.6-6.4V20.4c0-3.6-3-6.5-6.6-6.5H18zM42.6 23.3c0-1.3 1-1.8 2-1L65.4 37c1 1 1 2 0 3L44.6 54.6c-1 .8-2 .3-2-1V23.3z" fill="#fff"/></svg>
<figcaption>Dramatic reconstruction</figcaption>
</figure>

<script>
(function() {
  var figure = document.querySelector('.fetch-vid-figure');
  var vid = document.querySelector('.fetch-vid');
  var playBtn = document.querySelector('.fetch-vid-play');

  figure.style.display = '';

  if (navigator.userAgent.indexOf('iPhone') !== -1) {
    // Apple hates the web
    var obj = document.createElement('object');
    obj.type = 'image/svg+xml';
    obj.data = 'asset-url:./fetch-fallback.svg';
    figure.removeChild(vid);
    figure.removeChild(playBtn);
    figure.insertBefore(obj, figure.firstChild);
    return;
  }


  vid.addEventListener('play', function() {
    requestAnimationFrame(function() {
      playBtn.style.display = 'none';
    })
  });

  playBtn.addEventListener('click', function() {
    vid.play();
    playBtn.style.display = 'none';
  });

  document.addEventListener('touchend', function startPlay() {
    vid.play();
    document.removeEventListener('touchend', startPlay);
  });
}());
</script>

They thought we shouldn't be adding high level features to the platform, especially as we're in dire need of lower level primitives when it comes to requests and responses.

To that I say, well, actually, that's soooo fetch, and we _are_ going to make fetch happen. Let's clear up the misconceptions…

## Don't be fooled by the nice API

A nice, compact API can be a sign of "high level", and therefore restrictive. But that isn't the case here. XHR is so bad, a lower-level and more featureful API can be also simpler and easier to use.

XHR is now defined in terms of fetch (see the [calls to fetch in XHR's `.send()`](https://xhr.spec.whatwg.org/#the-send%28%29-method)), meaning fetch is lower level than XHR.

## Fetch isn't done yet

What exists in Chrome today doesn't cover the full spec, and the spec doesn't cover all of the planned features. In some cases this is because they haven't been designed yet, in others it's because they're dependent on other in-progress specs. Basically, we're following this pattern:

<figure class="full-figure">
<img alt="Developing iteratively so the user starts with a skateboard, scooter, bike, motorbike then car, as opposed to giving them nothing until you give them the whole car." src="asset-url:./mvp.png">
</figure>

Bit of a rant: it bothers me that as developers, we preach iterative development and release, but when we're the customers of that approach the reaction is all too often "HOW DARE YOU PRESENT ME WITH SUCH INCOMPLETE IMPERFECTION".

The alternative would have been to sit on the feature for months (or years?) instead of getting large parts of it into developers' hands today. Iterative release also means we've been able to get feedback from real-world usage, and that steers future iterations in terms of design and priority.

Anyway, let's take a look at what fetch can do that XHR cannot:

# Request/Response primitives

XHR kinda smushes the request and response together, meaning they can't be used separately. Fetch is different thanks to the `Request` and `Response` constructors. This is particularly useful within a ServiceWorker:

```js
self.addEventListener('fetch', function (event) {
  if (event.request.url === new URL('/', location).href) {
    event.respondWith(
      new Response('<h1>Hello!</h1>', {
        headers: { 'Content-Type': 'text/html' },
      }),
    );
  }
});
```

In the above, `event.request` is a `Request`. There's no response yet, and instead of letting the browser go to the network I respond with my own `Response`. Alternatively, I could get the response from the network using `fetch(event.request)`, or even get a response from the cache.

The [Cache API](https://slightlyoff.github.io/ServiceWorker/spec/service_worker/#cache-objects) is a store of `Response`s keyed against `Request`s, having separates allows you to add your own pairings.

This is in Chrome stable _today_ from within a ServiceWorker. The fetch API is also available from pages in Chrome Beta.

Soon, `request.context` will be able to tell you the source of that request, so you can tell apart requests triggered by hyperlinks vs `<img>` etc.

# 'no-cors' and opaque responses

If I request `//google.com` from this site using XHR or plain fetch it will fail. This is because it's a CORS request and the response doesn't have CORS headers.

However, with fetch, you can make a `no-cors` request:

```js
fetch('//google.com', {
  mode: 'no-cors',
}).then(function (response) {
  console.log(response.type); // "opaque"
});
```

This is similar to the request an `<img>` makes. Of course, you can't read the content of the response as it could contain private information, but it can be consumed by other APIs:

```js
self.addEventListener('fetch', function (event) {
  event.respondWith(
    fetch('//www.google.co.uk/images/srpr/logo11w.png', {
      mode: 'no-cors',
    }),
  );
});
```

The above is fine within a ServiceWorker, as long as the receiver is happy with a `no-cors` response. `<img>` is, `<img crossorigin>` isn't.

You can also store these responses in the Cache API for use later, which is great for CDN content such as scripts, CSS, and imagery, which often lack CORS headers.

For more on the origin of CORS, see [Anne VK's article on same-origin policy](https://annevankesteren.nl/2015/02/same-origin-policy).

This all works in Chrome stable today. In Chrome Canary, although you can use `fetch()` from a page, `no-cors` isn't enabled there yet ([ticket](https://code.google.com/p/chromium/issues/detail?id=457157)).

# Streams

XHR lacks streaming. You can get access to `.responseText` while the request is in progress, but the whole response is still going to buffer into memory.

With fetch, you get access to the low-level body stream. Say I wanted to load a massive CSV and find the value in the cell _after_ the one containing "Jake":

```js
fetch('/big-data.csv')
  .then(function (response) {
    var reader = response.body.getReader();
    var partialCell = '';
    var returnNextCell = false;
    var returnCellAfter = 'Jake';
    var decoder = new TextDecoder();

    function search() {
      return reader.read().then(function (result) {
        partialCell += decoder.decode(result.value || new Uint8Array(), {
          stream: !result.done,
        });

        // Split what we have into CSV 'cells'
        var cellBoundry = /(?:,|\r\n)/;
        var completeCells = partialCell.split(cellBoundry);

        if (!result.done) {
          // Last cell is likely incomplete
          // Keep hold of it for next time
          partialCell = completeCells[completeCells.length - 1];
          // Remove it from our complete cells
          completeCells = completeCells.slice(0, -1);
        }

        for (var cell of completeCells) {
          cell = cell.trim();

          if (returnNextCell) {
            reader.cancel('No more reading needed.');
            return cell;
          }
          if (cell === returnCellAfter) {
            returnNextCell = true;
          }
        }

        if (result.done) {
          throw Error('Could not find value after ' + returnCellAfter);
        }

        return search();
      });
    }

    return search();
  })
  .then(function (result) {
    console.log("Got the result! It's '" + result + "'");
  })
  .catch(function (err) {
    console.log(err.message);
  });
```

Here I'm reading through the CSV (yes, I know my regex is naive), but with only a chunk of content in memory at a given time. Once I find the value I'm looking for, I cancel the stream, closing the connection.

`response.body` is a `ReadableStream` as defined by the [streams spec](https://streams.spec.whatwg.org/). Streaming was planned from the outset, but it's one of the bits we launched without as the spec was still in progress.

`TextDecoder` is part of the [encoding spec](https://encoding.spec.whatwg.org/#interface-textencoder). If the chunk it receives via `.decode(input, {stream: true})` ends with a partial multi-byte character, it will return and flush everything but that partial. The next call to decode appends onto the partial, hopefully forming a whole character.

This stuff is starting to land in Canary, [here's a demo of the above](https://jsbin.com/gowaze/quiet), and [here's a demo with a larger dataset](https://domenic.github.io/streams-demo/) (warning: running the demo _may_ download many megabytes).

Streams are one of the things I'm _really_ looking forward to having on the platform. I want to be able to stream-parse some JSON, generate some HTML as a result, and stream that to the browser's parser. JS-driven apps lack an easy way to get progressive-rendering from a single data source, streams can solve that.

Transform streams are coming soon, which would make the code above simpler. Ideally `TextDecoder` would be a transform stream, and another transform stream could chunk it into CSV rows. Something like:

```js
fetch('/big-data.csv').then(function (response) {
  var csvStream = response.body
    .pipeThrough(new TextDecoder())
    .pipeThrough(new CSVDecoder());

  csvStream.read().then(function (result) {
    // array of cell values for the first row
    console.log(result.value);
  });
});
```

Transform streams also become really exciting within a ServiceWorker:

```js
self.addEventListener('fetch', function (event) {
  event.respondWith(
    fetch('video.unknowncodec').then(function (response) {
      var h264Stream = response.body
        .pipeThrough(codecDecoder)
        .pipeThrough(h264Encoder);

      return new Response(h264Stream, {
        headers: { 'Content-type': 'video/h264' },
      });
    }),
  );
});
```

In the above, I'm using transform streams to take a video the browser doesn't understand, decode it with JS, and encode it in a format the browser does understand. It'd be amazing to see if the browser could do this in real time.

# Stream readers & cloning

As I mentioned before, we initially shipped fetch without streams support so developers could get the other benefits sooner. To make up for a lack of streams & to subsequently offer a simple way to get common data types, we added some readers:

```js
fetch(url).then(function (response) {
  return response.json();
});
```

That, as you might expect, reads the whole stream as JSON. Here's the full list of readers:

- `.arrayBuffer()`
- `.blob()`
- `.formData()`
- `.json()`
- `.text()`

They exist on `Request` objects as well as responses, so you can use them to read (for example) POST data within a ServiceWorker.

These are true stream readers, meaning they drain the stream:

```js
fetch(url).then(function (response) {
  return response.json().catch(function () {
    // This does not work:
    return response.text();
  });
});
```

The call to `.text()` fails as the stream has already been read. You can work around this using `.clone()`:

```js
fetch(url).then(function (response) {
  return response
    .clone()
    .json()
    .catch(function () {
      return response.text();
    });
});
```

`.clone()` opts you into buffering. The clone gets read as JSON, but the original is still there and can be read in another format. Of course, this means the raw response data needs to be kept around in memory until all copies are read or garbage collected.

Alternatively, you could look at the headers of the response:

```js
fetch(url).then(function (response) {
  if (response.headers.get('Content-Type') === 'application/json') {
    return response.json();
  }
  return response.text();
});
```

This is another feature fetch has over XHR, you can decide which format to read the body as after you've inspected the headers.

# Other bits

There are more features that fetch has over XHR that I'm not going to cover in too much detail, they include:

## Headers class

Fetch has [a headers class](https://fetch.spec.whatwg.org/#headers-class) which can be used to read/write headers, and has an ES6 iterator.

## Cache control

The [cache mode](https://fetch.spec.whatwg.org/#concept-request-cache-mode) lets you specify the interaction with the cache. As in, should the cache be consulted? Should the response go into the cache if it's valid? Should the response _only_ come from the cache?

The latter is a bit contentious as it can expose user history, so it may come with a CORS restriction before it lands in Chrome.

## No-credential same-origin requests

XHR forces you to serve credentials with requests to the same origin, fetch doesn't. In fact, no-credentials is the default for all requests made by fetch, making it less magic than XHR.

# What's missing?

Of course, there are some features XHR has that fetch doesn't have.

## Request aborting

This is the big one. In Canary you can cancel the stream, but there's no way to abort a request before headers have arrived.

We're going to fix this using cancellable promises, which other specs will benefit from. Track the discussion of this [over at GitHub](https://github.com/slightlyoff/ServiceWorker/issues/625).

## Progress events

Progress events are a high level feature that won't arrive in fetch for now. You can create your own by looking at the `Content-Length` header and using a pass-through stream to monitor the bytes received.

This means you can explicitly handle responses without a `Content-Length` differently. And of course, even if `Content-Length` is there it can be a lie. With streams you can handle these lies however you want.

## Synchronous requests

Noooope. The fetch spec documents them, but they won't be part of the API. Sync requests are awful.

# Couldn't this have been built on top of XHR?

XHR was an ugly baby and time has not been kind to it. It's 16 now. In a few years it'll be old enough to drink, and it's enough of a pain in the arse when it's sober.

Sure, a lot of this stuff could have been hacked on top of XHR, but it would have been a hack. Not only did fetch give us an opportunity to add lower-level features without the cruft of a badly designed API, it allowed us to create a better API for the simple things, using modern JavaScript features like promises and iterators.

If you want to stop using XHR today, there's a [fetch polyfill](https://github.com/github/fetch). This is built on top of XHR, so it can't do the stuff that XHR can't, but it does give you the benefits of a nicer API.

Let's make fetch happen!

# Further reading

- [Intro to ServiceWorkers](http://www.html5rocks.com/en/tutorials/service-worker/introduction/)
- [ES6 iterators](/2014/iterators-gonna-iterate/)
- [ES7 async functions](/2014/es7-async-functions/)
- [Partial fetch polyfill](https://github.com/github/fetch) - built on top of XHR

Thanks to Matt Gaunt, Mat Scales, Anne van Kesteren, Domenic Denicola, Mikeal Rogers, Ben Kelly, and Joshua Bell for disguising the fact I can't really spell, grammar, or indeed code.
