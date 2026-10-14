---
title: JPEG XL vs AVIF for web use-cases
date: 2026-10-14 01:00:00
summary: TODO
meta: TODO
code: shiki
#image: './img.png'
comments: none
---

JPEG XL has now landed across all major browsers, so I figured I'd take a closer look at what it's good/bad at compared to other formats.

# Conclusions

I'll go into full detail, with examples and benchmarks, but for those of you who don't have the time, here are the headlines:

**For photos, from medium all the way through to very-high quality, AVIF almost always provides better compression efficiency than JPEG XL.** JPEG XL files tend to be around 20% larger, but sometimes up to 75% larger.

Visually lossless quality isn't often needed on the web, but in those cases the winner isn't so clear. At default effort levels, JPEG XL tends to do better. At high effort levels, AVIF tends to do better.

**Some photos can be outliers, where JPEG XL is close to, or even outperforms AVIF**, although this seems to be rare, and by small amounts, such as 5%. So if you're wanting to find the absolutely best way to compress a single image, it's worth testing both formats.

**For things like screenshots and graphics with large areas of flat color, JPEG XL is a really poor choice.** Compared to AVIF, the equivalent JPEG XL is typically 40–100% larger, and over 2x the size when both encoders are pushed to max effort.

**AVIF's 4:2:0 mode (half colour resolution) doesn't seem worth it.** It has small benefits in terms of encoding and decoding time, but it makes higher qualities difficult to reach, and on some image can cause noticeable color artifacts on edges. It's better to default to 4:4:4 (full colour resolution).

**JPEG XL images generally take longer to decode**. At high quality, JPEG XL images take 1.4x-4.9x longer to decode compared to AVIF. At very high qualities, the gap narrows, and in Chrome in particular, JPEG XL can decode slightly faster.

**JPEG XL images take longer to encode**. At default effort levels, high quality (where AVIF outperforms JPEG XL in terms of file size), JPEG XL takes ~70% longer to encode. For larger images, this increases to ~2.2x longer. This finding seems opposite to perceived wisdom.

**JPEG XL uses more memory during encoding**. At default effort levels, high quality (where AVIF outperforms JPEG XL in terms of file size), JPEG XL uses ~2-3x the memory. For larger images, this increases to over 4x. For an 18 megapixel image, this is 533 MB for AVIF, and 2.3 GB for JPEG XL.

**For lossy images, cjxl's higher effort modes are a risky choice.** They offer very marginal benefits in terms of file size, and sometimes even increase the file size. They also use over 2x the memory compared to the default effort level.

**jixel's higher effort modes are worth it, up to a point.** Compared to its default ('fast'), 'slow' produces files 5–20% smaller, for 3–5x the encode time. 'extraslow' squeezes out a little more, but takes 25–80x longer than 'fast', and uses over 10x the memory.

**AVIF's higher effort modes have benefits.** They take much longer, but if you're willing to wait, you'll get a better result. Compared to the default (speed 6), speed 0 produces files 8–20% smaller, but takes 20–50x longer to encode.

**Quality settings seem reliable for both AVIF and JPEG XL.** If you encode with, say, `avifenc -q 50` and `cjxl -q 70`, the output quality doesn't vary unexpectedly, and cases where they vary seem reasonable. They vary on the same images, and in the same directions.

TODO lossless here.

**At 'visually lossless' quality, JPEG XL can produce files that are larger than its lossless mode.** Particularly when it comes to screenshots and illustrations.

TODOs

- Benfits to next level up on AVIF? TODO how does this compare encoding time.

# Methodology

