declare var self: ServiceWorkerGlobalScope;

// Serves the first `length` bytes of an image, then leaves the response open,
// so the browser renders it as if it's still loading.

const types: Record<string, string> = {
  avif: 'image/avif',
  jxl: 'image/jxl',
};

const blobs = new Map<string, Promise<Blob>>();

/** Responses that are still open, by the ID the page gave them */
const openStreams = new Map<
  string,
  ReadableStreamDefaultController<Uint8Array>
>();

function getBlob(src: string): Promise<Blob> {
  if (!blobs.has(src)) {
    const promise = fetch(src).then((response) => {
      if (!response.ok) throw Error(`Failed to fetch ${src}`);
      return response.blob();
    });
    // Allow retries
    promise.catch(() => blobs.delete(src));
    blobs.set(src, promise);
  }
  return blobs.get(src)!;
}

async function partialResponse(url: URL): Promise<Response> {
  const id = url.searchParams.get('id');
  const srcParam = url.searchParams.get('src');
  const length = Number(url.searchParams.get('length'));

  if (!srcParam) return new Response('Missing src', { status: 400 });

  const src = new URL(srcParam, location.href);

  if (src.origin !== location.origin) {
    return new Response('Bad src', { status: 400 });
  }

  const blob = await getBlob(src.href);
  const extension = src.pathname.split('.').pop()!;
  const headers = { 'Content-Type': types[extension] ?? blob.type };

  if (length >= blob.size) return new Response(blob, { headers });

  const bytes = new Uint8Array(await blob.slice(0, length).arrayBuffer());

  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      if (bytes.length) controller.enqueue(bytes);
      // Left open, so the image never finishes loading, until the page
      // releases it.
      if (id) openStreams.set(id, controller);
    },
    cancel() {
      if (id) openStreams.delete(id);
    },
  });

  return new Response(body, { headers });
}

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  // Pages that aren't controlled (e.g. after a hard refresh) ask to be claimed.
  if (event.data === 'claim') {
    event.waitUntil(self.clients.claim());
    return;
  }

  // The page has replaced this response. Too many open responses stall image
  // loading, so close it.
  if (event.data?.type === 'release') {
    const controller = openStreams.get(event.data.id);
    openStreams.delete(event.data.id);
    try {
      controller?.close();
    } catch {
      // Already closed or cancelled
    }
  }
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  if (!url.pathname.endsWith('/partial-image')) return;
  event.respondWith(partialResponse(url));
});

export {};
