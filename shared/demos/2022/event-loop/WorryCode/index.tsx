import { FunctionalComponent, h } from 'preact';
import HTMLViewBox from '../HTMLViewBox';
import simpleHighlight from '../utils/simple-highlight';

// prettier-ignore
const code = simpleHighlight('js', `
  document.body.append(el);
  el.style.display = 'none';
`);

const WorryCode: FunctionalComponent = () => {
  return (
    <HTMLViewBox width={300} height={200}>
      <div class="code-example">
        <pre dangerouslySetInnerHTML={{ __html: code }}></pre>
      </div>
    </HTMLViewBox>
  );
};

export default WorryCode;
