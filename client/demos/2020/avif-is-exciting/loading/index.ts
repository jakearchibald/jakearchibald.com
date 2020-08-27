import catAvif from 'asset-url:static-build/posts/2020/08/avif-is-exciting/demos/cat.avif';
import catWebp from 'asset-url:static-build/posts/2020/08/avif-is-exciting/demos/cat.webp';
import catJpg from 'asset-url:static-build/posts/2020/08/avif-is-exciting/demos/cat.jpg';
import workerURL from 'static-entry-url:client-worker/avif/avif-slow-sw';

const items = [
  ['JPEG', catJpg],
  ['WebP', catWebp],
  ['AVIF', catAvif],
];

function addImages() {
  const images = document.createElement('div');
  images.className = 'images';

  for (const [title, imgSrc] of items) {
    const div = document.createElement('div');
    div.className = 'item';
    const h1 = document.createElement('h1');
    h1.textContent = title;
    const img = document.createElement('img');
    img.src = imgSrc;
    img.onload = () => h1.classList.add('done');
    div.append(h1, img);
    images.append(div);
  }

  document.body.append(images);
}

const button = document.createElement('button');
button.className = 'go-btn';
button.textContent = 'Load images';
button.onclick = () => {
  button.remove();
  addImages();
};
document.body.append(button);

if (self.TransformStream) {
  navigator.serviceWorker.register(workerURL, {
    scope: new URL('./', location.href).href,
  });
}
