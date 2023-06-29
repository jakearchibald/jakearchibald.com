import { FunctionalComponent, h } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';
import { useSignal, useComputed } from '@preact/signals';

import { circlePath, rectSize, arcRadius, slowDistancePerMs } from '../utils';
import { useSignalLayoutEffect } from '../../utils/use-signal-layout-effect';

const speedyBlurParts = 40;
const fastDuration = 191;
const circleLength = 2 * Math.PI * arcRadius;
const fastDistancePerMs = circleLength / fastDuration;
const speedChangeDuration = 1500;

function easeInOutQuad(x: number): number {
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

interface Props {
  speedMode: 'fast' | 'slow';
  onSlowIteration: () => void;
}

const SpeedyLoop: FunctionalComponent<Props> = ({
  speedMode,
  onSlowIteration,
}) => {
  const speed = useSignal(
    speedMode === 'fast' ? fastDistancePerMs : slowDistancePerMs,
  );
  const playbackRate = useComputed(() => speed.value / fastDistancePerMs);
  const maxBlurOffset = useComputed(() => -speed.value * (1000 / 60));

  const spinnerRef = useRef<SVGGElement>(null);
  const animRef = useRef<Animation | null>(null);

  useLayoutEffect(() => {
    const startAnimation = () => {
      const anim = spinnerRef.current!.animate(
        {
          transform: ['rotate(0turn)', 'rotate(1turn)'],
        },
        {
          easing: 'linear',
          iterations: speed.value < 1 ? 1 : Infinity,
          duration: fastDuration,
        },
      );

      anim.playbackRate = playbackRate.value;

      anim.finished.then(() => {
        if (!spinnerRef.current) return;
        onSlowIteration();
        startAnimation();
      });

      animRef.current = anim;
    };

    startAnimation();
  }, []);

  useLayoutEffect(() => {
    const currentSpeed = speed.value;
    const targetSpeed =
      speedMode === 'fast' ? fastDistancePerMs : slowDistancePerMs;

    if (currentSpeed === targetSpeed) return;

    // If going from slow to fast, set iterations to infinite
    if (speedMode === 'fast') {
      animRef.current!.effect!.updateTiming({ iterations: Infinity });
    }

    const startTime = performance.now();
    let frameId: number;

    function updateSpeed() {
      const time = performance.now() - startTime;
      const progress = Math.min(time / speedChangeDuration, 1);
      const easedProgress = easeInOutQuad(progress);
      speed.value = currentSpeed + (targetSpeed - currentSpeed) * easedProgress;

      if (progress !== 1) {
        frameId = requestAnimationFrame(updateSpeed);
        return;
      }

      // If going from fast to slow, wait for speed change to complete,
      // then set iterations to current + 1
      if (speedMode === 'slow' && progress === 1) {
        animRef.current!.effect!.updateTiming({
          iterations:
            animRef.current!.effect!.getComputedTiming().currentIteration! + 1,
        });
      }
    }

    frameId = requestAnimationFrame(updateSpeed);
    return () => cancelAnimationFrame(frameId);
  }, [speedMode]);

  useSignalLayoutEffect(() => {
    const anim = animRef.current;
    if (!anim) return;
    anim.updatePlaybackRate(playbackRate.value);
  });

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
