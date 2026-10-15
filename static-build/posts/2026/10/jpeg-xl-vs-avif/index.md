---
title: JPEG XL vs AVIF for web use-cases
date: 2026-10-15 01:00:00
summary: JPEG XL has landed, but how does it compare?
meta: JPEG XL has landed, but how does it compare?
code: shiki
image: './img.jpg'
comments: none
---

JPEG XL has now landed in all major browsers, so I figured I'd take a closer look at what it's good/bad at compared to other formats.

# Conclusions

I'll go into full detail, with examples and benchmarks, but for those of you who don't have the time, here are the headlines:

**For lossy photos on the web, AVIF almost always produces smaller files than JPEG XL.** At default effort settings, the best JPEG XL version is typically 15–25% larger than the equivalent AVIF. At maximum effort settings, the gap narrows a little, to typically 6–20%. There are outliers, where JPEG XL is close to, or even beats AVIF, so if you want the absolute best result for a particular image, it's worth trying both. See the [F1 image](#lossy---f1-image) for a typical example, and the [weasel](#lossy---weasel) for an outlier.

**The JPEG XL encoder matters a lot.** [jixel](https://github.com/awxkee/jixel), a newer JPEG XL encoder, usually produces smaller files than [libjxl](https://github.com/libjxl/libjxl), except when the image has detailed transparency. The [people image](#lossy---people) is one example.

**For screenshots and illustrations, AVIF is much better than JPEG XL.** The equivalent JPEG XL is 30–90% larger at default effort settings, and 20–70% larger at maximum effort settings. Lossy AVIF handles these well - you don't need to use lossless formats unless you really need bit-exact results. See the [screenshot](#lossy---screenshot) and [illustration](#lossy---illustration) examples.

**For images with transparency, AVIF is much better than JPEG XL.** The libjxl version is 31–44% larger at default effort settings, and 61–70% larger at maximum effort settings. jixel always encodes transparency losslessly, which makes its files 2–3x the size of AVIF's. [See the data](#lossy---alpha).

**AVIF is generally faster to encode, and uses less memory, when you factor in file size.** jixel is faster than AVIF and uses less memory, but its files are typically significantly larger, so AVIF is better on balance. See the [F1 image](#lossy---f1-image) for one example.

**AVIF is faster to decode.** JPEG XL typically takes 2–3x as long to decode at medium quality, but the gap narrows at very high qualities, where Chrome can sometimes decode JPEG XL faster. The [people image](#lossy---people) is one example.

**Higher effort settings are worth it for AVIF and jixel, but not libjxl.** libjxl's higher efforts are much slower, use a lot more memory, and barely improve the result. Sometimes they produce larger files than the default effort. The [screenshot](#lossy---screenshot) is an example of this.

**AVIF's 4:2:0 mode (half colour resolution) shouldn't be your default.** It rarely reduces file size, and it makes higher qualities harder to reach. Although, it is quicker to encode and decode. Stick with 4:4:4 if you don't have time to check both. The [F1 image](#lossy---f1-image) is one example, and the [screenshot](#lossy---screenshot) is an exception.

**Quality settings are reliable for all the encoders.** With a single quality setting, the resulting quality varies a bit between images, but all the encoders vary in the same direction, and in ways that seem reasonable. [See the data](#quality-stability).

**Progressive JPEG XL is basically free at high effort.** jixel recently added support for early progressive previews, and at its slowest setting they cost little or nothing, but at its default setting the files are 12% bigger. Firefox and Chrome support progressive JPEG XL. Safari still renders the final image, but doesn't show progressive previews. However, is this type of progressive rendering a good user experience? [See the examples and data](#progressive).

**AVIF supports progressive rendering!** It's Chrome-only for now, but it's in progress for Firefox. It's more complex than progressive JPEG XL, but it gives you more control over what the preview looks like, the files are usually smaller, and they're much faster to decode. [See for yourself](#progressive).

**For HDR, JPEG XL lacks gain maps, which is a significant limitation compared to AVIF.** The JPEG XL format supports gain maps, but they aren't supported by browser decoders, and the encoding story is messy/experimental. When comparing non-gain mapped HDR content, the two quality metrics I used disagree a lot, but they agree that JPEG XL produces smaller files compared to AVIF. [See the examples](#lossy---hdr).

**JPEG XL can make existing JPEGs 9–20% smaller, without further loss.** It's also as fast or faster to decode, except for small images. [See the data](#jpeg-transcoding).

**For lossless, JPEG XL is the clear winner.** Lossless WebP is 9–17% larger for photos, and lossless AVIF is 30–120% larger. But lossless images are almost never what you want on the web. If you do use them on the web (like I do on this page), watch out for jixel's higher efforts - it often produces files that are too slow to decode. [See the data](#lossless).

**Animated image formats continue to be a dumb idea.** Please don't use them. [Learn more](#animation), if you must.

For web use-cases, I'd currently default to AVIF 4:4:4, with the highest effort level I can be bothered with. If I felt AVIF was producing an unusually large file, I'd take a look at JPEG XL via jixel, and see if it did better.

Both AVIF and JPEG XL (via jixel) have seen massive improvements recently, so it's possible that this recommendation could change in future. There's been a lot of misinformation around this stuff, and your AI will happily deliver that misinformation to you. Instead, test things with your own images.

[AVIF folks suggest](https://giannirosato.com/blog/post/case-against-jxl/) that JPEG XL is technically limited compared to AVIF. That might be true, but in this article I'm focusing on results with today's implementations.

# Methodology

I 'created' [a benchmarking script](https://github.com/jakearchibald/image-codec-bench), that encodes images using various codecs at various settings, and records various details.

I'm using the latest released versions of the image codecs, which at time of writing is:

- [avifenc](https://github.com/aomediacodec/libavif) 1.4.2
- [libjxl](https://github.com/libjxl/libjxl) 0.12.0 (using its `cjxl` encoder)
- [jixel](https://github.com/awxkee/jixel) 0.4.2 (git `f487299`), a second JPEG XL encoder
- [cwebp](https://chromium.googlesource.com/webm/libwebp/) 1.6.0 (lossless WebP is used later in the article)

I chose a selection of images, and encoded most of them to a width of 1598 pixels - which is 2x the maximum width images appear on this blog. This means they [look sharp on high density displays](/2021/serving-sharp-images-to-high-density-screens/), which most users have. As a result, if you're viewing this on a small or low density screen, you're not getting the full experience.

I ran these benchmarks on my 2024 MacBook Pro (M4 Pro).

<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/CodecCompare",
  "exportName": "Styles",
  "staticOnly": true
}</script>

<style>
  .winner-avif {
    color: #2a78d6;
  }
  .winner-jxl {
    color: #eb6834;
  }
  .winner-jixel {
    color: #1baf7a;
  }
  .winner-webp {
    color: #9b4fd0;
  }
</style>

# Lossy - F1 image

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/CodecCompare",
  "props": {
    "ratio": 1.5484,
    "maxWidth": 799,
    "lossless": "asset-url:./images/f1-targets/lossless.jxl",
    "losslessBytes": "asset-size:./images/f1-targets/lossless.jxl",
    "initialQuality": 2,
    "initialCodec": "avif",
    "qualities": [
      {
        "target": 50,
        "avif": { "url": "asset-url:./images/f1-targets/avif-q26-e0-d8-yuv444-ssimu51.6.avif", "bytes": "asset-size:./images/f1-targets/avif-q26-e0-d8-yuv444-ssimu51.6.avif", "score": "51.6" },
        "jxl": { "url": "asset-url:./images/f1-targets/jxl-q20.5-e10-ssimu50.4.jxl", "bytes": "asset-size:./images/f1-targets/jxl-q20.5-e10-ssimu50.4.jxl", "score": "50.4" },
        "jixel": { "url": "asset-url:./images/f1-targets/jixel-q30.1-e6-ssimu50.3.jxl", "bytes": "asset-size:./images/f1-targets/jixel-q30.1-e6-ssimu50.3.jxl", "score": "50.3" }
      },
      {
        "target": 60,
        "avif": { "url": "asset-url:./images/f1-targets/avif-q34-e0-d8-yuv444-ssimu60.1.avif", "bytes": "asset-size:./images/f1-targets/avif-q34-e0-d8-yuv444-ssimu60.1.avif", "score": "60.1" },
        "jxl": { "url": "asset-url:./images/f1-targets/jxl-q29.4-e10-ssimu60.1.jxl", "bytes": "asset-size:./images/f1-targets/jxl-q29.4-e10-ssimu60.1.jxl", "score": "60.1" },
        "jixel": { "url": "asset-url:./images/f1-targets/jixel-q55.2-e6-ssimu60.1.jxl", "bytes": "asset-size:./images/f1-targets/jixel-q55.2-e6-ssimu60.1.jxl", "score": "60.1" }
      },
      {
        "target": 70,
        "avif": { "url": "asset-url:./images/f1-targets/avif-q44-e0-d8-yuv444-ssimu70.2.avif", "bytes": "asset-size:./images/f1-targets/avif-q44-e0-d8-yuv444-ssimu70.2.avif", "score": "70.2" },
        "jxl": { "url": "asset-url:./images/f1-targets/jxl-q53-e10-ssimu70.0.jxl", "bytes": "asset-size:./images/f1-targets/jxl-q53-e10-ssimu70.0.jxl", "score": "70.0" },
        "jixel": { "url": "asset-url:./images/f1-targets/jixel-q72.2-e6-ssimu70.0.jxl", "bytes": "asset-size:./images/f1-targets/jixel-q72.2-e6-ssimu70.0.jxl", "score": "70.0" }
      },
      {
        "target": 80,
        "avif": { "url": "asset-url:./images/f1-targets/avif-q58-e0-d8-yuv444-ssimu80.1.avif", "bytes": "asset-size:./images/f1-targets/avif-q58-e0-d8-yuv444-ssimu80.1.avif", "score": "80.1" },
        "jxl": { "url": "asset-url:./images/f1-targets/jxl-q73.5-e10-ssimu80.1.jxl", "bytes": "asset-size:./images/f1-targets/jxl-q73.5-e10-ssimu80.1.jxl", "score": "80.1" },
        "jixel": { "url": "asset-url:./images/f1-targets/jixel-q83.1-e6-ssimu80.5.jxl", "bytes": "asset-size:./images/f1-targets/jixel-q83.1-e6-ssimu80.5.jxl", "score": "80.5" }
      },
      {
        "target": 90,
        "avif": { "url": "asset-url:./images/f1-targets/avif-q86-e0-d8-yuv444-ssimu90.2.avif", "bytes": "asset-size:./images/f1-targets/avif-q86-e0-d8-yuv444-ssimu90.2.avif", "score": "90.2" },
        "jxl": { "url": "asset-url:./images/f1-targets/jxl-q91.4-e10-ssimu90.0.jxl", "bytes": "asset-size:./images/f1-targets/jxl-q91.4-e10-ssimu90.0.jxl", "score": "90.0" },
        "jixel": { "url": "asset-url:./images/f1-targets/jixel-q91.6-e6-ssimu90.0.jxl", "bytes": "asset-size:./images/f1-targets/jixel-q91.6-e6-ssimu90.0.jxl", "score": "90.0" }
      }
    ]
  }
}</script>
</figure>

When I [first wrote about AVIF](https://jakearchibald.com/2020/avif-has-landed/), I used an F1 car as the first image, so I figured I'd do that again!

I encoded the image at various codec qualities, and chose versions that were closest to particular [SSIMULACRA2](https://github.com/cloudinary/ssimulacra2) scores - a perceptual image quality metric by the folks behind JPEG XL. 50 is considered medium quality, 70 high, 80 very high, and 90 visually lossless. Although, I'm not sure if these ratings take high density displays into account.

Throughout the article, the visual comparisons, like above, use each encoder's maximum effort, except in cases where maximum effort results in a larger file (yes, that happens).

For archival, I'd tend towards near-lossless qualities, but if I'm just displaying an illustrative image on my blog, performance is more important to me. I'm personally happy with the 70 result above. If you zoom in, you can see the quality loss, but if I was really concerned about the zoom-in case, I'd use something like the [`VisualViewport` API](https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport) to load in a higher resolution image when that happens, rather than make the download bigger for everyone.

At lower qualities you can see the difference in strategy between the codecs. The detail loss is around the same, but AVIF tends to smooth things out compared to the original, whereas JPEG XL seems to introduce rougher patterns.

Also, I feel that, at medium quality (50), the AVIF and libjxl look better than the jixel version. The jixel version has a lot of visible noise around the BWT logo, and the Microsoft text on the front wing is way less legible. It makes me wonder about the metric a bit.

Anyway, here's my interpretation of the results:

- **File size: <span class="winner-avif">AVIF wins</span>.** At default efforts, the best JPEG XL image is 14–17% larger than the AVIF image for the same quality. jixel is the better JPEG XL encoder at medium/high quality, and libjxl is slightly better at very high quality. At maximum efforts, the best JPEG XL image (jixel 'extraslow') is 6–15% larger than AVIF (s0).
- **jixel at its slowest setting slightly beats AVIF's default effort**, with files 1–10% smaller. The biggest gain is at very high quality.
- **Encode time: <span class="winner-avif">AVIF wins</span>.** At default efforts, jixel is 12–36% faster than AVIF, but its files are 14–18% larger. To match the file size of AVIF's default, jixel needs its 'extraslow' setting, which takes 18–27x as long as AVIF. libjxl's default takes 1.5–2x as long as AVIF's default, and still produces bigger files.
- **Encode memory: <span class="winner-avif">AVIF wins</span>.** At default efforts, jixel uses around half the memory of AVIF, but again, its files are 14–18% larger. To match the file size of AVIF's default, jixel 'extraslow' uses ~10x the memory. libjxl's default uses 2–3x the memory of AVIF, and its higher efforts use ~7x.
- **Decode time: <span class="winner-avif">AVIF wins</span>.** JPEG XL takes 2–3x as long to decode at medium quality, narrowing to ~1.5–1.8x at very high quality. Safari's JPEG XL decoder is the slowest.
- **Higher effort is worth it for AVIF.** AVIF's s5 gets you ~10% smaller files for ~3x the encode time.
- **Higher effort is worth it for jixel too, up to 'slow'.** 'slow' gets you 9–13% smaller files than its default 'fast', for ~3.7x the encode time. 'extraslow' saves another 3–8%, but takes ~8x longer than 'slow' and uses ~9x the memory. Even so, AVIF still wins when given the same encode time: AVIF s5 takes about as long as jixel 'slow', and its files are ~13% smaller.
- **Higher effort isn't worth it for libjxl.** libjxl's maximum effort is barely any better than its default, but takes ~18x longer.
- **AVIF's 4:2:0 mode doesn't help much.** It's slightly faster to encode/decode, and uses less memory, but the files aren't meaningfully smaller, and it struggles to reach higher qualities.

Here's the full data, so you can make up your own mind:

<details>

<summary>Show me the graphs!</summary>

## Image quality

Ok, let's get to our first graph, the SSIMULACRA2 scores:

<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/QualityChart",
  "exportName": "Styles",
  "staticOnly": true
}</script>

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/data/f1",
  "props": {
    "metric": "ssimulacra2"
  }
}</script>
</figure>

There's going to be a lot of these graphs, so here's what's going on:

- **The x-axis is visual quality** according to SSIMULACRA2.
- **The y-axis is file size**. Lower is better, for a given visual quality.
- **The orange lines represent JPEG XL encoded with libjxl.**
- **The green lines represent JPEG XL encoded with jixel.**
- **The blue lines represent AVIF.**
- **The dashed blue lines represent AVIF with its color data at half resolution.** Known as 4:2:0, or chroma subsampling.
- **The darker lines represent higher effort levels for that codec.** libjxl calls this 'effort', so the e10 line is the top effort. Annoyingly, avifenc calls this 'speed', so the s0 line is the top effort. jixel names its levels, from 'fast' (its default) to 'extraslow'.
- **Only the default and maximum efforts are shown initially.** Click the legend to toggle the others.

Here are the quality results using a different quality metric, [ColorVideoVDP](https://github.com/gfxdisp/colorvideovdp):

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/data/f1",
  "props": {
    "metric": "jod"
  }
}</script>
</figure>

The result is roughly the same except this metric puts more of a gap between AVIF and the JPEG XL images.

It also suggests there's some advantage to AVIF with 4:2:0 chroma subsampling at lower qualities, but it's minor.

## Encoding performance

When it comes to images on my blog, I encode with maximum effort settings. I'm happy to wait a couple of seconds to get an image that's faster to load for every user. However, if you're doing a lot of encoding on a server, encode time becomes more of a concern.

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/data/f1",
  "props": {
    "metric": "ssimulacra2",
    "y": "encodeMs"
  }
}</script>
</figure>

## Encoding memory usage

Another thing that might be a concern if you're encoding images on a server is peak memory usage:

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/data/f1",
  "props": {
    "metric": "ssimulacra2",
    "y": "encodeMemory"
  }
}</script>
</figure>

## Decoding performance

It's worth considering decoding performance. If decoding is particularly slow, then it might make the file size benefit less valuable, especially when images are loaded from a cache.

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/data/f1",
  "props": {
    "metric": "ssimulacra2",
    "y": "decodeMs"
  }
}</script>
</figure>

JPEG XL becomes suddenly faster to decode at very high quality settings (but still slower than AVIF). I think this is due to an edge preserving filter that does more work at lower quality settings.

</details>

# Lossy - people

I've heard people say that AVIF's tendency to smooth out details makes it bad for human faces, so I picked this image [from Unsplash](https://unsplash.com/photos/two-smiling-women-looking-at-a-smartphone-together-_t15AWPJNmg).

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/CodecCompare",
  "props": {
    "ratio": 1.5005,
    "maxWidth": 799,
    "lossless": "asset-url:./images/women-with-phones-targets/lossless.jxl",
    "losslessBytes": "asset-size:./images/women-with-phones-targets/lossless.jxl",
    "initialQuality": 2,
    "initialCodec": "avif",
    "qualities": [
      {
        "target": 50,
        "avif": { "url": "asset-url:./images/women-with-phones-targets/avif-q32-e0-d8-yuv444-ssimu50.4.avif", "bytes": "asset-size:./images/women-with-phones-targets/avif-q32-e0-d8-yuv444-ssimu50.4.avif", "score": "50.4" },
        "jxl": { "url": "asset-url:./images/women-with-phones-targets/jxl-q31.2-e10-ssimu50.3.jxl", "bytes": "asset-size:./images/women-with-phones-targets/jxl-q31.2-e10-ssimu50.3.jxl", "score": "50.3" },
        "jixel": { "url": "asset-url:./images/women-with-phones-targets/jixel-q48.6-e6-ssimu50.0.jxl", "bytes": "asset-size:./images/women-with-phones-targets/jixel-q48.6-e6-ssimu50.0.jxl", "score": "50.0" }
      },
      {
        "target": 60,
        "avif": { "url": "asset-url:./images/women-with-phones-targets/avif-q40-e0-d8-yuv444-ssimu61.3.avif", "bytes": "asset-size:./images/women-with-phones-targets/avif-q40-e0-d8-yuv444-ssimu61.3.avif", "score": "61.3" },
        "jxl": { "url": "asset-url:./images/women-with-phones-targets/jxl-q52.5-e10-ssimu60.1.jxl", "bytes": "asset-size:./images/women-with-phones-targets/jxl-q52.5-e10-ssimu60.1.jxl", "score": "60.1" },
        "jixel": { "url": "asset-url:./images/women-with-phones-targets/jixel-q66.6-e6-ssimu60.1.jxl", "bytes": "asset-size:./images/women-with-phones-targets/jixel-q66.6-e6-ssimu60.1.jxl", "score": "60.1" }
      },
      {
        "target": 70,
        "avif": { "url": "asset-url:./images/women-with-phones-targets/avif-q49-e0-d8-yuv444-ssimu70.7.avif", "bytes": "asset-size:./images/women-with-phones-targets/avif-q49-e0-d8-yuv444-ssimu70.7.avif", "score": "70.7" },
        "jxl": { "url": "asset-url:./images/women-with-phones-targets/jxl-q69.6-e10-ssimu70.1.jxl", "bytes": "asset-size:./images/women-with-phones-targets/jxl-q69.6-e10-ssimu70.1.jxl", "score": "70.1" },
        "jixel": { "url": "asset-url:./images/women-with-phones-targets/jixel-q78.4-e6-ssimu70.1.jxl", "bytes": "asset-size:./images/women-with-phones-targets/jixel-q78.4-e6-ssimu70.1.jxl", "score": "70.1" }
      },
      {
        "target": 80,
        "avif": { "url": "asset-url:./images/women-with-phones-targets/avif-q63-e0-d8-yuv444-ssimu80.2.avif", "bytes": "asset-size:./images/women-with-phones-targets/avif-q63-e0-d8-yuv444-ssimu80.2.avif", "score": "80.2" },
        "jxl": { "url": "asset-url:./images/women-with-phones-targets/jxl-q82.4-e10-ssimu80.1.jxl", "bytes": "asset-size:./images/women-with-phones-targets/jxl-q82.4-e10-ssimu80.1.jxl", "score": "80.1" },
        "jixel": { "url": "asset-url:./images/women-with-phones-targets/jixel-q86-e6-ssimu80.2.jxl", "bytes": "asset-size:./images/women-with-phones-targets/jixel-q86-e6-ssimu80.2.jxl", "score": "80.2" }
      },
      {
        "target": 90,
        "avif": { "url": "asset-url:./images/women-with-phones-targets/avif-q88-e0-d8-yuv444-ssimu90.3.avif", "bytes": "asset-size:./images/women-with-phones-targets/avif-q88-e0-d8-yuv444-ssimu90.3.avif", "score": "90.3" },
        "jxl": { "url": "asset-url:./images/women-with-phones-targets/jxl-q94.1-e10-ssimu90.1.jxl", "bytes": "asset-size:./images/women-with-phones-targets/jxl-q94.1-e10-ssimu90.1.jxl", "score": "90.1" },
        "jixel": { "url": "asset-url:./images/women-with-phones-targets/jixel-q93.2-e6-ssimu90.1.jxl", "bytes": "asset-size:./images/women-with-phones-targets/jixel-q93.2-e6-ssimu90.1.jxl", "score": "90.1" }
      }
    ]
  }
}</script>
</figure>

The results of the benchmark for this image:

- **File size: <span class="winner-avif">AVIF wins</span>.** At default efforts, the best JPEG XL image is 17–24% larger than the AVIF image for the same quality. jixel is the better JPEG XL encoder across the whole quality range this time. libjxl is 30–50% larger than AVIF, which is a much bigger gap than the F1 image. At maximum efforts, the best JPEG XL image (jixel 'extraslow') is 12–17% larger than AVIF (s0).
- **jixel at its slowest setting doesn't quite match AVIF's default effort** this time. It's a few percent larger at medium/high quality, and only edges ahead at very high quality.
- **Encode time: <span class="winner-avif">AVIF wins</span>.** At default efforts, jixel is 18–33% faster than AVIF, but its files are 17–24% larger. Even jixel's 'extraslow' setting, which takes 25–39x as long as AVIF, only matches AVIF's default file size at very high quality. libjxl's default takes 1.5–2.2x as long as AVIF's default, and still produces bigger files.
- **Encode memory: <span class="winner-avif">AVIF wins</span>.** At default efforts, jixel uses around half the memory of AVIF, but again, its files are 17–24% larger. jixel 'extraslow' gets closest to AVIF's default file size, but uses ~10x the memory. libjxl's default uses 2–3.3x the memory of AVIF, and its higher efforts use ~7x.
- **Decode time: <span class="winner-avif">AVIF wins</span>.** JPEG XL takes 2–2.9x as long to decode at medium quality, narrowing to ~1.3–1.7x at very high quality. At the very top of the quality range, libjxl images decode as fast as AVIF in Chrome, but not in the other browsers.
- **Higher effort is worth it for AVIF.** AVIF's s5 gets you 5–8% smaller files for ~3x the encode time. That's a smaller gain than the F1 image.
- **Higher effort is worth it for jixel too, up to 'slow'.** 'slow' gets you 7–14% smaller files than its default 'fast', for ~3.9x the encode time. 'extraslow' saves another 4–6%, but takes ~10x longer than 'slow' and uses ~9x the memory. AVIF still wins when given the same encode time: AVIF s5 takes about as long as jixel 'slow', and its files are 8–17% smaller.
- **Higher effort is somewhat worth it for libjxl on this image.** Unlike the F1 image, libjxl's maximum effort gets you 4–11% smaller files than its default. But it takes ~10x longer, and it still produces much bigger files than AVIF at its default effort.
- **AVIF's 4:2:0 mode doesn't help much.** Same as the F1 image. ColorVideoVDP gives it a small (~4%) advantage, but SSIMULACRA2 doesn't.

At lower qualities, you can see the smoothing on the face, but it's the same for both AVIF and JPEG XL.

<details>

<summary>Show me the graphs!</summary>

## Image quality

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/data/women-with-phones",
  "props": {
    "metric": "ssimulacra2"
  }
}</script>
</figure>

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/data/women-with-phones",
  "props": {
    "metric": "jod"
  }
}</script>
</figure>

## Encoding performance

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/data/women-with-phones",
  "props": {
    "metric": "ssimulacra2",
    "y": "encodeMs"
  }
}</script>
</figure>

## Encoding memory usage

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/data/women-with-phones",
  "props": {
    "metric": "ssimulacra2",
    "y": "encodeMemory"
  }
}</script>
</figure>

## Decoding performance

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/data/women-with-phones",
  "props": {
    "metric": "ssimulacra2",
    "y": "decodeMs"
  }
}</script>
</figure>

It's interesting that, at lower qualities, jixel decodes much slower in Safari.

</details>

# Lossy - red panda

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/CodecCompare",
  "props": {
    "ratio": 1.4935,
    "maxWidth": 799,
    "lossless": "asset-url:./images/red-panda-targets/lossless.jxl",
    "losslessBytes": "asset-size:./images/red-panda-targets/lossless.jxl",
    "initialQuality": 2,
    "initialCodec": "avif",
    "qualities": [
      {
        "target": 50,
        "avif": { "url": "asset-url:./images/red-panda-targets/avif-q37-e0-d8-yuv444-ssimu51.6.avif", "bytes": "asset-size:./images/red-panda-targets/avif-q37-e0-d8-yuv444-ssimu51.6.avif", "score": "51.6" },
        "jxl": { "url": "asset-url:./images/red-panda-targets/jxl-q40.9-e10-ssimu50.2.jxl", "bytes": "asset-size:./images/red-panda-targets/jxl-q40.9-e10-ssimu50.2.jxl", "score": "50.2" },
        "jixel": { "url": "asset-url:./images/red-panda-targets/jixel-q52.7-e6-ssimu50.1.jxl", "bytes": "asset-size:./images/red-panda-targets/jixel-q52.7-e6-ssimu50.1.jxl", "score": "50.1" }
      },
      {
        "target": 60,
        "avif": { "url": "asset-url:./images/red-panda-targets/avif-q44-e0-d8-yuv444-ssimu60.6.avif", "bytes": "asset-size:./images/red-panda-targets/avif-q44-e0-d8-yuv444-ssimu60.6.avif", "score": "60.6" },
        "jxl": { "url": "asset-url:./images/red-panda-targets/jxl-q58.7-e10-ssimu60.0.jxl", "bytes": "asset-size:./images/red-panda-targets/jxl-q58.7-e10-ssimu60.0.jxl", "score": "60.0" },
        "jixel": { "url": "asset-url:./images/red-panda-targets/jixel-q68.4-e6-ssimu60.0.jxl", "bytes": "asset-size:./images/red-panda-targets/jixel-q68.4-e6-ssimu60.0.jxl", "score": "60.0" }
      },
      {
        "target": 70,
        "avif": { "url": "asset-url:./images/red-panda-targets/avif-q52-e0-d8-yuv444-ssimu70.3.avif", "bytes": "asset-size:./images/red-panda-targets/avif-q52-e0-d8-yuv444-ssimu70.3.avif", "score": "70.3" },
        "jxl": { "url": "asset-url:./images/red-panda-targets/jxl-q71.9-e10-ssimu70.0.jxl", "bytes": "asset-size:./images/red-panda-targets/jxl-q71.9-e10-ssimu70.0.jxl", "score": "70.0" },
        "jixel": { "url": "asset-url:./images/red-panda-targets/jixel-q78.9-e6-ssimu71.4.jxl", "bytes": "asset-size:./images/red-panda-targets/jixel-q78.9-e6-ssimu71.4.jxl", "score": "71.4" }
      },
      {
        "target": 80,
        "avif": { "url": "asset-url:./images/red-panda-targets/avif-q67-e0-d8-yuv444-ssimu80.7.avif", "bytes": "asset-size:./images/red-panda-targets/avif-q67-e0-d8-yuv444-ssimu80.7.avif", "score": "80.7" },
        "jxl": { "url": "asset-url:./images/red-panda-targets/jxl-q84.5-e10-ssimu80.1.jxl", "bytes": "asset-size:./images/red-panda-targets/jxl-q84.5-e10-ssimu80.1.jxl", "score": "80.1" },
        "jixel": { "url": "asset-url:./images/red-panda-targets/jixel-q86-e6-ssimu80.0.jxl", "bytes": "asset-size:./images/red-panda-targets/jixel-q86-e6-ssimu80.0.jxl", "score": "80.0" }
      },
      {
        "target": 90,
        "avif": { "url": "asset-url:./images/red-panda-targets/avif-q90-e0-d8-yuv444-ssimu90.3.avif", "bytes": "asset-size:./images/red-panda-targets/avif-q90-e0-d8-yuv444-ssimu90.3.avif", "score": "90.3" },
        "jxl": { "url": "asset-url:./images/red-panda-targets/jxl-q95.6-e10-ssimu90.2.jxl", "bytes": "asset-size:./images/red-panda-targets/jxl-q95.6-e10-ssimu90.2.jxl", "score": "90.2" },
        "jixel": { "url": "asset-url:./images/red-panda-targets/jixel-q93.8-e6-ssimu90.0.jxl", "bytes": "asset-size:./images/red-panda-targets/jixel-q93.8-e6-ssimu90.0.jxl", "score": "90.0" }
      }
    ]
  }
}</script>
</figure>

