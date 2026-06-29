---
title: The Goldilocks customizable select height
date: 2026-06-29 01:00:00
summary: The 'ideal' sizing is more complicated than you think…
meta: The 'ideal' sizing is more complicated than you think…
code: shiki
image: './img.png'
---

I recently gave a talk on customizable (as in fully-stylable) `<select>`, and as I was building demos I realised there's a sizing 'pattern' that's almost always the-one-you-want, but it took me a long time to figure out how to do it in CSS.

Well, I say I figured it out. I actually failed, and asked a bunch of people for help, who (thankfully, for my ego) also struggled. Eventually, [Ian Kilpatrick](https://bsky.app/profile/bfgeek.bsky.social) pointed me at the feature I was missing…

TL;DR: If you just want the solution, [skip to the end](#putting-it-all-together).

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
          @container anchored(fallback: self-block-start span-self-inline-end) or anchored(fallback: self-block-start span-self-inline-start) or anchored(fallback: flip-block) or anchored(fallback: flip-block flip-inline) {
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
    @container anchored(fallback: self-block-start span-self-inline-end) or anchored(fallback: self-block-start span-self-inline-start) or anchored(fallback: flip-block) or anchored(fallback: flip-block flip-inline) {
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

  .margin-block-end {
    margin-block-end: 1em;
  }
  .margin-firefox-fix {
    --viewport-margin: 1em;
    max-block-size: calc(100% - var(--viewport-margin));

    @supports (max-block-size: stretch) {
      max-block-size: stretch;
      margin-block-end: var(--viewport-margin);
    }
  }
  .margin-full-fix {
    --viewport-margin: 1em;
    max-block-size: calc(100% - var(--viewport-margin));
    position-try-fallbacks:
      flip-block,
      flip-inline,
      flip-block flip-inline;

    @supports (max-block-size: stretch) {
      max-block-size: stretch;
      margin-block-end: var(--viewport-margin);
    }
  }
  .min-size {
    min-block-size: 12em;
  }
  .max-size-fix {
    --max-size: 30em;
    --viewport-margin: 1em;
    max-block-size: min(calc(100% - var(--viewport-margin)), var(--max-size));
    position-try-fallbacks:
      flip-block,
      flip-inline,
      flip-block flip-inline;

    @supports (max-block-size: calc-size(stretch, min(size, 1px))) {
      max-block-size: calc-size(stretch, min(size, var(--max-size)));
      margin-block-end: var(--viewport-margin);
    }
  }
  .min-size-fix {
    --min-size: 12em;
    min-block-size: var(--min-size);

    @supports (min-block-size: calc-size(fit-content, min(size, 1px))) {
      min-block-size: calc-size(fit-content, min(size, var(--min-size)));
    }

    @supports not (min-block-size: calc-size(fit-content, min(size, 1px))) {
      &:not(:has(:where(.select-picker-option:nth-child(5)))) {
        min-block-size: 0;
        max-block-size: fit-content;
      }
    }
  }

  .full-solution {
    --viewport-margin: 1em;
    --min-size: 12em;
    --max-size: 30em;

    min-block-size: var(--min-size);
    max-block-size: min(calc(100% - var(--viewport-margin)), var(--max-size));
    position-try-fallbacks:
      flip-block,
      flip-inline,
      flip-block flip-inline;

    @supports (min-block-size: calc-size(fit-content, min(size, 1px))) {
      min-block-size: calc-size(fit-content, min(size, var(--min-size)));
      max-block-size: calc-size(stretch, min(size, var(--max-size)));
      margin-block-end: var(--viewport-margin);
    }

    @supports not (min-block-size: calc-size(fit-content, min(size, 1px))) {
      &:not(:has(:where(.select-picker-option:nth-child(5)))) {
        min-block-size: 0;
        max-block-size: fit-content;
      }
    }
  }

  /* body > * {
    visibility: hidden;
  }
  toggle-picker, [popover] {
    visibility: visible;
  } */
</style>

<div id="select-picker" popover>
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

<div id="select-picker-small" popover>
  <div class="select-picker-box">
    <div class="select-picker-group">
      <div class="select-picker-legend">The best Languages</div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-blue" data-char=""></span>
        HTML
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-blue" data-char=""></span>
        CSS
      </div>
      <div class="select-picker-option">
        <span class="select-picker-lang-icon lang-purple" data-char=""></span>
        SVG
      </div>
    </div>
  </div>
</div>

<toggle-picker data-picker-classes="ua-picker-styles select-picker"></toggle-picker>

<script>
  for (const picker of document.querySelectorAll('[id^="select-picker"]')) {
    picker.addEventListener('click', (event) => {
      event.currentTarget.hidePopover();
    });
  }

  const togglePickerStyles = new CSSStyleSheet();
  togglePickerStyles.replaceSync(`
    :host {
      display: block;
    }
    .toggle-button-panner {
      position: relative;
      touch-action: none;
      width: fit-content;
    }

    /* Shared button look */
    button {
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
      white-space: nowrap;

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

    .panner {
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

    .toggle-button-panner.dragging .panner {
      cursor: grabbing;
    }

    /* Reset button only appears once the toggle button has moved away */
    .reset {
      display: none;
    }

    .toggle-button-panner.moved {
      & > .toggle {
        /* Lift out of flow only once moved, positioned at the drop point */
        position: absolute;
        top: var(--panner-y, 0px);
        left: var(--panner-x, 0px);
        margin: 0;
        z-index: 1;
      }

      & > .reset {
        display: flex;
      }
    }
  `);

  customElements.define(
    'toggle-picker',
    class extends HTMLElement {
      #group;
      #toggle;
      #reset;
      #panner;
      #picker;

      connectedCallback() {
        if (this.shadowRoot) return;

        this.#picker = document.getElementById(
          this.dataset.picker || 'select-picker',
        );

        const root = this.attachShadow({ mode: 'open' });
        root.adoptedStyleSheets = [togglePickerStyles];
        root.innerHTML = `
          <div class="toggle-button-panner">
            <button class="toggle" type="button" command="toggle-popover">
              <span class="panner"><svg height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M480-80 310-250l57-57 73 73v-206H235l73 72-58 58L80-480l169-169 57 57-72 72h206v-206l-73 73-57-57 170-170 170 170-57 57-73-73v206h205l-73-72 58-58 170 170-170 170-57-57 73-73H520v205l72-73 58 58L480-80Z"/></svg></span>
              <span class="label"><slot>Toggle picker</slot></span>
            </button>
            <button class="reset" type="button">
              <span class="label">Reset</span>
            </button>
          </div>
        `;

        this.#group = root.querySelector('.toggle-button-panner');
        this.#toggle = root.querySelector('.toggle');
        this.#reset = root.querySelector('.reset');
        this.#panner = root.querySelector('.panner');

        this.#toggle.addEventListener('click', (event) => {
          event.preventDefault();
          this.#picker.className = this.dataset.pickerClasses || '';
          this.#picker.togglePopover({ source: this.#toggle });
        });

        this.#toggle.commandForElement = this.#picker;

        this.#wireDrag();
        this.#reset.addEventListener('click', () => this.#resetPosition());
      }

      #resetPosition() {
        this.#group.classList.remove('moved');
        this.#group.style.removeProperty('--panner-x');
        this.#group.style.removeProperty('--panner-y');
      }

      #wireDrag() {
        const group = this.#group;
        const toggle = this.#toggle;
        const panner = this.#panner;

        let pointerId = null;
        // Position of the toggle's top-left at grab time, and where the
        // pointer started, both relative to the group (the offset parent).
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

        // The panner lives inside the button, so swallow its activation: a tap
        // or drag on the panner should never fire the button's toggle.
        panner.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
        });
      }
    },

);
</script>

