---
title: Who has the fastest F1 website in 2021? Part 1
date: 2021-03-25 01:00:00
summary: Deep-diving on the load performance of F1 websites.
meta: Deep-diving on the load performance of F1 websites.
image: 'asset-url:./img.jpg'
---

In 2019 I did a [performance review of F1 websites](/2019/f1-perf/), and it was fun so I figured I'd do it again, but bigger (definitely) and better (I hope). Turns out a lot has changed in the past two years, and well, some things haven't changed.

Not interested in F1? It shouldn't matter. This is just a performance review of 10 recently-built/updated sites that have broadly the same goal, but are built by different teams, and have different performance issues.

<script type="component">{
  "module": "shared/demos/2021/f1-perf/Parts",
  "staticOnly": true,
  "props": {
    "includeIntro": false,
    "partIndex": 0
  }
}</script>

# Methodology

I'm sticking to the same method as 2019, so we can compare between the years.

I'm going to put each site through [WebPageTest](https://www.webpagetest.org) to gather the data in Chrome on a Moto G4 with a 3g connection.

## Why test on 3G?

Alex Russell recently did an [analysis of mobile devices and connection speeds](https://infrequently.org/2021/03/the-performance-inequality-gap/) and concluded that 'slow 4g' is a better baseline. However, I'm going to test on 'good 3g' to keep results comparable to the 2019 results.

Besides, I've been to the British Grand Prix, and, well, the Northamptonshire cell towers are ill-equipped to handle 140,000 people at once, and speeds grind to what feels more like 2g, and that's exactly the kind of time and place someone might visit an F1 website.

## Why test on a 5 year old phone?

If you look outside the tech bubble, a lot of users can't or don't want to pay for a high-end phone. To get a feel for how a site performs for real users, you have to look at mid-to-lower-end Android devices. And, unfortunately, new low-end phones perform about the same as a Moto G4.

<figure class="full-figure">
  <picture>
    <source type="image/avif" srcset="asset-url:./phone-cpu.avif">
    <img decoding="async" alt="Phone CPU over time. The Moto 4 is similar to the Moto E from 2020" src="asset-url:./phone-cpu.png">
  </picture>
  <figcaption>Diagram from <a href="https://infrequently.org/2021/03/the-performance-inequality-gap/">Alex's analysis</a></figcaption>
</figure>

## The score

Each site will get a score which is how long it take to become interactive on a first load, plus the same for a second load (to measure caching efficiency). By "interactive", I mean meaningful content is displayed in a stable way, and the main thread is free enough to react to a tap/click.

There's some subjectivity there, so I'll try and justify things as I go along.

## Issues with the test

I'm not comparing how 'good' the website is in terms of design, features etc etc. In fact, `about:blank` would win this contest. Thankfully no F1 teams have chosen `about:blank` as their website.

I'm only testing Chrome. Sorry. There's only one of me and I get tired. In fact, with 10 sites to get through, it's possible I'll miss something obvious, but I'll post the raw data so feel free to take a look.

Also, and perhaps most importantly, the results aren't a reflection of the abilities of the developers. We don't know how many were on each project, we don't know what their deadline was or any other constraints. My goal here is to show common performance issues that exist on real-world sites, how to identify them, and how to fix them.

Ok, that's enough waffle, let's GO, GO, GO!

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

# Alpha Tauri

<figure class="full-figure max-figure video-aspect">
<svg viewBox="0 0 408 592"></svg>
<video src="asset-url:./alpha-tauri.mp4" controls></video>
</figure>
<figure class="full-figure max-figure scrollable-img">
<picture>
  <source type="image/avif" srcset="asset-url:./alpha-tauri-film.avif">
  <img width="12481" height="236" alt="" decoding="async" loading="lazy" src="asset-url:./alpha-tauri-film.png">
</picture>
</figure>
<dl class="perf-summary">
  <dt>Link</dt>
  <dd>
    <div class="perf-data">
      <a href="https://www.scuderiaalphatauri.com/en/">Scuderia AlphaTauri Honda</a>
    </div>
  </dd>
  <dt>First run</dt>
  <dd>
    <div class="perf-data">16.7s (<a href="https://www.webpagetest.org/video/compare.php?tests=210319_XiVM_ef153cba16916a413bccfe35025fbe0d-r%3A1-c%3A0&thumbSize=200&ival=100&end=visual">raw results</a>)</div>
  </dd>
  <dt>Second run</dt>
  <dd>
    <div class="perf-data">5.4s (<a href="https://www.webpagetest.org/video/compare.php?tests=210319_XiVM_ef153cba16916a413bccfe35025fbe0d-r%3A1-c%3A1&thumbSize=200&ival=100&end=visual">raw results</a>)</div>
  </dd>
  <dt>Total</dt>
  <dd>
    <div class="perf-data">22.1s</div>
  </dd>
  <dt>2019 total</dt>
  <dd>
    <div class="perf-data"><a href="/2019/f1-perf/#toro-rosso">12.8s (2021 site is 9.3s slower)</a></div>
  </dd>
</dl>

The video above shows how users would experience the site on a low-end phone on a good 3G connection. Alternatively, scroll along the timeline above.

## Possible improvements

Here's what they could do to make major improvements to load performance:

- **7 second delay to content-render** caused by CSS font tracker.
- **1 second delay to content-render** caused by preload resource priority issues.
- **1 second delay to content-render** caused by unnecessary SVG inlining.
- **5 second delay to primary image** caused by unnecessary preloading.
- **1 second delay to primary image** caused by poor image compression.
- **40+ second delay to content-blocking cookie modal** caused by… a number of things.

Some of these delays overlap, so let's dive in:

This was a really interesting one to profile. More often than not, poor content-render performance is down to JavaScript in some way, but in this case it looks like someone has done the right thing and avoided render-blocking JS, but non-JS things have spoiled the performance party.

I use [Chrome DevTools' "Performance" panel](https://developer.chrome.com/docs/devtools/evaluate-performance/) during development to measure page performance, and later use [WebPageTest](https://www.webpagetest.org/) to test it on a low-end device. WebPageTest gives you a waterfall of resources, and since the page renders around the 17s mark, I focus on everything that loads before that (don't worry if you don't understand it yet):

<figure class="full-figure max-figure">
<img style="width: 100%; height: auto;" width="486" height="264" alt="" decoding="async" loading="lazy" src="asset-url:./alpha-tauri-waterfall.png">
</figure>

In rows 1-10 I see:

- HTML, row 1 (213kB gzipped)
- 3 big images, rows 2, 3, 9 (~1MB)
- 4 CSS files, rows 4, 5, 6, 10 (~100kB)
- 2 JS files (~40kB)

It's difficult to tell from our current tooling whether a JS file is contributing to render-blocking, but I looked at the source and it's non-blocking. The rest however…

## Key issue: CSS font tracker

The main issue here is a CSS font tracker hosted on another server, and it accounts for **7 seconds of first-content delay**, but it's really a combination of issues:

### Parallelise sequential resources

That late-loading CSS on row 10 is a bad smell, so I took a closer look at the request in Chrome DevTools' network panel:

<figure class="full-figure max-figure">
  <img style="height:auto" width="1126" height="150" alt="" decoding="async" loading="lazy" src="asset-url:./tauri-devtools.png">
</figure>

And there's the red flag in the 'initiator' column. We have some CSS, a render-blocking resource, which loads more CSS. The HTML contains:

```html
<link rel="stylesheet" href="autoptimize_etcetc.css" />
```

Which contains:

```css
@import url('//hello.myfonts.net/count/3ad3ad');
```

The browser is good at loading things in parallel, but it can only load what it knows about. In this case it doesn't know about the above resource until it loads the CSS that contains that line.

The ideal way to solve this is to delete that `@import` above, which would save 7 seconds, but that line is a requirement made by the owners of the web font, who use it to ensure sites have paid for font usage. I feel there are better ways for the font foundry to achieve this, but that isn't in the control of the site we're looking at. They could switch to open source fonts, which don't have these requirements & restrictions, but let's assume they can't do that, so we'll work around the problem.

We need to turn this from a sequence of requests, to two requests in parallel, which we can do using `preload`:

```html
<link
  rel="preload"
  as="stylesheet"
  href="https://hello.myfonts.net/count/3ad3ad"
/>
```

This quick change would shave **3 seconds off the first-content delay.** That isn't as good as saving the whole 7 seconds of course, because:

### Avoid blocking resources on other servers

Back in the bad old days of HTTP/1.1 browsers had to set up a new HTTP connection for every in-parallel request, and browsers were limited to between 2-8 connections per server (depending on the browser and the version). This was extremely slow, especially if SSL was involved, since there's a chunk of up-front cost.

Because this limit was per-origin, you could work around the limit by adding more origins.

However, HTTP/2 came along and gave us massive parallelism across a single connection. You only pay the cost of connection setup once… if your resources are on the same server that is.

<figure class="full-figure max-figure">
<svg viewBox="0 0 486 212">
<foreignObject x="0" y="0" width="486" height="264">
<img width="486" height="264" alt="" decoding="async" loading="lazy" src="asset-url:./alpha-tauri-waterfall.png">
</foreignObject>
</svg>
</figure>

The requests on rows 1 & 10 have an extra thinner bit at the start, representing the various bits of connection setup. Row 1 has it because it's the first request to the site, and row 10 has it because it's to a different site.

That extra connection setup accounts for 5 seconds of blocking time. Using a preload tag would help start this connection earlier, but it can't eliminate the cost.

Unfortunately what was 'best practice' in HTTP/1.1 times became 'worst practice' in HTTP/2 times. As a result, it's important to avoid hosting render-blocking content on other servers.

In this case, because it's a tracker, it can't just be moved to the site's own server, so we need another solution:

### Load cross-origin font CSS async

Since we can't do anything else about it, the best thing we can do is remove the render-blocking nature of that separate connection. We can do that by moving all the `@font-face` related CSS, along with the `@import`, into its own stylesheet, and async-load it in the `<head>`:

```html
<link rel="preload" href="/font-css.css" as="style" />
<link
  rel="stylesheet"
  href="/font-css.css"
  media="print"
  onload="media='all'"
/>
```

This technique was developed by the [filament group](https://www.filamentgroup.com/lab/load-css-simpler/). Browsers will download print stylesheets ahead of time, but they won't block rendering. However, they will download it at a low priority, so the `preload` is used to make it high priority. When the stylesheet has loaded, it changes `media` to `all`, so it applies to the page.

As a side-effect, fonts will display using fallbacks before the CSS loads. Make sure this looks ok, and make sure your `@font-face` rules use [`font-display: swap`](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display) so this pattern continues once the CSS loads.

If you're not happy with `swap`, use the [font loading API](https://web.dev/optimize-webfont-loading/#the-font-loading-api) to get even more control over how the page displays while fonts are loading.

And one last thing:

### Preload fonts

Fonts only start downloading once the browser finds something on the page that needs them. This is efficient in some ways, as it avoids loading fonts it doesn't need. However, that also means they can start downloading pretty late.

If you're _sure_ particular fonts are needed on the page, preload them to get the download starting earlier:

```html
<link
  rel="preload"
  href="/path/to/font.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>
```

The `crossorigin` bit is important, because font requests are CORS requests. Using `crossorigin` in a preload ensures the preload also uses CORS.

Phew, ok, next issue:

## Key issue: Late modal

<figure class="full-figure max-figure scrollable-img">
<picture>
  <source type="image/avif" srcset="asset-url:./alpha-tauri-film.avif">
  <img width="12481" height="236" alt="" decoding="async" loading="lazy" src="asset-url:./alpha-tauri-film.png">
</picture>
</figure>

<script>
  document.currentScript.previousElementSibling.scrollLeft = 7192;
</script>

I don't have anything nice to say about 'cookie consent' modals. I think they're doing a huge amount of damage to the web exclusively, while the problems they're trying to solve happen on other platforms too. Also, I don't think they solve the problems they're trying to solve. But hey, I'm not a lawyer, so I've mostly ignored them in this test, and haven't factored them into a site's score.

However, throwing up a modal after the user has been using the page for 30 seconds is an awful user experience. The only 'sensible' way to show one of these modals is to use a small-as-you-can-make-it bit of JS at the top of the page, so you can show it before anything else, and the user can get it out of the way early.

## Issue: Preload priority

There are two images at the top of the waterfall:

<figure class="full-figure max-figure">
<svg viewBox="0 0 486 93">
<foreignObject x="0" y="0" width="486" height="264">
<img width="486" height="264" alt="" decoding="async" loading="lazy" src="asset-url:./alpha-tauri-waterfall.png">
</foreignObject>
</svg>
</figure>

I was surprised to see images loading before CSS, since CSS is render-blocking but images aren't. As you see from the darker bits of the response, which represents bytes being received, the image is taking away bandwidth from the CSS.

It turns out these are preloaded images:

```html
<link rel="preload" href="alphatauri_desktop.jpg" as="image" />
<link rel="preload" href="alphatauri_tablet.jpg" as="image" />
```

I'm surprised that the browser sent the preload request before the CSS, but request priority is a really delicate balance between what the browser asks for and what the server chooses to send. Maybe putting the preload later in the source would help, or avoid using the preload at all and instead use an `<img>` to load the image (currently it's a CSS background).

**Update:** Performance expert Andy Davies has encountered this priority issue before too, and [told me why it happens](https://twitter.com/AndyDavies/status/1375398840057102338), and… it's AppCache.

Preload requests always bypass AppCache, but other requests on the page don't. That means the browser sees the preload, and queues it up. Then it sees the more-important CSS request, but it doesn't know if it needs to request it, because it might be handled by AppCache, so it has to check if the site uses AppCache or not. This takes time, and during that time the less-important request goes through.

[Here's the Chrome bug](https://bugs.chromium.org/p/chromium/issues/detail?id=788757), and there's a fix in progress.

## Issue: Unnecessary preloading

You might have spotted an issue in the last section, but if not, Chrome DevTools' console is here to help:

<figure class="full-figure max-figure">
<img style="height: auto;" width="626" height="164" alt="The resource <URL> was preloaded using link preload but not used within a few seconds from the window's load event. Please make sure it has an appropriate `as` value and it is preloaded intentionally." decoding="async" loading="lazy" src="asset-url:./preload-warning.png">
</figure>

Those warnings are triggered by preloads like this:

```html
<link rel="preload" href="alphatauri_desktop.jpg" as="image" />
<link rel="preload" href="alphatauri_tablet.jpg" as="image" />
```

These are images for the main carousel at the top of the page. The developers added these for really sensible reasons; the carousel is created with JavaScript, and it triggers the loading of the images, meaning those images would otherwise start downloading really late. Since these are at the top of the page, it's important that they load early, and preloading solves that.

However, they're preloading the desktop _and_ tablet versions of the image, throwing away the benefit of responsive images.

To avoid this, the preloads could use `media`:

```html
<link
  rel="preload"
  media="(max-width: 399px)"
  href="alphatauri_tablet.jpg"
  as="image"
/>
<link
  rel="preload"
  media="(min-width: 400px)"
  href="alphatauri_desktop.jpg"
  as="image"
/>
```

Or, instead of using JS to load key images, use an `<img>`, which comes with all of the [responsive image](https://jakearchibald.com/2015/anatomy-of-responsive-images/) functionality built-in.

## Issue: Inlined secondary content

The HTML is 213kB, which is pretty big given the content. HTML downloads with really high priority because it contains core content, and tells the browser about other resources that are needed.

<figure class="full-figure max-figure">
<svg viewBox="0 0 486 93">
<foreignObject x="0" y="0" width="486" height="264">
<img width="486" height="264" alt="" decoding="async" loading="lazy" src="asset-url:./alpha-tauri-waterfall.png">
</foreignObject>
</svg>
</figure>

The darker areas of the response in the waterfall represents bytes being received, and as you can see the HTML downloads entirely before other resources start downloading.

I took a look at the source it's littered with large inline SVG, which could be optimised:

<script type="component">{
  "module": "shared/ImageTabs",
  "exportName": "Styles",
  "staticOnly": true
}</script>

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/ImageTabs",
  "props": {
    "ratio": 1.44859335,
    "maxWidth": 150,
    "previewPadding": "20px",
    "images": [
      ["Original SVG (asset-pretty-size-br:./img-optim/tauri-svg.svg)", "asset-url:./img-optim/tauri-svg.svg"],
      ["Optimised SVG (asset-pretty-size-br:./img-optim/tauri-svg-optim.svg)", "asset-url:./img-optim/tauri-svg-optim.svg"],
      ["WebP (asset-pretty-size:./img-optim/tauri-svg.webp)", "asset-url:./img-optim/tauri-svg.webp"]
    ]
  }
}</script>
</figure>

I optimised the SVG using [SVGOMG](https://jakearchibald.github.io/svgomg/), but WebP seems like a better option (which I created using [Squoosh](https://squoosh.app/)).

But the real problem here is that it's inlined. "Inlining" means, rather than have the resource in a separate file, it's including in the HTML. Inlining is great for removing the request/response overhead for blocking or key assets. The downside of inlining is the browser has to download it all before it gets to the next thing in the markup.

In this case, it's a logo that appears far down the page, but it ends up using bandwidth that could be better used for urgent resources like the CSS.

If this was an `<img>`, the browser could be smarter about the priority of the download, and shave off around a second of the time-to-content.

Avoid inlining, unless it's for content that would be render-blocking anyway, or if it's super tiny. If in doubt, profile it!

## Issue: Large primary image

The first image that appears takes up most of the viewport, so it's important to get it in front of the user as soon as possible:

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/ImageTabs",
  "props": {
    "ratio": 1.6,
    "images": [
      ["Original JPEG (asset-pretty-size:./img-optim/gasly.jpg)", "asset-url:./img-optim/gasly.jpg"],
      ["Optimised JPEG (asset-pretty-size:./img-optim/gasly-optim.jpg)", "asset-url:./img-optim/gasly-optim.jpg"],
      ["WebP (asset-pretty-size:./img-optim/gasly.webp)", "asset-url:./img-optim/gasly.webp"],
      ["AVIF (asset-pretty-size:./img-optim/gasly.avif)", "asset-url:./img-optim/gasly.avif"]
    ]
  }
}</script>
</figure>

I'm recompressing the original here, so it's always going to be worse than the original due to generational loss. And remember, when it comes to use-cases like this, we're going for "quick and doesn't look bad" rather than "slow and perfect".

There's a little more smoothing around the arm than I'd usually go for, but on the site it's obscured by text, so it seems fine.

If I was building the site, I think I'd try and separate the picture of Gasly from the blue arrow overlay, and instead recreate that with SVG.

I used [Squoosh](https://squoosh.app/) to compress these images. Browser support for AVIF is limited to Chrome right now, but you can use `<picture>` to allow browsers to select the best format they support.

```html
<picture>
  <source type="image/avif" srcset="img.avif" />
  <img alt="…" src="img.jpg" />
</picture>
```

## How fast could it be?

I wanted to get a feel for how fast these sites could be, so I created optimised versions to compare them to. I didn't have time to completely rebuild 10 sites of course, so I cut some corners. Here's what I did:

- **Snappshotted the DOM after initial JS execution**. Ideally sites should serve something like this, but with elements of interaction removed until the JavaScript can enhance those elements.
- **Inlined required CSS**. I discarded any CSS that wasn't selectable by the page.
- **Removed JavaScript**. A real version of the site would have JavaScript, but it shouldn't impact time-to-content in sites like this.
- **Optimised key images**.

I wrote a [hacky script to automate some of this](https://github.com/jakearchibald/f1-site-optim/blob/main/index.ts). It isn't 100% real, but it gives a fairly accurate feel for how the site could perform:

<figure class="full-figure max-figure video-aspect">
<svg viewBox="0 0 816 592"></svg>
<video src="asset-url:./alpha-tauri-compare.mp4" controls></video>
</figure>
<dl class="perf-summary">
  <dt>Original</dt>
  <dd>
    <div class="perf-data">
      <a href="https://www.scuderiaalphatauri.com/en/">Site</a> (<a href="https://www.webpagetest.org/video/compare.php?tests=210319_XiVM_ef153cba16916a413bccfe35025fbe0d-r%3A1-c%3A0&thumbSize=200&ival=100&end=visual">raw results</a>)
    </div>
  </dd>
  <dt>Optimised</dt>
  <dd><div class="perf-data"><a href="https://f1-performance-demo.netlify.app/alpha-tauri/">Site</a> (<a href="https://www.webpagetest.org/video/compare.php?tests=210319_XiYT_4722276ba66274974bc724670fda554f-r%3A3-c%3A0&thumbSize=200&ival=100&end=visual">raw results</a>)</div></dd>
</dl>

# And that's it for now!

I'm not sure how many parts this series will be. It probably depends on how much there is to write about each site. The next part is definitely just about one team, because there's some very interesting JavaScript stuff going on…

<script type="component">{
  "module": "shared/demos/2021/f1-perf/Parts",
  "staticOnly": true,
  "props": {
    "includeIntro": false,
    "partIndex": 0
  }
}</script>
