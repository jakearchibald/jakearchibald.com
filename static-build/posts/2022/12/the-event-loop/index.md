---
template: event-loop
title: The event loop
date: 2022-12-30 01:00:00
summary: TODO
meta: TODO
#image: 'asset-url:./img.png'
---

<script type="component">{
  "module": "shared/demos/2022/event-loop/EventLoop",
  "exportName": "Styles",
  "staticOnly": true
}</script>

<script type="component">{
  "module": "./InlineScript",
  "staticOnly": true
}</script>

<div class="section-with-slide min-viewport-height">
<div class="slide">
  <div class="slide-inner default-gradient">
    <div class="book-title">
      <script type="component">{
        "module": "shared/demos/2022/event-loop/EventLoop",
        "props": {
          "initialState": { "mode": "speedy-spin" },
          "width": 480,
          "height": 480
        }
      }</script>
      <h1>
        <svg viewBox="-100 -25 200 50" class="book-title-text">
          <text>The Event Loop</text>
        </svg>
      </h1>
    </div>
  </div>
</div>

<div class="content">

<div class="book-subtitle">
  <p class="subtitle-text">An animated book-type-thing</p>
  <p class="author">by Jake Archibald</p>
</div>

In 2018 I [gave a talk about the browser event loop](https://www.youtube.com/watch?v=cCOL7MC4Pl0). Folks said I should put the animations online. Five years later, I found the time. This is that.

TODO: table of contents

</div>
</div>

<div class="section-with-slide min-viewport-height">
<div class="slide">
  <div class="slide-inner sunny-gradient">
    <div class="browser-demo browser-frame">
      <script type="component">{
        "module": "shared/demos/2022/event-loop/Video",
        "props": {
          "src": "asset-url:./videos/img-and-select.mp4",
          "width": 1512,
          "height": 614,
          "apiName": "img-and-select"
        }
      }</script>
    </div>
  </div>
</div>

<div class="content">

# Worrying about code

<trigger-point ontrigger="getAPI(`img-and-select`).then(a => a.reset())">

Before I understood the event loop, I'd worry about seemingly simple code like this. It's adding an element to the page, then hiding it.

Was this causing the browser to lay the document out with the new element, only to throw away all that work by hiding the element?

Might the user see a flash of the element, if the code ran slowly for some reason?

I didn't know the answer, so, for safety…

</trigger-point>
<trigger-point ontrigger="getAPI(`img-and-select`).then(a => a.play())">

I'd swap those lines around. Disaster averted.

But, now I understand the event loop, I know that the order of those lines doesn't matter, and the user will never see a flash of content between the two. Hopefully by the end of this animated book-type-thing, hopefully you'll understand the event loop too.

</trigger-point>

</div>
</div>

<div class="section-with-slide min-viewport-height">
<div class="slide">
  <div class="slide-inner sunny-gradient">
    <script type="component">{
      "module": "shared/demos/2022/event-loop/WorryCode"
    }</script>
  </div>
</div>

<div class="content">

# Worrying about code

<trigger-point ontrigger="getAPI(`worry-code`).then(a => a.setSwap(false))">

Before I understood the event loop, I'd worry about seemingly simple code like this. It's adding an element to the page, then hiding it.

Was this causing the browser to lay the document out with the new element, only to throw away all that work by hiding the element?

Might the user see a flash of the element, if the code ran slowly for some reason?

I didn't know the answer, so, for safety…

</trigger-point>
<trigger-point ontrigger="getAPI(`worry-code`).then(a => a.setSwap(true))">

I'd swap those lines around. Disaster averted.

But, now I understand the event loop, I know that the order of those lines doesn't matter, and the user will never see a flash of content between the two. Hopefully by the end of this animated book-type-thing, hopefully you'll understand the event loop too.

</trigger-point>

</div>
</div>

<div class="section-with-slide min-viewport-height">
<div class="slide">
  <div class="slide-inner ocean-gradient"></div>
</div>

<div class="content">

# Video encoding notes

- 150% cursor size.
- Invert click

ffmpeg -i ~/Desktop/ScreenFlow.png -filter:v "crop=1512:614:45:194, colorspace=iall=bt709:all=bt709:range=tv:format=yuv420p, scale=force_original_aspect_ratio=decrease:force_divisible_by=8" -an -c:v libx264 -preset veryslow -r 60 -crf 28 -movflags +faststart -x264opts opencl out.mp4

ffmpeg -i ~/Desktop/ScreenFlow.png -filter:v "crop=1512:614:45:194, mpdecimate=hi=1:lo=1:frac=1:max=0, colorspace=iall=bt709:all=bt709:range=pc:format=yuv444p" -an -c:v libaom-av1 -crf 50 -cpu-used 3 -pass 1 -f null /dev/null && ffmpeg -i ~/Desktop/ScreenFlow.png -filter:v "crop=1512:614:45:194, mpdecimate=hi=1:lo=1:frac=1:max=0, colorspace=iall=bt709:all=bt709:range=pc:format=yuv444p" -an -c:v libaom-av1 -crf 50 -cpu-used 3 -pass 2 out.webm

</div>
</div>
