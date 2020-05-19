---
title: "visibility: visible undoes visibility: hidden"
date: 2014-04-01 00:00:00
summary: "If you set an element to `display: none` the browser ignores all of
  its children, if a child sets itself to `display: block` it will remain
  hidden. This isn't true of `visibility`."
mindframe: "- hey at least it's not another promises article"
image: null
meta: ""

---

<style>
html.show-only-the-button {
  visibility: hidden;
}
html.show-only-the-button .the-button {
  visibility: visible;
}
</style>

If you set an element to `display: none` the browser ignores all of its children, if a child sets itself to `display: block` it will remain hidden. This isn't true of `visibility`.

# Serious?

Serious.

```css
html.show-only-the-button {
  visibility: hidden;
}
html.show-only-the-button .the-button {
  visibility: visible;
}
```

<button class="the-button btn">Toggle everything but this</button>

So says the spec:

<blockquote class="quote"><p><strong>hidden</strong>: The generated box is invisible (fully transparent, nothing is drawn), but still affects layout. Furthermore, descendants of the element will be visible if they have 'visibility: visible'.</p>&mdash; <a href="http://www.w3.org/TR/CSS2/visufx.html#visibility">CSS 2.1</a></blockquote>

I've found this useful when testing paint-related issues, as you can isolate a particular element without disrupting layout.

# Further reading

* [Having fun with `<image>`](/2013/having-fun-with-image/) - another spec oddity
* [Animated line drawing in SVG](http://jakearchibald.com/2013/animated-line-drawing-svg/)

<script>
  document.querySelector('.the-button').addEventListener('click', function(event) {
    document.documentElement.classList.toggle('show-only-the-button');
    event.preventDefault();
  });
</script>