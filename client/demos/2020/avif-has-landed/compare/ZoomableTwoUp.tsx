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
import type PinchZoom from 'pinch-zoom-element';

import { Component, h, createRef, VNode } from 'preact';
import 'two-up-element';
import 'pinch-zoom-element';

interface Props {
  left: VNode;
  right: VNode;
}

interface State {
  desktopMode: boolean;
}

const desktopMedia = matchMedia('(min-width: 550px)');

export default class ZoomableTwoUp extends Component<Props, State> {
  state: State = {
    desktopMode: desktopMedia.matches,
  };

  private _retargetedEvents = new WeakSet<Event>();
  private _pinchZoomLeft = createRef<PinchZoom>();
  private _pinchZoomRight = createRef<PinchZoom>();
  /**
   * We're using two pinch zoom elements, but we want them to stay in sync. When one moves, we
   * update the position of the other. However, this is tricky when it comes to multi-touch, when
   * one finger is on one pinch-zoom, and the other finger is on the other. To overcome this, we
   * redirect all relevant pointer/touch/mouse events to the first pinch zoom element.
   *
   * @param event Event to redirect
   */
  private _onRetargetableEvent = (event: Event) => {
    const targetEl = event.target as HTMLElement;
    if (!this._pinchZoomLeft.current) throw Error('Missing pinch-zoom element');
    // If the event is on the handle of the two-up, let it through,
    // unless it's a wheel event, in which case always let it through.
    if (event.type !== 'wheel' && !targetEl.closest(`pinch-zoom`)) return;
    // If we've already retargeted this event, let it through.
    if (this._retargetedEvents.has(event)) return;
    // Stop the event in its tracks.
    event.stopImmediatePropagation();
    event.preventDefault();
    // Clone the event & dispatch
    // Some TypeScript trickery needed due to https://github.com/Microsoft/TypeScript/issues/3841
    const clonedEvent = new (event.constructor as typeof Event)(
      event.type,
      event,
    );
    this._retargetedEvents.add(clonedEvent);
    this._pinchZoomLeft.current.dispatchEvent(clonedEvent);

    // Unfocus any active element on touchend. This fixes an issue on (at least) Android Chrome,
    // where the software keyboard is hidden, but the input remains focused, then after interaction
    // with this element the keyboard reappears for NO GOOD REASON. Thanks Android.
    if (
      event.type === 'touchend' &&
      document.activeElement &&
      document.activeElement instanceof HTMLElement
    ) {
      document.activeElement.blur();
    }
  };

  private _onPinchZoomLeftChange = () => {
    if (!this._pinchZoomRight.current || !this._pinchZoomLeft.current) {
      throw Error('Missing pinch-zoom element');
    }

    this._pinchZoomRight.current.setTransform({
      scale: this._pinchZoomLeft.current.scale,
      x: this._pinchZoomLeft.current.x,
      y: this._pinchZoomLeft.current.y,
    });
  };

  private _onMediaChange = () => {
    this.setState({ desktopMode: desktopMedia.matches });
  };

  componentDidMount() {
    desktopMedia.addListener(this._onMediaChange);
  }

  componentWillUnmount() {
    desktopMedia.removeListener(this._onMediaChange);
  }

  render({ left, right }: Props, { desktopMode }: State) {
    return (
      <two-up
        orientation={desktopMode ? 'horizontal' : 'vertical'}
        class="two-up"
        onTouchStartCapture={this._onRetargetableEvent}
        onTouchEndCapture={this._onRetargetableEvent}
        onTouchMoveCapture={this._onRetargetableEvent}
        onPointerDownCapture={this._onRetargetableEvent}
        onMouseDownCapture={this._onRetargetableEvent}
        onWheelCapture={this._onRetargetableEvent}
      >
        <pinch-zoom
          class="pinch-zoom"
          ref={this._pinchZoomLeft}
          onChange={this._onPinchZoomLeftChange}
        >
          <div>{left}</div>
        </pinch-zoom>
        <pinch-zoom class="pinch-zoom" ref={this._pinchZoomRight}>
          <div>{right}</div>
        </pinch-zoom>
      </two-up>
    );
  }
}
