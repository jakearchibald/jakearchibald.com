---
title: Video with alpha transparency on the web
date: 2024-08-05 01:00:00
summary: It's better to do it yourself.
meta: It's better to do it yourself.
scripts:
  - src: 'client/demos/2024/video-with-transparency'
image: './img.png'
---

I've been helping some teams at Shopify improve page load performance, and the issue of 'videos with an alpha channel' kept coming up, where videos of UI mocks needed to be composited on top of inconsistent backgrounds, such as larger CSS backgrounds.

Often a good solution here is to create the animation using web technologies, but sometimes video is a better solution for consistent frame rates, and allows for effects like motion blur which don't currently exist on the web.

<style>
  .checkd {
    background: #0000004a url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2 2"><path d="M1 2V0h1v1H0v1z" fill-opacity=".05"/></svg>');
    background-size: 20px 20px;
    background-attachment: fixed;
  }

  stacked-alpha-video {
    display: block;
    width: 100%;
  }

  stacked-alpha-video video {
    display: none;
  }
</style>

<figure class="full-figure max-figure checkd">
<stacked-alpha-video class="main-demo" style="aspect-ratio: 1597 / 833">
  <video autoplay crossorigin muted playsinline loop>
    <source
      src="asset-url:./video/split-av1.mp4"
      type="video/mp4; codecs=av01.0.08M.08.0.110.01.01.01.1"
    />
    <source src="asset-url:./video/split-hevc.mp4" type="video/mp4; codecs=hvc1.1.6.H120.b0" />
  </video>
</stacked-alpha-video>
<figcaption>A Shopify UI video with transparency (click to pause)</figcaption>
</figure>

<script>
  const mainDemo = document.querySelector('.main-demo');
  const mainDemoVideo = mainDemo.firstElementChild;

  mainDemo.onclick = () => {
    if (mainDemoVideo.paused) mainDemoVideo.play();
    else mainDemoVideo.pause();
  };
</script>

I didn't know much about it, so I dug in to try and find the most robust and efficient way to do it. I thought it was going to be a nice little I-can-do-this-while-jetlagged hackday project, but it's way more complicated than I thought. It turns out, the 'native' ways of doing it are inefficient and buggy. If you handle the transparency yourself, you avoid these bugs, and serve a file that's half the size, or less.

