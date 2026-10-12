---
title: 'JPEG XL: Where does it fit on the web?'
date: 2026-10-06 01:00:00
summary: TODO
meta: TODO
code: shiki
#image: './img.png'
comments: none
---

JPEG XL has now landed across all major browsers, so I figured I'd take a closer look at what it's good/bad at compared to other formats.

# Methodology

I 'created' (yes, sorry) [a benchmarking script](https://github.com/jakearchibald/image-codec-bench), that encodes images using various codecs at various settings, and records various details.

I'm using the latest released versions of the image codecs, which at time of writing is:

- [avifenc](https://github.com/aomediacodec/libavif) 1.4.2
- [cjxl](https://github.com/libjxl/libjxl) 0.12.0
- [cwebp](https://chromium.googlesource.com/webm/libwebp/) 1.6.0 (only lossless is used later in the article)

I chose a selection of images, and encoded most of them to a width of 1598 pixels - which is 2x the maximum width images appear on this blog. This means they [look sharp on high density displays](/2021/serving-sharp-images-to-high-density-screens/), which most users have.

I ran this script on a series of images, on my 2024 MacBook M4 Pro. Here are the results:

# Lossy - F1 image

<figure class="full-figure max-figure">
  <img src="asset-url:./images/f1-targets/avif-q44-e0-d8-yuv444-ssimu70.2.avif" loading="lazy" width="1598" height="1032" alt="A side-on photo of an Alpine F1 car speeding up a hill" style="height:auto" />
</figure>

When I [first wrote about AVIF](https://jakearchibald.com/2020/avif-has-landed/), I used an F1 car as the first image, so I figured I'd do that again!

## Image quality

Ok, let's get to our first graph, the [SSIMULACRA2](https://github.com/cloudinary/ssimulacra2) score - a perceptual image quality metric by the folks behind JPEG XL.

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

- **The x-axis is visual quality** according to SSIMULACRA2. Higher is closer to the original. 50 is considered medium quality, 70 high, 80 very high, and 90 visually lossless. Although, I'm not sure if these ratings take high density displays into account.
- **The y-axis is file size**. Lower is better, for a given visual quality.
- **The orange lines represent JPEG XL.**
- **The blue lines represent AVIF.**
- **The dashed blue lines represent AVIF with its color data at half resolution.** Known as 4:2:0.
- **The darker lines represent higher effort levels for that codec.** cjxl calls this 'effort', so the e10 line is the top effort. Annoyingly, avifenc calls this 'speed', so the s0 line is the top effort.

Conclusions we can draw from this, for this image:

- AVIF performs significantly better than JPEG XL across all of these qualities.
- Even at AVIF's default effort, it beats JPEG XL's maximum effort.
- At medium to high qualities, the equivalent JPEG XL image is 40-50% larger than the AVIF image.
- At very high to visually lossless qualities, the equivalent JPEG XL image is 13-29% larger than the AVIF image.
- AVIF with 4:2:0 chroma subsampling doesn't seem worth it.
- Turning up the effort doesn't have much of an impact for JPEG XL.
- Going up one level of effort from the default on AVIF (s6 to s5) is a significant improvement.

Here's the quality results using a different quality metric, [ColorVideoVDP](https://github.com/gfxdisp/colorvideovdp):

<figure class="full-figure breakout">
<script type="component">{
  "module": "shared/demos/2026/jxl-on-the-web/data/f1",
  "props": {
    "metric": "jod"
  }
}</script>
</figure>

The result is roughly the same except:

- ColorVideoVDP records even more of a gap between AVIF and JPEG XL.
- ColorVideoVDP suggests there's some advantage to AVIF with 4:2:0 chroma subsampling at lower qualities.

## Examples

<script type="component">{
  "module": "shared/demos/2026/jxl-on-the-web/CodecCompare",
  "exportName": "Styles",
  "staticOnly": true
}</script>

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
        "jxl": { "url": "asset-url:./images/f1-targets/jxl-q20.5-e10-ssimu50.4.jxl", "bytes": "asset-size:./images/f1-targets/jxl-q20.5-e10-ssimu50.4.jxl", "score": "50.4" }
      },
      {
        "target": 60,
        "avif": { "url": "asset-url:./images/f1-targets/avif-q34-e0-d8-yuv444-ssimu60.1.avif", "bytes": "asset-size:./images/f1-targets/avif-q34-e0-d8-yuv444-ssimu60.1.avif", "score": "60.1" },
        "jxl": { "url": "asset-url:./images/f1-targets/jxl-q29.4-e10-ssimu60.1.jxl", "bytes": "asset-size:./images/f1-targets/jxl-q29.4-e10-ssimu60.1.jxl", "score": "60.1" }
      },
      {
        "target": 70,
        "avif": { "url": "asset-url:./images/f1-targets/avif-q44-e0-d8-yuv444-ssimu70.2.avif", "bytes": "asset-size:./images/f1-targets/avif-q44-e0-d8-yuv444-ssimu70.2.avif", "score": "70.2" },
        "jxl": { "url": "asset-url:./images/f1-targets/jxl-q53-e10-ssimu70.0.jxl", "bytes": "asset-size:./images/f1-targets/jxl-q53-e10-ssimu70.0.jxl", "score": "70.0" }
      },
      {
        "target": 80,
        "avif": { "url": "asset-url:./images/f1-targets/avif-q58-e0-d8-yuv444-ssimu80.1.avif", "bytes": "asset-size:./images/f1-targets/avif-q58-e0-d8-yuv444-ssimu80.1.avif", "score": "80.1" },
        "jxl": { "url": "asset-url:./images/f1-targets/jxl-q73.5-e10-ssimu80.1.jxl", "bytes": "asset-size:./images/f1-targets/jxl-q73.5-e10-ssimu80.1.jxl", "score": "80.1" }
      },
      {
        "target": 90,
        "avif": { "url": "asset-url:./images/f1-targets/avif-q86-e0-d8-yuv444-ssimu90.2.avif", "bytes": "asset-size:./images/f1-targets/avif-q86-e0-d8-yuv444-ssimu90.2.avif", "score": "90.2" },
        "jxl": { "url": "asset-url:./images/f1-targets/jxl-q91.4-e10-ssimu90.0.jxl", "bytes": "asset-size:./images/f1-targets/jxl-q91.4-e10-ssimu90.0.jxl", "score": "90.0" }
      }
    ]
  }
}</script>
</figure>

For archival, I'd tend towards near-lossless qualities, but if I'm just displaying an illustrative image on my blog, performance is more important to me. I'm personally happy with the 70 result. If you zoom in, you can see the quality loss, but if I was really concerned about the zoom-in case, I'd use something like the [`VisualViewport` API](https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport) to load in a higher resolution image when that happens, rather than make the download bigger for everyone.

At lower qualities you can see the difference in strategy between the codecs. The detail loss is around the same, but AVIF tends to smooth things out compared to the original, whereas JPEG XL seems to introduce rougher patterns.

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

Conclusions we can draw from this, for this image:

- At default efforts, JPEG XL takes over twice as long to encode at medium and high quality compared to AVIF. Remember that JPEG XL produces bigger files at these qualities, so with JPEG XL you're spending more encode time to get a worse result.
- At very high qualities, JPEG XL's encode time decreases, but it's still over 60% slower than AVIF.
- Higher efforts increase encode time significantly. As we saw with the quality graph, this isn't really worth it for JPEG XL, but depending on your use-case, you might consider a higher effort for AVIF.
- AVIF with 4:2:0 chroma subsampling is faster to encode than full-resolution chroma.

I see a lot of folks saying that AVIF is slow to encode, but that just doesn't seem to be true. Maybe it was true for an earlier version.

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

Conclusions we can draw from this, for this image:

- At default efforts and medium/high quality, JPEG XL uses over 3x the memory compared to AVIF.
- Higher JPEG XL efforts use orders of magnitude more. As we've already seen, this doesn't really produce better results.
- The higher effort settings for AVIF don't change the memory usage much.
- AVIF with 4:2:0 chroma subsampling uses ~30% less memory than full-resolution chroma.

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

Conclusions we can draw from this, for this image:

- JPEG XL takes about twice as long to decode as AVIF.
- Chrome is the fastest to decode both formats.
- Safari's JPEG XL decoder is significantly slower than Firefox & Chrome's.
- JPEG XL becomes suddenly faster to decode at very high quality settings (but still slower than AVIF). I think this is due to an edge preserving filter that does more work at lower quality settings.

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
        "jxl": { "url": "asset-url:./images/women-with-phones-targets/jxl-q31.2-e10-ssimu50.3.jxl", "bytes": "asset-size:./images/women-with-phones-targets/jxl-q31.2-e10-ssimu50.3.jxl", "score": "50.3" }
      },
      {
        "target": 60,
        "avif": { "url": "asset-url:./images/women-with-phones-targets/avif-q40-e0-d8-yuv444-ssimu61.3.avif", "bytes": "asset-size:./images/women-with-phones-targets/avif-q40-e0-d8-yuv444-ssimu61.3.avif", "score": "61.3" },
        "jxl": { "url": "asset-url:./images/women-with-phones-targets/jxl-q52.5-e10-ssimu60.1.jxl", "bytes": "asset-size:./images/women-with-phones-targets/jxl-q52.5-e10-ssimu60.1.jxl", "score": "60.1" }
      },
      {
        "target": 70,
        "avif": { "url": "asset-url:./images/women-with-phones-targets/avif-q49-e0-d8-yuv444-ssimu70.7.avif", "bytes": "asset-size:./images/women-with-phones-targets/avif-q49-e0-d8-yuv444-ssimu70.7.avif", "score": "70.7" },
        "jxl": { "url": "asset-url:./images/women-with-phones-targets/jxl-q69.6-e10-ssimu70.1.jxl", "bytes": "asset-size:./images/women-with-phones-targets/jxl-q69.6-e10-ssimu70.1.jxl", "score": "70.1" }
      },
      {
        "target": 80,
        "avif": { "url": "asset-url:./images/women-with-phones-targets/avif-q63-e0-d8-yuv444-ssimu80.2.avif", "bytes": "asset-size:./images/women-with-phones-targets/avif-q63-e0-d8-yuv444-ssimu80.2.avif", "score": "80.2" },
        "jxl": { "url": "asset-url:./images/women-with-phones-targets/jxl-q82.4-e10-ssimu80.1.jxl", "bytes": "asset-size:./images/women-with-phones-targets/jxl-q82.4-e10-ssimu80.1.jxl", "score": "80.1" }
      },
      {
        "target": 90,
        "avif": { "url": "asset-url:./images/women-with-phones-targets/avif-q88-e0-d8-yuv444-ssimu90.3.avif", "bytes": "asset-size:./images/women-with-phones-targets/avif-q88-e0-d8-yuv444-ssimu90.3.avif", "score": "90.3" },
        "jxl": { "url": "asset-url:./images/women-with-phones-targets/jxl-q94.1-e10-ssimu90.1.jxl", "bytes": "asset-size:./images/women-with-phones-targets/jxl-q94.1-e10-ssimu90.1.jxl", "score": "90.1" }
      }
    ]
  }
}</script>
</figure>

