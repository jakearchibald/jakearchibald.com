---
title: Who has the fastest website in F1, in 2021?
date: 2021-03-29 01:00:00
summary: TODO.
meta: TODO.
#image: 'asset-url:./img.png'
---

In 2019 I did a [performance review of F1 websites](/2019/f1-perf/), and it was fun, so I figured I'd do it again. Turns out a lot has changed in the past two years, and well, some things haven't changed.

Not interested in F1? It shouldn't matter. This is just a performance review of 10 recently-built/updated sites that have broadly the same goal, but are built by different teams, and have encountered different performance issues along the way.

# Methodology

I'm sticking to the same method as 2019, so we can compare between the years.

I'm going to put each site through [WebPageTest](https://www.webpagetest.org) to gather the data in Chrome on a Moto G4 with a 3g connection.

## Why test on 3G?

Alex Russell recently did an [analysis of mobile devices and connection speeds](https://infrequently.org/2021/03/the-performance-inequality-gap/) and concluded that 'slow 4g' is a better baseline. However, I'm going to test on 'good 3g' to keep results comparable to the 2019 results.

Besides, I've been to the British Grand Prix, and, well, the Northamptonshire cell towers are ill-equipped to handle 140,000 people at once, and speeds grind to what feels more like 2g. And that's exactly the kind of time and place someone might visit an F1 website.

## Why test on a 5 year old phone?

If you look outside the tech bubble, a lot of users can't or don't want to pay for a high-end phone. To get a feel for how a site performs for real users, you have to look at mid-to-lower-end Android devices. And, unfortunately, new low-end phones perform about the same as a Moto G4.

<figure class="full-figure">
  <picture>
    <source type="image/avif" srcset="asset-url:./images/phone-cpu.avif">
    <img decoding="async" alt="Phone CPU over time. The Moto 4 is similar to the Moto E from 2020" src="asset-url:./images/phone-cpu.png">
  </picture>
  <figcaption>Diagram from <a href="https://infrequently.org/2021/03/the-performance-inequality-gap/">Alex's analysis</a></figcaption>
</figure>

## The score

Each site will get a score which is how long it take to become interactive on a first load, plus the same for a second load (to measure caching efficiency). By "interactive", I mean meaningful content is displayed in a stable way, and the main thread is free enough to react to a tap/click.

There's some subjectivity there, so I'll try and justify things as I go along.

## Issues with the test

I'm not comparing how 'good' the website is in terms of design, features etc etc. In fact, `about:blank` would win this contest. Thankfully no F1 teams have chosen `about:blank` as their website.

I'm only testing Chrome. Sorry. There's only one of me and I get tired. In fact, with 10 sites to get through, it's possible I'll miss something obvious, but I'll post the raw data so feel free to take a look.

Also, and perhaps most importantly, the results aren't a reflection of the abilities of the developers. We don't know how many were on each project, we don't know what their deadline was or any other constraints. My goal here is to show common performance issues that exist on real-world sites.

Ok, that's enough waffle, let's GO, GO, GO!

<style>
  .scrollable-img {
    overflow-x: scroll;
    -webkit-overflow-scrolling: touch;
  }
  .scrollable-img img {
    max-width: none;
  }

  .focus-img {
    overflow: hidden;
    position: relative;
  }
  .focus-img img {
    max-width: none;
    position: relative;
  }
  .focus-img::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0.5;
  }
  .focus-img.grad-both::after {
    background: linear-gradient(#000, transparent 25%, transparent 75%, #000);
  }
  .focus-img.grad-top::after {
    background: linear-gradient(#000, transparent 25%);
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

I'm going to start each team with a summary. Don't worry if you're not sure what some of this means, I'll be diving into the details.

<figure class="full-figure max-figure video-aspect">
<svg viewBox="0 0 408 592"></svg>
<video src="asset-url:./videos/alpha-tauri.mp4" controls></video>
</figure>
<figure class="full-figure max-figure scrollable-img">
<picture>
  <source type="image/avif" srcset="asset-url:./film/alpha-tauri.avif">
  <img width="12481" height="236" alt="" decoding="async" loading="lazy" src="asset-url:./film/alpha-tauri.png">
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
  <dt>First render</dt>
  <dd>
    <img alt="Bad" class="perf-icon" width="36" height="36" src="asset-url:./images/stop.svg">
    <div class="perf-data">Blocked by inefficient CSS and faulty preloads</div>
  </dd>
  <dt>Connection</dt>
  <dd>
    <img alt="Good" class="perf-icon" width="36" height="36" src="asset-url:./images/tick.svg">
    <div class="perf-data">HTTP/2 + SSL</div>
  </dd>
  <dt>Caching</dt>
  <dd>
    <img alt="Good" class="perf-icon" width="36" height="36" src="asset-url:./images/tick.svg">
    <div class="perf-data">Mostly good</div>
  </dd>
  <dt>Compression</dt>
  <dd>
    <img alt="Not great" class="perf-icon" width="36" height="36" src="asset-url:./images/warn.svg">
    <div class="perf-data">Efficient gzip (brotli would save ~33%)</div>
  </dd>
  <dt>Code efficiency</dt>
  <dd>
    <img alt="Bad" class="perf-icon" width="36" height="36" src="asset-url:./images/stop.svg">
    <div class="perf-data">Minified, but CSS 95% unused, JS 60% unused</div>
  </dd>
  <dt>Idle efficiency</dt>
  <dd>
    <img alt="Not great" class="perf-icon" width="36" height="36" src="asset-url:./images/warn.svg">
    <div class="perf-data">Ticks every 100ms</div>
  </dd>
  <dt>Cookie modal</dt>
  <dd>
    <img alt="Bad" class="perf-icon" width="36" height="36" src="asset-url:./images/stop.svg">
    <div class="perf-data">Full-screen and arrives very late</div>
  </dd>
  <dt>Layout stability</dt>
  <dd>
    <img alt="Good" class="perf-icon" width="36" height="36" src="asset-url:./images/tick.svg">
    <div class="perf-data">Stable, aside from late fonts</div>
  </dd>
  <dt>Image efficiency</dt>
  <dd>
    <img alt="Bad" class="perf-icon" width="36" height="36" src="asset-url:./images/stop.svg">
    <div class="perf-data">Poor – important images could be 90% smaller</div>
  </dd>
</dl>

The video above shows how users would experience the site on a low-end phone on a good 3G connection. Alternatively, scroll along the timeline above.

This was a really interesting one to profile. More often than not, poor first-render performance is down to JavaScript in some way, but in this case it looks like someone has done the right thing and avoided JS blocking, but non-JS things have spoiled the performance party. Let's dig in…

I use [Chrome DevTools' "Performance" panel](https://developers.google.com/web/tools/chrome-devtools/evaluate-performance/) during development to measure page performance, and later use [WebPageTest](https://www.webpagetest.org/) to test it on a low-end device. Here's the waterfall from WebPageTest (don't worry if you don't understand it yet):

<figure class="full-figure max-figure scrollable-img">
<picture>
  <source type="image/avif" srcset="asset-url:./waterfall/alpha-tauri.avif">
  <img width="930" height="1353" alt="" decoding="async" loading="lazy" src="asset-url:./waterfall/alpha-tauri.png">
</picture>
</figure>

Since the page renders around the 17s mark, I focus on everything that loads before that:

<figure class="full-figure max-figure">
<svg viewBox="0 0 500 300">
<foreignObject x="0" y="0" width="930" height="1353">
<picture>
  <source type="image/avif" srcset="asset-url:./waterfall/alpha-tauri.avif">
  <img width="930" height="1353" alt="" decoding="async" loading="lazy" src="asset-url:./waterfall/alpha-tauri.png">
</picture>
</foreignObject>
</svg>
</figure>

In rows 1-10 I see:

- HTML, row 1 (213kB gzipped)
- 3 big images, rows 2, 3, 9 (~1MB)
- 4 CSS files, rows 4, 5, 6, 10 (~100kB)
- 2 JS files (~40kB)

It's difficult to tell from our current tooling whether a JS file is contributing to render-blocking, but I looked at the source and it's non-blocking. The rest however…

## Key issue: Blocking resources loaded in sequence

That late-loading CSS on row 10 was a bad smell, so I took a closer look at the request in Chrome DevTools' network panel:

<figure class="full-figure max-figure">
  <img style="height:auto" width="1126" height="150" alt="" decoding="async" loading="lazy" src="asset-url:./images/tauri-devtools.png">
</figure>

And there's the red flag. We have some CSS, a render-blocking resource, which loads more CSS. The HTML contains:

```html
<link rel="stylesheet" href="autoptimize_etcetc.css" />
```

Which contains:

```css
@import url('//hello.myfonts.net/count/3ad3ad');
```

The browser & HTTP/2 is good at loading things in parallel, but it can only load what it knows about. In this case it doesn't know about the above resource until it loads the CSS that contains that line.

This seems like a tracker (the file is empty), probably to verify which sites are using the fonts. Ideally this should be made non-blocking by making it an image request instead. **That would shave around 10 seconds off the time-to-content.** Yep, 60% of the delay is caused by this one thing!

If that isn't possible for whatever reason, break the sequence instead. This could be done by making the request its own `<link rel="stylesheet">` in the HTML. If that isn't possible, it could be preloaded:

```html
<link rel="preload" as="stylesheet" href="//hello.myfonts.net/count/3ad3ad" />
```

**This quick change would shave around 3 seconds off the time-to-content.** That isn't as good as saving the whole 10 seconds of course, because:

## Key issue: Blocking resource on another server

Back in the bad old days of HTTP/1.1 browsers had to set up a new HTTP connection for every in-parallel request, and browsers were limited to between 2-8 connections per server (depending on the browser and the version). This was extremely slow, especially if SSL was involved, since there's a chunk of up-front cost there.

Because this limit was per-server, you could work around the limit by adding more servers.

However, HTTP/2 came along and gave us massive parallelism across a single connection. You only pay the sort of connection setup once… if your resources are on the same server that is.

<figure class="full-figure max-figure">
<svg viewBox="0 37 391 196">
<foreignObject x="0" y="0" width="930" height="1353">
<picture>
  <source type="image/avif" srcset="asset-url:./waterfall/alpha-tauri.avif">
  <img width="930" height="1353" alt="" decoding="async" loading="lazy" src="asset-url:./waterfall/alpha-tauri.png">
</picture>
</foreignObject>
</svg>
</figure>

The requests on rows 1 & 10 have a little extra bit at the start, representing the various bits of connection setup. Row 1 has it because it's the first connection, and row 10 has it because it's to a different server.

That extra connection setup accounts for 5 seconds of blocking time. Using a preload tag would help start this connection earlier, but it can't eliminate the cost.

Unfortunately what was 'best practice' in HTTP/1.1 times became 'worst practice' in HTTP/2 times. As a result, it's important to avoid hosting render-blocking content on other servers.

## Key issue: Late modal

I don't have anything nice to say about 'cookie consent' modals. I think they're doing a huge amount of damage to the web exclusively, when the problems they're trying to solve happen on other platforms. Also, I don't think they solve the problems they're trying to solve. But hey, I'm not a lawyer, so I've mostly ignored them in this test, and haven't factored them into a site's score.

However, throwing up a modal after the user has been using the page for 30 seconds is an awful user experience. The only 'sensible' way to show one of these modals is to use a small-as-you-can-make-it bit of JS at the top of the page, so you can show it before anything else, and the user can get it out of the way early.

## Issue: Bad preloading

There are two images at the top of the waterfall:

<figure class="full-figure max-figure">
<svg viewBox="0 37 391 94">
<foreignObject x="0" y="0" width="930" height="1353">
<picture>
  <source type="image/avif" srcset="asset-url:./waterfall/alpha-tauri.avif">
  <img width="930" height="1353" alt="" decoding="async" loading="lazy" src="asset-url:./waterfall/alpha-tauri.png">
</picture>
</foreignObject>
</svg>
</figure>

I was surprised to see images loading before CSS, but it turns out these are preloaded images:

```html
<link rel="preload" href="alphatauri_desktop.jpg" as="image" />
<link rel="preload" href="alphatauri_tablet.jpg" as="image" />
```

These are images for the main carousel at the top of the page. They added these for really sensible reasons; the carousel is created with JavaScript, and it triggers the loading of the images, meaning those images start downloading really late. Since these are at the top of the page, it's important that they load early, and preloading solves that.

However, they're preloading the desktop _and_ tablet versions of the image, throwing away the benefit of responsive images. The desktop version is a massive 555kB, sucking up bandwidth that should have gone to the CSS.

To avoid this, the preloads should use `media`:

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

That would shave around a second off the time-to-content.

I'm surprised that the browser sent the preload request before the CSS, but request priority is a really delicate balance between what the browser asks for and what the server chooses to send. Maybe putting the preload later in the source would help.

## Issue: Inlined secondary content

The HTML is 213kB, which is pretty big given the content. HTML downloads with really high priority because it contains core content, and tells the browser about other resources that are needed.

<figure class="full-figure max-figure">
<svg viewBox="0 37 391 94">
<foreignObject x="0" y="0" width="930" height="1353">
<picture>
  <source type="image/avif" srcset="asset-url:./waterfall/alpha-tauri.avif">
  <img width="930" height="1353" alt="" decoding="async" loading="lazy" src="asset-url:./waterfall/alpha-tauri.png">
</picture>
</foreignObject>
</svg>
</figure>

The darker areas of the response in the waterfall represents bytes being received, and as you can see the HTML downloads entirely before other resources download.

I took a look at the source it's littered with large inline SVG, which could be optimised:

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
  .image-tabs-transformer {
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

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/demos/2020/avif-has-landed/ImageTabs",
  "props": {
    "ratio": 1.44859335,
    "maxWidth": 150,
    "initial": 2,
    "previewPadding": "20px",
    "images": [
      ["Original SVG (asset-pretty-size-br:./img-optim/tauri-svg.svg)", "asset-url:./img-optim/tauri-svg.svg"],
      ["Optimised SVG (asset-pretty-size-br:./img-optim/tauri-svg-optim.svg)", "asset-url:./img-optim/tauri-svg-optim.svg"],
      ["WebP (asset-pretty-size:./img-optim/tauri-svg.webp)", "asset-url:./img-optim/tauri-svg.webp"]
    ]
  }
}</script>
</figure>

But the real problem here is that it's inlined. Inlining is great for removing the request/response overhead for blocking or key assets. The downside of inlining is the browser has to download it all before it gets to the next thing in the markup.

In this case, it's a logo that appears far down the page, but it ends up using bandwidth that could be better used for urgent resources like the CSS.

If this was an `<img>`, the browser could be smarter about the priority of the download, and shave off around a second of the time-to-content.

Avoid inlining, unless it's for content that would be render-blocking anyway, or if it's super tiny. If in doubt, profile it!

## Issue: Large primary image

The first image that appears takes up most of the viewport, so it's important to get it in front of the user as soon as possible:

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/demos/2020/avif-has-landed/ImageTabs",
  "props": {
    "ratio": 1.6,
    "initial": 2,
    "images": [
      ["Original JPEG (asset-pretty-size:./img-optim/gasly.jpg)", "asset-url:./img-optim/gasly.jpg"],
      ["WebP (asset-pretty-size:./img-optim/gasly.webp)", "asset-url:./img-optim/gasly.webp"],
      ["AVIF (asset-pretty-size:./img-optim/gasly.avif)", "asset-url:./img-optim/gasly.avif"]
    ]
  }
}</script>
</figure>

I'm recompressing the original here, so it's always going to be worse than the original due to generational loss. And remember, when it comes to use-cases like this, we're going for "quick and doesn't look bad" rather than "slow and perfect".

There's a little more smoothing around the arm than I'd usually go for, but on the site it's obscured by text, so it seems fine.

If I was building the site, I think I'd try and separate the picture of Gasly from the blue arrow overlay, and instead recreate that with SVG.

## How fast could it be?

I wanted to get a feel for how fast these sites could be, so I created optimised versions to compare them to. I didn't have time to completely rebuild 10 sites of course, so I cut some corners. Here's what I did:

- **Snappshotted the DOM after initial JS execution**. Ideally sites should serve something like this, but with elements of interaction removed until the JavaScript can enhance those elements.
- **Inlined required CSS**. I discarded any CSS that wasn't selectable by the page.
- **Removed JavaScript**. A real version of the site would have JavaScript, but it shouldn't impact time-to-content in sites like this.
- **Optimised key images**.

I wrote a [hacky script to automate some of this](https://github.com/jakearchibald/f1-site-optim/blob/main/index.ts). It isn't 100% real, but it gives a fairly accurate feel for how the site could perform:

<figure class="full-figure max-figure video-aspect">
<svg viewBox="0 0 816 592"></svg>
<video src="asset-url:./videos/alpha-tauri-compare.mp4" controls></video>
</figure>
<dl class="perf-summary">
  <dt>Links</dt>
  <dd>
    <div class="perf-data">
      <a href="https://www.scuderiaalphatauri.com/en/">Original</a> | <a href="https://f1-performance-demo.netlify.app/alpha-tauri/">Optimised</a>
    </div>
  </dd>
</dl>

Ok, that's Alpha Tauri done. Are you ready for 9 more? They don't all have the same issues…

# Alfa Romeo

<figure class="full-figure max-figure video-aspect">
<svg viewBox="0 0 408 592"></svg>
<video src="asset-url:./videos/alfa-romeo.mp4" controls></video>
</figure>

<figure class="full-figure max-figure scrollable-img">
<picture>
  <source type="image/avif" srcset="asset-url:./film/alfa-romeo.avif">
  <img width="6592" height="236" alt="" decoding="async" loading="lazy" src="asset-url:./film/alfa-romeo.png">
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
  <dt>First render</dt>
  <dd>
    <img alt="Bad" class="perf-icon" width="36" height="36" src="asset-url:./images/stop.svg">
    <div class="perf-data">Manually blocked by low-priority JavaScript</div>
  </dd>
  <dt>Connection</dt>
  <dd>
    <img alt="Good" class="perf-icon" width="36" height="36" src="asset-url:./images/tick.svg">
    <div class="perf-data">HTTP/2 + SSL</div>
  </dd>
  <dt>Caching</dt>
  <dd>
    <img alt="Good" class="perf-icon" width="36" height="36" src="asset-url:./images/tick.svg">
    <div class="perf-data">Some lack of versioning, but otherwise good</div>
  </dd>
  <dt>Compression</dt>
  <dd>
    <img alt="Good" class="perf-icon" width="36" height="36" src="asset-url:./images/tick.svg">
    <div class="perf-data">Efficient gzip (brotli would save ~14%)</div>
  </dd>
  <dt>Code efficiency</dt>
  <dd>
    <img alt="Bad" class="perf-icon" width="36" height="36" src="asset-url:./images/stop.svg">
    <div class="perf-data">Minified, but CSS 87% unused, JS 83% unused</div>
  </dd>
  <dt>Idle efficiency</dt>
  <dd>
    <img alt="Good" class="perf-icon" width="36" height="36" src="asset-url:./images/tick.svg">
    <div class="perf-data">Great! Ticks every 1000ms</div>
  </dd>
  <dt>Cookie modal</dt>
  <dd>
    <img alt="Good" class="perf-icon" width="36" height="36" src="asset-url:./images/tick.svg">
    <div class="perf-data">Small banner arrives with content</div>
  </dd>
  <dt>Layout stability</dt>
  <dd>
    <img alt="Good" class="perf-icon" width="36" height="36" src="asset-url:./images/tick.svg">
    <div class="perf-data">Stable</div>
  </dd>
  <dt>Image efficiency</dt>
  <dd>
    <img alt="Bad" class="perf-icon" width="36" height="36" src="asset-url:./images/stop.svg">
    <div class="perf-data">Poor TODO add detail</div>
  </dd>
</dl>

There's a lot to love about this site from a performance perspective. My favourite thing: No web fonts! A lot of the sites we're looking at here have many big web fonts that cause delayed content and layout shifts, but not here. And, it doesn't feel like it's negatively impacted the design.

Unfortunately it takes 16.1 seconds to get content in front of the user. No, a loading spinner doesn't count. A loading spinner is just an apology for being so slow 😀.

Interestingly the _vast majority_ of the performance loss is down to one easily fixable issue:

## Key issue: Low priority render-blocking JavaScript

Here's the waterfall:

<figure class="full-figure max-figure scrollable-img">
<picture>
  <source type="image/avif" srcset="asset-url:./waterfall/alfa-romeo.avif">
  <img width="930" height="1591" alt="" decoding="async" loading="lazy" src="asset-url:./waterfall/alfa-romeo.png">
</picture>
</figure>

There's some render-blocking JavaScript in the `<head>`, which isn't great, but they're pretty small, and ready after around 5.5 seconds. The real problem is down on row 72; that's another render-blocking script.

The long thin light-yellow bit means the browser knew about the resource for a long, but chose to download other things first. We can confirm that in the network panel of Chrome DevTools:

<figure class="full-figure max-figure">
  <img style="height: auto" width="1462" height="152" alt="" decoding="async" loading="lazy" src="asset-url:./images/romeo-devtools.png">
</figure>

It has a 'low' prioirty, but it's a _render-blocking script_! Why did Chrome choose to download it so late? Well, the browser doesn't know it's render-blocking.

Usually when we talk about render-blocking scripts we mean a script in the `<head>` that:

- Doesn't have `type="module"`
- Doesn't have `async`
- Doesn't have `defer`

If you have one of the above, the script doesn't block the parser, and therefore doesn't block rendering.

However, the script we're talking about sits right at the end of the `<body>`, and it _does_ have `defer`, so the browser assumes it isn't render-blocking and queues it behind the images and other sub-resources.

It's only 'render-blocking' because the site inserts a loading spinner that covers the whole page, and that late-loading script removes it.

The solution: Move that script into the `<head>`. That's it. **That would shave 8 seconds off the time-to-content.**

The browser would still consider it low priority, but it should still queue in front of all those images. If not, a `<link rel="preload" as="script" href="…">` will convince Chrome to raise the priority.

## Issue: Delayed primary image

The site is using some sort of JavaScript polyfill for responsive images, which means it doesn't start downloading until the JavaScript is ready, and as we've seen the JavaScript is massively delayed.

Today, [responsive images are well supported](https://caniuse.com/picture), so there's no reason to use JavaScript for this.

## Issue: Large primary image

It looks like someone really cared about image size when they built this site. However, one image is badly sized and compressed, and unfortunately it's the main one right at the top of the page.

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/demos/2020/avif-has-landed/ImageTabs",
  "props": {
    "ratio": 1.33496732,
    "initial": 3,
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

Here's the site compared to my optimised version:

<figure class="full-figure max-figure video-aspect">
<svg viewBox="0 0 816 592"></svg>
<video src="asset-url:./videos/alfa-romeo-compare.mp4" controls></video>
</figure>
<dl class="perf-summary">
  <dt>Links</dt>
  <dd>
    <div class="perf-data">
      <a href="https://www.sauber-group.com/motorsport/formula-1/">Original</a> | <a href="https://f1-performance-demo.netlify.app/alfa-romeo/">Optimised</a>
    </div>
  </dd>
</dl>

It's a huge difference, but seriously, the current Alfa Romeo site is a couple of small fixes away from winning this contest.

We've got two results now, we should probably get a scoreboard going…

## Scoreboard

<style>
@font-face {
  font-family: 'Titillium Web';
  font-style: normal;
  font-weight: 600;
  font-display: block;
  src: url(https://fonts.gstatic.com/s/titilliumweb/v9/NaPDcZTIAOhVxoMyOr9n_E7ffBzCGIVzY5abuWIGxA.woff2) format('woff2');
}
.f1-scoreboard {
  font-size: 1rem;
  font-weight: 600;
  font-family: 'Titillium Web', sans-serif;
  color: #fff;
  border-collapse: collapse;
  line-height: 1;
  text-align: right;
  counter-reset: pos;
  width: 100%;
  max-width: 404px;
  margin: 1em 0;
}
.f1-scoreboard th {
  background: #000;
  text-align: left;
}
.f1-scoreboard thead th {
  text-align: right;
}
.f1-scoreboard td {
  background: rgba(0, 0, 0, 0.6);
}
.f1-scoreboard td,
.f1-scoreboard th {
  padding: 0.6em 0.6em;
}
.f1-scoreboard .corner-border {
  border-radius: 0 0.3em 0 0;
}
.f1-scoreboard > tbody > tr:last-child > td:last-child {
  border-radius: 0 0 0.3em 0;
}
.f1-scoreboard > tbody tr {
  counter-increment: pos;
}
.f1-scoreboard > tbody tr > th:nth-child(1) {
  padding: 1px 2px;
}
.f1-scoreboard > tbody tr > th:nth-child(1)::before {
  content: counter(pos);
  text-align: center;
  color: #000;
  background: white;
  display: flex;
  height: var(--size);
  --size: 2em;
  width: var(--size);
  align-items: center;
  justify-content: center;
  border-radius: 0 0 0.3em 0;
}
.f1-scoreboard .num-col {
  width: 23%;
}
.f1-scoreboard .team-col {
  width: 31%;
}
.f1-scoreboard .slower {
  background: #ffc800;
  color: #000;
}
.f1-scoreboard .faster {
  background: #45b720;
}
</style>

<table class="f1-scoreboard">
  <thead>
    <tr><th class="pos-col"></th> <th class="team-col"></th> <th class="num-col">Score</th> <th class="corner-border num-col">vs 2019</th> <th style="visibility: hidden" class="num-col"></th></tr>
  </thead>
  <tr><th></th> <th>Alpha Tauri</th> <td>22.1</td> <td class="slower">+9.3</td> <td class="corner-border">Leader</td></tr>
  <tr><th></th> <th>Alfa Romeo</th> <td>23.4</td> <td class="slower">+3.3</td> <td>+1.3</td></tr>
</table>

Alpha Tauri narrowly keeps the lead. Let's see if that continues…

# Red Bull

<figure class="full-figure max-figure video-aspect">
<svg viewBox="0 0 408 592"></svg>
<video src="asset-url:./videos/red-bull.mp4" controls></video>
</figure>

<figure class="full-figure max-figure scrollable-img">
<picture>
  <source type="image/avif" srcset="asset-url:./film/alfa-romeo.avif">
  <img width="6592" height="236" alt="" decoding="async" loading="lazy" src="asset-url:./film/alfa-romeo.png">
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
  <dt>First render</dt>
  <dd>
    <img alt="Bad" class="perf-icon" width="36" height="36" src="asset-url:./images/stop.svg">
    <div class="perf-data">TODO (and everything following)</div>
  </dd>
  <dt>Connection</dt>
  <dd>
    <img alt="Good" class="perf-icon" width="36" height="36" src="asset-url:./images/tick.svg">
    <div class="perf-data">HTTP/2 + SSL</div>
  </dd>
  <dt>Caching</dt>
  <dd>
    <img alt="Good" class="perf-icon" width="36" height="36" src="asset-url:./images/tick.svg">
    <div class="perf-data">Some lack of versioning, but otherwise good</div>
  </dd>
  <dt>Compression</dt>
  <dd>
    <img alt="Good" class="perf-icon" width="36" height="36" src="asset-url:./images/tick.svg">
    <div class="perf-data">Efficient gzip (brotli would save ~14%)</div>
  </dd>
  <dt>Code efficiency</dt>
  <dd>
    <img alt="Bad" class="perf-icon" width="36" height="36" src="asset-url:./images/stop.svg">
    <div class="perf-data">Minified, but CSS 87% unused, JS 83% unused</div>
  </dd>
  <dt>Idle efficiency</dt>
  <dd>
    <img alt="Good" class="perf-icon" width="36" height="36" src="asset-url:./images/tick.svg">
    <div class="perf-data">Great! Ticks every 1000ms</div>
  </dd>
  <dt>Cookie modal</dt>
  <dd>
    <img alt="Good" class="perf-icon" width="36" height="36" src="asset-url:./images/tick.svg">
    <div class="perf-data">Small banner arrives with content</div>
  </dd>
  <dt>Layout stability</dt>
  <dd>
    <img alt="Good" class="perf-icon" width="36" height="36" src="asset-url:./images/tick.svg">
    <div class="perf-data">Stable</div>
  </dd>
  <dt>Image efficiency</dt>
  <dd>
    <img alt="Bad" class="perf-icon" width="36" height="36" src="asset-url:./images/stop.svg">
    <div class="perf-data">Poor TODO add detail</div>
  </dd>
</dl>

# Notes

Solve layout instability on this page - I think it's the videos

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
