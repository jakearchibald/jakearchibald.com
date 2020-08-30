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
import { abortable } from './utils';
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
}

interface State {
  output?: VNode;
}

export default class DecodedImg extends Component<Props, State> {
  private _updateController?: AbortController;
  private _decoder?: Decoder;

  private async _updateOutput() {
    if (this._updateController) this._updateController.abort();

    this.setState({ output: undefined });

    this._updateController = new AbortController();
    const { signal } = this._updateController;
    const ext = this.props.src.split('.').slice(-1)[0];
    const type = extensionTypes[ext];
    if (!type) throw Error('Unexpected extension');

    try {
      const canDecode = await abortable(signal, canDecodeImageType(type));

      if (canDecode) {
        this.setState({
          output: (
            <img
              style={{ width: this.props.renderWidth + 'px' }}
              src={this.props.src}
            />
          ),
        });
        return;
      }

      if (!decodeCache.has(this.props.src)) {
        if (!this._decoder) this._decoder = new Decoder();

        this._decoder.awake(type as 'image/webp' | 'image/avif');

        decodeCache.set(
          this.props.src,
          fetch(this.props.src, { signal }).then(async (response) => {
            const blob = await response.blob();
            return this._decoder!.decode(
              signal,
              type as 'image/webp' | 'image/avif',
              blob,
            );
          }),
        );
      }

      const canvas = await abortable(
        signal,
        new Promise<HTMLCanvasElement>((resolve) => {
          this.setState({
            output: (
              <canvas
                style={{ width: this.props.renderWidth + 'px' }}
                ref={(node) => node && resolve(node)}
              />
            ),
          });
        }),
      );

      const decodedImage = await decodeCache.get(this.props.src)!;
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

  componentDidUpdate(previousProps: Props) {
    if (this.props.src !== previousProps.src) this._updateOutput();
  }

  render({}: Props, { output }: State) {
    return output || <div />;
  }
}
