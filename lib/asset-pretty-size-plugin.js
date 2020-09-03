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
import { brotliCompress } from 'zlib';
import { promisify } from 'util';

import prettyBytes from 'pretty-bytes';

const brCompress = promisify(brotliCompress);

const prefix = /^(asset-pretty-size(-br)?:)(.+)/;

export default function assetPrettySizePlugin() {
  return {
    name: 'asset-pretty-size-plugin',
    async resolveId(id, importer) {
      const result = prefix.exec(id);
      if (!result) return;
      const realId = result[3];
      const resolveResult = await this.resolve(realId, importer);

      if (!resolveResult) {
        throw Error(`Cannot find ${realId}`);
      }
      // Add an additional .js to the end so it ends up with .js at the end in the _virtual folder.
      return result[1] + resolveResult.id + '.js';
    },
    async load(id) {
      const result = prefix.exec(id);
      if (!result) return;

      const realId = result[3].slice(0, -'.js'.length);
      this.addWatchFile(realId);

      let size;

      if (result[2]) {
        const data = await fs.readFile(realId);
        const compressed = await brCompress(data);
        size = compressed.length;
      } else {
        const stat = await fs.stat(realId);
        size = stat.size;
      }

      return `export default ${JSON.stringify(prettyBytes(size))}`;
    },
  };
}
