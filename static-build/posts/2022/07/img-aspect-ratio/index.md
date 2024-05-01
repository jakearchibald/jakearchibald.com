---
title: 'Avoiding <img> layout shifts: aspect-ratio vs width & height attributes'
date: 2022-07-11 01:00:00
summary: Two ways to do the same thing, but which is best?
meta: Two ways to do the same thing, but which is best?
image: './img.png'
---

By default, an `<img>` takes up zero space until the browser loads enough of the image to know its dimensions:

<div class="demo-1"></div>

<script>
  self.figureSource = () => `
    <figure class="full-figure">
      <picture>
        <source type="image/avif" srcset="https://random-server-stuff.glitch.me/slow-redirect?${Math.random()}&origin=source&to=asset-url:./senna.avif">
        <source type="image/webp" srcset="https://random-server-stuff.glitch.me/slow-redirect?${Math.random()}&origin=source&to=asset-url:./senna.webp">
        <img alt="A black cat, looking into the camera, rolling on his back" decoding="async" src="https://random-server-stuff.glitch.me/slow-redirect?${Math.random()}&origin=source&to=asset-url:./senna.jpg" crossorigin>
      </picture>
      <figcaption>Senna the cat</figcaption>
    </figure>
    <p><button class="btn">Reset</button></p>
  `;

  self.buttonSource = `
    <p><button class="btn">Demo</button></p>
  `;

  // Wake the server up for the demo
  fetch('https://random-server-stuff.glitch.me/ping');
</script>

<script>
  {
    const demoEl = document.querySelector('.demo-1');
    let state = '';

    const toggle = () => {
      if (state === 'button') {
        demoEl.innerHTML = self.figureSource();
        state = 'demo';
      } else {
        demoEl.innerHTML = self.buttonSource;
        state = 'button';
      }

      demoEl.querySelector('button').onclick = () => toggle();
    };

    toggle();
  }
</script>

When you run the demo, you'll see the `<figcaption>` immediately. Then, after a few seconds, this paragraph and subsequent page content shifts downwards to make room for the image. This makes the user experience massively frustrating, as content moves out from under the user's eyes/finger/pointer.

