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
import { formatVariants } from './code-widths.mjs';
import { transformerIndentWrap } from './shiki-indent-wrap.mjs';
import {
  transformerNotationDiff,
  transformerNotationWordHighlight,
} from '@shikijs/transformers';

// The notation transformers must run before transformerIndentWrap: they inspect
// each line's original flat token structure to find `// [!code ++]` and
// `// [!code word:...]` markers, whereas indent-wrap re-nests every line into
// .indent/.content cells.
//
// Indent wrapping is the safety net under the per-width formatting in
// code-widths.mjs: Prettier reflows what it can, but it never touches the
// contents of a comment and can't break a long identifier or URL, so a line
// can still outrun the tier it was formatted for. Those lines wrap with their
// continuation aligned under the line's content rather than scrolling.
const shikiTransformers = [
  transformerNotationDiff(),
  transformerNotationWordHighlight(),
  transformerIndentWrap(),
];

// Directives that do their job at build time and shouldn't reach the reader.
// Stripped *after* formatting, so Prettier still sees (and honours) them.
const directives = new Set([
  '/* prettier-ignore */',
  '// prettier-ignore',
  '<!-- prettier-ignore -->',
]);

const stripDirectives = (text) =>
  text
    .split('\n')
    .filter((line) => !directives.has(line.trim()))
    .join('\n');

export function createRenderer({ shiki } = {}) {
  const renderer = new Renderer();
  const slugger = new GithubSlugger();

  renderer.code = ({ text, lang, codeVariants }) => {
    text = stripDirectives(text);
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
      const highlight = (code) =>
        shiki.codeToHtml(code, {
          lang,
          theme: shikiTheme,
          transformers: shikiTransformers,
        });

      // Blocks that reflow the same way at every width — the common case — emit
      // a single `<pre>`, exactly as an unformatted block does.
      if (!codeVariants || codeVariants.length === 1) {
        const code = codeVariants
          ? stripDirectives(codeVariants[0].code)
          : text;
        return `<div class="code-example code-example--shiki">${highlight(
          code,
        )}</div>`;
      }

      // Otherwise one `<pre>` per distinct width, all but one hidden by the
      // `@container` rules in components.css. The variants are near-identical
      // text, so they cost very little once compressed.
      const variants = codeVariants
        .map(({ code, tiers }, i) => {
          const classes = [
            'code-variant',
            // Shown when nothing wider fits, i.e. below the narrowest tier.
            ...(i === 0 ? ['code-variant--base'] : []),
            ...tiers.map((tier) => `code-variant--${tier}`),
          ];
          return `<div class="${classes.join(' ')}">${highlight(
            stripDirectives(code),
          )}</div>`;
        })
        .join('');

      return `<div class="code-example code-example--shiki">${variants}</div>`;
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
    if (shiki && token.type === 'code' && token.lang && token.lang !== 'sh') {
      // Lazily load each language into shiki just before it's highlighted, and
      // run Prettier over the block at each print width. The renderer's `code`
      // method is synchronous, so both must be done by the time the render pass
      // runs — marked's async walk guarantees that.
      await ensureLanguage(token.lang);
      token.codeVariants = await formatVariants(token.text, token.lang);
    }
  };
}
