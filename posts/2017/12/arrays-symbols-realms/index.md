---
title: Arrays, symbols, and realms
date: 2017-12-11 16:50:55
mindframe: ""
summary: How `Array.isArray` works, and how we can use symbols to create our own
  type-matching functions.
meta: ""

---

On Twitter, Allen Wirfs-Brock asked folks [if they knew what `Array.isArray(obj)` did](https://twitter.com/awbjs/status/939240121269809152), and the results suggested… no they don't. For what it's worth, I also got the answer wrong.

# Type-checking arrays

```js
function foo(obj) {
  // …
}
```

Let's say we wanted to do something specific if `obj` is an array. `JSON.stringify` is an example of this, it outputs arrays differently to other objects.

We could do:

```js
if (obj.constructor == Array) // …
```

But that's false for things that extend arrays:

```js
class SpecialArray extends Array {}
const specialArray = new SpecialArray();
console.log(specialArray.constructor === Array); // false
console.log(specialArray.constructor === SpecialArray); // true
```

If you want to catch subclasses, there's `instanceof`:

```js
console.log(specialArray instanceof Array); // true
console.log(specialArray instanceof SpecialArray); // true
```

But things get more complicated when you introduce multiple realms:

## Multiple realms

A realm contains the JavaScript global object, which `self` refers to. So, it can be said that code running in a worker is in a different realm to code running in the page. The same is true between iframes, but same-origin iframes also share an ECMAScript 'agent', meaning objects can… (and please read the next bit in a 70s sci-fi voiceover) *travel across realms*.

Seriously, look:

```html
<iframe srcdoc="<script>var arr = [];</script>"></iframe>
<script>
  const iframe = document.querySelector('iframe');
  const arr = iframe.contentWindow.arr;
  console.log(arr.constructor === Array); // false
  console.log(arr.constructor instanceof Array); // false
</script>
```

Both of those are false because:

```js
console.log(Array === iframe.contentWindow.Array); // false
```

…the iframe has its own array constructor, which is different to the one in the parent page.

# Enter Array.isArray

```js
console.log(Array.isArray(arr)); // true
```

`Array.isArray` will return true for arrays, even if they were created in another realm. (You're still reading that in the 70s voice over right?) It'll also return true for subclasses of `Array`, from any realm. This is what `JSON.stringify` uses internally.

But, [as Allen revealed](https://twitter.com/awbjs/status/939607812094574594), that doesn't mean `arr` has array methods. Some, or even all of the methods would have been set to undefined, or the array could have had its entire prototype ripped out:

```js
const noProtoArray = [];
Object.setPrototypeOf(noProtoArray, null);
console.log(noProtoArray.map); // undefined
console.log(noProtoArray instanceof Array); // false
console.log(Array.isArray(noProtoArray)); // true
```

That's what I got wrong in [Allen's poll](https://twitter.com/awbjs/status/939240121269809152), I picked "it has Array methods", the least-picked answer. So, yeah, feeling pretty hipster right now.

Anyway, if you really want to defend against the above, you can apply array methods from the array prototype:

```js
if (Array.isArray(noProtoArray)) {
  const mappedArray = Array.prototype.map.call(noProtoArray, callback);
  // …
}
```

# Symbols and realms

Take a look at this:

```html
<iframe srcdoc="<script>var arr = [1, 2, 3];</script>"></iframe>
<script>
  const iframe = document.querySelector('iframe');
  const arr = iframe.contentWindow.arr;

  for (const item of arr) {
    console.log(item);
  }
</script>
```

The above logs 1, 2, 3. Pretty unspectacular, but for-of loops work by calling `arr[Symbol.iterator]`, and this is somehow working across realms. Here's how:

```js
const iframe = document.querySelector('iframe');
const iframeWindow = iframe.contentWindow;
console.log(Symbol === iframeWindow.Symbol); // false
console.log(Symbol.iterator === iframeWindow.Symbol.iterator); // true
```

While each realm has its own instance of `Symbol`, `Symbol.iterator` is the same across realms.

To steal [a line from Keith Cirkel](https://twitter.com/Keithamus/status/939788908417748992), symbols are simultaneously the most unique and least unique thing in JavaScript.

## The most unique

```js
const symbolOne = Symbol('foo');
const symbolTwo = Symbol('foo');
console.log(symbolOne === symbolTwo); // false
const obj = {};
obj[symbolOne] = 'hello';
console.log(obj[symbolTwo]); // undefined
console.log(obj[symbolOne]); // 'hello'
```

The string you pass to the `Symbol` function is just a description. The symbols are unique, even within the same realm.

## The least unique

```js
const symbolOne = Symbol.for('foo');
const symbolTwo = Symbol.for('foo');
console.log(symbolOne === symbolTwo); // true
const obj = {};
obj[symbolOne] = 'hello';
console.log(obj[symbolTwo]); // 'hello'
```

`Symbol.for(str)` creates a symbol that's as unique as the string you pass it. The interesting bit is it's the same across realms:

```js
const iframe = document.querySelector('iframe');
const iframeWindow = iframe.contentWindow;
console.log(Symbol.for('foo') === iframeWindow.Symbol.for('foo')); // true
```

And this is roughly how `Symbol.iterator` works.

# Creating our own 'is' function

What if we wanted to create our own 'is' function that worked across realms? Well, symbols allow us to do this:

```js
const typeSymbol = Symbol.for('whatever-type-symbol');

class Whatever {
  static isWhatever(obj) {
    return obj && Boolean(obj[typeSymbol]);
  }
  constructor() {
    this[typeSymbol] = true;
  }
}

const whatever = new Whatever();
Whatever.isWhatever(whatever); // true
```

This works, even if the instance is from another realm, even if it's a subclass, and even if it has its prototype removed.

The only slight issue, is you need to cross your fingers and hope your symbol name is unique across all the code. If someone else creates their own `Symbol.for('whatever-type-symbol')` and uses it to mean something else, `isWhatever` could return false positives.

# Further reading

* [Iterators](/2014/iterators-gonna-iterate/)
* [Async iterators](/2017/async-iterators-and-generators/)
* [Keith Cirkel's deep dive into symbols](https://www.keithcirkel.co.uk/metaprogramming-in-es6-symbols/)
