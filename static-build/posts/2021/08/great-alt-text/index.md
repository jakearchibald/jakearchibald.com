---
title: 'Writing great alt text: Emotion matters'
date: 2021-08-04 01:00:00
summary: I recently got stuck trying to figure out the right alt text for a particular image…
meta: I recently got stuck trying to figure out the right alt text for a particular image…
image: 'asset-url:./img.jpg'
---

If you prefer videos to articles, there's [an episode of HTTP 203 on this topic](https://www.youtube.com/watch?v=flf2vS0IoRs). Ok, on with the article…

```html
<img
  src="asset-url:./silly-cat.jpg"
  alt="A black cat lying down, wearing a flip-flop on one foot. It's a human flip-flop so it doesn't fit. Regardless, the cat seems pleased with itself."
/>
```

Good alt text means that screen reader users get the same 'meaning' from the page as a fully sighted user. But sometimes that's easier said than done.

I recently got stuck trying to figure out the right alt text for a particular speaker image on a conference website:

<style>
  .avatar-example {
    display: grid;
    grid-template-columns: 70px 1fr;
    font-weight: bold;
    font-size: 1.8rem;
    gap: 0.6em;
    align-items: center;
    margin: 17px 20px;
  }
  .avatar-example-avatar {
    --border-width: 0.3rem;
    width: calc(100% - var(--border-width) * 2);
    height: auto;
    background: #ccc;
    border-radius: 100%;
    border: var(--border-width) solid #fff;
  }

  @media (min-width: 530px) {
    .avatar-example {
      margin-left: 32px;
      margin-right: 32px;
    }
  }

  @media (min-width: 800px) {
    .avatar-example {
      grid-template-columns: 85px 1fr;
      font-size: 2.1rem;
    }
  }
</style>

<figure class="full-figure max-figure">
  <div class="avatar-example">
    <img width="150" height="150" src="asset-url:./jake.jpg" class="avatar-example-avatar" alt="Head-shot of me, a pale white guy, wearing glasses, grinning slightly, and partially hiding behind a plant">
    <span>Jake Archibald</span>
  </div>
</figure>

This was part of a list of speakers for a particular talk. I couldn't decide what the alt text should be, so I did the lazy thing and outsourced my problem to Twitter [in the form of a poll](https://twitter.com/jaffathecake/status/1325443932809998341), and here are the results:

- **37.8%** "Jake Archibald hiding behind a plant"
- **33.0%** "" (empty alt)
- **15.4%** "Jake Archibald"
- **13.8%** "Avatar"

The results weren't exactly definitive, especially as I was trying to decide between the top two anyway. So, what should it be?

# Context matters

Take this image:

<figure class="full-figure max-figure">
  <picture>
    <source
      media="(-webkit-min-device-pixel-ratio: 1.5)"
      srcset="asset-url:./bike-pic/800.jpg 800w, asset-url:./bike-pic/1200.jpg 1200w, asset-url:./bike-pic/1598.jpg 1598w"
      sizes="
        (min-width: 1066px) 743px,
        (min-width: 800px) calc(75vw - 57px),
        100vw
      "
    />
    <img src="asset-url:./bike-pic/743.jpg" width="743" height="495" style="height:auto" alt="An Asian woman cycling along a street on a  bicycle. The bicycle looks like one that's part of a public bicycle hire scheme. In the background are two buildings, 'Cafe bar hotel' and 'Alpen hotel restaurant', both have similar Alpen architecture. The main difference between the two is the cafe is painted white, whereas the restaurant is painted light yellow" />
  </picture>
  <figcaption><a href="https://unsplash.com/photos/TFOiqh6fU40">Photo by Zhang Kaiyv</a></figcaption>
</figure>

What's the alt text for this image? You could fill pages describing every detail, but does every detail 'matter'? It really depends on _why_ this particular image is used.

If it's used in an article about a public bicycle hire scheme named Hire-a-bike, then the bike is the focus, and the alt text could be "A woman rides a Hire-a-bike along a city road".

