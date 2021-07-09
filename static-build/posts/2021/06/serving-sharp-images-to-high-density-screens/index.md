---
title: Half the size of images by optimising for high density displays
date: 2021-06-11 01:00:00
summary: Why compressing images for dense screens is different, and how to serve them
meta: Why compressing images for dense screens is different, and how to serve them
image: 'asset-url:./img.jpg'
---

A long time ago we had monitors of varying resolutions, but once we started to go beyond 1024x768, screens started to get bigger as resolution got bigger.

Then full-colour web-capable mobile phones arrived, but the story was the same. They had small screens, but also small resolutions.

Then in 2010 the iPhone 4 came out (holy shit that's 11 years ago), and the screen was 640×960, whereas the similar-sized iPhone 3 was 320×480. The resolution doubled, while the screen size was roughly the same, so in effect the screen density doubled.

Apple couldn't just run the same apps but at a higher resolution, because things like text and buttons would be tiny, so they doubled the size of everything. 1 pixel became 2 'device pixels'.

On the web we call this the 'device pixel ratio', or DPR. The iPhone 4 had a DPR of 2. This is sometimes referred to as having a 2x screen, or 2dppx.

Ok, history lesson over…

# How popular are high density screens?

Matt Hobbs from [gov.uk](https://www.gov.uk/) was kind enough to [share April 2021 stats on users' device pixel ratio](https://twitter.com/TheRealNooshu/status/1397862141894529027). I ran a few queries on it, and it turns out **80% of their users are on a screen with a DPR of 1.5 or above**. That's:

- …over 99.9% of their mobile users.
- …32% of their desktop users.
- …78% of their tablet users.

Of course, [gov.uk](https://www.gov.uk/) is UK-centric, but it covers a broad section of the UK population. Not just tech users, not just rich users. I think we can safely draw the following conclusions:

- Users at smaller viewports will likely be using high density screens, unless the site expects a large amount of feature phone traffic.
- Users at larger viewports are less likely to be using high density screens, but it's a growing number, unless the site expects traffic from mostly low-end devices.

In many cases, users with high-density screens could be the majority of your traffic.

# Why cater for high density screens?

The rest of the display will be rendered at full density, including things like text, SVG, browser UI… so if an image is rendered at lower density, it can look blurry or low quality:

<script type="component">{
  "module": "shared/ImageTabs",
  "exportName": "Styles",
  "staticOnly": true
}</script>

<script type="component">{
  "module": "shared/demos/2021/serving-sharp-images/DensityDemo",
  "exportName": "Styles",
  "staticOnly": true
}</script>

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/demos/2021/serving-sharp-images/DensityDemo",
  "props": {
    "src": "asset-url:./full.avif",
    "width": 1598,
    "height": 1026
  }
}</script>
</figure>

<script>
  if (devicePixelRatio === 1) {
    const p = document.createElement('p');
    p.textContent = `You're on a 1x screen, so you're not getting the full effect of this demo. 0.5x vs 1x gives a rough feel of the result though.`;
    document.currentScript.before(p);
  }
</script>

The effect can be subtle depending on the density of your screen, but you should see a sharpening, particularly around the red panda's whiskers and ear fur.

So, if you want your images to be as sharp as possible, you need to target images at the user's device pixels, rather than their CSS pixels.

# Compressing images for high density screens

Here's a 1x version of the red panda image, 400px wide:

<script type="component">{
  "module": "shared/ImgLoader",
  "exportName": "Styles",
  "staticOnly": true
}</script>

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/ImgLoader",
  "props": {
    "width": 400,
    "height": 257,
    "src": "asset-url:./1x-high.webp"
  }
}</script>
</figure>

I encoded this using WebP at quality 80. Any lower than that and significant details were lost. It comes in at asset-pretty-size:./1x-high.webp. Not bad!

If I encode the 2x version at the same settings, it's asset-pretty-size:./2x-high.webp, which roughly makes sense as it's 4 times the number of pixels. But does it need to use the same settings?

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/ImageTabs",
  "props": {
    "ratio": 1.557504873,
    "maxWidth": 400,
    "initial": 1,
    "images": [
      ["1x, quality 80 (asset-pretty-size:./1x-high.webp)", "asset-url:./1x-high.webp"],
      ["2x, quality 80 (asset-pretty-size:./2x-high.webp)", "asset-url:./2x-high.webp"],
      ["2x, quality 44 (asset-pretty-size:./2x-low.webp)", "asset-url:./2x-low.webp"]
    ]
  }
}</script>
</figure>

