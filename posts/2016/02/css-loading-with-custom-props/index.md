---
title: Control CSS loading with custom properties
date: 2016-02-16 13:02:50
mindframe: ""
summary: The pattern in the previous post covers the 90% case of multi-stage CSS
  loading, and it's really simple to understand. But, would you like to hear
  about a pattern that covers ~100% and is absurdly complicated? Well, take my
  hand, and follow me into the next paragraph…
meta: Full dynamic control over async CSS using custom properties. All the buzzwords.

---

Last week I wrote about a [simple method to load CSS progressively](/2016/link-in-body/), and on the very same day some scientists taught gravity how to wave. Coincidence? Yes.

The pattern in the previous post covers the 90% case of multi-stage CSS loading, and it's really simple to understand. But would you like to hear about a pattern that covers ~100% and is absurdly complicated? Well take my hand, and follow me into the next paragraph…

# The missing 10%

`<link>`-in-`<body>` blocks the parser while CSS loads, meaning that rendering is blocked for all subsequent content. Taking [the demo page from last week's article](https://jakearchibald-demos.herokuapp.com/progressive-css/), rendering is split into the following phases:

<style>
.demo-structure h3 {
  margin-bottom: 18px;
}

@media (min-width: 400px) {
  .demo-layout {
    display: flex;
  }
  .demo-structure {
    flex: 1;
  }
  .demo-desktop {
    margin-left: 20px;
    flex: 2;
  }
  .demo-structure h3 {
    margin: 10px 0 18px;
  }
}


.demo-layout span {
  font-size: 1.7rem;
  margin: 0 0.3rem 0 0;
  vertical-align: middle;
}

.demo-header,
.demo-main,
.demo-comments,
.demo-secondary,
.demo-footer {
  background: #8A8A8A;
  color: #fff;
  margin: 3px 0;
  line-height: 1;
  font-size: 0.85rem;
  padding: 10px;
}

.demo-main {
  height: 70px;
}

.demo-comments,
.demo-secondary {
  height: 40px;
}

.demo-desktop .demo-cols {
  display: flex;
}

.demo-desktop .demo-main-col {
  flex: 1;
  margin-right: 3px;
}

.demo-desktop .demo-header {
  margin-bottom: 0;
}

.demo-desktop .demo-footer {
  margin-top: 0;
}
</style>
<div class="demo-layout">
  <div class="demo-structure">
    <h3>Mobile</h3>
    <div class="demo-header">
      <span>1</span> header
    </div>
    <div class="demo-cols">
      <div class="demo-main-col">
        <div class="demo-main">
          <span>2</span> main
        </div>
        <div class="demo-comments">
          <span>3</span> comments
        </div>
      </div>
      <div class="demo-secondary">
        <span>4</span> about-me
      </div>
    </div>
    <div class="demo-footer">
      <span>5</span> footer
    </div>
  </div>
  <div class="demo-structure demo-desktop">
    <h3>Desktop</h3>
    <div class="demo-header">
      <span>1</span> header
    </div>
    <div class="demo-cols">
      <div class="demo-main-col">
        <div class="demo-main">
          <span>2</span> main
        </div>
        <div class="demo-comments">
          <span>3</span> comments
        </div>
      </div>
      <div class="demo-secondary">
        <span>4</span> about-me
      </div>
    </div>
    <div class="demo-footer">
      <span>5</span> footer
    </div>
  </div>
</div>

This is perfect on mobile, where each section's CSS blocks itself and all following sections, but on desktop the CSS for `main` and `comments` in the left column blocks rendering of the `about-me` right column, even if `about-me`'s CSS loads first. This is because the blocking is based on source order, but in this design it'd be fine for the right column to display before the left column.

We want to build a dependency tree where each element is render-blocked until other specific elements have rendered. Also, dependencies need to be able to change when viewport width changes. Sounds fun right?

We can do this with CSS custom properties…

# CSS custom properties

[MDN has a great article on CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_variables), but for the sake of this article, here's all you need to know…

```css
html {
  background: var(--gloop, red);
}
```

Here we're asking the page background to be the value of custom property `--gloop`, else fallback to `red`. As a result, the background is red. But if we added:

```css
:root {
  --gloop: green;
}
```

…we've set the custom property `--gloop` to `green`, so now the page background is green. But if we added:

```css
:root {
  --gloop: initial;
}
```

`initial` gets special treatment here. It effectively unsets `--gloop`, so now the page background is back to red.

# Building a rendering dependency tree with CSS custom properties

Writing that heading made me feel really smart.

## The HTML

```html
<head>
  <link rel="stylesheet" href="/initial.css">
  <script>
    [
      '/main.css',
      '/comments.css',
      '/about-me.css',
      '/footer.css'
    ].map(url => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      document.head.appendChild(link);
    });
  </script>
</head>
```

So we load `/initial.css` via a `<link>`, or we could inline it, as long as it blocks rendering. But we load all the other stylesheets asynchronously.

## initial.css

```css
main,
.comments,
.about-me,
footer {
  display: none;
}

:root {
  --main-blocker: none;
  --comments-blocker: none;
  --about-me-blocker: none;
  --footer-blocker: none;
}

/* Rest of the initial styles… */
```

We hide all the sections we're not ready to render yet, then create a "blocker" custom property for each section.

## main.css

```css
:root {
  --main-blocker: initial;
}

main {
  display: var(--main-blocker, block);
}

/* Rest of the main styles… */
```

The main content doesn't have any render dependencies. As soon as the CSS loads it unsets its blocker (using `initial`) and displays itself.

## comments.css

```css
:root {
  --comments-blocker: var(--main-blocker);
}

.comments {
  display: var(--comments-blocker, block);
}

/* Rest of the comment styles… */
```

The comments shouldn't render before the main content, so the comments blocker is linked to `--main-blocker`. `.comments` becomes visible once this CSS loads and `--main-blocker` is unset.

## about-me.css

```css
:root {
  --about-me-blocker: var(--comments-blocker);
}

.about-me {
  display: var(--about-me-blocker, block);
}
```

Similar to above, `.about-me` depends on its own CSS and the comments. But when the page is wider it's displayed in two columns, so we no longer want `.about-me` to depend on the comments in terms of rendering:

```css
@media (min-width: 600px) {
  :root {
    --about-me-blocker: initial;
  }
}

/* Rest of the about-me styles… */
```

Done! When the viewport width is over `600px`, `.about-me` displays as soon as its CSS loads.

## footer.css

```css
:root {
  --footer-blocker: var(--main-blocker, var(--about-me-blocker));
}

footer {
  display: var(--footer-blocker, block);
}

/* Rest of the styles… */
```

The footer shouldn't render until both the main content & about-me sections have rendered. To achieve this, `--footer-blocker` gets its value from `--main-blocker`, but once `--main-blocker` is unset it falls back to getting its value from `--about-me-blocker`.

# Demo

**[View demo](https://jakearchibald-demos.herokuapp.com/progressive-css/async.html)** - requires Chrome Canary or Firefox.

In this demo the CSS is loaded async, with each sheet taking randomly between 0-5 seconds to load. Despite this, the page never renders out of order, and each section renders as soon as possible depending on the browser width.

# But… is it practical?

It's way more complicated than [progressive CSS](/2016/link-in-body/), with very little gain, and has a huge backwards compatibility problem. But it does show the power of CSS custom properties, you can't do this with compile-time solutions like Sass variables.

If you really want to do something like this today, you can get most of the way there by async loading your CSS with [`loadCSS`](https://github.com/filamentgroup/loadCSS), and adding class names to `<html>` as particular styles load ([**view demo**](https://jakearchibald-demos.herokuapp.com/progressive-css/async-now.html)), although this lands you with a lot of specificity issues to hack through.

I think this post should be filed under "fun demo", but we're only just starting to discover the power of CSS custom properties.

<small>Thanks to Remy Sharp for corrections. Will I ever post an article without spelling mistakes? Noep.</small>