I 'created' (yes, sorry) [a benchmarking script](https://github.com/jakearchibald/image-codec-bench), that encodes images using various codecs at various settings, and records various details.

I'm using the latest released versions of the image codecs, which at time of writing is:

- [avifenc](https://github.com/aomediacodec/libavif) 1.4.2
- [cjxl](https://github.com/libjxl/libjxl) 0.12.0
- [jixel](https://github.com/awxkee/jixel) 0.4.0 (git `b45195a`), a second JPEG XL encoder
- [cwebp](https://chromium.googlesource.com/webm/libwebp/) 1.6.0 (lossless WebP is used later in the article)

I chose a selection of images, and encoded most of them to a width of 1598 pixels - which is 2x the maximum width images appear on this blog. This means they [look sharp on high density displays](/2021/serving-sharp-images-to-high-density-screens/), which most users have. As a result, if you're viewing this on a small screen, or a low density screen, you're not getting the full experience.

I ran these benchmarks on my 2024 MacBook M4 Pro.

<script type="component">{
  "module": "shared/demos/2026/jxl-on-the-web/CodecCompare",
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
  "module": "shared/demos/2026/jxl-on-the-web/CodecCompare",
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
        "jixel": { "url": "asset-url:./images/f1-targets/jixel-q16.7-e6-ssimu50.0.jxl", "bytes": "asset-size:./images/f1-targets/jixel-q16.7-e6-ssimu50.0.jxl", "score": "50.0" }
      },
      {
        "target": 60,
        "avif": { "url": "asset-url:./images/f1-targets/avif-q34-e0-d8-yuv444-ssimu60.1.avif", "bytes": "asset-size:./images/f1-targets/avif-q34-e0-d8-yuv444-ssimu60.1.avif", "score": "60.1" },
        "jxl": { "url": "asset-url:./images/f1-targets/jxl-q29.4-e10-ssimu60.1.jxl", "bytes": "asset-size:./images/f1-targets/jxl-q29.4-e10-ssimu60.1.jxl", "score": "60.1" },
        "jixel": { "url": "asset-url:./images/f1-targets/jixel-q52.1-e6-ssimu60.1.jxl", "bytes": "asset-size:./images/f1-targets/jixel-q52.1-e6-ssimu60.1.jxl", "score": "60.1" }
      },
      {
        "target": 70,
        "avif": { "url": "asset-url:./images/f1-targets/avif-q44-e0-d8-yuv444-ssimu70.2.avif", "bytes": "asset-size:./images/f1-targets/avif-q44-e0-d8-yuv444-ssimu70.2.avif", "score": "70.2" },
        "jxl": { "url": "asset-url:./images/f1-targets/jxl-q53-e10-ssimu70.0.jxl", "bytes": "asset-size:./images/f1-targets/jxl-q53-e10-ssimu70.0.jxl", "score": "70.0" },
        "jixel": { "url": "asset-url:./images/f1-targets/jixel-q72.3-e6-ssimu70.3.jxl", "bytes": "asset-size:./images/f1-targets/jixel-q72.3-e6-ssimu70.3.jxl", "score": "70.3" }
      },
      {
        "target": 80,
        "avif": { "url": "asset-url:./images/f1-targets/avif-q58-e0-d8-yuv444-ssimu80.1.avif", "bytes": "asset-size:./images/f1-targets/avif-q58-e0-d8-yuv444-ssimu80.1.avif", "score": "80.1" },
        "jxl": { "url": "asset-url:./images/f1-targets/jxl-q73.5-e10-ssimu80.1.jxl", "bytes": "asset-size:./images/f1-targets/jxl-q73.5-e10-ssimu80.1.jxl", "score": "80.1" },
        "jixel": { "url": "asset-url:./images/f1-targets/jixel-q83.1-e6-ssimu80.7.jxl", "bytes": "asset-size:./images/f1-targets/jixel-q83.1-e6-ssimu80.7.jxl", "score": "80.7" }
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

For archival, I'd tend towards near-lossless qualities, but if I'm just displaying an illustrative image on my blog, performance is more important to me. I'm personally happy with the 70 result above. If you zoom in, you can see the quality loss, but if I was really concerned about the zoom-in case, I'd use something like the [`VisualViewport` API](https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport) to load in a higher resolution image when that happens, rather than make the download bigger for everyone.

At lower qualities you can see the difference in strategy between the codecs. The detail loss is around the same, but AVIF tends to smooth things out compared to the original, whereas JPEG XL seems to introduce rougher patterns.

Also, I feel that, at medium quality (50), the AVIF and libjxl look better than the jixel version. The jixel version has a lot of visble noise around the BWT logo, and the Microsoft text on the front wing is way less legable. It makes me wonder about the metric a bit.

Anyway, here's my interpretation of the results:

- **File size: <span class="winner-avif">AVIF wins</span>.** At default efforts, the best JPEG XL image is 14–17% larger than the AVIF image for the same quality. jixel is the better JPEG XL encoder at medium/high quality, and cjxl is slightly better at very high quality. At maximum efforts, the best JPEG XL image (jixel 'extraslow') is 9–16% larger than AVIF (s0).
- **jixel at its slowest setting matches AVIF's default effort**, and edges slightly ahead at very high quality (around 5% smaller).
- **Encode time: <span class="winner-avif">AVIF wins</span>.** At default efforts, jixel is 17–31% faster than AVIF, but its files are 14–21% larger. To match the file size of AVIF's default, jixel needs its 'extraslow' setting, which takes 16–23x as long as AVIF. cjxl's default takes 1.5–2x as long as AVIF's default, and still produces bigger files.
- **Encode memory: <span class="winner-avif">AVIF wins</span>.** At default efforts, jixel uses 10–13% less memory than AVIF, but again, its files are 14–21% larger. To match the file size of AVIF's default, jixel 'extraslow' uses ~11x the memory. cjxl's default uses 2–3x the memory of AVIF, and its higher efforts use ~7x.
- **Decode time: <span class="winner-avif">AVIF wins</span>.** JPEG XL takes 2–3x as long to decode at medium quality, narrowing to ~1.5–1.8x at very high quality. Safari's JPEG XL decoder is the slowest.
- **Higher effort is worth it for AVIF.** AVIF's s5 gets you ~10% smaller files for ~3x the encode time.
- **Higher effort is worth it for jixel too, up to 'slow'.** 'slow' gets you 8–13% smaller files than its default 'fast', for ~3.4x the encode time. 'extraslow' saves another 3–6%, but takes ~7x longer than 'slow' and uses ~8x the memory. Even so, AVIF still wins when given the same encode time: AVIF s5 takes about as long as jixel 'slow', and its files are ~13% smaller.
- **Higher effort isn't worth it for cjxl.** cjxl's maximum effort is barely any better than its default, but takes ~18x longer.
- **AVIF's 4:2:0 mode doesn't help much.** It's slightly faster to encode/decode, and uses less memory, but the files aren't meaningfully smaller, and it struggles to reach higher qualities.

Here's the full data, so you can make up your own mind:

<details>

<summary>Show me the graphs!</summary>

## Image quality

Ok, let's get to our first graph, the SSIMULACRA2 scores:

<script type="component">{
  "module": "shared/demos/2026/jxl-on-the-web/QualityChart",
  "exportName": "Styles",
  "staticOnly": true
}</script>

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jxl-on-the-web/data/f1",
  "props": {
    "metric": "ssimulacra2"
  }
}</script>
</figure>

There's going to be a lot of these graphs, so here's what's going on:

- **The x-axis is visual quality** according to SSIMULACRA2.
- **The y-axis is file size**. Lower is better, for a given visual quality.
- **The orange lines represent JPEG XL encoded with cjxl.**
- **The green lines represent JPEG XL encoded with jixel.**
- **The blue lines represent AVIF.**
- **The dashed blue lines represent AVIF with its color data at half resolution.** Known as 4:2:0, or chroma subsampling.
- **The darker lines represent higher effort levels for that codec.** cjxl calls this 'effort', so the e10 line is the top effort. Annoyingly, avifenc calls this 'speed', so the s0 line is the top effort. jixel names its levels, from 'fast' (its default) to 'extraslow'.
- **Only the default and maximum efforts are shown initially.** Click the legend to toggle the others.

Here are the quality results using a different quality metric, [ColorVideoVDP](https://github.com/gfxdisp/colorvideovdp):

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jxl-on-the-web/data/f1",
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
  "module": "shared/demos/2026/jxl-on-the-web/data/f1",
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
  "module": "shared/demos/2026/jxl-on-the-web/data/f1",
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
  "module": "shared/demos/2026/jxl-on-the-web/data/f1",
  "props": {
    "metric": "ssimulacra2",
    "y": "decodeMs"
  }
}</script>
</figure>

JPEG XL becomes suddenly faster to decode at very high quality settings (but still slower than AVIF). I think this is due to an edge preserving filter that does more work at lower quality settings.

</details>

# Lossy - people

I've heard people say that AVIF's tendency to smooth out details makes it bad for human faces, so I picked this image [from Unplash](https://unsplash.com/photos/two-smiling-women-looking-at-a-smartphone-together-_t15AWPJNmg).

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/demos/2026/jxl-on-the-web/CodecCompare",
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
        "jixel": { "url": "asset-url:./images/women-with-phones-targets/jixel-q44.1-e6-ssimu50.1.jxl", "bytes": "asset-size:./images/women-with-phones-targets/jixel-q44.1-e6-ssimu50.1.jxl", "score": "50.1" }
      },
      {
        "target": 60,
        "avif": { "url": "asset-url:./images/women-with-phones-targets/avif-q40-e0-d8-yuv444-ssimu61.3.avif", "bytes": "asset-size:./images/women-with-phones-targets/avif-q40-e0-d8-yuv444-ssimu61.3.avif", "score": "61.3" },
        "jxl": { "url": "asset-url:./images/women-with-phones-targets/jxl-q52.5-e10-ssimu60.1.jxl", "bytes": "asset-size:./images/women-with-phones-targets/jxl-q52.5-e10-ssimu60.1.jxl", "score": "60.1" },
        "jixel": { "url": "asset-url:./images/women-with-phones-targets/jixel-q65.9-e6-ssimu60.2.jxl", "bytes": "asset-size:./images/women-with-phones-targets/jixel-q65.9-e6-ssimu60.2.jxl", "score": "60.2" }
      },
      {
        "target": 70,
        "avif": { "url": "asset-url:./images/women-with-phones-targets/avif-q49-e0-d8-yuv444-ssimu70.7.avif", "bytes": "asset-size:./images/women-with-phones-targets/avif-q49-e0-d8-yuv444-ssimu70.7.avif", "score": "70.7" },
        "jxl": { "url": "asset-url:./images/women-with-phones-targets/jxl-q69.6-e10-ssimu70.1.jxl", "bytes": "asset-size:./images/women-with-phones-targets/jxl-q69.6-e10-ssimu70.1.jxl", "score": "70.1" },
        "jixel": { "url": "asset-url:./images/women-with-phones-targets/jixel-q78.7-e6-ssimu70.0.jxl", "bytes": "asset-size:./images/women-with-phones-targets/jixel-q78.7-e6-ssimu70.0.jxl", "score": "70.0" }
      },
      {
        "target": 80,
        "avif": { "url": "asset-url:./images/women-with-phones-targets/avif-q63-e0-d8-yuv444-ssimu80.2.avif", "bytes": "asset-size:./images/women-with-phones-targets/avif-q63-e0-d8-yuv444-ssimu80.2.avif", "score": "80.2" },
        "jxl": { "url": "asset-url:./images/women-with-phones-targets/jxl-q82.4-e10-ssimu80.1.jxl", "bytes": "asset-size:./images/women-with-phones-targets/jxl-q82.4-e10-ssimu80.1.jxl", "score": "80.1" },
        "jixel": { "url": "asset-url:./images/women-with-phones-targets/jixel-q86-e6-ssimu80.1.jxl", "bytes": "asset-size:./images/women-with-phones-targets/jixel-q86-e6-ssimu80.1.jxl", "score": "80.1" }
      },
      {
        "target": 90,
        "avif": { "url": "asset-url:./images/women-with-phones-targets/avif-q88-e0-d8-yuv444-ssimu90.3.avif", "bytes": "asset-size:./images/women-with-phones-targets/avif-q88-e0-d8-yuv444-ssimu90.3.avif", "score": "90.3" },
        "jxl": { "url": "asset-url:./images/women-with-phones-targets/jxl-q94.1-e10-ssimu90.1.jxl", "bytes": "asset-size:./images/women-with-phones-targets/jxl-q94.1-e10-ssimu90.1.jxl", "score": "90.1" },
        "jixel": { "url": "asset-url:./images/women-with-phones-targets/jixel-q93.2-e6-ssimu90.0.jxl", "bytes": "asset-size:./images/women-with-phones-targets/jixel-q93.2-e6-ssimu90.0.jxl", "score": "90.0" }
      }
    ]
  }
}</script>
</figure>

The results of the benchmark for this image:

- **File size: <span class="winner-avif">AVIF wins</span>.** At default efforts, the best JPEG XL image is 17–24% larger than the AVIF image for the same quality. jixel is the better JPEG XL encoder across the whole quality range this time. cjxl is 30–50% larger than AVIF, which is a much bigger gap than the F1 image. At maximum efforts, the best JPEG XL image (jixel 'extraslow') is 13–18% larger than AVIF (s0).
- **jixel at its slowest setting doesn't quite match AVIF's default effort** this time. It's ~5% larger at medium/high quality, and only edges ahead (~3% smaller) at very high quality.
- **Encode time: <span class="winner-avif">AVIF wins</span>.** At default efforts, jixel is 25–40% faster than AVIF, but its files are 17–24% larger. Even jixel's 'extraslow' setting, which takes 23–34x as long as AVIF, only matches AVIF's default file size at very high quality. cjxl's default takes 1.5–2.2x as long as AVIF's default, and still produces bigger files.
- **Encode memory: <span class="winner-avif">AVIF wins</span>.** At default efforts, jixel uses 5–13% less memory than AVIF, but again, its files are 17–24% larger. jixel 'extraslow' gets closest to AVIF's default file size, but uses ~11x the memory. cjxl's default uses 2–3.3x the memory of AVIF, and its higher efforts use ~7x.
- **Decode time: <span class="winner-avif">AVIF wins</span>.** JPEG XL takes 2–2.9x as long to decode at medium quality, narrowing to ~1.3–1.7x at very high quality. At the very top of the quality range, cjxl images decode as fast as AVIF in Chrome, but not in the other browsers.
- **Higher effort is worth it for AVIF.** AVIF's s5 gets you 5–8% smaller files for ~3x the encode time. That's a smaller gain than the F1 image.
- **Higher effort is worth it for jixel too, up to 'slow'.** 'slow' gets you 8–13% smaller files than its default 'fast', for ~3.7x the encode time. 'extraslow' saves another 4–6%, but takes ~10x longer than 'slow' and uses ~8x the memory. AVIF still wins when given the same encode time: AVIF s5 takes about as long as jixel 'slow', and its files are 9–17% smaller.
- **Higher effort is somewhat worth it for cjxl on this image.** Unlike the F1 image, cjxl's maximum effort gets you 4–11% smaller files than its default. But it takes ~10x longer, and it still produces much bigger files than AVIF at its default effort.
- **AVIF's 4:2:0 mode doesn't help much.** Same as the F1 image. ColorVideoVDP gives it a small (~4%) advantage, but SSIMULACRA2 doesn't.

At lower qualities, you can see the smoothing on the face, but it's the same for both AVIF and JPEG XL.

<details>

<summary>Show me the graphs!</summary>

## Image quality

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jxl-on-the-web/data/women-with-phones",
  "props": {
    "metric": "ssimulacra2"
  }
}</script>
</figure>

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jxl-on-the-web/data/women-with-phones",
  "props": {
    "metric": "jod"
  }
}</script>
</figure>

## Encoding performance

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jxl-on-the-web/data/women-with-phones",
  "props": {
    "metric": "ssimulacra2",
    "y": "encodeMs"
  }
}</script>
</figure>

## Encoding memory usage

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jxl-on-the-web/data/women-with-phones",
  "props": {
    "metric": "ssimulacra2",
    "y": "encodeMemory"
  }
}</script>
</figure>

