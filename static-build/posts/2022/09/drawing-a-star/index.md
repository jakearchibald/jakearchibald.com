---
title: Drawing a star with DOMMatrix
date: 2022-09-30 01:00:00
summary: And how I messed up the code on HTTP 203
meta: And how I messed up the code on HTTP 203
image: './img.png'
---

I recently recorded an episode of HTTP 203 on `DOMPoint` and `DOMMatrix`. If you'd rather watch the video version, [here it is](https://www.youtube.com/watch?v=VdNzD4lhidw&lc=Ugx4NRGM8QtqD5XwbEN4AaABAg), but come back here for some bonus details on a silly mistake I made, which I almost got away with.

`DOMMatrix` lets you apply transformations to `DOMPoint`s. I find these APIs handy for drawing shapes, and working with the result of transforms without causing full layouts in the DOM.

# DOMPoint

Here's `DOMPoint`:

```js
const point = new DOMPoint(10, 15);
console.log(point.x); // 10
console.log(point.y); // 15
```

Yeah! Exciting right? Ok, maybe `DOMPoint` isn't interesting on its own, so let's bring in `DOMMatrix`:

# DOMMatrix

```js
const matrix = new DOMMatrix('translate(10px, 15px)').scale(2);
console.log(matrix.a); // 2;
```

`DOMMatrix` lets you create a matrix, optionally from a CSS transform, and perform additional transforms on it. Each transform creates a new `DOMMatrix`, but there are [additional methods that mutate the matrix](https://drafts.fxtf.org/geometry/#dommatrix), such as `scaleSelf()`.

Things start to get fun when you combine `DOMMatrix` and `DOMPoint`:

```js
const newPoint = matrix.transformPoint(point);
```

I used this to draw the [blobs on Squoosh](https://squoosh.app/), but even more recently I used it to draw a star.

# Drawing a star

I needed a star where the center was in the exact center. I could download one and check the center point, but why not draw it myself? A star's just a spiky circle right? Unfortunately I can't remember the maths for this type of thing, but that doesn't matter, because I can get `DOMMatrix` to do it for me.

```js
const createStar = ({ points = 10, x = 0, y = 0, size = 1 }) =>
  Array.from({ length: points }, (_, i) =>
    new DOMMatrix()
      .translate(x, y)
      .scale(size)
      .transformPoint({ x: 0, y: 0 }),
  );
```

I'm using `Array.from` to create and initialise an array. [I wish there was a friendlier way to do this](https://es.discourse.group/t/provide-an-easy-way-to-create-a-new-array-filled-via-a-mapping-function/1056/56).

A typical star has 10 points – 5 outer points and 5 inner points, but I figured it'd be nice to allow other kinds of stars.

The matrix only has transforms set to apply the size and position, so it's just going to return a bunch of points at `x, y`.

Anyway, I'm not going to let that stop me. I'm going to draw it in an `<svg>` element below:

```js
const starPoints = createStar({ x: 50, y: 50, size: 23 });
const starPath = document.querySelector('.star-path');
starPath.setAttribute(
  'd',
  // SVG path syntax
  `M ${starPoints.map((point) => `${point.x} ${point.y}`).join(', ')} z`,
);
```

And here's the result:

<style>
  .star-svg {
    max-height: 70vh;
  }
  .checkd {
    background: #0000004a url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2 2"><path d="M1 2V0h1v1H0v1z" fill-opacity=".05"/></svg>');
    background-size: 20px 20px;
  }
  .range-container {
    background: #ffe453;
    display: grid;
    padding: 10px;
  }
</style>

<figure class="full-figure max-figure checkd">
  <svg viewBox="0 0 100 100" class="star-svg">
    <defs>
      <clipPath id="star-2">
        <path class="clip-path" />
      </clipPath>
      <linearGradient id="ocean-gradient-2" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="#000046" />
        <stop offset="100%" stop-color="#1CB5E0" />
      </linearGradient>
    </defs>
    <rect clip-path="url(#star-2)" x="0" y="0" width="100" height="100" fill="url(#ocean-gradient-2)" />
  </svg>
</figure>

<script>
  {
    const createStar = ({ points = 10, x = 0, y = 0, size = 1 }) =>
      Array.from({ length: points }, (_, i) =>
        new DOMMatrix()
          .translate(x, y)
          .scale(size)
          .transformPoint({ x: 0, y: 0 }),
      );

    const [clipPath, svg] = ['.clip-path', 'svg'].map(
      (selector) => document.currentScript.previousElementSibling.querySelector(selector),
    );

    const svgNS = 'http://www.w3.org/2000/svg';
    const points = 10;

    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('stroke', 'white');
    path.setAttribute('stroke-width', '1');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('fill', 'none');
    svg.append(path);

    const pointCircles = Array.from({ length: points }, (_, i) => {
      const g = document.createElementNS(svgNS, 'g');
      const circle = document.createElementNS(svgNS, 'circle');
      circle.setAttribute('r', '3');
      circle.setAttribute('fill', 'white');

      g.append(circle);
      return g;
    });

    svg.append(...pointCircles);

    let frameId = 0;

    const draw = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        const starPoints = createStar({ x: 50, y: 50, size: 23, points, });
        const pathValue = `M ${starPoints.map(point => `${point.x} ${point.y}`).join(', ')} z`;
        clipPath.setAttribute('d', pathValue);
        path.setAttribute('d', pathValue);

        for (const [i, point] of starPoints.entries()) {
          const g = pointCircles[i];
          g.setAttribute('transform', `translate(${point.x} ${point.y})`);
        }
      });
    };

    draw();
  }
