---
title: Who has the fastest F1 website in 2021? Part 4
date: 2021-03-30 01:00:00
summary: Deep-diving on the load performance of F1 websites.
meta: Deep-diving on the load performance of F1 websites.
image: 'asset-url:./img.jpg'
---

<script type="component">{
  "module": "shared/demos/2021/f1-perf/Parts",
  "staticOnly": true,
  "props": {
    "includeIntro": true,
    "partIndex": 3
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

# Williams

<figure class="full-figure max-figure video-aspect">
<svg viewBox="0 0 408 592"></svg>
<video src="asset-url:./williams.mp4" controls></video>
</figure>

<figure class="full-figure max-figure scrollable-img">
<img width="3333" height="236" alt="" decoding="async" loading="lazy" src="asset-url:./williams-film.png">
</figure>
<dl class="perf-summary">
  <dt>Link</dt>
  <dd>
    <div class="perf-data">
      <a href="https://www.williamsf1.com/">Williams Racing</a>
    </div>
  </dd>
  <dt>First run</dt>
  <dd>
    <div class="perf-data">6.7s (<a href="https://www.webpagetest.org/video/compare.php?tests=210319_XiEN_6fb8430d86c8985be8d7505bb2258ad4-r:3-c:0">raw results</a>)</div>
  </dd>
  <dt>Second run</dt>
  <dd>
    <div class="perf-data">4.4s (<a href="https://www.webpagetest.org/video/compare.php?tests=210319_XiEN_6fb8430d86c8985be8d7505bb2258ad4-r:3-c:1">raw results</a>)</div>
  </dd>
  <dt>Total</dt>
  <dd>
    <div class="perf-data">11.1s</div>
  </dd>
  <dt>2019 total</dt>
  <dd>
    <div class="perf-data"><a href="/2019/f1-perf/#red-bull">14.1s (2021 site is 3s faster)</a></div>
  </dd>
</dl>

Not bad! And it's nice to see the cookie modal appearing along with the content. Well, not nice, but y'know, better than it slamming you in the face 30 seconds later.

## Possible improvements

- **2 seconds delay to content-render** caused by CSS serving issues. Covered in detail below.
- **4 second delay to main image** caused by HTTP/1.1 and priorities, and additional connections. Covered in detail below.
- **Layout instability** caused by `<img>`s. Covered in detail below.

Remember these delays overlap in some cases.

## Key issue: Delayed CSS

Here's the start of the waterfall:

<figure class="full-figure max-figure scrollable-img">
<svg width="727" viewBox="0 37 727 227">
<foreignObject x="0" y="0" width="930" height="437">
<img width="930" height="437" alt="" decoding="async" loading="lazy" src="asset-url:./williams-waterfall.png">
</foreignObject>
</svg>
</figure>

There are a couple of bad smells here. On row 6 we see a new connection being made for some render-blocking CSS on another server. This is the problem I [covered in part 1](/2021/f1-perf-part-1/#avoid-blocking-resources-on-other-servers), and the solution is to move the CSS onto the same server as the page, which would save around 1.5 seconds.

But, in addition to that, the server issues a redirect, so the real resource isn't received until row 10. This wastes at least another 0.5 seconds. Again, the solution is to move the CSS to the same server, and perhaps bundle it with the current CSS.

## Key issue: HTTP/1.1

Again, looking at the start of the waterfall:

<figure class="full-figure max-figure">
<svg viewBox="0 37 693 197">
<foreignObject x="0" y="0" width="930" height="437">
<img width="930" height="437" alt="" decoding="async" loading="lazy" src="asset-url:./williams-waterfall.png">
</foreignObject>
</svg>
</figure>

See how it immediately starts three connections to the same server (the thinner part of the bar at the start of rows 1-3), and again in row 9? This is the old musty stench of HTTP/1.1, and Chrome DevTools confirms it:

<figure class="full-figure max-figure">
<img style="height:auto" width="1258" height="395" alt="" decoding="async" loading="lazy" src="asset-url:./network-protocol.png">
</figure>

HTTP/1.1 can only handle a single request/response over a connection, unlike HTTP/2 which can handle many in parallel. To try to work around the shortcomings of HTTP/1.1 the browser immediately spins up multiple connections to the server, and even more later on.

It's unclear to me how much of an impact this causes in terms of first-render, but it's likely to get in the way of other optimisations such as moving more content to the same server, since browsers will only download 6-8 things at once over HTTP/1.1.

## Key issue: Layout instability due to `<img>`

It isn't visible in the video earlier due to the cookie modal, but once you've cleared that, you start to see some layout instability:

<figure class="full-figure max-figure video-aspect">
<svg viewBox="0 0 360 640"></svg>
<video style="background: transparent" src="asset-url:./layout.mp4" controls></video>
</figure>

Here's (roughly) the HTML:

```html
<img src="…" alt="…" />
```

And here's the CSS:

```css
img {
  display: block;
  width: 100%;
}
```

When this happens, the image takes up zero space until the browser downloads enough of the image to know its width and height, and then it reserves space for the image.

Ideally we want the space reserved on the page _before_ the image starts downloading. Thankfully, that isn't too difficult:

HTML:

```html
<img width="600" height="315" src="…" alt="…" />
```

…where the width and height give the correct aspect ratio of the image. And the CSS:

```css
img {
  display: block;
  width: 100%;
  height: auto;
}
```

Now the browser will assume a 600/315 aspect ratio for the image even before it downloads, meaning there's no layout shift:

<figure class="full-figure max-figure video-aspect">
<svg viewBox="0 0 360 640"></svg>
<video style="background: transparent" src="asset-url:./layout-fixed.mp4" controls></video>
</figure>

This technique is new in the grand scheme of things, but [well supported](https://caniuse.com/mdn-html_elements_img_aspect_ratio_computed_from_attributes).

## Issue: Delay to main image

Something is delaying the images:

<figure class="full-figure max-figure scrollable-img">
<img width="930" height="437" alt="" decoding="async" loading="lazy" src="asset-url:./williams-waterfall.png">
</figure>

The main images start appearing in row 20. Yes, they're on another server so they're delayed by having to set up a new connection, but something is causing that to happen really late. Those images are `<img>`s in the source, so I'd expect them to be picked up before the CSS completed.

I imagine this problem would become irrelevant once HTTP/2 was adopted, and key assets were moved onto the same server. However, I wanted to figure out why those assets were downloading so late, so I used an advanced debugging technique called "emailing folks who work on Chrome's networking internals", and here's what I ~found~ was told:

- Images start out as 'lowest priority'.
- Images in the viewport are bumped to 'medium priority'.
- Chrome will only download 'lowest priority' things one-at-a-time, and will also queue behind 'medium priority' items.

And if we apply that knowledge to the waterfall:

- There's no way to know if an image is in the viewport or not until layout-blocking resources have loaded.
- The CSS issues mentioned earlier delay layout for a long time, keeping those important images 'lowest priority'.
- Font preloads (rows 2, 3, 8, 9) are 'medium priority', so they queue ahead of the images.
- HTTP/1.1 delays things in row 9, as we're waiting on another connection in the pool. This wouldn't be an issue with HTTP/2.
- The images are on another server, so by the time the browser finally gets round to them, it's delayed even further.

So it's a real smorgasbord of issues that adds up to a big ol' delay.

You might be thinking "a different set of rules would result in a faster page load time", and that might be true for _this page_, but request priorities are a delicate balancing act. Some 'totally obvious common-sense' changes we've trialled have resulted in worse performance in the wild.

## Issue: Large main image

As we've seen with most sites so far, main images end up being a bit too big. They serve the same banner for desktop and mobile, meaning mobile is getting way more data than it needs. [Responsive images](/2015/anatomy-of-responsive-images/) mean the browser can pick the size and format that works best for the device. Here it is optimised for mobile using [Squoosh](https://squoosh.app/):

<script type="component">{
  "module": "shared/ImageTabs",
  "exportName": "Styles",
  "staticOnly": true
}</script>

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/ImageTabs",
  "props": {
    "ratio": 2.725352113,
    "maxWidth": 360,
    "images": [
      ["Original JPEG (asset-pretty-size:./img-optim/banner.jpg)", "asset-url:./img-optim/banner.jpg"],
      ["Optimised JPEG (asset-pretty-size:./img-optim/banner-optim.jpg)", "asset-url:./img-optim/banner-optim.jpg"],
      ["WebP (asset-pretty-size:./img-optim/banner.webp)", "asset-url:./img-optim/banner.webp"],
      ["AVIF (asset-pretty-size:./img-optim/banner.avif)", "asset-url:./img-optim/banner.avif"]
    ]
  }
}</script>
</figure>

But even at full-size that image could be 30-40kB. That said, many of the images on the site are well compressed… dare I say, too compressed? I'm never happy am I?

## How fast could it be?

Here's how fast it looks with the first-render unblocked and the images optimised. I threw in some blurry image previews too.

<figure class="full-figure max-figure video-aspect">
<svg viewBox="0 0 816 592"></svg>
<video src="asset-url:./williams-compare.mp4" controls></video>
</figure>
<dl class="perf-summary">
  <dt>Original</dt>
  <dd>
    <div class="perf-data">
      <a href="https://www.williamsf1.com/">Site</a> (<a href="https://www.webpagetest.org/video/compare.php?tests=210319_XiEN_6fb8430d86c8985be8d7505bb2258ad4-r:3-c:0">raw results</a>)
    </div>
  </dd>
  <dt>Optimised</dt>
  <dd><div class="perf-data"><a href="https://f1-performance-demo.netlify.app/williams/">Site</a> (<a href="https://www.webpagetest.org/video/compare.php?tests=210319_XiSM_832b9b4364e23ad06512751b80d28884-r%3A1-c%3A0&thumbSize=200&ival=100&end=visual">raw results</a>)</div></dd>
</dl>

# Scoreboard

<script type="component">{
  "module": "shared/demos/2021/f1-perf/Scores",
  "staticOnly": true,
  "props": {
    "results": 4
  }
}</script>

Williams slots in just a couple of seconds behind Red Bull, and it's great to see another site improving on their 2019 performance!

It's Aston Martin up next. I was going to roll it into this part, since it didn't bring up anything new, but then I spotted a real gotcha that's difficult to debug (yes this is my attempt at a teaser). See you tomorrow!

<script type="component">{
  "module": "shared/demos/2021/f1-perf/Parts",
  "staticOnly": true,
  "props": {
    "includeIntro": false,
    "partIndex": 3
  }
}</script>
