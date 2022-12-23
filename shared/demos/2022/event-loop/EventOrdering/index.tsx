import { FunctionalComponent, h } from 'preact';
import { StateUpdater, useEffect, useRef, useState } from 'preact/hooks';

interface Props {}

const width = 500;
const boxHeight = 50;
const gap = 3;

interface Box {
  label: string;
  share: number;
  initialX: number;
  render?: boolean;
}

const boxKeyA: Box = {
  label: 'Key: A',
  share: 2.5,
  initialX: 151,
};

const boxRender: Box = {
  label: 'Render',
  share: 1,
  render: true,
  initialX: 272,
};

const boxClick: Box = {
  label: 'Click',
  share: 1.5,
  initialX: 189,
};

const boxKeyB: Box = {
  label: 'Key: B',
  share: 1,
  initialX: 254,
};

const boxesFinalOrder = [boxKeyA, boxRender, boxClick, boxKeyB];
const boxesSequenceOrder = [boxKeyA, boxClick, boxKeyB, boxRender];

const boxSizeShareTotal = boxesFinalOrder.reduce(
  (total, box) => total + box.share,
  0,
);

const availableWidth = width - gap * (boxesFinalOrder.length - 1);

const boxWidths = new Map<Box, number>(
  boxesFinalOrder.map((box) => [
    box,
    (box.share / boxSizeShareTotal) * availableWidth,
  ]),
);

const [finalOrderXs, sequenceOrderXs] = [
  boxesFinalOrder,
  boxesSequenceOrder,
].map((boxes) => {
  let latestX = 0;

  return new Map<Box, number>(
    boxes.map((box) => {
      const x = latestX;
      latestX += boxWidths.get(box)! + gap;
      return [box, x];
    }),
  );
});

const height =
  boxHeight * boxesFinalOrder.length + gap * (boxesFinalOrder.length - 1);

const boxParallelYs = new Map<Box, number>(
  boxesSequenceOrder.map((box, i) => [box, i * (boxHeight + gap) - height / 2]),
);

const EventOrdering: FunctionalComponent<Props> = () => {
  const boxRefs = Array.from({ length: boxesSequenceOrder.length }, () =>
    useRef<SVGGElement>(null),
  );
  const boxHiddenState = new Map<Box, [boolean, StateUpdater<boolean>]>(
    boxesSequenceOrder.map((box) => [box, useState(true)]),
  );
  const [queueBoxes, setQueueBoxes] = useState<boolean>(false);
  const [useFinalOrder, setUseFinalOrder] = useState<boolean>(false);

  useEffect(() => {
    setAPI('event-ordering', {
      showBoxesPhase(num: number) {
        for (const [i, [_, setBoxHidden]] of [
          ...boxHiddenState.values(),
        ].entries()) {
          setBoxHidden(i >= num);
        }
      },
    });
  }, []);

  return (
    <svg
      class="event-ordering-svg"
      viewBox={`0 ${height / -2} ${width} ${height}`}
    >
      {boxesSequenceOrder.map((box, i) => (
        <g
          ref={boxRefs[i]}
          style={{
            transform: `translate(${box.initialX}px, ${boxParallelYs.get(
              box,
            )!}px)`,
          }}
        >
          <g
            class={[
              'event-ordering-item-hider',
              boxHiddenState.get(box)![0] && 'hidden',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <rect
              class={
                box.render ? 'event-ordering-render' : 'event-ordering-task'
              }
              width={boxWidths.get(box)!}
              height={boxHeight}
            />
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