## Decoding performance

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jxl-on-the-web/data/women-with-phones",
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
  "module": "shared/demos/2026/jxl-on-the-web/CodecCompare",
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
        "jixel": { "url": "asset-url:./images/red-panda-targets/jixel-q49.9-e6-ssimu50.1.jxl", "bytes": "asset-size:./images/red-panda-targets/jixel-q49.9-e6-ssimu50.1.jxl", "score": "50.1" }
      },
      {
        "target": 60,
        "avif": { "url": "asset-url:./images/red-panda-targets/avif-q44-e0-d8-yuv444-ssimu60.6.avif", "bytes": "asset-size:./images/red-panda-targets/avif-q44-e0-d8-yuv444-ssimu60.6.avif", "score": "60.6" },
        "jxl": { "url": "asset-url:./images/red-panda-targets/jxl-q58.7-e10-ssimu60.0.jxl", "bytes": "asset-size:./images/red-panda-targets/jxl-q58.7-e10-ssimu60.0.jxl", "score": "60.0" },
        "jixel": { "url": "asset-url:./images/red-panda-targets/jixel-q68.7-e6-ssimu60.1.jxl", "bytes": "asset-size:./images/red-panda-targets/jixel-q68.7-e6-ssimu60.1.jxl", "score": "60.1" }
      },
      {
        "target": 70,
        "avif": { "url": "asset-url:./images/red-panda-targets/avif-q52-e0-d8-yuv444-ssimu70.3.avif", "bytes": "asset-size:./images/red-panda-targets/avif-q52-e0-d8-yuv444-ssimu70.3.avif", "score": "70.3" },
        "jxl": { "url": "asset-url:./images/red-panda-targets/jxl-q71.9-e10-ssimu70.0.jxl", "bytes": "asset-size:./images/red-panda-targets/jxl-q71.9-e10-ssimu70.0.jxl", "score": "70.0" },
        "jixel": { "url": "asset-url:./images/red-panda-targets/jixel-q78.9-e6-ssimu71.2.jxl", "bytes": "asset-size:./images/red-panda-targets/jixel-q78.9-e6-ssimu71.2.jxl", "score": "71.2" }
      },
      {
        "target": 80,
        "avif": { "url": "asset-url:./images/red-panda-targets/avif-q67-e0-d8-yuv444-ssimu80.7.avif", "bytes": "asset-size:./images/red-panda-targets/avif-q67-e0-d8-yuv444-ssimu80.7.avif", "score": "80.7" },
        "jxl": { "url": "asset-url:./images/red-panda-targets/jxl-q84.5-e10-ssimu80.1.jxl", "bytes": "asset-size:./images/red-panda-targets/jxl-q84.5-e10-ssimu80.1.jxl", "score": "80.1" },
        "jixel": { "url": "asset-url:./images/red-panda-targets/jixel-q86.3-e6-ssimu80.2.jxl", "bytes": "asset-size:./images/red-panda-targets/jixel-q86.3-e6-ssimu80.2.jxl", "score": "80.2" }
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

I threw this one in because it's the default image in [Squoosh](https://squoosh.app/), but I guess the sharp lines of the hairs makes it different to the previous image. In fact, even at medium quality, the difference between the original is much less perceptible to my eyes compared to the other images.

The results are much closer than the previous two:

- **File size: <span class="winner-avif">AVIF wins</span>, narrowly.** At default efforts, the best JPEG XL image (jixel) is only 1–6% larger than the AVIF image for the same quality. cjxl does much worse, at 10–18% larger. At maximum efforts, jixel 'extraslow' and AVIF s0 are roughly tied, with jixel up to 5% smaller at very high quality. However, ColorVideoVDP disagrees, and puts AVIF 6–13% ahead at maximum efforts.
- **Encode time: <span class="winner-jixel">JPEG XL (jixel) wins</span>, according to SSIMULACRA2.** At default efforts, jixel is 17–42% faster than AVIF, and its files are only 1–6% larger. Comparing higher efforts, jixel 'slow' produces files the same size or slightly smaller than AVIF s5, while being 13–34% faster. And jixel 'extraslow' matches or beats AVIF s0 while being ~40% faster. But, since ColorVideoVDP gives AVIF more of a file size advantage, it isn't clear-cut. cjxl's default takes 1.3–1.9x as long as AVIF's default, and produces bigger files.
- **Encode memory: <span class="winner-avif">AVIF wins</span>, narrowly.** At default efforts, jixel uses 1–10% less memory than AVIF, but its files are 1–6% larger, so that's roughly a wash. jixel 'slow' uses 25–33% more memory than AVIF s5 to produce a similar file size, and 'extraslow' uses ~9x the memory of AVIF s0. cjxl's default uses ~2x the memory of AVIF, and its higher efforts use 6–7x.
- **Decode time: <span class="winner-avif">AVIF wins</span>.** JPEG XL takes 2–2.4x as long to decode at medium quality. But the gap narrows a lot at very high quality, to 1.1–1.2x in Firefox and Safari, and in Chrome, JPEG XL is slightly faster (~7%).
- **Higher effort is less worth it for AVIF on this image.** AVIF's s5 gets you 3–6% smaller files for 3–4x the encode time.
- **Higher effort is worth it for jixel, up to 'slow'.** 'slow' gets you 6–13% smaller files than its default 'fast', for 3–4x the encode time. 'extraslow' saves another 3–8%, but takes 8–11x longer than 'slow' and uses ~8x the memory.
- **Higher effort isn't worth it for cjxl.** cjxl's maximum effort gets you 1–2% smaller files than its default, but takes ~12x longer.
- **AVIF's 4:2:0 mode doesn't help.** The files are the same size as 4:4:4.

<details>

<summary>Show me the graphs!</summary>

## Image quality

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jxl-on-the-web/data/red-panda",
  "props": {
    "metric": "ssimulacra2"
  }
}</script>
</figure>

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jxl-on-the-web/data/red-panda",
  "props": {
    "metric": "jod"
  }
}</script>
</figure>

## Encoding performance

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jxl-on-the-web/data/red-panda",
  "props": {
    "metric": "ssimulacra2",
    "y": "encodeMs"
  }
}</script>
</figure>

## Encoding memory usage

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jxl-on-the-web/data/red-panda",
  "props": {
    "metric": "ssimulacra2",
    "y": "encodeMemory"
  }
}</script>
</figure>

## Decoding performance

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jxl-on-the-web/data/red-panda",
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
  "module": "shared/demos/2026/jxl-on-the-web/CodecCompare",
  "props": {
    "ratio": 0.8276,
    "maxWidth": 799,
    "lossless": "asset-url:./images/critter-targets/lossless.jxl",
    "losslessBytes": "asset-size:./images/critter-targets/lossless.jxl",
    "initialQuality": 1,
    "initialCodec": "jxl",
    "qualities": [
      {
        "target": 50,
        "avif": { "url": "asset-url:./images/critter-targets/avif-q47-e0-d8-yuv444-ssimu50.4.avif", "bytes": "asset-size:./images/critter-targets/avif-q47-e0-d8-yuv444-ssimu50.4.avif", "score": "50.4" },
        "jxl": { "url": "asset-url:./images/critter-targets/jxl-q64.4-e10-ssimu50.1.jxl", "bytes": "asset-size:./images/critter-targets/jxl-q64.4-e10-ssimu50.1.jxl", "score": "50.1" },
        "jixel": { "url": "asset-url:./images/critter-targets/jixel-q71.2-e6-ssimu50.0.jxl", "bytes": "asset-size:./images/critter-targets/jixel-q71.2-e6-ssimu50.0.jxl", "score": "50.0" }
      },
      {
        "target": 60,
        "avif": { "url": "asset-url:./images/critter-targets/avif-q52-e0-d8-yuv444-ssimu60.1.avif", "bytes": "asset-size:./images/critter-targets/avif-q52-e0-d8-yuv444-ssimu60.1.avif", "score": "60.1" },
        "jxl": { "url": "asset-url:./images/critter-targets/jxl-q73.7-e10-ssimu60.1.jxl", "bytes": "asset-size:./images/critter-targets/jxl-q73.7-e10-ssimu60.1.jxl", "score": "60.1" },
        "jixel": { "url": "asset-url:./images/critter-targets/jixel-q79.5-e6-ssimu60.2.jxl", "bytes": "asset-size:./images/critter-targets/jixel-q79.5-e6-ssimu60.2.jxl", "score": "60.2" }
      },
      {
        "target": 70,
        "avif": { "url": "asset-url:./images/critter-targets/avif-q60-e0-d8-yuv444-ssimu70.5.avif", "bytes": "asset-size:./images/critter-targets/avif-q60-e0-d8-yuv444-ssimu70.5.avif", "score": "70.5" },
        "jxl": { "url": "asset-url:./images/critter-targets/jxl-q80.1-e10-ssimu70.1.jxl", "bytes": "asset-size:./images/critter-targets/jxl-q80.1-e10-ssimu70.1.jxl", "score": "70.1" },
        "jixel": { "url": "asset-url:./images/critter-targets/jixel-q85-e6-ssimu70.1.jxl", "bytes": "asset-size:./images/critter-targets/jixel-q85-e6-ssimu70.1.jxl", "score": "70.1" }
      },
      {
        "target": 80,
        "avif": { "url": "asset-url:./images/critter-targets/avif-q74-e0-d8-yuv444-ssimu80.5.avif", "bytes": "asset-size:./images/critter-targets/avif-q74-e0-d8-yuv444-ssimu80.5.avif", "score": "80.5" },
        "jxl": { "url": "asset-url:./images/critter-targets/jxl-q87.2-e10-ssimu80.1.jxl", "bytes": "asset-size:./images/critter-targets/jxl-q87.2-e10-ssimu80.1.jxl", "score": "80.1" },
        "jixel": { "url": "asset-url:./images/critter-targets/jixel-q90.5-e6-ssimu80.1.jxl", "bytes": "asset-size:./images/critter-targets/jixel-q90.5-e6-ssimu80.1.jxl", "score": "80.1" }
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

- **File size: <span class="winner-jixel">JPEG XL wins</span>.** At default efforts, the best JPEG XL image is 4–11% smaller than the AVIF image for the same quality. cjxl is the better JPEG XL encoder at medium/high quality, and jixel at very high quality. At maximum efforts, jixel 'extraslow' is 11–28% smaller than AVIF s0. This time, ColorVideoVDP agrees.
- **jixel's 'medium' setting is a big step up on this image.** Its files are 9–23% smaller than AVIF's default, and even smaller than AVIF s0, the maximum effort.
- **Encode time: <span class="winner-jixel">JPEG XL (jixel) wins</span>.** At default efforts, jixel is 30–44% faster than AVIF, and produces files that are around the same size or smaller. At higher efforts, it's even more one-sided: jixel 'medium' is faster than AVIF s5, and produces files 7–22% smaller. cjxl's default takes 1.5–2.2x as long as AVIF's default.
- **Encode memory: <span class="winner-jixel">JPEG XL (jixel) wins</span>, when you factor in file size.** At default efforts, jixel uses 15–31% more memory than AVIF. But, AVIF s0 uses even more memory (~1.55x its default), and still produces bigger files than jixel 'medium'. cjxl's default uses 2.4–3.6x the memory of AVIF, and the maximum efforts of both JPEG XL encoders use 10–18x.
- **Decode time: <span class="winner-avif">AVIF wins</span>, except in Chrome at higher qualities.** JPEG XL takes 1.3–1.9x as long to decode in Firefox and Safari. In Chrome, JPEG XL takes ~1.25x as long at medium quality, but from high quality upwards, it's 15–32% faster than AVIF.
- **Unlike the previous images, jixel images aren't particularly slow to decode in Safari.** In fact, they decode slightly faster than cjxl images.
- **Higher effort isn't really worth it for AVIF on this image.** AVIF's s5 only gets you 1–3% smaller files for 3–4.5x the encode time. s0 gets you 7–8% smaller files, but takes ~50x as long.
- **Higher effort is worth it for jixel, up to 'slow'.** 'medium' gets you 9–23% smaller files than its default 'fast', for 2–3.5x the encode time. 'slow' gets you 8–20% smaller files than 'fast', for 4.3–5.5x the encode time. 'extraslow' saves another 6–9%, but takes ~15x longer than 'slow' and uses ~9x the memory.
- **Higher effort isn't worth it for cjxl.** cjxl's maximum effort gets you 1–6% smaller files than its default, but takes 11–14x longer.
- **AVIF's 4:2:0 mode doesn't help.** The files are the same size as 4:4:4.
- **All three encoders produce lower SSIMULACRA2 scores for this image.** As in, with the same encoder quality value, they score lower. It seems like the encoders are pretty happy smoothing out some of the background noise, which seems fine.

<details>

<summary>Show me the graphs!</summary>

## Image quality

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jxl-on-the-web/data/critter",
  "props": {
    "metric": "ssimulacra2"
  }
}</script>
</figure>

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jxl-on-the-web/data/critter",
  "props": {
    "metric": "jod"
  }
}</script>
</figure>

## Encoding performance

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jxl-on-the-web/data/critter",
  "props": {
    "metric": "ssimulacra2",
    "y": "encodeMs"
  }
}</script>
</figure>

