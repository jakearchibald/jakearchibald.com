---
title: The performance benefits of rel=noopener
date: 2016-07-21 13:55:02
mindframe: ""
summary: '`rel="noopener"` prevents opened pages tampering with the original
  page, but it also has a performance benefit.'
meta: ""

---

If you have links to another origin, you should use `rel="noopener"`, especially if they open in a new tab/window.

```html
<a href="http://example.com" target="_blank" rel="noopener">
   Example site
</a>
```

Without this, the new page can access your window object via `window.opener`. Thankfully the origin security model of the web prevents it reading your page, but no-thankfully some legacy APIs mean it *can* navigate your page to a different URL using `window.opener.location = newURL`.

Web superhero Mathias Bynens [wrote about this in detail](https://mathiasbynens.github.io/rel-noopener/), but I just discovered there's a performance benefit too.

# Demo

<p class="rand-p"><button class="btn generate-random">Generate random numbers</button> <span class="rands"></span></p>

The random numbers act like a heartbeat for this page. If random numbers aren't being generated every frame, something is holding up the thread.

Now click one of these to open a page that runs some expensive JavaScript:

* <a href="https://cdn.rawgit.com/jakearchibald/787311bb8645ed3f65cc98ea74ebf269/raw/5316ed16abfa4b2bd0125f2d2aa5fec06394befb/index.html" target="_blank">`<a target="_blank">`</a>
* <a href="https://cdn.rawgit.com/jakearchibald/787311bb8645ed3f65cc98ea74ebf269/raw/5316ed16abfa4b2bd0125f2d2aa5fec06394befb/index.html" target="_blank" rel="noopener">`<a target="_blank" rel="noopener">`</a>

Without `rel="noopener"`, the random numbers are disrupted by the new page's JavaScript. Not only that, all main-thread activity is disrupted - try selecting text on the page. But with `rel="noopener"` the random numbers keep generating at 60fps. Well, in Chrome & Opera anyway. 

**Update:** Edge doesn't experience jank for either link because it doesn't support `window.opener` for `_blank` links.

<style>
.rand-p {
  display: flex;
}
.rands {
  flex: 1;
  text-align: right;
}
</style>
<script>
(function() {
  var btn = document.querySelector('.generate-random');
  var originalText = btn.textContent;
  var on = false;
  var rands = document.querySelector('.rands');

  function generateRandomNumbers() {
    if (!on) return;
    rands.textContent = Math.random();
    requestAnimationFrame(generateRandomNumbers);
  }

  document.querySelector('.generate-random').addEventListener('click', function(event) {
    if (!on) {
      btn.textContent = 'Stop it';
      on = true;
      generateRandomNumbers();
    }
    else {
      btn.textContent = originalText;
      rands.textContent = '';
      on = false;
    }
  });
})();
</script>

So why does this happen?

# Windows & processes

Most browsers are multi-process with the exception of Firefox (and [they're working on it](https://developer.mozilla.org/en-US/Firefox/Multiprocess_Firefox)). Each process has multiple threads, including what we often call the "main" thread. This is where parsing, style calculation, layout, painting and non-worker JavaScript runs. This means JavaScript running on one domain runs on a different thread to a window/tab running another domain.

However, due to the synchronous cross-window access the DOM gives us via `window.opener`, windows launched via `target="_blank"` end up in the same process & thread. The same is true for iframes and windows opened via `window.open`.

`rel="noopener"` prevents `window.opener`, so there's no cross-window access. Chromium browsers optimise for this and open the new page in its own process.

# Site isolation

Here in Chrome HQ we're looking at [moving cross-domain iframes and new windows into their own process](http://www.chromium.org/developers/design-documents/site-isolation) even if they don't have `rel="noopener"`. This means the limited cross-window access will become asynchronous, but the benefit is improved security and performance.

In the meantime, `rel="noopener"` gives you the performance & security benefit today!

<small>Fun fact: Note I talk about "domain" above rather than "origin". This is because the somewhat frightening [`document.domain`](https://developer.mozilla.org/en-US/docs/Web/API/Document/domain) allows two domains to synchronously become part of the same origin. Ugh.</small>