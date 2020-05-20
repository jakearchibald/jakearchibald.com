---
title: The future of loading CSS
date: 2016-02-11 15:24:25
summary: Chrome is intending to [change the behaviour of `<link
  rel="stylesheet">`](https://groups.google.com/a/chromium.org/forum/#!topic/blink-dev/ZAPP8aTnyn0),
  which will be noticeable when it appears within `<body>`. The impact and
  benefits of this aren't clear from the blink-dev post, so I wanted to go into
  detail here.
mindframe: '- totally overshadowed by some waving gravity thing. Thanks Einstein.'
image: ''
meta: Chrome is intending to change the behaviour of <link> in <body>, which
  allows for better ways to load CSS
---

Chrome is intending to [change the behaviour of `<link rel="stylesheet">`](https://groups.google.com/a/chromium.org/forum/#!topic/blink-dev/ZAPP8aTnyn0), which will be noticeable when it appears within `<body>`. The impact and benefits of this aren't clear from the blink-dev post, so I wanted to go into detail here.

**Update:** This is [now in Chrome Canary](https://twitter.com/jaffathecake/status/829999531429392385).

# The current state of loading CSS

```html
<head>
  <link rel="stylesheet" href="/all-of-my-styles.css" />
</head>
<body>
  …content…
</body>
```

CSS blocks rendering, leaving the user staring at a white screen until `all-of-my-styles.css` fully downloads.

It's common to bundle all of a site's CSS into one or two resources, meaning the user downloads a large number of rules that don't apply to the current page. This is because sites can contain many types of pages with a variety of "components", and delivering CSS at a component level hurts performance in HTTP/1.

This isn't the case with SPDY and HTTP/2, where many smaller resources can be delivered with little overhead, and independently cached.

```html
<head>
  <link rel="stylesheet" href="/site-header.css" />
  <link rel="stylesheet" href="/article.css" />
  <link rel="stylesheet" href="/comment.css" />
  <link rel="stylesheet" href="/about-me.css" />
  <link rel="stylesheet" href="/site-footer.css" />
</head>
<body>
  …content…
</body>
```

This fixes the redundancy issue, but it means you need to know what the page will contain when you're outputting the `<head>`, which can prevent streaming. Also, the browser still has to download all the CSS before it can render anything. A slow loading `/site-footer.css` will delay the rendering of _everything_.

[**View demo**](https://jakearchibald-demos.herokuapp.com/progressive-css/head.html).

# The current state-of-the-art of loading CSS

```html
<head>
  <script>
    // https://github.com/filamentgroup/loadCSS
    !(function (e) {
      'use strict';
      var n = function (n, t, o) {
        function i(e) {
          return f.body
            ? e()
            : void setTimeout(function () {
                i(e);
              });
        }
        var d,
          r,
          a,
          l,
          f = e.document,
          s = f.createElement('link'),
          u = o || 'all';
        return (
          t
            ? (d = t)
            : ((r = (f.body || f.getElementsByTagName('head')[0]).childNodes),
              (d = r[r.length - 1])),
          (a = f.styleSheets),
          (s.rel = 'stylesheet'),
          (s.href = n),
          (s.media = 'only x'),
          i(function () {
            d.parentNode.insertBefore(s, t ? d : d.nextSibling);
          }),
          (l = function (e) {
            for (var n = s.href, t = a.length; t--; )
              if (a[t].href === n) return e();
            setTimeout(function () {
              l(e);
            });
          }),
          s.addEventListener &&
            s.addEventListener('load', function () {
              this.media = u;
            }),
          (s.onloadcssdefined = l),
          l(function () {
            s.media !== u && (s.media = u);
          }),
          s
        );
      };
      'undefined' != typeof exports ? (exports.loadCSS = n) : (e.loadCSS = n);
    })('undefined' != typeof global ? global : this);
  </script>
  <style>
    /* The styles for the site header, plus: */
    .main-article,
    .comments,
    .about-me,
    footer {
      display: none;
    }
  </style>
  <script>
    loadCSS('/the-rest-of-the-styles.css');
  </script>
</head>
<body></body>
```

In the above, we have some inline styles to get us a fast initial render, plus hide the stuff we don't have styles for yet, then load the rest of the CSS async using JavaScript. The rest of the CSS would override the `display: none` on `.main-article` etc.

This method is [recommended by](https://developers.google.com/speed/docs/insights/OptimizeCSSDelivery) [performance](https://www.filamentgroup.com/lab/performance-rwd.html)
[experts](http://www.lukew.com/ff/entry.asp?1756) as a way to get a fast first render, and with good reason:

[**View demo**](https://jakearchibald-demos.herokuapp.com/progressive-css/two-phase.html).

In the real world, I did this [wiki-offline](https://wiki-offline.jakearchibald.com/), and it worked a treat:

<figure class="full-figure" style="background: #eee; overflow: hidden;">
<div style="overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling: touch"><img src="asset-url:./wpt.png" alt="" style="height:213px;max-width:none"></div>
<figcaption>0.6s faster first render on 3g. Full results <a href="http://www.webpagetest.org/video/compare.php?tests=160202_WJ_KTY-r%3A2-c%3A0&thumbSize=200&ival=100&end=visual">before</a> vs <a href="http://www.webpagetest.org/video/compare.php?tests=160202_TD_KMQ-r%3A2-c%3A0&thumbSize=200&ival=100&end=visual">after</a>.</figcaption>
</figure>

But there are a couple of shortfalls:

## It requires a (small) JavaScript library

Unfortunately this is due to WebKit's implementation. As soon as a `<link rel="stylesheet">` is added to the page, WebKit blocks rendering until the sheet loads, even if the sheet was added with JavaScript.

In Firefox and IE/Edge, JS-added stylesheets load entirely async. Chrome stable currently has the WebKit behaviour, but in Canary we've switched to the Firefox/Edge behaviour.

## You're restricted to two phases of loading

In the pattern above, inline CSS hides unstyled content using `display:none`, then the async-loaded CSS reveals it. If you scale this to two or more CSS files they're likely to load out-of-order, resulting in content shifting around as it loads:

[**View demo**](https://jakearchibald-demos.herokuapp.com/progressive-css/naive.html).

Content shifting around is [right up there with pop-up ads](https://www.youtube.com/watch?v=uPnEZd6wCtk) in terms of user frustration. Kill it with fire.

Since you're restricted to two phases of loading, you have to decide what's in your quick first render and what's in the rest. You want "above the fold" content in the quick render of course, but "the fold" is viewport dependent. Well, tough shitties, you've got to pick a one-size-fits-all solution.

**Update:** If you want to make things really complicated, you can [build a kind-of rendering dependency tree using CSS custom properties](/2016/css-loading-with-custom-props/).

# A simpler, better way

```html
<head> </head>
<body>
  <!-- HTTP/2 push this resource, or inline it, whichever's faster -->
  <link rel="stylesheet" href="/site-header.css" />
  <header>…</header>

  <link rel="stylesheet" href="/article.css" />
  <main>…</main>

  <link rel="stylesheet" href="/comment.css" />
  <section class="comments">…</section>

  <link rel="stylesheet" href="/about-me.css" />
  <section class="about-me">…</section>

  <link rel="stylesheet" href="/site-footer.css" />
  <footer>…</footer>
</body>
```

The plan is for each `<link rel="stylesheet">` to block rendering of subsequent content while the stylesheet loads, but allow the rendering of content before it. The stylesheets load in parallel, but they apply in series. This makes `<link rel="stylesheet">` behave similar to `<script src="…"></script>`.

Let's say the site-header, article, and footer CSS have loaded, but the rest are still pending, here's how the page would look:

- Header: rendered
- Article: rendered
- Comments: not rendered, CSS before it hasn't loaded yet (`/comment.css`)
- About me: not rendered, CSS before it hasn't loaded yet (`/comment.css`)
- Footer: not rendered, CSS before it hasn't loaded yet (`/comment.css`), even though its own CSS has loaded

This gives you a sequential render of the page. You don't need decide what's "above the fold", just include a page component's CSS just before the first instance of the component. It's fully streaming compatible, because you don't need to output the `<link>` until just before you need it.

You need to take care when using layout systems where content dictates layout (such as tables & flexbox) to avoid content-shifting during load. This isn't a new problem, but progressive rendering can expose it more frequently. You can hack flexbox to behave, but [CSS grid is a much better system for overall page layout](/2014/dont-use-flexbox-for-page-layout/) (flexbox is still great for smaller components).

# Changes to Chrome

[The HTML spec](https://html.spec.whatwg.org/multipage/semantics.html#the-link-element) doesn't cover how page rendering should be blocked by CSS, and it discourages `<link rel="stylesheet">` in the body, but all browsers allow it. Of course, they all deal with link-in-body in their own way:

- **Chrome & Safari:** Stops rendering as soon as the `<link rel="stylesheet">` is discovered, and won't render until all discovered stylesheets have loaded. This often results in unrendered content _above_ the `<link>` being blocked.
- **Firefox**: `<link rel="stylesheet">` in the head blocks rendering until all discovered stylesheets have loaded. `<link rel="stylesheet">` in the body does not block rendering _unless_ a stylesheet in the head is already blocking rendering. This can result in a flash of unstyled content (FOUC).
- **IE/Edge**: Blocks the parser until the stylesheet loads, but allows content above the `<link>` to render.

At Chrome, we like the IE/Edge behaviour, so we're going to align with it. This allows the progressive rendering pattern of CSS described above. We're working on getting this into the spec, starting with allowing [`<link>` in `<body>`](https://github.com/whatwg/html/pull/616).

The current Chrome/Safari behaviour is backwards compatible, it just ends up blocking rendering for longer than it needs to. The Firefox behaviour is slightly more complicated, but there's a workaround…

## Firefixing

Because Firefox doesn't always block rendering for link-in-body, we'll need to work around it a bit to avoid a FOUC. Thankfully this is pretty easy, as `<script>` blocks parsing, but also waits for pending stylesheets to load:

```html
<link rel="stylesheet" href="/article.css" />
<script></script>
<main>…</main>
```

The script elements have to be non-empty for this to work, a space is good enough.

# See it in action!

[**View demo**](https://jakearchibald-demos.herokuapp.com/progressive-css/).

Firefox & Edge/IE will give you a lovely progressive render, whereas Chrome & Safari give you a white screen until all the CSS loads. The current Chrome/Safari behaviour is no worse than putting all your stylesheets in the `<head>`, so you can start using this method today. Over the coming months, Chrome will move to the Edge model, and more users will get a faster render.

So there we go! A much simpler way to load only the CSS you need, and get a faster render in the process.

<small>Thanks to [@lukedjn](https://twitter.com/lukedjn), Paul Lewis, and Domenic Denicola for corrections. Thanks in particular to Boris Zbarsky who helped me understand the Firefox behaviour. Also Paul came up with the "Firefixing" joke but I'm hoping you're not reading this so I can take full credit myself.</small>
