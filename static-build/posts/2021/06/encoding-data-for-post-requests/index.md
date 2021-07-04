---
title: Encoding data for POST requests
date: 2021-06-30 01:00:00
summary: Don't do it like GitHub Copilot!
meta: Don't do it like GitHub Copilot!
image: 'asset-url:./img.png'
---

Right now, when you go to [copilot.github.com](https://copilot.github.com/) you're greeted with this example:

```js
async function isPositive(text) {
  const response = await fetch(`http://text-processing.com/api/sentiment/`, {
    method: 'POST',
    body: `text=${text}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  const json = await response.json();
  return json.label === 'pos';
}
```

This is **bad** and might result in **security issues**. Here's where things go wrong: `` body: `text=${text}` ``. Unescaped text is added into a format with defined encoding. It's similar to SQL/HTML injection, as something intended as a 'value' gets to interact with the format directly.

I'm going to dig into the right way, but also take a stroll around some related, lesser-known APIs:

# URLSearchParams

`URLSearchParams` handles encoding and decoding `application/x-www-form-urlencoded` data. It's pretty handy, because, well…

<blockquote class="quote"><p>The <code>application/x-www-form-urlencoded</code> format is in many ways an aberrant monstrosity, the result of many years of implementation accidents and compromises leading to a set of requirements necessary for interoperability, but in no way representing good design practices. In particular, readers are cautioned to pay close attention to the twisted details involving repeated (and in some cases nested) conversions between character encodings and byte sequences. Unfortunately the format is in widespread use due to the prevalence of HTML forms.</p>— <a href="https://url.spec.whatwg.org/#application/x-www-form-urlencoded">The URL standard</a></blockquote>

…so yeah, it's a bad idea to try and encode/decode it yourself. Here's how it works:

```js
const searchParams = new URLSearchParams();
searchParams.set('foo', 'bar');
searchParams.set('hello', 'world');

// Logs 'foo=bar&hello=world'
console.log(searchParams.toString());
```

The constructor also accepts an array of name/value pairs, or an iterator that yields name/value pairs:

```js
const searchParams = new URLSearchParams([
  ['foo', 'bar'],
  ['hello', 'world'],
]);

// Logs 'foo=bar&hello=world'
console.log(searchParams.toString());
```

An object:

```js
const searchParams = new URLSearchParams({
  foo: 'bar',
  hello: 'world',
});

// Logs 'foo=bar&hello=world'
console.log(searchParams.toString());
```

Or a string:

```js
const searchParams = new URLSearchParams('foo=bar&hello=world');

// Logs 'foo=bar&hello=world'
console.log(searchParams.toString());
```

## Reading URLSearchParams

There are multiple methods to read and mutate `URLSearchParams`, which are [documented on MDN](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams), but if you want to handle all the data then its iterator comes in handy:

```js
for (const [key, value] of searchParams) {
  console.log(key, value);
}
```

Which means you can easily convert it into an array of name/value pairs:

```js
// To [['foo', 'bar'], ['hello', 'world']]
const keyValuePairs = [...searchParams];
```

Or use it with APIs that support iterators that yield name/value pairs, such as `Object.fromEntries`, which converts it into an object:

```js
// To { foo: 'bar', hello: 'world' }
const data = Object.fromEntries(searchParams);
```

But, be aware that converting to an object is sometimes a lossy conversion:

```js
const searchParams = new URLSearchParams([
  ['foo', 'bar'],
  ['foo', 'hello'],
]);

// Logs "foo=bar&foo=hello"
console.log(searchParams.toString());

// To { foo: 'hello' }
const data = Object.fromEntries(searchParams);
```

## url.searchParams

URL objects have a `searchParams` property which is really handy:

```js
const url = new URL('https://jakearchibald.com/?foo=bar&hello=world');

// Logs 'world'
console.log(url.searchParams.get('hello'));
```

Unfortunately, `location.searchParams` is undefined. This is because the definition for `window.location` is complicated by how certain properties of it work across origins. For instance _setting_ `otherWindow.location.href` works across origins, but _getting_ it isn't allowed. Anyway, to work around it:

```js
// Boo, undefined
location.searchParams;

const url = new URL(location.href);
// Yay, defined!
url.searchParams;

// Or:
const searchParams = new URLSearchParams(location.search);
```

## URLSearchParams as a Fetch body

Ok, now we're getting to the point. The code in the example at the start of the article is broken as it isn't escaping the input:

```js
const value = 'hello&world';
const badEncoding = `text=${value}`;

// 😬 Logs [['text', 'hello'], ['world', '']]
console.log([...new URLSearchParams(badEncoding)]);

const correctEncoding = new URLSearchParams({ text: value });

// Logs 'text=hello%26world'
console.log(correctEncoding.toString());
```

To make things easier, `URLSearchParams` can be used directly as a `Request` or `Response` body, so the 'correct' version of the code from the start of the article is:

```js
async function isPositive(text) {
  const response = await fetch(`http://text-processing.com/api/sentiment/`, {
    method: 'POST',
    body: new URLSearchParams({ text }),
  });
  const json = await response.json();
  return json.label === 'pos';
}
```

If you use `URLSearchParams` as a body, the `Content-Type` header is automatically set to `application/x-www-form-urlencoded`, which is great because even after 20+ years of being a web developer, I can never remember that content type. You can still provide your own `Content-Type` header to override the default.

You can't read a `Request` or `Response` body as `URLSearchParams`, but there are ways around that…

# FormData

`FormData` objects can represent the name/value state of an HTML form. This means the values can be files, as they can with `<input type="file">`.

You can populate `FormData` state directly:

```js
const formData = new FormData();
formData.set('foo', 'bar');
formData.set('hello', 'world');
```

It's also an iterator, so it can be converted to an array of name/value pairs, or an object, just as you can with `URLSearchParams`. But, unlike `URLSearchParams`, you can read an HTML form directly as `FormData`:

```js
const formElement = document.querySelector('form');
const formData = new FormData(formElement);
console.log(formData.get('username'));
```

This gives you the data that would be submitted by the form. I often find this much easier than getting the data from each element individually.

## FormData as a Fetch body

Similar to `URLSearchParams`, you can use `FormData` directly as a fetch body:

```js
const formData = new FormData();
formData.set('foo', 'bar');
formData.set('hello', 'world');

