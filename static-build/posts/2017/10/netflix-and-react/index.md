---
title: Netflix functions without client-side React, and it's a good thing
date: 2017-10-31 11:02:49
summary: A few days ago [Netflix
  tweeted](https://twitter.com/NetflixUIE/status/923374215041912833) that they'd
  removed client-side React.js from their landing page and they saw a 50%
  performance improvement. It caused a bit of a stir.
mindframe: ''
image: ''
meta: Netflix improved performance by deferring react on the client, but this
  doesn't reflect badly on React.
---

A few days ago [Netflix tweeted](https://twitter.com/NetflixUIE/status/923374215041912833) that they'd removed client-side React.js from their landing page and they saw a 50% performance improvement. It caused a bit of a stir.

# This shouldn't be a surprise

The following:

1. Download HTML & CSS in parallel.
1. Wait for CSS to finish downloading & execute it.
1. Render, and continue rendering as HTML downloads.

…is always going to be faster than:

1. Download HTML (it's tiny).
1. Download CSS & JS in parallel.
1. Wait for CSS to finish downloading & execute it.
1. Wait for JS to finish downloading & execute it.
1. (In many cases, SPAs wait until this point to start downloading data).
1. Update the DOM & render.

…to achieve the same result. Netflix switched from the second pattern to the first, so the headline boils down to: **less code was executed and stuff got faster**.

When the PS4 was released in 2013, one of its advertised features was progressive downloading – allowing gamers to start playing a game while it's downloading. Although this was a breakthrough for consoles, the web has been doing this for 20 years. [The HTML spec](https://html.spec.whatwg.org/) (**warning**: 8mb document), despite its size, starts rendering once ~20k is fetched.

Unfortunately, it's a feature we often engineer-away with single page apps, by channelling everything through a medium that isn't streaming-friendly, such as a large JS bundle.

# Do a little with a little

I used to joke about Photoshop, where you'd be shown this:

<figure class="full-figure">
<img src="asset-url:./photoshop-splash.png" alt="Photoshop splash screen">
</figure>

Once this appeared, it was time to go for a coffee, go for a run, practice juggling, perhaps even acknowledge the humans around you, because Photoshop was busy doing some serious behind-the-scenes work and there was nothing you could do about it.

A splash screen is a gravestone commemorating the death of an app's performance. Adobe even used that space to list all of those responsible. But what did you get once all the loading completed?

<figure class="full-figure">
<img src="asset-url:./photoshop-open.png" alt="Photoshop opened">
</figure>

That. It looks like the whole app, but I can't use the whole app right now. My first interaction here is pretty limited. I can create a blank canvas, or open an existing image. Those two interactions don't justify a lot of up-front loading.

Rather than copying bad examples from the history of native apps, where everything is delivered in one big lump, we should be doing a little with a little, then getting a little more and doing a little more, repeating until complete. Think about the things users are going to do when they first arrive, and deliver that. Especially consider those most-likely to arrive with empty caches.

[Webpack's super-smart code-splitting](https://webpack.js.org/guides/code-splitting/) allows you to throw more engineering at the problem by splitting out code that isn't needed for the most-likely first interaction, but sometimes there's a simpler opportunity.

If your first interaction is visual, such as reading an article or looking at an image, serve HTML for those things. Most frameworks now offer some sort of server-rendering feature – just ensure you're not serving up a load of buttons that don't work while the client-side JS is loading.

If the majority of your functionality is behind a log-in, take advantage of it. Most login systems can be implemented without JavaScript, such as a simple form or a link. While the user is distracted with this important and useful functionality, you can start fetching and preparing what they need next. This is what Netflix did.

It shouldn't end with the first interaction either. You can lazily-load and execute code for discrete interactions, loading them in the order the user is most-likely to need them. [`<link rel=preload>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Preloading_content) can be used to lazily-load without executing, and the new [`import()`](https://github.com/tc39/proposal-dynamic-import) function can be used to execute the code when needed. Again, webpack can help with the splitting if you're currently bundling.

If you're loading a JSON object containing 100 pieces of data, could that be streamed in a way that lets you display results as they arrived? Something like [newline-delimited JSON](/2016/fun-hacks-faster-content/#newline-delimited-json) can help here.

Once you're prepared for logged-in interactions, you can cache all that, and serve it from a service worker for future visits. If you update your code, that can be downloaded in parallel with the user using the current version, and you can transition the user to the new version in the least-disruptive way you can manage.

I'm a fan of progressive enhancement as it puts you in this mindset. Continually do as much as you can with what you've got.

# This is good news for React

Some folks in the React community were pretty angry about Netflix's tweet, but I struggle to read it as a bad story for React.

Frameworks are an abstraction. They make a subset of tasks easier to achieve, in a way that's familiar to other users of the framework. The cost is performance – the overhead of the framework. The key is making the cost worth it.

I have a reputation for being against frameworks, but I'm only against unnecessary usage, where the continual cost to users outweighs the benefit to developers. But "only use a framework if you need to" is easier said than done. You need to decide which framework to use, if any, at the start of a project, when you're least-equipped to make that decision.

If you start without a framework, then realise that was a mistake, fixing it is hard. Unless you catch it early enough, you can end up with lots of independent bits of script of varying quality, with no control over their scheduling, and duplication throughout. Untangling all that is painful.

Similarly, it's often difficult to remove a framework it turns out you didn't need. The framework 'owns' the project end-to-end. Framework buy-in can leave you with a lot of simple buttons and links that now have a framework dependency, so undoing all that can involve a rewrite. However, this wasn't the case for Netflix.

Netflix uses React on the client and server, but they identified that the client-side portion wasn't needed for the first interaction, so they leaned on what the browser can already do, and deferred client-side React. The story isn't that they're abandoning React, it's that they're able to defer it on the client until it's was needed. React folks should be championing this as a feature.

Netflix has shown you could start with React on the server, then activate the client side parts if you need them, when you need them, and where you need them. It's kinda the best of both worlds.
