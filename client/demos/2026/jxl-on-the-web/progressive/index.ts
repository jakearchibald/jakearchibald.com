import 'two-up-element';
import workerURL from 'static-entry-url:client-worker/jxl-on-the-web/partial-image-sw';

// This page is shown in an iframe, so the service worker's scope can be
// limited to it. The images are configured via the URL, and the parent page
// sends { bytes } messages to change how much of each image is loaded.

interface PartialImageInfo {
  label: string;
  src: string;
  size: number;
}

const params = new URLSearchParams(location.search);
const labels = params.getAll('label');
const sizes = params.getAll('size');
const images: PartialImageInfo[] = params.getAll('src').map((src, i) => ({
  src,
  label: labels[i],
  size: Number(sizes[i]),
}));

// Requests are throttled, rather than made for every slider step. A throttle
// rather than a debounce, so the images update while dragging.
const restartInterval = 200;
// How long a replaced image stays beneath its replacement. A new image is
// transparent until it's painted something, which can take a few hundred ms,
// so this avoids showing the background in the meantime.
const paintGrace = 700;

let streamCount = 0;

function releaseStream(id: string) {
  navigator.serviceWorker.controller?.postMessage({ type: 'release', id });
}

class PartialImageView {
  readonly element = document.createElement('div');
  private label = document.createElement('span');
  private current: { img: HTMLImageElement; id: string } | null = null;
  private length = -1;

  constructor(private image: PartialImageInfo) {
    this.element.className = 'image';
    this.label.className = 'label';
    this.label.textContent = image.label;
    this.element.append(this.label);
  }

  setBytes(bytes: number) {
    const length = Math.min(bytes, this.image.size);
    if (length === this.length) return;
    this.length = length;

    const id = String(++streamCount);
    const url = new URL('partial-image', location.href);
    url.searchParams.set('id', id);
    url.searchParams.set('src', this.image.src);
    url.searchParams.set('length', String(length));

    // A new element, rather than changing the src of the old one. Bytes can't
    // be added to an existing response, as Chrome decodes an in-flight AVIF
    // once, and ignores later bytes.
    const img = document.createElement('img');
    img.alt = '';
    img.decoding = 'async';
    img.src = url.href;
    // After the previous image, so it paints on top.
    this.label.before(img);

    const previous = this.current;
    this.current = { img, id };
    if (!previous) return;

    // Close the old response straight away, as too many open responses stall
    // loading, but keep its image visible for a while.
    releaseStream(previous.id);
    setTimeout(() => previous.img.remove(), paintGrace);
  }
}

const views = images.map((image) => new PartialImageView(image));

let wantedBytes = Number(params.get('bytes')) || 0;
let lastUpdate = -Infinity;
let updateTimeout = 0;

function update() {
  lastUpdate = performance.now();
  for (const view of views) view.setBytes(wantedBytes);
}

function setBytes(bytes: number) {
  wantedBytes = bytes;
  if (updateTimeout) return;

  const sinceLastUpdate = performance.now() - lastUpdate;

  if (sinceLastUpdate >= restartInterval) {
    update();
    return;
  }

  // Ensures the final value gets an update.
  updateTimeout = setTimeout(() => {
    updateTimeout = 0;
    update();
  }, restartInterval - sinceLastUpdate);
}

async function main() {
  const registration = await navigator.serviceWorker.register(workerURL, {
    scope: new URL('./', location.href).href,
  });

  if (!navigator.serviceWorker.controller) {
    const controlled = new Promise((resolve) => {
      navigator.serviceWorker.addEventListener('controllerchange', resolve, {
        once: true,
      });
    });
    // If the worker is already active, the page isn't controlled due to a hard
    // refresh, so ask to be claimed.
    registration.active?.postMessage('claim');
    await controlled;
  }

  const twoUp = document.createElement('two-up');
  twoUp.className = 'two-up';
  twoUp.append(...views.map((view) => view.element));
  document.body.append(twoUp);
  update();

  addEventListener('message', (event) => {
    if (event.origin !== location.origin || event.source !== parent) return;
    if (typeof event.data?.bytes === 'number') setBytes(event.data.bytes);
  });

  // The parent may have changed the value before this page was ready.
  if (parent !== self) parent.postMessage('ready', location.origin);
}

main();
