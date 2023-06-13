import { FunctionalComponent, h } from 'preact';
import { computed, useSignal } from '@preact/signals';

import { escapeStyleScriptContent } from 'shared/utils';
import { inline as styles } from 'css-bundle:./styles.css';
import { arcRadius, circlePath, circularArcPath } from './utils';
import SpeedyLoop from './SpeedyLoop';
import WhenIntersecting from '../WhenIntersecting';

export const Styles: FunctionalComponent = () => (
  <style
    dangerouslySetInnerHTML={{ __html: escapeStyleScriptContent(styles) }}
  />
);

const detourOffset = 100;
const taskSize = 23;

interface Props {
  initialState?: State;
  width: number;
  height: number;
}

interface State {
  showTaskPath: boolean;
  showRenderPath: boolean;
  mode: 'default' | 'speedy-spin' | 'speedy-spin-slowdown';
}

const EventLoop: FunctionalComponent<Props> = ({
  width,
  height,
  initialState,
}) => {
  const size = Math.max(width, height);
  const showTaskPath = useSignal(initialState?.showTaskPath ?? false);
  const showRenderPath = useSignal(initialState?.showRenderPath ?? false);
  const mode = useSignal(initialState?.mode ?? 'default');

  const taskPathStyle = computed(
    () => `opacity: ${showTaskPath.value ? '1' : '0'}`,
  );
  const renderPathStyle = computed(
    () => `opacity: ${showRenderPath.value ? '1' : '0'}`,
  );

  return (
    <div class="event-loop-container">
      <div
        class="event-loop-cropper"
        style={{ '--width': width, '--height': height }}
      >
        <WhenIntersecting>
          <svg
            class="event-loop-svg"
            viewBox={`${size / -2} ${size / -2} ${size} ${size}`}
          >
            <g class="event-loop-canvas">
              <g class="path-tracks">
                <path d={circlePath(arcRadius)} />
                <path
                  style={taskPathStyle}
                  d={`M 0 ${arcRadius} l ${-detourOffset} 0 ${circularArcPath({
                    midX: -detourOffset,
                    radius: arcRadius,
                    startAngle: 180,
                    endAngle: 270 - taskSize / 2,
                  })} ${circularArcPath({
                    midX: -detourOffset,
                    radius: arcRadius,
                    startAngle: 270 + taskSize / 2,
                    endAngle: 0,
                  })} M ${-detourOffset} ${-arcRadius} l ${detourOffset} 0`}
                />
                <path
                  style={renderPathStyle}
                  d={`M 0 ${-arcRadius} l ${detourOffset} 0 ${circularArcPath({
                    midX: detourOffset,
                    radius: arcRadius,
                    startAngle: 0,
                    endAngle: 180,
                  })} M ${detourOffset} ${arcRadius} l ${-detourOffset} 0`}
                />
              </g>
              {(mode.value === 'speedy-spin' ||
                mode.value === 'speedy-spin-slowdown') &&
                !__PRERENDER__ && (
                  <SpeedyLoop
                    speedMode={
                      mode.value === 'speedy-spin-slowdown' ? 'slow' : 'fast'
                    }
                  />
                )}
            </g>
          </svg>
        </WhenIntersecting>
      </div>
    </div>
  );
};

export default EventLoop;
