import { join, resolve, dirname, isAbsolute } from 'path';
import { existsSync } from 'fs';

import { transform } from 'oxc-transform';

const extRe = /\.tsx?$/;

// Only relative/absolute specifiers reach here: bare specifiers for the `paths`
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

// Strips types only. Type-checking is done separately by `tsc -b`.
export default function oxcPlugin() {
  return {
    name: 'oxc',
    resolveId(id, importer) {
      // If there isn't an importer, it's an entry point, so we don't need to resolve it relative
      // to something.
      if (!importer) return null;
      return resolveTSModule(id.replace(extRe, ''), importer);
    },
    async transform(code, id) {
      if (!extRe.test(id)) return null;

      const result = await transform(id, code, {
        sourcemap: true,
        // Matches jsx/jsxFactory in generic-tsconfig.json
        jsx: { runtime: 'classic', pragma: 'h', pragmaFrag: 'Fragment' },
      });

      const errors = result.errors.filter((error) => error.severity === 'Error');
      if (errors.length) {
        this.error(
          errors.map((error) => error.codeframe ?? error.message).join('\n'),
        );
      }

      return { code: result.code, map: result.map };
    },
  };
}