fetch(url, {
  method: 'POST',
  body: formData,
});
```

This automatically sets the `Content-Type` header to `multipart/form-data`, and sends the data in that format:

```js
const formData = new FormData();
formData.set('foo', 'bar');
formData.set('hello', 'world');

const request = new Request('', { method: 'POST', body: formData });
console.log(await request.text());
```

…which logs something like:

```
------WebKitFormBoundaryUekOXqmLphEavsu5
Content-Disposition: form-data; name="foo"

bar
------WebKitFormBoundaryUekOXqmLphEavsu5
Content-Disposition: form-data; name="hello"

world
------WebKitFormBoundaryUekOXqmLphEavsu5--
```

That's what `multipart/form-data` looks like. It's more complex than `application/x-www-form-urlencoded`, but it can include file data. However, some servers can't handle `multipart/form-data`, including [Express](https://expressjs.com/). If you want to support `multipart/form-data` in Express, you need to use something like [busboy](https://www.npmjs.com/package/busboy) or [formidable](https://www.npmjs.com/package/formidable).

But what if you want to send a form as `application/x-www-form-urlencoded`? Well…

## Converting to URLSearchParams

Since the `URLSearchParams` constructor accepts an iterator that yields name/value pairs, and `FormData`'s iterator does exactly that, you can convert from one to the other:

```js
const formElement = document.querySelector('form');
const formData = new FormData(formElement);
const searchParams = new URLSearchParams(formData);

