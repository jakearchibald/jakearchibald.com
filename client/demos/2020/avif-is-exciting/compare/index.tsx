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
import { render, Component, h } from 'preact';
import ZoomableTwoUp from './ZoomableTwoUp';
import f1WebpMatch from 'asset-url:static-build/posts/2020/08/avif-is-exciting/demos/f1-match.webp';
import f1WebpGood from 'asset-url:static-build/posts/2020/08/avif-is-exciting/demos/f1-good.webp';
import f1JpgMatch from 'asset-url:static-build/posts/2020/08/avif-is-exciting/demos/f1-match.jpg';
import f1JpgGood from 'asset-url:static-build/posts/2020/08/avif-is-exciting/demos/f1-good.jpg';
import f1AvifGood from 'asset-url:static-build/posts/2020/08/avif-is-exciting/demos/f1-good.avif';
import f1AvifNearLossless from 'asset-url:static-build/posts/2020/08/avif-is-exciting/demos/f1-near-lossless.avif';
import teamAvifGood from 'asset-url:static-build/posts/2020/08/avif-is-exciting/demos/team-good.avif';
import teamWebpGood from 'asset-url:static-build/posts/2020/08/avif-is-exciting/demos/team-good.webp';
import teamPngGood from 'asset-url:static-build/posts/2020/08/avif-is-exciting/demos/team-good.png';
import teamAvifLossless from 'asset-url:static-build/posts/2020/08/avif-is-exciting/demos/team-lossless.avif';
import teamWebpMatch from 'asset-url:static-build/posts/2020/08/avif-is-exciting/demos/team-match.webp';
import teamJpgMatch from 'asset-url:static-build/posts/2020/08/avif-is-exciting/demos/team-match.jpg';
import teamWebpLossless from 'asset-url:static-build/posts/2020/08/avif-is-exciting/demos/team-lossless.webp';
import carWebpGood from 'asset-url:static-build/posts/2020/08/avif-is-exciting/demos/car-good.webp';
import carAvifGood from 'asset-url:static-build/posts/2020/08/avif-is-exciting/demos/car-good.avif';
import carSvgGood from 'asset-url:static-build/posts/2020/08/avif-is-exciting/demos/car-good.svg';
import carPngGood from 'asset-url:static-build/posts/2020/08/avif-is-exciting/demos/car-good.png';
import carSvgOriginal from 'asset-url:static-build/posts/2020/08/avif-is-exciting/demos/car-original.svg';
import carWebpMatch from 'asset-url:static-build/posts/2020/08/avif-is-exciting/demos/car-match.webp';
import machineWebpGood from 'asset-url:static-build/posts/2020/08/avif-is-exciting/demos/machine-good.webp';
import machineWebpDithered from 'asset-url:static-build/posts/2020/08/avif-is-exciting/demos/machine-dithered.webp';
import machineWebpLossless from 'asset-url:static-build/posts/2020/08/avif-is-exciting/demos/machine-lossless.webp';
import machineJpgGood from 'asset-url:static-build/posts/2020/08/avif-is-exciting/demos/machine-good.jpg';
import machineAvifGood from 'asset-url:static-build/posts/2020/08/avif-is-exciting/demos/machine-good.avif';
import machineWebpMatch from 'asset-url:static-build/posts/2020/08/avif-is-exciting/demos/machine-match.webp';
import machineJpgMatch from 'asset-url:static-build/posts/2020/08/avif-is-exciting/demos/machine-match.jpg';

import DecodedImg from 'shared/demos/2020/avif-is-exciting/DecodedImg';

const categories: {
  [category: string]:
    | { width: number; options: { [name: string]: string } }
    | undefined;
} = {
  f1: {
    width: 960,
    options: {
      'AVIF - acceptable - 18k': f1AvifGood,
      'WebP - acceptable - 39k': f1WebpGood,
      'JPEG - acceptable - 77k': f1JpgGood,
      'WebP - 22k': f1WebpMatch,
      'JPEG - 20k': f1JpgMatch,
      'AVIF - near lossless - 486k': f1AvifNearLossless,
    },
  },
  team: {
    width: 400,
    options: {
      'AVIF - acceptable - 8.5k': teamAvifGood,
      'WebP - 68 color lossless - 13k': teamWebpGood,
      'PNG - 68 color lossless - 16k': teamPngGood,
      'AVIF - 68 color lossless - 41k': teamAvifLossless,
      'WebP - lossy - 8.4k': teamWebpMatch,
      'JPEG - 8.5k': teamJpgMatch,
      'WebP - full color lossless - 43k': teamWebpLossless,
    },
  },
  car: {
    width: 500,
    options: {
      'AVIF - acceptable - 13k': carAvifGood,
      'WebP - acceptable - 49k': carWebpGood,
      'PNG - acceptable - 84k': carPngGood,
      'WebP - 13k': carWebpMatch,
      "SVG - SVGO'd - 30k": carSvgGood,
      'SVG - original - 80k': carSvgOriginal,
    },
  },
  machine: {
    width: 960,
    options: {
      'AVIF - acceptable - 12k': machineAvifGood,
      'WebP - acceptable - 26k': machineWebpGood,
      'JPEG - acceptable - 80k': machineJpgGood,
      'WebP - 12k': machineWebpMatch,
      'JPEG - 12k': machineJpgMatch,
      'WebP - 256 color lossless - 166k': machineWebpDithered,
      'WebP - full color lossless - 268k': machineWebpLossless,
    },
  },
};

const category =
  categories[new URLSearchParams(location.search).get('show') || 'f1'] ||
  categories.f1!;

const images = Object.entries(category.options);

interface State {
  leftImgSrc: string;
  rightImgSrc: string;
}

class App extends Component<{}, State> {
  state: State = {
    leftImgSrc: images[0][1],
    rightImgSrc: images[1][1],
  };

  private _onChoiceLeftChange = (event: Event) => {
    this.setState({
      leftImgSrc: (event.target as HTMLSelectElement).value,
    });
  };

  private _onChoiceRightChange = (event: Event) => {
    this.setState({
      rightImgSrc: (event.target as HTMLSelectElement).value,
    });
  };

  render({}, { leftImgSrc, rightImgSrc }: State) {
    return (
      <div>
        <ZoomableTwoUp
          left={<DecodedImg renderWidth={category.width} src={leftImgSrc} />}
          right={<DecodedImg renderWidth={category.width} src={rightImgSrc} />}
        />
        <select
          class="choice-left"
          value={leftImgSrc}
          onChange={this._onChoiceLeftChange}
        >
          {images.map(([name, url]) => (
            <option value={url}>{name}</option>
          ))}
        </select>
        <select
          class="choice-right"
          value={rightImgSrc}
          onChange={this._onChoiceRightChange}
        >
          {images.map(([name, url]) => (
            <option value={url}>{name}</option>
          ))}
        </select>
      </div>
    );
  }
}

render(<App />, document.body);