The data tells a similar story to the F1 example, except:

- At medium-high qualities, the gap is even bigger this time, with JPEG XL being 50-60% larger than AVIF.
- It gets much closer at "visually lossless", with JPEG XL being only 6% larger.
- The highest effort setting on JPEG XL is slightly better than the other effort settings, but it still performs much worse than AVIF at default effort.

At lower qualities, you can see the smoothing on the face, but it's the same for both AVIF and JPEG XL.

I won't bore you with the graphs unless you actively want to be bored.

<details>

<summary>Bore away!</summary>

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
        "jxl": { "url": "asset-url:./images/red-panda-targets/jxl-q40.9-e10-ssimu50.2.jxl", "bytes": "asset-size:./images/red-panda-targets/jxl-q40.9-e10-ssimu50.2.jxl", "score": "50.2" }
      },
      {
        "target": 60,
        "avif": { "url": "asset-url:./images/red-panda-targets/avif-q44-e0-d8-yuv444-ssimu60.6.avif", "bytes": "asset-size:./images/red-panda-targets/avif-q44-e0-d8-yuv444-ssimu60.6.avif", "score": "60.6" },
        "jxl": { "url": "asset-url:./images/red-panda-targets/jxl-q58.7-e10-ssimu60.0.jxl", "bytes": "asset-size:./images/red-panda-targets/jxl-q58.7-e10-ssimu60.0.jxl", "score": "60.0" }
      },
      {
        "target": 70,
        "avif": { "url": "asset-url:./images/red-panda-targets/avif-q52-e0-d8-yuv444-ssimu70.3.avif", "bytes": "asset-size:./images/red-panda-targets/avif-q52-e0-d8-yuv444-ssimu70.3.avif", "score": "70.3" },
        "jxl": { "url": "asset-url:./images/red-panda-targets/jxl-q71.9-e10-ssimu70.0.jxl", "bytes": "asset-size:./images/red-panda-targets/jxl-q71.9-e10-ssimu70.0.jxl", "score": "70.0" }
      },
      {
        "target": 80,
        "avif": { "url": "asset-url:./images/red-panda-targets/avif-q67-e0-d8-yuv444-ssimu80.7.avif", "bytes": "asset-size:./images/red-panda-targets/avif-q67-e0-d8-yuv444-ssimu80.7.avif", "score": "80.7" },
        "jxl": { "url": "asset-url:./images/red-panda-targets/jxl-q84.5-e10-ssimu80.1.jxl", "bytes": "asset-size:./images/red-panda-targets/jxl-q84.5-e10-ssimu80.1.jxl", "score": "80.1" }
      },
      {
        "target": 90,
        "avif": { "url": "asset-url:./images/red-panda-targets/avif-q90-e0-d8-yuv444-ssimu90.3.avif", "bytes": "asset-size:./images/red-panda-targets/avif-q90-e0-d8-yuv444-ssimu90.3.avif", "score": "90.3" },
        "jxl": { "url": "asset-url:./images/red-panda-targets/jxl-q95.6-e10-ssimu90.2.jxl", "bytes": "asset-size:./images/red-panda-targets/jxl-q95.6-e10-ssimu90.2.jxl", "score": "90.2" }
      }
    ]
  }
}</script>
</figure>