<p class="old-safari-warning" hidden><span style="font-weight: bold; color: red;">Unfortunately you're using Safari 26.5 or lower</span>, which has a buggy implementation of anchor positioning, so <span style="font-weight: bold; color: red;">these demos won't work for you</span>. They work in Safari Technology Preview, so the techniques in this article should work by the time Safari ships custom select.</p>

<script>
  {
    const ua = navigator.userAgent;
    const isSafari =
      /Safari/.test(ua) && !/Chrome|Chromium|CriOS|Android/.test(ua);
    const versionMatch = ua.match(/Version\/(\d+)(?:\.(\d+))?/);

    // Technology Preview has the same UA string, but it supports base-select, so don't show the warning for it.
    const supportsBaseSelect = CSS.supports('appearance', 'base-select');

    if (isSafari && versionMatch && !supportsBaseSelect) {
      const major = Number(versionMatch[1]);
      const minor = Number(versionMatch[2] || 0);
      // 26.5 or lower
      if (major < 26 || (major === 26 && minor <= 5)) {
        document.querySelector('.old-safari-warning').hidden = false;
      }
    }
  }
</script>

It isn't actually a custom select. Firefox and Safari are actively working on custom select, but haven't released it yet, so to make the demos work in more browsers, and to make it easier for you to inspect with DevTools, I've built the demos from [popovers](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API), and [CSS anchor positioning](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Anchor_positioning), which are the same primitives custom select uses under the hood.