</script>

So, err, that's 10 points on top of each other. Not exactly a star. Ok, next step:

```js
const createStar = ({ points = 10, x = 0, y = 0, size = 1 }) =>
  Array.from({ length: points }, (_, i) =>
    new DOMMatrix()
      .translate(x, y)
      .scale(size)
      // Here's the new bit!
      .translate(0, -1)
      .transformPoint({ x: 0, y: 0 }),
  );
```

And the result:

<figure class="full-figure max-figure checkd">
  <svg viewBox="0 0 100 100" class="star-svg">
    <defs>
      <clipPath id="star-3">
        <path class="clip-path" />
      </clipPath>
      <linearGradient id="ocean-gradient-3" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="#000046" />
        <stop offset="100%" stop-color="#1CB5E0" />
      </linearGradient>
    </defs>
    <rect clip-path="url(#star-3)" x="0" y="0" width="100" height="100" fill="url(#ocean-gradient-3)" />
  </svg>
  <div class="range-container"><input type="range" min="0" max="1" step="any" value="0"></div>
</figure>

<script>
  {
    const createStar = ({ points = 10, x = 0, y = 0, size = 1, translateMultiplier = 1}) =>
      Array.from({ length: points }, (_, i) =>
        new DOMMatrix()
          .translate(x, y)
          .scale(size)
          .translate(0, -1 * translateMultiplier)
          .transformPoint({ x: 0, y: 0 }),
      );

    const [clipPath, svg, range] = ['.clip-path', 'svg', '.range-container input'].map(
      (selector) => document.currentScript.previousElementSibling.querySelector(selector),
    );

    const svgNS = 'http://www.w3.org/2000/svg';
    const points = 10;

    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('stroke', 'white');
    path.setAttribute('stroke-width', '1');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('fill', 'none');
    svg.append(path);

    const pointCircles = Array.from({ length: points }, (_, i) => {
      const g = document.createElementNS(svgNS, 'g');
      const circle = document.createElementNS(svgNS, 'circle');
      circle.setAttribute('r', '3');
      circle.setAttribute('fill', 'white');

      g.append(circle);
      return g;
    });

    svg.append(...pointCircles);

    let frameId = 0;

    const draw = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        const translateMultiplier = range.valueAsNumber;
        const starPoints = createStar({ points, x: 50, y: 50, size: 23, translateMultiplier });
        const pathValue = `M ${starPoints.map(point => `${point.x} ${point.y}`).join(', ')} z`;
        clipPath.setAttribute('d', pathValue);
        path.setAttribute('d', pathValue);

        for (const [i, point] of starPoints.entries()) {
          const g = pointCircles[i];
          g.setAttribute('transform', `translate(${point.x} ${point.y})`);
        }
      });
    };

    draw();
    range.addEventListener('input', () => draw());
  }
</script>

Use the slider to transition between the previous and new state. I'm sure you'll agree it was worth making this interactive.

Ok, so all the points are still on stop of each other. Let's fix that:

```js
const createStar = ({ points = 10, x = 0, y = 0, size = 1 }) =>
  Array.from({ length: points }, (_, i) =>
    new DOMMatrix()
      .translate(x, y)
      .scale(size)
      // Here's the new bit!
      .rotate((i / points) * 360)
      .translate(0, -1)
      .transformPoint({ x: 0, y: 0 }),
  );
```

