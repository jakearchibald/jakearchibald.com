---
title: Who has the fastest F1 website in 2021? Part 8
date: 2021-04-14 01:00:00
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

This looks almost identical to the 2019 site, which might explain why the numbers and issues are so similar. Let's take a closer look:

## Possible improvements

- **14 second delay to first render** caused by font CSS. This is kinda different to other sites I've looked at in this series, so I'll cover it in detail below.
- **2 second delay to first render** caused by a CSS on a different server. [Covered in part 1](/2021/f1-perf-part-1/#avoid-blocking-resources-on-other-servers). This CSS should be moved to the same server.
- **Additional 2 second delay to first render** caused by large CSS, only 6% of which is used. We covered a (much worse) [example of this in part 6](/2021/f1-perf-part-6/#key-issue-unused-render-blocking-css).
- **20+ second delay to content render** caused by a number of JavaScript loading issues. Covered in detail below.
- **20+ second delay to main image** caused by bad image priorities and poor optimisation. Covered in detail below.
- **Large delay to small icons** due to a sprite sheet. Covered in detail below.

As always, some of these delays overlap.

## Key issue: Font CSS loading

Let's take a look at the start of the waterfall:

<figure class="full-figure max-figure scrollable-img">
  <img width="930" height="261" alt="" decoding="async" loading="lazy" src="asset-url:./waterfall-1.png">
</figure>

In row 2 we get a blocking request to another server, which is bad for the reasons [covered in part 1](/2021/f1-perf-part-1/#avoid-blocking-resources-on-other-servers), but it issues a redirect to yet another server (row 6), so we pay the HTTP connection price yet again. This could be done in parallel with a `<link rel="preconnect">`, but that isn't the main problem here.

The CSS in row 6 is 140kB, and it's all base64-encoded font data. To make matters worse, it's served over HTTP/1.1 and uncompressed. Although WOFF2 font data doesn't compress well using HTTP compression (it's already compressed using Brotli), base64 does compress well since it's a limited character set. Brotli shaves almost 30% off the size of this response. But again, that isn't the main problem.

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

Those options are controlled by the [`font-display` descriptor](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display), but you can achieve the same effects and everything in between using the [CSS font loading API](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Font_Loading_API).

Another option is what McLaren are doing here by inlining the font as base64:

- ✅ No layout shifting.
- ⚠️ Blocks text from rendering until the fonts download. In fact…
- ⚠️ Blocks everything from rendering while the fonts download.
- ⚠️ You pay the price for all the fonts, even the ones you don't use.

Like I said, there's no good choice here, only the least-bad for a given situation. And I'm not saying inlining fonts as base64 is bad; it gets you the font without any layout shifting. I used this technique [for the Squoosh logo](https://squoosh.app/c/logo-with-text-110604e5.svg) and [PROXX](https://proxx.app/), but in those cases I subsetted the font so it only contains the very small number of characters that are needed.

A little-known feature of [Google fonts](https://fonts.google.com/) is the `text` param which subsets the fonts to the characters you provide. For instance, taking the [Patrick Hand](https://fonts.google.com/specimen/Patrick+Hand) font, the [standard WOFF2](https://fonts.googleapis.com/css2?family=Patrick+Hand) is 14kB, whereas if I [subset it to just contain the characters 'hello'](https://fonts.googleapis.com/css2?family=Patrick+Hand&text=hello) it's 1kB.

However, McLaren aren't subsetting, they're base64-inlining multiple large fonts, and since CSS resources block rendering, the whole first render is blocked for 14 seconds.

In this case a 'swap' would have been ideal, with some [CSS font loading API](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Font_Loading_API) tricks to reduce layout shifting.

If McLaren have no control over how the fonts are packaged, as in it's something the font foundry controls, McLaren could load the CSS async to avoid the render-blocking, as [I covered in part 1](/2021/f1-perf-part-1/#load-cross-origin-font-css-async).

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

More JavaScript loads in rows 5, 7, 8 and 9. These are also parser-blocking scripts, but they're at the bottom of the `<body>` so they're not blocking any content. Unfortunately the CSS on row 6 is doing all the content-blocking at this point.

Those scripts download one after the other rather than in parallel. This is due to resource priorities. Chrome knows that the CSS resource in row 6 is blocking rendering so it avoids downloading too much else in parallel, so the CSS gets a large share of the bandwidth.

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

The McLaren script waits for `DOMContentLoaded` before it does its work, and because those scripts in rows 55-57 are parser-blocking, they delay `DOMContentLoaded`. The McLaren script shouldn't wait for `DOMContentLoaded`; by being at the end of the `<body>` it can rely on the relevant DOM being there already.

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

<script type="component">{
  "module": "shared/ImageTabs",
  "exportName": "Styles",
  "staticOnly": true
}</script>

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/ImageTabs",
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

But it gets worse. The keen-eyed amongst you may have noticed that this _isn't_ the primary image. In fact, where is that image? It took me a while to find it:

<figure class="full-figure max-figure video-aspect">
<svg viewBox="0 0 1920 1080"></svg>
<video src="asset-url:./image.mp4" controls></video>
</figure>

So, those images are behind a menu, then behind a hover. They're not accessible by mobile. Each is 500kB-2MB, and 1920x1920 in size, even though it's only displayed at around 150x150.

`<img>` elements (and `HTMLImageElement` objects) trigger downloads immediately; they don't wait for things like layout unless [`loading="lazy"`](https://developer.mozilla.org/en-US/docs/Web/Performance/Lazy_loading#images_and_iframes). That image of the t-shirt is the first image in the source, so it's the first one queued. The browser tries to reshuffle priorities as it discovers which images are in the viewport, but the layout shifts make that difficult, so the browser makes some choices that turn out to be wrong.

Once the CSS font issue is fixed, and these images are optimised, it might not be a problem. If they still end up with higher priority, and block more important resources, [`loading="lazy"`](https://developer.mozilla.org/en-US/docs/Web/Performance/Lazy_loading#images_and_iframes) might help. If not, I'd avoid adding these images to the DOM until the menu is opened.

The actual main image gets queued behind lots of less important images because it's added with JavaScript, so the browser doesn't even know about it until the 24s mark. Again, this would be solved by putting the core content in HTML, rather than depending on JavaScript.

## Issue: Sprite sheets are bad now

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/ImageTabs",
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

Ahhh a sprite sheet. I haven't seen one of these in a while. Listen, I used to love sprite sheets. The first 'popular' bit of developer tooling I ever created was [Sprite Cow](http://www.spritecow.com/). Sprite sheets overcame the HTTP/1.1 parallel request limit by bundling many images into one image. Also, it generally produced resources that were smaller than lots of little resources.

With HTTP/2, lots of little requests are cheap. They're not free, [as we saw in part 7](/2021/f1-perf-part-7/#lots-of-little-resources-vs-one-big-resource), but they're cheap. The benefit of having these images separate is, if you only need one little icon, you don't need to download the whole sheet. And that's the case here. As far as I can tell, the page is only using those little flag icons in the footer, and tiny SVG flags are usually less than 300 bytes each.

Even if a lot of that sprite sheet was needed, images are different to things like CSS. With CSS, all of it needs to download until anything can render (unless you're using tricks to load it async). However, images can appear one by one, as they download. By keeping the images separate, the browser can give priority to the images that are needed sooner, and they'll appear sooner as they'll be tiny.

I guess this sprite sheet is legacy, as the sprite sheet features "McLaren Honda", and McLaren haven't used Honda engines since 2017. But that's another issue with sprite sheets, they're difficult to maintain.

Sorry [Sprite Cow](http://www.spritecow.com/), sprite sheets are dead.

## How fast could it be?

With the CSS inlined, the fonts extracted, and a better before-JavaScript render, here's how fast it would be over the same connection:

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

McLaren end up towards the back, but at least they're faster than they were in 2019. Two more teams to go! See you next time…

<script type="component">{
  "module": "shared/demos/2021/f1-perf/Parts",
  "staticOnly": true,
  "props": {
    "includeIntro": false,
    "partIndex": 7
  }
}</script>
