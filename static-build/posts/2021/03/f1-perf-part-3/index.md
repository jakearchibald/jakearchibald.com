---
title: Who has the fastest F1 website in 2021? Part 3
date: 2021-03-29 01:00:00
summary: Deep-diving on the load performance of F1 websites.
meta: Deep-diving on the load performance of F1 websites.
image: 'asset-url:./img.jpg'
---

I once spent an hour creating an [F1 lights-out reaction test](https://f1-start.glitch.me/) which went viral and was even [played by F1 drivers](https://www.youtube.com/watch?v=6fgGJ-M6X2s). That sounds like a brag, and it kinda is, but now whenever I pour days or even weeks of work into something, it just seems so inefficient compared to that time I spent _an hour_ on something that went big. Wait! You're not my therapist! Let's look at another F1 website…

<script type="component">{
  "module": "shared/demos/2021/f1-perf/Parts",
  "staticOnly": true,
  "props": {
    "includeIntro": true,
    "partIndex": 2
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

# Red Bull

<figure class="full-figure max-figure video-aspect">
<svg viewBox="0 0 408 592"></svg>
<video src="asset-url:./red-bull.mp4" controls></video>
</figure>

<figure class="full-figure max-figure scrollable-img">
<picture>
  <source type="image/avif" srcset="asset-url:./red-bull-film.avif">
  <img width="14444" height="236" alt="" decoding="async" loading="lazy" src="asset-url:./red-bull-film.png">
</picture>
</figure>
<dl class="perf-summary">
  <dt>Link</dt>
  <dd>
    <div class="perf-data">
      <a href="https://www.redbull.com/int-en/redbullracing">Red Bull Racing Honda</a>
    </div>
  </dd>
  <dt>First run</dt>
  <dd>
    <div class="perf-data">6.7s (<a href="https://www.webpagetest.org/video/compare.php?tests=210318_Xi66_e43703507450f1d9f6104216ab165ec7-r:2-c:0">raw results</a>)</div>
  </dd>
  <dt>Second run</dt>
  <dd>
    <div class="perf-data">1.9s (<a href="https://www.webpagetest.org/video/compare.php?tests=210318_Xi66_e43703507450f1d9f6104216ab165ec7-r:1-c:1">raw results</a>)</div>
  </dd>
  <dt>Total</dt>
  <dd>
    <div class="perf-data">8.6s</div>
  </dd>
  <dt>2019 total</dt>
  <dd>
    <div class="perf-data"><a href="/2019/f1-perf/#red-bull">15.8s (2021 site is 7.2s faster)</a></div>
  </dd>
</dl>

Now we're talking! This is a graphically rich, engaging site, and the performance is pretty good! In fact, it's significantly faster than its 2019 site. But there's still room for improvement.

## Possible improvements

- **3 second delay to content-render** caused by unnecessary inlining. Covered in detail below.
- **10 second delay to main image** caused by a JavaScript responsive images implementation, [like we saw in part 2](/2021/f1-perf-part-2/#issue-delayed-primary-image). These should be [real responsive images](/2015/anatomy-of-responsive-images/).
- **Additional 2 second delay to main image** caused by an extra connection. This problem is [covered in part 1](/2021/f1-perf-part-1/#avoid-blocking-resources-on-other-servers), but the solution here is just to move the images to the same server as the page.
- **Additional 2 second delay to main image** caused by poor optimisation. Covered in detail below.
- **40 second delay to key image** caused by loading it with JavaScript. Covered in detail below.
- **Additional 30 second delay to that image** caused by poor optimisation. Covered in detail below.
- **2 second delay to fonts** caused by extra connection. Again, this is [covered in part 1](/2021/f1-perf-part-1/#avoid-blocking-resources-on-other-servers), but the solution here is just to move the fonts to the same server.
- **40+ second delay to content-blocking cookie modal** caused by… a number of things, [covered in part 1](/2021/f1-perf-part-1/#key-issue-late-modal).

Remember these delays overlap in some cases.

## Issue: Unnecessary inlining

Here's the first bit of the timeline:

<figure class="full-figure max-figure">
<img width="440" height="180" alt="" decoding="async" loading="lazy" src="asset-url:./red-bull-waterfall.png" style="width: 100%; height: auto;">
</figure>

The page renders around the 6s mark, which is while the HTML is still downloading. Browsers can stream HTML and render it while it's downloading; it's a great feature of parsed-HTML that many sites don't get the benefit of due to blocking resources. Because the page renders with that one resource, we know there are _no_ blocking resources. This suggests the CSS is inlined, and from looking at the source, yep, it is.

Inlining avoids request/response overhead, which is great for render-blocking resources. But also, since it's part of the _page_, you can tailor the inlining for _that page_.

However, that doesn't seem to be what's happening here. Here's what I see in [Chrome DevTools' coverage panel](https://developers.google.com/web/tools/chrome-devtools/coverage):

<figure class="full-figure max-figure">
<img width="1472" height="93" alt="" decoding="async" loading="lazy" src="asset-url:./red-bull-coverage.png" style="width: 100%; height: auto;">
</figure>

The code in the page is 79.5% unused, which amounts to over 600kB. Compare this to the coverage on [Squoosh](https://squoosh.app/):

<figure class="full-figure max-figure">
<img width="1494" height="166" alt="" decoding="async" loading="lazy" src="asset-url:./squoosh-coverage.png" style="width: 100%; height: auto;">
</figure>

…where we used inline content just for the CSS and script needed for the first interaction. The first row there is a non-blocking resource, where coverage doesn't matter so much, but the bottom row is the page, where only 7kB is unused. You can also click on these lines which takes you to a code view of used and unused code:

<figure class="full-figure max-figure">
<img width="785" height="402" alt="" decoding="async" loading="lazy" src="asset-url:./coverage-code.png" style="width: 100%; height: auto;">
</figure>

Anyway, we aren't here to talk about Squoosh. Around three seconds could be shaved off time-to-content on the Red Bull site by making the inlined code tailored to what the page needs for that content-render. The rest can be loaded via external resources.

<script type="component">{
  "module": "shared/ImageTabs",
  "exportName": "Styles",
  "staticOnly": true
}</script>

## Issue: Large primary image

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/ImageTabs",
  "props": {
    "ratio": 0.5,
    "maxWidth": 360,
    "images": [
      ["Original WebP (asset-pretty-size:./img-optim/red-bull-main.webp)", "asset-url:./img-optim/red-bull-main.webp"],
      ["Optimised WebP (asset-pretty-size:./img-optim/red-bull-main-optim.webp)", "asset-url:./img-optim/red-bull-main-optim.webp"],
      ["AVIF (asset-pretty-size:./img-optim/red-bull-main.avif)", "asset-url:./img-optim/red-bull-main.avif"]
    ]
  }
}</script>
</figure>

It's great to see them using WebP, but the quality is just set too high. Yes, some detail is lost in the compressed versions, but remember this image has text over the top, and another image over the top.

Actually, let's talk about that image…

## Issue: Large overlay image

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/ImageTabs",
  "props": {
    "ratio": 1.395348837,
    "backgroundStyle": { "background-color": "rgba(0, 0, 0, 0.5)" },
    "category": "redBull",
    "images": [
      ["Original WebP (asset-pretty-size:./img-optim/red-bull-overlay.webp)", "asset-url:./img-optim/red-bull-overlay.webp"],
      ["Optimised WebP (asset-pretty-size:./img-optim/red-bull-overlay-optim.webp)", "asset-url:./img-optim/red-bull-overlay-optim.webp"],
      ["AVIF (asset-pretty-size:./img-optim/red-bull-overlay.avif)", "asset-url:./img-optim/red-bull-overlay.avif"],
      ["AVIF for mobile (asset-pretty-size:./img-optim/red-bull-overlay-mobile.avif)", "asset-url:./img-optim/red-bull-overlay-mobile.avif"]
    ]
  }
}</script>
</figure>

This image sits over the top of the main carousel, and it's a great part of the design. Again, they're using WebP, but maybe not with the right settings. But even with optimised settings, the WebP is still big.

When WebP was created, they designed the alpha channel around things like logos, and things cut-out of photos. In these cases the alpha channel is dominated by large areas of the same value:

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/ImageTabs",
  "props": {
    "ratio": 2.105263158,
    "initial": 0,
    "images": [
      ["Full image", "asset-url:./poster-main.avif"],
      ["Alpha channel", "asset-url:./poster-alpha.avif"]
    ]
  }
}</script>
</figure>

Because of this, they used the WebP _lossless_ mode for the alpha channel, even if the colour data is using the lossy mode. This works well in general, except in cases like this:

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/ImageTabs",
  "props": {
    "ratio": 1.395348837,
    "backgroundStyle": { "background-color": "rgba(0, 0, 0, 0.5)" },
    "initial": 0,
    "images": [
      ["Full image", "asset-url:./img-optim/red-bull-overlay-mobile.avif"],
      ["Alpha channel", "asset-url:./img-optim/red-bull-overlay-alpha.avif"]
    ]
  }
}</script>
</figure>

…where the alpha channel is frequently changing. This is something a lossy codec handles much better. AVIF can perform lossy encoding of all channels, including the alpha channel, so it performs an order of magnitude better than WebP in this case.

For cases where you need genuine lossless images, WebP is a better choice. AVIF supports lossless encoding, but the sizes are usually around 2x of WebP.

## Issue: Overlay image loaded with JavaScript

That overlay image doesn't start loading until the user has been on the site for over 50 seconds, which almost certainly means something is blocking it. The 'initiator' column in the network panel didn't help this time, so I searched the source for the image URL, and found it in a blob of JSON at the end of the document. If it's JSON, that means JavaScript is handling the load of that image in some way.

I would switch this for an `<img>` so [responsive images](/2015/anatomy-of-responsive-images/) could be used to select the best format for the job. This will trigger the download much earlier.

There's a risk that the massive WebP version could end up taking bandwidth from more important things. If this happened, I'd use preloads to bump the priority of more-important content.

## Issue: Large inlined blurry image

The performance issues the Red Bull site has with images are pretty well disguised using a low-quality inlined image, but with a `blur(7px)` effect. Unfortunately the image they use isn't an accurate preview of the image being loaded, as it's cropped incorrectly, so there's a jump when the final version loads. However, I really like this method, as it provides more structure than something like a [BlurHash](https://blurha.sh/), but it does use more bytes.

Their blurred images are 6kB each, which is quite a lot to inline, especially when the well-optimised mobile version of the image is only around twice the size. 150x150 is also an odd choice for creating a tiny JPEG, since JPEG is encoded in 8x8 blocks. If you're interested in details like this, [I gave a talk on how JPEG works](https://www.youtube.com/watch?v=F1kYBnY6mwg&t=294s).

Anyway, I had a play around to see what I could do with 1kB:

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/ImageTabs",
  "props": {
    "ratio": 1.500535906,
    "initial": 3,
    "images": [
      ["Full image", "asset-url:./img-optim/red-bull-blur-2-original.avif"],
      ["Original 150x150 JPEG, blurred (asset-pretty-size:./img-optim/red-bull-blur.jpg)", "asset-url:./img-optim/red-bull-blur.jpg", { "filter": "blur(7px)" }],
      ["48x32 JPEG, blurred (asset-pretty-size:./img-optim/red-bull-blur-2.jpg)", "asset-url:./img-optim/red-bull-blur-2.jpg", { "filter": "blur(9px)" }],
      ["80x56 WebP, blurred (asset-pretty-size:./img-optim/red-bull-blur-2.webp)", "asset-url:./img-optim/red-bull-blur-2.webp", { "filter": "blur(6px)" }],
      ["136x91 AVIF, blurred (asset-pretty-size:./img-optim/red-bull-blur-2.avif)", "asset-url:./img-optim/red-bull-blur-2.avif", { "filter": "blur(6px)" }]
    ]
  }
}</script>
</figure>

JPEG suffers from heavy blocking artefacts, so I had to increase the blur to hide it. WebP is much better, so I was able to go with a higher resolution and less blur.

If you're going to create super-small images like this, you'll want to disable "chroma subsampling" in the codec. Subsampling uses lower-resolution colour data, which usually works well for compression, but it's really noticeable at small sizes like this.

[Squoosh](https://squoosh.app/) lets you disable subsampling for JPEG and AVIF, but it can't be disabled for WebP, as the format doesn't support it. To work around this, the WebP encoder has a "sharp RGB to YUV" option which tries to limit the impact of subsampling at the cost of some colour bleeding. I used that option above.

AVIF does ok here, displaying less noise than WebP, but since the AVIF format has around 300B of headers, we don't really see the usual AVIF 'magic' that we see with other images.

When it comes to an inline preview like this, you can only pick one image size and format. I'd go for the WebP, since it has decent quality and [pretty good support](https://caniuse.com/webp).

## How fast could it be?

The Red Bull site is pretty good, but how fast would it be if they cut their inlining down to the essentials, and optimised those images? Well…

<figure class="full-figure max-figure video-aspect">
<svg viewBox="0 0 816 592"></svg>
<video src="asset-url:./red-bull-compare.mp4" controls></video>
</figure>
<dl class="perf-summary">
  <dt>Original</dt>
  <dd>
    <div class="perf-data">
      <a href="https://www.redbull.com/int-en/redbullracing">Site</a> (<a href="https://www.webpagetest.org/video/compare.php?tests=210318_Xi66_e43703507450f1d9f6104216ab165ec7-r:1-c:0">raw results</a>)
    </div>
  </dd>
  <dt>Optimised</dt>
  <dd><div class="perf-data"><a href="https://f1-performance-demo.netlify.app/red-bull/">Site</a> (<a href="https://www.webpagetest.org/video/compare.php?tests=210318_Xi3N_9851c378d92ddb1e88631ebea66a161f-r%3A1-c%3A0&thumbSize=200&ival=100&end=visual">raw results</a>)</div></dd>
</dl>

Not as big a difference as with previous sites, but still worth doing.

# Scoreboard

<script type="component">{
  "module": "shared/demos/2021/f1-perf/Scores",
  "staticOnly": true,
  "props": {
    "results": 3
  }
}</script>

Red Bull _leaps_ into first place, but will they stay there? Find out in part 4.

<script type="component">{
  "module": "shared/demos/2021/f1-perf/Parts",
  "staticOnly": true,
  "props": {
    "includeIntro": false,
    "partIndex": 2
  }
}</script>
