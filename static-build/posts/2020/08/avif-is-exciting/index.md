---
title: AVIF is exciting
date: 2020-08-26 01:00:00
summary: TODO
meta: TODO
---

Back in ancient July [I released a talk](https://www.youtube.com/watch?v=F1kYBnY6mwg) that dug into how lossy and lossless image compression works, how to apply this knowledge to compress a set of different images for the web. Well, that's already out of date because since then _AVIF has arrived_.

AVIF is a new image format derived from the key frames of AV1 video. It's an open format, and it's already supported in Chrome 85 on desktop. Android support will be added soon, Firefox is [working on an implementation](https://bugzilla.mozilla.org/show_bug.cgi?id=avif), and although it took Safari 10 years to add WebP support, I don't think we'll see the same delay here, as Apple are part of AOMedia who created AV1.

What I'm saying is, the time to care about AVIF is _now_. You don't need to wait for all browsers to support it – you can use [client hints](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/client-hints) to determine browser support on the server, or use `<picture>` to provide a fallback on the client:

<link href='https://fonts.googleapis.com/css?family=Just+Another+Hand|Inconsolata:700' rel='stylesheet' type='text/css'><style>
  .img-diagram-figure {
    position: relative;
  }
  .img-diagram-figure svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
</style>
<figure class="img-diagram-figure">
  <div style="padding-top:28%"></div>
  <svg class="img-d-4" viewBox="0 0 679 187"><style>.img-d-4 .st0{fill:#5F6464; white-space: pre;} .img-d-4 .st1{font-family:Inconsolata; font-weight: bold;} .img-d-4 .st2{font-size:25.7851px;} .img-d-4 .st3{fill:#C92C2C;} .img-d-4 .st4{fill:#309D47;} .img-d-4 .st5{fill:#1990B8;} .img-d-4 .st6{fill:none;} .img-d-4 .st7{font-family:'Just Another Hand';} .img-d-4 .st8{font-size:41px;} .img-d-4 .st9{fill:none;stroke:#ED1F24;stroke-width:3;stroke-miterlimit:10;} .img-d-4 .st10{fill:#ED1F24;}</style><text transform="matrix(1 -.018 .018 1 3.594 22.076)"><tspan x="0" y="0" class="st0 st1 st2">&lt;</tspan><tspan x="12.9" y="0" class="st3 st1 st2">picture</tspan><tspan x="103.1" y="0" class="st0 st1 st2">&gt;</tspan><tspan x="0" y="30.9" class="st0 st1 st2">  &lt;</tspan><tspan x="38.7" y="30.9" class="st3 st1 st2">source</tspan><tspan x="116" y="30.9" class="st0 st1 st2"> </tspan><tspan x="128.9" y="30.9" class="st4 st1 st2">type</tspan><tspan x="180.5" y="30.9" class="st0 st1 st2">=&quot;</tspan><tspan x="206.3" y="30.9" class="st5 st1 st2">image/avif</tspan><tspan x="335.2" y="30.9" class="st0 st1 st2">&quot;</tspan><tspan x="0" y="61.9" class="st0 st1 st2"> </tspan><tspan x="128.9" y="61.9" class="st4 st1 st2">srcset</tspan><tspan x="206.3" y="61.9" class="st0 st1 st2">=&quot;</tspan><tspan x="232.1" y="61.9" class="st5 st1 st2">snow.avif</tspan><tspan x="348.1" y="61.9" class="st0 st1 st2">&quot;&gt;</tspan><tspan x="0" y="92.8" class="st0 st1 st2">  &lt;</tspan><tspan x="38.7" y="92.8" class="st3 st1 st2">img</tspan><tspan x="77.4" y="92.8" class="st0 st1 st2"> </tspan><tspan x="90.2" y="92.8" class="st4 st1 st2">alt</tspan><tspan x="128.9" y="92.8" class="st0 st1 st2">=&quot;</tspan><tspan x="154.7" y="92.8" class="st5 st1 st2">Hut in the snow</tspan><tspan x="348.1" y="92.8" class="st0 st1 st2">&quot;</tspan><tspan x="0" y="123.8" class="st0 st1 st2"> </tspan><tspan x="90.2" y="123.8" class="st4 st1 st2">src</tspan><tspan x="128.9" y="123.8" class="st0 st1 st2">=&quot;</tspan><tspan x="154.7" y="123.8" class="st5 st1 st2">snow.jpg</tspan><tspan x="257.9" y="123.8" class="st0 st1 st2">&quot;&gt;</tspan><tspan x="0" y="154.7" class="st0 st1 st2">&lt;/</tspan><tspan x="25.8" y="154.7" class="st3 st1 st2">picture</tspan><tspan x="116" y="154.7" class="st0 st1 st2">&gt;</tspan></text><path class="st6" d="M659 110.7l-228.7 2-.8-98 228.6-2z"/><text transform="matrix(1 -.008 .008 1 429.879 49.61)"><tspan x="0" y="0" class="st7 st8">If this type is supported, </tspan><tspan x="0" y="40" class="st7 st8">use this</tspan></text><path class="st9" d="M368.6 40c37.6-2 58-2 58-2"/><path class="st10" d="M374.4 47l-3.4-7 2.8-7.4-16.8 8z"/><path class="st9" d="M395 69.5c33.7-1 34.5 2.8 34.5 2.8"/><path class="st10" d="M401 76.5l-3.5-7 2.8-7.4-16.8 8z"/><text transform="translate(366 141.5)" class="st7 st8">…else this</text><path class="st9" d="M307 133.4c37.3-1.5 55.5.5 55.5.5"/><path class="st10" d="M313 140.6l-3.5-7 2.8-7.4-16.8 7.8z"/></svg>
</figure>

**[Squoosh](https://squoosh.app) now supports AVIF**, which is how I compressed the examples in this post.

Ok, let's take a look at how AVIF compares to other web image formats…

<style>
  .image-tabs-preview {
    overflow: hidden;
  }
  .image-tabs-transformer {
    display: grid;
    align-items: end;
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
    display: none;
  }
  .image-tabs-label {
    padding: 0.7em 0.7em;
    text-align: center;
    cursor: pointer;
    line-height: 1.3;
    font-size: 0.9rem;
  }
  .image-tabs input[type=radio]:checked + .image-tabs-label {
    background: #ffe454;
  }
  .image-tabs-tab {
    display: grid;
  }
</style>

# F1 photo

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/demos/2020/avif-is-exciting/ImageTabs",
  "props": {
    "ratio": 1.777,
    "maxWidth": 960,
    "initial": 3,
    "images": [
      ["Original", "asset-url:static-build/posts/2020/08/avif-is-exciting/demos/f1-near-lossless.avif"],
      ["JPEG (asset-pretty-size:static-build/posts/2020/08/avif-is-exciting/demos/f1-good.jpg)", "asset-url:static-build/posts/2020/08/avif-is-exciting/demos/f1-good.jpg"],
      ["WebP (asset-pretty-size:static-build/posts/2020/08/avif-is-exciting/demos/f1-good.webp)", "asset-url:static-build/posts/2020/08/avif-is-exciting/demos/f1-good.webp"],
      ["AVIF (asset-pretty-size:static-build/posts/2020/08/avif-is-exciting/demos/f1-good.avif)", "asset-url:static-build/posts/2020/08/avif-is-exciting/demos/f1-good.avif"]
    ]
  }
}</script>
</figure>

I picked this image because it's a photo with a mixture of low frequency detail (the road) and high frequency detail (parts of the car livery). Also, there are some pretty sharp changes of colour. And I like F1.

Roughly speaking, at an acceptable quality the WebP is almost half the size of JPEG, and AVIF is under half the size of WebP. I find it incredible that AVIF can do a good job of the image in just 18k.

[Here's a full-page comparison of the image](/2020/avif-is-exciting/demos/compare/?show=f1).

Before I compare things further:

## What is 'acceptable quality'?

For the majority of images on the web, my rules are:

- If a user looks at the image in its context within the page, and it strikes them as ugly due to compression, that level of compression is not acceptable. _But_, one tiny notch above that boundary is fine.
- It's ok for the image to lose noticeable detail compared to the original, _unless_ that detail is significant in the context of the image.

Context is key here. Image compression should be judged at the size it'll be presented to the user, and in a similar context. If you're presenting a picture as a piece of art to be examined, quality and detail preservation become more important, but these are edge cases.

Most images I see on the web are much higher quality than they need to be, which results in a slower experience for users. I'm generally impressed by [The Guardian](https://www.theguardian.com/)'s use of images. Take [this article](https://www.theguardian.com/world/2020/aug/28/ireland-pubs-to-remain-shut-coronavirus-cases-rise). If I open the article image in a new tab and zoom it in, I can see the distinctive WebP artefacts. The street has been smoothed. There's some ringing around the graffiti. But when I'm looking at it within the article, in the size and context it's presented, I just see someone cycling past a closed pub, which is the intent of the image, and the small resource size means I saw that image quickly. We shouldn't optimise the user experience for people who might zoom in looking for flaws.

In this article, I'm optimising images as if they were appearing in an article, where their CSS width is around 50% of their pixel width, meaning they're optimised for high-density displays.

**These are _my_ reckons**. In this article I'm comparing the images using the human balls of eye I keep safely inside my skull. I'm providing the full output for each image so you can make your own judgement, and you can try with your own images using [Squoosh](https://squoosh.app).

I also realise that you can't manually tune every image. If you need to automate image compression, you can figure out the settings manually from a few representative images, then add a bit of extra quality for safety, and use those settings in an automated tool.

_\*cough\*_ Sorry about all that. Just trying to get ahead of the "what if"s, "how about"s, and "well actually"s.

## Back to the F1 image

Let's take a closer look and see how the codecs work:

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/demos/2020/avif-is-exciting/ImageTabs",
  "props": {
    "ratio": 1.777,
    "maxWidth": 960,
    "initial": 3,
    "transform": "scale(6.5) translate(-9.6%, 8.9%)",
    "images": [
      ["Original", "asset-url:static-build/posts/2020/08/avif-is-exciting/demos/f1-near-lossless.avif"],
      ["JPEG (asset-pretty-size:static-build/posts/2020/08/avif-is-exciting/demos/f1-good.jpg)", "asset-url:static-build/posts/2020/08/avif-is-exciting/demos/f1-good.jpg"],
      ["WebP (asset-pretty-size:static-build/posts/2020/08/avif-is-exciting/demos/f1-good.webp)", "asset-url:static-build/posts/2020/08/avif-is-exciting/demos/f1-good.webp"],
      ["AVIF (asset-pretty-size:static-build/posts/2020/08/avif-is-exciting/demos/f1-good.avif)", "asset-url:static-build/posts/2020/08/avif-is-exciting/demos/f1-good.avif"]
    ]
  }
}</script>
</figure>

If you're interested in how lossy codecs work, [check out my talk starting at 4:44](https://youtu.be/F1kYBnY6mwg?t=284).

The fine detail of the road is lost, which I'm ok with. In the JPEG you can see the individual 8x8 blocks of the DCT. WebP avoids this using decoding filters, and well, just generally being better. AVIF applies a lot of smoothing, but there are very few artefacts (or maybe I'm just not attuned to them yet).

If you're thinking "wait, what's he talking about? The AVIF is really blocky around the red/blue", well, chances are you're looking at it in Chrome 85. There's a bug in the decoder when it comes to upscaling the colour detail. This is mostly fixed in 86, although there are [some edge cases where it still happens](https://bugs.chromium.org/p/chromium/issues/detail?id=1121579).

Just for fun, let's see how the other image formats compare around the same file size as the AVIF:

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/demos/2020/avif-is-exciting/ImageTabs",
  "props": {
    "ratio": 1.777,
    "maxWidth": 960,
    "initial": 3,
    "images": [
      ["Original", "asset-url:static-build/posts/2020/08/avif-is-exciting/demos/f1-near-lossless.avif"],
      ["JPEG (asset-pretty-size:static-build/posts/2020/08/avif-is-exciting/demos/f1-match.jpg)", "asset-url:static-build/posts/2020/08/avif-is-exciting/demos/f1-match.jpg"],
      ["WebP (asset-pretty-size:static-build/posts/2020/08/avif-is-exciting/demos/f1-match.webp)", "asset-url:static-build/posts/2020/08/avif-is-exciting/demos/f1-match.webp"],
      ["AVIF (asset-pretty-size:static-build/posts/2020/08/avif-is-exciting/demos/f1-good.avif)", "asset-url:static-build/posts/2020/08/avif-is-exciting/demos/f1-good.avif"]
    ]
  }
}</script>
</figure>

I couldn't even get the JPEG and WebP down to 18k, even at lowest settings. The JPEG suffers from awful banding, which started to appear as soon as I went below 74k. The WebP is much better, but there's still noticeable blockiness. I guess that's what a decade or two's progress looks like.

Ok, next image:

# Team illustration

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/demos/2020/avif-is-exciting/ImageTabs",
  "props": {
    "ratio": 1.333,
    "maxWidth": 400,
    "initial": 2,
    "images": [
      ["Original", "asset-url:static-build/posts/2020/08/avif-is-exciting/demos/team-lossless.webp"],
      ["PNG 68 colour (asset-pretty-size:static-build/posts/2020/08/avif-is-exciting/demos/team-good.png)", "asset-url:static-build/posts/2020/08/avif-is-exciting/demos/team-good.png"],
      ["WebP 68 colour (asset-pretty-size:static-build/posts/2020/08/avif-is-exciting/demos/team-good.webp)", "asset-url:static-build/posts/2020/08/avif-is-exciting/demos/team-good.webp"],
      ["AVIF 68 colour (asset-pretty-size:static-build/posts/2020/08/avif-is-exciting/demos/team-lossless.avif)", "asset-url:static-build/posts/2020/08/avif-is-exciting/demos/team-lossless.avif"]
    ]
  }
}</script>
</figure>

- Title: Compressing web images in an AVIF world

- AVIF landed in Squoosh
- You've heard it's good, but how good?
  - New format from video file, often think good at high bitrate, but not
  - Hand-me-down
- Intro talk
  - Head off the "well actually"s because we can't have nice things - no do this stuff after the first image, but before the zoom in
  - This post is about web images - acceptable quality, not perfect quality, also designed for retina
  - Also my reckons, your reckons may be different
  - Also hand-tuned, which doesn't work in all cases
- Go through each image in the talk
- F1 - picked due to photograph with strong colour boundaries
- Characters - picked due to sharp edges
  - Not good at lossless, but lossy is really good
  - 4:4:4 - and Chroma subsampling
- Then I threw a spanner in the works.
- Car SVG - picked due to heavy SVG and alpha
  - Lossy alpha
- Elfs - picked due to cartoon with gradients
- Using AVIF in Squoosh
  - Min - only change if looking too smooth in some areas
  - Sep alpha - change if colour looks fine but alpha doesn't - did this with car
  - Effort - yes but slow
- Gotcha: progressive rendering
  - Show demo
  - Hand-me-down
- Future work on AVIF in Squoosh
  - Performance
  - Features 4:2:0 and 4:0:0

Quote kornel's oscar speech - bad a micro sizes
Using it in browsers today - right at the start
That JPEG-XL article
WebPv2
That issue where they say no to progressive rendering.
Guardian image https://i.guim.co.uk/img/media/060d0026bff97104b362536449932910382919c7/0_0_3500_2330/master/3500.jpg?width=1010&quality=45&auto=format&fit=max&dpr=2&s=23c15b9efd8845e550ba046333b62ce7
Part of my pitch for squoosh was to not believe codec claims
Mention subsample rendering issue with JPEG.
AVIF - what about CPU?
With the team image, compare to SVG
Solve double preloads
Lazy load the images if intersection available!
Test in other browsers

That said, I was a initially sceptical of AVIF – I don't like the idea that the web has to pick up the scraps left by video formats. It can result in missing features or missed optimisations that video doesn't care about, but the web does (more on that later). But having played with it, I'm seriously impressed. It feels like a game-changer.
