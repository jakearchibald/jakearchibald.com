---
title: SVG & media queries
date: 2016-10-10 14:50:06
summary: One of the great things about SVG is you can use media queries to add
  responsiveness to images, but which viewport triggers those media queries?
mindframe: ''
image: ''
meta: You can use media queries to add responsiveness to SVG, but which viewport
  triggers those media queries?
---

One of the great things about SVG is you can use media queries to add responsiveness to images:

```xml
<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <style>
    circle {
      fill: green;
    }
    @media (min-width: 100px) {
      circle {
        fill: blue;
      }
    }
  </style>
  <circle cx="50" cy="50" r="50"/>
</svg>
```

**But when should the circle be blue?** The specs say `min-width` should [match on the width of the viewport](https://drafts.csswg.org/mediaqueries-3/#width), but…

# Which viewport?

```html
<img src="circle.svg" width="50" height="50" />
<img src="circle.svg" width="100" height="100" />
<iframe src="circle.svg" width="50" height="50"></iframe>
<svg width="50" height="50">
  …as above…
</svg>
```

Which of the above would draw a (potentially clipped) _blue_ circle in an HTML document? As in, which viewport should be used? Should it be:

- The CSS size of the host document
- The width/height/viewBox attributes on the `<svg>`
- The width/height attributes on the `<img>`
- The CSS layout size of the `<img>`

Here's an demo of the above:

<style>
  .trans-tile {
    background: #fff url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%202%202%22%3E%3Cpath%20d%3D%22M1%202V0h1v1H0v1z%22%20fill-opacity%3D%22.05%22%2F%3E%3C%2Fsvg%3E");
    background-size: 16px 16px;
  }
  .img-row {
    display: flex;
    align-items: center;
    padding: 30px 0;
    flex-flow: row wrap;
  }
  .full-figure iframe,
  .full-figure svg {
    display: block;
    margin: 0 auto;
    border: none;
    overflow: hidden;
  }
</style>

<figure class="full-figure trans-tile">
<div class="img-row">
<img src="asset-url:./fixed100.svg" width="50" height="50">
<img src="asset-url:./fixed100.svg" width="100" height="100">
<iframe src="asset-url:./fixed100.svg" width="50" height="50"></iframe>
<svg width="50" height="50">
  <style>
    .inline-svg-circle {
      fill: green;
    }
    @media (min-width: 100px) {
      .inline-svg-circle {
        fill: blue;
      }
    }
  </style>
  <circle class="inline-svg-circle" cx="50" cy="50" r="50"/>
</svg>
</div>
</figure>

## Most browsers say…

For `<img>`, the SVG is scaled to fit the image element, and the viewport of the SVG is the CSS dimensions of the `<img>`. So the first `<img>` has a viewport width of 50, and the second has a viewport width of 100. This means the second `<img>` picks up the "blue" media query, but the first does not.

For `<iframe>`, the viewport of the SVG is the viewport of the iframed document. So in the above example, the viewport width is 50 CSS pixels because that's the width of the iframe.

For inline `<svg>`, the SVG doesn't have its own viewport, it's part of the parent document. This means the `<style>` is owned by the parent document - it isn't scoped to the SVG. This caught me out when I first used inline SVG, but it makes sense and is [well defined in the spec](https://svgwg.org/svg2-draft/styling.html#StyleSheetsInHTMLDocuments).

## But what does the fox say?

Firefox has other ideas. It behaves as above, except:

For `<img>`, the viewport is the rendered size in device pixels, meaning the viewport changes depending on display density. The first image in the demo will appear green on 1x screens, but blue on 2x screens and above. This is a problem as some laptops and most phones have a pixel density greater than 1.

This feels like a bug, especially as Firefox doesn't apply the same logic to the iframe, but we have to cut Firefox some slack here as the spec doesn't really cover how SVG-in-`<img>` should be scaled, let alone how media queries should be handled.

I've [filed an issue with the spec](https://github.com/w3c/svgwg/issues/289), hopefully this can be cleared up.

But things get a lot more complicated when you start…

# Drawing SVG to a canvas

You can also draw `<img>`s to `<canvas>`es:

```js
canvas2dContext.drawImage(img, x, y, width, height);
```

**But when should the circle be blue?** There are a few more viewport choices this time. Should it be:

- The CSS size of the host window
- The width/height/viewBox attributes on the `<svg>`
- The width/height attributes on the `<img>`
- The CSS layout dimensions of the `<img>`
- The pixel-data dimensions of the `<canvas>`
- The CSS layout dimensions of the `<canvas>`
- The width/height specified in `drawImage`
- The width/height specified in `drawImage`, multiplied by whatever transform the 2d context has

Which would you expect? Again, the spec is unclear, and this time every browser has gone in a different direction. Give it a try:

<style>
  .svg-test-form {
    font-size: 0.9em;
    margin: 0 -20px;
  }

  @media (min-width: 530px) {
    .svg-test-form {
      margin: 0 -64px 0 -32px;
    }
  }

  .svg-test-output {
    height: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px 0;
    margin-bottom: 10px;
    overflow: hidden;
  }

  .svg-test-output canvas {
    display: block;
    outline: 1px solid rgba(0,0,0,0.2);
  }

  .svg-test-form .fields {
    display: flex;
    flex-flow: row wrap;
    background: #e0eaf5;
    padding: 10px 0 0 20px;
  }

  .svg-test-form fieldset {
    border: none;
    padding: 0;
    margin: 10px 0;
    min-width: 50%;
  }

  @media (min-width: 500px) {
    .svg-test-form fieldset {
      min-width: 33%;
    }
  }

  .svg-test-form legend {
    font-size: 1em;
    font-weight: bold;
  }
</style>
<form class="svg-test-form">
  <div class="fields">
    <fieldset>
      <legend>SVG size</legend>
      <div><label><input type="radio" name="img-type" value="50" checked> 50x50</label></div>
      <div><label><input type="radio" name="img-type" value="100"> 100x100</label></div>
      <div><label><input type="checkbox" name="use-viewbox"> Use viewBox</label></div>
    </fieldset>
    <fieldset>
      <legend><code>&lt;img&gt;</code> size</legend>
      <div><label><input type="radio" name="img-size" value="0" checked> Unset</label></div>
      <div><label><input type="radio" name="img-size" value="50"> 50x50</label></div>
      <div><label><input type="radio" name="img-size" value="100"> 100x100</label></div>
    </fieldset>
    <fieldset>
      <legend><code>&lt;img&gt;</code> CSS size</legend>
      <div><label><input type="radio" name="img-css-size" value="0" checked> Unset</label></div>
      <div><label><input type="radio" name="img-css-size" value="50"> 50x50</label></div>
      <div><label><input type="radio" name="img-css-size" value="100"> 100x100</label></div>
      <div><label><input type="checkbox" name="add-to-dom"> Add to &lt;body&gt;</label></div>
    </fieldset>
    <fieldset>
      <legend><code>&lt;canvas&gt;</code> size</legend>
      <div><label><input type="radio" name="canvas-size" value="50" checked> 50x50</label></div>
      <div><label><input type="radio" name="canvas-size" value="100"> 100x100</label></div>
    </fieldset>
    <fieldset>
      <legend><code>drawImage</code> size</legend>
      <div><label><input type="radio" name="drawimage-size" value="50" checked> 50x50</label></div>
      <div><label><input type="radio" name="drawimage-size" value="100"> 100x100</label></div>
    </fieldset>
    <fieldset>
      <legend>Context transform</legend>
      <div><label><input type="radio" name="context-transform" value="0.5"> 0.5x</label></div>
      <div><label><input type="radio" name="context-transform" value="1" checked> 1x</label></div>
      <div><label><input type="radio" name="context-transform" value="2"> 2x</label></div>
      <div><label><input type="radio" name="context-transform" value="5"> 5x</label></div>
    </fieldset>
  </div>
  <div class="svg-test-output trans-tile"></div>
</form>
<script>
function loadImg(url, width, height) {
  return new Promise(function(resolve, reject) {
    var img = new Image();
    if (width) {
      img.width = width;
    }
    if (height) {
      img.height = height;
    }
    img.src = url;
    img.onload = function() {
      resolve(img);
    };
    img.onerror = function() {
      reject(Error('Image load failed'))
    };
});
}
(function() {
var svgImgs = {
  fixed50: 'asset-url:./fixed50.svg',
  fixed100: 'asset-url:./fixed100.svg',
  viewbox50: 'asset-url:./viewbox50.svg',
  viewbox100: 'asset-url:./viewbox100.svg',
};
function createCanvas(width, height) {
  var canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}
function drawImgOnCanvas(canvas, img, width, height, scale) {
  var context = canvas.getContext('2d');
  context.scale(scale, scale);
  context.drawImage(img, 0, 0, width, height);
}
var svgTestForm = document.querySelector('.svg-test-form');
var svgTestOutput = document.querySelector('.svg-test-output');
function processForm() {
  var svgSize = svgTestForm.querySelector('[name=img-type]:checked').value;
  var imgSize = Number(svgTestForm.querySelector('[name=img-size]:checked').value);
  var imgCssSize = Number(svgTestForm.querySelector('[name=img-css-size]:checked').value);
  var addImgToDom = !!svgTestForm.querySelector('[name=add-to-dom]:checked');
  var useViewbox = !!svgTestForm.querySelector('[name=use-viewbox]:checked');
  var canvasSize = Number(svgTestForm.querySelector('[name=canvas-size]:checked').value);
  var drawImageSize = Number(svgTestForm.querySelector('[name=drawimage-size]:checked').value);
  var contextTransform = Number(svgTestForm.querySelector('[name=context-transform]:checked').value);
  var imgUrl;
  if (useViewbox) {
    imgUrl = svgImgs['viewbox' + svgSize];
  }
  else {
    imgUrl = svgImgs['fixed' + svgSize];
  }
  svgTestOutput.innerHTML = '';
  loadImg(imgUrl, imgSize, imgSize).then(img => {
    var el = img;
    if (imgCssSize) {
      img.style.width = img.style.height = imgCssSize + 'px';
    }
    if (addImgToDom) {
      document.body.appendChild(img);
    }
    el = createCanvas(canvasSize, canvasSize);
    drawImgOnCanvas(el, img, drawImageSize, drawImageSize, contextTransform);
    if (addImgToDom) {
      document.body.removeChild(img);
    }
    svgTestOutput.appendChild(el);
  });
}
processForm();
svgTestForm.addEventListener('change', function() {
  processForm();
});
}());
</script>

As far as I can tell, here's what the browsers are doing:

## Chrome

Chrome goes for the width/height attributes specified in the SVG document. This means if the SVG document says `width="50"`, you'll get the media queries for a 50px wide viewport. If you wanted to draw it using the media queries for a 100px wide viewport, tough luck. No matter what size you draw it to the canvas, it'll draw using the media queries for a 50px width.

However, if the SVG specifies a `viewBox` rather than a fixed width, Chrome uses the pixel-data width of the `<canvas>` as the viewport width. You could argue this is similar to how things work with inline SVG, where the viewport is the whole window, but switching behaviours based on `viewBox` is really odd.

Chrome wins the bizarro-pants award for "wonkiest behaviour".

## Safari

Like Chrome, Safari uses the size specified in the SVG document, with the same downsides. But if the SVG uses a `viewBox` rather than a fixed width, it calculates the width from the `viewBox`, so an SVG with `viewBox="50 50 200 200"` would have a width of 150.

So, less bizarre than Chrome, but still really restrictive.

## Firefox

Firefox uses the width/height specified in the `drawImage` call, multiplied by any context transforms. This means if you draw your SVG so it's 300 canvas pixels wide, it'll have a viewport width of 300px.

This kinda reflects their weird `<img>` behaviour - it's based on pixels drawn. This means you'll get the same density inconsistencies if you multiply your canvas width and height by `devicePixelRatio` (and scale back down with CSS), which you should do to avoid blurriness on high-density screens:

<style>
  .text-canvas,
  .text-canvas-sharp {
    display: block;
    margin: 0 auto;
  }
</style>

<figure class="full-figure">
<div class="img-row">
<img class="text-image" src="asset-url:./text.svg" width="150" height="60">
<canvas width="150" height="60" class="text-canvas"></canvas>
<canvas width="150" height="60" class="text-canvas-sharp"></canvas>
</div>
<figcaption>&lt;img&gt;, &lt;canvas&gt;, multiplied &lt;canvas&gt;. Without multiplication, the canvas will appear blurry on high-density screens</figcaption>
</figure>

<script>
(function() {
  loadImg('asset-url:./text.svg').then(function(img) {
    var canvas = document.querySelector('.text-canvas');
    var context = canvas.getContext('2d');
    context.drawImage(img, 0, 0);
  });
  loadImg('asset-url:./text.svg').then(function(img) {
    var canvas = document.querySelector('.text-canvas-sharp');
    canvas.style.width = canvas.width + 'px';
    canvas.style.height = canvas.height + 'px';
    canvas.width = canvas.width * devicePixelRatio;
    canvas.height = canvas.height * devicePixelRatio;
    var context = canvas.getContext('2d');
    context.drawImage(img, 0, 0, canvas.width, canvas.height);
  });
}());
</script>

There's logic to what Firefox is doing, but it means your media queries are tied to pixels drawn.

## Microsoft Edge

Edge uses the layout size of the `<img>` to determine the viewport. If the `<img>` doesn't have layout (`display:none` or not in the document tree) then it falls back to the width/height attributes, if it doesn't have those it falls to the intrinsic dimensions of the `<img>`.

This means you can draw the SVG at 1000x1000, but if the image is `<img width="100">`, it'll have a viewport width of 100px.

In my opinion this is ideal. It means you can activate media queries for widths independent of the drawn width. It also feels consistent with responsive images. When you draw an `<img srcset="…" sizes="…">` to a canvas, all browsers agree that the drawn image should be the resource currently selected by the `<img>`.

# Phew!

I've [filed an issue with the spec to adopt Edge's behaviour](https://github.com/whatwg/html/issues/1880), and [proposed an addition to `createImageBitmap` so the viewport can be specified in script](https://github.com/whatwg/html/issues/1881). Hopefully we can get a little more consistency across browsers here!

For completeness, [here's how I gathered the data](http://jsbin.com/gefaju/2/edit?js,output), and [here are the full results](https://docs.google.com/spreadsheets/d/15IkG42KrEWgv_FbrgfGBSM_PYRi22Vj_uGrcp4LxyMU/edit#gid=0).
