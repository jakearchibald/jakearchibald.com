import { FunctionalComponent, h } from 'preact';
import simpleHighlight from '../utils/simple-highlight';

// prettier-ignore
const code = simpleHighlight('js', `
  document.body.append(el);
  el.style.display = 'none';
`);

const WorryCode: FunctionalComponent = () => {
  return (
    <div class="code-example">
      <div class="code-container">
        <div style={{ fontSize: '7.3cqw' }}>
          <pre dangerouslySetInnerHTML={{ __html: code }}></pre>
        </div>
      </div>
    </div>
  );
};

export default WorryCode;