I'm rotating each point by a fraction of 360 degrees. So the first point is rotated 0/10ths of 360 degrees, the second is rotated 1/10th, then 2/10ths and so on.

Here's the result:

<figure class="full-figure max-figure checkd">
  <svg viewBox="0 0 100 100" class="star-svg">
    <defs>
      <clipPath id="star-4">
        <path class="clip-path" />
      </clipPath>
      <linearGradient id="ocean-gradient-4" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="#000046" />
        <stop offset="100%" stop-color="#1CB5E0" />
      </linearGradient>
    </defs>
    <rect clip-path="url(#star-4)" x="0" y="0" width="100" height="100" fill="url(#ocean-gradient-4)" />
  </svg>
  <div class="range-container"><input type="range" min="0" max="1" step="any" value="0"></div>
</figure>

<script>
  {
    const createStar = ({ points = 10, x = 0, y = 0, size = 1, rotatePointsMultiplier = 1 }) =>
      Array.from({ length: points }, (_, i) =>
        new DOMMatrix()
          .translate(x, y)
          .scale(size)
          .rotate((i / (points)) * 360 * rotatePointsMultiplier)
          .translate(0, -1)
          .transformPoint({ x: 0, y: 0 }),
      );

    const [clipPath, svg, range] = ['.clip-path', 'svg', '.range-container input'].map(
      (selector) => document.currentScript.previousElementSibling.querySelector(selector),
    );

    const svgNS = 'http://www.w3.org/2000/svg';
    const points = 10;

    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('stroke', 'white');
    path.setAttribute('stroke-width', '1');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('fill', 'none');
    svg.append(path);

    const pointCircles = Array.from({ length: points }, (_, i) => {
      const g = document.createElementNS(svgNS, 'g');
      const circle = document.createElementNS(svgNS, 'circle');
      circle.setAttribute('r', '3');
      circle.setAttribute('fill', 'white');
      const text = document.createElementNS(svgNS, 'text');
      text.textContent = i + 1;
      text.setAttribute('fill', 'black');
      text.setAttribute('font-size', '4');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'central');

      g.append(circle, text);
      return g;
    });

    svg.append(...pointCircles.slice().reverse());

    let frameId = 0;

    const draw = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        const rotatePointsMultiplier = range.valueAsNumber;
        const starPoints = createStar({ points, x: 50, y: 50, size: 23, rotatePointsMultiplier });
        const pathValue = `M ${starPoints.map(point => `${point.x} ${point.y}`).join(', ')} z`;
        clipPath.setAttribute('d', pathValue);
        path.setAttribute('d', pathValue);

        for (const [i, point] of starPoints.entries()) {
          const g = pointCircles[i];
          g.setAttribute('transform', `translate(${point.x} ${point.y})`);
        }
      });
    };

    draw();
    range.addEventListener('input', () => draw());
  }
</script>

Now we have a shape! It's not a star, but we're getting somewhere.

To finish it off, move some of the points outward:

```js
const createStar = ({ points = 10, x = 0, y = 0, size = 1 }) =>
  Array.from({ length: points }, (_, i) =>
    new DOMMatrix()
      .translate(x, y)
      .scale(size)
      .rotate((i / points) * 360)
      // Here's the new bit!
      .translate(0, i % 2 ? -1 : -2)
      .transformPoint({ x: 0, y: 0 }),
  );
```

Here's the result:

<figure class="full-figure max-figure checkd">
  <svg viewBox="0 0 100 100" class="star-svg">
    <defs>
      <clipPath id="star-5">
        <path class="clip-path" />
      </clipPath>
      <linearGradient id="ocean-gradient-5" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="#000046" />
        <stop offset="100%" stop-color="#1CB5E0" />
      </linearGradient>
    </defs>
    <rect clip-path="url(#star-5)" x="0" y="0" width="100" height="100" fill="url(#ocean-gradient-5)" />
  </svg>
  <div class="range-container"><input type="range" min="0" max="1" step="any" value="0"></div>
</figure>

