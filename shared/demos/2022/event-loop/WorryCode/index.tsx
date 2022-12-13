import { FunctionalComponent, h } from 'preact';
import CodeLines from '../CodeLines';
import { simpleHighlightLines } from '../utils/simple-highlight';

// prettier-ignore
const code = simpleHighlightLines('js', `
  document.body.append(el);
  el.style.display = 'none';
`);

const WorryCode: FunctionalComponent = () => {
  return (
    <div class="code-example">
      <div class="code-container">
        <div style={{ fontSize: '7.3cqw' }}>
          <CodeLines lines={code} initialSlice={[0, 1]} />
          <CodeLines lines={code} initialSlice={[1, 2]} />
        </div>
      </div>
    </div>
  );
};

export default WorryCode;
