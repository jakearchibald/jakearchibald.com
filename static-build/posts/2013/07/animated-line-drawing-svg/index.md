---
title: Animated line drawing in SVG
date: 2013-07-29 14:56:48
summary: "I like using diagrams as a way of showing information flow or browser
  behaviour, but large diagrams can be daunting at first glance. When I gave
  talks about [the Application
  Cache](http://www.dailymotion.com/video/xwsc3y_application-cache-by-jake-arch\
  ibald_tech) and [rendering performance](http://vimeo.com/69385032) I started
  with a blank screen and made the diagrams appear to [draw themselves bit by
  bit](http://vimeo.com/69385032#t=4m15s) as I described the process. Here's how
  it's done:"
mindframe: using tired fingers
image: null
meta: ''
---

<style>
  .full-sketch-container {
    padding-top: 35%;
    position: relative;
    margin: 25px auto;
  }
  .full-sketch-container svg,
  .squiggle-container svg,
  .jb-container svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  .full-sketch-container,
  .squiggle-sliders,
  .squiggle-go {
    display: none;
  }
  .squiggle-container {
    padding-top: 16.87%;
    position: relative;
    margin: 25px auto;
  }
  .squiggle-container path {
    stroke: #000;
    stroke-width: 4.3;
    fill: none;
  }
  .jb-container {
    padding-top:76.1%;
    position: relative;
    margin: 25px auto;
  }
  .inline-svg .no-svg-support {
    display: none;
  }
  .input-range .no-range-support {
    display: none;
  }
  .input-range.inline-svg .no-range-svg-support {
    display: none;
  }
</style>

<script>
  var supportsInlineSvg = (function() {
    var div = document.createElement('div');
    div.innerHTML = '<svg/>';
    return (div.firstChild && div.firstChild.namespaceURI) == 'http://www.w3.org/2000/svg';
  }());
  var supportsInputRange = (function() {
    var input = document.createElement('input');
    input.setAttribute('type', 'range');
    return input.type != 'text';
  }());
  document.documentElement.className += (supportsInlineSvg ? ' inline-svg' : '') + (supportsInputRange ? ' input-range' : '');
</script>
<div class="full-sketch-container">
<svg xmlns="http://www.w3.org/2000/svg" height="255" width="729" viewBox="0 0 729 255"><style>path { fill: none; stroke: #000; stroke-width: 2.7; } .shade { stroke-width: 20.7; stroke: #e5e5e5; } .letter { stroke-width: 3.2; } .bubble { stroke-width: 5; }</style><path class="shade" d="M716 160l-27 53 30-94-47 94 42-121-61 115 57-124-79 133 78-143-101 146 96-153-126 156 122-168-145 168 137-168-169 172 168-188-186 178 170-183-202 197 185-201-212 200 192-202-214 198 192-198-213 196 189-196-207 194 185-194-203 193 172-193-186 189 162-191-175 187 146-184-165 180 140-179-155 173 133-174-142 166 123-167-128 161 100-161-110 167 91-174-99 170 63-151-49 123-22 27 8-26-26 29"/><path d="M72.2 157s12.6-6.46 22.2-6.82c9.69-.359 18.7 1.08 18.7 1.08s-3.95-38.4-24.4-36.6c-20.5 1.79-14.7 34.4-12.6 38.4"/><path d="M162 152s13.6-.718 19 0c5.38.718 13.3 4.66 13.3 4.66s8.61-35.5-7.53-39.1c-16.1-3.59-24.4 14.4-24.8 32.3"/><path d="M82.7 125c6.56-.193 7.14 5.79 7.33 8.69.193 2.9-.579 8.11-5.02 8.88-4.44.772-7.53-4.83-7.91-8.11-.338-2.87.802-7.81 4.07-9.13"/><path d="M188 126c-6.76-.386-8.3 6.56-8.49 8.88-.193 2.32 1.54 7.33 4.83 7.72 3.28.386 7.91-2.32 8.3-7.72.386-5.4-.579-6.76-2.9-8.49"/><path d="M150 133s-4.44 8.11-1.74 14.3c2.7 6.18 12.7 8.69 12.7 8.69s.772 7.14-2.9 9.46-7.72 3.28-8.3 4.83c-.579 1.54-.965 3.86-.965 3.86"/><path d="M132 159s-2.32 1.93-2.32 4.63l3.09 5.98"/><path d="M138 167s2.12-1.16 3.67-.965c1.54.193 3.47.579 3.47.579"/><path d="M169 187s-9.07-1.93-14.7-1.93c-5.6 0-23.4 3.86-33 3.47-9.65-.386-15.6-4.83-15.6-4.83s4.83 11.2 11.2 18.3c6.37 7.14 11.4 17.2 26.2 17.6 14.9.386 17.4-10 17.6-10.6.193-.579.386-8.49 1.16-12.4.772-3.86 4.83-9.26 4.83-9.26"/><path d="M111 192s23.5 3.28 31.7 3.86c8.11.579 14.9.579 17.2-.772 2.32-1.35 4.44-4.63 4.44-4.63"/><path d="M122 207s10.8-2.32 15.4-1.93c4.63.386 7.72 5.79 7.72 5.79"/><path d="M143 207s3.47-1.16 6.56-.772c3.09.386 9.46 6.18 9.46 6.18"/><path class="letter" d="M409 62.2s-39.1 38.6-48.2 45.8"/><path class="letter" d="M374 62.2s28.2 42.1 36.9 49.7"/><path class="letter" d="M419 104s0-39.6 2.72-39.8c2.72-.247 17.3 23.5 19.5 23.5 2.23 0 6.93-25 8.66-25.2 1.73-.247 12.4 28 14.6 32.4 2.23 4.45 3.96 2.23 3.96 2.23"/><path class="letter" d="M471 63.2s-1.24 10.6-.742 22.8c.495 12.1 3.46 19.3 5.44 20 1.98.742 28.2-8.91 41.6-7.67"/><path class="letter" d="M554 98.1s-1.98-19.8.247-19.8 5.94 8.66 7.42 8.66 7.67-14.6 8.66-14.6c.989 0 6.43 21 12.1 23.3"/><path class="letter" d="M590 78.5s-.247-1.24-1.98-1.24-3.96 5.44-3.71 7.67c.247 2.23 2.23 5.69 4.95 6.18 2.72.495 7.92-5.94 7.42-9.89-.247.247 4.21 7.67 9.15 10.6"/><path class="letter" d="M616 78s-.989-.495-2.97-.495-6.68 4.21-6.18 8.41c.495 4.21 1.73 7.42 4.7 7.92 2.97.495 8.41-10.1 8.16-26-.247-15.8-1.98-25.5-4.7-25.2-2.72.247-4.95 26.5 17.1 41.8"/><path class="letter" d="M633 77.8s3.46 1.48 5.94 1.24c2.47-.247 4.7-4.21 5.19-6.93.495-2.72-.247-5.69-1.98-5.44-1.73.247-16.1 7.92-14.1 17.3 1.98 9.4 10.9 12.4 16.6 13.4 5.69.989 15.3-4.95 16.6-11.9"/><path class="letter" d="M323 170s2.72-18.8 5.94-18.1c3.22.742 4.7 12.4 6.18 12.9 1.48.495 7.92-10.1 9.89-9.89 1.98.247 5.94 16.8 5.94 16.8"/><path class="letter" d="M356 164s3.22 3.46 7.17.989c3.96-2.47 7.17-8.91 6.93-9.89-.247-.989-2.97-1.73-4.95-.989-1.98.742-7.67 3.46-6.68 8.66.989 5.19 7.17 13.4 15.6 12.9 8.41-.495 14.8-7.42 14.8-7.42"/><path class="letter" d="M416 153s6.93 19.5 8.41 20c1.48.495 11.9-17.6 12.1-30.7"/><path class="letter" d="M446 150c-12.4.247-10.1 11.6-10.1 12.6 0 .989 1.73 10.1 9.65 10.4 7.92.247 11.6-8.41 11.4-11.1-.247-2.72-1.73-11.4-8.16-11.9"/><path class="letter" d="M461 173s1.48-20.8 3.71-20.5c2.23.247 7.17 11.1 8.66 11.4 1.48.247 6.68-9.15 8.91-8.16 2.23.989 9.89 20.5 9.89 20.5"/><path class="letter" d="M496 151s3.22 6.18 3.46 9.4c.247 3.22 0 8.41 0 8.41"/><path class="letter" d="M495 137l1.48 5.44"/><path class="letter" d="M497 123s3.46 1.48 4.95 3.22c1.48 1.73 17.1 50.7 17.1 50.7"/><path class="letter" d="M521 152s-12.4 6.93-14.1 6.93"/><path class="letter" d="M553 125s-2.47 23-1.24 28.4c1.24 5.44 5.69 16.3 13.1 14.8 7.42-1.48 10.4-8.16 9.4-11.9-.989-3.71-3.46-7.17-9.89-6.43-6.43.742-10.4 2.47-10.4 2.47"/><path class="letter" d="M577 122s2.72 26.7 8.91 41.1"/><path class="letter" d="M600 144s-9.15.495-8.16 5.94c.989 5.44 7.92 13.6 13.4 13.6 5.44 0 8.91-7.42 7.92-9.65-.989-2.23-4.21-7.42-5.69-7.67"/><path class="letter" d="M625 145s-3.22-2.23-4.95-1.73c-1.73.495-7.42 3.22-6.93 9.65.495 6.43 9.15 12.6 12.4 12.9 3.22.247 11.6-1.98 11.1-8.66-.495-6.68-3.96-9.65-6.68-12.1"/><path class="letter" d="M652 146s-15.1 1.73-14.1 11.1c.989 9.4 8.41 7.67 8.41 7.67s15.6-4.53 12.1-34.4c-1.24-10.6-4.7-15.8-6.68-15.1-1.98.742-1.98 26.2 22.8 45.3"/><path class="letter" d="M676 99.8s6.68 38.3 9.15 42.8"/><path class="letter" d="M689 158l.742 3.96"/><path class="bubble" d="M296 149s-39.6 32.9-60.4 37.4c-.989.495 55.2-6.93 73.2 4.95"/><path class="bubble" d="m307,190s-0.968,12.2,33.9,20.3c34.9,8.16,92.8,11.6,129,11.1,36.4-0.495,138-4.7,162-7.92,24.5-3.22,58.9,2.97,75-21s5.4-69.8,5.4-69.8-15-78.2-34.3-87.6c-5.44-3.22-115-7.42-142-7.42-27.7,0-111,0.495-111,0.495s-58.6-5.69-92.8,17.3c-34.1,23-36.9,105-36.9,105"/><path d="M69.8 211s-19.1-37.6-21.2-61.2c-2.12-23.5 6.18-67.7 42.5-67.6 36.3.193 57.9 41.5 60.6 47.1.579 1.16 19.1-38.4 42.1-38 13.5.386 25.5 23.5 25.5 23.5s-2.35-99.9-101-105c-74.1-3.67-97.1 83.2-97.1 83.2s-18.7 16.6-19.3 26.1c-.579 9.46 1.93 27.6 3.86 33.8 1.93 6.18 12.2 29 13.9 30.3 1.74 1.35 11.2 5.02 15.1 5.79 3.86.772 12 .965 12 .965l20.7 18.3"/><path d="M22.1 95s21.8 24.1 23.9 48.1c2.12 23.9 0 45.7 0 45.7"/><path d="M72.1 214l5.02-.965s-17.9-38-19.9-66.8c-1.93-28.8 12.5-56.2 34.2-55 21.6 1.16 46.3 17 53.8 41.7.772.386 6.37-2.32 6.37-2.32"/><path d="M162 116s17.4-20.5 30.7-17.4c13.3 3.09 11.6 6.76 11.6 6.76l-8.3 52.1s4.63 2.7 5.98 7.33l1.93 9.26s14.5-24.7 14.7-35.5c.193-10.8 1.35-19.3.965-21.6"/><path d="M204 177s-1.74 13.7-3.47 17.8c-1.74 4.05-18.3 28.2-24.9 33.2-6.56 5.02-22.8 24.9-34 25.3-11.2.386-30.9-9.84-39.4-15.2-8.49-5.4-29.3-22.6-29.3-22.6"/><path d="M220 107s15.1 15.2 7.72 43.8c-7.33 28.6-8.11 30.3-10.6 32.4-2.51 2.12-14.1 10-14.1 10"/><path d="M67.1 125s6.95-14.7 19.9-15.6c22.2-1.35 16 5.79 25.1 7.33 9.07 1.54 8.49 0 8.49 0s-7.91-1.16-15.6-10.2c-7.72-9.07-17.9-7.72-21-7.33-3.09.386-17.8 7.33-17.2 23.5"/><path d="M165 117s12.9-9.07 18.5-8.49c5.6.579 11.2 6.37 11.2 6.37s-6.76-12.4-10-13.1c-3.28-.772-3.09 0-3.09 0"/><path d="M132 228s6.18 4.63 11.8 4.83c5.6.193 9.07-4.44 9.07-4.44"/><path d="M75.4 17.4s15.8-15.8 22-16c6.18-.193 41.7 0 44.4 2.12l5.79 10.4"/><path d="M122 30.2s-1.16 18.7 2.51 22.4c3.67 3.67 17.9 16.6 26.6 15.6 8.69-.965 11.8-23.9 11.6-26.6-.193-2.7-12-27.4-27.2-24.9-15.2 2.51-13.3 11.2-13.3 11.2"/></svg></div>

<p class="no-svg-support">There's a demo you're missing here because JavaScript or inline SVG isn't available.</p>

<script>
(function() {
  if (!supportsInlineSvg) return;

  function toArray(arr) {
    return Array.prototype.slice.call(arr);
  }

  var svg = document.querySelector('.full-sketch-container svg');
  svg.parentNode.style.display = 'block';
  svg.style.visibility = 'hidden';

  function fullSketch() {
    svg.style.visibility = '';
    var paths = toArray(svg.querySelectorAll('path:not(.shade)'));
    paths.push(svg.querySelector('.shade'));
    var begin = 0;

    var durations = paths.map(function(path) {
      var length = path.getTotalLength();
      var className = path.getAttribute('class') || '';

      path.style.strokeDasharray = length + ' ' + length;
      path.style.strokeDashoffset = length;

      // no classList on svg elements in Safari :(
      if (className.indexOf('shade') != -1) {
        return 5;
      }
      else if (className.indexOf('letter') != -1) {
        return Math.pow(length, 0.5) * 0.02;
      }
      else {
        return Math.pow(length, 0.5) * 0.03;
      }
    });

    // triggering a reflow so styles are calculated in their
    // start position, so they animate from here
    paths[0].getBoundingClientRect();

    paths.forEach(function(path, i) {
      path.style.transition = path.style.WebkitTransition = 'stroke-dashoffset ' + durations[i] + 's ' + begin + 's ease-in-out';
      path.style.strokeDashoffset = '0';
      begin += durations[i] + 0.1;
    });
  }

  window.addEventListener('load', fullSketch);
}());
</script>

I like using diagrams as a way of showing information flow or browser behaviour, but large diagrams can be daunting at first glance. When I gave talks about [the Application Cache](http://www.dailymotion.com/video/xwsc3y_application-cache-by-jake-archibald_tech) and [rendering performance](http://vimeo.com/69385032) I started with a blank screen and made the diagrams appear to [draw themselves bit by bit](http://vimeo.com/69385032#t=4m15s) as I described the process. Here's how it's done:

# Paths in SVG

Paths in SVG are defined in a format that competes with regex in terms of illegibility:

```html
<path
  fill="none"
  stroke="deeppink"
  stroke-width="14"
  stroke-miterlimit="0"
  d="M11.6 269s-19.7-42.4 6.06-68.2 48.5-6.06 59.1 12.1l-3.03 28.8 209-227s45.5-21.2 60.6 1.52c15.2 22.7-3.03 47-3.03 47l-225 229s33.1-12 48.5 7.58c50 63.6-50 97-62.1 37.9"
/>
```

I use [Inkscape](http://inkscape.org/) to create the non-human-readable bits of SVG. It's a tad clunky, but it gives you an SVG DOM view as you edit the document, rather than using its own format and only offering SVG as an export format like Adobe Illustrator.

Each part of the `d` attribute is telling the renderer to move to a particular point, start a line, draw a Bézier curve to another point, etc etc.

The prospect of animating this data so the line progressively draws is, well, terrifying. Thankfully we can cheat. Along with things like colour & width, you can make an SVG path dashed and control the offset of the dash:

<div class="squiggle-container squiggle-interactive"><svg xmlns="http://www.w3.org/2000/svg" height="98" width="581" viewbox="0 0 581 98"><path d="M62.9 14.9c-25-7.74-56.6 4.8-60.4 24.3-3.73 19.6 21.6 35 39.6 37.6 42.8 6.2 72.9-53.4 116-58.9 65-18.2 191 101 215 28.8 5-16.7-7-49.1-34-44-34 11.5-31 46.5-14 69.3 9.38 12.6 24.2 20.6 39.8 22.9 91.4 9.05 102-98.9 176-86.7 18.8 3.81 33 17.3 36.7 34.6 2.01 10.2.124 21.1-5.18 30.1" stroke="#000" stroke-width="4.3" fill="none"/></svg></div>

```html
<path
  stroke="#000"
  stroke-width="4.3"
  fill="none"
  d="…"
  stroke-dasharray="0"
  stroke-dashoffset="0"
/>
```

<div class="form-rows squiggle-sliders"><div class="form-rows-inner">
  <div class="field">
    <label for="array-input" class="label">dasharray:</label>
    <div class="input"><input id="array-input" type="range" min="0" max="1" step="any" value="0"></div>
  </div>
  <div class="field">
    <label for="offset-input" class="label">dashoffset:</label>
    <div class="input"><input id="offset-input" type="range" min="0" max="1" step="any" value="0"></div>
  </div>
</div></div>

<p class="no-range-svg-support">There's a demo you're missing here because JavaScript, inline SVG or <code>input[type=range]</code> isn't available.</p>

<script>
// line and controls
(function() {
  if (!supportsInlineSvg || !supportsInputRange) return;
  document.querySelector('.squiggle-sliders').style.display = 'block';
  var squiggleContainer = document.querySelector('.squiggle-interactive');
  var path = squiggleContainer.querySelector('path');
  var pathLen = path.getTotalLength();
  var squiggleCode = (function() {
    var code = squiggleContainer;
    do {
      code = code.nextSibling
    } while (!code.classList || !code.classList.contains('code-example'));
    return code;
  }());
  // this is brittle, but fuck it
  const nodeIterator = document.createNodeIterator(squiggleCode, NodeFilter.SHOW_TEXT, {
    acceptNode: node => node.nodeValue === '0',
  });
  var dasharrayCode = nodeIterator.nextNode();
  var dashoffsetCode = nodeIterator.nextNode();

  function updateCode(dasharray, dashoffset) {
    dasharrayCode.nodeValue = dasharray;
    dashoffsetCode.nodeValue = dashoffset;
  }
  function updateSvg(dasharray, dashoffset) {
    path.setAttribute('stroke-dasharray', dasharray);
    path.setAttribute('stroke-dashoffset', dashoffset);
  }

  var arraySlider = document.querySelector('#array-input');
  var offsetSlider = document.querySelector('#offset-input');

  function change() {
    var arrayVal = (Math.pow(arraySlider.value, 2) * pathLen);
    var array = '';

    if (arrayVal && arrayVal < 1) {
      // avoiding numbers less than 1, can take ages to render
      arrayVal = 1;
    }

    if (arrayVal > 0) {
      arrayVal = arrayVal.toFixed(2);
      array = arrayVal + " " + arrayVal;
    }

    var offset = (offsetSlider.value * pathLen).toFixed(2);
    updateSvg(array, offset);
    updateCode(array, offset);
  }

  if ('oninput' in arraySlider) {
    arraySlider.oninput = change;
    offsetSlider.oninput = change;
  }
  else {
    arraySlider.onchange = change;
    offsetSlider.onchange = change;
  }

  change();
}());
</script>

`stroke-dasharray` lets you specify the length of the rendered part of the line, then the length of the gap. `stroke-dashoffset` lets you change where the dasharray starts.

Drag both sliders up to their maximum, then slowly decrease the dashoffset. Voilà, you just made the line draw! 988.01 roughly the length of the line which you can get from the DOM:

```javascript
var path = document.querySelector('.squiggle-container path');
path.getTotalLength(); // 988.0062255859375
```

# Animating it

The easiest way to animate SVG is using CSS animations or transitions. The downside is it doesn't work in IE, if you want IE support you'll need to use [`requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/window.requestAnimationFrame) and update the values frame by frame with script.

Avoid using SMIL, it also [isn't supported in IE](http://caniuse.com/#feat=svg-smil) and doesn't perform well in Chrome & Safari (I'll do a separate post on this).

I'm going to use CSS transitions, so the demos won't work in IE. Unfortunately I couldn't come up with a solid feature detect for transitions on SVG elements, IE has all the properties, it just doesn't work.

In the first example I used SVG attributes to define the dash, but you can do the same thing in CSS. Most [SVG presentational attributes have identical CSS properties](http://www.w3.org/TR/SVG/styling.html).

```javascript
var path = document.querySelector('.squiggle-animated path');
var length = path.getTotalLength();
// Clear any previous transition
path.style.transition = path.style.WebkitTransition = 'none';
// Set up the starting positions
path.style.strokeDasharray = length + ' ' + length;
path.style.strokeDashoffset = length;
// Trigger a layout so styles are calculated & the browser
// picks up the starting position before animating
path.getBoundingClientRect();
// Define our transition
path.style.transition = path.style.WebkitTransition =
  'stroke-dashoffset 2s ease-in-out';
// Go!
path.style.strokeDashoffset = '0';
```

<div class="squiggle-container squiggle-animated"><svg xmlns="http://www.w3.org/2000/svg" height="98" width="581" viewbox="0 0 581 98"><path d="M62.9 14.9c-25-7.74-56.6 4.8-60.4 24.3-3.73 19.6 21.6 35 39.6 37.6 42.8 6.2 72.9-53.4 116-58.9 65-18.2 191 101 215 28.8 5-16.7-7-49.1-34-44-34 11.5-31 46.5-14 69.3 9.38 12.6 24.2 20.6 39.8 22.9 91.4 9.05 102-98.9 176-86.7 18.8 3.81 33 17.3 36.7 34.6 2.01 10.2.124 21.1-5.18 30.1" stroke="#000" stroke-width="4.3" fill="none"/></svg></div>

<button class="squiggle-go btn">Make it so!</button>

<p class="no-svg-support">There's a demo you're missing here because JavaScript or inline SVG isn't available.</p>

<script>
(function() {
  if (!supportsInlineSvg) return;
  var code = document.querySelectorAll('.code-example');
  var button = document.querySelector('.squiggle-go');
  code = code[code.length-1].textContent;

  button.style.display = 'inline';
  button.onclick = function(event) {
    // muhahaha
    eval(code);
    event.preventDefault();
  };
}());
</script>

Using `getBoundingClientRect` to trigger layout is a bit of a hack, but it works. Unfortunately, if you modify a style twice in the same JavaScript execution without forcing a synchronous layout inbetween, only the last one counts. I wrote about this issue in more detail & how the Web Animations API will save the day over at [Smashing Magazine](http://coding.smashingmagazine.com/2013/03/04/animating-web-gonna-need-bigger-api/).

I usually trigger a layout by accessing `offsetWidth`, but that doesn't appear to work on SVG elements in Firefox.

# More fun with dashes

[Lea Verou](http://lea.verou.me/) used a similar technique to [create a loading spinner](http://dabblet.com/gist/6089395) similar to Chrome's. [Josh Matz](https://twitter.com/joshmatz) and [El Yosh](https://twitter.com/El_Yosh) expanded on this to create [this funky cube animation](http://dabblet.com/gist/6089409).

So far we've been using `stroke-dasharray` to create a bit of line followed by a gap, but you can create more complex patterns by adding more numbers. For instance, here's Justin Bieber's autograph, where the line is morse code for "Christ our saviour":

<div class="jb-container"><svg xmlns="http://www.w3.org/2000/svg" height="837" width="1100" viewBox="0 0 1100 837"><path d="M556 505l-12.1 18.1m195-334l-12.1 20.1m-194 340s-33.2 29.9-33.2 56.7c0 26.7 11.8 31 17.1 31 5.35 0 19.3 11.8 75.9-69.5 56.7-81.3 33.2-64.2 33.2-64.2s-26.7 7.49-29.9 52.4c-3.21 44.9 1.07 54.6 32.1 55.6 31 1.07 69.5 0 154-110s77-190 71.7-193c-5.35-2.14-29.9 3.21-78.1 110-48.1 107-42.8 159-33.2 162 9.63 2.14 34.2-11.8 56.7-44.9 22.5-33.2 28.9-50.3 22.5-50.3-6.42 0-25.7 5.35-29.9 21.4-4.28 16 1.07 23.5 7.49 26.7 6.42 3.21 44.9-15 64.2-33.2s43.9-56.7 39.6-58.8c-4.28-2.14-18.2 16-20.3 27.8-2.14 11.8-5.35 39.6 32.1 43.9 37.4 4.28 83.4-39.6 112-75.9 28.9-36.4 38.5-69.5 26.7-72.7-11.8-3.21-32.1 22.5-36.4 42.8-4.28 20.3-28.7 97.2 34.2 108 31 5.35 50.3-37.4 50.3-37.4m-847-8.56s96.3-40.6 137-37.4c40.6 3.21 61 11.8 59.9 33.2-1.07 21.4-53.5 44.9-176 50.3 0-1.07 121 8.56 153 42.8 32.1 34.2 46 89.8-15 185s-143 93.1-154 92c-10.7-1.07-73.8-18.2-71.7-101 2.14-82.4 110-155 170-156 59.9-1.07 56.7 9.63 56.7 9.63m-90-153s-52.4 137-111 276m544-561s-95.2 21.4-132 21.4m-126 162s175-125 221-264c5.35-16-130 246-112 249 18.2 3.21 99.5-82.4 108-82.4 8.56 0-56.7 82.4-39.6 83.4 17.1 1.07 125-113 127-112 2.14 1.07-41.7 107-33.2 112 8.56 5.35 125-119 125-119s-36.3 117 39.6 129c40.6 6.42 54.6-13.9 54.6-13.9m-987 135s10.7 29.7 39.6 31c97 5 313-347 334-482-84 360-259 710-346 705-31.8-2 19.6-109 68.1-205 45.3-89.4 83.8-177 113-175 30 2.29-10.7 116 15 119 25.7 3.21 127-140 134-160 3.21-6.42-37.4 114-31 116 6.42 1.07 117-150 124-139 7.49 10.7-16 81.3 9.63 90.9 25.7 9.63 92-129 78.1-148-13.9-18.2-88.8 169-118 165-28.9-4.28 34.2-107 34.2-107" stroke="#000" stroke-linecap="round" stroke-dasharray="10 10 1 10 10 10 1 20 1 10 1 10 1 10 1 20 1 10 10 10 1 20 1 10 1 20 1 10 1 10 1 20 10 30 10 10 10 10 10 20 1 10 1 10 10 20 1 10 10 10 1 30 1 10 1 10 1 20 1 10 10 20 1 10" stroke-width="5" fill="none"/></svg></div>

# Further reading

- [`visibility: visible` undoes a parent element's `visibility: hidden`](/2014/visible-undoes-hidden/)
- [Don't use flexbox for overall page layout](/2014/dont-use-flexbox-for-page-layout/)
