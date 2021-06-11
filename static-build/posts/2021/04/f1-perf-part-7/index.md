---
title: Who has the fastest F1 website in 2021? Part 7
date: 2021-04-07 01:00:00
summary: Deep-diving on the load performance of F1 websites.
meta: Deep-diving on the load performance of F1 websites.
image: 'asset-url:./img.jpg'
---

<script type="component">{
  "module": "shared/demos/2021/f1-perf/Parts",
  "staticOnly": true,
  "props": {
    "includeIntro": true,
    "partIndex": 6
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

# Haas

<figure class="full-figure max-figure video-aspect">
<svg viewBox="0 0 408 592"></svg>
<video src="asset-url:./haas.mp4" controls></video>
</figure>

<figure class="full-figure max-figure scrollable-img">
<picture>
  <source type="image/avif" srcset="asset-url:./film.avif">
  <img width="6504" height="236" alt="" decoding="async" loading="lazy" src="asset-url:./film.png">
</picture>
</figure>
<dl class="perf-summary">
  <dt>Link</dt>
  <dd>
    <div class="perf-data">
      <a href="https://www.haasf1team.com/">Uralkali Haas F1 Team</a>
    </div>
  </dd>
  <dt>First run</dt>
  <dd>
    <div class="perf-data">21.1s (<a href="https://www.webpagetest.org/video/compare.php?tests=210319_Xi8V_964e4aef102c055951b9bbcf659319a5-r:2-c:0">raw results</a>)</div>
  </dd>
  <dt>Second run</dt>
  <dd>
    <div class="perf-data">7.1s (<a href="https://www.webpagetest.org/video/compare.php?tests=210319_Xi8V_964e4aef102c055951b9bbcf659319a5-r:1-c:1">raw results</a>)</div>
  </dd>
  <dt>Total</dt>
  <dd>
    <div class="perf-data">28.2s</div>
  </dd>
  <dt>2019 total</dt>
  <dd>
    <div class="perf-data"><a href="/2019/f1-perf/#haas">12.5s (2021 site is 15.7s slower)</a></div>
  </dd>
</dl>

Haas had the fastest F1 site in 2019, but things aren't looking so good this year. They get to their first render in around 9 seconds, but everything shifts around so much that it isn't really usable until 21.1s.

## Possible improvements

- **5+ second delay to content render** caused by a CSS font tracker. This is exactly the same issue [covered in part 1](/2021/f1-perf-part-1/#key-issue-css-font-tracker).
- **3 second delay to content render** caused by CSS on other servers, plus a redirect. This problem is [covered in part 4](/2021/f1-perf-part-4/#key-issue-delayed-css), and the solution here is to move the CSS to the same server as the page, or load them async.
- **3 second delay to content render** caused by blocking JS on another server. This problem is [covered in part 1](/2021/f1-perf-part-1/#avoid-blocking-resources-on-other-servers), and the solution is to use `defer` or `async` so the script doesn't block rendering.
- **10+ second delay to main image** caused by JavaScript. Covered in detail below.
- **10+ seconds of layout instability** caused by JavaScript. Covered in detail below.

## Lots of little resources vs one big resource

Here's the start of the waterfall:

<figure class="full-figure max-figure scrollable-img">
  <img width="423" height="617" alt="" decoding="async" loading="lazy" src="asset-url:./waterfall-1.png">
</figure>

That's a lot of CSS resources! But is it a problem? In HTTP/1 these would be downloaded in groups of 6, and that reduction in parallel request-making would have hurt performance significantly. But, looking at the waterfall above, everything seems to be in-parallel thanks to HTTP/2.

So, what's the overhead compared to one CSS file? A big part of gzip and brotli compression involves back-references, eg "the next 50 bytes are the same as this bit earlier in the resource". That can only happen in a single resource, so compressing lots of small resources is less efficient than compressing one combined resource. There's also the metadata that comes with each request & response, such as headers. Although, HTTP/2 can back-reference these to other requests & responses in the same connection using [HPACK header compression](https://http2.github.io/faq/#why-do-we-need-header-compression).

Here's the size difference, including brotli compression and headers:

<dl class="perf-summary">
  <dt>32 CSS resources</dt>
  <dd>
    <div class="perf-data">48.2 kB</div>
  </dd>
  <dt>1 combined CSS resource</dt>
  <dd>
    <div class="perf-data">37.7 kB</div>
  </dd>
</dl>

So we're talking about a 28% overhead in terms of size, but that's only 10.5 kB. But are there other delays, unrelated to size? I passed the site through my optimiser, so nothing was blocking rendering apart from the CSS, and generated three versions of the page:

- One with 32 CSS resources
- One with one combined CSS resource
- One with the CSS inlined as a `<style>` in the `<head>`

…and I put each through WebPageTest 9 times, and looked at how long it took them to get to first-render:

<figure class="full-figure max-figure">
  <img style="width: 100%; height: auto" width="600" height="331" alt="32 CSS resources takes between 3-4 seconds to render. One CSS resource takes around 3 seconds, but there are some outliers around 4 seconds. Inline CSS takes 2-2.5 seconds." decoding="async" loading="lazy" src="asset-url:./css-compare.svg">
</figure>

Combining the CSS into one resource saves around half a second…ish. There are a few outliers taking longer than 4 seconds – in those cases here's what happened:

<figure class="full-figure max-figure scrollable-img">
  <img width="893" height="108" alt="" decoding="async" loading="lazy" src="asset-url:./waterfall-2.png">
</figure>

In those outlying cases the primary image jumped ahead and took bandwidth away from the CSS. The impact of this could be reduced by optimising the image (it's around 10x too big), but other than that it might need some tweaking in the markup or on the server.

With inlining you don't get any of these priority issues, and it's around a second faster. Also, if you decide to inline your CSS, you can ensure you're sending exactly what the page needs, and nothing more (although I didn't do that for this test).

## Key issue: Layout shifts as interactivity lands

<figure class="full-figure max-figure scrollable-img">
<picture>
  <source type="image/avif" srcset="asset-url:./film.avif">
  <img width="6504" height="236" alt="" decoding="async" loading="lazy" src="asset-url:./film.png">
</picture>
</figure>

<script>
  document.currentScript.previousElementSibling.scrollLeft = 2268;
</script>

The fully-loaded page has a carousel at the top, but what you see between 9-14s is a dump of all the links in the carousel. This is a reasonable no-JavaScript experience, but it isn't a great before-JavaScript experience.

"No-JavaScript" users are users that will not run your JavaScript. They may exist because:

- They have disabled JavaScript.
- The JavaScript failed to load due to network reasons.
- The JavaScript didn't execute due to an error (either a mistake, or lack of support in their browser), or script was avoided due to a negative feature-detect.

You might decide that you don't have enough of these users to care about, and that's reasonable if you have good evidence. Or, you might use something like the [`nomodule` trick we saw on the Aston Martin site](/2021/f1-perf-part-5/#cutting-the-mustard) which creates a lot of these users, so it's definitely worth caring about in that case.

"Before-JavaScript" users are waiting for your JavaScript to download. There's some grey area here, because a script which takes infinite time to download can look like it's in the before-JavaScript state, but it's more like no-JavaScript.

We need to design for these states with actual users in mind, and it gets a lot easier if we can use the same design for both.

The Haas carousel has a reasonable no-JavaScript experience because it provides links to all items in the carousel without JavaScript. It's a bad before-JavaScript experience because the content jumps around as it rearranges itself into a carousel. You can see this at the 15s and 22s marks.

### Progressively-enhancing a carousel

You might be more familiar with the term "hydration" if you use a framework, but the goal is the same: Give the user a reasonable before-JavaScript experience, then add in JavaScript interactivity with as little disruption as possible.

[CSS scroll snap](https://caniuse.com/?search=scroll%20snap) has really good support these days, which lets you create a carousel-like experience without JavaScript. It also means the carousel will use platform scroll physics. You could use some tricks to [hide the scrollbar](https://dev.to/ashwamegh/how-to-hide-scrollbar-from-any-html-element-dae) at this phase, which is fine as a before-JS experience, but maybe not great as a no-JS experience, as it will prevent some users being able to get to the other items in the carousel. If that's an issue, you could branch behaviour for no-JS users at this point.

The before-JS render should contain the images too. This means the browser can download them in parallel with the JavaScript. Right now the main image on the Haas site is in the carousel, and its download is delayed because the browser doesn't know about it until after the JavaScript loads. Also, putting the core carousel content in the HTML means you're less likely to get a layout shift when it's enhanced.

The before-JS phase should not contain the back & forward buttons of the carousel, because they won't work. This is something a lot of frameworks get wrong when it comes to hydration; they encourage the before-JS render to be identical to the enhanced version, but buttons that don't work are a bad user experience.

Then, JS comes along and adds the back & forward buttons, which use [`scrollTo`](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollTo). Adding these buttons shouldn't impact layout of other things, they should just appear.

**Edit:** Turns out [such a carousel already exists](https://bravecow.github.io/native-gallery/example/). [Here's the repo](https://github.com/bravecow/native-gallery).

## Issue: Image optimisation

Let's take that main image at the top of the page:

<script type="component">{
  "module": "shared/ImageTabs",
  "exportName": "Styles",
  "staticOnly": true
}</script>

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/ImageTabs",
  "props": {
    "ratio": 2.25,
    "maxWidth": 420,
    "images": [
      ["Original JPEG (asset-pretty-size:./img-optim/1.jpg)", "asset-url:./img-optim/1.jpg"],
      ["Optimised JPEG (asset-pretty-size:./img-optim/1-optim.jpg)", "asset-url:./img-optim/1-optim.jpg"],
      ["WebP (asset-pretty-size:./img-optim/1.webp)", "asset-url:./img-optim/1.webp"],
      ["AVIF (asset-pretty-size:./img-optim/1.avif)", "asset-url:./img-optim/1.avif"]
    ]
  }
}</script>
</figure>

The original is 1440 pixels across, which is too big for a mobile device. I resized it to 720 pixels.

## How fast could it be?

With the CSS inlined, and a better before-JavaScript render, here's how fast it would be:

<figure class="full-figure max-figure video-aspect">
<svg viewBox="0 0 816 592"></svg>
<video src="asset-url:./haas-compare.mp4" controls></video>
</figure>
<dl class="perf-summary">
  <dt>Original</dt>
  <dd>
    <div class="perf-data">
      <a href="https://www.haasf1team.com/">Site</a> (<a href="https://www.webpagetest.org/video/compare.php?tests=210319_Xi8V_964e4aef102c055951b9bbcf659319a5-r:2-c:0">raw results</a>)
    </div>
  </dd>
  <dt>Optimised</dt>
  <dd><div class="perf-data"><a href="https://f1-performance-demo.netlify.app/haas/">Site</a> (<a href="https://www.webpagetest.org/video/compare.php?tests=210319_XiBS_3dd0d726c140ff8af2b6997b1740e76d-r:3-c:0">raw results</a>)</div></dd>
</dl>

There's still some instability there as the font comes in. I would tackle that by making the fallback font have similar dimensions using the [CSS font loading API](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Font_Loading_API).

# Scoreboard

<script type="component">{
  "module": "shared/demos/2021/f1-perf/Scores",
  "staticOnly": true,
  "props": {
    "results": 7
  }
}</script>

Haas slot in ahead of Ferrari. It's sad to see 2019's winner regressing so much, but the problems don't seem too hard to fix.

<script type="component">{
  "module": "shared/demos/2021/f1-perf/Parts",
  "staticOnly": true,
  "props": {
    "includeIntro": false,
    "partIndex": 6
  }
}</script>
