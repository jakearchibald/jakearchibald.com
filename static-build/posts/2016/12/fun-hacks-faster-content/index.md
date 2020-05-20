---
title: Fun hacks for faster content
date: 2016-12-06 13:05:11
summary: 'A few weeks ago I was at Heathrow airport getting a bit of work done
  before a flight, and I noticed something odd about the performance of GitHub:
  It was quicker to open links in a new window than simply click them. Turns out
  it was a lack of streaming…'
mindframe: '- Seems I''m finding everything "fun" right now'
image: asset-url:./diagram.png
meta: Using iframes and document.write to improve performance of content loading.
---

A few weeks ago I was at Heathrow airport getting a bit of work done before a flight, and I noticed something odd about the performance of GitHub: It was quicker to open links in a new window than simply click them. Here's a video I took at the time:

<figure class="full-figure">
<div class="video"><iframe src="//www.youtube.com/embed/4zG0AZRZD6Q?rel=0&amp;html5=1" frameborder="0" allowfullscreen></iframe></div>
<figcaption>GitHub link click vs new tab</figcaption>
</figure>

Here I click a link, then paste the same link into a fresh tab. The page in the fresh tab renders way sooner, even though it's started later.

# Show them what you got

<style>
  @keyframes connection-line {
    to {
      stroke-dashoffset: 36;
    }
  }

  .animate-diagram .connection-path {
    animation: connection-line 0.5s linear infinite;
  }

  @keyframes page-reveal {
    from {
      transform: translateY(252.70296px) scaleY(0) translateY(-252.70296px);
      animation-timing-function: steps(5);
    }
    50% {
      transform: translateY(252.70296px) scaleY(1) translateY(-252.70296px);
    }
  }

  .animate-diagram .page-loading path {
    animation: page-reveal 4s linear infinite;
  }

  @keyframes page-img-appear {
    from {
      opacity: 0;
      animation-timing-function: steps(1);
    }
    40% {
      opacity: 1;
    }
  }

  .animate-diagram .page-img {
    animation: page-img-appear 4s linear infinite;
  }
</style>