I threw this one in because it's the default image in [Squoosh](https://squoosh.app/), but I guess the sharp lines of the hairs make it different to the previous images. In fact, even at medium quality, the difference from the original is much less perceptible to my eyes compared to the other images.

The results are much closer than the previous two:

- **File size: <span class="winner-avif">AVIF wins</span>, narrowly.** At default efforts, the best JPEG XL image (jixel) is only 2–6% larger than the AVIF image for the same quality. libjxl does much worse, at 10–18% larger. At maximum efforts, jixel 'extraslow' and AVIF s0 are roughly tied, with jixel up to 5% smaller at very high quality. However, ColorVideoVDP disagrees, and puts AVIF 5–12% ahead at maximum efforts.
- **Encode time: <span class="winner-jixel">JPEG XL (jixel) wins</span>, according to SSIMULACRA2.** At default efforts, jixel is 19–35% faster than AVIF, and its files are only 2–6% larger. Comparing higher efforts, jixel 'slow' produces files the same size or slightly smaller than AVIF s5, in the same time or less. And jixel 'extraslow' matches or beats AVIF s0 while being 12–34% faster. But, since ColorVideoVDP gives AVIF more of a file size advantage, it isn't clear-cut. libjxl's default takes 1.3–1.9x as long as AVIF's default, and produces bigger files.
- **Encode memory: <span class="winner-jixel">JPEG XL (jixel) wins</span>, at lower efforts.** At default efforts, jixel uses 37–48% less memory than AVIF, and its files are only 2–6% larger. jixel 'slow' uses about the same memory as AVIF s5 to produce a similar file size, but 'extraslow' uses ~9x the memory of AVIF s0. libjxl's default uses ~2x the memory of AVIF, and its higher efforts use 6–7x.
- **Decode time: <span class="winner-avif">AVIF wins</span>.** JPEG XL takes 2–2.4x as long to decode at medium quality. But the gap closes at very high quality, where jixel's files decode about as fast as AVIF in Firefox and Safari, and ~25% faster in Chrome.
- **Higher effort is less worth it for AVIF on this image.** AVIF's s5 gets you 3–6% smaller files for 3–4x the encode time.
- **Higher effort is worth it for jixel, up to 'slow'.** 'slow' gets you 6–14% smaller files than its default 'fast', for 3.5–4.3x the encode time. 'extraslow' saves another 2–9%, but takes 9–14x longer than 'slow' and uses ~9x the memory.
- **Higher effort isn't worth it for libjxl.** libjxl's maximum effort gets you 1–2% smaller files than its default, but takes ~12x longer.
- **AVIF's 4:2:0 mode doesn't help.** The files are the same size as 4:4:4.

