---
title: Controlling when CSS custom property values are computed
date: 2026-08-26 01:00:00
summary: The default might not be what you expect, and it has a big impact on your styles.
meta: The default might not be what you expect, and it has a big impact on your styles.
code: shiki
image: './img.png'
comments: none
---

When and how CSS custom property values are calculated might not be what you expect, and it has a big impact on your styles.

# The default

Take this HTML:

```html
<div></div>
<div class="second-item">
  <p>…</p>
</div>
```

And this CSS:

```css
.second-item {
  --index: sibling-index();

  & > :first-child {
    scale: var(--index);
  }
}
```

If you're unfamiliar with `sibling-index()`, here's a quick video intro I posted recently:

<style>
  .social-links {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.7em;
    margin: 1.5em 0;
    padding: 0;
    list-style: none;
  }
  .social-links li {
    margin: 0;
  }
  .social-links a {
    display: flex;
    align-items: center;
    gap: 0.5em;
    padding: 0.35em 0.9em 0.35em 0.35em;
    line-height: 1;
  }
  .social-links img {
    display: block;
    width: 28px;
    height: 28px;
    border-radius: 7px;
  }
  .social-label {
    text-box: cap alphabetic;
  }
</style>

<ul class="social-links">
  <li>
    <a target="_blank" href="https://www.instagram.com/reel/Dcds4AjD4qo/">
      <img src="asset-url:static-build/imgs/social-icons/instagram.svg" alt="" width="28" height="28" /><span class="social-label">Instagram</span>
    </a>
  </li>
  <li>
    <a target="_blank" href="https://www.tiktok.com/@firefoxwebdevs/video/7677956182056733984">
      <img src="asset-url:static-build/imgs/social-icons/tiktok.svg" alt="" width="28" height="28" /><span class="social-label">TikTok</span>
    </a>
  </li>
  <li>
    <a target="_blank" href="https://youtube.com/shorts/SSD_rbPhn_s?feature=share">
      <img src="asset-url:static-build/imgs/social-icons/youtube.svg" alt="" width="28" height="28" /><span class="social-label">YouTube</span>
    </a>
  </li>
</ul>

The question is, how much is the paragraph going to scale?

`sibling-index()` is 1-indexed, but is it going to pick up the index of the second div - where the custom property is defined, or its first child - where the custom property is used? The answer is: it depends.

If the code is taken in isolation, the value of the custom property will be stored as a token stream, so it's computed a little like this:

```css
.second-item {
  --index: sibling-index();
  /* …Which computes to: */
  --index: sibling-index();
  /* (as in, no change) */

  & > :first-child {
    scale: var(--index);
    /* …Which is substituted for: */
    scale: sibling-index();
    /* …Which computes to: */
    scale: 1;
  }
}
```

So the `var()` is substituted for `sibling-index()`, which is evaluated in that context. Since the paragraph is the first child of its parent, it will scale by 1.

This is reflected in `getComputedStyle()`:

```js
const div = document.querySelector('.second-item');
console.log(getComputedStyle(div).getPropertyValue('--index'));
// Logs: "sibling-index()"
```

But that's just the default…

# Changing the default

Let's register that custom property:

```css
@property --index {
  syntax: '<number>';
  inherits: true;
  initial-value: 0;
}
```

Custom properties you haven't registered behave as if they have `syntax: '*'`, meaning 'anything', which computes to a token stream as before. But here we're using `'<number>'`, meaning it computes the value as a number:

```css
.second-item {
  --index: sibling-index();
  /* …Which computes to: */
  --index: 2;

  & > :first-child {
    scale: var(--index);
    /* …Which is substituted for: */
    scale: 2;
    /* …Which computes to: */
    scale: 2;
  }
}
```

Registering the custom property & giving it a syntax meant the full value was computed earlier, in a different context, so the result was different.

Again, this is reflected in `getComputedStyle()`:

```js
const div = document.querySelector('.second-item');
console.log(getComputedStyle(div).getPropertyValue('--index'));
// Logs: "2"
```

And it's not just `sibling-index()` that behaves this way. This also impacts relative font units (`em`, `ex`, `ch`, `cap`, `lh` etc.), container query units (`cqw`, `cqi`, `cqb` etc.), and more. In all these cases, `@property` controls which element the values are computed against.

Another thing that's impacted, although slightly differently, is URLs. In CSS, URLs are generally resolved against the stylesheet's base URL at computed-value time - so if a token-stream custom property is defined in one stylesheet and `var()`'d from another, the URL resolves against the consuming stylesheet. Registering the custom property with `syntax: '<url>'` pins it to the stylesheet that declared it.

# But what about var()?

Here's a trickier example:

```css
.second-item {
  --multiplier: 1;
  --index: calc(sibling-index() * var(--multiplier));

  & > :first-child {
    --multiplier: 3;
    scale: var(--index);
  }
}
```

What happens here? Well, `var()` behaves differently to `sibling-index()`. `var()` is an ["arbitrary substitution function"](https://drafts.csswg.org/css-values-5/#arbitrary-substitution-function), along with a bunch of other functions like `if()`, `attr()`, and `ident()`. These are substituted regardless of the syntax of the custom property. So:

```css
.second-item {
  --multiplier: 1;
  --index: calc(sibling-index() * var(--multiplier));
  /* …Which is substituted for: */
  --index: calc(sibling-index() * 1);
}
```

What happens next depends on the defined syntax of `--index`. It'll either stay as the above token stream, or it'll compute down to `2` - the same rules as before. In both cases, `--multiplier: 3` on the child is ignored.

This was a detail of CSS that I sort-of half-knew, as in, I knew `@property` changed computation timing somehow, but I hadn't fully understood when or how, until I looked it up today. I hope you understand it now too!