If you just want the solution, [here's `<stacked-alpha-video>`](https://www.npmjs.com/package/stacked-alpha-video), an NPM package to handle the playback of these videos.

Otherwise, here's what I discovered, and the many bugs I filed along the way.

# Native support for transparency in web-compatible video formats

Web-friendly video formats have supported transparency for 15 years. So by now it'd be well-supported and easy to use, right? Right?

Right?

## AVIF ain't it

AV1 is a great video format in terms of the compression ratio, and the encoder is great for a variety of content. However, surprisingly, it doesn't support transparency.

AVIF is an image format built from AV1. AVIF _does_ support transparency. Also, 'animated AVIF' is a thing. It's stored as two AV1 streams, where the additional stream is a luma-only (black & white) video representing the alpha channel.

Taking the example at the top of this post, I can get the size down to 504 kB with acceptable loss.

Here's a demo, but… don't get your hopes up:

<button class="btn avif-demo-show-btn">Show AVIF demo</button>

<div class="avif-demo"></div>

<button class="btn avif-demo-hide-btn" style="display: none">Hide AVIF demo</button>

<script>
  const avifDemoContainer = document.querySelector('.avif-demo');
  const avifDemoShowBtn = document.querySelector('.avif-demo-show-btn');
  const avifDemoHideBtn = document.querySelector('.avif-demo-hide-btn');

  avifDemoShowBtn.onclick = () => {
    avifDemoContainer.innerHTML = `
      <figure class="full-figure max-figure checkd">
        <img src="asset-url:./video/ose.avif" alt="AVIF demo" />
        <figcaption>Janky & buggy AVIF demo</figcaption>
      </figure>
    `;

    avifDemoShowBtn.style.display = 'none';
    avifDemoHideBtn.style.display = '';
  };

  avifDemoHideBtn.onclick = () => {
    avifDemoContainer.innerHTML = '';
    avifDemoShowBtn.style.display = '';
    avifDemoHideBtn.style.display = 'none';
  };
</script>

Given that [AVIF is well supported](https://caniuse.com/avif), it sounds like the ideal solution. But…

### It doesn't work in Safari

Although Safari supports AVIF, and supports transparency in AVIF, it doesn't correctly support transparency in an animated AVIF. It looks a real mess, and its horrendously slow.

[Bug report](https://bugs.webkit.org/show_bug.cgi?id=275906).

### The performance is prohibitively bad

Chrome and Firefox render the AVIF correctly, but it struggles to hit 60fps even on an ultra high-end laptop. On Android, it struggles to hit even a few frames per second.

- [Chrome bug report](https://issues.chromium.org/issues/349566435).
- [Firefox bug report](https://bugzilla.mozilla.org/show_bug.cgi?id=1909646).

### Streaming is poor

When playing content back via `<video>`, browsers will delay starting playback until it thinks enough is buffered for uninterrupted playback. However, because this is `<img>` rather than `<video>`, Chrome will just display frames as soon as it has the data, making playback really choppy on slower connections.

This is really because…

### Animated image formats are a hack

Im my opinion, animated AVIF doesn't make sense in a world where AV1 video exists. Even if all the above bugs were fixed, you'd still be unable to:

- Show browser video playback controls.
- Programmatically pause/resume playback, e.g. for accessibility reasons.
- Fallback to an alternative video format via `<source>`.
- Include audio.

There are benefits to being able to include animated content in an `<img>`, especially in contexts like forums that support `<img>` but not `<video>`. The good news is, Safari solved this back in 2018:

```html
<img src="whatever.mp4" alt="…" />
```

The above just works in Safari. You can even use videos as image content in CSS. The bad news is, [Chrome isn't interested in supporting this](https://issues.chromium.org/issues/41359195). Booooooooo.

### Encoding animated AVIF

For completeness: here's how to create an animated AVIF using [ffmpeg](https://ffmpeg.org/):

```bash
INPUT="in.mov" OUTPUT="out.avif" CRF=45 CRFA=60 CPU=3 bash -c 'ffmpeg -y -i "$INPUT" -color_range tv -pix_fmt:0 yuv420p -pix_fmt:1 gray8 -filter_complex "[0:v]format=pix_fmts=yuva444p[main]; [main]split[main][alpha]; [alpha]alphaextract[alpha]" -map "[main]:v" -map "[alpha]:v" -an -c:v libaom-av1 -cpu-used "$CPU" -crf "$CRF" -crf:1 "$CRFA" -pass 1 -f null /dev/null && ffmpeg -y -i "$INPUT" -color_range tv -pix_fmt:0 yuv420p -pix_fmt:1 gray8 -filter_complex "[0:v]format=pix_fmts=yuva444p[main]; [main]split[main][alpha]; [alpha]alphaextract[alpha]" -map "[main]:v" -map "[alpha]:v" -an -c:v libaom-av1 -cpu-used "$CPU" -crf "$CRF" -crf:1 "$CRFA" -pass 2 "$OUTPUT"'
```

- `CRF` (0-63): Lower values are higher quality, larger filesize.
- `CRFA` (0-63): Like `CRF`, but for the alpha channel.
- `CPU` (0-8): Weirdly, _lower_ values use more CPU, which improves quality, but encodes much slower. I wouldn't go lower than 3.

## VP9 + HEVC somewhat works

This solution isn't ideal, and definitely isn't the most efficient, but it's the best we've got when it comes to native support, meaning it works without JavaScript:

<figure class="full-figure max-figure checkd">
<video controls autoplay crossorigin muted playsinline loop style="aspect-ratio: 1597 / 833; display: block; width: 100%">
  <source type="video/quicktime; codecs=hvc1.1.6.H120.b0" src="asset-url:./video/hevc.mov" />
  <source type="video/webm; codecs=vp09.00.41.08" src="asset-url:./video/vp9.webm" />
</video>
<figcaption>A reasonable solution that doesn't need JavaScript</figcaption>
</figure>

This is 1.1 MB in Chrome & Firefox via the VP9 codec, and 3.4 MB in Safari via the HEVC codec. The VP9 is double the size of the AVIF, which shows the generational gap between the codecs.

```html
<video playsinline muted autoplay loop>
  <source type="video/quicktime; codecs=hvc1.1.6.H120.b0" src="video.mov" />
  <source type="video/webm; codecs=vp09.00.41.08" src="video.webm" />
</video>
```

The HEVC must appear first. Safari supports VP9, but it doesn't support VP9 with transparency ([bug report](https://bugs.webkit.org/show_bug.cgi?id=275908)), so we need to 'encourage' Safari to pick the HEVC file over the VP9.

I'm a little worried that a non-Apple device will try to play the HEVC file, but not support transparency (after all, it's an [Apple extension to the format (pdf)](https://developer.apple.com/av-foundation/HEVC-Video-with-Alpha-Interoperability-Profile.pdf)), resulting in broken output. However, I haven't seen this happen yet.

Also, there are a couple of bugs to be aware of:

- [Chrome Android gets the alpha channel wrong](https://issues.chromium.org/issues/349610465). Depending on how much transparency you use, it might not matter too much. This has been fixed in Canary, but at time of writing, it hasn't reached stable.
- [Playback often stalls on Firefox for Android](https://bugzilla.mozilla.org/show_bug.cgi?id=1905878).

### Encoding VP9

With [ffmpeg](https://ffmpeg.org/):

```bash
INPUT="in.mov" OUTPUT="out.webm" CRF=45 EFFORT="good" bash -c 'ffmpeg -y -i "$INPUT" -pix_fmt yuva420p -an -c:v libvpx-vp9 -crf "$CRF" -b:v 0 -deadline "$EFFORT" -threads 4 -lag-in-frames 25 -row-mt 1 -pass 1 -f null /dev/null && ffmpeg -y -i "$INPUT" -pix_fmt yuva420p -an -c:v libvpx-vp9 -crf "$CRF" -b:v 0 -deadline "$EFFORT" -threads 4 -lag-in-frames 25 -row-mt 1 -pass 2 "$OUTPUT"'
```

- `CRF` (0-63): Lower values are higher quality, larger filesize.
- `EFFORT` (`best` or `good`): `good` is faster, but slightly lower quality.

### Encoding HEVC

This is the format you need for Apple devices, so it might not surprise you to hear that you can only encode it on MacOS.

In addition, you really need to fork out £50 or whatever for [Apple's Compressor](https://www.apple.com/uk/final-cut-pro/compressor/).

But even then, the results aren't great. I don't think Apple's Compressor is designed with this kind of content in mind, so you usually end up with a much larger file size than the equivalent VP9.

[Here's a quick video guide to using the Compressor app to encode video with an alpha channel](https://youtu.be/Js4fNuOh1Ac).

If, after forking out £££ for an Apple device, you really really really don't want to spend £50 on Compressor, you can encode a kinda shitty version using [ffmpeg](https://ffmpeg.org/). Note: this only works on MacOS, as it calls out to the built-in codec.

```bash
ffmpeg -i in.mov -c:v hevc_videotoolbox -require_sw 1 -alpha_quality 0.1 -tag:v hvc1 -q:v 35 -vf "premultiply=inplace=1" out.mov
```

- `-q:v` (0-100): Quality, where 100 is the highest quality with largest file size.
- `-alpha_quality` (0-1): Separate control of the alpha channel quality.

The reason this method is worse is because, for whatever reason, it uses the BGRA pixel format. This means the red, green, and blue channels are stored separately. This isn't very efficient. Video formats tend to use YUV, where brightness (Y) is stored separate to colour (UV). Human eyes are more sensitive to brightness than colour, so this separation means more bits can be spent on the brightness data vs the colour. I've [filed a bug to see if this can be fixed](https://trac.ffmpeg.org/ticket/11068). In the meantime, this method will yield around double the file size compared the already-not-great Compressor result.

There's [a feature request for the open source & cross-platform x265 codec to support transparency](https://bitbucket.org/multicoreware/x265_git/issues/577/support-for-alpha-transparency-per-apple), but it doesn't seem to be going anywhere.

# Doing it manually

AV1 is the most efficient codec we have in browsers, but it doesn't support transparency. When it's in an AVIF container, it does, but the performance is prohibitively bad.

So, I thought, what if I split the video in two, making it double height, where the top half is the video without the alpha channel, and the bottom half is the alpha channel represented as brightness?

<figure class="full-figure max-figure checkd">
  <video controls autoplay crossorigin muted playsinline loop style="display: block; width: 100%; max-height: 60vh; aspect-ratio: 665 / 693;">
    <source
      src="asset-url:./video/split-av1.mp4"
      type="video/mp4; codecs=av01.0.08M.08.0.110.01.01.01.1"
    />
    <source src="asset-url:./video/split-hevc.mp4" type="video/mp4; codecs=hvc1.1.6.H120.b0" />
  </video>
<figcaption>Top half: colour data. Bottom half: alpha data.</figcaption>
</figure>

Then, a WebGL fragment shader can be used to efficiently apply the bottom half as a mask to the top half:

```glsl
// The video frame
uniform sampler2D u_frame;

// The texCoords passed in from the vertex shader.
varying vec2 v_texCoord;

void main() {
  // Calculate the coordinates for the color (top half of the frame)
  vec2 colorCoord = vec2(v_texCoord.x, v_texCoord.y * 0.5);
  // Calculate the coordinates for the alpha (bottom half of the frame)
  vec2 alphaCoord = vec2(v_texCoord.x, 0.5 + v_texCoord.y * 0.5);

  // Pull the pixel values from the video frame
  vec4 color = texture2D(u_frame, colorCoord);
  float alpha = texture2D(u_frame, alphaCoord).r;

  // Merge the rgb values with the alpha value
  gl_FragColor = vec4(color.rgb, alpha);
}
```

And here it is:

<figure class="full-figure max-figure checkd">
<stacked-alpha-video class="main-demo-2" style="aspect-ratio: 1597 / 833">
  <video autoplay crossorigin muted playsinline loop>
    <source
      src="asset-url:./video/split-av1.mp4"
      type="video/mp4; codecs=av01.0.08M.08.0.110.01.01.01.1"
    />
    <source src="asset-url:./video/split-hevc.mp4" type="video/mp4; codecs=hvc1.1.6.H120.b0" />
  </video>
</stacked-alpha-video>
<figcaption>A Shopify UI video with transparency (click to pause)</figcaption>
</figure>

<script>
  {
    const mainDemo = document.querySelector('.main-demo-2');
    const mainDemoVideo = mainDemo.firstElementChild;

    mainDemo.onclick = () => {
      if (mainDemoVideo.paused) mainDemoVideo.play();
      else mainDemoVideo.pause();
    };
  }
</script>

For Chrome, Firefox, and Safari on a iPhone 15 Pro or M3 MacBook Pro, this is 460 kB. A huge reduction compared to 1.1 or 3.4 MB for the native version.

Other Apple devices don't support AV1, so they need an HEVC version at 1.14 MB, which isn't as good, but still a lot smaller than the 3.4 MB version they'd get for the native version.

The 460 kB AV1 version is even significantly smaller than the 504 kB AVIF. I'm not really sure why. With the AVIF, I encoded with the exact same settings - I even encoded the alpha data lower quality in the AVIF, so in theory it should be at an advantage. I guess the AVIF has overhead by being two separate video streams, whereas the stacked version is one video.

## Wrapping it up in a web component

I've [published a little web component to handle the rendering](https://www.npmjs.com/package/stacked-alpha-video):

```html
<stacked-alpha-video>
  <video autoplay crossorigin muted playsinline loop>
    <source
      src="av1.mp4"
      type="video/mp4; codecs=av01.0.08M.08.0.110.01.01.01.1"
    />
    <source src="hevc.mp4" type="video/mp4; codecs=hvc1.1.6.H120.b0" />
  </video>
</stacked-alpha-video>
```

You control playback via the `<video>`, so you're in full control over how the video is fetched, and it can also start fetching before JS loads. The web component just handles the rendering.

[I'm far from a web component absolutist](https://offthemainthread.tech/episode/are-web-components-worth-it/), but it seemed like the perfect choice here to make the component useable across frameworks, or without a framework.

[It's available on NPM](https://www.npmjs.com/package/stacked-alpha-video), but [I also export the internals](https://github.com/jakearchibald/stacked-alpha-video?tab=readme-ov-file#dont-want-to-use-a-web-component), so you can access the WebGL bits without going via the web component.

The one thing I think it's missing is being able to use the native `<video>` controls, so I [filed an issue for that too](https://github.com/whatwg/html/issues/10507).

## Encoding the video

Again, ffmpeg is the tool for the job. Here's the filter:

```bash
-filter_complex "[0:v]format=pix_fmts=yuva444p[main]; [main]split[main][alpha]; [alpha]alphaextract[alpha]; [main][alpha]vstack"
```

Breaking it up step by step:

1. `[0:v]format=pix_fmts=yuva444p[main]` convert to a predictable format.
2. `[main]split[main][alpha]` fork the output.
3. `[alpha]alphaextract[alpha]` with the 'alpha' fork, pull the alpha data out to luma data, creating a black & white view of the transparency.
4. `[main][alpha]vstack` stack the 'main' and 'alpha' forks on top of each other.

### Encoding AV1

This is the ideal format:

```bash
INPUT="in.mov" OUTPUT="av1.mp4" CRF=45 CPU=3 bash -c 'ffmpeg -y -i "$INPUT" -filter_complex "[0:v]format=pix_fmts=yuva444p[main]; [main]split[main][alpha]; [alpha]alphaextract[alpha]; [main][alpha]vstack" -pix_fmt yuv420p -an -c:v libaom-av1 -cpu-used "$CPU" -crf "$CRF" -pass 1 -f null /dev/null && ffmpeg -y -i "$INPUT" -filter_complex "[0:v]format=pix_fmts=yuva444p[main]; [main]split[main][alpha]; [alpha]alphaextract[alpha]; [main][alpha]vstack" -pix_fmt yuv420p -an -c:v libaom-av1 -cpu-used "$CPU" -crf "$CRF" -pass 2 -movflags +faststart "$OUTPUT"'
```

- `CRF` (0-63): Lower values are higher quality, larger filesize.
- `CPU` (0-8): Weirdly, _lower_ values use more CPU, which improves quality, but encodes much slower. I wouldn't go lower than 3.

### Encoding HEVC

Safari on Apple devices will use the AV1 if they have a hardware decoder (iPhone 15 Pro, M3 MacBook Pro), otherwise they need an HEVC alternative. But, since we don't need native transparency support, we can use the open source & cross-platform x265 codec:

```bash
INPUT="in.mov" OUTPUT="hevc.mp4" CRF=30 PRESET="veryslow" bash -c 'ffmpeg -y -i "$INPUT" -filter_complex "[0:v]format=pix_fmts=yuva444p[main]; [main]split[main][alpha]; [alpha]alphaextract[alpha]; [main][alpha]vstack" -pix_fmt yuv420p -an -c:v libx265 -preset "$PRESET" -crf "$CRF" -tag:v hvc1 -movflags +faststart "$OUTPUT"'
```

- `CRF` (0-63): Lower values are higher quality, larger filesize.
- `PRESET` (`medium`, `slow`, `slower`, `veryslow`): The slower you go, the better the output.

I find I have to go with a much lower CRF than with the AV1.

# Aside: limited range

The ffmpeg examples I've given here result in the videos being encoded in 'limited range'. This uses 16-235 rather than the full 8bit 0-255. This 'feature' exists due to old CRT TVs which would suffer from signal overshooting. Unfortunately, it still hangs around as a kind of default, even to the degree where [Chrome has bugs when handling the full range](https://issues.chromium.org/issues/354454801).

8bit is pretty minimal when it comes to gradients, so this ~15% reduction can result in banding. If this is a problem, you can try encoding to one of the 10bit pixel formats by swapping out `format=pix_fmts=yuva444p` for `format=pix_fmts=yuva444p10le`, and changing the `pix_fmt` to `yuv444p10le`. I'll leave that for you to figure out 😀