I threw this one in because it's the default image in [Squoosh](https://squoosh.app/), but I guess the sharp lines of the hairs makes it different to the previous image. In fact, even at low qualities, the difference between the original is much less perceptible to my eyes compared to the other images.

The story is mostly the same compared to the other images, except:

- The gap between AVIF and JPEG XL is smaller for this image, with JPEG XL being only ~22% larger at medium-high quality levels.
- The encode times are closer too. At default efforts, JPEG XL is only ~50% slower. But remember that this also produces worse results.
- The decode times are also closer. In Chrome, at very high quality, the JPEG XL decodes slightly faster.

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

# Lossy - weasel (outlier)

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
        "jxl": { "url": "asset-url:./images/critter-targets/jxl-q64.4-e10-ssimu50.1.jxl", "bytes": "asset-size:./images/critter-targets/jxl-q64.4-e10-ssimu50.1.jxl", "score": "50.1" }
      },
      {
        "target": 60,
        "avif": { "url": "asset-url:./images/critter-targets/avif-q52-e0-d8-yuv444-ssimu60.1.avif", "bytes": "asset-size:./images/critter-targets/avif-q52-e0-d8-yuv444-ssimu60.1.avif", "score": "60.1" },
        "jxl": { "url": "asset-url:./images/critter-targets/jxl-q73.7-e10-ssimu60.1.jxl", "bytes": "asset-size:./images/critter-targets/jxl-q73.7-e10-ssimu60.1.jxl", "score": "60.1" }
      },
      {
        "target": 70,
        "avif": { "url": "asset-url:./images/critter-targets/avif-q60-e0-d8-yuv444-ssimu70.5.avif", "bytes": "asset-size:./images/critter-targets/avif-q60-e0-d8-yuv444-ssimu70.5.avif", "score": "70.5" },
        "jxl": { "url": "asset-url:./images/critter-targets/jxl-q80.1-e10-ssimu70.1.jxl", "bytes": "asset-size:./images/critter-targets/jxl-q80.1-e10-ssimu70.1.jxl", "score": "70.1" }
      },
      {
        "target": 80,
        "avif": { "url": "asset-url:./images/critter-targets/avif-q74-e0-d8-yuv444-ssimu80.5.avif", "bytes": "asset-size:./images/critter-targets/avif-q74-e0-d8-yuv444-ssimu80.5.avif", "score": "80.5" },
        "jxl": { "url": "asset-url:./images/critter-targets/jxl-q87.2-e10-ssimu80.1.jxl", "bytes": "asset-size:./images/critter-targets/jxl-q87.2-e10-ssimu80.1.jxl", "score": "80.1" }
      },
      {
        "target": 90,
        "avif": { "url": "asset-url:./images/critter-targets/avif-q90-e0-d8-yuv444-ssimu90.2.avif", "bytes": "asset-size:./images/critter-targets/avif-q90-e0-d8-yuv444-ssimu90.2.avif", "score": "90.2" },
        "jxl": { "url": "asset-url:./images/critter-targets/jxl-q95-e10-ssimu90.0.jxl", "bytes": "asset-size:./images/critter-targets/jxl-q95-e10-ssimu90.0.jxl", "score": "90.0" }
      }
    ]
  }
}</script>
</figure>

