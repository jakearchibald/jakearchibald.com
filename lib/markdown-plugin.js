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
import { createRenderer } from './markdown-renderer';

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

      const html = marked(content, { renderer });

      // Bit of a hack, but assume 'summary' also needs markdown'd:
      if (data.summary) data.summary = marked(data.summary, { renderer });

      let output = [
        `export const html = ${JSON.stringify(html)};`,
        `export const meta = ${JSON.stringify(data)};`,
      ].join('\n');

      const imports = [];

      output = output.replace(
        /("|\\"|'|^)asset-url:(.*?)(\1|$)/g,
        (_, start, path, end) => {
          const importName = `asset${imports.length}`;
          const fullAssetPath = resolve(dirname(realId), path);
          imports.push(
            `import ${importName} from 'asset-url:${fullAssetPath}';`,
          );
          return `${start}" + ${importName} + "${end}`;
        },
      );

      return [...imports, output].join('\n');
    },
  };
}