## Encoding memory usage

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jxl-on-the-web/data/critter",
  "props": {
    "metric": "ssimulacra2",
    "y": "encodeMemory"
  }
}</script>
</figure>

## Decoding performance

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jxl-on-the-web/data/critter",
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
  "module": "shared/demos/2026/jxl-on-the-web/CodecCompare",
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
        "jxl": { "url": "asset-url:./images/screenshot-targets/jxl-q17.5-e7-ssimu45.0.jxl", "bytes": "asset-size:./images/screenshot-targets/jxl-q17.5-e7-ssimu45.0.jxl", "score": "45.0" },
        "jixel": { "url": "asset-url:./images/screenshot-targets/jixel-q8.5-e6-patches-ssimu46.2.jxl", "bytes": "asset-size:./images/screenshot-targets/jixel-q8.5-e6-patches-ssimu46.2.jxl", "score": "46.2" }
      },
      {
        "target": 60,
        "avif": { "url": "asset-url:./images/screenshot-targets/avif-q14-e0-d8-yuv444-ssimu61.5.avif", "bytes": "asset-size:./images/screenshot-targets/avif-q14-e0-d8-yuv444-ssimu61.5.avif", "score": "61.5" },
        "jxl": { "url": "asset-url:./images/screenshot-targets/jxl-q18.1-e7-ssimu72.9.jxl", "bytes": "asset-size:./images/screenshot-targets/jxl-q18.1-e7-ssimu72.9.jxl", "score": "72.9" },
        "jixel": { "url": "asset-url:./images/screenshot-targets/jixel-q14.4-e6-patches-ssimu60.2.jxl", "bytes": "asset-size:./images/screenshot-targets/jixel-q14.4-e6-patches-ssimu60.2.jxl", "score": "60.2" }
      },
      {
        "target": 70,
        "avif": { "url": "asset-url:./images/screenshot-targets/avif-q26-e0-d8-yuv444-ssimu70.3.avif", "bytes": "asset-size:./images/screenshot-targets/avif-q26-e0-d8-yuv444-ssimu70.3.avif", "score": "70.3" },
        "jxl": { "url": "asset-url:./images/screenshot-targets/jxl-q18.1-e7-ssimu72.9.jxl", "bytes": "asset-size:./images/screenshot-targets/jxl-q18.1-e7-ssimu72.9.jxl", "score": "72.9" },
        "jixel": { "url": "asset-url:./images/screenshot-targets/jixel-q49.7-e6-patches-ssimu70.8.jxl", "bytes": "asset-size:./images/screenshot-targets/jixel-q49.7-e6-patches-ssimu70.8.jxl", "score": "70.8" }
      },
      {
        "target": 80,
        "avif": { "url": "asset-url:./images/screenshot-targets/avif-q50-e0-d8-yuv444-ssimu80.4.avif", "bytes": "asset-size:./images/screenshot-targets/avif-q50-e0-d8-yuv444-ssimu80.4.avif", "score": "80.4" },
        "jxl": { "url": "asset-url:./images/screenshot-targets/jxl-q39.4-e7-ssimu80.2.jxl", "bytes": "asset-size:./images/screenshot-targets/jxl-q39.4-e7-ssimu80.2.jxl", "score": "80.2" },
        "jixel": { "url": "asset-url:./images/screenshot-targets/jixel-q78-e6-patches-ssimu80.0.jxl", "bytes": "asset-size:./images/screenshot-targets/jixel-q78-e6-patches-ssimu80.0.jxl", "score": "80.0" }
      },
      {
        "target": 90,
        "avif": { "url": "asset-url:./images/screenshot-targets/avif-q82-e0-d8-yuv444-ssimu90.1.avif", "bytes": "asset-size:./images/screenshot-targets/avif-q82-e0-d8-yuv444-ssimu90.1.avif", "score": "90.1" },
        "jxl": { "url": "asset-url:./images/screenshot-targets/jxl-q81.9-e7-ssimu90.2.jxl", "bytes": "asset-size:./images/screenshot-targets/jxl-q81.9-e7-ssimu90.2.jxl", "score": "90.2" },
        "jixel": { "url": "asset-url:./images/screenshot-targets/jixel-q89.8-e6-patches-ssimu90.2.jxl", "bytes": "asset-size:./images/screenshot-targets/jixel-q89.8-e6-patches-ssimu90.2.jxl", "score": "90.2" }
      }
    ]
  }
}</script>
</figure>

The results of the benchmark:

- **File size: <span class="winner-avif">AVIF wins</span>, by a lot.** At default efforts, the best JPEG XL image is 73–89% larger than the AVIF image at medium/high quality (jixel), and 33–39% larger at very high quality (cjxl). At maximum efforts, the best JPEG XL image (jixel 'extraslow' with patches) is over 26% larger than AVIF (s0).
- **cjxl can't produce anything between SSIMULACRA2 ~45 and ~78** at its default effort (~45 and ~75 at higher efforts). jixel doesn't have this problem.
- **jixel's patches feature helps a lot with this image**, but it's off by default. With patches, jixel's files are 10–29% smaller at its higher efforts, from SSIMULACRA2 ~65 upwards. Patches have no effect at jixel's default 'fast' setting.
- **Encode time: <span class="winner-avif">AVIF wins</span>.** At default efforts, jixel is 40–60% faster than AVIF, but its files are 73–109% larger. cjxl's default takes 1.7–1.8x as long as AVIF's default, and still produces much bigger files.
- **Encode memory: <span class="winner-avif">AVIF wins</span>.** At default efforts, jixel uses ~20% less memory than AVIF, but again, its files are much larger. cjxl's default uses 1.2–2.2x the memory of AVIF. jixel 'extraslow' with patches gets closest to AVIF's file sizes, but uses ~8x the memory of AVIF's default.
- **Decode time: <span class="winner-avif">AVIF wins</span>, by a lot.** JPEG XL takes 2–4.6x as long to decode, depending on browser and quality. In Chrome, which is usually the fastest at decoding JPEG XL, it's 2.4–4.3x.
- **Higher effort is more worth it for AVIF on this image.** AVIF's s5 gets you 6–13% smaller files for 2.5–3x the encode time, and s0 gets you 16–23% smaller files for 30–45x the encode time.
- **Higher effort is worth it for jixel, as long as you enable patches.** 'medium' with patches gets you 11–44% smaller files than its default 'fast', for 3–4x the encode time. 'slow' with patches saves another 8–14% for ~1.6x the time of 'medium'. 'extraslow' with patches saves another few percent, but takes ~4.5x longer than 'slow' and uses ~4.5x the memory.
- **Higher effort is harmful for cjxl.** At very high quality, cjxl's maximum effort produces files 34–41% _larger_ than its default effort, and takes ~8x longer.
- **AVIF's 4:2:0 mode helps at higher qualities.** At SSIMULACRA2 70 and above, it produces files 7–18% smaller than 4:4:4. At lower qualities, it makes no difference.
- **All three encoders produce higher SSIMULACRA2 scores for this image.** Opposite to the weasel image, all three encoders produce higher SSIMULACRA2-scoring results for this image. But, this seems correct. At ssimu 70 the artifacts are pretty noticeable around the Firefox logo (to me, anyway), so I'd go with 80, which is where the codecs lean anyway.

Some developers, especially those who've been around as long as I have, seem to think things like screenshots need to be delivered in a lossless format. But I think this is because they're used to formats like JPEG and WebP (and seemingly JPEG XL) which handle this kind of image badly, whereas lossy AVIF handles them really well.