To my eyes the 2x version at asset-pretty-size:./2x-low.webp is good enough. It's not exactly the same, but it doesn't look ugly. Here it is doubled in size, so it's 1x with CSS pixels:

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/ImageTabs",
  "props": {
    "ratio": 1.557504873,
    "maxWidth": 400,
    "initial": 1,
    "transform": "scale(2) translate(10.4%, 5.9%)",
    "backgroundStyle": {"background": "black"},
    "images": [
      ["2x, quality 80 (asset-pretty-size:./2x-high.webp)", "asset-url:./2x-high.webp"],
      ["2x, quality 44 (asset-pretty-size:./2x-low.webp)", "asset-url:./2x-low.webp"]
    ]
  }
}</script>
</figure>

_Now_ it looks ugly. You can easily see the compression artefacts compared to the higher quality version. But when it's zoomed out, it's fine.

Human eyes are weird. They're good enough to benefit from a high density image, but not good enough to see compression artefacts as clearly at that density, particularly in 'high frequency' areas of an image, where the brightness changes a lot from pixel to pixel.

To encode a 2x image, I throw it into [Squoosh.app](https://squoosh.app), and zoom it out until it's the size it'll be _displayed_ on a page. Then I just drag the quality slider as low as it'll go before it starts looking bad.

So, we can go from a 1x image at asset-pretty-size:./1x-high.webp to a 2x image at asset-pretty-size:./2x-low.webp, gaining loads of sharpness without massively increasing the file size.

For even higher density screens you can drop the quality further, but the drop isn't as big as 1x to 2x, so it isn't always worth catering for.

Ok, that's the theory, but how do you actually make this work on a page?

# Catering for 1x and 2x qualities isn't straight forward

Here's a basic responsive image:

```html
<img
  srcset="
    image-700.jpg   700w,
    image-1000.jpg 1000w,
    image-1300.jpg 1300w,
    image-1600.jpg 1600w
  "
  sizes="…"
  alt="…"
/>
```

I've got a [more detailed post on how responsive images work](/2015/anatomy-of-responsive-images/), but the short story is the `srcset` tells the browser all the versions of the images that are available, indexed by their pixel width, and `sizes` tells the browser how big the `<img>` will appear in CSS pixels.

This means the browser can make choices like "oh, this image is going to display 500 CSS pixels wide, but it's a 2x screen, so I'll download `image-1000.jpg`". Great!

Except, not so great. Let's say we encode `image-1000.jpg` as if it were being displayed on a high density mobile device, so we use a lower quality. That'll work great on high density mobile devices, as they'll get a sharp image at a low file size. Unfortunately, the browser may choose the same image for a 1x desktop device, and it'll look bad, like the zoomed-in red panda image above.

This means **most sites serve images that are 100% heavier than they need to be** in terms of file size, and it's mostly mobile users that take the hit, and they're likely to be on the slowest connection.

So, what's the answer?

# The lazy way

Here's the technique I use for most images on this blog: I take the maximum size the image can be displayed in CSS pixels, and I multiply that by two, and I encode it at a lower quality, as it'll always be displayed at a 2x density or greater. Yep. That's it.

For 'large' images in blog posts like this, they're at their biggest when the viewport is 799px wide, where they take up the full viewport width. So I encode the image 1,598 pixels wide.

Because this is so quick and easy, I have time to throw in a few extra formats:

```html
<picture>
  <source type="image/avif" srcset="red-panda.avif" />
  <source type="image/webp" srcset="red-panda.webp" />
  <img src="red-panda.jpg" width="1598" height="1026" alt="A red panda" />
</picture>
```

Here's a live example:

<figure class="full-figure max-figure">
  <picture>
    <source type="image/avif" srcset="asset-url:./full.avif" />
    <source type="image/webp" srcset="asset-url:./full.webp" />
    <img src="asset-url:./full.jpg" width="1598" height="1026" alt="A red panda" style="height:auto" />
  </picture>
</figure>

And here are the formats separately:

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/ImageTabs",
  "props": {
    "ratio": 1.557504873,
    "maxWidth": 799,
    "images": [
      ["JPEG (asset-pretty-size:./full.jpg)", "asset-url:./full.jpg"],
      ["WebP (asset-pretty-size:./full.webp)", "asset-url:./full.webp"],
      ["AVIF (asset-pretty-size:./full.avif)", "asset-url:./full.avif"]
    ]
  }
}</script>
</figure>

