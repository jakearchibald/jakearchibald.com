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

import f1WebpMatch from 'asset-url:static-build/posts/2020/09/avif-is-exciting/demos/f1-match.webp';
import f1WebpMatchSize from 'asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/f1-match.webp';
import f1WebpGood from 'asset-url:static-build/posts/2020/09/avif-is-exciting/demos/f1-good.webp';
import f1WebpGoodSize from 'asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/f1-good.webp';
import f1JpgMatch from 'asset-url:static-build/posts/2020/09/avif-is-exciting/demos/f1-match.jpg';
import f1JpgMatchSize from 'asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/f1-match.jpg';
import f1JpgGood from 'asset-url:static-build/posts/2020/09/avif-is-exciting/demos/f1-good.jpg';
import f1JpgGoodSize from 'asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/f1-good.jpg';
import f1JpgKornel from 'asset-url:static-build/posts/2020/09/avif-is-exciting/demos/f1-kornel.jpg';
import f1JpgKornelSize from 'asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/f1-kornel.jpg';
import f1AvifGood from 'asset-url:static-build/posts/2020/09/avif-is-exciting/demos/f1-good.avif';
import f1AvifGoodSize from 'asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/f1-good.avif';
import f1AvifNearLossless from 'asset-url:static-build/posts/2020/09/avif-is-exciting/demos/f1-near-lossless.avif';
import f1AvifNearLosslessSize from 'asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/f1-near-lossless.avif';

import teamAvifGood from 'asset-url:static-build/posts/2020/09/avif-is-exciting/demos/team-good.avif';
import teamAvifGoodSize from 'asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/team-good.avif';
import teamWebpGood from 'asset-url:static-build/posts/2020/09/avif-is-exciting/demos/team-good.webp';
import teamWebpGoodSize from 'asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/team-good.webp';
import teamPngGood from 'asset-url:static-build/posts/2020/09/avif-is-exciting/demos/team-good.png';
import teamPngGoodSize from 'asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/team-good.png';
import teamPngMatch from 'asset-url:static-build/posts/2020/09/avif-is-exciting/demos/team-match.png';
import teamPngMatchSize from 'asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/team-match.png';
import teamSvgGood from 'asset-url:static-build/posts/2020/09/avif-is-exciting/demos/team-traced.svg';
import teamSvgGoodSize from 'asset-pretty-size-br:static-build/posts/2020/09/avif-is-exciting/demos/team-traced.svg';
import teamAvifLossless from 'asset-url:static-build/posts/2020/09/avif-is-exciting/demos/team-lossless.avif';
import teamAvifLosslessSize from 'asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/team-lossless.avif';
import teamWebpMatch from 'asset-url:static-build/posts/2020/09/avif-is-exciting/demos/team-match.webp';
import teamWebpMatchSize from 'asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/team-match.webp';
import teamJpgMatch from 'asset-url:static-build/posts/2020/09/avif-is-exciting/demos/team-match.jpg';
import teamJpgMatchSize from 'asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/team-match.jpg';
import teamWebpLossless from 'asset-url:static-build/posts/2020/09/avif-is-exciting/demos/team-lossless.webp';
import teamWebpLosslessSize from 'asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/team-lossless.webp';

import carWebpGood from 'asset-url:static-build/posts/2020/09/avif-is-exciting/demos/car-good.webp';
import carWebpGoodSize from 'asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/car-good.webp';
import carAvifGood from 'asset-url:static-build/posts/2020/09/avif-is-exciting/demos/car-good.avif';
import carAvifGoodSize from 'asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/car-good.avif';
import carSvgGood from 'asset-url:static-build/posts/2020/09/avif-is-exciting/demos/car-good.svg';
import carSvgGoodSize from 'asset-pretty-size-br:static-build/posts/2020/09/avif-is-exciting/demos/car-good.svg';
import carPngGood from 'asset-url:static-build/posts/2020/09/avif-is-exciting/demos/car-good.png';
import carPngGoodSize from 'asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/car-good.png';
import carSvgOriginal from 'asset-url:static-build/posts/2020/09/avif-is-exciting/demos/car-original.svg';
import carSvgOriginalSize from 'asset-pretty-size-br:static-build/posts/2020/09/avif-is-exciting/demos/car-original.svg';
import carWebpMatch from 'asset-url:static-build/posts/2020/09/avif-is-exciting/demos/car-match.webp';
import carWebpMatchSize from 'asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/car-match.webp';
import carPngMatch from 'asset-url:static-build/posts/2020/09/avif-is-exciting/demos/car-match.png';
import carPngMatchSize from 'asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/car-match.png';

