import { FunctionalComponent, h } from 'preact';
import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import { useChangeEffect } from '../utils/use-change-effect';
import { usePrevious } from '../utils/use-previous';

interface Props {}

const width = 500;
const boxHeight = 50;
const gap = 3;

interface Box {
  label: string;
  share: number;
  initialX: number;
  class: string;
}

const boxKeyA: Box = {
  label: 'Key: A',
  class: 'key-a',
  share: 2.5,
  initialX: 151,
};

const boxRender: Box = {
  label: 'Render',
  class: 'render',
  share: 1,
  initialX: 272,
};

const boxClick: Box = {
  label: 'Click',
  class: 'click',
  share: 1.5,
  initialX: 189,
};

const boxKeyB: Box = {
  label: 'Key: B',
  class: 'key-b',
  share: 1,
  initialX: 254,
};

const boxesFinalOrder = [boxKeyA, boxRender, boxClick, boxKeyB];
const boxesDOMOrder = [boxKeyA, boxClick, boxKeyB, boxRender];

const boxSizeShareTotal = boxesFinalOrder.reduce(
  (total, box) => total + box.share,
  0,
);

const availableWidth = width - gap * (boxesFinalOrder.length - 1);

const boxWidthsMap = new Map<Box, number>(
  boxesDOMOrder.map((box) => [
    box,
    (box.share / boxSizeShareTotal) * availableWidth,
  ]),
);
const boxWidths = [...boxWidthsMap.values()];

const [finalOrderXs, sequenceOrderXs] = [boxesFinalOrder, boxesDOMOrder].map(
  (boxes) => {
    let latestX = 0;

    const map = new Map<Box, number>(
      boxes.map((box) => {
        const x = latestX;
        latestX += boxWidthsMap.get(box)! + gap;
        return [box, x];
      }),
    );

    if (boxes === boxesDOMOrder) return [...map.values()];
    return boxesDOMOrder.map((box) => map.get(box)!);
  },
);

const parallelXs = boxesDOMOrder.map((box) => box.initialX);

const height =
  boxHeight * boxesFinalOrder.length + gap * (boxesFinalOrder.length - 1);

const boxParallelYs = boxesDOMOrder.map(
  (box, i) => i * (boxHeight + gap) - height / 2,
);
const boxSequenceYs = boxesDOMOrder.map(() => boxHeight / -2);

const enum Phase {
  Parallel,
  Sequence,
  EarlyRender,
}