You can drag it around and see how it reacts to being in other parts of the viewport, and how it reacts to scrolling. If you can't be bothered with all that, here's a video:

<figure>
  <video controls muted style="width: 100%; display: block; aspect-ratio: 1358/874">
    <source type="video/webm; codecs=av01.0.08M.08.0.110.01.01.01.1" src="asset-url:./videos/1-av1.mp4" />
    <source type="video/mp4" src="asset-url:./videos/1-avc.mp4" />
  </video>
</figure>

Here are the default UA styles that impact the picker's position and height:

```css
::picker(select) {
  margin: 0;
  inset: auto;
  min-inline-size: anchor-size(self-inline);
  max-block-size: stretch;
  position-area: self-block-end span-self-inline-end;
  position-try-order: most-block-size;
  position-try-fallbacks:
    self-block-start span-self-inline-end,
    self-block-end span-self-inline-start,
    self-block-start span-self-inline-start;

  /* Not part of the spec, but it's something Chrome does, so I've included it */
  min-block-size: 1lh;
}
```

As a result:

- `min-inline-size` means the picker will always be at least as wide as the `<select>` button (or toggle button in this case).
- `max-block-size` means the picker will not overflow the viewport. Its `stretch` size is the full anchor positioning cell (the area from the edge of the `<select>` button to the edge of the viewport).
- `position-area` defines the default anchor positioning cell to use, which is below the `<select>` button, and from its left edge to the right edge of the viewport.
- `position-try-fallbacks` defines fallbacks for the anchor positioning cell, so it can appear above the `<select>` button, and/or clamp to the button's right edge.
- `position-try-order` means the picker will initially appear in the anchor positioning cell that offers it the `most-block-size`, which means vertical space in this writing-mode. This doesn't currently work in Firefox ([ticket](https://bugzilla.mozilla.org/show_bug.cgi?id=2050547)) or Safari ([ticket](https://bugs.webkit.org/show_bug.cgi?id=317916)), as it [wasn't clear in the spec](https://github.com/w3c/csswg-drafts/issues/13268#issuecomment-4801719311).

This is a reasonable set of defaults, but I think there are a number of things we can do to improve the UX.

# Prevent the picker from hitting the viewport edge

<toggle-picker data-picker-classes="ua-picker-styles select-picker"></toggle-picker>

Right now the picker extends to the edge of the viewport, making it hard to tell if it's actually stopping there, or if it's overflowing the viewport. The only visual clue is the small border & rounded corners.

<figure>
  <video controls muted style="width: 100%; display: block; aspect-ratio: 1358/874">
    <source type="video/webm; codecs=av01.0.08M.08.0.110.01.01.01.1" src="asset-url:./videos/1-av1.mp4" />
    <source type="video/mp4" src="asset-url:./videos/1-avc.mp4" />
  </video>
</figure>

Instead, I'll add a small margin:

```css
.custom-select::picker(select) {
  margin-block-end: 1em;
}
```

Try it out:

<toggle-picker data-picker-classes="ua-picker-styles select-picker margin-block-end"></toggle-picker>

This isn't quite right, because:

- In Firefox, it simply isn't working.
- In Chrome & Safari, the margin is on the bottom, which looks bad when the picker flips above the button.

<figure>
  <video controls muted style="width: 100%; display: block; aspect-ratio: 1358/872">
    <source type="video/webm; codecs=av01.0.08M.08.0.110.01.01.01.1" src="asset-url:./videos/2-av1.mp4" />
    <source type="video/mp4" src="asset-url:./videos/2-avc.mp4" />
  </video>
</figure>

## Fixing Firefox

Remember when I said pickers have `max-block-size: stretch`? Well, Firefox doesn't support that, so I threw in `max-block-size: 100%` as a fallback. However, with percent heights, margins don't take away from the height, so the picker still hits the viewport edge, and the margin is outside it.

We can work around it:

```css
.custom-select::picker(select) {
  --viewport-margin: 1em;
  max-block-size: calc(100% - var(--viewport-margin));

  @supports (max-block-size: stretch) {
    max-block-size: stretch;
    margin-block-end: var(--viewport-margin);
  }
}
```

Now, for Firefox, we're deducting the margin from the 100% `max-block-size`. For browsers that support `stretch`, we stick with the previous solution.

And here's the result:

<toggle-picker data-picker-classes="ua-picker-styles select-picker margin-firefox-fix"></toggle-picker>

<figure>
  <video controls muted style="width: 100%; display: block; aspect-ratio: 1358/874">
    <source type="video/webm; codecs=av01.0.08M.08.0.110.01.01.01.1" src="asset-url:./videos/3-av1.mp4" />
    <source type="video/mp4" src="asset-url:./videos/3-avc.mp4" />
  </video>
</figure>

It even does the right thing when the picker flips above the button! So… why am I not using this solution for the other browsers? Well, there's a slight imperfection with how the percent-based solution behaves. See if you can spot it - I'll come back to it later.

## Fixing Chrome & Safari

We need to fix the margin when the picker flips above the button. Now, there's a feature called [anchored container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Anchor_positioning/Anchored_container_queries) which lets us apply different styles when the anchored item flips position, but it isn't supported in Safari. Thankfully, there's an even better solution that Safari _does_ support. Watch this…

```css
.custom-select::picker(select) {
  --viewport-margin: 1em;
  max-block-size: calc(100% - var(--viewport-margin));
  /* prettier-ignore */
  position-try-fallbacks: /* [!code ++] */
    /* [!code ++] */
    flip-block,
    /* [!code ++] */
    flip-inline,
    /* [!code ++] */
    flip-block flip-inline;

  @supports (max-block-size: stretch) {
    max-block-size: stretch;
    margin-block-end: var(--viewport-margin);
  }
}
```

This replaces the UA default `position-try-fallbacks`, which were specific about the positioning, with these `flip-*` values that achieve the same thing. However, the `flip-*` values come with _dark magic_.

When the flips take effect, it tries to flip other styles too. This works with some properties, but not others. [Here's the spec](https://drafts.csswg.org/css-anchor-position-1/#execute-a-try-tactic), good luck!

Margins are among the things it does work for, so when the picker flips above the button, our `margin-block-end` is treated as a `margin-block-start`. Spooky, yet convenient!

Here's the result:

<toggle-picker data-picker-classes="ua-picker-styles select-picker margin-full-fix"></toggle-picker>

<figure>
  <video controls muted style="width: 100%; display: block; aspect-ratio: 1358/872">
    <source type="video/webm; codecs=av01.0.08M.08.0.110.01.01.01.1" src="asset-url:./videos/4-av1.mp4" />
    <source type="video/mp4" src="asset-url:./videos/4-avc.mp4" />
  </video>
</figure>

That's that problem sorted, but we still have work to do.

# Prevent the picker from getting too small

If you open the picker and drag it to the viewport edge, it gets really really small - unusably small, before it flips position. Chrome sets a default `min-block-size` of `1lh`, so let's just make that bigger!

```css
.custom-select::picker(select) {
  min-block-size: 12em;
}
```

<toggle-picker data-picker-classes="ua-picker-styles select-picker margin-full-fix min-size"></toggle-picker>

But no, that creates another issue:

<toggle-picker data-picker="select-picker-small" data-picker-classes="ua-picker-styles select-picker margin-full-fix min-size">Toggle small picker</toggle-picker>

When the picker has only a few options, its full size is smaller than our minimum, so it looks kinda bad.

<figure>
  <video controls muted style="width: 100%; display: block; aspect-ratio: 1358/874">
    <source type="video/webm; codecs=av01.0.08M.08.0.110.01.01.01.1" src="asset-url:./videos/5-av1.mp4" />
    <source type="video/mp4" src="asset-url:./videos/5-avc.mp4" />
  </video>
</figure>

What we want is for our minimum size to be like `min(fit-content, 12em)`, but `min()` doesn't allow intrinsic sizes like `fit-content`. Enter [`calc-size()`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/calc-size) - this was the bit [Ian Kilpatrick unlocked for me](https://github.com/w3c/csswg-drafts/issues/13617#issuecomment-4025033386):

```css
.custom-select::picker(select) {
  min-block-size: calc-size(fit-content, min(size, 12em));
}
```

`calc-size()` lets us state an intrinsic size in the first argument, then perform a calculation with it in the second argument, where the `size` keyword represents the intrinsic size. Yeah, it's a little weird, but it works! Well, it works in Chrome. It isn't yet supported in Firefox ([ticket](https://bugzilla.mozilla.org/show_bug.cgi?id=calc-size)) or Safari ([ticket](https://bugs.webkit.org/show_bug.cgi?id=274177)), so we can use a bit of a hack in the meantime:

```css
.custom-select::picker(select) {
  --min-size: 12em;
  min-block-size: var(--min-size);

  /* The calc-size way… */
  @supports (min-block-size: calc-size(fit-content, min(size, 1px))) {
    min-block-size: calc-size(fit-content, min(size, var(--min-size)));
  }

  /* The hacky fallback… */
  @supports not (min-block-size: calc-size(fit-content, min(size, 1px))) {
    &:not(
      :has(:where(option:nth-of-type(4))),
      :has(:where(optgroup:nth-of-type(2)))
    ) {
      min-block-size: 0;
      max-block-size: fit-content;
    }
  }
}
```

Ok, that's a lot. Here's what it's doing:

1. Set a minimum block size of `12em` from `--min-size`.
2. If `calc-size()` is supported, use it as before.
3. Otherwise, if the picker has fewer than 4 options and fewer than 2 optgroups, remove the minimum block size, and prevent it from shrinking when it hits the edge of the viewport.

And here's the result:

<toggle-picker data-picker-classes="ua-picker-styles select-picker margin-full-fix min-size-fix"></toggle-picker>

<toggle-picker data-picker="select-picker-small" data-picker-classes="ua-picker-styles select-picker margin-full-fix min-size-fix">Toggle small picker</toggle-picker>

<figure>
  <video controls muted style="width: 100%; display: block; aspect-ratio: 1358/874">
    <source type="video/webm; codecs=av01.0.08M.08.0.110.01.01.01.1" src="asset-url:./videos/6-av1.mp4" />
    <source type="video/mp4" src="asset-url:./videos/6-avc.mp4" />
  </video>
</figure>

# Prevent the picker from getting too big

The last issue to tackle is preventing the picker from getting too _big_. Right now, it will always grow to fill the anchor positioning cell, which can end up feeling too tall. To solve this, we set a maximum.

However, we already used `max-block-size` to stop the picker hitting the edge of the viewport, so we need to use `min()` to allow for two max-sizes. One of the max sizes is `max-block-size: stretch`, so we need to use `calc-size()` again, letting the intrinsic `stretch` size be used in the `min()` calculation.

```css
.custom-select::picker(select) {
  --max-size: 30em; /* [!code ++] */
  --viewport-margin: 1em;
  max-block-size: calc(100% - var(--viewport-margin)); /* [!code --] */
  max-block-size: min(calc(100% - var(--viewport-margin)), var(--max-size)); /* [!code ++] */
  position-try-fallbacks:
    flip-block,
    flip-inline,
    flip-block flip-inline;

  @supports (max-block-size: stretch) { /* [!code --] */
  @supports (max-block-size: calc-size(stretch, min(size, 1px))) { /* [!code ++] */
    max-block-size: stretch; /* [!code --] */
    max-block-size: calc-size(stretch, min(size, var(--max-size))); /* [!code ++] */
    margin-block-end: var(--viewport-margin);
  }
}
```

And here's the final result:

<toggle-picker data-picker-classes="ua-picker-styles select-picker full-solution"></toggle-picker>

<toggle-picker data-picker="select-picker-small" data-picker-classes="ua-picker-styles select-picker full-solution">Toggle small picker</toggle-picker>

<figure>
  <video controls muted style="width: 100%; display: block; aspect-ratio: 1358/940">
    <source type="video/webm; codecs=av01.0.08M.08.0.110.01.01.01.1" src="asset-url:./videos/7-av1.mp4" />
    <source type="video/mp4" src="asset-url:./videos/7-avc.mp4" />
  </video>
</figure>

Because we're using `calc-size()` for the fix, which isn't supported in Safari, Safari is now using the `100%` fallback as well as Firefox, which is _almost perfect_, but not quite. Have you spotted the imperfection? Here's the issue:

<figure>
  <video controls muted style="width: 100%; display: block; aspect-ratio: 1358/874">
    <source type="video/webm; codecs=av01.0.08M.08.0.110.01.01.01.1" src="asset-url:./videos/8-av1.mp4" />
    <source type="video/mp4" src="asset-url:./videos/8-avc.mp4" />
  </video>
</figure>

ONce we get to the minimum height, the picker will move towards the edge of the viewport before flipping, whereas in Chrome which uses `calc-size()` + `stretch`, it flips as soon as it hits the minimum height. It's a minor thing, but it'll be nicer when all browsers support `calc-size()`.

# Putting it all together

Here's the full CSS for the picker, which adds the margin to the viewport, applies a minimum size, and a maximum size, all in one place to copy-paste and for LLMs to steal:

```css
.custom-select::picker(select) {
  --viewport-margin: 1em;
  --min-size: 12em;
  --max-size: 30em;

  min-block-size: var(--min-size);
  max-block-size: min(calc(100% - var(--viewport-margin)), var(--max-size));
  position-try-fallbacks:
    flip-block,
    flip-inline,
    flip-block flip-inline;

  @supports (min-block-size: calc-size(fit-content, min(size, 1px))) {
    min-block-size: calc-size(fit-content, min(size, var(--min-size)));
    max-block-size: calc-size(stretch, min(size, var(--max-size)));
    margin-block-end: var(--viewport-margin);
  }

  @supports not (min-block-size: calc-size(fit-content, min(size, 1px))) {
    &:not(
      :has(:where(option:nth-of-type(4))),
      :has(:where(optgroup:nth-of-type(2)))
    ) {
      min-block-size: 0;
      max-block-size: fit-content;
    }
  }
}
```

And one last time:

<toggle-picker data-picker-classes="ua-picker-styles select-picker full-solution"></toggle-picker>

<toggle-picker data-picker="select-picker-small" data-picker-classes="ua-picker-styles select-picker full-solution">Toggle small picker</toggle-picker>

<figure>
  <video controls muted style="width: 100%; display: block; aspect-ratio: 1358/940">
    <source type="video/webm; codecs=av01.0.08M.08.0.110.01.01.01.1" src="asset-url:./videos/7-av1.mp4" />
    <source type="video/mp4" src="asset-url:./videos/7-avc.mp4" />
  </video>
</figure>
