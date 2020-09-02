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
import workerURL from 'entry-url:client-worker/avif/decode';
import { abortable } from './utils';

type ImageTypes = 'image/webp' | 'image/avif';

export default class Decoder {
  private _worker?: Worker;
  private _queue = (Promise.resolve() as unknown) as Promise<ImageData>;
  private _pendingId: number = 0;

  constructor() {
    this._initWorker();
  }

  private _cycleWorker() {
    this._worker!.terminate();
    this._initWorker();
  }

  private _initWorker() {
    this._worker = new Worker(workerURL);
  }

  awake(type: ImageTypes) {
    this._worker!.postMessage({
      action: 'awake',
      type,
    });
  }

  decode(
    signal: AbortSignal,
    type: ImageTypes,
    blob: Blob,
  ): Promise<ImageData> {
    return (this._queue = this._queue
      .catch(() => {})
      .then(async () => {
        if (signal.aborted) throw new DOMException('AbortError', 'AbortError');
        const id = Math.random();
        const data = {
          id,
          blob,
          action: type,
        };

        this._pendingId = id;

        signal.addEventListener('abort', () => {
          if (this._pendingId !== id) return;
          this._cycleWorker();
        });

        return abortable(
          signal,
          new Promise<ImageData>((resolve) => {
            const onMessage = (event: MessageEvent) => {
              if (event.data.id !== id) return;
              resolve(event.data.result);
              this._worker!.removeEventListener('message', onMessage);
            };
            this._worker!.addEventListener('message', onMessage);
            this._worker!.postMessage(data);
          }),
        );
      }));
  }
}
