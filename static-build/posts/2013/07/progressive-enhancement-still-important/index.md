---
title: Progressive enhancement is still important
date: 2013-07-03 14:33:53
summary: About 5 years ago it felt like the progressive enhancement battle had
  been won, but after watching the reactions to Nicholas Zakas' ["Enough with
  the JavaScript
  already"](http://www.slideshare.net/nzakas/enough-withthejavascriptalready) it
  seems all the old arguments are back with reinforcements. Well, I'm wearing my
  angry-pants and I'm ready for a jog down ranty lane.
mindframe: with a moderate amount of fury
image: null
meta: ""

---

About 5 years ago it felt like the progressive enhancement battle had been won, but after watching the reactions to Nicholas Zakas' ["Enough with the JavaScript already"](http://www.slideshare.net/nzakas/enough-withthejavascriptalready) it seems all the old arguments are back with reinforcements. Well, I'm wearing my angry-pants and I'm ready for a jog down ranty lane.

# This is not about users without JS

If you turn JavaScript off, you're going to have a tough time on the web. If you remove the steering wheel from your car you're going to have a tough time going round corners. My advice: Leave the steering wheel where it is.

Progressive enhancement has never been about users who've turned JavaScript off, or least it wasn't for me.

# Elevators vs escalators

Christian Heilmann [re-purposes a Mitch Hedberg observation](http://christianheilmann.com/2012/02/16/stumbling-on-the-escalator/) to relate to progressive enhancement. Basically, when an elevator fails, it's useless. When an escalator fails, it becomes stairs. We should be building escalators, not elevators.

Given the diversity of user agents, your JS failing isn't an edge case. Sometimes it'll be the browser's fault, sometimes yours. For example, a few months ago the JavaScript on the [Download Chrome](https://www.google.com/intl/en/chrome/browser/) page failed. Y'know what happened when you clicked the "Download Chrome" button? Nothing. A dash of progressive enhancement would have allowed people to continue downloading Chrome while the problem was fixed.

# Reduce your testing efforts in older browsers

A couple of years ago I was working on an intranet site for a large company. I built it with progressive enhancement out of habit. The users were mostly on IE7, it was a tightly controlled environment.

Then, at the 11th hour, the client asked for the site to work on Blackberrys, and not the shiny WebKit ones, some of them were using the old Blackberry browser. The site was a disaster on those phones.

However, the ancient Blackberry wasn't too bad at the ol' HTML and CSS, but when it came to JS it was a random error generator.

A little (ahem) UA-sniffing later and we weren't serving JS to the Blackberrys. This got us 90% of the way there, instantly. The rest was just minor CSS tweaks. This was only possible because the site worked without JS. Sure, there were some full-page refreshes that newer browsers did quicker with XHR, and some nice transitions were missing, but it *worked*.

We took this idea further for [Lanyrd's mobile site](http://lanyrd.com/mobile/) where a basic feature detect was used to decide if scripts should be loaded. We didn't use JavaScript for anything that couldn't handle ApplicationCache, which was what most of the JS was handling.

The BBC call this basic feature test ["Cuts the mustard"](http://responsivenews.co.uk/post/18948466399/cutting-the-mustard). Do yourself a favour, save your JS for the cutting-edge browsers, then you only have to drag the older browsers through HTML & CSS.

It's important to do this at the script-loading stage rather than just before execution. Not only do you avoid downloading the JS in browsers that don't need it, but you save on parsing too. On bockety old mobiles, such as the Blackberry, parsing can take many orders of magnitude longer than the downloading, and the UI is blocked while this happens.

# Reduce your testing efforts in general

When I make something work on the server, it has to work in Django 1.5.1 running on Python 2.7.3 served through Nginx 1.1.19 etc etc etc. I control the lot, if I change one of the dependencies I can test it before deploying.

Code running on the client is more of a testing effort due to the diversity of interpreter vendors and versions. Unless your server architecture is frequently changing, having most of your logic on the server is easier.

# Be faster

JavaScript is more powerful than HTML & CSS, it's like a Formula 1 car whereas HTML & CSS is a bicycle. However, in a race, the bicycle will get off the line first. An F1 car has a complex start-up procedure and requires a team of people to get it going. If the race is short enough, the bicycle will win.

Here's how most pages load:

1. HTML downloads
2. CSS downloads
3. CSS fetches additional assets
4. JS downloads
5. JS executes
6. JS fetches additional assets
7. JS updates DOM

This is the order in which they generally start, 1-4 can happen in parallel to some degree.

In a progressively enhanced page, the whole of step 2 blocks rendering, but other than that the HTML can be parsed and rendered in chunks as it downloads. This is assuming your scripts are async or are at the bottom of the document, which they should be ([more on script loading](http://www.html5rocks.com/en/tutorials/speed/script-loading/)). In this case, step 6 probably isn't necessary and step 7 is minor.

Also, most modern browsers will take a peek at pages you *might* open and scans them for things it needs, so there's a chance the browser already has a head start on downloading the CSS and JS.

In a page that's entirely JS-driven, as in `<body></body>`, your first render is blocked by all 7 steps. Sure, your HTML download is tiny, but your JS isn't, and you don't get any progressive rendering. If your JS needs to download additional assets, this also blocks rendering and cannot be seen by the look-ahead scanner that can pick up CSS & JS downloads.

JS dependent pages that aren't simply `<body></body>` may be able to get some stuff onto the screen sooner, but the page cannot be interacted with until all 7 steps are complete.

But yes, if the race is a bit longer, the F1 car will win. This is why you progressively enhance. You're off the line straight away on your bicycle, but as the F1 car comes past to overtake, you jump off the bike, do a jaw-dropping backflip in the air, land in the F1 cockpit, and accelerate into the distance.

A great example of this is [Twitter](http://www.twitter.com), their JS-driven site was painfully slow and clunky. They're fixing this by [switching to progressive enhancement](https://blog.twitter.com/2012/improving-performance-twittercom).

Fans of progressive enhancement had a "told you so" moment when [Airbnb's improved performance](http://nerds.airbnb.com/weve-launched-our-first-nodejs-app-to-product) by delivering requested content as HTML (and sold it as a new idea).

And don't get me started on [blogger.com](http://blogger.com).

# It's not doubling up on work

There's a perception that progressive enhancement means building everything on the server then building it again, like for like, on the client. This is rarely the case. Lean on the server as much as possible.

If you want to dynamically update a part of the page, that's great if it's actually faster, but do you need client-side templates? Could the server just send you the new HTML for the element? Often, yes. Remember, HTML is a semantic data format just like JSON, and if you're simply going to convert that JSON to HTML on the client, just do it on the server.

If you need client-side templates, use a format that can be shared with the server, such as [Mustache](http://mustache.github.io/). Even then, consider compiling the templates to JavaScript functions on the server and serve those, saves every client having to do the parsing & compilation.

# Work with the browser, not against it

[Lanyrd's mobile site](http://lanyrd.com/mobile/) is built the progressive enhancement way, but we used JavaScript to handle all page-to-page navigation (similar to using XHR to bring the new content in). This was to hack around limitations in AppCache, and it came at a cost.

So, you click on a link, JS changes the content. At this point, the URL isn't reflecting the content. That's ok, we have `history.pushState()`. Then the user clicks the back button, we pick up the URL change and switch the content back. However, this doesn't feel natural because the user is sent back to the top of the page, whereas expectation is to restore the scroll position. Ok, so now we have to record scroll positions before we change content, and work out the conditions for when scroll position should be restored.

The more you take over from the browser, the more complex yet expected browser behaviour you have to reimplement in JavaScript. And if different browsers do different thing, you pick one behaviour & it feels odd to users who aren't used to it.

# "App" is not an excuse

"Yeah, but I'm building a webapp, not a website" - I hear this a lot and it isn't an excuse. I challenge you to define the difference between a webapp and a website that isn't just a vague list of best practices that "apps" are for some reason allowed to disregard. [Jeremy Keith makes this point](http://adactio.com/journal/6246/) brilliantly.

For example, is Wikipedia an app? What about when I edit an article? What about when I search for an article?

Whether you label your web page as a "site", "app", "microsite", whatever, it doesn't make it exempt from accessibility, performance, browser support and so on.

If you need to excuse yourself from progressive enhancement, you need a better excuse.

# There are, of course, exceptions

…but they must be exceptions. [SpriteCow](http://www.spritecow.com/), [Jank Invaders](http://jakearchibald.github.io/jank-invaders/) and [Request Quest](http://jakearchibald.github.io/request-quest/) all depend on JS.

SpriteCow could be done server-side, but it's a rare case where the client can totally outperform the server due to the transfer of image data.

Jank Invaders is basically a demo of a JavaScript feature, and like many games simply doesn't have a sensible server-side fallback.

Request Quest depends on JavaScript because it's… well… it has to process… yeah ok, I just got lazy. Don't do that!

One of the best things about the web is it can rival native applications without a hefty initial download, without an install process, and do so across devices old and new. Let's keep it that way.

**Edit:** Emil Björklund wrote [a similar post yesterday](http://thatemil.com/blog/2013/07/02/progressive-enhancement-still-not-dead/) that's worth reading. **Another edit:** Emil's server appears to be down at the moment, not even progressive enhancement can save us from that.