<details>

<summary>Show me the graphs!</summary>

## Image quality

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/data/red-panda",
  "props": {
    "metric": "ssimulacra2"
  }
}</script>
</figure>

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/data/red-panda",
  "props": {
    "metric": "jod"
  }
}</script>
</figure>

## Encoding performance

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/data/red-panda",
  "props": {
    "metric": "ssimulacra2",
    "y": "encodeMs"
  }
}</script>
</figure>

## Encoding memory usage

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/data/red-panda",
  "props": {
    "metric": "ssimulacra2",
    "y": "encodeMemory"
  }
}</script>
</figure>

## Decoding performance

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/data/red-panda",
  "props": {
    "metric": "ssimulacra2",
    "y": "decodeMs"
  }
}</script>
</figure>

</details>

# Lossy - weasel

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/CodecCompare",
  "props": {
    "ratio": 0.8276,
    "maxWidth": 799,
    "lossless": "asset-url:./images/critter-targets/lossless.jxl",
    "losslessBytes": "asset-size:./images/critter-targets/lossless.jxl",
    "initialQuality": 1,
    "initialCodec": "jixel",
    "qualities": [
      {
        "target": 50,
        "avif": { "url": "asset-url:./images/critter-targets/avif-q47-e0-d8-yuv444-ssimu50.4.avif", "bytes": "asset-size:./images/critter-targets/avif-q47-e0-d8-yuv444-ssimu50.4.avif", "score": "50.4" },
        "jxl": { "url": "asset-url:./images/critter-targets/jxl-q64.4-e10-ssimu50.1.jxl", "bytes": "asset-size:./images/critter-targets/jxl-q64.4-e10-ssimu50.1.jxl", "score": "50.1" },
        "jixel": { "url": "asset-url:./images/critter-targets/jixel-q71.6-e6-ssimu50.0.jxl", "bytes": "asset-size:./images/critter-targets/jixel-q71.6-e6-ssimu50.0.jxl", "score": "50.0" }
      },
      {
        "target": 60,
        "avif": { "url": "asset-url:./images/critter-targets/avif-q52-e0-d8-yuv444-ssimu60.1.avif", "bytes": "asset-size:./images/critter-targets/avif-q52-e0-d8-yuv444-ssimu60.1.avif", "score": "60.1" },
        "jxl": { "url": "asset-url:./images/critter-targets/jxl-q73.7-e10-ssimu60.1.jxl", "bytes": "asset-size:./images/critter-targets/jxl-q73.7-e10-ssimu60.1.jxl", "score": "60.1" },
        "jixel": { "url": "asset-url:./images/critter-targets/jixel-q79.5-e6-ssimu60.3.jxl", "bytes": "asset-size:./images/critter-targets/jixel-q79.5-e6-ssimu60.3.jxl", "score": "60.3" }
      },
      {
        "target": 70,
        "avif": { "url": "asset-url:./images/critter-targets/avif-q60-e0-d8-yuv444-ssimu70.5.avif", "bytes": "asset-size:./images/critter-targets/avif-q60-e0-d8-yuv444-ssimu70.5.avif", "score": "70.5" },
        "jxl": { "url": "asset-url:./images/critter-targets/jxl-q80.1-e10-ssimu70.1.jxl", "bytes": "asset-size:./images/critter-targets/jxl-q80.1-e10-ssimu70.1.jxl", "score": "70.1" },
        "jixel": { "url": "asset-url:./images/critter-targets/jixel-q84.9-e6-ssimu70.0.jxl", "bytes": "asset-size:./images/critter-targets/jixel-q84.9-e6-ssimu70.0.jxl", "score": "70.0" }
      },
      {
        "target": 80,
        "avif": { "url": "asset-url:./images/critter-targets/avif-q74-e0-d8-yuv444-ssimu80.5.avif", "bytes": "asset-size:./images/critter-targets/avif-q74-e0-d8-yuv444-ssimu80.5.avif", "score": "80.5" },
        "jxl": { "url": "asset-url:./images/critter-targets/jxl-q87.2-e10-ssimu80.1.jxl", "bytes": "asset-size:./images/critter-targets/jxl-q87.2-e10-ssimu80.1.jxl", "score": "80.1" },
        "jixel": { "url": "asset-url:./images/critter-targets/jixel-q90.5-e6-ssimu80.3.jxl", "bytes": "asset-size:./images/critter-targets/jixel-q90.5-e6-ssimu80.3.jxl", "score": "80.3" }
      },
      {
        "target": 90,
        "avif": { "url": "asset-url:./images/critter-targets/avif-q90-e0-d8-yuv444-ssimu90.2.avif", "bytes": "asset-size:./images/critter-targets/avif-q90-e0-d8-yuv444-ssimu90.2.avif", "score": "90.2" },
        "jxl": { "url": "asset-url:./images/critter-targets/jxl-q95-e10-ssimu90.0.jxl", "bytes": "asset-size:./images/critter-targets/jxl-q95-e10-ssimu90.0.jxl", "score": "90.0" },
        "jixel": { "url": "asset-url:./images/critter-targets/jixel-q93.8-e6-ssimu90.1.jxl", "bytes": "asset-size:./images/critter-targets/jixel-q93.8-e6-ssimu90.1.jxl", "score": "90.1" }
      }
    ]
  }
}</script>
</figure>

I've played with both codecs a lot, and for photos, what I've shown so far is representative, where AVIF beats JPEG XL. However, every now and then there's an outlier, such as this image.

- **File size: <span class="winner-jixel">JPEG XL wins</span>.** At default efforts, the best JPEG XL image is 4–11% smaller than the AVIF image for the same quality. libjxl is the better JPEG XL encoder at medium/high quality, and jixel at very high quality. At maximum efforts, jixel 'extraslow' is 12–27% smaller than AVIF s0. This time, ColorVideoVDP agrees.
- **jixel's 'medium' setting is a big step up on this image.** Its files are 11–25% smaller than AVIF's default, and 4–18% smaller than AVIF s0, the maximum effort.
- **Encode time: <span class="winner-jixel">JPEG XL (jixel) wins</span>.** At default efforts, jixel is 28–38% faster than AVIF, and produces files that are around the same size or smaller. At higher efforts, it's even more one-sided: jixel 'medium' is 37–65% faster than AVIF s5, and produces files 9–23% smaller. libjxl's default takes 1.5–2.2x as long as AVIF's default.
- **Encode memory: <span class="winner-jixel">JPEG XL (jixel) wins</span>.** At default efforts, jixel uses 14–24% less memory than AVIF, and produces files that are around the same size or smaller. AVIF s0 uses even more memory (~1.55x its default), and still produces bigger files than jixel 'medium', which uses 41–55% less memory than AVIF s0. libjxl's default uses 2.4–3.6x the memory of AVIF, and the maximum efforts of both JPEG XL encoders use 10–18x.
- **Decode time: <span class="winner-avif">AVIF wins</span>, except in Chrome at higher qualities.** JPEG XL takes 1.3–1.9x as long to decode in Firefox and Safari. In Chrome, JPEG XL takes ~1.25x as long at medium quality, but from high quality upwards, it's 11–36% faster than AVIF.
- **Unlike the previous images, jixel images aren't particularly slow to decode in Safari.** In fact, they decode slightly faster than libjxl images.
- **Higher effort isn't really worth it for AVIF on this image.** AVIF's s5 only gets you 1–3% smaller files for 3–4.5x the encode time. s0 gets you 7–8% smaller files, but takes ~50x as long.
- **Higher effort is worth it for jixel, up to 'slow'.** 'medium' gets you 6–14% smaller files than its default 'fast', for 1.9–4.1x the encode time. 'slow' gets you 9–19% smaller files than 'fast', for 3.9–6.5x the encode time. 'extraslow' saves another 5–9%, but takes 8–18x longer than 'slow' and uses ~11x the memory.
- **Higher effort isn't worth it for libjxl.** libjxl's maximum effort gets you 1–6% smaller files than its default, but takes 11–14x longer.
- **AVIF's 4:2:0 mode doesn't help.** The files are the same size as 4:4:4.
- **All three encoders produce lower SSIMULACRA2 scores for this image.** As in, with the same encoder quality value, they score lower. It seems like the encoders are pretty happy smoothing out some of the background noise, which seems fine.

<details>

<summary>Show me the graphs!</summary>

## Image quality

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/data/critter",
  "props": {
    "metric": "ssimulacra2"
  }
}</script>
</figure>

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/data/critter",
  "props": {
    "metric": "jod"
  }
}</script>
</figure>

## Encoding performance

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/data/critter",
  "props": {
    "metric": "ssimulacra2",
    "y": "encodeMs"
  }
}</script>
</figure>

## Encoding memory usage

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/data/critter",
  "props": {
    "metric": "ssimulacra2",
    "y": "encodeMemory"
  }
}</script>
</figure>

## Decoding performance

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/data/critter",
  "props": {
    "metric": "ssimulacra2",
    "y": "decodeMs"
  }
}</script>
</figure>

</details>

# Lossy - screenshot

Ok, let's try something other than a photo:

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/CodecCompare",
  "props": {
    "ratio": 1.6479,
    "maxWidth": 730,
    "padding": 10,
    "lossless": "asset-url:./images/screenshot-targets/lossless.jxl",
    "losslessBytes": "asset-size:./images/screenshot-targets/lossless.jxl",
    "initialQuality": 3,
    "initialCodec": "avif",
    "qualities": [
      {
        "target": 45,
        "avif": { "url": "asset-url:./images/screenshot-targets/avif-q0-e0-d8-yuv444-ssimu49.6.avif", "bytes": "asset-size:./images/screenshot-targets/avif-q0-e0-d8-yuv444-ssimu49.6.avif", "score": "49.6" },
        "jxl": { "url": "asset-url:./images/screenshot-targets/jxl-q17-e7-ssimu45.1.jxl", "bytes": "asset-size:./images/screenshot-targets/jxl-q17-e7-ssimu45.1.jxl", "score": "45.1" },
        "jixel": { "url": "asset-url:./images/screenshot-targets/jixel-q9.7-e6-patches-ssimu46.4.jxl", "bytes": "asset-size:./images/screenshot-targets/jixel-q9.7-e6-patches-ssimu46.4.jxl", "score": "46.4" }
      },
      {
        "target": 60,
        "avif": { "url": "asset-url:./images/screenshot-targets/avif-q14-e0-d8-yuv444-ssimu61.5.avif", "bytes": "asset-size:./images/screenshot-targets/avif-q14-e0-d8-yuv444-ssimu61.5.avif", "score": "61.5" },
        "jxl": { "url": "asset-url:./images/screenshot-targets/jxl-q18.1-e7-ssimu72.7.jxl", "bytes": "asset-size:./images/screenshot-targets/jxl-q18.1-e7-ssimu72.7.jxl", "score": "72.7" },
        "jixel": { "url": "asset-url:./images/screenshot-targets/jixel-q22.9-e6-patches-ssimu62.3.jxl", "bytes": "asset-size:./images/screenshot-targets/jixel-q22.9-e6-patches-ssimu62.3.jxl", "score": "62.3" }
      },
      {
        "target": 70,
        "avif": { "url": "asset-url:./images/screenshot-targets/avif-q26-e0-d8-yuv444-ssimu70.3.avif", "bytes": "asset-size:./images/screenshot-targets/avif-q26-e0-d8-yuv444-ssimu70.3.avif", "score": "70.3" },
        "jxl": { "url": "asset-url:./images/screenshot-targets/jxl-q18.1-e7-ssimu72.7.jxl", "bytes": "asset-size:./images/screenshot-targets/jxl-q18.1-e7-ssimu72.7.jxl", "score": "72.7" },
        "jixel": { "url": "asset-url:./images/screenshot-targets/jixel-q48.5-e6-patches-ssimu70.2.jxl", "bytes": "asset-size:./images/screenshot-targets/jixel-q48.5-e6-patches-ssimu70.2.jxl", "score": "70.2" }
      },
      {
        "target": 80,
        "avif": { "url": "asset-url:./images/screenshot-targets/avif-q50-e0-d8-yuv444-ssimu80.4.avif", "bytes": "asset-size:./images/screenshot-targets/avif-q50-e0-d8-yuv444-ssimu80.4.avif", "score": "80.4" },
        "jxl": { "url": "asset-url:./images/screenshot-targets/jxl-q39.4-e7-ssimu80.2.jxl", "bytes": "asset-size:./images/screenshot-targets/jxl-q39.4-e7-ssimu80.2.jxl", "score": "80.2" },
        "jixel": { "url": "asset-url:./images/screenshot-targets/jixel-q76.8-e6-patches-ssimu80.1.jxl", "bytes": "asset-size:./images/screenshot-targets/jixel-q76.8-e6-patches-ssimu80.1.jxl", "score": "80.1" }
      },
      {
        "target": 90,
        "avif": { "url": "asset-url:./images/screenshot-targets/avif-q82-e0-d8-yuv444-ssimu90.1.avif", "bytes": "asset-size:./images/screenshot-targets/avif-q82-e0-d8-yuv444-ssimu90.1.avif", "score": "90.1" },
        "jxl": { "url": "asset-url:./images/screenshot-targets/jxl-q79.6-e7-ssimu90.0.jxl", "bytes": "asset-size:./images/screenshot-targets/jxl-q79.6-e7-ssimu90.0.jxl", "score": "90.0" },
        "jixel": { "url": "asset-url:./images/screenshot-targets/jixel-q89.8-e6-patches-ssimu90.2.jxl", "bytes": "asset-size:./images/screenshot-targets/jixel-q89.8-e6-patches-ssimu90.2.jxl", "score": "90.2" }
      }
    ]
  }
}</script>
</figure>