import machineWebpGood from 'asset-url:static-build/posts/2020/09/avif-is-exciting/demos/machine-good.webp';
import machineWebpGoodSize from 'asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/machine-good.webp';
import machineWebpDithered from 'asset-url:static-build/posts/2020/09/avif-is-exciting/demos/machine-dithered.webp';
import machineWebpDitheredSize from 'asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/machine-dithered.webp';
import machineWebpLossless from 'asset-url:static-build/posts/2020/09/avif-is-exciting/demos/machine-lossless.webp';
import machineWebpLosslessSize from 'asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/machine-lossless.webp';
import machineJpgGood from 'asset-url:static-build/posts/2020/09/avif-is-exciting/demos/machine-good.jpg';
import machineJpgGoodSize from 'asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/machine-good.jpg';
import machineAvifGood from 'asset-url:static-build/posts/2020/09/avif-is-exciting/demos/machine-good.avif';
import machineAvifGoodSize from 'asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/machine-good.avif';
import machineWebpMatch from 'asset-url:static-build/posts/2020/09/avif-is-exciting/demos/machine-match.webp';
import machineWebpMatchSize from 'asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/machine-match.webp';
import machineJpgMatch from 'asset-url:static-build/posts/2020/09/avif-is-exciting/demos/machine-match.jpg';
import machineJpgMatchSize from 'asset-pretty-size:static-build/posts/2020/09/avif-is-exciting/demos/machine-match.jpg';

import DecodedImg from 'shared/demos/2020/avif-is-exciting/DecodedImg';

const categories: {
  [category: string]:
    | { width: number; options: { [name: string]: string } }
    | undefined;
} = {
  f1: {
    width: 960,
    options: {
      [`AVIF - acceptable - ${f1AvifGoodSize}`]: f1AvifGood,
      [`WebP - acceptable - ${f1WebpGoodSize}`]: f1WebpGood,
      [`JPEG - acceptable - ${f1JpgGoodSize}`]: f1JpgGood,
      [`JPEG - Kornel powers - ${f1JpgKornelSize}`]: f1JpgKornel,
      [`WebP - ${f1WebpMatchSize}`]: f1WebpMatch,
      [`JPEG - ${f1JpgMatchSize}`]: f1JpgMatch,
      [`AVIF - near lossless - ${f1AvifNearLosslessSize}`]: f1AvifNearLossless,
    },
  },
  team: {
    width: 400,
    options: {
      [`AVIF - acceptable - ${teamAvifGoodSize}`]: teamAvifGood,
      [`WebP - 68 color lossless - ${teamWebpGoodSize}`]: teamWebpGood,
      [`PNG - 68 color lossless - ${teamPngGoodSize}`]: teamPngGood,
      [`AVIF - 68 color lossless - ${teamAvifLosslessSize}`]: teamAvifLossless,
      [`SVG - traced - ${teamSvgGoodSize}`]: teamSvgGood,
      [`WebP - lossy - ${teamWebpMatchSize}`]: teamWebpMatch,
      [`JPEG - ${teamJpgMatchSize}`]: teamJpgMatch,
      [`PNG - 9 color lossless - ${teamPngMatchSize}`]: teamPngMatch,
      [`WebP - full color lossless - ${teamWebpLosslessSize}`]: teamWebpLossless,
    },
  },
  car: {
    width: 500,
    options: {
      [`AVIF - acceptable - ${carAvifGoodSize}`]: carAvifGood,
      [`WebP - acceptable - ${carWebpGoodSize}`]: carWebpGood,
      [`PNG - 256 colour - ${carPngGoodSize}`]: carPngGood,
      [`WebP - ${carWebpMatchSize}`]: carWebpMatch,
      [`PNG - 12 colour - ${carPngMatchSize}`]: carPngMatch,
      [`SVG - SVGO'd - ${carSvgGoodSize}`]: carSvgGood,
      [`SVG - original - ${carSvgOriginalSize}`]: carSvgOriginal,
    },
  },
  machine: {
    width: 960,
    options: {
      [`AVIF - acceptable - ${machineAvifGoodSize}`]: machineAvifGood,
      [`WebP - acceptable - ${machineWebpGoodSize}`]: machineWebpGood,
      [`JPEG - acceptable - ${machineJpgGoodSize}`]: machineJpgGood,
      [`WebP - ${machineWebpMatchSize}`]: machineWebpMatch,
      [`JPEG - ${machineJpgMatchSize}`]: machineJpgMatch,
      [`WebP - 256 color lossless - ${machineWebpDitheredSize}`]: machineWebpDithered,
      [`WebP - full color lossless - ${machineWebpLosslessSize}`]: machineWebpLossless,
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
