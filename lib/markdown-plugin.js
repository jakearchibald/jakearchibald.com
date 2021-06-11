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
import { promises as fs } from 'fs';
import matter from 'gray-matter';
import marked from 'marked';
import { resolve, dirname } from 'path';
import { createRenderer, walkTokens } from './markdown-renderer';

const prefix = 'md:';

export default function markdownPlugin() {
  const renderer = createRenderer();

  return {
    name: 'markdown-plugin',
    async resolveId(id, importer) {
      if (!id.startsWith(prefix)) return;
      const realId = id.slice(prefix.length);
      const resolved = await this.resolve(realId, importer);
      if (!resolved) {
        throw Error(`Cannot find ${realId}`);
      }
      // Add an additional .js to the end so it ends up with .js at the end in the _virtual folder.
      return prefix + resolved.id + '.js';
    },
    async load(id) {
      if (!id.startsWith(prefix)) return;

      const realId = id.slice(prefix.length, -'.js'.length);
      this.addWatchFile(realId);
      const source = await fs.readFile(realId);
      const { content, data } = matter(source);

      const html = marked(content, { renderer, walkTokens });

      // Bit of a hack, but assume 'summary' also needs markdown'd:
      if (data.summary) {
        data.summary = marked(data.summary, { renderer, walkTokens });
      }

      let imports = '';
      let extraOutput = '';

      const getFullAssetPath = (path) =>
        path.startsWith('.') ? resolve(dirname(realId), path) : path;

      // Handle scripts list in front matter
      {
        let scriptData = '';
        if (data.scripts) {
          for (const [i, script] of data.scripts.entries()) {
            imports += `import script${i}, { imports as scriptImports${i} } from 'client-bundle:${getFullAssetPath(
              script.src,
            )}';\n`;

            scriptData += `{ src: script${i}, imports: scriptImports${i}, async: ${JSON.stringify(
              !!script.async,
            )}, preloadOnly: ${!!script.preloadOnly} },\n`;
          }
        }

        extraOutput += `meta.scripts = [${scriptData}];\n`;
      }

      let markdownOutput =
        `export const html = ${JSON.stringify(html)};\n` +
        `export const meta = ${JSON.stringify(data)};\n`;

      // Handle <script type="component">
      {
        let hasComponent = false;
        let i = 0;

        markdownOutput = markdownOutput.replace(
          /<script type=\\"component\\">(.+?)<\/script>/g,
          (_, inside) => {
            i++;

            const unescapedInside = JSON.parse(`"${inside}"`);
            hasComponent = true;
            let data;
            try {
              data = JSON.parse(unescapedInside);
            } catch (err) {
              throw Error(`Cannot parse component script: ${unescapedInside}`);
            }

            const modulePath = getFullAssetPath(data.module);
            const exportName = data.exportName || 'default';
            const containerClass = `post-component-` + i;
            const componentName = `Component` + i;
            const propsJson = JSON.stringify(data.props || {});
            const staticRender = `" + render(h(${componentName}, ${propsJson})) + "`;

            imports += `import { ${exportName} as ${componentName} } from '${modulePath}';\n`;

            if (data.staticOnly) return staticRender;

            imports += `import ${componentName}URL, { imports as ${componentName}Imports } from 'client-bundle:${modulePath}';\n`;
            extraOutput += `meta.scripts.push({ src: ${componentName}URL, imports: ${componentName}Imports, preloadOnly: true });\n`;

            return (
              `<div class=\\"${containerClass}\\">${staticRender}</div>` +
              `<script type=\\"module\\">` +
              `import { h, render } from '" + preactComponentEntryURL + "';` +
              `import Component from '" + ${componentName}URL + "';` +
              `render(h(Component, " + ${JSON.stringify(
                propsJson,
              )} + "), document.querySelector('.${containerClass}'));` +
              `</script>`
            );
          },
        );

        if (hasComponent) {
          imports +=
            `import render from 'preact-render-to-string';\n` +
            `import { h } from 'preact';\n` +
            `import preactComponentEntryURL, { imports as preactComponentEntryImports } from 'client-bundle:preact';\n`;

          extraOutput += `meta.scripts.push({ src: preactComponentEntryURL, imports: preactComponentEntryImports, preloadOnly: true });\n`;
        }
      }

      {
        let i = 0;
        // Handle asset-url and client-bundle patterns
        markdownOutput = markdownOutput.replace(
          /\b(asset-url|client-bundle|asset-pretty-size(?:-br)?):([\w\.\/\-]+)/g,
          (_, prefix, path) => {
            i++;

            let endChar = '';

            // End of a sentence?
            if (path.endsWith('.')) {
              path = path.slice(0, -1);
              endChar = '.';
            }

            const importName = `assetClient${i}`;

            imports += `import ${importName} from '${prefix}:${getFullAssetPath(
              path,
            )}';\n`;
            return `" + ${importName} + "${endChar}`;
          },
        );
      }

      return imports + markdownOutput + extraOutput;
    },
  };
}
