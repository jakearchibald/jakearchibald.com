---
title: Who has the fastest F1 website in 2021? Part 5
date: 2021-03-31 01:00:00
summary: Deep-diving on the load performance of F1 websites.
meta: Deep-diving on the load performance of F1 websites.
image: 'asset-url:./img.jpg'
---

<script type="component">{
  "module": "shared/demos/2021/f1-perf/Parts",
  "staticOnly": true,
  "props": {
    "includeIntro": true,
    "partIndex": 4
  }
}</script>

<style>
  .scrollable-img {
    overflow-x: scroll;
    -webkit-overflow-scrolling: touch;
  }
  .scrollable-img img {
    max-width: none;
  }
  .scrollable-img svg {
    min-width: max-content;
    width: 100%;
  }

  .full-figure + .scrollable-img , .full-figure + .perf-summary {
    margin-top: -1em;
  }

  .perf-summary {
    display: grid;
    grid-template-columns: max-content 1fr;
    margin: 1em -20px;
  }

  .perf-summary > dt {
    background: #009d81;
    color: #fff;
    margin: 0;
    padding: .5em .5em .5em 20px;
  }

  @media (min-width: 530px) {
    .perf-summary > dt {
      padding-left: 32px;
    }

    .perf-summary {
      margin-left: -32px;
      margin-right: -64px;
    }
  }

  @media (min-width: 800px) {
    .perf-summary {
      margin-right: -32px;
    }
  }

  .perf-summary > dt:nth-of-type(even) {
    background: #3cb39d;
  }

  .perf-summary > dd {
    background: #ececec;
    margin: 0;
    display: grid;
    grid-template-columns: [icon] max-content [desc] 1fr;
    align-items: center;
  }

  .perf-summary > dd:nth-of-type(even) {
    background: #f7f7f7;
  }

  .perf-summary .perf-data {
    padding: .5em;
    grid-column: desc;
    grid-row: 1;
  }
  .perf-summary .perf-icon {
    width: 1.6em;
    height: auto;
    margin-left: .5em;
    grid-column: icon;
    grid-row: 1;
  }

  .video-aspect {
    position: relative;
  }

  .video-aspect svg {
    display: block;
    width: 100%;
    max-height: 60vh;
  }

  .video-aspect video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #000;
  }
</style>

<style>
  .image-tabs {
    position: relative;
  }
  .image-tabs-pop-out-icon {
    position: absolute;
    top: 10px;
    right: 10px;
    fill: #fff;
    width: 32px;
    filter: drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.7));
  }
  .image-tabs-preview {
    position: relative;
    overflow: hidden;
    background: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2 2"><path d="M1 2V0h1v1H0v1z" fill-opacity=".025"/></svg>');
    background-size: 20px 20px;
  }
  .image-tabs-background,
  .image-tabs-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: 0 auto;
  }
  .image-tabs-transformer {
    position: relative;
    display: grid;
    align-items: stretch;
    justify-items: stretch;
  }
  .image-tabs-transformer > * {
    grid-area: 1/1;
  }
  .image-tabs-tabs {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: 1fr;
    border-top: 7px solid #ffe454;
  }
  .image-tabs input[type=radio] {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }
  .image-tabs-label {
    padding: 0.7em 0.7em;
    text-align: center;
    cursor: pointer;
    line-height: 1.3;
    font-size: 0.9rem;
  }
  input[type=radio]:checked + .image-tabs-label {
    background: #ffe454;
  }
  input[type=radio]:focus-visible + .image-tabs-label {
    background: #b9b9b9;
  }
  input[type=radio]:focus-visible:checked + .image-tabs-label {
    background: #ffc254;
  }
  .image-tabs-tab {
    display: grid;
  }
  @keyframes loading-fade-in {
    from { opacity: 0; animation-timing-function: ease-in-out; }
  }
  .image-tabs-loading {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, .62);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: 300ms loading-fade-in;
  }
  .image-tabs-loading loading-spinner {
    --color: #fff;
  }
</style>

# Aston Martin

