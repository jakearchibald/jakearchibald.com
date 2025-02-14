---
title: Firefox + custom elements + iframes bug
date: 2025-02-14 01:00:00
summary: A tricksy Firefox bug and how to work around it.
meta: A tricksy Firefox bug and how to work around it.
---

Over at Shopify we've been building a bunch of web components to use internally and in third party contexts. All of a sudden, we found some strange errors in our logs, all from Firefox. This is the post I wish existed when we discovered it.

# The bug

The bug happens when a custom element (or web component) is moved to a document from another JavaScript Realm _[spooky noises]_. A Realm is a separate JavaScript context with its own global, own implementation of `Array` etc etc. An iframe or popup window provides a document in a new JavaScript Realm.

The result of the bug is that the element's custom prototype is lost, and things like instance methods disappear.

Ok ok, sorry, I'm trying to hit all the terms that people might search for to find a fix for this issue. Anyway, here's a simple custom element:

```js
class MyElement extends HTMLElement {
  say(message) {
    console.log(message);
  }
  connectedCallback() {
    this.say('hello!');
  }
  disconnectedCallback() {
    this.say('goodbye!');
  }
}

customElements.define('my-element', MyElement);
```

And I'm going to create an instance of the element, and put it in an iframe:

```js
// Create the iframe
const iframe = document.createElement('iframe');
document.body.append(iframe);

// Create the element, and put it in the iframe
const myElement = document.createElement('my-element');
iframe.contentDocument.body.append(myElement);
```

This fails in Firefox with "`this.say` is not a function", within `connectedCallback`. In fact, Firefox has lost all of the instance methods of the custom element. It's 'downgraded' to an instance of `HTMLElement` in the iframe Realm, rather than `MyElement`.

It's kinda funny, because the error happens within `connectedCallback`, which is an instance method, but even _that_ instance method has gone. I assume the calling of `connectedCallback` was queued up before the prototype was lost.

If I put the element in the main document before moving it to the iframe, it fails in `disconnectedCallback` for the same reason.

Unfortunately this has been [a known issue for 6 years](https://bugzilla.mozilla.org/show_bug.cgi?id=1502814).

# The fix

The fix is kinda simple. Just… put the prototype back. As in, make it an instance of `MyElement` again.

```js
class CustomElementBase extends HTMLElement {
  // This is called when the element is moved to a new document.
  // This is where we solve the bug if the element is moved to an iframe
  // without first being put into the main document.
  adoptedCallback() {
    rescueElementPrototype(this);
  }

  // This is called when the element is disconnected from a document.
  // This happens whenever the element is moved around the DOM,
  // but it also happens when the element is moved to a new document.
  // This happens before adoptedCallback,
  // so we need to fix it here,
  // to avoid the bug in subclass disconnectedCallback calls.
  disconnectedCallback() {
    rescueElementPrototype(this);
  }
}

function rescueElementPrototype(element) {
  // Return if everything looks as expected.
  if (element instanceof CustomElementBase) return;

  // Otherwise, get the intended constructor…
  const constructor = customElements.get(element.tagName.toLowerCase());

  // …and set the prototype.
  Object.setPrototypeOf(element, constructor.prototype);
}
```

Thanks to my colleague [Anthony Frehner](https://github.com/frehner) who realised `customElements.get` is a simple way to get the original constructor back, rather than the mad `WeakMap` hack I was using.

Now, make sure your custom elements extend this base class, and ensure you call `super` methods:

```js
class MyElement extends CustomElementBase {
  say(message) {
    console.log(message);
  }
  connectedCallback() {
    super.connectedCallback?.();
    this.say('hello!');
  }
  disconnectedCallback() {
    super.disconnectedCallback?.();
    this.say('goodbye!');
  }
}
```

And that's it! The bug is undone, and everything works as expected.
