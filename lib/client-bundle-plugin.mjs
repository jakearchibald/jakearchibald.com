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
import { rollup } from 'rollup';

const prefix = 'client-bundle:';
const entryPathPlaceholder = 'CLIENT_BUNDLE_PLUGIN_ENTRY_PATH';
const importsPlaceholder = 'CLIENT_BUNDLE_PLUGIN_IMPORTS';

export function getDependencies(clientOutput, item) {
  const crawlDependencies = new Set([item.fileName]);

  for (const fileName of crawlDependencies) {
    const chunk = clientOutput.find((v) => v.fileName === fileName);

    for (const dep of chunk.imports) {
      crawlDependencies.add(dep);
    }
  }

  // Don't add self as dependency
  crawlDependencies.delete(item.fileName);

  return [...crawlDependencies];
}

export default function (inputOptions, outputOptions, resolveFileUrl) {
  let cache;
  let entryPointPlaceholderMap;
  let exportCounter;
  let clientBundle;
  let clientOutput;

  return {
    name: 'client-bundle',
    buildStart() {
      entryPointPlaceholderMap = new Map();
      exportCounter = 0;
    },
    async resolveId(id, importer) {
      if (!id.startsWith(prefix)) return null;

      const realId = id.slice(prefix.length);
      const resolveResult = await this.resolve(realId, importer, {
        // Tell the node-external plugin not to process this
        // TODO: This seems like the wrong way to handle this.
        // Instead, the inner rollup should pick up external references
        custom: { 'node-external': { skip: true } },
      });

      // Add an additional .js to the end so it ends up with .js at the end in the _virtual folder.
      if (resolveResult) {
        return prefix + resolveResult.id + '.js';
      }
      // This Rollup couldn't resolve it, but maybe the inner one can.
      return id + '.js';
    },
    load(id) {
      if (!id.startsWith(prefix)) return;

      const realId = id.slice(prefix.length, -'.js'.length);

      exportCounter++;

      entryPointPlaceholderMap.set(exportCounter, realId);

      return [
        `export default import.meta.${entryPathPlaceholder + exportCounter};`,
        `export const imports = import.meta.${
          importsPlaceholder + exportCounter
        };`,
      ].join('\n');
    },
    async buildEnd(error) {
      const entryPoints = [...entryPointPlaceholderMap.values()];

      // The static-build is done, so now we can perform our client build.
      if (error || entryPoints.length === 0) return;
      clientBundle = await rollup({
        ...inputOptions,
        cache,
        input: entryPoints,
      });

      cache = clientBundle.cache;
    },
    async renderStart(staticBuildOutputOpts) {
      // The static-build has started generating output, so we can do the same for our client build.
      const copiedOutputOptions = {
        assetFileNames: staticBuildOutputOpts.assetFileNames,
      };
      clientOutput = (
        await clientBundle.generate({
          ...copiedOutputOptions,
          ...outputOptions,
        })
      ).output;
    },
    resolveImportMeta(property, { moduleId, format }) {
      // Pick up the placeholder exports we created earlier, and fill in the correct details.
      let num = undefined;

      if (property.startsWith(entryPathPlaceholder)) {
        num = Number(property.slice(entryPathPlaceholder.length));
      } else if (property.startsWith(importsPlaceholder)) {
        num = Number(property.slice(importsPlaceholder.length));
      } else {
        // This isn't one of our placeholders.
        return;
      }

      const id = entryPointPlaceholderMap.get(num);
      const clientEntry = clientOutput.find(
        (item) => item.facadeModuleId === id,
      );

      if (property.startsWith(entryPathPlaceholder)) {
        return resolveFileUrl({
          fileName: clientEntry.fileName,
          moduleId,
          format,
        });
      }

      const dependencies = getDependencies(clientOutput, clientEntry);

      return (
        '[' +
        dependencies
          .map((item) => {
            const entry = clientOutput.find((v) => v.fileName === item);

            return resolveFileUrl({
              fileName: entry.fileName,
              moduleId,
              format: outputOptions.format,
            });
          })
          .join(',') +
        ']'
      );
    },
    async generateBundle(options, bundle) {
      // Copy everything from the client bundle into the main bundle.
      for (const clientEntry of clientOutput) {
        // Skip if the file already exists
        if (clientEntry.fileName in bundle) continue;

        this.emitFile({
          type: 'asset',
          source: clientEntry.code || clientEntry.source,
          fileName: clientEntry.fileName,
        });
      }
    },
  };
}
