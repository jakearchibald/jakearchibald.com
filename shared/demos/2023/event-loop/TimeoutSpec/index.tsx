import { FunctionalComponent, h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { useChangeEffect } from '../utils/use-change-effect';
import usePhases from '../utils/use-phases';
import getStyles, { StyleInfo } from '../utils/get-styles';

interface Props {
  apiName: string;
  initialPhase?: Phase;
}

const phases = [
  'initial',
  'naive',
  'pre-parallel',
  'parallel',
  'pre-queued',
  'queued',
] as const;
type Phase = typeof phases[number];
const phaseIndexes = Object.fromEntries(phases.map((val, i) => [val, i]));

const TimeoutSpec: FunctionalComponent<Props> = ({
  apiName,
  initialPhase = phases[0],
}) => {
  const [phase, lastPhase, setTargetPhase, phaseChangeHandled] = usePhases(
    phases,
    initialPhase,
  );

  const els = Array.from({ length: 7 }, () => useRef<HTMLDivElement>(null));
  const [
    introRef,
    waitRef,
    invokeRef,
    parallelRef,
    queueRef,
    invokeOneRef,
    invokeTwoRef,
  ] = els;

  const lastStylesRef = useRef<(StyleInfo | null)[] | null>(null);

  lastStylesRef.current = els.map((elRef) => {
    if (!elRef.current) return null;
    return getStyles(elRef.current);
  });

  useEffect(() => {
    setAPI(apiName, {
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

      if (
        lastStyle.opacity === '0' &&
        currentStyle.opacity === '1' &&
        elRef !== invokeOneRef &&
        elRef !== invokeTwoRef
      ) {
        if (phase === 'naive') {
          animations.push(
            el.animate(
              { offset: 0, opacity: lastStyle.opacity },
              {
                duration: 1000,
                easing: 'cubic-bezier(0.33, 1, 0.68, 1)', // easeOutCubic
                fill: 'backwards',
                delay: 600 * fadedIn,
              },
            ),
          );
        } else {
          animations.push(
            el.animate(
              {
                offset: 0,
                opacity: lastStyle.opacity,
                transform: 'scale(0.4)',
              },
              {
                duration: 300,
                easing: 'cubic-bezier(0.33, 1, 0.68, 1)', // easeOutCubic
                fill: 'backwards',
              },
            ),
          );
        }
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
        (lastStyle.rect.left !== currentStyle.rect.left ||
          lastStyle.rect.top !== currentStyle.rect.top) &&
        elRef !== invokeOneRef &&
        elRef !== invokeTwoRef
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
    <div class="timeout-spec">
      <div class="frame">
        <div class="reserve-space">
          <div class="intro">
            The{' '}
            <dfn>
              <code>
                setTimeout(<var>callback</var>, <var>ms</var>)
              </code>
            </dfn>{' '}
            method, when invoked, must run the following steps:
          </div>
          <div class="step-level">
            <div class="step">
              <span class="num">1.</span>{' '}
              <span class="fake-link">In parallel</span>:
            </div>

            <div class="step-level">
              <div class="step">
                <span class="num">1.</span> Wait <var>ms</var> milliseconds.
              </div>

              <div class="step">
                <span class="num">2.</span>{' '}
                <span class="fake-link">Queue a task</span> to run the following
                steps:
              </div>

              <div class="step-level">
                <div class="step">
                  <span class="num">1.</span>{' '}
                  <span class="fake-link">Invoke</span> <var>callback</var>.
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div
            ref={introRef}
            class="intro"
            style={{
              opacity: phaseIndexes[phase] >= phaseIndexes['naive'] ? '1' : '0',
            }}
          >
            The{' '}
            <dfn>
              <code>
                setTimeout(<var>callback</var>, <var>ms</var>)
              </code>
            </dfn>{' '}
            method, when invoked, must run the following steps:
          </div>
          <div
            class={
              phaseIndexes[phase] >= phaseIndexes['pre-parallel']
                ? 'step-level'
                : ''
            }
          >
            {phaseIndexes[phase] >= phaseIndexes['pre-parallel'] && (
              <div
                ref={parallelRef}
                class="step"
                style={{
                  opacity:
                    phaseIndexes[phase] >= phaseIndexes['parallel'] ? '1' : '0',
                }}
              >
                <span class="num">1.</span>
                <span class="fake-link">In parallel</span>:
              </div>
            )}

            <div class="step-level">
              <div
                ref={waitRef}
                class="step"
                style={{
                  opacity:
                    phaseIndexes[phase] >= phaseIndexes['naive'] ? '1' : '0',
                }}
              >
                <span class="num">1.</span>Wait <var>ms</var> milliseconds.
              </div>

              {phaseIndexes[phase] >= phaseIndexes['pre-queued'] && (
                <div
                  ref={queueRef}
                  class="step"
                  style={{
                    opacity:
                      phaseIndexes[phase] >= phaseIndexes['queued'] ? '1' : '0',
                  }}
                >
                  <span class="num">2.</span>
                  <span class="fake-link">Queue a task</span> to run the
                  following steps:
                </div>
              )}

              <div
                class={
                  phaseIndexes[phase] >= phaseIndexes['pre-queued']
                    ? 'step-level'
                    : ''
                }
              >
                <div
                  ref={invokeRef}
                  class="step"
                  style={{
                    opacity:
                      phaseIndexes[phase] >= phaseIndexes['naive'] ? '1' : '0',
                  }}
                >
                  <span class="num">
                    <span
                      ref={invokeOneRef}
                      style={{
                        opacity:
                          phaseIndexes[phase] >= phaseIndexes['pre-queued']
                            ? '1'
                            : '0',
                      }}
                    >
                      1.
                    </span>
                    <span
                      ref={invokeTwoRef}
                      style={{
                        opacity:
                          phaseIndexes[phase] >= phaseIndexes['pre-queued']
                            ? '0'
                            : '1',
                      }}
                    >
                      2.
                    </span>
                  </span>
                  <span class="fake-link">Invoke</span> <var>callback</var>.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeoutSpec;