This method is far from perfect. The WebP is asset-pretty-size:./full.webp, but we've already seen that a carefully mobile-optimised WebP is asset-pretty-size:./2x-low.webp. That's a significant jump in size. _But_, a lot of users will get the AVIF, which is asset-pretty-size:./full.avif. Although, there's also the decoding cost of handling bigger images, but… but…

Ok, I'm just making excuses for being lazy. But like I said, these are _carefully optimised_, and most images on the web are not carefully optimised. If you do something like above, you're handling images way better than the majority of sites on the web. If you've been following my series looking at [the performance of F1 websites](/2021/f1-perf-part-1/), a lot of images of these dimensions end up at 300kB+.

But let's do it properly…

# The 'full' way

We want to serve a different set of images for high-density screens than 1x screens. Thankfully the `<picture>` and `<source>` tags let us do this.

```html
<picture>
  <source media="(-webkit-min-device-pixel-ratio: 1.5)" srcset="…" sizes="…" />
  <img srcset="…" sizes="…" width="1598" height="1026" alt="A red panda" />
</picture>
```

Sources can take a media query, and we use `(-webkit-min-device-pixel-ratio: 1.5)` to target screens that are at least 1.5x. The 'proper' web standards way to do this is `(min-resolution: 1.5x)`, but Safari doesn't support it. But, it's ok to just use `-webkit-min-device-pixel-ratio`; it was added to the [compatibility standard](https://compat.spec.whatwg.org/#css-media-queries-webkit-device-pixel-ratio) due to the number of sites using it, and now all browsers support it.

Now I just need to figure out the `sizes` and `srcset`. Right now, `sizes` needs to be repeated for the `<img>` and every `<source>`, although I'm working on a [spec change so it'll only be needed on `<img>`](https://github.com/whatwg/html/issues/6633).

Here are the sizes for 'large' images on this blog:

```html
<picture>
  <source
    media="(-webkit-min-device-pixel-ratio: 1.5)"
    srcset="…"
    sizes="
      (min-width: 1066px) 743px,
      (min-width: 800px) calc(75vw - 57px),
      100vw
    "
  />
  <img
    srcset="…"
    sizes="
      (min-width: 1066px) 743px,
      (min-width: 800px) calc(75vw - 57px),
      100vw
    "
    width="1598"
    height="1026"
    alt="A red panda"
  />
</picture>
```

This means, at viewport widths 1066px or greater, the image is fixed at 743px wide. Otherwise, at viewport widths 800px or greater, the image is 75% of the viewport width minus 57px. Otherwise, the image is full viewport width. `sizes` don't need to be 100% accurate like they are here, but the more accurate they are, the better choice the browser will make.

So, what about the `srcset`? I can cut some corners here for 1x. The stats suggest that 1x screens are predominantly desktop, which skews towards wider viewports. In this case, I think it's fine to assume the viewport is _probably_ 1066px wide or greater, so I'm going to be a bit lazy again and create one image for 1x users, at 743w:

```html
<picture>
  <source
    media="(-webkit-min-device-pixel-ratio: 1.5)"
    srcset="…"
    sizes="
      (min-width: 1066px) 743px,
      (min-width: 800px) calc(75vw - 57px),
      100vw
    "
  />
  <img src="1x-743.jpg" width="743" height="477" alt="A red panda" />
</picture>
```

Since there's only one `src` on the `<img>`, I can remove the `sizes` there too.

When I compressed the 1x image, I had it zoomed to 100% in [Squoosh](https://squoosh.app). As such as I had to drag the quality slider much higher than I would with the 2x images I was compressing earlier.

Ok, what about the 2x images? Mobiles tend to have a viewport width around 320-420px, so I'm going to go with 800w for the lower end. I already decided on the higher end in the previous section: 1598w. I'm never quite sure how many steps in between to do, so I'm going to go with one, 1200w.

```html
<picture>
  <source
    media="(-webkit-min-device-pixel-ratio: 1.5)"
    srcset="2x-800.jpg 800w, 2x-1200.jpg 1200w, 2x-1598.jpg 1598w"
    sizes="
      (min-width: 1066px) 743px,
      (min-width: 800px) calc(75vw - 57px),
      100vw
    "
  />
  <img src="1x-743.jpg" width="743" height="477" alt="A red panda" />
</picture>
```

I compressed these after zooming them out to the sizes they were likely to be displayed, so I was able to go much lower with the quality slider.

But that's just JPEG! Let's add some more image formats:

```html
<picture>
  <source
    type="image/avif"
    media="(-webkit-min-device-pixel-ratio: 1.5)"
    srcset="2x-800.avif 800w, 2x-1200.avif 1200w, 2x-1598.avif 1598w"
    sizes="
      (min-width: 1066px) 743px,
      (min-width: 800px) calc(75vw - 57px),
      100vw
    "
  />
  <source
    type="image/webp"
    media="(-webkit-min-device-pixel-ratio: 1.5)"
    srcset="2x-800.webp 800w, 2x-1200.webp 1200w, 2x-1598.webp 1598w"
    sizes="
      (min-width: 1066px) 743px,
      (min-width: 800px) calc(75vw - 57px),
      100vw
    "
  />
  <source
    media="(-webkit-min-device-pixel-ratio: 1.5)"
    srcset="2x-800.jpg 800w, 2x-1200.jpg 1200w, 2x-1598.jpg 1598w"
    sizes="
      (min-width: 1066px) 743px,
      (min-width: 800px) calc(75vw - 57px),
      100vw
    "
  />
  <source type="image/avif" srcset="1x-743.avif" />
  <source type="image/webp" srcset="1x-743.webp" />
  <img src="1x-743.jpg" width="743" height="477" alt="A red panda" />
</picture>
```

Phew! And here's a live example:

<figure class="full-figure max-figure">
  <picture>
    <source
      type="image/avif"
      media="(-webkit-min-device-pixel-ratio: 1.5)"
      srcset="
        asset-url:./2x-800.avif   800w,
        asset-url:./2x-1200.avif 1200w,
        asset-url:./full.avif    1598w
      "
      sizes="
        (min-width: 1066px) 743px,
        (min-width: 800px) calc(75vw - 57px),
        100vw
      "
    />
    <source
      type="image/webp"
      media="(-webkit-min-device-pixel-ratio: 1.5)"
      srcset="
        asset-url:./2x-low.webp   800w,
        asset-url:./2x-1200.webp 1200w,
        asset-url:./full.webp    1598w
      "
      sizes="
        (min-width: 1066px) 743px,
        (min-width: 800px) calc(75vw - 57px),
        100vw
      "
    />
    <source
      media="(-webkit-min-device-pixel-ratio: 1.5)"
      srcset="
        asset-url:./2x-800.jpg   800w,
        asset-url:./2x-1200.jpg 1200w,
        asset-url:./full.jpg    1598w
      "
      sizes="
        (min-width: 1066px) 743px,
        (min-width: 800px) calc(75vw - 57px),
        100vw
      "
    />
    <source type="image/avif" srcset="asset-url:./1x.avif" />
    <source type="image/webp" srcset="asset-url:./1x.webp" />
    <img
      src="asset-url:./1x.jpg"
      width="1598"
      height="1026"
      alt="A red panda"
      style="height:auto"
    />
  </picture>
</figure>

This technique gets a lot easier if you use an image service of sorts. In fact, [The Guardian](https://www.theguardian.com/uk) use a very similar technique, although the 'type' decision is made server side using the browser's `Accept` header.

# And that's it!

Will I switch from the 'lazy' way to the 'proper' way? Probably not for this blog. Part of me really enjoys manually compressing images to newer formats, but I don't think I'm ready to do it 12 times per image. 3 is enough.

However, if I wanted to switch to automated compression, which may not be as good as doing it manually for each image, I think I'd do it the 'proper' way to keep images small, particularly for mobile users.
