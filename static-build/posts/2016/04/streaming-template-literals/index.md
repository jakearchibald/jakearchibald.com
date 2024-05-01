---
title: Streaming template literals
date: 2016-04-07 03:03:44
summary: "Template literals are pretty cool right?\r

  \r

  ```js\r

  const areThey = 'Yes';\r

  console.log(`${areThey}, they are`); \r

  // Logs: Yes, they are\r

  ```\r

  \r

  But what if they could produce a stream?"
mindframe: ''
image: null
meta: Building streams from multiple sources using JavaScript template literals
---

Template literals are pretty cool right?

```js
const areThey = 'Yes';
console.log(`${areThey}, they are`);
// Logs: Yes, they are
```

You can also assign a function to process the template, known as ["tagged" templates](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Tagged_template_literals):

```js
function strongValues(strings, ...values) {
  return strings.reduce((totalStr, str, i) => {
    totalStr += str;
    if (i in values) totalStr += `<strong>${values[i]}</strong>`;
    return totalStr;
  }, '');
}

const areThey = 'Yes';
console.log(strongValues`${areThey}, they are`);
// Logs: <strong>Yes</strong>, they are
```

The syntax for tagging a template seems really un-JavaScripty to me, and I haven't been able to figure out why `strings` is an array yet each of the `values` is a separate argument, but meh, it's a cool feature. You don't even have to return a string:

```js
function daftTag() {
  return [1, 2, 3];
}

console.log(daftTag`WHY ARE YOU IGNORING ME?`);
// Logs: [1, 2, 3]
```

# "But how can we involve streams in this?" I hear me cry

Generating streams in a service worker allows you to [serve a mixture of cached & network content](/2016/streams-ftw/#creating-one-stream-from-multiple-sources-to-supercharge-page-render-times) in a single response. This is amazing for performance, but manually combining the streams feels a bit, well, manual.

Say we wanted to output:

```html
<h1>Title</h1>
…content…
```

…where the title and content come from different sources. That would look like this:

```js
const stream = new ReadableStream({
  start(controller) {
    const encoder = new TextEncoder();
    // Promise for the title
    const titlePromise = fetch('/get-metadata')
      .then((r) => r.json())
      .then((data) => data.title);
    // Promise for the content stream
    const contentPromise = fetch('/get-content').then((r) => r.body);

    // Tie them all together
    pushString('<h1>');
    titlePromise
      .then(pushString)
      .then(() => pushString('</h1>\n'))
      .then(() => contentPromise)
      .then(pushStream)
      .then(() => controller.close());

    // Helper functions
    function pushString(str) {
      controller.enqueue(encoder.encode(str));
    }

    function pushStream(stream) {
      // Get a lock on the stream
      var reader = stream.getReader();

      return reader.read().then(function process(result) {
        if (result.done) return;
        // Push the value to the combined stream
        controller.enqueue(result.value);
        // Read more & process
        return reader.read().then(process);
      });
    }
  },
});
```

Ew. Imagine we could just do this:

```js
// Promise for the title
const title = fetch('/get-metadata')
  .then((r) => r.json())
  .then((data) => data.title);
// Promise for the content stream
const content = fetch('/get-content').then((r) => r.body);

const stream = templateStream`
  <h1>${title}</h1>
  ${content}
`;
```

Well, you can!

[**View demo**](https://jakearchibald.github.io/isserviceworkerready/demos/template-stream/) Note: You'll need Chrome Canary with `chrome://flags/#enable-experimental-web-platform-features` enabled.

This means the title can be displayed as soon as it arrives, without waiting for the main content. The main content stream is piped, meaning it can render as it downloads. The implementation of `templateStream` is [pretty light](https://github.com/jakearchibald/isserviceworkerready/blob/1cbc3dd7e36b25aa31b1268fd529d8136241953c/src/demos/template-stream/sw.js#L41) too, making it a cheap and easy way of building streams from multiple sources.

If you're wanting something with a few more features (eg conditionals & iteration), [DustJS](http://www.dustjs.com/) is the only template engine I'm aware of that supports this, but I'm not a fan of the syntax. Hopefully we'll see other template engines such as [handlebars](http://handlebarsjs.com/) adopt a similar model, although it's [not something they're interested in right now](https://github.com/wycats/handlebars.js/issues/1150).
