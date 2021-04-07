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

# TODO

# Scoreboard

<script type="component">{
  "module": "shared/demos/2021/f1-perf/Scores",
  "staticOnly": true,
  "props": {
    "results": 8
  }
}</script>

TODO

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