<figure class="full-figure connection-diagram blueprint" style="background-color: #0065a4">
<svg viewBox="0 0 1920 1000">
  <g fill="#fff">
    <path d="M1594 148.6h173c14.5 0 26-11.4 26-26 0-14.5-11.5-26-26-26h-173c-14.5 0-26 11.5-26 26 0 14.6 11.5 26 26 26zm130-32h46.7c3 0 6.2 3 6.2 6s-3.2 6-6.3 6H1724c-3 0-6-3-6-6s3-6 6-6zm-88 0h15.4c3 0 6.2 3 6.2 6s-3 6-6.2 6H1636c-3 0-6-3-6-6s3-6 6-6zm-39.6 0h15.3c3 0 6 3 6 6s-3 6-6 6h-15.3c-3 0-6.2-3-6.2-6s2.3-6 6.2-6zM1767 225h-173c-14.5 0-26 11.6-26 26 0 14.7 11.5 26 26 26h173c14.5 0 26-11.3 26-26 0-14.4-11.5-26-26-26zm-155.3 32.2h-15.3c-3 0-6.2-3-6.2-6s3-6.2 6.2-6.2h15.3c3 0 6 3 6 6 0 3.2-3 6.2-6 6.2zm40.5 0H1637c-3.2 0-6.2-3-6.2-6s3-6.2 6-6.2h15.4c3 0 6 3 6 6 0 3.2-3 6.2-6 6.2zm118.5 0H1724c-3 0-6-3-6-6s3-6.2 6-6.2h46.7c3 0 6.2 3 6.2 6 0 3.2-3.2 6.2-6.3 6.2zM1767 161h-173c-14.5 0-26 11.3-26 26 0 14.4 11.5 26 26 26h173c14.5 0 26-11.6 26-26 0-14.7-11.5-26-26-26zm-155.3 32h-15.3c-3 0-6.2-3-6.2-6 0-3.2 3-6.2 6.2-6.2h15.3c3 0 6 3 6 6 0 4-3 6.2-6 6.2zm40.5 0H1637c-3.2 0-6.2-3-6.2-6 0-3.2 3-6.2 6-6.2h15.4c3 0 6 3 6 6 0 4-3 6.2-6 6.2zm118.5 0H1724c-3 0-6-3-6-6 0-3.2 3-6.2 6-6.2h46.7c3 0 6.2 3 6.2 6 0 4-3.2 6.2-6.3 6.2zM1761.6 321.5h-75v-33.7h-12.2v33.7h-75c-3 0-6 3-6 6 0 3.2 3 6.2 6 6.2h161.4c3 0 6-3 6-6 1-3.2-2.2-6.2-5.2-6.2z"/>
  </g>
  <path class="connection-path" d="M423.7 765.3c538.6-.7 725.8-446.7 1153.7-438.5" fill="none" stroke="#fff" stroke-width="12.1" stroke-dasharray="12.1 24.2"/>
  <g transform="matrix(.68416 0 0 .68416 -214.763 495.975)">
    <path class="page-img" fill="none" stroke="#fff" stroke-width="13.58414" stroke-linecap="round" stroke-linejoin="round" d="M661.7 266.5H539.5v102h122.2z"/>
    <clipPath class="page-loading" id="a">
      <path fill="#fff" d="M518.8 252.7H883v235H519z"/>
    </clipPath>
    <g clip-path="url(#a)" class="page-text" fill="none" stroke="#fff" stroke-width="13.6" stroke-linecap="round" stroke-linejoin="round">
      <path d="M695.7 300.5h74.7M797.6 300.5h68M695.7 334.4H811M838.3 334.4h27.2M695.7 266.5H811M838.3 266.5h27.2M695.7 436.3h74.7M797.6 436.3h68M695.7 368.4h74.7M797.6 368.4h68M702.5 402.4h34M763.6 402.4h102M539.5 402.4H621M648 402.4h27.3M702.5 470.3H811M838.3 470.3h27.2M539.5 470.3H621M648 470.3h27.3M539.5 436.3h20.3M587 436.3h81.5"/>
    </g>
    <path d="M899.4 504.2h-394V259.7c0-15 12.3-27 27.3-27h339.6c15 0 27 12 27 27v244.5zM872.3 558.6H532.7c-15 0-27.2-12.2-27.2-27.2v-27.2h394v27.2c0 15-12.2 27.2-27.2 27.2z" fill="none" stroke="#fff" stroke-width="13.6" stroke-linecap="round" stroke-linejoin="round"/>
    <path fill="none" stroke="#fff" stroke-width="13.58414" stroke-linecap="round" stroke-linejoin="round" d="M641.3 626.5l20.4-68h81.5l20.4 68z"/>
    <path d="M777.2 626.5H627.8" fill="none" stroke="#fff" stroke-width="13.6" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>
</figure>

<script>
  (function() {
    var diagram = document.querySelector('.connection-diagram');

    if (window.IntersectionObserver) {
      var observer = new IntersectionObserver(function(changes) {
        changes.forEach(function(change) {
          if (change.intersectionRatio) {
            diagram.classList.add('animate-diagram');
            return;
          }
          diagram.classList.remove('animate-diagram');
        });
      }, {});

      observer.observe(diagram);
    }
    else {
      diagram.classList += ' animate-diagram';
    }
  }())
</script>

When you load a page, the browser takes a network stream and pipes it to the HTML parser, and the HTML parser is piped to the document. This means the page can render progressively as it's downloading. The page may be 100k, but it can render useful content after only 20k is received.

This is a great, ancient browser feature, but as developers we often engineer it away. Most load-time performance advice boils down to "show them what you got" - don't hold back, don't wait until you have everything before showing the user anything.

GitHub cares about performance so they server-render their pages. However, when navigating within the same tab navigation is entirely reimplemented using JavaScript. Something like…

```js
// …lots of code to reimplement browser navigation…
const response = await fetch('page-data.inc');
const html = await response.text();
document.querySelector('.content').innerHTML = html;
// …loads more code to reimplement browser navigation…
```