I've played with both codecs a lot, and for photos, most results similar, where AVIF significantly beats JPEG XL. However, every now and then there's an outlier, such as this image.

Compared to previous results:

- AVIF produces files around 5% larger than JPEG XL for a given quality.
- Similar to the red panda image, at higher qualities in Chrome, JPEG XL decodes faster the equivalent AVIF. JPEG XL decodes slower than AVIF at lower qualities, and at all qualities in Firefox and Safari.

TODO: Both AVIF and JPEG XL tend towards a lower ssimu quality. Which seems ok if you're happy losing the noise. But even then JXL is more efficient.

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
    "lossless": "asset-url:./images/screenshot-targets/lossless.jxl",
    "losslessBytes": "asset-size:./images/screenshot-targets/lossless.jxl",
    "initialQuality": 3,
    "initialCodec": "avif",
    "qualities": [
      {
        "target": 45,
        "avif": { "url": "asset-url:./images/screenshot-targets/avif-q0-e0-d8-yuv444-ssimu49.6.avif", "bytes": "asset-size:./images/screenshot-targets/avif-q0-e0-d8-yuv444-ssimu49.6.avif", "score": "49.6" },
        "jxl": { "url": "asset-url:./images/screenshot-targets/jxl-q17.5-e7-ssimu45.0.jxl", "bytes": "asset-size:./images/screenshot-targets/jxl-q17.5-e7-ssimu45.0.jxl", "score": "45.0" }
      },
      {
        "target": 60,
        "avif": { "url": "asset-url:./images/screenshot-targets/avif-q14-e0-d8-yuv444-ssimu61.5.avif", "bytes": "asset-size:./images/screenshot-targets/avif-q14-e0-d8-yuv444-ssimu61.5.avif", "score": "61.5" },
        "jxl": { "url": "asset-url:./images/screenshot-targets/jxl-q18.1-e7-ssimu72.9.jxl", "bytes": "asset-size:./images/screenshot-targets/jxl-q18.1-e7-ssimu72.9.jxl", "score": "72.9" }
      },
      {
        "target": 70,
        "avif": { "url": "asset-url:./images/screenshot-targets/avif-q26-e0-d8-yuv444-ssimu70.3.avif", "bytes": "asset-size:./images/screenshot-targets/avif-q26-e0-d8-yuv444-ssimu70.3.avif", "score": "70.3" },
        "jxl": { "url": "asset-url:./images/screenshot-targets/jxl-q18.1-e7-ssimu72.9.jxl", "bytes": "asset-size:./images/screenshot-targets/jxl-q18.1-e7-ssimu72.9.jxl", "score": "72.9" }
      },
      {
        "target": 80,
        "avif": { "url": "asset-url:./images/screenshot-targets/avif-q50-e0-d8-yuv444-ssimu80.4.avif", "bytes": "asset-size:./images/screenshot-targets/avif-q50-e0-d8-yuv444-ssimu80.4.avif", "score": "80.4" },
        "jxl": { "url": "asset-url:./images/screenshot-targets/jxl-q39.4-e7-ssimu80.2.jxl", "bytes": "asset-size:./images/screenshot-targets/jxl-q39.4-e7-ssimu80.2.jxl", "score": "80.2" }
      },
      {
        "target": 90,
        "avif": { "url": "asset-url:./images/screenshot-targets/avif-q82-e0-d8-yuv444-ssimu90.1.avif", "bytes": "asset-size:./images/screenshot-targets/avif-q82-e0-d8-yuv444-ssimu90.1.avif", "score": "90.1" },
        "jxl": { "url": "asset-url:./images/screenshot-targets/jxl-q81.9-e7-ssimu90.2.jxl", "bytes": "asset-size:./images/screenshot-targets/jxl-q81.9-e7-ssimu90.2.jxl", "score": "90.2" }
      }
    ]
  }
}</script>
</figure>

