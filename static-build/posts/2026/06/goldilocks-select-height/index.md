---
title: Golilocks <select> height
date: 2026-06-25 01:00:00
summary: The 'ideal' sizing is more complicated than you think…
meta: The 'ideal' sizing is more complicated than you think…
code: shiki
#image: './img.png'
---

I recently gave a talk on customizable (as in fully-stylable) `<select>`, and as I was building demos I realised there's a sizing 'pattern' that's mostly the-one-you-want, but it took me a long time to figure out how to do it in CSS.

Well, I say I figured it out. I actually failed, and asked a bunch of people for help, who (thankfully, for my ego) also struggled. Eventually, [Ian Kilpatrick](https://bsky.app/profile/bfgeek.bsky.social) pointed me at the feature I was missing…

# Default sizing

Here's a mock-up of a custom select:

<style>
  @font-face {
    font-family: seti;
    src: url('asset-url:./seti.woff') format('woff');
  }
  .ua-picker-styles {
    box-sizing: border-box;
    border: 1px solid;
    padding: 0;
    margin: 0;
    inset: auto;
    min-inline-size: anchor-size(self-inline);
    max-block-size: 100%;
    max-block-size: -webkit-fill-available;
    max-block-size: stretch;
    position-area: self-block-end span-self-inline-end;
    position-try-order: most-block-size;
    position-try-fallbacks: self-block-start span-self-inline-end, self-block-end span-self-inline-start, self-block-start span-self-inline-start;
    min-block-size: 1lh;
  }
  .select-picker {
    line-height: normal;
    font-family: system-ui;
    border: none;
    background: none;
    overflow: clip;
    container-type: anchored;
    filter: drop-shadow(0 0.3em 0.275em rgba(0, 0, 0, 0.25));
    grid-template-rows: 1fr;

    opacity: 0;
    transition:
      opacity 250ms ease,
      height 250ms,
      display 250ms step-end allow-discrete,
      overlay 250ms allow-discrete;

    &:popover-open {
      display: grid;
      opacity: 1;
      @starting-style {
        opacity: 0;
      }

      .select-picker-box {
        translate: 0 0;
        transition-timing-function: ease;

        @starting-style {
          translate: 0 -6.25em;
          /* flip-block, but explicit so all above-anchor fallbacks match */
          @container anchored(fallback: self-block-start span-self-inline-end) or anchored(fallback: self-block-start span-self-inline-start) {
            translate: 0 6.25em;
          }
        }
      }
    }
  }
  .select-picker-box {
    background: #f8f8f8;
    border: 0.0625em solid #d4d4d4;
    border-radius: 0.5em;
    overflow: auto;
    overscroll-behavior: none;
    scroll-padding-top: 3.125em;

    transition: translate 250ms ease-in;
    translate: 0 -6.25em;

    /* flip-block, but explicit so all above-anchor fallbacks match */
    @container anchored(fallback: self-block-start span-self-inline-end) or anchored(fallback: self-block-start span-self-inline-start) {
      translate: 0 6.25em;
    }
  }
  .select-picker-lang-icon {
    font-family: seti;
    font-size: 1.5em;
    display: grid;
    justify-content: center;

    &::before {
      content: attr(data-char);
    }

    &.lang-blue {
      color: #498ba7;
    }
    &.lang-orange {
      color: #cc6d2e;
    }
    &.lang-purple {
      color: #9068b0;
    }
    &.lang-yellow {
      color: #b7b73b;
    }
    &.lang-red {
      color: #b8383d;
    }
    &.lang-green {
      color: #7fae42;
    }
    &.lang-grey {
      color: #627379;
    }
    &.lang-pink {
      color: #dd4b78;
    }
    &.lang-white {
      color: #bfc2c1;
    }
    &.lang-dark {
      color: #3b4b52;
    }
  }
  .select-picker-legend {
    position: sticky;
    top: 0;
    container-type: scroll-state;
    z-index: 1;
    background: #ebebeb;
    color: #6d8086;
    padding: 0.5em 0.75em;
    font-size: 0.85em;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 0.0625em solid #d4d4d4;
    transition: all 500ms ease;
    transition-property: background-color, color;

    @container scroll-state(stuck: top) {
      background-color: #e0e0e0;
      color: #41535b;
    }
  }
  .select-picker-group {
    --legend-text: attr(label);
    position: relative;

    @supports (container-type: scroll-state) {
      &:first-of-type > .select-picker-legend::before {
        background-color: #e0e0e0;
        color: #41535b;
      }
    }

    & > .select-picker-legend::before {
      content: var(--legend-text);
    }
  }

  .select-picker-option {
    padding: 0.4em 0.5em;
    color: #41535b;
    display: grid;
    grid-template-columns: 2.2ch 10.6ch;
    gap: 0.5em;
    align-items: center;
    position: relative;

    &:hover {
      background: #e0e7ea;
    }
  }

  .toggle-button-panner {
    position: relative;
    touch-action: none;
    width: fit-content;

    /* Shared button look */
    & button {
      appearance: none;
      margin: 0;
      display: flex;
      align-items: stretch;
      border-radius: 0.375em;
      overflow: clip;
      background: #e9e9ed;
      border: 0.0625em solid #b0b0b8;
      box-shadow: 0 0.0625em 0.0625em rgba(0, 0, 0, 0.08);
      color: #1c1c1e;
      font: inherit;
      padding: 0;
      cursor: pointer;

      &:hover {
        background: #dededf;
      }
      &:active {
        background: #d4d4d6;
      }

      & > .label {
        padding: 0.6em 0.7em;
        line-height: 1;
      }
    }

    & .panner {
      display: grid;
      place-items: center;
      padding: 0 0.3em;
      cursor: grab;
      touch-action: none;
      /* Visually separate from, but joined to, the button */
      border-right: 0.0625em solid #b0b0b8;

      &:active {
        cursor: grabbing;
      }

      & > svg {
        display: block;
        pointer-events: none;
        fill: #5c5c61;
        width: 20px;
        aspect-ratio: 1;
      }
    }

    &.dragging .panner {
      cursor: grabbing;
    }

    /* Reset button only appears once the toggle button has been moved away */
    & > .reset {
      display: none;
    }

    &.moved {
      & > .toggle {
        /* Lift out of flow only once moved, positioned at the drop point */
        position: absolute;
        top: var(--panner-y, 0px);
        left: var(--panner-x, 0px);
        margin: 0;
      }

      & > .reset {
        display: flex;
      }
    }
  }
</style>

<div class="toggle-button-panner">
  <button class="toggle" command="toggle-popover" commandfor="select-picker">
    <span class="panner"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M480-80 310-250l57-57 73 73v-206H235l73 72-58 58L80-480l169-169 57 57-72 72h206v-206l-73 73-57-57 170-170 170 170-57 57-73-73v206h205l-73-72 58-58 170 170-170 170-57-57 73-73H520v205l72-73 58 58L480-80Z"/></svg></span>
    <span class="label">Toggle</span>
  </button>
  <button class="reset" type="button">
    <span class="label">Reset</span>
  </button>
</div>

<script>
  {
    const group = document.currentScript.previousElementSibling;
    const toggle = group.querySelector('.toggle');
    const reset = group.querySelector('.reset');
    const panner = group.querySelector('.panner');

    let pointerId = null;
    // Position of the toggle's top-left at grab time, and where the pointer
    // started, both relative to the group (the offset parent once moved).
    let baseX = 0;
    let baseY = 0;
    let startX = 0;
    let startY = 0;

    panner.addEventListener('pointerdown', (event) => {
      if (pointerId !== null) return;
      pointerId = event.pointerId;
      panner.setPointerCapture(pointerId);
      group.classList.add('dragging');

      // Capture the current position relative to the group before going
      // absolute, so the button doesn't jump on the first move.
      const groupRect = group.getBoundingClientRect();
      const toggleRect = toggle.getBoundingClientRect();
      baseX = toggleRect.left - groupRect.left;
      baseY = toggleRect.top - groupRect.top;
      startX = event.clientX;
      startY = event.clientY;
    });

    panner.addEventListener('pointermove', (event) => {
      if (event.pointerId !== pointerId) return;
      // First movement lifts the button out of flow and reveals Reset.
      group.classList.add('moved');
      group.style.setProperty('--panner-x', `${baseX + event.clientX - startX}px`);
      group.style.setProperty('--panner-y', `${baseY + event.clientY - startY}px`);
    });

    const end = (event) => {
      if (event.pointerId !== pointerId) return;
      panner.releasePointerCapture(pointerId);
      pointerId = null;
      group.classList.remove('dragging');
    };

    panner.addEventListener('pointerup', end);
    panner.addEventListener('pointercancel', end);

    // The panner lives inside the button, so swallow its activation: a tap or
    // drag on the panner should never fire the button's toggle command.
    panner.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
    });

    // Reset drops the toggle button back into its original place in flow.
    reset.addEventListener('click', () => {
      group.classList.remove('moved');
      group.style.removeProperty('--panner-x');
      group.style.removeProperty('--panner-y');
    });
  }
