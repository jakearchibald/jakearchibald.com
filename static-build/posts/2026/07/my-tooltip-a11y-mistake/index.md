---
title: Fixing my tooltip accessibility mistake
date: 2026-07-28 01:00:00
summary: aria-describedby isn't enough.
meta: aria-describedby isn't enough.
code: shiki
image: './img.png'
---

I made an accessibility error, and I want you to learn from my mistakes.

I've been making short videos recently about web platform features as they land in Firefox, and also about other web standards & development stuff. If you'd prefer to watch a 3 minute video version of this article, pick your platform, and give the account a follow if this kind of thing interests you:

<style>
  .social-links {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.7em;
    margin: 1.5em 0;
    padding: 0;
    list-style: none;
  }
  .social-links li {
    margin: 0;
  }
  .social-links a {
    display: flex;
    align-items: center;
    gap: 0.5em;
    padding: 0.35em 0.9em 0.35em 0.35em;
    line-height: 1;
  }
  .social-links img {
    display: block;
    width: 28px;
    height: 28px;
    border-radius: 7px;
  }
</style>

<ul class="social-links">
  <li>
    <a href="https://www.instagram.com/reel/DbTA45PjDWT/">
      <img src="asset-url:./social-icons/instagram.svg" alt="" width="28" height="28" />Instagram
    </a>
  </li>
  <li>
    <a href="https://www.tiktok.com/@firefoxwebdevs/video/7667190734281248032">
      <img src="asset-url:./social-icons/tiktok.svg" alt="" width="28" height="28" />TikTok
    </a>
  </li>
  <li>
    <a href="https://www.youtube.com/shorts/hPrZiRSRCE4">
      <img src="asset-url:./social-icons/youtube.svg" alt="" width="28" height="28" />YouTube
    </a>
  </li>
  <li>
    <a href="https://mastodon.social/@firefoxwebdevs/116992048337520434">
      <img src="asset-url:./social-icons/mastodon.svg" alt="" width="28" height="28" />Mastodon
    </a>
  </li>
  <li>
    <a href="https://www.linkedin.com/posts/firefox-web-developers_i-made-an-accessibility-error-in-one-of-my-activity-7487491350968434690-fc6k">
      <img src="asset-url:./social-icons/linkedin.svg" alt="" width="28" height="28" />LinkedIn
    </a>
  </li>
</ul>