The results of the benchmark:

- **File size: <span class="winner-avif">AVIF wins</span>, by a lot.** At default efforts, the best JPEG XL image is 73–89% larger than the AVIF image at medium/high quality (jixel), and 29–44% larger at very high quality (libjxl). At maximum efforts, the best JPEG XL image (jixel 'extraslow' with patches) is 23–73% larger than AVIF (s0).
- **libjxl can't produce anything between SSIMULACRA2 ~45 and ~78** at its default effort (~45 and ~75 at higher efforts). jixel doesn't have this problem.
- **jixel's patches feature helps a lot with this image**, but it's off by default. With patches, jixel's files are 10–29% smaller at its higher efforts, from SSIMULACRA2 ~65 upwards. Patches have no effect at jixel's default 'fast' setting.
- **Encode time: <span class="winner-avif">AVIF wins</span>.** At default efforts, jixel is ~50% faster than AVIF, but its files are 70–98% larger. libjxl's default takes 1.7–1.8x as long as AVIF's default, and still produces much bigger files.
- **Encode memory: <span class="winner-avif">AVIF wins</span>.** At default efforts, jixel uses ~40% less memory than AVIF, but again, its files are much larger. libjxl's default uses 1.2–2.2x the memory of AVIF. jixel 'extraslow' with patches gets closest to AVIF's file sizes, but uses ~7.5x the memory of AVIF's default.
- **Decode time: <span class="winner-avif">AVIF wins</span>, by a lot.** Taking the faster of the two JPEG XL encoders' output, JPEG XL takes 2–3.8x as long to decode, depending on browser and quality.
- **Higher effort is more worth it for AVIF on this image.** AVIF's s5 gets you 6–13% smaller files for 2.5–3x the encode time, and s0 gets you 16–23% smaller files for 30–45x the encode time.
- **Higher effort is worth it for jixel, as long as you enable patches.** 'medium' with patches gets you 11–44% smaller files than its default 'fast', for 3–4x the encode time. 'slow' with patches saves another 7–16% for ~1.7x the time of 'medium'. 'extraslow' with patches saves another few percent, but takes ~5x longer than 'slow' and uses ~4.5x the memory.
- **Higher effort is harmful for libjxl.** At very high quality, libjxl's maximum effort produces files 33–40% _larger_ than its default effort, and takes ~7x longer.
- **AVIF's 4:2:0 mode helps at higher qualities.** At SSIMULACRA2 70 and above, it produces files 7–18% smaller than 4:4:4. At lower qualities, it makes no difference.
- **All three encoders produce higher SSIMULACRA2 scores for this image.** Opposite to the weasel image. But, this seems correct. At SSIMULACRA2 70 the artifacts are pretty noticeable around the Firefox logo (to me, anyway), so I'd go with 80, which is where the codecs lean anyway.

Some developers, especially those who've been around as long as I have, seem to think things like screenshots need to be delivered in a lossless format. But I think this is because they're used to formats like JPEG and WebP (and seemingly JPEG XL) which handle this kind of image badly, whereas lossy AVIF handles them really well.

<details>

<summary>Show me the graphs!</summary>

## Image quality

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/data/screenshot",
  "props": {
    "metric": "ssimulacra2"
  }
}</script>
</figure>

I'm not including the ColorVideoVDP chart because the metric doesn't support alpha channels.

## Encoding performance

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/data/screenshot",
  "props": {
    "metric": "ssimulacra2",
    "y": "encodeMs"
  }
}</script>
</figure>

## Encoding memory usage

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/data/screenshot",
  "props": {
    "metric": "ssimulacra2",
    "y": "encodeMemory"
  }
}</script>
</figure>

## Decoding performance

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/data/screenshot",
  "props": {
    "metric": "ssimulacra2",
    "y": "decodeMs"
  }
}</script>
</figure>

The high JPEG XL decoding times here are likely a side effect of it producing much larger files for a given quality.

</details>

# Lossy - illustration

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/CodecCompare",
  "props": {
    "ratio": 0.7499,
    "maxWidth": 799,
    "lossless": "asset-url:./images/cat-illustration-targets/lossless.jxl",
    "losslessBytes": "asset-size:./images/cat-illustration-targets/lossless.jxl",
    "initialQuality": 3,
    "initialCodec": "avif",
    "qualities": [
      {
        "target": 50,
        "avif": { "url": "asset-url:./images/cat-illustration-targets/avif-q20-e0-d8-yuv444-ssimu51.5.avif", "bytes": "asset-size:./images/cat-illustration-targets/avif-q20-e0-d8-yuv444-ssimu51.5.avif", "score": "51.5" },
        "jxl": { "url": "asset-url:./images/cat-illustration-targets/jxl-q18.1-e10-ssimu51.0.jxl", "bytes": "asset-size:./images/cat-illustration-targets/jxl-q18.1-e10-ssimu51.0.jxl", "score": "51.0" },
        "jixel": { "url": "asset-url:./images/cat-illustration-targets/jixel-q18-e6-patches-ssimu51.3.jxl", "bytes": "asset-size:./images/cat-illustration-targets/jixel-q18-e6-patches-ssimu51.3.jxl", "score": "51.3" }
      },
      {
        "target": 60,
        "avif": { "url": "asset-url:./images/cat-illustration-targets/avif-q28-e0-d8-yuv444-ssimu60.3.avif", "bytes": "asset-size:./images/cat-illustration-targets/avif-q28-e0-d8-yuv444-ssimu60.3.avif", "score": "60.3" },
        "jxl": { "url": "asset-url:./images/cat-illustration-targets/jxl-q23.3-e10-ssimu60.0.jxl", "bytes": "asset-size:./images/cat-illustration-targets/jxl-q23.3-e10-ssimu60.0.jxl", "score": "60.0" },
        "jixel": { "url": "asset-url:./images/cat-illustration-targets/jixel-q48.4-e6-patches-ssimu60.4.jxl", "bytes": "asset-size:./images/cat-illustration-targets/jixel-q48.4-e6-patches-ssimu60.4.jxl", "score": "60.4" }
      },
      {
        "target": 70,
        "avif": { "url": "asset-url:./images/cat-illustration-targets/avif-q39-e0-d8-yuv444-ssimu71.5.avif", "bytes": "asset-size:./images/cat-illustration-targets/avif-q39-e0-d8-yuv444-ssimu71.5.avif", "score": "71.5" },
        "jxl": { "url": "asset-url:./images/cat-illustration-targets/jxl-q44.9-e10-ssimu70.2.jxl", "bytes": "asset-size:./images/cat-illustration-targets/jxl-q44.9-e10-ssimu70.2.jxl", "score": "70.2" },
        "jixel": { "url": "asset-url:./images/cat-illustration-targets/jixel-q70.9-e6-patches-ssimu70.2.jxl", "bytes": "asset-size:./images/cat-illustration-targets/jixel-q70.9-e6-patches-ssimu70.2.jxl", "score": "70.2" }
      },
      {
        "target": 80,
        "avif": { "url": "asset-url:./images/cat-illustration-targets/avif-q52-e0-d8-yuv444-ssimu80.2.avif", "bytes": "asset-size:./images/cat-illustration-targets/avif-q52-e0-d8-yuv444-ssimu80.2.avif", "score": "80.2" },
        "jxl": { "url": "asset-url:./images/cat-illustration-targets/jxl-q72.1-e10-ssimu80.0.jxl", "bytes": "asset-size:./images/cat-illustration-targets/jxl-q72.1-e10-ssimu80.0.jxl", "score": "80.0" },
        "jixel": { "url": "asset-url:./images/cat-illustration-targets/jixel-q83.2-e6-patches-ssimu81.0.jxl", "bytes": "asset-size:./images/cat-illustration-targets/jixel-q83.2-e6-patches-ssimu81.0.jxl", "score": "81.0" }
      },
      {
        "target": 90,
        "avif": { "url": "asset-url:./images/cat-illustration-targets/avif-q99-e0-d8-yuv444-ssimu86.6.avif", "bytes": "asset-size:./images/cat-illustration-targets/avif-q99-e0-d8-yuv444-ssimu86.6.avif", "score": "86.6" },
        "jxl": { "url": "asset-url:./images/cat-illustration-targets/jxl-q97.4-e10-ssimu90.1.jxl", "bytes": "asset-size:./images/cat-illustration-targets/jxl-q97.4-e10-ssimu90.1.jxl", "score": "90.1" },
        "jixel": { "url": "asset-url:./images/cat-illustration-targets/jixel-q94.6-e6-patches-ssimu90.0.jxl", "bytes": "asset-size:./images/cat-illustration-targets/jixel-q94.6-e6-patches-ssimu90.0.jxl", "score": "90.0" }
      }
    ]
  }
}</script>
</figure>

In many cases, for largely flat-colour images, you'd use SVG. But sometimes that isn't possible (it's a screenshot), or undesirable, such as this case. This image, [also from Unsplash](https://unsplash.com/illustrations/hands-feeding-orange-cat-a-treat-on-bed-9tXfoalzAqY), is still 1.1 MB as a compressed and minified SVG. This is due to the complexity of the shaded areas. As a result, a raster format wins on file size and decode/draw time.

The results of the benchmark:

- **File size: <span class="winner-avif">AVIF wins</span>, by a lot.** At default efforts, the best JPEG XL image (jixel) is 32–65% larger than the AVIF image up to SSIMULACRA2 80, and ~90% larger beyond that. At maximum efforts, the best JPEG XL image (jixel 'extraslow') is 22–55% larger than AVIF (s0) up to SSIMULACRA2 80, and more beyond that. ColorVideoVDP agrees, and puts the gap at 27–58%.
- **libjxl performs particularly badly with this image.** At default efforts, it's 71–106% larger than AVIF.
- **Lossy AVIF can't reach SSIMULACRA2 90 with this image.** Even at its maximum quality setting, it tops out at ~87, so the 90 example above isn't a totally fair comparison. JPEG XL can reach 90, but the result is 8–50% larger than JPEG XL's lossless version, so you may as well use lossless.
- **Encode time: <span class="winner-avif">AVIF wins</span>.** At default efforts, jixel is 35–44% faster than AVIF, but its files are 32–65% larger, which is a bad trade. jixel needs its 'slow' setting to get within 7–27% of AVIF's default file size, which takes 2.4–2.6x as long as AVIF. libjxl's default takes 1.3–2.3x as long as AVIF's default, and produces much bigger files.
- **Encode memory: <span class="winner-avif">AVIF wins</span>.** At default efforts, jixel uses ~37% less memory than AVIF, but again, its files are much larger. jixel 'slow' uses about the same memory as AVIF, and 'extraslow' uses ~12x. libjxl's default uses 1.5–3x the memory of AVIF.
- **Decode time: <span class="winner-avif">AVIF wins</span>, by a lot.** JPEG XL takes 2–4.6x as long to decode at medium/high quality, narrowing to 1.6–2.1x at very high quality.
- **Higher effort is more worth it for AVIF on this image.** AVIF's s5 gets you 5–8% smaller files for ~2.7x the encode time, and s0 gets you 14–21% smaller files for 35–48x the encode time.
- **Higher effort is worth it for jixel, up to 'slow'.** 'medium' only gets you 4–13% smaller files than its default 'fast', but 'slow' gets you 19–24% smaller files (up to 36% at very high quality), for ~4x the encode time. 'extraslow' saves another 2–3%, but takes 8–9x longer than 'slow' and uses ~11x the memory.
- **jixel's patches feature doesn't help with this image.** Unlike the screenshot, the file sizes are identical with and without it, but it does increase encode time and memory.
- **Higher effort isn't worth it for libjxl.** libjxl's maximum effort gets you 3–9% smaller files than its default, but takes 10–13x longer.
- **AVIF's 4:2:0 mode doesn't help.** SSIMULACRA2 rates it slightly worse than 4:4:4, and ColorVideoVDP rates it slightly better (~3–4%).

<details>

<summary>Show me the graphs!</summary>

## Image quality

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/data/cat-illustration",
  "props": {
    "metric": "ssimulacra2"
  }
}</script>
</figure>

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/data/cat-illustration",
  "props": {
    "metric": "jod"
  }
}</script>
</figure>

## Encoding performance

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/data/cat-illustration",
  "props": {
    "metric": "ssimulacra2",
    "y": "encodeMs"
  }
}</script>
</figure>

## Encoding memory usage

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/data/cat-illustration",
  "props": {
    "metric": "ssimulacra2",
    "y": "encodeMemory"
  }
}</script>
</figure>

## Decoding performance

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/data/cat-illustration",
  "props": {
    "metric": "ssimulacra2",
    "y": "decodeMs"
  }
}</script>
</figure>

</details>

# Lossy - alpha

