---
title: 2016 - the year of web streams
date: 2016-01-25 15:00:00
summary: "Yeah, ok, it's a touch bold to talk about something being *the thing
  of the year* as early as January, but the potential of the web streams API has
  gotten me all excited.\r

  \r

  Streams can be used to do fun things like turn clouds to butts, transcode
  MPEG to GIF, but most importantly, they can be combined with service workers
  to become *the fastest* way to serve content."
mindframe: ''
image: asset-url:./post.png
meta: Using web streams to process network data, transcode MPEG to GIF, & slash
  page render times.
---

Yeah, ok, it's a touch bold to talk about something being _the thing of the year_ as early as January, but the potential of the web streams API has gotten me all excited.

TL;DR: Streams can be used to do fun things like [turn clouds to butts](#cloud-to-butt), [transcode MPEG to GIF](#mpeg-to-gif), but most importantly, they can be combined with service workers to become [_the fastest_ way to serve content](#streaming-results).

# Streams, huh! What are they good for?

Absolutely… some things.

Promises are a great way to represent async delivery of a single value, but what about representing multiple values? Or multiple parts of larger value that arrives gradually?

Say we wanted to fetch and display an image. That involves:

1. Fetching some data from the network
2. Processing it, turning it from compressed data into raw pixel data
3. Rendering it

We could do this one step at a time, or we could stream it:

<div style="position:relative;padding-top:60.78%">
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="stream-diagram" viewBox="0 0 688.5 418.5" style="position:absolute;top:0;left:0;width:100%;height:100%"><defs><style>
@font-face {
  font-family: 'Just Another Hand';
  font-style: normal;
  font-weight: 400;
  src: url(https://fonts.gstatic.com/s/justanotherhand/v7/fKV8XYuRNNagXr38eqbRf8DbBFScDQWNirGEA9Q9Yto.woff) format('woff');
}
.stream-diagram .color-in {
  fill: none;
  stroke: #0045d6;
  stroke-width: 16.6;
  stroke-opacity: 0.23;
}
.stream-diagram .color-in-heading {
  fill: none;
  stroke: #009800;
  stroke-width: 12.8;
  stroke-opacity: 0.23;
}
.stream-diagram .label {
  font-size: 60.47px;
  line-height: 125%;
  font-family: 'Just Another Hand';
  fill: #000000;
  text-anchor: middle;
}
.stream-diagram .heading {
  font-size: 50.7px;
}
.stream-diagram .outline {
  fill: none;
  stroke: #000000;
  stroke-width: 9.1;
}
.stream-diagram .data-flow  {
  fill: none;
  stroke: #00c871;
  stroke-linecap: round;
}
.stream-diagram .data-flow.stream {
  stroke-width: 9.6;
}
.stream-diagram .data-flow.buffer {
  stroke-width: 37.4;
}
.stream-diagram .buffer.fetch {
  stroke-dasharray: 0, 300;
  stroke-dashoffset: -15;
}
.animate.stream-diagram .buffer.fetch {
  animation: stream-diagram-buffer-fetch 5s linear infinite both;
}
.stream-diagram .buffer.process {
  stroke-dasharray: 0, 300;
  stroke-dashoffset: -40;
}
.animate.stream-diagram .buffer.process {
  animation: stream-diagram-buffer-process 5s linear infinite both;
}
.stream-diagram .stream.fetch {
  stroke-dasharray: 0, 16, 0, 16, 0, 16, 0, 16, 0, 16, 0, 16, 0, 16, 0, 16, 0, 16, 0, 300;
  stroke-dashoffset: 130;
}
.animate.stream-diagram .stream.fetch {
  animation: stream-diagram-stream-fetch 5s linear infinite both;
}
.stream-diagram .stream.process {
  stroke-dasharray: 0, 49.33, 0, 49.33, 0, 49.33, 0, 49.33, 0, 49.33, 0, 49.33, 0, 49.33, 0, 49.33, 0, 49.33, 0, 300;
  stroke-dashoffset: 427;
}
.animate.stream-diagram .stream.process {
  animation: stream-diagram-stream-process 5s linear infinite both;
}
@keyframes stream-diagram-buffer-fetch {
74% {
stroke-dashoffset: -185;
}
to {
stroke-dashoffset: -185;
}
}
@keyframes stream-diagram-buffer-process {
76% {
stroke-dashoffset: -40;
}
to {
stroke-dashoffset: -205;
}
}
@keyframes stream-diagram-stream-fetch {
74% {
stroke-dashoffset: -156;
}
to {
stroke-dashoffset: -156;
}
}
@keyframes stream-diagram-stream-process {
36% {
stroke-dashoffset: 427;
}
85% {
stroke-dashoffset: -150;
}
to {
stroke-dashoffset: -150;
}
}
</style><clipPath id="a"><path d="M154.8 116.2l1.6 52.7 135.6 1.3 2.7-56.3"/></clipPath><clipPath id="b"><path d="M435.6 117l2.7 56.4 133-1-3.6-58.6"/></clipPath><clipPath id="c"><path d="M154.6 369.5v29.2l136.8 1 2.8-30.8"/></clipPath><clipPath id="d"><path d="M159.2 373.6l1 23L286 395l-.6-21"/></clipPath></defs><path transform="translate(-22.504 -15.426)" clip-path="url(#a)" d="M124 144l250-1" class="data-flow buffer fetch"/><path transform="translate(-22.504 -15.426)" class="data-flow buffer process" d="M380 145l270-1" clip-path="url(#b)"/><path transform="translate(-22.504 -15.426)" clip-path="url(#c)" d="M140 385l200-.6" class="data-flow stream fetch"/><path transform="translate(257.496 -15.426)" class="data-flow stream process" d="M140 385l170-.6" clip-path="url(#d)"/><path class="color-in-heading" d="M397.8 252l-150-1.6 190.5 12.2-189 1.2 189 11-192.8 2.4 194 6-189 6.2 189 3.7-162.2 4.6 163.5 4-36.6 2.6M365.8 8l-136-1.6 224.5 12.2-223 1.2 229 11-232.8 2.4 228 6-223 6.2 223 3.7-196.2 4.6 197.5 4-36.6 2.6"/><text class="label heading" x="341.8" y="42.8">Without streaming</text><g id="e"><path class="color-in" d="M417.5 86.5l-160.6-1 167.7 17-164.2.8L430 114.6l-172.2 5 169 12-169 3.7L427.6 150 253 152.6 423.7 168 259 166.3"/><text y="185" x="364.4" class="label" transform="translate(-22.504 -37.426)">Process</text><text class="label" x="632.6" y="184.8" transform="translate(-22.504 -37.426)">Render</text><text class="label" x="96" y="184.4" transform="translate(-22.504 -37.426)">Fetch</text><path class="outline" d="M406.5 86.5l-134 5-3.8 75.5 147.6-2.4L414 94"/><path d="M135.5 86.5L5 85.5l137.8 17-142.2.8L148 114.6l-142.2 5 139 12-139 3.7L145.6 150 1 152.6 141.7 168 7 166.3" class="color-in"/><path d="M126.5 88.5l-110 3-1.8 71.5 119.6 1.6L132 98" class="outline"/><path d="M675.5 86.5l-140.6 1 147.7 15-152.2 2.8 157.4 9.3-152.3 7 149 10-149 5.7 150 12.7-150.7 4.6L681.7 168l-144.7.2" class="color-in"/><path d="M668.5 88.5l-124 3 4.2 75.5 125.6-2.4L676 100" class="outline"/></g><use height="100%" width="100%" transform="translate(0 242)" xlink:href="#e"/><text y="284.8" x="341.8" class="label heading">With streaming</text></svg>

<script>
(function() {
  function debounce(func, delay) {
    var timeout;

    return function() {
      clearTimeout(timeout);
      timeout = setTimeout(func, delay);
    };
  }

  var diagram = document.querySelector('.stream-diagram');
  var animating = false;
  var checkForDiagramInView = debounce(function() {
    requestAnimationFrame(function() {
      var box = diagram.getBoundingClientRect();
      var viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

      if (animating) {
        if (box.top + box.height < 0 || box.top > viewportHeight) {
          diagram.setAttribute('class', diagram.getAttribute('class').replace(' animate', ''));
          animating = false;
        }
        return;
      }

      if (box.top + box.height < viewportHeight && box.top > 0) {
        diagram.setAttribute('class', diagram.getAttribute('class') + ' animate');
        animating = true;
      }
    });
  }, 100);

  window.addEventListener('resize', checkForDiagramInView);
  window.addEventListener('scroll', checkForDiagramInView);
}());
</script>
</div>

If we handle & process the response bit by bit, we get to render _some_ of the image way sooner. We even get to render the whole image sooner, because the processing can happen in parallel with the fetching. This is streaming! We're _reading_ a stream from the network, _transforming_ it from compressed data to pixel data, then _writing_ it to the screen.

You could achieve something similar with events, but streams come with benefits:

- **Start/end aware** - although streams can be infinite
- **Buffering of values that haven't been read** - whereas events that happen before listeners are attached are lost
- **Chaining via piping** - you can pipe streams together to form an async sequence
- **Built-in error handling** - errors will be propagated down the pipe
- **Cancellation support** - and that cancellation message is passed back up the pipe
- **Flow control** - you can react to the speed of the reader

That last one is really important. Imagine we were using streams to download and display a video. If we can download and decode 200 frames of video per second, but only want to display 24 frames a second, we could end up with a huge backlog of decoded frames and run out of memory.

This is where flow control comes in. The stream that's handling the rendering is pulling frames from the decoder stream 24 times a second. The decoder notices that it's producing frames faster than they're being read, and slows down. The network stream notices that it's fetching data faster than it's being read by the decoder, and slows the download.

Because of the tight relationship between stream & reader, a stream can only have one reader. However, an unread stream can be "teed", meaning it's split into two streams that receive the same data. In this case, the tee manages the buffer across both readers.

Ok, that's the theory, and I can see you're not ready to hand over that 2016 trophy just yet, but stay with me.

The browser streams loads of things by default. Whenever you see the browser displaying parts of a page/image/video as it's downloading, that's thanks to streaming. However, it's only recently, thanks to a [standardisation effort](https://streams.spec.whatwg.org/), that streams are becoming exposed to script.

# Streams + the fetch API

[`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) objects, as defined by the [fetch spec](https://fetch.spec.whatwg.org/#response-class), let you read the response as a variety of formats, but `response.body` gives you access to the underlying stream. `response.body` is supported in the current stable version of Chrome.

Say I wanted to get the content-length of a response, without relying on headers, and without keeping the whole response in memory. I could do it with streams:

```js
// fetch() returns a promise that
// resolves once headers have been received
fetch(url).then((response) => {
  // response.body is a readable stream.
  // Calling getReader() gives us exclusive access to
  // the stream's content
  var reader = response.body.getReader();
  var bytesReceived = 0;

  // read() returns a promise that resolves
  // when a value has been received
  return reader.read().then(function processResult(result) {
    // Result objects contain two properties:
    // done  - true if the stream has already given
    //         you all its data.
    // value - some data. Always undefined when
    //         done is true.
    if (result.done) {
      console.log('Fetch complete');
      return;
    }

    // result.value for fetch streams is a Uint8Array
    bytesReceived += result.value.length;
    console.log('Received', bytesReceived, 'bytes of data so far');

    // Read some more, and call this function again
    return reader.read().then(processResult);
  });
});
```

**[View demo](http://jsbin.com/vuqasa/edit?js,console)** (1.3mb)

The demo fetches 1.3mb of gzipped HTML from the server, which decompresses to 7.7mb. However, the result isn't held in memory. Each chunk's size is recorded, but the chunks themselves are garbage collected.

`result.value` is whatever the creator of the stream provides, which can be anything: a string, number, date, ImageData, DOM element… but in the case of a fetch stream it's always a [`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) of binary data. The whole response is each `Uint8Array` joined together. If you want the response as text, you can use [`TextDecoder`](https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder/TextDecoder):

```js
var decoder = new TextDecoder();
var reader = response.body.getReader();

// read() returns a promise that resolves
// when a value has been received
reader.read().then(function processResult(result) {
  if (result.done) return;
  console.log(decoder.decode(result.value, { stream: true }));

  // Read some more, and recall this function
  return reader.read().then(processResult);
});
```

`{stream: true}` means the decoder will keep a buffer if `result.value` ends mid-way through a UTF-8 code point, since a character like ♥ is represented as 3 bytes: `[0xE2, 0x99, 0xA5]`.

`TextDecoder` is currently a little clumsy, but it's likely to become a transform stream in the future (once transform streams are defined). A transform stream is an object with a writable stream on `.writable` and a readable stream on `.readable`. It takes chunks into the writable, processes them, and passes something out through the readable. Using transform streams will look like this:

<style>
  .hypothetical-code {
    background: #732525;
    color: #fff;
    font-size: 0.8rem;

    margin: 1em -20px 0;
    padding: 7px 20px;
  }

  @media screen and (min-width: 530px) {
    .hypothetical-code {
      margin-left: -32px;
      margin-right: 0;
      padding-left: 32px;
      padding-right: 0;
    }
  }

  .hypothetical-code + .code-example {
    margin-top: 0;
  }
</style>

<p class="hypothetical-code">Hypothetical future-code:</p>

```js
var reader = response.body.pipeThrough(new TextDecoder()).getReader();

reader.read().then((result) => {
  // result.value will be a string
});
```

The browser should be able to optimise the above, since both the response stream and `TextDecoder` transform stream are owned by the browser.

## Cancelling a fetch

A stream can be cancelled using `stream.cancel()` (so `response.body.cancel()` in the case of fetch) or `reader.cancel()`. Fetch reacts to this by stopping the download.

**[View demo](https://jsbin.com/gameboy/edit?js,console)** (also, note the amazing random URL JSBin gave me).

This demo searches a large document for a term, only keeps a small portion in memory, and stops fetching once a match is found.

Anyway, this is all so 2015. Here's the fun new stuff…

# Creating your own readable stream

In Chrome Canary with the "Experimental web platform features" flag enabled, you can now create your own streams.

```js
var stream = new ReadableStream(
  {
    start(controller) {},
    pull(controller) {},
    cancel(reason) {},
  },
  queuingStrategy,
);
```

- `start` is called straight away. Use this to set up any underlying data sources (meaning, wherever you get your data from, which could be events, another stream, or just a variable like a string). If you return a promise from this and it rejects, it will signal an error through the stream.
- `pull` is called when your stream's buffer isn't full, and is called repeatedly until it's full. Again, If you return a promise from this and it rejects, it will signal an error through the stream. Also, `pull` will not be called again until the returned promise fulfills.
- `cancel` is called if the stream is cancelled. Use this to cancel any underlying data sources.
- `queuingStrategy` defines how much this stream should ideally buffer, defaulting to one item - I'm not going to go into depth on this here, [the spec has more details](https://streams.spec.whatwg.org/#blqs-class).

As for `controller`:

- `controller.enqueue(whatever)` - queue data in the stream's buffer.
- `controller.close()` - signal the end of the stream.
- `controller.error(e)` - signal a terminal error.
- `controller.desiredSize` - the amount of buffer remaining, which may be negative if the buffer is over-full. This number is calculated using the `queuingStrategy`.

So if I wanted to create a stream that produced a random number every second, until it produced a number `> 0.9`, I'd do it like this:

```js
var interval;
var stream = new ReadableStream({
  start(controller) {
    interval = setInterval(() => {
      var num = Math.random();

      // Add the number to the stream
      controller.enqueue(num);

      if (num > 0.9) {
        // Signal the end of the stream
        controller.close();
        clearInterval(interval);
      }
    }, 1000);
  },
  cancel() {
    // This is called if the reader cancels,
    //so we should stop generating numbers
    clearInterval(interval);
  },
});
```

**[See it running](https://jsbin.com/fahavoz/edit?js,console)**. **Note:** You'll need Chrome Canary with `chrome://flags/#enable-experimental-web-platform-features` enabled.

It's up to you when to pass data to `controller.enqueue`. You could just call it whenever you have data to send, making your stream a "push source", as above. Alternatively you could wait until `pull` is called, then use that as a signal to collect data from the underlying source and then `enqueue` it, making your stream a "pull source". Or you could do some combination of the two, whatever you want.

Obeying `controller.desiredSize` means the stream is passing data along at the most efficient rate. This is known has having "backpressure support", meaning your stream reacts to the read-rate of the reader (like the video decoding example earlier). However, ignoring `desiredSize` won't break anything unless you run out of device memory. The spec has a good example of [creating a stream with backpressure support](https://streams.spec.whatwg.org/#example-rs-push-backpressure).

Creating a stream on its own isn't particularly fun, and since they're new, there aren't a lot of APIs that support them, but there is one:

```js
new Response(readableStream);
```

You can create an HTTP response object where the body is a stream, and you can use these as responses from a service worker!

# Serving a string, slowly

**[View demo](https://jakearchibald.github.io/isserviceworkerready/demos/simple-stream/)**. **Note:** You'll need Chrome Canary with `chrome://flags/#enable-experimental-web-platform-features` enabled.

You'll see a page of HTML rendering (deliberately) slowly. This response is entirely generated within a service worker. Here's the code:

```js
// In the service worker:
self.addEventListener('fetch', (event) => {
  var html = '…html to serve…';

  var stream = new ReadableStream({
    start(controller) {
      var encoder = new TextEncoder();
      // Our current position in `html`
      var pos = 0;
      // How much to serve on each push
      var chunkSize = 1;

      function push() {
        // Are we done?
        if (pos >= html.length) {
          controller.close();
          return;
        }

        // Push some of the html,
        // converting it into an Uint8Array of utf-8 data
        controller.enqueue(encoder.encode(html.slice(pos, pos + chunkSize)));

        // Advance the position
        pos += chunkSize;
        // push again in ~5ms
        setTimeout(push, 5);
      }

      // Let's go!
      push();
    },
  });

  event.respondWith(
    new Response(stream, {
      headers: { 'Content-Type': 'text/html' },
    }),
  );
});
```

When the browser reads a response body it expects to get chunks of `Uint8Array`, it fails if passed something else like a plain string. Thankfully `TextEncoder` can take a string and returns a `Uint8Array` of bytes representing that string.

Like `TextDecoder`, `TextEncoder` should become a transform stream in future.

# Serving a transformed stream

Like I said, transform streams haven't been defined yet, but you can achieve the same result by creating a readable stream that produces data sourced from another stream.

## "Cloud" to "butt"

**[View demo](https://jakearchibald.github.io/isserviceworkerready/demos/transform-stream/)**. **Note:** You'll need Chrome Canary with `chrome://flags/#enable-experimental-web-platform-features` enabled.

What you'll see is [this page](https://jakearchibald.github.io/isserviceworkerready/demos/transform-stream/cloud.html) (taken from the cloud computing article on Wikipedia) but with every instance of "cloud" replaced with "butt". The benefit of doing this as a stream is you can get transformed content on the screen while you're still downloading the original.

[Here's the code](https://github.com/jakearchibald/isserviceworkerready/blob/master/src/demos/transform-stream/sw.js), including details on some of the edge-cases.

## MPEG to GIF

Video codecs are really efficient, but videos don't autoplay on mobile. GIFs autoplay, but they're huge. Well, here's a _really stupid_ solution:

**[View demo](https://jakearchibald.github.io/isserviceworkerready/demos/gif-stream/)**. **Note:** You'll need Chrome Canary with `chrome://flags/#enable-experimental-web-platform-features` enabled.

Streaming is useful here as the first frame of the GIF can be displayed while we're still decoding MPEG frames.

So there you go! A 26mb GIF delivered using only 0.9mb of MPEG! Perfect! Except it isn't real-time, and uses a lot of CPU. Browsers should really allow autoplaying of videos on mobile, especially if muted, and it's something Chrome is working towards right now.

Full disclosure: I cheated somewhat in the demo. It downloads the whole MPEG before it begins. I wanted to get it streaming from the network, but I ran into an `OutOfSkillError`. Also, the GIF really shouldn't loop while it's downloading, that's a bug we're looking into.

# Creating one stream from multiple sources to supercharge page render times

This is probably the most practical application of service worker + streams. The benefit is _huge_ in terms of performance.

A few months ago I built a [demo of an offline-first wikipedia](https://wiki-offline.jakearchibald.com/). I wanted to create a truly progressive web-app that worked fast, and added modern features as enhancements.

In terms of performance, the numbers I'm going to talk about are based on a lossy 3g connection simulated using OSX's Network Link Conditioner.

Without the service worker it displays content sent to it by the server. I put a lot of effort into performance here, and it paid off:

<style>
  .timing-graph .scale {
    position: relative;
    height: 33px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.5);
  }
  .timing-graph .scale::after {
    content: '';
    top: 100%;
    height: 1px;
    background: linear-gradient(to right, rgba(0,0,0,0.5), rgba(0,0,0,0));
    left: 100%;
    position: absolute;
  }
  .timing-graph .scale > div {
    position: absolute;
    bottom: 0;
    left: 0;
  }
  .timing-graph .scale > div::after {
    display: block;
    content: '';
    width: 1px;
    height: 10px;
    background: #000;
  }
  .timing-graph .scale > div:last-child::after {
    margin-left: -1px;
  }
  .timing-graph .scale .label {
    position: absolute;
    left: 0;
    top: -27px;
    transform: translateX(-50%);
  }
  .timing-graph .result {
    height: 2.4rem;
    position: relative;
    display: flex;
    margin: 6px 0;
    color: #fff;
    opacity: 0.5;
  }
  .timing-graph .result:last-child {
    opacity: 1;
  }
  .timing-graph .result .title {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    display: flex;
    align-items: center;
    font: normal 1.2rem/1 sans-serif;
    margin: 0 10px;
    text-shadow: 0 1.3px 1.4px rgba(0,0,0,0.6);
  }

  .timing-graph .results {
    margin: 0;
    padding: 0;
  }

  .timing-graph .result .white-time,
  .timing-graph .result .shell-time {
    height: 100%;
  }

  .timing-graph .result,
  .results-key .content::before {
    background: #21AF63;
  }

  .timing-graph .result .white-time,
  .results-key .nothing::before {
    background: #DB4437;
  }

  .timing-graph .result .shell-time,
  .results-key .header::before {
    background: #F4B401;
  }

  .timing-graph .result::after {
    content: '';
    position: absolute;
    left: 85%;
    top: 0;
    bottom: 0;
    background: linear-gradient(to right, #21AF63, #fff);
  }

  .timing-graph .non-visual {
    position: absolute;
    width: 0;
    height: 0;
    opacity: 0;
    overflow: hidden;
  }

  .results-key {
    display: flex;
    flex-flow: row wrap;
    justify-content: center;
  }

  .results-key > div {
    display: flex;
    align-items: center;
    margin: 0 0.6rem;
  }

  .results-key > div::before {
    content: '';
    display: block;
    width: 1rem;
    height: 1rem;
    margin-right: 0.3rem;
  }

  .timing-graph .scale::after,
  .timing-graph .result::after {
    right: -20px;
    right: -20px;
  }

  @media (min-width: 530px) {
    .timing-graph .scale::after,
    .timing-graph .result::after {
      right: -32px;
      right: -32px;
    }
  }
</style>

<div class="results-key" aria-hidden="true">
  <div class="nothing">Nothing rendered</div>
  <div class="header">Header &amp; background</div>
  <div class="content">Article content</div>
</div>
<div class="results-server-render"></div>

<script>
  function TimingGraph(size, majorTick, minorTick) {
    this.container = document.createElement('div');
    this.container.className = 'timing-graph';
    this.container.innerHTML = '<div class="scale" aria-hidden="true"></div><ul class="results"></ul>';
    this.size = size;
    this.results = this.container.querySelector('.results');

    var scale = this.container.querySelector('.scale');

    for (var i = 0; i <= size; i += minorTick) {
      var el = document.createElement('div');

      if (!(i % majorTick)) {
        el.innerHTML = '<div class="label">' + (i/1000) + 's' + '</div>';
        el.classList.add('major');
      }

      el.style.left = (i/size) * 100 + '%';
      scale.appendChild(el);
    }
  }

  TimingGraph.prototype.addResult = function(title, shellTime, contentTime) {
    var result = document.createElement('li');
    result.className = 'result';
    result.innerHTML =
      '<span class="white-time"></span>' +
      '<span class="shell-time"></span>' +
      '<span class="title"></span>';

    var titleEl = result.querySelector('.title');
    var whiteTimeEl = result.querySelector('.white-time');
    var shellTimeEl = result.querySelector('.shell-time');

    titleEl.innerHTML = title + '<span class="non-visual">: ' + (shellTime / 1000) + ' seconds until initial render, ' + (contentTime / 1000) + ' seconds until content render</span>';
    whiteTimeEl.style.width = (shellTime/this.size) * 100 + '%';
    shellTimeEl.style.width = ((contentTime - shellTime)/this.size) * 100 + '%';

    this.results.appendChild(result);
  };

  (function() {
    var graph = new TimingGraph(4500, 1000, 500);
    document.querySelector('.results-server-render').appendChild(graph.container);
    graph.addResult('Server render', 730, 1800);
  }());
</script>

**[View demo](https://wiki-offline.jakearchibald.com/wiki/Google?use-url-flags&prevent-sw=1)**

Not bad. I added a service worker to mix in some offline-first goodness and improve performance further. And the results?

<div class="results-client-render"></div>

<script>
  (function() {
    var graph = new TimingGraph(4500, 1000, 500);
    document.querySelector('.results-client-render').appendChild(graph.container);
    graph.addResult('Server render', 730, 1800);
    graph.addResult('Service worker client render', 100, 3800);
  }());
</script>

**[View demo](https://wiki-offline.jakearchibald.com/wiki/Google?use-url-flags&client-render=1&prevent-streaming=1&no-prefetch)**

So um, first render is faster, but there's a massive regression when it comes to rendering content.

The _fastest_ way would be to serve the entire page from the cache, but that involves caching all of Wikipedia. Instead, I served a page that contained the CSS, JavaScript and header, getting a fast initial render, then let the page's JavaScript set about fetching the article content. And that's where I lost all the performance - client-side rendering.

HTML renders as it downloads, whether it's served straight from a server or via a service worker. But I'm fetching the content from the page using JavaScript, then writing it to `innerHTML`, bypassing the streaming parser. Because of this, the content has to be fully downloaded before it can be displayed, and that's where the two second regression comes from. The more content you're downloading, the more the lack of streaming hurts performance, and unfortunately for me, Wikipedia articles are pretty big (the Google article is 100k).

This is why you'll see me whining about JavaScript-driven web-apps and frameworks - they tend to throw away streaming as step zero, and performance suffers as a result.

I tried to claw some performance back using prefetching and pseudo-streaming. The pseudo-streaming is particularly hacky. The page fetches the article content and reads it as a stream. Once it receives 9k of content, it's written to `innerHTML`, then it's written to `innerHTML` again once the rest of the content arrives. This is horrible as it creates some elements twice, but hey, it's worth it:

<div class="results-client-render-hacks"></div>

<script>
  (function() {
    var graph = new TimingGraph(4500, 1000, 500);
    document.querySelector('.results-client-render-hacks').appendChild(graph.container);
    graph.addResult('Server render', 730, 1800);
    graph.addResult('Service worker client render', 100, 3800);
    graph.addResult('…with hacks', 100, 2500);
  }());
</script>

**[View demo](https://wiki-offline.jakearchibald.com/wiki/Google?use-url-flags&client-render=1)**

So the hacks improve things but it still lags behind server render, which isn't really acceptable. Furthermore, content that's added to the page using `innerHTML` doesn't quite behave the same as regular parsed content. Notably, inline `<script>`s aren't executed.

This is where streams step in. Instead of serving an empty shell and letting JS populate it, I let the service worker construct a stream where the header comes from a cache, but the body comes from the network. It's like server-rendering, but in the service worker:

<div class="results-stream" id="streaming-results"></div>

<script>
  (function() {
    var graph = new TimingGraph(4500, 1000, 500);
    document.querySelector('.results-stream').appendChild(graph.container);
    graph.addResult('Server render', 730, 1800);
    graph.addResult('Service worker client render', 100, 3800);
    graph.addResult('…with hacks', 100, 2500);
    graph.addResult('Service worker stream', 100, 1000);
  }());
</script>

**[View demo](https://wiki-offline.jakearchibald.com/wiki/Google?sw-stream)**. **Note:** You'll need Chrome Canary with `chrome://flags/#enable-experimental-web-platform-features` enabled.

Using service worker + streams means you can get an almost-instant first render, then beat a regular server render by piping a smaller amount of content from the network. Content goes through the regular HTML parser, so you get streaming, and none of the behavioural differences you get with adding content to the DOM manually.

<figure class="full-figure">
<div class="video" style="padding-top: 70.3%"><iframe src="//www.youtube.com/embed/Cjo9iq8k-bc?rel=0&amp;html5=1" frameborder="0" allowfullscreen></iframe></div>
<figcaption>Render time comparison</figcaption>
</figure>

## Crossing the streams

Because piping isn't supported yet, combining the streams has to be done manually, making things a little messy:

```js
var stream = new ReadableStream({
  start(controller) {
    // Get promises for response objects for each page part
    // The start and end come from a cache
    var startFetch = caches.match('/page-start.inc');
    var endFetch = caches.match('/page-end.inc');
    // The middle comes from the network, with a fallback
    var middleFetch = fetch('/page-middle.inc').catch(() =>
      caches.match('/page-offline-middle.inc'),
    );

    function pushStream(stream) {
      // Get a lock on the stream
      var reader = stream.getReader();

      return reader.read().then(function process(result) {
        if (result.done) return;
        // Push the value to the combined stream
        controller.enqueue(result.value);
        // Read more & process
        return reader.read().then(process);
      });
    }

    // Get the start response
    startFetch
      // Push its contents to the combined stream
      .then((response) => pushStream(response.body))
      // Get the middle response
      .then(() => middleFetch)
      // Push its contents to the combined stream
      .then((response) => pushStream(response.body))
      // Get the end response
      .then(() => endFetch)
      // Push its contents to the combined stream
      .then((response) => pushStream(response.body))
      // Close our stream, we're done!
      .then(() => controller.close());
  },
});
```

There are some templating languages such as [Dust.js](http://www.dustjs.com/) which stream their output, and also handle streams as values within the template, piping the content too and even HTML-escaping it on the fly. All that's missing is support for web streams.

# The future for streams

Aside from readable streams, the streams spec is still being developed, but what you can already do is pretty incredible. If you're wanting to improve the performance of a content-heavy site and provide an offline-first experience without rearchitecting, constructing streams within a service worker will become the easiest way to do it. It's how I intend to make this blog work offline-first anyway!

Having a stream primitive on the web means we'll start to get script access to all the streaming capabilities the browser already has. Things like:

- Gzip/deflate
- Audio/video codecs
- Image codecs
- The streaming HTML/XML parser

It's still early days, but if you want to start preparing your own APIs for streams, there's a [reference implementation](https://github.com/whatwg/streams/tree/master/reference-implementation/) that can be used as a polyfill in some cases.

Streaming is one of the browser's biggest assets, and 2016 is the year it's unlocked to JavaScript.

<small>Thanks to [Dominic Szablewski's JS MPEG1 decoder](https://github.com/phoboslab/jsmpeg) ([check out his talk about it](https://vimeo.com/144499042)), and [Eugene Ware's GIF encoder](https://github.com/eugeneware/gifencoder). And thanks to Domenic Denicola, Takeshi Yoshino, Yutaka Hirano, Lyza Danger Gardner, Nicolás Bevacqua, and Anne van Kesteren for corrections & ideas. Yes that's how many people it takes to catch all my mistakes.</small>
