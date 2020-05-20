---
title: Lazy async SVG rasterisation
date: 2017-09-08 09:57:21
summary: Using `createImageBitmap` to make SVG render off the main thread.
mindframe: ''
image: ''
meta: Using createImageBitmap for threaded SVG rendering.
---

Phwoar I love a good sciency-sounding title.

# SVG can be slow

When transforming an SVG image, browsers try to render on every frame to keep the image as sharp as possible. Unfortunately SVG rendering can be slow, especially for non-trivial images.

[**Here's a demo**](https://svg-zoom-demo.glitch.me/), press "Scale SVG".

<figure class="full-figure">
<img src="asset-url:./bad.png" alt="">
<figcaption>Devtools timeline for SVG animation</figcaption>
</figure>

Sure, this is a pretty complex SVG, but we're 10x over our frame budget on some frames, and as a result the animation looks awful. And this is on a powerful MacBook.

Things are less bad with a simpler SVG. [Here's an example with the Firefox logo](https://svg-zoom-demo.glitch.me/?firefox-logo), but it's still pretty janky.

However, a new API gives us more control:

# Rasterising SVG lazily

```js
createImageBitmap(imgElement).then((imageBitmap) => {
  // …
});
```

[`createImageBitmap`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/createImageBitmap) can rasterise many different image into bitmap data, which can be drawn onto a canvas element. However, in Chrome 61+, with `chrome://flags/#enable-experimental-canvas-features` enabled, it can take an HTML image element for an SVG image, and rasterise it asynchronously, off the main thread, so it doesn't disrupt animations.

You can also render part of the SVG, and output it at a particular size:

```js
createImageBitmap(
  imgElement,
  sourceCropX, sourceCropY,
  sourceCropWidth, sourceCropHeight,
  {resizeWidth, resizeHeight}
).then(imageBitmap => …);
```

The allows me to perform a really cheap bitmap zoom of the SVG using a canvas, while rendering a cropped-but-sharp version in parallel. Once the sharp version is ready, I can include it in the animation.

[**Here's a demo**](https://svg-zoom-demo.glitch.me/), press "Scale canvas". Requires Chrome 61+ with `chrome://flags/#enable-experimental-canvas-features` enabled.

<figure class="full-figure">
<img src="asset-url:./better.png" alt="">
<figcaption>Devtools timeline for canvas animation</figcaption>
</figure>

This method is much friendlier to the CPU, and the animation is fluid:

<figure class="full-figure">
<div class="video"><iframe src="https://www.youtube.com/embed/-yQBbWlXuqg?rel=0&amp;showinfo=0" frameborder="0" allowfullscreen></iframe></div>
<figcaption>SVG animation vs SVG-in-canvas</figcaption>
</figure>

For the complex car SVG, the sharp image appears towards the end of the image. With the [Firefox logo](https://svg-zoom-demo.glitch.me/?firefox-logo), the sharp version appears much earlier because it take less time to render.

[Here's the code for the demo](https://glitch.com/edit/#!/svg-zoom-demo?path=script.js:1:0).

# Chunking up rasterisation

As you can see from the timeline above, Chrome still skips a frame as it uploads the sharper texture to the GPU. This could be solved by chunking the work into smaller tiles, so the GPU-upload doesn't blow the frame budget.

[OpenSeadragon](http://openseadragon.github.io/) is designed to dynamically load image tiles to create a zoomable image. It's very much geared towards getting bitmap data from the network, but with a bit of hacking…

[**Zoomable lazy-rendered tiled SVG**](https://lazy-svg.glitch.me/). Requires Chrome 61+ with `chrome://flags/#enable-experimental-canvas-features` enabled.

Yeah, it's a little rough around the edges. Like I said, it's a hack. But I'm really excited that this level of control over SVG painting is coming to the web.