const EventOrdering: FunctionalComponent<Props> = () => {
  const boxRefs = Array.from({ length: boxesDOMOrder.length }, () =>
    useRef<SVGGElement>(null),
  );
  /*const boxCapturedTransforms = Array.from(
    { length: boxesDOMOrder.length },
    () => useRef<string>(),
  );*/
  const animQueue = useRef(Promise.resolve());
  const boxHiddenStates = Array.from({ length: boxesDOMOrder.length }, () =>
    useState<boolean>(true),
  );
  const [phase, setPhase] = useState<Phase>(Phase.Parallel);
  const previousPhase = usePrevious(phase);

  const [boxXs, boxYs] =
    phase === Phase.EarlyRender
      ? [finalOrderXs, boxSequenceYs]
      : phase === Phase.Sequence
      ? [sequenceOrderXs, boxSequenceYs]
      : [parallelXs, boxParallelYs];

  /*const captureBoxTransforms = () => {
    for (const [i, boxRef] of boxRefs.entries()) {
      boxCapturedTransforms[i].current = getComputedStyle(
        boxRef.current!,
      ).transform;
    }
  };*/

  useChangeEffect(() => {
    // Forward steps
    if (phase >= Phase.Sequence && previousPhase! < Phase.Sequence) {
      animQueue.current = animQueue.current
        .then(async () => {
          const animPromises = boxRefs.map(async (boxRef, i) => {
            await boxRef.current!.animate(
              {
                transform: [
                  `translate(${parallelXs[i]}px, ${boxParallelYs[i]}px)`,
                  `translate(${sequenceOrderXs[i]}px, ${boxParallelYs[i]}px)`,
                ],
              },
              {
                duration: 400,
                easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
                fill: 'backwards',
              },
            ).finished;
            await boxRef.current!.animate(
              {
                transform: [
                  `translate(${sequenceOrderXs[i]}px, ${boxParallelYs[i]}px)`,
                  `translate(${sequenceOrderXs[i]}px, ${boxSequenceYs[i]}px)`,
                ],
              },
              {
                delay: 50,
                duration: 400,
                easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
                fill: 'backwards',
              },
            ).finished;
          });

          await Promise.all(animPromises);
        })
        .catch(() => {});
    }
    if (phase >= Phase.EarlyRender && previousPhase! < Phase.EarlyRender) {
      animQueue.current = animQueue.current
        .then(async () => {
          const animPromises = boxRefs.map(async (boxRef, i) => {
            await boxRef.current!.animate(
              {
                transform: [
                  `translate(${sequenceOrderXs[i]}px, ${boxSequenceYs[i]}px)`,
                  `translate(${sequenceOrderXs[i]}px, ${
                    i === 0
                      ? boxSequenceYs[i]
                      : i === 3
                      ? -boxHeight - gap / 2
                      : gap / 2
                  }px)`,
                ],
              },
              {
                duration: 300,
                easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
                fill: 'backwards',
              },
            ).finished;

            await boxRef.current!.animate(
              {
                transform: [
                  `translate(${sequenceOrderXs[i]}px, ${
                    i === 0
                      ? boxSequenceYs[i]
                      : i === 3
                      ? -boxHeight - gap / 2
                      : gap / 2
                  }px)`,
                  `translate(${finalOrderXs[i]}px, ${
                    i === 0
                      ? boxSequenceYs[i]
                      : i === 3
                      ? -boxHeight - gap / 2
                      : gap / 2
                  }px)`,
                ],
              },
              {
                delay: 50,
                duration: 400,
                easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
                fill: 'backwards',
              },
            ).finished;

            await boxRef.current!.animate(
              {
                transform: [
                  `translate(${finalOrderXs[i]}px, ${
                    i === 0
                      ? boxSequenceYs[i]
                      : i === 3
                      ? -boxHeight - gap / 2
                      : gap / 2
                  }px)`,
                  `translate(${finalOrderXs[i]}px, ${boxSequenceYs[i]}px)`,
                ],
              },
              {
                delay: 50,
                duration: 300,
                easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
                fill: 'backwards',
              },
            ).finished;
          });

          await Promise.all(animPromises);
        })
        .catch(() => {});
    }

    // Backwards steps
    if (phase < Phase.EarlyRender && previousPhase! >= Phase.EarlyRender) {
      animQueue.current = animQueue.current
        .then(async () => {
          const animPromises = boxRefs.map(async (boxRef, i) => {
            await boxRef.current!.animate(
              {
                transform: [
                  `translate(${finalOrderXs[i]}px, ${boxSequenceYs[i]}px)`,
                  `translate(${finalOrderXs[i]}px, ${
                    i === 0
                      ? boxSequenceYs[i]
                      : i === 3
                      ? -boxHeight - gap / 2
                      : gap / 2
                  }px)`,
                ],
              },
              {
                duration: 300,
                easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
                fill: 'backwards',
              },
            ).finished;

            await boxRef.current!.animate(
              {
                transform: [
                  `translate(${finalOrderXs[i]}px, ${
                    i === 0
                      ? boxSequenceYs[i]
                      : i === 3
                      ? -boxHeight - gap / 2
                      : gap / 2
                  }px)`,
                  `translate(${sequenceOrderXs[i]}px, ${
                    i === 0
                      ? boxSequenceYs[i]
                      : i === 3
                      ? -boxHeight - gap / 2
                      : gap / 2
                  }px)`,
                ],
              },
              {
                delay: 50,
                duration: 400,
                easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
                fill: 'backwards',
              },
            ).finished;

            await boxRef.current!.animate(
              {
                transform: [
                  `translate(${sequenceOrderXs[i]}px, ${
                    i === 0
                      ? boxSequenceYs[i]
                      : i === 3
                      ? -boxHeight - gap / 2
                      : gap / 2
                  }px)`,
                  `translate(${sequenceOrderXs[i]}px, ${boxSequenceYs[i]}px)`,
                ],
              },
              {
                delay: 50,
                duration: 300,
                easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
                fill: 'backwards',
              },
            ).finished;
          });

          await Promise.all(animPromises);
        })
        .catch(() => {});
    }
    if (phase < Phase.Sequence && previousPhase! >= Phase.Sequence) {
      animQueue.current = animQueue.current
        .then(async () => {
          const animPromises = boxRefs.map(async (boxRef, i) => {
            await boxRef.current!.animate(
              {
                transform: [
                  `translate(${sequenceOrderXs[i]}px, ${boxSequenceYs[i]}px)`,
                  `translate(${sequenceOrderXs[i]}px, ${boxParallelYs[i]}px)`,
                ],
              },
              {
                duration: 400,
                easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
                fill: 'backwards',
              },
            ).finished;

            await boxRef.current!.animate(
              {
                transform: [
                  `translate(${sequenceOrderXs[i]}px, ${boxParallelYs[i]}px)`,
                  `translate(${parallelXs[i]}px, ${boxParallelYs[i]}px)`,
                ],
              },

              {
                delay: 50,
                duration: 400,
                easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
                fill: 'backwards',
              },
            ).finished;
          });

          await Promise.all(animPromises);
        })
        .catch(() => {});
    }
  }, [phase]);

  useEffect(() => {
    setAPI('event-ordering', {
      showBoxesPhase(num: number) {
        for (const [i, [_, setBoxHidden]] of boxHiddenStates.entries()) {
          setBoxHidden(i >= num);
        }
        setPhase(Phase.Parallel);
      },
      sequencePhase() {
        for (const [_, setBoxHidden] of boxHiddenStates) {
          setBoxHidden(false);
        }
        setPhase(Phase.Sequence);
      },
      finalPhase() {
        for (const [_, setBoxHidden] of boxHiddenStates) {
          setBoxHidden(false);
        }
        setPhase(Phase.EarlyRender);
      },
    });
  }, []);

  return (
    <svg
      class="event-ordering-svg"
      viewBox={`0 ${height / -2} ${width} ${height}`}
    >
      {boxesDOMOrder.map((box, i) => (
        <g
          ref={boxRefs[i]}
          class={['event-ordering-item', box.class].join(' ')}
          transform={`translate(${boxXs[i]} ${boxYs[i]})`}
        >
          <g
            class={[
              'event-ordering-item-hider',
              boxHiddenStates[i][0] && 'hidden',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <rect width={boxWidths[i]} height={boxHeight} />
            <text class="event-ordering-label" x="10" y={boxHeight / 2}>
              {box.label}
            </text>
          </g>
        </g>
      ))}
    </svg>
  );
};

export default EventOrdering;
