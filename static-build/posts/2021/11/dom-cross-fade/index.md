---
title: 'Cross fading any two DOM elements is currently impossible'
date: 2021-11-12 01:00:00
summary: TODO
meta: TODO
#image: 'asset-url:./img.png'
---

Ok, it isn't _always_ impossible. Be _amazed_ as I cross-fade the word "good" with the word "goat":

<style>
  .checkd {
    background: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2 2"><path d="M1 2V0h1v1H0v1z" fill-opacity=".05"/></svg>');
    background-size: 20px 20px;
  }
  .example-stage {
    position: relative;
    overflow: hidden;
    height: 223px;
  }
  @media (min-width: 500px) {
    .example-stage {
      height: 300px;
    }
  }
  .mix-input {
    background: #ffe453;
    display: grid;
    padding: 10px;
  }
  .fade-item {
    position: absolute;
    width: 100%;
    height: 100%;
  }
</style>

<figure class="full-figure max-figure checkd">
  <div class="example-stage">
    <svg class="fade-item" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 10"><text textLength="20" text-anchor="middle" dominant-baseline="middle" font-family="Courier New" x="50%" y="5" font-size="8.9" font-weight="bold" fill="#009D81">good</text></svg>
    <svg id="source-1" class="fade-item" viewBox="0 0 21 10" style="background: #cdcdcd;"><text textLength="20" text-anchor="middle" dominant-baseline="middle" font-family="Courier New" x="50%" y="5" font-size="8.9" font-weight="bold" fill="#009D81">goat</text></svg>
  </div>
  <div class="mix-input"><input id="mix-input-1" type="range" min="0" max="1" step="any" value="0"></div>
</figure>

<script type="module">
  self.$ = (...args) => document.querySelector(...args);

  const range = $('#mix-input-1');
  const source = $('#source-1');

  function update(mix) {
    source.style.opacity = mix;
  }

  range.oninput = () => update(range.valueAsNumber);
  update(range.valueAsNumber);
</script>

Cross-fading is easy when one of the elements is opaque and covers the other element. As you adjust the slider, the element displaying "goat" moves from `opacity: 0` to `opacity: 1`. Job done!

But, what if neither element is fully opaque? The same technique doesn't work:

<figure class="full-figure max-figure checkd">
  <div class="example-stage">
    <svg class="fade-item" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 10"><text textLength="20" text-anchor="middle" dominant-baseline="middle" font-family="Courier New" x="50%" y="5" font-size="8.9" font-weight="bold" fill="#009D81">good</text></svg>
    <svg id="source-2" class="fade-item" viewBox="0 0 21 10"><text textLength="20" text-anchor="middle" dominant-baseline="middle" font-family="Courier New" x="50%" y="5" font-size="8.9" font-weight="bold" fill="#009D81">goat</text></svg>
  </div>
  <div class="mix-input"><input id="mix-input-2" type="range" min="0" max="1" step="any" value="0"></div>
</figure>

<script type="module">
  const range = $('#mix-input-2');
  const source = $('#source-2');

  function update(mix) {
    source.style.opacity = mix;
  }

  range.oninput = () => update(range.valueAsNumber);
  update(range.valueAsNumber);
</script>

You can't just fade the second item on top, as you can still see the first item underneath. In this situation, you've probably done the same as me, and also faded the other item out:

<figure class="full-figure max-figure checkd">
  <div class="example-stage">
    <svg id="destination-3" class="fade-item" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 10"><text textLength="20" text-anchor="middle" dominant-baseline="middle" font-family="Courier New" x="50%" y="5" font-size="8.9" font-weight="bold" fill="#009D81">good</text></svg>
    <svg id="source-3" class="fade-item" viewBox="0 0 21 10"><text textLength="20" text-anchor="middle" dominant-baseline="middle" font-family="Courier New" x="50%" y="5" font-size="8.9" font-weight="bold" fill="#009D81">goat</text></svg>
  </div>
  <div class="mix-input"><input id="mix-input-3" type="range" min="0" max="1" step="any" value="0"></div>
</figure>
<script type="module">
  const range = $('#mix-input-3');
  const destination = $('#destination-3');
  const source = $('#source-3');
  function update(mix) {
    destination.style.opacity = 1 - mix;
    source.style.opacity = mix;
  }
  range.oninput = () => update(range.valueAsNumber);
  update(range.valueAsNumber);
</script>