So far, all the images have been mostly opaque. What about an image with transparency?

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/CodecCompare",
  "props": {
    "ratio": 4.4389,
    "maxWidth": 799,
    "lossless": "asset-url:./images/red-bull-alpha-targets/lossless.jxl",
    "losslessBytes": "asset-size:./images/red-bull-alpha-targets/lossless.jxl",
    "initialQuality": 2,
    "initialCodec": "avif",
    "qualities": [
      {
        "target": 50,
        "avif": { "url": "asset-url:./images/red-bull-alpha-targets/avif-q34-e0-d8-yuv444-ssimu52.5.avif", "bytes": "asset-size:./images/red-bull-alpha-targets/avif-q34-e0-d8-yuv444-ssimu52.5.avif", "score": "52.5" },
        "jxl": { "url": "asset-url:./images/red-bull-alpha-targets/jxl-q43.3-e10-ssimu50.0.jxl", "bytes": "asset-size:./images/red-bull-alpha-targets/jxl-q43.3-e10-ssimu50.0.jxl", "score": "50.0" },
        "jixel": { "url": "asset-url:./images/red-bull-alpha-targets/jixel-q59.3-e6-ssimu50.5.jxl", "bytes": "asset-size:./images/red-bull-alpha-targets/jixel-q59.3-e6-ssimu50.5.jxl", "score": "50.5" }
      },
      {
        "target": 60,
        "avif": { "url": "asset-url:./images/red-bull-alpha-targets/avif-q42-e0-d8-yuv444-ssimu61.0.avif", "bytes": "asset-size:./images/red-bull-alpha-targets/avif-q42-e0-d8-yuv444-ssimu61.0.avif", "score": "61.0" },
        "jxl": { "url": "asset-url:./images/red-bull-alpha-targets/jxl-q60.8-e10-ssimu60.2.jxl", "bytes": "asset-size:./images/red-bull-alpha-targets/jxl-q60.8-e10-ssimu60.2.jxl", "score": "60.2" },
        "jixel": { "url": "asset-url:./images/red-bull-alpha-targets/jixel-q72.7-e6-ssimu60.1.jxl", "bytes": "asset-size:./images/red-bull-alpha-targets/jixel-q72.7-e6-ssimu60.1.jxl", "score": "60.1" }
      },
      {
        "target": 70,
        "avif": { "url": "asset-url:./images/red-bull-alpha-targets/avif-q52-e0-d8-yuv444-ssimu71.4.avif", "bytes": "asset-size:./images/red-bull-alpha-targets/avif-q52-e0-d8-yuv444-ssimu71.4.avif", "score": "71.4" },
        "jxl": { "url": "asset-url:./images/red-bull-alpha-targets/jxl-q74.3-e10-ssimu70.2.jxl", "bytes": "asset-size:./images/red-bull-alpha-targets/jxl-q74.3-e10-ssimu70.2.jxl", "score": "70.2" },
        "jixel": { "url": "asset-url:./images/red-bull-alpha-targets/jixel-q80.3-e6-ssimu70.3.jxl", "bytes": "asset-size:./images/red-bull-alpha-targets/jixel-q80.3-e6-ssimu70.3.jxl", "score": "70.3" }
      },
      {
        "target": 80,
        "avif": { "url": "asset-url:./images/red-bull-alpha-targets/avif-q66-e0-d8-yuv444-ssimu80.7.avif", "bytes": "asset-size:./images/red-bull-alpha-targets/avif-q66-e0-d8-yuv444-ssimu80.7.avif", "score": "80.7" },
        "jxl": { "url": "asset-url:./images/red-bull-alpha-targets/jxl-q85.3-e10-ssimu80.0.jxl", "bytes": "asset-size:./images/red-bull-alpha-targets/jxl-q85.3-e10-ssimu80.0.jxl", "score": "80.0" },
        "jixel": { "url": "asset-url:./images/red-bull-alpha-targets/jixel-q86.3-e6-ssimu80.0.jxl", "bytes": "asset-size:./images/red-bull-alpha-targets/jixel-q86.3-e6-ssimu80.0.jxl", "score": "80.0" }
      },
      {
        "target": 90,
        "avif": { "url": "asset-url:./images/red-bull-alpha-targets/avif-q90-e0-d8-yuv444-ssimu90.1.avif", "bytes": "asset-size:./images/red-bull-alpha-targets/avif-q90-e0-d8-yuv444-ssimu90.1.avif", "score": "90.1" },
        "jxl": { "url": "asset-url:./images/red-bull-alpha-targets/jxl-q95.5-e10-ssimu90.4.jxl", "bytes": "asset-size:./images/red-bull-alpha-targets/jxl-q95.5-e10-ssimu90.4.jxl", "score": "90.4" },
        "jixel": { "url": "asset-url:./images/red-bull-alpha-targets/jixel-q93-e6-ssimu90.1.jxl", "bytes": "asset-size:./images/red-bull-alpha-targets/jixel-q93-e6-ssimu90.1.jxl", "score": "90.1" }
      }
    ]
  }
}</script>
</figure>

There are a few things that make this one different:

- **jixel always encodes the alpha channel losslessly.** It doesn't have a setting for alpha quality. This puts jixel at a big disadvantage with this image. AVIF by default compresses the alpha channel lossily, tracking the main quality setting. libjxl compresses the alpha channel losslessly by default, so watch out for that. For this benchmark, I set libjxl's alpha quality to the same as the main quality.
- **SSIMULACRA2 scores fully-transparent pixels as perfect**, so with lots of transparency, the scores will be higher than they would be for an opaque image.

The results of the benchmark:

- **File size: <span class="winner-avif">AVIF wins</span>, by a lot.** At default efforts, the best JPEG XL image (libjxl) is 31–44% larger than the AVIF image for the same quality. At maximum efforts, it's 61–70% larger. Due to its lossless alpha, jixel is 1.9–3.1x the size of AVIF at default efforts.
- **Encode time: <span class="winner-avif">AVIF wins</span>.** libjxl's default takes 1.2–1.35x as long as AVIF's default, and produces much bigger files. jixel's default is ~2x faster than AVIF, but its files are around 2–3x the size.
- **Encode memory: <span class="winner-avif">AVIF wins</span>.** libjxl's default uses 2.4–2.7x the memory of AVIF's default, although in absolute terms, that's ~120 MB vs ~46 MB. jixel's default uses about the same memory as AVIF, but again, its files are much bigger.
- **Decode time: <span class="winner-avif">AVIF wins</span>.** libjxl's output takes 2–3x as long to decode at medium quality, narrowing to 1.4–1.8x at very high quality. jixel's output decodes faster than libjxl's, and at very high quality it's around the same speed as AVIF. Although, it's slow in Safari at lower qualities, taking ~2.4x as long as AVIF.
- **Higher effort is worth it for AVIF.** AVIF's s5 gets you 4–7% smaller files for 2.3–2.9x the encode time, and s0 gets you 10–15% smaller files for 24–29x the encode time.
- **Higher effort barely helps jixel on this image.** 'extraslow' only gets you 5–8% smaller files than its default 'fast', for 21–26x the encode time.
- **Higher effort is harmful for libjxl.** libjxl's maximum effort produces files up to 8% _larger_ than its default effort, and takes ~6.5x longer.
- **AVIF's 4:2:0 mode is harmful.** It produces files 4–27% larger than 4:4:4, and can't get beyond SSIMULACRA2 ~79.

<details>

<summary>Show me the graphs!</summary>

## Image quality

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/data/red-bull-alpha",
  "props": {
    "metric": "ssimulacra2"
  }
}</script>
</figure>

## Encoding performance

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/data/red-bull-alpha",
  "props": {
    "metric": "ssimulacra2",
    "y": "encodeMs"
  }
}</script>
</figure>

## Encoding memory usage

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/data/red-bull-alpha",
  "props": {
    "metric": "ssimulacra2",
    "y": "encodeMemory"
  }
}</script>
</figure>

## Decoding performance

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/data/red-bull-alpha",
  "props": {
    "metric": "ssimulacra2",
    "y": "decodeMs"
  }
}</script>
</figure>

</details>

# Lossy - small

The images so far have been a similar resolution. Are the results different with smaller images?

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/CodecCompare",
  "props": {
    "ratio": 1.5504,
    "maxWidth": 200,
    "lossless": "asset-url:./images/f1-small-targets/lossless.jxl",
    "losslessBytes": "asset-size:./images/f1-small-targets/lossless.jxl",
    "initialQuality": 2,
    "initialCodec": "avif",
    "qualities": [
      {
        "target": 50,
        "avif": { "url": "asset-url:./images/f1-small-targets/avif-q30-e0-d8-yuv444-ssimu51.2.avif", "bytes": "asset-size:./images/f1-small-targets/avif-q30-e0-d8-yuv444-ssimu51.2.avif", "score": "51.2" },
        "jxl": { "url": "asset-url:./images/f1-small-targets/jxl-q28-e10-ssimu50.7.jxl", "bytes": "asset-size:./images/f1-small-targets/jxl-q28-e10-ssimu50.7.jxl", "score": "50.7" },
        "jixel": { "url": "asset-url:./images/f1-small-targets/jixel-q43.3-e6-ssimu50.5.jxl", "bytes": "asset-size:./images/f1-small-targets/jixel-q43.3-e6-ssimu50.5.jxl", "score": "50.5" }
      },
      {
        "target": 60,
        "avif": { "url": "asset-url:./images/f1-small-targets/avif-q39-e0-d8-yuv444-ssimu60.7.avif", "bytes": "asset-size:./images/f1-small-targets/avif-q39-e0-d8-yuv444-ssimu60.7.avif", "score": "60.7" },
        "jxl": { "url": "asset-url:./images/f1-small-targets/jxl-q43.5-e10-ssimu60.1.jxl", "bytes": "asset-size:./images/f1-small-targets/jxl-q43.5-e10-ssimu60.1.jxl", "score": "60.1" },
        "jixel": { "url": "asset-url:./images/f1-small-targets/jixel-q65.8-e6-ssimu60.2.jxl", "bytes": "asset-size:./images/f1-small-targets/jixel-q65.8-e6-ssimu60.2.jxl", "score": "60.2" }
      },
      {
        "target": 70,
        "avif": { "url": "asset-url:./images/f1-small-targets/avif-q47-e0-d8-yuv444-ssimu70.4.avif", "bytes": "asset-size:./images/f1-small-targets/avif-q47-e0-d8-yuv444-ssimu70.4.avif", "score": "70.4" },
        "jxl": { "url": "asset-url:./images/f1-small-targets/jxl-q62.8-e10-ssimu70.2.jxl", "bytes": "asset-size:./images/f1-small-targets/jxl-q62.8-e10-ssimu70.2.jxl", "score": "70.2" },
        "jixel": { "url": "asset-url:./images/f1-small-targets/jixel-q78.7-e6-ssimu70.1.jxl", "bytes": "asset-size:./images/f1-small-targets/jixel-q78.7-e6-ssimu70.1.jxl", "score": "70.1" }
      },
      {
        "target": 80,
        "avif": { "url": "asset-url:./images/f1-small-targets/avif-q60-e0-d8-yuv444-ssimu80.6.avif", "bytes": "asset-size:./images/f1-small-targets/avif-q60-e0-d8-yuv444-ssimu80.6.avif", "score": "80.6" },
        "jxl": { "url": "asset-url:./images/f1-small-targets/jxl-q78.5-e10-ssimu80.2.jxl", "bytes": "asset-size:./images/f1-small-targets/jxl-q78.5-e10-ssimu80.2.jxl", "score": "80.2" },
        "jixel": { "url": "asset-url:./images/f1-small-targets/jixel-q84.7-e6-ssimu80.2.jxl", "bytes": "asset-size:./images/f1-small-targets/jixel-q84.7-e6-ssimu80.2.jxl", "score": "80.2" }
      },
      {
        "target": 90,
        "avif": { "url": "asset-url:./images/f1-small-targets/avif-q84-e0-d8-yuv444-ssimu90.4.avif", "bytes": "asset-size:./images/f1-small-targets/avif-q84-e0-d8-yuv444-ssimu90.4.avif", "score": "90.4" },
        "jxl": { "url": "asset-url:./images/f1-small-targets/jxl-q93.1-e10-ssimu90.2.jxl", "bytes": "asset-size:./images/f1-small-targets/jxl-q93.1-e10-ssimu90.2.jxl", "score": "90.2" },
        "jixel": { "url": "asset-url:./images/f1-small-targets/jixel-q92.3-e6-ssimu90.6.jxl", "bytes": "asset-size:./images/f1-small-targets/jixel-q92.3-e6-ssimu90.6.jxl", "score": "90.6" }
      }
    ]
  }
}</script>
</figure>

Not really. The results are pretty similar to the full-size F1 image:

- **File size: <span class="winner-avif">AVIF wins</span>**, by about the same margin. At default efforts, the best JPEG XL image is 13–18% larger. At maximum efforts, the gap is slightly bigger than the full-size image, at 12–20%.
- **Encode time & memory: <span class="winner-avif">AVIF wins</span>**, although libjxl's default is now around the same speed as AVIF's default. jixel's default is ~2x faster than AVIF, but its files are 13–18% larger, and this time it uses ~30% more memory. In any case, at default efforts, everything encodes in under 50ms, using under 40 MB, so these differences don't really matter at this size.
- **Decode time: <span class="winner-avif">AVIF wins</span>**, by a similar margin, but again, everything decodes in a few milliseconds.

<details>

<summary>Show me the graphs!</summary>

## Image quality

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/data/f1-small",
  "props": {
    "metric": "ssimulacra2"
  }
}</script>
</figure>

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/data/f1-small",
  "props": {
    "metric": "jod"
  }
}</script>
</figure>

## Encoding performance

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/data/f1-small",
  "props": {
    "metric": "ssimulacra2",
    "y": "encodeMs"
  }
}</script>
</figure>

## Encoding memory usage

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/data/f1-small",
  "props": {
    "metric": "ssimulacra2",
    "y": "encodeMemory"
  }
}</script>
</figure>

## Decoding performance

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/data/f1-small",
  "props": {
    "metric": "ssimulacra2",
    "y": "decodeMs"
  }
}</script>
</figure>

The numbers Safari gives are rounded, so the data is really noisy.

</details>

# Lossy - large

What about an 18 megapixel image?

<figure class="full-figure super-breakout">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/CodecCompare",
  "props": {
    "ratio": 1.5486,
    "maxWidth": 2650,
    "lossless": "asset-url:./images/f1-large-targets/original.jpg",
    "losslessBytes": "asset-size:./images/f1-large-targets/original.jpg",
    "losslessLabel": "Original",
    "initialQuality": 2,
    "initialCodec": "avif",
    "qualities": [
      {
        "target": 50,
        "avif": { "url": "asset-url:./images/f1-large-targets/avif-q16-e0-d8-yuv444-ssimu50.4.avif", "bytes": "asset-size:./images/f1-large-targets/avif-q16-e0-d8-yuv444-ssimu50.4.avif", "score": "50.4" },
        "jxl": { "url": "asset-url:./images/f1-large-targets/jxl-q13.1-e10-ssimu50.0.jxl", "bytes": "asset-size:./images/f1-large-targets/jxl-q13.1-e10-ssimu50.0.jxl", "score": "50.0" },
        "jixel": { "url": "asset-url:./images/f1-large-targets/jixel-q15.8-e6-ssimu50.0.jxl", "bytes": "asset-size:./images/f1-large-targets/jixel-q15.8-e6-ssimu50.0.jxl", "score": "50.0" }
      },
      {
        "target": 60,
        "avif": { "url": "asset-url:./images/f1-large-targets/avif-q26-e0-d8-yuv444-ssimu60.1.avif", "bytes": "asset-size:./images/f1-large-targets/avif-q26-e0-d8-yuv444-ssimu60.1.avif", "score": "60.1" },
        "jxl": { "url": "asset-url:./images/f1-large-targets/jxl-q20.9-e10-ssimu60.0.jxl", "bytes": "asset-size:./images/f1-large-targets/jxl-q20.9-e10-ssimu60.0.jxl", "score": "60.0" },
        "jixel": { "url": "asset-url:./images/f1-large-targets/jixel-q48.3-e6-ssimu60.1.jxl", "bytes": "asset-size:./images/f1-large-targets/jixel-q48.3-e6-ssimu60.1.jxl", "score": "60.1" }
      },
      {
        "target": 70,
        "avif": { "url": "asset-url:./images/f1-large-targets/avif-q39-e0-d8-yuv444-ssimu70.4.avif", "bytes": "asset-size:./images/f1-large-targets/avif-q39-e0-d8-yuv444-ssimu70.4.avif", "score": "70.4" },
        "jxl": { "url": "asset-url:./images/f1-large-targets/jxl-q41.2-e10-ssimu70.0.jxl", "bytes": "asset-size:./images/f1-large-targets/jxl-q41.2-e10-ssimu70.0.jxl", "score": "70.0" },
        "jixel": { "url": "asset-url:./images/f1-large-targets/jixel-q64.9-e6-ssimu70.1.jxl", "bytes": "asset-size:./images/f1-large-targets/jixel-q64.9-e6-ssimu70.1.jxl", "score": "70.1" }
      },
      {
        "target": 80,
        "avif": { "url": "asset-url:./images/f1-large-targets/avif-q59-e0-d8-yuv444-ssimu80.4.avif", "bytes": "asset-size:./images/f1-large-targets/avif-q59-e0-d8-yuv444-ssimu80.4.avif", "score": "80.4" },
        "jxl": { "url": "asset-url:./images/f1-large-targets/jxl-q71.8-e10-ssimu80.0.jxl", "bytes": "asset-size:./images/f1-large-targets/jxl-q71.8-e10-ssimu80.0.jxl", "score": "80.0" },
        "jixel": { "url": "asset-url:./images/f1-large-targets/jixel-q81.8-e6-ssimu80.0.jxl", "bytes": "asset-size:./images/f1-large-targets/jixel-q81.8-e6-ssimu80.0.jxl", "score": "80.0" }
      },
      {
        "target": 90,
        "avif": { "url": "asset-url:./images/f1-large-targets/avif-q90-e0-d8-yuv444-ssimu90.5.avif", "bytes": "asset-size:./images/f1-large-targets/avif-q90-e0-d8-yuv444-ssimu90.5.avif", "score": "90.5" },
        "jxl": { "url": "asset-url:./images/f1-large-targets/jxl-q93.3-e10-ssimu90.0.jxl", "bytes": "asset-size:./images/f1-large-targets/jxl-q93.3-e10-ssimu90.0.jxl", "score": "90.0" },
        "jixel": { "url": "asset-url:./images/f1-large-targets/jixel-q92.5-e6-ssimu90.1.jxl", "bytes": "asset-size:./images/f1-large-targets/jixel-q92.5-e6-ssimu90.1.jxl", "score": "90.1" }
      }
    ]
  }
}</script>
</figure>

