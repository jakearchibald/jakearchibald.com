---
title: Serving sharp images to high density screens
date: 2021-06-10 01:00:00
summary: TODO
meta: TODO
#image: 'asset-url:./img.jpg'
---

A long time ago we had monitors of varying resolutions, but once we started to go beyond 1024x768, screens started to get bigger as resolution got bigger.

Then full-colour web-capable mobile phones arrived, but the story was the same. They had small screens, but also small resolutions.

Then in 2010 the iPhone 4 came out (holy shit that's 11 years ago), and the screen was 640×960, whereas the similar-sized iPhone 3 was 320×480. The resolution doubled, while the screen size was roughly the same, so in effect the screen density doubled.

Apple couldn't just run the same apps but at a higher resolution, because things like text and buttons would be tiny, so they doubled the size of everything. 1 pixel became 2 'device pixels'.

On the web we call this the 'device pixel ratio'. The iPhone 4 had a device pixel ratio of 2. This is sometimes referred to as having a 2x screen, or 2dppx.

Ok, history lesson over…

# How popular are high density screens?

Matt Hobbs from [gov.uk](https://www.gov.uk/) was kind enough to [share April 2021 stats on users' device pixel ratio](https://twitter.com/TheRealNooshu/status/1397862141894529027). He gave me access to the raw data, and I ran a few queries on it. It turns out **80% of all their users are on a screen with a DPR of 1.5 or above**. That's:

- …over 99.9% of their mobile users.
- …32% of their desktop users.
- …78% of their tablet users.

Of course, [gov.uk](https://www.gov.uk/) is UK-centric, but it covers a broad section of the UK population. Not just tech users, not just rich users. I think we can safely draw the following conclusions:

- Users at smaller viewports will likely be using high density screens, unless the site expects a large amount of feature phone traffic.
- Users at larger viewports are less likely to be using high density screens, but it's a growing number, and worth catering for, unless the site expects traffic from mostly low-end devices.

So, it's worth catering for users with high density screens. In many cases it could be the majority of your traffic.

# Why cater for high density screens?

The rest of the UI will be rendered at full density, including things like text. If an image is rendered at lower density, it can look blurry or low quality:

<script type="component">{
  "module": "shared/ImageTabs",
  "exportName": "Styles",
  "staticOnly": true
}</script>

<script type="component">{
  "module": "shared/demos/2021/serving-sharp-images/DensityDemo",
  "exportName": "Styles",
  "staticOnly": true
}</script>

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/demos/2021/serving-sharp-images/DensityDemo",
  "props": {
    "src": "asset-url:./full2.avif",
    "width": 1598,
    "height": 1026
  }
}</script>
</figure>

<script>
  if (devicePixelRatio === 1) {
    const p = document.createElement('p');
    p.textContent = `You're on a 1x screen, so you're not getting the full effect of this demo. 0.5x vs 1x gives a rough feel of the result though.`;
    document.currentScript.before(p);
  }
</script>

The effect can be subtle depending on the density of your screen, but you should see a sharpening, particularly around the red panda's whiskers and ear fur.

So, if you want your images to be as sharp as possible, you need to target images at the user's device pixels, rather than their CSS pixels.

# Compressing images for high density screens

TODO

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/ImageTabs",
  "props": {
    "ratio": 1.557504873,
    "maxWidth": 400,
    "initial": 1,
    "images": [
      ["1x q80.5 (asset-pretty-size:./1x-high.webp)", "asset-url:./1x-high.webp"],
      ["2x q80.5 (asset-pretty-size:./2x-high.webp)", "asset-url:./2x-high.webp"],
      ["2x q44.5 (asset-pretty-size:./2x-low.webp)", "asset-url:./2x-low.webp"]
    ]
  }
}</script>
</figure>

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/ImageTabs",
  "props": {
    "ratio": 1.557504873,
    "maxWidth": 400,
    "initial": 1,
    "transform": "scale(2) translate(10.4%, 5.9%)",
    "backgroundStyle": {"background": "black"},
    "images": [
      ["2x q80.5 (asset-pretty-size:./2x-high.webp)", "asset-url:./2x-high.webp"],
      ["2x q44.5 (asset-pretty-size:./2x-low.webp)", "asset-url:./2x-low.webp"]
    ]
  }
}</script>
</figure>

# Notes

webp
400px effort 6 q80.5 full sns
800px effort 6 q44.5 full sns

- Compressing images for high density screens
  - Here's a 1x image at MozJPEG quality x, with size
  - Here's a 2x version at the same quality, with size
  - But, here's a 2x version at quality y, with size
  - Because the compression artifacts are half the size, they're less noticable, so you can get away with more of them
  - If you try to go that low with the 1x version, it'll look terrible
  - comparrison chart
  - This means that a 2x image doesn't need to be 4x the file size, even though it's 4x the number of pixels
  - The 2x might look like crap close up, but we shouldn't optimise for folks that zoom in to look at small details. If we want to cater for those, link to a high res version.
  - For 3x screens you can drop the quality further still, but the drop isn't as big as 1x to 2x, so it isn't always worth catering for specifically
  - example
- Serving high density images isn't straight forward
  - (Rough code example)
  - Link to responsive image post
  - Code example of problem
  - Some sizes will be used for 1x and 2x screens
- The lazy way
  - The lazy way is a trade off, it isn't necesserily wrong.
  - It's what I do on this blog.
  - I work out the biggest an image will be displayed, and I multiply it by 2
  - And that's the image I serve to all devices
  - example
  - That's (compare size to mobile optimised 2x version)
  - But, I usually throw in some more modern codecs at a little extra effort
  - code example
  - Compare box
  - Is the image as small as it could be for some users? No
  - But because I've taken care over the compression, it's smaller than most images of those dimensions on the web
  - Of course, bigger images come with a decoding cost too
  - It isn't called the lazy way for nothing
- The 'full' way
  - Use the source element to provide different images to different densities
  - (rough code example)
  - The sizes attribute tells the browser what size the image will be at different viewport widths
  - It needs to be repeated for the source as well as the image - link to spec change.
  - Now, what widths of image do I need to encode?
  - For 1x, I'm going to assume that's mostly desktop users.
  - Once the browser is x pixels wide the layout is fixed. I imagine most desktop users are viewing the site at that width or thereabouts
  - So there, I guess I only need one 1x image
  - That also means I can get rid of the sizes attribute from the image, since there's only one image to choose from, but that might not be true for all situations
  - (code example)
  - (live exmaple)
  - And hey, since this is the 'full' way, let's throw in webp and avif
  - (code example)
  - (live example)
  - Phew! But, I think for this blog I'll stick to the lazy way
  - If I used an image service to encode the images for me, I'd totally do it the full way. In fact, this is pretty much what The Guardian does.
  - (code example)
  - Although serving webp vs jpeg is something they do server side, so they don't have the extra source elements for that. (use accept header)
