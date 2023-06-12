import { FunctionalComponent, h } from 'preact';

import { escapeStyleScriptContent } from 'shared/utils';
import { src } from 'client-bundle:shared/demos/2022/event-loop/inline-script';

const InlineScript: FunctionalComponent = () => (
  <script
    dangerouslySetInnerHTML={{
      __html: `(() => {${escapeStyleScriptContent(src)}})()`,
    }}
  />
);

export default InlineScript;
