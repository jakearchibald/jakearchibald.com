---
title: Give footnotes the boot
date: 2025-07-01 01:00:00
summary: I hate footnotes, and hopefully by the end of this, you will too.
meta: I hate footnotes, and hopefully by the end of this, you will too.
#image: './img.png'
---

<style>
  html {
    scroll-padding-top: 1.3rem;
  }
  @keyframes ref-alert {
    0% {
      transform: scale(17);
      opacity: 0;
    }
    20% {
      opacity: 1;
    }
    80% {
      opacity: 1;
    }
    100% {
      transform: scale(1);
      opacity: 0;
    }
  }
  sup.ref {
    margin-left: 0.09em;
    display: inline-block;
    position: relative;
  }
  .target-effect:target::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 1.2em;
    aspect-ratio: 1 / 1;
    border-radius: 1000px;
    border: 3px solid red;
    translate: -50% -50%;
    opacity: 0;
    animation: ref-alert 0.8s ease;
  }
  .footnotes {
    font-size: 0.85em;
    > ol {
      padding-inline-start: 0;
      list-style-position: inside;
      > li {
        margin-bottom: 1em;
      }
    }
  }
  .footnote {
    background-image: linear-gradient(to right, transparent 0%, yellow 0%, yellow 100%, transparent 100%);
    background-position: left top;
    background-repeat: no-repeat;
    transition: background-size 1.7s ease;
    background-size: 0% 100%;
    &:target {
      @starting-style {
        background-size: 0% 100%;
      }
      background-size: 100% 100%;
    }
  }
  a:active {
    outline: 2px solid red;
  }
  .footnote-marker-button {
    all: unset;
    position: inline-block;
    cursor: pointer;
    color: #cc2100;
    &:hover, &:focus {
      color: #ff8f00;
    }
  }
  @position-try --custom-right {
    position-area: top;
    right: 64px;
    left: 64px;
    max-width: 90vw;
    margin: 0;
  }
  @keyframes backdrop-in {
    from {
      opacity: 0;
    }
  }
  @keyframes popover-in {
    from {
      opacity: 0;
      translate: 0 20px;
    }
  }
  .footnote-popover {
    &:not(:popover-open) {
      all: unset;
    }

    --side-margin: 20px;
    --border-radius: 7px;

    @media (width >= 530px) {
      --side-margin: 30px;
    }

    &:popover-open {
      all: unset;
      font-size: 1rem;

      .footnote-popover-content {
        position: fixed;
        background: #fff;
        padding: 0.9em 1.1em;
        max-width: 476px;
        border-radius: var(--border-radius);
        animation: popover-in 0.2s ease;
      }

      &::backdrop {
        background: rgba(0, 0, 0, 0.3);
        animation: backdrop-in 0.2s ease;
      }
    }

    @supports not (bottom: anchor(top)) {
      .footnote-popover-content {
        margin: auto;
        inset: 0;
        height: fit-content;
      }
    }

    @supports (bottom: anchor(top)) {
      &:popover-open {
        --arrow-size: 10px;

        .footnote-popover-content {
          bottom: anchor(top);
          justify-self: anchor-center;
          margin: 0 var(--side-margin) var(--arrow-size);
        }

        &::after {
          content: '';
          position: fixed;
          bottom: anchor(top);
          justify-self: anchor-center;
          border: calc(var(--arrow-size) + 1px) solid transparent;
          border-bottom-width: 0;
          border-top-color: #fff;
          width: 0;
          height: 0;
          margin: 0 calc(var(--side-margin) + var(--border-radius));
          animation: popover-in 0.2s ease;
        }
      }
    }
  }
  [role=note] {
    margin: 0 -20px;
    padding: 0 20px;
    background: #dbf3f7;
    display: flow-root;

    @media (width >= 530px) {
      padding: 0 1.6em;
      margin: 0;
    }

    > h4:first-child {
      margin-top: 1.3em;
    }
  }
  :root {
    interpolate-size: allow-keywords;
  }
  .details-demo {
    margin: 0 -20px;
    background: #dbf3f7;
    display: flow-root;
    overflow: clip;

    @media (width >= 530px) {
      margin: 0;
    }

    summary {
      margin: 1.2em 0;
      padding: 0 20px;

      @media (width >= 530px) {
        padding: 0 30px;
      }
    }

    .details-content {
      padding: 0 20px;

      @media (width >= 530px) {
        padding: 0 30px;
      }

      > p:first-child {
        margin-top: 0;
      }
    }

    .code-example {
      margin-bottom: 0;
      --unmargin: 20px;
      margin-left: calc(var(--unmargin) * -1);
      margin-right: calc(var(--unmargin) * -1);
      padding-left: var(--unmargin);
      padding-right: var(--unmargin);

      @media screen and (min-width: 530px) {
        --unmargin: 32px;
      }
    }

    &::details-content {
      height: 0;
      overflow: clip;
      display: flow-root;
      transition: height 0.5s ease, content-visibility 0.5s ease allow-discrete;
    }
    &[open]::details-content {
      height: auto;
    }
  }
