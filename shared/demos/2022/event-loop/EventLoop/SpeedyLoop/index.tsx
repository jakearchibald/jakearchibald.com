import { FunctionalComponent, h } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';

import { circlePath, rectSize, arcRadius } from '../utils';

const speedyBlurParts = 40;

interface Props {}

const SpeedyLoop: FunctionalComponent<Props> = ({}) => {
  const speedyRectRefs = Array.from({ length: speedyBlurParts }, () =>
    useRef<SVGRectElement>(null),
  );

  useLayoutEffect(() => {
    const duration = 191;

    const anims = speedyRectRefs.map((rectRef, i) => {
      rectRef.current!.style.offsetPath = `path("${circlePath(arcRadius)}")`;
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
  }, []);

  return (
    <g class="speedy-spin-group" style={{ '--num-children': speedyBlurParts }}>
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
  );
};

export default SpeedyLoop;
