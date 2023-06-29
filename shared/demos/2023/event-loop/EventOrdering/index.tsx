import { FunctionalComponent, h, Fragment } from 'preact';
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'preact/hooks';
import useOnResize from '../utils/use-on-resize';
import { useChangeEffect } from '../utils/use-change-effect';
import usePhases from '../utils/use-phases';
import getStyles, { StyleInfo } from '../utils/get-styles';

interface Props {}

const phases = [
  'initial',
  'parallel',
  'ordering',
  'ordered',
  'reordering-1',
  'reordering-2',
  'reordered',
] as const;
type Phase = typeof phases[number];
const phaseIndexes = Object.fromEntries(phases.map((val, i) => [val, i]));

const EventOrdering: FunctionalComponent<Props> = () => {
  const root = useRef<HTMLDivElement>(null);
  const [phase, lastPhase, setTargetPhase, phaseChangeHandled] =
    usePhases(phases);

  const els = Array.from({ length: 4 }, () =>
    useRef<HTMLDivElement | null>(null),
  );

  // Having to reimplement refs due to bugs in Preact's ref system
  useLayoutEffect(() => {
    for (const [i, className] of [
      'ref-keyA',
      'ref-click',
      'ref-keyB',
      'ref-render',
    ].entries()) {
      const el = root.current?.querySelector<HTMLDivElement>(`.${className}`);
      els[i].current = el || null;
    }
  });

  const lastStylesRef = useRef<(StyleInfo | null)[] | null>(null);

  lastStylesRef.current = els.map((elRef) => {
    if (!elRef.current) return null;
    return getStyles(elRef.current);
  });

  useEffect(() => {
    setAPI('event-ordering', {
      setPhase(phase: Phase) {
        setTargetPhase(phase);
      },
    });
  }, []);

  useChangeEffect(() => {
    const lastStyles = lastStylesRef.current!;
    const currentStyles = els.map((elRef) => {
      if (!elRef.current) return null;
      return getStyles(elRef.current);
    });

    const animations: Animation[] = [];
    let fadedIn = 0;

    for (const [i, elRef] of els.entries()) {
      const el = elRef.current;
      const lastStyle = lastStyles[i];

      if (!lastStyle || !el) continue;

      const currentStyle = currentStyles[i]!;

      if (lastStyle.opacity === '0' && currentStyle.opacity === '1') {
        animations.push(
          el.animate(
            {
              offset: 0,
              opacity: lastStyle.opacity,
              transform: 'scale(0.4)',
            },
            {
              duration: 300,
              delay: fadedIn * 200,
              easing: 'cubic-bezier(0.33, 1, 0.68, 1)', // easeOutCubic
              fill: 'backwards',
            },
          ),
        );

        fadedIn++;
      } else {
        animations.push(
          el.animate(
            { offset: 0, opacity: lastStyle.opacity },
            {
              duration: 300,
              easing: 'cubic-bezier(0.33, 1, 0.68, 1)', // easeOutCubic
              fill: 'backwards',
            },
          ),
        );
      }

      if (
        lastStyle.rect.left !== currentStyle.rect.left ||
        lastStyle.rect.top !== currentStyle.rect.top
      ) {
        animations.push(
          el.animate(
            {
              offset: 0,
              transform: `translate(${
                lastStyle.rect.left - currentStyle.rect.left
              }px, ${lastStyle.rect.top - currentStyle.rect.top}px)`,
            },
            {
              duration: 400,
              easing: 'cubic-bezier(0.65, 0, 0.35, 1)', // easeInOutCubic
              fill: 'backwards',
            },
          ),
        );
      }
    }

    Promise.all(animations.map((anim) => anim.finished)).then(() =>
      phaseChangeHandled(),
    );
  }, [phase]);

  return (
    <div ref={root} class="threading-diagram">
      <div class="inner" style="aspect-ratio: 603 / 228; font-size: 3.9cqw">
        <div class="rows">
          {phaseIndexes[phase] <= phaseIndexes['parallel'] ? (
            <>
              <div class="row">
                <div
                  style={{
                    width: '37cqw',
                    marginLeft: '33cqw',
                    opacity: phase === 'parallel' ? '1' : '0',
                  }}
                  class="timeline-item ref-keyA"
                >
                  Key: A
                </div>
              </div>
              <div class="row">
                <div
                  style={{
                    width: '23cqw',
                    marginLeft: '39cqw',
                    opacity: phase === 'parallel' ? '1' : '0',
                  }}
                  class="timeline-item ref-click"
                >
                  Click
                </div>
              </div>
              <div class="row">
                <div
                  style={{
                    width: '18cqw',
                    marginLeft: '48cqw',
                    opacity: phase === 'parallel' ? '1' : '0',
                  }}
                  class="timeline-item ref-keyB"
                >
                  Key: B
                </div>
              </div>
              <div class="row">
                <div
                  style={{
                    width: '19cqw',
                    marginLeft: '52cqw',
                    opacity: phase === 'parallel' ? '1' : '0',
                  }}
                  class="timeline-item render-item ref-render"
                >
                  Render
                </div>
              </div>
            </>
          ) : phase === 'ordering' ? (
            <>
              <div class="row">
                <div style={{ width: '37cqw' }} class="timeline-item ref-keyA">
                  Key: A
                </div>
              </div>
              <div class="row">
                <div
                  style={{ width: '37cqw', visibility: 'hidden' }}
                  class="timeline-item"
                >
                  Key: A
                </div>
                <div style={{ width: '23cqw' }} class="timeline-item ref-click">
                  Click
                </div>
              </div>
              <div class="row">
                <div
                  style={{ width: '37cqw', visibility: 'hidden' }}
                  class="timeline-item"
                >
                  Key: A
                </div>
                <div
                  style={{ width: '23cqw', visibility: 'hidden' }}
                  class="timeline-item"
                >
                  Click
                </div>
                <div style={{ width: '18cqw' }} class="timeline-item ref-keyB">
                  Key: B
                </div>
              </div>
              <div class="row">
                <div
                  style={{ width: '37cqw', visibility: 'hidden' }}
                  class="timeline-item"
                >
                  Key: A
                </div>
                <div
                  style={{ width: '23cqw', visibility: 'hidden' }}
                  class="timeline-item"
                >
                  Click
                </div>
                <div
                  style={{ width: '18cqw', visibility: 'hidden' }}
                  class="timeline-item"
                >
                  Key: B
                </div>
                <div
                  style={{ width: '19cqw' }}
                  class="timeline-item render-item ref-render"
                >
                  Render
                </div>
              </div>
            </>
          ) : phaseIndexes[phase] <= phaseIndexes['reordering-1'] ? (
            <div class="row">
              <div
                style={{
                  width: '37cqw',
                }}
                class="timeline-item ref-keyA"
              >
                Key: A
              </div>
              <div class="row">
                <div
                  style={{
                    width: '23cqw',
                    gridRow: phase === 'reordering-1' ? '2' : '1',
                  }}
                  class="timeline-item ref-click"
                >
                  Click
                </div>
                <div
                  style={{
                    width: '18cqw',
                    gridRow: phase === 'reordering-1' ? '2' : '1',
                  }}
                  class="timeline-item ref-keyB"
                >
                  Key: B
                </div>
                <div
                  style={{
                    width: '19cqw',
                    gridRow: '1',
                  }}
                  class="timeline-item render-item ref-render"
                >
                  Render
                </div>
              </div>
            </div>
          ) : phaseIndexes[phase] <= phaseIndexes['reordered'] ? (
            <div class="row">
              <div
                style={{
                  width: '37cqw',
                }}
                class="timeline-item ref-keyA"
              >
                Key: A
              </div>
              <div class="row">
                <div
                  style={{
                    width: '19cqw',
                    gridRow: '1',
                    gridColumn: '1',
                  }}
                  class="timeline-item render-item ref-render"
                >
                  Render
                </div>
                <div
                  style={{
                    width: '23cqw',
                    gridRow: phase === 'reordering-2' ? '2' : '1',
                    gridColumn: '2',
                  }}
                  class="timeline-item ref-click"
                >
                  Click
                </div>
                <div
                  style={{
                    width: '18cqw',
                    gridRow: phase === 'reordering-2' ? '2' : '1',
                    gridColumn: '3',
                  }}
                  class="timeline-item ref-keyB"
                >
                  Key: B
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default EventOrdering;