<figure class="full-figure max-figure video-aspect">
<svg viewBox="0 0 408 592"></svg>
<video src="asset-url:./aston.mp4" controls></video>
</figure>

<figure class="full-figure max-figure scrollable-img">
<picture>
  <source type="image/avif" srcset="asset-url:./aston-film.avif">
  <img width="3556" height="236" alt="" decoding="async" loading="lazy" src="asset-url:./aston-film.png">
</picture>
</figure>
<dl class="perf-summary">
  <dt>Link</dt>
  <dd>
    <div class="perf-data">
      <a href="https://www.astonmartinf1.com/en-GB/">Aston Martin Cognizant F1 Team</a>
    </div>
  </dd>
  <dt>First run</dt>
  <dd>
    <div class="perf-data">6.2s (<a href="https://www.webpagetest.org/video/compare.php?tests=210318_XiAA_98fe08e436b3e9061abdb1fe6fdc6978-r:2-c:0">raw results</a>)</div>
  </dd>
  <dt>Second run</dt>
  <dd>
    <div class="perf-data">2.7s (<a href="https://www.webpagetest.org/video/compare.php?tests=210318_XiAA_98fe08e436b3e9061abdb1fe6fdc6978-r:2-c:1">raw results</a>)</div>
  </dd>
  <dt>Total</dt>
  <dd>
    <div class="perf-data">8.9s</div>
  </dd>
  <dt>2019 total</dt>
  <dd>
    <div class="perf-data"><a href="/2019/f1-perf/#racing-point">84.2s (2021 site is 75.3s faster)</a></div>
  </dd>
</dl>

Pretty good! This team was called Racing Point last year (and 2019), and their site was a bit of a performance disaster, but it looks like that's all fixed! In 2020 their car was a direct copy of the Mercedes, earning them the nickname Tracing Point, which is top-quality punnagement.

## Cutting the mustard

I was particularly pleased to see this at the bottom of the `<body>`:

```html
<script nomodule src="https://polyfill.io/v3/polyfill.min.js?…"></script>
```