</style>

I hate footnotes<sup class="ref">1</sup>, and hopefully by the end of this, you will too. Let's get down to it…

# The UX of footnotes in printed media

You, the reader, encounter a tiny number<sup class="ref">2</sup> within some prose. This indicates to you that I, the writer, have something more to say on this topic. And, for your inconvenience, I've put it way down at the bottom of the page.

The choice is yours: do you skip over it, and stay in the flow of the article, or do you set off on a side-quest to discover the extra wisdom I have to offer?

It's like one of those "choose your own adventure" books, except you know the destination is a dead-end, meaning you'll have to re-trace your steps so you can continue the main thread of the article.

Maybe if you know me well enough, you can be in tune with the kinds of things that I'd choose to leave in a footnote, and you can make some kind of judgement on whether it's likely to be worth your time. But since this is the first time I've used footnotes in an article<sup class="ref">3</sup>, you don't really have anything to go on. All that little 3 tells you is that there's some additional content that may or may not be contextually useful to you, and that it's the third time I've done this to you.

Whether you go out of your way to read the footnote content is really just a test of your curiosity.

If you did make your way down to the footnotes, I hope you appreciated that I set the text size to be a little smaller than the 'ideal' size that I chose for the main body content, making them harder to read, such is the tradition within the footnote community.

And if you enjoyed all of that, I have _great news for you_: many people bring this experience to the web.

# Footnotes on the web

If reproduced as-is, footnotes on the web are even worse than their printed counterparts. In print, the footnotes are usually at the bottom of the current page, so they're a quick glance away, and you can use a finger to mark your place in the main text while you're off on your side-quest. Whereas on this beautiful pageless web of ours, you have to scroll all the way down to the end of the article. You can try flinging right to the bottom of the document, but if there's a sizeable footer or comments section, you'll overshoot the footnotes. And of course, after all of this, you have to scroll back to where you were, which is easier said than done.