Mostly the same story as the regular F1 image, but with a few differences:

- **File size: <span class="winner-avif">AVIF wins</span> at medium/high quality, by more than the regular image.** At default efforts, the best JPEG XL image is 18–46% larger, and at maximum efforts, 28–54% larger.
- **But JPEG XL catches up at very high quality.** Around SSIMULACRA2 85, libjxl's default matches AVIF's default, and at maximum efforts, jixel 'extraslow' is ~6% smaller than AVIF s0. jixel 'slow' is 10–13% smaller than AVIF's default from SSIMULACRA2 80 upwards.
- **Encode time: <span class="winner-avif">AVIF wins</span> at medium/high quality, but <span class="winner-jixel">JPEG XL (jixel) wins</span> at very high quality.** AVIF's default takes ~0.5 seconds, whereas libjxl's default takes 1–2 seconds. jixel's default is ~2x faster than AVIF, but at medium/high quality its files are 29–57% larger. At very high quality, that drops to 6–12% larger, which seems like a reasonable trade-off for the speed. And jixel 'slow' produces files around the same size as AVIF s5, while being 33–41% faster.
- **Encode memory: <span class="winner-avif">AVIF wins</span>, and the costs are now significant.** AVIF's default uses ~560 MB. libjxl's default uses ~2.5 GB at medium/high quality. jixel's default uses ~35% less than AVIF, and 'slow' uses ~18% less than AVIF s5. At maximum efforts, libjxl uses 5–6.4 GB, and jixel 'extraslow' uses 6.8–8.3 GB.
- **Decode time: <span class="winner-avif">AVIF wins</span>** at medium/high quality, by a similar margin to the regular image. jixel images take over 5x as long as AVIF to decode in Safari at those qualities. At very high quality, JPEG XL decodes faster than AVIF in Chrome.

<details>

<summary>Show me the graphs!</summary>

## Image quality

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/data/f1-large",
  "props": {
    "metric": "ssimulacra2"
  }
}</script>
</figure>

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/data/f1-large",
  "props": {
    "metric": "jod"
  }
}</script>
</figure>

## Encoding performance

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/data/f1-large",
  "props": {
    "metric": "ssimulacra2",
    "y": "encodeMs"
  }
}</script>
</figure>

## Encoding memory usage

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/data/f1-large",
  "props": {
    "metric": "ssimulacra2",
    "y": "encodeMemory"
  }
}</script>
</figure>

## Decoding performance

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/data/f1-large",
  "props": {
    "metric": "ssimulacra2",
    "y": "decodeMs"
  }
}</script>
</figure>

</details>

# Quality stability

Another criticism I've heard levelled at AVIF is that its quality is unreliable. As in, a single quality setting is great for some images, but no good for others, meaning for automatically encoded images, you need to pick a higher quality setting to be safe, resulting in larger file sizes than necessary for some images.

For the images I've looked at so far, I encoded them with `avifenc -q 50`, `cjxl -q 70`, and jixel at quality 80, and recorded the resulting SSIMULACRA2 scores:

<style>
  /* Codec colours, matching the charts. Column headings, or row headings for
     groups of rows. */
  .data-table thead .avif,
  .data-table tbody.avif tr th[scope='row'] {
    background: #dbe8f8;
    color: #0b3d7a;
  }
  .data-table thead .jxl,
  .data-table tbody.jxl tr th[scope='row'] {
    background: #fbe1d6;
    color: #8a3410;
  }
  .data-table thead .jixel,
  .data-table tbody.jixel tr th[scope='row'] {
    background: #d6f2e8;
    color: #0b5c40;
  }
  .data-table thead .webp {
    background: #ece0f7;
    color: #4a1c6e;
  }
</style>

<div class="data-table">
<table>
<thead>
<tr><th class="row-heading" rowspan="2" scope="col">Image</th><th class="avif" colspan="4" scope="colgroup">AVIF</th><th class="jxl group-start" colspan="2" scope="colgroup">JPEG XL</th><th class="jixel group-start" colspan="2" scope="colgroup">JPEG XL (jixel)</th></tr>
<tr><th class="avif" scope="col">s6 4:4:4</th><th class="avif" scope="col">s0 4:4:4</th><th class="avif" scope="col">s6 4:2:0</th><th class="avif" scope="col">s0 4:2:0</th><th class="jxl group-start" scope="col">e7</th><th class="jxl" scope="col">e10</th><th class="jixel group-start" scope="col">fast</th><th class="jixel" scope="col">extraslow</th></tr>
</thead>
<tbody>
<tr><th scope="row"><a href="#lossy---f1-image">F1</a></th><td class="avif">74.6</td><td class="avif">75.9</td><td class="avif">73.4</td><td class="avif">73.8</td><td class="jxl group-start">79.2</td><td class="jxl">78.0</td><td class="jixel group-start">75.3</td><td class="jixel">77.3</td></tr>
<tr><th scope="row"><a href="#lossy---small">F1 (small)</a></th><td class="avif">70.9</td><td class="avif">73.5</td><td class="avif">68.4</td><td class="avif">69.5</td><td class="jxl group-start">75.6</td><td class="jxl">73.9</td><td class="jixel group-start">70.6</td><td class="jixel">72.6</td></tr>
<tr><th scope="row"><a href="#lossy---large">F1 (large)</a></th><td class="avif">77.0</td><td class="avif">77.4</td><td class="avif">76.2</td><td class="avif">76.6</td><td class="jxl group-start">80.1</td><td class="jxl">79.2</td><td class="jixel group-start">77.5</td><td class="jixel">78.9</td></tr>
<tr><th scope="row"><a href="#lossy---people">People</a></th><td class="avif">70.7</td><td class="avif">72.0</td><td class="avif">69.8</td><td class="avif">70.5</td><td class="jxl group-start">69.6</td><td class="jxl">70.3</td><td class="jixel group-start">69.1</td><td class="jixel">72.3</td></tr>
<tr><th scope="row"><a href="#lossy---red-panda">Red panda</a></th><td class="avif">67.5</td><td class="avif">68.8</td><td class="avif">67.0</td><td class="avif">67.2</td><td class="jxl group-start">69.5</td><td class="jxl">68.4</td><td class="jixel group-start">69.2</td><td class="jixel">72.3</td></tr>
<tr><th scope="row"><a href="#lossy---weasel">Weasel</a></th><td class="avif">56.7</td><td class="avif">57.2</td><td class="avif">56.0</td><td class="avif">56.3</td><td class="jxl group-start">56.6</td><td class="jxl">55.4</td><td class="jixel group-start">54.9</td><td class="jixel">59.4</td></tr>
<tr><th scope="row"><a href="#lossy---screenshot">Screenshot</a></th><td class="avif">80.2</td><td class="avif">80.4</td><td class="avif">82.3</td><td class="avif">81.9</td><td class="jxl group-start">86.5</td><td class="jxl">87.6</td><td class="jixel group-start">76.6</td><td class="jixel">80.3</td></tr>
<tr><th scope="row"><a href="#lossy---illustration">Illustration</a></th><td class="avif">78.6</td><td class="avif">79.7</td><td class="avif">76.8</td><td class="avif">77.9</td><td class="jxl group-start">80.3</td><td class="jxl">78.5</td><td class="jixel group-start">75.4</td><td class="jixel">77.7</td></tr>
<tr><th scope="row"><a href="#lossy---alpha">Alpha</a></th><td class="avif">67.3</td><td class="avif">69.8</td><td class="avif">63.6</td><td class="avif">64.9</td><td class="jxl group-start">69.4</td><td class="jxl">66.9</td><td class="jixel group-start">66.8</td><td class="jixel">69.6</td></tr>
</tbody>
</table>
</div>

The behaviour of the codecs here seems really similar. All produce a range of SSIMULACRA2 scores, and they all go higher or lower for the same images.

And I think this is ok? Like, all three go for a lower quality for the Weasel picture, which removed noise without reducing quality of the image subject. With the screenshot, all go for a higher quality, which seems justified to my eyes.

Obviously this is a small sample size, but I haven't seen anything that suggests using a single quality setting is a risk, for any of the three codecs.

Also see [Halide Compression's deeper dive into this](https://halide.cx/blog/consistency/).

# Progressive

Both AVIF and JPEG XL are capable of showing something progressively as the image loads. Chrome and Firefox support progressive JPEG XL, whereas only Chrome supports progressive AVIF. So, and I say this through gritted teeth, this next demo is best viewed in Chrome (I have [a Firefox patch in progress](https://bugzilla.mozilla.org/show_bug.cgi?id=2072679)):

<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/ProgressiveDemo",
  "exportName": "Styles",
  "staticOnly": true
}</script>

<figure class="full-figure super-breakout">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/ProgressiveDemo",
  "props": {
    "page": "/2026/jpeg-xl-vs-avif/demos/progressive/",
    "ratio": 1.5486,
    "maxWidth": 2650,
    "initialBytes": 11500,
    "images": [
      { "label": "AVIF", "url": "asset-url:./images/progressive/f1-large.avif", "bytes": "asset-size:./images/progressive/f1-large.avif" },
      { "label": "JPEG XL", "url": "asset-url:./images/progressive/f1-large.jxl", "bytes": "asset-size:./images/progressive/f1-large.jxl" }
    ]
  }
}</script>
</figure>

This is the 18 megapixel image again, so if you're viewing this on a device with a smaller screen, you're not getting the full effect.

Progressive AVIF and JPEG XL work very differently. With JPEG XL, you can opt into the data being stored in such a way that a decoder can render low resolution versions, before it brings in the higher resolution tiles. jixel recently (like, yesterday at time of writing) added support for this too. It's called "progressive DC", and it's the most important kind of progressive rendering for JPEG XL.

With AVIF, progressions work more like frames of a video. You provide up to four frames, so that's three phases before the final image. Again, like a video, each frame can use data from the previous frame as an optimisation. An advantage of this is you can choose exactly how those frames look. In the example above, I went with a single preview frame: a 1/8th resolution version, with a bit of blurring. But, your preview frames can be completely different images if you really want.

There's a lack of data when it comes to progressive images and user experience, so these are just my reckons:

If you're on a bad connection, data doesn't arrive gradually like some throttling tools will have you believe. It tends to come in bursts. So, there's little benefit to progressive rendering on smaller images, and I'm not sure that many progressive phases is particularly useful.

I think that it's nice to have a _representative_ preview for images that may take some time to load. I've experienced this personally, where a site or app has given me something clearly not-loaded, but with enough detail to know what's coming. That's useful to me, as I can decide things like, if it's worth waiting for the whole thing. This is also why I think things like BlurHash are cute, but useless. They're not a _representative_ preview, so there's little a user can do with the information provided.

The preview frame I chose for the AVIF is enough to tell it's an open-wheel race car. If you know F1, you'll know what team it is. You might even know where the photo was taken. And it delivers that in ~11.5 kB.

The JPEG XL gets a BlurHash-like preview on screen in ~2 kB, but it takes until ~63 kB to match the preview quality of the AVIF. After that, it continues to improve gradually, providing a more detailed and higher quality image as more data arrives.

However, I'm not convinced this is a good user experience, as it presents the user with something they may mistake for fully-loaded, but poor quality. For example:

<script type="component">{
  "module": "shared/ImageTabs",
  "exportName": "Styles",
  "staticOnly": true
}</script>

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/ImageTabs",
  "props": {
    "ratio": 1.71275456,
    "initial": 0,
    "images": [
      ["80%", "asset-url:./images/progressive-error/not-loaded.avif"],
      ["100%", "asset-url:./images/progressive-error/loaded.avif"]
    ]
  }
}</script>
</figure>

Here's a crop of the JPEG XL, 80% loaded. It seems reasonable that someone would look at that, and just assume I took the picture badly, leaving parts out of focus. You could probably convince me that blurring the ApeCoin logo is a societal benefit, but it still feels like a suboptimal user experience.

AVIF's system gives me more control, but it's also more complex.

## Progressive overhead

I encoded the large F1 image with and without progressive rendering enabled, adjusting the quality setting to keep the SSIMULACRA2 score around 70:

- **With libjxl, progressive is basically free.** In fact, it produced files 6–10% smaller. At default effort, it was also faster to encode, and used less memory. Decoding was ~10% faster in Firefox, but 12–20% slower in Chrome and Safari.
- **With jixel, it depends on the effort.** For jixel, I used progressive DC, with the centre of the image loading first. At jixel's default ('fast'), progressive made the file 12% bigger. At 'extraslow', it made the file 10% smaller, and 11% faster to encode, although it used 17% more memory. Decoding was barely affected, other than being 7–9% slower in Chrome.
- **But ColorVideoVDP is less kind to progressive jixel.** It rates jixel's progressive files slightly lower than the non-progressive versions, whereas it rates libjxl's progressive files slightly higher. Taking that into account, progressive jixel at 'extraslow' is only ~2% smaller than non-progressive, and at 'fast' it's around 18% bigger.
- **Regular progressive AVIF has a bigger cost when it comes to encoding.** It uses around twice the memory, and at default effort (s6), it takes twice as long to encode. At s0, encode time is only 9% longer, but the file is 14% bigger. And this is pure encode time - it doesn't factor in how you might generate the preview frame, e.g. adding some blur.
- **Regular progressive AVIF is 29–44% slower to decode in Chrome**, although the difference is smaller in other browsers (6–15%). Since Chrome is the only browser that supports rendering the progressive frames, that might explain it. Although Firefox and Safari are still having to decode the progressive frame, as the main image builds upon it.
- **With AVIF, making the final frame a keyframe fixes the decoding overhead**, at the cost of a longer encode time. At maximum effort, it results in a smaller file too, only 3–5% bigger than the non-progressive version. You could call this cheating, as there's now no 'progression' in terms of data - it's just two images in one. But, if it's a better user experience, who cares?
- **Even with the overhead, progressive AVIF wins on decoding time, and usually on file size.** The progressive AVIFs are 152–181 kB. jixel's 'extraslow' progressive JPEG XL is in that range at 166 kB, but jixel's default produces 252 kB, and libjxl's progressive files are 233–242 kB. The AVIFs decode 1.6–6x faster, with the biggest gap in Safari, which is particularly slow to decode jixel's files.

<details>

<summary>Show me the data!</summary>

<div class="data-table breakout">
<table>
<thead>
<tr><th class="row-heading" rowspan="2" scope="col">Encoding</th><th rowspan="2" scope="col">Quality</th><th rowspan="2" scope="col">File size</th><th rowspan="2" scope="col">SSIMU2</th><th class="group-start" colspan="2" scope="colgroup">Encode</th><th class="group-start" colspan="3" scope="colgroup">Decode</th></tr>
<tr><th class="group-start" scope="col">Time</th><th scope="col">Memory</th><th class="group-start" scope="col">Firefox</th><th scope="col">Chrome</th><th scope="col">Safari</th></tr>
</thead>
<tbody class="avif">
<tr><th scope="row">AVIF s6</th><td>41</td><td>175 kB</td><td>69.9</td><td class="group-start">405 ms</td><td>381 MB</td><td class="group-start">46 ms</td><td>41 ms</td><td>53 ms</td></tr>
<tr><th scope="row">AVIF s6 prog</th><td>42</td><td>173 kB</td><td>70.2</td><td class="group-start">815 ms</td><td>764 MB</td><td class="group-start">49 ms</td><td>53 ms</td><td>56 ms</td></tr>
<tr class="change"><th scope="row">Change</th><td>+1</td><td>−1%</td><td>+0.3</td><td class="group-start">+101%</td><td>+101%</td><td class="group-start">+7%</td><td>+29%</td><td>+6%</td></tr>
<tr><th scope="row">AVIF s6 prog <code>-k</code></th><td>42</td><td>181 kB</td><td>70.3</td><td class="group-start">1.09 s</td><td>740 MB</td><td class="group-start">45 ms</td><td>35 ms</td><td>49 ms</td></tr>
<tr class="change"><th scope="row">Change</th><td>+1</td><td>+3%</td><td>+0.4</td><td class="group-start">+169%</td><td>+94%</td><td class="group-start">−2%</td><td>−15%</td><td>−8%</td></tr>
</tbody>
<tbody class="avif">
<tr><th scope="row">AVIF s0</th><td>41</td><td>145 kB</td><td>69.9</td><td class="group-start">8.00 s</td><td>450 MB</td><td class="group-start">47 ms</td><td>41 ms</td><td>48 ms</td></tr>
<tr><th scope="row">AVIF s0 prog</th><td>42</td><td>165 kB</td><td>70.5</td><td class="group-start">8.71 s</td><td>847 MB</td><td class="group-start">54 ms</td><td>59 ms</td><td>52 ms</td></tr>
<tr class="change"><th scope="row">Change</th><td>+1</td><td>+14%</td><td>+0.6</td><td class="group-start">+9%</td><td>+88%</td><td class="group-start">+15%</td><td>+44%</td><td>+8%</td></tr>
<tr><th scope="row">AVIF s0 prog <code>-k</code></th><td>41</td><td>152 kB</td><td>69.6</td><td class="group-start">10.72 s</td><td>798 MB</td><td class="group-start">47 ms</td><td>40 ms</td><td>46 ms</td></tr>
<tr class="change"><th scope="row">Change</th><td>±0</td><td>+5%</td><td>−0.3</td><td class="group-start">+34%</td><td>+77%</td><td class="group-start">±0%</td><td>−2%</td><td>−4%</td></tr>
</tbody>
<tbody class="jxl">
<tr><th scope="row">JPEG XL e7</th><td>35.5</td><td>258 kB</td><td>70.0</td><td class="group-start">1.62 s</td><td>2.49 GB</td><td class="group-start">131 ms</td><td>105 ms</td><td>162 ms</td></tr>
<tr><th scope="row">JPEG XL e7 prog</th><td>25.3</td><td>233 kB</td><td>70.0</td><td class="group-start">1.40 s</td><td>1.90 GB</td><td class="group-start">119 ms</td><td>121 ms</td><td>183 ms</td></tr>
<tr class="change"><th scope="row">Change</th><td>−10.2</td><td>−10%</td><td>±0.0</td><td class="group-start">−14%</td><td>−24%</td><td class="group-start">−9%</td><td>+15%</td><td>+13%</td></tr>
</tbody>
<tbody class="jxl">
<tr><th scope="row">JPEG XL e10</th><td>41.2</td><td>258 kB</td><td>70.0</td><td class="group-start">22.74 s</td><td>5.67 GB</td><td class="group-start">132 ms</td><td>107 ms</td><td>162 ms</td></tr>
<tr><th scope="row">JPEG XL e10 prog</th><td>30.2</td><td>242 kB</td><td>70.0</td><td class="group-start">25.54 s</td><td>6.08 GB</td><td class="group-start">119 ms</td><td>128 ms</td><td>181 ms</td></tr>
<tr class="change"><th scope="row">Change</th><td>−11.0</td><td>−6%</td><td>±0.0</td><td class="group-start">+12%</td><td>+7%</td><td class="group-start">−10%</td><td>+20%</td><td>+12%</td></tr>
</tbody>
<tbody class="jixel">
<tr><th scope="row">jixel fast</th><td>66.1</td><td>225 kB</td><td>70.0</td><td class="group-start">304 ms</td><td>361 MB</td><td class="group-start">131 ms</td><td>89 ms</td><td>281 ms</td></tr>
<tr><th scope="row">jixel fast prog</th><td>60.1</td><td>252 kB</td><td>70.0</td><td class="group-start">333 ms</td><td>393 MB</td><td class="group-start">132 ms</td><td>97 ms</td><td>290 ms</td></tr>
<tr class="change"><th scope="row">Change</th><td>−6.0</td><td>+12%</td><td>±0.0</td><td class="group-start">+10%</td><td>+9%</td><td class="group-start">+1%</td><td>+9%</td><td>+3%</td></tr>
</tbody>
<tbody class="jixel">
<tr><th scope="row">jixel extraslow</th><td>65.1</td><td>185 kB</td><td>70.0</td><td class="group-start">16.75 s</td><td>7.61 GB</td><td class="group-start">141 ms</td><td>92 ms</td><td>294 ms</td></tr>
<tr><th scope="row">jixel extraslow prog</th><td>55.4</td><td>166 kB</td><td>70.0</td><td class="group-start">14.90 s</td><td>8.94 GB</td><td class="group-start">140 ms</td><td>98 ms</td><td>293 ms</td></tr>
<tr class="change"><th scope="row">Change</th><td>−9.7</td><td>−10%</td><td>±0.0</td><td class="group-start">−11%</td><td>+17%</td><td class="group-start">−1%</td><td>+7%</td><td>±0%</td></tr>
</tbody>
</table>
</div>

</details>

# Lossy - HDR

Let's get back to lossy compression, but this time HDR! There are a few ways to encode HDR images, and we're going to look at two.

**Perceptual Quantization** (PQ) tells each pixel what to be. Each value maps to an absolute brightness, up to 10,000 nits, with the curve shaped so the data is spent where our eyes are most sensitive. If the image asks for colours and brightnesses the display can't show (no consumer display can hit 10,000 nits), the browser/OS has to tone-map it down, and how well that's done varies between platforms.

**Gain maps** are different. The main image is a regular SDR image (usually), and alongside it is a 'gain map', which applies a brightness and colour change to each pixel to achieve the HDR version.

This has two benefits:

1. The same image will look exactly as you want on an SDR display - the gain map is simply ignored.
2. If the display supports HDR, but maybe not as much as the image needs (for example, the screen is at low or maximum brightness), the browser/OS can apply as much of the gain map as it can handle.

CSS and `<picture>` let us serve an SDR or PQ image to the user via [the `dynamic-range` media query](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/dynamic-range), but then you're relying on tone mapping in cases where the browser signals HDR support, but it doesn't support the full range.

Although the JPEG XL format supports gain maps, no browser handles them, and the encoding story is messy.

AVIF supports gain maps, and you encode them by providing two images: the SDR image and the HDR image. It uses those to calculate and encode the gain map.

<style>
  @media (dynamic-range: high) {
    .sdr-only {
      display: none;
    }
  }
</style>

<div class="sdr-only">

**Your browser/screen doesn't support HDR**, so the PQ images will look bad.

</div>

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/CodecCompare",
  "props": {
    "ratio": 0.7516,
    "maxWidth": 799,
    "lossless": "asset-url:./images/neon-hdr-10bit-targets/jxl-lossless-e10.jxl",
    "losslessBytes": "asset-size:./images/neon-hdr-10bit-targets/jxl-lossless-e10.jxl",
    "formats": [
      { "key": "avif", "label": "AVIF gain map", "color": "#2a78d6", "lossless": "asset-url:./images/neon-hdr-10bit-targets/avif-lossless-s0-d10-yuv444.avif", "losslessBytes": "asset-size:./images/neon-hdr-10bit-targets/avif-lossless-s0-d10-yuv444.avif" },
      { "key": "avifPq", "label": "AVIF PQ", "color": "#0b3d7a" },
      { "key": "jxl", "label": "JPEG XL PQ (libjxl)", "color": "#eb6834" },
      { "key": "jixel", "label": "JPEG XL PQ (jixel)", "color": "#1baf7a" }
    ],
    "initialQuality": 2,
    "initialCodec": "avif",
    "qualities": [
      {
        "target": 50,
        "avif": { "url": "asset-url:./images/neon-hdr-10bit-targets/avif-q39-e0-d10-yuv444-ssimu50.1.avif", "bytes": "asset-size:./images/neon-hdr-10bit-targets/avif-q39-e0-d10-yuv444-ssimu50.1.avif", "score": "50.1" },
        "avifPq": { "url": "asset-url:./images/neon-hdr-10bit-targets/avif-q49-e0-d10-yuv444-pq-ssimu50.8.avif", "bytes": "asset-size:./images/neon-hdr-10bit-targets/avif-q49-e0-d10-yuv444-pq-ssimu50.8.avif", "score": "50.8" },
        "jxl": { "url": "asset-url:./images/neon-hdr-10bit-targets/jxl-q51.3-e10-ssimu50.1.jxl", "bytes": "asset-size:./images/neon-hdr-10bit-targets/jxl-q51.3-e10-ssimu50.1.jxl", "score": "50.1" },
        "jixel": { "url": "asset-url:./images/neon-hdr-10bit-targets/jixel-q63.6-e6-ssimu50.0.jxl", "bytes": "asset-size:./images/neon-hdr-10bit-targets/jixel-q63.6-e6-ssimu50.0.jxl", "score": "50.0" }
      },
      {
        "target": 60,
        "avif": { "url": "asset-url:./images/neon-hdr-10bit-targets/avif-q49-e0-d10-yuv444-ssimu61.5.avif", "bytes": "asset-size:./images/neon-hdr-10bit-targets/avif-q49-e0-d10-yuv444-ssimu61.5.avif", "score": "61.5" },
        "avifPq": { "url": "asset-url:./images/neon-hdr-10bit-targets/avif-q59-e0-d10-yuv444-pq-ssimu60.2.avif", "bytes": "asset-size:./images/neon-hdr-10bit-targets/avif-q59-e0-d10-yuv444-pq-ssimu60.2.avif", "score": "60.2" },
        "jxl": { "url": "asset-url:./images/neon-hdr-10bit-targets/jxl-q66.7-e10-ssimu60.2.jxl", "bytes": "asset-size:./images/neon-hdr-10bit-targets/jxl-q66.7-e10-ssimu60.2.jxl", "score": "60.2" },
        "jixel": { "url": "asset-url:./images/neon-hdr-10bit-targets/jixel-q76.2-e6-ssimu61.0.jxl", "bytes": "asset-size:./images/neon-hdr-10bit-targets/jixel-q76.2-e6-ssimu61.0.jxl", "score": "61.0" }
      },
      {
        "target": 70,
        "avif": { "url": "asset-url:./images/neon-hdr-10bit-targets/avif-q62-e0-d10-yuv444-ssimu70.2.avif", "bytes": "asset-size:./images/neon-hdr-10bit-targets/avif-q62-e0-d10-yuv444-ssimu70.2.avif", "score": "70.2" },
        "avifPq": { "url": "asset-url:./images/neon-hdr-10bit-targets/avif-q75-e0-d10-yuv444-pq-ssimu70.5.avif", "bytes": "asset-size:./images/neon-hdr-10bit-targets/avif-q75-e0-d10-yuv444-pq-ssimu70.5.avif", "score": "70.5" },
        "jxl": { "url": "asset-url:./images/neon-hdr-10bit-targets/jxl-q78.2-e10-ssimu70.0.jxl", "bytes": "asset-size:./images/neon-hdr-10bit-targets/jxl-q78.2-e10-ssimu70.0.jxl", "score": "70.0" },
        "jixel": { "url": "asset-url:./images/neon-hdr-10bit-targets/jixel-q83.5-e6-ssimu70.0.jxl", "bytes": "asset-size:./images/neon-hdr-10bit-targets/jixel-q83.5-e6-ssimu70.0.jxl", "score": "70.0" }
      },
      {
        "target": 80,
        "avif": { "url": "asset-url:./images/neon-hdr-10bit-targets/avif-q84-e0-d10-yuv444-ssimu80.7.avif", "bytes": "asset-size:./images/neon-hdr-10bit-targets/avif-q84-e0-d10-yuv444-ssimu80.7.avif", "score": "80.7" },
        "avifPq": { "url": "asset-url:./images/neon-hdr-10bit-targets/avif-q90-e0-d10-yuv444-pq-ssimu80.7.avif", "bytes": "asset-size:./images/neon-hdr-10bit-targets/avif-q90-e0-d10-yuv444-pq-ssimu80.7.avif", "score": "80.7" },
        "jxl": { "url": "asset-url:./images/neon-hdr-10bit-targets/jxl-q89.6-e10-ssimu80.0.jxl", "bytes": "asset-size:./images/neon-hdr-10bit-targets/jxl-q89.6-e10-ssimu80.0.jxl", "score": "80.0" },
        "jixel": { "url": "asset-url:./images/neon-hdr-10bit-targets/jixel-q91.6-e6-ssimu80.0.jxl", "bytes": "asset-size:./images/neon-hdr-10bit-targets/jixel-q91.6-e6-ssimu80.0.jxl", "score": "80.0" }
      }
    ]
  }
}</script>
</figure>

