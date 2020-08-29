---
title: AVIF is exciting
date: 2020-08-26 01:00:00
summary: TODO
meta: TODO
scripts:
  - src: 'client/demos/2020/avif-is-exciting/test.ts'
    async: true
---

Back in ancient July I released a talk that dug into how lossy and lossless image compression works:

TODO: embed https://www.youtube.com/watch?v=F1kYBnY6mwg

Then I go through how to apply this knowledge to compress a set of different images for the web. Unfortunately for me, there has since been an almighty surge of change when it comes to images on the web, rendering parts of my talk a little out of date. Specifically:

- Safari 14 added WebP support.
- Chrome 85 on desktop added AVIF support.

All in a month. Thanks browser folks! You couldn't have let my talk stay 'modern' just a little bit longer? Anyway, I want to use this post to fill in the gaps. You don't need to have seen the talk to read this post, but I'm not going to retread how the formats work. If you're interested in that, watch the video!

AVIF is a new image format derived from the key frames of AV1 video, developed by the [Alliance for Open Media](https://aomedia.org/). This comes 10 years after the last web image format, WebP, was released, so it's significantly more modern.

The time to care about AVIF is _now_. **[Squoosh](https://squoosh.app) now supports AVIF**, which is how I compressed the examples in this post. Users on Chrome 85 can benefit from it today, Android support will be added soon, and Firefox is [working on an implementation](https://bugzilla.mozilla.org/show_bug.cgi?id=avif). Also, you don't need to wait for all browsers to support it either, as you can use [client hints](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/client-hints) to determine browser support on the server, or use `<picture>` to provide a fallback on the client:

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

That said, I was a initially sceptical of AVIF – I don't like the idea that the web has to pick up the scraps left by video formats. It can result in missing features or missed optimisations that video doesn't care about, but the web does (more on that later). But having played with it, I'm seriously impressed. It feels like a game-changer.

Disclaimer: **These are _my_ reckons**. I'm going to through some images I've encoded and judge them using only my human balls of eye. Your reckons may differ, and that's ok. This post is opinion rather than science. I'll provide the full output for each image so you can judge for yourself, or give it a spin with your own images using [Squoosh](https://squoosh.app).

I looked at four images in my talk, each with a different set of characteristics and challenges. Let's look at them again, but including AVIF.

# F1 car

<figure class="full-figure">
<picture>
  <source type="image/avif" srcset="asset-url:./demos/f1-good.avif">
  <source type="image/webp" srcset="asset-url:./demos/f1-good.webp">
  <img src="asset-url:./demos/f1-good.jpg" alt="">
</picture>
<figcaption>Have I ever mentioned I enjoy F1?</figcaption>
</figure>

I picked this image because it's a photo with a mixture of low frequency (the road) and high frequency (details of the car livery). Also, there are some pretty sharp changes of colour. I manually tuned the settings until the image was just on the right side of acceptable quality, and here are the sizes:

- JPEG: 77k.
- WebP: 39k.
- **AVIF: 18k.**

TODO: mention which the user sees above.

Roughly speaking, WebP is half the size of JPEG, and AVIF is half the size of WebP. I find it incredible that AVIF can do a good job of the image in just 18k.

Before I compare things further, I guess I should explain what I consider 'acceptable' quality:

- If a user looks at an image and it strikes them as ugly due to compression, that level of compression is not acceptable. One tiny notch above that boundary is acceptable.
- It's fine if the image has lost significant detail compared to the original – real users don't generally have the original to play spot-the-difference. _Unless_ that detail was a key reason for presenting the image.

Most images I see on the web are much higher quality than they need to be, which results in a slower experience for users. I'm generally impressed by [The Guardian](https://www.theguardian.com/)'s use of images. Take [this article](https://www.theguardian.com/world/2020/aug/28/ireland-pubs-to-remain-shut-coronavirus-cases-rise). If I open the article image in a new tab and zoom it in, I can see the distinctive WebP artefacts. The street has been smoothed. There's some ringing around the graffiti. But when I'm looking at it within the article, in the size and context it's presented, I just see someone cycling past a closed pub, which is the intent of the image, and the small resource size means I saw that image quickly. We should optimise images for the size and context they're presented in, not for people who might zoom in looking for flaws.

In this article, I'm optimising images as if they were appearing in an article, where their CSS width is around 50% of their pixel width, meaning they're optimised for high-density displays.

Of course, those rules don't apply for all images. There are cases, especially where the image is the core content of the page, where higher detail and quality is important. But I think those are pretty rare.

TODO: mention not everything can be manually tuned

_Cough_ sorry about all that. Just trying to get ahead of the "what if…"s, "how about"s, and "well actually"s.

[Compare the f1 image for yourself](/2020/avif-is-exciting/demos/compare/?show=f1). Don't worry if your browser doesn't support AVIF/WebP, I threw in Squoosh's decoders. It will appear at its intended size, but feel free to zoom in and look at the gory details. In fact, let's do that to get a closer look at how the codecs tick:

Changes:

- Allow articles to have client JS
- Embed encoded versions in article using tab interface
- Make the start much smaller
- Title: Compressing web images in an AVIF world

- AVIF landed in Squoosh
- You've heard it's good, but how good?
  - New format from video file, often think good at high bitrate, but not
  - Hand-me-down
- Intro talk
  - Head off the "well actually"s because we can't have nice things - no do this stuff after the first image
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
