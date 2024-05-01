---
title: Events and disabled form fields
date: 2017-02-17 12:56:00
summary:
  Turns out, mouse events *don't* fire when the pointer is over disabled
  form elements, except in Firefox. This is annoying when implementing things
  like drag & drop.
mindframe: ''
image: null
meta: ''
---

I've been working on the web since I was a small child all the way through to the haggard old man I am to day. However, the web still continues to surprise me.

Turns out, mouse events _don't_ fire when the pointer is over disabled form elements, except in Firefox.

# Serious?

Serious. Give it a go. Move the mouse from the blue area below into the disabled button:

<style>
  .demo-area {
    font-size: 0.9em;
    margin: 0 -20px;
    background: #e0eaf5;
    padding: 10px 0 10px 20px;
  }

  @media (min-width: 530px) {
    .demo-area {
      margin: 0 -32px 0 -32px;
      padding: 10px 0 10px 32px;
    }
  }

  .test-elements {
    display: flex;
    flex-flow: column;
    margin-right: 100px;
  }

  .test-elements * {
    max-width: 280px;
  }

  .capture-el {
    padding: 22px;
    background: #008000;
    display: inline-block;
    color: #fff;
    box-sizing: border-box;
    text-align: center;
  }

  .demo-area button {
    padding: 22px;
    font: inherit;
  }

  .demo-area iframe {
    border: none;
    background: #fff;
    height: 80px;
  }

  .results-table {
    width: 100%;
    table-layout: fixed;
  }

  .results-area {
    margin: 1rem -20px;
  }

  @media (min-width: 530px) {
    .results-area {
      margin: 1rem -32px 1rem 0;
    }
  }

  .results-table th, .results-table td {
    padding: 1px 6px;
    vertical-align: top;
    font-weight: normal;
    text-align: left;
  }

  .results-table th {
    background: #009d81;
    color: #fff;
    width: 25%;
  }

  .results-table td {
    background: #eee;
    font-size: 0.8rem;
  }
</style>

<div class="demo-area">
  <div class="test-elements">
    <div class="capture-el">This calls setPointerCapture</div>
    <button disabled>Disabled button</button>
    <iframe srcdoc="Sandboxed iframe" sandbox></iframe>
  </div>
</div>

<div class="results-area">
  <table class="results-table">
    <tr>
      <th>Misc</th>
      <th>Mouse</th>
      <th>Touch</th>
      <th>Pointer</th>
    </tr>
    <tr>
      <td class="misc-events"></td>
      <td class="mouse-events"></td>
      <td class="touch-events"></td>
      <td class="pointer-events"></td>
    </tr>
  </table>
</div>

<script>(function() {
const demoArea = document.querySelector('.demo-area');
const captureEl = document.querySelector('.capture-el');
const mouseEvents = document.querySelector('.mouse-events');
const touchEvents = document.querySelector('.touch-events');
const pointerEvents = document.querySelector('.pointer-events');
const miscEvents = document.querySelector('.misc-events');

function logEvent(event) {
  let col;

  if (event.type == 'click') {
    col = miscEvents;
  }
  else if (event.type.startsWith('mouse')) {
    col = mouseEvents;
  }
  else if (event.type.startsWith('touch')) {
    col = touchEvents;
  }
  else if (event.type.startsWith('pointer')) {
    col = pointerEvents;
  }

  log(col, event.type);
}

function log(col, val) {
  const lastLog = col.lastElementChild;

  if (lastLog && lastLog.querySelector('.name').textContent == val) {
    lastLog.querySelector('.count').textContent = Number(lastLog.querySelector('.count').textContent) + 1;
    return;
  }

  const div = document.createElement('div');
  div.innerHTML = `<span class="name">${val}</span> (<span class="count">1</span>)`;

  col.appendChild(div);
}

const events = [
  'click',
  'mousedown', 'mousemove', 'mouseup',
  'touchstart', 'touchmove', 'touchend',
  'pointerdown', 'pointermove', 'pointerup'
];

for (const type of events) {
  demoArea.addEventListener(type, logEvent, true);
}

for (const type of ['pointerdown', 'mousedown']) {
  captureEl.addEventListener(type, event => {
    const el = event.target;

    if (el.setPointerCapture && event.pointerId) {
      log(miscEvents, 'setPointerCapture');
      el.setPointerCapture(event.pointerId);
    }

    if (el.setCapture) {
      log(miscEvents, 'setCapture');
      el.setCapture(true);
    }
  });
}

for (const type of ['pointerup', 'mouseup']) {
  captureEl.addEventListener(type, event => {
    const el = event.target;

    if (el.releasePointerCapture && event.pointerId) {
      log(miscEvents, 'releasePointerCapture');
      el.releasePointerCapture(event.pointerId);
    }

    if (el.releaseCapture) {
      log(miscEvents, 'releaseCapture');
      el.releaseCapture(true);
    }
  });
}
}())</script>

It's not like the disabled button element is stopping the event propagating either, it prevents capturing listeners on parent elements too.

The spec says:

<blockquote class="quote">
  <p>A form control that is disabled must prevent any click events that are queued on the user interaction task source from being dispatched on the element.</p>
  — <a href="https://html.spec.whatwg.org/multipage/forms.html#enabling-and-disabling-form-controls:-the-disabled-attribute">The HTML Spec</a>
</blockquote>

…but it seems like most browsers are applying this behaviour to all mouse events. I imagine this is an ancient oddity, but given that Firefox doesn't do it, I hope other browsers can drop this weird behaviour. If not, it should be added to the spec ([issue](https://github.com/whatwg/html/issues/2368)).

This kind of thing is especially painful when implementing drag & drop, as you suddenly lose the ability to track the pointer.

# Touch events vs pointer events

The weird disabled-element behaviour doesn't happen with touch events. I guess this is because they're a new set of events, so they were able to break away from the legacy of mouse events.

Unfortunately, the weird behaviour is duplicated in [pointer events](https://developers.google.com/web/updates/2016/10/pointer-events). It's a little sad that this new set of events is taking on legacy behaviour from day one. However, it isn't explicitly part of the spec, so maybe it can change. I've [filed an issue](https://github.com/w3c/pointerevents/issues/177) to see what can be done about it.

# Capturing pointer events

With touch events, all of the `touchmove` and `touchend` events fire on the same element that received the corresponding `touchstart` event. Whereas with mouse/pointer events, events fire on the element under the pointer.

However, pointer events allow you to switch to the touch events model:

```js
element.addEventListener('pointerdown', (event) => {
  element.setPointerCapture(event.pointerId);
});

element.addEventListener('pointerup', (event) => {
  element.releasePointerCapture(event.pointerId);
});
```

Once you do this, events will continue to fire on the captured element, even if you move across a disabled form element.

This works in Edge & Chrome, although Chrome stops firing events when you move across an iframe ([issue](https://bugs.chromium.org/p/chromium/issues/detail?id=693494)).

Firefox supports a similar method, [`setCapture`](https://developer.mozilla.org/en-US/docs/Web/API/Element/setCapture), which is an old non-standard IE API, but achieves roughly the same thing.

Unfortunately these methods don't fix the problem entirely. You still lose `pointerdown`/`pointerup` events that start on a disabled form element.

# Workaround

```css
input[disabled],
button[disabled] {
  pointer-events: none;
}
```

This means disabled form elements cannot be interacted with, but it also solves the event issue.

Additionally, for drag & drop interactions, you may want to set `pointer-events: none` on all iframes during the drag interaction. This means you'll continue to get move events across the whole page.