<details>

<summary>Show me the graphs!</summary>

## Image quality

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jxl-on-the-web/data/screenshot",
  "props": {
    "metric": "ssimulacra2"
  }
}</script>
</figure>

I'm not including the CVVDP chart because the metric doesn't support alpha channels.

## Encoding performance

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jxl-on-the-web/data/screenshot",
  "props": {
    "metric": "ssimulacra2",
    "y": "encodeMs"
  }
}</script>
</figure>

## Encoding memory usage

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jxl-on-the-web/data/screenshot",
  "props": {
    "metric": "ssimulacra2",
    "y": "encodeMemory"
  }
}</script>
</figure>

## Decoding performance

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jxl-on-the-web/data/screenshot",
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
  "module": "shared/demos/2026/jxl-on-the-web/CodecCompare",
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
        "jixel": { "url": "asset-url:./images/cat-illustration-targets/jixel-q14.6-e6-patches-ssimu50.4.jxl", "bytes": "asset-size:./images/cat-illustration-targets/jixel-q14.6-e6-patches-ssimu50.4.jxl", "score": "50.4" }
      },
      {
        "target": 60,
        "avif": { "url": "asset-url:./images/cat-illustration-targets/avif-q28-e0-d8-yuv444-ssimu60.3.avif", "bytes": "asset-size:./images/cat-illustration-targets/avif-q28-e0-d8-yuv444-ssimu60.3.avif", "score": "60.3" },
        "jxl": { "url": "asset-url:./images/cat-illustration-targets/jxl-q23.3-e10-ssimu60.0.jxl", "bytes": "asset-size:./images/cat-illustration-targets/jxl-q23.3-e10-ssimu60.0.jxl", "score": "60.0" },
        "jixel": { "url": "asset-url:./images/cat-illustration-targets/jixel-q45.1-e6-patches-ssimu60.5.jxl", "bytes": "asset-size:./images/cat-illustration-targets/jixel-q45.1-e6-patches-ssimu60.5.jxl", "score": "60.5" }
      },
      {
        "target": 70,
        "avif": { "url": "asset-url:./images/cat-illustration-targets/avif-q39-e0-d8-yuv444-ssimu71.5.avif", "bytes": "asset-size:./images/cat-illustration-targets/avif-q39-e0-d8-yuv444-ssimu71.5.avif", "score": "71.5" },
        "jxl": { "url": "asset-url:./images/cat-illustration-targets/jxl-q44.9-e10-ssimu70.2.jxl", "bytes": "asset-size:./images/cat-illustration-targets/jxl-q44.9-e10-ssimu70.2.jxl", "score": "70.2" },
        "jixel": { "url": "asset-url:./images/cat-illustration-targets/jixel-q71.1-e6-patches-ssimu70.3.jxl", "bytes": "asset-size:./images/cat-illustration-targets/jixel-q71.1-e6-patches-ssimu70.3.jxl", "score": "70.3" }
      },
      {
        "target": 80,
        "avif": { "url": "asset-url:./images/cat-illustration-targets/avif-q52-e0-d8-yuv444-ssimu80.2.avif", "bytes": "asset-size:./images/cat-illustration-targets/avif-q52-e0-d8-yuv444-ssimu80.2.avif", "score": "80.2" },
        "jxl": { "url": "asset-url:./images/cat-illustration-targets/jxl-q72.1-e10-ssimu80.0.jxl", "bytes": "asset-size:./images/cat-illustration-targets/jxl-q72.1-e10-ssimu80.0.jxl", "score": "80.0" },
        "jixel": { "url": "asset-url:./images/cat-illustration-targets/jixel-q83.2-e6-patches-ssimu80.8.jxl", "bytes": "asset-size:./images/cat-illustration-targets/jixel-q83.2-e6-patches-ssimu80.8.jxl", "score": "80.8" }
      },
      {
        "target": 90,
        "avif": { "url": "asset-url:./images/cat-illustration-targets/avif-q99-e0-d8-yuv444-ssimu86.6.avif", "bytes": "asset-size:./images/cat-illustration-targets/avif-q99-e0-d8-yuv444-ssimu86.6.avif", "score": "86.6" },
        "jxl": { "url": "asset-url:./images/cat-illustration-targets/jxl-q97.4-e10-ssimu90.1.jxl", "bytes": "asset-size:./images/cat-illustration-targets/jxl-q97.4-e10-ssimu90.1.jxl", "score": "90.1" },
        "jixel": { "url": "asset-url:./images/cat-illustration-targets/jixel-q94.7-e6-patches-ssimu90.2.jxl", "bytes": "asset-size:./images/cat-illustration-targets/jixel-q94.7-e6-patches-ssimu90.2.jxl", "score": "90.2" }
      }
    ]
  }
}</script>
</figure>

In many cases, for largely flat-colour images, you'd use SVG. But sometimes that isn't possible (it's a screenshot), or undesirable, such as this case. This image, [also from Unsplash](https://unsplash.com/illustrations/hands-feeding-orange-cat-a-treat-on-bed-9tXfoalzAqY), is still 1.1 MB as a compressed and minified SVG. This is due to the complexity of the shaded areas. As a result, a raster format wins on file size and decode/draw time.

The results of the benchmark:

- **File size: <span class="winner-avif">AVIF wins</span>, by a lot.** At default efforts, the best JPEG XL image (jixel) is 38–63% larger than the AVIF image up to SSIMULACRA2 80, and ~90% larger beyond that. At maximum efforts, the best JPEG XL image (jixel 'extraslow') is 26–62% larger than AVIF (s0). ColorVideoVDP agrees, and puts the gap at 32–66%.
- **cjxl performs particularly badly with this image.** At default efforts, it's 71–106% larger than AVIF.
- **Lossy AVIF can't reach SSIMULACRA2 90 with this image.** Even at its maximum quality setting, it tops out at ~87, so the 90 example above isn't a totally fair comparison. JPEG XL can reach 90, but the result is 8–50% larger than JPEG XL's lossless version, so you may as well use lossless.
- **Encode time: <span class="winner-avif">AVIF wins</span>.** At default efforts, jixel is 37–48% faster than AVIF, but its files are 38–63% larger, which is a bad trade. jixel needs its 'slow' setting to get within 11–35% of AVIF's default file size, which takes 2–2.4x as long as AVIF. cjxl's default takes 1.3–2.3x as long as AVIF's default, and produces much bigger files.
- **Encode memory: <span class="winner-avif">AVIF wins</span>.** At default efforts, jixel uses 2–8% less memory than AVIF, but again, its files are much larger. jixel 'slow' uses ~1.4x the memory of AVIF, and 'extraslow' uses ~14x. cjxl's default uses 1.5–3x the memory of AVIF.
- **Decode time: <span class="winner-avif">AVIF wins</span>, by a lot.** JPEG XL takes 2–4.6x as long to decode at medium/high quality, narrowing to 1.6–2.1x at very high quality.
- **Higher effort is more worth it for AVIF on this image.** AVIF's s5 gets you 5–8% smaller files for ~2.7x the encode time, and s0 gets you 14–21% smaller files for 35–48x the encode time.
- **Higher effort is worth it for jixel, up to 'slow'.** 'medium' only gets you 4–13% smaller files than its default 'fast', but 'slow' gets you 19–22% smaller files (up to 36% at very high quality), for ~4x the encode time. 'extraslow' saves another 3–5%, but takes 8–9x longer than 'slow' and uses ~10x the memory.
- **jixel's patches feature doesn't help with this image.** Unlike the screenshot, the file sizes are identical with and without it, but it does increase encode time and memory.
- **Higher effort isn't worth it for cjxl.** cjxl's maximum effort gets you 3–9% smaller files than its default, but takes 10–13x longer.
- **AVIF's 4:2:0 mode doesn't help.** SSIMULACRA2 rates it slightly worse than 4:4:4, and ColorVideoVDP rates it slightly better (~3–4%).

<details>

<summary>Show me the graphs!</summary>

## Image quality

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jxl-on-the-web/data/cat-illustration",
  "props": {
    "metric": "ssimulacra2"
  }
}</script>
</figure>

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jxl-on-the-web/data/cat-illustration",
  "props": {
    "metric": "jod"
  }
}</script>
</figure>

## Encoding performance

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jxl-on-the-web/data/cat-illustration",
  "props": {
    "metric": "ssimulacra2",
    "y": "encodeMs"
  }
}</script>
</figure>

## Encoding memory usage

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jxl-on-the-web/data/cat-illustration",
  "props": {
    "metric": "ssimulacra2",
    "y": "encodeMemory"
  }
}</script>
</figure>

