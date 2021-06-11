---
title: Who has the fastest F1 website in 2021? Part 6
date: 2021-04-06 01:00:00
summary: Deep-diving on the load performance of F1 websites.
meta: Deep-diving on the load performance of F1 websites.
image: 'asset-url:./img.jpg'
---

<script type="component">{
  "module": "shared/demos/2021/f1-perf/Parts",
  "staticOnly": true,
  "props": {
    "includeIntro": true,
    "partIndex": 5
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

# Ferrari

<figure class="full-figure max-figure video-aspect">
<svg viewBox="0 0 408 592"></svg>
<video src="asset-url:./ferrari.mp4" controls></video>
</figure>

<figure class="full-figure max-figure scrollable-img">
<picture>
  <source type="image/avif" srcset="asset-url:./ferrari-film.avif">
  <img width="10669" height="236" alt="" decoding="async" loading="lazy" src="asset-url:./ferrari-film.png">
</picture>
</figure>
<dl class="perf-summary">
  <dt>Link</dt>
  <dd>
    <div class="perf-data">
      <a href="https://www.ferrari.com/en-EN/formula1">Scuderia Mission Winnow Ferrari</a>
    </div>
  </dd>
  <dt>First run</dt>
  <dd>
    <div class="perf-data">38.9s (<a href="https://www.webpagetest.org/video/compare.php?tests=210319_XiJK_b2514a4aa4628fd398da0fc0c0687e09-r:3-c:0">raw results</a>)</div>
  </dd>
  <dt>Second run</dt>
  <dd>
    <div class="perf-data">13.9s (<a href="https://www.webpagetest.org/video/compare.php?tests=210319_XiJK_b2514a4aa4628fd398da0fc0c0687e09-r:1-c:1">raw results</a>)</div>
  </dd>
  <dt>Total</dt>
  <dd>
    <div class="perf-data">52.8s</div>
  </dd>
  <dt>2019 total</dt>
  <dd>
    <div class="perf-data"><a href="/2019/f1-perf/#ferrari">46.1s (2021 site is 6.7s slower)</a></div>
  </dd>
</dl>

The Ferrari site is my stand-out memory of the 2019 article. Their site was slow because of a 1.8MB blocking script, but 1.7MB of that was an inlined 2300x2300 PNG of a horse that was only ever displayed at 20x20. Unfortunately their 2021 site is slower, and this time it isn't down to one horse.

## Possible improvements

- **25 second delay to content render** caused by manually-blocking JavaScript. Covered in detail below.
- **3 second delay to content render** caused by unused CSS. Covered in detail below.
- **5 second delay to content render** caused by other blocking script. Covered in detail below.
- **5 second delay to main image** caused by render-blocking CSS & script. Important images should be part of the source, or preloaded.
- **Additional 2 second delay to main image** caused by an extra connection. This problem is [covered in part 1](/2021/f1-perf-part-1/#avoid-blocking-resources-on-other-servers), but the solution here is just to move the images to the same server as the page.
- **50+ second delay to content-blocking cookie modal** caused by… a number of things, [covered in part 1](/2021/f1-perf-part-1/#key-issue-late-modal).

As always, some of these delays overlap.

## Key issue: Manually-blocking JavaScript

Here's the top of the waterfall:

<figure class="full-figure max-figure scrollable-img">
  <img width="661" height="500" alt="" decoding="async" loading="lazy" src="asset-url:./waterfall-1.png">
</figure>

Rows 4-26 are all JavaScript, which is a bit of a bad smell, but JavaScript doesn't always mean 'bad', but row 19 is particularly worrying due to its size.

The green vertical line around the 11s mark is the first render, but you can see from the video above it's just a black screen. This is what I mean by 'manually-blocking' – the additional script isn't blocking the browser's parser or renderer, but the developers have chosen to show a black overlay until that script has loaded.

We already [saw this in part 2](/2021/f1-perf-part-2/#key-issue-low-priority-render-blocking-javascript), but in that case it was a small late-loading script. Here, the Ferrari folks have used `<link rel="preload">` to solve the priority problem, but the remaining problem is the sheer size of the script.

The script is 1.2MB gzipped, which is a significant download cost, but once it's unzipped it becomes 6MB of JavaScript for the device to parse, and that has an additional cost:

<figure class="full-figure max-figure">
  <img style="width: 100%; height: auto" width="457" height="81" alt="" decoding="async" loading="lazy" src="asset-url:./waterfall-2.png">
</figure>

The bottom of the waterfall shows us the CPU usage on the device, and once that massive script lands, we get a bit of a car crash around the 32s mark. This will lock up anything that depends on the main thread for around 5 seconds. If we take a look at the coverage in Chrome DevTools:

<figure class="full-figure max-figure">
  <img style="width: 100%; height: auto" width="1253" height="124" alt="" decoding="async" loading="lazy" src="asset-url:./coverage.png">
</figure>

The first row is the script, and it shows us 75% of that parsing effort is for nothing. I'd also question needing over a megabyte of JavaScript for a page like this, but I haven't dug into it.

Unfortunately there isn't a quick win here. They need to stop manually blocking content rendering, and split that massive script up. We looked at code splitting over at [tooling.report](https://bundlers.tooling.report/code-splitting/). Ideally every independently functioning piece of JavaScript should be its own entry point, so the browser is only loading what the page need. That would massively cut down the download and parse time.

If I load the page without JavaScript and remove that black render-blocking overlay, there's something resembling a before-JavaScript render there, it just needs some work to make it representative of the final JavaScript-enhanced content (as in, no layout shifts as elements are enhanced), and then they wouldn't need that render-blocking overlay. I think that was the goal at some point, but I guess it didn't pan out.

## Key issue: Render-blocking JavaScript

Back to the waterfall:

<figure class="full-figure max-figure scrollable-img">
<svg style="max-width:661px" viewBox="0 363 661 104">
<foreignObject x="0" y="0" width="661" height="500">
<img width="661" height="500" alt="" decoding="async" loading="lazy" src="asset-url:./waterfall-1.png">
</foreignObject>
</svg>
</figure>

Rows 22-25 are traditional render-blocking scripts in the `<head>`. They're all on different servers, so they pay the cost of additional connections [as I covered in part 1](/2021/f1-perf-part-1/#avoid-blocking-resources-on-other-servers).

22, 24, and 25 appear to be trackers, which should use the `defer` or `async` attribute so they don't block rendering. The polyfill script on row 23 should use `defer` too, but in this case it's just an empty script since the browser doesn't need any polyfills. They could avoid this pointless request by using the [`nomodule` trick we saw on the Aston Martin site](/2021/f1-perf-part-5/#cutting-the-mustard).

## Key issue: Unused render-blocking CSS

Back to the waterfall:

<figure class="full-figure max-figure scrollable-img">
<svg style="max-width:661px" viewBox="0 0 661 109">
<foreignObject x="0" y="0" width="661" height="500">
<img width="661" height="500" alt="" decoding="async" loading="lazy" src="asset-url:./waterfall-1.png">
</foreignObject>
</svg>
</figure>

The CSS request on row 3 looked a little big to me, and yes, it's 200kB, which unzips to around 2.1MB. It isn't as bad as the JavaScript, but it still shows up in the CPU usage:

<figure class="full-figure max-figure">
  <img style="width: 100%; height: auto" width="457" height="81" alt="" decoding="async" loading="lazy" src="asset-url:./waterfall-2.png">
</figure>

It causes around a second of delay around the 10 second mark. Looking at the coverage:

<figure class="full-figure max-figure">
  <img style="width: 100%; height: auto" width="1253" height="124" alt="" decoding="async" loading="lazy" src="asset-url:./coverage.png">
</figure>

…almost all of that CSS is unnecessary.

Again, there isn't a quick fix here. That CSS just needs splitting up, so pages request only the CSS they need. A lot of web performance folks recommend inlining the CSS for a given page in a `<style>` in the `<head>`. "But what about caching??" is usually my response, but the more I see issues like this, the more I think they're right. A per-page targeted approach would avoid ending up with massive chunks of unused CSS like this.

## Issue: Image optimisation

Y'know what? This might be the best site so far in this series in terms of image compression. Taking the main image:

<script type="component">{
  "module": "shared/ImageTabs",
  "exportName": "Styles",
  "staticOnly": true
}</script>

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/ImageTabs",
  "props": {
    "ratio": 0.75,
    "maxWidth": 375,
    "images": [
      ["Original JPEG (asset-pretty-size:./img-optim/1.jpg)", "asset-url:./img-optim/1.jpg"],
      ["AVIF (asset-pretty-size:./img-optim/1.avif)", "asset-url:./img-optim/1.avif"]
    ]
  }
}</script>
</figure>

Sure, AVIF gets you to 20% of the size, but we're not talking huge savings here in real terms. As usual, the AVIF is a lot smoother, but since this image sits behind text I felt I could go a little lower on the quality slider than I usually would.

Some images could be significantly smaller though:

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/ImageTabs",
  "props": {
    "ratio": 0.46875,
    "maxWidth": 360,
    "images": [
      ["Original JPEG (asset-pretty-size:./img-optim/2.jpg)", "asset-url:./img-optim/2.jpg"],
      ["Optimised JPEG (asset-pretty-size:./img-optim/2-optim.jpg)", "asset-url:./img-optim/2-optim.jpg"],
      ["WebP (asset-pretty-size:./img-optim/2.webp)", "asset-url:./img-optim/2.webp"],
      ["AVIF (asset-pretty-size:./img-optim/2.avif)", "asset-url:./img-optim/2.avif"]
    ]
  }
}</script>
</figure>

A lot of the images on the Ferrari site aren't optimised for 2x screens. I don't think that matters so much for the previous image, since it's behind text, but the one above could do with some sharpness. The original image above is 480px wide, but the optimised versions are 720px (taken from a larger source), so in this case the optimised versions are also higher resolution.

## How fast could it be?

Here's how fast it looks with the first-render unblocked and redundant CSS removed:

<figure class="full-figure max-figure video-aspect">
<svg viewBox="0 0 816 592"></svg>
<video src="asset-url:./ferrari-compare.mp4" controls></video>
</figure>
<dl class="perf-summary">
  <dt>Original</dt>
  <dd>
    <div class="perf-data">
      <a href="https://www.ferrari.com/en-EN/formula1">Site</a> (<a href="https://www.webpagetest.org/video/compare.php?tests=210319_XiJK_b2514a4aa4628fd398da0fc0c0687e09-r:3-c:0">raw results</a>)
    </div>
  </dd>
  <dt>Optimised</dt>
  <dd><div class="perf-data"><a href="https://f1-performance-demo.netlify.app/ferrari/">Site</a> (<a href="https://www.webpagetest.org/video/compare.php?tests=210319_Xi21_f86c05d7f56c3058a3526c2c3c600c3e-r:1-c:0">raw results</a>)</div></dd>
</dl>

Like I said, it isn't an easy fix in this case, but the potential savings are _huge_.

# Scoreboard

<script type="component">{
  "module": "shared/demos/2021/f1-perf/Scores",
  "staticOnly": true,
  "props": {
    "results": 6
  }
}</script>

Unfortunately it's bottom-of-the-table for Ferrari, by some margin, but will they stay there?

<script type="component">{
  "module": "shared/demos/2021/f1-perf/Parts",
  "staticOnly": true,
  "props": {
    "includeIntro": false,
    "partIndex": 5
  }
}</script>