<script>
  {
    const createStar = ({ points = 10, x = 0, y = 0, size = 1, translateMultiplier = 1 }) =>
      Array.from({ length: points }, (_, i) =>
        new DOMMatrix()
          .translate(x, y)
          .scale(size)
          .rotate((i / (points)) * 360)
          .translate(0, i % 2 ? -1 : (-1 - (1 * translateMultiplier)))
          .transformPoint({ x: 0, y: 0 }),
      );

    const [clipPath, svg, range] = ['.clip-path', 'svg', '.range-container input'].map(
      (selector) => document.currentScript.previousElementSibling.querySelector(selector),
    );

    const svgNS = 'http://www.w3.org/2000/svg';
    const points = 10;

    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('stroke', 'white');
    path.setAttribute('stroke-width', '1');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('fill', 'none');
    svg.append(path);

    const pointCircles = Array.from({ length: points }, (_, i) => {
      const g = document.createElementNS(svgNS, 'g');
      const circle = document.createElementNS(svgNS, 'circle');
      circle.setAttribute('r', '3');
      circle.setAttribute('fill', 'white');
      const text = document.createElementNS(svgNS, 'text');
      text.textContent = i + 1;
      text.setAttribute('fill', 'black');
      text.setAttribute('font-size', '4');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'central');

      g.append(circle, text);
      return g;
    });

    svg.append(...pointCircles.slice().reverse());

    let frameId = 0;

    const draw = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        const translateMultiplier = range.valueAsNumber;
        const starPoints = createStar({ points, x: 50, y: 50, size: 23, translateMultiplier });
        const pathValue = `M ${starPoints.map(point => `${point.x} ${point.y}`).join(', ')} z`;
        clipPath.setAttribute('d', pathValue);
        path.setAttribute('d', pathValue);

        for (const [i, point] of starPoints.entries()) {
          const g = pointCircles[i];
          g.setAttribute('transform', `translate(${point.x} ${point.y})`);
        }
      });
    };

    draw();
    range.addEventListener('input', () => draw());
  }
</script>

And that's a star!

# But then I messed it up

As I was getting the slides together for the HTTP 203 episode, I realised that the `points` argument wasn't quite right. It lets you do something like this:

```js
const starPoints = createStar({ points: 9, x: 50, y: 50, size: 23 });
```

Which looks like this:

<figure class="full-figure max-figure checkd">
  <svg viewBox="0 0 100 100" class="star-svg">
    <defs>
      <clipPath id="star-6">
        <path class="clip-path" />
      </clipPath>
      <linearGradient id="ocean-gradient-6" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="#000046" />
        <stop offset="100%" stop-color="#1CB5E0" />
      </linearGradient>
    </defs>
    <rect clip-path="url(#star-6)" x="0" y="0" width="100" height="100" fill="url(#ocean-gradient-6)" />
  </svg>
</figure>

<script>
  {
    const createStar = ({ points = 10, x = 0, y = 0, size = 1 }) =>
      Array.from({ length: points }, (_, i) =>
        new DOMMatrix()
          .translate(x, y)
          .scale(size)
          .rotate((i / (points)) * 360)
          .translate(0, i % 2 ? -1 : -2)
          .transformPoint({ x: 0, y: 0 }),
      );

    const [clipPath, svg] = ['.clip-path', 'svg'].map(
      (selector) => document.currentScript.previousElementSibling.querySelector(selector),
    );

    const svgNS = 'http://www.w3.org/2000/svg';
    const points = 9;

    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('stroke', 'white');
    path.setAttribute('stroke-width', '1');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('fill', 'none');
    svg.append(path);

    const pointCircles = Array.from({ length: points }, (_, i) => {
      const g = document.createElementNS(svgNS, 'g');
      const circle = document.createElementNS(svgNS, 'circle');
      circle.setAttribute('r', '3');
      circle.setAttribute('fill', 'white');
      const text = document.createElementNS(svgNS, 'text');
      text.textContent = i + 1;
      text.setAttribute('fill', 'black');
      text.setAttribute('font-size', '4');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'central');

      g.append(circle, text);
      return g;
    });

    svg.append(...pointCircles.slice().reverse());

    let frameId = 0;

    const draw = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        const starPoints = createStar({ points, x: 50, y: 50, size: 23 });
        const pathValue = `M ${starPoints.map(point => `${point.x} ${point.y}`).join(', ')} z`;
        clipPath.setAttribute('d', pathValue);
        path.setAttribute('d', pathValue);

        for (const [i, point] of starPoints.entries()) {
          const g = pointCircles[i];
          g.setAttribute('transform', `translate(${point.x} ${point.y})`);
        }
      });
    };

    draw();
  }
</script>

