---
title: AVIF is exciting
date: 2020-09-07 01:00:00
summary: AVIF has already landed in Chrome 85. It's the first image format we've had in 10 years. Let's see how it performs…
meta: AVIF is the first browser image format we've had in 10 years. Let's see how it performs…
image: 'asset-url:./post.jpg'
---

Back in ancient July [I released a talk](https://www.youtube.com/watch?v=F1kYBnY6mwg) that dug into how lossy and lossless image compression works and how to apply that knowledge to compress a set of different images for the web. Well, that's already out of date because _AVIF has arrived_. Brilliant.

AVIF is a new image format derived from the keyframes of AV1 video. It's an open format, and it's already supported in Chrome 85 on desktop. Android support will be added soon, Firefox is [working on an implementation](https://bugzilla.mozilla.org/show_bug.cgi?id=avif), and although it took Safari 10 years to add WebP support, I don't think we'll see the same delay here, as Apple are a member of the group that created AV1.

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

Also, **[Squoosh](https://squoosh.app) now supports AVIF**, which is how I compressed the examples in this post.

Let's take a look at how AVIF performs against the image formats we already know and love…

<style>
  .image-tabs-preview {
    overflow: hidden;
    background: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2 2"><path d="M1 2V0h1v1H0v1z" fill-opacity=".025"/></svg>');
    background-size: 20px 20px;
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
      ["Original", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/f1-near-lossless.avif"],
      ["JPEG (asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/f1-good.jpg)", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/f1-good.jpg"],
      ["WebP (asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/f1-good.webp)", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/f1-good.webp"],
      ["AVIF (asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/f1-good.avif)", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/f1-good.avif"]
    ]
  }
}</script>
</figure>

I picked this image because it's a photo with a mixture of low frequency detail (the road) and high frequency detail (parts of the car livery). Also, there are some pretty sharp changes of colour between the red and blue. And I like F1.

Roughly speaking, at an acceptable quality, the WebP is almost half the size of JPEG, and AVIF is under half the size of WebP. I find it incredible that AVIF can do a good job of the image in just 18 kB.

Before I compare things further:

## What is 'acceptable quality'?

For the majority of images on the web, my rules are:

- If a user looks at the image in the context of the page, and it strikes them as ugly due to compression, then that level of compression is not acceptable. _But_, one tiny notch above that boundary is fine.
- It's ok for the image to lose noticeable detail compared to the original, _unless_ that detail is significant in the context of the image.

Context is key here. Image compression should be judged at the size it'll be presented to the user, and in a similar context. If you're presenting a picture as a piece of art to be examined, quality and detail preservation become more important, but that's an edge case.

Most images I see on the web are a much higher quality than they need to be, which results in a slower experience for users. I'm generally impressed by [The Guardian](https://www.theguardian.com/)'s use of images. Take [this article](https://www.theguardian.com/world/2020/aug/28/ireland-pubs-to-remain-shut-coronavirus-cases-rise). If I open the article image in a new tab and zoom in, I can see the distinctive WebP artefacts. The street has been smoothed. There's some ringing around the graffiti. But when I'm looking at it within the article, in the size and context it's presented, I just see someone cycling past a closed pub, which is the intent of the image, and the small resource size means I saw that image quickly. We shouldn't optimise the user experience for people who might zoom in looking for flaws.

In this article, I'm optimising images as if they were appearing in an article, where their CSS width is around 50% of their pixel width, meaning they're optimised for high-density displays.

**These are _my_ reckons**. In this article I'm comparing the images using the human balls of eye I keep safely inside my skull, rather than any kind of algorithm that tries to guess how humans perceive images. I'm providing the full output for each image so you can make your own judgement, and you can try with your own images using [Squoosh](https://squoosh.app).

I also realise that manually tuning codec settings per image doesn't scale. If you need to automate image compression, you can figure out the settings manually from a few representative images, then add a bit of extra quality for safety, and use those settings in an automated tool.

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
      ["Original", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/f1-near-lossless.avif"],
      ["JPEG (asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/f1-good.jpg)", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/f1-good.jpg"],
      ["WebP (asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/f1-good.webp)", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/f1-good.webp"],
      ["AVIF (asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/f1-good.avif)", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/f1-good.avif"]
    ]
  }
}</script>
</figure>

If you're interested in how lossy codecs work, [check out my talk starting at 4:44](https://youtu.be/F1kYBnY6mwg?t=284).

The fine detail of the road is lost in all of the compressed versions, which I'm ok with. In the JPEG version you can see the individual 8x8 blocks of the DCT, thankfully they aren't obvious when zoomed out. WebP avoids this blockiness using decoding filters, and by, well, just being better. AVIF applies a lot of smoothing, but there are very few artefacts (or maybe I'm just not attuned to them).

If you're thinking "wait, what's he talking about? The AVIF is really blocky around the red/blue", well, chances are you're looking at it in Chrome 85. There's a bug in the decoder when it comes to upscaling the colour detail. This is mostly fixed in 86, although there are [some edge cases where it still happens](https://bugs.chromium.org/p/chromium/issues/detail?id=1121579).

## At the same size

Just for fun, let's see how the other image formats compare around the same file size as the AVIF:

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/demos/2020/avif-is-exciting/ImageTabs",
  "props": {
    "ratio": 1.777,
    "maxWidth": 960,
    "initial": 1,
    "images": [
      ["Original", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/f1-near-lossless.avif"],
      ["JPEG (asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/f1-match.jpg)", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/f1-match.jpg"],
      ["WebP (asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/f1-match.webp)", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/f1-match.webp"],
      ["AVIF (asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/f1-good.avif)", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/f1-good.avif"]
    ]
  }
}</script>
</figure>

I couldn't even get the JPEG and WebP down to 18 kB, even at lowest settings. The JPEG suffers from awful banding, which started to appear as soon as I went below 74 kB. The WebP is much better, but there's still noticeable blockiness. I guess that's what a decade or two's progress looks like.

## Conclusion

Unless it's automated, offering up 3 versions of the same image is a bit of a pain, but the saving here are pretty significant, so it seems worth it, especially given the number of users that can already benefit from AVIF.

[Here's a full-page comparison of the results](/2020/avif-is-exciting/demos/compare/?show=f1).

Ok, next image:

# Flat illustration

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/demos/2020/avif-is-exciting/ImageTabs",
  "props": {
    "ratio": 1.333,
    "maxWidth": 400,
    "initial": 3,
    "images": [
      ["Original", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/team-lossless.webp"],
      ["Traced SVG (asset-pretty-size-br:static-build/posts/2020/09/avif-is-exciting/demos/team-traced.svg)", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/team-traced.svg"],
      ["PNG 68 colour (asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/team-good.png)", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/team-good.png"],
      ["WebP 68 colour lossless (asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/team-good.webp)", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/team-good.webp"],
      ["AVIF 68 colour lossless (asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/team-lossless.avif)", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/team-lossless.avif"]
    ]
  }
}</script>
</figure>

This is an illustration by [Stephen Waller](https://twitter.com/bruised_blood). I picked it because of the sharp edges and solid colours, so it's a good test of lossless compression.

In the same way AVIF is derived from the keyframes of AV1 video, WebP's lossy compression is based on the keyframes of VP8 video. However, _lossless_ WebP is a different codec, written from scratch. It's often overlooked, but it outperforms PNG every time.

Both WebP lossless and PNG switch to 'paletted' mode when there are 256 colours or fewer, which compresses really well. I was able to reduce the colours to 68 before things started looking bad.

I don't have the original vector version of this image, but I created a 'traced' SVG version using Adobe Illustrator.

What's notable is how badly AVIF performs here. It does have a specific lossless mode, but it isn't very good.

But wait…

## Why not lossy?

I went straight for palette reduction and lossless compression with this image because experience has taught me lossy compression _always_ does a bad job on these kinds of images. Or so I thought…

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/demos/2020/avif-is-exciting/ImageTabs",
  "props": {
    "ratio": 1.333,
    "maxWidth": 400,
    "initial": 4,
    "images": [
      ["Original", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/team-lossless.webp"],
      ["Traced SVG (asset-pretty-size-br:static-build/posts/2020/09/avif-is-exciting/demos/team-traced.svg)", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/team-traced.svg"],
      ["PNG 68 colour (asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/team-good.png)", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/team-good.png"],
      ["WebP 68 colour lossless (asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/team-good.webp)", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/team-good.webp"],
      ["AVIF (asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/team-good.avif)", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/team-good.avif"]
    ]
  }
}</script>
</figure>

Turns out lossy AVIF can handle solid colour and sharp lines really well, and produces a file quite a bit smaller than the SVG.

## A closer look

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/demos/2020/avif-is-exciting/ImageTabs",
  "props": {
    "ratio": 1.333,
    "maxWidth": 1000,
    "transform": "translate(-1%, 59%) scale(2.5)",
    "initial": 4,
    "images": [
      ["Original", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/team-lossless.webp"],
      ["Traced SVG (asset-pretty-size-br:static-build/posts/2020/09/avif-is-exciting/demos/team-traced.svg)", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/team-traced.svg"],
      ["PNG 68 colour (asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/team-good.png)", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/team-good.png"],
      ["WebP 68 colour lossless (asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/team-good.webp)", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/team-good.webp"],
      ["AVIF (asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/team-good.avif)", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/team-good.avif"]
    ]
  }
}</script>
</figure>

I expected a lossy codec to produce a lot of smoothing, but there's hardly any. There's a very slight bit above the glasses of the guy on the left, and on the ear of the guy on the right. If anything, AVIF has introduced some sharpening – see the left-hand side of the glasses. That kind of sharpening is usually produced by palette reduction, but here it's just how AVIF works.

The PNG and WebP have sharp edges particularly around the green shirt due to the palette reduction, but it isn't really noticeable at normal size.

Of course, the SVG looks super sharp due to vector scaling, but you can see where the tracing lost details around the hair and pocket.

## At the same size

Again, just for fun (no, seriously, I find this fun), let's push the other codecs down to the size of the AVIF:

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/demos/2020/avif-is-exciting/ImageTabs",
  "props": {
    "ratio": 1.333,
    "maxWidth": 400,
    "initial": 1,
    "images": [
      ["Original", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/team-lossless.webp"],
      ["JPEG (asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/team-match.jpg)", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/team-match.jpg"],
      ["PNG 8 colour (asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/team-match.png)", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/team-match.png"],
      ["WebP lossy (asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/team-match.webp)", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/team-match.webp"],
      ["AVIF (asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/team-good.avif)", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/team-good.avif"]
    ]
  }
}</script>
</figure>

Things aren't as bad as they were with the F1 image, but the JPEG is very noisy, the WebP is very blurry, and the PNG shows that, well, you need more than 8 colours.

## Conclusion

AVIF has kinda blown my mind here. It's made me reconsider the kinds of images lossy codecs are suited to.

But all said and done, a proper SVG is probably right choice here. But even if SVG couldn't be used, the difference between the PNG and AVIF is only a few kB. In this case it might not be worth the complexity of creating different versions of the image.

[Here's a full-page comparison of the results](/2020/avif-is-exciting/demos/compare/?show=team).

Right, it's time for the next image…

# Heavy SVG

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/demos/2020/avif-is-exciting/ImageTabs",
  "props": {
    "ratio": 1.5,
    "maxWidth": 500,
    "initial": 4,
    "images": [
      ["Original SVG (asset-pretty-size-br:static-build/posts/2020/09/avif-is-exciting/demos/car-original.svg)", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/car-original.svg"],
      ["Optimised SVG (asset-pretty-size-br:static-build/posts/2020/09/avif-is-exciting/demos/car-good.svg)", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/car-good.svg"],
      ["PNG 256 colour (asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/car-good.png)", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/car-good.png"],
      ["WebP (asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/car-good.webp)", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/car-good.webp"],
      ["AVIF (asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/car-good.avif)", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/car-good.avif"]
    ]
  }
}</script>
</figure>

I find it incredible that this image was created with SVG. However, it comes at a cost. The number of shapes and filters involved means it take a lot of CPU for the browser to render it. It's one of those edge cases where it's better to avoid the original SVG, even if the other formats are larger.

PNG struggles here due to the smooth gradients. I reduced the colours to 256, but I had to dither them to avoid visible banding, which also hurt compression.

WebP performs significantly better by mixing lossy compression with an alpha channel. However, the alpha channel is always encoded losslessly in WebP (except for a bit of palette reduction), so it suffers in a similar way to PNG when it comes to the transparent gradient beneath the car.

AVIF aces it again at a significantly smaller size, even compared to the SVG. Part of AVIF's advantage here is it supports a lossy alpha channel.

## A closer look

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/demos/2020/avif-is-exciting/ImageTabs",
  "props": {
    "ratio": 1.5,
    "maxWidth": 1000,
    "transform": "scale(2.3) translate(2%, -9%)",
    "initial": 4,
    "images": [
      ["Original SVG (asset-pretty-size-br:static-build/posts/2020/09/avif-is-exciting/demos/car-original.svg)", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/car-original.svg"],
      ["Optimised SVG (asset-pretty-size-br:static-build/posts/2020/09/avif-is-exciting/demos/car-good.svg)", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/car-good.svg"],
      ["PNG 256 colour (asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/car-good.png)", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/car-good.png"],
      ["WebP (asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/car-good.webp)", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/car-good.webp"],
      ["AVIF (asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/car-good.avif)", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/car-good.avif"]
    ]
  }
}</script>
</figure>

When zoomed into the PNG, you can see the effects of the palette reduction.

The WebP is getting blurry, and suffers from some colour noise.

The AVIF look similar to the WebP, but at a much smaller size. Interestingly, the AVIF just kinda gives up drawing the bonnet, but it's hardly noticeable when it's zoomed out.

## At the same size

As always, just for giggles, let's push the other formats down to the size of the AVIF:

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/demos/2020/avif-is-exciting/ImageTabs",
  "props": {
    "ratio": 1.5,
    "maxWidth": 500,
    "initial": 1,
    "images": [
      ["PNG 12 colour (asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/car-match.png)", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/car-match.png"],
      ["WebP (asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/car-match.webp)", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/car-match.webp"],
      ["AVIF (asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/car-good.avif)", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/car-good.avif"]
    ]
  }
}</script>
</figure>

The PNG version looks kinda cool! Whereas the WebP version makes me want to clean my glasses.

## Conclusion

Yeahhhh going from 86/50 kB down to 13 kB is a huge saving, and worth the extra effort.

[Here's a full-page comparison of the results](/2020/avif-is-exciting/demos/compare/?show=car).

Ok, one more:

# Illustration with gradients

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/demos/2020/avif-is-exciting/ImageTabs",
  "props": {
    "ratio": 1.786,
    "maxWidth": 960,
    "initial": 4,
    "images": [
      ["Original", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/machine-lossless.webp"],
      ["JPEG (asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/machine-good.jpg)", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/machine-good.jpg"],
      ["WebP 256 colour lossless (asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/machine-dithered.webp)", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/machine-dithered.webp"],
      ["WebP lossy (asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/machine-good.webp)", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/machine-good.webp"],
      ["AVIF (asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/machine-good.avif)", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/machine-good.avif"]
    ]
  }
}</script>
</figure>

This is another one from [Stephen Waller](https://twitter.com/bruised_blood). I picked this because it has a lot of flat colour and sharp lines, which usually points to lossless compression, but it also has a lot of gradients, which lossless formats can struggle with.

Even if I take the colours down to 256 and let WebP work its lossless magic, the result is still 170 kB. In this case, the lossy codecs perform much better.

But still, JPEG doesn't do a _great_ job here – anything lower than 80 kB starts to introduce obvious blockiness. WebP handles the image much better, but again I'm staggered by how well AVIF performs.

## A closer look

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/demos/2020/avif-is-exciting/ImageTabs",
  "props": {
    "ratio": 1.786,
    "maxWidth": 960,
    "transform": "scale(6) translate(4.3%, 27.3%)",
    "initial": 4,
    "images": [
      ["Original", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/machine-lossless.webp"],
      ["JPEG (asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/machine-good.jpg)", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/machine-good.jpg"],
      ["WebP 256 colour lossless (asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/machine-dithered.webp)", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/machine-dithered.webp"],
      ["WebP lossy (asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/machine-good.webp)", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/machine-good.webp"],
      ["AVIF (asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/machine-good.avif)", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/machine-good.avif"]
    ]
  }
}</script>
</figure>

The JPEG is pretty noisy when zoomed in, and you can start to see the 8x8 blocks in the background.

With the reduced-palette WebP, you can start to see the effects of palette reduction, especially in the elf's hat.

The lossy WebP is pretty blurry, and suffers from colour artefacts. WebP always halves the resolution of the colour data, unlike JPEG and AVIF where this is optional. However, WebP has a feature called "Sharp YUV" which tries to reduce the impact of the colour reduction. It generally works pretty well, but also causes the colour artefacts seen here.

The AVIF has really clean colours, but some blurring, and even changes some of the shapes a bit – the circle looks almost octagonal. But c'mon, 12 Kb!

## At the same size

For one last time, just for funsies, let's push the other codecs down to AVIF's size:

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/demos/2020/avif-is-exciting/ImageTabs",
  "props": {
    "ratio": 1.786,
    "maxWidth": 960,
    "initial": 1,
    "images": [
      ["Original", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/machine-lossless.webp"],
      ["JPEG (asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/machine-match.jpg)", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/machine-match.jpg"],
      ["WebP (asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/machine-match.webp)", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/machine-match.webp"],
      ["AVIF (asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/machine-good.avif)", "asset-url:static-build/posts/2020/09/avif-is-exciting/demos/machine-good.avif"]
    ]
  }
}</script>
</figure>

At these sizes, JPEG has done its own art, and the WebP looks blocky and messy.

## Conclusion

In this case, WebP offers a huge drop in size compared to the JPEG, so it's definitely worth providing the WebP to browsers that support it. However, the difference between the WebP and AVIF isn't huge, so it might not be worth creating an AVIF too.

[Here's a full-page comparison of the results](/2020/avif-is-exciting/demos/compare/?show=machine).

# So, is AVIF the champion?

I was a initially sceptical of AVIF – I don't like the idea that the web has to pick up the scraps left by video formats. But wow, I'm seriously impressed with the results above. That said, it isn't perfect. Because it's an off-cut of a video format, it's missing some features and optimisations that video doesn't need, but the web can benefit from:

<figure class="full-figure max-figure">
<video src="asset-url:./progressive.mp4" width="1000" height="666" style="width: 100%; height: auto;" controls></video>
<figcaption>JPEG, WebP, and AVIF loading at 2g speeds</figcaption>
</figure>

The above shows a high-resolution (2000x1178), high-quality image loading at 2g speeds. To get roughly the same quality, the JPEG is 249 kB, the WebP is 153 kB, and the AVIF is 96 kB.

Although they're all loading at the same rate, the much-larger JPEG feels faster because of how it renders in multiple passes. WebP renders from top to bottom, which isn't as good, but at least you see the progress. Unfortunately, with AVIF it's all-or-nothing.

Video never needs to render a partial frame, so it isn't something the format is set up to do. It isn't impossible to have a top-to-bottom render like WebP, but the implementation would be complicated, so we're unlikely to see it in browsers in the foreseeable future.

Things get more complicated with images that have an alpha channel. The AV1 spec recommends that primary images should appear before auxiliary images, and the alpha channel is stored as an auxiliary image. libavaif, the encoder we're using in Squoosh, complies with this recommendation, and they [aren't very interested in changing that](https://github.com/AOMediaCodec/libavif/issues/287). Rendering part of an image without its alpha channel will look pretty ugly, so that takes us back to waiting for the whole image to load before displaying anything.

Because of this, AVIF feels better suited to smaller quicker-loading images. But that still covers most images on the web.

There's also a question of CPU usage vs other formats, but I haven't dug into that yet. Although AV1 is likely to get hardware support, I'm told that dedicated hardware will be tuned for video, rather than decoding a page full of images.

# What about JPEG-XL and WebPv2?

One of the reasons we built [Squoosh](https://squoosh.app) is so developers could bypass the claims made about particular codecs, and instead just try it for themselves. JPEG-XL isn't quite ready yet, but we'll get it into Squoosh as soon as possible. In the meantime, I'm trying to take JPEG-XL's claims of superiority with a pinch of salt. However, there's a lot to get excited about.

JPEG-XL is an image format, rather than an off-cut of a video format. It supports lossless and lossy compressions, and progressive multi-pass rendering. It looks like the lossless compression will be better than WebP's, which is great. However, the lossy compression is tuned for high quality rather than 'acceptable quality', so it might not be a great fit for most web images. But, the benefit of multi-pass rendering might mean it's worth taking a hit when it comes to file size. I guess we'll wait and see!

There aren't many details around WebPv2 yet, so again it's best to wait and see until we can test it with our own images.

# And that's it!

Phew! I didn't expect this post to get so long, but I really enjoyed poking around AVIF and building the demos in this article. I wanted to include a dive into the more obscure settings these codecs offer, but I'll save that for another day.
