---
title: Performance-testing the Google I/O site
date: 2021-04-30 01:00:00
summary: Deep-diving on the load performance of the Google I/O website.
meta: Deep-diving on the load performance of the Google I/O website.
image: 'asset-url:./img.jpg'
---

I've been looking at the performance of F1 websites recently, but before I dig into the last couple of teams, I figured I'd look a little closer to home, and dig into the Google I/O website.

<script type="component">{
  "module": "shared/demos/2021/f1-perf/Parts",
  "staticOnly": true,
  "props": {
    "partIndex": 8
  }
}</script>

At Google I/O our little team is [doing an AMA session](https://events.google.com/io/session/fa14e5ee-a3e2-408c-b0fc-6a8f427411d5?lng=en). We (along with others) built [Squoosh.app](https://squoosh.app/), [PROXX](https://proxx.app/), [Tooling.Report](https://bundlers.tooling.report/), the [Chrome Dev Summit website](https://developer.chrome.com/devsummit/), and we'd love to answer your questions on any of those sites, related technologies, web performance, web standards, etc etc.

We'll be gathering questions closer to the event, but in the meantime, let's take a look at the performance of our [event page](https://events.google.com/io/session/fa14e5ee-a3e2-408c-b0fc-6a8f427411d5?lng=en).

In case you haven't been following the series, I'm going to see how it performs over a 3G connection, on a low-end phone. I covered the reasoning and other details around the scoring in [part 1](/2021/f1-perf-part-1/#methodology).

Anyway, on with the show:

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
    width: auto;
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

# Google I/O event pages

<figure class="full-figure max-figure video-aspect">
<svg viewBox="0 0 408 592"></svg>
<video src="asset-url:./loading.mp4" controls></video>
</figure>
<figure class="full-figure max-figure scrollable-img">
<picture>
  <source type="image/avif" srcset="asset-url:./film.avif">
  <img width="8404" height="236" alt="" decoding="async" loading="lazy" src="asset-url:./film.png">
</picture>
</figure>
<dl class="perf-summary">
  <dt>Link</dt>
  <dd>
    <div class="perf-data">
      <a href="https://events.google.com/io/session/fa14e5ee-a3e2-408c-b0fc-6a8f427411d5?lng=en">Google I/O event page</a>
    </div>
  </dd>
  <dt>First run</dt>
  <dd>
    <div class="perf-data">26.3s (<a href="https://www.webpagetest.org/video/compare.php?tests=210430_AiDcAY_ea8a2dcf8a7d09eae39ad7f9d6dc3cd7-r:3-c:0">raw results</a>)</div>
  </dd>
  <dt>Second run</dt>
  <dd>
    <div class="perf-data">12.9s (<a href="https://www.webpagetest.org/video/compare.php?tests=210430_AiDcAY_ea8a2dcf8a7d09eae39ad7f9d6dc3cd7-r:1-c:1">raw results</a>)</div>
  </dd>
  <dt>Total</dt>
  <dd>
    <div class="perf-data">39.2s</div>
  </dd>
</dl>

There's nothing for around 9.5s, then a spinner. But, as I said when we were digging into the [Alfa Romeo](/2021/f1-perf-part-2/) site, a loading spinner doesn't count as a first content render, it's just an apology for being slow 😀. The content arrives at the 26.3s mark.

It isn't a great result given that the core content is a session title, description, and a few avatars. So, what's going on? In previous parts of the F1 series I've broken the problem down into the various things that have hurt the page's performance, but in this case it's more of a fundamental architecture issue. Let's step through it…

## What's happening?

Here's the waterfall:

<figure class="full-figure max-figure scrollable-img">
<img width="930" height="909" alt="" decoding="async" loading="lazy" src="asset-url:./waterfall.png">
</figure>

I don't have any behind-the-scenes insight into this site, and I wasn't part of the team that built it, so all of the analysis I present here is just from looking at the site through DevTools and WebPageTest.

The source of the page is pretty empty, so what is-and-isn't a render-blocking resource doesn't really matter since there's no content to block. In this case, the content is added later with JavaScript.

Rows 3 and 4 are the main JavaScript resources included in the HTML of the page. It's ~750kB on the wire, which is _a lot_ considering the core content is a title and a paragraph. But that's gzipped. Once it's unzipped, it's 3.2MB of JavaScript for the browser to parse.

You can see the impact of this on the "browser main thread" part of the waterfall around the 7-9s mark, it locks the browser up for a couple of seconds.

Here's Chrome DevTools' coverage analysis:

<figure class="full-figure max-figure">
<img style="height: auto" width="1564" height="209" alt="" decoding="async" loading="lazy" src="asset-url:./coverage.png">
</figure>

This suggests that over 2MB of JavaScript was 'used' here, but that doesn't mean it's necessary. Again, we're talking about a title and a paragraph; we _know_ that doesn't need 2MB of JavaScript to render.

In fact, the large amount of coverage here is a red flag. It means that the JavaScript isn't just being parsed, a lot of it is executing too.

Looking at the source of the script, around half of it looks like Bodymovin instructions. Bodymovin is JSON that expresses animations exported from Adobe After Effects. The page we're looking at doesn't feature any of these animations, so it's all wasted time and effort. It's fine to download things that might be needed later, but in this case it's delaying things that are needed _now_.

Also in the source is a load of text content for other pages, in a multitude of languages. Again, this is a waste of time in terms of performance. The user's preferred language is sent as an HTTP header, so the server can respond with content tailored for that user. Static hosts [such as Netlify](https://docs.netlify.com/routing/redirects/redirect-options/#redirect-by-country-or-language) support this too, so you can make use of this even if your site is static.

We looked at [code splitting in Tooling.Report](https://bundlers.tooling.report/code-splitting/multi-pages/), which is well supported in modern bundlers. These huge scripts need to be split so that each page type has its own entry point, meaning leaf pages like this aren't downloading and processing heavy animations aimed at other pages.

But, the main problem is that the content is dependent on JavaScript. A session title and a description shouldn't require JavaScript to render.

Ok, we're now 9.5s through the page load:

<figure class="full-figure max-figure scrollable-img">
<picture>
  <source type="image/avif" srcset="asset-url:./film.avif">
  <img width="8404" height="236" alt="" decoding="async" loading="lazy" src="asset-url:./film.png">
</picture>
</figure>

<script>
  document.currentScript.previousElementSibling.scrollLeft = 3073;
</script>

This is the point where we get the spinner. Back to the waterfall:

<figure class="full-figure max-figure scrollable-img">
  <svg width="930" viewBox="0 39 930 17">
  <foreignObject width="930" height="909">
  <img width="930" height="909" alt="" decoding="async" loading="lazy" src="asset-url:./waterfall.png">
  </foreignObject>
  </svg>
  <svg width="930" viewBox="0 199 930 186">
  <foreignObject width="930" height="909">
  <img width="930" height="909" alt="" decoding="async" loading="lazy" src="asset-url:./waterfall.png">
  </foreignObject>
  </svg>
</figure>

The JavaScript loaded in the previous step then loads Firebase JavaScript in row 10. This script is on another server, so we pay the price of another HTTP connection. [I covered this in detail in part 1](/2021/f1-perf-part-1/#avoid-blocking-resources-on-other-servers). The performance damage here could be recovered a little using `<link rel="preload">`, but ultimately the real solution is to include the core content in HTML, and avoid blocking it with JavaScript.

That Firebase JavaScript loads more Firebase JavaScript (rows 11-15), and time is lost by loading these in series rather than in parallel. Again, this could be recovered a little with `<link rel="preload">`.

The JavaScript in row 15 appears to be related to getting login info. It's on yet another server, so we pay another connection cost. It goes on to request more JavaScript in row 16, which loads an iframe in row 17, which loads a script (on yet another server) in row 18.

We started loading script at the 2s mark, and we're still loading it at the 16s mark. And we're not done yet.

<figure class="full-figure max-figure scrollable-img">
  <svg width="930" viewBox="0 39 930 17">
  <foreignObject width="930" height="909">
  <img width="930" height="909" alt="" decoding="async" loading="lazy" src="asset-url:./waterfall.png">
  </foreignObject>
  </svg>
  <svg width="930" viewBox="0 520 930 171">
  <foreignObject width="930" height="909">
  <img width="930" height="909" alt="" decoding="async" loading="lazy" src="asset-url:./waterfall.png">
  </foreignObject>
  </svg>
  <svg width="930" viewBox="0 842 930 67">
  <foreignObject width="930" height="909">
  <img width="930" height="909" alt="" decoding="async" loading="lazy" src="asset-url:./waterfall.png">
  </foreignObject>
  </svg>
</figure>

Rows 29, 30, 32, 33 are more requests relating to login info (in this test the user is logged out), and they're happening in series.

Now we're at the 20s mark, and it's time to fetch the data for the page. A request is made to Firestore in row 35, which is on yet another server, so we pay yet another connection cost. A `<link rel="preconnect">` or even `<link rel="preload">` could have helped a bit here.

That request tells the script to make another request, which is row 36. This is a 3MB JSON resource containing information about every session and speaker at Google I/O. Parsing and querying this hits the main thread hard, locking the device up for a couple of seconds.

To make matters worse, this resource is not cacheable. Once you're on the site, all navigations are SPA, but future visits to the site involve downloading and processing that 3MB JSON again, even if you're just wanting to get the time for a single session. Unfortunately, because of the sheer amount of data to query, even the SPA navigations are sluggish on a high-end MacBook.

But that brings us to the 26s mark, where the user can now see the title of the session.

<figure class="full-figure max-figure scrollable-img">
<picture>
  <source type="image/avif" srcset="asset-url:./film.avif">
  <img width="8404" height="236" alt="" decoding="async" loading="lazy" src="asset-url:./film.png">
</picture>
</figure>

<script>
  document.currentScript.previousElementSibling.scrollLeft = Number.MAX_SAFE_INTEGER;
</script>

## What would have been faster?

Imagine you went to a restaurant, took a seat, and 20 minutes later you still haven't been given a menu. You ask where it is, and you're told "oh, we're currently cooking you everything you might possibly ask for. _Then_ we'll give you the menu, you'll pick something, and we'll be able to give you it instantly, because it'll all be ready". This sounds like a silly way to do things, but it's the strategy the I/O site is using.

Instead, sites should focus on the delivering the first interaction first, which in this case is telling the user the title, time, and description of the session. This is easy to do with just HTML and a bit of CSS. It doesn't need JavaScript. It certainly doesn't need 8MB of JavaScript and JSON.

Also, the I/O site makes good use of logged in state, allowing users to mark which sessions they're interested in, however the authentication method is massively hurting performance with a long string of HTTP requests. I don't have experience with Firebase Auth, so I don't know if it's being used properly here, but I know when I built [Big Web Quiz](https://blog.glitch.com/post/run-audience-polls-presentations-and-contests-on-glitch) I was able to get auth info in a single request.

However, Big Web Quiz had its own server, so that might not be possible for the I/O site. If that's the case, the I/O site should render with 'unknown' login state, and the login specific details can load in the background and update the page when it's ready, without blocking things like session info.

## Anything else?

One relatively minor thing:

<figure class="full-figure max-figure scrollable-img">
  <svg width="930" viewBox="0 39 930 17">
  <foreignObject width="930" height="909">
  <img width="930" height="909" alt="" decoding="async" loading="lazy" src="asset-url:./waterfall.png">
  </foreignObject>
  </svg>
  <svg width="930" viewBox="0 114 930 83">
  <foreignObject width="930" height="909">
  <img width="930" height="909" alt="" decoding="async" loading="lazy" src="asset-url:./waterfall.png">
  </foreignObject>
  </svg>
</figure>

Row 6 is an icon font. Icon fonts are bad for the same reasons sprite sheets are bad, and I dug into those on [the McLaren site](/2021/f1-perf-part-8/#issue-sprite-sheets-are-bad-now).

In this case, it only seems to be used for the hamburger icon in the top-left of the page. So the user downloads a 50kB font to display something that's 125 bytes as an SVG.

## How fast could it be?

In other posts in this series I put the site through a script to pull out the JavaScript and render the page as HTML and CSS, but that's just because I don't have time to fully rewrite the sites. However, in this case we can compare it to a [Chrome Dev Summit session page](https://developer.chrome.com/devsummit/sessions/chrome-and-the-web-in-2020/), which has exactly the same type of core content:

<figure class="full-figure max-figure video-aspect">
<svg viewBox="0 0 816 592"></svg>
<video src="asset-url:./compare.mp4" controls></video>
</figure>
<dl class="perf-summary">
  <dt>Google I/O</dt>
  <dd>
    <div class="perf-data">
      <a href="https://events.google.com/io/session/fa14e5ee-a3e2-408c-b0fc-6a8f427411d5?lng=en">Site</a> (<a href="https://events.google.com/io/session/fa14e5ee-a3e2-408c-b0fc-6a8f427411d5?lng=en">raw results</a>)
    </div>
  </dd>
  <dt>Chrome Dev Summit</dt>
  <dd><div class="perf-data"><a href="https://developer.chrome.com/devsummit/sessions/chrome-and-the-web-in-2020/">Site</a> (<a href="https://www.webpagetest.org/video/compare.php?tests=210430_BiDc5F_a790f495d5825141b8f53627e7499ee5-r:1-c:0">raw results</a>)</div></dd>
</dl>

The Chrome Dev Summit site renders session data in two seconds on the same connection & device. The second load is [under one second](https://www.webpagetest.org/video/compare.php?tests=210430_BiDc5F_a790f495d5825141b8f53627e7499ee5-r%3A1-c%3A1&thumbSize=200&ival=100&end=visual) as the site is served offline-first using a service worker.

# Scoreboard

<script type="component">{
  "module": "shared/demos/2021/f1-perf/Scores",
  "staticOnly": true,
  "props": {
    "results": 9
  }
}</script>

Unfortunately the Google I/O site ends up towards the back compared to the F1 sites.

<script type="component">{
  "module": "shared/demos/2021/f1-perf/Parts",
  "staticOnly": true,
  "props": {
    "includeIntro": false,
    "partIndex": 8
  }
}</script>
