---
title: Third party CSS is not safe
date: 2018-02-27 14:47:46
summary: A few days ago there was a lot of chatter about a ['keylogger' built in
  CSS](https://github.com/maxchehab/CSS-Keylogging), but the real problem is
  thinking that third party content is 'safe'.
mindframe: ""
image: ""
meta: ""

---

A few days ago there was a lot of chatter about a ['keylogger' built in CSS](https://github.com/maxchehab/CSS-Keylogging).

Some folks called for browsers to 'fix' it. Some folks dug a bit deeper and saw that it only affected sites built in React-like frameworks, and pointed the finger at React. But the real problem is thinking that third party content is 'safe'.

# Third party images

```html
<img src="https://example.com/kitten.jpg">
```

If I include the above, I'm trusting `example.com`. They may betray that trust by deleting the resource, giving me a 404, making my site look broken. Or, they might replace the kitten data with something a lot less pleasant.

However, the impact of an image is limited to the content box of the element itself. I can try and explain to users "Here's some content from `example.com`, if it goes gross it's their fault, not mine", and hope they believe me. But it certainly can't impact things like password fields.

# Third party script

```html
<script src="https://example.com/script.js"></script>
```

Compared to images, third party script has way more control. If I include the above, I'm giving `example.com` full control of my site. They can:

* Read/change page content.
* Monitor every bit of user interaction.
* Run computationally heavy code (eg, cryptocoin miner).
* Make requests to my origin with the user's cookies, and forward the response.
* Read/change origin storage.
* …they can do pretty much whatever they want.

The 'origin storage' bit is important. If the script interferes with IndexedDB or the cache storage API, the attack may continue across the whole origin, even after you've removed the script.

If you're including script from another origin, you must absolutely trust them, and their security.

If you get hit by a bad script, you should purge all site data using the [Clear-Site-Data header](https://w3c.github.io/webappsec-clear-site-data/).

# Third party CSS

```html
<link rel="stylesheet" href="https://example.com/style.css">
```

CSS is much closer in power to a script than an image. Like a script, it applies to the whole page. It can:

* Remove/add/modify page content.
* Make requests based on page content.
* Respond to many user interactions.

CSS can't modify origin storage, and you can't build a cryptocoin miner in CSS (probably, maybe, I don't know), but malicious CSS can still do a lot of damage.

## The keylogger

Let's start with the one that's getting a lot of attention:

```css
input[type="password"][value$="p"] {
  background: url('/password?p');
}
```

The above will trigger a request to `/password?p` if the input's `value` attribute ends with `p`. Do this with every character, and you're capturing a lot of data.

Browsers don't store the user-inputted value in the `value` attribute by default, so the attack depends on something that synchronises those values, such as React.

To mitigate this, React could look for another way to synchronise password fields, or browsers could limit selectors that match on the value attribute of password fields. However, this would create a false sense of security. You'd be solving things for one particular case, but leaving everything else open.

If React switched to using the `data-value` attribute, the mitigation fails. If the site changes the input to `type="text"`, so the user can see what they're typing, the mitigation fails. If the site creates `<better-password-input>` and exposes the value as an attribute there, the mitigation fails.

Besides, there are many other CSS-based attacks:

## Disappearing content

```css
body {
  display: none;
}

html::after {
  content: 'HTTP 500 Server Error';
}
```

The above is an extreme example, but imagine if the third party was doing that for some small percent of your users. It'd be difficult for you to debug, and erode user trust.

More subtle hacks could just remove the 'buy' button occasionally, or rearrange the paragraphs in your content.

## Adding content

```css
.price-value::before {
  content: '1';
}
```

Oh shit your prices just went up.

## Moving content

```css
.delete-everything-button {
  opacity: 0;
  position: absolute;
  top: 500px;
  left: 300px;
}
```

Take that button that does something severe, make it invisible, and place it over something the user is likely to click.

Thankfully, if the button does something really severe, the site is likely to show a confirmation dialogue first. That's ok, just use more CSS to trick the user into clicking the "yes I'm sure" button instead of the "oh god no" button.

Imagine if browsers did try to mitigate the 'keylogger' trick. Attackers could just take a non-password text input on the page (a search field, perhaps) and place it over the password input. Now they're back in business.

## Reading attributes

It isn't just passwords you have to worry about. You probably have other private content in attributes:

```html
<input type="hidden" name="csrf" value="1687594325">
<img src="/avatars/samanthasmith83.jpg">
<iframe src="//cool-maps-service/show?st-pancras-london"></iframe>
<img src="/gender-icons/female.png">
<div class="banner users-birthday-today"></div>
```

All of these can be targeted by CSS selectors and a request can be made as a result.

## Monitoring interactions

```css
.login-button:hover {
  background: url('/login-button-hover');
}

.login-button:active {
  background: url('/login-button-active');
}
```

Hovers and activations can be sent back to a server. With a moderate amount of CSS you can build up a pretty good picture of what the user's up to.

## Reading text

```css
@font-face {
  font-family: blah;
  src: url('/page-contains-q') format('woff');
  unicode-range: U+71;
}

html {
  font-family: blah, sans-serif;
}
```

In this case, a request will be sent if the page contains `q`. You can create lots of these for different letters, and target particular elements. Fonts can also contain ligatures, so you can start detecting sequences of characters. You can even [combine font tricks with scrollbar detection](https://gist.github.com/securityMB/d9e84bd3c7c245895360808360b9dc4e) to infer even more about the content.

# Third party content is not safe

These are just a few tricks I'm aware of, I'm sure there are many more.

Third party content has a high impact within its sandbox. An image or a sandboxed iframe has a pretty small sandbox, but script & style are scoped to your page, or even the whole origin.

If you're worried about users tricking your site into loading third party resources, you can use [CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) as a safety net, to limit where images, scripts and styles can be fetched from.

You can also use [Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity) to ensure the content of a script/style matches a particular hash, otherwise it won't execute. Thanks to [Piskvorrr on Hacker News](https://news.ycombinator.com/item?id=16474151) for reminding me!

If you're interested in more hacks like this, including more details on the scrollbar tricks, check out [Mathias Bynens' talk from 2014](https://vimeo.com/100264064#t=1290s), [Mike West's talk from 2013](https://www.youtube.com/watch?v=eb3suf4REyI), or [Mario Heiderich et al.'s paper from 2012](http://www.nds.rub.de/media/emma/veroeffentlichungen/2012/08/16/scriptlessAttacks-ccs2012.pdf) (PDF). Yeah, this stuff isn't new.
