import { useSignal } from '@preact/signals';
import { FunctionalComponent, h } from 'preact';
import { useEffect } from 'preact/hooks';
import CodeLines from '../CodeLines';
import { simpleHighlightLines } from '../utils/simple-highlight';

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
      <div class="code-container">
        <div style={{ fontSize: '7.3cqw' }}>
          <CodeLines lines={code} slice={swap.value ? [1, 2] : [0, 1]} />
          <CodeLines lines={code} slice={swap.value ? [0, 1] : [1, 2]} />
        </div>
      </div>
    </div>
  );
};

export default WorryCode;
