/**
 * Copyright 2020 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import type { WebPModule } from './webp/webp_dec';
import webpDec from './webp/webp_dec';
import webPDecWasm from 'asset-url:./webp/webp_dec.wasm';
import type { AVIFModule } from './avif/avif_dec';
import avifDec from './avif/avif_dec';
import avifDecWasm from 'asset-url:./avif/avif_dec.wasm';

type ModuleFactory<M extends EmscriptenWasm.Module> = (
  opts: EmscriptenWasm.ModuleOpts,
) => M;

function initEmscriptenModule<T extends EmscriptenWasm.Module>(
  moduleFactory: ModuleFactory<T>,
  wasmUrl: string,
): Promise<T> {
  return new Promise((resolve) => {
    const module = moduleFactory({
      // Just to be safe, don't automatically invoke any wasm functions
      noInitialRun: true,
      locateFile: () => wasmUrl,
      onRuntimeInitialized() {
        // An Emscripten is a then-able that resolves with itself, causing an infite loop when you
        // wrap it in a real promise. Delete the `then` prop solves this for now.
        // https://github.com/kripken/emscripten/issues/5820
        delete (module as any).then;
        resolve(module);
      },
    });
  });
}

let webpModule: Promise<WebPModule>;
let avifModule: Promise<AVIFModule>;

addEventListener('message', async (event) => {
  if (event.data.action === 'awake') {
    if (event.data.type === 'image/webp') {
      if (!webpModule) webpModule = initEmscriptenModule(webpDec, webPDecWasm);
    } else if (event.data.type === 'image/avif') {
      if (!avifModule) avifModule = initEmscriptenModule(avifDec, avifDecWasm);
    }
  } else if (event.data.action === 'image/webp') {
    if (!webpModule) webpModule = initEmscriptenModule(webpDec, webPDecWasm);
    const module = await webpModule;
    const buffer = await new Response(event.data.blob).arrayBuffer();
    const result = module.decode(buffer);
    postMessage({
      id: event.data.id,
      result,
    });
  } else if (event.data.action === 'image/avif') {
    if (!avifModule) avifModule = initEmscriptenModule(avifDec, avifDecWasm);
    const module = await avifModule;
    const buffer = await new Response(event.data.blob).arrayBuffer();
    const result = module.decode(buffer);
    postMessage({
      id: event.data.id,
      result,
    });
  }
});
