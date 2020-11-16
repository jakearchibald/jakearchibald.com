---
title: 'CSS paint API: Being predictably random'
date: 2020-11-13 01:00:00
summary: TODO
meta: TODO
image: 'asset-url:./post.jpg'
---

Take a look at this:

<script>
  if (CSS.registerProperty && CSS.paintWorklet) {
    CSS.registerProperty({
      name: '--pixel-gradient-color',
      syntax: '<color>',
      initialValue: 'black',
      inherits: true,
    });

    CSS.registerProperty({
      name: '--pixel-gradient-seed',
      syntax: '<number>',
      initialValue: '1',
      inherits: true,
    });

    CSS.registerProperty({
      name: '--pixel-gradient-size',
      syntax: '<length>',
      initialValue: '8px',
      inherits: true,
    });

    CSS.paintWorklet.addModule(`client-bundle:client/demos/2020/css-paint-predictably-random/worklet.js`);
  }
</script>
<style>
  @font-face {
    font-family: 'VT323';
    font-style: normal;
    font-weight: 400;
    src: local('VT323 Regular'), local('VT323-Regular'), url(https://fonts.gstatic.com/s/vt323/v12/pxiKyp0ihIEF2isfFJXUdVNF.woff2) format('woff2');
    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
  }
  .pixel-gradient {
    --pixel-gradient-color: #9a9a9a;
    background-color: #8a8a8a;
    color: #000;
  }
  .pixel-gradient-final {
    background-image: paint(pixel-gradient-final);
  }
  .invaders-demo {
    padding: 20px;
  }
  .invader-img {
    display: block;
    margin: 0 auto;
    height: auto;
    width: 85%;
  }
  .invaders-title {
    font-family: 'VT323', monospace;
    line-height: 0.6;
    text-align: center;
    font-size: 6rem;
    margin-top: 20px;
  }
  @media (min-width: 380px) {
    .invader-img {
      width: 70%;
    }
  }
  @media (min-width: 450px) {
    .invaders-demo {
      padding: 50px;
    }
    .invader-img {
      width: 50%;
    }
    .invaders-title {
      font-size: 7rem;
      margin-top: 2rem;
    }
  }
</style>

<figure class="full-figure max-figure">
  <div class="pixel-gradient pixel-gradient-final invaders-demo">
    <svg class="invader-img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 737 536"><path d="M670 335V201h-67v-67h-67V67h67V0H469v134H268V0H134v67h67v67h-67v67H67v134H0v134h67v-67h67v134h134v-67h-67v-67h335v67h-67v67h134V402h67v67h67V335h-67zm-402-67h-67v-67h67v67zm268 0h-67v-67h67v67z"/></svg>
    <div class="invaders-title">Space invaders</div>
  </div>
</figure>

If you're using [a browser that supports the CSS paint API](https://caniuse.com/css-paint-api)<span class="no-support-msg"></span>, the element will have a random pixel-art gradient in the background. But it turns out, doing 'random' in CSS isn't as easy as it seems…

<script>
  const demosSupported = CSS.registerProperty && CSS.paintWorklet;
  if (!demosSupported) {
    document.querySelector('.no-support-msg').textContent = ` (which unfortunately you aren't)`;
  }
</script>

# Initial implementation

This isn't a full tutorial on the CSS paint API, so if the below isn't clear or you want to know more, check out [this article on the CSS paint API](https://developers.google.com/web/updates/2018/01/paintapi), and [this article on `registerProperty`](https://web.dev/css-props-and-vals/).

First up, the client-side JavaScript:

```js
// Provide defaults and types for custom properties, so the
// browser knows how to animate them.
// The colour of the blocks:
CSS.registerProperty({
  name: '--pixel-gradient-color',
  syntax: '<color>',
  initialValue: 'black',
  inherits: true,
});

// The size of the blocks:
CSS.registerProperty({
  name: '--pixel-gradient-size',
  syntax: '<length>',
  initialValue: '8px',
  inherits: true,
});

// Then register a worklet to do the painting:
CSS.paintWorklet.addModule(`worklet.js`);
```

Painting happens in a worklet so it doesn't block the main thread. Here's the worklet:

```js
class PixelGradient {
  static get inputProperties() {
    // The CSS values we're interested in:
    return ['--pixel-gradient-color', '--pixel-gradient-size'];
  }
  paint(ctx, bounds, props) {
    // TODO - we'll get to this later
  }
}

// Give our custom painting a name (this is how CSS will reference it):
registerPaint('pixel-gradient', PixelGradient);
```

And some CSS:

```css
.pixel-gradient {
  --pixel-gradient-color: #9a9a9a;
  background-color: #8a8a8a;
  background-image: paint(pixel-gradient);
}
```

Right ok, now let's get to the main bit, the painting of the element. Our input is:

- `ctx`: A subset of the 2d canvas API.
- `bounds`: The width & height of the area to paint.
- `props`: The computed values for our `inputProperties`.

Here's the body of the `paint` method, to create our random gradient:

```js
const size = props.get('--pixel-gradient-size').value;
ctx.fillStyle = props.get('--pixel-gradient-color');

// Loop over columns
for (let x = 0; x < bounds.width; x += size) {
  // Loop over rows
  for (let y = 0; y < bounds.height; y += size) {
    // Convert our vertical position to 0-1
    const pos = y / bounds.height;
    // Only draw a box if a random number is less than pos
    if (Math.random() < pos) ctx.fillRect(x, y, size, size);
  }
}
```

So we've created a blocky gradient that's random, but there's a higher chance of a block towards the bottom of the element. Job done? Well, here it is:

<style>
  .pixel-gradient-v1 {
    background-image: paint(pixel-gradient-v1);
  }
  .pixel-gradient-animate {
    transition: all 4s ease-in-out;
    transition-property: width, height, background-color, --pixel-gradient-color, --pixel-gradient-size, box-shadow, filter;
    box-shadow: 0 0 0 #00000078;
  }
  .demo-container {
    height: 300px;
    contain: layout;
  }
  .demo-container .pixel-gradient {
    height: 100%;
    width: 100%;
    display: grid;
    font-weight: bold;
    align-items: center;
    justify-items: center;
    font-size: 3.5rem;
  }
  .demo-buttons {
    display: flex;
    gap: 6px;
    flex-flow: row wrap;
  }

  .pixel-gradient.width {
    width: 50%;
  }
  .pixel-gradient.height {
    height: 50%;
  }
  .pixel-gradient.colours {
    background-color: #009d81;
    --pixel-gradient-color: #ff8400;
  }
  .pixel-gradient.box-shadow {
    box-shadow: 0 16px 16px #00000078;
  }
  .pixel-gradient.blur {
    filter: blur(4px);
  }
  .pixel-gradient.block-size {
    --pixel-gradient-size: 18px;
  }
  @keyframes animate-seed {
    from { --pixel-gradient-seed: 0 }
    to { --pixel-gradient-seed: 4294967295 }
  }
  .pixel-gradient.animate-noise {
    animation: 60s linear infinite animate-seed;
  }
</style>

<figure class="full-figure" style="overflow: visible">
  <div class="demo-container">
    <div class="pixel-gradient pixel-gradient-animate pixel-gradient-v1">
      Hello
    </div>
  </div>
  <div class="figcaption demo-buttons v1-buttons"></div>
</figure>

<script>
  function addButtons(el, btns) {
    for (const [label, callback] of btns) {
      const btn = document.createElement('button');
      btn.classList.add('btn');
      btn.textContent = label;
      btn.addEventListener('click', callback);
      el.append(btn);
    }
  }

  function callbackForEl(callback) {
    return (event) => callback(event.target.closest('.full-figure').querySelector('.pixel-gradient'));
  }

  const initialButtonSet = [
    ['Animate width', callbackForEl(el => el.classList.toggle('width'))],
    ['Animate height', callbackForEl(el => el.classList.toggle('height'))],
    ['Animate colours', callbackForEl(el => el.classList.toggle('colours'))],
    ['Animate block size', callbackForEl(el => el.classList.toggle('block-size'))],
    ['Change text', callbackForEl(el => el.textContent = el.textContent.trim() === 'Hello' ? 'World' : 'Hello')],
    ['Animate box-shadow', callbackForEl(el => el.classList.toggle('box-shadow'))],
    ['Animate blur', callbackForEl(el => el.classList.toggle('blur'))],
  ];

  if (demosSupported) {
    addButtons(document.querySelector('.v1-buttons'), initialButtonSet);
  } else {
    document.querySelector('.v1-buttons').textContent = `Your browser does not support this demo`;
  }
</script>

Play with the above or try resizing your browser. Sometimes the pattern in the background changes, sometimes it doesn't.

The paint API is optimised with determinism in mind. The same input should produce the same output. In fact, the spec says if the element size and `inputProperties` are the same between paints, the browser can use a cached copy of our paint instructions. We're violating that assumption with `Math.random()`.

I'll try and explain what I see in Chrome:

**Why does the pattern change while animating width / height / colour / block-size?** These change the element size or our input properties, so the element has to repaint. Since we use `Math.random()`, we get a new random result.

**Why does it stay the same while changing the text?** This requires a repaint, but since the element size and input remain the same, the browser uses a cached version of our pattern.

**Why does it change while animating box-shadow?** Urm, I'm not really sure. Although the box-shadow change means the element needs repainting, box-shadow doesn't change the element size, and `box-shadow` isn't one of our `inputProperties`. It feels like the browser could used a cached version of our pattern here, but it doesn't.

**Why does it change twice when animating blur?** Hah, well, animating blur happens on the compositor, so you get an initial repaint to lift the element onto its own layer. But, during the animation, it just blurs the cached result. Then, once the animation is complete, it drops the layer, and paints the element as a regular part of the page. These repaints could use a cached result, but it doesn't seem to.

How the above behaves may differ depending on the browser, multiplied by version, multiplied by display/graphics hardware.

I explained this to my colleagues, and they said "So what? It's fun! Stop trying to crush fun Jake". Well, I'm going to show you that you can create pseudorandom effects with paint determinism and smooth animation _while having fun_. Maybe.

# Making random, not random

Computers can't really do random. Instead, they take some state, and do some hot maths all over it to create a number. Then, they modify that state so the next number seems unrelated to the number(s) that came before. But the truth is they're 100% related.

If you start with the same initial state, you'll get the same sequence of random number. That's what we want – something that looks random, but it's 100% reproducible. The good news is that's how `Math.random()` works, the bad news is it doesn't let us set the initial state.

Instead, let's use another implementation that _does_ let us set the initial state:

```js
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Using an initial state of 123456:
const rand = mulberry32(123456);
rand(); // 0.38233304349705577
rand(); // 0.7972629074938595
rand(); // 0.9965302373748273
```

[This gist](https://github.com/bryc/code/blob/master/jshash/PRNGs.md) has a great collection of random number generators. I picked `mulberry32` because it's simple, and good enough for visual randomness. I want to stress that I'm only recommending this for visual randomness. Remember the two golden rules:

- If you're implementing your own cryptography, don't take advice from me – I'm not qualified.
- Don't implement your own cryptography.

I mean, I'm not saying `mulberry32` is bad either. I'm just saying, if all your buttcoins get stolen because you broke the rules above, don't come crying to me.

Anyway, here's `mulberry32` in action:

<style>
.form-rows input[type=number] {
  width: 100%;
  margin: 0;
  box-sizing: border-box;
  font: inherit;
  line-height: 1.5;
  padding: 0 0.2em;
}

.form-rows .label {
  vertical-align: top;
}

.form-rows .input {
  padding: 0.5em;
}

.form-rows p {
  margin: 0;
}
</style>

<form class="random-form form-rows"><div class="form-rows-inner">
  <div class="field">
    <label for="seed-input" class="label">Seed:</label>
    <div class="input"><input required name="seed" id="seed-input" type="number" step="1" value="123456"></div>
  </div>
  <div class="field">
    <div class="label">Output:</div>
    <div class="input">
      <div class="random-output">…</div>
    </div>
  </div>
  <div class="field">
    <div class="label"></div>
    <div class="input"><button class="btn">Generate number</button> <button class="btn btn-restart">Start over</button></div>
  </div>
</div></form>

<script>
  function mulberry32(a) {
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const form = document.querySelector('.random-form');
  const seedInput = document.querySelector('#seed-input');
  const restartBtn = document.querySelector('.btn-restart');
  const result = document.querySelector('.random-output');

  let rand;

  const restart = (event) => {
    event.preventDefault();
    rand = undefined;
    result.textContent = '…';
  }

  seedInput.addEventListener('input', restart);
  restartBtn.addEventListener('click', restart);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!rand) rand = mulberry32(seedInput.valueAsNumber);
    result.textContent = rand();
  });
</script>

Notice how for a given seed, the sequence of seemingly random numbers is the same every time.

_Are you having fun yet??_

Let's put `mulberry32` to work here…

# Making paint deterministic

We'll add another custom property for the seed:

```js
CSS.registerProperty({
  name: '--pixel-gradient-seed',
  syntax: '<number>',
  initialValue: '1',
  inherits: true,
});
```

…which we'll also add to our `inputProperties`. Then, we can modify our paint code:

```js
const size = props.get('--pixel-gradient-size').value;
ctx.fillStyle = props.get('--pixel-gradient-color');

// Get the seed, and create our random function:
const seed = props.get('--pixel-gradient-seed').value;
const rand = mulberry32(seed);

for (let x = 0; x < bounds.width; x += size) {
  for (let y = 0; y < bounds.height; y += size) {
    const pos = y / bounds.height;
    // …and use it rather than Math.random()
    if (rand() < pos) ctx.fillRect(x, y, size, size);
  }
}
```

And here it is:

<style>
  .pixel-gradient-v2 {
    background-image: paint(pixel-gradient-v2);
  }
</style>

<figure class="full-figure" style="overflow: visible">
  <div class="demo-container">
    <div class="pixel-gradient pixel-gradient-animate pixel-gradient-v2">
      Hello
    </div>
  </div>
  <div class="figcaption demo-buttons v2-buttons"></div>
</figure>

<script>
  let seed = 1;
  const secondButtonSet = [
    ...initialButtonSet,
    ['Increment seed', callbackForEl(el => {
      el.style.setProperty('--pixel-gradient-seed', ++seed);
    })]
  ];

  if (demosSupported) {
    addButtons(document.querySelector('.v2-buttons'), secondButtonSet);
  } else {
    document.querySelector('.v2-buttons').textContent = `Your browser does not support this demo`;
  }
</script>

And now animating width, colour, shadow, and blur isn't glitching! Buuuuut we can't say the same for animating height and block size. Let's fix that!

_So much fun, right??_

# Handling rows and columns

Right now we're calling `rand()` for every block. Take a look at this:

<style>
  .pixel-grid {
    width: 100%;
    height: 100%;
    display: block;
    transition: all 4s ease-in-out;
    transition-property: width, height;
    background: #8a8a8a;
  }
  .pixel-grid.width {
    width: 50%;
  }
  .pixel-grid.height {
    height: 50%;
  }
  .full-figure .pixel-grid {
    margin-left: 0;
  }
</style>

<figure class="full-figure">
  <div class="demo-container">
    <canvas class="pixel-grid pixel-grid-v1"></canvas>
  </div>
  <div class="figcaption demo-buttons pixel-grid-buttons-v1"></div>
</figure>

<script>
  function callbackForPixelEl(callback) {
    return (event) => callback(event.target.closest('.full-figure').querySelector('.pixel-grid'));
  }
  const pixelGridButtons = [
    ['Animate width', callbackForPixelEl(el => el.classList.toggle('width'))],
    ['Animate height', callbackForPixelEl(el => el.classList.toggle('height'))],
  ];

  const pixelGridGap = 5;
  const pixelGridSize = 52;

  addButtons(document.querySelector('.pixel-grid-buttons-v1'), pixelGridButtons);

  function createDrawCallback(el, callback) {
    let drawOnIntersection = true;
    let intersecting = false;

    new IntersectionObserver((entries) => {
      const wasIntersecting = intersecting;
      intersecting = entries[0].isIntersecting;
      if (!wasIntersecting && intersecting && drawOnIntersection) {
        drawOnIntersection = false;
        callback();
      }
    }).observe(el);

    new ResizeObserver((entries) => {
      if (intersecting) {
        callback();
        return;
      }
      drawOnIntersection = true;
    }).observe(el);
  }

  {
    const canvas = document.querySelector('.pixel-grid-v1');
    const ctx = canvas.getContext('2d');

    createDrawCallback(canvas, () => {
      const bounds = canvas.getBoundingClientRect();
      canvas.width = bounds.width * devicePixelRatio;
      canvas.height = bounds.height * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
      ctx.font = '15px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      let count = 0;

      // Loop over columns
      for (let x = pixelGridGap; x + pixelGridSize < bounds.width; x += pixelGridSize + pixelGridGap) {
        // Loop over rows
        for (let y = pixelGridGap; y + pixelGridSize < bounds.height; y += pixelGridSize + pixelGridGap) {
          ctx.fillStyle = '#9a9a9a';
          ctx.fillRect(x, y, pixelGridSize, pixelGridSize);
          ctx.fillStyle = '#000';
          count++;
          ctx.fillText(count, x + pixelGridSize/2, y + pixelGridSize/2);
        }
      }
    });
  }
</script>

Let's say each square is a block, and the numbers represent the number of times `rand()` is called. When you animate width, the numbers stay in the same place, but when you animate height, they move (aside from the first column). So, as the height changes, the randomness of our pixels changes, which makes it look like the noise is animating. Instead, we want something more like this:

<figure class="full-figure">
  <div class="demo-container">
    <canvas class="pixel-grid pixel-grid-v2"></canvas>
  </div>
  <div class="figcaption demo-buttons pixel-grid-buttons-v2"></div>
</figure>

<script>
  addButtons(document.querySelector('.pixel-grid-buttons-v2'), pixelGridButtons);

  {
    const canvas = document.querySelector('.pixel-grid-v2');
    const ctx = canvas.getContext('2d');

    createDrawCallback(canvas, () => {
      const bounds = canvas.getBoundingClientRect();
      canvas.width = bounds.width * devicePixelRatio;
      canvas.height = bounds.height * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
      ctx.font = '15px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      let xCount = 0;

      // Loop over columns
      for (let x = pixelGridGap; x + pixelGridSize < bounds.width; x += pixelGridSize + pixelGridGap) {
        xCount++
        let yCount = 0;
        // Loop over rows
        for (let y = pixelGridGap; y + pixelGridSize < bounds.height; y += pixelGridSize + pixelGridGap) {
          yCount++;
          ctx.fillStyle = '#9a9a9a';
          ctx.fillRect(x, y, pixelGridSize, pixelGridSize);
          ctx.fillStyle = '#000';
          ctx.fillText(`${xCount}.${yCount}`, x + pixelGridSize/2, y + pixelGridSize/2);
        }
      }
    });
  }
</script>

…where are random values have two dimensions. Thankfully, we already have two dimensions to play with, the number of times `rand()` is called, and the seed.

_Have you ever had this much fun??_

# Being randomly predictable in two dimensions

This time, we'll reseed our random function for each column:

```js
const size = props.get('--pixel-gradient-size').value;
ctx.fillStyle = props.get('--pixel-gradient-color');

let seed = props.get('--pixel-gradient-seed').value;

for (let x = 0; x < bounds.width; x += size) {
  // Create a new rand() for this column:
  const rand = mulberry32(seed);
  // Increment the seed for next time, casting to a 32bit integer.
  seed = (seed + 1) | 0;

  for (let y = 0; y < bounds.height; y += size) {
    const pos = y / bounds.height;
    if (rand() < pos) ctx.fillRect(x, y, size, size);
  }
}
```

`mulberry32` works with 32bit state, which is why we use `| 0` to cast the number to 32bit. And here it is:

<style>
  .pixel-gradient-v3 {
    background-image: paint(pixel-gradient-v3);
  }
</style>

<figure class="full-figure" style="overflow: visible">
  <div class="demo-container">
    <div class="pixel-gradient pixel-gradient-animate pixel-gradient-v3">
      Hello
    </div>
  </div>
  <div class="figcaption demo-buttons v3-buttons"></div>
</figure>

<script>
  if (demosSupported) {
    addButtons(document.querySelector('.v3-buttons'), secondButtonSet);
  } else {
    document.querySelector('.v3-buttons').textContent = `Your browser does not support this demo`;
  }
</script>

Now height and block size animate in a more natural way! But there's one last thing to fix. By incrementing the seed by 1 for each column we've introduced visual predictability into our pattern. You can see this if you 'increment seed' – instead of producing a new random pattern, it shifts the pattern along. Instead of incrementing the seed by 1, we want to change it in some way that feels random, but is 100% deterministic.

Oh wait, that's what our `rand()` function does!

```js
const size = props.get('--pixel-gradient-size').value;
ctx.fillStyle = props.get('--pixel-gradient-color');

let seed = props.get('--pixel-gradient-seed').value;

for (let x = 0; x < bounds.width; x += size) {
  const rand = mulberry32(seed);
  // Instead of incrementing, set the seed to a 'random' 32bit value:
  seed = (rand() * 2 ** 32) | 0;

  for (let y = 0; y < bounds.height; y += size) {
    const pos = y / bounds.height;
    if (rand() < pos) ctx.fillRect(x, y, size, size);
  }
}
```

And here it is:

<figure class="full-figure" style="overflow: visible">
  <div class="demo-container">
    <div class="pixel-gradient pixel-gradient-animate pixel-gradient-final">
      Hello
    </div>
  </div>
  <div class="figcaption demo-buttons v4-buttons"></div>
</figure>

<script>
  if (demosSupported) {
    addButtons(document.querySelector('.v4-buttons'), secondButtonSet);
  } else {
    document.querySelector('.v4-buttons').textContent = `Your browser does not support this demo`;
  }
</script>

# Bringing back the fun

Ok, I admit that the animated noise effect was cool, but it was out of our control. Some folks react badly to flashing images and randomly changing visuals, so it's definitely something we _do_ want to have under our control.

However, now we have `--pixel-gradient-seed` defined as a number, we can animate it to recreate the animated noise effect:

```css
@keyframes animate-seed {
  from {
    --pixel-gradient-seed: 0;
  }
  to {
    --pixel-gradient-seed: 4294967295;
  }
}

.animated-pixel-gradient {
  background-image: paint(pixel-gradient);
  animation: 60s linear infinite animate-seed;
}

/* Be nice to users who don't want that kind of animation: */
@media (prefers-reduced-motion: reduce) {
  .animated-pixel-gradient {
    animation: none;
  }
}
```

And here it is:

<figure class="full-figure" style="overflow: visible">
  <div class="demo-container">
    <div class="pixel-gradient pixel-gradient-animate pixel-gradient-final">
      Hello
    </div>
  </div>
  <div class="figcaption demo-buttons v5-buttons"></div>
</figure>

<script>
  if (demosSupported) {
    addButtons(document.querySelector('.v5-buttons'), [
      ...secondButtonSet,
      ['Toggle noise animation', callbackForEl(el => el.classList.toggle('animate-noise'))]
    ]);
  } else {
    document.querySelector('.v5-buttons').textContent = `Your browser does not support this demo`;
  }
</script>

Now we can choose to animate the noise when _we_ want, but keep it stable at other times.

# But what about random placement?

Some CSS paint effects work with random placement of objects rather than random pixels, such as confetti/firework effects. You can use similar principles there too. Instead of placing items randomly around the element, split your elements up into a grid:

```js
const gridSize = 300;
const density = props.get('--confetti-density').value;
let seed = props.get('--confetti-seed').value;

for (let x = 0; x < bounds.width; x += gridSize) {
  const rand = mulberry32(seed);
  seed = (rand() * 2 ** 32) | 0;

  for (let y = 0; y < bounds.height; y += gridSize) {
    for (let _ = 0; _ < density, _++) {
      const confettiX = rand() * gridSize + x;
      const confettiY = rand() * gridSize + y;
      // TODO: draw confetti at confettiX,confettiY
    }
  }
}
```

TODO: Do example of this, and fix it for 3 dimensions of random (x, y, density)

Other other advantage of this is the density of confetti will be consistent no matter how big the element is.