This breaks the rule, as all of `page-data.inc` is downloaded before anything is done with it. The server-rendered version doesn't hoard content this way, it streams, making it faster. For GitHub's client-side render, a lot of JavaScript was written to make this slow.

I'm just using GitHub as an example here - this anti-pattern is used by almost every single-page-app.

Switching content in the page can have some benefits, especially if you have some heavy scripts, as you can update content without re-evaluating all that JS. But can we do that without losing streaming? I've often said that JavaScript has no access to the streaming parser, but it kinda does…

# Using iframes and document.write to improve performance

The worst hacks involve `<iframe>`s, and this one uses `<iframe>`s _and_ `document.write()`, but it does allow you to stream content to the page. It goes like this:

```js
// Create an iframe:
const iframe = document.createElement('iframe');

// Put it in the document (but hidden):
iframe.style.display = 'none';
document.body.appendChild(iframe);

// Wait for the iframe to be ready:
iframe.onload = () => {
  // Ignore further load events:
  iframe.onload = null;

  // Write a dummy tag:
  iframe.contentDocument.write('<streaming-element>');

  // Get a reference to that element:
  const streamingElement = iframe.contentDocument.querySelector(
    'streaming-element',
  );

  // Pull it out of the iframe & into the parent document:
  document.body.appendChild(streamingElement);

  // Write some more content - this should be done async:
  iframe.contentDocument.write('<p>Hello!</p>');

  // Keep writing content like above, and then when we're done:
  iframe.contentDocument.write('</streaming-element>');
  iframe.contentDocument.close();
};

// Initialise the iframe
iframe.src = '';
```

