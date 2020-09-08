declare var self: ServiceWorkerGlobalScope;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const slowStream = (chunkSize: number, delay: number) =>
  new TransformStream<Uint8Array, Uint8Array>({
    async transform(chunk, controller) {
      for (let pos = 0; pos < chunk.length; pos += chunkSize) {
        await wait(delay);
        controller.enqueue(chunk.subarray(pos, pos + chunkSize));
      }
    },
  });

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.destination !== 'image') return;
  const url = new URL(event.request.url);
  if (!url.searchParams.has('chunkSize')) return;

  const chunkSize = Number(url.searchParams.get('chunkSize'));
  const delay = Number(url.searchParams.get('delay'));

  url.search = '';

  event.respondWith(
    (async () => {
      const { status, headers, body } = await fetch(url.href);
      const stream = body!.pipeThrough(slowStream(chunkSize, delay));
      return new Response(stream, { status, headers });
    })(),
  );
});

export {};
