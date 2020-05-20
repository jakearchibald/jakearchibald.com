---
title: Minimising font downloads
date: 2014-08-19 00:00:32
summary: Optimising fonts is pretty difficult for larger sites. There's an easy
  solution, although only some browsers support it.
mindframe: ''
image: null
meta: ''
---

Optimising fonts is pretty difficult for larger sites. There's an easy solution, although only some browsers support it.

## Translations

- [Français](http://tdd.github.io/translations/articles/jake-font-dls.html)

# Fonts can be big

Really big. They can be anywhere from 70k to many megabytes (compressed of course, because why wouldn't you?). You want bold? Well, you just doubled the size. Italic? Tripled. Bold-italic? Quadrupled. This is a huge deal if those fonts are blocking the rendering of primary content, which they often are.

Sub-setting the font helps a lot by getting rid of all the characters that aren't needed. That usually brings the font under 50k.

But what characters do you keep? Pretty tough to answer if your site has a lot of content, or if users can create content. If characters outside the subset are used, they'll fallback and look pretty ugly.

<style>
  @font-face {
    font-family: montserrat-custom;
    src: url('http://themes.googleusercontent.com/licensed/font?kit=z2n1Sjxk9souK3HCtdHukrNhCmVpBOQ2WMJkEJKYByGbbUIe-aJh71RSrCgHW3wA') format('woff');
    font-weight: normal;
  }
</style>

<figure class="full-figure" style="background: #eee">
<div style="text-align:center; font-family: montserrat-custom, sans-serif; font-size: 3.6rem; margin: 0">Cohérent</div>
<figcaption>Note how the 'é' is a different typeface to the 'e'</figcaption>
</figure>

You either live with the occasional ugliness, or be conservative with your sub-setting which lands you back with a heavy font download.

But there's a better solution!

# Just let the browser deal with it

Take a rough guess at which chars most pages will use, create a subset, but create another resource containing additional characters:

```css
/* Small subset, normal weight */
@font-face {
  font-family: whatever;
  src: url('reg-subset.woff') format('woff');
  unicode-range: U+0-A0;
  font-weight: normal;
}
/* Large subset, normal weight */
@font-face {
  font-family: whatever;
  src: url('reg-extended.woff') format('woff');
  unicode-range: U+A0-FFFF;
  font-weight: normal;
}
/* Small subset, bold weight */
@font-face {
  font-family: whatever;
  src: url('bold-subset.woff') format('woff');
  unicode-range: U+0-A0;
  font-weight: bold;
}
/* Large subset, bold weight */
@font-face {
  font-family: whatever;
  src: url('bold-extended.woff') format('woff');
  unicode-range: U+A0-FFFF;
  font-weight: bold;
}
/* And use the font: */
p {
  font-family: whatever, serif;
}
```

The above contains multiple definitions for the same font-family name but with different `font-weight` & `unicode-range` combinations. The unicode range `U+0-A0` covers basic letters numbers and punctuation. This tells the browser that a bold 'e' glyph can be found at `bold-subset.woff`, whereas a normal weight 'é' can be found at `reg-extended.woff`

A browser can be smart about this and fetch the minimum required to render the page. If the page uses characters outside of that range, the extra font is downloaded in parallel.

You should still provide a suitable fallback in case the font doesn't download in time or the browser doesn't understand the format.

# Demo

[Take a look](/demos/font-subsetting/).

Optimally, the browser should only download the normal sub-setted resource. If you edit the text to include, say 'ö', the browser should fetch an additional font.

# Browser support

Ok, here's the bad news:

- **Safari**: Downloads all the fonts
- **Internet Explorer**: Also downloads all the fonts
- **Firefox**: Only downloads one font, but the wrong font, leaving rendering broken
- **Chrome**: Does the right thing, only downloads the normal subsetted font
- **Opera**: Same as Chrome

This is pretty bad new for IE and Safari, they end up downloading 300k rather than 30k in this example. It gets much worse if you add in italic & bold-italic, as IE & Safari will download those too, even if they're not used.

## What's going on with Firefox?

<figure class="full-figure" style="background: #eee; overflow: hidden;">
<img src="asset-url:./firefox.png" alt="" style="max-width: 337px; margin: 11px auto; width: 100%">
<figcaption>Incorrect Firefox rendering</figcaption>
</figure>

Firefox does the right thing with `font-weight`, it only downloads what the page uses, unfortunately it ignores `unicode-range`. The "reg-extended" font declaration overwrites the "reg-subset" one, but only because of the source order. "reg-extended" is used to render the page, but it doesn't contain all the characters, so fallbacks are used. Of course, "sans-serif" would have been a better fallback, but I wanted to highlight the problem.

But if it's only using the extended font, how are _most_ of the characters are rendering correctly? You wouldn't expect 'o' to be part of the extended set, but it is. In order to be efficient within the font, `ö` is a combination of the `o` and `¨` glyphs. Although we didn't want to keep 'o' in the extended font it's retained because other glyphs depend on it.

<figure class="full-figure" style="background: #eee; overflow: hidden;">
<img src="asset-url:./e.png" alt="" style="max-width: 353px; margin: 3px auto; width: 100%">
<figcaption>Einstein's theory of glyph reuse</figcaption>
</figure>

No glyphs reuse 'F' or 'b', so they're not in the extended font.

Firefox isn't paying attention to `unicode-range` at all. As well as providing a hint for downloads, `unicode-range` dictates which characters the browser should use from the font, even if it contains others.

You can work around the Firefox issue by including all glyphs in the final fonts listed for your subsets ("reg-extended" and "bold-extended" in this case), or separate your subsets into different font families:

```css
/* Small subset, normal weight */
@font-face {
  font-family: whatever;
  src: url('reg-subset.woff') format('woff');
  unicode-range: U+0-A0;
  font-weight: normal;
}
/* Large subset, normal weight */
@font-face {
  font-family: whatever-extended;
  src: url('reg-extended.woff') format('woff');
  unicode-range: U+A0-FFFF;
  font-weight: normal;
}
/* And use the font: */
p {
  font-family: whatever, whatever-extended, serif;
}
```

[Here's a demo of that](/demos/font-subsetting/two-families.html). Firefox downloads both fonts regardless of whether it needs them, but at least the rendering is correct.

# Push for this to be fixed!

When it works, this is a great feature, especially for sites that handle a variety of locales, sites that allow users can submit their own content, or even just for downloading that fancy-ampersand font only when it's needed. If it's useful to you, tell browser vendors (including your use-case):

- **Safari**: [Download only needed weights](https://bugs.webkit.org/show_bug.cgi?id=113715), [Download only needed ranges](https://bugs.webkit.org/show_bug.cgi?id=42154)
- **Internet Explorer** [Download only needed weights](https://connect.microsoft.com/IE/feedbackdetail/view/949871/), [Download only needed ranges](https://connect.microsoft.com/IE/feedbackdetail/view/789754) - last year they indicated they have no intention of implementing this, hopefully they'll change their mind
- **Firefox**: [Support `unicode-range`](https://bugzilla.mozilla.org/show_bug.cgi?id=475891)

# In the meantime

If you're already serving a large font, consider splitting it into multiple files with different unicode-ranges. Give each of them a different `font-family` name to work around Firefox issues.

IE, Firefox & Safari will download more than they need, but only the equivalent of the one large font they had before. Chrome and Opera users will get a faster experience, and hopefully this enhancement will land in other browsers.

# Further reading

- [WOFF2](https://gist.github.com/sergejmueller/cf6b4f2133bcb3e2f64a) - supported by Chrome & Opera, reduces font resources by a further ~20%