</script>

<div id="select-picker" class="ua-picker-styles select-picker" popover>
  <div class="select-picker-box">
    <div class="select-picker-group">
      <div class="select-picker-legend">Markup Languages</div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-blue" data-char=""></span>
        HTML
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-blue" data-char=""></span>
        CSS
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-orange" data-char=""></span>
        XML
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-purple" data-char=""></span>
        SVG
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-blue" data-char=""></span>
        Markdown
      </div>
    </div>
    <div class="select-picker-group">
      <div class="select-picker-legend">Scripting Languages</div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-yellow" data-char=""></span>
        JavaScript
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-blue" data-char=""></span>
        Python
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-red" data-char=""></span>
        Ruby
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-purple" data-char=""></span>
        PHP
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-blue" data-char=""></span>
        Perl
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-blue" data-char=""></span>
        Lua
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-green" data-char=""></span>
        Shell
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-blue" data-char=""></span>
        PowerShell
      </div>
    </div>
    <div class="select-picker-group">
      <div class="select-picker-legend">Transpiled Languages</div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-blue" data-char=""></span>
        TypeScript
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-yellow" data-char=""></span>
        CoffeeScript
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-yellow" data-char=""></span>
        Babel
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-blue" data-char=""></span>
        Elm
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-red" data-char=""></span>
        ReasonML
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-red" data-char=""></span>
        ReScript
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-orange" data-char=""></span>
        Haxe
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-blue" data-char=""></span>
        Dart
      </div>
    </div>
    <div class="select-picker-group">
      <div class="select-picker-legend">Compiled Systems Languages</div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-blue" data-char=""></span>
        C
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-blue" data-char=""></span>
        C++
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-blue" data-char=""></span>
        C#
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-grey" data-char=""></span>
        Rust
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-blue" data-char=""></span>
        Go
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-orange" data-char=""></span>
        Zig
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-red" data-char=""></span>
        D
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-grey" data-char=""></span>
        Vala
      </div>
    </div>
    <div class="select-picker-group">
      <div class="select-picker-legend">JVM Languages</div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-red" data-char=""></span>
        Java
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-red" data-char=""></span>
        Scala
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-orange" data-char=""></span>
        Kotlin
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-green" data-char=""></span>
        Clojure
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-green" data-char=""></span>
        Groovy
      </div>
    </div>
    <div class="select-picker-group">
      <div class="select-picker-legend">Functional Languages</div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-purple" data-char=""></span>
        Haskell
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-orange" data-char=""></span>
        OCaml
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-blue" data-char=""></span>
        F#
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-purple" data-char=""></span>
        Elixir
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-white" data-char=""></span>
        PureScript
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-orange" data-char=""></span>
        Prolog
      </div>
    </div>
    <div class="select-picker-group">
      <div class="select-picker-legend">Web Frameworks &amp; Libraries</div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-blue" data-char=""></span>
        React
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-green" data-char=""></span>
        Vue
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-red" data-char=""></span>
        Svelte
      </div>
    </div>
    <div class="select-picker-group">
      <div class="select-picker-legend">Template Languages</div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-yellow" data-char=""></span>
        EJS
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-red" data-char=""></span>
        Jade/Pug
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-red" data-char=""></span>
        Haml
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-green" data-char=""></span>
        Liquid
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-orange" data-char=""></span>
        Mustache
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-green" data-char=""></span>
        Nunjucks
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-green" data-char=""></span>
        Twig
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-orange" data-char=""></span>
        Slim
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-yellow" data-char=""></span>
        Smarty
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-red" data-char=""></span>
        Jinja
      </div>
    </div>
    <div class="select-picker-group">
      <div class="select-picker-legend">CSS Preprocessors</div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-pink" data-char=""></span>
        Sass/SCSS
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-blue" data-char=""></span>
        Less
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-green" data-char=""></span>
        Stylus
      </div>
    </div>
    <div class="select-picker-group">
      <div class="select-picker-legend">Config Files</div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-yellow" data-char=""></span>
        JSON
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-purple" data-char=""></span>
        YAML
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-grey" data-char=""></span>
        TOML
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-green" data-char=""></span>
        CSV
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-blue" data-char=""></span>
        TSConfig
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-yellow" data-char=""></span>
        Vite
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-blue" data-char=""></span>
        Webpack
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-red" data-char=""></span>
        Rollup
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-orange" data-char=""></span>
        Grunt
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-red" data-char=""></span>
        Gulp
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-blue" data-char=""></span>
        Gradle
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-red" data-char=""></span>
        Maven
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-blue" data-char=""></span>
        SBT
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-green" data-char=""></span>
        Bazel
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-purple" data-char=""></span>
        ESLint
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-white" data-char=""></span>
        Stylelint
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-orange" data-char=""></span>
        Bower
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-dark" data-char=""></span>
        NPM
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-blue" data-char=""></span>
        Yarn
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-blue" data-char=""></span>
        Docker
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-green" data-char=""></span>
        Karma
      </div>
    </div>
    <div class="select-picker-group">
      <div class="select-picker-legend">Database &amp; Query</div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-pink" data-char=""></span>
        SQL
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-pink" data-char=""></span>
        GraphQL
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-blue" data-char=""></span>
        Prisma
      </div>
    </div>
    <div class="select-picker-group">
      <div class="select-picker-legend">Other Languages</div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-purple" data-char=""></span>
        Julia
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-blue" data-char=""></span>
        R
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-white" data-char=""></span>
        Crystal
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-yellow" data-char=""></span>
        Nim
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-orange" data-char=""></span>
        Swift
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-purple" data-char=""></span>
        WebAssembly
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-blue" data-char=""></span>
        LaTeX
      </div>
    </div>
  </div>
</div>

<script>
  document.getElementById('select-picker').addEventListener('click', (event) => {
    event.currentTarget.hidePopover();
  });
</script>

It isn't actually a custom select. To make the demo work in both Firefox and Safari, and to make it easier for you to inspect with DevTools, I've built it from [invokers commands](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API), [popovers](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API), and [CSS anchor positioning](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Anchor_positioning), which are the same primitives custom select uses under the hood.

You can drag it around and see how it reacts to being in other parts of the viewport, and how it reacts to scrolling.

Here are the default styles that are impacting the picker's position and height:

```css
::picker(select) {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
  inset: auto;
  min-inline-size: anchor-size(self-inline);
  max-block-size: stretch;
  overflow: auto;
  position-area: self-block-end span-self-inline-end;
  position-try-order: most-block-size;
  position-try-fallbacks:
    self-block-start span-self-inline-end,
    self-block-end span-self-inline-start,
    self-block-start span-self-inline-start;

  /* Not part of the spec, but something Chrome does, so I've included it */
  min-block-size: 1lh;
}
```