fetch(url, {
  method: 'POST',
  body: searchParams,
});
```

However, this conversion will throw if the form data contains a file. `application/x-www-form-urlencoded` cannot represent file data, so neither can `URLSearchParams`.

## Reading Fetch bodies as FormData

You can also read a `Request` or `Response` object as `FormData`:

```js
const formData = await request.formData();
```

This works if the request/response body is `multipart/form-data` or `application/x-www-form-urlencoded`. It's particularly useful for handling form submissions in a service worker.

# Other Fetch bodies

There are a few other formats that can be fetch bodies:

## Blobs

`Blob` objects (and therefore `File` since it inherits from `Blob`) can be fetch bodies:

```js
fetch(url, {
  method: 'POST',
  body: blob,
});
```

This automatically sets the `Content-Type` to the value of `blob.type`.

## Strings

```js
fetch(url, {
  method: 'POST',
  body: JSON.stringify({ hello: 'world' }),
  headers: { 'Content-Type': 'application/json' },
});
```

This automatically sets the `Content-Type` to `text/plain;charset=UTF-8`, but as always it can be overridden, as I've done above.

## Buffers

`ArrayBuffer` objects, and anything backed by an array buffer such as `Uint8Array`, can be used as a fetch body:

```js
fetch(url, {
  method: 'POST',
  body: new Uint8Array([
    // …
  ]),
  headers: { 'Content-Type': 'image/png' },
});
```

This doesn't set the `Content-Type` header automatically, so you need to do that yourself.

## Streams

And finally, fetch bodies can be streams! For `Response` objects, this allows [all kinds of fun with a service worker](/2016/streams-ftw/), and more recently they [can be used with requests too](https://web.dev/fetch-upload-streaming/).

So yeah, don't try to handle `multipart/form-data` or `application/x-www-form-urlencoded` yourself, let `FormData` and `URLSearchParams` do the hard work!

I'm not against things like GitHub Copilot either. Just treat the output like an answer on StackOverflow, and review it before committing it.

# Bonus round: Converting FormData to JSON

[Nicholas Mendez tweeted me](https://twitter.com/snickdx/status/1410423939604561930) to ask how `FormData` could be serialised as JSON without data loss.

Forms can contain fields like this:

```html
<select multiple name="tvShows">
  <option>Motherland</option>
  <option>Taskmaster</option>
  …
</select>
```

…where multiple values can be selected, or you can have multiple inputs with the same name:

```html
<fieldset>
  <legend>TV Shows</legend>
  <label>
    <input type="checkbox" name="tvShows" value="Motherland" />
    Motherland
  </label>
  <label>
    <input type="checkbox" name="tvShows" value="Taskmaster" />
    Taskmaster
  </label>
  …
</fieldset>
```

The result is a `FormData` object that has multiple entries with the same name, like this:

```js
const formData = new FormData();
formData.append('foo', 'bar');
formData.append('tvShows', 'Motherland');
formData.append('tvShows', 'Taskmaster');
```

And as we saw with `URLSearchParams`, some object conversions are lossy:

```js
// { foo: 'bar', tvShows: 'Taskmaster' }
const data = Object.fromEntries(formData);
```

There are a few ways to avoid data loss and still end up with something JSON-stringifyable. Firstly, there's the array of name/value pairs:

```js
// [['foo', 'bar'], ['tvShows', 'Motherland'], ['tvShows', 'Taskmaster']]
const data = [...formData];
```

But if you want an object rather than an array, you can do this:

```js
const data = Object.fromEntries(
  // Get a de-duped set of keys
  [...new Set(formData.keys())]
    // Map to [key, arrayOfValues]
    .map((key) => [key, formData.getAll(key)]),
);
```

…which gives you:

```json
{
  "foo": ["bar"],
  "tvShows": ["Motherland", "Taskmaster"]
}
```

I like that every value is an array, even if it only has one item. That prevents a lot of code branching on the server, and simplifies validation. Although, you might prefer the PHP/Perl convention where a field name that ends with `[]` signifies "this should produce an array":

```html
<select multiple name="tvShows[]">
  …
</select>
```

And to convert it:

```js
const data = Object.fromEntries(
  // Get a de-duped set of keys
  [...new Set(formData.keys())].map((key) =>
    key.endsWith('[]')
      ? // Remove [] from the end and get an array of values
        [key.slice(0, -2), formData.getAll(key)]
      : // Use the key as-is and get a single value
        [key, formData.get(key)],
  ),
);
```

…which gives you:

```json
{
  "foo": "bar",
  "tvShows": ["Motherland", "Taskmaster"]
}
```

Remember, don't try to convert a form to JSON if the form contains files. If that's the case, you're much better off with `multipart/form-data`.
