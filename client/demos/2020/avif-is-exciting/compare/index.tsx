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
import f1WebpMatch from 'asset-url:static-build/posts/2020/08/avif-is-exciting/demos/f1/f1-match.webp';
import f1WebpGood from 'asset-url:static-build/posts/2020/08/avif-is-exciting/demos/f1/f1-good.webp';
import f1JpgMatch from 'asset-url:static-build/posts/2020/08/avif-is-exciting/demos/f1/f1-match.jpg';
import f1JpgGood from 'asset-url:static-build/posts/2020/08/avif-is-exciting/demos/f1/f1-good.jpg';
import f1AvifGood from 'asset-url:static-build/posts/2020/08/avif-is-exciting/demos/f1/f1-good.avif';
import f1AvifNearLossless from 'asset-url:static-build/posts/2020/08/avif-is-exciting/demos/f1/f1-near-lossless.avif';
import DecodedImg from './DecodedImg';

const categories: {
  [category: string]: { [name: string]: string } | undefined;
} = {
  f1: {
    'AVIF - acceptable - 18k': f1AvifGood,
    'WebP - acceptable - 39k': f1WebpGood,
    'JPEG - acceptable - 77k': f1JpgGood,
    'WebP - 22k': f1WebpMatch,
    'JPEG - 20k': f1JpgMatch,
    'AVIF - near lossless - 486k': f1AvifNearLossless,
  },
};

const images = Object.entries(
  categories[new URLSearchParams(location.search).get('show') || 'f1'] ||
    categories.f1!,
);

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
          left={<DecodedImg src={leftImgSrc} />}
          right={<DecodedImg src={rightImgSrc} />}
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
