import { FunctionalComponent, h } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';
import { useSignal, useComputed } from '@preact/signals';

import { circlePath, rectSize, arcRadius, svgNS } from '../utils';

const speedyBlurParts = 40;
const fastDuration = 191;
const circleLength = 2 * Math.PI * arcRadius;
const fastDistancePerMs = circleLength / fastDuration;
const slowDistancePerMs = 0.18;
const speedChangeDuration = 3000;

// cubic-bezier(0.45, 0, 0.55, 1)

function easeInOutQuad(x: number): number {
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

interface Props {}

const SpeedyLoop: FunctionalComponent<Props> = ({}) => {
  const speedMode = useSignal<'fast' | 'slow'>('fast');
  const speed = useSignal(fastDistancePerMs);
  const playbackRate = useComputed(() => speed.value / fastDistancePerMs);
  const maxBlurOffset = useComputed(() => -speed.value * (1000 / 60));

  const spinnerRef = useRef<SVGGElement>(null);
  const animRef = useRef<Animation | null>(null);

  useLayoutEffect(() => {
    animRef.current = spinnerRef.current!.animate(
      {
        rotate: ['0turn', '1turn'],
      },
      {
        easing: 'linear',
        iterations: Infinity,
        duration: fastDuration,
      },
    );
  }, []);

  useLayoutEffect(() => {
    const currentSpeed = speed.value;
    const targetSpeed =
      speedMode.value === 'fast' ? fastDistancePerMs : slowDistancePerMs;
    const startTime = performance.now();
    let frameId: number;

    function updateSpeed() {
      const time = performance.now() - startTime;
      const progress = Math.min(time / speedChangeDuration, 1);
      const easedProgress = easeInOutQuad(progress);
      speed.value = currentSpeed + (targetSpeed - currentSpeed) * easedProgress;
      if (progress !== 1) frameId = requestAnimationFrame(updateSpeed);
    }

    frameId = requestAnimationFrame(updateSpeed);
    return () => cancelAnimationFrame(frameId);
  }, [speedMode.value]);

  useLayoutEffect(() => {
    const anim = animRef.current;
    if (!anim) return;
    anim.updatePlaybackRate(playbackRate.value);
  }, [playbackRate.value]);

  return (
    <g
      class="speedy-spin-group"
      style={{ '--num-children': speedyBlurParts }}
      ref={spinnerRef}
    >
      {Array.from({ length: speedyBlurParts }, (_, i) => (
        <rect
          style={{
            offsetPath: `path("${circlePath(arcRadius)}")`,
            offsetDistance: `${maxBlurOffset.value * (i / speedyBlurParts)}px`,
          }}
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
