skipWaiting();
registration.unregister();

// Self-removing service worker, until I can replace the server-side stuff I had before:
addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      registration.unregister();
      const all = await clients.matchAll();
      for (const client of all) {
        client.navigate(client.url);
      }
    })(),
  );
});