For over a decade, we had to use [silly hacks](https://css-tricks.com/aspect-ratio-boxes/#aa-the-core-concept-padding-in-percentages-is-based-on-width) to manually apply an aspect ratio, and then, bloody typical, two better solutions arrived at roughly the same time. They are CSS `aspect-ratio`, and `width` & `height` presentational hints.

So, which should you use? First, let's take a look at how the features work, as there's quite a bit of misinformation out there…

# CSS aspect-ratio

If you do this:

```css
.aspect-ratio-demo {
  aspect-ratio: 16 / 9;
}
```

…you get this:

<style>
  .aspect-ratio-demo {
    aspect-ratio: 16 / 9;
    display: grid;
    align-content: center;
    text-align: center;
    font-weight: bold;
    font-size: 69px;
    color: rgba(0,0,0,0.3);
  }
</style>

<figure class="full-figure">
  <div class="aspect-ratio-demo">16 / 9</div>
</figure>

This feature became cross-browser compatible once it landed in Safari 15, late 2021, having arrived in Chrome & Firefox earlier that year.

It works on any element, but here's a demo with `<img>`:

```css
img {
  aspect-ratio: 16 / 9;
  width: 100%;
}
```

<div class="demo-2"></div>

<script>
  {
    const demoEl = document.querySelector('.demo-2');
    let state = '';

    const toggle = () => {
      if (state === 'button') {
        demoEl.innerHTML = self.figureSource();
        Object.assign(demoEl.querySelector('img').style, {
          aspectRatio: '16 / 9',
          width: '100%',
        });
        state = 'demo';
      } else {
        demoEl.innerHTML = self.buttonSource;
        state = 'button';
      }

      demoEl.querySelector('button').onclick = () => toggle();
    };

    toggle();
  }
</script>

This time, the image reserves space for its content as soon as it appears in the document, so stuff doesn't shift around once it loads.

The other solution is…

# Width & height presentational hints

If you set dimensions on your image:

```html
<img width="1598" height="899" src="…" alt="…" />
```

And set height to `auto`:

```css
img {
  height: auto;
}
```

…the image will have an aspect ratio applied, even before it loads.

<div class="demo-3"></div>

<script>
  {
    const demoEl = document.querySelector('.demo-3');
    let state = '';

    const toggle = () => {
      if (state === 'button') {
        demoEl.innerHTML = self.figureSource();
        Object.assign(demoEl.querySelector('img'), {
          width: '1598',
          height: '899',
        });
        Object.assign(demoEl.querySelector('img').style, {
          height: 'auto',
        });
        state = 'demo';
      } else {
        demoEl.innerHTML = self.buttonSource;
        state = 'button';
      }

      demoEl.querySelector('button').onclick = () => toggle();
    };

    toggle();
  }
</script>

This landed in Chrome and Firefox back in 2019, and became cross-browser compatible when it landed in Safari 14 a year later. So, this feature has been around a little longer than CSS `aspect-ratio`.

In addition to `<img>`, this feature also works on `<video>` and `<input type="image">`.

**Update:** Although browsers implemented the feature for `<video>` as per the spec, [the spec is broken](https://github.com/w3c/csswg-drafts/issues/7524), so it doesn't work in practice.

However, there's a bit of misinformation floating around…

## No, this doesn't use `attr()`

A lot of articles say this feature works via a user-agent stylesheet like this:

<style>
  .code-warning {
    background: #732525;
    color: #fff;
    font-size: 0.8rem;

    margin: 1em -20px 0;
    padding: 7px 20px;
  }

  @media screen and (min-width: 530px) {
    .code-warning {
      margin-left: -32px;
      margin-right: 0;
      padding-left: 32px;
      padding-right: 0;
    }
  }

  .code-warning + .code-example {
    margin-top: 0;
  }
</style>

<p class="code-warning">This isn't how it actually works</p>

```css
img,
input[type='image'],
video,
embed,
iframe,
marquee,
object,
table {
  aspect-ratio: attr(width) / attr(height);
}
```

Firstly, this feature doesn't work on `embed`, `iframe`, `marquee`, `object`, or `table`. But also, this usage of `attr()` wouldn't work in practice because it returns a string. To make it work properly, you'd need to cast the attribute to a number, which CSS supports!

<p class="code-warning">This isn't how it works either</p>

```css
img,
input[type='image'],
video {
  aspect-ratio: attr(width number) / attr(height number);
}
```

But this isn't how it works, because:

<figure class="full-figure max-figure">
  <img alt="No browser supports attr on all properties" decoding="async" src="asset-url:./attr.png">
  <figcaption>Support for attr() on <a href="https://caniuse.com/css3-attr">caniuse.com</a></figcaption>
</figure>

…no browser supports `attr()`, aside from very particular cases like `content` on pseudo-elements. Hopefully that will change one day!

## How does it actually work?

Here's what the spec has to say:

<blockquote class="quote"><p>The <code><a href="https://html.spec.whatwg.org/multipage/embedded-content-other.html#attr-dim-width">width</a></code> and <code id="attributes-for-embedded-content-and-images:attr-dim-height-3"><a href="https://html.spec.whatwg.org/multipage/embedded-content-other.html#attr-dim-height">height</a></code> attributes <a href="https://html.spec.whatwg.org/multipage/rendering.html#map-to-the-aspect-ratio-property-(using-dimension-rules)">map to the aspect-ratio property (using dimension rules)</a> on <code><a href="https://html.spec.whatwg.org/multipage/embedded-content.html#the-img-element">img</a></code> and <code><a href="https://html.spec.whatwg.org/multipage/media.html#the-video-element">video</a></code> elements, and <code><a href="https://html.spec.whatwg.org/multipage/input.html#the-input-element">input</a></code> elements with a <code><a href="https://html.spec.whatwg.org/multipage/input.html#attr-input-type">type</a></code> attribute in the <a href="https://html.spec.whatwg.org/multipage/input.html#image-button-state-(type=image)">Image Button</a> state.</p>&mdash; <a href="https://html.spec.whatwg.org/multipage/rendering.html#attributes-for-embedded-content-and-images">Attributes for embedded content and images - HTML</a></blockquote>

So, it does map to the `aspect-ratio` property. Specifically:

<blockquote class="quote"><p>…the user agent is expected to use the parsed dimensions as a <a href="https://html.spec.whatwg.org/multipage/rendering.html#presentational-hints">presentational hint</a> for the <a href="https://drafts.csswg.org/css-sizing-4/#aspect-ratio" data-x-internal="'aspect-ratio'">'aspect-ratio'</a> property of the form <code>auto <var>w</var> / <var>h</var></code>.</p>&mdash; <a href="https://html.spec.whatwg.org/multipage/rendering.html#map-to-the-aspect-ratio-property-(using-dimension-rules)">Mapping to aspect-ratio - HTML</a></blockquote>

You can think of a "presentational hint" as something a bit like a zero-specificity inline-style that's applied internally.

This uses a feature of `aspect-ratio` I didn't mention earlier:

```css
.aspect-ratio-demo {
  aspect-ratio: auto 16 / 9;
}
```

The new bit is `auto`. Here's what the spec says:

<blockquote class="quote"><p> If both <a href="https://drafts.csswg.org/css-sizing-4/#valdef-aspect-ratio-auto">auto</a> and a <a href="https://drafts.csswg.org/css-values-4/#ratio-value">&lt;ratio&gt;</a> are specified together, the <a href="https://drafts.csswg.org/css-sizing-4/#preferred-aspect-ratio">preferred aspect ratio</a> is the specified ratio of <span>width / height</span> unless it is a <a href="https://drafts.csswg.org/css-display-3/#replaced-element">replaced element</a> with a <a href="https://drafts.csswg.org/css-images-3/#natural-aspect-ratio">natural aspect ratio</a>, in which case that aspect ratio is used instead.</p>&mdash; <a href="https://drafts.csswg.org/css-sizing-4/#aspect-ratio">CSS-sizing level 4</a></blockquote>

A lot of articles gloss over this, probably because the spec text is a little hard to read, but it adds an important bit of behaviour:

An `<img>` is a "replaced element", but it doesn't have a "natural aspect ratio" until the browser has loaded enough of the image to know its real width & height. That means the `16 / 9` bit is ignored once the browser has the real data from the image. This doesn't usually matter, because the result is the same. But, let's say I got the width and height wrong:

```html
<img width="4" height="3" src="…" alt="…" />
```

The browser will use an presentational hint of `aspect-ratio: auto 4 / 3`, but the image is actually `16 / 9`. Here's what happens:

<div class="demo-4"></div>

<script>
  {
    const demoEl = document.querySelector('.demo-4');
    let state = '';

    const toggle = () => {
      if (state === 'button') {
        demoEl.innerHTML = self.figureSource();
        Object.assign(demoEl.querySelector('img'), {
          width: '4',
          height: '3',
        });
        Object.assign(demoEl.querySelector('img').style, {
          height: 'auto',
          width: '100%',
        });
        state = 'demo';
      } else {
        demoEl.innerHTML = self.buttonSource;
        state = 'button';
      }

      demoEl.querySelector('button').onclick = () => toggle();
    };

    toggle();
  }
</script>

When the image is added to the page, it takes up the `4 / 3` area I specified. But once it loads, the `auto` rule kicks in, and the browser corrects the aspect ratio to `16 / 9`.

Compare this to the behaviour of:

```css
img {
  aspect-ratio: 4 / 3;
  width: 100%;
}
```

<div class="demo-5"></div>

<script>
  {
    const demoEl = document.querySelector('.demo-5');
    let state = '';

    const toggle = () => {
      if (state === 'button') {
        demoEl.innerHTML = self.figureSource();
        Object.assign(demoEl.querySelector('img').style, {
          aspectRatio: '4 / 3',
          width: '100%',
        });
        state = 'demo';
      } else {
        demoEl.innerHTML = self.buttonSource;
        state = 'button';
      }

      demoEl.querySelector('button').onclick = () => toggle();
    };

    toggle();
  }
</script>

Without `auto`, the `<img>` remains `4 / 3`, and the image appears stretched. You can avoid the stretching with `object-fit`:

```css
img {
  aspect-ratio: 4 / 3;
  width: 100%;
  object-fit: cover;
}
```

<div class="demo-6"></div>

<script>
  {
    const demoEl = document.querySelector('.demo-6');
    let state = '';

    const toggle = () => {
      if (state === 'button') {
        demoEl.innerHTML = self.figureSource();
        Object.assign(demoEl.querySelector('img').style, {
          aspectRatio: '4 / 3',
          width: '100%',
          objectFit: 'cover',
        });
        state = 'demo';
      } else {
        demoEl.innerHTML = self.buttonSource;
        state = 'button';
      }

      demoEl.querySelector('button').onclick = () => toggle();
    };

    toggle();
  }
</script>

In this case, parts of the image are cropped. Oh, one more thing:

## A slight issue in Firefox

Responsive images let you provide different images to use at different widths:

```html
<picture>
  <source
    width="1000"
    height="614"
    media="(max-width: 800px)"
    srcset="wide-view.jpg"
  />
  <img width="800" height="547" src="zoomed-in.jpg" alt="…" />
</picture>
```

In this case, the two images have different aspect ratios. Chrome and Safari use the correct `width` and `height` depending on which source is used, but Firefox will always use the dimensions from the `<img>`, resulting in a content shift when it realises the calculated aspect-ratio is incorrect.

<div class="demo-7"></div>

<script>
  {
    const demoEl = document.querySelector('.demo-7');
    let state = '';

    const toggle = () => {
      if (state === 'button') {
        demoEl.innerHTML = `
          <figure class="full-figure">
            <picture>
              <source media="(min-width: 800px)" width="1000" height="614"
                  srcset="https://random-server-stuff.glitch.me/slow-redirect?${Math.random()}&origin=source&to=asset-url:../../../2015/09/anatomy-of-responsive-images/f1-689.jpg"
                  srcset="https://random-server-stuff.glitch.me/slow-redirect?${Math.random()}&origin=source&to=asset-url:../../../2015/09/anatomy-of-responsive-images/f1-689.jpg 689w,
                          https://random-server-stuff.glitch.me/slow-redirect?${Math.random()}&origin=source&to=asset-url:../../../2015/09/anatomy-of-responsive-images/f1-1378.jpg 1378w,
                          https://random-server-stuff.glitch.me/slow-redirect?${Math.random()}&origin=source&to=asset-url:../../../2015/09/anatomy-of-responsive-images/f1-500.jpg 500w,
                          https://random-server-stuff.glitch.me/slow-redirect?${Math.random()}&origin=source&to=asset-url:../../../2015/09/anatomy-of-responsive-images/f1-1000.jpg 1000w"
                      sizes="(min-width: 530px) calc(100vw - 96px), 100vw">
              <img style="height:auto" width="800" height="547"
                      srcset="https://random-server-stuff.glitch.me/slow-redirect?${Math.random()}&origin=source&to=asset-url:../../../2015/09/anatomy-of-responsive-images/f1-focused-800.jpg 800w,
                              https://random-server-stuff.glitch.me/slow-redirect?${Math.random()}&origin=source&to=asset-url:../../../2015/09/anatomy-of-responsive-images/f1-focused-1406.jpg 1406w"
                  alt="F1 car in the gravel"
                  sizes="(min-width: 1066px) 689px, calc(75vw - 137px)" crossorigin>
            </picture>
            <figcaption>Romain Grosjean driving the long way around a corner</figcaption>
          </figure>
          <p><button class="btn">Reset</button></p>
        `;
        console.log(getComputedStyle(demoEl.querySelector('img')).aspectRatio);
        state = 'demo';
      } else {
        demoEl.innerHTML = self.buttonSource;
        state = 'button';
      }

      demoEl.querySelector('button').onclick = () => toggle();
    };

    toggle();
  }
</script>

[Here's the Firefox bug](https://bugzilla.mozilla.org/show_bug.cgi?id=1694741) to track this. Hopefully it'll get fixed soon!

# So, which method should we use?

Ok, until now the article has been a massive side-quest. Now we're at the actual point. And, in my opinion, the answer is… nothing new.

We've got one solution, `aspect-ratio`, which is CSS-based. And the other solution, presentational hinting, which uses `width` and `height` attributes. The question is very similar to "should this image be a `<img>` or a CSS `background-image`?" and the answer is the same: Is it content or design?

If I'm adding an image to an article on my blog, that's content. I want the reserved space to be the aspect ratio of the content. If I get the `width` and `height` attributes wrong, I'd rather the correct values were used from the content image. Therefore, `width` and `height` attributes feel like the best fit. This means I can just author content, I don't need to dip into inline styles.

If it's a design requirement that the layout of an image is a particular aspect ratio, enforcing that with `aspect-ratio` in CSS can be appropriate. For example, a hero image that _must_ be `16 / 9` – if the image isn't quite `16 / 9` I don't want it messing up my design, I want the design to take priority. Although, if the image isn't actually that aspect ratio, it'll either end up stretched (`object-fit: fill`), letter-boxed (`object-fit: contain`), or cropped (`object-fit: cover`). None of which are ideal.

You could use `aspect-ratio` and media queries to make up for the lack of support in Firefox when it comes to `<picture>` and art direction. But, I'm hoping that they'll fix that bug sooner rather than later, so we don't need to hack around it.

And that's it! It took a decade for us to get a real solution to this problem, but now you can avoid layout shifts using `width` and `height` attributes, or `aspect-ratio` in CSS, whichever is most appropriate.
