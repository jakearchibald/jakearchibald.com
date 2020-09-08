import catAvif from 'asset-url:static-build/posts/2020/09/avif-has-landed/demos/cat.avif';
import catWebp from 'asset-url:static-build/posts/2020/09/avif-has-landed/demos/cat.webp';
import catJpg from 'asset-url:static-build/posts/2020/09/avif-has-landed/demos/cat.jpg';
import workerURL from 'static-entry-url:client-worker/avif/avif-slow-sw';

const items = [
  ['JPEG', catJpg],
  ['WebP', catWebp],
  ['AVIF', catAvif],
];

function addImages(chunkSize: number, delay: number) {
  const images = document.createElement('div');
  images.className = 'images';

  for (const [title, imgSrc] of items) {
    const div = document.createElement('div');
    div.className = 'item';
    const h1 = document.createElement('h1');
    h1.textContent = title;
    const img = document.createElement('img');
    const url = new URL(imgSrc, location.href);
    url.searchParams.set('r', Math.random() + '');
    url.searchParams.set('chunkSize', chunkSize + '');
    url.searchParams.set('delay', delay + '');
    img.src = url.href;
    img.onload = () => h1.classList.add('done');
    div.append(h1, img);
    images.append(div);
  }

  document.body.append(images);
}

if (!self.TransformStream) {
  document.body.append(
    'Sorry, this demo requires a browser that implements TransformStream.',
  );
} else {
  navigator.serviceWorker
    .register(workerURL, {
      scope: new URL('./', location.href).href,
    })
    .then(async (reg) => {
      if (!reg.active) {
        await new Promise((resolve) => {
          const worker = reg.installing || reg.waiting;
          worker!.addEventListener('statechange', () => {
            if (worker!.state === 'activating') resolve();
          });
        });
      }

      const buttons = document.createElement('div');
      buttons.className = 'buttons';
      document.body.append(buttons);

      {
        const button = document.createElement('button');
        button.textContent = 'Load images 2g';
        button.onclick = () => {
          buttons.remove();
          addImages(3125, 250);
        };
        buttons.append(button);
      }

      {
        const button = document.createElement('button');
        button.textContent = 'Load images 3g';
        button.onclick = () => {
          buttons.remove();
          addImages(37500 / 4, 250);
        };
        buttons.append(button);
      }
    });
}
