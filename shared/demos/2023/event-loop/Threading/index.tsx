import { FunctionalComponent, h, Fragment } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import useOnResize from '../utils/use-on-resize';
import { useChangeEffect } from '../utils/use-change-effect';
import usePhases from '../utils/use-phases';
import getStyles from '../utils/get-styles';

interface Props {}

const phases = ['initial', 'single', 'split-into-threads', 'threaded'] as const;
type Phase = typeof phases[number];
const phaseIndexes = Object.fromEntries(phases.map((val, i) => [val, i]));

const Threading: FunctionalComponent<Props> = () => {
  const root = useRef<HTMLDivElement>(null);
  const [phase, lastPhase, setTargetPhase, phaseChangeHandled] =
    usePhases(phases);

  const els = Array.from(
    { length: 4 },
    () => [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)] as const,
  );

  const [mainThread, opA, opB, render] = els;

  useEffect(() => {
    setAPI('threading', {
      setPhase(phase: Phase) {
        setTargetPhase(phase);
      },
    });
  }, []);

  useChangeEffect(() => {
    const animations: Animation[] = [];

    const styles = els.map(([_, elRef]) => {
      if (!elRef.current) return null;
      return getStyles(elRef.current);
    });

    updateStyles();

    if (lastPhase === 'initial' && phase === 'single') {
      for (const [i, [_, el]] of els.entries()) {
        const style = styles[i]!;
        if (!el.current || style.opacity === '1') continue;

        animations.push(
          el.current.animate(
            {
              offset: 0,
              opacity: style.opacity,
              transform: `${style.transform} scale(0.4)`,
            },
            {
              duration: 300,
              delay: 250 * i,
              easing: 'cubic-bezier(0.33, 1, 0.68, 1)', // easeOutCubic
              fill: 'backwards',
            },
          ),
        );
      }
    } else {
      for (const [i, [_, el]] of els.entries()) {
        if (!el.current) continue;
        const style = styles[i]!;

        animations.push(
          el.current.animate(
            { offset: 0, opacity: style.opacity },
            {
              duration: 300,
              easing: 'cubic-bezier(0.33, 1, 0.68, 1)', // easeOutCubic
              fill: 'backwards',
            },
          ),
        );

        animations.push(
          el.current.animate(
            { offset: 0, transform: style.transform },
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

  const updateStyles = () => {
    const styles = els.map(([elRef]) => {
      if (!elRef.current) return null;
      return getStyles(elRef.current);
    });

    const rootRect = root.current!.getBoundingClientRect();

    for (const [i, [_, el]] of els.entries()) {
      if (!el.current) continue;
      const rect = styles[i]!.rect;
      const style = styles[i]!;
      const top = rect.top - rootRect.top;
      const left = rect.left - rootRect.left;
      el.current.style.transform = `translate(${left}px, ${top}px)`;
      el.current.style.width = style.width;
      el.current.style.height = style.height;
      el.current.style.opacity = style.opacity;
    }
  };

  useOnResize(root, () => updateStyles());

  return (
    <div ref={root} class="threading-diagram">
      <div class="inner" style="aspect-ratio: 603 / 222">
        <div class="rows" style={{ visibility: __PRERENDER__ ? '' : 'hidden' }}>
          <div ref={mainThread[0]} class="labelled-thread">
            <div class="labelled-thread-top">
              <span class="labelled-thread-title">Main thread</span>
            </div>
            <div class="row">
              <div
                ref={
                  phaseIndexes[phase] <= phaseIndexes['single']
                    ? opA[0]
                    : undefined
                }
                class="timeline-item"
                style={{
                  width: '40.7cqw',
                  opacity: phase === 'initial' ? '0' : '1',
                }}
              >
                Operation 1
              </div>
              {phaseIndexes[phase] <= phaseIndexes['split-into-threads'] && (
                <div
                  ref={
                    phaseIndexes[phase] <= phaseIndexes['single']
                      ? opB[0]
                      : undefined
                  }
                  class="timeline-item"
                  style={{
                    width: '24.3cqw',
                    opacity: phase === 'initial' ? '0' : '1',
                  }}
                >
                  Operation 2
                </div>
              )}
              <div
                ref={render[0]}
                class="timeline-item render-item"
                style={{
                  width: '26.4cqw',
                  opacity: phase === 'initial' ? '0' : '1',
                }}
              >
                Render result
              </div>
            </div>
          </div>
          {phaseIndexes[phase] >= phaseIndexes['split-into-threads'] && (
            <>
              <div class="other-thread">
                <div class="row">
                  <div
                    ref={opA[0]}
                    class="timeline-item"
                    style={{ width: '40.7cqw' }}
                  >
                    Operation 1
                  </div>
                </div>
              </div>
              <div class="other-thread">
                <div class="row">
                  {phaseIndexes[phase] <=
                    phaseIndexes['split-into-threads'] && (
                    <div class="timeline-item" style={{ width: '40.7cqw' }}>
                      Operation 1
                    </div>
                  )}
                  <div
                    ref={opB[0]}
                    class="timeline-item"
                    style={{ width: '24.3cqw' }}
                  >
                    Operation 2
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        {!__PRERENDER__ && (
          <div class="stage">
            <div ref={mainThread[1]} class="labelled-thread">
              <div class="labelled-thread-top">
                <span class="labelled-thread-title">Main thread</span>
              </div>
            </div>
            <div ref={opA[1]} class="timeline-item">
              Operation 1
            </div>
            <div ref={opB[1]} class="timeline-item">
              Operation 2
            </div>
            <div ref={render[1]} class="timeline-item render-item">
              Render result
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Threading;