Ok there are a few things to cover here:

- JPEG XL performs really badly with this kind of image - it ends up 64% larger than the equivalent AVIF in the best case.
- At "visually lossless" quality, the JPEG XL lossy file is larger than the JPEG XL lossless file (I'll look at lossless performance in more detail later in the article).
- JPEG XL has a quality cliff with this image - it can't produce anything between ssimu ~41 and ~69. JPEG XL is actually two codecs, VarDCT and Modular - I think what we're seeing here is a switch between the two, but I'm not sure.
- Similarly, AVIF can't produce anything lower than ~49, so some of the comparisons above aren't quite equivalent at the lower qualities.
- JPEG XL's default effort mode produces better results than higher efforts for this image, which is very weird. In the example images above, I've previously used the highest effort, but in this case I'm using JPEG XL's default effort.
- AVIF with 4:2:0 chroma subsampling performs better than 4:4:4 here, which isn't what I'd expect for this kind of image. I guess because it's mostly purple, colour data isn't as important.
- JPEG XL underperforms significantly here when it comes to decoding performance, but this is likely a side effect of it producing much larger files for a given quality.

I previously said I'm happy with qualities around 70, but that isn't the case with this image. At 70 the artefacts are pretty noticeable around the Firefox logo (to me, anyway), so I'd go with 80. Thankfully, AVIF's "quality level 50", which I tend to use, produces an image with a ssimu quality around 80, whereas for photos it produces images with a ssimu quality around 70, so it handles this use-case well.

Some developers, especially those who've been around as long as I have, seem to think that things like screenshots need to be delivered in a lossless format. But I think this is because they're used to formats like JPEG and WebP (and seemingly JPEG XL) which handle this kind of image badly, whereas lossy AVIF handles them really well.

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

You can really see that JPEG XL performance cliff!

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

As I noted above, the high JPEG XL decoding times here are likely a side effect of it producing much larger files for a given quality.

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
        "jxl": { "url": "asset-url:./images/cat-illustration-targets/jxl-q18.1-e10-ssimu51.0.jxl", "bytes": "asset-size:./images/cat-illustration-targets/jxl-q18.1-e10-ssimu51.0.jxl", "score": "51.0" }
      },
      {
        "target": 60,
        "avif": { "url": "asset-url:./images/cat-illustration-targets/avif-q28-e0-d8-yuv444-ssimu60.3.avif", "bytes": "asset-size:./images/cat-illustration-targets/avif-q28-e0-d8-yuv444-ssimu60.3.avif", "score": "60.3" },
        "jxl": { "url": "asset-url:./images/cat-illustration-targets/jxl-q23.3-e10-ssimu60.0.jxl", "bytes": "asset-size:./images/cat-illustration-targets/jxl-q23.3-e10-ssimu60.0.jxl", "score": "60.0" }
      },
      {
        "target": 70,
        "avif": { "url": "asset-url:./images/cat-illustration-targets/avif-q39-e0-d8-yuv444-ssimu71.5.avif", "bytes": "asset-size:./images/cat-illustration-targets/avif-q39-e0-d8-yuv444-ssimu71.5.avif", "score": "71.5" },
        "jxl": { "url": "asset-url:./images/cat-illustration-targets/jxl-q44.9-e10-ssimu70.2.jxl", "bytes": "asset-size:./images/cat-illustration-targets/jxl-q44.9-e10-ssimu70.2.jxl", "score": "70.2" }
      },
      {
        "target": 80,
        "avif": { "url": "asset-url:./images/cat-illustration-targets/avif-q52-e0-d8-yuv444-ssimu80.2.avif", "bytes": "asset-size:./images/cat-illustration-targets/avif-q52-e0-d8-yuv444-ssimu80.2.avif", "score": "80.2" },
        "jxl": { "url": "asset-url:./images/cat-illustration-targets/jxl-q72.1-e10-ssimu80.0.jxl", "bytes": "asset-size:./images/cat-illustration-targets/jxl-q72.1-e10-ssimu80.0.jxl", "score": "80.0" }
      },
      {
        "target": 90,
        "avif": { "url": "asset-url:./images/cat-illustration-targets/avif-q99-e0-d8-yuv444-ssimu86.6.avif", "bytes": "asset-size:./images/cat-illustration-targets/avif-q99-e0-d8-yuv444-ssimu86.6.avif", "score": "86.6" },
        "jxl": { "url": "asset-url:./images/cat-illustration-targets/jxl-q97.4-e10-ssimu90.1.jxl", "bytes": "asset-size:./images/cat-illustration-targets/jxl-q97.4-e10-ssimu90.1.jxl", "score": "90.1" }
      }
    ]
  }
}</script>
</figure>

