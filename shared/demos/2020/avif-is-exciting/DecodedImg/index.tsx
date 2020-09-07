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
import { Component, h, VNode } from 'preact';
import { abortable, abortableWait, combineSignals } from './utils';
import Decoder from './decoder';

/** Caches results from canDecodeImageType */
const canDecodeCache = new Map<string, Promise<boolean>>();

/**
 * Tests whether the browser supports a particular image mime type.
 *
 * @param type Mimetype
 * @example await canDecodeImageType('image/avif')
 */
function canDecodeImageType(type: string): Promise<boolean> {
  if (!canDecodeCache.has(type)) {
    const resultPromise = (async () => {
      const picture = document.createElement('picture');
      const img = document.createElement('img');
      const source = document.createElement('source');
      source.srcset = 'data:,x';
      source.type = type;
      picture.append(source, img);

      // Wait a single microtick just for the `img.currentSrc` to get populated.
      await 0;
      // At this point `img.currentSrc` will contain "data:,x" if format is supported and ""
      // otherwise.
      return !!img.currentSrc;
    })();

    canDecodeCache.set(type, resultPromise);
  }

  return canDecodeCache.get(type)!;
}

const extensionTypes: { [type: string]: string | undefined } = {
  webp: 'image/webp',
  avif: 'image/avif',
  jpg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml',
};

const decodeCache = new Map<string, Promise<ImageData>>();

interface Props {
  src: string;
  renderWidth: number;
  lazy?: boolean;
}

interface State {
  output?: VNode;
}

export default class DecodedImg extends Component<Props, State> {
  private _updateController?: AbortController;
  private _decoder?: Decoder;

  private async _updateOutput() {
    if (this._updateController) this._updateController.abort();
    const { renderWidth, src, lazy } = this.props;

    this._updateController = new AbortController();
    const { signal } = this._updateController;
    const ext = src.split('.').slice(-1)[0];

    // Assuming type from extension is hacky and not how things work on the web.
    // In Squoosh we sniff image bytes (similar to how the browser does it),
    // another way would be to use the response Content-Type.
    // But this is quick and easy and works for the blog post.
    const type = extensionTypes[ext];

    if (!type) throw Error('Unexpected extension');

    const timeoutController = new AbortController();

    // Blank the output if it takes too long to switch the image
    abortableWait(combineSignals([signal, timeoutController.signal]), 500)
      .then(() => {
        this.setState({ output: undefined });
      })
      // Ignore errors (they should only be aborts)
      .catch(() => {});

    try {
      const canDecode = await abortable(signal, canDecodeImageType(type));

      if (lazy && self.IntersectionObserver) {
        await abortable(
          signal,
          new Promise((resolve) => {
            const observer = new IntersectionObserver(([result]) => {
              if (!result.isIntersecting) return;
              observer.disconnect();
              resolve();
            });
            observer.observe(this.base!.parentElement!);
          }),
        );
      }

      if (canDecode) {
        const img = new Image();
        img.src = src;
        await abortable(signal, img.decode());
        timeoutController.abort();
        this.setState({
          output: (
            <img
              // @ts-ignore - type doesn't exist in Preact
              decoding="sync"
              style={{ width: renderWidth + 'px' }}
              src={src}
            />
          ),
        });
        return;
      }

      const addToCache = () => {
        if (!this._decoder) this._decoder = new Decoder();

        this._decoder.awake(type as 'image/webp' | 'image/avif');

        decodeCache.set(
          src,
          fetch(src, { signal }).then(async (response) => {
            const blob = await response.blob();
            return this._decoder!.decode(
              signal,
              type as 'image/webp' | 'image/avif',
              blob,
            );
          }),
        );
      };

      if (!decodeCache.has(src)) addToCache();

      let decodedImage: ImageData;

      while (true) {
        const promise = decodeCache.get(src)!;
        const cachedResult = await abortable(
          signal,
          promise.catch((err) => err as Error),
        );

        if (cachedResult instanceof ImageData) {
          decodedImage = cachedResult;
          break;
        }

        // Otherwise, we've got an error.
        // If it's an unexpected error, throw it.
        if (cachedResult.name !== 'AbortError') throw cachedResult;

        // We've cached an abort error. We want to retry the operation.
        // However, another run of this algorithm may have already retried.
        // If not, start the operation again.
        if (decodeCache.get(src) === promise) addToCache();
      }

      const canvas = await abortable(
        signal,
        new Promise<HTMLCanvasElement>((resolve) => {
          timeoutController.abort();
          this.setState({
            output: (
              <canvas
                style={{ width: renderWidth + 'px' }}
                ref={(node) => node && resolve(node)}
              />
            ),
          });
        }),
      );

      canvas.width = decodedImage.width;
      canvas.height = decodedImage.height;
      canvas.getContext('2d')!.putImageData(decodedImage, 0, 0);
    } catch (err) {
      if (err.name === 'AbortError') return;
      throw err;
    }
  }

  componentDidMount() {
    this._updateOutput();
  }

  componentWillUnmount() {
    if (this._updateController) this._updateController.abort();
  }

  componentDidUpdate(previousProps: Props) {
    if (this.props.src !== previousProps.src) this._updateOutput();
  }

  render({}: Props, { output }: State) {
    return output || <div />;
  }
}
