---
title: Sounds fun
date: 2016-11-29 11:42:42
summary: I played with the [web audio
  API](https://webaudio.github.io/web-audio-api/) for the first time recently,
  so I thought I'd write up what I learned. I think that's my job or something.
mindframe: ''
image: ''
meta: Queueing, synchronising, and looping audio using the web audio API.
---

I played with the [web audio API](https://webaudio.github.io/web-audio-api/) for the first time recently, so I thought I'd write up what I learned. I think that's my job or something.

# Playing a sound

The simplest demonstrable thing we can do with web audio is "play a sound". But to do that, we first we need to load & decode something:

```js
// The context is connected to the device speakers.
// You only need one of these per document.
const context = new AudioContext();
// Fetch the file
fetch('sound.mp4')
  // Read it into memory as an arrayBuffer
  .then((response) => response.arrayBuffer())
  // Turn it from mp3/aac/whatever into raw audio data
  .then((arrayBuffer) => context.decodeAudioData(arrayBuffer))
  .then((audioBuffer) => {
    // Now we're ready to play!
  });
```

Unfortunately we need to work around a few things in Safari. We need to use `webkitAudioContext` - Safari doesn't support the unprefixed version. It doesn't support `fetch` yet (it's [in development](https://webkit.org/status/#specification-fetch-api)) so we'll [need to use XHR](https://gist.github.com/jakearchibald/b7d63a48db6484e1b5701331ed8c7a02)). And `decodeAudioData` doesn't support promises, so we'll [need to polyfill that](https://gist.github.com/jakearchibald/131d7101b134b6f7bed1d8320e4da599).

But once we've got our audio buffer, we can play it:

```js
// Create a source:
// This represents a playback head.
const source = context.createBufferSource();
// Give it the audio data we loaded:
source.buffer = audioBuffer;
// Plug it into the output:
source.connect(context.destination);
// And off we go!
source.start();
```

Job done!

<style>
  .audio-container {
    position: relative;
    margin: 0 -20px;
  }

  @media (min-width: 530px) {
    .audio-container {
      margin-left: -32px;
      margin-right: 0;
    }
  }

  .audio-output {
    position: relative;
    height: 200px;
    background: #39775b;
  }
  .audio-output > * {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  .loop {
    background: rgba(255, 255, 255, 0.21);
    width: 0;
    border: 1px solid rgba(255, 255, 255, 0.41);
    border-width: 0 1px;
    box-sizing: border-box;
    background-clip: content-box;
  }
  .play-head {
    width: 1px;
    background: #fff;
    will-change: transform;
    display: none;
  }
  .bwq-loops,
  .aac-decode {
    display: flex;
  }
  .bwq-loops .audio-output,
  .aac-decode .audio-output {
    flex: 1;
  }
  .bwq-loops .audio-output:nth-child(2) {
    margin: 0 10px;
  }
  .bwq-loops .audio-output:nth-child(3) {
    flex: 0.2;
  }
  .aac-decode .audio-output:first-child {
    margin-right: 5px;
  }
  .aac-decode .audio-output:last-child {
    margin-left: 5px;
  }
  .audio-buttons {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    padding: 16px 20px;
  }
  @media (min-width: 530px) {
    .audio-buttons {
      padding-left: 32px;
    }
  }
  .audio-container progress {
    width: 100%;
  }
</style>
<script>
function bufferFetch(url, progressCb) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'arraybuffer';
    xhr.onload = () => resolve(xhr.response);
    xhr.onerror = () => reject(Error('Fetch failed'));
    if (progressCb) xhr.onprogress = event => progressCb(event.loaded / event.total);
    xhr.open('GET', url);
    xhr.send();
  });
}

const context = new (self.AudioContext || self.webkitAudioContext)();
const safetyOffset = 0.25;

function drawAudio(canvas, buffer, start, end) {
  const resolution = 10;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.floor(rect.width * devicePixelRatio);
  canvas.height = Math.floor(rect.height * devicePixelRatio);
  const context = canvas.getContext('2d');
  let data = buffer.getChannelData(0);

  if (start || end) {
    data = data.slice(start || 0, end || data.length);
  }

  context.fillStyle = '#12d67d';

  for (let i = 0; i < canvas.width; i++) {
    let max = -Infinity;
    let min = Infinity;
    const start = Math.floor(i / canvas.width * data.length);
    const end = Math.floor((i+1) / canvas.width * data.length);
    const interval = Math.floor((end - start) / resolution) || 1;

    for (let j = start; j <= end; j += interval) {
      const item = data[j];
      if (max < item) max = item;
      if (min > item) min = item;
    }

    const height = (max - min) / 2 * canvas.height;
    const startPixel = (1 - (max + 1) / 2) * canvas.height;

    context.fillRect(i, startPixel, 1, height)
  }
}

function drawLoop(el, start, width) {
  el.style.display = 'block';
  el.style.left = start * 100 + '%';
  el.style.width = width * 100 + '%';
}

// Safari doesn't support promises in decodeAudioData :(
if (!window.AudioContext && window.webkitAudioContext) {
  const oldFunc = webkitAudioContext.prototype.decodeAudioData;
  webkitAudioContext.prototype.decodeAudioData = function(arraybuffer) {
    return new Promise((resolve, reject) => {
      oldFunc.call(this, arraybuffer, resolve, reject);
    });
  }
}

const loop1 = {
  barLength: (60 / 110 /*BPM*/) * 4,
  size: 1150563,
  buffer: null,
  startOffset: 0,
  downloadProgress: 0,
  url: 'asset-url:./loop1.mp4'
};

const loop2 = {
  barLength: (60 / 123 /*BPM*/) * 4,
  size: 1062675,
  buffer: null,
  startOffset: 0,
  downloadProgress: 0,
  url: 'asset-url:./loop2.mp4'
};

const stab = {
  buffer: null,
  size: 110755,
  startOffset: 0,
  downloadProgress: 0,
  url: 'asset-url:./stab.mp4'
};

const singleLoop = {
  size: 966911,
  buffer: null,
  startOffset: 0,
  downloadProgress: 0,
  url: 'asset-url:./sonic.mp4'
};

function dispatchStateChange() {
  window.dispatchEvent(new Event('app-statechange'));
}

function downloadAudio(item) {
  item.downloadProgress = 0.0001;
  dispatchStateChange();

  return bufferFetch(item.url, complete => {
    item.downloadProgress = complete;
    dispatchStateChange();
  }).then(ab => context.decodeAudioData(ab)).then(buffer => {
    const l = buffer.getChannelData(0);
    const r = buffer.getChannelData(1);

    for (var i = 0; i < l.length; i++) {
      if (l[i] || r[i]) {
        item.startOffset = i / buffer.sampleRate;
        break;
      }
    }

    item.buffer = buffer;
    dispatchStateChange();
  });
}

function humanSize(size) {
  const total = Math.round(size / 1024 / 1024 * 100);
  return `${total/100}M`;
}
</script>

<div class="audio-container">
  <div class="audio-output stab-only">
    <canvas></canvas>
    <div class="play-head"></div>
  </div>
  <div class="stab-only-buttons audio-buttons"></div>
</div>

<script>
(function() {
  let audioDrawn = false;
  let stabSource;
  let stabStart = 0;
  const buttonsEl = document.querySelector('.stab-only-buttons');
  const playhead = document.querySelector('.stab-only .play-head');

  function updateButtonsUi() {
    if (!stab.buffer) {
      if (stab.downloadProgress) {
        let progress = buttonsEl.firstElementChild;
        if (!progress || progress.tagName != 'PROGRESS') {
          buttonsEl.innerHTML = `<progress max="1"></progress>`;
          progress = buttonsEl.firstElementChild;
        }
        progress.value = stab.downloadProgress;
        return;
      }

      buttonsEl.innerHTML = `
        <button class="btn stab-load">Download audio (${humanSize(stab.size)})</button>
      `;
      return;
    }

    if (!audioDrawn) {
      drawAudio(document.querySelector('.stab-only canvas'), stab.buffer);
      audioDrawn = true;
    }

    buttonsEl.innerHTML = `<button class="btn stab-play">Play</button>`;
  }

  window.addEventListener('app-statechange', updateButtonsUi);
  updateButtonsUi();

  function updatePlayheadUi() {
    if (!stabSource) {
      playhead.style.display = 'none';
      return;
    }

    const rect = playhead.parentNode.getBoundingClientRect();
    const posInTrack = context.currentTime - stabStart;
    const pos = Math.max(posInTrack / stab.buffer.duration, 0);

    playhead.style.display = 'block';
    playhead.style.transform = `translate(${rect.width * pos}px, 0)`;
    requestAnimationFrame(updatePlayheadUi);
  }

  function start() {
    stabSource = context.createBufferSource();
    stabSource.onended = event => {
      if (stabSource == event.target) stabSource = null;
    };
    stabSource.buffer = stab.buffer;
    stabSource.connect(context.destination);
    stabStart = context.currentTime;
    stabSource.start(stabStart);
  }

  buttonsEl.addEventListener('click', event => {
    const button = event.target;
    if (!button) return;

    if (button.classList.contains('stab-load')) {
      downloadAudio(stab);
      return;
    }

    if (button.classList.contains('stab-play')) {
      start();
      updatePlayheadUi();
      return;
    }
  });
})();
</script>

So yeah, it's way more complicated than just using `<audio src="…">` to play a sound, but web audio can do so much more. The amount of control web audio gives you is great fun, but also kinda daunting. In this post I'm just going to scratch the surface, and look at how to loop and queue sounds.

# The Big Web Quiz

At Chrome Dev Summit [Paul](https://twitter.com/aerotwist) & I ran a web-based interactive quiz between talks.

<figure class="full-figure">
<div class="video"><iframe src="//www.youtube.com/embed/pga5kyweM9g?rel=0&amp;html5=1&amp;start=6175" frameborder="0" allowfullscreen></iframe></div>
<figcaption>CSS properties on the Big Web Quiz</figcaption>
</figure>

We tried to make it as ridiculous as possible, and the music was a big part of that. The music was produced by [Plan8](http://plan8.se/), and it only took them a day to compose (we misread the licence on a piece of music we were going to use, so the deadline was _our_ fault. Anyway, the music they made is way better). They also have JS libraries for scheduling audio, but hey I was in the mood for some procrastination, so I did it myself.

# Switching between clips

The music in the Big Web Quiz has three phases, and we wanted to switch between them during questions. Using the code above, I loaded three buffers, `phase1AudioBuffer`, `phase2AudioBuffer`, and `stabAudioBuffer`, each representing a different phase of Big Web Quiz's music.

A naive solution is to play phase 1, then later stop it and play phase 2:

```js
const phase1Source = context.createBufferSource();
phase1Source.buffer = phase1AudioBuffer;
phase1Source.connect(context.destination);
phase1Source.start();
// Then later…
const phase2Source = context.createBufferSource();
phase2Source.buffer = phase2AudioBuffer;
phase2Source.connect(context.destination);
// Stop phase 1
phase1Source.stop();
// Start phase 2
phase2Source.start();
```

<div class="audio-container">
  <div class="bwq-simple bwq-loops">
    <div class="audio-output">
      <canvas></canvas>
      <div class="play-head"></div>
    </div>
    <div class="audio-output">
      <canvas></canvas>
      <div class="play-head"></div>
    </div>
    <div class="audio-output">
      <canvas></canvas>
      <div class="play-head"></div>
    </div>
  </div>
  <div class="bwq-simple-buttons audio-buttons"></div>
</div>
<script>
  (function() {
    let uiState = 'stopped';
    let audioDrawn = false;
    const buttonsEl = document.querySelector('.bwq-simple-buttons');
    const outputEls = document.querySelectorAll('.bwq-simple .audio-output');
    const playheadEls = document.querySelectorAll('.bwq-simple .play-head');
    let loop1Source;
    let loop1Start;
    let loop2Source;
    let loop2Start;
    let stabSource;
    let stabStart;
    function updateButtonsUi() {
      const loops = [loop1, loop2, stab];
      const notLoaded = loops.filter(item => !item.buffer);
      const allLoading = loops.every(item => item.downloadProgress > 0);
      const remaining = notLoaded.reduce((total, item) => total + item.size, 0);
      if (notLoaded.length) {
        if (allLoading) {
          let progress = buttonsEl.firstElementChild;
          if (!progress || progress.tagName != 'PROGRESS') {
            buttonsEl.innerHTML = `<progress max="1"></progress>`;
            progress = buttonsEl.firstElementChild;
          }
          progress.value = loops.reduce((total, loop) => total + loop.downloadProgress, 0) / loops.length;
          return;
        }
        buttonsEl.innerHTML = `
          <button class="btn bwq-load">Download audio (${humanSize(remaining)})</button>
        `;
        return;
      }
      if (!audioDrawn) {
        drawAll();
        audioDrawn = true;
      }
      if (uiState == 'stopped' || uiState == 'stab') {
        buttonsEl.innerHTML = `
          <button class="btn bwq-play">Play</button>
        `;
        return;
      }
      if (uiState == 'loop1') {
        buttonsEl.innerHTML = `
          <button class="btn bwq-step-up">Next phase</button>
          <button class="btn bwq-stop">Stop</button>
        `;
        return;
      }
      if (uiState == 'loop2') {
        buttonsEl.innerHTML = `
          <button class="btn bwq-stab">Stab</button>
          <button class="btn bwq-stop">Stop</button>
        `;
        return;
      }
    }
    function updatePlayheadUi() {
      if (uiState == 'stopped') {
        for (let el of Array.from(playheadEls)) {
          el.style.display = 'none';
        }
        return;
      }
      let container;
      let playHead;
      let buffer;
      let start;
      if (loop1Source) {
        container = outputEls[0];
        playHead = playheadEls[0];
        buffer = loop1.buffer;
        start = loop1Start;
      } else if (loop2Source) {
        container = outputEls[1];
        playHead = playheadEls[1];
        buffer = loop2.buffer;
        start = loop2Start;
      } else {
        container = outputEls[2];
        playHead = playheadEls[2];
        buffer = stab.buffer;
        start = stabStart;
      }
      const rect = container.getBoundingClientRect();
      for (let el of Array.from(playheadEls)) {
        el.style.display = 'none';
      }
      let posInTrack = context.currentTime - start;
      if (posInTrack > buffer.duration) {
        if (uiState == 'stab') return;
        posInTrack = posInTrack % buffer.duration;
      }
      const pos = Math.max(posInTrack / buffer.duration, 0);
      playHead.style.display = 'block';
      playHead.style.transform = `translate(${rect.width * pos}px, 0)`;
      requestAnimationFrame(updatePlayheadUi);
    }
    window.addEventListener('app-statechange', updateButtonsUi);
    updateButtonsUi();
    function drawAll() {
      const canvases = document.querySelectorAll('.bwq-simple canvas');
      drawAudio(canvases[0], loop1.buffer);
      drawAudio(canvases[1], loop2.buffer);
      drawAudio(canvases[2], stab.buffer);
    }
    function start() {
      loop1Source = context.createBufferSource();
      loop1Source.onended = event => {
        if (loop1Source == event.target) loop1Source = null;
      };
      loop1Source.buffer = loop1.buffer;
      loop1Source.loop = true;
      loop1Source.loopStart = loop1.startOffset;
      loop1Source.connect(context.destination);
      loop1Start = context.currentTime;
      loop1Source.start();
    }
    function stepItUp() {
      loop2Source = context.createBufferSource();
      loop2Source.onended = event => {
        if (loop2Source == event.target) loop2Source = null;
      };
      loop2Source.buffer = loop2.buffer;
      loop2Source.loop = true;
      loop2Source.loopStart = loop2.startOffset;
      loop2Source.connect(context.destination);
      loop2Source.start();
      loop1Source.stop();
      loop2Start = context.currentTime;
    }
    function playStab() {
      const stabSource = context.createBufferSource();
      stabSource.buffer = stab.buffer;
      stabSource.connect(context.destination);
      stabSource.start();
      loop2Source.stop();
      stabStart = context.currentTime;
    }
    function stop() {
      if (loop1Source) {
        try {
          loop1Source.stop();
        } catch (_) {}
      }
      if (loop2Source) {
        try {
          loop2Source.stop();
        } catch (_) {}
      }
    }
    buttonsEl.addEventListener('click', event => {
      const button = event.target;
      if (!button) return;
      if (button.classList.contains('bwq-load')) {
        uiState = 'stopped';
        [loop1, loop2, stab].filter(item => !item.buffer).map(item => downloadAudio(item));
        return;
      }
      if (button.classList.contains('bwq-play')) {
        start();
        uiState = 'loop1';
        updateButtonsUi();
        updatePlayheadUi();
        return;
      }
      if (button.classList.contains('bwq-stop')) {
        stop();
        uiState = 'stopped';
        updateButtonsUi();
        return;
      }
      if (button.classList.contains('bwq-step-up')) {
        stepItUp();
        uiState = 'loop2';
        updateButtonsUi();
        return;
      }
      if (button.classList.contains('bwq-stab')) {
        playStab();
        uiState = 'stab';
        updateButtonsUi();
        return;
      }
    });
})();
</script>

This doesn't really work. Switching between phases is jarring for a few reasons…

# Sound may not play instantly

Even though we have our audio data loaded in memory, there's still a gap between us calling `start()` and the audio actually playing.

This is fine if you want the sound to play as soon as possible and don't mind if it's a few milliseconds out, such as playing a sound in a game when the player collects a coin, but when syncronising two clips things need to be precise.

To do anything precise with audio, you need to schedule things in advance. Both `start` and `stop` take an optional number, the time to actually start/stop, and `context.currentTime` gives you the current time as far as the audio context is concerned.

How much advance notice you have to give depends on hardware, but [Chris Wilson reliably informs me](https://github.com/WebAudio/web-audio-api/issues/296#issuecomment-257104709) that a quarter of a second is super-safe more-than-enough, even for slow hardware.

So:

```js
const safetyBuffer = 0.25;
const switchTime = context.currentTime + safetyBuffer;
phase1Source.stop(switchTime);
phase2Source.start(switchTime);
```

A quarter of a second is a long delay, but in this case syncronisation is more important to us than immediacy.

Note: In the web audio API, time is in seconds, whereas most other web APIs use milliseconds.

But there's another delay to tackle…

# Different decoders are different

Encoding audio down to formats like MP3 or AAC is a lossy process, but you at least get to pick the encoder. When you use `decodeAudioData` you're relying on whatever decoder the browser uses, and this may come as a shock, but sometimes different browsers do things differently.

Here's the start/end of an AAC clip decoded by your browser:

<div class="audio-container">
  <div class="aac-decode">
    <div class="audio-output">
      <canvas></canvas>
    </div>
    <div class="audio-output">
      <canvas></canvas>
    </div>
  </div>
</div>
<script>
bufferFetch('asset-url:./tiny-clip.mp4').then(ab => context.decodeAudioData(ab)).then(buffer => {
  const canvases = document.querySelectorAll('.aac-decode canvas');
  drawAudio(canvases[0], buffer, 0, 7000);
  drawAudio(canvases[1], buffer, -7000);
});
</script>

The original clip is gapless at the start/end, but if you're in Chrome stable, Firefox, or Edge, you'll see a huge gap. By huge I mean 45 milliseconds, but y'know, that's a big deal when we're trying to instantly switch between two clips.

The gap is almost gone in Chrome Canary. Safari on the other hand gets it spot-on, no gap at all.

In the first draft of this article I congratulated Safari on a job well done, but actual expert [Paul Adenot](https://twitter.com/padenot) from Mozilla dropped a few knowledge bombs on me (in a friendly way of course).

The gap at the start is specified by the encoder as metadata. From [Apple's documentation](https://developer.apple.com/library/content/documentation/QuickTime/QTFF/QTFFAppenG/QTFFAppenG.html):

<blockquote class="quote">
<p>…encoders add at least 1024 samples of silence before the first ‘true’ audio sample, and often add more. This is called variously “priming”, “priming samples”, or “encoder delay”…</p>

<p>Therefore, a playback system must trim the silent priming samples to preserve correct synchronization. This trimming by the playback system should be done in two places:</p>

<ul>
<li>When playback first begins</li>
<li>When the playback position is moved to another location. For example, the user skips ahead or back to another part of the media and begins playback from that new location.</li>
</ul>
</blockquote>

The question is, should the browser remove the "priming samples" as part of `decodeAudioData`, or are we (as users of the web audio API) the "playback system", meaning we have to deal with it.

I still feel that Safari is doing the right thing here, especially as finding out the number of priming samples from the metadata is really non-trivial. To try and bring some consistency here, [I've filed an issue with the spec](https://github.com/WebAudio/web-audio-api/issues/1091).

In the meantime, we can work around the gap by finding out how long it is:

```js
function findStartGapDuration(audioBuffer) {
  // Get the raw audio data for the left & right channels.
  const l = audioBuffer.getChannelData(0);
  const r = audioBuffer.getChannelData(1);
  // Each is an array of numbers between -1 and 1 describing
  // the waveform, sample by sample.

  // Now to figure out how long both channels remain at 0:
  for (let i = 0; i < l.length; i++) {
    if (l[i] || r[i]) {
      // Now we know which sample is non-zero, but we want
      // the gap in seconds, not samples. Thankfully sampleRate
      // gives us the number of samples per second.
      return i / audioBuffer.sampleRate;
    }
  }

  // Hmm, the clip is entirely silent
  return audioBuffer.duration;
}
```

Once we have the gap, we can use source's second parameter to start playback at that point, after the silence:

```js
const phase1StartGap = findStartGapDuration(phase1AudioBuffer);
const phase1Source = context.createBufferSource();
phase1Source.buffer = phase1AudioBuffer;
phase1Source.connect(context.destination);
// Cater for the gap:
phase1Source.start(context.currentTime + safetyBuffer, phase1StartGap);
// Then later…
const phase2StartGap = findStartGapDuration(phase2AudioBuffer);
const phase2Source = context.createBufferSource();
phase2Source.buffer = phase2AudioBuffer;
phase2Source.connect(context.destination);
const switchTime = context.currentTime + safetyBuffer;
// Stop phase 1
phase1Source.stop(switchTime);
// Start phase 2
phase2Source.start(switchTime, phase2StartGap);
```

And here's the result:

<div class="audio-container">
  <div class="bwq-better bwq-loops">
    <div class="audio-output">
      <canvas></canvas>
      <div class="play-head"></div>
    </div>
    <div class="audio-output">
      <canvas></canvas>
      <div class="play-head"></div>
    </div>
    <div class="audio-output">
      <canvas></canvas>
      <div class="play-head"></div>
    </div>
  </div>
  <div class="bwq-better-buttons audio-buttons"></div>
</div>
<script>
  (function() {
    let uiState = 'stopped';
    let audioDrawn = false;
    const buttonsEl = document.querySelector('.bwq-better-buttons');
    const outputEls = document.querySelectorAll('.bwq-better .audio-output');
    const playheadEls = document.querySelectorAll('.bwq-better .play-head');
    let loop1Source;
    let loop1Start;
    let loop2Source;
    let loop2Start;
    let stabSource;
    let stabStart;
    function updateButtonsUi() {
      const loops = [loop1, loop2, stab];
      const notLoaded = loops.filter(item => !item.buffer);
      const allLoading = loops.every(item => item.downloadProgress > 0);
      const remaining = notLoaded.reduce((total, item) => total + item.size, 0);
      if (notLoaded.length) {
        if (allLoading) {
          let progress = buttonsEl.firstElementChild;
          if (!progress || progress.tagName != 'PROGRESS') {
            buttonsEl.innerHTML = `<progress max="1"></progress>`;
            progress = buttonsEl.firstElementChild;
          }
          progress.value = loops.reduce((total, loop) => total + loop.downloadProgress, 0) / loops.length;
          return;
        }
        buttonsEl.innerHTML = `
          <button class="btn bwq-load">Download audio (${humanSize(remaining)})</button>
        `;
        return;
      }
      if (!audioDrawn) {
        drawAll();
        audioDrawn = true;
      }
      if (uiState == 'stopped' || uiState == 'stab') {
        buttonsEl.innerHTML = `
          <button class="btn bwq-play">Play</button>
        `;
        return;
      }
      if (uiState == 'loop1') {
        buttonsEl.innerHTML = `
          <button class="btn bwq-step-up">Next phase</button>
          <button class="btn bwq-stop">Stop</button>
        `;
        return;
      }
      if (uiState == 'loop2') {
        buttonsEl.innerHTML = `
          <button class="btn bwq-stab">Stab</button>
          <button class="btn bwq-stop">Stop</button>
        `;
        return;
      }
    }
    function updatePlayheadUi() {
      if (uiState == 'stopped') {
        for (let el of Array.from(playheadEls)) {
          el.style.display = 'none';
        }
        return;
      }
      let container;
      let playHead;
      let buffer;
      let start;
      if (loop1Source) {
        container = outputEls[0];
        playHead = playheadEls[0];
        buffer = loop1.buffer;
        start = loop1Start;
      } else if (loop2Source) {
        container = outputEls[1];
        playHead = playheadEls[1];
        buffer = loop2.buffer;
        start = loop2Start;
      } else {
        container = outputEls[2];
        playHead = playheadEls[2];
        buffer = stab.buffer;
        start = stabStart;
      }
      const rect = container.getBoundingClientRect();
      for (let el of Array.from(playheadEls)) {
        el.style.display = 'none';
      }
      let posInTrack = context.currentTime - start;
      if (posInTrack > buffer.duration) {
        if (uiState == 'stab') return;
        posInTrack = posInTrack % buffer.duration;
      }
      const pos = Math.max(posInTrack / buffer.duration, 0);
      playHead.style.display = 'block';
      playHead.style.transform = `translate(${rect.width * pos}px, 0)`;
      requestAnimationFrame(updatePlayheadUi);
    }
    window.addEventListener('app-statechange', updateButtonsUi);
    updateButtonsUi();
    function drawAll() {
      const canvases = document.querySelectorAll('.bwq-better canvas');
      drawAudio(canvases[0], loop1.buffer);
      drawAudio(canvases[1], loop2.buffer);
      drawAudio(canvases[2], stab.buffer);
    }
    function start() {
      loop1Source = context.createBufferSource();
      loop1Source.onended = event => {
        if (loop1Source == event.target) loop1Source = null;
      };
      loop1Source.buffer = loop1.buffer;
      loop1Source.loop = true;
      loop1Source.loopStart = loop1.startOffset;
      loop1Source.connect(context.destination);
      loop1Start = context.currentTime + safetyOffset;
      loop1Source.start(loop1Start, loop1.startOffset);
    }
    function stepItUp() {
      loop2Source = context.createBufferSource();
      loop2Source.onended = event => {
        if (loop2Source == event.target) loop2Source = null;
      };
      loop2Source.buffer = loop2.buffer;
      loop2Source.loop = true;
      loop2Source.loopStart = loop2.startOffset;
      loop2Source.connect(context.destination);
      const startTime = context.currentTime + safetyOffset;
      loop2Source.start(startTime, loop2.startOffset);
      loop1Source.stop(startTime);
      loop2Start = startTime;
    }
    function playStab() {
      const stabSource = context.createBufferSource();
      stabSource.buffer = stab.buffer;
      stabSource.connect(context.destination);
      const startTime = context.currentTime + safetyOffset;
      stabSource.start(startTime, stab.startOffset);
      loop2Source.stop(startTime);
      stabStart = startTime;
    }
    function stop() {
      if (loop1Source) {
        try {
          loop1Source.stop();
        } catch (_) {}
      }
      if (loop2Source) {
        try {
          loop2Source.stop();
        } catch (_) {}
      }
    }
    buttonsEl.addEventListener('click', event => {
      const button = event.target;
      if (!button) return;
      if (button.classList.contains('bwq-load')) {
        uiState = 'stopped';
        [loop1, loop2, stab].filter(item => !item.buffer).map(item => downloadAudio(item));
        return;
      }
      if (button.classList.contains('bwq-play')) {
        start();
        uiState = 'loop1';
        updateButtonsUi();
        updatePlayheadUi();
        return;
      }
      if (button.classList.contains('bwq-stop')) {
        stop();
        uiState = 'stopped';
        updateButtonsUi();
        return;
      }
      if (button.classList.contains('bwq-step-up')) {
        stepItUp();
        uiState = 'loop2';
        updateButtonsUi();
        return;
      }
      if (button.classList.contains('bwq-stab')) {
        playStab();
        uiState = 'stab';
        updateButtonsUi();
        return;
      }
    });
})();
</script>

Better, but not perfect. Depending on when you press the button, the switch from phase 2 to the end stab can feel mistimed, but we can fix that…

# Musically-aware scheduling

Ideally we want the phases to switch right at the end of a musical bar. Phase 1 is 110bpm, and phase 2 is 123bpm, so we can figure out the duration of each bar:

```js
function getBarDuration(bpm, beatsPerBar) {
  return (60 / bpm) * beatsPerBar;
}

const phase1BarDuration = getBarDuration(110, 4);
const phase2BarDuration = getBarDuration(123, 4);
```

We want to switch the phases at the end of the next bar, unless that's less than our `safetyBuffer`, in which case we want to switch at the end of the following bar.

```js
function getPhaseSwitchTime(currentTime, phaseStartTime, barDuration) {
  // How long the phase has been playing:
  const phasePlaybackPosition = currentTime - phaseStartTime;
  // How long has it been playing the current bar:
  const positionWithinBar = phasePlaybackPosition % barDuration;
  // How long until the next bar:
  let untilSwitch = barDuration - positionWithinBar;
  // If it's less than our safetyBuffer, add another bar:
  if (untilSwitch < safetyBuffer) untilSwitch += barDuration;
  // Add on the current time:
  return untilSwitch + currentTime;
}
```

Unfortunately the web audio API doesn't tell us the current playblack position of a source ([it might eventually](https://github.com/WebAudio/web-audio-api/issues/296)), so we have to track that ourselves:

```js
const phase1StartTime = context.currentTime + safetyBuffer;
phase1Source.start(phase1StartTime, phase1StartGap);
// Then later…
const phase2StartTime = getPhaseSwitchTime(
  context.currentTime,
  phase1StartTime,
  phase1BarDuration,
);
phase1Source.stop(phase2StartTime);
phase2Source.start(phase2StartTime, phase2StartGap);
```

Job done! Here it is:

<div class="audio-container">
  <div class="bwq-perfect bwq-loops">
    <div class="audio-output">
      <canvas></canvas>
      <div class="play-head"></div>
    </div>
    <div class="audio-output">
      <canvas></canvas>
      <div class="play-head"></div>
    </div>
    <div class="audio-output">
      <canvas></canvas>
      <div class="play-head"></div>
    </div>
  </div>
  <div class="bwq-perfect-buttons audio-buttons"></div>
</div>
<script>
  (function() {
    let uiState = 'stopped';
    let audioDrawn = false;
    const buttonsEl = document.querySelector('.bwq-perfect-buttons');
    const outputEls = document.querySelectorAll('.bwq-perfect .audio-output');
    const playheadEls = document.querySelectorAll('.bwq-perfect .play-head');
    let loop1Source;
    let loop1Start;
    let loop2Source;
    let loop2Start;
    let stabSource;
    let stabStart;
    function getBarSwitchTime(currentTime, loopStart, loopBarLength) {
      const loopPlaytime = currentTime - loopStart;
      const timeInBar = loopPlaytime % loopBarLength;
      let untilSwitch = loopBarLength - timeInBar;
      if (untilSwitch < safetyOffset) untilSwitch += loopBarLength;
      return untilSwitch + currentTime;
    }
    function updateButtonsUi() {
      const loops = [loop1, loop2, stab];
      const notLoaded = loops.filter(item => !item.buffer);
      const allLoading = loops.every(item => item.downloadProgress > 0);
      const remaining = notLoaded.reduce((total, item) => total + item.size, 0);
      if (notLoaded.length) {
        if (allLoading) {
          let progress = buttonsEl.firstElementChild;
          if (!progress || progress.tagName != 'PROGRESS') {
            buttonsEl.innerHTML = `<progress max="1"></progress>`;
            progress = buttonsEl.firstElementChild;
          }
          progress.value = loops.reduce((total, loop) => total + loop.downloadProgress, 0) / loops.length;
          return;
        }
        buttonsEl.innerHTML = `
          <button class="btn bwq-load">Download audio (${humanSize(remaining)})</button>
        `;
        return;
      }
      if (!audioDrawn) {
        drawAll();
        audioDrawn = true;
      }
      if (uiState == 'stopped' || uiState == 'stab') {
        buttonsEl.innerHTML = `
          <button class="btn bwq-play">Play</button>
        `;
        return;
      }
      if (uiState == 'loop1') {
        buttonsEl.innerHTML = `
          <button class="btn bwq-step-up">Next phase</button>
          <button class="btn bwq-stop">Stop</button>
        `;
        return;
      }
      if (uiState == 'loop2') {
        buttonsEl.innerHTML = `
          <button class="btn bwq-stab">Stab</button>
          <button class="btn bwq-stop">Stop</button>
        `;
        return;
      }
    }
    function updatePlayheadUi() {
      if (uiState == 'stopped') {
        for (let el of Array.from(playheadEls)) {
          el.style.display = 'none';
        }
        return;
      }
      let container;
      let playHead;
      let buffer;
      let start;
      if (loop1Source) {
        container = outputEls[0];
        playHead = playheadEls[0];
        buffer = loop1.buffer;
        start = loop1Start;
      } else if (loop2Source) {
        container = outputEls[1];
        playHead = playheadEls[1];
        buffer = loop2.buffer;
        start = loop2Start;
      } else {
        container = outputEls[2];
        playHead = playheadEls[2];
        buffer = stab.buffer;
        start = stabStart;
      }
      const rect = container.getBoundingClientRect();
      for (let el of Array.from(playheadEls)) {
        el.style.display = 'none';
      }
      let posInTrack = context.currentTime - start;
      if (posInTrack > buffer.duration) {
        if (uiState == 'stab') return;
        posInTrack = posInTrack % buffer.duration;
      }
      const pos = Math.max(posInTrack / buffer.duration, 0);
      playHead.style.display = 'block';
      playHead.style.transform = `translate(${rect.width * pos}px, 0)`;
      requestAnimationFrame(updatePlayheadUi);
    }
    window.addEventListener('app-statechange', updateButtonsUi);
    updateButtonsUi();
    function drawBarLines(canvas, loop) {
      const context = canvas.getContext('2d');
      context.fillStyle = 'rgba(255, 255, 255, 0.2)';
      const width = Math.floor(loop.barLength / loop.buffer.duration * canvas.width);
      for (let i = loop.startOffset + loop.barLength; i < loop.buffer.duration; i += loop.barLength * 2) {
        const x = Math.floor((i / loop.buffer.duration) * canvas.width);
        context.fillRect(x, 0, width, canvas.height);
      }
    }
    function drawAll() {
      const canvases = document.querySelectorAll('.bwq-perfect canvas');
      drawAudio(canvases[0], loop1.buffer);
      drawBarLines(canvases[0], loop1);
      drawAudio(canvases[1], loop2.buffer);
      drawBarLines(canvases[1], loop2);
      drawAudio(canvases[2], stab.buffer);
    }
    function start() {
      loop1Source = context.createBufferSource();
      loop1Source.onended = event => {
        if (loop1Source == event.target) loop1Source = null;
      };
      loop1Source.buffer = loop1.buffer;
      loop1Source.loop = true;
      loop1Source.loopStart = loop1.startOffset;
      loop1Source.connect(context.destination);
      loop1Start = context.currentTime + safetyOffset;
      loop1Source.start(loop1Start, loop1.startOffset);
    }
    function stepItUp() {
      loop2Source = context.createBufferSource();
      loop2Source.onended = event => {
        if (loop2Source == event.target) loop2Source = null;
      };
      loop2Source.buffer = loop2.buffer;
      loop2Source.loop = true;
      loop2Source.loopStart = loop2.startOffset;
      loop2Source.connect(context.destination);
      const startTime = getBarSwitchTime(context.currentTime, loop1Start, loop1.barLength);
      loop2Source.start(startTime, loop2.startOffset);
      loop1Source.stop(startTime);
      loop2Start = startTime;
    }
    function playStab() {
      const stabSource = context.createBufferSource();
      stabSource.buffer = stab.buffer;
      stabSource.connect(context.destination);
      const startTime = getBarSwitchTime(context.currentTime, loop2Start, loop2.barLength);
      stabSource.start(startTime, stab.startOffset);
      loop2Source.stop(startTime);
      stabStart = startTime;
    }
    function stop() {
      if (loop1Source) {
        try {
          loop1Source.stop();
        } catch (_) {}
      }
      if (loop2Source) {
        try {
          loop2Source.stop();
        } catch (_) {}
      }
    }
    buttonsEl.addEventListener('click', event => {
      const button = event.target;
      if (!button) return;
      if (button.classList.contains('bwq-load')) {
        uiState = 'stopped';
        [loop1, loop2, stab].filter(item => !item.buffer).map(item => downloadAudio(item));
        return;
      }
      if (button.classList.contains('bwq-play')) {
        start();
        uiState = 'loop1';
        updateButtonsUi();
        updatePlayheadUi();
        return;
      }
      if (button.classList.contains('bwq-stop')) {
        stop();
        uiState = 'stopped';
        updateButtonsUi();
        return;
      }
      if (button.classList.contains('bwq-step-up')) {
        stepItUp();
        uiState = 'loop2';
        updateButtonsUi();
        return;
      }
      if (button.classList.contains('bwq-stab')) {
        playStab();
        uiState = 'stab';
        updateButtonsUi();
        return;
      }
    });
})();
</script>

Sometimes switching between clips can cause a click if the samples don't join at a zero value. If you get this, you can use a [gain node](https://developer.mozilla.org/en-US/docs/Web/API/GainNode) to create a really short, imperceptible, fade-out and fade-in.

# Dynamic looping

Switching multiple clips isn't the only way to create multi-phase audio. BEHOLD[:](https://twitter.com/philhawksworth/status/802302348991176705)

<div class="audio-container">
  <div class="audio-output single-loop">
    <canvas></canvas>
    <div class="loop"></div>
    <div class="play-head"></div>
  </div>
  <div class="single-loop-buttons audio-buttons"></div>
</div>
<script>
  (function() {
    let uiState = 'stopped';
    let audioDrawn = false;
    const buttonsEl = document.querySelector('.single-loop-buttons');
    const playheadEl = document.querySelector('.single-loop .play-head');
    const loopEl = document.querySelector('.single-loop .loop');
    const samplePhases = [
      {start: 328948,  end: 656828},
      {start: 985007,  end: 1314119},
      {start: 1643272, end: 1972421},
      {start: 1972421, end: 2137288},
    ];
    let phases;
    let currentPhase = 0;
    let loopSource;
    let loopStart;
    function updateButtonsUi() {
      if (!singleLoop.buffer) {
        if (singleLoop.downloadProgress) {
          let progress = buttonsEl.firstElementChild;
          if (!progress || progress.tagName != 'PROGRESS') {
            buttonsEl.innerHTML = `<progress max="1"></progress>`;
            progress = buttonsEl.firstElementChild;
          }
          progress.value = singleLoop.downloadProgress;
          return;
        }
        buttonsEl.innerHTML = `
          <button class="btn single-loop-load">Download audio (${humanSize(singleLoop.size)})</button>
        `;
        return;
      }
      if (!audioDrawn) {
        drawAudio(document.querySelector('.single-loop canvas'), singleLoop.buffer);
        phases = samplePhases.map(obj => ({
          start: obj.start / 48000 + singleLoop.startOffset,
          end: obj.end / 48000 + singleLoop.startOffset
        }));
        audioDrawn = true;
      }
      if (uiState == 'stopped') {
        buttonsEl.innerHTML = `
          <button class="btn single-loop-play">Play</button>
        `;
        return;
      }
      if (uiState == 'playing') {
        buttonsEl.innerHTML = `
          <button class="btn single-loop-next">Next loop</button>
          <button class="btn single-loop-stop">Stop</button>
        `;
        return;
      }
    }
    let lastTime;
    let posInTrack;
    function updatePlayheadUi() {
      if (uiState == 'stopped') {
        playheadEl.style.display = 'none';
        return;
      }
      const time = context.currentTime;
      posInTrack += time - lastTime;
      lastTime = time;
      if (posInTrack > loopSource.loopEnd) {
        posInTrack = loopSource.loopStart + (posInTrack - loopSource.loopEnd);
      }
      const rect = playheadEl.parentNode.getBoundingClientRect();
      const pos = Math.max(posInTrack / singleLoop.buffer.duration, 0);
      playheadEl.style.transform = `translate(${rect.width * pos}px, 0)`;
      playheadEl.style.display = 'block';
      requestAnimationFrame(updatePlayheadUi);
    }
    window.addEventListener('app-statechange', updateButtonsUi);
    updateButtonsUi();
    function start() {
      const buffer = singleLoop.buffer;
      currentPhase = 0;
      loopSource = context.createBufferSource();
      loopSource.buffer = buffer;
      loopSource.loop = true;
      loopSource.loopStart = phases[currentPhase].start;
      loopSource.loopEnd = phases[currentPhase].end;
      loopSource.connect(context.destination);
      loopSource.start(context.currentTime + safetyOffset, singleLoop.startOffset);
      lastTime = context.currentTime;
      posInTrack = -safetyOffset + singleLoop.startOffset;
      loopEl.style.display = 'block';
      drawLoop(loopEl, phases[currentPhase].start / buffer.duration, (phases[currentPhase].end - phases[currentPhase].start) / buffer.duration);
    }
    function nextPhase() {
      const buffer = singleLoop.buffer;
      currentPhase++;
      if (currentPhase != phases.length) {
        loopSource.loopStart = phases[currentPhase].start;
        loopSource.loopEnd = phases[currentPhase].end;
        drawLoop(loopEl, phases[currentPhase].start / buffer.duration, (phases[currentPhase].end - phases[currentPhase].start) / buffer.duration);
        return;
      }
      currentPhase = 1;
      loopSource.loopStart = phases[currentPhase].start;
      loopSource.loopEnd = 2631045 / 48000 + singleLoop.startOffset;
      drawLoop(loopEl, phases[currentPhase].start / buffer.duration, buffer.duration);
      setTimeout(() => {
        loopSource.loopEnd = phases[currentPhase].end;
        drawLoop(loopEl, phases[currentPhase].start / buffer.duration, (phases[currentPhase].end - phases[currentPhase].start) / buffer.duration);
      }, 658624 / 48);
    }
    function stop() {
      loopEl.style.display = 'none';
      if (loopSource) {
        try {
          loopSource.stop();
        } catch (_) {}
      }
    }
    buttonsEl.addEventListener('click', event => {
      const button = event.target;
      if (!button) return;
      if (button.classList.contains('single-loop-load')) {
        downloadAudio(singleLoop);
        return;
      }
      if (button.classList.contains('single-loop-play')) {
        start();
        uiState = 'playing';
        updateButtonsUi();
        updatePlayheadUi();
        return;
      }
      if (button.classList.contains('single-loop-stop')) {
        stop();
        uiState = 'stopped';
        updateButtonsUi();
        return;
      }
      if (button.classList.contains('single-loop-next')) {
        nextPhase();
        return;
      }
    });
})();
</script>

Credit: [Sonic 2, chemical plant zone, Protostar remix](https://soundcloud.com/psdub/sonic-chemical-plant-zone).

This is a single source that loops, but the loop-points change dynamically. Compared to what we've done already, looping a clip is pretty simple:

```js
// Cater for buggy AAC decoders as before:
const sonicStartGap = findStartGapDuration(sonicAudioBuffer);
// Create the source:
const sonicSource = context.createBufferSource();
sonicSource.buffer = sonicAudioBuffer;
sonicSource.connect(context.destination);
// Loop it!
sonicSource.loop = true;
// Set loop points:
sonicSource.loopStart = loopStartTime + sonicStartGap;
sonicSource.loopEnd = loopEndTime + sonicStartGap;
// Play!
sonicSource.start(0, sonicStartGap);
```

And changing those loop points is just…

```js
sonicSource.loopStart = anotherLoopStartTime + sonicStartGap;
sonicSource.loopEnd = anotherLoopEndTime + sonicStartGap;
```

Although discovering the loop points is easier said than done.

# Finding the loop points

Tools like [Audacity](http://www.audacityteam.org/) (free) and [Adobe Audition](http://www.adobe.com/Audition) (not so free) are great for chopping and looping audio.

Once we've found the loop points, we need to find the _sample_ they start & end on. This is the most accurate measurement we'll get.

<figure class="full-figure">
  <img src="asset-url:./audacity.png" alt="">
  <figcaption>Selecting by sample in Audacity</figcaption>
</figure>

```js
const loopPoints = [
  { start: 328948, end: 656828 },
  { start: 985007, end: 1314119 },
  { start: 1643272, end: 1972421 },
  { start: 1972421, end: 2137288 },
];
```

But `loopStart` and `loopEnd` want the time in seconds, so we convert them:

```js
const loopPointTimes = loopPoints.map((loop) => ({
  start: loop.start / 48000 + sonicStartGap,
  end: loop.end / 48000 + sonicStartGap,
}));
```

`48000` needs to be replaced with the sample rate of the clip as viewed in Audacity. Don't do what I did & use `buffer.sampleRate`, as the decoded sample rate can be different to the sample rate of the file. Audio is decoded to `context.sampleRate`, which is 44,100 on my mac, but 48,000 on my phone.

# Looping back to an earlier point

At the end of the demo above, the clip loops back to an earlier point. Unfortunately, if you set `loopEnd` to a point earlier than the current playback point, it immediately goes back to `loopStart`, whereas we want it to play through to the end, _then_ go back to an earlier loop.

The least hacky way to do this would be to stop `sonicSource` looping, and queue up a new `sonicSource2` to start looping once `sonicSource` reaches its natural finish.

However, to do this, we'd need to know the current playback position of `sonicSource`, and as I mentioned earlier, this [feature hasn't landed yet](https://github.com/WebAudio/web-audio-api/issues/296). We can't even reliably work around this - the source has been looping all over the place, and we can't be sure each write to `loopStart` and `loopEnd` made it to the sound card in time. I'm hacking it for the purposes of the visualisations above, but it isn't accurate enough for sound.

To work around this we make two changes to the loop. We loop from the start of the earlier loop, right to the end of the clip. Then, once the clip has played past the end, we change `loopEnd` to the end of the earlier loop.

```js
// Current loop start
const currentLoopStart = sonicSource.loopStart;
// The earlier loop we want to move to.
const targetLoop = loopPointTimes[1];
// The point we want to reach before looping back.
// sonicSource.duration is not good enough here, due to
// the AAC decoding bug mentioned earlier.
const endSample = 658624;
const endTime = endSample / 48000 + sonicStartGap;
// Play to the end, then loop back to the start:
sonicSource.loopStart = targetLoop.start;
sonicSource.loopEnd = endTime;
// But once it's gone back to loopStart, we don't want
// it to play all the way to loopEnd, we want targetLoop.end.
// Hack time!
setTimeout(() => {
  sonicSource.loopEnd = targetLoop.end;
}, (endTime - currentLoopStart) * 1000);
```

`endTime - currentLoopStart` is the maximum time the clip could play before it loops back to `targetLoop.start`, after that it's safe to move the end point. Done!

While the web audio API isn't something you'll use in every project, it's suprisingly powerful and fun. If you're wanting to dig a little deeper, I recommend this [multi-part guide](http://teropa.info/blog/2016/08/19/what-is-the-web-audio-api.html) by [Tero Parviainen](https://twitter.com/teropa).

Speaking of procrastination, I really should be getting back to the service worker spec…

<small>Huge thanks to [Paul Adenot](https://twitter.com/padenot), [Stuart Memo](https://twitter.com/stuartmemo), [Chris Wilson](https://twitter.com/cwilso), and [Jen Ross](https://twitter.com/jenross83) for proof-reading and fact-checking.</small>
