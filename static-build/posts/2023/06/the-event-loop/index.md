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
  </div>
</div>

<div class="content">

# The 'main thread'

The best way to understand the event loop is to understand why it's needed, and to do that we need to talk about the 'main thread'.

The simplest coding model is single threaded. One thing happens after the other.

diagram: Operation A, Operation B, Join A+B, display result (operation A is longer than B)

In this case, the 'main' thread is the only thread.

But, modern computers have processors capable of doing multiple things at the same time, so single-threaded patterns can end up using a fraction of the computing power available.

If we switch to a multi-threaded model, the operation can be completed faster, since certain bits of work can be performed in parallel.

diagram: Operations split into threads, and main thread is idle during that time.

Not everything can be run in parallel, only things that can be done in isolation.

In this example, the two operations are run in parallel, but combining the results can't be done until the two operations are complete. The 'main' thread started the parallel operations, waits for both to complete, then handles the result, ensuing that A+B are combined, even if the operations finish in a different order.

By moving this work into other threads, it's created an idle period for the main thread. This is great if the main thread handles a user interface, as it frees it up to handle clicks, scrolling, update rendering etc etc.

That's ideal, because humans are used to doing multiple things at once. Walking while looking while listening while talking - we do it all in parallel without really thinking.

The only time we as humans operate in a single threaded manner is when we sneeze. Once the process of the sneeze begins, the rest of our processing is paused. All that can happen is the sneeze. Once the sneeze is over, other activity can resume, provided you didn't crash your car, or fall off your bike.

Sneezes are great. I'm a big fan. But, it isn't the right model to build user interfaces.

When web developers talk about the 'main thread' they usually mean the thread that handles the web page's display and interaction. That means it's the thread that owns the DOM, the thread that handles clicks, and therefore it's the thread that runs JavaScript.

In reality it's a little more complicated than that. Modern browsers will try to run different pages in different processes, meaning there are many 'main thread's. Sometimes, two pages can have synchronous access to each other, so two pages will share a 'main thread'. You could also say that each web worker has its own 'main thread'.

Since a page's 'main thread' handles interaction and rendering, while managing things that are happening in parallel in other threads, it needs a scheduler to ensure everything happens as fast and as predictably as possible.

That scheduler is called the event loop. Each 'main thread' is governed by a single event loop.

# Why do we need an event loop?

Let's look at a real feature that makes use of the event loop:

```js
setTimeout(() => {
  document.body.append('hello');
}, 1000);

setTimeout(() => {
  document.body.append('world');
}, 1000);
```

Let's try to define how this works.

diagram: spec text, wait ms, invoke callback.

Cool, so, we wait the specified amount of time, then run the callback. But, this operation was started by JavaScript. JavaScript runs on the main thread. That means our 'wait' step is also running on the main thread.

inline diagram: main, wait 1s, append 'hello', wait 1s, append 'world'. Use summary-style to highlight the main thread.

That means, during that 'wait', nothing else can happen. No interaction, no rendering, no other script. This design is sneezey.

Let's fix it!

diagram: add 'in parallel' step.

Now we've told the browser to run the steps 'in parallel'. In web specs, 'in parallel' means: run the steps in another thread. That gets us off the main thread.

inline diagram: idle main, wait 1s and append 'hello' and 'world' in other threads.

But, this is also bad, as we're invoking a JavaScript callback outside of the main thread.

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

<trigger-point ontrigger="getAPI(`event-ordering`).then(a => a.showBoxesPhase(0))">

Lets look at a world where everything just runs in parallel:

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
  <div class="slide-inner ocean-gradient">
  </div>
</div>

<div class="content">

diagram: spec again.

Ok, so we can't just run everything in parallel. 'Waiting' in parallel is correct, but once the wait is over, we need to get back onto the main thread in some reliable and managed way.

diagram: update spec to queue a task.

And we do that by 'queuing a task' on the event loop.

Let's dive into tasks:

</div>
</div>

<div class="section-with-slide min-viewport-height">
<div class="slide">
  <div class="slide-inner ocean-gradient">
  </div>
</div>

<div class="content">

# Tasks

diagram: fast loop

Here's the event loop. Look at it go!

It's actually spec'd as a `while` loop that spins round and round until it has something to do. Although, in browsers, it's more efficient than a `while` loop, but it behaves the same.

Let's slow things right down.

diagram: detour for tasks

One of the things the event loop manages is 'tasks'. Tasks are just a bit of work that's queued to run on the main thread.

queue-task-button

Each time around the event loop, if there's a task available, it's run.

So back to our example:

```js
setTimeout(() => {
  document.body.append('hello');
}, 1000);

setTimeout(() => {
  document.body.append('world');
}, 1000);
```

This waits 1s in parallel for each call, then each queue a task to run their callback.

queue-two-tasks

inline-diagram: parallel waiting, then two main thread tasks

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

I think previous articles and talks on the topic (including my own) have given a false impression that the event loop is a JavaScript thing. It isn't. Event loops are the main schedulers for the web platform. Not just JavaScript, but everything on the platform that needs to work together with reliable queuing and timing: CSS, rendering, default interactions, JavaScript too, but that's only part of the story.

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

TODO: next up, setTimeout spec

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
