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

But, what if neither element is fully opaque? Well, you can't use the same technique:

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

…as you can still see the first item underneath. In this situation, you've probably done the same as me, and faded the other item out at the same time:

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

For these operations, pixels have four values called _channels_: red, green, blue, and alpha (transparency). Channel values are generally in the range 0-1, where 0 means 'none' and 1 means 'full'.

The default compositing method on the web and most applications is [source-over](https://drafts.fxtf.org/compositing/#porterduffcompositingoperators_srcover). Here's a worked example of how source-over combines two pixels:

```js
// Red 50% opacity
const source = [1, 0, 0, 0.5];
// Blue 50% opacity
const destination = [0, 1, 0, 0.5];

// source-over works with premultiplied colours,
// meaning their colour values are multiplied with their alpha:
function multiplyAlpha(pixel) {
  return pixel.map((channel, i) => {
    // Pass the alpha channel through unchanged
    if (i === 3) return channel;
    // Otherwise, multiply by alpha
    return channel * pixel[3];
  });
}

const premultipliedSource = multiplyAlpha(source);
const premultipliedDestination = multiplyAlpha(destination);

// Then, source-over creates a fraction of the destination,
// using the alpha of the source:
const transformedDestination = premultipliedDestination.map(
  (channel) => channel * (1 - premultipliedSource[3]),
);

// Then, the premultipliedSource is added:
const premultipliedResult = transformedDestination.map(
  (channel, i) => channel + premultipliedSource[i],
);

// Then, the alpha is unmultiplied:
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

const result = unmultiplyAlpha(premultipliedResult);
```

Note: The code above is for educational purposes 🤪, it doesn't have the optimisations you'd need for production. There are [libraries for that](https://github.com/thi-ng/umbrella/tree/develop/packages/porter-duff) if you need them.

Anyway here are the values:

<script type="component">{
  "module": "shared/demos/2021/compositing/PixelCalculator",
  "exportName": "Styles",
  "staticOnly": true
}</script>

<script type="component">{
  "module": "shared/demos/2021/compositing/PixelCalculator/SourceOver",
  "props": {
    "initialFrom": [1, 0, 0, 1],
    "initialTo": [0, 0, 1, 1]
  }
}</script>

And there we see the `0.750` alpha in the result, when we want `1.000` for a proper cross-fade. In fact, the colour is wrong too. If we're fading from red to blue, the mid point should be 50% red and 50% blue, but it's 33% red and 66% blue.

In terms of what we want for cross-fading, things seem to go wrong when we get to "transformed destination". In fact, if missed out that step, and just added the premultiplied destination to the premultiplied source, we'd get the answer we want.

So what's the solution?

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

Perfect! Except it only works in Chromium and WebKit browsers, with a `-webkit-` prefix, and more fundamentally, it only works with images, so it can't be used to cross-fade DOM elements. I had to use two SVG images to make the above demo work.

```css
.whatever {
  background: -webkit-cross-fade(url(img1.svg), url(img2.svg), 50%);
}
```

It isn't really what we're looking for, but…

# Lighter

Chromium engineer [Khushal Sagar](https://github.com/khushalsagar) went digging into the implementation of `-webkit-cross-fade()`, and it turns out it's implemented using a different compositing function, [plus-lighter](https://drafts.fxtf.org/compositing/#porterduffcompositingoperators_plus_lighter).

It's basically the same as source-over, but it doesn't do that "transformed destination" step:

```js
// Red 50% opacity
const source = [1, 0, 0, 0.5];
// Blue 50% opacity
const destination = [0, 1, 0, 0.5];

// plus-lighter also works with premultiplied colours:
const premultipliedSource = multiplyAlpha(source);
const premultipliedDestination = multiplyAlpha(destination);

const premultipliedResult = premultipliedDestination
  // But then the pixels are just added together:
  .map((channel, i) => clamp01(channel + premultipliedSource[i]))
  // Clamped to 0-1:
  .map((channel) => {
    if (channel < 0) return 0;
    if (channel > 1) return 1;
    return channel;
  });

// Then, the alpha is unmultiplied:
const result = unmultiplyAlpha(premultipliedResult);
```

And here we go:

<script type="component">{
  "module": "shared/demos/2021/compositing/PixelCalculator/Lighter",
  "props": {
    "initialFrom": [1, 0, 0, 1],
    "initialTo": [0, 0, 1, 1]
  }
}</script>

And that works! The red value goes from 1 to 0, the blue goes from 0 to 1, and the alpha stays full.

# We should have this in CSS!

- Unfortunately 'lighter' isn't available in CSS, but it is available in canvas (make passing mention and a quick demo)
- (demo)
- We need this in CSS, then we can just do this
- Currently working on SET
- We need cross-fading
- Hopefully we can just do this
- (code - hover example)
- Talk about isolation
- Bonus round: SVG
- Bonus round: Linear rgb
- Thought I was going to be able to do this with SVG, but no. Maybe in old Edge?

# Linear demo

<figure class="full-figure max-figure checkd">
  <div class="example-stage">
    <canvas id="linear-canvas"></canvas>
  </div>
  <div class="mix-input"><input id="mix-input-5" type="range" min="0" max="1" step="any" value="0"></div>
</figure>

<script type="module">
  const range = $('#mix-input-5');
  const canvas = $('#linear-canvas');
  let gl;
  let fadeLoc;

  const fragmentShaderSource = `
precision lowp float;

// our textures
uniform sampler2D u_from;
uniform sampler2D u_to;
uniform float fadeAmount;

// the texCoords passed in from the vertex shader.
varying vec2 v_texCoord;

void main() {
  vec4 fromTex = texture2D(u_from, v_texCoord);
  vec4 toTex = texture2D(u_to, v_texCoord);

  vec4 premultipliedFrom = vec4(fromTex.rgb * fromTex.a * (1.0 - fadeAmount), fromTex.a * (1.0 - fadeAmount));
  vec4 premultipliedTo = vec4(toTex.rgb * toTex.a * fadeAmount, toTex.a * fadeAmount);
  vec4 lighter = premultipliedTo + premultipliedFrom;
  
  gl_FragColor = vec4(lighter.rgb / lighter.a, lighter.a);
}
`;

  const vertexShaderSource = `
precision lowp float;
attribute vec2 a_position;
uniform mat3 u_matrix;
varying vec2 v_texCoord;

void main() {
  gl_Position = vec4(u_matrix * vec3(a_position, 1), 1);

  // because we're using a unit quad we can just use
  // the same data for our texcoords.
  v_texCoord = a_position;
}
`;

  function loadShader(gl, source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const error = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw Error(error || 'unknown error');
    }

    return shader;
  }

  function createProgram(gl, shaders) {
    const program = gl.createProgram();
    for (const shader of shaders) gl.attachShader(program, shader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const error = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw Error(error || 'unknown error');
    }

    return program;
  }

  function createTextureFromBitmap(gl, img, smooth=false) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      smooth ? gl.LINEAR : gl.NEAREST,
    );
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MAG_FILTER,
      smooth ? gl.LINEAR : gl.NEAREST,
    );
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

    return texture;
  }

  async function setup() {
    canvas.width = 600 * 2.1;
    canvas.height = 600;

    gl = canvas.getContext('webgl', {
      antialias: false,
      powerPreference: 'low-power',
      premultipliedAlpha: false,
    });

    if (!gl) throw Error(`Couldn't create GL context`);

    gl.viewport(0, 0, canvas.width, canvas.height);

    const frag = loadShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
    const vert = loadShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
    const program = createProgram(gl, [frag, vert]);
    gl.useProgram(program);

    // look up where the vertex data needs to go.
    const positionLocation = gl.getAttribLocation(program, 'a_position');

    // look up uniform locations
    const fromLoc = gl.getUniformLocation(program, 'u_from');
    gl.uniform1i(fromLoc, 0); // texture unit 0
    const toLoc = gl.getUniformLocation(program, 'u_to');
    gl.uniform1i(toLoc, 1); // texture unit 1
    const matrixLoc = gl.getUniformLocation(program, 'u_matrix');
    // Options
    fadeLoc = gl.getUniformLocation(program, 'fadeAmount');

    // provide texture coordinates for the rectangle.
    const positionBuffer = gl.createBuffer();
    // prettier-ignore
    const rect = new Float32Array([
      0.0,  0.0,
      1.0,  0.0,
      0.0,  1.0,
      0.0,  1.0,
      1.0,  0.0,
      1.0,  1.0
    ]);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, rect, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.uniformMatrix3fv(matrixLoc, false, [2, 0, 0, 0, -2, 0, -1, 1, 1]);

    const imageURLs = [
      `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 21 10'%3e%3ctext textLength='20' text-anchor='middle' dominant-baseline='middle' font-family='Courier New' x='50%25' y='5' font-size='8.9' font-weight='bold' fill='%23f00'%3egood%3c/text%3e%3c/svg%3e`,
      `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 21 10'%3e%3ctext textLength='20' text-anchor='middle' dominant-baseline='middle' font-family='Courier New' x='50%25' y='5' font-size='8.9' font-weight='bold' fill='%230f0'%3egoat%3c/text%3e%3c/svg%3e`,
    ];

    for (const [i, imageURL] of imageURLs.entries()) {
      const img = new Image();
      img.src = imageURL;
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      gl.activeTexture(gl[`TEXTURE${i}`]);
      gl.bindTexture(gl.TEXTURE_2D, createTextureFromBitmap(gl, img));
    }
  }

  const setupPromise = setup();

  async function update(mix) {
    await setupPromise;
    gl.uniform1f(fadeLoc, mix);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  range.oninput = () => update(range.valueAsNumber);
  update(range.valueAsNumber);
</script>
