---
title: AVIF is exciting
date: 2020-08-26 01:00:00
summary: TODO
meta: TODO
---

<style>
  .image-tabs-preview {
    display: grid;
    overflow: hidden;
  }
  .image-tabs-preview > * {
    grid-area: 1/1;
  }
  .image-tabs-tabs {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: 1fr;
    border-top: 7px solid #ffe454;
  }
  .image-tabs input[type=radio] {
    display: none;
  }
  .image-tabs-label {
    padding: 0.7em 0.7em;
    text-align: center;
    cursor: pointer;
    line-height: 1.3;
    font-size: 0.9rem;
  }
  .image-tabs input[type=radio]:checked + .image-tabs-label {
    background: #ffe454;
  }
  .image-tabs-tab {
    display: grid;
  }
</style>

<figure class="full-figure max-figure">
<script type="component">{
  "module": "shared/demos/2020/avif-is-exciting/ImageTabs",
  "props": {
    "ratio": 1.777,
    "maxWidth": 960,
    "initial": 3,
    "images": [
      ["Original", "asset-url:static-build/posts/2020/08/avif-is-exciting/demos/f1-near-lossless.avif"],
      ["JPEG (asset-pretty-size:static-build/posts/2020/08/avif-is-exciting/demos/f1-good.jpg)", "asset-url:static-build/posts/2020/08/avif-is-exciting/demos/f1-good.jpg"],
      ["WebP (asset-pretty-size:static-build/posts/2020/08/avif-is-exciting/demos/f1-good.webp)", "asset-url:static-build/posts/2020/08/avif-is-exciting/demos/f1-good.webp"],
      ["AVIF (asset-pretty-size:static-build/posts/2020/08/avif-is-exciting/demos/f1-good.avif)", "asset-url:static-build/posts/2020/08/avif-is-exciting/demos/f1-good.avif"]
    ]
  }
}</script>
</figure>
