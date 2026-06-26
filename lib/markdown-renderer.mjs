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
import GithubSlugger from 'github-slugger';
import Prism from 'prismjs';
import escape from 'escape-html';
import 'prismjs/components/prism-json.js';
import 'prismjs/components/prism-typescript.js';
import 'prismjs/components/prism-jsx.js';
import 'prismjs/components/prism-c.js';
import 'prismjs/components/prism-glsl.js';
import 'prismjs/components/prism-bash.js';
import { theme as shikiTheme, ensureLanguage } from './shiki-highlighter.mjs';
import { transformerIndentWrap } from './shiki-indent-wrap.mjs';

const shikiTransformers = [transformerIndentWrap()];

export function createRenderer({ shiki } = {}) {
  const renderer = new Renderer();
  const slugger = new GithubSlugger();

  renderer.code = ({ text, lang }) => {
    // We don’t have syntax highlighting for shell, but we use it in our
    // README.md. This is a workaround so that rendering teh README.md
    // succeeds and we can rip out the first paragraph.
    if (lang === 'sh') {
      lang = '';
    }
    if (!lang || lang.length <= 0) {
      return `<div class="code-example"><pre>${escape(text)}</pre></div>`;
    }
    if (shiki) {
      const highlighted = shiki.codeToHtml(text, {
        lang,
        theme: shikiTheme,
        transformers: shikiTransformers,
      });
      return `<div class="code-example code-example--shiki">${highlighted}</div>`;
    }
    if (!(lang in Prism.languages)) {
      throw Error(`Unsupported language "${lang}"`);
    }
    return `<div class="code-example"><pre class="language-${lang}"><code>${Prism.highlight(
      text,
      Prism.languages[lang],
      lang,
    )}</code></pre></div>`;
  };

  renderer.heading = function ({ depth, tokens, text: simpleText }) {
    const text = this.parser.parseInline(tokens);
    const id = slugger.slug(simpleText);
    return `<h${depth} id="${id}"><a href="#${id}">${text}</a></h${depth}>\n`;
  };

  return renderer;
}

export function createWalkTokens({ shiki } = {}) {
  return async function walkTokens(token) {
    if (token.type === 'heading') {
      token.depth += 1;
    }
    // Lazily load each language into shiki just before it's highlighted. The
    // renderer's `code` method is synchronous, so the grammar must be ready by
    // the time the render pass runs — marked's async walk guarantees that.
    if (shiki && token.type === 'code' && token.lang && token.lang !== 'sh') {
      await ensureLanguage(token.lang);
    }
  };
}
