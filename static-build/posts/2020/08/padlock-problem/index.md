---
title: A padlock problem
date: 2020-08-07 01:00:00
summary: There's a difference between what 🔒 means to users vs browsers.
meta: There's a difference between what 🔒 means to users vs browsers.
image: asset-url:./cert.png
---

There's a difference between what the browser 🔒 means to users, vs what it means to browsers. To users, it means "the page is secure", but to the browser:

<figure class="full-figure">
<img src="asset-url:./cert.png" alt="">
<figcaption>The certificate dialog in Chrome</figcaption>
</figure>

…it means the "connection" is secure.

This is because the security check happens as part of setting up the connection, before any HTTP communication happens. Then, many HTTP responses can be received through that connection.

# What's the problem?

Things get tricky when the browser displays content without needing a connection at all. This can happen when content comes from the HTTP cache, or a service worker.

# Soooo what do browsers do?

Firefox and Chrome cache the service worker's certificate. When you visit a page served by a service worker, they show a 🔒, and if you click on it, you get details about that cached certificate.

Safari on the other hand doesn't display a 🔒. It doesn't say the page is "not secure", but it doesn't explicitly say it's secure either. However, Safari is moving to the same model as Firefox and Chrome.

When it comes to the HTTP cache, all browsers behave the same. Responses are cached along with their certificate, and the 🔒 is displayed using information from that cached certificate.

# Is that a problem?

Neither model is perfect. It seems weird to say the "connection is secure" when there's no connection. Also, you might end up seeing certificate information that has since expired. You might say that cached content should expire when the 'associated' certificate expires, but it isn't that simple. What if some JavaScript writes information to IndexedDB, then the certificate 'associated' with the JavaScript expires, or is even revoked? Should IndexedDB also be cleared? No, we already have a per-resource expiration mechanism for the HTTP cache via `Cache-Control`, and we already have [clear-site-data](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Clear-Site-Data) to use as a panic button. The certificate is only used to verify data as it crosses from the internet to the user's local machine.

The current Safari model doesn't make a claim about the connection, since it doesn't exist, which makes sense. But the absence of the 🔒 might be a red flag to users that are trained to spot it as a signal of safety.

I'm not sure what the right answer is. Maybe we should show the 🔒, but when it's clicked we could say something along the lines of "this content was served securely without a connection". It's a tricky problem.
