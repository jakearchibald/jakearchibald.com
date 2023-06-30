import { FunctionalComponent, h } from 'preact';
import { computed, useSignal } from '@preact/signals';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'preact/hooks';

import { escapeStyleScriptContent } from 'shared/utils';
import { inline as styles } from 'css-bundle:./styles.css';
import {
  arcRadius,
  circlePath,
  circularArcPath,
  rectSize,
  slowDistancePerMs,
} from './utils';
import SpeedyLoop from './SpeedyLoop';
import PauseOutOfViewAnims from '../PauseOutOfViewAnims';
import usePhases from '../utils/use-phases';
import Door from './Door';

export const Styles: FunctionalComponent = () => (
  <style
    dangerouslySetInnerHTML={{ __html: escapeStyleScriptContent(styles) }}
  />
);

const detourOffset = 100;
const taskSize = 23;
const taskPath = `M 0 ${arcRadius} l ${-detourOffset} 0 ${circularArcPath({
  skipMove: true,
  midX: -detourOffset,
  radius: arcRadius,
  startAngle: 180,
  endAngle: 270 - taskSize / 2,
})} ${circularArcPath({
  midX: -detourOffset,
  radius: arcRadius,
  startAngle: 270 + taskSize / 2,
  endAngle: 0,
})} M ${-detourOffset} ${-arcRadius} l ${detourOffset} 0`;
const renderPath = `M 0 ${-arcRadius} l ${detourOffset} 0 ${circularArcPath({
  skipMove: true,
  midX: detourOffset,
  radius: arcRadius,
  startAngle: 0,
  endAngle: 180,
})} M ${detourOffset} ${arcRadius} l ${-detourOffset} 0`;

const animPaths = {
  'bypass-task': {
    path: circularArcPath({
      radius: arcRadius,
      startAngle: 180,
      endAngle: 0,
    }),
    length: Math.PI * arcRadius,
  },
  'bypass-render': {
    path: circularArcPath({
      radius: arcRadius,
      startAngle: 0,
      endAngle: 180,
    }),
    length: Math.PI * arcRadius,
  },
} as const;

interface Props {
  apiName: string;
  initialState?: Partial<State>;
  width: number;
  height: number;
}

interface State {
  showTaskPath: boolean;
  showRenderPath: boolean;
  speedPhase: SpeedPhase;
}

const speedPhases = ['speedy', 'slowdown', 'slow'] as const;
type SpeedPhase = typeof speedPhases[number];
const speedPhaseIndexes = Object.fromEntries(
  speedPhases.map((val, i) => [val, i]),
);

type Position = 'speeding' | 'bypass-render' | 'bypass-task';

const EventLoop: FunctionalComponent<Props> = ({
  width,
  height,
  initialState,
  apiName,
}) => {
  const size = useMemo(() => Math.max(width, height), [width, height]);
  const showTaskPath = useSignal(initialState?.showTaskPath ?? false);
  const showRenderPath = useSignal(initialState?.showRenderPath ?? false);
  const position = useRef<Position>(
    initialState?.speedPhase === 'slow' ? 'bypass-task' : 'speeding',
  );

  const processorRef = useRef<SVGRectElement>(null);

  const [
    speedPhase,
    lastSpeedPhase,
    setTargetSpeedPhase,
    speedPhaseChangeHandled,
  ] = usePhases(speedPhases, initialState?.speedPhase ?? 'slow');

  const taskPathStyle = computed(
    () => `opacity: ${showTaskPath.value ? '1' : '0'}`,
  );
  const renderPathStyle = computed(
    () => `opacity: ${showRenderPath.value ? '1' : '0'}`,
  );

  const advanceProcessor = () => {
    if (!processorRef.current) return;

    // Figure out the next position
    if (position.current === 'bypass-task' || position.current === 'speeding') {
      position.current = 'bypass-render';
    } else if (position.current === 'bypass-render') {
      position.current = 'bypass-task';
    }

    // Set up the next animation
    const animData = animPaths[position.current];
    processorRef.current.style.offsetPath = `path("${animData.path}")`;

    const anim = processorRef.current.animate(
      { offsetDistance: ['0%', '100%'] },
      { duration: animData.length / slowDistancePerMs, easing: 'linear' },
    );

    anim.finished.then(() => advanceProcessor());
  };

  useLayoutEffect(() => {
    if (speedPhase !== 'slow') {
      position.current = 'speeding';
    }

    if (speedPhaseIndexes[speedPhase] < speedPhaseIndexes[lastSpeedPhase]) {
      speedPhaseChangeHandled();
      return;
    }

    if (speedPhase === 'slow') {
      speedPhaseChangeHandled();
      advanceProcessor();
      return;
    }
  }, [speedPhase]);

  useEffect(() => {
    setAPI(apiName, {
      setSpeedPhase(phase: SpeedPhase) {
        setTargetSpeedPhase(phase);
      },
      showTaskPath(show: boolean) {
        showTaskPath.value = show;
      },
      showRenderPath(show: boolean) {
        showTaskPath.value = show;
      },
    });
  }, []);

  return (
    <div class="event-loop-container">
      <div
        class="event-loop-cropper"
        style={{ '--width': width, '--height': height }}
      >
        <PauseOutOfViewAnims>
          <svg
            class="event-loop-svg"
            viewBox={`${size / -2} ${size / -2} ${size} ${size}`}
          >
            <g class="event-loop-canvas">
              <g class="path-tracks">
                <path d={circlePath(arcRadius)} />
                <path style={taskPathStyle} d={taskPath} />
                <path style={renderPathStyle} d={renderPath} />
              </g>
              {speedPhaseIndexes[speedPhase] < speedPhaseIndexes['slow'] ? (
                !__PRERENDER__ && (
                  <SpeedyLoop
                    speedMode={speedPhase === 'speedy' ? 'fast' : 'slow'}
                    onSlowIteration={() => speedPhaseChangeHandled()}
                  />
                )
              ) : speedPhase === 'slow' ? (
                <rect
                  ref={processorRef}
                  class="processor"
                  x={rectSize / -2}
                  y={rectSize / -2}
                  width={rectSize}
                  height={rectSize}
                />
              ) : null}
              <g class="task-door" style={taskPathStyle}>
                <Door open={false} />
              </g>
            </g>
          </svg>
        </PauseOutOfViewAnims>
      </div>
    </div>
  );
};

export default EventLoop;
