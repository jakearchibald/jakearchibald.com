---
title: Combining fonts
date: 2017-04-28 15:05:35
summary: I love the font [Just Another
  Hand](https://fonts.google.com/specimen/Just+Another+Hand), but I don't like
  the positioning of the hyphen & equals glyphs. Thankfully I can use CSS fonts
  to fix it!
mindframe: ""
image: ""
meta: Using @font-face to replace glyphs of one font with another.

---

<style>
@font-face {
  font-family: 'Just Another Hand';
  font-style: normal;
  font-weight: 400;
  src: local('Just Another Hand'), local('JustAnotherHand-Regular'), url(https://fonts.gstatic.com/s/justanotherhand/v7/fKV8XYuRNNagXr38eqbRf2bHIGFY9zRy9KAPVD43QdU.woff2) format('woff2'), url(https://fonts.gstatic.com/s/justanotherhand/v7/fKV8XYuRNNagXr38eqbRf8-ortBJrX8dG4H9Ox7zsWc.woff) format('woff');
}

@font-face {
  font-family: 'Just Another Hand Fixed';
  font-style: normal;
  font-weight: 400;
  src: local('Just Another Hand'), local('JustAnotherHand-Regular'), url(https://fonts.gstatic.com/s/justanotherhand/v7/fKV8XYuRNNagXr38eqbRf2bHIGFY9zRy9KAPVD43QdU.woff2) format('woff2'), url(https://fonts.gstatic.com/s/justanotherhand/v7/fKV8XYuRNNagXr38eqbRf8-ortBJrX8dG4H9Ox7zsWc.woff) format('woff');
}

@font-face {
  font-family: "Just Another Hand Fixed";
  src: local('Architects Daughter'), local('ArchitectsDaughter'), url(https://fonts.gstatic.com/l/font?kit=RXTgOOQ9AAtaVOHxx0IUBDrRnkt4rmSI6qS07ibfugwWYsZpeeE_lScv_WSQELyh&skey=d34ee9a1a308e98b&v=v6) format('woff2'), url(https://fonts.gstatic.com/l/font?kit=RXTgOOQ9AAtaVOHxx0IUBAgVrDCMKncvdxTxFP2hhz8WYsZpeeE_lScv_WSQELyh&skey=d34ee9a1a308e98b&v=v6) format('woff');
  unicode-range: U+2d, U+3d;
}

.jah-demo,
.jah-fixed-demo {
  font: normal 2.5rem/1 "Just Another Hand";
  margin: 1.3rem 0 0.9rem;
  text-align: center;
}

@media (min-width: 435px) {
  .jah-demo,
  .jah-fixed-demo {
    font: normal 3.5rem/1 "Just Another Hand";
    margin: 1.5rem 0 0.9rem;
  }
}

.jah-fixed-demo {
  font-family: "Just Another Hand Fixed";
}
</style>

I love the font [Just Another Hand](https://fonts.google.com/specimen/Just+Another+Hand), I use it a lot in diagrams during my talks:

<figure class="full-figure" style="background: #eee">
<div class="jah-demo">Here it is! Yay!</div>
</figure>

The thing is, I don't like the positioning of the hyphen & equals glyphs…

<figure class="full-figure" style="background: #eee">
<div class="jah-demo">Cache-Control: max-age=3600</div>
</figure>

They look awkwardly positioned – they sit too high.

Thankfully CSS lets you merge fonts together, so I can create a single font family that's like Just Another Hand, except it takes the hyphen & equals glyphs from a different font, [Architects Daughter](https://fonts.google.com/specimen/Architects+Daughter):

<figure class="full-figure" style="background: #eee">
<div class="jah-fixed-demo">Cache-Control: max-age=3600</div>
</figure>

# How it works

The `@font-face` is defined as usual:

```css
@font-face {
  font-family: 'Just Another Hand Fixed';
  font-style: normal;
  font-weight: 400;
  src: local('Just Another Hand'), local('JustAnotherHand-Regular'),
       url('https://fonts.gstatic.com/…woff2') format('woff2'),
       url('https://fonts.gstatic.com/…woff') format('woff');
}
```

But I added another `@font-face` of the same name for the hyphen & equals glyphs:

```css
@font-face {
  font-family: 'Just Another Hand Fixed';
  src: local('Architects Daughter'), local('ArchitectsDaughter'),
       url('https://fonts.gstatic.com/l/…') format('woff2'),
       url('https://fonts.gstatic.com/l/…') format('woff');
  unicode-range: U+2d, U+3d;
}
```

The trick is in the `unicode-range` descriptor. It indicates that the `src` should only be used for the hyphen (`U+2d`) and equals (`U+3d`) code points. You can turn a unicode character into a code point using this snippet:

```js
'='.codePointAt(0).toString(16); // "3d"
```

As an optimisation, I used [Google fonts' text parameter](https://fonts.googleblog.com/2011/04/streamline-your-web-font-requests.html) to subset the "Architects Daughter" font, so it only contains the hyphen & equals glyphs. The woff2 version is 500 bytes – not bad!

And that's it. Now when I use:

```css
.whatever {
  font-family: 'Just Another Hand Fixed';
}
```

…it uses a combination of both fonts!

# Update: Do you need unicode-range?

A couple of people on Twitter and in the comments have suggested you don't need `unicode-range`, and you can just do:

```css
/* Subsetted font */
@font-face {
  font-family: 'Just Another Hand Fixed';
  src: url('https://fonts.gstatic.com/l/…') format('woff2') …;
}

/* Main font */
@font-face {
  font-family: 'Just Another Hand Fixed';
  src: url('https://fonts.gstatic.com/…woff2') format('woff2') …;
}
```

This works visually, but it's worse in terms of performance.

In this case the browser downloads the subsetted font first, then it realises it doesn't have all the glyphs it needs, so it starts downloading the main font. The fonts download one after the other.

**[Live demo](https://output.jsbin.com/sukaceq/quiet)**. **[Network waterfall](http://www.softwareishard.com/har/viewer/?inputUrl=https://cdn.rawgit.com/jakearchibald/7d5f7526f889aa0855aceaa348f020bc/raw/2c01a336ee3e2f10e68c1f62e77a7690f946f8bc/1.js)**.

Whereas with the unicode-range solution, the browser knows what it needs in advance, so it can download the fonts in parallel.

**[Live demo](https://output.jsbin.com/laramad/quiet)**. **[Network waterfall](http://www.softwareishard.com/har/viewer/?inputUrl=https://cdn.rawgit.com/jakearchibald/7d5f7526f889aa0855aceaa348f020bc/raw/5c5423286ec969e7194430b0671469a1168072d1/1.js)**.

Also, if you don't use one of the subsetted characters, the browser knows it doesn't need to download the font at all!

**[Live demo](https://output.jsbin.com/cunode/quiet)**. **[Network waterfall](http://www.softwareishard.com/har/viewer/?inputUrl=https://cdn.rawgit.com/jakearchibald/7d5f7526f889aa0855aceaa348f020bc/raw/4030ff99fa0744040ff694bb56ca045dd68592c8/1.js)**.