The account is [also on BlueSky](https://bsky.app/profile/webdevs.firefox.com), but video uploading has been broken there for a while.

Otherwise, here's the written version…

# The mistake

I made the accessibility error when I created a tooltip like this:

<figure class="full-figure">
  <img style="height:auto" src="asset-url:./images/toolbar.avif" width="1303" height="808" alt="A text formatting toolbar, featuring buttons like bold, italic, underline etc. A mouse pointer is over the bold button, and a tooltip is visible, saying 'Bold (⌘B)'." />
</figure>

That was part of a video on `popover="hint"`. Oh ok, here's a link to that video too:

<ul class="social-links">
  <li>
    <a href="https://www.instagram.com/reel/DbGK4PtCqbj/">
      <img src="asset-url:./social-icons/instagram.svg" alt="" width="28" height="28" />Instagram
    </a>
  </li>
  <li>
    <a href="https://www.tiktok.com/@firefoxwebdevs/video/7665339722767633697">
      <img src="asset-url:./social-icons/tiktok.svg" alt="" width="28" height="28" />TikTok
    </a>
  </li>
  <li>
    <a href="https://www.youtube.com/shorts/HWetxbInaVc">
      <img src="asset-url:./social-icons/youtube.svg" alt="" width="28" height="28" />YouTube
    </a>
  </li>
  <li>
    <a href="https://mastodon.social/@firefoxwebdevs/116963801309656205">
      <img src="asset-url:./social-icons/mastodon.svg" alt="" width="28" height="28" />Mastodon
    </a>
  </li>
  <li>
    <a href="https://www.linkedin.com/feed/update/urn:li:activity:7485683643156406272">
      <img src="asset-url:./social-icons/linkedin.svg" alt="" width="28" height="28" />LinkedIn
    </a>
  </li>
</ul>

I did try to get it right! I spoke to friends who know more about accessibility than me, and they pointed me towards [these demos by Scott O'Hara](https://scottaohara.github.io/a11y_tooltips/).

Now, Scott knows what he's talking about, so I figured I could just copy the patterns in his demo. Scott's demos predate hint popovers, so here's a modernized version of one of his examples:

```html
<button aria-describedby="edit-tooltip">Edit</button>
<div id="edit-tooltip" popover="hint">Modify account settings.</div>
```

The button is connected to the tooltip with `aria-describedby`, so screen readers will read the tooltip when the button is focused.

One of the nice things about `aria-describedby` is that it works even if the element it's pointing at is hidden, which is the case here.

So, I adapted Scott's code for my toolbar demo:

```html
<button aria-label="Bold" aria-describedby="bold-tooltip">
  <svg>(bold icon)</svg>
</button>
<div id="bold-tooltip" popover="hint">Bold (⌘B)</div>
```

It's a very similar pattern, although I have `aria-label` on the button, because it contains an SVG icon rather than text.

Like Scott, I added `aria-describedby` to the button, to connect the button to the tooltip.

I tested it in VoiceOver, and it said "Bold. Bold. Command B. Button."

And I thought, that's not quite right - it doesn't need to say "bold" twice.

It's happening because, unlike Scott's example, where the tooltip contained just additional content, my tooltip also contains the label. Bold is said twice, because it's there, twice.

So I dropped the `aria-label`…

```html
<!-- prettier-ignore -->
<button aria-label="Bold" aria-describedby="bold-tooltip"> // [!code --]
<button aria-describedby="bold-tooltip"> // [!code ++]
  <svg>(bold icon)</svg>
</button>
<div id="bold-tooltip" popover="hint">Bold (⌘B)</div>
```

…and VoiceOver now said "Clickable image. Bold. Command B. Button". I thought, that'll do! I hit publish on my video, and I went to the pub.

That's when I got a message from [Léonie Watson](https://front-end.social/@tink) and [Gez Lemon](https://www.linkedin.com/in/gez-lemon-0240692/) from the accessibility agency [TetraLogical](https://tetralogical.com/), telling me, very politely, that I'd done a silly.

Scott's pattern was correct, but I'd gone off the rails when I removed the `aria-label`, because now, the button has no accessible name. `aria-describedby` provides additional information - it isn't a replacement for the accessible name.

In fact, in JAWS on Windows, it tried to gather accessible text from nearby elements, and ended up announcing the bold button as both bold and italic, since the italic tooltip element was a sibling in the DOM.

There was a bit of a clue when VoiceOver said "clickable image" - this was it indicating it didn't have an accessible name to announce. I just didn't realise it at the time.

Léonie and Gez told me how to fix it: Instead of `aria-describedby`, I switched to `aria-labelledby`.

```html
<!-- prettier-ignore -->
<button aria-describedby="bold-tooltip"> // [!code --]
<button aria-labelledby="bold-tooltip"> // [!code ++]
  <svg>(bold icon)</svg>
</button>
<div id="bold-tooltip" popover="hint">Bold (⌘B)</div>
```

Now the button gets its accessible name from the tooltip, and VoiceOver says "Bold. Command B. Button." - perfect!

If I wanted, I could split this up, so the accessible name is just "Bold", and the additional description is "Command B":

```html
<button aria-labelledby="bold-label" aria-describedby="bold-description">
  <svg>(bold icon)</svg>
</button>
<div id="bold-tooltip" popover="hint">
  <span id="bold-label">Bold</span>
  <span id="bold-description">(⌘B)</span>
</div>
```

I think that's overkill in this case, but it might make sense if you have a tooltip with a longer description.

So there you go! Always ensure elements have an accessible name. And, test with multiple screen readers if you can. Testing in one screen reader is like testing in one browser - it doesn't always give you the full picture.

[Here's the fixed demo](https://random-stuff.jakearchibald.com/popover-hint-tooltip/), although it don't work quite right in Safari, as it doesn't support `popover="hint"` yet.
