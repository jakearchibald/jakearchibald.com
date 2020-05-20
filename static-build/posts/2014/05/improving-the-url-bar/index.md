---
title: Improving the URL bar
date: 2014-05-04 00:00:01
summary: "iOS has hidden the pathname of URLs for some time now, but recently
  Chrome Canary introduced something similar behind a flag.\r

  \r

  I'm not involved in the development of Chrome experiment at all, but I've
  got more than 140 characters worth of opinion on it…"
mindframe: '- May the fourth and prosper'
image: null
meta: ''
---

iOS has hidden the pathname of URLs for some time now, but recently Chrome Canary introduced something similar behind a flag.

I'm not involved in the development of Chrome experiment at all, but I've got more than 140 characters worth of opinion on it…

# We have a real security problem

I recently received an email from my domain name registrar telling me [spritecow.com](http://www.spritecow.com/) was soon to expire. I followed the link, entered my username and was about to enter my password. I glanced up at the URL, it was HTTPS, great, had the registrar's URL in it, fine. Then I looked closer and realised it wasn't the registrar's URL at all. I was very nearly phished.

I get phishing emails all the time, but this one nearly got me. It was well written, it used all the same logos. When I followed the link my URL bar filled up, which is expected, the domain registrar I use doesn't have fantastic URLs. It did the usual trick of front-loading the URL. If I nearly got caught out, surely less savvy users are pretty screwed.

<figure class="full-figure">
<img alt="" src="asset-url:./current-vs.png">
<figcaption>Real URL vs phishing URL</figcaption>
</figure>

On top, a <a href="http://www.halifax.co.uk/creditcards/?WT.seg_3=Common/promotion/credit_cards/hlinke/credit0-crdtcard-lnke-crdtcard00">page from my bank's website</a>, on the bottom, a [phishing equivalent](http://www.halifax.co.uk.creditcards.wt.seg_3.common.credit0-crdtcard-lnke-crdtcard00.this.evil.jakearchibald.com/creditcards/?WT.seg_3=Common/promotion/credit_cards/hlinke/credit0-crdtcard-lnke-crdtcard00).

Part of this is my bank's fault. It's taught me not to expect HTTPS on all of its pages (thankfully the online-banking bits are), and to expect terrible URLs, but the browser could be doing a better job to save me.

Find someone who doesn't work in tech, show them their bank's website, and ask them what about the URL tells them they're on their bank's site. In my experience, most users don't understand which parts of the URL are the security signals. Browsers have started to make those parts of the URL bolder, but as you can see from the above screenshot, that isn't enough.

# Hiding the cruft

iOS7 Safari introduced something interesting:

<figure class="full-figure">
<img alt="" src="asset-url:./ios-vs.png">
<figcaption>Real URL vs phishing URL in iOS7</figcaption>
</figure>

…and Chrome Canary does something similar behind the flag `chrome://flags/#origin-chip-in-omnibox`:

<figure class="full-figure">
<img alt="" src="asset-url:./canary-vs.png">
<figcaption>Real URL vs phishing URL in Chrome Canary</figcaption>
</figure>

**Edit:** I want to point out that this is an _experiment_. It's behind a flag in Canary, that's as experimental-yet-public as it gets. It's by no means the final design, and existing in Canary behind a flag does not mean it's certain to appear in stable releases.

For me, this is much more obvious (as long as [this bug is fixed](https://code.google.com/p/chromium/issues/detail?id=369853)) and becomes more obvious still with extended validation certificates.

<figure class="full-figure">
<img alt="" src="asset-url:./ssl-vs-extended-cert.png">
<figcaption>HTTPS vs HTTPS + extended validation certificates</figcaption>
</figure>

Browsers stopped showing the username/password part of URLs because it made phishing too easy. This is a natural progression.

# The death of URLs?

No, this isn't URL death. The URL is the share button of the web, and it does that better than any other platform. Linkability and shareability is key to the web, we must never lose that, and these changes do not lose that.

The URL is still accessible in iOS by tapping the URL bar, or in the Canary experiment by clicking the origin chip or hitting ⌘-L. Well-designed URLs are more aesthetically pleasing to share, so the requirement for meaningful URLs doesn't go away.

To the average user, the URL is noise. It's a mix of protocol, origin, and path. It's a terminal command, echoing it back to the user is weak UI. We should focus on the security of the URL, without harming shareability.
