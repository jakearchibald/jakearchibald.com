import { useSignal } from '@preact/signals';
import { FunctionalComponent, h } from 'preact';
import { useCallback, useLayoutEffect, useRef } from 'preact/hooks';
import { usePrevious } from '../utils/use-previous';

interface Props {
  lines: string[];
  initialSlice: [number, number];
}

const CodeLines: FunctionalComponent<Props> = ({ lines, initialSlice }) => {
  const baseEl = useRef<HTMLDivElement>(null);
  const offsetEl = useRef<HTMLDivElement>(null);
  const range = useSignal(initialSlice);
  const previousRange = usePrevious(range.value);

  // For prerender, don't do any fancy repositioning
  const linesToRender = __PRERENDER__ ? lines.slice(...range.value) : lines;

  const updatePositions = useCallback(
    (animate: boolean = false) => {
      offsetEl.current!.style.transform = '';
      const pres = baseEl.current!.querySelectorAll('pre');
      const start = pres[range.value[0]];
      const elRect = baseEl.current!.getBoundingClientRect();
      const startRect = start.getBoundingClientRect();
      const top = startRect.top - elRect.top;

      const height = (() => {
        if (range.value[0] === range.value[1]) return 0;
        const end = pres[range.value[1] - 1];
        const endRect = end.getBoundingClientRect();
        return endRect.bottom - startRect.top;
      })();

      if (animate) {
        console.log('TODO: animation');
      }

      baseEl.current!.style.height = `${height}px`;
      offsetEl.current!.style.transform = `translateY(${-top}px)`;
    },
    [range.value, baseEl, offsetEl],
  );

  useLayoutEffect(() => {
    updatePositions(previousRange !== undefined);
  }, [updatePositions]);

  useLayoutEffect(() => {
    let first = true;
    const observer = new ResizeObserver(() => {
      // The first resize gives us the current value, so we can skip it
      if (first) {
        first = false;
        return;
      }
      updatePositions();
    });
    observer.observe(baseEl.current!);
    return () => observer.disconnect();
  }, [updatePositions]);

  return (
    <div ref={baseEl} class="code-lines">
      <div ref={offsetEl} class="code-lines-offset">
        {linesToRender.map((line) => (
          <pre dangerouslySetInnerHTML={{ __html: line }} />
        ))}
      </div>
    </div>
  );
};

export default CodeLines;
