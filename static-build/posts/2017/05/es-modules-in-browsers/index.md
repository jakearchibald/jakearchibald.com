---
title: ECMAScript modules in browsers
date: 2017-05-02 14:29:25
summary: ES modules are starting to land in browsers! Modules in general are
  [pretty well documented](https://ponyfoo.com/articles/es6-modules-in-depth),
  but here are some browser-specific differences…
mindframe: ""
image: ""
meta: ES modules are landing in browsers! Here are the HTML-specific differences
  you need to be aware of.

---

ES modules are now available in browsers! They're in…

* Safari 10.1.
* Chrome 61.
* Firefox 60.
* Edge 16.

```html
<script type="module">
  import {addTextToBody} from './utils.mjs';

  addTextToBody('Modules are pretty cool.');
</script>
```

```js
// utils.mjs
export function addTextToBody(text) {
  const div = document.createElement('div');
  div.textContent = text;
  document.body.appendChild(div);
}
```

**[Live demo](https://cdn.rawgit.com/jakearchibald/a298d5af601982c338186cd355e624a8/raw/aaa2cbee9a5810d14b01ae965e52ecb9b2965a44/)**.

All you need is `type=module` on the script element, and the browser will treat the inline or external script as an ECMAScript module.

There are already some [great articles on modules](https://ponyfoo.com/articles/es6-modules-in-depth), but I wanted to share a few browser-specific things I'd learned while testing & reading the spec:

# "Bare" import specifiers aren't currently supported

```js
// Supported:
import {foo} from 'https://jakearchibald.com/utils/bar.mjs';
import {foo} from '/utils/bar.mjs';
import {foo} from './bar.mjs';
import {foo} from '../bar.mjs';

// Not supported:
import {foo} from 'bar.mjs';
import {foo} from 'utils/bar.mjs';
```

Valid module specifiers must match one of the following:

* A full non-relative URL. As in, it doesn't throw an error when put through `new URL(moduleSpecifier)`.
* Starts with `/`.
* Starts with `./`.
* Starts with `../`.

Other specifiers are reserved for future-use, such as importing built-in modules.

# nomodule for backwards compatibility

```html
<script type="module" src="module.mjs"></script>
<script nomodule src="fallback.js"></script>
```

**[Live demo](https://cdn.rawgit.com/jakearchibald/6110fb6df717ebca44c2e40814cc12af/raw/7fc79ed89199c2512a4579c9a3ba19f72c219bd8/)**.

Browsers that understand `type=module` should ignore scripts with a `nomodule` attribute. This means you can serve a module tree to module-supporting browsers while providing a fall-back to other browsers.

## Browser issues

* <del>Firefox doesn't support `nomodule` ([issue](https://bugzilla.mozilla.org/show_bug.cgi?id=1330900))</del>. Fixed in Firefox nightly!
* <del>Edge doesn't support `nomodule` ([issue](https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/10525830/))</del>. Fixed in Edge 16!
* <del>Safari 10.1 doesn't support `nomodule`</del>. Fixed in Safari 11! For 10.1, there's a [pretty smart workaround](https://gist.github.com/samthor/64b114e4a4f539915a95b91ffd340acc).

# Defer by default

```html
<!-- This script will execute after… -->
<script type="module" src="1.mjs"></script>

<!-- …this script… -->
<script src="2.js"></script>

<!-- …but before this script. -->
<script defer src="3.js"></script>
```

**[Live demo](https://cdn.rawgit.com/jakearchibald/d6808ea2665f8b3994380160dc2c0bc1/raw/c0a194aa70dda1339c960c6f05b2e16988ee66ac/)**. The order should be `2.js`, `1.mjs`, `3.js`.

The way scripts block the HTML parser during fetching is baaaad. With regular scripts you can use `defer` to prevent blocking, which also delays script execution until the document has finished parsing, and maintains execution order with other deferred scripts. Module scripts behave like `defer` by default – there's no way to make a module script block the HTML parser while it fetches.

Module scripts use the same execution queue as regular scripts using `defer`.

# Inline scripts are also deferred

```html
<!-- This script will execute after… -->
<script type="module">
  addTextToBody("Inline module executed");
</script>

<!-- …this script… -->
<script src="1.js"></script>

<!-- …and this script… -->
<script defer>
  addTextToBody("Inline script executed");
</script>

<!-- …but before this script. -->
<script defer src="2.js"></script>
```

**[Live demo](https://cdn.rawgit.com/jakearchibald/7026f72c0675898196f7669699e3231e/raw/fc7521aabd9485f30dbd5189b407313cd350cf2b/)**. The order should be `1.js`, inline script, inline module, `2.js`.

Regular inline scripts ignore `defer` whereas inline module scripts are always deferred, whether they import anything or not.

# Async works on external & inline modules

```html
<!-- This executes as soon as its imports have fetched -->
<script async type="module">
  import {addTextToBody} from './utils.mjs';

  addTextToBody('Inline module executed.');
</script>

<!-- This executes as soon as it & its imports have fetched -->
<script async type="module" src="1.mjs"></script>
```

**[Live demo](https://module-script-tests-sreyfhwvpq.now.sh/async)**. The fast-downloading scripts should execute before the slow ones.

As with regular scripts, `async` causes the script to download without blocking the HTML parser and executes as soon as possible. Unlike regular scripts, `async` also works on inline modules.

As always with `async`, scripts may not execute in the order they appear in the DOM.

## Browser issues

* <del>Firefox doesn't support `async` on inline module scripts ([issue](https://bugzilla.mozilla.org/show_bug.cgi?id=1361369)).</del> Fixed in Firefox 59!

# Modules only execute once

```html
<!-- 1.mjs only executes once -->
<script type="module" src="1.mjs"></script>
<script type="module" src="1.mjs"></script>
<script type="module">
  import "./1.mjs";
</script>

<!-- Whereas classic scripts execute multiple times -->
<script src="2.js"></script>
<script src="2.js"></script>
```

**[Live demo](https://cdn.rawgit.com/jakearchibald/f7f6d37ef1b4d8a4f908f3e80d50f4fe/raw/1fcedde007a2b90049a7ea438781aebe69e22762/)**.

If you understand ES modules, you'll know you can import them multiple times but they'll only execute once. Well, the same applies to script modules in HTML – a module script of a particular URL will only execute once per page.

## Browser issues

* <del>Edge executes modules multiple times ([issue](https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/11865922/))</del>. Fixed in Edge 17!

# Always CORS

```html
<!-- This will not execute, as it fails a CORS check -->
<script type="module" src="https://….now.sh/no-cors"></script>

<!-- This will not execute, as one of its imports fails a CORS check -->
<script type="module">
  import 'https://….now.sh/no-cors';

  addTextToBody("This will not execute.");
</script>

<!-- This will execute as it passes CORS checks -->
<script type="module" src="https://….now.sh/cors"></script>
```

**[Live demo](https://cdn.rawgit.com/jakearchibald/2b8d4bc7624ca6a2c7f3c35f6e17fe2d/raw/fe04e60b0b7021f261e79b8ef28b0ccd132c1585/)**.

Unlike regular scripts, module scripts (and their imports) are fetched with CORS. This means cross-origin module scripts must return valid CORS headers such as `Access-Control-Allow-Origin: *`.

## Browser issues

* <del>Firefox fails to load the demo page ([issue](https://bugzilla.mozilla.org/show_bug.cgi?id=1361373))</del>. Fixed in Firefox 59!
* <del>Edge loads module scripts without CORS headers ([issue](https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/11865934/))</del>. Fixed in Edge 16!

# Credentials by default

**[Live demo](https://module-script-tests-sreyfhwvpq.now.sh/cookie-page)**.

Most CORS-based APIs will send credentials (cookies etc) if the request is to the same origin, but for a while `fetch()` and module scripts were exceptions. However, that all changed, and now `fetch()` and module scripts behave the same as other CORS-based APIs.

However, that means you'll encounter *three exciting varieties* of browser support:

* Old versions of browsers that, against the spec at the time, sent credentials by to same-origin URLs by default.
* Browsers that followed the spec at the time, and did not send credentials to same-origin URLs by default.
* New browsers that follow the new spec, and send credentials to same-origin URLs by default.

If you hit this issue, you can add the `crossorigin` attribute, which will add credentials to same-origin requests, but not cross-origin request, in any browser that follows the old spec. It doesn't do anything if the browser follows the new spec, so it's safe to use.

```html
<!-- Fetched with credentials (cookies etc) -->
<script src="1.js"></script>

<!-- Fetched with credentials, except in old browsers that follow the old spec -->
<script type="module" src="1.mjs"></script>

<!-- Fetched with credentials, in browsers that follow the old & new spec -->
<script type="module" crossorigin src="1.mjs"></script>

<!-- Fetched without credentials -->
<script type="module" crossorigin src="https://other-origin/1.mjs"></script>

<!-- Fetched with credentials-->
<script type="module" crossorigin="use-credentials" src="https://other-origin/1.mjs"></script>
```

# Mime-types

Unlike regular scripts, modules scripts must be served with one of the [valid JavaScript MIME types](https://html.spec.whatwg.org/multipage/scripting.html#javascript-mime-type) else they won't execute. The HTML Standard recommends `text/javascript`.

**[Live demo](https://module-script-tests-sreyfhwvpq.now.sh/mime)**.

## Browser issues

* Edge executes scripts with invalid MIME types ([issue](https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/11865977/)).

And that's what I've learned so far. Needless to say I'm really excited about ES modules landing in browsers!

# Performance recommendations, dynamic import & more!

Check out the [article on Web Fundamentals](https://developers.google.com/web/fundamentals/primers/modules#other-features) for a deep-dive into module usage.