TODO

From [here](https://unsplash.com/illustrations/hands-feeding-orange-cat-a-treat-on-bed-9tXfoalzAqY). Still 1.1 MB as compressed & minified SVG.

- JPEG XL does really badly. Roughly double the size of the AVIF.
- AVIF cannot reach ssimu 90.
- Some cross-over in memory usage
- JXL lossless better than "visually lossless" in both formats.

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

TODO

The images so far have been a similar resolution, so let's see if smaller images behave differently.

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
        "jxl": { "url": "asset-url:./images/f1-small-targets/jxl-q28-e10-ssimu50.7.jxl", "bytes": "asset-size:./images/f1-small-targets/jxl-q28-e10-ssimu50.7.jxl", "score": "50.7" }
      },
      {
        "target": 60,
        "avif": { "url": "asset-url:./images/f1-small-targets/avif-q39-e0-d8-yuv444-ssimu60.7.avif", "bytes": "asset-size:./images/f1-small-targets/avif-q39-e0-d8-yuv444-ssimu60.7.avif", "score": "60.7" },
        "jxl": { "url": "asset-url:./images/f1-small-targets/jxl-q43.5-e10-ssimu60.1.jxl", "bytes": "asset-size:./images/f1-small-targets/jxl-q43.5-e10-ssimu60.1.jxl", "score": "60.1" }
      },
      {
        "target": 70,
        "avif": { "url": "asset-url:./images/f1-small-targets/avif-q47-e0-d8-yuv444-ssimu70.4.avif", "bytes": "asset-size:./images/f1-small-targets/avif-q47-e0-d8-yuv444-ssimu70.4.avif", "score": "70.4" },
        "jxl": { "url": "asset-url:./images/f1-small-targets/jxl-q62.8-e10-ssimu70.2.jxl", "bytes": "asset-size:./images/f1-small-targets/jxl-q62.8-e10-ssimu70.2.jxl", "score": "70.2" }
      },
      {
        "target": 80,
        "avif": { "url": "asset-url:./images/f1-small-targets/avif-q60-e0-d8-yuv444-ssimu80.6.avif", "bytes": "asset-size:./images/f1-small-targets/avif-q60-e0-d8-yuv444-ssimu80.6.avif", "score": "80.6" },
        "jxl": { "url": "asset-url:./images/f1-small-targets/jxl-q78.5-e10-ssimu80.2.jxl", "bytes": "asset-size:./images/f1-small-targets/jxl-q78.5-e10-ssimu80.2.jxl", "score": "80.2" }
      },
      {
        "target": 90,
        "avif": { "url": "asset-url:./images/f1-small-targets/avif-q84-e0-d8-yuv444-ssimu90.4.avif", "bytes": "asset-size:./images/f1-small-targets/avif-q84-e0-d8-yuv444-ssimu90.4.avif", "score": "90.4" },
        "jxl": { "url": "asset-url:./images/f1-small-targets/jxl-q93.1-e10-ssimu90.2.jxl", "bytes": "asset-size:./images/f1-small-targets/jxl-q93.1-e10-ssimu90.2.jxl", "score": "90.2" }
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

</details>

# Lossy - large

TODO

And now a large image!

- JPEG XL significantly larger file size than AVIF, except at "visually lossless" where it crosses over.
- In JPEG XL, effort seems to make little difference. Sometimes makes the file larger.
- In AVIF, s5 is a decent improvement over s6
- JXL default encoding almost 4x slower than AVIF
- Anything more than default effort in JXL is orders of magnitude slower than AVIF. Even slower than AVIF at max effort.
- JXL uses a lot more memory to encode than avif.
- Slower to decode, except in Chrome where there's some cross-over.

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
        "jxl": { "url": "asset-url:./images/f1-large-targets/jxl-q13.1-e10-ssimu50.0.jxl", "bytes": "asset-size:./images/f1-large-targets/jxl-q13.1-e10-ssimu50.0.jxl", "score": "50.0" }
      },
      {
        "target": 60,
        "avif": { "url": "asset-url:./images/f1-large-targets/avif-q26-e0-d8-yuv444-ssimu60.1.avif", "bytes": "asset-size:./images/f1-large-targets/avif-q26-e0-d8-yuv444-ssimu60.1.avif", "score": "60.1" },
        "jxl": { "url": "asset-url:./images/f1-large-targets/jxl-q20.9-e10-ssimu60.0.jxl", "bytes": "asset-size:./images/f1-large-targets/jxl-q20.9-e10-ssimu60.0.jxl", "score": "60.0" }
      },
      {
        "target": 70,
        "avif": { "url": "asset-url:./images/f1-large-targets/avif-q39-e0-d8-yuv444-ssimu70.4.avif", "bytes": "asset-size:./images/f1-large-targets/avif-q39-e0-d8-yuv444-ssimu70.4.avif", "score": "70.4" },
        "jxl": { "url": "asset-url:./images/f1-large-targets/jxl-q41.2-e10-ssimu70.0.jxl", "bytes": "asset-size:./images/f1-large-targets/jxl-q41.2-e10-ssimu70.0.jxl", "score": "70.0" }
      },
      {
        "target": 80,
        "avif": { "url": "asset-url:./images/f1-large-targets/avif-q59-e0-d8-yuv444-ssimu80.4.avif", "bytes": "asset-size:./images/f1-large-targets/avif-q59-e0-d8-yuv444-ssimu80.4.avif", "score": "80.4" },
        "jxl": { "url": "asset-url:./images/f1-large-targets/jxl-q71.8-e10-ssimu80.0.jxl", "bytes": "asset-size:./images/f1-large-targets/jxl-q71.8-e10-ssimu80.0.jxl", "score": "80.0" }
      },
      {
        "target": 90,
        "avif": { "url": "asset-url:./images/f1-large-targets/avif-q90-e0-d8-yuv444-ssimu90.5.avif", "bytes": "asset-size:./images/f1-large-targets/avif-q90-e0-d8-yuv444-ssimu90.5.avif", "score": "90.5" },
        "jxl": { "url": "asset-url:./images/f1-large-targets/jxl-q93.3-e10-ssimu90.0.jxl", "bytes": "asset-size:./images/f1-large-targets/jxl-q93.3-e10-ssimu90.0.jxl", "score": "90.0" }
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

For the images I've looked at so far, I encoded them with `avifenc -q 50` and `cjxl -q 70`, and recorded the resulting SSIMULACRA2 scores:

<style>
  /* Codec colours, matching the charts */
  .data-table thead .avif {
    background: #dbe8f8;
    color: #0b3d7a;
  }
  .data-table thead .jxl {
    background: #fbe1d6;
    color: #8a3410;
  }
</style>

<div class="data-table">
<table>
<thead>
<tr><th class="row-heading" rowspan="2" scope="col">Image</th><th class="avif" colspan="4" scope="colgroup">AVIF</th><th class="jxl group-start" colspan="2" scope="colgroup">JPEG XL</th></tr>
<tr><th class="avif" scope="col">s6 4:4:4</th><th class="avif" scope="col">s0 4:4:4</th><th class="avif" scope="col">s6 4:2:0</th><th class="avif" scope="col">s0 4:2:0</th><th class="jxl group-start" scope="col">e7</th><th class="jxl" scope="col">e10</th></tr>
</thead>
<tbody>
<tr><th scope="row"><a href="#lossy---f1-image">F1</a></th><td class="avif">74.6</td><td class="avif">75.9</td><td class="avif">73.4</td><td class="avif">73.8</td><td class="jxl group-start">79.2</td><td class="jxl">78.0</td></tr>
<tr><th scope="row"><a href="#lossy---small">F1 (small)</a></th><td class="avif">70.9</td><td class="avif">73.5</td><td class="avif">68.4</td><td class="avif">69.5</td><td class="jxl group-start">75.6</td><td class="jxl">73.9</td></tr>
<tr><th scope="row"><a href="#lossy---large">F1 (large)</a></th><td class="avif">77.0</td><td class="avif">77.4</td><td class="avif">76.2</td><td class="avif">76.6</td><td class="jxl group-start">80.1</td><td class="jxl">79.2</td></tr>
<tr><th scope="row"><a href="#lossy---people">People</a></th><td class="avif">70.7</td><td class="avif">72.0</td><td class="avif">69.8</td><td class="avif">70.5</td><td class="jxl group-start">69.6</td><td class="jxl">70.3</td></tr>
<tr><th scope="row"><a href="#lossy---red-panda">Red panda</a></th><td class="avif">67.5</td><td class="avif">68.8</td><td class="avif">67.0</td><td class="avif">67.2</td><td class="jxl group-start">69.5</td><td class="jxl">68.4</td></tr>
<tr><th scope="row"><a href="#lossy---weasel-outlier">Weasel</a></th><td class="avif">56.7</td><td class="avif">57.2</td><td class="avif">56.0</td><td class="avif">56.3</td><td class="jxl group-start">56.6</td><td class="jxl">55.4</td></tr>
<tr><th scope="row"><a href="#lossy---screenshot">Screenshot</a></th><td class="avif">80.2</td><td class="avif">80.4</td><td class="avif">82.3</td><td class="avif">81.9</td><td class="jxl group-start">86.5</td><td class="jxl">87.6</td></tr>
<tr><th scope="row"><a href="#lossy---illustration">Illustration</a></th><td class="avif">78.6</td><td class="avif">79.7</td><td class="avif">76.8</td><td class="avif">77.9</td><td class="jxl group-start">80.3</td><td class="jxl">78.5</td></tr>
</tbody>
</table>
</div>

The behaviour of the codecs here seems really similar. Both produce a range of SSIMULACRA2 scores, and they both go higher or lower for the same image.

And I think this is ok? Like, both codecs go for a lower quality for the Weasel picture, which removed noise without reducing quality of the image subject. With the screenshot, both codecs go for a higher quality, which seems justified to my eyes.

Obviously this is a small sample size, but I haven't seen anything that suggests using a single quality setting is a risk, for either AVIF or JPEG XL.

# Progressive

Here's a progressive demo:

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
    "initialBytes": 13000,
    "images": [
      { "label": "AVIF", "url": "asset-url:./images/progressive/f1-large.avif", "bytes": "asset-size:./images/progressive/f1-large.avif" },
      { "label": "JPEG XL", "url": "asset-url:./images/progressive/f1-large.jxl", "bytes": "asset-size:./images/progressive/f1-large.jxl" }
    ]
  }
}</script>
</figure>

