---
title: If we stand still, we go backwards
date: 2015-08-03 08:39:16
summary: "Recently, [ppk claimed the web is going too fast in the wrong
  direction](http://www.quirksmode.org/blog/archives/2015/07/stop_pushing_th.ht\
  ml), and asked for a year's moratorium on web features. I was so angry I ran
  straight to a dictionary to find out what \"moratorium\" meant. Turns out it
  means \"suspension\".\r

  \r

  I got a bit snarky about it on Twitter, which isn't really fair, so here's a
  more considered response:"
mindframe: ''
image: null
meta: ''
---

Recently, [ppk claimed the web is going too fast in the wrong direction](http://www.quirksmode.org/blog/archives/2015/07/stop_pushing_th.html), and asked for a year's moratorium on web features. I was so angry I ran straight to a dictionary to find out what "moratorium" meant. Turns out it means "suspension".

I got a bit snarky about it on Twitter, which isn't really fair, so here's a more considered response:

# "The web is getting more complicated"

Is it? Let's look at the modern web's "hello world":

```html
<!DOCTYPE html>
<title>Hello</title>
World
```

Let's compare that to the pre-HTML5 "hello world":

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <title>Hello</title>
  </head>
  <body>
    <div>World</div>
  </body>
</html>
```

"Hello world" is simpler now than it has ever been.

Ok ok, as many have pointed out, "Hello world" is not a fair judge of complexity, but take the [world's first web site](http://info.cern.ch/hypertext/WWW/TheProject.html) - it still works in modern browsers. For any given page, the complexity of creating it today is the same, or easier.

So it's not that achieving the same has gotten more complicated, it's that…

# User expectations are higher

We shouldn't be surprised by this. Expectations change. Back in 1995, one of my favourite comedians said (something like) this:

<blockquote class="quote"><p>I'm not interested in Star Trek or child pornography so the internet has nothing for me</p>&mdash; Stewart Lee</blockquote>

The web has come a long way in twenty years. Transferring data across the globe is no longer a big deal. Making an online purchase is not something you'd wow a dinner party with. Given the web's progress, last decade's "pretty good" is today's "a bit shit".

User experience has become a competitive element on the web. As a result, us developers and designers have had to up our game, but we're getting a better web as a result.

# Is the web platform too big?

To enable us to build better experiences, the web platform gained new features. Is this a problem?

When I left university, I felt I knew all of the web platform. Partially because the web was simpler, but also I was an arrogant little shit who didn't know how much I didn't know.

As new features appeared and I learned more about the existing platform, I realised I wasn't capable of knowing it all. At first this felt like a personal failing, but I've since made peace with it.

Is the web platform too big? For one person, yes. Is it a problem? No. No one can be an expert in the whole web. Surgeons aren't experts in all types of surgery, scientists aren't experts in all of science, web developers aren't experts in all of web development.

A couple of years ago, I ran a [little quiz on browser requests](https://youtu.be/WiOl0Y06xV4?t=2m56s). The top scorer was usually below the 50% mark, not because the audience were idiots, far from it, they were competent web developers, some of them experts. It just wasn't stuff everyone needed to instantly recall, it was stuff you'd be able to work out as and when needed, using developer tools (just as I did when making the quiz).

A few years ago, the sum-total of my "offline web" knowledge was "there is a thing called appcache that does it", and that was enough. I didn't have to learn any more about it until a project came along that would benefit from it. Of course I now know that _every_ project benefits from offline, right? Right?

## Just because it's there, doesn't mean you must learn it and use it

Here's a picture I took of some planes doing a thing:

<figure class="full-figure">
<img src="asset-url:./original.jpg" alt="Picture of planes, badly cropped, low contrast">
</figure>

It could be better, so let's get Photoshop on the case. When faced with Photoshop's expansive set of tools, it's a common beginner mistake to throw everything at it:

<figure class="full-figure">
<img src="asset-url:./bay.jpg" alt="A mess of filters and effects">
</figure>

This may be Michael Bay's wet dream, but he's the exception. However, I could use a subset of features more subtly:

<figure class="full-figure">
<img src="asset-url:./subtle.jpg" alt="Cropped, with subtle contrast added">
</figure>

Same goes for the web. You don't need to achieve 100% browser code coverage in a single page. Use what's right for the project. The best user experience is the simplest thing that achieves the user's goals.

# Are we adding the right features to the web?

ppk argues that we're blindly copying native, I don't think we are, but that doesn't mean we should ignore native altogether. We should add features using evidence, and native is a great source of evidence.

Through native, we've seen users benefit from push messaging, offline data access, gps, speedy payments. Through native we've also seen store management harm openness, packaging hurt linking, and up-front permissioning harm security and privacy. Native's successes and failures are great data points.

And let's be clear here, when we say "native" we mean the class of devices that arrived after the web, mobile & tablet. The web was ready for mobile as soon as we put a browser on it, but it wasn't optimised for it. Media queries, gps, push messaging, and soon, pointer events, these are features that adapt to the new device inputs, new screen dimensions, new usage patterns.

Of course, native isn't the only source of UX evidence. Going back a few years, we were looking at what Flash did best, and took from there. When I read "we shouldn't do [feature] because that's what native does", I wonder if that same person thinks we shouldn't have `<video>` because that's what Flash did.

Libraries and tools are other sources of evidence, they show what developers are fighting. [jQuery](https://jquery.com/) showed developer's frustration with the stagnation of IE, and which DOM features were lacking. [Coffeescript](http://coffeescript.org/) showed frustrations with JavaScript language features. [Sass](http://sass-lang.com/) showed frustrations with CSS. These things, and their popularity, were a clear signal that developers found parts of the web platform lacking, and were unhappy with the pace of development.

Other features, such as HTTP/2, were created by looking at the weak points of the web. Sure, HTTP/2 is more complex than HTTP/1.1, but it also reduces the need for a lot of hacks like concatenation, inlining, spriting, which complicate today's web.

We haven't always gotten it right, see appcache. In that case we didn't have enough evidence, and created a high-level solution that couldn't be used the way developers wanted. Following that, we adopted a different approach, [the Extensible Web](https://extensiblewebmanifesto.org/). Now we try to introduce lower-level features first. Those are more flexible, but require more JavaScript to build into a full experience. Developers' use of these low-level features becomes a new source of evidence for future higher-level features.

# Halting is not a successful strategy

Back in 2007, Apple brought out the iPhone. Compared to its competitors, it was a step forward in terms of its excellent touch screen and interaction design. In other areas, it was lacking. No 3g connectivity, no GPS, no front camera. Did it stick to what it was good at and impose a moratorium on the rest? No.

But one company did. They were called "Research In Motion", and produced a phone called a "BlackBerry". They decided to concentrate on their current set of users, who they decided didn't want change. But that set of users decreased as expectations changed.

BlackBerry had a head start in the mobile race, but they stopped. By the time they realised they were behind, their attempts to catch up came too little, too late. Meanwhile, the iPhone gradually assimilated the advantages of its competitors. Not all of them, just the features that mattered, ones that had a proven track record.

I love the web, therefore I react in shock to any suggestion that we should adopt the BlackBerry strategy.

I was a developer during the last moratorium of the web, IE6-8. IE6 came out in 2001 and it was great, but then Microsoft stopped. IE7 came out in 2006, and IE8 in 2009, but they were mostly bug-fix releases, they had little in the way of new features. We're still recovering from that, but it feels like there's light at the end of the tunnel. I don't want to go back there!

# Improve the web forward

The great thing about the web is it doesn't hit 1.0 and stop, it's continual. Table layouts were observed, and CSS was delivered to offer express layout without all the markup cruft. DOM selector libraries were observed, and we got `querySelectorAll`. Viewport diversity was observed, and we got media queries. Mobile usage has sky-rocketed, and it's an exciting new thing to observe.

We shouldn't get snobby about features that appeared on other platforms first. Native apps are looking to gain the web's advantages too, they're figuring out linking, and at some point they're going to figure out progressive loading and get rid of the install process. If we stop, we lose.

The web is feature-rich, and it's great. Media queries, touch events, flexbox, service worker, push messaging, web audio, canvas… these are all features you may use to improve user experience. I'm not sure which of these fall into ppk's "this far, no further" basket, but you don't _have_ to use any of them. You are welcome to draw a line in the sand and refuse to learn new web features from this day forth. But if a competitor does use them, and uses them to create a better user experience than the one you offer, you lose. But users win.

**Update:** [Opera's Bruce Lawson responded to ppk](https://dev.opera.com/blog/on-a-moratorium-on-new-browser-features/) at almost the same time I did. I think I published first by like 5 minutes, so I win. In your face Bruce!

<small>Thanks to Anne van Kesteren, Alex Russell, Peter Beverloo, and Paul Lewis for proofreading and general point-sharpening. For reading this far you win a [free TIE-kitten dogfight desktop wallpaper](https://www.flickr.com/photos/jaffathecake/20065547268/).</small>
