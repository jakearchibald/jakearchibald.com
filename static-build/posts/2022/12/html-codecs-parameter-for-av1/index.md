---
title: Getting the correct HTML codecs parameter for an AV1 video
date: 2022-12-19 01:00:00
summary: It should be easier, but here's how to figure it out.
meta: It should be easier, but here's how to figure it out.
---

This post is mostly for my own reference, but I couldn't find a good guide elsewhere, so here we go!

I wanted to embed a screencast in a web page, and I wanted it to be as efficient as possible. To achieve this, I created two version of the video, and embedded it like this:

```html
<video controls playsinline>
  <source
    src="video.webm"
    type="video/webm; codecs=av01.0.08M.08.0.110.01.01.01.1"
  />
  <source src="video.mp4" type="video/mp4" />
</video>
```

The MP4 version uses the H.264 codec, which is as-good-as [universally supported](https://caniuse.com/mpeg4). I avoided using any fancy codec features to ensure maximum compatibility. In this case the video was asset-pretty-size:./video.mp4. Not bad.

The WebM version on the other hand, uses the newer AV1 codec, which is [less supported](https://caniuse.com/av1), but works in Chrome and Firefox at the time of writing. This codec is much more efficient, and I was able to get the video down to asset-pretty-size:./video.webm with the same visual quality.

Here's it is:

<figure class="full-figure max-figure">
  <video controls playsinline style="width:100%; aspect-ratio: 1512/614; height: auto; object-fit: fill">
    <source src="asset-url:./video.webm" type="video/webm; codecs=av01.0.08M.08.0.110.01.01.01.1" />
    <source src="asset-url:./video.mp4" type="video/mp4" />
  </video>
  <figcaption>Live demo</figcaption>
</figure>

But, this post is about the `av01.0.08M.08.0.110.01.01.01.1` bit.

# Why the codecs parameter is useful

WebM and MP4 are just containers for audio, video, and other bits of data such as subtitles. It's kinda meaningless to say something "supports MP4" since MP4 can be used to contain all different kinds of media formats.

In fact, it's similarly risky to say something "supports H.264", because there are a lot of different levels of support within a single codec.

For example, with the WebM version of the video, as well as using AV1, I used a few tricks to improve the quality and reduce the size:

- I used the full 8-bit range for colour and luma data. Although an 8-bit value usually gives you a range of 0-255, due to legacy TV standards, the data is often compressed to 16-235 (luma) and 16-240 (chroma), resulting in lower quality. I avoided that for the AV1 version.
- I skipped frames that were identical to the previous frame. This is useful for screencasts where there are moments where nothing changes. For instance, the MP4 video has 336 frames, whereas the WebM version only has 160, just by skipping duplicates. This doesn't change what the user sees at all, it just means the file contains less data.

I can actually do all the same tricks with H.264 and MP4, but Safari fails to play the video if it uses the full 8-bit range.

Safari on desktop is fine with frame-skipping, but Safari on iOS isn't. Not only is the level of support different between Safari and Chrome, it's also different between Safari on desktop and Safari on iOS.

That creates a challenge. Let's say I embedded the video like this:

```html
<video controls playsinline>
  <source src="video.webm" type="video/webm" />
  <source src="video.mp4" type="video/mp4" />
</video>
```

This works great today! Firefox and Chrome use the smaller AV1 WebM, whereas Safari falls back to the larger H.264 MP4. But what if Safari adds support for WebM, but not AV1? What if Safari adds support for AV1, but only a very basic version, like they have for H.264, which doesn't support particular codec features? Well, the video will stop working in Safari.

That's where the `codecs=` bit comes in. It not only tells the browser the codec being used, but also the particular features of the codec.

But, wtf does `av01.0.08M.08.0.110.01.01.01.1` even mean?

# How to figure out a codecs parameter value

The _full_ codecs parameter for AV1 is in the format `av01.P.LLT.DD` or `av01.P.LLT.DD.M.CCC.cp.tc.mc.F`. I'm using the longer format for safety.

Here's how to figure out all the parts:

First up, you'll need [FFmpeg](https://ffmpeg.org/), which lets you dump all the metadata from the video file.

Dump all the data using:

```sh
ffmpeg -i video.webm -c:v copy -bsf:v trace_headers -f null /dev/null 2>dump.txt
```

Change `video.webm` to the location of the video file, and change `dump.txt` if you want to save the data somewhere else.

Now we can query `dump.txt` for the various parts of the codec parameter string!

## P

This is the 'profile'.

```sh
grep seq_profile dump.txt
```

You'll get an output like this:

```
[trace_headers @ 0x6000011f4460] 40    seq_profile        001 = 0
[trace_headers @ 0x6000011f4460] 40    seq_profile        001 = 0
```

As with all of these steps, the value we're interested in is right at the end, `0`. Don't worry if you get a different value. For instance, if the video uses full-resolution colour data, this will probably be `1`.

**Update:** For web content, you should avoid high profile AV1 for now (as in, yuv444). This is due to [a bug in Android Chrome](https://bugs.chromium.org/p/chromium/issues/detail?id=1402561) where it sends the video to the hardware decoder, which doesn't actually support high profile AV1. This results in garbage output.

If you get more than one value, pick the largest.

## LL

This is the 'level'.

```sh
grep seq_level_idx dump.txt
```

For me, the end value is `8`. But, since `LL` requires two digits, the value I use is `08`.

## T

This is the 'tier'.

```sh
grep seq_tier dump.txt
```

If you don't get a value for this, or the value is `0`, then the value for `T` is `M`.

Otherwise, the value for `T` is `H`.

## DD

This is the bit depth used per channel.

```sh
grep -e high_bitdepth -e twelve_bit dump.txt
```

Ok, this one is a little more complicated.

- If `high_bitdepth` is `0`, then the value for `DD` is `08`. You won't see a value for `twelve_bit`.
- If `high_bitdepth` is `1` and `twelve_bit` is `0`, then the value for `DD` is `10`.
- If `high_bitdepth` is `1` and `twelve_bit` is `1`, then the value for `DD` is `12`.

## M

This is the 'monochrome' flag. If your video has colour, you can assume this value is `0`. Otherwise:

```sh
grep mono_chrome dump.txt
```

If you don't get a value, use `0`, otherwise use the value you get.

## CCC

This is the level of chroma subsampling, and it's another one that's a bit more complicated.

If your value for `M` is `1`, then the value for `CCC` is `111`.

If your value for `P` is `0`, then the value for `CCC` is `110`.

If your value for `P` is `1`, then the value for `CCC` is `000`.

If your value for `DD` is _not_ `12`, then the value for `CCC` is `100`.

Otherwise:

```sh
grep subsampling_ dump.txt
```

Here's how you determine the three characters:

1. If you get a value for `subsampling_x`, use it, otherwise use `0`.
1. If you get a value for `subsampling_y`, use it, otherwise use `0`.
1. Use `0`.

Phew!

## cp, tc, mc

These are the 'colour primaries', 'transfer characteristics', and 'matrix coefficients'. If you managed to get through the whole `CCC` mess, I think we can do these three _all at once_.

```sh
grep -e color_primaries -e transfer_characteristics -e matrix_coefficients dump.txt
```

Each value must be two digits, and they're in this order: `color_primaries`, `transfer_characteristics`, `matrix_coefficients`. Remember to separate them with `.`.

The output for my file was:

```
[trace_headers @ 0x6000011f4460] 96     color_primaries                  00000001 = 1
[trace_headers @ 0x6000011f4460] 104    transfer_characteristics         00000001 = 1
[trace_headers @ 0x6000011f4460] 112    matrix_coefficients              00000001 = 1
[trace_headers @ 0x6000011f4460] 96     color_primaries                  00000001 = 1
[trace_headers @ 0x6000011f4460] 104    transfer_characteristics         00000001 = 1
[trace_headers @ 0x6000011f4460] 112    matrix_coefficients              00000001 = 1
```

So I used `01.01.01`.

If any values are missing, use `01` and hope for the best.

## F

This refers to the 0-255 vs 16-235 thing I mentioned earlier.

```sh
grep color_range dump.txt
```

If this value is missing, use `0`.

Because I'm using the full 0-255 range, I used the full AV1 codec string so I could include this bit of information.

# And that's it!

That's how I ended up at the value `av01.0.08M.08.0.110.01.01.01.1`. This doesn't capture the variable framerate bit, so I guess I'm still hoping Safari supports that properly when they ship AV1 support.

I think it's kinda stupid that it's so hard to get this information, yet as authors we're expected to include it. And even then, the information in this post only covers AV1. I've [filed a bug](https://bugs.chromium.org/p/chromium/issues/detail?id=1402220) asking that Chrome's Media DevTools should just provide the ideal codec parameter for a given video, and warn if the wrong details are used.

In terms of references, I found the [MDN documentation](https://developer.mozilla.org/docs/Web/Media/Formats/codecs_parameter) really handy. It also covers codec parameters for other formats.

However, to figure out how to extract the values for a particular video, I had to dive into [this part of the AV1 spec](https://aomediacodec.github.io/av1-spec/#sequence-header-obu-syntax).
