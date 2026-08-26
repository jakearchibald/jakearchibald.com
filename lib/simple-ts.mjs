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
import { spawn } from 'child_process';
import { relative, join, resolve, dirname, isAbsolute } from 'path';
import { promises as fsp, existsSync, statSync } from 'fs';

import { API } from 'typescript/unstable/sync';
import { glob } from 'glob';

const extRe = /\.tsx?$/;

// TypeScript 7's JS API no longer exposes findConfigFile/ts.sys, so walk up for
// the tsconfig ourselves and hand the path to the new config parser.
function findConfigFile(mainPath) {
  let dir = isAbsolute(mainPath) ? mainPath : resolve(mainPath);
  if (!existsSync(dir) || !statSync(dir).isDirectory()) dir = dirname(dir);

  while (true) {
    const candidate = join(dir, 'tsconfig.json');
    if (existsSync(candidate)) return candidate;
    const parent = dirname(dir);
    if (parent === dir) return undefined;
    dir = parent;
  }
}

function loadConfig(mainPath) {
  const fileName = findConfigFile(mainPath);
  if (!fileName) throw Error('tsconfig not found');

  // The API spawns a tsgo child process, so close it once the config is read.
  const api = new API({ cwd: process.cwd() });
  try {
    const { options, fileNames } = api.parseConfigFile(fileName);
    return { options, fileNames };
  } finally {
    api.close();
  }
}

// Replaces ts.resolveModuleName, which TypeScript 7 no longer exposes. Only
// relative/absolute specifiers reach here: bare specifiers for the `paths`
// aliases (shared/*, static-build/*) are rewritten to relative ones by
// resolve-dirs-plugin before this runs, and packages fall through to
// @rollup/plugin-node-resolve.
const resolveExtensions = ['.ts', '.tsx'];

function resolveTSModule(id, importer) {
  if (!id.startsWith('.') && !isAbsolute(id)) return null;

  const base = isAbsolute(id) ? id : resolve(dirname(importer), id);

  for (const ext of resolveExtensions) {
    const candidate = base + ext;
    if (existsSync(candidate)) return candidate;
  }

  // Directory import, e.g. './pages/post' -> './pages/post/index.tsx'
  for (const ext of resolveExtensions) {
    const candidate = join(base, 'index' + ext);
    if (existsSync(candidate)) return candidate;
  }

  return null;
}

export default function simpleTS(mainPath, { noBuild, watch } = {}) {
  const config = loadConfig(mainPath);
  const args = ['-b', mainPath];

  let tsBuildDone;

  async function watchBuiltFiles(rollupContext) {
    const matches = await glob(config.options.outDir + '/**/*.js');
    for (const match of matches) rollupContext.addWatchFile(match);
  }

  async function tsBuild(rollupContext) {
    if (tsBuildDone) {
      // Watch lists are cleared on each build, so we need to rewatch all the JS files.
      await watchBuiltFiles(rollupContext);
      return tsBuildDone;
    }
    if (noBuild) {
      return (tsBuildDone = Promise.resolve());
    }
    tsBuildDone = Promise.resolve().then(async () => {
      await new Promise((resolve) => {
        const proc = spawn('tsc', args, {
          stdio: 'inherit',
        });

        proc.on('exit', (code) => {
          if (code !== 0) {
            throw Error('TypeScript build failed');
          }
          resolve();
        });
      });

      await watchBuiltFiles(rollupContext);

      if (watch) {
        tsBuildDone.then(() => {
          spawn('tsc', [...args, '--watch', '--preserveWatchOutput'], {
            stdio: 'inherit',
          });
        });
      }
    });

    return tsBuildDone;
  }

  return {
    name: 'simple-ts',
    resolveId(id, importer) {
      // If there isn't an importer, it's an entry point, so we don't need to resolve it relative
      // to something.
      if (!importer) return null;

      // Only .d.ts alongside means node_modules or something local like
      // css.d.ts, which resolveTSModule already declines to match.
      return resolveTSModule(id.replace(extRe, ''), importer);
    },
    async load(id) {
      if (!extRe.test(id)) return null;

      // TypeScript building is deferred until the first TS file load.
      // This allows prerequisites to happen first,
      // such as css.d.ts generation in css-plugin.
      await tsBuild(this);

      // Look for the JS equivalent in the tmp folder
      const newId = join(
        config.options.outDir,
        relative(process.cwd(), id),
      ).replace(extRe, '.js');

      return fsp.readFile(newId, { encoding: 'utf8' });
    },
  };
}