They use [Polyfill.io](https://polyfill.io/v3/) to bring in the required polyfills. Polyfill.io uses the User-Agent string to decide which polyfills are needed, and as a result [the script](https://polyfill.io/v3/polyfill.js?features=Array.prototype.forEach%2CNodeList.prototype.forEach%2CArray.from%2CString.prototype.startsWith%2CObject.assign%2CArray.prototype.entries%2CObject.entries%2CObject.fromEntries%2CDocumentFragment.prototype.append%2CPromise%2CPromise.prototype.finally%2CArray.prototype.includes%2Ces6%2CEvent%2CElement.prototype.remove%2CElement.prototype.append%2Cfetch%2CCustomEvent%2CElement.prototype.matches%2CNodeList.prototype.forEach%2CAbortController%2CIntersectionObserver) is empty in modern browsers. To avoid making a request that results in nothing, the Aston Martin team used [`nomodule`](https://caniuse.com/mdn-html_elements_script_nomodule) to prevent the download in browsers that support JavaScript modules.

This is a loose form of feature-detection that my former BBC colleague [Tom Maslen](https://twitter.com/tmaslen/) called ["Cutting the mustard"](http://web.archive.org/web/20120718191331/http://blog.responsivenews.co.uk/post/18948466399/cutting-the-mustard). Browsers that support modules just so happen to support the rest of the stuff that's required, so `nomodule` becomes convenient feature-detect.

I'd take this a step further. If your site's core content works without JavaScript, then you can make that the experience for those older browsers. Serve all your JavaScript with `type="module"` to prevent older browsers running it, and now you can write modern JavaScript without the stress and pain of dealing with those older browsers.

## Possible improvements

- **3.5 second delay to content render** caused by font foundry CSS. Covered in detail below.
- **1.25 second delay to content render** caused by additional CSS on another server. This problem is [covered in part 1](/2021/f1-perf-part-1/#avoid-blocking-resources-on-other-servers), and the solution here is just to move the CSS to the same server as the page.
- **Paragraph layout shift caused by late-loading fonts** which could be performed earlier using some preload tags.
- **0.5 second delay to main image** caused by poor image compression.

These delays overlap in some cases.

## Key issue: Font foundry CSS

Here's the start of the waterfall:

<figure class="full-figure max-figure scrollable-img">
  <img width="687" height="245" alt="" decoding="async" loading="lazy" src="asset-url:./aston-waterfall.png">
</figure>

I see extra connections on rows 2, 3, 6, and 12. The CSS on row 3 belongs to the site, so that should be moved to the same server as the page to avoid that extra connection, [as covered in part 1](/2021/f1-perf-part-1/#avoid-blocking-resources-on-other-servers).

The lateness of 12 suggests it's being initiated by another blocking resource, and Chrome DevTools confirms it:

<figure class="full-figure max-figure">
  <img style="width: 100%; height: auto;" width="976" height="146" alt="" decoding="async" loading="lazy" src="asset-url:./initiator.png">
</figure>

I'm not sure why it thinks it's on line `-Infinity` though. Anyway… If this seems familiar, it's because it's the same [font foundry tracking issue we saw in part 1](/2021/f1-perf-part-1/#key-issue-css-font-tracker), and the best solution is to [load this stuff async](/2021/f1-perf-part-1/#load-cross-origin-font-css-async). But, there are some new details here worth exploring:

<figure class="full-figure max-figure scrollable-img">
  <img width="687" height="245" alt="" decoding="async" loading="lazy" src="asset-url:./aston-waterfall.png">
</figure>

The `hello.myfonts.net` CSS request on row 6 happens in parallel with the CSS on row 3, even though it's the CSS on row 3 that imports the CSS on row 6. This is because the developers have worked hard to limit the damage of those other-server requests:

```html
<link rel="preconnect" href="https://p.typekit.net" crossorigin />
<link rel="preconnect" href="https://use.typekit.net" crossorigin />
<link rel="preload" href="//hello.myfonts.net/count/3cde9e" as="style" />
```

There's a `preload` that makes the request happen in parallel. This is great to see! It doesn't solve the problem as effectively as loading the font CSS async, but it's still much faster than what we saw on the Alpha Tauri site.

They use `preconnect` too. Preconnects are great if you don't know the full URL of an important other-site resource, but you _do_ know its origin. In this case, some fonts come from `use.typekit.net`, and we can see the benefit of the `preconnect`:

<figure class="full-figure max-figure scrollable-img">
  <img width="930" height="101" alt="" decoding="async" loading="lazy" src="asset-url:./aston-waterfall-2.png">
</figure>

See how the connection phase of the request happens really early on row 59? That's the `preconnect` in action. A full `preload` would have been better, but I guess they didn't have a way to know the URLs ahead of time. But wait…

<figure class="full-figure max-figure scrollable-img">
  <img width="687" height="245" alt="" decoding="async" loading="lazy" src="asset-url:./aston-waterfall.png">
</figure>

The connection on line 12 happens late. But the `<head>` contains:

```html
<link rel="preconnect" href="https://p.typekit.net" crossorigin />
```

…so what's going on? Why isn't that pre-connect happening? Well, unfortunately it is, but it isn't used.

### Connections and credentials

By default, CORS requests are made without credentials, which means no cookies and other things that directly identify the user. If browsers sent no-credentials requests down the same HTTP connection as credentialed requests, well, the whole thing is pointless. Imagine if, half way through a phone call, you put on a different voice and pretended to be someone else. The other person is unlikely to be fooled, because it's part of the same call. So, for requests to another origin, browsers use different connections for no-credential and credentialed requests.

Which brings us back to:

```html
<link rel="preconnect" href="https://p.typekit.net" crossorigin />
<link rel="preconnect" href="https://use.typekit.net" crossorigin />
```

The `crossorigin` attribute tells the browser to make a no-credential connection, which is ideal for requests that use CORS. Font requests use CORS, so that 2nd `preconnect` is doing the right thing. But that first preconnect is to handle:

```css
@import url('https://p.typekit.net/p.css?s=1…');
```

…and `@import` requests in CSS _do not use CORS_, it's a fully credentialed request. The pre-connection still happens, but it isn't used. In fact, it's likely taking up bandwidth that could have been used elsewhere.

Unfortunately Chrome DevTools doesn't show this extra connection, so I dug into `chrome://net-export/` to create a full log of browser network activity. This records _all_ browser network activity, so I started a new instance of Chrome so I wasn't capturing too much noise from other tabs. Here are the key results:

<figure class="full-figure max-figure">
<picture>
  <source type="image/avif" srcset="asset-url:./netlog.avif">
  <img style="height: auto" width="1390" height="1041" alt="" decoding="async" loading="lazy" src="asset-url:./netlog.png">
</picture>
</figure>

This is pretty low-level stuff, so don't worry if it doesn't make sense, there's a lot of it I don't understand. But, what I can see is row 2691, which is a request to set up a connection to `p.typekit.net`, which results in the socket in row 2695. The `pm` (privacy-mode) code in the connection identifies this as a no-credentials connection. This is the `preconnect`.

Then, in row 2872 we get the actual request for the CSS resource, and sadness, we get another socket in row 2883. This connection doesn't have the `pm` code, because it's for credentialed requests.

The solution here is simple; just remove the `crossorigin` attribute from that `preconnect`. All requests to that particular origin are credentialed, so that works fine. Sometimes you'll need two `preconnect`s for the same origin, one for credentialed fetches, and another for no-credential fetches.

Phew!

## Issue: Main image compression

The image compression on the Aston Martin site is mostly very good. Someone clearly took time over it. Unfortunately, one place it isn't so good is the all-important main image of the page:

<script type="component">{
  "module": "shared/ImageTabs",
  "exportName": "Styles",
  "staticOnly": true
}</script>

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/ImageTabs",
  "props": {
    "ratio": 0.5625,
    "maxWidth": 414,
    "images": [
      ["Original JPEG (asset-pretty-size:./img-optim/vettel.jpg)", "asset-url:./img-optim/vettel.jpg"],
      ["Optimised JPEG (asset-pretty-size:./img-optim/vettel-optim.jpg)", "asset-url:./img-optim/vettel-optim.jpg"],
      ["WebP (asset-pretty-size:./img-optim/vettel.webp)", "asset-url:./img-optim/vettel.webp"],
      ["AVIF (asset-pretty-size:./img-optim/vettel.avif)", "asset-url:./img-optim/vettel.avif"]
    ]
  }
}</script>
</figure>

As usual, the WebP and AVIF have more smoothing, but this image sits underneath text, so you can get away with a lot of compression. Perhaps even more than above.

## How fast could it be?

Here's how fast it looks with the first-render unblocked and the image optimised.

<figure class="full-figure max-figure video-aspect">
<svg viewBox="0 0 816 592"></svg>
<video src="asset-url:./aston-compare.mp4" controls></video>
</figure>
<dl class="perf-summary">
  <dt>Original</dt>
  <dd>
    <div class="perf-data">
      <a href="https://www.astonmartinf1.com/en-GB/">Site</a> (<a href="https://www.webpagetest.org/video/compare.php?tests=210318_XiAA_98fe08e436b3e9061abdb1fe6fdc6978-r:2-c:0">raw results</a>)
    </div>
  </dd>
  <dt>Optimised</dt>
  <dd><div class="perf-data"><a href="https://f1-performance-demo.netlify.app/aston/">Site</a> (<a href="https://www.webpagetest.org/video/compare.php?tests=210318_XiWF_f3c8aab17136a350f91174d2c926157a-r:3-c:0">raw results</a>)</div></dd>
</dl>

It isn't worlds apart. The Aston Martin site is generally well-built.

# Scoreboard

<script type="component">{
  "module": "shared/demos/2021/f1-perf/Scores",
  "staticOnly": true,
  "props": {
    "results": 5
  }
}</script>

Aston Martin slots in _just_ behind Red Bull. It's incredibly close for the lead! But with five teams still to go, can anyone beat Red Bull to the title?

<script type="component">{
  "module": "shared/demos/2021/f1-perf/Parts",
  "staticOnly": true,
  "props": {
    "includeIntro": false,
    "partIndex": 4
  }
}</script>
