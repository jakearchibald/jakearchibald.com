---
title: Iterators gonna iterate
date: 2014-12-01 00:49:18
mindframe: '- no this is not the start of an "advent calendar"'
summary: ES6 gives us a new way to iterate, and it's already supported in stable
  releases of Firefox, Chrome, & Opera. Here it is…
meta: ""

---

ES6 gives us a new way to iterate, and it's already supported in stable releases of Firefox, Chrome, & Opera. Here it is:

```js
for (var num of [1, 2, 3]) {
  console.log(num);
}
// Result: 1
// Result: 2
// Result: 3
```

Unlike `for (part in thing)` which iterates through property names of an object in a generic way, `for (part of thing)` lets the object decide which *values* it gives up on each iteration.

# Let's pull its guts out

Pop the array on the ol' operating table there, and prepare it for surgery. How does it work? Well…

```js
var numbers = [1, 2, 3];
numbers[Symbol.iterator];
// Result: function ArrayValues() { [native code] }
```

The ES6 spec defines non-string 'symbol' property names of objects to describe particular behaviours. `Symbol.iterator` is one of them, it describes how iteration works.

```js
var numbersIterator = numbers[Symbol.iterator]();
numbersIterator.next();
// Result: Object {value: 1, done: false}
numbersIterator.next();
// Result: Object {value: 2, done: false}
numbersIterator.next();
// Result: Object {value: 3, done: false}
numbersIterator.next();
// Result: Object {value: undefined, done: true}
```

The above is what `for (var num of numbers)` is doing under the hood.

When we call `numbers[Symbol.iterator]` we get an object back with a `.next` method. Calling `.next` gives us an object containing the value, or an indication there are no further values.

# Let's make our own

Let's make an object that iterates over words in a string (in an overly-simple way). Firstly the constructor:

```js
function Words(str) {
  this._str = str;
}
```

Then the iterator-factory:

```js
Words.prototype[Symbol.iterator] = function() {
  var re = /\S+/g;
  var str = this._str;
  
  return {
    next: function() {
      var match = re.exec(str);
      if (match) {
        return {value: match[0], done: false};
      }
      return {value: undefined, done: true};
    }
  }
};
```

We're returning an object with a `next` method, which returns `{value: nextWordInTheString, done: false}` until there are none left.

And it works!

```js
var helloWorld = new Words("Hello world");

for (var word of helloWorld) {
  console.log(word);
}
// Result: "Hello"
// Result: "world"
```

Well, actually, it doesn't work in Firefox, because Firefox doesn't support the `Symbol` object yet, it uses the non-standard `@@iterator` form. You can make it work in Firefox using:

```js
Words.prototype[self.Symbol ? Symbol.iterator : "@@iterator"] = func;
```

**Edit:** `Symbol` is supported in Firefox 36, which should reach stable in <time datetime="2015-02">February 2015</time>.

# Generators

[Generators](http://davidwalsh.name/es6-generators), which are defined using `function*`, are a more convenient way of creating iterator factories.

From a generator you `yield` the values you want to provide, and it takes care of the `value`/`done` object for you:

```js
function* someNumbers() {
  yield 1;
  yield 2;
  yield 3;
}

var iter = someNumbers();
iter.next();
// Result: Object {value: 1, done: false}
iter.next();
// Result: Object {value: 2, done: false}
iter.next();
// Result: Object {value: 3, done: false}
iter.next();
// Result: Object {value: undefined, done: true}

// or just:
for (var num of someNumbers()) {
  console.log(num);
}
// Result: 1
// Result: 2
// Result: 3
```

Although the for-of loop above looks intuitive, it only works through a bit of trickery. For-of calls the object's `Symbol.iterator` method to get an iterator, but we're giving for-of `someNumbers()` which is already an iterator. To work around this, iterators returned by generators have a `Symbol.iterator` method that returns itself, meaning `iter[Symbol.iterator]() === iter`. It's a bit odd, but it makes the code above work as expected.

Generators are usually an easier way to describe iteration. For our `Words` example, it's much simpler:

```js
Words.prototype[Symbol.iterator] = function*() {
  var re = /\S+/g;
  var str = this._str;
  var match;
  while (match = re.exec(str)) {
    yield match[0];
  }
};
```

# What's the use?

Not only does this provide a way to allow iteration to be defined on an object-by-object basis, it's also…

## Lazy

You don't need to calculate all the values ahead of time, you can provide them as needed. The `Words` example does this, we don't seek out the next word until `.next` is called.

This means…

## Iterators can be infinite

No no, nono no no, nono no no, no no there's no limit:

```js
function* powersOf2() {
  var i = 2;
  yield i;
  while (true) yield i *= i;
}

for (var i of powersOf2()) {
  console.log(i);
  if (i > 10000) break;
}
```

…but make sure you break at some point if you're looping over them.

## NodeList iteration

We've wanted to make `NodeList` array-like for ages, but it's been a [compatibility problem](https://bugs.webkit.org/show_bug.cgi?id=81573). However, we don't have this problem with iterators:

```js
for (var node of document.querySelectorAll('a')) {
  console.log(node);
}
```

*\*ahem\** except Chrome & Opera don't support the above yet. Thankfully, you can polyfill it pretty easily:

```js
NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
```

## String iteration

`String` also has an iterator. This may not sound spectacular, but [as Mathias Bynens points out](https://mathiasbynens.be/notes/javascript-unicode#iterating-over-symbols) iterating over the symbols of a string is a real pain in ES5 due to unicode issues. String's iterator makes it easy:

```js
for (var symbol of string) {
  console.log(symbol);
}
```

## Tasty tasty sugar

You can convert iterable objects to arrays using `[...iterable]`.

```js
[...new Words("Hello world")]
// Result: Array [ "Hello", "world" ]
```

…unfortunately Firefox is the only browser with that feature in stable.

# Browser support

[Browser support](http://kangax.github.io/compat-table/es6/#generators) for these features is pretty good. It's in stable versions of Chrome, Opera, & Firefox, and development editions of IE. That means you can use it today if you're in some kind of context that only runs in modern browsers \**ahem*\* ServiceWorker \**ahem*\*.

For use in other browsers, you can use a transpiler such as [Traceur](https://github.com/google/traceur-compiler).

# Further reading

* [ES7 async functions](/2014/es7-async-functions/) - using generators to manage async code, and the evolution of that in ES7
* [An in-depth guide to generators](http://davidwalsh.name/es6-generators)