---
title: The anatomy of responsive images
date: 2015-09-03 00:37:01
summary: I just had my responsive images epiphany and I'm writing it all down
  before I forget everything. This is what I know…
mindframe: ''
image: null
meta: ''
---

I just had my responsive images epiphany and I'm writing it all down before I forget everything. This is what I know…

# Fixed size, varying density

If your image is a fixed size in pixels, but you want to cater for screens of different density, here's the solution:

<link href='https://fonts.googleapis.com/css?family=Just+Another+Hand|Inconsolata:700' rel='stylesheet' type='text/css'><style>
  .img-diagram-figure {
    position: relative;
  }
  .img-diagram-figure svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
</style>
<figure class="img-diagram-figure">
  <div style="padding-top: 53%"></div>
  <svg viewBox="0 0 679 363" class="img-d-1"><style>.img-d-1 .st0{fill:#5F6464;} .img-d-1 .st1{font-family:Inconsolata; font-weight: bold;} .img-d-1 .st2{font-size:26.9775px;} .img-d-1 .st3{fill:#C92C2C;} .img-d-1 .st4{fill:#309D47;} .img-d-1 .st5{fill:#1990B8;} .img-d-1 .st6{font-family:'Just Another Hand';} .img-d-1 .st7{font-size:42.9124px;} .img-d-1 .st8{fill:none;stroke:#ED1F24;stroke-width:3;stroke-miterlimit:10;} .img-d-1 .st9{fill:#ED1F24;} .img-d-1 .st10{fill:none;} .img-d-1 .st11{font-size:42.9091px;} .img-d-1 .st12{font-size:42.9092px;}</style><text transform="matrix(.998 -.069 .069 .998 20.354 82.914)"><tspan x="0" y="0" class="st0 st1 st2">&lt;</tspan><tspan x="13.5" y="0" class="st3 st1 st2">img</tspan><tspan x="54" y="0" class="st1 st2"> </tspan><tspan x="67.4" y="0" class="st4 st1 st2">alt</tspan><tspan x="107.9" y="0" class="st0 st1 st2">=&quot;</tspan><tspan x="134.9" y="0" class="st5 st1 st2">A cat</tspan><tspan x="202.3" y="0" class="st0 st1 st2">&quot;</tspan><tspan x="0" y="32.4" class="st1 st2"> </tspan><tspan x="67.4" y="32.4" class="st4 st1 st2">width</tspan><tspan x="134.9" y="32.4" class="st0 st1 st2">=&quot;</tspan><tspan x="161.9" y="32.4" class="st5 st1 st2">320</tspan><tspan x="202.3" y="32.4" class="st0 st1 st2">&quot;</tspan><tspan x="215.8" y="32.4" class="st1 st2"> </tspan><tspan x="229.3" y="32.4" class="st4 st1 st2">height</tspan><tspan x="310.2" y="32.4" class="st0 st1 st2">=&quot;</tspan><tspan x="337.2" y="32.4" class="st5 st1 st2">213</tspan><tspan x="377.7" y="32.4" class="st0 st1 st2">&quot;</tspan><tspan x="0" y="64.7" class="st1 st2"> </tspan><tspan x="67.4" y="64.7" class="st4 st1 st2">src</tspan><tspan x="107.9" y="64.7" class="st0 st1 st2">=&quot;</tspan><tspan x="134.9" y="64.7" class="st5 st1 st2">cat.jpg</tspan><tspan x="229.3" y="64.7" class="st0 st1 st2">&quot;</tspan><tspan x="0" y="97.1" class="st1 st2"> </tspan><tspan x="67.4" y="97.1" class="st4 st1 st2">srcset</tspan><tspan x="148.4" y="97.1" class="st0 st1 st2">=&quot;</tspan><tspan x="175.4" y="97.1" class="st5 st1 st2">cat-2x.jpg 2x, cat-3x.jpg 3x</tspan><tspan x="553" y="97.1" class="st0 st1 st2">&quot;&gt;</tspan></text><text transform="matrix(.994 .106 -.106 .994 432.694 31.916)" class="st6 st7">Fixed size, here or in CSS</text><path class="st8" d="M428.4 79.3c45-.4 106.5-4 109.2-28.2"/><path class="st9" d="M434 86.5l-3.2-7.2 3-7.3-17 7.4z"/><path class="st10" d="M332.6 365.2L5 374.7 2 268.5l327.5-9.5z"/><text transform="matrix(1 -.029 .029 1 3.153 304.998)"><tspan x="0" y="0" class="st6 st11">This is used as the 1x src &amp; by </tspan><tspan x="0" y="41.9" class="st6 st11">browsers that don’t support srcset</tspan></text><path class="st8" d="M76.6 138.6c-39 9-54.7 64.5-54.7 129"/><path class="st9" d="M70.2 132.4l4 6.7-2 8 16-9.3z"/><text transform="matrix(.999 -.052 .052 .999 158.013 230.768)" class="st6 st12">Image url</text><text transform="matrix(.998 -.057 .057 .998 403.769 220.199)" class="st6 st12">Pixel density of screen</text><path class="st8" d="M292 181.4c-1.3 15.8-8.8 29.6-30.4 31.6"/><path class="st9" d="M284.6 186.7l7.3-3 7 3.3-7-17.3z"/><path class="st8" d="M365 177.2c3 22 12.4 30 34.7 30"/><path class="st9" d="M358.4 183.2l7-3.6 7.4 2.4-8.7-16.4z"/></svg>
</figure>

This [works in all modern browsers](http://caniuse.com/#search=srcset), and falls back to `src` in older browsers.

A few more rules, not covered in the image above:

- Each item within `srcset` is `<url> <density>x`, eg `cat-2x.jpg 2x`
- The order of items within the `srcset` doesn't matter
- If you don't specify width/height, the browser will display the image at its native width/height divided by the density. Eg if the 2x resource is picked, it'll be rendered at 50% of the resources width/height
- This is only a hint, even on a 3x device the browser may use the 1x image, perhaps due to poor connectivity

## Live example

<figure class="full-figure">
  <img alt="A cat"
       width="320" height="213"
       src="asset-url:./cat-1x.jpg"
       srcset="asset-url:./cat-2x.jpg 2x, asset-url:./cat-3x.jpg 3x">
</figure>

# Varying size and density

Images of varying width are commonly used as part of the content on responsive sites. On this blog, content imagery takes up 100% of the article width, but the article isn't always 100% of the window.

In order for the browser to pick the right image, it needs to know:

- URLs for the image at various sizes
- The decoded width of each of those image resources
- The width of the `<img>`

That last one is particularly tricky, as images start downloading before CSS is ready, so the width of the `<img>` cannot be detected from the page layout.

The key to understanding this syntax is knowing which of these values refer to the window width, the decoded image width, and the `<img>` width.

<figure class="img-diagram-figure">
  <div style="padding-top: 77%"></div>
  <svg viewBox="0 0 679 524" class="img-d-2"><style>.img-d-2 .st0{fill:#5F6464;} .img-d-2 .st1{font-family:Inconsolata; font-weight: bold;} .img-d-2 .st2{font-size:25.7772px;} .img-d-2 .st3{fill:#C92C2C;} .img-d-2 .st4{fill:#309D47;} .img-d-2 .st5{fill:#1990B8; white-space: pre;} .img-d-2 .st6{fill:#309D48;} .img-d-2 .st7{fill:none;} .img-d-2 .st8{font-family:'Just Another Hand'} .img-d-2 .st9{font-size:41px;} .img-d-2 .st10{fill:none;stroke:#ED1F24;stroke-width:3;stroke-miterlimit:10;} .img-d-2 .st11{fill:#ED1F24;}</style><text  transform="matrix(1 -.026 .026 1 1.971 35.909)"><tspan x="0" y="0" class="st0 st1 st2">&lt;</tspan><tspan x="12.9" y="0" class="st3 st1 st2">img</tspan><tspan x="51.6" y="0" class="st1 st2"> </tspan><tspan x="64.4" y="0" class="st4 st1 st2">alt</tspan><tspan x="103.1" y="0" class="st0 st1 st2">=&quot;</tspan><tspan x="128.9" y="0" class="st5 st1 st2">A red panda eating leaves</tspan><tspan x="451.1" y="0" class="st0 st1 st2">&quot;</tspan><tspan x="0" y="30.9" class="st1 st2"> </tspan><tspan x="64.4" y="30.9" class="st4 st1 st2">src</tspan><tspan x="103.1" y="30.9" class="st0 st1 st2">=&quot;</tspan><tspan x="128.9" y="30.9" class="st5 st1 st2">panda-689.jpg</tspan><tspan x="296.4" y="30.9" class="st0 st1 st2">&quot;</tspan><tspan x="0" y="61.9" class="st1 st2"> </tspan><tspan x="64.4" y="61.9" class="st4 st1 st2">srcset</tspan><tspan x="141.8" y="61.9" class="st0 st1 st2">=&quot;</tspan><tspan x="167.6" y="61.9" class="st5 st1 st2">panda-689.jpg 689w,</tspan><tspan x="0" y="92.8" class="st5 st1 st2">             panda-1378.jpg 1378w,</tspan><tspan x="0" y="123.7" class="st5 st1 st2">             panda-500.jpg 500w,</tspan><tspan x="0" y="154.7" class="st5 st1 st2">             panda-1000.jpg 1000w</tspan><tspan x="425.3" y="154.7" class="st0 st1 st2">&quot;</tspan><tspan x="0" y="247.5" class="st0 st1 st2"> </tspan><tspan x="64.4" y="247.5" class="st6 st1 st2">sizes</tspan><tspan x="128.9" y="247.5" class="st0 st1 st2">=&quot;</tspan><tspan x="154.7" y="247.5" class="st5 st1 st2">(min-width: 1066px) 689px,</tspan><tspan x="0" y="278.4" class="st5 st1 st2">            (min-width: 800px) calc(75vw - 137px),</tspan><tspan x="0" y="309.3" class="st5 st1 st2">            (min-width: 530px) calc(100vw - 96px),</tspan><tspan x="0" y="340.3" class="st5 st1 st2">            100vw</tspan><tspan x="219.1" y="340.3" class="st0 st1 st2">&quot;&gt;</tspan></text><path  class="st7" d="M697.2 153.5L459.8 126l11-95.3 237.5 27.5z"/><text  transform="matrix(.993 .115 -.115 .993 466.83 65.475)"><tspan x="0" y="0" class="st8 st9">Only for browsers that </tspan><tspan x="0" y="40" class="st8 st9">don’t support srcset</tspan></text><g ><g ><path  class="st10" d="M329.8 50c73.8-2 94.6 13.3 128 14.8"/><g ><path  class="st11" d="M335.5 57l-3.3-7.2 2.8-7.3-17 7.8z"/></g></g></g><text  transform="matrix(.994 -.108 .108 .994 65.622 254.292)" class="st8 st9">Image url</text><text  transform="matrix(.993 -.122 .122 .993 416.958 245.847)" class="st8 st9">Width of the image data</text><g ><g ><path  class="st10" d="M196 203.3c-1.8 19.4-14.4 33.3-36 34.3"/><g ><path  class="st11" d="M188.6 208.7l7.3-3 7 3-7-17z"/></g></g></g><g ><g ><path  class="st10" d="M384.7 199c1 26.7 11 41 28.2 41"/><g ><path  class="st11" d="M377.6 204.7l7.2-3.2 7.3 3-7-17z"/></g></g></g><text  transform="matrix(1 .027 -.027 1 165.881 415.307)" class="st8 st9">Width of the window</text><text  transform="matrix(.999 -.05 .05 .999 447.409 407.548)"><tspan x="0" y="0" class="st8 st9">Width of the img element</tspan><tspan x="-15" y="40" class="st8 st9">when the condition matches</tspan></text><g ><g ><path  class="st10" d="M356.5 357.6c1 19.7-1.4 39-23 40"/><g ><path  class="st11" d="M349.6 363.5l7-3.5 7.4 2.6-8.3-16.6z"/></g></g></g><g ><g ><path  class="st10" d="M427.6 354c-3.7 22-8.4 67 17.7 65.3"/><g ><path  class="st11" d="M419.5 358l7.7-1.5 6.5 4.3-4-18z"/></g></g></g><path  class="st7" d="M31.4 428h257v109h-257z"/><text  transform="translate(31.431 463)"><tspan x="0" y="0" class="st8 st9">Fallback width, when no </tspan><tspan x="0" y="40" class="st8 st9">media conditions match</tspan></text><g ><g ><path  class="st10" d="M148.3 368C100 375.2 94 428 94 428"/><g ><path  class="st11" d="M142.2 361.3l3.7 7-2.7 7.4L160 367z"/></g></g></g></svg>
</figure>

Via `srcset`, the browser knows the resources available and their widths. Via `sizes` it knows the width of the `<img>` for a given window width. It can now pick the best resource to load.

You don't need to specify density, the browser figure that out itself. If the window is `1066px` wide or greater, we've signalled that the `<img>` will be `689px` wide. On a 1x device the browser may download `panda-689.jpg`, but on a 2x device the browser may download `panda-1378.jpg`.

A few more rules, not covered in the image above:

- Each item within `srcset` is `<url> <width-descriptor>w`, eg `panda-689.jpg 689w`
- The order of items within the `srcset` doesn't matter
- If `srcset` contains a width descriptor, the `src` is ignored by browsers that support `srcset`
- Each item within `sizes` is `<media-condition> <image-element-width>`, except for the last entry which is just `<image-element-width>`
- Both of the widths in `sizes` are in CSS pixels
- The browser uses the _first_ media condition match in `sizes`, so the order matters
- As before, the browser may download a lower resolution image due to other factors such as poor connectivity

Picking which `sizes` to list is pretty straight forward. Start with your window at its narrowest, and as you increase its size, create a new rule whenever the `<img>` size vs window size changes formula.

When this window is at its narrowest, the `<img>` is full width, or `100vw`. When the window goes beyond `530px` the content area on this page gets `32px` padding on the left and `64px` on the right, so the `<img>` is now `calc(100vw - 96px)`.

The browser won't call the police if it finds out you lied about the `<img>` width. I've been accurate with my `sizes`, but a rough answer can be good enough, eg `sizes="(min-width: 1066px) 689px, (min-width: 800px) 75vw, 100vw"`.

Picking which resources to create and include in `srcset` is much harder, and I don't think I've mastered it. In the above example I include the maximum size the `<img>` can be (`689px`) and double that for 2x devices (`1378px`). The other two are rough in-between values. I didn't include smaller widths such as `320px`, under the assumption that screens of that size will be 2x density or greater.

`srcset` + `sizes` [works in Chrome, Firefox, and Opera](http://caniuse.com/#search=srcset). For other browsers, it'll safely fall back to `src`. You don't have to wait long for better support here, it's in WebKit nightly & will appear in the next stable version of Edge.

## Live example

<figure class="full-figure">
  <img style="width:100%"
       alt="A red panda eating leaves"
       src="asset-url:./panda-689.jpg"
       srcset="asset-url:./panda-689.jpg 689w,
               asset-url:./panda-1378.jpg 1378w,
               asset-url:./panda-500.jpg 500w,
               asset-url:./panda-1000.jpg 1000w"
       sizes="(min-width: 1066px) 689px,
              (min-width: 800px) calc(75vw - 137px),
              (min-width: 530px) calc(100vw - 96px),
              100vw">
</figure>

# Varying width, density, and art direction

Similar to the previous example, but the framing changes at different widths. This allows you to focus in on the subject at smaller widths.

<figure class="img-diagram-figure">
  <div style="padding-top: 82%"></div>
  <svg class="img-d-3" viewBox="0 0 679 555"><style>.img-d-3 .st0{fill:#5F6464; white-space: pre;} .img-d-3 .st1{font-family:Inconsolata; font-weight: bold;} .img-d-3 .st2{font-size:24.2164px;} .img-d-3 .st3{fill:#C92C2C;} .img-d-3 .st4{fill:#309D47;} .img-d-3 .st5{fill:#1990B8; white-space: pre;} .img-d-3 .st6{fill:none;} .img-d-3 .st7{font-family:'Just Another Hand'} .img-d-3 .st8{font-size:41px;} .img-d-3 .st9{fill:none;stroke:#ED1F24;stroke-width:3;stroke-miterlimit:10;} .img-d-3 .st10{fill:#ED1F24;}</style><text transform="matrix(1 -.018 .018 1 3.572 23.804)"><tspan x="0" y="0" class="st0 st1 st2">&lt;</tspan><tspan x="12.1" y="0" class="st3 st1 st2">picture</tspan><tspan x="96.9" y="0" class="st0 st1 st2">&gt;</tspan><tspan x="0" y="29.1" class="st0 st1 st2">  &lt;</tspan><tspan x="36.3" y="29.1" class="st3 st1 st2">source</tspan><tspan x="109" y="29.1" class="st0 st1 st2"> </tspan><tspan x="121.1" y="29.1" class="st4 st1 st2">media</tspan><tspan x="181.6" y="29.1" class="st0 st1 st2">=&quot;</tspan><tspan x="205.8" y="29.1" class="st5 st1 st2">(max-width: 800px)</tspan><tspan x="423.8" y="29.1" class="st0 st1 st2">&quot;</tspan><tspan x="0" y="174.4" class="st0 st1 st2"> </tspan><tspan x="121.1" y="174.4" class="st4 st1 st2">srcset</tspan><tspan x="193.7" y="174.4" class="st0 st1 st2">=&quot;</tspan><tspan x="217.9" y="174.4" class="st5 st1 st2">f1-focused-800.jpg 800w,</tspan><tspan x="0" y="203.4" class="st5 st1 st2">                  f1-focused-1406.jpg 1406w</tspan><tspan x="520.7" y="203.4" class="st0 st1 st2">&quot;</tspan><tspan x="0" y="232.5" class="st0 st1 st2"> </tspan><tspan x="121.1" y="232.5" class="st4 st1 st2">sizes</tspan><tspan x="181.6" y="232.5" class="st0 st1 st2">=&quot;</tspan><tspan x="205.8" y="232.5" class="st5 st1 st2">(min-width: 530px) calc(100vw - 96px),</tspan><tspan x="0" y="261.5" class="st5 st1 st2">                 100vw</tspan><tspan x="266.4" y="261.5" class="st0 st1 st2">&quot;&gt;</tspan><tspan x="0" y="290.6" class="st0 st1 st2">  &lt;</tspan><tspan x="36.3" y="290.6" class="st3 st1 st2">img</tspan><tspan x="72.6" y="290.6" class="st0 st1 st2"> </tspan><tspan x="84.8" y="290.6" class="st4 st1 st2">alt</tspan><tspan x="121.1" y="290.6" class="st0 st1 st2">=&quot;</tspan><tspan x="145.3" y="290.6" class="st5 st1 st2">F1 car in the gravel</tspan><tspan x="387.5" y="290.6" class="st0 st1 st2">&quot;</tspan><tspan x="0" y="319.7" class="st0 st1 st2"> </tspan><tspan x="84.8" y="319.7" class="st4 st1 st2">src</tspan><tspan x="121.1" y="319.7" class="st0 st1 st2">=&quot;</tspan><tspan x="145.3" y="319.7" class="st5 st1 st2">f1-689.jpg</tspan><tspan x="266.4" y="319.7" class="st0 st1 st2">&quot;</tspan><tspan x="0" y="348.7" class="st0 st1 st2"> </tspan><tspan x="84.8" y="348.7" class="st4 st1 st2">srcset</tspan><tspan x="157.4" y="348.7" class="st0 st1 st2">=&quot;</tspan><tspan x="181.6" y="348.7" class="st5 st1 st2">f1-689.jpg 689w,</tspan><tspan x="0" y="377.8" class="st5 st1 st2">               f1-1378.jpg 1378w,</tspan><tspan x="0" y="406.8" class="st5 st1 st2">               f1-500.jpg 500w,</tspan><tspan x="0" y="435.9" class="st5 st1 st2">               f1-1000.jpg 1000w</tspan><tspan x="387.5" y="435.9" class="st0 st1 st2">&quot;</tspan><tspan x="0" y="465" class="st0 st1 st2"> </tspan><tspan x="84.8" y="465" class="st4 st1 st2">sizes</tspan><tspan x="145.3" y="465" class="st0 st1 st2">=&quot;</tspan><tspan x="169.5" y="465" class="st5 st1 st2">(min-width: 1066px) 689px,</tspan><tspan x="0" y="494" class="st5 st1 st2">              calc(75vw - 137px)</tspan><tspan x="387.5" y="494" class="st0 st1 st2">&quot;&gt;</tspan><tspan x="0" y="523.1" class="st0 st1 st2">&lt;/</tspan><tspan x="24.2" y="523.1" class="st3 st1 st2">picture</tspan><tspan x="109" y="523.1" class="st0 st1 st2">&gt;</tspan></text><path class="st6" d="M336.5 166.3l-305 2.5-1-98 305-2.4z"/><text transform="matrix(1 -.008 .008 1 30.88 105.816)"><tspan x="0" y="0" class="st7 st8">If this query matches the window, </tspan><tspan x="0" y="40" class="st7 st8">use these to select the src</tspan></text><path class="st9" d="M387.2 68.6c-6 44.8-47.7 41-47.7 41"/><path class="st10" d="M379.5 73.5L387 71l7 3.6-6-17.6z"/><path class="st9" d="M102.5 213C74.8 202.5 82 153.6 82 153.6"/><path class="st10" d="M98.6 204.5l1.6 7.7-4.4 6.4L114 215z"/><text transform="translate(462 349)" class="st7 st8">…else use these</text><path class="st9" d="M450.6 425.2C505.8 420 533 396.5 533 360"/><path class="st10" d="M456.6 432l-3.6-7 2.5-7.5L439 426z"/></svg>
</figure>

- You can have as many `<source>`s as you want
- You _must_ include an `<img>`
- The media query on `<source>` will always be obeyed, it's not just a hint
- The media query is based on the window's width, not the `<img>`
- The first matching `<source>` will be used, so the order matters
- If no matching `<source>` is found, the `<img>` is used
- The `<img>` must appear after all `<source>`s
- `<source>` doesn't support `src`, but `srcset="whatever.jpg"` works just as well

Once the `<source>` or `<img>` is selected, the `srcset` and `sizes` attributes work as in previous examples, so you can mix and match techniques.

The `<picture>` element [works in Chrome, Firefox, and Opera](http://caniuse.com/#search=picture), and falls back to the `<img>` in other browsers. I'm told it [might make it into the next release of Edge](https://twitter.com/jacobrossi/status/639471869473656832), which is nice.

## Live example

<figure class="full-figure">
  <picture>
    <source media="(max-width: 800px)"
            srcset="asset-url:./f1-focused-800.jpg 800w,
                    asset-url:./f1-focused-1406.jpg 1406w"
            sizes="(min-width: 530px) calc(100vw - 96px),
                   100vw">
    <img style="width:100%"
         alt="F1 car in the gravel"
         src="asset-url:./f1-689.jpg"
         srcset="asset-url:./f1-689.jpg 689w,
                 asset-url:./f1-1378.jpg 1378w,
                 asset-url:./f1-500.jpg 500w,
                 asset-url:./f1-1000.jpg 1000w"
         sizes="(min-width: 1066px) 689px,
                calc(75vw - 137px)">
  </picture>
</figure>

# Varying on type

This method allows you to serve better-optimised formats to browsers that support them.

<figure class="img-diagram-figure">
  <div style="padding-top:28%"></div>
  <svg class="img-d-4" viewBox="0 0 679 187"><style>.img-d-4 .st0{fill:#5F6464; white-space: pre;} .img-d-4 .st1{font-family:Inconsolata; font-weight: bold;} .img-d-4 .st2{font-size:25.7851px;} .img-d-4 .st3{fill:#C92C2C;} .img-d-4 .st4{fill:#309D47;} .img-d-4 .st5{fill:#1990B8;} .img-d-4 .st6{fill:none;} .img-d-4 .st7{font-family:'Just Another Hand';} .img-d-4 .st8{font-size:41px;} .img-d-4 .st9{fill:none;stroke:#ED1F24;stroke-width:3;stroke-miterlimit:10;} .img-d-4 .st10{fill:#ED1F24;}</style><text transform="matrix(1 -.018 .018 1 3.594 22.076)"><tspan x="0" y="0" class="st0 st1 st2">&lt;</tspan><tspan x="12.9" y="0" class="st3 st1 st2">picture</tspan><tspan x="103.1" y="0" class="st0 st1 st2">&gt;</tspan><tspan x="0" y="30.9" class="st0 st1 st2">  &lt;</tspan><tspan x="38.7" y="30.9" class="st3 st1 st2">source</tspan><tspan x="116" y="30.9" class="st0 st1 st2"> </tspan><tspan x="128.9" y="30.9" class="st4 st1 st2">type</tspan><tspan x="180.5" y="30.9" class="st0 st1 st2">=&quot;</tspan><tspan x="206.3" y="30.9" class="st5 st1 st2">image/webp</tspan><tspan x="335.2" y="30.9" class="st0 st1 st2">&quot;</tspan><tspan x="0" y="61.9" class="st0 st1 st2"> </tspan><tspan x="128.9" y="61.9" class="st4 st1 st2">srcset</tspan><tspan x="206.3" y="61.9" class="st0 st1 st2">=&quot;</tspan><tspan x="232.1" y="61.9" class="st5 st1 st2">snow.webp</tspan><tspan x="348.1" y="61.9" class="st0 st1 st2">&quot;&gt;</tspan><tspan x="0" y="92.8" class="st0 st1 st2">  &lt;</tspan><tspan x="38.7" y="92.8" class="st3 st1 st2">img</tspan><tspan x="77.4" y="92.8" class="st0 st1 st2"> </tspan><tspan x="90.2" y="92.8" class="st4 st1 st2">alt</tspan><tspan x="128.9" y="92.8" class="st0 st1 st2">=&quot;</tspan><tspan x="154.7" y="92.8" class="st5 st1 st2">Hut in the snow</tspan><tspan x="348.1" y="92.8" class="st0 st1 st2">&quot;</tspan><tspan x="0" y="123.8" class="st0 st1 st2"> </tspan><tspan x="90.2" y="123.8" class="st4 st1 st2">src</tspan><tspan x="128.9" y="123.8" class="st0 st1 st2">=&quot;</tspan><tspan x="154.7" y="123.8" class="st5 st1 st2">snow.jpg</tspan><tspan x="257.9" y="123.8" class="st0 st1 st2">&quot;&gt;</tspan><tspan x="0" y="154.7" class="st0 st1 st2">&lt;/</tspan><tspan x="25.8" y="154.7" class="st3 st1 st2">picture</tspan><tspan x="116" y="154.7" class="st0 st1 st2">&gt;</tspan></text><path class="st6" d="M659 110.7l-228.7 2-.8-98 228.6-2z"/><text transform="matrix(1 -.008 .008 1 429.879 49.61)"><tspan x="0" y="0" class="st7 st8">If this type is supported, </tspan><tspan x="0" y="40" class="st7 st8">use this</tspan></text><path class="st9" d="M368.6 40c37.6-2 58-2 58-2"/><path class="st10" d="M374.4 47l-3.4-7 2.8-7.4-16.8 8z"/><path class="st9" d="M395 69.5c33.7-1 34.5 2.8 34.5 2.8"/><path class="st10" d="M401 76.5l-3.5-7 2.8-7.4-16.8 8z"/><text transform="translate(366 141.5)" class="st7 st8">…else this</text><path class="st9" d="M307 133.4c37.3-1.5 55.5.5 55.5.5"/><path class="st10" d="M313 140.6l-3.5-7 2.8-7.4-16.8 7.8z"/></svg>
</figure>

- `type` is a mime type
- You can have multiple sources and mix `type` with `media`, `srcset`, and even `sizes` to create something truly monstrous/awesome

This [works in Chrome, Firefox, and Opera](http://caniuse.com/#search=picture), and falls back to the `<img>` in other browsers.

## Live example

<figure class="full-figure">
  <picture>
    <source type="image/webp"
            srcset="asset-url:./snow.webp">
    <img style="width:100%"
         alt="Hut in the snow"
         src="asset-url:./snow.jpg">
  </picture>
</figure>

# Further reading

Hopefully the above helps as a kind of quick reference to the various use-cases, but if not, dig into these:

- [A 10-part novella on responsive images](http://blog.cloudfour.com/responsive-images-101-definitions/) - by Jason Grigsby
- [Responsive Images: Use Cases and Code Snippets](https://dev.opera.com/articles/responsive-images/) - similar to this article, but covers more combinations of use-cases
- [Client hints](https://developers.google.com/web/updates/2015/09/automating-resource-selection-with-client-hints) - a server-side alternative to responsive images

<small>Thanks to Mike Hall, Jason Grigsby, Simon Peters, and Yoav Weiss for proofreading and point-sharpening.</small>
