---
title: Having fun with <image>
date: 2013-08-09 15:05:56
mindframe: then furiously corrected by others
summary: "Did you know that this works in every browser?\r

  \r

  ```html\r

  <image src=\"f1.jpg\">\r

  ```"
meta: ""

---

Did you know that this works in every browser?

```html
<image src="f1.jpg">
```

Look, here's one:

<figure class="full-figure">
  <image src="http://farm7.staticflickr.com/6001/5894570568_d8bcf26819_b.jpg" class="image-demo" alt="">
  <figcaption>An &lt;image&gt;</figcaption>
</figure>

You might think it's leaking from SVG, but SVG images don't use `src`, they use `xlink:href`. Let's all take a moment to laugh at xlink. Done? Ok…

In the first age of the web, some people accidentally typed `<image>` instead of `<img>`. Browsers decided they should error-correct for it and we've been stuck with it ever since.

**Update:** As [Elijah Manor points out](https://twitter.com/elijahmanor/status/365839472685883393), there's a comment hidden in the [WHATWG spec](http://www.whatwg.org/specs/web-apps/current-work/multipage/tree-construction.html#parsing-main-inbody) suggesting a study was done in late 2005 showing ~0.2% of pages used the `<image>` element.

But what about:

```javascript
document.querySelector('image').src = "kettle.jpg";
```

Well, that throws an error in Chrome, Safari and Firefox, because `querySelector('image')` returns `null`. Whereas it works fine in IE. Try it:

<button class="change-image btn">Change the image above</button>

<script>
  document.querySelector('.change-image').onclick = function() {
    document.querySelector('image.image-demo').src = "http://farm3.staticflickr.com/2060/2196248898_cbc72b7be3_b.jpg";
  };
</script>

How about:

```javascript
document.querySelector('img').src = "kettle.jpg";
```

That works in all browsers, including IE. In fact, `querySelector('img')` and `querySelector('image')` are completely interchangeable in IE. Try it:

<button class="change-img btn">Change the image above</button>

<script>
  document.querySelector('.change-img').onclick = function() {
    document.querySelector('img.image-demo').src = "http://farm3.staticflickr.com/2060/2196248898_cbc72b7be3_b.jpg";
  };
</script>

How about:

```javascript
var image = document.createElement('image');
console.log(image.tagName);
```

Well, it's "IMG" in Chrome, Safari & IE, but it's "IMAGE" in Firefox. How about:

```javascript
var image = document.createElement('image');
image.src = 'f1.jpg';
document.body.appendChild(image);
```

This works in Chrome, Safari & IE, but Firefox treats it as an unknown element and doesn't load the image. Try it:

<button class="add-image btn">Add image</button>

<script>
  document.querySelector('.add-image').onclick = function() {
    var image = document.createElement('image');
    image.src = 'http://farm3.staticflickr.com/2060/2196248898_cbc72b7be3_b.jpg';
    this.parentNode.insertBefore(image, this);
  };
</script>

# What's going on?

It seems:

* Firefox aliases 'image' to 'img' at parse-time
* Chrome & Safari alias 'image' to 'img' at element-creation time
* IE aliases 'image' to 'img' throughout the runtime

<del>`<image>` isn't defined in any spec….</del>

**Update:** As [Mathias Bynens points out](https://twitter.com/mathias/status/365838260670447616) (who's this blog's unofficial error-spotter), [`<image>` is specced by the WHATWG](http://www.whatwg.org/specs/web-apps/current-work/multipage/tree-construction.html#parsing-main-inbody). It's only mentioned as part of token parsing, so although IE's handling of `<image>` feels more complete, Firefox seems to be the most spec-compliant.