However, most webby footnoters have realised that in the printed world, the numbering of footnotes is used to manually _link_ the primary content to the supplemental content, and the web has a dedicated feature to enhance connections like this: hyperlinks[<sup class="ref">4</sup>](#footnote-4).

Of course, with footnotes being at the bottom of the article, sometimes these links will simply take you to the end of the document, so you'll _still_ have to visually scan for the pertinent footnote[<sup class="ref">5</sup>](#footnote-5).

If the footnote markers are links, then the user can use the back button/gesture to return to the main content. But, even though this restores the previous scroll position, the user is still left with the challenge of finding their previous place in a wall of text[<sup class="ref target-effect" id="footnote-marker-6">6</sup>](#footnote-6).

We could try to solve that problem by dynamically pulling the content from the footnotes and displaying it in a popover. In some browsers <span class="popover-support-commentary"></span> that will display like a tooltip, pointing directly back to the footnote marker. Thanks to modern web features, this can be done entirely without JavaScript<button class="footnote-marker-button" popovertarget="footnote-7" style="anchor-name: --footnote-7"><sup class="ref">7</sup></button>.

<script>
  {
    const el = document.querySelector('.popover-support-commentary');
    if (CSS.supports('bottom: anchor(top)')) {
      el.textContent = '(including yours)';
    } else {
      el.textContent = '(not yours, sorry)';
    }
  }
</script>

But this is still shit! I see good, smart people, who'd always [avoid using "click here" as link text](https://www.w3.org/QA/Tips/noClickHere), litter their articles with link texts such as <sup>1</sup>, <sup>7</sup>, and _sometimes even <sup>12</sup>_. Not only is this as contextless as "click here", it also provides the extra frustration of a tiny-weeny hit target.

And all this for what? To cargo-cult academia? Stop it! Stop it now! Footnotes are a shitty hack built on the limitations of printed media. It's dumb to build on top of those limitations when they don't exist on the web platform. So I ask you to break free of footnotes and do something better.

# Alternatives to footnotes on the web

Here are the goals:

- Provide easily-read supplementary content.
- Let the user easily skip over it if they're not interested.
- Make it easy for the user to decide if they're interested or not.

Given that:

## Just, like… parentheses?

Honestly, if you've got a quick little aside, just pop it in parentheses. If the reader really wants to skip it, scanning for the next closing parenthesis is pretty easy (unless you're nesting them – don't do that), and it keeps the reader in the flow of the article.

## A 'note' section

If your content is a little longer, you can use `<section role="note">` and style it to look self-contained.

<section role="note">

### Why not `<aside>`?

I thought [the `<aside>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/aside) would be ideal for this, but that uses [the `complementary` role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/complementary_role) which doesn't seem like a good fit for this kind of content. Whereas [the `note` role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/note_role) is specifically for "parenthetic or ancillary content", which sounds perfect.

</section>

The heading makes the topic of the note clear, and since the content is semantically and visually contained, it's easy to skip over.

## A 'details' section

If your content is too long for a note, consider using `<details>`.

<details class="details-demo">
  <summary>Animating the height of the <code>&lt;details&gt;</code> element</summary>

  <div class="details-content">

Thanks to a few newer CSS features (currently only available in Chromium), such as [the `::details-content` pseudo-element](https://developer.mozilla.org/en-US/docs/Web/CSS/::details-content), [`allow-discrete` transitions](https://developer.mozilla.org/en-US/docs/Web/CSS/transition-behavior#allow-discrete), and [interpolate-size](https://developer.mozilla.org/en-US/docs/Web/CSS/interpolate-size), we can animate the opening and closing of `<details>` elements.

```css
:root {
  interpolate-size: allow-keywords;
}

.details-demo {
  &::details-content {
    height: 0;
    overflow: clip;
    display: flow-root;
    transition:
      height 0.5s ease,
      content-visibility 0.5s ease allow-discrete;
  }

  &[open]::details-content {
    height: auto;
  }
}
```

  </div>
</details>

Like the note section, the summary makes the topic of the details clear, and since the content is semantically and visually contained, it's easy to skip over. The benefit with `<details>` is the user doesn't have to scroll past lots of content if they're not interested.

I'm not a UX designer, so maybe you can think of better patterns. But if the alternative is footnotes, the bar is lowwwww.

<aside class="footnotes">

# Footnotes (sigh)

1. As always there are exceptions. Footnotes on Wikipedia avoid many of the pitfalls because they're only used for references, and they're a big enough site that visitors are frequent, and get used to that pattern. Although, I've only just noticed they use letter markers for 'notes' and numbers for 'references'.
2. Not all footnotes are numbers, some are symbols, such as †.
<li style="list-style-type: '†. '">Oh, sorry, that wasn't an actual footnote marker.</li>
<li value="3">Because, like I said, I hate them<sup class="ref">1</sup>.</li>
3. <span id="footnote-4"></span>This is done using [the anchor element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a), which is "baseline widely available".
4. <span id="footnote-5" class="footnote"><a href="https://developer.mozilla.org/en-US/docs/Web/CSS/:target">CSS's `:target` pseudo-class</a> can help here by highlighting the linked footnote.</span>
5. <span id="footnote-6" class="footnote">Some footnote authors resolve this by adding a link back to the footnote marker, some also employ `:target` styles to help the user find their previous place in the document. <a href="#footnote-marker-6">⇐</a></span>
6. <span id="footnote-7" class="footnote-popover" popover><span class="footnote-popover-content" style="position-anchor: --footnote-7">This is done using a combination of <a href="https://developer.mozilla.org/en-US/docs/Web/API/Popover_API"><code>popover</code>, <code>popovertarget</code></a>, and <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_anchor_positioning">CSS anchor positioning</a>. Elements with the <code>popover</code> attribute don't usually display until activated, but I've forced it to display using CSS, which is how this content also appears in the footnotes.</span></span>

</aside>
