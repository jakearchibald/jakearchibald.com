---
title: AVIF has landed
date: 2020-09-08 01:00:00
summary: AVIF has shipped in Chrome 85. It's the first image format we've had in 10 years. Let's see how it performs…
meta: AVIF is the first browser image format we've had in 10 years. Let's see how it performs…
image: 'asset-url:./post.jpg'
---

Back in ancient July [I released a video](https://www.youtube.com/watch?v=F1kYBnY6mwg) that dug into how lossy and lossless image compression works and how to apply that knowledge to compress a set of different images for the web. Well, that's already out of date because _AVIF has arrived_. Brilliant.

AVIF is a new image format derived from the keyframes of [AV1 video](https://en.wikipedia.org/wiki/AV1). It's a royalty-free format, and it's already supported in Chrome 85 on desktop. Android support will be added soon, Firefox is [working on an implementation](https://bugzilla.mozilla.org/show_bug.cgi?id=avif), and although it took Safari 10 years to add WebP support, I don't think we'll see the same delay here, as Apple are a member of the group that created AV1.

What I'm saying is, the time to care about AVIF is _now_. You don't need to wait for all browsers to support it – you can use [content negotiation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Content_negotiation/List_of_default_Accept_values#Values_for_an_image) to determine browser support on the server, or use `<picture>` to provide a fallback on the client:

<style>
  @font-face {
    font-family: 'Just Another Hand';
    font-style: normal;
    font-weight: 400;
    src: url('asset-url:static-build/extra-fonts/just-another-hand.woff2') format('woff2');
  }

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

<script type="component">{
  "module": "shared/ImageTabs",
  "exportName": "Styles",
  "staticOnly": true
}</script>

# F1 photo

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/ImageTabs",
  "props": {
    "ratio": 1.777,
    "maxWidth": 960,
    "initial": 3,
    "category": "f1",
    "images": [
      ["Original", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/f1-near-lossless.avif"],
      ["JPEG (asset-pretty-size:static-build/posts/2020/09/avif-has-landed/demos/f1-good.jpg)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/f1-good.jpg"],
      ["WebP (asset-pretty-size:static-build/posts/2020/09/avif-has-landed/demos/f1-good.webp)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/f1-good.webp"],
      ["AVIF (asset-pretty-size:static-build/posts/2020/09/avif-has-landed/demos/f1-good.avif)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/f1-good.avif"]
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
- It's ok for the image to lose noticeable detail compared to the original, _unless_ that detail is significant to the context of the image.

Context is key here. Image compression should be judged at the size it'll be presented to the user, and in a similar surrounding. If you're presenting a picture as a piece of art to be examined, quality and detail preservation become more important, but that's an edge case.

Most images I see on the web are a much higher quality than they need to be, which results in a slower experience for users. I'm generally impressed by [The Guardian](https://www.theguardian.com/)'s use of images. Take [this article](https://www.theguardian.com/world/2020/aug/28/ireland-pubs-to-remain-shut-coronavirus-cases-rise). If I open the image at the top of the article and zoom in, I can see the distinctive WebP artefacts. The street has been smoothed. There's some ringing around the graffiti. But we shouldn't optimise the user experience for people who might zoom in looking for flaws. When I look at the image within the article, in the size and context it's presented, I just see someone cycling past a closed pub, which is the intent of the image. The compression used there produces a small resource size, which means I saw the image quickly.

In this article, I'm optimising images as if they were appearing in an article, where their CSS width is around 50% of their pixel width, meaning they're optimised for high-density displays.

## Technique

Well, 'technique' might be too strong a word. To compress the images I used [Squoosh](https://squoosh.app). I zoomed the image out to 50%, dragged the quality slider down until it looked bad, then moved it back a bit. If the codec had an 'effort' setting, I set it to maximum. I also used one or two advanced settings, and I'll point those out along the way.

**But these are just _my_ reckons**. I'm comparing the images using the human balls of eye I keep safely inside my skull, rather than any kind of algorithm that tries to guess how humans perceive images. And of course, there are biases with human perception.

In fact, when I showed this article to [Kornel Lesiński](https://twitter.com/kornelski) (who actually knows what he's talking about when it comes to image compression), he was unhappy with my F1 comparison above, because the [DDSIM score](https://github.com/kornelski/dssim) of the JPEG is much lower than the others, meaning it's closer in quality to the original image, and… he's right.

I struggled to compress the F1 image as JPEG. If I went any lower than 74 kB, the banding on the road became really obvious to me, and some of the grey parts of the road appeared slightly purple in a noticeable way, but Kornel was able to tweak the quantization tables in MozJPEG to get a better result:

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/ImageTabs",
  "props": {
    "ratio": 1.777,
    "maxWidth": 960,
    "initial": 2,
    "category": "f1",
    "images": [
      ["Original", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/f1-near-lossless.avif"],
      ["JPEG (asset-pretty-size:static-build/posts/2020/09/avif-has-landed/demos/f1-good.jpg)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/f1-good.jpg"],
      ["JPEG + Kornel powers (asset-pretty-size:static-build/posts/2020/09/avif-has-landed/demos/f1-kornel.jpg)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/f1-kornel.jpg"],
      ["WebP (asset-pretty-size:static-build/posts/2020/09/avif-has-landed/demos/f1-good.webp)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/f1-good.webp"],
      ["AVIF (asset-pretty-size:static-build/posts/2020/09/avif-has-landed/demos/f1-good.avif)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/f1-good.avif"]
    ]
  }
}</script>
</figure>

Although I'm happy to spend time manually compressing key images of a web site, I don't really have the skills to tweak a JPEG encoder in that way. So the results in this post are also a reflection of what the codec can do with my moderate talent and perseverance.

I also realise that manually tuning codec settings per image doesn't scale. If you need to automate image compression, you can figure out the settings manually from a few representative images, then add a bit of extra quality for safety, and use those settings in an automated tool.

I'm providing the full output for each image so you can make your own judgement, and you can try with your own images using [Squoosh](https://squoosh.app).

_\*cough\*_ Sorry about all that. Just trying to get ahead of the "what if"s, "how about"s, and "well actually"s.

## Back to the F1 image

Let's take a closer look and see how the codecs work:

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/ImageTabs",
  "props": {
    "ratio": 1.777,
    "maxWidth": 960,
    "initial": 4,
    "transform": "scale(6.5) translate(-9.6%, 8.9%)",
    "category": "f1",
    "images": [
      ["Original", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/f1-near-lossless.avif"],
      ["JPEG (asset-pretty-size:static-build/posts/2020/09/avif-has-landed/demos/f1-good.jpg)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/f1-good.jpg"],
      ["JPEG + Kornel powers (asset-pretty-size:static-build/posts/2020/09/avif-has-landed/demos/f1-kornel.jpg)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/f1-kornel.jpg"],
      ["WebP (asset-pretty-size:static-build/posts/2020/09/avif-has-landed/demos/f1-good.webp)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/f1-good.webp"],
      ["AVIF (asset-pretty-size:static-build/posts/2020/09/avif-has-landed/demos/f1-good.avif)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/f1-good.avif"]
    ]
  }
}</script>
</figure>

The fine detail of the road is lost in all of the compressed versions, which I'm ok with. However, you can see the difference in detail Kornel was talking about. Look at the red bodywork in the original, there are three distinct parts – the mirror, the wing connecting the bargeboard, and the top of the sidepod. In the AVIF, the smoothing removes the division between these parts, but they're still mostly there in the JPEG, especially the 74 kB version.

In the JPEG version you can also see the individual 8x8 blocks of the DCT, but they aren't obvious when zoomed out. WebP avoids this blockiness using decoding filters, and by, well, just being better. AVIF does much better at preserving sharp lines, but introduces smoothing. These are all ways of reducing data in the image, but the artefacts in AVIF are much less ugly.

If you're thinking "wait, what's he talking about? The AVIF is really blocky around the red/blue", well, chances are you're looking at it in Chrome 85. There's a bug in the decoder when it comes to upscaling the colour detail. This is mostly fixed in 86, although there are [some edge cases where it still happens](https://bugs.chromium.org/p/chromium/issues/detail?id=1121579).

If you want more details on how lossy codecs work, [check out my talk starting at 4:44](https://youtu.be/F1kYBnY6mwg?t=284).

## At equal file sizes

One way to make the differences between the codecs really obvious is to test them at roughly the same file size:

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/ImageTabs",
  "props": {
    "ratio": 1.777,
    "maxWidth": 960,
    "initial": 1,
    "category": "f1",
    "images": [
      ["Original", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/f1-near-lossless.avif"],
      ["JPEG (asset-pretty-size:static-build/posts/2020/09/avif-has-landed/demos/f1-match.jpg)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/f1-match.jpg"],
      ["WebP (asset-pretty-size:static-build/posts/2020/09/avif-has-landed/demos/f1-match.webp)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/f1-match.webp"],
      ["AVIF (asset-pretty-size:static-build/posts/2020/09/avif-has-landed/demos/f1-good.avif)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/f1-good.avif"]
    ]
  }
}</script>
</figure>

I couldn't even get the JPEG and WebP down to 18 kB, even at lowest settings, so this isn't a totally fair test. The JPEG suffers from awful banding, which started to appear as soon as I went below 74 kB. The WebP is much better, but there's still noticeable blockiness compared to the AVIF. I guess that's what a decade or two of progress looks like.

## Conclusion

Unless it's automated, offering up 3 versions of the same image is a bit of a pain, but the savings here are pretty significant, so it seems worth it, especially given the number of users that can already benefit from AVIF.

[Here's a full-page comparison of the results](/2020/avif-has-landed/demos/compare/?show=f1).

Ok, next image:

# Flat illustration

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/ImageTabs",
  "props": {
    "ratio": 1.333,
    "maxWidth": 400,
    "initial": 3,
    "category": "team",
    "images": [
      ["Original", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/team-lossless.webp"],
      ["Traced SVG (asset-pretty-size-br:static-build/posts/2020/09/avif-has-landed/demos/team-traced.svg)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/team-traced.svg"],
      ["PNG 68 colour (asset-pretty-size:static-build/posts/2020/09/avif-has-landed/demos/team-good.png)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/team-good.png"],
      ["WebP 68 colour lossless (asset-pretty-size:static-build/posts/2020/09/avif-has-landed/demos/team-good.webp)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/team-good.webp"],
      ["AVIF 68 colour lossless (asset-pretty-size:static-build/posts/2020/09/avif-has-landed/demos/team-lossless.avif)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/team-lossless.avif"]
    ]
  }
}</script>
</figure>

This is an illustration by [Stephen Waller](https://twitter.com/bruised_blood). I picked it because of the sharp edges and solid colours, so it's a good test of lossless compression.

The image doesn't look like it has a lot of colours, but due to the antialiasing around the edges, it has thousands. I was able to reduce the colours to 68 before things started looking bad. This makes a huge difference for WebP lossless and PNG, which switch to 'paletted' mode when there are 256 colours or fewer, which compresses really well.

In the same way AVIF is derived from the keyframes of AV1 video, WebP's lossy compression is based on the keyframes of VP8 video. However, _lossless_ WebP is a different codec, written from scratch. It's often overlooked, but it outperforms PNG every time.

I don't have the original vector version of this image, but I created a 'traced' SVG version using Adobe Illustrator to get a very rough feel for how SVG would perform.

What's notable is how badly AVIF performs here. It does have a specific lossless mode, but it isn't very good.

But wait…

## Why not lossy?

I went straight for palette reduction and lossless compression with this image, because experience has taught me lossy compression _always_ does a bad job on these kinds of images. Or so I thought…

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/ImageTabs",
  "props": {
    "ratio": 1.333,
    "maxWidth": 400,
    "initial": 4,
    "category": "team",
    "images": [
      ["Original", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/team-lossless.webp"],
      ["Traced SVG (asset-pretty-size-br:static-build/posts/2020/09/avif-has-landed/demos/team-traced.svg)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/team-traced.svg"],
      ["PNG 68 colour (asset-pretty-size:static-build/posts/2020/09/avif-has-landed/demos/team-good.png)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/team-good.png"],
      ["WebP 68 colour lossless (asset-pretty-size:static-build/posts/2020/09/avif-has-landed/demos/team-good.webp)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/team-good.webp"],
      ["AVIF (asset-pretty-size:static-build/posts/2020/09/avif-has-landed/demos/team-good.avif)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/team-good.avif"]
    ]
  }
}</script>
</figure>

Turns out lossy AVIF can handle solid colour and sharp lines really well, and produces a file quite a bit smaller than the SVG. I disabled chroma subsampling in the AVIF to keep the colours sharp.

## A closer look

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/ImageTabs",
  "props": {
    "ratio": 1.333,
    "maxWidth": 1000,
    "transform": "translate(-1%, 59%) scale(2.5)",
    "initial": 4,
    "category": "team",
    "images": [
      ["Original", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/team-lossless.webp"],
      ["Traced SVG (asset-pretty-size-br:static-build/posts/2020/09/avif-has-landed/demos/team-traced.svg)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/team-traced.svg"],
      ["PNG 68 colour (asset-pretty-size:static-build/posts/2020/09/avif-has-landed/demos/team-good.png)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/team-good.png"],
      ["WebP 68 colour lossless (asset-pretty-size:static-build/posts/2020/09/avif-has-landed/demos/team-good.webp)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/team-good.webp"],
      ["AVIF (asset-pretty-size:static-build/posts/2020/09/avif-has-landed/demos/team-good.avif)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/team-good.avif"]
    ]
  }
}</script>
</figure>

I expected a lossy codec to destroy the edges, but it looks great! There's a very slight bit of blurring above the glasses of the guy on the left, and on the ear of the guy on the right. If anything, AVIF has introduced some sharpening – see the left-hand side of the glasses. That kind of sharpening is usually produced by palette reduction, but here it's just how AVIF works due to the [directional transforms and filters](https://hacks.mozilla.org/2018/06/av1-next-generation-video-the-constrained-directional-enhancement-filter/).

The PNG and WebP have sharp edges particularly around the green shirt due to the palette reduction, but it isn't really noticeable at normal size.

Of course, the SVG looks super sharp due to vector scaling, but you can see where the tracing lost details around the hair and pocket of the guy on the right.

## At equal file sizes

Let's push the other codecs down to the size of the AVIF:

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/ImageTabs",
  "props": {
    "ratio": 1.333,
    "maxWidth": 400,
    "initial": 1,
    "category": "team",
    "images": [
      ["Original", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/team-lossless.webp"],
      ["JPEG (asset-pretty-size:static-build/posts/2020/09/avif-has-landed/demos/team-match.jpg)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/team-match.jpg"],
      ["PNG 8 colour (asset-pretty-size:static-build/posts/2020/09/avif-has-landed/demos/team-match.png)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/team-match.png"],
      ["WebP lossy (asset-pretty-size:static-build/posts/2020/09/avif-has-landed/demos/team-match.webp)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/team-match.webp"],
      ["AVIF (asset-pretty-size:static-build/posts/2020/09/avif-has-landed/demos/team-good.avif)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/team-good.avif"]
    ]
  }
}</script>
</figure>

Things aren't as bad as they were with the F1 image, but the JPEG is very noisy and changes the colours significantly, the WebP is blurry, and the PNG shows that, well, you need more than 8 colours.

## Conclusion

AVIF has kinda blown my mind here. It's made me reconsider the kinds of images lossy codecs are suited to.

But all said and done, a proper SVG is probably the right choice here. But even if SVG couldn't be used, the difference between the PNG and AVIF is only a few kB. In this case it might not be worth the complexity of creating different versions of the image.

[Here's a full-page comparison of the results](/2020/avif-has-landed/demos/compare/?show=team).

Right, it's time for the next image…

# Heavy SVG

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/ImageTabs",
  "props": {
    "ratio": 1.5,
    "maxWidth": 500,
    "initial": 4,
    "category": "car",
    "images": [
      ["Original SVG (asset-pretty-size-br:static-build/posts/2020/09/avif-has-landed/demos/car-original.svg)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/car-original.svg"],
      ["Optimised SVG (asset-pretty-size-br:static-build/posts/2020/09/avif-has-landed/demos/car-good.svg)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/car-good.svg"],
      ["PNG 256 colour (asset-pretty-size:static-build/posts/2020/09/avif-has-landed/demos/car-good.png)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/car-good.png"],
      ["WebP (asset-pretty-size:static-build/posts/2020/09/avif-has-landed/demos/car-good.webp)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/car-good.webp"],
      ["AVIF (asset-pretty-size:static-build/posts/2020/09/avif-has-landed/demos/car-good.avif)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/car-good.avif"]
    ]
  }
}</script>
</figure>

I find it incredible that this image was created with SVG. However, it comes at a cost. The number of shapes and filters involved means it takes a lot of CPU for the browser to render it. It's one of those edge cases where it's better to avoid the original SVG, even if the alternative is larger.

PNG struggles here due to the smooth gradients. I reduced the colours to 256, but I had to [dither](https://en.wikipedia.org/wiki/Dither) them to avoid visible banding, which also hurt compression.

WebP performs significantly better by mixing lossy compression with an alpha channel. However, the alpha channel is always encoded losslessly in WebP (except for a bit of palette reduction), so it suffers in a similar way to PNG when it comes to the transparent gradient beneath the car.

AVIF aces it again at a significantly smaller size, even compared to the SVG. Part of AVIF's advantage here is it supports a lossy alpha channel.

## A closer look

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/ImageTabs",
  "props": {
    "ratio": 1.5,
    "maxWidth": 1000,
    "transform": "scale(2.3) translate(2%, -9%)",
    "initial": 4,
    "category": "car",
    "images": [
      ["Original SVG (asset-pretty-size-br:static-build/posts/2020/09/avif-has-landed/demos/car-original.svg)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/car-original.svg"],
      ["Optimised SVG (asset-pretty-size-br:static-build/posts/2020/09/avif-has-landed/demos/car-good.svg)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/car-good.svg"],
      ["PNG 256 colour (asset-pretty-size:static-build/posts/2020/09/avif-has-landed/demos/car-good.png)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/car-good.png"],
      ["WebP (asset-pretty-size:static-build/posts/2020/09/avif-has-landed/demos/car-good.webp)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/car-good.webp"],
      ["AVIF (asset-pretty-size:static-build/posts/2020/09/avif-has-landed/demos/car-good.avif)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/car-good.avif"]
    ]
  }
}</script>
</figure>

When zoomed into the PNG, you can see the effects of the palette reduction. The WebP is getting blurry, and suffers from some colour noise.

The AVIF looks similar to the WebP, but at a much smaller size. Interestingly, the AVIF just kinda gives up drawing the bonnet, but it's hardly noticeable when it's zoomed out.

## At equal file sizes

As always, let's push the other formats down to the size of the AVIF:

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/ImageTabs",
  "props": {
    "ratio": 1.5,
    "maxWidth": 500,
    "initial": 1,
    "category": "car",
    "images": [
      ["PNG 12 colour (asset-pretty-size:static-build/posts/2020/09/avif-has-landed/demos/car-match.png)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/car-match.png"],
      ["WebP (asset-pretty-size:static-build/posts/2020/09/avif-has-landed/demos/car-match.webp)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/car-match.webp"],
      ["AVIF (asset-pretty-size:static-build/posts/2020/09/avif-has-landed/demos/car-good.avif)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/car-good.avif"]
    ]
  }
}</script>
</figure>

The PNG version looks kinda cool! Whereas the WebP version makes me want to clean my glasses.

## Conclusion

Yeahhhh going from 86/50 kB down to 13 kB is a huge saving, and worth the extra effort.

[Here's a full-page comparison of the results](/2020/avif-has-landed/demos/compare/?show=car).

Ok, one more:

# Illustration with gradients

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/ImageTabs",
  "props": {
    "ratio": 1.786,
    "maxWidth": 960,
    "initial": 4,
    "category": "machine",
    "images": [
      ["Original", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/machine-lossless.webp"],
      ["JPEG (asset-pretty-size:static-build/posts/2020/09/avif-has-landed/demos/machine-good.jpg)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/machine-good.jpg"],
      ["WebP 256 colour lossless (asset-pretty-size:static-build/posts/2020/09/avif-has-landed/demos/machine-dithered.webp)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/machine-dithered.webp"],
      ["WebP lossy (asset-pretty-size:static-build/posts/2020/09/avif-has-landed/demos/machine-good.webp)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/machine-good.webp"],
      ["AVIF (asset-pretty-size:static-build/posts/2020/09/avif-has-landed/demos/machine-good.avif)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/machine-good.avif"]
    ]
  }
}</script>
</figure>

This is another one from [Stephen Waller](https://twitter.com/bruised_blood). I picked this because it has a lot of flat colour and sharp lines, which usually points to lossless compression, but it also has a lot of gradients, which lossless formats can struggle with.

Even if I take the colours down to 256 and let WebP work its lossless magic, the result is still 170 kB. In this case, the lossy codecs perform much better.

I disabled chroma subsampling for the JPEG and AVIF, to keep the colours sharp. Unfortunately lossy WebP doesn't have this option, but it has "Sharp YUV", which tries to reduce the impact of the colour resolution reduction.

JPEG doesn't do a _great_ job here – anything lower than 80 kB starts to introduce obvious blockiness. WebP handles the image much better, but again I'm staggered by how well AVIF performs.

## A closer look

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/ImageTabs",
  "props": {
    "ratio": 1.786,
    "maxWidth": 960,
    "transform": "scale(6) translate(4.3%, 27.3%)",
    "initial": 4,
    "category": "machine",
    "images": [
      ["Original", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/machine-lossless.webp"],
      ["JPEG (asset-pretty-size:static-build/posts/2020/09/avif-has-landed/demos/machine-good.jpg)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/machine-good.jpg"],
      ["WebP 256 colour lossless (asset-pretty-size:static-build/posts/2020/09/avif-has-landed/demos/machine-dithered.webp)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/machine-dithered.webp"],
      ["WebP lossy (asset-pretty-size:static-build/posts/2020/09/avif-has-landed/demos/machine-good.webp)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/machine-good.webp"],
      ["AVIF (asset-pretty-size:static-build/posts/2020/09/avif-has-landed/demos/machine-good.avif)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/machine-good.avif"]
    ]
  }
}</script>
</figure>

The JPEG is pretty noisy when zoomed in, and you can start to see the 8x8 blocks in the background.

With the reduced-palette WebP, you can start to see the effects of palette reduction, especially in the elf's hat.

The lossy WebP is pretty blurry, and suffers from colour artefacts, which are a side-effect of "Sharp YUV".

The AVIF has really clean colours, but some blurring, and even changes some of the shapes a bit – the circle looks almost octagonal due to the edge detection. But c'mon, 12 Kb!

## At equal file sizes

For one last time, let's push the other codecs down to AVIF's size:

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/ImageTabs",
  "props": {
    "ratio": 1.786,
    "maxWidth": 960,
    "initial": 1,
    "category": "machine",
    "images": [
      ["Original", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/machine-lossless.webp"],
      ["JPEG (asset-pretty-size:static-build/posts/2020/09/avif-has-landed/demos/machine-match.jpg)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/machine-match.jpg"],
      ["WebP (asset-pretty-size:static-build/posts/2020/09/avif-has-landed/demos/machine-match.webp)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/machine-match.webp"],
      ["AVIF (asset-pretty-size:static-build/posts/2020/09/avif-has-landed/demos/machine-good.avif)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/machine-good.avif"]
    ]
  }
}</script>
</figure>

At these sizes, JPEG has done its own art, and the WebP looks blocky and messy.

## Conclusion

In this case, WebP offers a huge drop in size compared to the JPEG, so it's definitely worth providing the WebP to browsers that support it. However, the difference between the WebP and AVIF isn't huge, so it might not be worth creating an AVIF too.

[Here's a full-page comparison of the results](/2020/avif-has-landed/demos/compare/?show=machine).

# So, is AVIF the champion?

I was initially sceptical of AVIF – I don't like the idea that the web has to pick up the scraps left by video formats. But wow, I'm seriously impressed with the results above. That said, it isn't perfect.

## Progressive rendering

Because AVIF is an off-cut of a video format, it's missing some useful image features and optimisations that aren't relevant to video:

<figure class="full-figure max-figure">
<video src="asset-url:./progressive.mp4" width="1000" height="666" style="width: 100%; height: auto;" controls></video>
<figcaption>JPEG, WebP, and AVIF loading at 2g speeds</figcaption>
</figure>

The above shows a high-resolution (2000x1178), high-quality image loading at 2g speeds. To get roughly the same quality, the JPEG is 249 kB, the WebP is 153 kB, and the AVIF is 96 kB.

Although they're all loading at the same rate, the much-larger JPEG feels faster because of how it renders in multiple passes. WebP renders from top to bottom, which isn't as good, but at least you see the progress. Unfortunately, with AVIF it's all-or-nothing.

Video doesn't need to render a partial frame, so it isn't something the format is set up to do. It's possible to have a top-to-bottom render like WebP, but the implementation would be complicated, so we're unlikely to see it in browsers in the foreseeable future.

Because of this, AVIF feels better suited to smaller quicker-loading images. But that still covers most images on the web.

Maybe this could be solved if the format could provide a way to embed a 'preview' version of the image at the start of the file. The browser would render this if it doesn't have the rest of the file. Because it's a different image, the developer would get to choose the quality, resolution, and even apply filters like blurring:

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/ImageTabs",
  "props": {
    "ratio": 1.786,
    "maxWidth": 960,
    "initial": 1,
    "images": [
      ["Full AVIF (asset-pretty-size:static-build/posts/2020/09/avif-has-landed/demos/cat.avif)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/cat.avif"],
      ["Half resolution, low quality (asset-pretty-size:static-build/posts/2020/09/avif-has-landed/demos/cat-preview.avif)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/cat-preview.avif"],
      ["Half resolution, blurred (asset-pretty-size:static-build/posts/2020/09/avif-has-landed/demos/cat-blur.avif)", "asset-url:static-build/posts/2020/09/avif-has-landed/demos/cat-blur.avif"]
    ]
  }
}</script>
</figure>

Adding 5 kB to a big image like this seems worth it to get a low-quality early render. Here's what it would look like:

<figure class="full-figure max-figure" id="progressive-avif-demo">
<video src="asset-url:./progressive-avif.mp4" width="1000" height="666" style="width: 100%; height: auto;" controls></video>
<figcaption>JPEG, WebP, and 'progressive' AVIF loading at 2g speeds</figcaption>
</figure>

I've [proposed this to the AVIF spec folks](https://github.com/AOMediaCodec/av1-avif/issues/102).

## Encoding time

Encoding AVIF takes a long time in general, but it's especially bad in [Squoosh](https://squoosh.app) because we're using WebAssembly, which doesn't let us use [SIMD](https://en.wikipedia.org/wiki/SIMD) or multiple threads. Those features are starting to arrive to standards and browsers, so hopefully we'll be able to improve things soon.

At an 'effort' of 2, it takes a good few seconds to encode. 'Effort' 3 is significantly better, but that can take a couple of minutes. 'Effort' 10 (which I used for images in this article) can take over 10 minutes to encode a single image.

AVIF supports tiling images, which chops the image into smaller blocks that can be encoded and decoded separately. This is interesting for encoding, because it means the blocks can be encoded in parallel, making full use of CPU cores, although Squoosh doesn't take advantage of this yet.

The command line tools are orders of magnitude faster. You can either [compile libavif yourself](https://github.com/AOMediaCodec/libavif), or on OSX, install it via [Homebrew](https://brew.sh/):

```sh
brew install joedrago/repo/avifenc
```

There's also a Rust implementation, [cavif](https://github.com/kornelski/cavif-rs).

My current workflow is to use [Squoosh](https://squoosh.app) to figure out decent settings at 'effort' 2, then use libavif to try the same settings at 'effort' 10. Hopefully we can speed up the Squoosh version soon!

## Decoding time

There's also a question of CPU usage vs other formats when it comes to decoding, but I haven't dug into that yet. Although AV1 is [starting to get](https://www.nvidia.com/en-gb/geforce/news/rtx-30-series-av1-decoding/) [hardware support](https://newsroom.intel.com/news-releases/11th-gen-tiger-lake-evo/), I'm told that dedicated hardware will be tuned for video, and not so great at decoding a page full of images.

# What about JPEG-XL and WebPv2?

One of the reasons we built [Squoosh](https://squoosh.app) is so developers could bypass the claims made about particular codecs, and instead just try it for themselves. JPEG-XL isn't quite ready yet, but we'll get it into Squoosh as soon as possible. In the meantime, I'm trying to take JPEG-XL's claims of superiority with a pinch of salt. However, there's a lot to get excited about.

JPEG-XL is an image format, rather than an off-cut of a video format. It supports lossless and lossy compressions, and progressive multi-pass rendering. It looks like the lossless compression will be better than WebP's, which is great. However, the lossy compression is tuned for high quality rather than 'acceptable quality', so it might not be a great fit for most web images. But, the benefit of multi-pass rendering might mean it's worth taking a hit when it comes to file size. I guess we'll wait and see!

There aren't many details around WebPv2 yet, so again it's best to wait and see until we can test it with our own images.

# And that's it!

Phew! I didn't expect this post to get so long. I wanted to include a dive into the more obscure settings these codecs offer, but I'll save that for another day.

I really enjoyed building the demos for this article. In case you want to dig into the details:

- I built [a Preact component to handle image loading and decoding](https://github.com/jakearchibald/jakearchibald.com/blob/main/shared/DecodedImg/index.tsx), so AVIF/WebP works even without browser support. [A worker](https://github.com/jakearchibald/jakearchibald.com/blob/main/client-worker/avif/decode/index.ts) handles the actual decoding, using the WebAssembly decoders from [Squoosh](https://squoosh.app/). I'd usually use [comlink](https://github.com/GoogleChromeLabs/comlink) to help with worker communication, but lack of worker-module compatibility meant I [went for something smaller/hackier](https://github.com/jakearchibald/jakearchibald.com/blob/main/shared/DecodedImg/decoder.ts) instead.
- I wanted the demos on this page to be part of the static build to avoid layout shifting, but I [didn't want to re-render the whole page with JS](https://twitter.com/jaffathecake/status/1230388412806520833) (a pattern you see a lot with things like Gatsby and Next.JS). I hacked together a solution where my [markdown contains `<​script type="component">`](https://github.com/jakearchibald/jakearchibald.com/blob/main/static-build/posts/2020/09/avif-has-landed/index.md), which is [replaced with the HTML for that component](https://github.com/jakearchibald/jakearchibald.com/blob/main/lib/markdown-plugin.js#L79) when the markdown is parsed, and [becomes live on the client](https://github.com/jakearchibald/jakearchibald.com/blob/main/lib/markdown-plugin.js#L109).
- The full page compare view uses the [two-up and pinch-zoom web components](https://github.com/jakearchibald/jakearchibald.com/blob/main/client/demos/2020/avif-has-landed/compare/ZoomableTwoUp.tsx) from Squoosh.
- Here's the [progressive image loading demo](/2020/avif-has-landed/demos/loading/). It uses a [`TransformStream` in a service worker](https://github.com/jakearchibald/jakearchibald.com/blob/main/client-worker/avif/avif-slow-sw.ts) to throttle the image data.
- For the talk rather than this article, I built a tool that lets you [experiment with chroma subsampling](https://jakearchibald.github.io/image-experiments/channels/).
- Also from the talk, I built a tool to visualise the [DCT patterns that form an 8x8 block](https://jakearchibald.github.io/image-experiments/quant/).

Thanks to [Kornel Lesiński](https://twitter.com/kornelski), [Surma](https://twitter.com/DasSurma), [Paul Kinlan](https://twitter.com/Paul_Kinlan), [Ingvar Stepanyan](https://twitter.com/RReverser), and Sam Jenkins for proof-reading and fact checking! And since publishing, thanks to [Hubert Sablonnière](https://twitter.com/hsablonniere) and [Mathias Bynens](https://twitter.com/mathias) for more typo-busting.