## Decoding performance

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jxl-on-the-web/data/cat-illustration",
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
  "module": "shared/demos/2026/jxl-on-the-web/CodecCompare",
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
        "jixel": { "url": "asset-url:./images/f1-small-targets/jixel-q45-e6-ssimu50.5.jxl", "bytes": "asset-size:./images/f1-small-targets/jixel-q45-e6-ssimu50.5.jxl", "score": "50.5" }
      },
      {
        "target": 60,
        "avif": { "url": "asset-url:./images/f1-small-targets/avif-q39-e0-d8-yuv444-ssimu60.7.avif", "bytes": "asset-size:./images/f1-small-targets/avif-q39-e0-d8-yuv444-ssimu60.7.avif", "score": "60.7" },
        "jxl": { "url": "asset-url:./images/f1-small-targets/jxl-q43.5-e10-ssimu60.1.jxl", "bytes": "asset-size:./images/f1-small-targets/jxl-q43.5-e10-ssimu60.1.jxl", "score": "60.1" },
        "jixel": { "url": "asset-url:./images/f1-small-targets/jixel-q65.6-e6-ssimu60.1.jxl", "bytes": "asset-size:./images/f1-small-targets/jixel-q65.6-e6-ssimu60.1.jxl", "score": "60.1" }
      },
      {
        "target": 70,
        "avif": { "url": "asset-url:./images/f1-small-targets/avif-q47-e0-d8-yuv444-ssimu70.4.avif", "bytes": "asset-size:./images/f1-small-targets/avif-q47-e0-d8-yuv444-ssimu70.4.avif", "score": "70.4" },
        "jxl": { "url": "asset-url:./images/f1-small-targets/jxl-q62.8-e10-ssimu70.2.jxl", "bytes": "asset-size:./images/f1-small-targets/jxl-q62.8-e10-ssimu70.2.jxl", "score": "70.2" },
        "jixel": { "url": "asset-url:./images/f1-small-targets/jixel-q78.9-e6-ssimu72.3.jxl", "bytes": "asset-size:./images/f1-small-targets/jixel-q78.9-e6-ssimu72.3.jxl", "score": "72.3" }
      },
      {
        "target": 80,
        "avif": { "url": "asset-url:./images/f1-small-targets/avif-q60-e0-d8-yuv444-ssimu80.6.avif", "bytes": "asset-size:./images/f1-small-targets/avif-q60-e0-d8-yuv444-ssimu80.6.avif", "score": "80.6" },
        "jxl": { "url": "asset-url:./images/f1-small-targets/jxl-q78.5-e10-ssimu80.2.jxl", "bytes": "asset-size:./images/f1-small-targets/jxl-q78.5-e10-ssimu80.2.jxl", "score": "80.2" },
        "jixel": { "url": "asset-url:./images/f1-small-targets/jixel-q85.1-e6-ssimu80.2.jxl", "bytes": "asset-size:./images/f1-small-targets/jixel-q85.1-e6-ssimu80.2.jxl", "score": "80.2" }
      },
      {
        "target": 90,
        "avif": { "url": "asset-url:./images/f1-small-targets/avif-q84-e0-d8-yuv444-ssimu90.4.avif", "bytes": "asset-size:./images/f1-small-targets/avif-q84-e0-d8-yuv444-ssimu90.4.avif", "score": "90.4" },
        "jxl": { "url": "asset-url:./images/f1-small-targets/jxl-q93.1-e10-ssimu90.2.jxl", "bytes": "asset-size:./images/f1-small-targets/jxl-q93.1-e10-ssimu90.2.jxl", "score": "90.2" },
        "jixel": { "url": "asset-url:./images/f1-small-targets/jixel-q92-e6-ssimu90.1.jxl", "bytes": "asset-size:./images/f1-small-targets/jixel-q92-e6-ssimu90.1.jxl", "score": "90.1" }
      }
    ]
  }
}</script>
</figure>

Nah. Well, ok, a couple of things:

- AVIF 4:2:0 struggles at the higher qualities, so this makes a good case for defaulting to 4:4:4.
- Unlike previous examples, JPEG XL's default encoding time is similar to AVIF's, and sometimes faster. Although it still produces larger files when qualities are matched.

<details>

<summary>Show me the graphs!</summary>

## Image quality

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jxl-on-the-web/data/f1-small",
  "props": {
    "metric": "ssimulacra2"
  }
}</script>
</figure>

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jxl-on-the-web/data/f1-small",
  "props": {
    "metric": "jod"
  }
}</script>
</figure>

## Encoding performance

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jxl-on-the-web/data/f1-small",
  "props": {
    "metric": "ssimulacra2",
    "y": "encodeMs"
  }
}</script>
</figure>

## Encoding memory usage

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jxl-on-the-web/data/f1-small",
  "props": {
    "metric": "ssimulacra2",
    "y": "encodeMemory"
  }
}</script>
</figure>

## Decoding performance

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jxl-on-the-web/data/f1-small",
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
  "module": "shared/demos/2026/jxl-on-the-web/CodecCompare",
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
        "jixel": { "url": "asset-url:./images/f1-large-targets/jixel-q11.5-e6-ssimu50.2.jxl", "bytes": "asset-size:./images/f1-large-targets/jixel-q11.5-e6-ssimu50.2.jxl", "score": "50.2" }
      },
      {
        "target": 60,
        "avif": { "url": "asset-url:./images/f1-large-targets/avif-q26-e0-d8-yuv444-ssimu60.1.avif", "bytes": "asset-size:./images/f1-large-targets/avif-q26-e0-d8-yuv444-ssimu60.1.avif", "score": "60.1" },
        "jxl": { "url": "asset-url:./images/f1-large-targets/jxl-q20.9-e10-ssimu60.0.jxl", "bytes": "asset-size:./images/f1-large-targets/jxl-q20.9-e10-ssimu60.0.jxl", "score": "60.0" },
        "jixel": { "url": "asset-url:./images/f1-large-targets/jixel-q19.6-e6-ssimu60.0.jxl", "bytes": "asset-size:./images/f1-large-targets/jixel-q19.6-e6-ssimu60.0.jxl", "score": "60.0" }
      },
      {
        "target": 70,
        "avif": { "url": "asset-url:./images/f1-large-targets/avif-q39-e0-d8-yuv444-ssimu70.4.avif", "bytes": "asset-size:./images/f1-large-targets/avif-q39-e0-d8-yuv444-ssimu70.4.avif", "score": "70.4" },
        "jxl": { "url": "asset-url:./images/f1-large-targets/jxl-q41.2-e10-ssimu70.0.jxl", "bytes": "asset-size:./images/f1-large-targets/jxl-q41.2-e10-ssimu70.0.jxl", "score": "70.0" },
        "jixel": { "url": "asset-url:./images/f1-large-targets/jixel-q63.9-e6-ssimu70.1.jxl", "bytes": "asset-size:./images/f1-large-targets/jixel-q63.9-e6-ssimu70.1.jxl", "score": "70.1" }
      },
      {
        "target": 80,
        "avif": { "url": "asset-url:./images/f1-large-targets/avif-q59-e0-d8-yuv444-ssimu80.4.avif", "bytes": "asset-size:./images/f1-large-targets/avif-q59-e0-d8-yuv444-ssimu80.4.avif", "score": "80.4" },
        "jxl": { "url": "asset-url:./images/f1-large-targets/jxl-q71.8-e10-ssimu80.0.jxl", "bytes": "asset-size:./images/f1-large-targets/jxl-q71.8-e10-ssimu80.0.jxl", "score": "80.0" },
        "jixel": { "url": "asset-url:./images/f1-large-targets/jixel-q81.5-e6-ssimu80.1.jxl", "bytes": "asset-size:./images/f1-large-targets/jixel-q81.5-e6-ssimu80.1.jxl", "score": "80.1" }
      },
      {
        "target": 90,
        "avif": { "url": "asset-url:./images/f1-large-targets/avif-q90-e0-d8-yuv444-ssimu90.5.avif", "bytes": "asset-size:./images/f1-large-targets/avif-q90-e0-d8-yuv444-ssimu90.5.avif", "score": "90.5" },
        "jxl": { "url": "asset-url:./images/f1-large-targets/jxl-q93.3-e10-ssimu90.0.jxl", "bytes": "asset-size:./images/f1-large-targets/jxl-q93.3-e10-ssimu90.0.jxl", "score": "90.0" },
        "jixel": { "url": "asset-url:./images/f1-large-targets/jixel-q92.4-e6-ssimu90.0.jxl", "bytes": "asset-size:./images/f1-large-targets/jixel-q92.4-e6-ssimu90.0.jxl", "score": "90.0" }
      }
    ]
  }
}</script>
</figure>

There are some interesting details here:

- At high quality, JPEG XL produces a significantly larger file than AVIF.
- But at "visually lossless" it crosses over, where the AVIF is 10% larger.
- At default efforts, JPEG XL's encoding time is almost 4x slower than AVIF.
- At "very high" quality and above, JPEG XL's encoding memory usage roughly matches AVIF's.

<details>

<summary>Show me the graphs!</summary>

## Image quality

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jxl-on-the-web/data/f1-large",
  "props": {
    "metric": "ssimulacra2"
  }
}</script>
</figure>

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jxl-on-the-web/data/f1-large",
  "props": {
    "metric": "jod"
  }
}</script>
</figure>

## Encoding performance

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jxl-on-the-web/data/f1-large",
  "props": {
    "metric": "ssimulacra2",
    "y": "encodeMs"
  }
}</script>
</figure>

## Encoding memory usage

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jxl-on-the-web/data/f1-large",
  "props": {
    "metric": "ssimulacra2",
    "y": "encodeMemory"
  }
}</script>
</figure>

## Decoding performance

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jxl-on-the-web/data/f1-large",
  "props": {
    "metric": "ssimulacra2",
    "y": "decodeMs"
  }
}</script>
</figure>

</details>

# Quality stability

Another criticism I've heard levelled at AVIF, is that its quality is unreliable. As in, a single quality setting is great for some images, but no good for others, meaning for automatically encoded images, you need to pick a higher quality setting to be safe, resulting in larger file sizes than necessary for some images.

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
<tr><th scope="row"><a href="#lossy---f1-image">F1</a></th><td class="avif">74.6</td><td class="avif">75.9</td><td class="avif">73.4</td><td class="avif">73.8</td><td class="jxl group-start">79.2</td><td class="jxl">78.0</td><td class="jixel group-start">75.1</td><td class="jixel">77.3</td></tr>
<tr><th scope="row"><a href="#lossy---small">F1 (small)</a></th><td class="avif">70.9</td><td class="avif">73.5</td><td class="avif">68.4</td><td class="avif">69.5</td><td class="jxl group-start">75.6</td><td class="jxl">73.9</td><td class="jixel group-start">70.7</td><td class="jixel">72.5</td></tr>
<tr><th scope="row"><a href="#lossy---large">F1 (large)</a></th><td class="avif">77.0</td><td class="avif">77.4</td><td class="avif">76.2</td><td class="avif">76.6</td><td class="jxl group-start">80.1</td><td class="jxl">79.2</td><td class="jixel group-start">77.6</td><td class="jixel">79.2</td></tr>
<tr><th scope="row"><a href="#lossy---people">People</a></th><td class="avif">70.7</td><td class="avif">72.0</td><td class="avif">69.8</td><td class="avif">70.5</td><td class="jxl group-start">69.6</td><td class="jxl">70.3</td><td class="jixel group-start">69.1</td><td class="jixel">72.3</td></tr>
<tr><th scope="row"><a href="#lossy---red-panda">Red panda</a></th><td class="avif">67.5</td><td class="avif">68.8</td><td class="avif">67.0</td><td class="avif">67.2</td><td class="jxl group-start">69.5</td><td class="jxl">68.4</td><td class="jixel group-start">69.3</td><td class="jixel">72.2</td></tr>
<tr><th scope="row"><a href="#lossy---weasel-outlier">Weasel</a></th><td class="avif">56.7</td><td class="avif">57.2</td><td class="avif">56.0</td><td class="avif">56.3</td><td class="jxl group-start">56.6</td><td class="jxl">55.4</td><td class="jixel group-start">55.0</td><td class="jixel">59.8</td></tr>
<tr><th scope="row"><a href="#lossy---screenshot">Screenshot</a></th><td class="avif">80.2</td><td class="avif">80.4</td><td class="avif">82.3</td><td class="avif">81.9</td><td class="jxl group-start">86.5</td><td class="jxl">87.6</td><td class="jixel group-start">76.6</td><td class="jixel">80.3</td></tr>
<tr><th scope="row"><a href="#lossy---illustration">Illustration</a></th><td class="avif">78.6</td><td class="avif">79.7</td><td class="avif">76.8</td><td class="avif">77.9</td><td class="jxl group-start">80.3</td><td class="jxl">78.5</td><td class="jixel group-start">75.4</td><td class="jixel">77.6</td></tr>
</tbody>
</table>
</div>