TODO: Show example where JXL looks potentially loaded, but parts like the apecoin logo are blurry. Although I accept that blurring out the apecoin logo may be a societal good.

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
      { "key": "jxl", "label": "JPEG XL", "color": "#eb6834" }
    ],
    "initialQuality": 2,
    "initialCodec": "avif",
    "qualities": [
      {
        "target": 50,
        "avif": { "url": "asset-url:./images/neon-hdr-10bit-targets/avif-q39-e0-d10-yuv444-ssimu50.1.avif", "bytes": "asset-size:./images/neon-hdr-10bit-targets/avif-q39-e0-d10-yuv444-ssimu50.1.avif", "score": "50.1" },
        "avifPq": { "url": "asset-url:./images/neon-hdr-10bit-targets/avif-q49-e0-d10-yuv444-pq-ssimu50.8.avif", "bytes": "asset-size:./images/neon-hdr-10bit-targets/avif-q49-e0-d10-yuv444-pq-ssimu50.8.avif", "score": "50.8" },
        "jxl": { "url": "asset-url:./images/neon-hdr-10bit-targets/jxl-q51.3-e10-ssimu50.1.jxl", "bytes": "asset-size:./images/neon-hdr-10bit-targets/jxl-q51.3-e10-ssimu50.1.jxl", "score": "50.1" }
      },
      {
        "target": 60,
        "avif": { "url": "asset-url:./images/neon-hdr-10bit-targets/avif-q49-e0-d10-yuv444-ssimu61.5.avif", "bytes": "asset-size:./images/neon-hdr-10bit-targets/avif-q49-e0-d10-yuv444-ssimu61.5.avif", "score": "61.5" },
        "avifPq": { "url": "asset-url:./images/neon-hdr-10bit-targets/avif-q59-e0-d10-yuv444-pq-ssimu60.2.avif", "bytes": "asset-size:./images/neon-hdr-10bit-targets/avif-q59-e0-d10-yuv444-pq-ssimu60.2.avif", "score": "60.2" },
        "jxl": { "url": "asset-url:./images/neon-hdr-10bit-targets/jxl-q66.7-e10-ssimu60.2.jxl", "bytes": "asset-size:./images/neon-hdr-10bit-targets/jxl-q66.7-e10-ssimu60.2.jxl", "score": "60.2" }
      },
      {
        "target": 70,
        "avif": { "url": "asset-url:./images/neon-hdr-10bit-targets/avif-q62-e0-d10-yuv444-ssimu70.2.avif", "bytes": "asset-size:./images/neon-hdr-10bit-targets/avif-q62-e0-d10-yuv444-ssimu70.2.avif", "score": "70.2" },
        "avifPq": { "url": "asset-url:./images/neon-hdr-10bit-targets/avif-q75-e0-d10-yuv444-pq-ssimu70.5.avif", "bytes": "asset-size:./images/neon-hdr-10bit-targets/avif-q75-e0-d10-yuv444-pq-ssimu70.5.avif", "score": "70.5" },
        "jxl": { "url": "asset-url:./images/neon-hdr-10bit-targets/jxl-q78.2-e10-ssimu70.0.jxl", "bytes": "asset-size:./images/neon-hdr-10bit-targets/jxl-q78.2-e10-ssimu70.0.jxl", "score": "70.0" }
      },
      {
        "target": 80,
        "avif": { "url": "asset-url:./images/neon-hdr-10bit-targets/avif-q84-e0-d10-yuv444-ssimu80.7.avif", "bytes": "asset-size:./images/neon-hdr-10bit-targets/avif-q84-e0-d10-yuv444-ssimu80.7.avif", "score": "80.7" },
        "avifPq": { "url": "asset-url:./images/neon-hdr-10bit-targets/avif-q90-e0-d10-yuv444-pq-ssimu80.7.avif", "bytes": "asset-size:./images/neon-hdr-10bit-targets/avif-q90-e0-d10-yuv444-pq-ssimu80.7.avif", "score": "80.7" },
        "jxl": { "url": "asset-url:./images/neon-hdr-10bit-targets/jxl-q89.6-e10-ssimu80.0.jxl", "bytes": "asset-size:./images/neon-hdr-10bit-targets/jxl-q89.6-e10-ssimu80.0.jxl", "score": "80.0" }
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

# Notes

- Progressive
  - No filesize overhead really
  - Chrome only but looking to land it in Firefox
  - Interop for JPEG XL
- HDR
  - Gain maps vs not
- JPEG transcoding
  - Talk about large vs small decoding time
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

https://unsplash.com/photos/two-smiling-women-looking-at-a-smartphone-together-_t15AWPJNmg
