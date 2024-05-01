---
title: 'View transitions: Handling aspect ratio changes'
date: 2024-02-21 01:00:00
summary: Tips and tricks to get the transition you want
meta: Tips and tricks to get the transition you want
image: './img.png'
---

This post assumes some knowledge of view transitions. If you're looking for a from-scratch intro to the feature, [see this article](https://developer.chrome.com/docs/web-platform/view-transitions/).

When folks ask me for help with view transition animations that "don't quite look right", it's usually because the content changes aspect ratio. Here's how to handle it:

<script>
  if (!document.startViewTransition) {
    document.currentScript.insertAdjacentHTML('beforebegin', `<div class="warning">Your browser doesn't support view transitions, so the demos in this article won't work. At time of writing, only Chrome supports view transitions.</div>`);
  }
</script>

# Unintentional aspect ratio changes

It's pretty common for these aspect ratio changes to be unintentional. For example, here's some CSS:

```css
.simple-text {
  font-size: 25vw;

  &.toggled {
    position: absolute;
    bottom: 32px;
    right: 32px;
    font-size: 9vw;
  }
}
```

And we'll toggle that class when a button's clicked:

```js
btn.onclick = () => {
  document.querySelector('.simple-text').classList.toggle('toggled');
};
```

Here's the result:

<style>
  .demo-buttons {
    display: flex;
    gap: 6px;
    flex-flow: row wrap;
  }
  .demo iframe {
    border: none;
    aspect-ratio: 1/0.45;
    width: 100%;
    display: block;
  }
  .full-figure {
    background: #d2d2d2;
  }
</style>

<div class="demo">
  <figure class="full-figure max-figure">
    <div class="iframe-container"></div>
    <div class="figcaption demo-buttons"></div>
  </figure>
  <script>
    const iframeStyles = `
      :root {
        --spring-easing: linear(
          0, 0.01, 0.04 1.5%, 0.163 3.2%, 0.824 9.2%, 1.055, 1.199 14.2%, 1.24, 1.263,
          1.265 18.2%, 1.243 19.9%, 0.996 28.8%, 0.951, 0.93 34.1%, 0.929 35.7%,
          0.935 37.5%, 1 46.3%, 1.018 51.4%, 1.017 55.1%, 0.995 68.6%, 1.001 85.5%, 1
        );
        --spring-duration: 0.5s;
      }
      html {
        font-family: sans-serif;
        overflow: hidden;
      }
      body {
        margin: 0;
      }
      html, body {
        height: 100%;
      }
      .padder {
        padding: 32px;
      }
      .simple-text {
        view-transition-name: simple-text;
        font-size: 25vw;
        &.outlined {
          outline: 6px solid red;
        }
        &.toggled {
          position: absolute;
          bottom: 32px;
          right: 32px;
          font-size: 9vw;
          outline-color: blue;
        }
        &.fit-content {
          width: fit-content;
        }
      }
      html.slow::view-transition-group(*),
      html.slow::view-transition-old(*),
      html.slow::view-transition-new(*) {
        animation-duration: 3s !important;
      }
      .text-in-container,
      .container {
        view-transition-name: text-in-container;
        background: #009d81;
        border-radius: 0.3em;
        padding: 0.4em 1em;
        color: #fff;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 5.7vw;
        white-space: nowrap;
      }
      .container {
        padding: 0;
        view-transition-name: container;
      }
      .text {
        padding: 0.4em 1em;
        view-transition-name: text;
      }
      html.full-height-group {
        &::view-transition-old(text-in-container),
        &::view-transition-new(text-in-container) {
          height: 100%;
        }
      }
      ::view-transition-old(container),
      ::view-transition-new(container) {
        height: 100%;
      }
      html.fit-text {
        &::view-transition-old(text),
        &::view-transition-new(text) {
          height: 100%;
          object-fit: none;
          overflow: clip;
        }
      }
      html.align-text {
        &::view-transition-old(text),
        &::view-transition-new(text) {
          object-position: left;
        }
      }
      html.pseudo-text {
        .text {
          &::before {
            font-size: 2em;
            content: 'Hello!';
          }
          &.toggled::before {
            font-size: 1em;
            content: 'Hello everyone out there!';
          }
        }
      }
      html.position-and-clip {
        &::view-transition-old(text),
        &::view-transition-new(text) {
          height: 100%;
          width: auto;
        }
        &::view-transition-group(text) {
          overflow: clip;
        }
      }
      html.padding-move {
        .container {
          padding: 0.4em 1em;
        }
        .text {
          padding: 0;
        }
      }
      html.clip-margin {
        &::view-transition-group(text) {
          overflow-clip-margin: 5.7vw;
        }
      }
      html.boing {
        &::view-transition-group(*),
        &::view-transition-old(*),
        &::view-transition-new(*) {
          animation-timing-function: var(--spring-easing);
          animation-duration: var(--spring-duration);
        }
      }
    `;
    function addButtons(el, btns) {
      for (const [label, callback] of Object.entries(btns)) {
        const btn = document.createElement('button');
        btn.classList.add('btn');
        btn.textContent = label;
        btn.addEventListener('click', callback);
        el.append(btn);
      }
    }
    function addIframeStyles(iframe) {
      const style = document.createElement('style');
      style.textContent = iframeStyles;
      iframe.contentDocument.head.append(style);
    }
    {
      const demoEl = document.currentScript.closest('.demo');
      const iframe = document.createElement('iframe');
      iframe.onload = () => {
        addIframeStyles(iframe);
        iframe.contentDocument.body.innerHTML = `
          <div class="padder"><div class="simple-text">Hello!</div></div>
        `;
      };
      demoEl.querySelector('.iframe-container').prepend(iframe);
      const buttonsEl = demoEl.querySelector('.demo-buttons');
      const buttons = {
        "Toggle CSS class"() {
          iframe.contentDocument.querySelector('.simple-text').classList.toggle('toggled');
        }
      };
      addButtons(buttonsEl, buttons);
    }
  </script>
