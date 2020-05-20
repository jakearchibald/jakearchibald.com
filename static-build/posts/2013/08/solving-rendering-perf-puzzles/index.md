---
title: Solving rendering performance puzzles
date: 2013-08-05 14:44:32
summary: "The Chrome team are often asked to show the process of debugging a
  performance issue, including how to select tools and interpret results. Well,
  I was recently hit by an issue that required a bit of digging, here's what I
  did:"
mindframe: despite a hangover
image: null
meta: ''
---

<style>
  .curved-text {
    position: relative;
    padding-top: 97.8%;
  }
  .svg-demo {
    padding: 10px;
    background: #f3f3f3;
    border: 1px dotted #BDBDBD;
    position: relative;
  }
  .svg-demo .btn {
    position: absolute;
    left: 10px;
    top: 10px;
  }
  .wobbly-text {
    position: relative;
    padding-top: 17.55%;
    margin: 1em auto;
  }
  .curved-text svg,
  .wobbly-text svg {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  .toggler {
    cursor: pointer;
  }
  .toggler.on {
     color: green;
     fill: green;
   }
  .inline-svg .no-svg-support,
  .slow-line-anim,
  .slow-line-anim-stop,
  .tspans-line-anim,
  .tspans-line-anim-stop,
  .fast-line-anim,
  .fast-line-anim-stop,
  .go-fixed,
  .go-textpath,
  .make-browser-bleed  {
    display: none;
  }
  .curved-text.slow,
  .curved-text.tspan {
    visibility: hidden;
  }
  .critical-path {
    position: relative;
  }
  .critical-bubble {
    position: absolute;
    width: 100%;
  }
  .critical-bubble img {
    width: 307px;
    margin-top: 16px;
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

  window.requestAnimationFrame = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame;
</script>

<p class="no-svg-support">You're missing demos in this post because JavaScript or inline SVG isn't available.</p>

The Chrome team are often asked to show the process of debugging a performance issue, including how to select tools and interpret results. Well, I was recently hit by an issue that required a bit of digging, here's what I did:

# Layout ate my performance

I wanted to show a quick demo of text on a path in SVG, then animate it appearing character by character. Although we're dealing with SVG, the process of finding and fixing the issues isn't SVG-specific.

<div class="svg-demo"><div class="curved-text slow"><svg viewBox="0 0 548 536"><defs><path id="a" d="M546 276c-2-150-128-275-279-272-146 2.39-268 125-265 272 2.38 142 122 261 265 258 139-2 254-119 251-258-2-135-116-247-251-244-131 2.4-240 112-237 244 2.4 127 109 233 237 230 123-2 226-106 223-230-2-120-103-219-223-216-116 2.4-212 100-210 216 2.4 112 97.5 205 210 203 108-3 198-94 196-203-3-104-91-191-196-188-101 2.3-184 87.5-182 188 2.4 97 84.6 177 182 175 93-3 170-82 168-175-3-89-78-163-168-161-85 3-156 75-154 161 3 81 72 149 154 147 78-3 142-69 140-147-3-74-66-135-140-133-70 3-128 62-126 133 3 66 59 121 126 119 62-3 114-56 112-119-3-59-53-107-112-105-54.9 2.33-100 49.3-97.8 105 2.32 51.1 46.1 93.3 97.8 90.8 47.3-2.31 86.3-42.9 83.8-90.8-3-43-40-79-84-77-39.7 2.29-72.4 36.6-69.8 76.8 2.28 35.8 33.4 65.4 69.8 62.8 32-2.27 58.5-30.2 55.9-62.8-2-28-27-51-56-49-24.4 2.22-44.5 23.9-41.9 48.9 2.19 20.6 20.7 37.6 41.9 34.9 16.8-2.14 30.7-17.5 27.9-34.9-2-13-14-24-28-21-9.23 1.96-17 11.3-14 20.9 1.72 5.41 8.35 10.6 14 6.98 2.07-1.32 4.2-6.98 0-6.98"/></defs><text font-size="13" font-family="sans-serif"><textPath xlink:href="#a" class="text-spiral">It's a heart breaker, she's a heartbreaker. Tell your friends that that girl is a heartbreaker. Don't go near her. She's a male undefined species. She hunts for him, just to get a whiff of his fame. I can't take it. Tell'em she's a heartbreaker. Oh, she's telling me to get it. But, girl I don't want it. I don't want you no more. That's why I'm saying. I can't take it no more. All these paps. all these girls. knocking on my door. Heartbreaker, you didn't get the best of me. I hope you're happy now. You made me cry, but do you know the real reason why? girl. It's a heart breaker, she's a heartbreaker. Tell your friends that that girl is a heartbreaker. Don't go near her. She's a male undefined species. She hunts for him, just to get a whiff of his fame. I can't take it. Tell'em she's a heartbreaker. It's a heart breaker, she's a heartbreaker. Tell your friends that that girl is a heartbreaker. Don't go near her. She's a male undefined species. She hunts for him, just to get a whiff of his fame. I can't take it. Tell'em she's a heartbreaker. It's a heart breaker, she's a heartbreaker. Tell your friends that that girl is a heartbreaker. Don't go near her. She's a male undefined species. She hunts for him, just to get a whiff of his fame. I can't take it. Tell'em she's a heartbreaker. Oh, she's telling me to get it. But, girl I don't want it. I don't want you no more. That's why I'm saying. I can't take it no more. All these paps. all these girls. knocking on my door. Heartbreaker, you didn't get the best of me.</textPath></text></svg></div><button class="btn slow-line-anim">Bring joy to my eyes!</button> <button class="btn slow-line-anim-stop">Argh, that's not joy! Make it stop!</button></div>

<script>
(function() {
  if (!supportsInlineSvg) return;
  var container = document.querySelector('.curved-text.slow');
  var startButton = document.querySelector('.slow-line-anim');
  var stopButton = document.querySelector('.slow-line-anim-stop');
  var loopyTextPath = document.querySelector('.text-spiral');
  var fullText = loopyTextPath.textContent;
  var charsShown;
  var play;

  startButton.style.display = 'inline';

  function frame() {
    if (!play) {
      end();
      return;
    }
    loopyTextPath.textContent = fullText.slice(0, charsShown);
    charsShown++;
    if (charsShown >= fullText.length) {
      play = false;
    }
    requestAnimationFrame(frame);
  }

  function end() {
    startButton.style.display = 'inline';
    stopButton.style.display = 'none';
  }

  startButton.onclick = function(event) {
    charsShown = 0;
    play = true;
    startButton.style.display = 'none';
    stopButton.style.display = 'inline';
    container.style.visibility = 'visible';
    requestAnimationFrame(frame);
    event.preventDefault();
  };

  stopButton.onclick = function(event) {
    play = false;
    event.preventDefault();
  }
}());
</script>

As the animation continues it gets slower and slower. I opened up Chrome Devtools and made a [timeline recording](https://developers.google.com/chrome-developer-tools/docs/timeline):

<figure class="full-figure">
<img alt="" src="asset-url:./timeline2.png">
<figcaption>Layout costs increasing over time</figcaption>
</figure>

The animation starts at a healthy 60fps, then falls to 30, 20, 15, 12, 10 and so on. When we look at an individual frame we can see the slowness is all to do with layout.

To render web content the browser first parses the markup, then performs "Recalculate style" to determine which styles apply to each element after the CSS cascade, style attributes, presentational attributes, default styles etc etc. Once this is complete, the browser performs a "Layout" to determine how these styles interact to give each element their final x, y, width and height. At some point later, the browser will "paint" to create pixel data for an area of the document, then finally "composite" to combine parts that were drawn separately. You'll see all these events (and more) fly past in Chrome Devtools' timeline. It's pretty rare for the critical path to be majorly disturbed by layout, but that's what's happening here.

<figure class="full-figure critical-path">
<div class="critical-bubble"><img alt="You layout too much and smell of old biscuits" src="asset-url:./critical1.png"></div>
<img alt="" src="asset-url:./path.jpg">
<figcaption>The critical path</figcaption>
</figure>

So why is layout having a tantrum? Let's look at the code:

## SVG

```html
<svg viewBox="0 0 548 536">
  <defs><path id="a" d="…" /></defs>
  <text font-size="13" font-family="sans-serif">
    <textPath xlink:href="#a" class="text-spiral">
      It's a heart breaker…
    </textPath>
  </text>
</svg>
```

## JavaScript

```js
var spiralTextPath = document.querySelector('.text-spiral');
var fullText = spiralTextPath.textContent;
var charsShown = 0;

function frame() {
  spiralTextPath.textContent = fullText.slice(0, charsShown);
  charsShown++;
  // continue the anim if we've got chars left to show
  if (charsShown != fullText.length) {
    window.requestAnimationFrame(frame);
  }
}

// start the animation
window.requestAnimationFrame(frame);
```

Each frame we're changing the value of `textContent` to include an extra character than the frame before. Because we're replacing the whole text content every frame, the browser lays out every letter despite most of the letters being the same as the frame before. So, as we get more letters, layout takes longer.

**Update:** As [pointed out by Mathias Bynens](https://twitter.com/mathias/status/364384965259456512), `.slice` isn't a safe way to split a string if it contains chars from the [astral plane](<http://en.wikipedia.org/wiki/Plane_(Unicode)>). Thankfully Justin Bieber thinks an astral plane is a space shuttle so it's ok. But if you're dealing with a string containing unicode surrogates, [MDN has a workaround](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/charAt#Example_2.3A_Getting_whole_characters).

# Avoiding multiple layouts

Before we animate the text, let's wrap each character in it's own `tspan` (much like HTML's `span`). Then we can show each `tspan` frame-by-frame rather than replacing the whole text every frame.

Using the same SVG as before, we change our JavaScript to:

```js
var spiralTextPath = document.querySelector('.text-spiral');
var fullText = spiralTextPath.textContent;

// empty the text path, we're going to rebuild it
spiralTextPath.textContent = '';

// loop over every char, creating a tspan for each
var tspans = fullText.split('').map(function (char) {
  // I love having to use namespaces to create svg
  // elements, it's my FAVOURITE part of the API
  var tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
  tspan.textContent = char;
  // hide the element, we don't want to show it yet
  tspan.style.visibility = 'hidden';
  // add it to the text path
  spiralTextPath.appendChild(tspan);
  return tspan;
});

// and now the animation
var charsShown = 0;

function frame() {
  // show a char
  tspans[charsShown].style.visibility = 'visible';
  charsShown++;
  if (charsShown != tspans.length) {
    window.requestAnimationFrame(frame);
  }
}

window.requestAnimationFrame(frame);
```

**Update:** For the same reasons as `str.slice()`, `str.split('')` fails on strings containing unicode surrogates.

Unlike `display: none`, elements with `visibility: hidden` retain their size and position in the document. This means changing their visibility has no impact on layout, only painting. Job done.

<div class="svg-demo"><div class="curved-text tspans"><svg viewBox="0 0 548 536"><defs><path id="b" d="M546 276c-2-150-128-275-279-272-146 2.39-268 125-265 272 2.38 142 122 261 265 258 139-2 254-119 251-258-2-135-116-247-251-244-131 2.4-240 112-237 244 2.4 127 109 233 237 230 123-2 226-106 223-230-2-120-103-219-223-216-116 2.4-212 100-210 216 2.4 112 97.5 205 210 203 108-3 198-94 196-203-3-104-91-191-196-188-101 2.3-184 87.5-182 188 2.4 97 84.6 177 182 175 93-3 170-82 168-175-3-89-78-163-168-161-85 3-156 75-154 161 3 81 72 149 154 147 78-3 142-69 140-147-3-74-66-135-140-133-70 3-128 62-126 133 3 66 59 121 126 119 62-3 114-56 112-119-3-59-53-107-112-105-54.9 2.33-100 49.3-97.8 105 2.32 51.1 46.1 93.3 97.8 90.8 47.3-2.31 86.3-42.9 83.8-90.8-3-43-40-79-84-77-39.7 2.29-72.4 36.6-69.8 76.8 2.28 35.8 33.4 65.4 69.8 62.8 32-2.27 58.5-30.2 55.9-62.8-2-28-27-51-56-49-24.4 2.22-44.5 23.9-41.9 48.9 2.19 20.6 20.7 37.6 41.9 34.9 16.8-2.14 30.7-17.5 27.9-34.9-2-13-14-24-28-21-9.23 1.96-17 11.3-14 20.9 1.72 5.41 8.35 10.6 14 6.98 2.07-1.32 4.2-6.98 0-6.98"/></defs><text font-size="13" font-family="sans-serif"><textPath xlink:href="#b" class="text-spiral-tspans">It's a heart breaker, she's a heartbreaker. Tell your friends that that girl is a heartbreaker. Don't go near her. She's a male undefined species. She hunts for him, just to get a whiff of his fame. I can't take it. Tell'em she's a heartbreaker. Oh, she's telling me to get it. But, girl I don't want it. I don't want you no more. That's why I'm saying. I can't take it no more. All these paps. all these girls. knocking on my door. Heartbreaker, you didn't get the best of me. I hope you're happy now. You made me cry, but do you know the real reason why? girl. It's a heart breaker, she's a heartbreaker. Tell your friends that that girl is a heartbreaker. Don't go near her. She's a male undefined species. She hunts for him, just to get a whiff of his fame. I can't take it. Tell'em she's a heartbreaker. It's a heart breaker, she's a heartbreaker. Tell your friends that that girl is a heartbreaker. Don't go near her. She's a male undefined species. She hunts for him, just to get a whiff of his fame. I can't take it. Tell'em she's a heartbreaker. It's a heart breaker, she's a heartbreaker. Tell your friends that that girl is a heartbreaker. Don't go near her. She's a male undefined species. She hunts for him, just to get a whiff of his fame. I can't take it. Tell'em she's a heartbreaker. Oh, she's telling me to get it. But, girl I don't want it. I don't want you no more. That's why I'm saying. I can't take it no more. All these paps. all these girls. knocking on my door. Heartbreaker, you didn't get the best of me.</textPath></text></svg></div><button class="btn tspans-line-anim">Hurrah! We've fixed it!</button> <button class="btn tspans-line-anim-stop">Wait, no we haven't, wtf, stop!</button></div>

<p class="no-svg-support">You're missing a demo here because JavaScript or inline SVG isn't available.</p>

<script>
(function() {
  if (!supportsInlineSvg) return;
  var container = document.querySelector('.curved-text.tspans');
  var startButton = document.querySelector('.tspans-line-anim');
  var stopButton = document.querySelector('.tspans-line-anim-stop');
  var loopyTextPath = document.querySelector('.text-spiral-tspans');
  var fullText = loopyTextPath.textContent;
  var charsShown;
  var play;

  startButton.style.display = 'inline';

  function frame() {
    if (!play) {
      end();
      return;
    }
    tspans[charsShown].style.visibility = 'visible';
    charsShown++;
    if (charsShown >= fullText.length) {
      play = false;
    }
    requestAnimationFrame(frame);
  }

  function end() {
    startButton.style.display = 'inline';
    stopButton.style.display = 'none';
  }

  loopyTextPath.textContent = '';

  var tspans = fullText.split('').map(function(char) {
    var tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
    tspan.textContent = char;
    tspan.style.visibility = 'hidden';
    loopyTextPath.appendChild(tspan);
    return tspan;
  });

  startButton.onclick = function(event) {
    charsShown = 0;
    play = true;
    startButton.style.display = 'none';
    stopButton.style.display = 'inline';
    container.style.visibility = 'visible';
    requestAnimationFrame(frame);
    event.preventDefault();
  };

  stopButton.onclick = function(event) {
    play = false;
    event.preventDefault();
  }
}());
</script>

I was really hoping to finish this blog post here. I mean, we've definitely improved things in Chrome, but it's still getting slower as the animation continues. Also, the performance in Firefox and IE has dropped significantly. I have no idea where Firefox is losing speed because it doesn't have a timeline tool like other browsers (c'mon Firefox, we need this).

Anyway, what's the timeline showing now?

<figure class="full-figure">
<img alt="" src="asset-url:./timeline3.png">
<figcaption>Increasing gap between paint & composite</figcaption>
</figure>

We've lost the huge layout cost, but something is still increasing over time. The timeline is being extremely unhelpful here. Nothing's taking long, but there's an increasing gap between painting and compositing. In fact, looking back at the first timeline recording, the issue is there too, I missed it because I got distracted by the huge layouts.

So, something else is getting in the way of pixels hitting the screen. Time to bring out the big guns.

# About about:tracing

Chrome has a lower-level timeline tool hidden in about:tracing. Let's use that to identify the cause.

<figure class="full-figure">
<div class="video"><iframe src="//www.youtube.com/embed/HXrnaZOdNxA?rel=0&amp;html5=1" frameborder="0" allowfullscreen></iframe></div>
<figcaption>Debugging with about:tracing</figcaption>
</figure>

**TL;DW:** about:tracing shows the majority of each frame to be taken up by calls to [Skia](https://code.google.com/p/skia/), the drawing API used by Chrome. This tells us the slowdown is paint-related. Turning on paint rectangles reveals the whole SVG canvas appears to be redrawn on each frame.

I'm a good web citizen, so I opened a ticket about the [lack of SVG paint tracking in devtools](https://code.google.com/p/chromium/issues/detail?id=267473). Turns out this is a regression in Chrome Canary, the stable version of Chrome gets it right and shows increasing paints. If only I'd checked there first, I wouldn't have needed to throw myself into the scary lands of about:tracing.

The critical path is happy with layout, but it's awfully concerned with all the painting.

<figure class="full-figure critical-path">
<div class="critical-bubble"><img alt="You layout too much and smell of old biscuits" src="asset-url:./critical2.png"></div>
<img alt="" src="asset-url:./path.jpg">
<figcaption>The critical path, again</figcaption>
</figure>

# When does SVG redraw?

I've seen enough complex SVG examples to know Chrome's renderer isn't always that dumb. It usually only repaints the updated area. Let's experiment with updating various elements:

<div class="toggle-test">
<svg height="86" width="221" class="redraw-test"><style>.redraw-test text { font-size:40px; font-family: sans-serif; }</style><text y="30.391" x="0"><tspan class="toggler">Hello</tspan> <tspan class="toggler">World</tspan></text><text y="85.391" x="0" class="toggler">Hello</text><text y="85.391" x="103" class="toggler">World</text></svg>
<p style="font-size:40px;margin:0;color:#000;line-height:1.5"><span class="toggler">Hello</span> <span class="toggler">World</span></p>
</div>

<p class="no-svg-support">You're missing a demo here because JavaScript or inline SVG isn't available.</p>

<script>
(function() {
  if (!supportsInlineSvg) return;
  document.querySelector('.toggle-test').addEventListener('click', function(event) {
    var el = event.target;
    var prop;
    if (el.getAttribute('class').indexOf('toggler') != -1) {
      if (el.getAttribute('class').indexOf('on') != -1) {
        el.setAttribute('class', 'toggler');
      }
      else {
        el.setAttribute('class', 'toggler on');
      }
      event.preventDefault();
    }
  });
}())
</script>

Turn on "Show paint rectangles" and click the words above. The first "Hello World" is made of two `tspan` elements. The second is two `text` elements. The third is two HTML `span` elements.

From this we can see that updating a `tspan` causes the parent `text` to fully redraw, whereas `text` elements can update independently. HTML `span` elements also update independently. The same thing happens in Firefox & Safari (unfortunately there isn't a show-paints tool in IE), but I don't think this over-painting is required by the SVG specification. I've made a [ticket about it](https://code.google.com/p/chromium/issues/detail?id=267481), hopefully an optimisation can be made.

**Update:** Although IE11 doesn't show painted areas live, it will show the size of painted regions in its timeline. Unfortunately the Win7 platform preview of IE11 crashes when I try the timeline. Will update this when I get it working.

So there's our answer, we need to ditch the `tspan` elements and go with a `text` element per character so they can be painted independently.

# From tspan to text

Unfortunately, SVG doesn't allow `text` elements inside `textPath`. We need to get rid of the `textPath`, then position & rotate each character's `text` element into a spiral shape. Thankfully, we can automate this.

SVG gives us `text.getStartPositionOfChar(index)`, which gives us the x & y position of the character and `text.getRotationOfChar(index)` which gives us the rotation. We can use this to convert text on a path to a series of absolutely positioned `text` elements:

```js
var svg = document.querySelector('.text-on-path');
var fullText = svg.querySelector('.text-to-convert');

fullText.textContent
  .split('')
  .map(function (char, i) {
    var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    var pos = fullText.getStartPositionOfChar(i);
    var rotation = fullText.getRotationOfChar(i);
    text.setAttribute('x', pos.x);
    text.setAttribute('y', pos.y);
    text.setAttribute('rotate', rotation);
    text.textContent = char;
    return text;
  })
  .forEach(svg.appendChild.bind(svg));

// get rid of the old text
fullText.parentNode.removeChild(fullText);
```

Note that I'm looping twice, once to create all the `text` elements, and another to add them to the SVG document (using a nifty bit of function binding). This is to avoid interleaving layout-reading operations with layout-changing DOM modifications. If we interleave layout reads and writes the browser needs to relayout the SVG element on each loop, which causes major slowdown, we're talking eleventy-billion times slower. We call this [layout thrashing](http://www.html5rocks.com/en/tutorials/speed/scrolling/#toc-reflowrepaint).

Anyway, let's take some text on a path and convert it to a series of `text` elements. Clicking the button below shouldn't effect the rendering, but look at the DOM to see the difference:

<div class="wobbly-text"><svg viewBox="0 0 507 89"><defs><path id="c" d="M15.4 85.1s53-66.4 115-66.4 75.9 65.4 132 65.4c56.5 0 92.4-63.1 148-63.1 56 0 49.7 61.2 94.9 61.2"/></defs><style>.wobbly-text text { font-family: sans-serif; font-size: 30px; }</style><text><textPath xlink:href="#c">Ohh it's some wobbly text, how exciting!</textPath></text></svg></div>

<button class="btn go-fixed">Make the text fixed</button> <button class="btn go-textpath">Nah, put it back how it was</button>

<p class="no-svg-support">You're missing a demo here because JavaScript or inline SVG isn't available.</p>

<script>
(function() {
  if (!supportsInlineSvg) return;
  var goButton = document.querySelector('.go-fixed');
  var undoButton = document.querySelector('.go-textpath');
  var svg = document.querySelector('.wobbly-text svg');
  var fullText = svg.querySelector('text');
  var fixedTexts;

  goButton.style.display = 'inline';

  goButton.onclick = function(event) {
    fixedTexts = fullText.textContent.split('').map(function(char, i) {
      var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      var pos = fullText.getStartPositionOfChar(i);
      var rotation = fullText.getRotationOfChar(i);
      text.setAttribute('x', pos.x);
      text.setAttribute('y', pos.y);
      text.setAttribute('rotate', rotation);
      text.textContent = char;
      return text;
    });

    fixedTexts.forEach(svg.appendChild.bind(svg));

    svg.removeChild(fullText);
    goButton.style.display = 'none';
    undoButton.style.display = 'inline';
    event.preventDefault();
  };

  undoButton.onclick = function(event) {
    fixedTexts.forEach(svg.removeChild.bind(svg));
    svg.appendChild(fullText);
    goButton.style.display = 'inline';
    undoButton.style.display = 'none';
    event.preventDefault();
  };

}());
</script>

That feels like the answer, but unfortunately doing this for all characters in the spiral takes upwards of 20 seconds, except in IE which nails it almost instantly. The vast majority of this time is spent in calls to `getStartPositionOfChar` and `getRotationOfChar` (I've [opened a ticket to investigate this](https://code.google.com/p/chromium/issues/detail?id=267504)). If you want to benchmark your particular browser, go for it, but it may make your browser bleed out:

<button class="btn btn-danger make-browser-bleed">Make. Browser. Bleed.</button>

<p class="no-svg-support">You're missing a demo here because JavaScript or inline SVG isn't available.</p>

<script>
(function() {
  if (!supportsInlineSvg) return;
  var goButton = document.querySelector('.make-browser-bleed');
  var svg = document.querySelector('.curved-text.slow svg');
  var fullText = svg.querySelector('text');

  goButton.style.display = 'inline';

  // I've split everything up into functions for profiling
  function getPosition(text, index) {
    return text.getStartPositionOfChar(index);
  }

  function getRotation(text, index) {
    return text.getRotationOfChar(index);
  }

  function makeTextElement(pos, rotation, char) {
    var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', pos.x);
    text.setAttribute('y', pos.y);
    text.setAttribute('rotate', rotation);
    text.textContent = char;
    return text;
  }

  function appendTextElements(texts, svg) {
    texts.forEach(svg.appendChild.bind(svg));
  }

  goButton.onclick = function(event) {
    if (console.profile) console.profile('Bleeding');
    var newSvg = svg.cloneNode(false);
    var container = document.createElement('div');
    container.className = 'curved-text';
    container.appendChild(newSvg);

    newSvg.style.fontSize = '13px';
    newSvg.style.fontFamily = 'sans-serif';

    var texts = fullText.textContent.split('').map(function(char, i) {
      var pos = getPosition(fullText, i);
      var rotation = getRotation(fullText, i);
      return makeTextElement(pos, rotation, char);
    });

    appendTextElements(texts, newSvg);
    goButton.parentNode.insertBefore(container, goButton.nextSibling);
    if (console.profileEnd) console.profileEnd('Bleeding');

    event.preventDefault();
  };
}());
</script>

However, we could do this processing once, locally, save the resulting SVG, & serve that to users. This takes our SVG data from 1k to 19k (gzipped), and text position will be based on the machine we generated it on, which may not look right on a machine with a different "sans-serif" font (in which case we could switch to an SVG font). But hey, it works:

<div class="svg-demo"><div class="curved-text fast"></div><button class="btn fast-line-anim">Move it!</button> <button class="btn fast-line-anim-stop">That'll do, pig.</button></div>

<p class="no-svg-support">You're missing a demo here because JavaScript or inline SVG isn't available.</p>

<script>
(function() {
  if (!supportsInlineSvg) return;
  var container = document.querySelector('.curved-text.fast');
  var startButton = document.querySelector('.fast-line-anim');
  var stopButton = document.querySelector('.fast-line-anim-stop');
  var texts;
  var charsShown;
  var play;

  fetch('asset-url:./final.svg').then(r => r.text()).then(text => {
    container.innerHTML = text;
    startButton.style.display = 'inline';
    texts = Array.prototype.slice.call(document.querySelectorAll('.curved-text.fast text'));
  });

  function frame() {
    if (!play) {
      end();
      return;
    }
    texts[charsShown].style.visibility = 'visible';
    charsShown++;
    if (charsShown == texts.length) {
      play = false;
    }
    requestAnimationFrame(frame);
  }

  function end() {
    startButton.style.display = 'inline';
    stopButton.style.display = 'none';
  }

  startButton.onclick = function(event) {
    charsShown = 0;
    texts.forEach(function(text) {
      text.style.visibility = '';
    });
    play = true;
    startButton.style.display = 'none';
    stopButton.style.display = 'inline';
    requestAnimationFrame(frame);
    event.preventDefault();
  };

  stopButton.onclick = function(event) {
    play = false;
    event.preventDefault();
  }
}());
</script>

<figure class="full-figure">
<img alt="Devtools showing 60fps" src="asset-url:./timeline4.png">
<figcaption>Job done, for real this time</figcaption>
</figure>

Ahh the sweet smell of 60fps. Hardly touching the CPU. The critical path now has very little to complain about.

<figure class="full-figure critical-path">
<div class="critical-bubble"><img alt="…your mum?" src="asset-url:./critical3.png"></div>
<img alt="" src="asset-url:./path.jpg">
<figcaption>Oh you!</figcaption>
</figure>

# In summary...

## If layouts are causing slowness:

- Remember that things like `innerHTML` & `textContent` will destroy and rebuild the entire content of that element
- Isolate the thing you're animating (give it its own element) to avoid impacting other elements
- When showing/hiding elements, `visibility: hidden` allows you to pay the layout cost earlier
- If an element is frequently changing size, try to prevent it being a layout dependency for other elements, eg make it `position: absolute` or use CSS transforms

## If paint is causing slowness:

- Use paint rectangles to see if too much is being drawn
- Avoid complex CSS effects
- Can you achieve the same or similar effect with the GPU's help? Eg using CSS transforms & transitions/animations.

## If devtools isn't giving you the answer:

- Take a deep breath & give about:tracing a try
- File a bug report against devtools!

Image credit: [Forest path](http://www.flickr.com/photos/mshades/168897785/)