And there's the problem. The "go" part of the element fades out a bit, then fades back in. If this was a proper cross-fade, the "go" part wouldn't change, since those pixels are the same in each element. Even with the letters that change, the cross-fade doesn't look right on the parts that intersect.

# Why doesn't it work?

If you have a material that blocks out half the light behind it, you're left with 0.5 of that light. If you have two sheets of that material, you're blocking out half, then half again, and you're left with 0.25 light.

`opacity: 0.5` works in the same way. If you put `opacity: 0.5` on top of `opacity: 0.5` you get the equivalent of `opacity: 0.75`, and that's why the "go" appears to fade out a bit during the cross-fade.

A true cross-fade should be a weighted average of each pixel, meaning there's no change if the before and after pixels are the same.

The process of layering one thing over another is called _compositing_, which takes each pixel of the _source_ ('goat' in this case) and _destination_ ('good' in this case) and combines them in some way.

For these operations, pixels have four values called _channels_. They are red, green, blue, and alpha (transparency). Channel values are generally in the range 0-1, where 0 means 'none' and 1 means 'full'.

The default compositing method on the web is [source-over](https://drafts.fxtf.org/compositing/#porterduffcompositingoperators_srcover), which combines pixels like this:

```js
// Both pixels are black at 50% opacity
const sourcePixel = [0, 0, 0, 0.5];
const destinationPixel = [0, 0, 0, 0.5];

const resultPixel = destinationPixel
  // Source-over transforms the destination pixel
  // using the alpha of the source pixel
  .map((channel) => channel * (1 - sourcePixel[3]))
  // Then adds the result to the source pixel
  .map((channel, i) => channel + sourcePixel[i]);
```

The result is `[0, 0, 0, 0.75]`, which is what we see in the demo.

Compositing colour is a little more complicated, as compositing operations assume the colours are _premultiplied_, meaning they've been multiplied with the alpha channel. This is pretty common in image processing, but not something you'll encounter in web APIs unless you work with WebGL.

To convert to and from those formats:

```js
function multiplyAlpha(pixel) {
  return pixel.map((channel, i) => {
    // Pass the alpha channel through unchanged
    if (i === 3) return channel;
    // Otherwise, multiply by alpha
    return channel * pixel[3];
  });
}

function unmultiplyAlpha(pixel) {
  return pixel.map((channel, i) => {
    // Pass the alpha channel through unchanged
    if (i === 3) return channel;
    // Avoid divide-by-zero
    if (pixel[3] === 0) return channel;
    // Divide by alpha
    return channel / pixel[3];
  });
}
```

Note: The code above is for educational purposes 🤪, it doesn't have the optimisations you'd need for production. There are [libraries for that](https://github.com/thi-ng/umbrella/tree/develop/packages/porter-duff) if you need them.

And here's the implementation of source-over running in a form:

<script type="component">{
  "module": "shared/demos/2021/compositing/PixelCalculator",
  "exportName": "Styles",
  "staticOnly": true
}</script>

<script type="component">{
  "module": "shared/demos/2021/compositing/PixelCalculator",
  "props": {
    "initialMethod": "source-over",
    "initialPixel": [0, 0.62, 0.51, 0.5]
  }
}</script>

So what's the solution? Well…

# CSS has a function for this!

It's called [`cross-fade()`](<https://developer.mozilla.org/en-US/docs/Web/CSS/cross-fade()>), and here it is in action:

<style>
  .css-cross-fade {
    --destination: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 21 10'%3e%3ctext textLength='20' text-anchor='middle' dominant-baseline='middle' font-family='Courier New' x='50%25' y='5' font-size='8.9' font-weight='bold' fill='%23009D81'%3egood%3c/text%3e%3c/svg%3e");
    --source: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 21 10'%3e%3ctext textLength='20' text-anchor='middle' dominant-baseline='middle' font-family='Courier New' x='50%25' y='5' font-size='8.9' font-weight='bold' fill='%23009D81'%3egoat%3c/text%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center;
  }
</style>

<figure class="full-figure max-figure checkd">
  <div class="example-stage">
    <div id="source-4" class="fade-item css-cross-fade"></div>
  </div>
  <div class="mix-input"><input id="mix-input-4" type="range" min="0" max="1" step="any" value="0"></div>
</figure>

<script type="module">
  const range = $('#mix-input-4');
  const source = $('#source-4');

  function update(mix) {
    source.style.backgroundImage = `-webkit-cross-fade(var(--destination), var(--source), ${mix * 100}%)`;
  }

  range.oninput = () => update(range.valueAsNumber);
  update(range.valueAsNumber);
</script>

Perfect! Except it only works in Chromium and WebKit browsers, with a `-webkit-` prefix, and only works with images, so it can't be used to cross-fade DOM elements.

```css
.whatever {
  background: -webkit-cross-fade(url(img1.svg), url(img2.svg), 50%);
}
```

It isn't really what we're looking for, but…

# Lighter

Chromium engineer [Khushal Sagar](https://github.com/khushalsagar) went digging into the implementation of `-webkit-cross-fade()`, and it turns out it's implemented using a different compositing function, [plus-lighter](https://drafts.fxtf.org/compositing/#porterduffcompositingoperators_plus_lighter).

Plus-lighter just adds the pixels together and clamps them to 0-1:

```js
// Both pixels are black at 50% opacity
const sourcePixel = [0, 0, 0, 0.5];
const destinationPixel = [0, 0, 0, 0.5];

function clamp01(value) {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

const resultPixel = destinationPixel
  // Plus-lighter adds the pixels together
  // And clamps the result to 0-1
  .map((channel, i) => clamp01(channel + sourcePixel[i]));
```

And the result is `[0, 0, 0, 1]`. TODO: just log the alpha in these examples.

<script type="component">{
  "module": "shared/demos/2021/compositing/PixelCalculator",
  "props": {
    "initialMethod": "lighter",
    "initialPixel": [0, 0.62, 0.51, 0.5]
  }
}</script>

It might not seem like the colours are being added together, but remember that the colours are premultiplied by the alpha channel before they're added together.

So, how can we use `plus-lighter`?

- Here's it running if you want to throw some numbers at it:
- (Demo form)
- CSS has a cross-fade() function!
- But it only works with images
- (code example)
- Here it is in action
- (demo)
- To make this work, I've had to make "foo" and "fop" images
- Not only that, I've had to make them images of the same size, as `cross-fade` also interpolates the sizes
- So it works, but not for general DOM.
- But how does it work?
- Kushal went digging in the implementation and it turns out it uses a different compositing mode, 'lighter'.
- Lighter is:
  - Source: 100% of it
  - Destination: 100% of it
- So it's adding the two pixels together, which would easily end up with everything looking lighter, hence the name, but since we're fading the opacity of each, the colours add together fine.
- So 50% opacity + 50% opacity is 100% opacity. Exactly what we want.
- Unfortunately 'lighter' isn't available in CSS, but it is available in canvas:

```js
const mainCanvas = document.createElement('canvas');
const mainCtx = backgroundCanvas.getContext('2d');
// …draw background stuff…

const fadeFromCanvas = document.createElement('canvas');
// …draw the thing we're fading from…

const fadeToCanvas = document.createElement('canvas');
// …draw the thing we're fading to…

// Now cross-fade them!
const mixCanvas = document.createElement('canvas');
const mixCtx = mixCanvas.getContext('2d');
// The amount of cross-fade
const mix = 0.5;

mixCtx.globalAlpha = 1 - mix;
mixCtx.drawImage(fadeFromCanvas, 0, 0);

// The secret sauce:
mixCtx.globalCompositeOperation = 'lighter';
mixCtx.globalAlpha = mix;
mixCtx.drawImage(fadeToCanvas, 0, 0);

// Draw the cross-faded result onto the background
mainCtx.drawImage(mixCanvas, 0, 0);
```

- (demo)
- It's important to mix the two items together in their own canvas, because you don't want the 'lighter' operation to mess with the background. The composition with the background needs to be regular ol' 'source-over'. This is what `cross-fade` does under the hood.
- We can add this to our JS implementation:

```js
const lighter = {
  source: () => 1,
  destination: () => 1,
};

const sourcePixel = [0, 200, 200, 127];
const destinationPixel = [0, 200, 200, 127];

const resultPixel = composite(
  lighter,
  multiplyAlpha(sourcePixel),
  multiplyAlpha(destinationPixel),
);

console.log(unmultiplyAlpha(resultPixel));
```

- (demo)
- We need this in CSS!
- Currently working on SET
- We need cross-fading
- Hopefully we can just do this
- (code - hover example)
- Talk about isolation
- Bonus round: SVG
- Thought I was going to be able to do this with SVG, but no. Maybe in old Edge?
