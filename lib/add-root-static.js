import { promises as fs } from 'fs';
import glob from 'glob';
import { promisify } from 'util';

const globP = promisify(glob);

export default function rootStaticPlugin() {
  return {
    name: 'root-static-plugin',
    async buildStart() {
      const paths = await globP('root-static/**/*', { nodir: true });
      await Promise.all(
        paths.map(async (path) => {
          return this.emitFile({
            type: 'asset',
            source: await fs.readFile(path),
            fileName: 'static/' + path.split('/').slice(1).join('/'),
          });
        }),
      );
    },
  };
}
