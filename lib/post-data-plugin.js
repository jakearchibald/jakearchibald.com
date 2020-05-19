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
import glob from 'glob';
import { promisify } from 'util';

const globP = promisify(glob);
const postDataId = 'post-data:';

export default function testDataPlugin() {
  return {
    name: 'post-data-plugin',
    resolveId(id) {
      if (id === postDataId) return id;
    },
    async load(id) {
      if (id !== postDataId) return;
      this.addWatchFile('tests');

      const files = await globP('static-build/posts/**/index.md');

      return [
        ...files.map((file, i) => `import * as md${i} from 'md:${file}';`),
        `const posts = [${files
          .map(
            (file, i) =>
              `{ ...md${i}.meta, content: md${i}.html, slug: ${JSON.stringify(
                file.split('/').slice(-2)[0],
              )} }`,
          )
          .join(',\n')}];`,
        'posts.sort((a, b) => a.date < b.date ? 1 : -1);',
        'export default posts;',
      ].join('\n');
    },
  };
}