Although `<p>Hello!</p>` is written to the iframe, it appears in the parent document! This is because [the parser](https://html.spec.whatwg.org/multipage/syntax.html#parsing) maintains a [stack of open elements](https://html.spec.whatwg.org/multipage/syntax.html#stack-of-open-elements), which newly created elements are inserted into. It doesn't matter that we moved `<streaming-element>`, it just works.

Also, this technique processes HTML much closer to the standard page-loading parser than `innerHTML`. Notably, scripts will download and execute in the context of the parent document, except in Firefox where script doesn't execute at all, <del>but I think that's a bug</del> **update:** turns out [scripts shouldn't be executed](https://html.spec.whatwg.org/multipage/syntax.html#scripts-that-modify-the-page-as-it-is-being-parsed) (thanks to [Simon Pieters for pointing this out](https://twitter.com/zcorpan/status/806150847184928768)), but Edge, Safari & Chrome all do.

Now we just have to stream HTML content from the server and call `iframe.contentDocument.write()` as each part arrives. Streaming is really efficient with `fetch()`, but for a sake of Safari support [we'll hack it with XHR](https://github.com/jakearchibald/streaming-html/blob/master/streaming-iframe.js).

I've built a little demo where you can [compare this to what GitHub does today](https://jakearchibald.github.io/streaming-html/), and here are the results based on a 3g connection:

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
  <div class="nothing">Waiting</div>
  <div class="header">Some content rendered</div>
  <div class="content">All avatars loaded</div>
</div>
<div class="results-streaming-iframe"></div>

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

    titleEl.innerHTML = title + '<span class="non-visual">: ' + (shellTime / 1000) + ' seconds until some content rendered, ' + (contentTime / 1000) + ' seconds until all avatars have loaded</span>';
    whiteTimeEl.style.width = (shellTime/this.size) * 100 + '%';
    shellTimeEl.style.width = ((contentTime - shellTime)/this.size) * 100 + '%';

    this.results.appendChild(result);
  };

  (function() {
    var graph = new TimingGraph(3500, 1000, 500);
    document.querySelector('.results-streaming-iframe').appendChild(graph.container);
    graph.addResult('XHR + innerHTML', 2000, 3200);
    graph.addResult('Streaming iframe hack', 500, 2500);
  }());
</script>

[Raw test data](https://www.webpagetest.org/video/compare.php?tests=161206_N2_FJG-r,161206_JP_FPV-r:5-c:0).

By streaming the content via the iframe, content appears **1.5 seconds sooner**. The avatars also finish loading half a second sooner - streaming means the browser finds out about them earlier, so it can download them in parallel with the content.

The above would work for GitHub since the server delivers HTML, but if you're using a framework that wants to manage its own representation of the DOM you'll probably run into difficulties. For that case, here's a less-good alternative:

# Newline-delimited JSON

A lot of sites deliver their dynamic updates as JSON. Unfortunately JSON isn't a streaming-friendly format. There are [streaming JSON parsers out there](https://github.com/creationix/jsonparse), but they aren't easy to use.

So instead of delivering a chunk of JSON:

```js
{
  "Comments": [
    {"author": "Alex", "body": "…"},
    {"author": "Jake", "body": "…"}
  ]
}
```

…deliver each JSON object on a new line:

```js
{"author": "Alex", "body": "…"}
{"author": "Jake", "body": "…"}
```

This is called "newline-delimited JSON" and there's a [sort-of standard for it](http://specs.okfnlabs.org/ndjson/). Writing a parser for the above is much simpler. In 2017 we'll be able to express this as a series of composable transform streams:

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

<p class="hypothetical-code">Sometime in 2017:</p>

```js
const response = await fetch('comments.ndjson');
const comments = response.body
  // From bytes to text:
  .pipeThrough(new TextDecoder())
  // Buffer until newlines:
  .pipeThrough(splitStream('\n'))
  // Parse chunks as JSON:
  .pipeThrough(parseJSON());

for await (const comment of comments) {
  // Process each comment and add it to the page:
  // (via whatever template or VDOM you're using)
  addCommentToPage(comment);
}
```

…where `splitStream` and `parseJSON` are [reusable transform streams](https://gist.github.com/jakearchibald/c2052ef298459355963b8cfb79c71d1c). But in the meantime, for maximum browser compatibility we can [hack it on top of XHR](https://github.com/jakearchibald/streaming-html/blob/master/xhr-ndjson.js).

Again, I've [built a little demo where you can compare the two](https://jakearchibald.github.io/streaming-html/), here are the 3g results:

<div class="results-ndjson"></div>

<script>
  (function() {
    var graph = new TimingGraph(3500, 1000, 500);
    document.querySelector('.results-ndjson').appendChild(graph.container);
    graph.addResult('XHR + innerHTML', 2000, 3200);
    graph.addResult('Streaming iframe hack', 500, 2500);
    graph.addResult('XHR + JSON', 2100, 3200);
    graph.addResult('XHR + ND-JSON', 600, 2500);
  }());
</script>

[Raw test data](https://www.webpagetest.org/video/compare.php?tests=161206_X9_FNG-r,161206_V7_FPJ-r:1-c:0).

Versus normal JSON, ND-JSON gets content on screen **1.5 seconds sooner**, although it isn't quite as fast as the iframe solution. It has to wait for a complete JSON object before it can create elements, you may run into a lack-of-streaming if your JSON objects are huge.

# Don't go single-page-app too soon

As I mentioned above, GitHub wrote a lot of code to create this performance problem. Reimplementing navigations on the client is hard, and if you're changing large parts of the page it might not be worth it.

If we compare our best efforts to a [simple browser navigation](https://jakearchibald.github.io/streaming-html/):

<div class="results-navigation"></div>

<script>
  (function() {
    var graph = new TimingGraph(3500, 1000, 500);
    document.querySelector('.results-navigation').appendChild(graph.container);
    graph.addResult('Streaming iframe hack', 500, 2500);
    graph.addResult('XHR + ND-JSON', 600, 2500);
    graph.addResult('Normal server render', 600, 2500);
  }());
</script>

[Raw test data](https://www.webpagetest.org/video/compare.php?tests=161206_JP_FPV-r,161206_V7_FPJ-r,161206_8Y_FN3-r:8-c:0).

…a simple no-JavaScript browser navigation to a server rendered page is roughly as fast. The test page is really simple aside from the comments list, your mileage may vary if you have a lot of complex content repeated between pages (basically, I mean horrible ad scripts), but always test! You might be writing a lot of code for very little benefit, or even making it slower.

<small>Thanks to [Elliott Sprehn](https://twitter.com/ElliottZ?s=09) for telling me the HTML parser worked this way!</small>