Howver, if it's used in an article about a dispute between the cafe and the restaurant, the alt text might be "The fronts of the 'Cafe bar hotel' and 'Alpen hotel restaurant'". Although if the dispute is about colour of the buildings, the guttering, or the window frames, then those details should be part of the alt text.

In fact, if you tried to detail everything in the image, then the actual focus, the bit that mattered in terms of the article, might get lost among the irrelevant detail. Like when you look up a recipe, and the bulk of the content is about how the smell of rosemary reminds the author of their childhood – sorry, don't care, I just want to know how to roast potatoes.

And what about this context? I'm using the image as an example of something that could be used in multiple places. What alt text would you use here? Is it different to what I went with?

But let's go back to the key example:

<figure class="full-figure max-figure">
  <div class="avatar-example">
    <img width="150" height="150" src="asset-url:./jake.jpg" class="avatar-example-avatar" alt="Head-shot of me, a pale white guy, wearing glasses, grinning slightly, and partially hiding behind a plant">
    <span>Jake Archibald</span>
  </div>
</figure>

The context is a page about a conference talk. A heading and a `<ul>` will make it clear it's part of a list of speakers, and the name of the speaker is already there right next to the image.

In that case, "" (empty alt) is starting to look like the right choice. An empty alt effectively hides the image from screen reader users. That shouldn't be done lightly, but if the pertinent information is already present and easily accessible, an empty alt feels like a decent choice. The fact that I'm wearing glasses and hiding behind a plant doesn't really matter in terms of the conference, right?

Well, [Léonie Watson](https://twitter.com/LeonieWatson), an accessibility expert and screen reader user, changed my mind…

# Emotion matters

The relevant parts of an image aren't limited to the cold hard facts. Images can make you feel a particular way, and that's something that should be made available to a screen reader user.

<figure class="full-figure max-figure">
  <div class="avatar-example">
    <img width="150" height="150" src="asset-url:./jake.jpg" class="avatar-example-avatar" alt="Head-shot of me, a pale white guy, wearing glasses, grinning slightly, and partially hiding behind a plant">
    <span>Jake Archibald</span>
  </div>
</figure>

It isn't just a head-shot of me. I'm doing a thing. I'm peering from behind a plant and pulling a bit of a silly face. There's humour expressed in the image. I'm not saying the it's going to win any comedy awards, but the image expresses a particular tone, and that matters. So, it should go in the alt:

```html
<img
  src="asset-url:./jake.jpg"
  alt="Jake, cheekily peering from behind a plant"
/>
```

"Emotion matters" really changed how I think about writing alt text. Léonie wrote [a longer article on the idea](https://tink.uk/text-descriptions-emotion-rich-images/), which I recommend reading.

Here's a tricky one:

# Should skin colour be mentioned in alt text?

I put Surma on the spot about this in the video, but mostly to demonstrate that writing perfect alt text is hard.

In the context of a conference website, if the speaker is talking about JavaScript performance it seems unnecessary to bring race into it. But if the speaker is talking about their experience of prejudice in the tech industry, that changes the context.

Generally, we get speakers to write their own bios for conference sites. Since they choose how to be represented in the bio, it seems sensible to ask them to write their avatar alt text too.

# Don't be afraid of trying

It's possible to create alt text that's worse than no alt text, but that's mostly down to automated tooling that does things like repeat the file name in the alt text, which often results in garbage content (yes GitHub I'm looking at you). But if you're trying to do the right thing, you're almost certainly improving the experience for real people.

I put these ideas into practice on the [Chrome Dev Summit schedule](https://developer.chrome.com/devsummit/schedule/). It felt a bit judgey deciding whose avatars warranted further description, but hopefully it improves the user experience for screen reader users!

If you want to dive into more examples, [the HTML spec has some excellent documentation on writing alt text](https://html.spec.whatwg.org/multipage/images.html#alt).