Which… isn't a star. The number of points has to be even to create a valid star. Besides, the ten-pointed shape we've been creating so far is typically called a "five-pointed star", so I changed the API to work in that style:

```js
const createStar = ({ points = 5, x = 0, y = 0, size = 1 }) =>
  Array.from({ length: points * 2 }, (_, i) =>
    new DOMMatrix()
      .translate(x, y)
      .scale(size)
      .rotate((i / points) * 360)
      .translate(0, i % 2 ? -1 : -2)
      .transformPoint({ x: 0, y: 0 }),
  );
```

I quickly tested the code, and it looked fine. But… it's not quite right. Can you see the bug I've introduced? I didn't notice it until [Dillon Pentz pointed it out on Twitter](https://twitter.com/Dillon_Pentz/status/1574771164249227271):

<blockquote class="quote"><p>Wait… If the index in the array from loop is <code>0 <= i < points * 2</code>, how does it produce the correct star when dividing by points? Doesn't that rotate around the circle twice?</p></blockquote>

And, he's right! I correctly multiply `points` for the array length, but I forgot to do it for the `rotate`. I didn't notice it, because for stars with odd-numbered points, it creates a shape that's almost identical.

<figure class="full-figure max-figure checkd">
  <svg viewBox="0 0 100 100" class="star-svg">
    <defs>
      <clipPath id="star-1">
        <path class="clip-path" />
      </clipPath>
      <linearGradient id="ocean-gradient-1" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="#000046" />
        <stop offset="100%" stop-color="#1CB5E0" />
      </linearGradient>
    </defs>
    <rect clip-path="url(#star-1)" x="0" y="0" width="100" height="100" fill="url(#ocean-gradient-1)" />
  </svg>
  <div class="range-container"><input type="range" min="0" max="1" step="any" value="0"></div>
</figure>

<script>
  {
    const createStar = ({ points = 5, x = 0, y = 0, size = 1, rotatePointsMultiplier = 2 }) =>
      Array.from({ length: points * 2 }, (_, i) =>
        new DOMMatrix()
          .translate(x, y)
          .scale(size)
          .rotate((i / (points * rotatePointsMultiplier)) * 360)
          .translate(0, i % 2 ? -1 : -2)
          .transformPoint({ x: 0, y: 0 }),
      );

    const [clipPath, svg, range] = ['.clip-path', 'svg', '.range-container input'].map(
      (selector) => document.currentScript.previousElementSibling.querySelector(selector),
    );

    const svgNS = 'http://www.w3.org/2000/svg';
    const points = 5;

    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('stroke', 'white');
    path.setAttribute('stroke-width', '1');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('fill', 'none');
    svg.append(path);

    const pointCircles = Array.from({ length: points * 2 }, (_, i) => {
      const g = document.createElementNS(svgNS, 'g');
      const circle = document.createElementNS(svgNS, 'circle');
      circle.setAttribute('r', '3');
      circle.setAttribute('fill', 'white');
      const text = document.createElementNS(svgNS, 'text');
      text.textContent = i + 1;
      text.setAttribute('fill', 'black');
      text.setAttribute('font-size', '4');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'central');

      g.append(circle, text);
      return g;
    });

    svg.append(...pointCircles);

    let frameId = 0;

    const draw = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        const rotatePointsMultiplier = 2 - range.valueAsNumber;
        const starPoints = createStar({ points, x: 50, y: 50, size: 23, rotatePointsMultiplier });
        const pathValue = `M ${starPoints.map(point => `${point.x} ${point.y}`).join(', ')} z`;
        clipPath.setAttribute('d', pathValue);
        path.setAttribute('d', pathValue);

        for (const [i, point] of starPoints.entries()) {
          const g = pointCircles[i];
          g.setAttribute('transform', `translate(${point.x} ${point.y})`);
        }
      });
    };

    draw();
    range.addEventListener('input', () => draw());
  }
</script>

The above is the result I intended. Drag the slider to see what the code actually does.

Here's a correct implementation:

```js
const createStar = ({ points = 5, x = 0, y = 0, size = 1 }) => {
  const length = points * 2;

  return Array.from({ length }, (_, i) =>
    new DOMMatrix()
      .translate(x, y)
      .scale(size)
      .rotate((i / length) * 360)
      .translate(0, i % 2 ? -1 : -2)
      .transformPoint({ x: 0, y: 0 }),
  );
};
```

I guess the moral of the story is: Don't change slides at the last minute.
