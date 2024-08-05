/**
 * Copyright 2020 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Renderer } from 'marked';
import Prism from 'prismjs';
import escape from 'escape-html';
import 'prismjs/components/prism-json.js';
import 'prismjs/components/prism-typescript.js';
import 'prismjs/components/prism-jsx.js';
import 'prismjs/components/prism-c.js';
import 'prismjs/components/prism-glsl.js';
import 'prismjs/components/prism-bash.js';

export function createRenderer() {
  const renderer = new Renderer();

  renderer.code = (code, infostring, escaped) => {
    // We don’t have syntax highlighting for shell, but we use it in our
    // README.md. This is a workaround so that rendering teh README.md
    // succeeds and we can rip out the first paragraph.
    if (infostring === 'sh') {
      infostring = '';
    }
    if (!infostring || infostring.length <= 0) {
      return `<div class="code-example"><pre>${escape(code)}</pre></div>`;
    }
    if (!(infostring in Prism.languages)) {
      throw Error(`Unsupported language "${infostring}"`);
    }
    return `<div class="code-example"><pre class="language-${infostring}"><code>${Prism.highlight(
      code,
      Prism.languages[infostring],
      infostring,
    )}</code></pre></div>`;
  };

  renderer.heading = function (text, level, raw, slugger) {
    const id = this.options.headerPrefix + slugger.slug(raw);
    return `<h${level} id="${id}"><a href="#${id}">${text}</a></h${level}>\n`;
  };

  return renderer;
}

export function walkTokens(token) {
  if (token.type === 'heading') {
    token.depth += 1;
  }
}
