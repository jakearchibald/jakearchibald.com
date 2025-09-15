---
title: Fetch streams are great, but not for measuring upload/downloading progress
date: 2025-09-15 01:00:00
summary: They're inaccurate, and there are better ways.
meta: They're inaccurate, and there are better ways.
image: './img.png'
---

Part of my role at Mozilla is making sure we're focusing on the right features, and we got onto the topic of fetch upload streams. It's something Chrome has supported for a while, but it isn't yet supported in either Firefox or Safari.

I asked folks on [various](https://bsky.app/profile/jakearchibald.com/post/3lxws4wvgns27) [social](https://mastodon.social/@jaffathecake/115140724791632506) [platforms](https://x.com/jaffathecake/status/1963240536891895973) what they thought of the feature, and what they'd use it for. The most common answer by far was "to measure upload progress", but… using it for that will give inaccurate results, and may even lead to bad implementations in browsers.

Let's dig in…

# Response streams

Streaming responses have been available in all browsers for years now:

```js
const response = await fetch(url);
const reader = response.body.getReader();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  console.log(value);
}

console.log('Done!');
```

This lets you get the response chunk-by-chunk, so you can start processing it as you receive it.

This is even easier with async iterators:

```js
const response = await fetch(url);

for await (const chunk of response.body) {
  console.log(chunk);
}

console.log('Done!');
```

…but that isn't supported in Safari. I've [proposed it for interop 2026](https://github.com/web-platform-tests/interop/issues/1068).

The chunks are `Uint8Array`s, but you can [use `TextDecoder`](https://developer.mozilla.org/docs/Web/API/TextDecoderStream/TextDecoderStream) to get the chunks as text.

## But they're not ideal for measuring download progress

You could try to measure download progress like this:

```js
// THIS DOESN'T ALWAYS WORK!
const response = await fetch(url);
const contentLength = Number(response.headers.get('Content-Length')) || 0;
let downloaded = 0;

for await (const chunk of response.body) {
  downloaded += chunk.length;
  if (contentLength) {
    console.log(
      `Downloaded ${((downloaded / contentLength) * 100).toFixed(2)}%`,
    );
  }
}
```

The good part is that you're measuring the point at which you have the data, which is what matters when it comes to download. Let's say you were receiving three packages via mail – you're measuring the point each package arrives in your possession, which is fine.

However, this all falls down if the response has a `Content-Encoding`, because in that case the `Content-Length` represents the encoded size, but the chunks are _decoded_ chunks. This means your `downloaded` value is likely to exceed the `contentLength` value.

There's [a feature request for a way to get the raw body](https://github.com/whatwg/fetch/issues/1524), without decompressing.

# Request streams

Request streams are basically the same as response streams, but for uploads rather than downloads. Imagine a video uploading app that did some transcoding/processing of the video before uploading:

```js
// Get a video from disk, or from the camera
const videoStream = getVideoStreamSomehow();
// Process it in some way, e.g. editing or transcoding
const processedVideo = videoStream.pipeThrough(new SomeVideoProcessor());

// Upload the stream
await fetch(url, {
  method: 'POST',
  body: processedVideo,
  duplex: 'half',
  headers: {
    'Content-Type': 'video/mp4',
  },
});
```

In this model, the video processing can happen in parallel with the uploading. More traditional methods would require processing the whole video before the upload begins, which is potentially much slower.

## Restrictions

`duplex: 'half'` means that the request must complete before the response becomes available. This 'reserves' a future feature where browsers can support handling the request and response in parallel.

If you want to have a request and response in parallel, you can perform two fetches – one that streams request data, and another that streams response data.

Also, since the `Content-Length` of the request isn't known, the feature is restricted to transports that are already used to handling request data in chunks, which is HTTP/2 onwards.

## But they're bad for measuring upload progress

I'm not even going to show the code for this because it's too unreliable.

With _request_ streams, you end up measuring the point at which the data is taken from your stream. In terms of the postal metaphor, you're measuring the point each package is collected by the courier, which does not represent the delivery of those packages.

Fetch is the courier. It will take some chunks off your hands and start handling the network parts. Successfully sending those chunks will happen later, or maybe it will fail.

This is normal behaviour with streams, and it helps keep everything running as smoothly as possible in cases where parts of the pipe flow quicker than others. Each stream has a "high water mark", which is essentially an ideal amount to buffer.

## Using streams to measure upload progress could cause problems in future

If you try to use streams to measure upload progress, the results will be inaccurate, but it may also limit the quality of this feature in future.

Let's say browsers ship this, and do a fairly small amount of buffering. If folks use this for upload progress, it won't be right, but it might be close enough.

Then let's say a browser discovers that they can get better performance by buffering more within fetch. If large parts of the web are using this feature for upload progress, that browser faces two choices: Ship the change, which means these websites' upload progress measurements become even less accurate, or avoid shipping the general improvement. I don't want browsers to end up having to make a compromise here.

# How to measure upload progress

Upload and download progress is unfortunately a missing feature in fetch. If you want progress events _today_, the best way is to use XHR:

```js
const xhr = new XMLHttpRequest();

// Upload progress
xhr.upload.onprogress = (event) => {
  if (event.lengthComputable) {
    console.log(
      `Uploaded ${((event.loaded / event.total) * 100).toFixed(2)}%`,
    );
  }
};

// Download progress
xhr.onprogress = (event) => {
  if (event.lengthComputable) {
    console.log(
      `Downloaded ${((event.loaded / event.total) * 100).toFixed(2)}%`,
    );
  }
};

xhr.open('POST', url);
xhr.send(blobOrWhatever);
```

# But in future…

[Luke Warlow from Igalia](https://bsky.app/profile/lukewarlow.dev) is currently working on [an API for fetch](https://github.com/whatwg/fetch/pull/1843) to add progress events for both uploads and downloads.

The API might change before it lands, but right now it looks like this:

```js
const response = await fetch(url, {
  observer(requestObserver, responseObserver) {
    requestObserver.onprogress = (event) => {
      if (event.lengthComputable) {
        console.log(
          `Uploaded ${((event.loaded / event.total) * 100).toFixed(2)}%`,
        );
      }
    };

    responseObserver.onprogress = (event) => {
      if (event.lengthComputable) {
        console.log(
          `Downloaded ${((event.loaded / event.total) * 100).toFixed(2)}%`,
        );
      }
    };
  },
});
```

This should give us all the modern benefits of `fetch`, while plugging the progress feature gap!

If you're interested in using request streams for things other than progress events, there's [an Interop 2026 proposal for them](https://github.com/web-platform-tests/interop/issues/1072). We also want to gauge developer interest [via this survey](https://survey.alchemer.com/s3/8460326/Fetch-Request-Streaming), or via the interop GitHub thread.