</div>

Fine. Ok. But let's make it a view transition. We'll give it a [`view-transition-name`](https://developer.mozilla.org/en-US/docs/Web/CSS/view-transition-name):

```css
.simple-text {
  view-transition-name: simple-text;
}
```

And wrap our toggle in [`startViewTransition`](https://developer.mozilla.org/en-US/docs/Web/API/Document/startViewTransition):

```js
btn.onclick = () => {
  document.startViewTransition(() => {
    document.querySelector('.simple-text').classList.toggle('toggled');
  });
};
```

And here's the result:

<div class="demo">
  <figure class="full-figure max-figure">
    <div class="iframe-container"></div>
    <div class="figcaption demo-buttons"></div>
  </figure>
  <script>
    {
      const demoEl = document.currentScript.closest('.demo');
      const iframe = document.createElement('iframe');
      iframe.onload = () => {
        addIframeStyles(iframe);
        iframe.contentDocument.body.innerHTML = `
          <div class="padder"><div class="simple-text">Hello!</div></div>
        `;
      };
      demoEl.querySelector('.iframe-container').prepend(iframe);
      const buttonsEl = demoEl.querySelector('.demo-buttons');
      const buttons = {
        "Toggle CSS class"() {
          iframe.contentDocument.startViewTransition(() => {
            iframe.contentDocument.querySelector('.simple-text').classList.toggle('toggled');
          });
        },
        "Animate slowly"() {
          iframe.contentDocument.documentElement.classList.add('slow');
          const transition = iframe.contentDocument.startViewTransition(() => {
            iframe.contentDocument.querySelector('.simple-text').classList.toggle('toggled');
          });
          transition.finished.then(() => {
            iframe.contentDocument.documentElement.classList.remove('slow');
          })
        },
      };
      addButtons(buttonsEl, buttons);
    }
  </script>
</div>

It doesn't seem to animate consistently from one state to the other – at times you can see multiple "Hello!" elements.

This is because it's changing aspect ratio. It's more obvious with outlines added:

<div class="demo">
  <figure class="full-figure max-figure">
    <div class="iframe-container"></div>
    <div class="figcaption demo-buttons"></div>
  </figure>
  <script>
    {
      const demoEl = document.currentScript.closest('.demo');
      const iframe = document.createElement('iframe');
      iframe.onload = () => {
        addIframeStyles(iframe);
        iframe.contentDocument.body.innerHTML = `
          <div class="padder"><div class="simple-text outlined">Hello!</div></div>
        `;
      };
      demoEl.querySelector('.iframe-container').prepend(iframe);
      const buttonsEl = demoEl.querySelector('.demo-buttons');
      const buttons = {
        "Toggle CSS class"() {
          iframe.contentDocument.startViewTransition(() => {
            iframe.contentDocument.querySelector('.simple-text').classList.toggle('toggled');
          });
        },
        "Animate slowly"() {
          iframe.contentDocument.documentElement.classList.add('slow');
          const transition = iframe.contentDocument.startViewTransition(() => {
            iframe.contentDocument.querySelector('.simple-text').classList.toggle('toggled');
          });
          transition.finished.then(() => {
            iframe.contentDocument.documentElement.classList.remove('slow');
          })
        },
        "Toggle outlines"() {
          iframe.contentDocument.querySelector('.simple-text').classList.toggle('outlined');
        }
      };
      addButtons(buttonsEl, buttons);
    }
  </script>
</div>

Although the text is the same in both views, the box shapes are different.

The initial state is the default `position: static` and `display: block`, so it takes up the full width of the parent. When it becomes `position: absolute`, its taken out of flow, and its size fits the content.

The old and new views don't line up properly, because the old view has empty space to the right-hand side, but the new view doesn't.

We want the element to be the size of the content in both cases, which we can do with [`fit-content`](https://developer.mozilla.org/en-US/docs/Web/CSS/fit-content):

```css
.simple-text {
  width: fit-content;
}
```

Here's the result:

<div class="demo">
  <figure class="full-figure max-figure">
    <div class="iframe-container"></div>
    <div class="figcaption demo-buttons"></div>
  </figure>
  <script>
    {
      const demoEl = document.currentScript.closest('.demo');
      const iframe = document.createElement('iframe');
      iframe.onload = () => {
        addIframeStyles(iframe);
        iframe.contentDocument.body.innerHTML = `
          <div class="padder"><div class="simple-text fit-content">Hello!</div></div>
        `;
      };
      demoEl.querySelector('.iframe-container').prepend(iframe);
      const buttonsEl = demoEl.querySelector('.demo-buttons');
      const buttons = {
        "Toggle CSS class"() {
          iframe.contentDocument.startViewTransition(() => {
            iframe.contentDocument.querySelector('.simple-text').classList.toggle('toggled');
          });
        },
        "Animate slowly"() {
          iframe.contentDocument.documentElement.classList.add('slow');
          const transition = iframe.contentDocument.startViewTransition(() => {
            iframe.contentDocument.querySelector('.simple-text').classList.toggle('toggled');
          });
          transition.finished.then(() => {
            iframe.contentDocument.documentElement.classList.remove('slow');
          })
        },
        "Toggle outlines"() {
          iframe.contentDocument.querySelector('.simple-text').classList.toggle('outlined');
        }
      };
      addButtons(buttonsEl, buttons);
    }
  </script>
</div>

Fixed! But sometimes we _want_ the aspect ratios to be different:

# Intentional aspect ratio changes

This time, let's take an element:

```html
<div class="text-in-container">Hello!</div>
```

…and create a transition where the text changes. So here's the CSS:

```css
.text-in-container {
  view-transition-name: text-in-container;
}
```

And here's the JavaScript:

```js
btn.onclick = () => {
  document.startViewTransition(() => {
    document.querySelector('.text-in-container').textContent =
      'Hello everyone out there!';
  });
};
```

And the result of that:

<div class="demo">
  <figure class="full-figure max-figure">
    <div class="iframe-container"></div>
    <div class="figcaption demo-buttons"></div>
  </figure>
  <script>
    {
      const demoEl = document.currentScript.closest('.demo');
      const iframe = document.createElement('iframe');
      const texts = ['Hello!', 'Hello everyone out there!'];
      iframe.onload = () => {
        addIframeStyles(iframe);
        iframe.contentDocument.body.innerHTML = `
          <div class="text-in-container">${texts[0]}</div>
        `;
      };
      demoEl.querySelector('.iframe-container').prepend(iframe);
      const buttonsEl = demoEl.querySelector('.demo-buttons');
      const buttons = {
        "Toggle text"() {
          iframe.contentDocument.startViewTransition(() => {
            const el = iframe.contentDocument.querySelector('.text-in-container');
            el.textContent = texts[(texts.indexOf(el.textContent) + 1) % texts.length];
          });
        },
        "Animate slowly"() {
          iframe.contentDocument.documentElement.classList.add('slow');
          const transition = iframe.contentDocument.startViewTransition(() => {
            const el = iframe.contentDocument.querySelector('.text-in-container');
            el.textContent = texts[(texts.indexOf(el.textContent) + 1) % texts.length];
          });
          transition.finished.then(() => {
            iframe.contentDocument.documentElement.classList.remove('slow');
          })
        },
      };
      addButtons(buttonsEl, buttons);
    }
  </script>
</div>

Well, that doesn't look right. It kinda looks like it zooms in.

View transition pseudo-elements have this structure for each independently animating item:

```
::view-transition-group(text-in-container)
└─ ::view-transition-image-pair(text-in-container)
   ├─ ::view-transition-old(text-in-container)
   └─ ::view-transition-new(text-in-container)
```

The default transition animates the `::view-transition-group` from its old size and position to its new size and position. The views, the `::view-transition-old` and `::view-transition-new`, are absolutely positioned within the group. They match the group's width, but otherwise maintain their aspect ratios.

But that's just the default. Because view transitions are built on top of CSS, we can alter these defaults. In this case, let's make the views 100% height of their group, rather than maintaining their aspect ratio:

```css
::view-transition-old(text-in-container),
::view-transition-new(text-in-container) {
  height: 100%;
}
```

The result:

<div class="demo">
  <figure class="full-figure max-figure">
    <div class="iframe-container"></div>
    <div class="figcaption demo-buttons"></div>
  </figure>
  <script>
    {
      const demoEl = document.currentScript.closest('.demo');
      const iframe = document.createElement('iframe');
      const texts = ['Hello!', 'Hello everyone out there!'];
      iframe.onload = () => {
        addIframeStyles(iframe);
        iframe.contentDocument.documentElement.classList.add('full-height-group');
        iframe.contentDocument.body.innerHTML = `
          <div class="text-in-container">${texts[0]}</div>
        `;
      };
      demoEl.querySelector('.iframe-container').prepend(iframe);
      const buttonsEl = demoEl.querySelector('.demo-buttons');
      const buttons = {
        "Toggle text"() {
          iframe.contentDocument.startViewTransition(() => {
            const el = iframe.contentDocument.querySelector('.text-in-container');
            el.textContent = texts[(texts.indexOf(el.textContent) + 1) % texts.length];
          });
        },
        "Animate slowly"() {
          iframe.contentDocument.documentElement.classList.add('slow');
          const transition = iframe.contentDocument.startViewTransition(() => {
            const el = iframe.contentDocument.querySelector('.text-in-container');
            el.textContent = texts[(texts.indexOf(el.textContent) + 1) % texts.length];
          });
          transition.finished.then(() => {
            iframe.contentDocument.documentElement.classList.remove('slow');
          })
        },
      };
      addButtons(buttonsEl, buttons);
    }
  </script>
</div>

Now it feels like the shape is transitioning properly, but ugh, stretchy text looks bad.

At this point we need to step back and think about what kind of transition we actually want. It feels like:

- The box should stretch, changing aspect ratio throughout the animation.
- The text should maintain aspect ratio, but stay within the box.

Since we want to animate these things in different ways, they need to be separate items within the view transition:

```html
<div class="container">
  <div class="text">Hello!</div>
</div>
```

Now we have two elements, we can target them with CSS:

```css
.container {
  view-transition-name: container;
}

.text {
  view-transition-name: text;
}

::view-transition-old(container),
::view-transition-new(container) {
  height: 100%;
}
```

The result:

<div class="demo">
  <figure class="full-figure max-figure">
    <div class="iframe-container"></div>
    <div class="figcaption demo-buttons"></div>
  </figure>
  <script>
    {
      const demoEl = document.currentScript.closest('.demo');
      const iframe = document.createElement('iframe');
      const texts = ['Hello!', 'Hello everyone out there!'];
      iframe.onload = () => {
        addIframeStyles(iframe);
        iframe.contentDocument.body.innerHTML = `
          <div class="container"><div class="text">${texts[0]}</div></div>
        `;
      };
      demoEl.querySelector('.iframe-container').prepend(iframe);
      const buttonsEl = demoEl.querySelector('.demo-buttons');
      const buttons = {
        "Toggle text"() {
          iframe.contentDocument.startViewTransition(() => {
            const el = iframe.contentDocument.querySelector('.text');
            el.textContent = texts[(texts.indexOf(el.textContent) + 1) % texts.length];
          });
        },
        "Animate slowly"() {
          iframe.contentDocument.documentElement.classList.add('slow');
          const transition = iframe.contentDocument.startViewTransition(() => {
            const el = iframe.contentDocument.querySelector('.text');
            el.textContent = texts[(texts.indexOf(el.textContent) + 1) % texts.length];
          });
          transition.finished.then(() => {
            iframe.contentDocument.documentElement.classList.remove('slow');
          })
        },
      };
      addButtons(buttonsEl, buttons);
    }
  </script>
</div>

Now our box is doing the right thing, but the text isn't – we want it to stay within the box.

In view transitions, the views are images, so we can style them using things like [`object-fit`](https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit):

```css
::view-transition-old(text),
::view-transition-new(text) {
  /* Break aspect ratio at an element level */
  height: 100%;
  /* But maintain it within the image itself */
  object-fit: none;
  /* And hide parts of the image that go out of bounds */
  overflow: clip;
}
```

And the result:

<div class="demo">
  <figure class="full-figure max-figure">
    <div class="iframe-container"></div>
    <div class="figcaption demo-buttons"></div>
  </figure>
  <script>
    {
      const demoEl = document.currentScript.closest('.demo');
      const iframe = document.createElement('iframe');
      const texts = ['Hello!', 'Hello everyone out there!'];
      iframe.onload = () => {
        addIframeStyles(iframe);
        iframe.contentDocument.documentElement.classList.add('fit-text');
        iframe.contentDocument.body.innerHTML = `
          <div class="container"><div class="text">${texts[0]}</div></div>
        `;
      };
      demoEl.querySelector('.iframe-container').prepend(iframe);
      const buttonsEl = demoEl.querySelector('.demo-buttons');
      const buttons = {
        "Toggle text"() {
          iframe.contentDocument.startViewTransition(() => {
            const el = iframe.contentDocument.querySelector('.text');
            el.textContent = texts[(texts.indexOf(el.textContent) + 1) % texts.length];
          });
        },
        "Animate slowly"() {
          iframe.contentDocument.documentElement.classList.add('slow');
          const transition = iframe.contentDocument.startViewTransition(() => {
            const el = iframe.contentDocument.querySelector('.text');
            el.textContent = texts[(texts.indexOf(el.textContent) + 1) % texts.length];
          });
          transition.finished.then(() => {
            iframe.contentDocument.documentElement.classList.remove('slow');
          })
        },
      };
      addButtons(buttonsEl, buttons);
    }
  </script>
</div>

Much better! We can even use [`object-position`](https://developer.mozilla.org/en-US/docs/Web/CSS/object-position) to change the alignment:

```css
::view-transition-old(text),
::view-transition-new(text) {
  object-position: left;
}
```

And now our text is left-aligned:

<div class="demo">
  <figure class="full-figure max-figure">
    <div class="iframe-container"></div>
    <div class="figcaption demo-buttons"></div>
  </figure>
  <script>
    {
      const demoEl = document.currentScript.closest('.demo');
      const iframe = document.createElement('iframe');
      const texts = ['Hello!', 'Hello everyone out there!'];
      iframe.onload = () => {
        addIframeStyles(iframe);
        iframe.contentDocument.documentElement.classList.add('fit-text');
        iframe.contentDocument.documentElement.classList.add('align-text');
        iframe.contentDocument.body.innerHTML = `
          <div class="container"><div class="text">${texts[0]}</div></div>
        `;
      };
      demoEl.querySelector('.iframe-container').prepend(iframe);
      const buttonsEl = demoEl.querySelector('.demo-buttons');
      const buttons = {
        "Toggle text"() {
          iframe.contentDocument.startViewTransition(() => {
            const el = iframe.contentDocument.querySelector('.text');
            el.textContent = texts[(texts.indexOf(el.textContent) + 1) % texts.length];
          });
        },
        "Animate slowly"() {
          iframe.contentDocument.documentElement.classList.add('slow');
          const transition = iframe.contentDocument.startViewTransition(() => {
            const el = iframe.contentDocument.querySelector('.text');
            el.textContent = texts[(texts.indexOf(el.textContent) + 1) % texts.length];
          });
          transition.finished.then(() => {
            iframe.contentDocument.documentElement.classList.remove('slow');
          })
        },
      };
      addButtons(buttonsEl, buttons);
    }
  </script>
</div>

# Handling shape and size changes

The previous solution works great because the text view is only changing position and shape, not scale.

To make things interesting, let's throw a change of font-size into the mix:

<div class="demo">
  <figure class="full-figure max-figure">
    <div class="iframe-container"></div>
    <div class="figcaption demo-buttons"></div>
  </figure>
  <script>
    {
      const demoEl = document.currentScript.closest('.demo');
      const iframe = document.createElement('iframe');
      iframe.onload = () => {
        addIframeStyles(iframe);
        iframe.contentDocument.documentElement.classList.add('fit-text');
        iframe.contentDocument.documentElement.classList.add('align-text');
        iframe.contentDocument.documentElement.classList.add('pseudo-text');
        iframe.contentDocument.body.innerHTML = `
          <div class="container"><div class="text"></div></div>
        `;
      };
      demoEl.querySelector('.iframe-container').prepend(iframe);
      const buttonsEl = demoEl.querySelector('.demo-buttons');
      const buttons = {
        "Toggle text"() {
          iframe.contentDocument.startViewTransition(() => {
            iframe.contentDocument.querySelector('.text').classList.toggle('toggled');
          });
        },
        "Animate slowly"() {
          iframe.contentDocument.documentElement.classList.add('slow');
          const transition = iframe.contentDocument.startViewTransition(() => {
            iframe.contentDocument.querySelector('.text').classList.toggle('toggled');
          });
          transition.finished.then(() => {
            iframe.contentDocument.documentElement.classList.remove('slow');
          })
        },
      };
      addButtons(buttonsEl, buttons);
    }
  </script>
</div>

This isn't awful, but we've lost that nice effect where "Hello" moves smoothly between the states.

Usually, when I want an image to react to size changes, but maintain aspect ratio, I'd use `object-fit: cover` or `object-fit: contain`. Unfortunately that's a bit tricky here, since we'd want the wider of the two views to be `object-fit: cover`, and the narrower to be `object-fit: contain`. That would mean poking at the layout with JavaScript, determining which is which, and applying styles dynamically.

What we actually want to express is something like `object-fit: contain-block`, where the image is contained on the block axis, but covers on the inline axis. Unfortunately this feature doesn't exist ([although I've requested it](https://github.com/w3c/csswg-drafts/issues/9066)), so we need another approach.

C'mon, this is CSS, so there's _always_ another approach.

So, throwing away all the previous `::view-transition-*` styles, let's start again:

```css
::view-transition-old(text),
::view-transition-new(text) {
  /* Make the text views match the height of their group */
  height: 100%;
  /* Set the other dimension to auto,
     which for images means they maintain their aspect ratio */
  width: auto;
}

::view-transition-group(text) {
  /* Clip the views as they overflow the group */
  overflow: clip;
}
```

And here's the result:

<div class="demo">
  <figure class="full-figure max-figure">
    <div class="iframe-container"></div>
    <div class="figcaption demo-buttons"></div>
  </figure>
  <script>
    {
      const demoEl = document.currentScript.closest('.demo');
      const iframe = document.createElement('iframe');
      iframe.onload = () => {
        addIframeStyles(iframe);
        iframe.contentDocument.documentElement.classList.add('pseudo-text');
        iframe.contentDocument.documentElement.classList.add('position-and-clip');
        iframe.contentDocument.body.innerHTML = `
          <div class="container"><div class="text"></div></div>
        `;
      };
      demoEl.querySelector('.iframe-container').prepend(iframe);
      const buttonsEl = demoEl.querySelector('.demo-buttons');
      const buttons = {
        "Toggle text"() {
          iframe.contentDocument.startViewTransition(() => {
            iframe.contentDocument.querySelector('.text').classList.toggle('toggled');
          });
        },
        "Animate slowly"() {
          iframe.contentDocument.documentElement.classList.add('slow');
          const transition = iframe.contentDocument.startViewTransition(() => {
            iframe.contentDocument.querySelector('.text').classList.toggle('toggled');
          });
          transition.finished.then(() => {
            iframe.contentDocument.documentElement.classList.remove('slow');
          })
        },
      };
      addButtons(buttonsEl, buttons);
    }
  </script>
</div>

Oooo, it's so close, but it isn't quite right. If you play it slowly, you can see that the "Hello"s aren't lining up.

This happens because the text element includes the padding, and the padding is the same pixel value in both states. Because the result is a mix of scaled and static values, the images don't line up.

We can solve this by moving the padding to the container:

```css
.text {
  padding: 0;
}
.container {
  padding: 0.4em 1em;
}
```

And here's the result:

<div class="demo">
  <figure class="full-figure max-figure">
    <div class="iframe-container"></div>
    <div class="figcaption demo-buttons"></div>
  </figure>
  <script>
    {
      const demoEl = document.currentScript.closest('.demo');
      const iframe = document.createElement('iframe');
      iframe.onload = () => {
        addIframeStyles(iframe);
        iframe.contentDocument.documentElement.classList.add('pseudo-text');
        iframe.contentDocument.documentElement.classList.add('position-and-clip');
        iframe.contentDocument.documentElement.classList.add('padding-move');
        iframe.contentDocument.body.innerHTML = `
          <div class="container"><div class="text"></div></div>
        `;
      };
      demoEl.querySelector('.iframe-container').prepend(iframe);
      const buttonsEl = demoEl.querySelector('.demo-buttons');
      const buttons = {
        "Toggle text"() {
          iframe.contentDocument.startViewTransition(() => {
            iframe.contentDocument.querySelector('.text').classList.toggle('toggled');
          });
        },
        "Animate slowly"() {
          iframe.contentDocument.documentElement.classList.add('slow');
          const transition = iframe.contentDocument.startViewTransition(() => {
            iframe.contentDocument.querySelector('.text').classList.toggle('toggled');
          });
          transition.finished.then(() => {
            iframe.contentDocument.documentElement.classList.remove('slow');
          })
        },
      };
      addButtons(buttonsEl, buttons);
    }
  </script>
</div>

We're so nearly there! The only imperfection is that the clipping is now applying within the padding of the box.

What we really want is to be able to nest our `::view-transition-group(text)` in our `::view-transition-group(container)`, then apply the clipping to the container. This feature is called [nested transition groups](https://github.com/WICG/view-transitions/blob/main/explainer.md#nested-transition-groups), but it hasn't been developed yet. So, in the meantime, we can cheat!

The padding on the container is `0.4em 1em`, and the font-size is `5.7vw`. We can multiply those together to get the effective padding: `2.28vw 5.7vw`.

We can expand the clip area of our transition group using [`overflow-clip-margin`](https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-clip-margin). Weirdly, this doesn't accept different values for x and y, so we just take the larger of the two values:

```css
::view-transition-group(text) {
  overflow-clip-margin: 5.7vw;
}
```

And the result of that:

<div class="demo">
  <figure class="full-figure max-figure">
    <div class="iframe-container"></div>
    <div class="figcaption demo-buttons"></div>
  </figure>
  <script>
    {
      const demoEl = document.currentScript.closest('.demo');
      const iframe = document.createElement('iframe');
      iframe.onload = () => {
        addIframeStyles(iframe);
        iframe.contentDocument.documentElement.classList.add('pseudo-text');
        iframe.contentDocument.documentElement.classList.add('position-and-clip');
        iframe.contentDocument.documentElement.classList.add('padding-move');
        iframe.contentDocument.documentElement.classList.add('clip-margin');
        iframe.contentDocument.body.innerHTML = `
          <div class="container"><div class="text"></div></div>
        `;
      };
      demoEl.querySelector('.iframe-container').prepend(iframe);
      const buttonsEl = demoEl.querySelector('.demo-buttons');
      const buttons = {
        "Toggle text"() {
          iframe.contentDocument.startViewTransition(() => {
            iframe.contentDocument.querySelector('.text').classList.toggle('toggled');
          });
        },
        "Animate slowly"() {
          iframe.contentDocument.documentElement.classList.add('slow');
          const transition = iframe.contentDocument.startViewTransition(() => {
            iframe.contentDocument.querySelector('.text').classList.toggle('toggled');
          });
          transition.finished.then(() => {
            iframe.contentDocument.documentElement.classList.remove('slow');
          })
        },
      };
      addButtons(buttonsEl, buttons);
    }
  </script>
</div>

And there we have it! A nice smooth transition that handles changes of scale and aspect ratio!

Oh go on then, let's throw in some silly easing using the new [`linear()`](https://linear-easing-generator.netlify.app/?codeType=js&code=const+%5Bduration%2C+func%5D+%3D+createSpring%28%7B%0A++mass%3A+1%2C%0A++stiffness%3A+1500%2C%0A++damping%3A+30%2C%0A++velocity%3A+0%2C%0A%7D%29%3B%0A%0A%2F*%0A++Export+your+easing+function+as+a+global.%0A++The+name+you+use+here+will+appear+in+the+output.%0A++The+easing+function+must+take+a+number+as+input%2C%0A++where+0+is+the+start%2C+and+1+is+the+end.%0A++It+must+return+the+%27eased%27+value.%0A*%2F%0Aself.spring+%3D+func%3B%0A%2F*%0A++Some+easings+have+an+ideal+duration%2C+like+this+one.%0A++You+can+export+it+to+the+global%2C+in+milliseconds%2C%0A++and+it+will+be+used+in+the+output.%0A++This+is+optional.%0A*%2F%0Aself.duration+%3D+duration%3B%0A%0Afunction+createSpring%28%7B+mass%2C+stiffness%2C+damping%2C+velocity+%7D%29+%7B%0A++const+w0+%3D+Math.sqrt%28stiffness+%2F+mass%29%3B%0A++const+zeta+%3D+damping+%2F+%282+*+Math.sqrt%28stiffness+*+mass%29%29%3B%0A++const+wd+%3D+zeta+%3C+1+%3F+w0+*+Math.sqrt%281+-+zeta+*+zeta%29+%3A+0%3B%0A++const+b+%3D+zeta+%3C+1+%3F+%28zeta+*+w0+%2B+-velocity%29+%2F+wd+%3A+-velocity+%2B+w0%3B%0A%0A++function+solver%28t%29+%7B%0A++++if+%28zeta+%3C+1%29+%7B%0A++++++t+%3D%0A++++++++Math.exp%28-t+*+zeta+*+w0%29+*%0A++++++++%281+*+Math.cos%28wd+*+t%29+%2B+b+*+Math.sin%28wd+*+t%29%29%3B%0A++++%7D+else+%7B%0A++++++t+%3D+%281+%2B+b+*+t%29+*+Math.exp%28-t+*+w0%29%3B%0A++++%7D%0A%0A++++return+1+-+t%3B%0A++%7D%0A%0A++const+duration+%3D+%28%28%29+%3D%3E+%7B%0A++++const+step+%3D+1+%2F+6%3B%0A++++let+time+%3D+0%3B%0A%0A++++while+%28true%29+%7B%0A++++++if+%28Math.abs%281+-+solver%28time%29%29+%3C+0.001%29+%7B%0A++++++++const+restStart+%3D+time%3B%0A++++++++let+restSteps+%3D+1%3B%0A++++++++while+%28true%29+%7B%0A++++++++++time+%2B%3D+step%3B%0A++++++++++if+%28Math.abs%281+-+solver%28time%29%29+%3E%3D+0.001%29+break%3B%0A++++++++++restSteps%2B%2B%3B%0A++++++++++if+%28restSteps+%3D%3D%3D+16%29+return+restStart%3B%0A++++++++%7D%0A++++++%7D%0A++++++time+%2B%3D+step%3B%0A++++%7D%0A++%7D%29%28%29%3B%0A%0A++return+%5Bduration+*+1000%2C+%28t%29+%3D%3E+solver%28duration+*+t%29%5D%3B%0A%7D&simplify=0.00317117590867199&round=3) feature:

<!-- prettier-ignore -->
```css
:root {
  --spring-easing: linear(
    0, 0.01, 0.04 1.5%, 0.163 3.2%, 0.824 9.2%, 1.055, 1.199 14.2%, 1.24, 1.263,
    1.265 18.2%, 1.243 19.9%, 0.996 28.8%, 0.951, 0.93 34.1%, 0.929 35.7%,
    0.935 37.5%, 1 46.3%, 1.018 51.4%, 1.017 55.1%, 0.995 68.6%, 1.001 85.5%, 1
  );
  --spring-duration: 0.5s;
}

::view-transition-group(*),
::view-transition-old(*),
::view-transition-new(*) {
  animation-timing-function: var(--spring-easing);
  animation-duration: var(--spring-duration);
}
```

And here's the final result:

<div class="demo">
  <figure class="full-figure max-figure">
    <div class="iframe-container"></div>
    <div class="figcaption demo-buttons"></div>
  </figure>
  <script>
    {
      const demoEl = document.currentScript.closest('.demo');
      const iframe = document.createElement('iframe');
      iframe.onload = () => {
        addIframeStyles(iframe);
        iframe.contentDocument.documentElement.classList.add('pseudo-text');
        iframe.contentDocument.documentElement.classList.add('position-and-clip');
        iframe.contentDocument.documentElement.classList.add('padding-move');
        iframe.contentDocument.documentElement.classList.add('clip-margin');
        iframe.contentDocument.documentElement.classList.add('boing');
        iframe.contentDocument.body.innerHTML = `
          <div class="container"><div class="text"></div></div>
        `;
      };
      demoEl.querySelector('.iframe-container').prepend(iframe);
      const buttonsEl = demoEl.querySelector('.demo-buttons');
      const buttons = {
        "Toggle text"() {
          iframe.contentDocument.startViewTransition(() => {
            iframe.contentDocument.querySelector('.text').classList.toggle('toggled');
          });
        },
        "Animate slowly"() {
          iframe.contentDocument.documentElement.classList.add('slow');
          const transition = iframe.contentDocument.startViewTransition(() => {
            iframe.contentDocument.querySelector('.text').classList.toggle('toggled');
          });
          transition.finished.then(() => {
            iframe.contentDocument.documentElement.classList.remove('slow');
          })
        },
      };
      addButtons(buttonsEl, buttons);
    }
  </script>
</div>

Err, ok, maybe I went too far. That's why I'm not a designer.