The behaviour of the codecs here seems really similar. Both produce a range of SSIMULACRA2 scores, and they both go higher or lower for the same images.

And I think this is ok? Like, both codecs go for a lower quality for the Weasel picture, which removed noise without reducing quality of the image subject. With the screenshot, both codecs go for a higher quality, which seems justified to my eyes.

Obviously this is a small sample size, but I haven't seen anything that suggests using a single quality setting is a risk, for either AVIF or JPEG XL.

# Progressive

Both AVIF and JPEG XL are capable of showing something progressively as the image loads. Chrome and Firefox support progressive JPEG XL, whereas only Chrome supports progressive AVIF. So, and I say this through gritted teeth, this next demo is best viewed in Chrome:

<script type="component">{
  "module": "shared/demos/2026/jxl-on-the-web/ProgressiveDemo",
  "exportName": "Styles",
  "staticOnly": true
}</script>

<figure class="full-figure super-breakout">
<script type="component">{
  "module": "shared/demos/2026/jxl-on-the-web/ProgressiveDemo",
  "props": {
    "page": "/2026/jxl-on-the-web/demos/progressive/",
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

I have [a Firefox patch in progress](https://bugzilla.mozilla.org/show_bug.cgi?id=2072679).

Progressive AVIF and JPEG XL work very differently. With JPEG XL, you can opt into the data being stored in such a way that a decoder can render low resolution versions, before it brings in the higher resolution tiles in.

With AVIF, progressions work more like frames of a video. You provide up to four frames, so that's three phases before the final image. Again, like a video, each frame can use data from the previous frame as an optimisation. An advantage of this, is you can choose exactly how those frames look. In the example above, I went with a single preview frame: a 1/8th resolution version, with a bit of blurring. But, your preview frames can be completely different images if you really want.

There's a lack of data when it comes to progressive images and user experience, so these are just my reckons:

If you're on a bad connection, data doesn't arrive gradually like some throttling tools will have you believe. It tends to come in bursts. So, I'm not sure that many progressive phases is particularly useful.

I think that it's nice to have a _representative_ preview for images that may take some time to load. I've experienced this personally, where a site or app has given me something clearly not-loaded, but with enough detail to know what's coming. That's useful to me, as I can decide things like, if it's worth waiting for the whole thing. This is also why I think things like blurhash are cute, but useless - they're not a _representative_ preview.

The preview frame I chose for the AVIF is enough to tell it's an open-wheel race car. If you know F1, you'll know what team it is. You might even know where the photo was taken. And it delivers that in ~11.5 kB.

The JPEG XL takes around TODO YOU ARE HERE.

TODO: Show example where JXL looks potentially loaded, but parts like the apecoin logo are blurry. Although I accept that blurring out the apecoin logo may be a societal good.

<div class="data-table breakout">
<table>
<thead>
<tr><th class="row-heading" rowspan="2" scope="col">Encoding</th><th rowspan="2" scope="col">Quality</th><th rowspan="2" scope="col">File size</th><th rowspan="2" scope="col">SSIMU2</th><th class="group-start" colspan="2" scope="colgroup">Encode</th><th class="group-start" colspan="3" scope="colgroup">Decode</th></tr>
<tr><th class="group-start" scope="col">Time</th><th scope="col">Memory</th><th class="group-start" scope="col">Firefox</th><th scope="col">Chrome</th><th scope="col">Safari</th></tr>
</thead>
<tbody class="avif">
<tr><th scope="row">AVIF s6</th><td>41</td><td>175 kB</td><td>69.9</td><td class="group-start">396 ms</td><td>381 MB</td><td class="group-start">51 ms</td><td>38 ms</td><td>57 ms</td></tr>
<tr><th scope="row">AVIF s6 prog</th><td>42</td><td>173 kB</td><td>70.2</td><td class="group-start">832 ms</td><td>772 MB</td><td class="group-start">53 ms</td><td>55 ms</td><td>60 ms</td></tr>
<tr class="change"><th scope="row">Change</th><td>+1</td><td>−1%</td><td>+0.2</td><td class="group-start">+110%</td><td>+103%</td><td class="group-start">+4%</td><td>+44%</td><td>+5%</td></tr>
<tr><th scope="row">AVIF s6 prog <code>-k</code></th><td>42</td><td>181 kB</td><td>70.3</td><td class="group-start">1.07 s</td><td>730 MB</td><td class="group-start">49 ms</td><td>36 ms</td><td>57 ms</td></tr>
<tr class="change"><th scope="row">Change</th><td>+1</td><td>+3%</td><td>+0.4</td><td class="group-start">+171%</td><td>+92%</td><td class="group-start">−4%</td><td>−6%</td><td>−1%</td></tr>
</tbody>
<tbody class="avif">
<tr><th scope="row">AVIF s0</th><td>41</td><td>145 kB</td><td>69.9</td><td class="group-start">7.98 s</td><td>450 MB</td><td class="group-start">50 ms</td><td>43 ms</td><td>59 ms</td></tr>
<tr><th scope="row">AVIF s0 prog</th><td>42</td><td>165 kB</td><td>70.5</td><td class="group-start">8.70 s</td><td>847 MB</td><td class="group-start">54 ms</td><td>61 ms</td><td>60 ms</td></tr>
<tr class="change"><th scope="row">Change</th><td>+1</td><td>+14%</td><td>+0.5</td><td class="group-start">+9%</td><td>+88%</td><td class="group-start">+9%</td><td>+44%</td><td>+2%</td></tr>
<tr><th scope="row">AVIF s0 prog <code>-k</code></th><td>41</td><td>152 kB</td><td>69.6</td><td class="group-start">10.79 s</td><td>798 MB</td><td class="group-start">49 ms</td><td>41 ms</td><td>57 ms</td></tr>
<tr class="change"><th scope="row">Change</th><td>±0</td><td>+5%</td><td>−0.3</td><td class="group-start">+35%</td><td>+77%</td><td class="group-start">−1%</td><td>−4%</td><td>−3%</td></tr>
</tbody>
<tbody class="jxl">
<tr><th scope="row">JPEG XL e7</th><td>35.5</td><td>258 kB</td><td>70.0</td><td class="group-start">1.63 s</td><td>2.49 GB</td><td class="group-start">133 ms</td><td>106 ms</td><td>169 ms</td></tr>
<tr><th scope="row">JPEG XL e7 prog</th><td>25.3</td><td>233 kB</td><td>70.0</td><td class="group-start">1.40 s</td><td>1.90 GB</td><td class="group-start">119 ms</td><td>121 ms</td><td>192 ms</td></tr>
<tr class="change"><th scope="row">Change</th><td>−10.2</td><td>−9%</td><td>±0.0</td><td class="group-start">−14%</td><td>−24%</td><td class="group-start">−10%</td><td>+15%</td><td>+14%</td></tr>
</tbody>
<tbody class="jxl">
<tr><th scope="row">JPEG XL e10</th><td>41.2</td><td>258 kB</td><td>70.0</td><td class="group-start">22.84 s</td><td>5.54 GB</td><td class="group-start">135 ms</td><td>108 ms</td><td>169 ms</td></tr>
<tr><th scope="row">JPEG XL e10 prog</th><td>30.2</td><td>242 kB</td><td>70.0</td><td class="group-start">25.44 s</td><td>6.07 GB</td><td class="group-start">121 ms</td><td>125 ms</td><td>189 ms</td></tr>
<tr class="change"><th scope="row">Change</th><td>−11</td><td>−6%</td><td>±0.0</td><td class="group-start">+11%</td><td>+10%</td><td class="group-start">−10%</td><td>+16%</td><td>+12%</td></tr>
</tbody>
</table>
</div>

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

TODO: improve the layout of this table on mobile. Shorten first column names.

# Lossy - HDR

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/demos/2026/jxl-on-the-web/CodecCompare",
  "props": {
    "ratio": 0.7516,
    "maxWidth": 799,
    "lossless": "asset-url:./images/neon-hdr-10bit-targets/jxl-lossless-e10.jxl",
    "losslessBytes": "asset-size:./images/neon-hdr-10bit-targets/jxl-lossless-e10.jxl",
    "formats": [
      { "key": "avif", "label": "AVIF (gain map)", "color": "#2a78d6", "lossless": "asset-url:./images/neon-hdr-10bit-targets/avif-lossless-s0-d10-yuv444.avif", "losslessBytes": "asset-size:./images/neon-hdr-10bit-targets/avif-lossless-s0-d10-yuv444.avif" },
      { "key": "avifPq", "label": "AVIF (PQ)", "color": "#0b3d7a" },
      { "key": "jxl", "label": "JPEG XL (libjxl)", "color": "#eb6834" },
      { "key": "jixel", "label": "JPEG XL (jixel)", "color": "#1baf7a" }
    ],
    "initialQuality": 2,
    "initialCodec": "avif",
    "qualities": [
      {
        "target": 50,
        "avif": { "url": "asset-url:./images/neon-hdr-10bit-targets/avif-q39-e0-d10-yuv444-ssimu50.1.avif", "bytes": "asset-size:./images/neon-hdr-10bit-targets/avif-q39-e0-d10-yuv444-ssimu50.1.avif", "score": "50.1" },
        "avifPq": { "url": "asset-url:./images/neon-hdr-10bit-targets/avif-q49-e0-d10-yuv444-pq-ssimu50.8.avif", "bytes": "asset-size:./images/neon-hdr-10bit-targets/avif-q49-e0-d10-yuv444-pq-ssimu50.8.avif", "score": "50.8" },
        "jxl": { "url": "asset-url:./images/neon-hdr-10bit-targets/jxl-q51.3-e10-ssimu50.1.jxl", "bytes": "asset-size:./images/neon-hdr-10bit-targets/jxl-q51.3-e10-ssimu50.1.jxl", "score": "50.1" },
        "jixel": { "url": "asset-url:./images/neon-hdr-10bit-targets/jixel-q63.7-e6-ssimu50.0.jxl", "bytes": "asset-size:./images/neon-hdr-10bit-targets/jixel-q63.7-e6-ssimu50.0.jxl", "score": "50.0" }
      },
      {
        "target": 60,
        "avif": { "url": "asset-url:./images/neon-hdr-10bit-targets/avif-q49-e0-d10-yuv444-ssimu61.5.avif", "bytes": "asset-size:./images/neon-hdr-10bit-targets/avif-q49-e0-d10-yuv444-ssimu61.5.avif", "score": "61.5" },
        "avifPq": { "url": "asset-url:./images/neon-hdr-10bit-targets/avif-q59-e0-d10-yuv444-pq-ssimu60.2.avif", "bytes": "asset-size:./images/neon-hdr-10bit-targets/avif-q59-e0-d10-yuv444-pq-ssimu60.2.avif", "score": "60.2" },
        "jxl": { "url": "asset-url:./images/neon-hdr-10bit-targets/jxl-q66.7-e10-ssimu60.2.jxl", "bytes": "asset-size:./images/neon-hdr-10bit-targets/jxl-q66.7-e10-ssimu60.2.jxl", "score": "60.2" },
        "jixel": { "url": "asset-url:./images/neon-hdr-10bit-targets/jixel-q76.2-e6-ssimu61.1.jxl", "bytes": "asset-size:./images/neon-hdr-10bit-targets/jixel-q76.2-e6-ssimu61.1.jxl", "score": "61.1" }
      },
      {
        "target": 70,
        "avif": { "url": "asset-url:./images/neon-hdr-10bit-targets/avif-q62-e0-d10-yuv444-ssimu70.2.avif", "bytes": "asset-size:./images/neon-hdr-10bit-targets/avif-q62-e0-d10-yuv444-ssimu70.2.avif", "score": "70.2" },
        "avifPq": { "url": "asset-url:./images/neon-hdr-10bit-targets/avif-q75-e0-d10-yuv444-pq-ssimu70.5.avif", "bytes": "asset-size:./images/neon-hdr-10bit-targets/avif-q75-e0-d10-yuv444-pq-ssimu70.5.avif", "score": "70.5" },
        "jxl": { "url": "asset-url:./images/neon-hdr-10bit-targets/jxl-q78.2-e10-ssimu70.0.jxl", "bytes": "asset-size:./images/neon-hdr-10bit-targets/jxl-q78.2-e10-ssimu70.0.jxl", "score": "70.0" },
        "jixel": { "url": "asset-url:./images/neon-hdr-10bit-targets/jixel-q83.7-e6-ssimu70.1.jxl", "bytes": "asset-size:./images/neon-hdr-10bit-targets/jixel-q83.7-e6-ssimu70.1.jxl", "score": "70.1" }
      },
      {
        "target": 80,
        "avif": { "url": "asset-url:./images/neon-hdr-10bit-targets/avif-q84-e0-d10-yuv444-ssimu80.7.avif", "bytes": "asset-size:./images/neon-hdr-10bit-targets/avif-q84-e0-d10-yuv444-ssimu80.7.avif", "score": "80.7" },
        "avifPq": { "url": "asset-url:./images/neon-hdr-10bit-targets/avif-q90-e0-d10-yuv444-pq-ssimu80.7.avif", "bytes": "asset-size:./images/neon-hdr-10bit-targets/avif-q90-e0-d10-yuv444-pq-ssimu80.7.avif", "score": "80.7" },
        "jxl": { "url": "asset-url:./images/neon-hdr-10bit-targets/jxl-q89.6-e10-ssimu80.0.jxl", "bytes": "asset-size:./images/neon-hdr-10bit-targets/jxl-q89.6-e10-ssimu80.0.jxl", "score": "80.0" },
        "jixel": { "url": "asset-url:./images/neon-hdr-10bit-targets/jixel-q91.7-e6-ssimu80.2.jxl", "bytes": "asset-size:./images/neon-hdr-10bit-targets/jixel-q91.7-e6-ssimu80.2.jxl", "score": "80.2" }
      }
    ]
  }
}</script>
</figure>

TODO

<details>

<summary>Show me the graphs!</summary>

## Image quality

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jxl-on-the-web/data/neon-hdr-10bit",
  "props": {
    "metric": "ssimulacra2"
  }
}</script>
</figure>

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jxl-on-the-web/data/neon-hdr-10bit",
  "props": {
    "metric": "jod"
  }
}</script>
</figure>

