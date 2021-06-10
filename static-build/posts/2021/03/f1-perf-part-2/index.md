---
title: Who has the fastest F1 website in 2021? Part 2
date: 2021-03-26 01:00:00
summary: Deep-diving on the load performance of F1 websites.
meta: Deep-diving on the load performance of F1 websites.
image: 'asset-url:./img.jpg'
---

Ohhh, you've come back for more? Excellent. I was worried it was just going to be me sat here, typing to myself.

<script type="component">{
  "module": "shared/demos/2021/f1-perf/Parts",
  "staticOnly": true,
  "props": {
    "includeIntro": true,
    "partIndex": 1
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

# Alfa Romeo

<figure class="full-figure max-figure video-aspect">
<svg viewBox="0 0 408 592"></svg>
<video src="asset-url:./alfa-romeo.mp4" controls></video>
</figure>

<figure class="full-figure max-figure scrollable-img">
<picture>
  <source type="image/avif" srcset="asset-url:./alfa-romeo-film.avif">
  <img width="6592" height="236" alt="" decoding="async" loading="lazy" src="asset-url:./alfa-romeo-film.png">
</picture>
</figure>
<dl class="perf-summary">
  <dt>Link</dt>
  <dd>
    <div class="perf-data">
      <a href="https://www.sauber-group.com/motorsport/formula-1/">Alfa Romeo Racing Orlen</a>
    </div>
  </dd>
  <dt>First run</dt>
  <dd>
    <div class="perf-data">16.1s (<a href="https://www.webpagetest.org/video/compare.php?tests=210319_XiE3_967d29bb2d3ede7f21e32c19eb5f77bc-r%3A3-c%3A0&thumbSize=200&ival=100&end=visual">raw results</a>)</div>
  </dd>
  <dt>Second run</dt>
  <dd>
    <div class="perf-data">7.3s (<a href="https://www.webpagetest.org/video/compare.php?tests=210319_XiE3_967d29bb2d3ede7f21e32c19eb5f77bc-r%3A2-c%3A1&thumbSize=200&ival=100&end=visual">raw results</a>)</div>
  </dd>
  <dt>Total</dt>
  <dd>
    <div class="perf-data">23.4s</div>
  </dd>
  <dt>2019 total</dt>
  <dd>
    <div class="perf-data"><a href="/2019/f1-perf/#alfa-romeo">20.1s (2021 site is 3.3s slower)</a></div>
  </dd>
</dl>

The video above shows how users would experience the site on a low-end phone on a good 3G connection. Alternatively, scroll along the timeline above.

## Possible improvements

A loading spinner doesn't count as a first content render. A loading spinner is just an apology for being slow 😀. Interestingly the _vast majority_ of the performance lost here is down to one easily fixable issue:

- **10 second delay to content-render** caused by low priority render-blocking JavaScript.
- **1.5 second delay to content-render** caused by other-server sequential CSS.
- **11 second delay to primary image** caused by blocking request on JavaScript.
- **2.5 second delay to primary image** caused by poor image compression.

Remember, some of those delays overlap.

## Key issue: Low priority render-blocking JavaScript

Here's the waterfall:

<figure class="full-figure max-figure scrollable-img">
<picture>
  <source type="image/avif" srcset="asset-url:./alfa-romeo-waterfall.avif">
  <img width="930" height="1591" alt="" decoding="async" loading="lazy" src="asset-url:./alfa-romeo-waterfall.png">
</picture>
</figure>

There's some render-blocking JavaScript in the `<head>` which isn't great (row 4, which is modernizer), but it's pretty small, and ready after around 5.5 seconds. The real problem is down on row 72; that's another render-blocking script.

The long thin light-yellow bit means the browser knew about the resource for a long time, but chose to download other things first. We can confirm that in the network panel of Chrome DevTools:

<figure class="full-figure max-figure">
  <img style="height: auto" width="1462" height="152" alt="" decoding="async" loading="lazy" src="asset-url:./alfa-romeo-devtools.png">
</figure>

It has a 'low' prioirty, but it's a _render-blocking script!_ Why did Chrome choose to download it so late? Well, the problem is, the browser doesn't know it's render-blocking.

Usually when we talk about render-blocking scripts, we mean a script that appears before the content in the source, and _doesn't_ have one of the following attributes:

- `async`: Don't block the parser. Execute whenever loaded.
- `defer`: Don't block the parser. Execute after the document has parsed, and in order with other `defer` scripts.
- `type="module"`: Load as a module, which implies `defer` by default.

If you use one of the above, the script doesn't block the parser, and therefore doesn't block rendering.

However, the script we're talking about sits right at the end of the `<body>`, and it _does_ have `defer`, so the browser assumes it isn't render-blocking, and queues it behind the images and other sub-resources.

It's only 'render-blocking' because the site inserts a loading screen that covers the whole page, and that late-loading script removes it.

The solution: Move that script into the `<head>`. That's it.

The browser would still consider it low priority, but it should still queue in front of all those images. If not, a `<link rel="preload" as="script" href="…">` will convince Chrome to raise the priority.

An even better solution would be to avoid a JavaScript dependency for the initial render, which is very possible for content like this. Then, the JavaScript can load lazily, and gradually enhance elements.

## Issue: Other-server sequential CSS

<figure class="full-figure max-figure">
<svg viewBox="0 37 543 180">
<foreignObject width="930" height="1591">
<picture>
  <source type="image/avif" srcset="asset-url:./alfa-romeo-waterfall.avif">
  <img width="930" height="1591" alt="" decoding="async" loading="lazy" src="asset-url:./alfa-romeo-waterfall.png">
</picture>
</foreignObject>
</svg>
</figure>

The problem is the CSS on row 7 (the script on row 6 isn't render-blocking). There are two problems here that we already encountered in part 1:

- [It's CSS loading CSS, in sequence](/2021/f1-perf-part-1/#parallelise-sequential-resources).
- [It's a blocking resource on another server](/2021/f1-perf-part-1/#avoid-blocking-resources-on-other-servers).

…but the ideal solution is different. In part 1 the solution was restricted by font-licencing, but since it's Google Fonts this time, it's open source, so we can do what we want.

The delay here is doubly sad because no fonts are actually downloaded. The web font they're using is "Roboto", which already ships on Android devices (it's the main Android font), so Android users get all the delay for nothing.

Google Fonts' CSS is smart; it serves the best CSS and font format for that particular browser, but since [WOFF2 is well supported](https://caniuse.com/woff2), we could just copy & paste the font CSS into the site's CSS, and avoid the request to the other server. You could also do this with the fonts themselves, keeping everything on one server.

## Issue: Delayed primary image

<figure class="full-figure max-figure scrollable-img">
<picture>
  <source type="image/avif" srcset="asset-url:./alfa-romeo-film.avif">
  <img width="6592" height="236" alt="" decoding="async" loading="lazy" src="asset-url:./alfa-romeo-film.png">
</picture>
</figure>

<script>document.currentScript.previousElementSibling.scrollLeft = Number.MAX_SAFE_INTEGER;</script>

That image is dropping in a bit late, which could be caused by a number of things. Back to the waterfall:

<figure class="full-figure max-figure scrollable-img">
<svg width="930" viewBox="0 1210 930 180">
<foreignObject width="930" height="1591">
<picture>
  <source type="image/avif" srcset="asset-url:./alfa-romeo-waterfall.avif">
  <img width="930" height="1591" alt="" decoding="async" loading="lazy" src="asset-url:./alfa-romeo-waterfall.png">
</picture>
</foreignObject>
</svg>
</figure>

There it is on row 74. Browsers tend to discover `<img>`s really early, and their downloads can start before the CSS is ready. So, it probably isn't a regular `<img>`. If it was a CSS background, I'd still expect the download to start much earlier, but after the CSS.

The telltale sign is row 72, which is the late-loading JavaScript I covered earlier. The image only starts downloading once the JavaScript has finished downloading, which suggests the download of the image is dependant on the JavaScript. Although, we don't have to guess, because Chrome DevTools can tell us:

<figure class="full-figure max-figure">
<img style="width: 100%; height: auto" width="864" height="144" alt="" decoding="async" loading="lazy" src="asset-url:./img-fetch.png">
</figure>

And there we go, the 'initiator' column confirms the image loading was triggered by the late-loading JavaScript. Taking a look at the source:

```html
<img
  alt=""
  data-aspectratio="1.78"
  data-sizes="auto"
  data-srcset="…ARRO_2021_C41_Rear.jpg 3072w, …ARRO_2021_C41_Rear-2360x1769.jpg 2360w,
    …ARRO_2021_C41_Rear-1800x1349.jpg 1800w, …ARRO_2021_C41_Rear-1400x1049.jpg 1400w,
    …ARRO_2021_C41_Rear-1075x806.jpg 1075w, …ARRO_2021_C41_Rear-830x622.jpg 830w,
    …ARRO_2021_C41_Rear-630x472.jpg 630w, …ARRO_2021_C41_Rear-480x360.jpg 480w"
  src="…ARRO_2021_C41_Rear-5x4.jpg"
/>
```

Aha! `data` attributes! The browser doesn't really do anything with these, they're just somewhere developers can put arbitrary data. The site is using some sort of JavaScript polyfill for responsive images. Also, as a fallback, it's downloading a 5x4 image 🙃.

Today, [responsive images are well supported](https://caniuse.com/picture), so there's no reason to use JavaScript for this, just use [real responsive images](/2015/anatomy-of-responsive-images/).

## Issue: Large primary image

It looks like someone really cared about image sizes when they built this site, because they're fairly well optimised. However, one image is badly sized and compressed, and unfortunately it's the main one right at the top of the page.

I put it through [Squoosh](https://squoosh.app/):

<script type="component">{
  "module": "shared/ImageTabs",
  "exportName": "Styles",
  "staticOnly": true
}</script>

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/ImageTabs",
  "props": {
    "ratio": 1.33496732,
    "maxWidth": 420,
    "images": [
      ["Original JPEG (asset-pretty-size:./img-optim/alfa.jpg)", "asset-url:./img-optim/alfa.jpg"],
      ["Optimised JPEG (asset-pretty-size:./img-optim/alfa-optim.jpg)", "asset-url:./img-optim/alfa-optim.jpg"],
      ["WebP (asset-pretty-size:./img-optim/alfa.webp)", "asset-url:./img-optim/alfa.webp"],
      ["AVIF (asset-pretty-size:./img-optim/alfa.avif)", "asset-url:./img-optim/alfa.avif"]
    ]
  }
}</script>
</figure>

The compressed versions have a bit more smoothing compared to the original, but I don't think real users would notice, and it's worth it to get that image loaded as soon as possible.

## How fast could it be?

Here's the site compared to my optimised version, where I've inlined the CSS, removed unused CSS, unblocked all script, and optimised the image:

<figure class="full-figure max-figure video-aspect">
<svg viewBox="0 0 816 592"></svg>
<video src="asset-url:./alfa-romeo-compare.mp4" controls></video>
</figure>
<dl class="perf-summary">
  <dt>Original</dt>
  <dd>
    <div class="perf-data">
      <a href="https://www.sauber-group.com/motorsport/formula-1/">Site</a> (<a href="https://www.webpagetest.org/video/compare.php?tests=210319_XiE3_967d29bb2d3ede7f21e32c19eb5f77bc-r%3A3-c%3A0&thumbSize=200&ival=100&end=visual">raw results</a>)
    </div>
  </dd>
  <dt>Optimised</dt>
  <dd><div class="perf-data"><a href="https://f1-performance-demo.netlify.app/alfa-romeo/">Site</a> (<a href="https://www.webpagetest.org/video/compare.php?tests=210319_XiE6_9ebeed6f2113fcee8423836fb66466c3-r%3A3-c%3A0&thumbSize=200&ival=100&end=visual">raw results</a>)</div></dd>
</dl>

It's a huge difference, but seriously, the current Alfa Romeo site is a couple of small fixes away from winning this contest.

We've got two results now, so we should probably get a scoreboard going…

# Scoreboard

<script type="component">{
  "module": "shared/demos/2021/f1-perf/Scores",
  "staticOnly": true,
  "props": {
    "results": 2
  }
}</script>

Alpha Tauri narrowly keeps the lead. Let's see if that continues in the next part.

<script type="component">{
  "module": "shared/demos/2021/f1-perf/Parts",
  "staticOnly": true,
  "props": {
    "includeIntro": false,
    "partIndex": 1
  }
}</script>
