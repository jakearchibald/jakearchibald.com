import { useSignal } from '@preact/signals';
import { FunctionalComponent, h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import CodeLines from '../CodeLines';
import { simpleHighlightLines } from '../utils/simple-highlight';
import { usePrevious } from '../utils/use-previous';

// prettier-ignore
const code = simpleHighlightLines('js', `
  document.body.append(el);
  el.style.display = 'none';
`);

const WorryCode: FunctionalComponent = () => {
  const swap = useSignal(false);

  useEffect(() => {
    setAPI('worry-code', {
      setSwap: (val: boolean) => {
        swap.value = val;
      },
    });
  }, []);

  return (
    <div class="code-example">
      <div
        class={['code-container', 'worry-code', swap.value && 'worry-code-swap']
          .filter(Boolean)
          .join(' ')}
      >
        <div style={{ fontSize: '7.3cqw' }}>
          <div class="worry-code-line-1">
            <CodeLines lines={code} slice={[0, 1]} />
          </div>
          <div class="worry-code-line-2">
            <CodeLines lines={code} slice={[1, 2]} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorryCode;