## Encoding performance

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jxl-on-the-web/data/neon-hdr-10bit",
  "props": {
    "metric": "ssimulacra2",
    "y": "encodeMs"
  }
}</script>
</figure>

## Encoding memory usage

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jxl-on-the-web/data/neon-hdr-10bit",
  "props": {
    "metric": "ssimulacra2",
    "y": "encodeMemory"
  }
}</script>
</figure>

## Decoding performance

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jxl-on-the-web/data/neon-hdr-10bit",
  "props": {
    "metric": "ssimulacra2",
    "y": "decodeMs"
  }
}</script>
</figure>

</details>

# JPEG transcoding

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jxl-on-the-web/data/f1-large-transcode",
  "props": {
    "y": "bytes"
  }
}</script>
</figure>

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jxl-on-the-web/data/f1-large-transcode",
  "props": {
    "y": "decodeMs"
  }
}</script>
</figure>

# Lossless

<div class="data-table">
<table>
<thead>
<tr><th class="row-heading" rowspan="2" scope="col">Image</th><th class="group-start" colspan="4" scope="colgroup">Default effort</th><th class="group-start" colspan="4" scope="colgroup">Highest effort</th></tr>
<tr><th class="jxl group-start" scope="col">JPEG XL</th><th class="jixel" scope="col">jixel</th><th class="webp" scope="col">WebP</th><th class="avif" scope="col">AVIF</th><th class="jxl group-start" scope="col">JPEG XL</th><th class="jixel" scope="col">jixel</th><th class="webp" scope="col">WebP</th><th class="avif" scope="col">AVIF</th></tr>
</thead>
<tbody>
<tr><th scope="row"><a href="#lossy---f1-image">F1</a></th><td class="group-start">1.07 MB</td><td>+32%</td><td>+16%</td><td>+49%</td><td class="group-start">1.01 MB</td><td>−1%</td><td>+20%</td><td>+47%</td></tr>
<tr><th scope="row"><a href="#lossy---people">People</a></th><td class="group-start">1.39 MB</td><td>+22%</td><td>+17%</td><td>+49%</td><td class="group-start">1.34 MB</td><td>−1%</td><td>+19%</td><td>+44%</td></tr>
<tr><th scope="row"><a href="#lossy---red-panda">Red panda</a></th><td class="group-start">1.78 MB</td><td>+17%</td><td>+9%</td><td>+40%</td><td class="group-start">1.74 MB</td><td>−1%</td><td>+11%</td><td>+31%</td></tr>
<tr><th scope="row"><a href="#lossy---weasel-outlier">Weasel</a></th><td class="group-start">2.91 MB</td><td>+16%</td><td>+13%</td><td>+96%</td><td class="group-start">2.79 MB</td><td>−2%</td><td>+17%</td><td>+29%</td></tr>
<tr><th scope="row"><a href="#lossy---screenshot">Screenshot</a></th><td class="group-start">92 kB</td><td>+81%</td><td>+9%</td><td>+122%</td><td class="group-start">68 kB</td><td>+6%</td><td>+44%</td><td>+176%</td></tr>
<tr><th scope="row"><a href="#lossy---illustration">Illustration</a></th><td class="group-start">361 kB</td><td>+78%</td><td>−1%</td><td>+100%</td><td class="group-start">273 kB</td><td>−6%</td><td>+5%</td><td>+139%</td></tr>
</tbody>
</table>
</div>

<details>

<summary>Show me the graphs!</summary>

## Encoding performance

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jxl-on-the-web/data/lossless",
  "props": {
    "x": "encodeMs"
  }
}</script>
</figure>

## Encoding memory usage

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jxl-on-the-web/data/lossless",
  "props": {
    "x": "encodeMemory"
  }
}</script>
</figure>

## Decoding performance

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jxl-on-the-web/data/lossless",
  "props": {
    "x": "decodeMs"
  }
}</script>
</figure>

</details>

# Animation

TODO

# Notes

- Progressive
  - No filesize overhead really
  - Chrome only but looking to land it in Firefox
  - Interop for JPEG XL
- Lossless
  - Do you really need lossless for web images?
  - F1 image
  - Screenshot
- Animation
  - Just don't
  - Originally pushed for it not to be supported
- Misinformation & AI
- Unsure of claims
  - COVID layoff claims
  - Conversations can get really weird (racism thing)
  - Moving of goalposts
  - Claiming it was ripped out of Chrome.
  - Both AVIF and JPEG XL have large Google contributions.
- Please test your own images
- https://giannirosato.com/blog/post/case-against-jxl/
- https://unsplash.com/photos/two-smiling-women-looking-at-a-smartphone-together-_t15AWPJNmg
- https://github.com/awxkee/jixel
