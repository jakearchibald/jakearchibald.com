---
title: Who has the fastest F1 website in 2021? Part 8
date: 2021-04-09 01:00:00
summary: Deep-diving on the load performance of F1 websites.
meta: Deep-diving on the load performance of F1 websites.
image: 'asset-url:./img.jpg'
---

<script type="component">{
  "module": "shared/demos/2021/f1-perf/Parts",
  "staticOnly": true,
  "props": {
    "includeIntro": true,
    "partIndex": 7
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

# McLaren

<figure class="full-figure max-figure video-aspect">
<svg viewBox="0 0 408 592"></svg>
<video src="asset-url:./mclaren.mp4" controls></video>
</figure>

<figure class="full-figure max-figure scrollable-img">
<picture>
  <source type="image/avif" srcset="asset-url:./film.avif">
  <img width="6234" height="236" alt="" decoding="async" loading="lazy" src="asset-url:./film.png">
</picture>
</figure>
<dl class="perf-summary">
  <dt>Link</dt>
  <dd>
    <div class="perf-data">
      <a href="https://www.mclaren.com/racing/">McLaren F1 Team</a>
    </div>
  </dd>
  <dt>First run</dt>
  <dd>
    <div class="perf-data">25.8s (<a href="https://www.webpagetest.org/video/compare.php?tests=210318_XiN6_4e01033362df3b36504b1d2da320f9f6-r:3-c:0">raw results</a>)</div>
  </dd>
  <dt>Second run</dt>
  <dd>
    <div class="perf-data">10.2s (<a href="https://www.webpagetest.org/video/compare.php?tests=210318_XiN6_4e01033362df3b36504b1d2da320f9f6-r:1-c:1">raw results</a>)</div>
  </dd>
  <dt>Total</dt>
  <dd>
    <div class="perf-data">36s</div>
  </dd>
  <dt>2019 total</dt>
  <dd>
    <div class="perf-data"><a href="/2019/f1-perf/#mclaren">40.7s (2021 site is 4.7s faster)</a></div>
  </dd>
</dl>

As you can see from the video/filmstrip, we get a first-render around 19s in, but there's a lot of layout instability, and we don't get main content until 26s.

This looks almost identical to the 2019 site, which might

Let's take a closer look:

## Possible improvements

- **14 second delay to first render** caused by font CSS. This is kinda different to other sites I've looked at in this series, so I'll cover it in detail below.
- **2 second delay to first render** caused by a CSS on a different server. [Covered in part 1](/2021/f1-perf-part-1/#avoid-blocking-resources-on-other-servers). This CSS should be moved to the same server.
- **Additional 2 second delay to first render** caused by large CSS, only 6% of which is actually used. We saw a (much worse) [example of this in part 6](/2021/f1-perf-part-6/#key-issue-unused-render-blocking-css).
- **20+ second delay to content render** caused by a number of JavaScript loading issues. Covered in detail below.
- **20+ second delay to main image** caused by bad image priorities and optimisation. Covered in detail below.
- **Large delay to small icons** due to a sprite sheet. Covered in detail below.

As always, some of these delays overlap.

## Key issue: Font CSS loading

Let's take a look at the start of the waterfall:

<figure class="full-figure max-figure scrollable-img">
  <img width="930" height="261" alt="" decoding="async" loading="lazy" src="asset-url:./waterfall-1.png">
</figure>

In row 2 we get a blocking request to another server, which is bad for the reasons [covered in part 1](/2021/f1-perf-part-1/#avoid-blocking-resources-on-other-servers), but it issues a redirect to yet another server (row 6), so we pay the HTTP connection price yet again. This could be done in parallel with a `<link rel="preconnect">`, but that isn't the main problem here.

The CSS in row 6 is 140kB, and it's all base64-encoded font data. To make matters worse, it's served over HTTP/1.1, and uncompressed. Although WOFF2 font data doesn't compress well using HTTP compression (it's already well compressed using Brotli), base64 does since it's a limited character set. Brotli shaves almost 30% off the size of this response. But again, that isn't the main problem.

There are a number of ways to load web fonts, and [all of them are bad](https://twitter.com/jaffathecake/status/1293250032632844294).

There's 'swap', where a fallback is instantly shown, and it's swapped to the web font once the web font loads.

- ✅ No blocking of text.
- ✅ No blocking of other content.
- ⚠️ Creates a layout shift when the font is swapped, although this can be reduced if you put in some work with the [CSS font loading API](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Font_Loading_API) to [tweak the metrics of the fallback font](https://meowni.ca/font-style-matcher/).

There's 'block', where the text (and just the text) is hidden until the web font loads, or a 3 second timeout is reached. If the timeout is reached, it behaves like 'swap'.

- ✅ No blocking of other content.
- ⚠️ Potentially key text is delayed.
- ⚠️ Still creates a layout shift when the font loads, as the 'hidden' text is still laid out using fallback text metrics. Again this can be reduced using the techniques above.

There's 'optional', where the web font is used if it's cached (or loads extremely fast), otherwise it sticks with the fallback font.

- ✅ No blocking of text.
- ✅ No blocking of other content.
- ⚠️ Some browsers still have a twitch of layout change. Again this can be reduced using the techniques above.
- ⚠️ Branding people get very angry in the cases where the font isn't displayed.

There's 'fallback', which is like 'optional', but gives the font a slightly longer time to load & swap.

- ✅ No blocking of text.
- ✅ No blocking of other content.
- ⚠️ Still creates a layout shift when the font loads. Again this can be reduced using the techniques above.
- ⚠️ Branding people still get very angry in the cases where the font isn't displayed.

Those options are controlled by the [`font-display` descriptor](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display), but you can achieve the same effects, and everything in between using the [CSS font loading API](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Font_Loading_API).

Another option is what McLaren are doing here, by inlining the font as base64:

- ✅ No layout shifting.
- ⚠️ Blocks text from rendering. In fact…
- ⚠️ Blocks everything from rendering while the CSS downloads.
- ⚠️ You pay the price for all the fonts, even the ones you don't use.

Like I said, there's no good choice here, only the least-bad for a given situation. And I'm not saying inlining fonts as base64 is bad; it gets you the font without any layout shifting. I used this technique [for the Squoosh logo](https://squoosh.app/c/logo-with-text-110604e5.svg) and [PROXX](https://proxx.app/), but in those cases I subsetted the font so it only contained the very small number of characters that were needed.

A little-known feature of [Google fonts](https://fonts.google.com/) is the `text` param, which subsets the fonts to the characters you provide. For instance, taking the [Patrick Hand](https://fonts.google.com/specimen/Patrick+Hand) font, the [standard WOFF2](https://fonts.googleapis.com/css2?family=Patrick+Hand) is 14kB, whereas if I [subset it to just contain the characters 'hello'](https://fonts.googleapis.com/css2?family=Patrick+Hand&text=hello) it's 1kB.

However, McLaren aren't subsetting, they're base64-inlining multiple large fonts, and since CSS resources block rendering, the whole first render is blocked for 14 seconds by that large CSS file. That includes the base64 data for fonts they don't even use on the page.

In this case a 'swap' would have been ideal, with some [CSS font loading API](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Font_Loading_API) tricks to reduce layout shifting.

If McLaren have no control over how the fonts are packaged, as in it's something the foundry controls, McLaren could load the CSS async to avoid the render-blocking, as [I covered in part 1](/2021/f1-perf-part-1/#load-cross-origin-font-css-async).

## Key issue: JavaScript delay

<figure class="full-figure max-figure scrollable-img">
<picture>
  <source type="image/avif" srcset="asset-url:./film.avif">
  <img width="6234" height="236" alt="" decoding="async" loading="lazy" src="asset-url:./film.png">
</picture>
</figure>

<script>
  document.currentScript.previousElementSibling.scrollLeft = 4036;
</script>

Although the McLaren site renders in 19s, the primary content is inserted with JavaScript around the 26s mark, so the experience is dependent on that JavaScript. Back to the waterfall:

<figure class="full-figure max-figure scrollable-img">
  <img width="930" height="261" alt="" decoding="async" loading="lazy" src="asset-url:./waterfall-1.png">
</figure>

The JavaScript on row 3 is a parser-blocking script in the `<head>` (I covered the [different types of script loading in part 2](/2021/f1-perf-part-2/#key-issue-low-priority-render-blocking-javascript)), _and_ it's on another server (I covered [this issue in part 1](/2021/f1-perf-part-1/#avoid-blocking-resources-on-other-servers)). But it isn't the biggest problem here.

More JavaScript loads in rows 5, 7, 8 and 9. There are also parse-blocking scripts, but they're at the bottom of the `<body>`, so they're not blocking any content. Unfortunately the CSS on row 6 is doing all the content-blocking at this point.

Those scripts download in one after the other rather than in parallel. This is due to resource priorities. Chrome knows that the CSS resource in row 6 is blocking rendering so it avoids downloading too much else in parallel, so the CSS gets a large share of the bandwidth.

Anyway, those scripts are downloaded by the time the CSS lands, so why does it take so much longer to get content on the screen? Well, we need to look further down the waterfall:

<figure class="full-figure max-figure scrollable-img">
  <svg width="930" viewBox="0 0 930 22">
  <foreignObject width="930" height="261">
  <img width="930" height="261" alt="" decoding="async" loading="lazy" src="asset-url:./waterfall-1.png">
  </foreignObject>
  </svg>
  <img width="930" height="136" alt="" decoding="async" loading="lazy" src="asset-url:./waterfall-2.png">
</figure>

The scripts on rows 55-57 are also parser blocking scripts at the end of `<body>`, but they're after the scripts which perform the main content rendering, so what gives? This gives:

```js
addEventListener('DOMContentLoaded', () => {
  // …Add the main content to the page…
});
```

The McLaren script waits for `DOMContentLoaded` before it does its work, and because those scripts in rows 55-57 are parser-blocking, they delay `DOMContentLoaded`. The McLaren script shouldn't wait for `DOMContentLoaded`; by being at the end of the `<body>` they know the relevant content has already been parsed.

Row 59 looks like an XHR/fetch which also delays content appearing on the page. However, I don't see this when I visit the site, so I haven't been able to dig into it.

But hey, the _real_ solution here is to avoid depending on JavaScript for the primary content render, by putting the content in the HTML.

## Key issue: Image priorities and optimisation

<figure class="full-figure max-figure scrollable-img">
<picture>
  <source type="image/avif" srcset="asset-url:./film.avif">
  <img width="6234" height="236" alt="" decoding="async" loading="lazy" src="asset-url:./film.png">
</picture>
</figure>

<script>
  document.currentScript.previousElementSibling.scrollLeft = Number.MAX_SAFE_INTEGER;
</script>

The primary image doesn't appear until very late, around 39s. It isn't a huge deal, since it's a subtle background, but let's see what's going on with image loading:

<figure class="full-figure max-figure scrollable-img">
  <img width="930" height="261" alt="" decoding="async" loading="lazy" src="asset-url:./waterfall-1.png">
</figure>

The first image downloaded is on row 11, and oooo that row looks _big_. And yep, it could be a touch smaller:

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/demos/2020/avif-has-landed/ImageTabs",
  "props": {
    "ratio": 1,
    "maxWidth": 150,
    "images": [
      ["Original JPEG (asset-pretty-size:./img-optim/1.jpg)", "asset-url:./img-optim/1.jpg"],
      ["Optimised JPEG (asset-pretty-size:./img-optim/1-optim.jpg)", "asset-url:./img-optim/1-optim.jpg"],
      ["AVIF (asset-pretty-size:./img-optim/1.avif)", "asset-url:./img-optim/1.avif"]
    ]
  }
}</script>
</figure>

But it gets worse. The keen-eyed amongst you may have noticed that this isn't the primary image. In fact, where is that image? It took me a while to find it:

<figure class="full-figure max-figure video-aspect">
<svg viewBox="0 0 1920 1080"></svg>
<video src="asset-url:./image.mp4" controls></video>
</figure>

So, those images are behind a menu, then behind a hover. They're not accessible by mobile. Each is 500kB-2MB, 1920x1920.

`<img>` elements (and `HTMLImageElement` objects) trigger downloads immediately, they don't wait for things like layout unless [`loading="lazy"`](https://developer.mozilla.org/en-US/docs/Web/Performance/Lazy_loading#images_and_iframes). That image of the t-shirt is the first image in the source, so it's the first one queued. The browser tries to reshuffle priorities as it discovers which images are in the viewport, but the layout shifts make that difficult, so the browser makes some choices that turn out to be wrong.

Once the CSS font issue is fixed, and these images are optimised, it might not be a problem. If they still end up with higher priority, and block more important resources, [`loading="lazy"`](https://developer.mozilla.org/en-US/docs/Web/Performance/Lazy_loading#images_and_iframes) might help. If not, I'd avoid adding these images to the DOM until the menu is opened.

The actual main image gets queued behind lots of less important images because it's added with JavaScript, so the browser doesn't even know about it until the 24s mark. Again, this would be solved by putting the core content in HTML, rather than depending on JavaScript for it.

## Issue: Sprite sheets are bad now

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/demos/2020/avif-has-landed/ImageTabs",
  "props": {
    "ratio": 0.818181818,
    "images": [
      ["Original PNG (asset-pretty-size:./img-optim/2.png)", "asset-url:./img-optim/2.png"],
      ["Optimised PNG (asset-pretty-size:./img-optim/2-optim.png)", "asset-url:./img-optim/2-optim.png"],
      ["Lossless WebP (asset-pretty-size:./img-optim/2.webp)", "asset-url:./img-optim/2.webp"]
    ]
  }
}</script>
</figure>

Listen, I used to love sprite sheets. The first 'popular' bit of developer tooling I ever created was [Sprite Cow](http://www.spritecow.com/). Sprite sheets overcame the HTTP/1.1 parallel request limit by bundling many images into one image. Also, it generally produced resources that were smaller than lots of little resources.

With HTTP/2, lots of little requests are cheap. They're not free, [as we saw in part 7](/2021/f1-perf-part-7/#lots-of-little-resources-vs-one-big-resource), but they're cheap. The benefit of having these images separate is, if you only need one little icon, you don't need to download the whole sheet. And that's the case here. As far as I can tell, the page is only using those little flag icons in the footer, and tiny SVG flags are usually less than 300 bytes each.

I guess this is legacy, as the sprite sheet features "McLaren Honda", and McLaren haven't used Honda engines since 2017. But that's another issue with sprite sheets, they're difficult to maintain.

Sorry [Sprite Cow](http://www.spritecow.com/), sprite sheets are dead.

## How fast could it be?

With the CSS inlined, the fonts extracted, and a better before-JavaScript render, here's how fast it would be:

<figure class="full-figure max-figure video-aspect">
<svg viewBox="0 0 816 592"></svg>
<video src="asset-url:./mclaren-compare.mp4" controls></video>
</figure>
<dl class="perf-summary">
  <dt>Original</dt>
  <dd>
    <div class="perf-data">
      <a href="https://www.mclaren.com/racing/">Site</a> (<a href="https://www.webpagetest.org/video/compare.php?tests=210318_XiN6_4e01033362df3b36504b1d2da320f9f6-r:3-c:0">raw results</a>)
    </div>
  </dd>
  <dt>Optimised</dt>
  <dd><div class="perf-data"><a href="https://f1-performance-demo.netlify.app/mclaren/">Site</a> (<a href="https://www.webpagetest.org/video/compare.php?tests=210318_XiK5_254848e064ea63f3262013ab229c3e91-r:1-c:0">raw results</a>)</div></dd>
</dl>

The difference here is huge, which is why it's so important to deliver core content using HTML and CSS, without blocking things on inlined fonts and extra HTTP connections.

# Scoreboard

<script type="component">{
  "module": "shared/demos/2021/f1-perf/Scores",
  "staticOnly": true,
  "props": {
    "results": 8
  }
}</script>

McLaren end up towards the back, but at least they're faster than they were in 2019.

<script type="component">{
  "module": "shared/demos/2021/f1-perf/Parts",
  "staticOnly": true,
  "props": {
    "includeIntro": false,
    "partIndex": 7
  }
}</script>

# Notes

Start each bit with a summary of savings?
Solve layout instability on this page - I think it's the videos - solved
Make timelines smaller?
Coverage should only care about CSS (and other blocking resources)
Coverage shouldn't mark things down unless it's a big deal

- Why still measure 3g?
- Compare to last year
- Just for fun
- I did an F1 timer. Now I'm sad I won't do anything as good. Wait, you're not my therapist

- Auto stuff is removing unneeded css, no JS, prerender, same server
- Check for
  - gzip or brotli
  - minification
  - h2
  - coverage
  - JS idle usage
  - lateness of modals
  - font size
  - If cached, are urls versioned?
- Consistent ratings (first time these are displayed, cover details?)

  - Connection: http/2
  - Code efficiency: minified content / coverage
  - Compression: brotli (gzip is half points)
  - Caching: effective caching
  - Early render: unblocked render (bad if too much fonts, js, unused css - has to be lots)
  - Idle CPU usage: js idle usage
  - Cookie modal: early or no modal
  - Layout stability
  - Image usage: image sizes (put percentage on there)

- Coverage isn't part of consistent stuff, only matters when blocking really

## Mercedes

https://www.webpagetest.org/result/210318_XiZ1_11c37a873c411f7853712e194ab9bb29/
Optimised: https://www.webpagetest.org/result/210318_XiD4_a0b1850fcc58a2f558bfa87c1b293573/#run2

Score:

- First: 8.7s
- Second: 9s
- Total: 17.7s

The good:

- Preloading and preconnecting!
- Some attempt at script defering
- Caching headers
- Decent CSS coverage, and not too big 41k
- Minimal JS blocking, and a no-js render
- webp!
- brotli!
- minified!
- http/2
- Good idle JS (when carousel isn't going)
- gzip
- minified js

Issues:

- So much CSS! But HTTP/2
- Fonts on another server (but preconnected)
- Large JS bundle 50% unused - but not blocking. Oh no it's the GPDR thing!
- Icon fonts. 35k. Actual icons < 1k.
- PNGs what should be something else (on mobile)
- Massive JPEG served to mobile 2560px wide
- Massive page instability when JS lands

Optimisation steps:

- Auto stuff
- Img from 42k to 10k (AVIF but webp could do 12k)
- SVG from 7k to 4k

## Red Bull

https://www.webpagetest.org/result/210318_Xi66_e43703507450f1d9f6104216ab165ec7/#run1
Optimised: https://www.webpagetest.org/result/210318_Xi3N_9851c378d92ddb1e88631ebea66a161f/#run3

Score:

- First 6.7s
- Second: 1.9s
- Total: 8.6s

The good:

- Inline SVG for icons
- Image preview
- No blocking scripts!
- Decently stable render
- Kind to the CPU
- gzip
- h2
- minification
- caching

Issues:

- Some SVG is big (see bull thing)
- Images a bit big
- Huge 1mb effect image
- Fonts on another server
- CSS inlined, but 81% unused. If you're going to inline CSS, make it slim!!
- PNG inlined image. Oops.
- Large model viewer script loaded when not needed right now
- Blur effect isn't in the right place

Optimisation steps:

- Bull SVG from 7k to 2k (it's inline)
- RB logo from 10k to 4k
- Main image 85k down to 14k
- 6k preview down to < 1k
- Huge 1mb effect image down to 5???

## McLaren

https://www.webpagetest.org/result/210318_XiN6_4e01033362df3b36504b1d2da320f9f6/
Optimised: https://www.webpagetest.org/result/210318_XiK5_254848e064ea63f3262013ab229c3e91/#run2

Score:

- First 25.8s
- Second 10.2s
- Total 36s

The good:

- Inline SVG
- h2
- gzip
- minification
- Small cookie thing

The bad:

- 1x1 gif. Seriously?? Or is this tracking?
- 300k spritesheet
- Huge images from store - getting high priority because early in source
- Huge inlined fonts CSS from another origin, and more than needed on the page.
- Very busy main thread
- Lots of blocking scripts from other origins
- JS mostly unused
- Huge layout shifting
- CSS 93% unused
- JS 50% unused
- Bad max-age caching without versions

Optimisations:

- 20k top image down to 4k
- 34k img to 9k
- Removed unneded fonts

## Aston Martin

https://www.webpagetest.org/result/210318_XiAA_98fe08e436b3e9061abdb1fe6fdc6978/
Optimised: https://www.webpagetest.org/result/210318_XiWF_f3c8aab17136a350f91174d2c926157a/#run2

Score:

- First 6.2s
- Second 2.7s
- Score 8.9s

The good:

- Excellent caching
- Generally stable render
- preconnecting for fonts
- Deferred and async scripts
- Images aren't too bad, but could be smaller
- Good looking site performing well
- Modal isn't too late
- h2
- Not bad idle
- brotli!!
- Minification
- caching

The bad:

- Images aren't too bad, but could be smaller
- Some shifting after fonts
- Different origin for css & font css
- CSS massively underused (80%)
- JS underused (64%)

Optimisations:

- 6k inline logo down to 2k
- Blurry preview image (but didn't really help)
- Main image 87k down to 11k

## Alpine

https://www.webpagetest.org/result/210318_Xi57_636baadacc2f3d8bd5efca86027927b6/#run2
Optimised: https://www.webpagetest.org/result/210318_XiCN_e33f1d79395a10be5e943ea7d83d0a95/#run1

Score:

- First 33.4s
- Second 13s
- Score 46.4s

The good:

- gzip
- h2

The bad:

- Scrolling jumps around
- Empty raf loop
- Lots of JS execution
- CSS 97% unused
- JS majority unused
- Large JS
- Image far too big
- Unminified JS (looks like webpack in dev mode, not production mode - eval & sourcemaps)
- Blocking JS, some on another origin
- Unminified CSS
- Lots of CSS
- Late modal
- woff rather than woff2
- Files need to revalidate

Optimisations:

- Blurry img
- Optimised main image a bit

## Ferrari

https://www.webpagetest.org/result/210319_XiJK_b2514a4aa4628fd398da0fc0c0687e09/#run3
Optimised: https://www.webpagetest.org/result/210319_Xi21_f86c05d7f56c3058a3526c2c3c600c3e/#run2

Score:

- First 38.9s
- Second 13.9s
- Total 52.8s

The good:

- Nice inline SVG
- Smaller res image since it's in the background
- minified js
- gzip
- h2

The bad:

- Different servers for JS (but is it blocking?)
- Splash screen
- Poor caching (max age)
- MASSIVE JS 73% unused
- MASSIVE CSS 97% unused
- Multiple blocking scripts to other connections
- Some non-blocking scripts, but then a blackout element
- Big fonts
- Big images (30 when it could be 2)
- unminified css
- heavy CPU usage

Optimisations:

- 30k img down to 7k
- Blurry preview
- Horse 5.2k to 1.61k

## AlphaTauri

https://www.webpagetest.org/result/210319_XiVM_ef153cba16916a413bccfe35025fbe0d/
Optimised: https://www.webpagetest.org/result/210319_XiYT_4722276ba66274974bc724670fda554f/

Score:

- First 16.7s
- Second 4.3s
- Total 21s

The good:

- SVG icons
- Good to the CPU
- Pretty clean without JS
- Not loads of JS
- gzip
- minification
- h2
- caching, except fonts

The bad:

- Big fonts
- Fonts not cached enough (30s)
- Big HTML
- Huge images (569k 2000px wide)
- 190k main image that could be 20k
- Blocking scripts (but not many)
- Massive inlined SVG (80k, could be 12k, but should be img, not essential)
- Main image comes down in a 2nd phase, but it's core content
- Late slap in the face with cookie message
- Large CSS, 94% unused
- Non-blocking JS 71% unused

Optimisations:

- 190k image down to 20k
- Added blurry preview
- SVG 9.6k down to 2k

## Alfa Romeo

https://www.webpagetest.org/result/210319_XiE3_967d29bb2d3ede7f21e32c19eb5f77bc/
Optimised: https://www.webpagetest.org/result/210319_XiE6_9ebeed6f2113fcee8423836fb66466c3/

Score:

- First 16.1s
- Second 7.2
- Total 23.3

The good:

- Images are a decent size, aside from the main one
- No web fonts!!!! Wow
- h2
- gzip
- minification

The bad:

- Massive top image
- JS-blocked render
- JS 83% unused
- CSS 87% unused
- Far-future caching but not a lot of versioning

Optimisations:

- Big 1800x image 286k down to 13k
- Added blurry version
- 7k to 3k logo

## Haas

https://www.webpagetest.org/result/210319_Xi8V_964e4aef102c055951b9bbcf659319a5/
Optimised: https://www.webpagetest.org/result/210319_XiBS_3dd0d726c140ff8af2b6997b1740e76d/

CSS tests:
External https://www.webpagetest.org/result/210404_BiDcF5_f492ff5f5fc7bffd70dc859693033572/
External single https://www.webpagetest.org/result/210404_BiDc6B_cfb25e0ca498a248b663c17803607382/
Inline https://www.webpagetest.org/result/210404_AiDc66_c80deef69e58353885cc7488845fb57b/

Score:

- First 21.1s
- Second 7.1s
- Total 28.2s

The good:

- Good on CPU
- Not loads of script
- H2
- gzip
- caching good
- minified

The bad:

- Blocking JS from another origin
- CSS from another origin
- Some massive 5120x images (350k)
- Lots of layout shifting
- JS inserts images, huge relayout
- 80% CSS unused
- 50% JS unused

Optimisations:

- 82k top image down to 10px

## Williams

https://www.webpagetest.org/result/210319_XiEN_6fb8430d86c8985be8d7505bb2258ad4/#run3
Optimised https://www.webpagetest.org/result/210319_XiSM_832b9b4364e23ad06512751b80d28884/

Score:

- first 6.7s
- second 4.4s
- total 11.1s

The good:

- Cookie banner straight away
- No blocking script
- Fonts preloaded
- CSS is pretty small
- JS is pretty small
- gzip
- Script is quiet when nothing's happening
-

The bad:

- Main image too big
- Images cause reflow
- 2nd image is 20k and looks awful??
- Large off-screen image gets high-priority due to being img tag
- Unminified script
- HTTP/1.1
- Blocking stylesheet from another origin
- CSS 95% unused
- JS 50-90% unused
- bad caching

Optimisations:

- Main image from 142k to 10k
- Sprite sheet 85k down to 20k
- Removed hidden image

# Topics by team

Alpha Tauri

5 fonts 50-70 each

- Late modal
- Bad font sizes
- Bad font caching
- Bad SVG inlining
- Main image arrives late
- Bad use of preload

Alfa Romeo

No fonts!

- Missing versioning on some assets
- Massive top image
- JS blocking render
- Coverage issues
- Blurry image using AVIF

Red Bull

5 fonts 40-50 each

- Inlining CSS: Good, but not in this case (bad coverage)
- SVG bigger than needed, but it's external
- AVIF can handle effect image well (not so much webP)
- Fonts on another server, but preconnect
- Efficient blurry image previews
  - Late modal

Aston Martin

7 fonts. 20-30 each.

- Too-big main image
  - Different server for css and fonts
  - Coverage issues (but not blocking)

Williams

5 fonts. 30-70

- Unminified JS
- http/1.1
- bad caching
  - coverage bad (but script isn't massive)

Haas

2 fonts 20k

- Other origin blocking resources
- Wrong size images
  - Coverage issues
  - Layout stability issues

Mclaren

- Spritesheets are bad
- Images that are off-screen loading and taking bandwidth
- Busy main thread
- Blocking items from other origins (not just fonts)
- Layout shifting
- Inlined fonts baaaaad
- Bad max-age caching

Ferrari

4 fonts 25-46

- Late modal
- Bad max-age caching
- Huge JS & CSS
- Blocking to other connections
- raf loop (not as good an example though)

Alpine

7 fonts - one is like 200k

- Late modal
- Scrolling jumps
- raf loop on idle (dig into why)
- Major css/js coverage issues
- Image issues
- Unminified JS (webpack dev mode)
- Unminified css
- Wrong font format
- Blocking JS, on other origins
- Coverage issues
- Blurry img optimisation

Mercedes

3 fonts. 40 each.

- Late modal
- Layout instability
- Icon fonts
- Large, but not-blocking JS (how ok is this?)
- Important resources on another server, so more connections needed (fonts)
- But preconnect used!
- Brotli
- Lots of little CSS files can harm zipping (show difference) - also header overhead
- Image wrong width
- Image wrong format

---

Tackle fonts at some point
Tackle image blurring at some point
