---
title: Who has the fastest website in F1, in 2021? Part 3
date: 2021-03-29 01:00:00
summary: TODO.
meta: TODO.
#image: 'asset-url:./img.png'
---

TODO this is part 3, link to other parts.

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

<style>
@font-face {
  font-family: 'Titillium Web';
  font-style: normal;
  font-weight: 600;
  src: url(https://fonts.gstatic.com/s/titilliumweb/v9/NaPDcZTIAOhVxoMyOr9n_E7ffBzCGItzY5abuWI.woff2) format('woff2');
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
  max-width: 420px;
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
.f1-scoreboard .team {
  display: grid;
  grid-template-columns: 4px auto;
  gap: 0.4em;
}
.f1-scoreboard .team::before {
  content: '';
  background: var(--team-color);
}
</style>

<script>
  // haha this is so hacky
  function updateScoreboardGaps(table) {
    const rows = [...table.querySelectorAll('tbody > tr')];
    const mainTime = Number(rows[0].querySelector('td').textContent);
    for (const row of rows.slice(1)) {
      const time = Number(row.children[2].textContent);
      row.children[4].textContent = '+' + (time - mainTime).toFixed(1);
    }
  }
</script>

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

Now we're talking! This is a graphically rich, engaging site, and the performance is pretty good! But there's still room for improvement.

## Possible improvements

- **3 second delay to content-render** caused by unnecessary inlining. Covered in detail below.
- **10 second delay to main image** caused by JavaScript responsive images implementation. Fixed by using [real responsive images](/2015/anatomy-of-responsive-images/).
- **Additional 2 second delay to main image** caused by extra connection. Why is this is problem is [covered in part 1](/2021/f1-perf-part-1/#avoid-blocking-resources-on-other-servers), but the solution here is just to move the images to the same server.
- **Additional 2 second delay to main image** caused by poor optimisation. Covered in detail below.
- **40 second delay to key image** caused by loading it with JavaScript. Covered in detail below.
- **Additional 30 second delay to that image** caused by poor optimisation. Covered in detail below.
- **2 second delay to fonts** caused by extra connection. Again, this is [covered in part 1](/2021/f1-perf-part-1/#avoid-blocking-resources-on-other-servers), but the solution here is just to move the fonts to the same server.
- **40+ second delay to content-blocking cookie modal** caused by… a number of things, [covered in part 1](/2021/f1-perf-part-1/#key-issue-late-modal).

Remember these delays overlap in some cases. Here's the first bit of the timeline:

<figure class="full-figure max-figure">
<img width="440" height="180" alt="" decoding="async" loading="lazy" src="asset-url:./red-bull-waterfall.png" style="width: 100%; height: auto;">
</figure>

This shows that we get our content-render while the browser is still downloading the HTML, meaning there are _no_ blocking resources. This suggests the CSS is inlined, and from looking at the source, yep, it is.

There are some issues that I've already covered looking at other sites:

- [Key issue: Late modal](#key-issue-late-modal): There's a full-screen modal that lands after almost a minute.
- [Issue: Fonts on another server](#key-issue-blocking-resource-on-another-server): This delays the fonts load by a couple of seconds. A few preload tags would help here too.

And some stuff that's worth looking at in more detail:

## Issue: Unnecessary inlining

Inlining avoids request/response overhead, which is great for render-blocking resources. But also, since it's part of the _page_, you can tailor the inlining for _that page_.

However, that doesn't seem to be what's happening here. Here's what I see in [Chrome DevTools' coverage panel](https://developers.google.com/web/tools/chrome-devtools/coverage):

<figure class="full-figure max-figure">
<img width="1472" height="93" alt="" decoding="async" loading="lazy" src="asset-url:./red-bull-coverage.png" style="width: 100%; height: auto;">
</figure>

The code in the page is 79.5% unused, which amounts to over 600kB. Compare this to the coverage on [Squoosh](https://squoosh.app/):

<figure class="full-figure max-figure">
<img width="1494" height="166" alt="" decoding="async" loading="lazy" src="asset-url:./squoosh-coverage.png" style="width: 100%; height: auto;">
</figure>

…where we used inline content just for the CSS and script needed for the first interaction. The first row there is a non-blocking resource, where coverage doesn't matter, but the bottom row is the page, where only 7kB is unused.

Around three seconds could be shaved off time-to-content on the Red Bull site by making the inlined code tailored to what the page needs for that content-render. The rest can be loaded via external resources.

## Issue: Large primary image

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/demos/2020/avif-has-landed/ImageTabs",
  "props": {
    "ratio": 0.5,
    "initial": 2,
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
  "module": "shared/demos/2020/avif-has-landed/ImageTabs",
  "props": {
    "ratio": 1.395348837,
    "initial": 3,
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

This image sits over the top of the main carousel, and it's a great bit of the design. Again, they're using WebP, but maybe not with the right settings. But even with optimised settings, the WebP is still big.

This is because WebP's alpha channel compression is lossless, whereas AVIF's alpha compression is lossy, so it performs much better here.

It's still pretty pretty large though, so I'd consider using a scaled-down version for mobile devices.

## Issue: Overlay image loaded with JavaScript

That overlay image doesn't start loading until the user has been on the site for over 50 seconds. This is because the image is a CSS background, on an element that's added with JavaScript.

I would switch this for an `<img>` so [responsive images](/2015/anatomy-of-responsive-images/) could be used to select the best format for the job. This will trigger the download much earlier.

There's a risk that the massive WebP version could end up taking bandwidth from more important things. If this happened, I'd use preloads to bump the priority of more-important content.

## Issue: Large inlined blurry image

The performance issues the Red Bull site has with images are pretty well disguised using a low-quality inlined image, but with a `blur(7px)` effect.

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/demos/2020/avif-has-landed/ImageTabs",
  "props": {
    "ratio": 0.5,
    "initial": 2,
    "maxWidth": 360,
    "images": [
      ["Full AVIF (asset-pretty-size:./img-optim/red-bull-main.avif)", "asset-url:./img-optim/red-bull-main.avif"],
      ["Original JPEG, blurred (asset-pretty-size:./img-optim/red-bull-blur.jpg)", "asset-url:./img-optim/red-bull-blur.jpg", { "backdropFilter": "blur(7px)" }],
      ["AVIF, blurred (asset-pretty-size:./img-optim/red-bull-blur.avif)", "asset-url:./img-optim/red-bull-blur.avif", { "backdropFilter": "blur(6px)" }],
      ["WebP, blurred (asset-pretty-size:./img-optim/red-bull-blur.webp)", "asset-url:./img-optim/red-bull-blur.webp", { "backdropFilter": "blur(8px)" }]
    ]
  }
}</script>
</figure>

Unfortunately the image they use isn't an accurate preview of the image being loaded, as it's cropped incorrectly, so there's a jump when the final version loads.

However, I really like this method, as it provides more structure than something like a [BlurHash](https://blurha.sh/), but it does use more bytes.

Their blurred images are 6kB each, which is quite a lot to inline. AVIF allows you to get under 1kB and still preserve a lot of structure, meaning you don't need to blur as much. However, AVIF has around 500B of headers, so it can't be much smaller. WebP on the other hand can go much smaller, but looks worse, and suffers some discolouration due to how WebP encodes its colour data, so it needs more blurring to compensate.

I'm not sure which is best. You decide.

## How fast could it be?

The Reb Bull site is pretty good, but how fast would it be if they cut their inlining down to the essentials, and optimised those images? Well…

<figure class="full-figure max-figure video-aspect">
<svg viewBox="0 0 816 592"></svg>
<video src="asset-url:./red-bull-compare.mp4" controls></video>
</figure>
<dl class="perf-summary">
  <dt>Links</dt>
  <dd>
    <div class="perf-data">
      <a href="https://www.redbull.com/int-en/redbullracing">Original</a> | <a href="https://f1-performance-demo.netlify.app/red-bull/">Optimised</a>
    </div>
  </dd>
</dl>

Not as big a difference as with previous sites, but still worth doing.

# And that's it for now!

Here are the scores so far:

<table class="f1-scoreboard">
  <thead>
    <tr><th class="pos-col"></th> <th class="team-col"></th> <th class="num-col">Score</th> <th class="corner-border num-col">vs 2019</th> <th style="visibility: hidden" class="num-col"></th></tr>
  </thead>
  <tr><th></th> <th><span class="team" style="--team-color: #0600ef">Red Bull</span></th> <td>8.6</td> <td class="faster">-7.2</td> <td class="corner-border">Leader</td></tr>
  <tr><th></th> <th><span class="team" style="--team-color: #2b4562">Alpha Tauri</span></th> <td>22.1</td> <td class="slower">+9.3</td> <td></td></tr>
  <tr><th></th> <th><span class="team" style="--team-color: #900000">Alfa Romeo</span></th> <td>23.4</td> <td class="slower">+3.3</td> <td></td></tr>
</table>

<script>
  updateScoreboardGaps(document.currentScript.previousElementSibling);
</script>

Red Bull _leaps_ into first place, but will they stay there? Find out in part 3.
