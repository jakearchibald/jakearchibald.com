---
title: AVIF is exciting
date: 2020-08-26 01:00:00
summary: TODO
meta: TODO
---

- AVIF landed in Squoosh
- You've heard it's good, but how good?
  - New format from video file, often think good at high bitrate, but not
  - Hand-me-down
- Intro talk
  - Head off the "well actually"s because we can't have nice things
  - This post is about web images - acceptable quality, not perfect quality, also designed for retina
  - Also my reckons, your reckons may be different
  - Also hand-tuned, which doesn't work in all cases
- Go through each image in the talk
- F1 - picked due to photograph with strong colour boundaries
- Characters - picked due to sharp edges
  - Not good at lossless, but lossy is really good
  - 4:4:4 - and Chroma subsampling
- Then I threw a spanner in the works.
- Car SVG - picked due to heavy SVG and alpha
  - Lossy alpha
- Elfs - picked due to cartoon with gradients
- Using AVIF in Squoosh
  - Min - only change if looking too smooth in some areas
  - Sep alpha - change if colour looks fine but alpha doesn't - did this with car
  - Effort - yes but slow
- Gotcha: progressive rendering
  - Show demo
  - Hand-me-down
- Future work on AVIF in Squoosh
  - Performance
  - Features 4:2:0 and 4:0:0

Quote kornel's oscar speech
Using it in browsers today - right at the start
That JPEG-XL article
WebPv2
That issue where they say no to progressive rendering.
