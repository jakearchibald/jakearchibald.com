---
title: Progressive enhancement is faster
date: 2013-09-03 14:35:24
summary: "Progressive enhancement has become a bit of a hot topic recently, most
  recently with Tom Dale [conclusively showing it to be a futile
  act](http://tomdale.net/2013/09/progressive-enhancement-is-dead/), but only by
  misrepresenting what progressive enhancement is and what its benefits are.\r

  \r

  Let's look at the real-world benefit of progressive enhancement."
mindframe: with a slight fear of becoming typecast
image: null
meta: ""

---

Progressive enhancement has become a bit of a hot topic recently, most recently with Tom Dale [conclusively showing it to be a futile act](http://tomdale.net/2013/09/progressive-enhancement-is-dead/), but only by misrepresenting what progressive enhancement is and what its benefits are.

# You shouldn't cater to those who have deliberately disabled JavaScript

…unless of course you have a particular use case there. Eg, you're likely to get significant numbers of users with the Tor Browser, which comes with JS disabled by default for security. If you do have that use case, progressive enhancement helps, but that's not its main benefit.

You should use progressive enhancement for [the reasons I covered a few weeks back](/2013/progressive-enhancement-still-important/). However, my article was called out on Twitter (the home of reasonable debate) as just "words on a page" and incompatible with "real-life production".

Of course, the article is an opinion piece on best practice, but it's based on real examples and actual browser behaviour. However, I wanted to find more tangible "real-world" evidence. Turns out I was staring at it.

# I love Tweetdeck

I don't have Chrome open without a [Tweetdeck](http://tweetdeck.com) tab. I use it many times a day, it's my Twitter client of choice. I manage multiple accounts and keep an eye on many searches, Tweetdeck makes this easy. It does, however, depend on JavaScript to render more than a loading screen.

[Twitter](http://twitter.com) used to be the same, but they started [delivering initial content as HTML](https://blog.twitter.com/2012/improving-performance-twittercom) and enhancing from there to improve performance. So, they deliver similar data and cater for similar use cases, this makes them perfect for a real-world comparison.

# The test

To begin, I:

* Set up a Tweetdeck account with six columns
* Closed all other apps (to avoid them fighting for bandwidth)
* Connected to an extremely fast wired network
* Used the [Network Link Conditioner](http://mattgemmell.com/2011/07/25/network-link-conditioner-in-lion/) to simulate a stable 2mbit ADSL connection
* Cleared the browser cache

I recorded Tweetdeck loading in a new tab, then cleared the browser cache again and recorded six Chrome windows loading the equivalent content on Twitter ([here's the launcher](http://jsbin.com/agExako/1/edit) if you're interested).

2mbits may sound slow, but I've stayed at many a hotel where I'd have done dirty dirty things for anything close to 2mbits. Broadband in the area I live is 4mbit max unless you can get fibre. On mobile, you'll be on much lower speeds depending on signal type and strength.

# The results

Here are the two tests playing simultaneously (note: they were executed separately):

<figure class="full-figure">
<div class="video"><iframe src="//www.youtube.com/embed/0rqrl-bcXmQ?rel=0&amp;html5=1" frameborder="0" allowfullscreen></iframe></div>
<figcaption>Tweetdeck vs Twitter - Empty cache</figcaption>
</figure>

**02.080s**: Tweetdeck renders loading screen. So Tweetdeck gets past the blank screen first.

**02.150s**: Twitter renders three "columns" of tweets, that's only 70ms later than Tweetdeck shows its loading screen.

**02.210s**: Twitter renders six columns of tweets. Twitter has delivered the core content of the page.

**04.070s**: Tweetdeck renders six empty columns. Twitter is downloading background images.

**05.180s**: Tweetdeck renders its first column of tweets.

**06.070s**: Tweetdeck delivers another column.

**06.270s**: …and another.

**08.030s**: …and another.

**08.230s**: …and another.

**10.120s**: …and another, and that's all the core content delivered by Tweetdeck. Tweetdeck is fully loaded at this point, whereas Twitter continues to load secondary content (trends, who to follow etc).

**14.210s**: Twitter finishes loading secondary content.

So Twitter gets the core content on the screen 7.91 seconds earlier than Tweetdeck, despite six windows fighting for resources. For the first bit of core content, Twitter gets it on screen 3.03 seconds sooner.

Twitter takes 4.09 seconds longer to finish loading completely, but this includes a lot of secondary content and heavy background imagery that Tweetdeck doesn't initially show. On Twitter, the core content is prioritised.

That's with an empty cache, but what about a full one? Here's the same test, but ran a second time without emptying the browser cache:

<figure class="full-figure">
<div class="video"><iframe src="//www.youtube.com/embed/YTw8JCJM7z8?rel=0&amp;html5=1" frameborder="0" allowfullscreen></iframe></div>
<figcaption>Tweetdeck vs Twitter - Full cache</figcaption>
</figure>

**00.060s** Tweetdeck renders loading screen. So Tweetdeck gets past the blank screen first, again, but much sooner.

**00.090s** Twitter renders the first "column" of tweets.

**01.010s** Twitter renders second "column".

**01.110s** Twitter renders third "column".

**01.190s** Twitter renders fourth "column".

**01.200s** Tweetdeck renders six empty columns.

**01.230s** Twitter renders fifth "column".

**01.240s** Twitter renders sixth "column". Twitter has now delivered all core content.

**02.100s** Tweetdeck renders first column.

**02.160s** Tweetdeck renders second column.

**02.260s** Tweetdeck renders third column.

**03.030s** Tweetdeck renders fourth column.

**04.010s** Tweetdeck renders fourth and fifth columns. Tweetdeck has now delivered all core content.

**04.050s** Twitter finishes downloading secondary content.

So, with a full cache, Twitter beats Tweetdeck to all core content by 2.77 seconds, and first core content by 2.01 seconds.

Which test represents the "real-life" case? Well, something in between the two. As you browse the web you'll knock resources out of your cache, but also the site will cause cache misses through rapid deployments which change the urls of resources. Current best practice is to combine & minify your CSS/JS files & give them a unique url, so whenever you need to make a change, no matter how small, the url changes and the client has to download the new resource. Roll on HTTP2, I say.

# Is this test fair?

Well, no. It's real-life, and as such it has the uncertainty of real-life. But those are two expertly-built sites that offer similar content.

## The test is unfair to Tweetdeck because:

* A lot of the XHR requests they make could be rolled into one, improving performance despite JS reliance (assuming this wouldn't have large overhead on the server)

## The test is unfair to Twitter because:

* Six separate requests are made for markup, whereas a true progressive competitor would use one. This incurs the HTTP overhead and repetition of common markup.
* It undergoes 6x the style calculations and layouts compared to Tweetdeck (because Twitter is running in six separate windows).
* I zoomed out all the Twitter windows so more content was visible, so the six windows have the paint overhead of scaling.

Of course, Tweetdeck gets away with it because it's a tab I always have open, so I don't go through the startup cost often. After that startup cost, Tweetdeck updates all columns in real-time & interactions feel as snappy as they do on the enhanced Twitter site.

It's extremely rare for a website to become a perma-tab in users' browsers, and certainly something you shouldn't bet your performance on. Twitter did this, but it turned out people shared & followed links to individual tweets and timelines, and the startup cost made them feel incredibly slow. They [fixed this with progressive enhancement](https://blog.twitter.com/2012/improving-performance-twittercom).

# The results aren't surprising

Here's what a progressively enhancing site needs to download to show content:

* *some* HTML
* CSS

…and those two download pretty much in parallel. The HTML will get a head start, because the browser needs to read the HTML to discover the CSS.

The whole of the CSS will block rendering to avoid [FOUC](http://en.wikipedia.org/wiki/Flash_of_unstyled_content), although if you want to put your foot to the floor you can inline the CSS for top-of-page content, then include your `link[rel=stylesheet]` just before the content that isn't covered by the inlined CSS.

Rendering isn't blocked by *all* your HTML, the browser can update the rendering as it receives more markup. This works with gzipped HTML too. Check out the [full WHATWG spec](http://www.whatwg.org/specs/web-apps/current-work/) (warning: it's 2.6mb), although the markup is huge, it gets to first-render really quickly.

Ideally you'd have your script in the head of the page loading async, so it gets picked up by the parser early and enhances the page as soon as possible.

If a site does its content-building on the client based on API calls, such as Tweetdeck, here's what it needs to download:

* All HTML (although small)
* CSS
* JavaScript
* JSON (API call)

The HTML, CSS and JavaScript will download pretty much in parallel, but the JSON download cannot start until the JavaScript has downloaded, because the JavaScript triggers the request.

The JavaScript on one of these pages can be significant, for instance Tweetdeck's scripts total 263k gzipped. [As Adam Sontag points out](https://twitter.com/miketaylr/statuses/227056824275333120) (using Mike Taylor as his medium), that's the size of a few images we'd use on a page without thinking twice. But we *would* think twice if those images blocked core content from downloading and displaying, which is the case with the JavaScript on these sites. Hey, images even progressively render as they download, JavaScript can't do anything until the whole file is there.

Getting something on screen as soon as possible really improves the user-experience. So much so that Apple recommends giving iOS apps a static bitmap ["Launch Image"](https://developer.apple.com/library/ios/documentation/userexperience/conceptual/mobilehig/IconsImages/IconsImages.html#//apple_ref/doc/uid/TP40006556-CH14-SW5) that looks like the first screen of your app. It's a basic form of progressive enhancement. Of course, we can't do that on the web, we can do better, we can show actually core content as soon as possible.

I'm open to examples to the contrary, but I don't think a JS-rendered page can beat a progressively enhanced page to rendering core content, unless the latter is particularly broken or the content can be automatically generated on the client (and generating it is faster than downloading it).

I'm keen on the progressive enhancement debate continuing, but can we ditch the misrepresentation and focus on evidence? [That goes for both sides](https://twitter.com/tomdale/status/374868435412328449) of the debate.