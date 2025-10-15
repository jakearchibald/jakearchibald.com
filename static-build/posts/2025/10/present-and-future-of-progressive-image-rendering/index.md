---
title: The present and potential future of progressive image rendering
date: 2025-10-16 01:00:00
summary: Exploring progressive image rendering across JPEG, PNG, WebP, AVIF, and JPEG XL.
meta: Exploring progressive image rendering across JPEG, PNG, WebP, AVIF, and JPEG XL.
image: './img.jpg'
---

Progressive image formats allow the decoder to create a partial rendering when only part of the image resource is available. Sometimes it's a part of the image, and sometimes it's a low quality/resolution version of the image. I've been digging into it recently, and I think there are some common misconceptions, and a more pragmatic solution I'd like to see from AVIF.

Let's dive straight into the kinds of progressive rendering that are currently available natively in browsers.

# The current state of progressive image rendering in browsers

Here's the image I'm going to use for comparison:

<figure class="full-figure max-figure">
  <img src="asset-url:./imgs/fox.avif" loading="lazy" width="1598" height="1753" alt="A winter photo of a fox, standing on grass, with foliage in the background" style="height:auto" />
</figure>

Due to its high resolution (1598x1753), and lots of sharp detail, it's asset-pretty-size:./imgs/fox.avif, even using AVIF.

I created similar file-sized versions of the image in other formats to compare when they start to render, and when they show enough detail that you can tell it's a fox in some woodland.

Let's go!

## JPEG

