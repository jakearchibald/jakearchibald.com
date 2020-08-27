declare var self: ServiceWorkerGlobalScope;

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

function slowStream(chunkSize: number, delay: number) {
  return new TransformStream<Uint8Array, Uint8Array>({
    async transform(chunk, controller) {
      let pos = 0;

      while (pos < chunk.length) {
        await wait(delay);
        controller.enqueue(chunk.subarray(pos, pos + chunkSize));
        pos += chunkSize;
      }
    }
  });
}

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.destination !== 'image') return;

  event.respondWith((async () => {
    const response = await fetch(event.request);
    const stream = response.body!.pipeThrough(slowStream(500, 50));
    const finalResponse = new Response(stream, {
      status: 200,
      headers: response.headers
    });

    return finalResponse;
  })());
});

export { };
