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
import { parse as parsePath } from 'path';

import del from 'del';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';

import simpleTS from './lib/simple-ts';
import clientBundlePlugin from './lib/client-bundle-plugin';
import nodeExternalPlugin from './lib/node-external-plugin';
import cssPlugin from './lib/css-plugin';
import assetPlugin from './lib/asset-plugin';
import assetStringPlugin from './lib/asset-string-plugin';
import resolveDirsPlugin from './lib/resolve-dirs-plugin';
import postData from './lib/post-data-plugin';
import runScript from './lib/run-script';
import markdownPlugin from './lib/markdown-plugin';
import rootStaticPlugin from './lib/add-root-static';
import entryURLPlugin from './lib/entry-url-plugin';
import staticEntryURLPlugin from './lib/static-entry-url-plugin';
import assetPrettySizePlugin from './lib/asset-pretty-size-plugin';
import prefixDefaultPlugin from './lib/prefix-default-plugin';

function resolveFileUrl({ fileName }) {
  return JSON.stringify(fileName.replace(/^static\//, '/'));
}

const staticPath = 'static/c/[name]-[hash][extname]';
const jsPath = staticPath.replace('[extname]', '.js');

function jsFileName(chunkInfo) {
  if (!chunkInfo.facadeModuleId) return jsPath;
  const parsedPath = parsePath(chunkInfo.facadeModuleId);
  if (parsedPath.name !== 'index') return jsPath;
  // Come up with a better name than 'index'
  const name = parsedPath.dir.split('/').slice(-1);
  return jsPath.replace('[name]', name);
}

export default async function ({ watch }) {
  const production = !watch;
  await del('.tmp/build');

  const tsPluginInstance = simpleTS('static-build', { watch });
  const commonPlugins = () => [
    prefixDefaultPlugin({
      'entry-url:': '',
    }),
    tsPluginInstance,
    resolveDirsPlugin([
      'static-build',
      'client',
      'tests',
      'shared',
      'client-worker',
    ]),
    assetPlugin(),
    assetPrettySizePlugin(),
    assetStringPlugin(),
    cssPlugin(resolveFileUrl),
    markdownPlugin(),
    resolve(),
    commonjs(),
  ];
  const dir = '.tmp/build';

  return {
    input: 'static-build/index.tsx',
    output: {
      dir,
      format: 'cjs',
      assetFileNames: staticPath,
      exports: 'named',
    },
    // Don't watch the ts files. Instead we watch the output from the ts compiler.
    watch: { clearScreen: false, exclude: ['**/*.ts', '**/*.tsx'] },
    preserveModules: true,
    plugins: [
      { resolveFileUrl },
      clientBundlePlugin(
        {
          plugins: [
            { resolveFileUrl },
            entryURLPlugin(),
            staticEntryURLPlugin(),
            ...commonPlugins(),
            replace({ __PRERENDER__: false }),
            production ? terser({ module: true }) : {},
          ],
        },
        {
          dir,
          format: 'esm',
          chunkFileNames: jsFileName,
          entryFileNames: jsFileName,
        },
        resolveFileUrl,
      ),
      ...commonPlugins(),
      postData(),
      rootStaticPlugin(),
      nodeExternalPlugin(),
      replace({ __PRERENDER__: true }),
      runScript(dir + '/static-build/index.js'),
    ],
  };
}
