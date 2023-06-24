import { FunctionalComponent, h, Fragment } from 'preact';
import { useEffect, useLayoutEffect, useRef } from 'preact/hooks';
import useOnResize from '../utils/use-on-resize';
import { useChangeEffect } from '../utils/use-change-effect';
import usePhases from '../utils/use-phases';
import getStyles, { StyleInfo } from '../utils/get-styles';

interface Props {
  apiName: string;
}

const phases = ['initial', 'naive', 'pre-parallel', 'parallel'] as const;
type Phase = typeof phases[number];
const phaseIndexes = Object.fromEntries(phases.map((val, i) => [val, i]));

const TimeoutSpec: FunctionalComponent<Props> = ({ apiName }) => {
  const [phase, lastPhase, setTargetPhase, phaseChangeHandled] =
    usePhases(phases);

  const introRef = useRef<HTMLDivElement>(null);
  const waitRef = useRef<HTMLDivElement>(null);
  const invokeRef = useRef<HTMLDivElement>(null);
  const parallelRef = useRef<HTMLDivElement>(null);
  const els = [introRef, waitRef, invokeRef, parallelRef];
  const lastStylesRef = useRef<(StyleInfo | null)[] | null>(null);

  useEffect(() => {
    setAPI(apiName, {
      setPhase(phase: Phase) {
        setTargetPhase(phase);
      },
    });
  }, []);

  useEffect(() => console.log(waitRef.current));

  useLayoutEffect(() => {
    console.log(waitRef.current);
    const lastStyles = lastStylesRef.current;
    const currentStyles = els.map((elRef) => {
      if (!elRef.current) return null;
      return getStyles(elRef.current);
    });

    lastStylesRef.current = currentStyles;

    // If this is the first render, don't animate
    if (!lastStyles) return;

    const animations: Animation[] = [];
    let fadedIn = 0;

    for (const [i, elRef] of els.entries()) {
      const el = elRef.current;
      const lastStyle = lastStyles[i];

      if (!lastStyle || !el) continue;

      const currentStyle = currentStyles[i]!;

      if (lastStyle.opacity === '0' && currentStyle.opacity === '1') {
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
                <span class="num">1.</span>{' '}
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
                <span class="num">1.</span> Wait <var>ms</var> milliseconds.
              </div>

              {false && (
                <div class="step">
                  <span class="num">2.</span>{' '}
                  <span class="fake-link">Queue a task</span> to run the
                  following steps:
                </div>
              )}

              <div class={false ? 'step-level' : ''}>
                <div
                  ref={invokeRef}
                  class="step"
                  style={{
                    opacity:
                      phaseIndexes[phase] >= phaseIndexes['naive'] ? '1' : '0',
                  }}
                >
                  <span class="num">1.</span>{' '}
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
