---
template: event-loop
title: The event loop
date: 2022-12-30 01:00:00
summary: TODO
meta: TODO
#image: 'asset-url:./img.png'
---

<script type="component">{
  "module": "shared/demos/2023/event-loop/EventLoop",
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
        "module": "shared/demos/2023/event-loop/EventLoop",
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
  <div class="slide-inner ocean-gradient">
    <script type="component">{
      "module": "shared/demos/2023/event-loop/EventOrdering"
    }</script>
  </div>
</div>

<div class="content">

# Why do we need an event loop?

<trigger-point ontrigger="getAPI(`event-ordering`).then(a => a.showBoxesPhase(0))">

I think previous articles and talks on the topic (including my own) have given a false impression that the event loop is a JavaScript thing. It isn't. Event loops are the main schedulers for the web platform. Not just JavaScript, but everything on the platform that needs to work together with reliable queuing and timing: CSS, rendering, default interactions, JavaScript too, but that's only part of the story.

I suppose, a good way to show why we need an event loop, is to think about a world without one. Let's imagine a browser with where everything happens at the same time.

</trigger-point>
<trigger-point ontrigger="getAPI(`event-ordering`).then(a => a.showBoxesPhase(1))">

Let's say the user presses 'A' on the keyboard.

</trigger-point>
<trigger-point ontrigger="getAPI(`event-ordering`).then(a => a.showBoxesPhase(2))">

They click something.

</trigger-point>
<trigger-point ontrigger="getAPI(`event-ordering`).then(a => a.showBoxesPhase(3))">

They press 'B'.

</trigger-point>
<trigger-point ontrigger="getAPI(`event-ordering`).then(a => a.showBoxesPhase(4))">

And the browser renders the current state of the document.

Running this all in parallel creates a bunch of problems. Although the code handling these events has started in the right order (and that isn't even guaranteed in a fully parallel system), the code handling the 'A' key press took longer, so it completes _after_ the 'B' key press and the click.

Even at a simple level, this could result in the effects of pressing 'A' appearing after the effects of pressing 'B', but it's more likely that the effects of each will interleave somehow, creating a weird mixed-up state that you never intended.

In this model, rendering happens somewhere in the middle. That means the user could end up seeing something that wasn't fully constructed – it wasn't ready to be seen.

Before I understood the event loop, I'd worry about seemingly simple code like this:

```js
document.body.append(el);
el.style.display = 'none';
```

Could the user see a flash of `el`, because the browser rendered the result between those two lines? In a fully parallel system, yes, but that isn't how it works, and that's all thanks to the event loop.

</trigger-point>
<trigger-point ontrigger="getAPI(`event-ordering`).then(a => a.sequencePhase())">

On the web platform, unless something is explicitly 'asynchronous', the event loop makes sure things 'run to completion'. As in, one task cannot happen in the middle of another task.

The event loop ensures that things happen in a reliable order, and their actions don't overlap.

This means the code for handling the second key press, 'B', doesn't start until the code for handling the first key press has completed. It also means rendering cannot happen in the middle of another task.

However, the event loop is more than a simple queue. It ensures that related things happen in the order they were queued, but it also allows particular things to jump the queue, or be deferred, if it creates a better user experience.

</trigger-point>
<trigger-point ontrigger="getAPI(`event-ordering`).then(a => a.finalPhase())">

In this example, the browser lets _rendering_ happen sooner, so the user sees the result of the key press in a timely manner. In other cases it may defer rendering, to avoid rendering more often than the display can handle.

This will only happen when it's safe for things to happen in a different order. The code handling the key-presses and mouse click will never be reordered.

</trigger-point>

</div>
</div>

<div class="section-with-slide min-viewport-height">
<div class="slide">
  <div class="slide-inner sunny-gradient">
    <div class="browser-demo browser-frame h-center">
      <script type="component">{
        "module": "shared/demos/2023/event-loop/Video",
        "props": {
          "src": "asset-url:./videos/img-and-select.mp4",
          "av1Src": "asset-url:./videos/img-and-select.webm",
          "width": 1512,
          "height": 614,
          "apiName": "img-and-select"
        }
      }</script>
    </div>
  </div>
</div>

<div class="content">

<trigger-point ontrigger="getAPI(`img-and-select`).then(a => a.reset())">

Take a simple example like this…

</trigger-point>
<trigger-point ontrigger="getAPI(`img-and-select`).then(a => a.play())">

It _feels like_ a bunch of stuff is happening at the same time:

- Fetching the image over the network.
- Decoding the image from whatever format it is, into RGBA data.
- Listening for updates to mouse buttons and pointer position.
- Performing hit-testing to figure out exactly what text the user wants to select.
- Rendering updates to the image as it's decoded.
- Rendering updates to the selected text.

But, it's actually a series of specifically scheduled tasks. Even though no JavaScript was executed in this demo, everything you see was managed by the event loop.

Ok, that's the high level. Let's dive into the details.

</trigger-point>

</div>
</div>

<div class="section-with-slide min-viewport-height">
<div class="slide">
  <div class="slide-inner sunny-gradient">
    <script type="component">{
      "module": "shared/demos/2023/event-loop/WorryCode"
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

<details>
- 150% cursor size.
- Invert click

```
ffmpeg -i ~/Desktop/ScreenFlow.png -filter:v "crop=1512:614:45:194, colorspace=iall=bt709:all=bt709:range=tv:format=yuv420p, scale=force_original_aspect_ratio=decrease:force_divisible_by=8" -an -c:v libx264 -preset veryslow -r 60 -crf 28 -movflags +faststart -x264opts opencl out.mp4
```

```
ffmpeg -i ~/Desktop/ScreenFlow.png -filter:v "crop=1512:614:45:194, mpdecimate=hi=1:lo=1:frac=1:max=0, colorspace=iall=bt709:all=bt709:range=pc:format=yuv444p" -an -c:v libaom-av1 -crf 50 -cpu-used 3 -pass 1 -f null /dev/null && ffmpeg -i ~/Desktop/ScreenFlow.png -filter:v "crop=1512:614:45:194, mpdecimate=hi=1:lo=1:frac=1:max=0, colorspace=iall=bt709:all=bt709:range=pc:format=yuv444p" -an -c:v libaom-av1 -crf 50 -cpu-used 3 -pass 2 out.webm
```

</details>

</div>
</div>
