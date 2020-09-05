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
export async function abortable<T>(
  signal: AbortSignal,
  promise: Promise<T>,
): Promise<T> {
  if (signal.aborted) throw new DOMException('AbortError', 'AbortError');
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      signal.addEventListener('abort', () =>
        reject(new DOMException('AbortError', 'AbortError')),
      );
    }),
  ]);
}

export async function abortableWait(
  signal: AbortSignal,
  ms: number,
): Promise<void> {
  if (signal.aborted) throw new DOMException('AbortError', 'AbortError');
  let id: number;
  signal.addEventListener('abort', () => clearTimeout(id));
  return abortable(signal, new Promise((r) => (id = setTimeout(r, ms))));
}

export function combineSignals(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();
  const onAbort = () => {
    controller.abort();
    for (const signal of signals) signal.removeEventListener('abort', onAbort);
  };

  for (const signal of signals) {
    if (signal.aborted) {
      onAbort();
      break;
    }

    signal.addEventListener('abort', onAbort);
  }
  return controller.signal;
}