Trusty old JPEG can be encoded in a progressive way, which is the default in [Squoosh](https://squoosh.app/).

[Here's a little web app](https://random-stuff.jakearchibald.com/apps/partial-img-decode/) that lets you test progressive rendering of any image, and here's the [app ready-loaded with the JPEG version of the fox image](https://random-stuff.jakearchibald.com/apps/partial-img-decode/?demo=fox.jpg&density=2).

You get a top-to-bottom low resolution render that starts around 1.2 kB in, and it finishes its first pass at around 33 kB (21% of the file size). Interestingly, that looks different in Firefox and Chromium-based browsers vs Safari:

<figure class="full-figure max-figure">
  <img src="asset-url:./imgs/jpeg-safari-vs.avif" loading="lazy" width="1598" height="1721" alt="The previous fox image, partially loaded. In Safari it appears blocky, in Firefox and Chromium it appears smooth" style="height:auto" />
</figure>

In both cases you can tell what the image is, but the Safari rendering is blocky, whereas Firefox and Chromium are smoothed. I much prefer the Firefox/Chromium rendering.

After that, the resolution is improved over multiple passes.

With JPEG, progressive rendering seems to be free in terms of quality/size, but it isn't free in terms of decoding time.

[Here's another little web app](https://random-stuff.jakearchibald.com/apps/img-decode-bench/), this time to benchmark image decoding in the browser. Comparing [progressive JPEG](https://random-stuff.jakearchibald.com/apps/img-decode-bench/?demo=fox.jpg) with [non-progressive JPEG](https://random-stuff.jakearchibald.com/apps/img-decode-bench/?demo=fox-no-progressive.jpg), the progressive JPEG takes around 40% longer to decode, but on my M4 pro that's only about 1.3ms, which seems like a reasonable trade-off.

## PNG

PNG generally renders from top to bottom. There's an interlaced mode, but it significantly increases the file size, so I don't recommend it.

For completion, [here's a demo](https://random-stuff.jakearchibald.com/apps/partial-img-decode/?demo=fox-interlaced.png&density=2). I had to… umm… modify the image somewhat, in order to bring the file size down to some acceptable level.

## WebP

In Firefox and Chrome, WebP renders from top to bottom. It also takes around 43 kB (28%) before it renders anything. I guess the start of the file contains the colour data, so it can only render progressively as it starts receiving the final luma channel.

Safari unfortunately doesn't perform any progressive rendering of WebP. It doesn't render anything until it has the whole file.

[Here's a live demo](https://random-stuff.jakearchibald.com/apps/partial-img-decode/?demo=fox.webp&density=2).

## AVIF

Regular AVIF doesn't support any kind of progressive rendering. You get nothing, then you get the whole image ([demo](https://random-stuff.jakearchibald.com/apps/partial-img-decode/?demo=fox.avif&density=2)).

But, AVIF does have a little-known progressive rendering feature! I couldn't get good results with the `--progressive` flag it offers, but I got something interesting with the lower level `--layered` flag. It's experimental, and I had to compile libavif myself to get it working. Here's the command I used:

```sh
avifenc -s 0 -y 420 --layered \
  --scaling-mode:u 1/8 -q:u 0 fox.png \
  --scaling-mode:u 1 -q:u 16 fox.png \
  fox-progressive.avif
```

This creates two layers, one at 1/8th resolution and 'minimum' quality, and one at full resolution and good quality. The layers work similar to frames of a video, where the second layer uses data from the first layer to save space.

[Here's a demo](https://random-stuff.jakearchibald.com/apps/partial-img-decode/?demo=fox-progressive.avif&density=2). It only progressively renders in Chromium browsers. You get two renders: the full image when all the data has been received, and an earlier render at ~5.8 kB (4% of the data):

<script type="component">{
  "module": "shared/ImageTabs",
  "exportName": "Styles",
  "staticOnly": true
}</script>

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/ImageTabs",
  "props": {
    "ratio": 0.91158015,
    "initial": 0,
    "images": [
      ["5.8 kB", "asset-url:./imgs/initial-pass.avif"],
      ["Full image (151 kB)", "asset-url:./imgs/fox-progressive.avif"]
    ]
  }
}</script>
</figure>

It looks… bad, but you can tell what it is, and it's pretty good for ~5.8 kB.

The downside is, something odd happens with the quality option when you use `--layered` mode. It doesn't equate to the same numbers as normal AVIF encoding.

Also, there seems to be some overhead in terms of file size, but it's hard to measure. From playing around with MS-SSIM, it seems to be in the region of 5-6 kB, so… the size of the initial pass.

The configuration of layers I used is just one example, but it seems pretty limited. Only particular scaling values are allowed, and 1/8 is the smallest. Supposedly, additional layers are possible, allowing for extra steps in the progressive render, but whenever I tried this, the encoder would error out, or explode the file size to ~400 kB, even at lowest quality. I guess that's why it's marked 'experimental'.

In terms of decoding time, here's [progressive AVIF](https://random-stuff.jakearchibald.com/apps/img-decode-bench/?demo=fox-progressive.avif) vs [regular AVIF](https://random-stuff.jakearchibald.com/apps/img-decode-bench/?demo=fox.avif). In Firefox and Safari, the decoding time for progressive is about 1-2% longer. In Chrome it takes ~40% longer, which is 3.5ms on my M4 Pro. That could get significant on slower hardware. My guess is that Chrome is missing a fast-path for cases where doesn't need to render the first layer.

Here's [the issue for tracking progressive rendering of AVIF in Firefox](https://bugzilla.mozilla.org/show_bug.cgi?id=1712813).

## JPEG XL

If you ask web developers why they want JPEG XL (as I did on [bluesky](https://bsky.app/profile/jakearchibald.com/post/3m2mcuqjekc2a) and [mastodon](https://mastodon.social/@jaffathecake/115333326583200558)), it's because of progressive rendering. Given that, I was surprised that Safari (the only browser to support JPEG XL) doesn't perform any kind of progressive rendering. [Here's a demo](https://random-stuff.jakearchibald.com/apps/partial-img-decode/?demo=fox-progressive.jxl&density=2), and [a bug report](https://bugs.webkit.org/show_bug.cgi?id=272350).

I was also surprised to see that, in Safari, [JPEG XL takes 150% longer](https://random-stuff.jakearchibald.com/apps/img-decode-bench/?demo=fox.jxl) (as in 2.5x) to decode vs [an equivalent AVIF](https://random-stuff.jakearchibald.com/apps/img-decode-bench/?demo=fox.avif). That's 17ms longer on my M4 pro. Apple hardware tends to be high-end, but this could still be significant. This isn't related to progressive rendering, the decoder is just slow.

JPEG XL support in Safari actually comes from the underlying OS rather than the browser. My guess is that Apple is considering using JPEG XL for iPhone photo storage rather than HEIC, and JPEG XL's inclusion in the browser is a bit of an afterthought. I'm just guessing though.

The implementation that was in Chromium behind a flag _did_ support progressive rendering to some degree, but it didn't render anything until ~60 kB (39% of the file). The rendering is similar to the initial JPEG rendering above, but takes much more image data to get there. This is a weakness in the decoder rather than the format itself. I'll dive into what JPEG XL is capable of shortly.

I also tested the performance of the old behind-a-flag Chromium JPEG XL decoder, and it's over 500% slower (6x) to decode than AVIF. The old behind-a-flag Firefox JPEG XL decoder is about as slow as the Safari decoder. It's not fair to judge the performance of experimental unreleased things, but I was kinda hoping one of these would suggest that the Safari implementation was an outlier.

I thought that "fast decoding" was one of the selling points of JPEG XL over AVIF, but now I'm not so sure.

[We have a Rust implementation of JPEG XL underway in Firefox](https://bugzilla.mozilla.org/show_bug.cgi?id=1986393), but performance needs to get a lot better before we can land it.

# But do we actually benefit from progressive rendering?

<figure class="full-figure max-figure">
  <img src="asset-url:./imgs/f1.avif" loading="lazy" width="1598" height="1478" alt="A old Williams F1 car speeding up a hill" style="height:auto" />
</figure>

Thanks to modern image formats (AVIF in this case), the above image is asset-pretty-size:./imgs/f1.avif. That's pretty incredible for a more-than-HD image. The fox image is much larger because of the amount of sharp details, but that isn't true of most images. This means that, for many images, there's little benefit to progressive rendering.

But even with the asset-pretty-size:./imgs/fox.avif fox image, [Kornel makes a good point](https://mastodon.social/@kornel/115339016909614657):

<blockquote class="quote"><p>Congestion and bufferbloat make data arrive in laggy bursts rather than slowly. Very bad signal strength also tends to be on/off.</p></blockquote>

Meaning, even if it takes 5 seconds to receive the image, it's unlikely that the asset-pretty-size:./imgs/fox.avif will be received gradually throughout that period. I'm currently on aeroplane WiFi, and yeah… most of the slowness is while _nothing_ is being received.

That means seeing a progressive render requires a particular mix of good and bad luck:

- Bad luck: your connection isn't great, so it's taking a while to fetch the whole image.
- Good luck: a portion of the image has been received.

Progressive rendering is a good experience when you hit this (not-)sweet spot, but you might not get to see it even on slow connections. It certainly isn't an alternative to taking care over your image sizes.

Because of this, it feels like encoding an image in a way that enables a progressive render should be minimal cost in terms of file size overhead, and minimal/zero cost in decoding overhead in cases where progressive isn't needed.

# What about progressive rendering instead of responsive images?

When I asked folks why they're interested in JPEG XL, some folks suggested it would enabled them to replace responsive images with a single maximum-resolution JPEG XL file. The idea is:

1. The browser receives some image data.
2. The browser performs a partial decode of the image data.
3. The browser realises it doesn't need any more pixel density.
4. The browser tells the server "stop sending me this resource".
5. The server dutifully stops sending the resource.

I'm sorry to be the bad news guy, but I'm pretty certain _this won't work_.

The problem is there's significant lag between each of these steps, to the point where it's very likely that you'll receive megabytes of data you don't need, per image, before the response is successfully aborted.

It might be workable along with a new browser feature, where the ranges are known up-front, so the browser can make the required partial request:

```html
<!-- Made-up example -->
<img
  srcset="
    img.jxl#range=0-10000   200w,
    img.jxl#range=0-30000   400w,
    img.jxl#range=0-70000   800w,
    img.jxl#range=0-150000 1600w
  "
  sizes="…as usual…"
/>
```

But even if we get this `#range=` feature (and there's some big questions around CORS here that could make it a no-go), the complexity is about the same as responsive images are today, and there you get more control over the available resolutions.

An advantage of the 'range' approach is the browser could 'resume' the image download if it later finds it needs a higher resolution, such as going from thumbnail to full-screen.

# Potential progressive rendering with JPEG XL

Aside from browser decoders, there's some promising work in terms of progressive rendering of JPEG XL. Although, it's unclear how much of it could make it into a browser, and the encoder settings are a little confusing.

The current version of cjxl (0.11.1) has a `--progressive` flag, but this creates a file that can't be rendered until a significant amount of the file has been received (39% of the file with the fox image).

To get an earlier render, you need to use `--progressive_dc 1`, which `cjxl --help` doesn't mention. You only get to find out about it if you use the verbose flag, twice: `cjxl --help -v -v`. It seems like this has been changed in the codebase, where [`--progressive` now implies `progressive_dc 1`](https://github.com/libjxl/libjxl/commit/62712477eec764c4e730f94476113f6e4756dfb2), but that hasn't made it into a release yet.

It doesn't seem like `progressive_dc` has an impact on file size. If it does, it's small. I haven't seen a difference in decode time either (from testing in Safari), but JPEG XL decoding is slow in general, so it isn't a huge win.

djxl doesn't support the earlier rendering that `--progressive_dc` offers, but there's also a Rust-based decoder, [jxl-oxide](https://github.com/tirr-c/jxl-oxide), which can handle earlier rendering.

jxl-oxide isn't fast enough for browser, but it's an interesting preview of what's possible. There's also a [neat wasm version, that lets you see partial renders](https://jxl-oxide.tirr.dev/demo/index.html). Here's a [progressive version of the fox image](asset-url:./imgs/fox-progressive.jxl), if you want to try it yourself. Otherwise, here's a rough guide:

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/ImageTabs",
  "props": {
    "ratio": 0.91158015,
    "initial": 0,
    "images": [
      ["2 kB", "asset-url:./imgs/2000.avif"],
      ["3 kB", "asset-url:./imgs/3000.avif"],
      ["4.25 kB", "asset-url:./imgs/4250.avif"],
      ["6 kB", "asset-url:./imgs/6000.avif"],
      ["10 kB", "asset-url:./imgs/10000.avif"],
      ["17 kB", "asset-url:./imgs/17000.avif"],
      ["27 kB", "asset-url:./imgs/27000.avif"],
      ["46 kB", "asset-url:./imgs/46000.avif"],
      ["60 kB", "asset-url:./imgs/60000.avif"],
      ["68 kB", "asset-url:./imgs/68000.avif"]
    ]
  }
}</script>
</figure>

I'd say that the 6 kB mark gives you a decent impression of the image, and things get really clear around 46 kB. It could do with some smoothing, like we saw with the JPEG progressive render in Firefox/Chrome.

After the 60 kB mark, the full detail appears in square blocks. A nice feature of JPEG XL is these can appear in any order, so you can see the in 68 kB render that sharpness around the fox's face before anywhere else. cjxl lets you specify a point to use as the "center", but a smarter encoder could detect things like faces and prioritise them.

It's subjective, but I'd say the 5.8 kB AVIF progressive render from earlier is, detail-wise, somewhere between the 17-27 kB JPEG XL renders, but make up your own mind:

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/ImageTabs",
  "props": {
    "ratio": 0.91158015,
    "initial": 3,
    "images": [
      ["JXL 6 kB", "asset-url:./imgs/6000.avif"],
      ["JXL 10 kB", "asset-url:./imgs/10000.avif"],
      ["JXL 17 kB", "asset-url:./imgs/17000.avif"],
      ["AVIF 5.8 kB", "asset-url:./imgs/initial-pass.avif"],
      ["JXL 27 kB", "asset-url:./imgs/27000.avif"],
      ["JXL 46 kB", "asset-url:./imgs/46000.avif"]
    ]
  }
}</script>
</figure>

So if the browser manages to download 6 kB then stalls, then AVIF can produce a better result. But since the AVIF rendering is only two-pass, if the browser has say 50 kB, then the JPEG XL rendering is much better.

This is all just 'in theory' until becomes fast enough to land in a browser.

There's another JPEG XL rust decoder jxl-rs, [being developed for Firefox](https://bugzilla.mozilla.org/show_bug.cgi?id=1986393). That team are also exploring how progressive rendering could work within the browser.

# A better 'progressive' feature for AVIF?

This article got longer than I expected, but one last thing… I'd like to see AVIF support an early render that allows more control over the quality and scale of the initial pass, and ideally a configurable post-process blur effect to hide compression artefacts.

Maybe the 'layers' approach can be improved. Or maybe it's an over-complication. For example:

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/ImageTabs",
  "props": {
    "ratio": 0.91158015,
    "initial": 0,
    "images": [
      ["With blur", "asset-url:./imgs/blur.avif"],
      ["Without blur", "asset-url:./imgs/fox-low.avif"],
      ["Final image", "asset-url:./imgs/fox.avif"]
    ]
  }
}</script>
</figure>

The above image is asset-pretty-size:./imgs/fox-low.avif. It's scaled down, compressed with AVIF at minimum quality, and has a post-process blur applied.

With the blur applied, I think this functions great as a preview. So could this… just go at the start of the full image file?

This means the 'preview' is 100% overhead in terms of file size, but it also means as web developers, we can freely configure the quality of this 'preview' by deciding how much overhead we find acceptable. Maybe I'm being too conservative by only spending asset-pretty-size:./imgs/fox-low.avif, rather than, say, <span style="white-space: nowrap">asset-pretty-size:./imgs/fox-lowish.avif</span>:

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/ImageTabs",
  "props": {
    "ratio": 0.91158015,
    "initial": 0,
    "images": [
      ["With blur", "asset-url:./imgs/less-blur.avif"],
      ["Without blur", "asset-url:./imgs/fox-lowish.avif"],
      ["Final image", "asset-url:./imgs/fox.avif"]
    ]
  }
}</script>
</figure>

And because it's an entirely separate image, the decoding overhead is zero if the browser doesn't need to show it. For example, in cases where the browser has the whole file, it can just skip the preview.

The post-process blur would need to be part of the format, rather than left to something like CSS. This would allow the format to use a 'cheap' blur filter, to avoid an expensive rendering cost.

[I originally pitched this idea back in 2020](https://github.com/AOMediaCodec/av1-avif/issues/102) before the 'layers' idea was explored. But maybe it's time to consider it again. Here's hoping!
