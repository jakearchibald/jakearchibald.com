import { promises as fs } from 'fs';
import { basename } from 'path';

export default function (name, prefix, { extraExports } = {}) {
  return function () {
    /** @type {Map<string, Buffer>} */
    let assetIdToSourceBuffer;

    const fullPrefix = prefix + ':';

    return {
      name,
      buildStart() {
        assetIdToSourceBuffer = new Map();
      },
      augmentChunkHash(info) {
        // Get the sources for all assets imported by this chunk.
        const buffers = Object.keys(info.modules)
          .map((moduleId) => assetIdToSourceBuffer.get(moduleId))
          .filter(Boolean);

        if (buffers.length === 0) return;

        for (const moduleId of Object.keys(info.modules)) {
          const buffer = assetIdToSourceBuffer.get(moduleId);
          if (buffer) buffers.push(buffer);
        }

        const combinedBuffer =
          buffers.length === 1 ? buffers[0] : Buffer.concat(buffers);

        return combinedBuffer;
      },
      async resolveId(id, importer) {
        if (!id.startsWith(fullPrefix)) return;
        const realId = id.slice(fullPrefix.length);
        const resolveResult = await this.resolve(realId, importer);

        if (!resolveResult) {
          throw Error(`Cannot find ${realId}`);
        }
        // Add an additional .js to the end so it ends up with .js at the end in the _virtual folder.
        return fullPrefix + resolveResult.id + '.js';
      },
      async load(id) {
        if (!id.startsWith(fullPrefix)) return;
        const realId = id.slice(fullPrefix.length, -'.js'.length);
        const source = await fs.readFile(realId);
        assetIdToSourceBuffer.set(id, source);
        this.addWatchFile(realId);

        return [
          `export default import.meta.ROLLUP_FILE_URL_${this.emitFile({
            type: 'asset',
            source,
            name: basename(realId),
          })};`,
          extraExports ? extraExports(source) : '',
        ].join('\n');
      },
    };
  };
}
