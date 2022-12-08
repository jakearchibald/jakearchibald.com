import { Component, FunctionalComponent, h } from 'preact';
import { useSignal, useSignalEffect } from '@preact/signals';
import { useEffect, useLayoutEffect, useRef } from 'preact/hooks';

import { escapeStyleScriptContent } from 'shared/utils';
import { inline as styles } from 'css-bundle:./styles.css';
import { generateCircularArc } from './utils';

export const Styles: FunctionalComponent = () => (
  <style
    dangerouslySetInnerHTML={{ __html: escapeStyleScriptContent(styles) }}
  />
);

const arcRadius = 100;
const detourOffset = 100;
const taskSize = 23;
const rectSize = 18;
const speedyBlurParts = 40;
const circlePath =
  generateCircularArc({
    radius: arcRadius,
    startAngle: 0,
    endAngle: 180,
  }) +
  generateCircularArc({
    skipMove: true,
    radius: arcRadius,
    startAngle: 180,
    endAngle: 0,
  });

interface Props {
  initialState?: State;
  width: number;
  height: number;
}

interface State {
  showTaskPath: boolean;
  showRenderPath: boolean;
  mode: 'default' | 'speedy-spin';
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

  const speedyRectRefs = Array.from({ length: speedyBlurParts }, () =>
    useRef<SVGRectElement>(null),
  );

  useLayoutEffect(() => {
    if (mode.value === 'speedy-spin') {
      const duration = 191;

      const anims = speedyRectRefs.map((rectRef, i) => {
        rectRef.current!.style.offsetPath = `path("${circlePath}")`;
        const delay = (i / speedyBlurParts) * (1000 / 60);

        // Avoid a flash of the rects in the initial position (due to the delay)
        rectRef.current!.animate(
          {
            opacity: 0,
            offset: 0,
          },
          {
            duration: 100,
            fill: 'backwards',
            delay,
          },
        );

        return rectRef.current!.animate(
          { offsetDistance: ['0%', '100%'] },
          {
            easing: 'linear',
            iterations: Infinity,
            duration,
            delay,
          },
        );
      });
      return () => {
        for (const anim of anims) anim.cancel();
      };
    }
  }, [mode]);

  return (
    <div class="event-loop-container">
      <div
        class="event-loop-cropper"
        style={{ '--width': width, '--height': height }}
      >
        <svg
          class="event-loop-svg"
          viewBox={`${size / -2} ${size / -2} ${size} ${size}`}
        >
          <g class="event-loop-canvas">
            <g class="path-tracks">
              <path
                d={
                  generateCircularArc({
                    radius: arcRadius,
                    startAngle: 0,
                    endAngle: 180,
                  }) +
                  generateCircularArc({
                    skipMove: true,
                    radius: arcRadius,
                    startAngle: 180,
                    endAngle: 0,
                  })
                }
              />
              {showTaskPath.value && (
                <path
                  d={`M 0 ${arcRadius} l ${-detourOffset} 0 ${generateCircularArc(
                    {
                      midX: -detourOffset,
                      radius: arcRadius,
                      startAngle: 180,
                      endAngle: 270 - taskSize / 2,
                    },
                  )} ${generateCircularArc({
                    midX: -detourOffset,
                    radius: arcRadius,
                    startAngle: 270 + taskSize / 2,
                    endAngle: 0,
                  })} M ${-detourOffset} ${-arcRadius} l ${detourOffset} 0`}
                />
              )}
              {showRenderPath.value && (
                <path
                  d={`M 0 ${-arcRadius} l ${detourOffset} 0 ${generateCircularArc(
                    {
                      midX: detourOffset,
                      radius: arcRadius,
                      startAngle: 0,
                      endAngle: 180,
                    },
                  )} M ${detourOffset} ${arcRadius} l ${-detourOffset} 0`}
                />
              )}
            </g>
            {mode.value === 'speedy-spin' && !__PRERENDER__ && (
              <g
                class="speedy-spin-group"
                style={{ '--num-children': speedyBlurParts }}
              >
                {speedyRectRefs.map((rectRef, i) => (
                  <rect
                    ref={rectRef}
                    style={{ offsetPath: `path("M 0 ${-arcRadius}")` }}
                    class="processor"
                    x={rectSize / -2}
                    y={rectSize / -2}
                    width={rectSize}
                    height={rectSize}
                  />
                ))}
              </g>
            )}
          </g>
        </svg>
      </div>
    </div>
  );
};

export default EventLoop;