At medium brightnesses, on an HDR screen, the gain map and PQ images look the same. At maximum brightnesses, on my Pixel 10 Pro and 2024 MacBook Pro, the PQ images get a bit blown out, and the gain map image looks better. At low brightness on my Pixel 10 Pro, again the gain map image looks better.

This is because, at extreme brightness levels, the device doesn't have the full HDR headroom to display the image, and gain maps can handle these cases better. So, although gain maps seem to add a lot to the file size, I think it's worth it.

Maybe there's a future where tone mapping gets much better, and the advantage of a gain map becomes less significant.

Regular SSIMULACRA2 only understands SDR, so for this image, the scores come from an experimental HDR mode in [fast-ssim2](https://github.com/imazen/fast-ssim2). That means these scores can't be compared to the SSIMULACRA2 scores elsewhere in this article. ColorVideoVDP handles HDR natively, and here it's modelling a 1,500 nit HDR monitor.

**The two metrics disagree a lot with this image**. And they don't factor in the benefits of gain maps, so treat these results as a comparison between the PQ variants:

- **File size: <span class="winner-jxl">JPEG XL wins</span>, but the metrics disagree on how much, and with which encoder.**
  - According to HDR SSIMULACRA2, jixel's default ranges from 8% smaller to 3% larger than PQ AVIF's default, and libjxl is 5–33% larger. At maximum efforts, jixel 'extraslow' is up to 15% smaller than PQ AVIF s0.
  - According to ColorVideoVDP, libjxl is the clear winner. At default efforts, it's 28–53% smaller than PQ AVIF, and 17–37% smaller than gain map AVIF. At maximum efforts, it's up to 23% smaller than the best AVIF, but jixel 'extraslow' is roughly level with it, ranging from 12% smaller to 14% larger.
- **The metrics also disagree about gain maps.** HDR SSIMULACRA2 says gain map AVIF is 31–38% larger than PQ AVIF, but ColorVideoVDP says gain map AVIF is 11–25% _smaller_ than PQ AVIF.
- **Encode time: <span class="winner-jixel">JPEG XL (jixel) wins</span>.** At default efforts, jixel is ~2x faster than PQ AVIF, and produces files around the same size or smaller, depending on the metric. libjxl's default is 5–47% slower than PQ AVIF, but given ColorVideoVDP's view of the file sizes, that's a reasonable trade. Gain map AVIF is the slowest, as it's calculating a gain map, then essentially encoding two images: ~3x slower than PQ AVIF.
- **Encode memory: <span class="winner-jixel">JPEG XL (jixel) wins</span>.** At default efforts, jixel uses ~30% less memory than PQ AVIF. libjxl's default uses ~1.9x the memory of PQ AVIF, and gain map AVIF uses ~1.55x. At maximum efforts, libjxl uses ~6x the memory of PQ AVIF's default, and jixel 'extraslow' uses ~10x.
- **Decode time: <span class="winner-avif">AVIF wins</span>.** PQ and gain map AVIF decode at around the same speed. JPEG XL takes 1.2–1.7x as long to decode in Chrome, although it's slightly faster at the top of the quality range. In Safari, it takes 1.6–3x as long. Firefox is particularly slow with these HDR JPEG XL images, taking ~4x as long as AVIF at all qualities. We're [working on it](https://bugzilla.mozilla.org/show_bug.cgi?id=2081138).
- **Higher effort is worth it for AVIF.** For gain map AVIF, s5 gets you 9–12% smaller files for ~1.9x the encode time, and s0 gets you 14–20% smaller files for ~11x the encode time. For PQ AVIF, s0 gets you 14–19% smaller files, for 17–20x the encode time.
- **Higher effort is worth it for jixel, up to 'slow'.** 'slow' gets you 7–32% smaller files than its default 'fast', for ~3.8x the encode time. 'extraslow' saves another 1–9%, but takes ~10x longer than 'slow' and uses ~8.5x the memory. jixel only has a few data points for this image, so these numbers are rough.
- **Higher effort isn't worth it for libjxl.** libjxl's maximum effort gets you 2–7% smaller files than its default, but takes ~15x longer.

It will be interesting to see how JPEG XL handles gain maps once they're fully supported.

By the way, these are signs that [indicate whether my cats are inside or outside](https://www.tiktok.com/@jaffathejake/video/7524298335885217046), and the little display indicates how long until their next automated feed.

<details>

<summary>Show me the graphs!</summary>

## Image quality

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/data/neon-hdr-10bit",
  "props": {
    "metric": "ssimulacra2"
  }
}</script>
</figure>

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/data/neon-hdr-10bit",
  "props": {
    "metric": "jod"
  }
}</script>
</figure>

## Encoding performance

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/data/neon-hdr-10bit",
  "props": {
    "metric": "ssimulacra2",
    "y": "encodeMs"
  }
}</script>
</figure>

## Encoding memory usage

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/data/neon-hdr-10bit",
  "props": {
    "metric": "ssimulacra2",
    "y": "encodeMemory"
  }
}</script>
</figure>

## Decoding performance

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/data/neon-hdr-10bit",
  "props": {
    "metric": "ssimulacra2",
    "y": "decodeMs"
  }
}</script>
</figure>

</details>

# JPEG transcoding

JPEG XL allows you to convert an existing JPEG to JPEG XL without additional loss. I tested this with the F1 image at a range of sizes and JPEG qualities:

- **The JPEG XL is 9–20% smaller than the JPEG.** The saving grows with resolution, from ~9% at 400 pixels wide to ~20% at 4,900 pixels wide. The saving is slightly smaller at higher JPEG qualities. libjxl and jixel produce practically identical file sizes.
- **For small images, JPEG XL is slower to decode than JPEG**, taking 1.4–2.7x as long, depending on the browser. But it's just a millisecond or two.
- **For larger images, JPEG XL is faster to decode in Chrome and Safari.** From ~1,000 pixels wide, it matches JPEG, and at the largest sizes, it decodes in around half the time. In Firefox, it ends up around the same speed as JPEG.
- **jixel's output is slightly slower to decode than libjxl's** in Chrome and Firefox, by up to ~25%. But again, these are small numbers, at most a few milliseconds.

Of course, if you have the original, you'd be way better off creating a proper new lossy version with AVIF or JPEG XL, but it's pretty cool that the JPEGs end up smaller, and sometimes faster to decode. Although, I suppose this is just pointing to a missing optimisation in browser JPEG decoders.

<details>

<summary>Show me the graphs!</summary>

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/data/f1-large-transcode",
  "props": {
    "y": "bytes"
  }
}</script>
</figure>

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/data/f1-large-transcode",
  "props": {
    "y": "decodeMs"
  }
}</script>
</figure>

</details>

# Lossless

It is very rare to need lossless images on the web. As we've already seen, even for things like screenshots and illustrations, lossy AVIF handles them really well. Ironically, this page is one of the outliers, because I wanted to show the compressed versions vs their lossless counterparts. Thankfully, JPEG XL is great at lossless!

The results:

- **File size: <span class="winner-jxl">JPEG XL wins</span>.** At default efforts, libjxl produces the smallest files for every image except the illustration, where WebP matches it. WebP is 9–17% larger for photos, and AVIF is 33–122% larger. At highest efforts, libjxl and jixel are within a few percent of each other, WebP is 5–44% larger, and AVIF is 29–176% larger.
- **Encode time: <span class="winner-jxl">JPEG XL wins</span>.** libjxl's default takes 0.1–0.5 seconds, which is faster than WebP's default, and similar to AVIF's default, while producing smaller files than both.
- **Encode memory: <span class="winner-jxl">JPEG XL wins</span> or <span class="winner-webp">WebP wins</span>, depending on the image.** WebP's default uses around half the memory of libjxl's default (55–110 MB vs 110–250 MB), but libjxl's files are smaller. For photos, WebP can't match libjxl's default file size even at its maximum effort, which uses more memory than libjxl's default. For the screenshot, they use around the same memory, but libjxl's file is smaller. The illustration is the exception: WebP's maximum effort produces a file 20% smaller than libjxl's default, using the same memory.
- **Decode time: <span class="winner-webp">WebP wins</span> or <span class="winner-jxl">JPEG XL wins</span>, depending on the image.** WebP decodes photos in 17–39 ms in all browsers, and the screenshot in ~5 ms. libjxl's output takes 1–2.2x as long in Chrome, 1.4–2.7x as long in Firefox, and 2.1–3.2x as long in Safari. But for photos, JPEG XL's smaller files more than make up for this on a first load, unless the connection is really fast. For the screenshot and illustration, WebP's decode advantage wins. Lossless AVIF is particularly slow to decode, taking up to 4x as long as libjxl's output in Chrome.
- **Lossless AVIF is bad.** It's significantly larger than the others, and slower to decode.
- **jixel's 'medium' setting is the sweet spot for file size.** It beats libjxl's default on every image (0.5–23% smaller), and is within 2–3% of the best result for photos, taking 0.4–0.7 seconds. But it uses 470–670 MB of memory, and its output is slower to decode than libjxl's, particularly in Safari.
- **jixel's 'slow' and 'extraslow' output is very slow to decode for photos.** ~200–290 ms, compared to 22–95 ms for libjxl's output. That's 2–13x slower, depending on the browser. It's also slow for the alpha image, at 80–123 ms compared to 14–27 ms for libjxl's output. This doesn't happen with the screenshot and illustration. This means, for my use-case on this page, I'd avoid it.
- **libjxl's maximum effort is very slow.** It produces files 2–7% smaller than its default for photos, and ~25% smaller for the screenshot and illustration, but takes 9–46 seconds, which is 50–180x as long as its default. jixel gets the same results in a couple of seconds.
- **jixel's default 'fast' setting isn't great for lossless.** It's the fastest encoder by far (40–80 ms), but its files are 16–32% larger than libjxl's default for photos, and ~80% larger for the screenshot and illustration.
- **jixel's patches feature helps a bit with the screenshot** (4–9% smaller), but makes no difference to the illustration.

<details>

<summary>Show me the data!</summary>

## File size

<div class="data-table">
<table>
<thead>
<tr><th class="row-heading" rowspan="2" scope="col">Image</th><th class="group-start" colspan="4" scope="colgroup">Default effort</th><th class="group-start" colspan="4" scope="colgroup">Highest effort</th></tr>
<tr><th class="jxl group-start" scope="col">libjxl</th><th class="jixel" scope="col">jixel</th><th class="webp" scope="col">WebP</th><th class="avif" scope="col">AVIF</th><th class="jxl group-start" scope="col">libjxl</th><th class="jixel" scope="col">jixel</th><th class="webp" scope="col">WebP</th><th class="avif" scope="col">AVIF</th></tr>
</thead>
<tbody>
<tr><th scope="row"><a href="#lossy---f1-image">F1</a></th><td class="group-start">1.07 MB</td><td>+32%</td><td>+16%</td><td>+49%</td><td class="group-start">1.01 MB</td><td>−1%</td><td>+20%</td><td>+47%</td></tr>
<tr><th scope="row"><a href="#lossy---people">People</a></th><td class="group-start">1.39 MB</td><td>+22%</td><td>+17%</td><td>+49%</td><td class="group-start">1.34 MB</td><td>−1%</td><td>+19%</td><td>+44%</td></tr>
<tr><th scope="row"><a href="#lossy---red-panda">Red panda</a></th><td class="group-start">1.78 MB</td><td>+17%</td><td>+9%</td><td>+40%</td><td class="group-start">1.74 MB</td><td>−1%</td><td>+11%</td><td>+31%</td></tr>
<tr><th scope="row"><a href="#lossy---weasel">Weasel</a></th><td class="group-start">2.91 MB</td><td>+16%</td><td>+13%</td><td>+96%</td><td class="group-start">2.79 MB</td><td>−2%</td><td>+17%</td><td>+29%</td></tr>
<tr><th scope="row"><a href="#lossy---screenshot">Screenshot</a></th><td class="group-start">92 kB</td><td>+81%</td><td>+9%</td><td>+122%</td><td class="group-start">68 kB</td><td>+6%</td><td>+44%</td><td>+176%</td></tr>
<tr><th scope="row"><a href="#lossy---illustration">Illustration</a></th><td class="group-start">361 kB</td><td>+78%</td><td>−1%</td><td>+100%</td><td class="group-start">273 kB</td><td>−6%</td><td>+5%</td><td>+139%</td></tr>
<tr><th scope="row"><a href="#lossy---alpha">Alpha</a></th><td class="group-start">522 kB</td><td>+21%</td><td>+12%</td><td>+33%</td><td class="group-start">487 kB</td><td>−3%</td><td>+13%</td><td>+32%</td></tr>
</tbody>
</table>
</div>

## Encoding performance

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/data/lossless",
  "props": {
    "x": "encodeMs"
  }
}</script>
</figure>

## Encoding memory usage

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/data/lossless",
  "props": {
    "x": "encodeMemory"
  }
}</script>
</figure>

## Decoding performance

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jpeg-xl-vs-avif/data/lossless",
  "props": {
    "x": "decodeMs"
  }
}</script>
</figure>

</details>

# Animation

Animated image formats are dumb and animated JPEG XL is no exception. Video formats are better at video. They're built for it. They're optimised for it. Not just in terms of encoding, but also in terms of playback.

I encoded a short clip, and the animated AVIF was 725 kB, and the JPEG XL was 2.17 MB for the same ColorVideoVDP score (9.5).

The JPEG XL is super noisy compared to the AVIF, because each frame is encoded individually, and arttifacts land in different places per frame.

AVIF is basically the keyframe format of AV1 video, with a bunch of still-image-specific optimisations thrown in. Animated AVIF however, is pretty much just a repackaging of AV1 video. You can convert an AV1 MP4 to AVIF and back losslessly - it's just a container change. That's why it performs so much better, because it's built for motion.

However, animated AVIF plays like shit in Chrome and Safari. It's fine in Firefox, so this is purely an implementation problem. But… `<video muted autoplay>` is right there.

The interesting detail of animated AVIF is that it supports transparency, whereas AV1 video doesn't. But really, that just highlights that [it's dumb that AV1 _didn't_ support transparency](/2024/video-with-transparency/).

No, I'm not adding a demo. I don't want it on my server. Use video formats for video.

# And that's it!

I already gave you my [conclusions](#conclusions) at the start, so I guess I'm ready to hit publish.

I'm a little nervous about this, because discourse around JPEG XL can get a little… weird. I see a lot of conspiracy theories about Google trying to 'silence' JPEG XL, even though one of the leads of the project worked at Google, as part of a team that were working on JPEG XL. That [same leader claimed](https://x.com/jyzg/status/1592811472073416704) that the post-COVID layoffs wouldn't have happened if companies simply used JPEG XL. I was recently [called a racist](https://github.com/web-platform-dx/developer-signals/issues/215#issuecomment-4930663101) for asking about JPEG XL use-cases. This kind of thing just doesn't happen with other technologies and standards I follow. So, urm, I'm kinda bracing for impact here.

My first version of this article was very negative about JPEG XL, but then I heard about jixel, and honestly, I'm really excited about it. There's serious competition between AVIF and JPEG XL now, and whoever wins, we'll all benefit from better image compression.
